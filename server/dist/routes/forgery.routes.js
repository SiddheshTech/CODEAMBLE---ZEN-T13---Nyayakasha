import { Router } from 'express';
import { primaryStore } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';
export const forgeryRouter = Router();
// GET all forgery review items
forgeryRouter.get('/queue', (req, res) => {
    const reviews = primaryStore.getForgeryReviews();
    return res.json({ success: true, reviews });
});
// POST decide on forgery review item
forgeryRouter.post('/decide', (req, res) => {
    const { reviewId, decision, notes } = req.body;
    if (!reviewId || !decision) {
        return res.status(400).json({ error: 'Review ID and decision (Quarantined/Cleared/Escalated to Bench) are required' });
    }
    const updated = primaryStore.decideForgery(reviewId, decision, notes);
    if (!updated) {
        return res.status(404).json({ error: 'Forgery review item not found' });
    }
    auditLedger.recordEvent('FORGERY_VERDICT_SUBMITTED', 'INDEPENDENT_VALIDATOR', {
        reviewId,
        exhibitId: updated.exhibitId,
        verdict: decision,
        notes
    });
    return res.json({ success: true, review: updated });
});
