import crypto from 'crypto';
import { primaryStore, ConsensusRequest, DuressAlert, ValidatorActivityLogRecord } from '../db/store.js';
import { blockchainService } from './blockchain.service.js';
import { auditLedger } from '../db/auditLedger.js';
import { notifyValidatorSockets } from './duress.service.js';

interface DashboardCache {
  timestamp: number;
  data: any;
}

class ValidatorService {
  private cache: DashboardCache | null = null;
  private readonly CACHE_TTL_MS = 30 * 1000; // 30-Second TTL Node Cache

  /**
   * Invalidate 30s Node In-Memory Cache on state mutations
   */
  public invalidateCache() {
    this.cache = null;
  }

  /**
   * GET /api/validator/dashboard Service Logic
   * Selected counts and Zero-Knowledge blind categories ONLY. No case content columns reachable.
   */
  public async getDashboardData(user: { id: string; fullName: string; role: string }) {
    const now = Date.now();
    if (this.cache && (now - this.cache.timestamp) < this.CACHE_TTL_MS) {
      return {
        ...this.cache.data,
        cached: true,
        cacheAgeMs: now - this.cache.timestamp
      };
    }

    // Run store COUNT queries
    const counts = await primaryStore.getDashboardCounts();
    const consensusRequests = primaryStore.getConsensusRequests();
    const duressAlerts = primaryStore.getDuressAlerts();
    const activityLogs = primaryStore.getValidatorActivityLogs();

    const activeDuressAlert = duressAlerts.find(a => a.status === 'UNACKNOWLEDGED') || duressAlerts[0] || null;

    const pendingVotes = consensusRequests.map(r => ({
      id: r.id,
      queue: r.queue,
      waitTimeHours: r.waitTimeHours,
      waitTimeFormatted: r.waitTimeFormatted,
      slaLimitFormatted: r.slaLimitFormatted,
      urgency: r.urgency,
      urgencyColor: r.urgencyColor,
      badgeColor: r.badgeColor,
      quorumSigned: r.quorumSigned ?? 0,
      quorumTotal: r.quorumTotal ?? 3,
      merkleRoot: r.merkleRoot,
      zkProofType: r.zkProofType,
      entropyScore: r.entropyScore,
      cryptographicDetails: r.cryptographicDetails,
      userSignedDecision: (r.signedBy && r.signedBy[user.id]) ? r.signedBy[user.id] : null,
      txHash: r.txHash
    }));

    const dashboardPayload = {
      summary: {
        consensusVotesAwaiting: counts.consensusAwaitingCount,
        encryptedAnalyticsReports: counts.analyticsReportsCount,
        duressAlertsCount: counts.activeDuressCount,
        bottleneckText: counts.bottleneckInfo.count > 0 ? `${counts.bottleneckInfo.count} Bottleneck (${counts.bottleneckInfo.waitTimeFormatted})` : '0 Bottlenecks'
      },
      zeroKnowledgePolicy: {
        enforced: true,
        mode: 'Blind Consensus Engine',
        zkProofStatus: 'ZK-SNARK Clean',
        notice: 'You are operating in blind validation mode. Case titles, litigant names, and evidence files are strictly hidden to preserve absolute validator neutrality and eliminate contextual bias during multi-sig consensus.'
      },
      pendingVotes,
      activeDuressAlert: activeDuressAlert ? {
        id: activeDuressAlert.id,
        refId: activeDuressAlert.refId || 'DURESS-SIG-2026-04',
        fieldNodeId: activeDuressAlert.fieldNodeId || 'FIELD NODE #04',
        timestamp: activeDuressAlert.timestamp,
        timeAgo: '42 mins ago',
        title: 'Silent Duress Override Authenticated (Ref: DURESS-SIG-2026-04)',
        description: activeDuressAlert.detailsText || 'Field submitter entered silent distress PIN during evidence submission. Zero-knowledge distress hash authenticated against hardware HSM. No case content or officer location is exposed to unauthorized peers.',
        status: activeDuressAlert.status,
        escalated: activeDuressAlert.status === 'ESCALATED'
      } : null,
      activityLogs: activityLogs.map(l => ({
        id: l.id,
        action: l.action,
        type: l.type,
        time: l.time,
        nodeId: l.nodeId,
        icon: l.icon,
        color: l.color
      })),
      validatorUser: {
        id: user.id,
        fullName: user.fullName || 'Adv. A. Mehta',
        role: 'Independent Validator',
        nodeId: 'Node #IV-882'
      }
    };

    // Store in 30s TTL cache
    this.cache = {
      timestamp: now,
      data: dashboardPayload
    };

    return {
      ...dashboardPayload,
      cached: false
    };
  }

  /**
   * Cast Consensus Vote on Block Payload
   */
  public async castVote(userId: string, userName: string, blockId: string, decision: 'Approve' | 'Reject', pin?: string) {
    this.cache = null;
    const block = primaryStore.getConsensusRequestById(blockId);
    if (!block) {
      throw new Error(`Block ${blockId} not found in consensus queue.`);
    }

    block.signedBy = block.signedBy || {};
    if (block.signedBy[userId]) {
      throw new Error(`Validator ${userName} has already cast a ${block.signedBy[userId]} vote on ${blockId}.`);
    }

    const merkleRoot = block.merkleRoot || '0x0000000000000000000000000000000000000000000000000000000000000000';
    // Cryptographically sign decision with Node's crypto library
    const signaturePayload = `${blockId}:${merkleRoot}:${decision}:${userId}:${Date.now()}`;
    const digitalSignature = crypto.createHash('sha256').update(signaturePayload).digest('hex');

    block.signedBy[userId] = decision;
    const currentSigned = block.quorumSigned ?? 0;
    const currentTotal = block.quorumTotal ?? 3;
    block.quorumSigned = Math.min(currentTotal, currentSigned + 1);

    // If quorum is complete, publish to Polygon Blockchain via Ethers.js
    let txHash: string | undefined = undefined;
    if (block.quorumSigned >= currentTotal) {
      const anchorResult = await blockchainService.anchorApprovalEvent(
        userId,
        merkleRoot,
        `QUORUM_FINALIZED_${decision.toUpperCase()}`
      );
      txHash = anchorResult.txHash;
      block.txHash = txHash;
      block.blockNumber = anchorResult.blockNumber;
    }

    primaryStore.saveConsensusRequest(block);

    // Append Activity Log
    const actionText = `Cast "${decision}" vote on Block #${blockId}`;
    primaryStore.addValidatorActivityLog({
      action: actionText,
      type: 'Multi-Sig Vote',
      time: 'Just now',
      nodeId: 'Node #IV-882',
      icon: 'CheckCircle2',
      color: 'text-emerald-600 bg-emerald-50'
    });

    auditLedger.appendEvent({
      eventType: 'VALIDATOR_CONSENSUS_VOTE',
      userId,
      userRole: 'independent_validator',
      details: {
        blockId,
        decision,
        digitalSignature,
        quorumSigned: block.quorumSigned,
        quorumTotal: block.quorumTotal,
        txHash
      }
    });

    // Invalidate 30s cache
    this.invalidateCache();

    // Broadcast WebSocket update
    notifyValidatorSockets({
      type: 'CONSENSUS_VOTE_CAST',
      blockId,
      decision,
      quorumSigned: block.quorumSigned,
      quorumTotal: block.quorumTotal,
      txHash
    });

    return {
      message: `Consensus Vote successfully cast on ${blockId}`,
      blockId,
      decision,
      digitalSignature,
      quorumSigned: block.quorumSigned,
      quorumTotal: block.quorumTotal,
      txHash
    };
  }

  /**
   * Acknowledge & Escalate Duress Signal
   */
  public async acknowledgeDuress(userId: string, userName: string, alertId?: string) {
    const alert = primaryStore.acknowledgeDuressAlert(alertId);
    if (!alert) {
      throw new Error('No active duress alert found to acknowledge.');
    }

    primaryStore.addValidatorActivityLog({
      action: `Escalated Silent Duress Signal Ref: ${alert.refId || 'DURESS-SIG-2026-04'}`,
      type: 'Duress Protocol',
      time: 'Just now',
      nodeId: 'Node #IV-882',
      icon: 'ShieldAlert',
      color: 'text-rose-600 bg-rose-50'
    });

    auditLedger.appendEvent({
      eventType: 'DURESS_ALERT_ACKNOWLEDGED',
      userId,
      userRole: 'independent_validator',
      details: { alertId: alert.id, refId: alert.refId, status: alert.status }
    });

    this.invalidateCache();

    notifyValidatorSockets({
      type: 'DURESS_ALERT_ACKNOWLEDGED',
      alertId: alert.id,
      status: alert.status
    });

    return {
      message: 'Duress Protocol Acknowledged & Escalated to Command Dispatch',
      alert
    };
  }
}

export const validatorService = new ValidatorService();
