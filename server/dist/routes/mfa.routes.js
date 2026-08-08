import { Router } from 'express';
import { requireAuth } from '../middleware/roleGuard.js';
import { primaryStore } from '../db/store.js';
import { getWebAuthnRegisterOptions, verifyWebAuthnRegistration, setupTOTPSecret, verifyAndEnrollTOTP, verifyDeviceAttestation } from '../services/mfa.service.js';
import { transitionApprovalState } from '../services/verification.service.js';
import { auditLedger } from '../db/auditLedger.js';
export const mfaRouter = Router();
/**
 * Guard Middleware: Ensure User Account is in 'mfa_pending' or 'active' state
 */
async function requireApprovedStateForMFA(req, res, next) {
    const user = await primaryStore.getUserById(req.userId);
    if (!user)
        return res.status(404).json({ error: 'USER_NOT_FOUND' });
    // STRICT CHECK: Reject if user has not yet passed institutional review / committee vetting
    if (user.approvalState !== 'mfa_pending' && user.approvalState !== 'active') {
        return res.status(403).json({
            error: 'MFA_NOT_ALLOWED_IN_CURRENT_STATE',
            message: `MFA enrollment forbidden. Current state is "${user.approvalState}". Account must be institutionally approved and transitioned to "mfa_pending" before MFA setup.`
        });
    }
    next();
}
/**
 * POST /api/mfa/webauthn/generate-options
 */
mfaRouter.post('/webauthn/generate-options', requireAuth, requireApprovedStateForMFA, async (req, res) => {
    try {
        const user = await primaryStore.getUserById(req.userId);
        if (!user)
            return res.status(404).json({ error: 'USER_NOT_FOUND' });
        const options = await getWebAuthnRegisterOptions(user);
        return res.json(options);
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * POST /api/mfa/webauthn/verify
 */
mfaRouter.post('/webauthn/verify', requireAuth, requireApprovedStateForMFA, async (req, res) => {
    try {
        const user = await primaryStore.getUserById(req.userId);
        if (!user)
            return res.status(404).json({ error: 'USER_NOT_FOUND' });
        const result = await verifyWebAuthnRegistration(user, req.body);
        if (!result.verified) {
            return res.status(400).json({ error: 'WEBAUTHN_VERIFICATION_FAILED', message: 'WebAuthn registration verification failed.' });
        }
        // Automatically transition approval state to 'active' once MFA is completed
        if (user.approvalState === 'mfa_pending') {
            await transitionApprovalState(user.id, 'active', user.role, 'MFA WebAuthn enrollment completed');
        }
        return res.json({
            message: 'WebAuthn registered successfully. Account state activated.',
            user: {
                id: user.id,
                approvalState: user.approvalState,
                mfaEnrolled: user.mfaEnrolled,
                mfaType: user.mfaType,
                webauthnHardwareAttested: user.webauthnHardwareAttested
            }
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * POST /api/mfa/totp/setup
 * STRICT SERVER-SIDE ROLE GATING:
 * - Field Submitter: Allowed
 * - Court Authority: STRICTLY FORBIDDEN (WebAuthn only)
 * - Independent Validator: STRICTLY FORBIDDEN (Hardware-Attested WebAuthn only)
 */
mfaRouter.post('/totp/setup', requireAuth, requireApprovedStateForMFA, async (req, res) => {
    try {
        const user = await primaryStore.getUserById(req.userId);
        if (!user)
            return res.status(404).json({ error: 'USER_NOT_FOUND' });
        // STRICT SERVER-SIDE ROLE GATING
        if (user.role === 'court_authority') {
            return res.status(403).json({
                error: 'TOTP_FORBIDDEN_FOR_ROLE',
                message: 'TOTP MFA is strictly forbidden for Court Authority. Role requires WebAuthn biometric or hardware security key.'
            });
        }
        if (user.role === 'independent_validator') {
            return res.status(403).json({
                error: 'TOTP_FORBIDDEN_FOR_ROLE',
                message: 'TOTP MFA is strictly forbidden for Independent Validator. Role requires Hardware-Attested WebAuthn key.'
            });
        }
        const { secret, otpauthUrl } = setupTOTPSecret(user);
        return res.json({ secret, otpauthUrl });
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * POST /api/mfa/totp/verify
 * STRICT SERVER-SIDE ROLE GATING
 */
mfaRouter.post('/totp/verify', requireAuth, requireApprovedStateForMFA, async (req, res) => {
    try {
        const user = await primaryStore.getUserById(req.userId);
        if (!user)
            return res.status(404).json({ error: 'USER_NOT_FOUND' });
        // STRICT SERVER-SIDE ROLE GATING
        if (user.role === 'court_authority' || user.role === 'independent_validator') {
            return res.status(403).json({
                error: 'TOTP_FORBIDDEN_FOR_ROLE',
                message: `TOTP MFA is strictly forbidden for role "${user.role}". Must use WebAuthn.`
            });
        }
        const { secret, token } = req.body;
        if (!secret || !token) {
            return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Secret and token are required.' });
        }
        const success = await verifyAndEnrollTOTP(user, secret, token);
        if (!success) {
            return res.status(400).json({ error: 'INVALID_TOTP_TOKEN', message: 'Invalid TOTP verification code.' });
        }
        // Transition Approval state to 'active'
        if (user.approvalState === 'mfa_pending') {
            await transitionApprovalState(user.id, 'active', user.role, 'MFA TOTP enrollment completed');
        }
        return res.json({
            message: 'TOTP enrolled successfully. Account state activated.',
            user: {
                id: user.id,
                approvalState: user.approvalState,
                mfaEnrolled: user.mfaEnrolled,
                mfaType: user.mfaType
            }
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * POST /api/mfa/attestation/verify
 */
mfaRouter.post('/attestation/verify', requireAuth, async (req, res) => {
    try {
        const { token, platform } = req.body;
        const result = verifyDeviceAttestation(token, platform || 'android');
        auditLedger.appendEvent({
            eventType: 'DEVICE_ATTESTATION_CHECK',
            userId: req.userId,
            userRole: req.userRole,
            details: { platform, valid: result.valid, deviceModel: result.deviceModel }
        });
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
