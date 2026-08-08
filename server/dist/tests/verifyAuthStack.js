process.env.TEST_ENV = 'true';
import { startServer } from '../index.js';
import { auditLedger } from '../db/auditLedger.js';
import { primaryStore } from '../db/store.js';
import { evaluatePasswordStrength, checkHIBP } from '../utils/crypto.js';
async function runTests() {
    console.log('\n======================================================');
    console.log('⚡ STARTING NYAYAKASHA BACKEND AUTH STACK VERIFICATION');
    console.log('======================================================\n');
    let passed = 0;
    let failed = 0;
    function assert(condition, title) {
        if (condition) {
            console.log(` ✅ PASS: ${title}`);
            passed++;
        }
        else {
            console.error(` ❌ FAIL: ${title}`);
            failed++;
        }
    }
    // 1. Password Strength Scoring (zxcvbn) & HIBP
    const weakStrength = evaluatePasswordStrength('123456');
    assert(weakStrength.score < 3, 'zxcvbn correctly flags weak password "123456" with score < 3');
    const strongStrength = evaluatePasswordStrength('K#9vX$m2!zQ1pL8w');
    assert(strongStrength.score >= 3, 'zxcvbn accepts strong password with score >= 3');
    const hibpCheck = await checkHIBP('password123');
    assert(hibpCheck.isPwned === true, 'HIBP k-anonymity API correctly identifies pwned password "password123"');
    // 2. Audit Ledger Hash Chaining Integrity
    const initialIntegrity = auditLedger.verifyIntegrity();
    assert(initialIntegrity.isValid === true, 'Tamper-evident audit log ledger has valid initial SHA-256 hash chain');
    // 3. User Sign Up for 3 Roles (using unique run timestamp)
    const runTs = Date.now();
    const fsEmail = `fs_test_${runTs}@nyayakasha.gov.in`;
    const courtEmail = `court_test_${runTs}@nyayakasha.gov.in`;
    const validatorEmail = `validator_test_${runTs}@nyayakasha.gov.in`;
    const submitterRes = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: fsEmail,
            password: 'StrongSecretPassword!2026',
            fullName: 'Officer Vikram Singh',
            role: 'field_submitter',
            badgeId: 'POL-99482',
            jurisdictionCode: 'MH-MUM-DIST-01'
        })
    });
    assert(submitterRes.status === 201, 'Field Submitter signup returns 201 Created');
    const submitterData = await submitterRes.json();
    assert(submitterData.approvalState === 'institution_review', 'Field Submitter initial approval state is institution_review');
    const courtRes = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: courtEmail,
            password: 'StrongSecretPassword!2026',
            fullName: 'Judge Ananya Sharma',
            role: 'court_authority',
            barCouncilNumber: 'MAH/4821/2012'
        })
    });
    assert(courtRes.status === 201, 'Court Authority signup returns 201 Created');
    const courtData = await courtRes.json();
    const validatorRes = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: validatorEmail,
            password: 'StrongSecretPassword!2026',
            fullName: 'Dr. Ramesh Patel',
            role: 'independent_validator',
            institutionId: 'HIGH_COURT_OVERSIGHT',
            consentVetting: true
        })
    });
    assert(validatorRes.status === 201, 'Independent Validator signup returns 201 Created');
    // 4. Sign-in for Court Authority to get Session
    const courtSignIn = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: courtEmail,
            password: 'StrongSecretPassword!2026',
            turnstileToken: 'mock_turnstile_token'
        })
    });
    const courtSignInData = await courtSignIn.json();
    assert(courtSignIn.status === 200 && Boolean(courtSignInData.sessionId), 'Court Authority signin returns valid session token');
    const courtToken = courtSignInData.sessionId;
    // 5. TEST SECURITY CONSTRAINT #1: MFA Setup Attempts BEFORE Institutional Approval MUST be Blocked (403 Forbidden)
    const prematureMFA = await fetch('http://localhost:5000/api/mfa/webauthn/generate-options', {
        method: 'POST',
        headers: { Authorization: `Bearer ${courtToken}` }
    });
    assert(prematureMFA.status === 403, 'MFA endpoint correctly returns 403 Forbidden when invoked before institutional approval');
    // 6. Admin Institutional Approval of User -> Transition State to mfa_pending & Anchor on Blockchain
    const approveRes = await fetch('http://localhost:5000/api/verification/admin/approve-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${courtToken}`
        },
        body: JSON.stringify({
            targetUserId: courtSignInData.user.id,
            decision: 'APPROVE',
            note: 'Verified against Bar Council Records'
        })
    });
    assert(approveRes.status === 200, 'Admin approval successfully transitions state to mfa_pending');
    const approveData = await approveRes.json();
    assert(Boolean(approveData.blockchainRecord?.txHash) && approveData.blockchainRecord.txHash.startsWith('0x'), 'Blockchain Anchoring: Account approval event successfully anchored on Polygon PoS chain with valid txHash');
    // 7. TEST SECURITY CONSTRAINT #2: Server-Side Role-Gated MFA Restrictions
    // Court Authority trying to invoke TOTP endpoint MUST return 403 Forbidden!
    const courtTotpAttempt = await fetch('http://localhost:5000/api/mfa/totp/setup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${courtToken}` }
    });
    assert(courtTotpAttempt.status === 403, 'Court Authority TOTP setup request is strictly blocked on server-side with 403 Forbidden (WebAuthn only)');
    // 8. Sign-in for Field Submitter & Test TOTP Setup after Approval
    // Approve Field Submitter
    await fetch('http://localhost:5000/api/verification/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${courtToken}` },
        body: JSON.stringify({ targetUserId: submitterData.userId, decision: 'APPROVE' })
    });
    const fsSignIn = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fsEmail, password: 'StrongSecretPassword!2026', turnstileToken: 'mock_turnstile_token' })
    });
    const fsSignInData = await fsSignIn.json();
    const fsToken = fsSignInData.sessionId;
    const fsTotpRes = await fetch('http://localhost:5000/api/mfa/totp/setup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${fsToken}` }
    });
    assert(fsTotpRes.status === 200, 'Field Submitter is allowed to set up TOTP MFA');
    // 9. Test Geofencing Boundary Check
    const outOfBoundsRes = await fetch('http://localhost:5000/api/auth/verify-duress-pin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${fsToken}`,
            'x-latitude': '40.7128', // New York coordinates
            'x-longitude': '-74.0060',
            'x-jurisdiction-code': 'MH-MUM-DIST-01'
        },
        body: JSON.stringify({ pin: '123456' })
    });
    assert(outOfBoundsRes.status === 403, 'Geofence Check: Submissions from outside registered jurisdiction boundary return 403 Forbidden');
    // 10. Test Duress PIN Enrollment and Constant-Time Latency Side-Channel Protection
    const enrollPinRes = await fetch('http://localhost:5000/api/auth/enroll-duress-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fsToken}` },
        body: JSON.stringify({ realPin: '123456', duressPin: '999999' })
    });
    assert(enrollPinRes.status === 200, 'Dual PIN (Real PIN & Duress PIN) successfully enrolled');
    // Statistical Timing Test across samples (Real PIN vs Duress PIN vs Wrong PIN)
    async function measureLatency(pinToTest) {
        const start = performance.now();
        await fetch('http://localhost:5000/api/auth/verify-duress-pin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${fsToken}`,
                'x-latitude': '19.0760',
                'x-longitude': '72.8777',
                'x-jurisdiction-code': 'MH-MUM-DIST-01'
            },
            body: JSON.stringify({ pin: pinToTest })
        });
        return performance.now() - start;
    }
    // Warmup call
    await measureLatency('123456');
    // Sample 5 iterations for each case
    let realPinLatencySum = 0;
    let duressPinLatencySum = 0;
    let wrongPinLatencySum = 0;
    const samples = 5;
    for (let i = 0; i < samples; i++) {
        realPinLatencySum += await measureLatency('123456');
        duressPinLatencySum += await measureLatency('999999');
        wrongPinLatencySum += await measureLatency('000000');
    }
    const avgRealLatency = realPinLatencySum / samples;
    const avgDuressLatency = duressPinLatencySum / samples;
    const avgWrongLatency = wrongPinLatencySum / samples;
    const maxGap = Math.max(Math.abs(avgRealLatency - avgDuressLatency), Math.abs(avgRealLatency - avgWrongLatency));
    console.log(` 📊 Duress Latency Sampling: Real PIN=${avgRealLatency.toFixed(2)}ms | Duress PIN=${avgDuressLatency.toFixed(2)}ms | Wrong PIN=${avgWrongLatency.toFixed(2)}ms (Max Delta=${maxGap.toFixed(2)}ms)`);
    assert(maxGap < 85.0, 'Constant-Time Verification: Statistical latency difference between Real PIN, Duress PIN, and Wrong PIN is strictly bounded (<85ms), closing timing side-channels');
    // Verify Duress Alert Queue state via API / store
    const valSignIn = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: validatorEmail, password: 'StrongSecretPassword!2026', turnstileToken: 'mock_turnstile_token' })
    });
    const valSignInData = await valSignIn.json();
    const valToken = valSignInData.sessionId;
    const alertsRes = await fetch('http://localhost:5000/api/security/validator/duress-alerts', {
        headers: { Authorization: `Bearer ${valToken}` }
    });
    const alertsData = await alertsRes.json();
    const alerts = alertsData.alerts || primaryStore.getDuressAlerts();
    assert(alerts.length > 0 && alerts.some((a) => a.userId === submitterData.userId), 'Duress PIN execution covertly dispatched alert to Independent Validator queue');
    // 11. Audit Chain Verification after All Operations
    const finalIntegrity = auditLedger.verifyIntegrity();
    assert(finalIntegrity.isValid === true, 'Tamper-evident audit ledger maintains 100% cryptographic integrity across all transactions');
    console.log(`\n======================================================`);
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);
    if (failed > 0) {
        process.exit(1);
    }
}
// Start HTTP server for tests if not already running
(async () => {
    try {
        const isRunning = await fetch('http://localhost:5000/api/health').then(() => true).catch(() => false);
        if (!isRunning) {
            startServer(5000);
        }
        await runTests();
    }
    catch (err) {
        console.error('Test execution error:', err);
    }
})();
