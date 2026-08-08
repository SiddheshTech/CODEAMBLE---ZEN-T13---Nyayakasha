import { Request, Response, NextFunction } from 'express';
import { sessionStore, UserSession } from '../db/redis.js';
import { UserRole } from '../db/store.js';

export interface AuthenticatedRequest extends Request {
  session?: UserSession;
  userId?: string;
  userRole?: UserRole;
}

/**
 * Require valid authenticated session
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or malformed Bearer authorization token.' });
  }

  const sessionId = authHeader.split(' ')[1];
  const session = await sessionStore.getSession(sessionId);

  if (!session) {
    return res.status(401).json({ error: 'SESSION_EXPIRED', message: 'Session expired or invalidated.' });
  }

  req.session = session;
  req.userId = session.userId;
  req.userRole = session.role;
  next();
}

/**
 * Require specific user role(s)
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
}
