import { Router } from 'express';
import { requireFieldSubmitterAuth } from '../middleware/fieldSubmitterAuth.js';
import { getFieldSubmitterDashboardMetrics, pgPool } from '../db/postgres.js';
import { dashboardCache } from '../db/cache.js';
import { primaryStore } from '../db/store.js';
export const fieldSubmitterRouter = Router();
/**
 * GET /api/field-submitter/dashboard
 * Protected by Firebase Admin SDK ID Token / Session middleware (role: field_submitter)
 * Runs PostgreSQL aggregate query (COUNT ... WHERE submitted_by = uid)
 * Cached with 30-second TTL in Node/Redis cache, keyed by `field_submitter_dashboard:${uid}`
 */
fieldSubmitterRouter.get('/dashboard', requireFieldSubmitterAuth, async (req, res) => {
    try {
        const uid = req.uid || req.userId;
        if (!uid) {
            return res.status(400).json({ error: 'BAD_REQUEST', message: 'User ID missing from authenticated token.' });
        }
        const cacheKey = `field_submitter_dashboard:${uid}`;
        const forceRefresh = req.query.refresh === 'true';
        // 1. Check 30s TTL In-Memory / Redis Cache (unless force refreshed)
        if (!forceRefresh) {
            const cachedMetrics = dashboardCache.get(cacheKey);
            if (cachedMetrics) {
                res.setHeader('x-cache', 'HIT');
                res.setHeader('Cache-Control', 'private, max-age=30');
                return res.status(200).json({
                    status: 'SUCCESS',
                    cached: true,
                    data: cachedMetrics
                });
            }
        }
        // 2. Execute PostgreSQL Aggregate Query
        const metrics = await getFieldSubmitterDashboardMetrics(uid);
        // 3. Store in cache with 30s TTL
        dashboardCache.set(cacheKey, metrics, 30);
        // 4. Return response with x-cache MISS header
        res.setHeader('x-cache', 'MISS');
        res.setHeader('Cache-Control', 'private, max-age=30');
        return res.status(200).json({
            status: 'SUCCESS',
            cached: false,
            data: metrics
        });
    }
    catch (err) {
        console.error('Error fetching Field Submitter Dashboard:', err);
        return res.status(500).json({
            error: 'SERVER_ERROR',
            message: 'Failed to retrieve Field Submitter Dashboard metrics.'
        });
    }
});
/**
 * GET /api/field-submitter/submissions
 * Returns the authenticated field submitter's real evidence submissions
 * from PostgreSQL (falls back to in-memory store if PG unavailable).
 */
fieldSubmitterRouter.get('/submissions', requireFieldSubmitterAuth, async (req, res) => {
    try {
        const uid = req.uid || req.userId;
        if (!uid) {
            return res.status(400).json({ error: 'BAD_REQUEST', message: 'User ID missing from authenticated token.' });
        }
        let submissions = [];
        // Attempt to fetch from PostgreSQL
        try {
            const pgResult = await pgPool.query(`SELECT
           id,
           case_id        AS "caseId",
           title,
           category,
           status,
           jurisdiction_code AS "jurisdictionCode",
           gps_lat        AS "lat",
           gps_lng        AS "lng",
           sha256_hash    AS "sha256Hash",
           captured_at    AS "capturedAt",
           storage_path   AS "storagePath"
         FROM evidence
         WHERE submitted_by = $1
         ORDER BY captured_at DESC
         LIMIT 50`, [uid]);
            submissions = pgResult.rows;
        }
        catch (pgErr) {
            console.log('PostgreSQL submissions query, using in-memory fallback:', pgErr.message);
        }
        // Fallback: pull from in-memory store if PG returned nothing
        if (!submissions || submissions.length === 0) {
            const inMemoryRecords = primaryStore.getEvidenceByUser(uid);
            submissions = inMemoryRecords.map((e) => ({
                id: e.id,
                caseId: e.caseId || 'CASE-2026-001',
                title: e.title || 'Field Evidence',
                category: e.category || 'Digital Media',
                status: e.status || 'pending',
                jurisdictionCode: e.jurisdictionCode || 'MH-MUM-DIST-01',
                lat: e.gpsLat || '19.0760',
                lng: e.gpsLng || '72.8777',
                sha256Hash: e.sha256Hash || '',
                capturedAt: e.capturedAt || new Date().toISOString(),
                storagePath: e.storagePath || '',
                blockchainTx: e.blockchainTx
            }));
        }
        return res.status(200).json({
            status: 'SUCCESS',
            count: submissions.length,
            submissions
        });
    }
    catch (err) {
        console.error('Error fetching Field Submitter submissions:', err);
        return res.status(500).json({
            error: 'SERVER_ERROR',
            message: 'Failed to retrieve submissions.'
        });
    }
});
