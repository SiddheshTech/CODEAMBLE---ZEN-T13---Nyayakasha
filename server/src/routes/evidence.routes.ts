import { Router, Request, Response } from 'express';
import { primaryStore, EvidenceRecord } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';
import crypto from 'crypto';

export const evidenceRouter = Router();

// GET all evidence (optional ?caseId=...)
evidenceRouter.get('/', (req: Request, res: Response) => {
  const caseId = req.query.caseId as string | undefined;
  const list = primaryStore.getEvidence(caseId);
  return res.json({ success: true, evidence: list });
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

// POST submit new exhibit
evidenceRouter.post('/submit', (req: Request, res: Response) => {
  const { caseId, title, type, hash, custodian, incidentLocation, confidentialityLevel, customMetadata, latitude, longitude, signature, dataUrl } = req.body;

  if (!title || !caseId) {
    return res.status(400).json({ error: 'Exhibit title and Case ID are required' });
  }

  const count = primaryStore.getEvidence().length + 1;
  const id = `EV-${8820 + count}`;

  const generatedHash = hash || crypto.createHash('sha256').update(dataUrl || title + Date.now().toString()).digest('hex');

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
    createdAt: new Date().toISOString()
  };

  const saved = primaryStore.saveEvidence(newExhibit);

  // Append block to cryptographic audit ledger
  auditLedger.recordEvent('EVIDENCE_EXHIBIT_SEALED', custodian || 'FIELD_OFFICER', {
    exhibitId: id,
    caseId,
    hash: generatedHash,
    title,
    geoCoords: { lat: newExhibit.latitude, lng: newExhibit.longitude }
  });

  return res.status(201).json({ success: true, evidence: saved });
});
