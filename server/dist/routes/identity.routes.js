import { Router } from 'express';
import { primaryStore } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';
export const identityRouter = Router();
// GET all identity unlock requests
identityRouter.get('/unlock-requests', (req, res) => {
    const requests = primaryStore.getIdentityUnlocks();
    return res.json({ success: true, requests });
});
// POST approve identity unlock threshold share
identityRouter.post('/approve-unlock', (req, res) => {
    const { unlockId, grantedBy } = req.body;
    if (!unlockId) {
        return res.status(400).json({ error: 'Unlock ID is required' });
    }
    const updated = primaryStore.approveIdentityUnlock(unlockId, grantedBy || 'Judge Bench Member');
    if (!updated) {
        return res.status(404).json({ error: 'Identity unlock request not found' });
    }
    auditLedger.recordEvent('IDENTITY_THRESHOLD_KEY_GRANTED', grantedBy || 'JUDGE', {
        unlockId,
        witnessAlias: updated.witnessAlias,
        grantedCount: updated.thresholdGranted,
        requiredCount: updated.thresholdRequired,
        status: updated.status
    });
    return res.json({ success: true, request: updated });
});
