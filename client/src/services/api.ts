const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Retrieves the stored active session ID token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('nyayakasha_session_id');
}

/**
 * Generic JSON API fetch helper with automatic Bearer token header injection
 */
async function fetchAPI<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const userStr = localStorage.getItem('nyayakasha_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.email) headers['X-User-Email'] = u.email;
      if (u.role) headers['X-User-Role'] = u.role;
    }
  } catch (e) {}

  if (localStorage.getItem('nyayakasha_is_duress_session') === 'true') {
    headers['X-Duress-Session'] = 'true';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'An error occurred while connecting to NYAYAKASHA API');
  }

  return data;
}

export const api = {
  baseUrl: API_BASE,
  // --- AUTHENTICATION ---
  signup: async (params: {
    email: string;
    password: string;
    fullName: string;
    role: 'field_submitter' | 'court_authority' | 'independent_validator';
    inviteToken?: string;
    publicKeyPem?: string;
    badgeId?: string;
    barCouncilNumber?: string;
    institutionId?: string;
    jurisdictionCode?: string;
    consentVetting?: boolean;
  }) => {
    const res = await fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    if (res.sessionId) {
      localStorage.setItem('nyayakasha_session_id', res.sessionId);
      localStorage.setItem('nyayakasha_user', JSON.stringify(res.user));
    }
    return res;
  },

  signin: async (email: string, password: string, expectedRole?: string, turnstileToken: string = 'dev_turnstile_token') => {
    const res = await fetchAPI('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password, expectedRole, turnstileToken })
    });
    if (res.sessionId) {
      localStorage.setItem('nyayakasha_session_id', res.sessionId);
      localStorage.setItem('nyayakasha_user', JSON.stringify(res.user));
    }
    return res;
  },

  logout: async () => {
    try {
      await fetchAPI('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('nyayakasha_session_id');
      localStorage.removeItem('nyayakasha_user');
    }
  },

  enrollDuressPin: async (realPin: string, duressPin: string) => {
    return fetchAPI('/auth/enroll-duress-pin', {
      method: 'POST',
      body: JSON.stringify({ realPin, duressPin })
    });
  },

  verifyDuressPin: async (pin: string, coords?: { lat: number; lng: number; jurisdictionCode?: string }) => {
    const headers: Record<string, string> = {};
    if (coords) {
      headers['x-latitude'] = String(coords.lat);
      headers['x-longitude'] = String(coords.lng);
      headers['x-jurisdiction-code'] = coords.jurisdictionCode || 'MH-MUM-DIST-01';
    }
    const res = await fetchAPI('/auth/verify-duress-pin', {
      method: 'POST',
      headers,
      body: JSON.stringify({ pin, locationInfo: coords })
    });

    if (res && res.isDuressSession) {
      localStorage.setItem('nyayakasha_is_duress_session', 'true');
    } else {
      localStorage.removeItem('nyayakasha_is_duress_session');
    }

    return res;
  },

  // --- VERIFICATION & DOCUMENT ---
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    return fetchAPI('/verification/document/upload', {
      method: 'POST',
      body: formData
    });
  },

  crossCheckInstitution: async () => {
    return fetchAPI('/verification/institution/cross-check', { method: 'POST' });
  },

  adminApproveUser: async (targetUserId: string, decision: 'APPROVE' | 'REJECT', note?: string) => {
    return fetchAPI('/verification/admin/approve-user', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, decision, note })
    });
  },

  getVettingQueue: async () => {
    return fetchAPI('/verification/vetting/queue', { method: 'GET' });
  },

  // --- MULTI-FACTOR AUTHENTICATION ---
  sendEmailOtp: async (email: string) => {
    return fetchAPI('/mfa/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  verifyEmailOtp: async (email: string, otp: string) => {
    return fetchAPI('/mfa/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
  },

  getWebAuthnOptions: async () => {
    return fetchAPI('/mfa/webauthn/generate-options', { method: 'POST' });
  },

  verifyWebAuthn: async (webauthnResponse: any) => {
    return fetchAPI('/mfa/webauthn/verify', {
      method: 'POST',
      body: JSON.stringify(webauthnResponse)
    });
  },

  setupTOTP: async () => {
    return fetchAPI('/mfa/totp/setup', { method: 'POST' });
  },

  verifyTOTP: async (secret: string, token: string) => {
    return fetchAPI('/mfa/totp/verify', {
      method: 'POST',
      body: JSON.stringify({ secret, token })
    });
  },

  // --- CASES & EVIDENCE API ---
  getCases: async () => {
    return fetchAPI('/cases', { method: 'GET' });
  },

  getCaseById: async (id: string) => {
    return fetchAPI(`/cases/${id}`, { method: 'GET' });
  },

  createCase: async (params: {
    title: string;
    type?: string;
    officer: string;
    priority?: 'Critical' | 'High' | 'Medium' | 'Low';
    description?: string;
    location?: string;
    jurisdictionCode?: string;
  }) => {
    return fetchAPI('/cases', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  getEvidence: async (caseId?: string) => {
    return fetchAPI('/evidence' + (caseId ? `?caseId=${encodeURIComponent(caseId)}` : ''), { method: 'GET' });
  },

  getEvidenceById: async (id: string) => {
    return fetchAPI(`/evidence/${id}`, { method: 'GET' });
  },

  getEvidenceChain: async (id: string) => {
    return fetchAPI(`/evidence/${id}/chain`, { method: 'GET' });
  },

  transferCustody: async (id: string, params: { targetCustodian: string; transferReason?: string; notes?: string; pin?: string }) => {
    return fetchAPI(`/evidence/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  submitEvidence: async (params: {
    caseId: string;
    title: string;
    type?: string;
    hash?: string;
    custodian?: string;
    incidentLocation?: string;
    confidentialityLevel?: string;
    customMetadata?: string;
    latitude?: number;
    longitude?: number;
    signature?: string;
    dataUrl?: string;
    seizureBagId?: string;
    seizureMethod?: string;
    priorityLevel?: string;
    witnessName?: string;
    preservationType?: string;
    tags?: string[];
    evidenceNotes?: string;
    gpsLocation?: any;
  }) => {
    return fetchAPI('/evidence/submit', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  submitTestimony: async (params: {
    caseId: string;
    incidentDate?: string;
    location?: string;
    language?: string;
    witnessName?: string;
    protectIdentity?: boolean;
    idType?: string;
    testimonyType?: string;
    depositionText: string;
    officerPin?: string;
    signatureDataUrl?: string;
    attachments?: any[];
  }) => {
    return fetchAPI('/evidence/testimony/submit', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // --- CONSENSUS & FORGERY ---
  getPendingConsensus: async () => {
    return fetchAPI('/consensus/pending', { method: 'GET' });
  },

  getConsensusById: async (id: string) => {
    return fetchAPI(`/consensus/${id}`, { method: 'GET' });
  },

  getConsensusApprovals: async () => {
    return fetchAPI('/consensus/pending', { method: 'GET' });
  },

  castConsensusVote: async (id: string, decision: 'Approved' | 'Rejected' | 'Flagged Forgery', justificationNote: string, validatorName?: string) => {
    return fetchAPI(`/consensus/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ decision, justificationNote, note: justificationNote, validatorName })
    });
  },

  voteConsensus: async (requestId: string, vote: 'APPROVE' | 'REJECT' | 'FLAG_FORGERY', note?: string, validatorName?: string) => {
    return fetchAPI(`/consensus/${requestId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ requestId, decision: vote === 'APPROVE' ? 'Approved' : 'Rejected', vote, justificationNote: note, note, validatorName })
    });
  },

  getForgeryQueue: async () => {
    return fetchAPI('/forgery/queue', { method: 'GET' });
  },

  decideForgery: async (reviewId: string, decision: string, notes?: string) => {
    return fetchAPI('/forgery/decide', {
      method: 'POST',
      body: JSON.stringify({ reviewId, decision, notes })
    });
  },

  addBenchDirective: async (reviewId: string, type: string, details: string) => {
    return fetchAPI('/forgery/directive', {
      method: 'POST',
      body: JSON.stringify({ reviewId, type, details })
    });
  },

  // --- IDENTITY & PRECEDENT ---
  getIdentityUnlockRequests: async () => {
    return fetchAPI('/identity/unlock-requests', { method: 'GET' });
  },

  getIdentityUnlockLogs: async () => {
    return fetchAPI('/identity/logs', { method: 'GET' });
  },

  decideIdentityUnlock: async (requestId: string, decision: 'Approved' | 'Rejected', remarks: string) => {
    return fetchAPI('/identity/decide', {
      method: 'POST',
      body: JSON.stringify({ requestId, decision, remarks })
    });
  },

  addIdentityDirective: async (requestId: string, type: string, note: string) => {
    return fetchAPI('/identity/directive', {
      method: 'POST',
      body: JSON.stringify({ requestId, type, note })
    });
  },

  getPrecedentFlags: async () => {
    return fetchAPI('/precedents/flags', { method: 'GET' });
  },

  resolvePrecedentFlag: async (flagId: string, resolvedBy?: string) => {
    return fetchAPI('/precedents/resolve', {
      method: 'POST',
      body: JSON.stringify({ flagId, resolvedBy })
    });
  },

  // --- ANALYTICS ---
  getAnalyticsOverview: async () => {
    return fetchAPI('/analytics/overview', { method: 'GET' });
  },

  // --- SECURITY & DEVICE UNRECOGNIZED ALERT ---
  verifyDevice: async (deviceId?: string, userEmail?: string, mfaCode?: string) => {
    return fetchAPI('/security/device/verify', {
      method: 'POST',
      body: JSON.stringify({ deviceId, userEmail, mfaCode })
    });
  },

  emergencyLockDevice: async (deviceId?: string, userEmail?: string, reason?: string) => {
    return fetchAPI('/security/device/emergency-lock', {
      method: 'POST',
      body: JSON.stringify({ deviceId, userEmail, reason })
    });
  },

  getActiveSessions: async () => {
    return fetchAPI('/security/sessions', { method: 'GET' });
  },

  revokeSession: async (targetSessionId?: string, revokeAllOther?: boolean) => {
    return fetchAPI('/security/sessions/revoke', {
      method: 'POST',
      body: JSON.stringify({ targetSessionId, revokeAllOther })
    });
  },

  getSecurityAuditLog: async () => {
    return fetchAPI('/security/audit-log', { method: 'GET' });
  },

  getDuressAlerts: async () => {
    return fetchAPI('/security/validator/duress-alerts', { method: 'GET' });
  },

  // --- INDEPENDENT VALIDATOR WORKSPACE ---
  getValidatorDashboard: async () => {
    return fetchAPI('/validator/dashboard', { method: 'GET' });
  },

  castValidatorVote: async (blockId: string, decision: 'Approve' | 'Reject', pin?: string) => {
    return fetchAPI('/validator/vote', {
      method: 'POST',
      body: JSON.stringify({ blockId, decision, pin })
    });
  },

  acknowledgeDuressAlert: async (alertId?: string) => {
    return fetchAPI('/validator/duress/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ alertId })
    });
  },

  getValidatorActivityLogs: async () => {
    return fetchAPI('/validator/activity-log', { method: 'GET' });
  },

  // --- AGGREGATE ANALYTICS & DIFFERENTIAL PRIVACY ---

  getAnalyticsReportById: async (id: string) => {
    return fetchAPI(`/analytics/reports/${id}`, { method: 'GET' });
  },

  escalateAnalyticsReport: async (id: string, rationale: string, category?: string) => {
    return fetchAPI(`/analytics/reports/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ rationale, category })
    });
  },

  attestAnalyticsModule: async (moduleId: string, attestationNotes: string, judgePasskey: string) => {
    return fetchAPI('/analytics/modules/attest', {
      method: 'POST',
      body: JSON.stringify({ moduleId, attestationNotes, judgePasskey })
    });
  },

  // --- AUDIT LOG & TAMPER-PROOF LEDGER ---
  getAuditLog: async () => {
    return fetchAPI('/audit-log', { method: 'GET' });
  },

  getPersonalAuditLogs: async (uid?: string) => {
    const query = uid ? `?uid=${encodeURIComponent(uid)}` : '';
    return fetchAPI(`/audit-log/mine${query}`, { method: 'GET' });
  },

  getSystemAuditSummary: async () => {
    return fetchAPI('/audit-log/system-summary', { method: 'GET' });
  },

  verifyAnchorHash: async (hash: string) => {
    return fetchAPI(`/audit-log/verify-anchor/${encodeURIComponent(hash)}`, { method: 'GET' });
  },

  // --- NOTIFICATIONS & FCM PUSH ---
  getNotifications: async (role?: string) => {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    return fetchAPI(`/notifications${query}`, { method: 'GET' });
  },

  markNotificationRead: async (id: string) => {
    return fetchAPI(`/notifications/${id}/read`, { method: 'POST' });
  },

  markAllNotificationsRead: async (role?: string) => {
    return fetchAPI('/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  },

  registerDeviceToken: async (userId: string, deviceToken: string) => {
    return fetchAPI('/notifications/register-device', {
      method: 'POST',
      body: JSON.stringify({ userId, deviceToken })
    });
  },

  // --- PROFILE MANAGEMENT ---
  getProfile: async () => {
    return fetchAPI('/profile', { method: 'GET' });
  },

  updateProfile: async (data: any) => {
    return fetchAPI('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // --- INSTITUTIONAL SETTINGS ---
  getSettings: async () => {
    return fetchAPI('/settings', { method: 'GET' });
  },

  updateSettings: async (data: any) => {
    return fetchAPI('/settings', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  revokeSession: async (sessionId: string) => {
    return fetchAPI('/settings/revoke-session', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
  },

  getHealth: async () => {
    return fetchAPI('/health', { method: 'GET' });
  },

  // --- COURT AUTHORITY DASHBOARD (REAL-TIME) ---
  getCourtAuthorityDashboard: async () => {
    return fetchAPI('/court-authority/dashboard', { method: 'GET' });
  },

  getCourtAuthorityAttentionItems: async () => {
    return fetchAPI('/court-authority/attention-items', { method: 'GET' });
  },

  getCourtAuthorityRecentActivity: async (limit = 10) => {
    return fetchAPI(`/court-authority/recent-activity?limit=${limit}`, { method: 'GET' });
  },

  executeJudicialAction: async (params: {
    decision: 'ADMIT' | 'STRIKE' | 'APPROVE_VOTE' | 'REJECT_VOTE' | 'AUTHORIZE_TRANSFER' | 'RESOLVE_PRECEDENT';
    itemType: 'forgery' | 'vote' | 'custody' | 'precedent';
    dbId: string;
    caseId?: string;
    judicialOrderText?: string;
    judgeId?: string;
    judgeName?: string;
  }) => {
    return fetchAPI('/court-authority/action', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  courtAuthoritySearch: async (query: string) => {
    return fetchAPI(`/court-authority/case-search?q=${encodeURIComponent(query)}`, { method: 'GET' });
  },

  // --- COURT AUTHORITY CASE FILES REPOSITORY ---
  getRichCases: async () => {
    return fetchAPI('/cases/rich/all', { method: 'GET' });
  },

  getRichCaseById: async (id: string) => {
    return fetchAPI(`/cases/rich/detail/${id}`, { method: 'GET' });
  },

  addRichCaseEvidence: async (id: string, data: { title: string; type: string; details?: string; submittedBy?: string }) => {
    return fetchAPI(`/cases/rich/detail/${id}/evidence`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  addRichCaseNote: async (id: string, data: { content: string; category?: string; author?: string }) => {
    return fetchAPI(`/cases/rich/detail/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  addRichCaseOrder: async (id: string, data: { title: string; type: string; summary: string; issuedBy?: string }) => {
    return fetchAPI(`/cases/rich/detail/${id}/orders`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  unlockRichCaseTestimony: async (id: string, testimonyId: string, passkey: string) => {
    return fetchAPI(`/cases/rich/detail/${id}/testimonies/${testimonyId}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ passkey })
    });
  },

  authorizeRichCaseCustodyTransfer: async (id: string, data: { recipient: string; reason: string; actor?: string; location?: string; biometricVerified?: boolean; gpsCoordinates?: string }) => {
    return fetchAPI(`/cases/rich/detail/${id}/custody/transfer`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateRichCaseEvidenceStatus: async (id: string, evidenceId: string, decision: 'ADMIT' | 'STRIKE') => {
    return fetchAPI(`/cases/rich/detail/${id}/evidence/${evidenceId}/status`, {
      method: 'POST',
      body: JSON.stringify({ decision })
    });
  },
};
