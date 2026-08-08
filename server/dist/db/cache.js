/**
 * High-performance In-Memory Cache with Redis compatibility layer.
 * Implements strict Time-To-Live (TTL) expiration (default 30s for Field Submitter Dashboard).
 */
class DashboardCacheStore {
    cache = new Map();
    /**
     * Fetch item from cache by key if not expired.
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    /**
     * Store item in cache with specified TTL in seconds (default 30s).
     */
    set(key, value, ttlSeconds = 30) {
        const expiresAt = Date.now() + ttlSeconds * 1000;
        this.cache.set(key, { value, expiresAt });
    }
    /**
     * Delete entry by key.
     */
    del(key) {
        this.cache.delete(key);
    }
    /**
     * Clear all entries.
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Get total active non-expired keys count.
     */
    get size() {
        const now = Date.now();
        let active = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now <= entry.expiresAt) {
                active++;
            }
            else {
                this.cache.delete(key);
            }
        }
        return active;
    }
}
export const dashboardCache = new DashboardCacheStore();
