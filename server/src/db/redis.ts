import { ENV } from '../config/env.js';

export interface UserSession {
  sessionId: string;
  userId: string;
  role: 'field_submitter' | 'court_authority' | 'independent_validator';
  createdAt: number;
  lastAccessAt: number;
  ipAddress: string;
  userAgent: string;
  isDuressSession?: boolean;
}

// In-Memory Session & Cache Store (Redis Proxy)
class MemoryRedisStore {
  private sessions = new Map<string, { session: UserSession; expiresAt: number }>();
  private userSessionIndex = new Map<string, Set<string>>(); // userId -> Set of sessionIds
  private invalidTokens = new Set<string>();
  private rateLimitCounters = new Map<string, { count: number; expiresAt: number }>();

  // Role TTLs: Field Submitter = 30 min (1800s), Court = 15 min (900s), Validator = 15 min (900s)
  public getRoleTTL(role: 'field_submitter' | 'court_authority' | 'independent_validator'): number {
    if (role === 'field_submitter') return 1800; // 30 minutes
    return 900; // 15 minutes for court_authority and independent_validator
  }

  public async setSession(session: UserSession): Promise<void> {
    const ttlSeconds = this.getRoleTTL(session.role);
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.sessions.set(session.sessionId, { session, expiresAt });

    if (!this.userSessionIndex.has(session.userId)) {
      this.userSessionIndex.set(session.userId, new Set());
    }
    this.userSessionIndex.get(session.userId)!.add(session.sessionId);
  }

  public async getSession(sessionId: string): Promise<UserSession | null> {
    const record = this.sessions.get(sessionId);
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      this.deleteSession(sessionId);
      return null;
    }
    // Refresh last access & extend TTL
    record.session.lastAccessAt = Date.now();
    const ttlSeconds = this.getRoleTTL(record.session.role);
    record.expiresAt = Date.now() + ttlSeconds * 1000;
    return record.session;
  }

  public async deleteSession(sessionId: string): Promise<void> {
    const record = this.sessions.get(sessionId);
    if (record) {
      const userSessions = this.userSessionIndex.get(record.session.userId);
      if (userSessions) {
        userSessions.delete(sessionId);
      }
      this.sessions.delete(sessionId);
    }
  }

  public async getUserSessions(userId: string): Promise<UserSession[]> {
    const sessionIds = this.userSessionIndex.get(userId);
    if (!sessionIds) return [];

    const activeSessions: UserSession[] = [];
    for (const sid of Array.from(sessionIds)) {
      const sess = await this.getSession(sid);
      if (sess) {
        activeSessions.push(sess);
      }
    }
    return activeSessions;
  }

  public async revokeAllUserSessions(userId: string, exceptSessionId?: string): Promise<number> {
    const sessionIds = this.userSessionIndex.get(userId);
    if (!sessionIds) return 0;

    let revokedCount = 0;
    for (const sid of Array.from(sessionIds)) {
      if (sid !== exceptSessionId) {
        await this.deleteSession(sid);
        revokedCount++;
      }
    }
    return revokedCount;
  }

  // Token invalidation for single-use JWTs
  public async invalidateToken(jti: string, ttlSeconds: number = 86400): Promise<void> {
    this.invalidTokens.add(jti);
  }

  public async isTokenInvalidated(jti: string): Promise<boolean> {
    return this.invalidTokens.has(jti);
  }

  // Rate Limiting helper
  public async incrementRateLimit(key: string, windowSeconds: number): Promise<number> {
    const now = Date.now();
    const record = this.rateLimitCounters.get(key);
    if (!record || now > record.expiresAt) {
      this.rateLimitCounters.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
      return 1;
    }
    record.count += 1;
    return record.count;
  }
}

export const sessionStore = new MemoryRedisStore();
