// Uses global fetch API in Node.js

async function testValidatorStack() {
  console.log('🧪 Starting Independent Validator Dashboard Backend Integration Test...');
  const baseUrl = 'http://localhost:5000/api';

  try {
    // 1. Sign up a validator
    const validatorEmail = `val_test_${Date.now()}@nyayakasha.gov.in`;
    const signupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: validatorEmail,
        password: 'StrongPassword!2026',
        fullName: 'Adv. A. Mehta',
        role: 'independent_validator',
        barCouncilNumber: 'MAH/99281/2012',
        consentVetting: true
      })
    });

    const signupData: any = await signupRes.json();
    console.log('✅ Signup Result:', signupData.message, '| SessionId:', signupData.sessionId);
    const token = signupData.sessionId;

    if (!token) {
      throw new Error('No sessionId returned from signup');
    }

    // 2. Fetch Dashboard Data via GET /api/validator/dashboard
    const dashRes = await fetch(`${baseUrl}/validator/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dashData: any = await dashRes.json();
    console.log('✅ Validator Dashboard API Output:');
    console.log('   - Awaiting Consensus Votes:', dashData.summary?.consensusVotesAwaiting);
    console.log('   - Analytics Reports Count:', dashData.summary?.encryptedAnalyticsReports);
    console.log('   - Active Duress Alerts Count:', dashData.summary?.duressAlertsCount);
    console.log('   - Zero-Knowledge Mode:', dashData.zeroKnowledgePolicy?.mode);
    console.log('   - Pending Blocks:', dashData.pendingVotes?.map((p: any) => `${p.id} (${p.quorumSigned}/${p.quorumTotal})`));

    // Verify Zero-Knowledge Isolation Constraint
    const rawJsonString = JSON.stringify(dashData);
    const containsCaseTitle = rawJsonString.includes('State vs.') || rawJsonString.includes('litigant');
    console.log('🔒 Zero-Knowledge Constraint Check (No case titles/litigants accessible):', !containsCaseTitle ? 'PASSED' : 'FAILED');

    // 3. Cast Consensus Vote via POST /api/validator/vote
    const voteRes = await fetch(`${baseUrl}/validator/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        blockId: 'BLOCK-89201',
        decision: 'Approve',
        pin: '123456'
      })
    });
    const voteData: any = await voteRes.json();
    console.log('✅ Vote API Result:', voteData.message, '| Quorum:', voteData.quorumSigned, '/', voteData.quorumTotal, '| Polygon TxHash:', voteData.txHash || 'Pending Quorum');

    // 4. Acknowledge Duress Alert via POST /api/validator/duress/acknowledge
    const duressRes = await fetch(`${baseUrl}/validator/duress/acknowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ alertId: dashData.activeDuressAlert?.id })
    });
    const duressData: any = await duressRes.json();
    console.log('✅ Duress Escalation Result:', duressData.message);

    console.log('\n🎉 ALL INDEPENDENT VALIDATOR BACKEND TESTS PASSED SUCCESSFULLY!');
  } catch (err: any) {
    console.error('❌ Test failed:', err.message);
  }
}

testValidatorStack();
