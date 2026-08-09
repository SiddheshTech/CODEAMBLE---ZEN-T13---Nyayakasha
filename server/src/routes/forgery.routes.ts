import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { primaryStore, ForgeryQueueItem, BenchDirective } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';

export const forgeryRouter = Router();

// Helper to calculate SHA-256 hash using Node's crypto module
function calculateSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// GET all forgery review items in queue
forgeryRouter.get('/queue', (req: Request, res: Response) => {
  const items = primaryStore.getForgeryQueueItems();
  return res.json({ success: true, reviews: items });
});

// POST decide on forgery review item (Accepted / Rejected / Escalated)
forgeryRouter.post('/decide', (req: Request, res: Response) => {
  const { reviewId, decision, notes } = req.body;

  if (!reviewId || !decision) {
    return res.status(400).json({ error: 'Review ID and decision (Accepted & Admitted / Rejected & Excluded / Escalated to CFSL) are required' });
  }

  // Generate digital signature hash using crypto
  const timestamp = new Date().toISOString();
  const hashInput = `${reviewId}-${decision}-${notes || ''}-${timestamp}`;
  const digitalSignatureHash = '0xSIG_BENCH_' + calculateSHA256(hashInput).substring(0, 16).toUpperCase();

  const updated = primaryStore.decideRichForgery(reviewId, decision, notes || '', digitalSignatureHash);

  if (!updated) {
    return res.status(404).json({ error: 'Forgery review item not found' });
  }

  // Update corresponding EvidenceRecord in store
  const ev = primaryStore.getEvidenceById(updated.exhibitId);
  if (ev) {
    ev.status = decision === 'Accepted & Admitted' ? 'Admitted to Trial Record' : decision === 'Rejected & Excluded' ? 'Quarantined / Struck' : 'Under CFSL Review';
    primaryStore.saveEvidence(ev);
  }

  // Update RichCaseRecord exhibit status in store
  if (updated.caseId) {
    const rc = primaryStore.getRichCaseById(updated.caseId);
    if (rc && rc.evidenceTimeline) {
      const ex = rc.evidenceTimeline.find(e => e.id === updated.exhibitId || e.title === updated.title);
      if (ex) {
        ex.integrityStatus = decision === 'Accepted & Admitted' ? 'Pass' : 'Flagged';
        ex.details = `Judicial Order: ${decision}. Signature: ${digitalSignatureHash}. ${notes || ''}`;
        primaryStore.saveRichCase(rc);
      }
    }
  }

  // Save real-time notification for Field Submitter
  primaryStore.saveNotification({
    id: `notif-jdec-${Date.now()}`,
    type: 'forgery',
    title: `Judicial Ruling Issued: ${updated.exhibitId}`,
    message: `Presiding Judge issued ruling: [${decision.toUpperCase()}] for Exhibit ${updated.title}.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isoDate: new Date().toISOString(),
    isRead: false,
    priority: decision === 'Accepted & Admitted' ? 'high' : 'critical',
    caseId: updated.caseId,
    sender: 'High Court Bench 3',
    details: `Digital Signature Hash: ${digitalSignatureHash}. ${notes || ''}`,
    roleScope: 'field_submitter',
    createdAt: new Date().toISOString()
  });

  // Update corresponding standard review item if it exists
  const standardReview = primaryStore.getForgeryReviews().find(r => r.id === updated.id || r.exhibitId === updated.exhibitId);
  if (standardReview) {
    const stdDecision = decision === 'Accepted & Admitted'
      ? 'Cleared'
      : decision === 'Rejected & Excluded'
      ? 'Quarantined'
      : 'Escalated to Bench';
    primaryStore.decideForgery(standardReview.id, stdDecision, notes);
  }

  // Record audit log event
  auditLedger.appendEvent({
    eventType: 'FORGERY_VERDICT_SUBMITTED',
    userId: 'Adv. A. Mehta',
    userRole: 'court_authority',
    category: 'System Safeguard',
    actionName: `Issued Ruling: ${decision} on Exhibit ${updated.exhibitId}`,
    targetScope: updated.courtBench,
    outcome: decision.startsWith('Accepted') ? 'Approved' : 'Rejected',
    details: { reviewId, exhibitId: updated.exhibitId, decision, signatureHash: digitalSignatureHash }
  });

  return res.json({ success: true, review: updated });
});

// POST add new bench directive to a forgery review item
forgeryRouter.post('/directive', (req: Request, res: Response) => {
  const { reviewId, type, details } = req.body;

  if (!reviewId || !type || !details) {
    return res.status(400).json({ error: 'Review ID, directive type, and details are required' });
  }

  const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const hashInput = `${reviewId}-${type}-${details}-${timestamp}`;
  const sealHash = '0xSEAL_DIR_' + calculateSHA256(hashInput).substring(0, 12).toUpperCase();

  const newDirective: BenchDirective = {
    id: `DIR-FRG-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-3)}`,
    date: timestamp,
    issuedBy: 'Hon. Presiding Magistrate (Bench 3)',
    type,
    details,
    status: 'Active',
    sealHash
  };

  const updated = primaryStore.addDirectiveToForgeryQueueItem(reviewId, newDirective);

  if (!updated) {
    return res.status(404).json({ error: 'Forgery review item not found' });
  }

  // Record audit log event
  auditLedger.appendEvent({
    eventType: 'JUDICIAL_DIRECTIVE_ISSUED',
    userId: 'Adv. A. Mehta',
    userRole: 'court_authority',
    category: 'System Safeguard',
    actionName: `Issued Directive: ${type} on Case ${updated.caseId}`,
    targetScope: updated.courtBench,
    outcome: 'Approved',
    details: { reviewId, directiveId: newDirective.id, sealHash }
  });

  return res.json({ success: true, directive: newDirective, review: updated });
});
