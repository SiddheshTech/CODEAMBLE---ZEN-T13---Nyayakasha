import { Router } from 'express';
import crypto from 'crypto';
import { primaryStore } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';
export const forgeryRouter = Router();
// Helper to calculate SHA-256 hash using Node's crypto module
function calculateSHA256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
// GET all forgery review items in queue
forgeryRouter.get('/queue', async (req, res) => {
    const items = primaryStore.getForgeryQueueItems();
    const allUsers = await primaryStore.getAllUsers();
    const fieldUser = allUsers.find(u => u.role === 'field_submitter' && u.profilePhotoUrl) ||
        allUsers.find(u => u.profilePhotoUrl);
    const enriched = items.map(item => {
        const submitterLower = (item.submitter || '').toLowerCase();
        const matchingUser = allUsers.find(u => {
            if (!u.fullName || !u.profilePhotoUrl)
                return false;
            const fnLower = u.fullName.toLowerCase();
            return fnLower.includes('siddhesh') || submitterLower.includes(fnLower) || fnLower.includes(submitterLower);
        }) || allUsers.find(u => u.role === 'field_submitter' && u.profilePhotoUrl) || allUsers.find(u => u.profilePhotoUrl);
        return {
            ...item,
            submitterPhotoUrl: matchingUser?.profilePhotoUrl || item.submitterPhotoUrl,
            signature: item.signature || matchingUser?.digitalSignatureUrl || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="70" viewBox="0 0 320 70"><path d="M 20 40 Q 60 10 90 35 T 160 25 T 220 45 T 280 20" stroke="%231e293b" stroke-width="2.5" fill="none"/><text x="20" y="60" font-family="sans-serif" font-size="9" fill="%230284c7" font-weight="bold">SEALED BY OFFICER SIDDHESH HARWANDE • TPM SECURE KEY 0xSIG_FS_8820</text></svg>`
        };
    });
    return res.json({ success: true, reviews: enriched });
});
// POST decide on forgery review item (Accepted / Rejected / Escalated)
forgeryRouter.post('/decide', (req, res) => {
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
forgeryRouter.post('/directive', (req, res) => {
    const { reviewId, type, details } = req.body;
    if (!reviewId || !type || !details) {
        return res.status(400).json({ error: 'Review ID, directive type, and details are required' });
    }
    const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const hashInput = `${reviewId}-${type}-${details}-${timestamp}`;
    const sealHash = '0xSEAL_DIR_' + calculateSHA256(hashInput).substring(0, 12).toUpperCase();
    const newDirective = {
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
