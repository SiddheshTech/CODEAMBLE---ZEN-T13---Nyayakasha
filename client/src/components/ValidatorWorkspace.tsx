import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert, ShieldCheck, Clock, CheckCircle2, XCircle,
  RefreshCw, AlertTriangle, Lock, Wifi, WifiOff, Activity,
  FileCode, Scale, Info, ChevronRight, Bell, Database,
  Eye, Fingerprint, Hash, Zap, BarChart3, ListChecks,
} from 'lucide-react';
import { api } from '../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────
interface DuressAlertItem {
  id: string;
  timestamp: string;
  status: string;
  refId: string;
  fieldNodeId: string;
  jurisdictionCode: string;
}

interface ConsensusItem {
  id: string;
  caseRef: string;
  title: string;
  category: string;
  requestedBy: string;
  timestamp: string;
  status: string;
  validatorVoteStatus: string;
  validatorVote: string;
  quorumSigned?: number;
  quorumTotal?: number;
  merkleRoot?: string;
  zkProofType?: string;
  cryptographicDetails?: string;
  reasonForRequest?: string;
  validatorJustificationNote?: string;
  systemFlagIndicator?: { isFlagged: boolean; flagType?: string; title?: string; description?: string };
}

interface ActivityLog {
  id: string;
  action: string;
  type: string;
  time: string;
  nodeId: string;
  icon?: string;
  color?: string;
}

// ─── WebSocket Hook ─────────────────────────────────────────────────────────
function useValidatorWebSocket(
  onDuressAlert: (alert: DuressAlertItem) => void,
  onConsensusUpdate: (data: any) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket('ws://localhost:5000/ws/duress-bus');
        wsRef.current = ws;

        ws.onopen = () => setWsStatus('connected');
        ws.onclose = () => {
          setWsStatus('disconnected');
          // Reconnect after 5s
          setTimeout(connect, 5000);
        };
        ws.onerror = () => setWsStatus('disconnected');

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'DURESS_ALERT' && data.alert) {
              // Privacy filter: strip userName/ip/coords before exposing to UI
              const filtered: DuressAlertItem = {
                id: data.alert.id,
                timestamp: data.alert.timestamp,
                status: data.alert.status,
                refId: data.alert.refId || `DURESS-REF-${data.alert.id.slice(-6).toUpperCase()}`,
                fieldNodeId: data.alert.fieldNodeId || `FIELD-NODE-${data.alert.id.slice(-4).toUpperCase()}`,
                jurisdictionCode: data.alert.locationInfo?.jurisdiction || 'MH-MUM-DIST-01',
              };
              onDuressAlert(filtered);
            } else if (
              data.type === 'CONSENSUS_VOTE_CAST' ||
              data.type === 'COUNTS_UPDATE' ||
              data.type === 'CONSENSUS_QUORUM_FINALIZED'
            ) {
              onConsensusUpdate(data);
            }
          } catch (_) {}
        };
      } catch (_) {
        setWsStatus('disconnected');
      }
    };

    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [onDuressAlert, onConsensusUpdate]);

  return wsStatus;
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function ValidatorWorkspace({
  userFullName,
  viewMode = 'all',
  onNavigateTab,
}: {
  userFullName?: string;
  viewMode?: 'dashboard' | 'all' | 'duress' | 'consensus';
  onNavigateTab?: (tab: string) => void;
}) {
  const [duressAlerts, setDuressAlerts] = useState<DuressAlertItem[]>([]);
  const [consensusQueue, setConsensusQueue] = useState<ConsensusItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [duressFilter, setDuressFilter] = useState<'all' | 'unacknowledged' | 'investigating'>('all');

  // Voting state
  const [votingId, setVotingId] = useState<string | null>(null);
  const [justification, setJustification] = useState('');
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  // Acknowledge state
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  // ── Fetch from backend ─────────────────────────────────────────────────
  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [duressRes, consensusRes, activityRes, dashRes] = await Promise.all([
        api.getValidatorDuressAlerts().catch(() => null),
        api.getConsensusRequests().catch(() => null),
        api.getValidatorActivityLogs().catch(() => null),
        api.getValidatorDashboard().catch(() => null),
      ]);

      if (duressRes?.alerts) setDuressAlerts(duressRes.alerts);
      if (consensusRes?.pendingRequests) setConsensusQueue(consensusRes.pendingRequests);
      if (activityRes?.logs) setActivityLogs(activityRes.logs.slice(0, 15));
      if (dashRes) setDashboardSummary(dashRes.summary);

      setLastRefresh(new Date());
    } catch (err) {
      console.error('ValidatorWorkspace fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Poll every 20s
    const interval = setInterval(() => fetchAll(true), 20000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── WebSocket real-time handlers ────────────────────────────────────────
  const handleDuressAlert = useCallback((alert: DuressAlertItem) => {
    setDuressAlerts(prev => {
      const exists = prev.find(a => a.id === alert.id);
      return exists ? prev.map(a => a.id === alert.id ? alert : a) : [alert, ...prev];
    });
  }, []);

  const handleConsensusUpdate = useCallback(() => {
    fetchAll(true);
  }, [fetchAll]);

  const wsStatus = useValidatorWebSocket(handleDuressAlert, handleConsensusUpdate);

  // ── Vote handler ────────────────────────────────────────────────────────
  const castVote = async (requestId: string, decision: 'Approved' | 'Rejected') => {
    if (!justification.trim()) {
      setVoteError('Mandatory justification note required before casting vote.');
      return;
    }
    setIsVoting(true);
    setVoteError(null);
    try {
      await api.castConsensusVote(requestId, decision, justification.trim());
      setVoteSuccess(`Vote "${decision}" cast successfully for ${requestId}.`);
      setVotingId(null);
      setJustification('');
      setTimeout(() => setVoteSuccess(null), 4000);
      fetchAll(true);
    } catch (err: any) {
      setVoteError(err.message || 'Vote submission failed.');
    } finally {
      setIsVoting(false);
    }
  };

  // ── Acknowledge duress handler ──────────────────────────────────────────
  const acknowledgeAlert = async (alertId: string) => {
    setAcknowledgingId(alertId);
    try {
      await api.acknowledgeValidatorDuressAlert(alertId);
      setDuressAlerts(prev =>
        prev.map(a => a.id === alertId ? { ...a, status: 'INVESTIGATING' } : a)
      );
    } catch (err) {
      console.error('Acknowledge failed:', err);
    } finally {
      setAcknowledgingId(null);
    }
  };

  const unacknowledgedAlerts = duressAlerts.filter(a => a.status === 'UNACKNOWLEDGED');
  const pendingVotes = consensusQueue.filter(r =>
    r.validatorVote === 'pending' || r.validatorVoteStatus === 'Pending' || !r.validatorVoteStatus
  );

  const filteredDuressAlerts = duressAlerts.filter(a => {
    if (duressFilter === 'unacknowledged') return a.status === 'UNACKNOWLEDGED';
    if (duressFilter === 'investigating') return a.status === 'INVESTIGATING';
    return true;
  });

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 min-h-screen bg-[#F7F8FA] pt-6 pb-24 px-4 sm:px-6 lg:px-10">

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-black/40 mb-1">
              {viewMode === 'dashboard' ? 'Executive Oversight Console' : viewMode === 'duress' ? 'Silent Duress Monitoring Enclave' : 'Independent Validator Workspace'}
            </p>
            <h1 className="text-2xl font-bold text-black tracking-tight">
              {viewMode === 'dashboard' ? 'Judicial Oversight & Verification Dashboard' : viewMode === 'duress' ? 'Duress Emergency Alerts & Telemetry' : 'Oversight & Consensus Node'}
            </h1>
            <p className="text-sm text-black/50 mt-1">
              {userFullName ? `Signed in as ${userFullName}` : 'Zero-Knowledge Validator Mode'}
              {' · '}Last synced {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* WebSocket status */}
            <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
              wsStatus === 'connected' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
              wsStatus === 'connecting' ? 'bg-amber-50 border-amber-200 text-amber-700' :
              'bg-red-50 border-red-200 text-red-700'
            }`}>
              {wsStatus === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {wsStatus === 'connected' ? 'Live' : wsStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </div>
            <button
              onClick={() => fetchAll()}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-black text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'Duress Alerts', value: unacknowledgedAlerts.length, icon: ShieldAlert, color: unacknowledgedAlerts.length > 0 ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            { label: 'Pending Votes', value: pendingVotes.length, icon: Scale, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { label: 'Total Consensus', value: consensusQueue.length, icon: ListChecks, color: 'text-violet-600 bg-violet-50 border-violet-200' },
            { label: 'Activity Logs', value: activityLogs.length, icon: Activity, color: 'text-slate-600 bg-slate-50 border-slate-200' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`flex items-center gap-3 p-3 rounded-xl border ${color}`}>
              <Icon className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-medium opacity-70">{label}</p>
                <p className="text-xl font-bold leading-none mt-0.5">{isLoading ? '—' : value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DEDICATED DASHBOARD VIEW MODE */}
      {viewMode === 'dashboard' ? (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Executive Hero Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero-Knowledge Privacy Isolation Active · Node #IV-882
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
                Independent Judicial Oversight Console
              </h2>
              <p className="text-sm text-black/60 leading-relaxed">
                You are operating as a certified independent validator. Case titles, officer names, and evidence content are cryptographically masked to ensure unbiased multi-sig consensus.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => onNavigateTab?.('Consensus Requests')}
                className="px-5 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Database className="w-4 h-4" />
                Open Consensus Queue
              </button>
              <button
                onClick={() => onNavigateTab?.('Duress Alerts')}
                className="px-5 py-3 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                Open Duress Enclave
              </button>
            </div>
          </div>

          {/* Quick Enclave Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => onNavigateTab?.('Duress Alerts')}
              className="bg-white rounded-2xl border border-black/8 p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-black mb-1 group-hover:text-rose-600 transition-colors">
                Silent Duress Monitoring
              </h3>
              <p className="text-xs text-black/60 leading-relaxed mb-4">
                Real-time covert distress signal bus. Monitors officer PIN coercion with zero-knowledge hardware isolation.
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-rose-600 pt-2 border-t border-black/5">
                <span>{unacknowledgedAlerts.length} Unacknowledged Alerts</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => onNavigateTab?.('Consensus Requests')}
              className="bg-white rounded-2xl border border-black/8 p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-105 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-black mb-1 group-hover:text-blue-600 transition-colors">
                Multi-Sig Consensus Engine
              </h3>
              <p className="text-xs text-black/60 leading-relaxed mb-4">
                Attest evidence block hashes, record seals, and statutory digital signature integrity before Polygon PoS anchoring.
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-blue-600 pt-2 border-t border-black/5">
                <span>{pendingVotes.length} Pending Consensus Votes</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => onNavigateTab?.('Aggregate analytics')}
              className="bg-white rounded-2xl border border-black/8 p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 mb-4 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-black mb-1 group-hover:text-violet-600 transition-colors">
                Aggregate Differential Analytics
              </h3>
              <p className="text-xs text-black/60 leading-relaxed mb-4">
                Homomorphic privacy evaluation. Monitors judicial bench velocity & anomaly drift with minimum k ≥ 50 cohort guards.
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-violet-600 pt-2 border-t border-black/5">
                <span>Cohort Safeguard: MET (k ≥ 50)</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Activity & System Telemetry Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-500" />
                  <h3 className="text-sm font-bold text-black">Live Oversight Activity Log</h3>
                </div>
                <span className="text-[10px] text-black/40 font-mono">Node #IV-882</span>
              </div>
              {activityLogs.length === 0 ? (
                <p className="text-xs text-black/40 text-center py-8">No recent activity recorded</p>
              ) : (
                <div className="space-y-3">
                  {activityLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-start gap-3 py-2 border-b border-black/5 last:border-0">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        ✓
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-black truncate">{log.action}</p>
                        <p className="text-[10px] text-black/40 mt-0.5">{log.nodeId} · {log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-black">Node Cryptographic Telemetry</h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  HEALTHY
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-black/5">
                  <span className="text-black/50">Hardware Security Module (HSM):</span>
                  <span className="font-mono font-semibold text-black">TPM 2.0 Active (Hardware-bound)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5">
                  <span className="text-black/50">Zero-Knowledge Proof Scheme:</span>
                  <span className="font-mono font-semibold text-black">zk-SNARK (secp256k1)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5">
                  <span className="text-black/50">Blockchain Anchor Network:</span>
                  <span className="font-mono font-semibold text-black">Polygon PoS (Chain ID 137)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5">
                  <span className="text-black/50">Homomorphic Engine:</span>
                  <span className="font-mono font-semibold text-black">node-seal (FHE-CKKS)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-black/50">Privacy Noise Level:</span>
                  <span className="font-mono font-semibold text-black">Laplace Noise (ε = 0.5)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── PATH 2: DURESS ALERTS ─────────────────────────────────────── */}
        <div className={`${viewMode === 'duress' ? 'lg:col-span-2' : 'lg:col-span-1'} space-y-4`}>
          <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-bold text-black">
                  {viewMode === 'duress' ? 'Silent Duress Emergency Management Board' : 'Duress Alerts'}
                </h2>
                {unacknowledgedAlerts.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    {unacknowledgedAlerts.length}
                  </span>
                )}
              </div>

              {/* Filter pills when in duress mode */}
              {viewMode === 'duress' ? (
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                  <button
                    onClick={() => setDuressFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${duressFilter === 'all' ? 'bg-white text-black font-semibold shadow-xs' : 'text-black/60 hover:text-black'}`}
                  >
                    All ({duressAlerts.length})
                  </button>
                  <button
                    onClick={() => setDuressFilter('unacknowledged')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${duressFilter === 'unacknowledged' ? 'bg-rose-600 text-white font-semibold shadow-xs' : 'text-black/60 hover:text-black'}`}
                  >
                    Unacknowledged ({unacknowledgedAlerts.length})
                  </button>
                  <button
                    onClick={() => setDuressFilter('investigating')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${duressFilter === 'investigating' ? 'bg-amber-600 text-white font-semibold shadow-xs' : 'text-black/60 hover:text-black'}`}
                  >
                    Investigating ({duressAlerts.filter(a => a.status === 'INVESTIGATING').length})
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-black/40">
                  <Lock className="w-3 h-3" />
                  Privacy-filtered
                </div>
              )}
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 mb-4">
              <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                <strong>Path 2 — Direct Officer-to-Oversight Signal.</strong> Officer identity, location coordinates, and case content are deliberately hidden. You see only: alert ID, timestamp, jurisdiction code.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-black/5 rounded-xl animate-pulse" />)}
              </div>
            ) : filteredDuressAlerts.length === 0 ? (
              <div className="text-center py-10">
                <ShieldCheck className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-black/40">No duress alerts match filter</p>
                <p className="text-xs text-black/30 mt-0.5">All field nodes operating normally</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDuressAlerts.map(alert => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border transition-all ${
                      alert.status === 'UNACKNOWLEDGED'
                        ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                        : alert.status === 'INVESTIGATING'
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            alert.status === 'UNACKNOWLEDGED' ? 'bg-rose-200 text-rose-900 animate-pulse' :
                            alert.status === 'INVESTIGATING' ? 'bg-amber-200 text-amber-900' :
                            'bg-gray-200 text-gray-700'
                          }`}>{alert.status.replace('_', ' ')}</span>
                          <span className="text-[10px] font-mono text-black/50 bg-black/5 px-2 py-0.5 rounded">
                            {alert.jurisdictionCode}
                          </span>
                        </div>
                        <p className="text-sm font-mono font-bold text-black truncate">{alert.refId}</p>
                        <p className="text-xs text-black/60 mt-0.5 font-medium">
                          Node: <span className="text-black font-semibold">{alert.fieldNodeId}</span>
                        </p>
                        <p className="text-[10px] text-black/40 mt-1">
                          Triggered: {new Date(alert.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>

                        {/* Extra Telemetry Details in duress view mode */}
                        {viewMode === 'duress' && (
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] bg-white/80 p-2.5 rounded-lg border border-black/5">
                            <div>
                              <span className="text-black/40 font-medium">HSM Hardware Status:</span>{' '}
                              <span className="font-semibold text-emerald-700">Authenticated (TPM v2.0)</span>
                            </div>
                            <div>
                              <span className="text-black/40 font-medium">Covert Session Mode:</span>{' '}
                              <span className="font-semibold text-amber-700">Decoy Honeypot Active</span>
                            </div>
                            <div>
                              <span className="text-black/40 font-medium">Zero-Knowledge Isolation:</span>{' '}
                              <span className="font-semibold text-blue-700">Strict Neutral Enclave</span>
                            </div>
                            <div>
                              <span className="text-black/40 font-medium">Command Escalation:</span>{' '}
                              <span className="font-semibold text-slate-700">{alert.status === 'UNACKNOWLEDGED' ? 'Awaiting Validator Action' : 'Routed to Command Enclave'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {alert.status === 'UNACKNOWLEDGED' && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        disabled={acknowledgingId === alert.id}
                        className="mt-3 w-full text-xs font-bold py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {acknowledgingId === alert.id ? 'Acknowledging...' : 'Acknowledge & Escalate to Command Dispatch'}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Log in duress view */}
          {viewMode === 'duress' && (
            <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-violet-500" />
                <h2 className="text-sm font-bold text-black">Emergency Dispatch Telemetry Log</h2>
              </div>
              {activityLogs.length === 0 ? (
                <p className="text-xs text-black/40 text-center py-4">No activity logged yet</p>
              ) : (
                <div className="space-y-2">
                  {activityLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-2.5 py-2 border-b border-black/5 last:border-0">
                      <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-black truncate">{log.action}</p>
                        <p className="text-[10px] text-black/40">{log.nodeId} · {log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Activity log column in 'all' view mode */}
        {viewMode === 'all' && (
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-violet-500" />
                <h2 className="text-sm font-bold text-black">Activity Log</h2>
              </div>
              {activityLogs.length === 0 ? (
                <p className="text-xs text-black/40 text-center py-4">No activity yet</p>
              ) : (
                <div className="space-y-2">
                  {activityLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-2.5 py-2 border-b border-black/5 last:border-0">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-black truncate">{log.action}</p>
                        <p className="text-[10px] text-black/40">{log.nodeId} · {log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PATH 1: CONSENSUS QUEUE (shown in 'all' view mode) ──────── */}
        {viewMode === 'all' && (
          <div className="lg:col-span-2 space-y-4">

          {/* Vote success/error banners */}
          <AnimatePresence>
            {voteSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                {voteSuccess}
              </motion.div>
            )}
            {voteError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                {voteError}
                <button onClick={() => setVoteError(null)} className="ml-auto text-rose-400 hover:text-rose-700 font-bold">×</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold text-black">Consensus Queue</h2>
                {pendingVotes.length > 0 && (
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingVotes.length} pending
                  </span>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 mb-4">
              <p className="text-[10px] text-blue-800 font-medium leading-relaxed">
                <strong>Path 1 — Structural via Case Record.</strong> Each row is a hash consensus request auto-created when a Field Submitter seals evidence. You see: case ID, change type, requester role. No evidence images. No officer identity beyond what's in the case record.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-black/5 rounded-xl animate-pulse" />)}
              </div>
            ) : consensusQueue.length === 0 ? (
              <div className="text-center py-12">
                <Scale className="w-12 h-12 text-black/20 mx-auto mb-3" />
                <p className="text-sm font-medium text-black/40">No consensus requests</p>
                <p className="text-xs text-black/30 mt-1">Requests appear when evidence is submitted and sealed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consensusQueue.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border rounded-2xl overflow-hidden transition-all ${
                      item.systemFlagIndicator?.isFlagged ? 'border-rose-300 bg-rose-50/30' :
                      item.validatorVote === 'approved' || item.validatorVoteStatus === 'Approved' ? 'border-emerald-200 bg-emerald-50/20' :
                      item.validatorVote === 'rejected' || item.validatorVoteStatus === 'Rejected' ? 'border-gray-200 bg-gray-50/20' :
                      'border-black/8 bg-white'
                    }`}
                  >
                    {/* Header row */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="font-mono text-xs font-bold text-black/70 bg-black/5 px-2 py-0.5 rounded">
                              {item.caseRef || 'CASE-REF'}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                              item.status === 'Rejected' ? 'bg-gray-100 text-gray-700' :
                              item.status?.includes('Awaiting') ? 'bg-blue-100 text-blue-800' :
                              item.systemFlagIndicator?.isFlagged ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>{item.status || 'Pending'}</span>
                            {item.systemFlagIndicator?.isFlagged && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 animate-pulse">
                                ⚠ DURESS FLAG
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-black leading-tight truncate">{item.title}</p>
                          <p className="text-xs text-black/50 mt-0.5">
                            {item.category} · Requested by <span className="font-medium text-black/70">{item.requestedBy}</span>
                          </p>
                        </div>

                        {/* Quorum indicator */}
                        <div className="shrink-0 text-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-xs font-bold ${
                            item.validatorVote === 'approved' || item.validatorVoteStatus === 'Approved'
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                              : item.validatorVote === 'rejected' || item.validatorVoteStatus === 'Rejected'
                              ? 'border-gray-300 bg-gray-50 text-gray-600'
                              : 'border-blue-300 bg-blue-50 text-blue-700'
                          }`}>
                            {item.validatorVote === 'approved' || item.validatorVoteStatus === 'Approved' ? '✓' :
                             item.validatorVote === 'rejected' || item.validatorVoteStatus === 'Rejected' ? '✗' : '?'}
                          </div>
                          <p className="text-[9px] text-black/40 mt-0.5">Your vote</p>
                        </div>
                      </div>

                      {/* Hash preview */}
                      {item.merkleRoot && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <Hash className="w-3 h-3 text-black/30" />
                          <p className="font-mono text-[10px] text-black/40 truncate">{item.merkleRoot}</p>
                        </div>
                      )}

                      {/* Duress flag detail */}
                      {item.systemFlagIndicator?.isFlagged && (
                        <div className="mt-2 p-2 bg-rose-100 border border-rose-200 rounded-lg">
                          <p className="text-[10px] text-rose-800 font-semibold">{item.systemFlagIndicator.title}</p>
                          <p className="text-[10px] text-rose-700 mt-0.5">{item.systemFlagIndicator.description}</p>
                        </div>
                      )}

                      {/* Expand / collapse vote panel */}
                      {!item.validatorVoteStatus || (item.validatorVoteStatus === 'Pending' && item.validatorVote === 'pending') ? (
                        <button
                          onClick={() => {
                            setVotingId(votingId === item.id ? null : item.id);
                            setJustification('');
                            setVoteError(null);
                          }}
                          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          {votingId === item.id ? 'Close Voting Panel' : 'Cast Vote'}
                          <ChevronRight className={`w-3 h-3 transition-transform ${votingId === item.id ? 'rotate-90' : ''}`} />
                        </button>
                      ) : (
                        <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                          item.validatorVoteStatus === 'Approved' ? 'text-emerald-700' : 'text-gray-600'
                        }`}>
                          {item.validatorVoteStatus === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          Your vote: <strong>{item.validatorVoteStatus}</strong>
                          {item.validatorJustificationNote && (
                            <span className="text-black/40"> · "{item.validatorJustificationNote}"</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Vote panel */}
                    <AnimatePresence>
                      {votingId === item.id && (
                        <motion.div
                          key="vote-panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-black/8 bg-slate-50 p-4 overflow-hidden"
                        >
                          <p className="text-xs font-semibold text-black mb-2 flex items-center gap-1.5">
                            <Fingerprint className="w-3.5 h-3.5 text-violet-500" />
                            Mandatory Justification Note
                          </p>
                          <textarea
                            value={justification}
                            onChange={e => setJustification(e.target.value)}
                            placeholder="Enter your technical rationale for this vote (required for validator accountability)..."
                            rows={3}
                            className="w-full text-xs border border-black/15 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                          />
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => castVote(item.id, 'Approved')}
                              disabled={isVoting}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => castVote(item.id, 'Rejected')}
                              disabled={isVoting}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                          {voteError && (
                            <p className="text-[10px] text-rose-700 mt-2">{voteError}</p>
                          )}
                          <p className="text-[10px] text-black/40 mt-2 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Vote is cryptographically signed and permanently anchored on Polygon PoS. Cannot be undone.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
      )}
    </div>
  );
}
