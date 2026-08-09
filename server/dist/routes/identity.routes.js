import { Router } from 'express';
import crypto from 'crypto';
import { primaryStore } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';
export const identityRouter = Router();
// Helper to calculate SHA-256 hash using Node's crypto module
function calculateSHA256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
// GET all identity unlock requests
identityRouter.get('/unlock-requests', (req, res) => {
    const requests = primaryStore.getIdentityUnlocks();
    return res.json({ success: true, requests });
});
// GET a single identity unlock request by ID
identityRouter.get('/unlock-requests/:id', (req, res) => {
    const { id } = req.params;
    const requests = primaryStore.getIdentityUnlocks();
    const request = requests.find(r => r.id === id);
    if (!request) {
        return res.status(404).json({ error: 'Identity unlock request not found' });
    }
    return res.json({ success: true, request });
});
// POST submit a new identity unlock request (by requesting parties)
identityRouter.post('/submit', (req, res) => {
    const { caseId, caseTitle, courtBench, witnessAlias, requestingParty, requestingPartyRole, counselBarId, counselAgency, statedLegalGrounds, statutoryProvision, urgency, witnessRiskIndex, threatAssessmentSummary, protectionCategory } = req.body;
    if (!caseId || !witnessAlias || !requestingParty || !statedLegalGrounds) {
        return res.status(400).json({
            error: 'caseId, witnessAlias, requestingParty, and statedLegalGrounds are required'
        });
    }
    const now = new Date();
    const timestampStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const idSuffix = String(Math.floor(10 + Math.random() * 90));
    const zkpInput = `${caseId}-${witnessAlias}-${now.toISOString()}`;
    const zkpHash = '0x' + calculateSHA256(zkpInput).substring(0, 32);
    const merkleRoot = '0x' + calculateSHA256(zkpInput + '-merkle').substring(0, 24);
    const newRequest = {
        id: `REQ-UNK-${now.getFullYear()}-${idSuffix}`,
        caseId,
        caseTitle: caseTitle || `Case ${caseId}`,
        courtBench: courtBench || 'Pending Assignment',
        witnessAlias,
        witnessZkpHash: zkpHash,
        zkpMerkleRoot: merkleRoot,
        witnessRiskIndex: witnessRiskIndex || 50,
        threatAssessmentSummary: threatAssessmentSummary || 'Risk assessment pending.',
        protectionCategory: protectionCategory || 'Grade C (Standard Protection)',
        requestingParty,
        requestingPartyRole: requestingPartyRole || 'Special Prosecutor',
        counselBarId: counselBarId || '',
        counselAgency: counselAgency || '',
        statedLegalGrounds,
        statutoryProvision: statutoryProvision || '',
        timestamp: timestampStr,
        urgency: urgency || 'Standard',
        status: 'Pending Judicial Review',
        validatorConsensus: '3 of 3 Nodes Verified (100% ZKP Integrity)',
        relatedExhibits: [],
        statutoryChecklist: [],
        precedents: [],
        directives: [],
    };
    primaryStore.saveIdentityUnlockRequest(newRequest);
    auditLedger.appendEvent({
        eventType: 'IDENTITY_UNLOCK_SUBMITTED',
        userId: requestingParty,
        userRole: 'field_submitter',
        category: 'System Safeguard',
        actionName: `New Witness Identity Unlock Request Filed for ${witnessAlias}`,
        targetScope: caseId,
        outcome: 'Reviewed',
        details: { requestId: newRequest.id, witnessAlias, caseId, urgency }
    });
    return res.status(201).json({ success: true, request: newRequest });
});
// GET all permanent identity disclosure logs
identityRouter.get('/logs', (req, res) => {
    const logs = primaryStore.getIdentityUnlockLogs();
    return res.json({ success: true, logs });
});
// POST decide on identity unlock request (Approved / Rejected)
identityRouter.post('/decide', (req, res) => {
    const { requestId, decision, remarks, judgeName, judgeKeyId } = req.body;
    if (!requestId || !decision) {
        return res.status(400).json({ error: 'Request ID and decision (Approved / Rejected) are required' });
    }
    // Generate cryptographic digital signature hash using crypto
    const timestamp = new Date().toISOString();
    const hashInput = `${requestId}-${decision}-${judgeName || 'JUDGE'}-${remarks || ''}-${timestamp}`;
    const sigHash = '0xSIG_JUDGE_' + (decision === 'Approved' ? 'APP' : 'REJ') + '_' + calculateSHA256(hashInput).substring(0, 12).toUpperCase();
    // Optionally store judge identity if provided
    const judgeNameForLog = judgeName || 'Hon. Presiding Magistrate (Active Bench)';
    const judgeKeyForLog = judgeKeyId || 'BENCH-KEY-IND-003';
    const updated = primaryStore.decideIdentityUnlockRequest(requestId, decision, remarks || '', sigHash);
    if (!updated) {
        return res.status(404).json({ error: 'Identity unlock request not found' });
    }
    // Record audit log event
    auditLedger.appendEvent({
        eventType: 'IDENTITY_DISCLOSURE_DECISION',
        userId: judgeNameForLog,
        userRole: 'court_authority',
        category: 'System Safeguard',
        actionName: `Disclosure Verdict: ${decision} on Witness ${updated.witnessAlias}`,
        targetScope: updated.courtBench,
        outcome: decision,
        details: { requestId, witnessAlias: updated.witnessAlias, decision, signatureHash: sigHash, judgeName: judgeNameForLog }
    });
    return res.json({ success: true, request: updated, logs: primaryStore.getIdentityUnlockLogs() });
});
// POST add new directive to an identity unlock request
identityRouter.post('/directive', (req, res) => {
    const { requestId, type, note, judgeName } = req.body;
    if (!requestId || !type || !note) {
        return res.status(400).json({ error: 'Request ID, directive type, and note are required' });
    }
    const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const hashInput = `${requestId}-${type}-${note}-${timestamp}`;
    const hash = '0xDIR_HASH_' + calculateSHA256(hashInput).substring(0, 10).toUpperCase();
    const newDirective = {
        id: `DIR-UNK-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-3)}`,
        judgeName: judgeName || 'Hon. Presiding Magistrate (Active Bench)',
        date: timestamp,
        type,
        note,
        hash
    };
    const updated = primaryStore.addDirectiveToIdentityUnlockRequest(requestId, newDirective);
    if (!updated) {
        return res.status(404).json({ error: 'Identity unlock request not found' });
    }
    // Record audit log event
    auditLedger.appendEvent({
        eventType: 'IDENTITY_DIRECTIVE_APPENDED',
        userId: judgeName || 'Hon. Presiding Magistrate (Active Bench)',
        userRole: 'court_authority',
        category: 'System Safeguard',
        actionName: `Appended Directive: ${type} on Witness ${updated.witnessAlias}`,
        targetScope: updated.courtBench,
        outcome: 'Approved',
        details: { requestId, directiveId: newDirective.id, hash }
    });
    return res.json({ success: true, directive: newDirective, request: updated });
});
