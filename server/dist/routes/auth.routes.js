import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { primaryStore } from '../db/store.js';
import { sessionStore } from '../db/redis.js';
import { auditLedger } from '../db/auditLedger.js';
import { hashPassword, verifyPassword, checkHIBP, evaluatePasswordStrength } from '../utils/crypto.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { verifyJurisdictionGeofence } from '../middleware/geofence.js';
import { setDualPins, verifyPinAndHandleDuress } from '../services/duress.service.js';
import { requireAuth } from '../middleware/roleGuard.js';
import { crossCheckInstitutionalRegistry, queueValidatorVetting } from '../services/verification.service.js';
export const authRouter = Router();
/**
 * POST /api/auth/signup
 */
authRouter.post('/signup', async (req, res) => {
    try {
        const { email, password, fullName, role, inviteToken, publicKeyPem, badgeId, barCouncilNumber, institutionId, jurisdictionCode, consentVetting } = req.body;
        if (!email || !password || !fullName || !role) {
            return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email, password, fullName, and role are required.' });
        }
        const validRoles = ['field_submitter', 'court_authority', 'independent_validator'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'INVALID_ROLE', message: `Role must be one of: ${validRoles.join(', ')}` });
        }
        // Verify Invite Link JWT if provided or required
        if (inviteToken) {
            try {
                const decoded = jwt.verify(inviteToken, ENV.JWT_SECRET);
                if (decoded.jti && (await sessionStore.isTokenInvalidated(decoded.jti))) {
                    return res.status(400).json({ error: 'INVITE_LINK_USED', message: 'This invite link has already been used.' });
                }
                // Invalidate token in Redis
                if (decoded.jti)
                    await sessionStore.invalidateToken(decoded.jti);
            }
            catch (err) {
                return res.status(400).json({ error: 'INVALID_INVITE_TOKEN', message: 'Invite token is invalid or expired.' });
            }
        }
        // Check if user already exists
        const existing = await primaryStore.getUserByEmail(email);
        if (existing) {
            return res.status(409).json({ error: 'USER_EXISTS', message: 'An account with this email address already exists.' });
        }
        // Evaluate Password Strength (zxcvbn)
        const strength = evaluatePasswordStrength(password, [email, fullName]);
        if (strength.score < 3) {
            return res.status(400).json({
                error: 'WEAK_PASSWORD',
                message: 'Password strength insufficient. Minimum zxcvbn score 3 required.',
                strengthFeedback: strength
            });
        }
        // Have I Been Pwned K-Anonymity Check
        const hibp = await checkHIBP(password);
        if (hibp.isPwned) {
            return res.status(400).json({
                error: 'PASSWORD_PWNED',
                message: `This password was found in ${hibp.count} public data breaches (HIBP check). Please select a unique, non-compromised password.`
            });
        }
        // Hash Password with Argon2id
        const passwordHash = await hashPassword(password);
        const newUser = {
            id: `usr_${role}_${Date.now()}`,
            email,
            fullName,
            role: role,
            passwordHash,
            publicKeyPem, // Client-side generated public key stored on server
            badgeId,
            barCouncilNumber,
            institutionId,
            jurisdictionCode,
            approvalState: 'submitted',
            stateHistory: [{ state: 'submitted', timestamp: new Date().toISOString(), note: 'Account signup submitted' }],
            institutionVerified: false,
            vettingApproved: false,
            mfaEnrolled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await primaryStore.saveUser(newUser);
        // Trigger Initial Institutional Registry Check
        await crossCheckInstitutionalRegistry(newUser);
        // If Validator, queue for committee vetting
        if (role === 'independent_validator') {
            await queueValidatorVetting(newUser.id, Boolean(consentVetting));
        }
        auditLedger.appendEvent({
            eventType: 'USER_SIGNUP',
            userId: newUser.id,
            userRole: newUser.role,
            details: { email: newUser.email, approvalState: newUser.approvalState }
        });
        return res.status(201).json({
            message: 'Signup successful. Institutional verification initiated.',
            userId: newUser.id,
            approvalState: newUser.approvalState,
            institutionVerified: newUser.institutionVerified
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * POST /api/auth/signin
 */
authRouter.post('/signin', loginRateLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
        if (!email || !password) {
            return res.status(400).json({ error: 'MISSING_CREDENTIALS', message: 'Email and password are required.' });
        }
        const user = await primaryStore.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
        }
        // Verify Argon2id / PBKDF2 Password
        const isPasswordValid = await verifyPassword(password, user.passwordHash);
        if (!isPasswordValid) {
            auditLedger.appendEvent({
                eventType: 'AUTH_FAILED',
                userId: user.id,
                userRole: user.role,
                ipAddress: clientIp,
                details: { reason: 'INVALID_PASSWORD' }
            });
            return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
        }
        // Check Approval State
        if (user.approvalState === 'rejected') {
            return res.status(403).json({ error: 'ACCOUNT_REJECTED', message: 'Your institutional verification or vetting was rejected.' });
        }
        // Create Server-Side Session in Redis Store
        const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const session = {
            sessionId,
            userId: user.id,
            role: user.role,
            createdAt: Date.now(),
            lastAccessAt: Date.now(),
            ipAddress: clientIp,
            userAgent: req.headers['user-agent'] || 'unknown'
        };
        await sessionStore.setSession(session);
        auditLedger.appendEvent({
            eventType: 'AUTH_SUCCESS',
            userId: user.id,
            userRole: user.role,
            ipAddress: clientIp,
            details: { sessionId, approvalState: user.approvalState }
        });
        return res.json({
            message: 'Authentication successful.',
            sessionId,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                approvalState: user.approvalState,
                mfaEnrolled: user.mfaEnrolled,
                mfaType: user.mfaType,
                publicKeyPem: user.publicKeyPem
            }
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * POST /api/auth/enroll-duress-pin
 */
authRouter.post('/enroll-duress-pin', requireAuth, async (req, res) => {
    try {
        const { realPin, duressPin } = req.body;
        if (!realPin || !duressPin) {
            return res.status(400).json({ error: 'MISSING_PINS', message: 'Both realPin and duressPin are required.' });
        }
        if (realPin === duressPin) {
            return res.status(400).json({ error: 'PINS_MATCH', message: 'Duress PIN must be different from Real PIN.' });
        }
        const user = await primaryStore.getUserById(req.userId);
        if (!user)
            return res.status(444).json({ error: 'USER_NOT_FOUND' });
        // Enroll Dual PINs
        await setDualPins(user, realPin, duressPin);
        return res.json({ message: 'Real PIN and Duress PIN enrolled successfully in indistinguishable schema.' });
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * POST /api/auth/verify-duress-pin
 */
authRouter.post('/verify-duress-pin', requireAuth, verifyJurisdictionGeofence, async (req, res) => {
    try {
        const { pin, locationInfo } = req.body;
        const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
        const user = await primaryStore.getUserById(req.userId);
        if (!user)
            return res.status(404).json({ error: 'USER_NOT_FOUND' });
        const result = await verifyPinAndHandleDuress(user, pin, clientIp, locationInfo);
        if (!result.isMatch) {
            return res.status(401).json({ error: 'INVALID_PIN', message: 'PIN verification failed.' });
        }
        // Regardless of real or duress PIN match, return indistinguishable successful response structure
        return res.json({
            success: true,
            verified: true,
            sessionStatus: 'ACTIVE',
            message: 'PIN authorization verified successfully.'
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * POST /api/auth/invite/generate
 */
authRouter.post('/invite/generate', requireAuth, async (req, res) => {
    try {
        const { recipientEmail, targetRole, expiryHours = 24 } = req.body;
        const jti = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const token = jwt.sign({
            jti,
            recipientEmail,
            targetRole,
            issuerId: req.userId
        }, ENV.JWT_SECRET, { expiresIn: `${expiryHours}h` });
        auditLedger.appendEvent({
            eventType: 'INVITE_LINK_GENERATED',
            userId: req.userId,
            userRole: req.userRole,
            details: { recipientEmail, targetRole, jti }
        });
        return res.json({ inviteToken: token, jti, expiryHours });
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
/**
 * POST /api/auth/logout
 */
authRouter.post('/logout', requireAuth, async (req, res) => {
    try {
        await sessionStore.deleteSession(req.session.sessionId);
        auditLedger.appendEvent({
            eventType: 'USER_LOGOUT',
            userId: req.userId,
            userRole: req.userRole,
            details: { sessionId: req.session.sessionId }
        });
        return res.json({ message: 'Session logged out and invalidated successfully.' });
    }
    catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
});
