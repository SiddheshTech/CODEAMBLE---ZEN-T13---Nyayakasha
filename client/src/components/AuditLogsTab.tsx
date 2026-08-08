import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { 
  Filter, Search, Download, Clock, ShieldAlert, User, 
  FileText, Activity, ShieldCheck, ChevronRight, X, Eye, Key, MapPin,
  Lock, AlertTriangle, Vote, BarChart3, AlertCircle, CheckCircle2, Shield,
  Layers, RefreshCw, LockKeyhole, ExternalLink, Cpu, Hash, FileCheck, Award
} from 'lucide-react';

// ==================== DEFAULT GENERAL AUDIT LOGS ==================== //
const MOCK_LOGS = [
  { id: 'LOG-8829', action: "Evidence Sealed", type: "system", user: "Officer R. Kulkarni", time: "Oct 15, 2026 10:42 AM", status: "Success", ip: "192.168.1.104", hash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", details: "Image evidence EV-8824 sealed and recorded on blockchain." },
  { id: 'LOG-8828', action: "Login Attempt", type: "auth", user: "Unknown Device", time: "Oct 15, 2026 10:15 AM", status: "Blocked", ip: "45.22.19.11", hash: "-", details: "Failed login attempt. Incorrect credentials provided 3 times." },
  { id: 'LOG-8827', action: "User Login", type: "auth", user: "Officer R. Kulkarni", time: "Oct 15, 2026 10:00 AM", status: "Success", ip: "192.168.1.104", hash: "-", details: "Successful biometric authentication." },
  { id: 'LOG-8826', action: "Testimony Signed", type: "user", user: "Dr. Anjali Desai", time: "Oct 14, 2026 11:30 AM", status: "Success", ip: "10.0.4.55", hash: "4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5", details: "Digital testimony digitally signed using hardware token." },
  { id: 'LOG-8825', action: "Data Sync", type: "system", user: "System", time: "Oct 14, 2026 01:00 AM", status: "Success", ip: "localhost", hash: "-", details: "Automated daily ledger synchronization completed." },
  { id: 'LOG-8824', action: "Case Accessed", type: "access", user: "Judge M. Sharma", time: "Oct 13, 2026 04:20 PM", status: "Success", ip: "10.0.1.22", hash: "-", details: "Viewed case file FIR-2026-001 details." },
  { id: 'LOG-8823', action: "Evidence Decrypted", type: "system", user: "Validator Node 4", time: "Oct 13, 2026 02:15 PM", status: "Warning", ip: "10.0.5.10", hash: "-", details: "Evidence payload decrypted for independent validation." },
];

// ==================== INDEPENDENT VALIDATOR AUDIT DATASETS ==================== //

export interface ValidatorActionLog {
  id: string;
  timestamp: string;
  category: 'Vote Cast' | 'Analytics Reviewed' | 'Escalation Raised';
  actionName: string;
  targetScope: string;
  outcome: 'Approved' | 'Rejected' | 'Abstained' | 'Escalated' | 'Reviewed';
  txHash: string;
  blockNumber: number;
  details: string;
  validatorNodeId: string;
}

const VALIDATOR_OWN_LOGS: ValidatorActionLog[] = [
  {
    id: 'VAL-LOG-901',
    timestamp: 'Aug 07, 2026 08:42 AM',
    category: 'Escalation Raised',
    actionName: 'Escalated Statistical Anomaly to Oversight Board',
    targetScope: 'Zone 4 West Special Tribunal (FHE-AGG-2026-002)',
    outcome: 'Escalated',
    txHash: '0x8f7d9e2a3b1c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f',
    blockNumber: 1489201,
    details: 'Triggered formal inquiry escalation for 128% case duration spike in Zone 4. Routed ticket ESC-2026-88412 to Independent Judicial Oversight Board.',
    validatorNodeId: 'NODE-IND-VAL-04 (MH-DISTRICT-LEGAL-VALIDATOR)',
  },
  {
    id: 'VAL-LOG-902',
    timestamp: 'Aug 07, 2026 08:15 AM',
    category: 'Analytics Reviewed',
    actionName: 'Reviewed Layer 4 Homomorphic Case Duration Report',
    targetScope: 'Zone 3 East Cyber Precinct (FHE-AGG-2026-004)',
    outcome: 'Reviewed',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    blockNumber: 1489188,
    details: 'Inspected k-anonymity compliance (N=3810 > 50) and differential privacy noise parameters (ε=0.5). Verified zero identity leakage.',
    validatorNodeId: 'NODE-IND-VAL-04 (MH-DISTRICT-LEGAL-VALIDATOR)',
  },
  {
    id: 'VAL-LOG-903',
    timestamp: 'Aug 06, 2026 04:30 PM',
    category: 'Vote Cast',
    actionName: 'Consensus Vote: Evidence Sealing Request #REQ-8831',
    targetScope: 'Division Bench 2 (Commercial Disputes)',
    outcome: 'Approved',
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    blockNumber: 1488920,
    details: 'Verified Merkle root integrity and dual-custody police signature prior to casting affirmative consensus vote.',
    validatorNodeId: 'NODE-IND-VAL-04 (MH-DISTRICT-LEGAL-VALIDATOR)',
  },
  {
    id: 'VAL-LOG-904',
    timestamp: 'Aug 06, 2026 02:10 PM',
    category: 'Vote Cast',
    actionName: 'Consensus Vote: Unverified Re-hash Request #REQ-8829',
    targetScope: 'Zone 4 West Special Tribunal',
    outcome: 'Rejected',
    txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    blockNumber: 1488812,
    details: 'Cast negative vote due to missing Section 65B hash certificate from primary submitting agency.',
    validatorNodeId: 'NODE-IND-VAL-04 (MH-DISTRICT-LEGAL-VALIDATOR)',
  },
  {
    id: 'VAL-LOG-905',
    timestamp: 'Aug 05, 2026 11:20 AM',
    category: 'Analytics Reviewed',
    actionName: 'Inspected Bench-Level Precedent Alignment Matrix',
    targetScope: 'All 5 Court Districts (FHE-AGG-2026-001)',
    outcome: 'Reviewed',
    txHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    blockNumber: 1488410,
    details: 'Audited overall precedent similarity score (96.8%). Confirmed aggregate distribution within 2-sigma variance boundaries.',
    validatorNodeId: 'NODE-IND-VAL-04 (MH-DISTRICT-LEGAL-VALIDATOR)',
  },
  {
    id: 'VAL-LOG-906',
    timestamp: 'Aug 04, 2026 09:45 AM',
    category: 'Vote Cast',
    actionName: 'Consensus Vote: Section 144 Emergency Sealing #REQ-8812',
    targetScope: 'Division Bench 1 (Apex)',
    outcome: 'Approved',
    txHash: '0x9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
    blockNumber: 1487950,
    details: 'Validated high-security hardware token signature and cast affirmative vote for emergency record sealing.',
    validatorNodeId: 'NODE-IND-VAL-04 (MH-DISTRICT-LEGAL-VALIDATOR)',
  },
];

const SYSTEM_INTEGRITY_SUMMARY = [
  {
    id: 'SYS-CAT-01',
    category: 'Consensus Protection',
    metricTitle: 'Consensus Requests Blocked',
    countThisMonth: 3,
    periodLabel: 'This Month',
    status: 'Normal Safeguard Activity',
    description: '3 multi-party consensus requests were automatically blocked due to quorum non-fulfillment or invalid cryptographic proofs.',
    bgTone: 'bg-amber-500/10 border-amber-500/30 text-amber-900',
    iconColor: 'text-amber-600',
    badgeTone: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    id: 'SYS-CAT-02',
    category: 'Security Protocol',
    metricTitle: 'Duress & Panic Alerts Raised',
    countThisMonth: 1,
    periodLabel: 'This Month',
    status: 'Investigated & Cleared',
    description: '1 duress key sequence detected at terminal intake. Instantly triggered silent session isolation and audit escalation.',
    bgTone: 'bg-rose-500/10 border-rose-500/30 text-rose-900',
    iconColor: 'text-rose-600',
    badgeTone: 'bg-rose-100 text-rose-900 border-rose-300',
  },
  {
    id: 'SYS-CAT-03',
    category: 'Evidence Protection',
    metricTitle: 'Hash Mismatches Quarantined',
    countThisMonth: 14,
    periodLabel: 'This Month',
    status: 'Quarantined at Ingestion',
    description: '14 payload hashes failed Section 65B verification during edge node upload and were isolated before ledger commitment.',
    bgTone: 'bg-purple-500/10 border-purple-500/30 text-purple-900',
    iconColor: 'text-purple-600',
    badgeTone: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  {
    id: 'SYS-CAT-04',
    category: 'Immutable State Integrity',
    metricTitle: 'Unauthorized Ledger Re-writes',
    countThisMonth: 0,
    periodLabel: 'This Month',
    status: '100% Cryptographically Intact',
    description: '0 tamper attempts or state divergence incidents detected across all 5 distributed validator nodes.',
    bgTone: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900',
    iconColor: 'text-emerald-600',
    badgeTone: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    id: 'SYS-CAT-05',
    category: 'Anomaly Detection',
    metricTitle: 'High-Velocity Docket Spikes Flagged',
    countThisMonth: 12,
    periodLabel: 'This Month',
    status: 'Under Automated Monitoring',
    description: '12 statistical rate spikes flagged by homomorphic analytics engine without exposing underlying case data or party names.',
    bgTone: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-900',
    iconColor: 'text-indigo-600',
    badgeTone: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  },
];

export function AuditLogsTab({ role = 'Court Authority' }: { role?: string }) {
  // GENERAL AUDIT LOGS STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedLog, setSelectedLog] = useState<typeof MOCK_LOGS[0] | null>(null);
  const [realBackendLogs, setRealBackendLogs] = useState<any[]>([]);

  // Fetch Live Audit Log Chain from Real Backend API
  useEffect(() => {
    api.getAuditLog()
      .then(res => {
        if (res.auditChain && Array.isArray(res.auditChain)) {
          const mapped = res.auditChain.map((item: any) => ({
            id: item.id || `LOG-${item.index}`,
            action: item.eventType || 'System Event',
            type: item.userRole === 'SYSTEM' ? 'system' : 'auth',
            user: `${item.userId} (${item.userRole})`,
            time: item.timestamp,
            status: 'Success',
            ip: item.ipAddress || '127.0.0.1',
            hash: item.hash || '-',
            details: JSON.stringify(item.details || {})
          }));
          setRealBackendLogs(mapped);
        }
      })
      .catch(err => console.log('Audit log fetch info:', err.message));
  }, []);

  // INDEPENDENT VALIDATOR STATE
  const [validatorAuditTab, setValidatorAuditTab] = useState<'my_actions' | 'system_integrity'>('my_actions');
  const [valCategoryFilter, setValCategoryFilter] = useState<string>('All');
  const [valDateRangeFilter, setValDateRangeFilter] = useState<string>('All Time');
  const [valSearchQuery, setValSearchQuery] = useState<string>('');
  const [selectedValidatorLog, setSelectedValidatorLog] = useState<ValidatorActionLog | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);

  // INDEPENDENT VALIDATOR RENDER MODE
  if (role === 'Independent Validator') {
    const filteredValidatorLogs = VALIDATOR_OWN_LOGS.filter((log) => {
      const matchesSearch =
        log.actionName.toLowerCase().includes(valSearchQuery.toLowerCase()) ||
        log.targetScope.toLowerCase().includes(valSearchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(valSearchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(valSearchQuery.toLowerCase()) ||
        log.txHash.toLowerCase().includes(valSearchQuery.toLowerCase());

      const matchesCat =
        valCategoryFilter === 'All' ||
        log.category === valCategoryFilter;

      let matchesDate = true;
      if (valDateRangeFilter === 'Last 30 Days') {
        matchesDate = log.timestamp.includes('Aug') || log.timestamp.includes('Jul');
      } else if (valDateRangeFilter === 'Current Quarter') {
        matchesDate = log.timestamp.includes('Aug') || log.timestamp.includes('Jul') || log.timestamp.includes('Jun');
      }

      return matchesSearch && matchesCat && matchesDate;
    });

    const handleExportLog = () => {
      const headers = ['Log ID', 'Timestamp', 'Category', 'Action Name', 'Target Scope', 'Recorded Outcome', 'Block Number', 'Transaction Hash', 'Originally Submitted Justification Note'];
      const rows = filteredValidatorLogs.map((log) => [
        `"${log.id}"`,
        `"${log.timestamp}"`,
        `"${log.category}"`,
        `"${log.actionName.replace(/"/g, '""')}"`,
        `"${log.targetScope.replace(/"/g, '""')}"`,
        `"${log.outcome}"`,
        `"${log.blockNumber}"`,
        `"${log.txHash}"`,
        `"${log.details.replace(/"/g, '""')}"`
      ]);

      const csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Validator_Personal_Audit_Log_NODE-IND-VAL-04.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportToast('Personal Audit Log exported successfully as CSV for recordkeeping.');
      setTimeout(() => setExportToast(null), 4000);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-7xl mx-auto font-sans pb-16 relative"
      >
        {/* EXPORT TOAST NOTIFICATION */}
        <AnimatePresence>
          {exportToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{exportToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DETAIL PROOF MODAL FOR VALIDATOR LOG */}
        <AnimatePresence>
          {selectedValidatorLog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-indigo-500/30 text-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative"
              >
                <button
                  onClick={() => setSelectedValidatorLog(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Read-Only Action Proof &amp; Submitted Record
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {selectedValidatorLog.actionName}
                  </h2>
                  <p className="text-xs text-slate-300 font-mono">
                    Log Record ID: <strong className="text-white">{selectedValidatorLog.id}</strong> • Block #{selectedValidatorLog.blockNumber}
                  </p>
                </div>

                {/* IMMUTABILITY BADGE WARNING - EXPLICITLY ABSENT EDIT/DELETE */}
                <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-start gap-3">
                  <LockKeyhole className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <span className="font-extrabold text-indigo-200 uppercase tracking-wider block">
                      Read-Only View • Zero Edit / Delete Rights
                    </span>
                    <p className="text-indigo-100 leading-relaxed font-medium">
                      This log entry is cryptographically anchored in the distributed ledger. Edit and Delete controls are explicitly absent by design across the entire platform for all users, including system administrators.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Validator Node Identity</span>
                    <span className="font-mono text-white font-bold block">{selectedValidatorLog.validatorNodeId}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Timestamp &amp; Block Height</span>
                    <span className="font-mono text-white font-bold block">{selectedValidatorLog.timestamp} (Block #{selectedValidatorLog.blockNumber})</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Target Scope / Jurisdiction</span>
                    <span className="text-white font-bold block">{selectedValidatorLog.targetScope}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Recorded Action Outcome</span>
                    <span className="font-mono text-emerald-400 font-extrabold uppercase block">{selectedValidatorLog.outcome}</span>
                  </div>
                </div>

                {/* JUSTIFICATION NOTE ORIGINALLY SUBMITTED */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Originally Submitted Justification Note / Rationale
                  </span>
                  <p className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs text-indigo-100 leading-relaxed font-medium">
                    "{selectedValidatorLog.details}"
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Hash className="w-4 h-4 text-indigo-400" /> SHA-256 On-Chain Transaction Hash
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 font-mono text-[11px] text-emerald-400 break-all select-all">
                    {selectedValidatorLog.txHash}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedValidatorLog(null)}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Close Read-Only Record
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER BANNER - INDEPENDENT VALIDATOR IMMUTABLE AUDIT TRAIL */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Lock className="w-64 h-64 text-indigo-300" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Independent Validator Audit Trail
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
                  <LockKeyhole className="w-3.5 h-3.5 text-emerald-400" />
                  100% Read-Only &amp; Immutable
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Validator Action Logs &amp; Platform Integrity Summary
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                An immutable, unalterable historical record of every vote cast, analytics report reviewed, and escalation raised by this validator node — paired with category-level platform integrity indicators.
              </p>
            </div>

            {/* IMMUTABLE SEAL STAMP */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-2 shrink-0 min-w-[240px]">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300 uppercase tracking-wider">
                <span>Tamper-Proof Ledger</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-base font-extrabold text-white font-mono">
                NO EDIT / DELETE POWERS
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                Authentic audit trail verified via distributed Merkle roots across 5 nodes.
              </p>
            </div>
          </div>

          {/* TOP LEVEL STATS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Validator Actions Logged</span>
              <span className="text-xl font-extrabold font-mono text-white">6 Entries</span>
              <span className="text-[10px] text-emerald-400 block font-medium mt-0.5">Chronologically Anchored</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consensus Votes Cast</span>
              <span className="text-xl font-extrabold font-mono text-indigo-300">3 Votes</span>
              <span className="text-[10px] text-indigo-300 block font-medium mt-0.5">Dual-Custody Approvals</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Homomorphic Audits</span>
              <span className="text-xl font-extrabold font-mono text-emerald-300">2 Reports</span>
              <span className="text-[10px] text-emerald-300 block font-medium mt-0.5">k-Anonymity Verified</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Formal Escalations</span>
              <span className="text-xl font-extrabold font-mono text-rose-300">1 Inquiry</span>
              <span className="text-[10px] text-rose-300 block font-medium mt-0.5">Routed to Oversight Board</span>
            </div>
          </div>
        </div>

        {/* INNER PAGES / TABS NAVIGATION FOR VALIDATOR AUDIT LOGS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-4 gap-2">
            <button
              onClick={() => setValidatorAuditTab('my_actions')}
              className={`px-5 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all rounded-t-xl ${
                validatorAuditTab === 'my_actions'
                  ? 'border-indigo-600 text-indigo-950 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4 text-indigo-600" />
              <span>My Actions Tab</span>
            </button>

            <button
              onClick={() => setValidatorAuditTab('system_integrity')}
              className={`px-5 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all rounded-t-xl ${
                validatorAuditTab === 'system_integrity'
                  ? 'border-indigo-600 text-indigo-950 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <span>System Integrity Events Tab</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* MY ACTIONS TAB */}
            {validatorAuditTab === 'my_actions' && (
              <div className="space-y-6">
                {/* IMMUTABILITY EXPLICITLY ABSENT NOTICE */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-200">
                  <div className="flex items-center gap-2.5 font-medium">
                    <LockKeyhole className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Strict Immutability Enforced:</strong> Edit and Delete controls are explicitly absent by design across the entire application — for all user roles, including administrators.</span>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg shrink-0">
                    Zero Edit / Delete
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-1">
                      <Clock className="w-3 h-3 text-indigo-600" />
                      Individual Validator Personal History
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      My Personal Actions &amp; Activity Log
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Votes cast, reports reviewed, and escalations raised by this validator node (<strong className="text-slate-800 font-mono">NODE-IND-VAL-04</strong>)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* ACTION-TYPE FILTER DROPDOWN */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-2xl">
                      <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
                      <select
                        value={valCategoryFilter}
                        onChange={(e) => setValCategoryFilter(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-800 py-1.5 pr-2 outline-none cursor-pointer"
                      >
                        <option value="All">All Action Types</option>
                        <option value="Vote Cast">Votes Cast</option>
                        <option value="Analytics Reviewed">Analytics Reviews</option>
                        <option value="Escalation Raised">Escalations Raised</option>
                      </select>
                    </div>

                    {/* DATE-RANGE FILTER DROPDOWN */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-2xl">
                      <Clock className="w-3.5 h-3.5 text-slate-400 ml-2" />
                      <select
                        value={valDateRangeFilter}
                        onChange={(e) => setValDateRangeFilter(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-800 py-1.5 pr-2 outline-none cursor-pointer"
                      >
                        <option value="All Time">All Time</option>
                        <option value="Last 30 Days">Last 30 Days</option>
                        <option value="Current Quarter">Current Quarter</option>
                      </select>
                    </div>

                    {/* Search */}
                    <div className="w-full sm:w-52 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search actions..."
                        value={valSearchQuery}
                        onChange={(e) => setValSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-indigo-500"
                      />
                      {valSearchQuery && (
                        <button onClick={() => setValSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* EXPORT LOG BUTTON */}
                    <button
                      onClick={handleExportLog}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Log</span>
                    </button>
                  </div>
                </div>

                {/* TABLE OF CHRONOLOGICAL ACTIONS */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-5 py-3.5">Log ID &amp; Time</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Action Name &amp; Target Scope</th>
                        <th className="px-5 py-3.5">Recorded Outcome</th>
                        <th className="px-5 py-3.5">Block / Hash Proof</th>
                        <th className="px-5 py-3.5 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredValidatorLogs.map((log) => (
                        <tr
                          key={log.id}
                          onClick={() => setSelectedValidatorLog(log)}
                          className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                        >
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <span className="font-mono font-extrabold text-slate-900 block">{log.id}</span>
                              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {log.timestamp}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                log.category === 'Vote Cast'
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                  : log.category === 'Analytics Reviewed'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-900 border border-rose-300'
                              }`}
                            >
                              {log.category === 'Vote Cast' && <Vote className="w-3 h-3 text-blue-700" />}
                              {log.category === 'Analytics Reviewed' && <BarChart3 className="w-3 h-3 text-emerald-700" />}
                              {log.category === 'Escalation Raised' && <AlertTriangle className="w-3 h-3 text-rose-700" />}
                              {log.category}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="space-y-0.5 max-w-md">
                              <span className="font-bold text-slate-900 block leading-snug">{log.actionName}</span>
                              <span className="text-[11px] text-slate-500 block truncate font-medium">{log.targetScope}</span>
                            </div>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-extrabold uppercase ${
                                log.outcome === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.outcome === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : log.outcome === 'Escalated'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              {log.outcome}
                            </span>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="space-y-0.5 font-mono text-[11px]">
                              <span className="text-slate-900 font-bold block">Block #{log.blockNumber}</span>
                              <span className="text-slate-400 block max-w-[120px] truncate">{log.txHash}</span>
                            </div>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedValidatorLog(log);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>View details →</span>
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredValidatorLogs.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs">
                            No validator action logs found matching your filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SYSTEM INTEGRITY EVENTS TAB */}
            {validatorAuditTab === 'system_integrity' && (
              <div className="space-y-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold uppercase tracking-wider">
                    <ShieldAlert className="w-3 h-3 text-purple-600" />
                    Category-Level Platform Safeguards
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    System Integrity Events Summary
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Category-level system-wide security events (e.g. "Consensus request blocked," "Duress alert raised") with <strong>no case specifics, named parties, or docket details</strong>.
                  </p>
                </div>

                {/* SYSTEM INTEGRITY EVENT CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SYSTEM_INTEGRITY_SUMMARY.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                            {item.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeTone}`}>
                            {item.periodLabel}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-slate-900">
                            {item.metricTitle}
                          </h4>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold font-mono text-slate-900">
                              {item.countThisMonth}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              {item.status}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>Privacy Isolation:</span>
                        <strong className="text-emerald-700 font-bold">Zero Case Leakage</strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* IMMUTABLE LOG GUARANTEE FOOTER */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-extrabold text-white block">Genuine Immutable Audit Trail Enforced</span>
                      <p className="text-slate-400 text-[11px]">
                        Unlike self-reported logs, nothing on this audit page can be modified, appended out-of-order, or deleted by any validator node or system admin.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold bg-white/10 px-3 py-1.5 rounded-full text-slate-300 shrink-0">
                    Validated on Ledger v4.12
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // GENERAL DEFAULT RENDER FOR OTHER ROLES
  const logsToFilter = realBackendLogs.length > 0 ? [...realBackendLogs, ...MOCK_LOGS] : MOCK_LOGS;
  const filteredLogs = logsToFilter.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || log.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header & Controls */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-black/5 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-black mb-1">
              Immutable Audit Logs
            </h2>
            <p className="text-sm text-black/60">
              Complete, tamper-proof history of all system events, access requests, and state changes.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-[#F5F5F5] text-black hover:bg-black/5 rounded-xl transition-colors border border-black/5">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              placeholder="Search logs by ID, action, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border border-black/5 rounded-xl focus:bg-white focus:border-black/20 outline-none transition-all text-sm text-black"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['all', 'auth', 'system', 'access', 'user'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
                  filterType === type 
                    ? 'bg-black text-white border-black' 
                    : 'bg-[#F5F5F5] text-black/60 border-black/5 hover:bg-black/5'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white rounded-[2rem] border border-black/5 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F5]/50 border-b border-black/5">
                <th className="px-6 py-4 text-xs font-bold text-black/50 uppercase tracking-wider">Log ID &amp; Time</th>
                <th className="px-6 py-4 text-xs font-bold text-black/50 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-black/50 uppercase tracking-wider">User / Source</th>
                <th className="px-6 py-4 text-xs font-bold text-black/50 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-black/50 uppercase tracking-wider text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredLogs.map((log) => (
                <tr 
                  key={log.id} 
                  className="hover:bg-[#F5F5F5]/50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F5F5F5] border border-black/5 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-black/50" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black">{log.id}</p>
                        <p className="text-xs text-black/50">{log.time}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-bold text-black">{log.action}</p>
                    <p className="text-xs text-black/50 uppercase tracking-wider mt-0.5">{log.type}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-black/40" />
                      <span className="text-sm text-black/80">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      log.status === 'Success' ? 'bg-emerald-100 text-emerald-700' :
                      log.status === 'Blocked' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {log.status === 'Success' ? <ShieldCheck className="w-3 h-3" /> :
                       log.status === 'Blocked' ? <ShieldAlert className="w-3 h-3" /> :
                       <Activity className="w-3 h-3" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-xl transition-all">
                       <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-black/50 text-sm">
                    No logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center bg-[#F5F5F5]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black leading-tight">Log Details</h3>
                    <p className="text-xs text-black/50 font-mono mt-0.5">{selectedLog.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 text-black/50 hover:text-black hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Status Banner */}
                <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                   selectedLog.status === 'Success' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                   selectedLog.status === 'Blocked' ? 'bg-rose-50 border-rose-100 text-rose-900' :
                   'bg-amber-50 border-amber-100 text-amber-900'
                }`}>
                   <div className="shrink-0">
                     {selectedLog.status === 'Success' ? <ShieldCheck className="w-6 h-6 text-emerald-600" /> :
                      selectedLog.status === 'Blocked' ? <ShieldAlert className="w-6 h-6 text-rose-600" /> :
                      <Activity className="w-6 h-6 text-amber-600" />}
                   </div>
                   <div>
                     <p className="text-sm font-bold">{selectedLog.action}</p>
                     <p className="text-xs opacity-80">{selectedLog.details}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-black/40 uppercase tracking-wider">Timestamp</p>
                    <p className="text-sm font-medium text-black flex items-center gap-2">
                      <Clock className="w-4 h-4 text-black/40" />
                      {selectedLog.time}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-black/40 uppercase tracking-wider">Actor / User</p>
                    <p className="text-sm font-medium text-black flex items-center gap-2">
                      <User className="w-4 h-4 text-black/40" />
                      {selectedLog.user}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-black/40 uppercase tracking-wider">IP Address</p>
                    <p className="text-sm font-medium font-mono text-black flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-black/40" />
                      {selectedLog.ip}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-black/40 uppercase tracking-wider">Event Type</p>
                    <p className="text-sm font-medium text-black flex items-center gap-2">
                      <Activity className="w-4 h-4 text-black/40" />
                      {selectedLog.type.toUpperCase()}
                    </p>
                  </div>
                </div>

                {selectedLog.hash !== "-" && (
                  <div className="space-y-2 border-t border-black/5 pt-6">
                    <p className="text-xs font-bold text-black/40 uppercase tracking-wider flex items-center gap-2">
                      <Key className="w-4 h-4" /> Cryptographic Hash
                    </p>
                    <div className="bg-[#1A1A1A] p-4 rounded-xl relative group">
                      <p className="font-mono text-xs text-emerald-400 break-all leading-relaxed">
                        {selectedLog.hash}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
