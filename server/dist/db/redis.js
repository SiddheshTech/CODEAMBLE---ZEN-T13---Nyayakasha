// In-Memory Session & Cache Store (Redis Proxy)
class MemoryRedisStore {
    sessions = new Map();
    userSessionIndex = new Map(); // userId -> Set of sessionIds
    invalidTokens = new Set();
    rateLimitCounters = new Map();
    // Role TTLs: Field Submitter = 30 min (1800s), Court = 15 min (900s), Validator = 15 min (900s)
    getRoleTTL(role) {
        if (role === 'field_submitter')
            return 1800; // 30 minutes
        return 900; // 15 minutes for court_authority and independent_validator
    }
    async setSession(session) {
        const ttlSeconds = this.getRoleTTL(session.role);
        const expiresAt = Date.now() + ttlSeconds * 1000;
        this.sessions.set(session.sessionId, { session, expiresAt });
        if (!this.userSessionIndex.has(session.userId)) {
            this.userSessionIndex.set(session.userId, new Set());
        }
        this.userSessionIndex.get(session.userId).add(session.sessionId);
    }
    async getSession(sessionId) {
        const record = this.sessions.get(sessionId);
        if (!record)
            return null;
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
    async deleteSession(sessionId) {
        const record = this.sessions.get(sessionId);
        if (record) {
            const userSessions = this.userSessionIndex.get(record.session.userId);
            if (userSessions) {
                userSessions.delete(sessionId);
            }
            this.sessions.delete(sessionId);
        }
    }
    async getUserSessions(userId) {
        const sessionIds = this.userSessionIndex.get(userId);
        if (!sessionIds)
            return [];
        const activeSessions = [];
        for (const sid of Array.from(sessionIds)) {
            const sess = await this.getSession(sid);
            if (sess) {
                activeSessions.push(sess);
            }
        }
        return activeSessions;
    }
    async revokeAllUserSessions(userId, exceptSessionId) {
        const sessionIds = this.userSessionIndex.get(userId);
        if (!sessionIds)
            return 0;
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
    async invalidateToken(jti, ttlSeconds = 86400) {
        this.invalidTokens.add(jti);
    }
    async isTokenInvalidated(jti) {
        return this.invalidTokens.has(jti);
    }
    // Rate Limiting helper
    async incrementRateLimit(key, windowSeconds) {
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
