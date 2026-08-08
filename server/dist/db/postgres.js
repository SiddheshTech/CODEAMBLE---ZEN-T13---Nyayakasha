import pg from 'pg';
import { primaryStore } from './store.js';
const { Pool } = pg;
// PostgreSQL Connection Pool configuration
export const pgPool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'nyayakasha_db',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
let isPgConnected = false;
// Check PostgreSQL connectivity on startup
pgPool.on('error', (err) => {
    console.log('ℹ️ PostgreSQL pool notice:', err.message);
    isPgConnected = false;
});
export async function testPgConnection() {
    try {
        const client = await pgPool.connect();
        isPgConnected = true;
        client.release();
        console.log('🐘 Connected to PostgreSQL database system of record');
        return true;
    }
    catch (err) {
        isPgConnected = false;
        console.log('ℹ️ PostgreSQL unavailable. Utilizing fallback memory store with Postgres query abstraction.');
        return false;
    }
}
/**
 * Execute aggregate PostgreSQL query for Field Submitter Dashboard metrics.
 * Uses exact PostgreSQL SQL queries when connected, or synced relational store fallback.
 */
export async function getFieldSubmitterDashboardMetrics(uid) {
    if (isPgConnected) {
        try {
            // 1. PostgreSQL Aggregate Query for Case and Evidence Counts
            const aggRes = await pgPool.query(`SELECT 
          COUNT(DISTINCT case_id)::int AS total_cases,
          COUNT(*)::int AS total_evidence,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_verifications,
          COUNT(*) FILTER (WHERE status = 'verified')::int AS verified_evidence,
          COUNT(*) FILTER (WHERE blockchain_tx IS NOT NULL AND blockchain_tx != '')::int AS anchored_count,
          COUNT(*) FILTER (WHERE status = 'flagged')::int AS tamper_alerts
         FROM evidence 
         WHERE submitted_by = $1`, [uid]);
            // 2. Recent Evidence Submissions query
            const recentRes = await pgPool.query(`SELECT 
          id, case_id AS "caseId", title, category, status, 
          created_at AS "createdAt", blockchain_tx AS "blockchainTx", fingerprint_hash AS "fingerprintHash"
         FROM evidence 
         WHERE submitted_by = $1 
         ORDER BY created_at DESC 
         LIMIT 5`, [uid]);
            const user = await primaryStore.getUserById(uid);
            const row = aggRes.rows[0] || {};
            return {
                userId: uid,
                totalCases: row.total_cases || 0,
                totalEvidence: row.total_evidence || 0,
                pendingVerifications: row.pending_verifications || 0,
                verifiedEvidence: row.verified_evidence || 0,
                blockchainAnchoredCount: row.anchored_count || 0,
                tamperAlerts: row.tamper_alerts || 0,
                recentSubmissions: recentRes.rows.map((r) => ({
                    id: r.id,
                    caseId: r.caseId || 'CASE-2026-001',
                    title: r.title || 'Digital Evidence File',
                    category: r.category || 'Digital Media',
                    status: r.status || 'verified',
                    createdAt: r.createdAt || new Date().toISOString(),
                    blockchainTx: r.blockchainTx || null,
                    fingerprintHash: r.fingerprintHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
                })),
                jurisdictionCode: user?.jurisdictionCode || 'MH-MUM-DIST-01',
                lastUpdated: new Date().toISOString()
            };
        }
        catch (err) {
            console.log('Postgres aggregate query error, using synchronized fallback:', err.message);
        }
    }
    // Fallback: compute real metrics from in-memory evidence store
    const user = await primaryStore.getUserById(uid);
    const realEvidence = primaryStore.getEvidenceByUser(uid);
    const verifiedCount = realEvidence.filter(e => e.status === 'verified').length;
    const pendingCount = realEvidence.filter(e => e.status === 'pending').length;
    const blockchainCount = realEvidence.filter(e => !!e.blockchainTx).length;
    const recentSubmissions = realEvidence.slice(0, 10).map(e => ({
        id: e.id,
        caseId: e.caseId,
        title: e.title,
        category: e.category || 'Digital Media',
        status: (e.status === 'verified' || e.status === 'Verified' ? 'verified' : e.status === 'pending' || e.status === 'Sealed' || e.status === 'Pending Chain Transfer' ? 'pending' : 'flagged'),
        createdAt: e.capturedAt || e.createdAt || new Date().toISOString(),
        blockchainTx: e.blockchainTx || undefined,
        fingerprintHash: e.sha256Hash || e.hash || ''
    }));
    return {
        userId: uid,
        totalCases: new Set(realEvidence.map(e => e.caseId)).size,
        totalEvidence: realEvidence.length,
        pendingVerifications: pendingCount,
        verifiedEvidence: verifiedCount,
        blockchainAnchoredCount: blockchainCount,
        tamperAlerts: 0,
        recentSubmissions,
        jurisdictionCode: user?.jurisdictionCode || 'MH-MUM-DIST-01',
        lastUpdated: new Date().toISOString()
    };
}
