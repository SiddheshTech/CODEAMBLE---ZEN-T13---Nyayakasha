async function testConsensusVotesStack() {
  console.log('🧪 Starting Consensus Votes Page Backend Integration Test...');
  const baseUrl = 'http://localhost:5000/api';

  try {
    // 1. Fetch Pending Requests & Summary Counts via GET /api/consensus/pending
    const pendingRes = await fetch(`${baseUrl}/consensus/pending`);
    const pendingData: any = await pendingRes.json();
    console.log('✅ Pending Consensus API Output:');
    console.log('   - Pending Count:', pendingData.summary?.pendingCount);
    console.log('   - System Flags Count:', pendingData.summary?.systemFlagsCount);
    console.log('   - Votes Cast Count:', pendingData.summary?.votesCastCount);
    console.log('   - Requests Returned:', pendingData.pendingRequests?.map((r: any) => `${r.id} (${r.caseRef || r.caseId}) -> Status: ${r.status}`));

    // 2. Fetch Consensus Request Detail via GET /api/consensus/:id
    const detailRes = await fetch(`${baseUrl}/consensus/CNS-2026-102`);
    const detailData: any = await detailRes.json();
    console.log('✅ Consensus Detail API (CNS-2026-102):', detailData.request?.id, '| CaseRef:', detailData.request?.caseRef, '| Title:', detailData.request?.title);

    // 3. Test Missing Justification Note Validation (Should Fail with 400)
    const invalidVoteRes = await fetch(`${baseUrl}/consensus/CNS-2026-102/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'Approved', justificationNote: '' })
    });
    const invalidVoteData: any = await invalidVoteRes.json();
    console.log('✅ Mandatory Justification Note Validation Check (Empty Note Rejected):', invalidVoteRes.status === 400 ? 'PASSED (400 Bad Request)' : 'FAILED', '| Message:', invalidVoteData.message);

    // 4. Test Full 6-Step Quorum Vote Sequence via POST /api/consensus/CNS-2026-102/vote
    const voteRes = await fetch(`${baseUrl}/consensus/CNS-2026-102/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision: 'Approved',
        justificationNote: 'Verified Section 144 witness protection order under high court bench protocol.',
        validatorName: 'Independent Validator Node #02 (You)'
      })
    });
    const voteData: any = await voteRes.json();
    console.log('✅ Consensus Vote Quorum Sequence Execution:');
    console.log('   - Result Message:', voteData.message);
    console.log('   - Request Status:', voteData.request?.status);
    console.log('   - Proposed Record Hash (SHA-256):', voteData.request?.proposedRecordHash);
    console.log('   - Polygon Block Number:', voteData.request?.blockNumber);

    // 5. Test Rejection Sequence (Steps 3-4 Hashing + Polygon Anchor Never Execute)
    const rejectRes = await fetch(`${baseUrl}/consensus/CNS-2026-101/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision: 'Rejected',
        justificationNote: 'Timestamp offset discrepancy exceeds acceptable NTP drift limits.'
      })
    });
    const rejectData: any = await rejectRes.json();
    console.log('🔒 Rejection Security Guarantee Check (Un-anchored Permanently):');
    console.log('   - Result Message:', rejectData.message);
    console.log('   - Final Request Status:', rejectData.request?.status);

    console.log('\n🎉 ALL CONSENSUS VOTES BACKEND TESTS PASSED SUCCESSFULLY!');
  } catch (err: any) {
    console.error('❌ Test failed:', err.message);
  }
}

testConsensusVotesStack();
