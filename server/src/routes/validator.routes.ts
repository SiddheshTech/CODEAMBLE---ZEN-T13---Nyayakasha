import { Router, Response } from 'express';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/roleGuard.js';
import { primaryStore } from '../db/store.js';
import { validatorService } from '../services/validator.service.js';

export const validatorRouter = Router();

/**
 * GET /api/validator/dashboard
 * Selects counts and categories ONLY — Zero-Knowledge isolation constraint enforced (no case content column reachable)
 * Caching: In-memory Node cache, 30s TTL
 */
validatorRouter.get('/dashboard', requireAuth, requireRole('independent_validator', 'court_authority'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await primaryStore.getUserById(req.userId!);
    const userData = {
      id: req.userId!,
      fullName: user ? user.fullName : 'Adv. A. Mehta',
      role: req.userRole || 'independent_validator'
    };

    const dashboard = await validatorService.getDashboardData(userData);

    res.setHeader('Cache-Control', 'private, max-age=30');
    return res.json(dashboard);
  } catch (error: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});

/**
 * POST /api/validator/vote
 * Cast multi-sig consensus vote on block payload
 */
validatorRouter.post('/vote', requireAuth, requireRole('independent_validator', 'court_authority'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { blockId, decision, pin } = req.body;
    if (!blockId || !decision) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'blockId and decision are required.' });
    }

    if (decision !== 'Approve' && decision !== 'Reject') {
      return res.status(400).json({ error: 'INVALID_DECISION', message: 'Decision must be "Approve" or "Reject".' });
    }

    const user = await primaryStore.getUserById(req.userId!);
    const userName = user ? user.fullName : 'Adv. A. Mehta';

    const result = await validatorService.castVote(req.userId!, userName, blockId, decision, pin);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ error: 'VOTE_FAILED', message: error.message });
  }
});

/**
 * POST /api/validator/duress/acknowledge
 * Acknowledge & Escalate Silent Duress Alert
 */
validatorRouter.post('/duress/acknowledge', requireAuth, requireRole('independent_validator', 'court_authority'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { alertId } = req.body;
    const user = await primaryStore.getUserById(req.userId!);
    const userName = user ? user.fullName : 'Adv. A. Mehta';

    const result = await validatorService.acknowledgeDuress(req.userId!, userName, alertId);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ error: 'ACKNOWLEDGE_FAILED', message: error.message });
  }
});

/**
 * GET /api/validator/activity-log
 * Fetch full validator audit log
 */
validatorRouter.get('/activity-log', requireAuth, requireRole('independent_validator', 'court_authority'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = primaryStore.getValidatorActivityLogs();
    return res.json({ logs });
  } catch (error: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});
