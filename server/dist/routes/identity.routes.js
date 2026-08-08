import { Router } from 'express';
import crypto from 'crypto';
import { primaryStore } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';
export const identityRouter = Router();
// Helper to calculate SHA-256 hash using Node's crypto module
function calculateSHA256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
// GET all identity unlock requests
identityRouter.get('/unlock-requests', (req, res) => {
    const requests = primaryStore.getIdentityUnlocks();
    return res.json({ success: true, requests });
});
// GET all permanent identity disclosure logs
identityRouter.get('/logs', (req, res) => {
    const logs = primaryStore.getIdentityUnlockLogs();
    return res.json({ success: true, logs });
});
// POST decide on identity unlock request (Approved / Rejected)
identityRouter.post('/decide', (req, res) => {
    const { requestId, decision, remarks } = req.body;
    if (!requestId || !decision) {
        return res.status(400).json({ error: 'Request ID and decision (Approved / Rejected) are required' });
    }
    // Generate digital signature hash using crypto
    const timestamp = new Date().toISOString();
    const hashInput = `${requestId}-${decision}-${remarks || ''}-${timestamp}`;
    const sigHash = '0xSIG_JUDGE_' + (decision === 'Approved' ? 'APP' : 'REJ') + '_' + calculateSHA256(hashInput).substring(0, 12).toUpperCase();
    const updated = primaryStore.decideIdentityUnlockRequest(requestId, decision, remarks || '', sigHash);
    if (!updated) {
        return res.status(404).json({ error: 'Identity unlock request not found' });
    }
    // Record audit log event
    auditLedger.appendEvent({
        eventType: 'IDENTITY_DISCLOSURE_DECISION',
        userId: 'Adv. A. Mehta',
        userRole: 'court_authority',
        category: 'System Safeguard',
        actionName: `Disclosure Verdict: ${decision} on Witness ${updated.witnessAlias}`,
        targetScope: updated.courtBench,
        outcome: decision,
        details: { requestId, witnessAlias: updated.witnessAlias, decision, signatureHash: sigHash }
    });
    return res.json({ success: true, request: updated, logs: primaryStore.getIdentityUnlockLogs() });
});
// POST add new directive to an identity unlock request
identityRouter.post('/directive', (req, res) => {
    const { requestId, type, note } = req.body;
    if (!requestId || !type || !note) {
        return res.status(400).json({ error: 'Request ID, directive type, and note are required' });
    }
    const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const hashInput = `${requestId}-${type}-${note}-${timestamp}`;
    const hash = '0xDIR_HASH_' + calculateSHA256(hashInput).substring(0, 10).toUpperCase();
    const newDirective = {
        id: `DIR-UNK-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-3)}`,
        judgeName: 'Hon. Presiding Magistrate (Bench 3)',
        date: timestamp,
        type,
        note,
        hash
    };
    const updated = primaryStore.addDirectiveToIdentityUnlockRequest(requestId, newDirective);
    if (!updated) {
        return res.status(404).json({ error: 'Identity unlock request not found' });
    }
    // Record audit log event
    auditLedger.appendEvent({
        eventType: 'IDENTITY_DIRECTIVE_APPENDED',
        userId: 'Adv. A. Mehta',
        userRole: 'court_authority',
        category: 'System Safeguard',
        actionName: `Appended Directive: ${type} on Witness ${updated.witnessAlias}`,
        targetScope: updated.courtBench,
        outcome: 'Approved',
        details: { requestId, directiveId: newDirective.id, hash }
    });
    return res.json({ success: true, directive: newDirective, request: updated });
});
