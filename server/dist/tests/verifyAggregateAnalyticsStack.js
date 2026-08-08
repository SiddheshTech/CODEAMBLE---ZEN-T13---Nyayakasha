import http from 'http';
function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode || 500, body: JSON.parse(data) });
                }
                catch {
                    resolve({ status: res.statusCode || 500, body: data });
                }
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}
async function runVerification() {
    console.log('===========================================================');
    console.log('🧪 VERIFYING AGGREGATE ANALYTICS & DIFFERENTIAL PRIVACY STACK');
    console.log('===========================================================');
    // Step 1: GET /api/analytics/overview
    console.log('\n--- STEP 1: Fetch Aggregate Analytics Overview Metrics ---');
    const overviewRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/analytics/overview',
        method: 'GET'
    });
    console.log('HTTP Status:', overviewRes.status);
    console.log('Overview Metrics:', overviewRes.body.metrics);
    console.log('Reports Count:', overviewRes.body.reports?.length);
    if (overviewRes.status !== 200 || !overviewRes.body.success) {
        throw new Error('FAILED Step 1: Overview endpoint failed');
    }
    // Step 2: GET /api/analytics/reports/FHE-AGG-2026-002
    console.log('\n--- STEP 2: Fetch Specific Encrypted Report (FHE-AGG-2026-002) ---');
    const reportRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/analytics/reports/FHE-AGG-2026-002',
        method: 'GET'
    });
    console.log('HTTP Status:', reportRes.status);
    console.log('Report Title:', reportRes.body.report?.title);
    console.log('Anomaly Score:', reportRes.body.report?.anomalyScore, '%');
    if (reportRes.status !== 200 || !reportRes.body.report) {
        throw new Error('FAILED Step 2: Report fetch endpoint failed');
    }
    // Step 3: Test Validation - POST /api/analytics/reports/FHE-RPT-102/escalate with empty rationale
    console.log('\n--- STEP 3: Test Validation Enforcement (Empty Rationale) ---');
    const invalidEscalateRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/analytics/reports/FHE-RPT-102/escalate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { rationale: '' });
    console.log('HTTP Status (Expected 400):', invalidEscalateRes.status);
    console.log('Error Code:', invalidEscalateRes.body.errorCode);
    if (invalidEscalateRes.status !== 400 || invalidEscalateRes.body.errorCode !== 'RATIONALE_REQUIRED') {
        throw new Error('FAILED Step 3: Empty rationale validation check failed');
    }
    // Step 4: POST /api/analytics/reports/FHE-RPT-102/escalate with valid rationale
    console.log('\n--- STEP 4: Submit Formal Oversight Inquiry Escalation ---');
    const validEscalateRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/analytics/reports/FHE-RPT-102/escalate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        rationale: 'Statistical duration deviation of +128% in Zone 4 West Special Tribunal exceeds homomorphic baseline limits; requires external enclave verification.',
        category: 'Spike in Case Duration',
        validatorName: 'Adv. A. Mehta (Independent Validator)'
    });
    console.log('HTTP Status:', validEscalateRes.status);
    console.log('Escalation Ticket ID:', validEscalateRes.body.ticketId);
    console.log('Escalated Report Status:', validEscalateRes.body.report?.escalationStatus);
    if (validEscalateRes.status !== 200 || !validEscalateRes.body.ticketId) {
        throw new Error('FAILED Step 4: Escalation submission failed');
    }
    // Step 5: Verify Updated Oversight Escalations Count in Overview
    console.log('\n--- STEP 5: Verify Updated Oversight Escalation Count ---');
    const updatedOverviewRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/analytics/overview',
        method: 'GET'
    });
    console.log('Updated Oversight Escalations Count:', updatedOverviewRes.body.metrics?.oversightEscalations);
    if (updatedOverviewRes.body.metrics?.oversightEscalations !== 1) {
        throw new Error('FAILED Step 5: Oversight escalations metric count did not increment');
    }
    console.log('\n===========================================================');
    console.log('SUCCESS: AGGREGATE ANALYTICS & DIFFERENTIAL PRIVACY STACK FULLY VERIFIED');
    console.log('===========================================================');
}
runVerification().catch((err) => {
    console.error('❌ Verification script failed:', err);
    process.exit(1);
});
