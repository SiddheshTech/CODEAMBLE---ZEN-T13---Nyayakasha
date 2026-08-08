import { Router, Request, Response } from 'express';
import { primaryStore } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';
import { blockchainService } from '../services/blockchain.service.js';
import { notifyValidatorSockets } from '../services/duress.service.js';
import crypto from 'crypto';

export const consensusRouter = Router();

/**
 * GET /api/consensus & GET /api/consensus/pending
 * Returns consensus requests for Independent Validator with suspicious-flag cross checking.
 */
const getConsensusData = (req: Request, res: Response) => {
  primaryStore.loadFromDisk();
  const requests = primaryStore.getConsensusRequests();
  const duressAlerts = primaryStore.getDuressAlerts();
  
  // Collect all case IDs with active duress alerts for suspicious-flag check
  const duressCaseIds = new Set(
    duressAlerts.map(a => (a.refId || a.id || '').toUpperCase())
  );

  // Cross-reference against duress alerts for suspicious activity flags
  const processedRequests = requests.map(r => {
    const caseIdentifier = (r.caseRef || r.caseId || '').toUpperCase();
    const isSuspicious = duressCaseIds.has(caseIdentifier) || (r.systemFlagIndicator && r.systemFlagIndicator.isFlagged);
    
    if (isSuspicious && (!r.systemFlagIndicator || !r.systemFlagIndicator.isFlagged)) {
      return {
        ...r,
        status: 'Flagged suspicious' as const,
        systemFlagIndicator: {
          isFlagged: true,
          flagType: 'DURESS_OVERRIDE_FLAG',
          title: 'Suspicious Duress Activity Flagged',
          description: `Silent distress signal authenticated for case reference ${caseIdentifier}. Requires forensic review.`
        }
      };
    }
    return r;
  });

  const pendingCount = processedRequests.filter(r => r.validatorVoteStatus === 'Pending' || r.status === 'Awaiting validator' || r.status === 'Awaiting your vote').length;
  const systemFlagsCount = processedRequests.filter(r => r.systemFlagIndicator?.isFlagged || r.status === 'Flagged suspicious').length;
  const votesCastCount = processedRequests.filter(r => r.validatorVoteStatus === 'Approved' || r.validatorVoteStatus === 'Rejected' || r.status === 'Approved' || r.status === 'Rejected').length;

  return res.json({
    success: true,
    pendingRequests: processedRequests,
    summary: {
      pendingCount,
      systemFlagsCount,
      votesCastCount
    }
  });
};

consensusRouter.get(['/', ''], getConsensusData);
consensusRouter.get('/pending', getConsensusData);

/**
 * GET /api/consensus/approvals (Backwards compatibility)
 */
consensusRouter.get('/approvals', (req: Request, res: Response) => {
  const isDuress = req.headers['x-duress-session'] === 'true' || req.query.duress === 'true';
  const requests = primaryStore.getConsensusRequests(isDuress);
  return res.json({ success: true, requests, isDuressSession: isDuress });
});

/**
 * GET /api/consensus/:id
 * Fetch request detail by ID
 */
consensusRouter.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const item = primaryStore.getConsensusRequestById(id);
  if (!item) {
    return res.status(404).json({ error: 'CONSENSUS_NOT_FOUND', message: `Consensus request ${id} not found.` });
  }
  return res.json({ success: true, request: item });
});

/**
 * POST /api/consensus/:id/vote or POST /api/consensus/vote
 * Full sequence vote submission handler with Zod-style justification note enforcement.
 */
const handleVote = async (req: Request, res: Response) => {
  const requestId = req.params.id || req.body.requestId || req.body.id;
  const { decision, vote, justificationNote, note, validatorId, validatorName } = req.body;

  const voteDecision = decision || (vote === 'APPROVE' ? 'Approved' : vote === 'REJECT' ? 'Rejected' : vote);
  const justification = (justificationNote || note || '').trim();

  // Zod-Style mandatory justification validation
  if (!justification) {
    return res.status(400).json({
      error: 'JUSTIFICATION_REQUIRED',
      message: 'Mandatory short justification note required to establish validator accountability before casting vote.'
    });
  }

  if (!requestId) {
    return res.status(400).json({ error: 'MISSING_REQUEST_ID', message: 'Consensus Request ID is required.' });
  }

  const reqItem = primaryStore.getConsensusRequestById(requestId);
  if (!reqItem) {
    return res.status(404).json({ error: 'CONSENSUS_NOT_FOUND', message: `Consensus request ${requestId} not found.` });
  }

  const nodeName = validatorName || 'Independent Validator Node #02 (You)';
  const keyId = validatorId || 'VAL-KEY-IND-002';
  const now = new Date();
  const timestampStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Update Validator Vote
  reqItem.validatorVoteStatus = voteDecision === 'Approved' ? 'Approved' : 'Rejected';
  reqItem.validatorVote = voteDecision === 'Approved' ? 'approved' : 'rejected';
  reqItem.validatorJustificationNote = justification;

  // Add node vote entry
  reqItem.nodeVotes = reqItem.nodeVotes || [];
  reqItem.nodeVotes = reqItem.nodeVotes.filter(nv => !nv.nodeRole?.includes('Validator') && !nv.nodeName?.includes('Validator'));
  reqItem.nodeVotes.push({
    nodeName,
    nodeRole: 'Certified Independent Validator',
    keyId,
    status: voteDecision === 'Approved' ? 'Approved' : 'Rejected',
    timestamp: timestampStr,
    signatureHash: `0xSIG_VALIDATOR_${voteDecision === 'Approved' ? 'ADM' : 'REJ'}_${Math.floor(Math.random() * 899999 + 100000)}`
  });

  // Step 2 Check: Verify Court Authority vote status
  const courtApproved = reqItem.courtAuthorityVoteStatus === 'Approved' || reqItem.yourVote === 'approved';

  if (voteDecision === 'Approved' && courtApproved) {
    // Step 3: Node hashes the approved change
    const changeData = {
      id: reqItem.id,
      caseRef: reqItem.caseRef || reqItem.caseId,
      title: reqItem.title,
      targetRecordHash: reqItem.targetRecordHash || reqItem.merkleRoot,
      proposedRecordHash: reqItem.proposedRecordHash || reqItem.merkleRoot,
      approvedAt: new Date().toISOString()
    };
    const changeHash = crypto.createHash('sha256').update(JSON.stringify(changeData)).digest('hex');

    // Step 4: ethers.js calls smart contract's anchorChange(hash, caseId, timestamp) on Polygon
    let txHash: string | undefined = undefined;
    try {
      const anchorResult = await blockchainService.anchorApprovalEvent(
        keyId,
        changeHash,
        `CONSENSUS_QUORUM_FINALIZED_${reqItem.id}`
      );
      txHash = anchorResult.txHash;
      reqItem.proposedRecordHash = changeHash;
      reqItem.blockNumber = anchorResult.blockNumber;
    } catch (bcErr: any) {
      console.log('Blockchain anchor notice:', bcErr.message);
    }

    reqItem.status = 'Approved';
    reqItem.currentApprovalCount = reqItem.totalRequiredCount || 2;

    // Step 5: Node writes new row to hash-chained audit ledger, linked to previous entry
    auditLedger.recordEvent('CONSENSUS_VOTE_QUORUM_FINALIZED', nodeName, {
      requestId: reqItem.id,
      caseRef: reqItem.caseRef,
      changeHash,
      txHash,
      justificationNote: justification
    });

    // Step 6: Socket.io/WebSocket emits counts:update
    notifyValidatorSockets({
      type: 'COUNTS_UPDATE',
      requestId: reqItem.id,
      status: 'Approved',
      message: `Consensus quorum achieved for ${reqItem.id}`
    });
  } else if (voteDecision === 'Rejected') {
    // ON REJECTION: Steps 3-4 (hashing + blockchain anchor) NEVER execute!
    // A rejected request stays un-anchored permanently as security guarantee.
    reqItem.status = 'Rejected';
    reqItem.validatorVoteStatus = 'Rejected';

    auditLedger.recordEvent('CONSENSUS_VOTE_REJECTED', nodeName, {
      requestId: reqItem.id,
      caseRef: reqItem.caseRef,
      justificationNote: justification,
      note: 'Rejected request permanently remains un-anchored.'
    });

    notifyValidatorSockets({
      type: 'COUNTS_UPDATE',
      requestId: reqItem.id,
      status: 'Rejected',
      message: `Consensus vote rejected for ${reqItem.id}`
    });
  }

  primaryStore.saveConsensusRequest(reqItem);

  return res.json({
    success: true,
    message: voteDecision === 'Approved' ? 'Consensus vote cast successfully. Quorum sequence executed.' : 'Vote rejected. Request permanently remains un-anchored.',
    request: reqItem
  });
};

consensusRouter.post('/:id/vote', handleVote);
consensusRouter.post('/vote', handleVote);
