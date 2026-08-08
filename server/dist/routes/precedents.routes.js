import { Router } from 'express';
import { primaryStore } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';
export const precedentsRouter = Router();
// GET all precedent flags
precedentsRouter.get('/flags', (req, res) => {
    const flags = primaryStore.getPrecedentFlags();
    return res.json({ success: true, flags });
});
// POST resolve precedent flag
precedentsRouter.post('/resolve', (req, res) => {
    const { flagId, resolvedBy } = req.body;
    if (!flagId) {
        return res.status(400).json({ error: 'Flag ID is required' });
    }
    const updated = primaryStore.resolvePrecedentFlag(flagId, resolvedBy || 'Judicial Bench Authority');
    if (!updated) {
        return res.status(404).json({ error: 'Precedent flag not found' });
    }
    auditLedger.recordEvent('PRECEDENT_CONFLICT_RESOLVED', resolvedBy || 'COURT_AUTHORITY', {
        flagId,
        citation: updated.precedentCitation,
        caseId: updated.caseId
    });
    return res.json({ success: true, flag: updated });
});
