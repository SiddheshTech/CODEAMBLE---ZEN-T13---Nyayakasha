import { Router, Response } from 'express';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/roleGuard.js';
import { sessionStore } from '../db/redis.js';
import { auditLedger } from '../db/auditLedger.js';
import { primaryStore } from '../db/store.js';

export const securityRouter = Router();

/**
 * GET /api/security/sessions
 */
securityRouter.get('/sessions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const activeSessions = await sessionStore.getUserSessions(req.userId!);
    return res.json({
      userId: req.userId,
      currentSessionId: req.session!.sessionId,
      roleTTLSeconds: sessionStore.getRoleTTL(req.userRole!),
      activeSessions
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});

/**
 * POST /api/security/sessions/revoke
 */
securityRouter.post('/sessions/revoke', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetSessionId, revokeAllOther } = req.body;

    if (revokeAllOther) {
      const revokedCount = await sessionStore.revokeAllUserSessions(req.userId!, req.session!.sessionId);
      auditLedger.appendEvent({
        eventType: 'REMOTE_SESSIONS_REVOKED_ALL',
        userId: req.userId!,
        userRole: req.userRole!,
        details: { revokedCount }
      });
      return res.json({ message: `Revoked ${revokedCount} remote sessions.` });
    }

    if (!targetSessionId) {
      return res.status(400).json({ error: 'MISSING_SESSION_ID', message: 'targetSessionId parameter is required.' });
    }

    await sessionStore.deleteSession(targetSessionId);
    auditLedger.appendEvent({
      eventType: 'REMOTE_SESSION_REVOKED',
      userId: req.userId!,
      userRole: req.userRole!,
      details: { targetSessionId }
    });

    return res.json({ message: `Session ${targetSessionId} revoked successfully.` });
  } catch (error: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});

/**
 * GET /api/security/audit-log
 */
securityRouter.get('/audit-log', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chain = auditLedger.getChain();
    const integrity = auditLedger.verifyIntegrity();
    return res.json({
      totalEntries: chain.length,
      integrity,
      auditChain: chain
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});

/**
 * GET /api/security/validator/duress-alerts
 * RESTRICTED: Independent Validator ONLY
 */
securityRouter.get('/validator/duress-alerts', requireAuth, requireRole('independent_validator'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const alerts = primaryStore.getDuressAlerts();
    return res.json({
      count: alerts.length,
      alerts
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});
