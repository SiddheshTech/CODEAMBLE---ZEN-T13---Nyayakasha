import { Router, Request, Response } from 'express';
import { primaryStore } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';

export const analyticsRouter = Router();

// GET analytics overview metrics
analyticsRouter.get('/overview', (req: Request, res: Response) => {
  const cases = primaryStore.getCases();
  const evidence = primaryStore.getEvidence();
  const consensus = primaryStore.getConsensusRequests();
  const forgery = primaryStore.getForgeryReviews();
  const duressAlerts = primaryStore.getDuressAlerts();

  const totalCases = cases.length;
  const sealedEvidence = evidence.filter(e => e.status === 'Sealed' || e.status === 'Verified').length;
  const pendingConsensus = consensus.filter(c => c.status === 'Pending').length;
  const flaggedForgeries = forgery.filter(f => f.status === 'Under Review' || f.status === 'Quarantined').length;
  const totalAuditBlocks = auditLedger.getEvents().length;
  const ledgerVerified = auditLedger.verifyIntegrity();

  return res.json({
    success: true,
    metrics: {
      totalCases,
      sealedEvidence,
      pendingConsensus,
      flaggedForgeries,
      activeDuressAlerts: duressAlerts.filter(d => d.status === 'UNACKNOWLEDGED').length,
      totalAuditBlocks,
      consensusBlockHeight: 148920 + totalAuditBlocks,
      verificationRate: 99.98,
      activeNodes: 14,
      networkLatencyMs: 18,
      ledgerIntegrity: ledgerVerified ? 'VERIFIED_VALID' : 'CORRUPTED'
    }
  });
});
