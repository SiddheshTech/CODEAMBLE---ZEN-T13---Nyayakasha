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

  signin: async (email: string, password: string, turnstileToken: string = 'dev_turnstile_token') => {
    const res = await fetchAPI('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password, turnstileToken })
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
    return fetchAPI('/auth/verify-duress-pin', {
      method: 'POST',
      headers,
      body: JSON.stringify({ pin, locationInfo: coords })
    });
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
  }) => {
    return fetchAPI('/evidence/submit', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // --- CONSENSUS & FORGERY ---
  getConsensusApprovals: async () => {
    return fetchAPI('/consensus/approvals', { method: 'GET' });
  },

  voteConsensus: async (requestId: string, vote: 'APPROVE' | 'REJECT' | 'FLAG_FORGERY', note?: string, validatorName?: string) => {
    return fetchAPI('/consensus/vote', {
      method: 'POST',
      body: JSON.stringify({ requestId, vote, note, validatorName })
    });
  },

  getForgeryQueue: async () => {
    return fetchAPI('/forgery/queue', { method: 'GET' });
  },

  decideForgery: async (reviewId: string, decision: 'Quarantined' | 'Cleared' | 'Escalated to Bench', notes?: string) => {
    return fetchAPI('/forgery/decide', {
      method: 'POST',
      body: JSON.stringify({ reviewId, decision, notes })
    });
  },

  // --- IDENTITY & PRECEDENT ---
  getIdentityUnlockRequests: async () => {
    return fetchAPI('/identity/unlock-requests', { method: 'GET' });
  },

  approveIdentityUnlock: async (unlockId: string, grantedBy?: string) => {
    return fetchAPI('/identity/approve-unlock', {
      method: 'POST',
      body: JSON.stringify({ unlockId, grantedBy })
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

  getAuditLog: async () => {
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

  getHealth: async () => {
    return fetchAPI('/health', { method: 'GET' });
  }
};
