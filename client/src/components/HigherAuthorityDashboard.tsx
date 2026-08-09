import React, { useState, useEffect } from 'react';
import { ShieldCheck, Link2, CheckCircle2, XCircle, UserCheck, RefreshCw, LogOut, Copy } from 'lucide-react';
import { LogoIcon } from './LogoIcon';
import { api } from '../services/api';

interface PendingRequest {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  timestamp: string;
}

export function HigherAuthorityDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [selectedRole, setSelectedRole] = useState('Field Submitter');
  const [targetEmail, setTargetEmail] = useState('');
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [authError, setAuthError] = useState(false);

  const loadRequests = async (intervalRef?: { current: ReturnType<typeof setInterval> | null }) => {
    const token = localStorage.getItem('nyayakasha_admin_token');
    if (!token) {
      // No token at all — stop polling and redirect to auth
      if (intervalRef?.current) clearInterval(intervalRef.current);
      onNavigate('higher-authority-auth');
      return;
    }
    try {
      const data = await api.getAdminPendingRequests();
      setPendingRequests(data);
      setAuthError(false);
    } catch (e: any) {
      if (e?.message?.includes('Invalid admin token') || e?.message?.includes('Unauthorized') || e?.message?.includes('No admin token')) {
        // Token is invalid/expired — stop the interval and redirect to login
        if (intervalRef?.current) clearInterval(intervalRef.current);
        localStorage.removeItem('nyayakasha_admin_token');
        localStorage.removeItem('nyayakasha_higher_authority_logged_in');
        setAuthError(true);
        setTimeout(() => onNavigate('higher-authority-auth'), 1500);
      }
      // silently ignore other errors (network, etc.)
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('nyayakasha_admin_token');
    if (!token) {
      onNavigate('higher-authority-auth');
      return;
    }
    const intervalRef: { current: ReturnType<typeof setInterval> | null } = { current: null };
    loadRequests(intervalRef);
    intervalRef.current = setInterval(() => loadRequests(intervalRef), 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleGenerateLink = async () => {
    setMessage('');
    if (!targetEmail || !targetEmail.includes('@')) {
      setMessage('Please enter a valid email address.');
      return;
    }
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/#invite-locked?role=${encodeURIComponent(selectedRole)}`;
    setIsSending(true);

    try {
      const res = await api.adminSendInvite(targetEmail, selectedRole, url);
      setMessage(res.message || 'Invite sent successfully!');
      setTargetEmail(''); // clear email field on success
    } catch (e: any) {
      setMessage(e.message || 'Failed to send invite.');
    } finally {
      setIsSending(false);
    }
  };

  const handleAction = async (id: string, action: 'APPROVED' | 'DECLINED') => {
    try {
      if (action === 'APPROVED') {
        await api.adminApproveRequest(id);
      } else {
        await api.adminDeclineRequest(id);
      }
      loadRequests();
    } catch (e) {
      console.error('Failed to update request', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nyayakasha_higher_authority_logged_in');
    localStorage.removeItem('nyayakasha_admin_token');
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">
      {authError && (
        <div className="w-full bg-red-600 text-white text-sm font-semibold text-center py-3 px-4">
          ⚠️ Admin session expired or invalid. Redirecting to login...
        </div>
      )}
      {/* Navbar */}
      <nav className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <LogoIcon className="w-8 h-8 text-white" />
          <span className="text-xl font-bold tracking-tight">Higher Authority Terminal</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Generate Link */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Link2 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Generate Invite Link</h2>
            <p className="text-sm text-black/60 mb-6">Create a role-locked sign up link to share with new institutional members.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-2">Recipient Email</label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="visitor@example.com"
                  className="w-full px-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 border-transparent text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-2">Select Target Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 border-transparent text-sm font-medium"
                >
                  <option value="Field Submitter">Field Submitter</option>
                  <option value="Court Authority">Court Authority</option>
                  <option value="Independent Validator">Independent Validator</option>
                </select>
              </div>

              <button
                onClick={handleGenerateLink}
                disabled={isSending}
                className="w-full bg-black text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {isSending ? 'Sending Email...' : 'Send Secure Invite via Email'}
              </button>

              {message && (
                <div className={`mt-2 text-xs font-medium ${message.includes('valid email') || message.includes('Failed') ? 'text-red-500' : 'text-emerald-600'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 min-h-[500px]">
            <div className="flex items-center justify-between mb-6 border-b border-black/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">Sign-Up Requests</h2>
                  <p className="text-xs text-black/50 font-medium">Approve requests before users can access the dashboard</p>
                </div>
              </div>
              <button onClick={() => loadRequests()} className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer" title="Refresh">
                <RefreshCw className="w-5 h-5 text-black/50" />
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShieldCheck className="w-16 h-16 text-black/10 mb-4" />
                <p className="text-black/60 font-medium">No pending sign-up requests at this time.</p>
                <p className="text-xs text-black/40 mt-1">Generated links will appear here once visitors submit their details.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.slice().reverse().map(req => (
                  <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-black/5 bg-[#F9F9F9] gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-black">{req.fullName}</h3>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          req.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          req.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200' :
                          'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm text-black/60">{req.email}</p>
                      <p className="text-xs font-semibold text-black/40 mt-2 flex items-center gap-1">
                        Requested Role: <span className="text-black/80">{req.role}</span>
                      </p>
                    </div>
                    
                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAction(req.id, 'DECLINED')}
                          className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Decline
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'APPROVED')}
                          className="px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
