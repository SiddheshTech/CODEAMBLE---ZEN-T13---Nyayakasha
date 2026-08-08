import { Router, Request, Response } from 'express';
import { primaryStore } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';

export const consensusRouter = Router();

// GET all consensus requests
consensusRouter.get('/approvals', (req: Request, res: Response) => {
  const requests = primaryStore.getConsensusRequests();
  return res.json({ success: true, requests });
});

// POST vote on a consensus request
consensusRouter.post('/vote', (req: Request, res: Response) => {
  const { requestId, validatorId, validatorName, vote, note } = req.body;

  if (!requestId || !vote) {
    return res.status(400).json({ error: 'Request ID and Vote (APPROVE/REJECT/FLAG_FORGERY) are required' });
  }

  const updated = primaryStore.addConsensusVote(
    requestId,
    validatorId || 'val_current_user',
    validatorName || 'Validator Panel Member',
    vote,
    note
  );

  if (!updated) {
    return res.status(404).json({ error: 'Consensus request not found' });
  }

  auditLedger.recordEvent('CONSENSUS_VOTE_CAST', validatorName || 'VALIDATOR', {
    requestId,
    vote,
    status: updated.status,
    totalVotes: updated.currentVotes
  });

  return res.json({ success: true, request: updated });
});
