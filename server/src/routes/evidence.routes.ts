import { Router, Request, Response } from 'express';
import { primaryStore, EvidenceRecord } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';
import { blockchainService } from '../services/blockchain.service.js';
import crypto from 'crypto';

export const evidenceRouter = Router();

// GET all evidence (optional ?caseId=...)
evidenceRouter.get('/', (req: Request, res: Response) => {
  const caseId = req.query.caseId as string | undefined;
  const isDuress = req.headers['x-duress-session'] === 'true' || req.query.duress === 'true';
  const list = primaryStore.getEvidence(caseId, isDuress);
  return res.json({ success: true, evidence: list, isDuressSession: isDuress });
});

// GET evidence by ID
evidenceRouter.get('/:id', (req: Request, res: Response) => {
  const item = primaryStore.getEvidenceById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Evidence exhibit not found' });
  }
  return res.json({ success: true, evidence: item });
});

// GET cryptographic chain of custody audit log for exhibit
evidenceRouter.get('/:id/chain', (req: Request, res: Response) => {
  const item = primaryStore.getEvidenceById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Evidence exhibit not found' });
  }

  // Generate audit chain from audit ledger
  const allEvents = auditLedger.getEvents();
  const exhibitEvents = allEvents.filter(e => e.details?.exhibitId === item.id || e.details?.caseId === item.caseId);

  return res.json({
    success: true,
    exhibit: item,
    chainOfCustody: exhibitEvents,
    genesisHash: item.hash,
    ledgerIntegrity: auditLedger.verifyIntegrity()
  });
});

evidenceRouter.post('/submit', async (req: Request, res: Response) => {
  try {
    const {
      caseId,
      title,
      type,
      hash,
      custodian,
      incidentLocation,
      confidentialityLevel,
      customMetadata,
      latitude,
      longitude,
      signature,
      dataUrl,
      seizureBagId,
      seizureMethod,
      priorityLevel,
      witnessName,
      preservationType,
      tags,
      evidenceNotes,
      gpsLocation
    } = req.body;

    if (!title || !caseId) {
      return res.status(400).json({ error: 'Exhibit title and Case ID are required' });
    }

    const count = primaryStore.getEvidence().length + 1;
    const id = `EV-${8820 + count}`;

    const generatedHash = hash || crypto.createHash('sha256').update(dataUrl || title + Date.now().toString()).digest('hex');

    // Anchor full field terminal details & SHA-256 payload immutably on Polygon PoS Blockchain
    const anchorResult = await blockchainService.anchorEvidenceSubmission(
      id,
      generatedHash,
      caseId,
      custodian || 'Field Submitter',
      {
        title,
        seizureBagId,
        category: type,
        seizureMethod,
        priorityLevel,
        witnessName,
        preservationType,
        tags,
        notes: evidenceNotes,
        gpsLocation,
        signature
      }
    );

    const newExhibit: EvidenceRecord = {
      id,
      caseId,
      title,
      type: type || 'Digital Asset',
      date: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      hash: generatedHash,
      status: 'Sealed',
      custodian: custodian || 'Field Submitter',
      incidentLocation: incidentLocation || 'Field Location',
      confidentialityLevel: confidentialityLevel || 'Restricted',
      customMetadata: customMetadata || '',
      latitude: latitude || 19.0760,
      longitude: longitude || 72.8777,
      signature,
      seizureBagId,
      seizureMethod,
      priorityLevel,
      witnessName,
      preservationType,
      tags,
      evidenceNotes,
      txHash: anchorResult.txHash,
      blockNumber: anchorResult.blockNumber,
      merkleRoot: anchorResult.merkleRoot,
      createdAt: new Date().toISOString()
    };

    const saved = primaryStore.saveEvidence(newExhibit);

    // Dynamically push a new multi-sig consensus request block for Independent Validator node attestation
    const blockId = `BLOCK-${Math.floor(89200 + Math.random() * 800)}`;
    primaryStore.saveConsensusRequest({
      id: blockId,
      queue: `${newExhibit.type} Hash Consensus`,
      waitTimeHours: 0.05,
      waitTimeFormatted: '3 mins',
      slaLimitFormatted: '12.0h SLA Limit',
      urgency: 'NORMAL',
      urgencyColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      badgeColor: 'bg-emerald-500',
      quorumSigned: 0,
      quorumTotal: 3,
      merkleRoot: anchorResult.merkleRoot,
      zkProofType: 'ZK-SNARK-secp256k1',
      entropyScore: '0.999',
      cryptographicDetails: `Cryptographic state payload for Exhibit #${id} (${title}). Zero case content embedded for neutral validation.`,
      createdAt: new Date().toISOString(),
      signedBy: {}
    });

    // Dynamically push an encrypted analytics report
    primaryStore.addAnalyticsReport({
      id: `REP-${Math.floor(400 + Math.random() * 99)}`,
      title: `${title} Telemetry Audit`,
      privacyType: 'Differential Privacy (ε=0.5)',
      status: 'SEALED',
      createdAt: new Date().toISOString()
    });

    // Append block to cryptographic audit ledger
    auditLedger.recordEvent('EVIDENCE_EXHIBIT_SEALED', custodian || 'FIELD_OFFICER', {
      exhibitId: id,
      caseId,
      hash: generatedHash,
      title,
      txHash: anchorResult.txHash,
      blockNumber: anchorResult.blockNumber,
      merkleRoot: anchorResult.merkleRoot,
      immutabilityNotice: 'Permanent Immutable Blockchain Anchor on Polygon PoS. Cannot be edited, deleted, or erased.',
      geoCoords: { lat: newExhibit.latitude, lng: newExhibit.longitude }
    });

    return res.status(201).json({
      success: true,
      evidence: saved,
      blockId,
      blockchainAnchor: {
        txHash: anchorResult.txHash,
        blockNumber: anchorResult.blockNumber,
        merkleRoot: anchorResult.merkleRoot,
        status: 'IMMUTABLE_ANCHORED_ON_POLYGON_POS'
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'EVIDENCE_SUBMISSION_FAILED', message: err.message });
  }
});
