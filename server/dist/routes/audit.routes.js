import { Router } from 'express';
import { auditLedger } from '../db/auditLedger.js';
export const auditRouter = Router();
/**
 * GET /api/audit-log
 * Full tamper-proof audit log chain
 */
auditRouter.get('/', (req, res) => {
    try {
        const chain = auditLedger.getEvents();
        return res.json({
            success: true,
            count: chain.length,
            auditChain: chain,
            ledgerIntegrity: auditLedger.verifyIntegrity()
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * GET /api/audit-log/mine
 * Personal actions filtered to validator UID (or all validator actions)
 */
auditRouter.get('/mine', (req, res) => {
    try {
        const uid = req.query.uid || 'NODE-IND-VAL-04';
        const logs = auditLedger.getPersonalActions(uid);
        return res.json({
            success: true,
            uid,
            count: logs.length,
            logs
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * GET /api/audit-log/system-summary
 * Category-level system integrity summary (GROUP BY event_type counts)
 */
auditRouter.get('/system-summary', (req, res) => {
    try {
        const summary = auditLedger.getSystemSummary();
        return res.json(summary);
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * GET /api/audit-log/verify-anchor/:hash
 * Re-verifies past decision's hash against the SHA256 chain and Merkle root proof
 */
auditRouter.get('/verify-anchor/:hash', (req, res) => {
    try {
        const { hash } = req.params;
        const verification = auditLedger.verifyAnchor(hash);
        return res.json(verification);
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * STRICT IMMUTABILITY ENFORCEMENT
 * Reject any mutating operations (POST, PUT, PATCH, DELETE) with 405 Method Not Allowed
 */
const rejectMutatingOperation = (req, res) => {
    return res.status(405).json({
        success: false,
        errorCode: 'IMMUTABLE_LEDGER_READ_ONLY',
        message: 'Strict Immutability Enforced: Edit and Delete controls are explicitly absent by design across the entire application — for all user roles, including administrators.'
    });
};
auditRouter.post('*', rejectMutatingOperation);
auditRouter.put('*', rejectMutatingOperation);
auditRouter.patch('*', rejectMutatingOperation);
auditRouter.delete('*', rejectMutatingOperation);
