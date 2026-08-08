import admin from 'firebase-admin';
import { sessionStore } from '../db/redis.js';
import { primaryStore } from '../db/store.js';
/**
 * Auth Middleware for Field Submitter endpoints.
 * 1. Checks `Authorization: Bearer <token>` header.
 * 2. Attempts Firebase Admin SDK ID token verification (`verifyIdToken`).
 *    Extracts `uid` and custom claim `role: 'field_submitter'`.
 * 3. Falls back seamlessly to active session store (`sessionStore`) for local test suites / sessions.
 * 4. Strictly enforces that role must be `field_submitter`. Rejects with 401/403 appropriately.
 */
export async function requireFieldSubmitterAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'UNAUTHORIZED',
            message: 'Missing or malformed Bearer authorization token.'
        });
    }
    const token = authHeader.split(' ')[1];
    // Strategy 1: Firebase Admin SDK ID Token Verification
    try {
        const adminApps = admin.apps || admin.default?.apps;
        if (adminApps && adminApps.length > 0) {
            const authObj = typeof admin.auth === 'function' ? admin.auth() : admin.default?.auth();
            if (authObj && typeof authObj.verifyIdToken === 'function') {
                const decodedToken = await authObj.verifyIdToken(token);
                const role = (decodedToken.role || decodedToken.customClaims?.role);
                // Extract UID and verify role
                const uid = decodedToken.uid;
                const userRecord = await primaryStore.getUserById(uid);
                const effectiveRole = role || userRecord?.role;
                if (effectiveRole !== 'field_submitter') {
                    return res.status(403).json({
                        error: 'FORBIDDEN',
                        message: 'Access denied. Field Submitter role required (custom claim role: field_submitter).'
                    });
                }
                req.uid = uid;
                req.userId = uid;
                req.userRole = 'field_submitter';
                req.userEmail = decodedToken.email;
                return next();
            }
        }
    }
    catch (firebaseErr) {
        // If Firebase token verification fails or Firebase is not initialized, proceed to Session store fallback
    }
    // Strategy 2: Session Store Fallback (for API key / session token workflows)
    const session = await sessionStore.getSession(token);
    if (session) {
        if (session.role !== 'field_submitter') {
            return res.status(403).json({
                error: 'FORBIDDEN',
                message: 'Access denied. Requires role: field_submitter'
            });
        }
        req.uid = session.userId;
        req.userId = session.userId;
        req.userRole = session.role;
        req.userEmail = session.email || (await primaryStore.getUserById(session.userId))?.email;
        return next();
    }
    return res.status(401).json({
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired Firebase ID token / session.'
    });
}
