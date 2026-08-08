import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldAlert,
  Clock,
  Scale,
  FolderOpen,
  History,
  ChevronRight,
  Sparkles,
  Copy,
  X,
  Check,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Cpu,
  Layers,
  Fingerprint,
  Database,
  Key,
  Share2,
  Download,
  Activity,
  FileCheck,
  Eye,
  EyeOff,
  BarChart3,
  RefreshCw,
  Sliders,
  Award,
  Zap,
  Info,
  MapPin,
  UserCheck,
  Terminal,
  Send,
  Edit3
} from 'lucide-react';

interface CourtAuthorityDashboardProps {
  onSelectTab: (tabName: string) => void;
  onSelectCase?: (caseId: string) => void;
  role?: string;
}

interface AttentionItem {
  id: string;
  type: 'forgery' | 'vote' | 'precedent' | 'custody' | 'case';
  title: string;
  queue: string;
  urgency: 'URGENT' | 'HIGH' | 'MEDIUM';
  urgencyColor: string;
  badgeColor: string;
  timeLeft: string;
  details: string;
  courtNote: string;
  actionLabel: string;
  caseRef?: string;
  judgeInstruction?: string;
}

export function CourtAuthorityDashboard({
  onSelectTab,
  onSelectCase,
  role = 'Court Authority',
}: CourtAuthorityDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [votedItems, setVotedItems] = useState<Record<string, string>>({});
  
  // INNER DETAILED PAGE STATE
  const [activeDetailItem, setActiveDetailItem] = useState<AttentionItem | null>(null);
  const [detailInnerTab, setDetailInnerTab] = useState<'analysis' | 'ledger' | 'custody' | 'order'>('analysis');
  const [judicialOrderText, setJudicialOrderText] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState<string | null>(null);
  const [isSigningKey, setIsSigningKey] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // INDEPENDENT VALIDATOR STATE & REAL BACKEND DATA
  const [validatorSignedVotes, setValidatorSignedVotes] = useState<Record<string, string>>({});
  const [duressEscalated, setDuressEscalated] = useState(false);
  const [activeValidatorVoteModal, setActiveValidatorVoteModal] = useState<any | null>(null);
  const [validatorPin, setValidatorPin] = useState('');
  const [isSubmittingValidatorVote, setIsSubmittingValidatorVote] = useState(false);

  const [validatorDashboardData, setValidatorDashboardData] = useState<any | null>(null);
  const [isLoadingValidatorDashboard, setIsLoadingValidatorDashboard] = useState<boolean>(false);

  const fetchValidatorDashboard = async () => {
    setIsLoadingValidatorDashboard(true);
    try {
      const data = await api.getValidatorDashboard();
      setValidatorDashboardData(data);
      if (data?.activeDuressAlert) {
        setDuressEscalated(data.activeDuressAlert.escalated);
      }
    } catch (err: any) {
      console.log('Validator Dashboard load status:', err.message);
    } finally {
      setIsLoadingValidatorDashboard(false);
    }
  };

  useEffect(() => {
    if (role === 'Independent Validator') {
      fetchValidatorDashboard();

      // Real-time WebSocket connection to duress / validator event bus
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.hostname}:5000/ws/duress-bus`;
      let socket: WebSocket | null = null;
      try {
        socket = new WebSocket(wsUrl);
        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (
              msg.type === 'CONSENSUS_VOTE_CAST' ||
              msg.type === 'DURESS_ALERT_ACKNOWLEDGED' ||
              msg.type === 'SILENT_DURESS_TRIGGERED'
            ) {
              fetchValidatorDashboard();
            }
          } catch (e) {}
        };
      } catch (e) {}

      return () => {
        if (socket) socket.close();
      };
    }
  }, [role]);

  // Attention Items
  const attentionItems: AttentionItem[] = [
    {
      id: 'CR-2026-904',
      type: 'forgery',
      title: 'Digital Signature Mismatch on CCTV Exhibit #4',
      queue: 'Forgery Detection Engine',
      urgency: 'URGENT',
      urgencyColor: 'bg-rose-100 text-rose-800 border-rose-200',
      badgeColor: 'bg-rose-500',
      timeLeft: '2 hours left',
      details:
        'SHA-256 hash mismatch detected between field upload and central ledger. Frames 1400-1450 show potential frame insertion tampering.',
      courtNote: 'Requires judicial determination to admit or strike exhibit from trial record.',
      actionLabel: 'Inspect & Determine',
      caseRef: 'State of Maharashtra vs. R. K. Industries (Cyber Heist)',
      judgeInstruction: 'Verify frame timestamps against municipal traffic server backup ledger before issuing evidentiary order.',
    },
    {
      id: 'FIR-2026-102',
      type: 'vote',
      title: 'Forensic Hash Consensus Validation (Cyber Fraud)',
      queue: 'Consensus Voting',
      urgency: 'HIGH',
      urgencyColor: 'bg-amber-100 text-amber-800 border-amber-200',
      badgeColor: 'bg-amber-500',
      timeLeft: '12 hours left',
      details:
        '2 of 3 independent validators have attested hash integrity. Your vote is required to seal consensus block #89201.',
      courtNote: 'Awaiting your binding judicial validator signature to authorize evidence block sealing.',
      actionLabel: 'Cast Validator Vote',
      caseRef: 'Special Cyber Precinct vs. Unknown Network Actors',
      judgeInstruction: 'Review ZK-Proof zero-knowledge certificate before applying judicial multi-sig hardware token.',
    },
    {
      id: 'MH-CR-8821',
      type: 'precedent',
      title: 'Precedent-Twin: 94.2% Similarity with Landmark Case #2019-SC-44',
      queue: 'Precedent Analysis',
      urgency: 'HIGH',
      urgencyColor: 'bg-blue-100 text-blue-800 border-blue-200',
      badgeColor: 'bg-blue-500',
      timeLeft: 'Today',
      details:
        'AI legal precedent matcher identified identical evidentiary structure and chain-of-custody pattern as State v. Sharma (2019).',
      courtNote: 'Automated twin comparison ready for judicial review and precedent citation.',
      actionLabel: 'Analyze Precedent Twin',
      caseRef: 'TechCorp Solutions vs. Municipal Procurement Cell',
      judgeInstruction: 'Check Section 43A IT Act compliance vectors against Supreme Court 2019 precedent guidelines.',
    },
    {
      id: 'CR-2026-441',
      type: 'custody',
      title: 'Custody Transfer Approval to Special Forensic Unit',
      queue: 'Chain of Custody',
      urgency: 'MEDIUM',
      urgencyColor: 'bg-purple-100 text-purple-800 border-purple-200',
      badgeColor: 'bg-purple-500',
      timeLeft: '1 day left',
      details:
        'Officer R. Kulkarni requested transfer of physical hard drives to Zone 4 Forensics Lab under sealed barcode #EV-9022.',
      courtNote: 'Requires court authorization for physical evidence movement across precinct boundaries.',
      actionLabel: 'Authorize Custody Transfer',
      caseRef: 'Zone 4 Financial Fraud Task Force',
      judgeInstruction: 'Confirm biometric sign-off from Receiving Forensic Director prior to dispatch order.',
    },
  ];

  // Recent activity feed
  const recentActivities = [
    {
      id: 'act-1',
      action: 'Cast "Approve" vote on Consensus Case #FIR-2026-088',
      type: 'Vote Cast',
      timestamp: 'Today, 09:15 AM',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'act-2',
      action: 'Dismissed Forgery Flag on CCTV Audio Track #2 (Case #CR-2026-880)',
      type: 'Ruling Issued',
      timestamp: 'Yesterday, 04:30 PM',
      icon: Scale,
      iconColor: 'text-purple-600 bg-purple-50',
    },
    {
      id: 'act-3',
      action: 'Signed Judicial Attestation for Case #CR-2026-310',
      type: 'Attestation',
      timestamp: '04 Aug 2026, 11:20 AM',
      icon: ShieldCheck,
      iconColor: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'act-4',
      action: 'Approved Custody Transfer to Cyber Forensics Division',
      type: 'Custody Transfer',
      timestamp: '02 Aug 2026, 03:45 PM',
      icon: FolderOpen,
      iconColor: 'text-amber-600 bg-amber-50',
    },
  ];

  const handleExecuteOrder = (decision: 'ADMIT' | 'STRIKE' | 'APPROVE_VOTE' | 'REJECT_VOTE' | 'AUTHORIZE_TRANSFER') => {
    if (!activeDetailItem) return;

    setIsSigningKey(true);
    setTimeout(() => {
      setIsSigningKey(false);
      const decisionLabels: Record<string, string> = {
        ADMIT: 'Exhibit Admitted to Trial Record',
        STRIKE: 'Exhibit Struck & Flagged as Tampered',
        APPROVE_VOTE: 'Judicial Affirmative Vote Recorded on Block #89201',
        REJECT_VOTE: 'Judicial Dissent Vote Recorded on Block #89201',
        AUTHORIZE_TRANSFER: 'Sealed Custody Transfer Authorized',
      };

      const msg = decisionLabels[decision] || 'Judicial Determination Saved';
      setOrderSubmitted(msg);
      setVotedItems(prev => ({ ...prev, [activeDetailItem.id]: msg }));
      showToast(msg);
    }, 1200);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredAttention = attentionItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.queue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // IF AN INNER DETAILED PAGE IS ACTIVE
  if (activeDetailItem) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Breadcrumb & Return Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveDetailItem(null);
                setOrderSubmitted(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Back to Dashboard Overview</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                {activeDetailItem.id}
              </span>
              <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded border ${activeDetailItem.urgencyColor}`}>
                {activeDetailItem.urgency}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Queue:</span>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              {activeDetailItem.queue}
            </span>
          </div>
        </div>

        {/* TOAST */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Case Context Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-indigo-300 border border-white/15">
                <Scale className="w-3.5 h-3.5 text-indigo-300" />
                <span>Deep Judicial Review & Order Execution</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {activeDetailItem.title}
              </h1>
              <p className="text-xs text-slate-300 font-mono">
                Case Title: {activeDetailItem.caseRef}
              </p>
            </div>

            {orderSubmitted && (
              <div className="px-4 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-2 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{orderSubmitted}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
            <strong>Judicial Guidance Note:</strong> {activeDetailItem.judgeInstruction}
          </p>
        </div>

        {/* Inner Tab Navigation */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'analysis', label: '1. Forensic & Technical Inspection', icon: Cpu },
            { id: 'ledger', label: '2. Cryptographic Proof & Ledger', icon: ShieldCheck },
            { id: 'custody', label: '3. Chain of Custody Audit', icon: Fingerprint },
            { id: 'order', label: '4. Judicial Order & Multi-Sig Execution', icon: Scale },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDetailInnerTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                detailInnerTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: FORENSIC & TECHNICAL INSPECTION */}
        {detailInnerTab === 'analysis' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left 2 Cols: Detailed Evidence Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-indigo-600" /> Automated AI Anomaly Analysis Report
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Layer 2 & Layer 5 neural forensic verification output.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                    Confidence: 98.4%
                  </span>
                </div>

                {/* Evidence Details Cards */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Primary Exhibit Data</h4>
                  <p className="text-xs text-slate-800 leading-relaxed font-sans">
                    {activeDetailItem.details}
                  </p>
                </div>

                {/* Mock Spectral / Neural Graph */}
                <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-mono">Spectrum & Hash Consistency Vector</span>
                    <span className="text-amber-400 font-bold font-mono">Mismatch Detected @ Frame 1420</span>
                  </div>

                  <div className="h-28 w-full bg-slate-950 rounded-xl border border-white/10 p-4 flex items-end justify-between gap-1">
                    {[40, 55, 60, 45, 90, 95, 100, 20, 15, 80, 85, 70, 60, 50, 45, 40].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                        <div
                          className={`w-full rounded-t ${
                            i >= 6 && i <= 8 ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : 'bg-indigo-500/50'
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>00:00:00 (Start)</span>
                    <span className="text-rose-400 font-bold">Tamper Window (00:02:14 - 00:02:18)</span>
                    <span>00:05:00 (End)</span>
                  </div>
                </div>

                {/* Technical Metric Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <div className="bg-slate-50 p-3 font-bold text-slate-700 grid grid-cols-2 border-b border-slate-200">
                    <span>Metric Name</span>
                    <span>Diagnostic Value</span>
                  </div>
                  <div className="p-3 grid grid-cols-2 border-b border-slate-100">
                    <span className="text-slate-600">Expected SHA-256 Hash</span>
                    <span className="font-mono text-slate-900 font-bold">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                  </div>
                  <div className="p-3 grid grid-cols-2 border-b border-slate-100">
                    <span className="text-slate-600">Actual Ledger SHA-256 Hash</span>
                    <span className="font-mono text-rose-700 font-bold">a1c4d92298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b112</span>
                  </div>
                  <div className="p-3 grid grid-cols-2">
                    <span className="text-slate-600">Hardware TPM Sensor Signature</span>
                    <span className="text-emerald-700 font-bold">Verified Knox Hardware Key #9022</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Quick Actions & Court Authority Context */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" /> Judicial Decision Terminal
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Select a binding judicial action below to finalize determination for Case <strong className="text-slate-900">{activeDetailItem.id}</strong>.
                </p>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => handleExecuteOrder('STRIKE')}
                    disabled={isSigningKey}
                    className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Strike Exhibit from Record</span>
                  </button>

                  <button
                    onClick={() => handleExecuteOrder('ADMIT')}
                    disabled={isSigningKey}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Admit Exhibit to Record</span>
                  </button>

                  <button
                    onClick={() => setDetailInnerTab('order')}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span>Draft Custom Judicial Order</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: CRYPTOGRAPHIC PROOF & LEDGER */}
        {detailInnerTab === 'ledger' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs"
          >
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" /> Zero-Knowledge Cryptographic Proof Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable block hash proofs stored on the High Court decentralized node network.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold font-mono">
                Block #89201
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 text-slate-400">
                  <span>ZK-SNARK Proof Header</span>
                  <span className="text-emerald-400">Status: Validated (2/3 Multi-Sig)</span>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">// Merkle Root Digest</p>
                  <p className="text-indigo-300 break-all">0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</p>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="text-slate-400">// Court Validator Hardware Signature</p>
                  <p className="text-amber-300 break-all">ECDSA_SECP256K1_PUB_KEY: 04e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
                </div>
              </div>

              {/* 3-Party Validator Consensus Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Multi-Signature Quorum Nodes</h4>
                
                {[
                  { name: 'High Court Judicial Registrar Node', status: 'Signed & Attested', time: 'Today, 08:30 AM', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                  { name: 'State Cyber Crime Forensic Node', status: 'Signed & Attested', time: 'Today, 09:12 AM', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                  { name: 'Court Authority Bench (Your Required Signature)', status: votedItems[activeDetailItem.id] ? 'Signed by You' : 'Awaiting Your Signature', time: votedItems[activeDetailItem.id] ? 'Just Now' : 'Pending', icon: votedItems[activeDetailItem.id] ? CheckCircle2 : Clock, color: votedItems[activeDetailItem.id] ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50' },
                ].map((node, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${node.color}`}>
                        <node.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{node.name}</span>
                        <span className="text-slate-500 font-mono text-[11px]">{node.time}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-bold ${
                      node.status.includes('Signed') ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {node.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: CHAIN OF CUSTODY AUDIT */}
        {detailInnerTab === 'custody' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs"
          >
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-indigo-600" /> Physical & Digital Chain of Custody Timeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every custodian transition is recorded with GPS coordinates and hardware biometric stamps.
              </p>
            </div>

            <div className="relative pl-6 space-y-6 border-l-2 border-indigo-200 ml-3">
              {[
                { title: 'Evidence Seized at Scene', actor: 'Officer R. Kulkarni (Badge #8902)', location: 'Sector 4 Data Center, Mumbai', time: 'Oct 12, 2026 • 02:15 PM', status: 'Sealed in Tamper Bag #EV-9022' },
                { title: 'Transferred to Zone 4 Police Vault', actor: 'Custodian S. Patil', location: 'Zone 4 Central Evidence Locker', time: 'Oct 12, 2026 • 04:40 PM', status: 'RFID Logged & Verified' },
                { title: 'AI Forensic Hash Upload to Ledger', actor: 'Automated Ingestion Pipeline', location: 'High Court Cloud Node #1', time: 'Oct 13, 2026 • 09:00 AM', status: 'Hash Mismatch Flagged' },
                { title: 'Judicial Chamber Review Requested', actor: 'Court Authority Bench', location: 'Chambers 402, High Court', time: 'Today • Active', status: 'Pending Order' },
              ].map((step, idx) => (
                <div key={idx} className="relative space-y-1">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                    <span className="text-[11px] font-mono text-slate-400">{step.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">Actor: {step.actor} • Location: {step.location}</p>
                  <span className="inline-block px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold font-mono">
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 4: JUDICIAL ORDER & MULTI-SIG EXECUTION */}
        {detailInnerTab === 'order' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl"
          >
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" /> Formal Judicial Order Drafter & Digital Seal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Draft binding directions to be cryptographically signed and published to the High Court registry.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Order Title & Directions</label>
                <textarea
                  rows={5}
                  value={judicialOrderText}
                  onChange={(e) => setJudicialOrderText(e.target.value)}
                  placeholder="e.g., UPON HEARING Advocates for the State and inspecting the Layer 2 Forensic Report for CCTV Exhibit #4, IT IS HEREBY ORDERED that Exhibit #4 be struck from the record due to unverified frame insertion..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all leading-relaxed"
                />
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Key className="w-4 h-4 text-indigo-600" />
                  <span>Hardware Key Token Authentication Required</span>
                </div>
                <p className="text-indigo-900/80 leading-relaxed">
                  Submitting this order will prompt your YubiKey hardware token / PKI certificate to apply your binding digital signature.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleExecuteOrder('STRIKE')}
                  disabled={isSigningKey}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  {isSigningKey ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Applying Hardware Signature...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-amber-400" />
                      <span>Sign & Publish Official Court Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // INDEPENDENT VALIDATOR DASHBOARD VIEW
  if (role === 'Independent Validator') {
    if (isLoadingValidatorDashboard && !validatorDashboardData) {
      return (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 max-w-7xl mx-auto my-8">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Loading Validator Node Workspace...</h3>
          <p className="text-xs text-slate-500">Fetching live zero-knowledge consensus queries from server...</p>
        </div>
      );
    }

    const rawPending = validatorDashboardData?.pendingVotes || [];

    const filteredVotes = rawPending
      .filter((v: any) =>
        (v.id && v.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.queue && v.queue.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.zkProofType && v.zkProofType.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.caseTitle && v.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a: any, b: any) => b.waitTimeHours - a.waitTimeHours);

    const awaitingCount = validatorDashboardData?.summary?.consensusVotesAwaiting ?? 0;
    const analyticsReportsCount = validatorDashboardData?.summary?.encryptedAnalyticsReports ?? 0;
    const duressAlertsCount = validatorDashboardData?.summary?.duressAlertsCount ?? 0;
    const bottleneckText = validatorDashboardData?.summary?.bottleneckText || '0 Bottlenecks';
    const activeDuressAlert = validatorDashboardData?.activeDuressAlert;

    const handleConfirmVote = async (blockId: string, decision: 'Approve' | 'Reject') => {
      setIsSubmittingValidatorVote(true);
      try {
        const res = await api.castValidatorVote(blockId, decision, validatorPin);
        setValidatorSignedVotes(prev => ({ ...prev, [blockId]: decision }));
        setActiveValidatorVoteModal(null);
        setValidatorPin('');
        showToast(res.message || `Consensus Vote Cast on ${blockId} • Multi-Sig Block ${decision}`);
        await fetchValidatorDashboard();
      } catch (err: any) {
        showToast(err.message || 'Failed to cast consensus vote');
      } finally {
        setIsSubmittingValidatorVote(false);
      }
    };

    const handleAcknowledgeDuress = async (alertId?: string) => {
      try {
        const res = await api.acknowledgeDuressAlert(alertId);
        setDuressEscalated(true);
        showToast(res.message || 'Duress Protocol Acknowledged & Escalated to Command Dispatch');
        await fetchValidatorDashboard();
      } catch (err: any) {
        showToast(err.message || 'Failed to escalate duress alert');
      }
    };

    const displayLogs = validatorDashboardData?.activityLogs || [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-7xl mx-auto pb-12"
      >
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header & Neutrality Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Validator Node Active • Blind Consensus Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 pt-1">
                Welcome, {validatorDashboardData?.validatorUser?.fullName || 'Adv. A. Mehta'}
              </h2>
              <p className="text-slate-500 text-xs">
                Zero-Knowledge Validator Portal • Multi-party attestation dashboard with zero case content exposure.
              </p>
            </div>

            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Block ID or Hash (e.g. BLOCK-89201)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Zero-Knowledge Isolation Enforced
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed max-w-3xl">
                  {validatorDashboardData?.zeroKnowledgePolicy?.notice || 'You are operating in blind validation mode. Case titles, litigant names, and evidence files are strictly hidden to preserve absolute validator neutrality and eliminate contextual bias during multi-sig consensus.'}
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/10 text-slate-200 text-[10px] font-mono font-bold border border-white/10 shrink-0">
              ZK-SNARK Clean
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div
              onClick={() => onSelectTab('Consensus votes')}
              className="p-5 rounded-3xl bg-amber-50/60 border border-amber-200/90 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Consensus Votes Awaiting
                </span>
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-amber-950 tracking-tight">
                  {awaitingCount}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300 animate-pulse">
                  {bottleneckText}
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-800 flex items-center gap-1 group-hover:text-amber-950 transition-colors">
                <span>Open voting ledger</span>
                <ArrowRight className="w-3 h-3" />
              </p>
            </div>

            <div
              onClick={() => onSelectTab('Aggregate analytics')}
              className="p-5 rounded-3xl bg-blue-50/60 border border-blue-200/90 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Encrypted Analytics Reports
                </span>
                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-blue-950 tracking-tight">
                  {analyticsReportsCount}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Differential Privacy
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-800 flex items-center gap-1 group-hover:text-blue-950 transition-colors">
                <span>Inspect telemetry reports</span>
                <ArrowRight className="w-3 h-3" />
              </p>
            </div>

            <div
              onClick={() => {
                if (!duressEscalated) {
                  handleAcknowledgeDuress(activeDuressAlert?.id);
                }
              }}
              className="p-5 rounded-3xl bg-rose-50/60 border border-rose-200/90 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Duress Alerts
                </span>
                <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-rose-950 tracking-tight">
                  {duressEscalated ? 0 : duressAlertsCount}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  duressEscalated ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-200/80 text-rose-900 border-rose-300 animate-pulse'
                }`}>
                  {duressEscalated ? 'Escalated' : 'Field Alert Active'}
                </span>
              </div>
              <p className="text-xs font-semibold text-rose-800 flex items-center gap-1 group-hover:text-rose-950 transition-colors">
                <span>{duressEscalated ? 'View escalation log' : 'Acknowledge duress alert'}</span>
                <ArrowRight className="w-3 h-3" />
              </p>
            </div>
          </div>
        </div>

        {/* Duress Alert Banner */}
        {activeDuressAlert ? (
          <div className={`p-6 rounded-3xl border transition-all ${
            duressEscalated ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-200/90 shadow-sm'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  duressEscalated ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-700 animate-bounce'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded border ${
                      duressEscalated ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-rose-200 text-rose-900 border-rose-300'
                    }`}>
                      {duressEscalated ? 'ESCALATED TO DISPATCH' : `ACTIVE DURESS SIGNAL • ${activeDuressAlert.fieldNodeId}`}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-semibold">{activeDuressAlert.timeAgo}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeDuressAlert.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {activeDuressAlert.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {duressEscalated ? (
                  <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Protocol Escalated & Logged
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledgeDuress(activeDuressAlert.id)}
                    className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Acknowledge & Escalate Duress</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold">All Field Nodes Secure</h4>
                <p className="text-[11px] text-emerald-700">No active silent distress signals reported across field nodes.</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-xl text-[10px] font-mono font-bold text-emerald-800">
              HSM Monitor Online
            </span>
          </div>
        )}

        {/* Needs Your Attention List - Pending Votes Sorted by Wait Time */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      Needs Your Attention (Pending Votes)
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                      Sorted by Wait Time
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 pt-0.5">
                    Delayed validator sign-off directly bottlenecks block finalization on the distributed ledger. Longest waiting blocks are prioritized at the top.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {filteredVotes.map((item: any) => {
                  const signedStatus = validatorSignedVotes[item.id] || item.userSignedDecision;

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-blue-300 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${item.urgencyColor}`}>
                            {item.urgency}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-800">
                            {item.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            • {item.queue}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Waiting {item.waitTimeFormatted}</span>
                          <span className="text-[10px] text-amber-800 font-normal">({item.slaLimitFormatted})</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 font-mono">
                            Merkle Root: {item.merkleRoot ? `${item.merkleRoot.slice(0, 18)}...${item.merkleRoot.slice(-8)}` : '0x000...000'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                            {item.zkProofType || 'SNARK'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pt-1">
                          {item.cryptographicDetails}
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200/80">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-700">
                            Quorum: {item.quorumSigned}/{item.quorumTotal} Signatures
                          </span>
                          <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${(item.quorumSigned / item.quorumTotal) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {signedStatus ? (
                            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              Signed: {signedStatus}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveValidatorVoteModal(item);
                                setValidatorPin('');
                              }}
                              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                            >
                              <span>Cast Consensus Vote</span>
                              <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredVotes.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-900">
                      No pending votes matching filter.
                    </p>
                    <p className="text-xs text-slate-500">
                      All validator consensus queues are currently signed and sealed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Validator Activity Log
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {validatorDashboardData?.validatorUser?.nodeId || 'Node #IV-882'}
                </span>
              </div>

              <div className="space-y-4">
                {displayLogs.map((act: any, idx: number) => {
                  const Icon = act.icon === 'CheckCircle2' ? CheckCircle2 : act.icon === 'BarChart3' ? BarChart3 : act.icon === 'ShieldAlert' ? ShieldAlert : ShieldCheck;
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          {act.action}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] font-semibold text-slate-500">
                            {act.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {act.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => onSelectTab('Audit log')}
                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>View full validator audit log</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Consensus Vote Modal */}
        <AnimatePresence>
          {activeValidatorVoteModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Cast Multi-Sig Consensus Vote
                      </h3>
                      <p className="text-xs text-slate-500">
                        Block: <span className="font-mono font-bold text-slate-900">{activeValidatorVoteModal.id}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveValidatorVoteModal(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Queue:</span>
                      <span className="font-bold text-slate-900">{activeValidatorVoteModal.queue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duration Waiting:</span>
                      <span className="font-bold text-amber-800">{activeValidatorVoteModal.waitTimeFormatted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Proof Engine:</span>
                      <span className="font-mono font-bold text-blue-700">{activeValidatorVoteModal.zkProofType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Merkle Root:</span>
                      <span className="font-mono text-[11px] text-slate-800 truncate max-w-[200px]">
                        {activeValidatorVoteModal.merkleRoot}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      Zero Case Content Embedded. Your signature approves purely the mathematical integrity of the state hash.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Enter Validator 6-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={validatorPin}
                      onChange={(e) => setValidatorPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit PIN..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono tracking-widest text-sm outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActiveValidatorVoteModal(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmVote(activeValidatorVoteModal.id, 'Approve')}
                    disabled={isSubmittingValidatorVote || validatorPin.length !== 6}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
                  >
                    {isSubmittingValidatorVote ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Applying Digital Signature...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Sign Block</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // STANDARD MAIN COURT AUTHORITY DASHBOARD VIEW
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Top Header & Search Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-900 text-xs font-bold border border-indigo-200">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Judicial Portal Active • High Court Bench
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 pt-1">
              Good morning, Adv. A. Mehta
            </h2>
            <p className="text-slate-500 text-xs">
              Quick-glance overview of time-sensitive judicial queues and consensus state. Click any card or item for deep inner analysis.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Jump to case ID (e.g. CR-2026-904)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Summary Metric Cards with Direct Deep Links & Inner Nav */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Cases Directory */}
          <div
            onClick={() => onSelectTab('Case Files')}
            className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cases Directory
              </span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                14
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                +3 today
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
              <span>Open Case Files</span>
              <ArrowRight className="w-3 h-3" />
            </p>
          </div>

          {/* Card 2: Forgery flags awaiting decision */}
          <div
            onClick={() => onSelectTab('Forgery review')}
            className="p-5 rounded-3xl bg-rose-50/50 border border-rose-200/90 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Forgery Flags
              </span>
              <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-rose-950 tracking-tight">
                3
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                Action required
              </span>
            </div>
            <p className="text-xs text-rose-700 flex items-center gap-1 group-hover:text-rose-900 transition-colors">
              <span>Inspect flagged exhibits</span>
              <ArrowRight className="w-3 h-3" />
            </p>
          </div>

          {/* Card 3: Consensus votes awaiting your vote */}
          <div
            onClick={() => onSelectTab('Consensus votes')}
            className="p-5 rounded-3xl bg-amber-50/50 border border-amber-200/90 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Consensus Votes
              </span>
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-amber-950 tracking-tight">
                2
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                24h deadline
              </span>
            </div>
            <p className="text-xs text-amber-800 flex items-center gap-1 group-hover:text-amber-950 transition-colors">
              <span>Open voting ledger</span>
              <ArrowRight className="w-3 h-3" />
            </p>
          </div>

          {/* Card 4: Precedent Flags (Layer 6) */}
          <div
            onClick={() => onSelectTab('Precedent flags')}
            className="p-5 rounded-3xl bg-indigo-50/50 border border-indigo-200/90 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Precedent Flags
              </span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-indigo-950 tracking-tight">
                3
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                Layer 6 Outliers
              </span>
            </div>
            <p className="text-xs text-indigo-800 flex items-center gap-1 group-hover:text-indigo-950 transition-colors">
              <span>Inspect statistical flags</span>
              <ArrowRight className="w-3 h-3" />
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Needs Attention Today & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Needs Your Attention Today */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Needs Your Attention Today
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                    {filteredAttention.length} Pending
                  </span>
                </div>
                <p className="text-xs text-slate-500 pt-0.5">
                  Top time-sensitive items across all queues. Click any action button to open full deep inner analysis.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAttention.map((item) => {
                const voted = votedItems[item.id];

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-indigo-300 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${item.urgencyColor}`}
                        >
                          {item.urgency}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {item.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          • {item.queue}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{item.timeLeft}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {item.details}
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200/80">
                      <p className="text-xs italic text-slate-500">
                        Note: {item.courtNote}
                      </p>

                      <div className="flex items-center gap-2 shrink-0">
                        {voted ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {voted}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveDetailItem(item);
                              setDetailInnerTab('analysis');
                              setJudicialOrderText('');
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                          >
                            <span>{item.actionLabel}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredAttention.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-900">
                    No pending attention items matching search.
                  </p>
                  <p className="text-xs text-slate-500">
                    All time-sensitive queues are currently cleared.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Recent Activity Feed */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Your Recent Activity
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Audit Trail
              </span>
            </div>

            <div className="space-y-4">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${act.iconColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {act.action}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] font-semibold text-slate-500">
                          {act.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {act.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                onClick={() => onSelectTab('Audit log')}
                className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                <span>View complete audit history</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
