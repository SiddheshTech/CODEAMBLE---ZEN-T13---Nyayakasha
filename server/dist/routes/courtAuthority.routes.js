import { Router } from 'express';
import crypto from 'crypto';
import { primaryStore } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';
export const courtAuthorityRouter = Router();
/**
 * GET /api/court-authority/dashboard
 * Returns real-time aggregated summary stats for the Court Authority dashboard header cards.
 */
courtAuthorityRouter.get('/dashboard', (req, res) => {
    try {
        primaryStore.loadFromDisk();
        const cases = primaryStore.getCases();
        const forgeryReviews = primaryStore.getForgeryReviews();
        const consensusRequests = primaryStore.getConsensusRequests();
        const precedentFlags = primaryStore.getPrecedentFlags();
        // Today's new cases (created in last 24h)
        const now = Date.now();
        const todayCases = cases.filter(c => {
            const created = new Date(c.createdAt || c.date || '').getTime();
            return !isNaN(created) && (now - created) < 86400000;
        });
        // Open / active case files
        const openCases = cases.filter(c => c.status === 'Active' || c.status === 'Pending Review');
        // Forgery flags requiring action (Under Review)
        const activeForgeryFlags = forgeryReviews.filter(f => f.status === 'Under Review' || f.status === 'Escalated to Bench');
        // Consensus votes awaiting court authority input
        const pendingConsensus = consensusRequests.filter(r => r.status === 'Pending' ||
            r.status === 'Awaiting validator' ||
            r.status === 'Awaiting your vote' ||
            r.validatorVoteStatus === 'Pending');
        // Precedent flags (Layer 6 outliers) — flagged only
        const activePrecedentFlags = precedentFlags.filter(p => p.status === 'Flagged');
        // Total pending attention items count
        const attentionCount = activeForgeryFlags.filter(f => f.status === 'Under Review').length +
            pendingConsensus.filter(r => !r.courtAuthorityVoteStatus || r.courtAuthorityVoteStatus === 'Pending').length;
        return res.json({
            success: true,
            stats: {
                openCasesCount: openCases.length,
                totalCasesCount: cases.length,
                todayCasesCount: todayCases.length,
                forgeryFlagsCount: activeForgeryFlags.length,
                consensusVotesCount: pendingConsensus.length,
                precedentFlagsCount: activePrecedentFlags.length,
                attentionCount,
            }
        });
    }
    catch (error) {
        console.error('Court Authority dashboard error:', error.message);
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * GET /api/court-authority/attention-items
 * Returns real-time attention items derived from forgery reviews, consensus votes,
 * precedent flags, and pending custody transfers — prioritised and formatted for the dashboard.
 */
courtAuthorityRouter.get('/attention-items', (req, res) => {
    try {
        primaryStore.loadFromDisk();
        const forgeryReviews = primaryStore.getForgeryReviews();
        const consensusRequests = primaryStore.getConsensusRequests();
        const precedentFlags = primaryStore.getPrecedentFlags();
        const evidence = primaryStore.getEvidence();
        const cases = primaryStore.getCases();
        const items = [];
        // 1. FORGERY items — Under Review = URGENT
        const addedExhibitIds = new Set();
        const forgeryQueueItems = primaryStore.getForgeryQueueItems();
        forgeryQueueItems
            .filter(f => f.status === 'Flagged' || f.status === 'Escalated' || f.status === 'Pending Scan')
            .forEach(f => {
            const relatedCase = cases.find(c => c.id === f.caseId);
            const createdAt = new Date(f.timestamp || Date.now()).getTime();
            const hoursLeft = Math.max(0, Math.round((createdAt + 48 * 3600000 - Date.now()) / 3600000));
            addedExhibitIds.add(f.exhibitId);
            items.push({
                id: f.caseId || f.exhibitId,
                dbId: f.id,
                type: 'forgery',
                title: f.title,
                queue: 'Forgery Detection Engine',
                urgency: 'URGENT',
                urgencyColor: 'bg-rose-100 text-rose-800 border-rose-200',
                badgeColor: 'bg-rose-500',
                timeLeft: hoursLeft > 0 ? `${hoursLeft} hours left` : 'Overdue',
                details: f.anomalySummary || (f.metadataCheck?.details + ' ' + f.ganFingerprintCheck?.details),
                courtNote: 'Requires judicial determination to admit or strike exhibit from trial record.',
                actionLabel: 'Inspect & Determine',
                caseRef: relatedCase ? relatedCase.title : f.caseTitle || f.caseId,
                judgeInstruction: 'Verify frame timestamps against municipal traffic server backup ledger before issuing evidentiary order.',
                exhibitId: f.exhibitId,
                spectralScore: f.ganFingerprintCheck?.score || 98.4,
                metadataIntegrityScore: f.metadataCheck?.score || 98.4,
                aiConfidence: f.confidenceScore || 98.4,
                status: f.status,
                submittedBy: f.submitter,
                timestamp: f.timestamp,
                originalHash: f.originalHash,
                submittedHash: f.submittedHash,
                merkleRoot: f.merkleRoot,
                blockNumber: f.blockNumber,
                anomaliesList: f.anomaliesList,
                custodyTrail: f.custodyTrail,
                precedents: f.precedents,
                directives: f.directives,
            });
        });
        forgeryReviews
            .filter(f => f.status === 'Under Review' || f.status === 'Escalated to Bench')
            .forEach(f => {
            if (addedExhibitIds.has(f.exhibitId))
                return;
            const relatedCase = cases.find(c => c.id === f.caseId);
            const createdAt = new Date(f.timestamp || Date.now()).getTime();
            const hoursLeft = Math.max(0, Math.round((createdAt + 48 * 3600000 - Date.now()) / 3600000));
            items.push({
                id: f.caseId || f.exhibitId,
                dbId: f.id,
                type: 'forgery',
                title: f.title,
                queue: 'Forgery Detection Engine',
                urgency: f.status === 'Escalated to Bench' ? 'URGENT' : 'URGENT',
                urgencyColor: 'bg-rose-100 text-rose-800 border-rose-200',
                badgeColor: 'bg-rose-500',
                timeLeft: hoursLeft > 0 ? `${hoursLeft} hours left` : 'Overdue',
                details: f.flagReason + ` AI Confidence: ${f.aiConfidence}%. Spectral score: ${f.spectralScore}%. Metadata Integrity: ${f.metadataIntegrityScore}%.`,
                courtNote: 'Requires judicial determination to admit or strike exhibit from trial record.',
                actionLabel: 'Inspect & Determine',
                caseRef: relatedCase ? relatedCase.title : f.caseId,
                judgeInstruction: 'Verify frame timestamps against municipal traffic server backup ledger before issuing evidentiary order.',
                exhibitId: f.exhibitId,
                spectralScore: f.spectralScore,
                metadataIntegrityScore: f.metadataIntegrityScore,
                aiConfidence: f.aiConfidence,
                status: f.status,
                submittedBy: f.submittedBy,
                timestamp: f.timestamp,
            });
        });
        // 2. CONSENSUS VOTE items — Pending and awaiting court authority
        consensusRequests
            .filter(r => r.status === 'Pending' ||
            r.status === 'Awaiting validator' ||
            r.status === 'Awaiting your vote')
            .forEach(r => {
            const createdAt = new Date(r.createdAt || Date.now()).getTime();
            const hoursLeft = Math.max(0, Math.round((createdAt + 24 * 3600000 - Date.now()) / 3600000));
            const currentSigs = r.currentVotes || r.quorumSigned || r.currentApprovalCount || 0;
            const totalSigs = r.requiredVotes || r.quorumTotal || r.totalRequiredCount || 3;
            items.push({
                id: r.caseId || r.id,
                dbId: r.id,
                type: 'vote',
                title: r.exhibitTitle ? `Forensic Hash Consensus: ${r.exhibitTitle}` : (r.title || `Consensus Request ${r.id}`),
                queue: 'Consensus Voting',
                urgency: 'HIGH',
                urgencyColor: 'bg-amber-100 text-amber-800 border-amber-200',
                badgeColor: 'bg-amber-500',
                timeLeft: hoursLeft > 0 ? `${hoursLeft} hours left` : '24h deadline',
                details: `${currentSigs} of ${totalSigs} independent validators have attested hash integrity. Your vote is required to seal consensus block ${r.id}.`,
                courtNote: 'Awaiting your binding judicial validator signature to authorize evidence block sealing.',
                actionLabel: 'Cast Validator Vote',
                caseRef: r.caseTitle || r.caseId,
                judgeInstruction: 'Review ZK-Proof zero-knowledge certificate before applying judicial multi-sig hardware token.',
                blockId: r.id,
                currentVotes: currentSigs,
                requiredVotes: totalSigs,
                merkleRoot: r.merkleRoot || r.targetRecordHash,
                status: r.status,
                submittedBy: r.submittedBy,
                nodeVotes: r.nodeVotes || [],
            });
        });
        // 3. PRECEDENT FLAGS — Layer 6 Outliers
        precedentFlags
            .filter(p => p.status === 'Flagged')
            .forEach(p => {
            const relatedCase = cases.find(c => c.id === p.caseId);
            items.push({
                id: p.caseId || p.id,
                dbId: p.id,
                type: 'precedent',
                title: `Precedent Conflict: ${p.precedentCitation}`,
                queue: 'Precedent Analysis',
                urgency: p.severity === 'Critical' ? 'URGENT' : p.severity === 'High' ? 'HIGH' : 'MEDIUM',
                urgencyColor: p.severity === 'Critical'
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : p.severity === 'High'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200',
                badgeColor: p.severity === 'Critical' ? 'bg-rose-500' : p.severity === 'High' ? 'bg-blue-500' : 'bg-amber-500',
                timeLeft: 'Today',
                details: p.conflictDescription,
                courtNote: 'Automated twin comparison ready for judicial review and precedent citation.',
                actionLabel: 'Analyze Precedent Twin',
                caseRef: relatedCase ? relatedCase.title : p.caseTitle,
                judgeInstruction: `Check compliance vectors against ${p.precedentCitation} precedent guidelines. System Action: ${p.systemAction}`,
                flagId: p.id,
                severity: p.severity,
                citation: p.precedentCitation,
                status: p.status,
            });
        });
        // 4. CUSTODY TRANSFER items — evidence in 'Pending Chain Transfer' or 'Transfer Pending'
        evidence
            .filter(e => e.status === 'Pending Chain Transfer' || e.status === 'Transfer Pending' || e.status === 'In Transit')
            .slice(0, 2) // limit to top 2
            .forEach(e => {
            const relatedCase = cases.find(c => c.id === e.caseId);
            items.push({
                id: e.caseId || e.id,
                dbId: e.id,
                type: 'custody',
                title: `Custody Transfer Approval: ${e.title}`,
                queue: 'Chain of Custody',
                urgency: 'MEDIUM',
                urgencyColor: 'bg-purple-100 text-purple-800 border-purple-200',
                badgeColor: 'bg-purple-500',
                timeLeft: '1 day left',
                details: `${e.custodian || 'Field Officer'} requested transfer of ${e.type} evidence. Barcode: ${e.seizureBagId || e.id}. Current status: ${e.status}.`,
                courtNote: 'Requires court authorization for physical evidence movement across precinct boundaries.',
                actionLabel: 'Authorize Custody Transfer',
                caseRef: relatedCase ? relatedCase.title : e.caseId,
                judgeInstruction: 'Confirm biometric sign-off from Receiving Forensic Director prior to dispatch order.',
                evidenceId: e.id,
                custodian: e.custodian,
                status: e.status,
                hash: e.hash,
            });
        });
        // Sort: URGENT first, then HIGH, then MEDIUM
        const urgencyOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2 };
        items.sort((a, b) => (urgencyOrder[a.urgency] ?? 3) - (urgencyOrder[b.urgency] ?? 3));
        return res.json({
            success: true,
            attentionItems: items,
            pendingCount: items.length,
        });
    }
    catch (error) {
        console.error('Attention items error:', error.message);
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * GET /api/court-authority/recent-activity
 * Returns the last N relevant audit log entries for the Court Authority role.
 * Filters for judicial actions: votes, forgery rulings, attestations, custody approvals.
 */
courtAuthorityRouter.get('/recent-activity', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const allEvents = auditLedger.getEvents();
        // Event types relevant to court authority
        const relevantTypes = [
            'CONSENSUS_VOTE_QUORUM_FINALIZED',
            'CONSENSUS_VOTE_REJECTED',
            'FORGERY_VERDICT_SUBMITTED',
            'JUDICIAL_ORDER_ISSUED',
            'CUSTODY_TRANSFER_AUTHORIZED',
            'JUDICIAL_ATTESTATION_SIGNED',
            'COURT_AUTHORITY_VOTE_CAST',
            'PRECEDENT_CONFLICT_RESOLVED',
            'IDENTITY_UNLOCK_APPROVED',
            'CASE_DOCKET_CREATED',
        ];
        const relevantEvents = allEvents
            .filter(e => relevantTypes.some(t => e.eventType.includes(t.split('_')[0]) || e.eventType === t))
            .reverse() // newest first
            .slice(0, limit);
        // Map to a display-friendly format
        const activities = relevantEvents.map(e => {
            let type = 'system';
            let actionLabel = 'System Event';
            let iconType = 'check';
            if (e.eventType.includes('CONSENSUS') && e.outcome === 'Approved') {
                type = 'vote';
                actionLabel = 'Vote Cast';
                iconType = 'check';
            }
            else if (e.eventType.includes('CONSENSUS') && e.outcome === 'Rejected') {
                type = 'vote';
                actionLabel = 'Vote Cast';
                iconType = 'check';
            }
            else if (e.eventType.includes('FORGERY')) {
                type = 'ruling';
                actionLabel = 'Ruling Issued';
                iconType = 'scale';
            }
            else if (e.eventType.includes('JUDICIAL_ORDER') || e.eventType.includes('ATTESTATION')) {
                type = 'attestation';
                actionLabel = 'Attestation';
                iconType = 'shield';
            }
            else if (e.eventType.includes('CUSTODY')) {
                type = 'custody';
                actionLabel = 'Custody Transfer';
                iconType = 'folder';
            }
            else if (e.eventType.includes('PRECEDENT')) {
                type = 'precedent';
                actionLabel = 'Precedent Resolved';
                iconType = 'scale';
            }
            else if (e.eventType.includes('CASE_DOCKET')) {
                type = 'case';
                actionLabel = 'Case Created';
                iconType = 'file';
            }
            const ts = new Date(e.timestamp);
            const now = new Date();
            const diffMs = now.getTime() - ts.getTime();
            const diffHours = diffMs / 3600000;
            let displayTimestamp;
            if (diffHours < 24) {
                displayTimestamp = `Today, ${ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
            }
            else if (diffHours < 48) {
                displayTimestamp = `Yesterday, ${ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
            }
            else {
                displayTimestamp = ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
                    ', ' + ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            }
            // Compose human-readable action description
            let action = e.actionName || e.eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            if (e.details) {
                if (e.details.requestId)
                    action = `${type === 'vote' ? 'Cast Vote on' : 'Processed'} Consensus Case #${e.details.requestId}`;
                if (e.details.reviewId || e.details.exhibitId)
                    action = `Issued Ruling on Forgery Flag (Case #${e.details.caseId || e.details.reviewId})`;
                if (e.details.flagId)
                    action = `Resolved Precedent Flag #${e.details.flagId} (${e.details.citation || ''})`;
                if (e.details.caseId && e.eventType.includes('CUSTODY'))
                    action = `Approved Custody Transfer for Case #${e.details.caseId}`;
                if (e.details.caseId && e.eventType.includes('CASE_DOCKET'))
                    action = `Created Case Docket #${e.details.caseId}: ${e.details.title || ''}`;
            }
            return {
                id: e.id,
                eventType: e.eventType,
                action,
                type,
                actionLabel,
                iconType,
                timestamp: displayTimestamp,
                isoTimestamp: e.timestamp,
                outcome: e.outcome,
                details: e.details,
                blockNumber: e.blockNumber,
                hash: e.hash,
            };
        });
        return res.json({
            success: true,
            activities,
            total: relevantEvents.length,
        });
    }
    catch (error) {
        console.error('Recent activity error:', error.message);
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * POST /api/court-authority/action
 * Executes a judicial decision: ADMIT / STRIKE (forgery), APPROVE_VOTE / REJECT_VOTE (consensus),
 * AUTHORIZE_TRANSFER (custody), RESOLVE_PRECEDENT (precedent flag).
 */
courtAuthorityRouter.post('/action', async (req, res) => {
    try {
        const { decision, // 'ADMIT' | 'STRIKE' | 'APPROVE_VOTE' | 'REJECT_VOTE' | 'AUTHORIZE_TRANSFER' | 'RESOLVE_PRECEDENT'
        itemType, // 'forgery' | 'vote' | 'custody' | 'precedent'
        dbId, // ID of the specific record to mutate
        caseId, // Case reference
        judicialOrderText, // Optional free-form judicial note
        judgeId, // Authenticated judge identifier (from session)
        judgeName, // Display name
         } = req.body;
        if (!decision || !dbId) {
            return res.status(400).json({
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'decision and dbId are required for judicial action execution.'
            });
        }
        const judgeDisplayName = judgeName || judgeId || 'Hon. Justice Adv. A. Mehta';
        const now = new Date();
        let resultMessage = '';
        let auditEventType = 'JUDICIAL_ORDER_ISSUED';
        let auditDetails = { decision, dbId, caseId, judgeId, judicialOrderText };
        if (itemType === 'forgery' || decision === 'ADMIT' || decision === 'STRIKE') {
            // Forgery — ADMIT maps to 'Cleared', STRIKE maps to 'Quarantined'
            const forgeryDecision = decision === 'ADMIT' ? 'Cleared' : 'Quarantined';
            const richAction = decision === 'ADMIT' ? 'Accepted & Admitted' : 'Rejected & Excluded';
            const sigHash = '0xSIG_BENCH_' + crypto.createHash('sha256').update(`${dbId}-${richAction}-${judicialOrderText || ''}-${now.toISOString()}`).digest('hex').substring(0, 16).toUpperCase();
            let updated = primaryStore.decideRichForgery(dbId, richAction, judicialOrderText || '', sigHash);
            if (!updated) {
                updated = primaryStore.decideForgery(dbId, forgeryDecision, judicialOrderText);
            }
            else {
                const standardReview = primaryStore.getForgeryReviews().find(r => r.id === updated.id || r.exhibitId === updated.exhibitId);
                if (standardReview) {
                    primaryStore.decideForgery(standardReview.id, forgeryDecision, judicialOrderText);
                }
            }
            if (!updated) {
                return res.status(404).json({ error: 'FORGERY_ITEM_NOT_FOUND', message: `Forgery review item ${dbId} not found.` });
            }
            auditEventType = 'FORGERY_VERDICT_SUBMITTED';
            auditDetails = { ...auditDetails, exhibitId: updated.exhibitId, verdict: forgeryDecision };
            resultMessage = decision === 'ADMIT'
                ? 'Exhibit Admitted to Trial Record — Hash-chain attestation recorded.'
                : 'Exhibit Struck & Flagged as Tampered — Permanently quarantined from evidence ledger.';
        }
        else if (itemType === 'vote' || decision === 'APPROVE_VOTE' || decision === 'REJECT_VOTE') {
            // Consensus vote — updates the request's courtAuthorityVoteStatus
            const req2 = primaryStore.getConsensusRequestById(dbId);
            if (!req2) {
                return res.status(404).json({ error: 'CONSENSUS_NOT_FOUND', message: `Consensus request ${dbId} not found.` });
            }
            const voteDecision = decision === 'APPROVE_VOTE' ? 'Approved' : 'Rejected';
            req2.courtAuthorityVoteStatus = voteDecision;
            req2.yourVote = voteDecision.toLowerCase();
            // Update node votes list to include court authority
            req2.nodeVotes = req2.nodeVotes || [];
            req2.nodeVotes = req2.nodeVotes.filter((nv) => !nv.nodeRole?.includes('Court Authority'));
            req2.nodeVotes.push({
                nodeName: judgeDisplayName,
                nodeRole: 'Court Authority — Presiding Judge',
                keyId: judgeId || 'CA-KEY-BENCH-01',
                status: voteDecision,
                timestamp: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
                    ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                signatureHash: `0xCA_SIG_${voteDecision.toUpperCase()}_${Math.floor(Math.random() * 899999 + 100000)}`,
                judicialNote: judicialOrderText,
            });
            // Check if both court authority + validator have approved → seal the block
            const validatorApproved = req2.validatorVoteStatus === 'Approved' || req2.validatorVote === 'approved';
            if (voteDecision === 'Approved' && validatorApproved) {
                req2.status = 'Approved';
                req2.currentApprovalCount = req2.totalRequiredCount || 2;
            }
            else if (voteDecision === 'Rejected') {
                req2.status = 'Rejected';
            }
            primaryStore.saveConsensusRequest(req2);
            auditEventType = 'COURT_AUTHORITY_VOTE_CAST';
            auditDetails = { ...auditDetails, requestId: dbId, verdict: voteDecision };
            resultMessage = decision === 'APPROVE_VOTE'
                ? `Judicial Affirmative Vote Recorded on Block ${dbId}`
                : `Judicial Dissent Vote Recorded on Block ${dbId}`;
        }
        else if (itemType === 'custody' || decision === 'AUTHORIZE_TRANSFER') {
            // Custody transfer — update evidence status to 'Sealed'
            const evidenceArr = primaryStore.getEvidence();
            const evidenceItem = evidenceArr.find(e => e.id === dbId);
            if (!evidenceItem) {
                return res.status(404).json({ error: 'EVIDENCE_NOT_FOUND', message: `Evidence item ${dbId} not found.` });
            }
            evidenceItem.status = 'Verified';
            primaryStore.saveEvidence(evidenceItem);
            auditEventType = 'CUSTODY_TRANSFER_AUTHORIZED';
            auditDetails = { ...auditDetails, evidenceId: dbId, caseId: evidenceItem.caseId };
            resultMessage = 'Sealed Custody Transfer Authorized — Chain-of-custody event recorded on tamper-proof ledger.';
        }
        else if (itemType === 'precedent' || decision === 'RESOLVE_PRECEDENT') {
            const updated = primaryStore.resolvePrecedentFlag(dbId, judgeDisplayName);
            if (!updated) {
                return res.status(404).json({ error: 'PRECEDENT_FLAG_NOT_FOUND', message: `Precedent flag ${dbId} not found.` });
            }
            auditEventType = 'PRECEDENT_CONFLICT_RESOLVED';
            auditDetails = { ...auditDetails, flagId: dbId, citation: updated.precedentCitation, caseId: updated.caseId };
            resultMessage = `Precedent Conflict Resolved — Citation ${updated.precedentCitation} confirmed and recorded.`;
        }
        else {
            return res.status(400).json({ error: 'UNKNOWN_DECISION', message: `Unknown decision type: ${decision}` });
        }
        // Write to immutable audit ledger
        const auditEntry = auditLedger.appendEvent({
            eventType: auditEventType,
            userId: judgeDisplayName,
            userRole: 'court_authority',
            details: { ...auditDetails, judicialOrderText, resultMessage },
            category: 'Vote Cast',
            actionName: decision,
            targetScope: caseId || dbId,
            outcome: (decision === 'ADMIT' || decision === 'APPROVE_VOTE' || decision === 'AUTHORIZE_TRANSFER' || decision === 'RESOLVE_PRECEDENT')
                ? 'Approved' : 'Rejected',
        });
        return res.json({
            success: true,
            message: resultMessage,
            auditEntryId: auditEntry.id,
            auditHash: auditEntry.hash,
            blockNumber: auditEntry.blockNumber,
            timestamp: auditEntry.timestamp,
        });
    }
    catch (error) {
        console.error('Court authority action error:', error.message);
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * GET /api/court-authority/case-search
 * Quick jump-to-case search for the dashboard search bar.
 */
courtAuthorityRouter.get('/case-search', (req, res) => {
    try {
        const query = (req.query.q || '').toLowerCase().trim();
        if (!query) {
            return res.json({ success: true, results: [] });
        }
        const cases = primaryStore.getCases();
        const forgeryReviews = primaryStore.getForgeryReviews();
        const consensus = primaryStore.getConsensusRequests();
        const precedents = primaryStore.getPrecedentFlags();
        const results = [];
        cases.filter(c => c.id.toLowerCase().includes(query) ||
            c.title.toLowerCase().includes(query) ||
            c.officer.toLowerCase().includes(query)).slice(0, 5).forEach(c => results.push({
            id: c.id, title: c.title, type: 'case', status: c.status, priority: c.priority
        }));
        forgeryReviews.filter(f => f.id.toLowerCase().includes(query) ||
            f.caseId.toLowerCase().includes(query) ||
            f.exhibitId.toLowerCase().includes(query) ||
            f.title.toLowerCase().includes(query)).slice(0, 3).forEach(f => results.push({
            id: f.caseId, title: f.title, type: 'forgery', status: f.status, priority: 'High'
        }));
        consensus.filter(r => r.id.toLowerCase().includes(query) ||
            (r.caseId || '').toLowerCase().includes(query) ||
            (r.exhibitTitle || '').toLowerCase().includes(query)).slice(0, 3).forEach(r => results.push({
            id: r.caseId || r.id, title: r.exhibitTitle || r.caseTitle || r.id, type: 'consensus', status: r.status, priority: 'High'
        }));
        precedents.filter(p => p.id.toLowerCase().includes(query) ||
            p.caseId.toLowerCase().includes(query) ||
            p.precedentCitation.toLowerCase().includes(query)).slice(0, 3).forEach(p => results.push({
            id: p.caseId, title: p.precedentCitation, type: 'precedent', status: p.status, priority: p.severity
        }));
        return res.json({ success: true, results: results.slice(0, 8) });
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
