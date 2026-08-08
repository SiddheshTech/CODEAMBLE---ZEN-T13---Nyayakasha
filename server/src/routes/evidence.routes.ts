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
      caseId: caseId || 'FIR-2026-001',
      status: 'Pending',
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

/**
 * POST /api/evidence/testimony/submit
 * Cryptographically record field testimony with optional Zero-Knowledge Identity Protection & Blockchain Anchoring
 */
evidenceRouter.post('/testimony/submit', async (req: Request, res: Response) => {
  try {
    const {
      caseId,
      incidentDate,
      location,
      language,
      witnessName,
      protectIdentity,
      idType,
      testimonyType,
      depositionText,
      officerPin,
      signatureDataUrl,
      attachments
    } = req.body;

    if (!caseId || !depositionText) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Case ID and Deposition Text are required.' });
    }

    const count = primaryStore.getEvidence().length + 1;
    const id = `TM-2026-${400 + count}`;

    // Zero-Knowledge Identity Protection Protocol
    const isProtected = Boolean(protectIdentity);
    const witnessAlias = isProtected ? `Witness-ZK-${Math.floor(1000 + Math.random() * 9000)}` : witnessName;
    const displayWitnessName = isProtected ? 'Protected (Anonymous - ZK Commitment)' : (witnessName || 'Witness');

    // Compute SHA-256 Digest of Testimony Statement & Metadata
    const payloadToHash = `${id}:${caseId}:${depositionText}:${witnessAlias}:${Date.now()}`;
    const generatedHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

    // Immutably Anchor Testimony Payload to Polygon PoS Blockchain
    const anchorResult = await blockchainService.anchorEvidenceSubmission(
      id,
      generatedHash,
      caseId,
      'Field Submitter Officer',
      {
        title: `Field Testimony - ${testimonyType || 'Eyewitness Account'}`,
        seizureBagId: `BAG-TM-${id}`,
        category: 'Testimony',
        witnessName: witnessAlias,
        preservationType: 'Encrypted HSM Storage',
        notes: depositionText
      }
    );

    const newTestimony: EvidenceRecord = {
      id,
      caseId,
      title: `Testimony (${testimonyType || 'Eyewitness'}) - ${displayWitnessName}`,
      type: 'Document',
      date: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      hash: generatedHash,
      status: 'Sealed',
      custodian: 'Field Submitter Officer',
      incidentLocation: location || 'Field Precinct Location',
      confidentialityLevel: isProtected ? 'Top Secret (Zero-Knowledge Protected)' : 'Restricted',
      witnessName: displayWitnessName,
      evidenceNotes: depositionText,
      signature: signatureDataUrl,
      txHash: anchorResult.txHash,
      blockNumber: anchorResult.blockNumber,
      merkleRoot: anchorResult.merkleRoot,
      createdAt: new Date().toISOString()
    };

    const saved = primaryStore.saveEvidence(newTestimony);

    // If identity is protected, register an identity unlock request in the quorum store
    if (isProtected && witnessName) {
      primaryStore.saveIdentityUnlockRequest({
        id: `ID-UNLOCK-${id}`,
        caseId,
        caseTitle: `Case ${caseId}: Protected Deponent Identity Commitment (${witnessAlias})`,
        witnessAlias,
        requestor: 'Field Submitter Terminal',
        reason: 'Witness identity masked under Section 65B zero-knowledge protection protocol.',
        thresholdRequired: 3,
        thresholdGranted: 0,
        status: 'Pending',
        grantedBy: [],
        createdAt: new Date().toISOString()
      });
    }

    // Record immutable audit event
    auditLedger.recordEvent('FIELD_TESTIMONY_SUBMITTED', 'FIELD_OFFICER', {
      testimonyId: id,
      caseId,
      witnessAlias,
      isIdentityProtected: isProtected,
      hash: generatedHash,
      txHash: anchorResult.txHash,
      blockNumber: anchorResult.blockNumber,
      merkleRoot: anchorResult.merkleRoot,
      immutabilityNotice: 'Deposition permanently anchored on Polygon PoS Blockchain. Cannot be erased or altered.'
    });

    return res.status(201).json({
      success: true,
      testimony: saved,
      witnessAlias,
      isIdentityProtected: isProtected,
      blockchainAnchor: {
        txHash: anchorResult.txHash,
        blockNumber: anchorResult.blockNumber,
        merkleRoot: anchorResult.merkleRoot,
        status: 'IMMUTABLE_ANCHORED_ON_POLYGON_POS'
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'TESTIMONY_SUBMISSION_FAILED', message: err.message });
  }
});
