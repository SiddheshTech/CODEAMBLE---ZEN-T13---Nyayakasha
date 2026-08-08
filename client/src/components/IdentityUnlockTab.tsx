import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  Key,
  FileSignature,
  FileText,
  UserCheck,
  UserX,
  AlertOctagon,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  X,
  Check,
  Send,
  Building2,
  LockKeyhole,
  Scale,
  Award,
  History,
  Info,
  ChevronRight,
  ArrowLeft,
  Cpu,
  Fingerprint,
  FileCode,
  BookOpen,
  Sliders,
  Sparkles,
  Gavel,
  Printer,
  Copy,
  Share2,
  Layers,
  Activity,
  User,
  MapPin,
  FileCheck,
  Plus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export interface UnlockedIdentityData {
  realName: string;
  aadhaarPanHash: string;
  addressMasked: string;
  phoneEncrypted: string;
  emergencyContact: string;
  unlockedAt: string;
  unlockedByJudge: string;
  digitalSignature: string;
  accessDurationWindow: string;
}

export interface DirectiveEntry {
  id: string;
  judgeName: string;
  date: string;
  type: 'In-Camera Directive' | 'Transcript Restriction' | 'Security Detail' | 'Access Limit';
  note: string;
  hash: string;
}

export interface PrecedentMatch {
  caseId: string;
  title: string;
  court: string;
  relevanceScore: number;
  rulingSummary: string;
}

export interface IdentityUnlockRequest {
  id: string;
  caseId: string;
  caseTitle: string;
  courtBench: string;
  witnessAlias: string;
  witnessZkpHash: string;
  zkpMerkleRoot: string;
  witnessRiskIndex: number; // 0-100
  threatAssessmentSummary: string;
  protectionCategory: 'Grade A (Extreme Risk - 24/7 Police Protection)' | 'Grade B (High Risk - Masked Credentials)' | 'Grade C (Standard Protection)';
  requestingParty: string;
  requestingPartyRole: 'Special Prosecutor' | 'Defense Counsel' | 'Investigating Officer';
  counselBarId: string;
  counselAgency: string;
  statedLegalGrounds: string;
  statutoryProvision: string;
  timestamp: string;
  urgency: 'Critical' | 'High' | 'Standard';
  status: 'Pending Judicial Review' | 'Approved & Unlocked' | 'Rejected';
  validatorConsensus: string;
  relatedExhibits: { id: string; title: string; type: string; hash: string }[];
  statutoryChecklist: { item: string; passed: boolean; note: string }[];
  precedents: PrecedentMatch[];
  directives: DirectiveEntry[];
  unlockedDetails?: UnlockedIdentityData;
}

export interface PermanentUnlockLogEntry {
  logId: string;
  requestId: string;
  caseId: string;
  witnessAlias: string;
  judgeName: string;
  judgeKeyId: string;
  decision: 'Approved' | 'Rejected';
  timestamp: string;
  blockNumber: number;
  digitalSignatureHash: string;
  legalJustificationSummary: string;
}

const INITIAL_REQUESTS: IdentityUnlockRequest[] = [
  {
    id: 'REQ-UNK-2026-09',
    caseId: 'CR-2026-904',
    caseTitle: 'State vs. Sector 4 Cyber Heist Syndicate',
    courtBench: 'High Court Bench 3 (Presiding: Hon. Justice A. Mehta)',
    witnessAlias: 'Witness #904-B (Whistleblower Lead Systems Engineer)',
    witnessZkpHash: '0x3f7a91a288b3c4d5e6f7a8b9c0d1e2f3',
    zkpMerkleRoot: '0x8f2a...910b441a29c1',
    witnessRiskIndex: 92,
    threatAssessmentSummary: 'High probability of retaliatory coercion. Encrypted threats intercepted on darkweb communication nodes on July 29, 2026.',
    protectionCategory: 'Grade A (Extreme Risk - 24/7 Police Protection)',
    requestingParty: 'Adv. S. Ramanujam (Special Public Prosecutor)',
    requestingPartyRole: 'Special Prosecutor',
    counselBarId: 'BCI/MAH/2012/8904',
    counselAgency: 'State Special Cyber Crimes Directorate',
    statedLegalGrounds: 'Cross-examination necessity under Section 161 CrPC. Substantial forensic logs indicate witness witnessed key database decryption authorization code entry.',
    statutoryProvision: 'Judicial Evidence Act § 145 / Protection of Whistleblowers Order 2018',
    timestamp: '06 Aug 2026, 09:15 AM',
    urgency: 'Critical',
    status: 'Pending Judicial Review',
    validatorConsensus: '3 of 3 Nodes Verified (100% ZKP Integrity)',
    relatedExhibits: [
      { id: 'EXH-001', title: 'Encrypted Syslog Entry #890', type: 'Server Log', hash: '0x8f2a...910b' },
      { id: 'EXH-003', title: 'Hardware Security Module Audit Dump', type: 'Forensic Dump', hash: '0x77d1...9911' },
    ],
    statutoryChecklist: [
      { item: 'Section 161 CrPC Depositional Relevance', passed: true, note: 'Direct nexus established with server breach timestamp' },
      { item: 'Witness Protection Scheme 2018 Grade A Criteria', passed: true, note: 'Physical threat score 92/100 verified by Cyber Cell' },
      { item: 'Zero-Knowledge Cryptographic Proof Audit', passed: true, note: 'Merkle root signed across 3 High Court nodes' },
      { item: 'Proportionality & Non-Disclosure Exhaustion Test', passed: true, note: 'Identity required strictly for in-camera cross-examination' },
    ],
    precedents: [
      {
        caseId: 'SC-2022-108',
        title: 'Union of India vs. Cyber-Net Labs',
        court: 'Supreme Court of India',
        relevanceScore: 95.4,
        rulingSummary: 'Held that whistleblower identity in cyber espionage trials may be disclosed exclusively to presiding judges under sealed envelope procedure.',
      },
      {
        caseId: 'CR-2024-411',
        title: 'State vs. National Data Gateway',
        court: 'High Court of Bombay',
        relevanceScore: 89.1,
        rulingSummary: 'Established multi-sig judicial passkey requirement for ZKP identity decryption.',
      },
    ],
    directives: [
      {
        id: 'DIR-904-01',
        judgeName: 'Hon. Justice A. Mehta',
        date: '05 Aug 2026, 04:00 PM',
        type: 'In-Camera Directive',
        note: 'Court orders that all proceedings involving Witness #904-B shall be conducted in-camera without public or media attendance.',
        hash: '0xDIR_SEAL_904_881',
      },
    ],
  },
  {
    id: 'REQ-UNK-2026-11',
    caseId: 'MH-CR-8821',
    caseTitle: 'State vs. Land Registry Cartel (Deed Forgery)',
    courtBench: 'Civil & Criminal Sessions Bench 2',
    witnessAlias: 'Witness #8821-Alpha (Surrogate Deputy Registrar)',
    witnessZkpHash: '0x99a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4',
    zkpMerkleRoot: '0x55d4...91c0991a00ef',
    witnessRiskIndex: 68,
    threatAssessmentSummary: 'Moderate threat score. Defense counsel asserts alibi verification necessity.',
    protectionCategory: 'Grade B (High Risk - Masked Credentials)',
    requestingParty: 'Adv. M. Deshmukh (Lead Defense Counsel)',
    requestingPartyRole: 'Defense Counsel',
    counselBarId: 'BCI/MAH/2008/1102',
    counselAgency: 'High Court Criminal Defense Bar',
    statedLegalGrounds: 'Alibi contradiction verification under Criminal Procedure Code § 243. Defense asserts witness was absent from land office on disputed date of June 14, 2026.',
    statutoryProvision: 'Criminal Procedure Code § 243 (Defense Right of Summons)',
    timestamp: '05 Aug 2026, 03:40 PM',
    urgency: 'High',
    status: 'Pending Judicial Review',
    validatorConsensus: '3 of 3 Nodes Verified (100% ZKP Integrity)',
    relatedExhibits: [
      { id: 'EXH-201', title: 'Property Deed Scan #1984-A', type: 'TIFF Image', hash: '0x55d4...91c0' },
    ],
    statutoryChecklist: [
      { item: 'CrPC § 243 Defense Right of Summons', passed: true, note: 'Alibi material to defense argument' },
      { item: 'Witness Safety Protocol Check', passed: true, note: 'Masked identity sufficient for initial deposition' },
    ],
    precedents: [
      {
        caseId: 'SC-2020-044',
        title: 'State vs. K. L. Sharma',
        court: 'Supreme Court of India',
        relevanceScore: 91.0,
        rulingSummary: 'Mandated defense right to verify public officer alibi without compromising physical security.',
      },
    ],
    directives: [],
  },
  {
    id: 'REQ-UNK-2026-02',
    caseId: 'FIR-2026-102',
    caseTitle: 'State vs. Port Customs Smuggling Ring',
    courtBench: 'Commercial & Customs Special Bench 1',
    witnessAlias: 'Witness #102-Gamma (Port Logistics Auditor)',
    witnessZkpHash: '0x1234567890abcdef1234567890abcdef',
    zkpMerkleRoot: '0x1a99...33ef881023aa',
    witnessRiskIndex: 85,
    threatAssessmentSummary: 'Severe retaliation threat from international smuggling syndicate. Entered Witness Protection Scheme Grade A.',
    protectionCategory: 'Grade A (Extreme Risk - 24/7 Police Protection)',
    requestingParty: 'ACP V. Gaikwad (Crime Branch Special Wing)',
    requestingPartyRole: 'Investigating Officer',
    counselBarId: 'IPS/MH/2014/9912',
    counselAgency: 'Mumbai Police Crime Branch',
    statedLegalGrounds: 'Safety threat neutralization & formal enrollment into Witness Protection Scheme Grade A following SC 2018 guidelines.',
    statutoryProvision: 'Witness Protection Scheme (Supreme Court Landmark Order 2018)',
    timestamp: '01 Aug 2026, 11:00 AM',
    urgency: 'Standard',
    status: 'Approved & Unlocked',
    validatorConsensus: '3 of 3 Nodes Verified (100% ZKP Integrity)',
    relatedExhibits: [
      { id: 'EXH-101', title: 'Digital Waybills & Customs Entry Ledger', type: 'PDF Document', hash: '0x1a99...33ef' },
    ],
    statutoryChecklist: [
      { item: 'Supreme Court Witness Protection Scheme Grade A', passed: true, note: 'Approved under emergency judicial order' },
      { item: 'Judicial Passkey Digital Signature', passed: true, note: 'Signed by Hon. Justice K. V. Subramanian' },
    ],
    precedents: [],
    directives: [
      {
        id: 'DIR-102-01',
        judgeName: 'Hon. Justice K. V. Subramanian',
        date: '01 Aug 2026, 11:45 AM',
        type: 'Security Detail',
        note: 'Order issued to Armed Police Security Division to provide 24/7 tactical escort to witness residence.',
        hash: '0xDIR_SEAL_102_992',
      },
    ],
    unlockedDetails: {
      realName: 'Rameshwar B. Kadam (Senior Logistics Auditor)',
      aadhaarPanHash: '0x9871...A420 (Verified via UIDAI Vault)',
      addressMasked: 'Flat 402, Customs Officers Enclave, Dockyard West, Mumbai',
      phoneEncrypted: '+91 98*** **410 (Encrypted Channel #4)',
      emergencyContact: 'Commandant R. S. Shinde (Crime Branch Protection Cell)',
      unlockedAt: '01 Aug 2026, 11:45 AM',
      unlockedByJudge: 'Hon. Justice K. V. Subramanian (Bench 4)',
      digitalSignature: '0xSIG_JUDGE_KV_SUB_99018274A1C8',
      accessDurationWindow: '72 Hours (Expires 04 Aug 2026)',
    },
  },
  {
    id: 'REQ-UNK-2026-15',
    caseId: 'SHV-2291',
    caseTitle: 'State vs. Nexus Pharma (Substandard Drug Distribution)',
    courtBench: 'High Court Public Health & Pharma Bench 3',
    witnessAlias: 'Witness #2291-Beta (QC Senior Chemist)',
    witnessZkpHash: '0x88e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
    zkpMerkleRoot: '0x99e2...0011449911a2',
    witnessRiskIndex: 78,
    threatAssessmentSummary: 'Corporate intimidation threats logged by state drug inspector.',
    protectionCategory: 'Grade B (High Risk - Masked Credentials)',
    requestingParty: 'Adv. A. Roy (State Special Prosecutor)',
    requestingPartyRole: 'Special Prosecutor',
    counselBarId: 'BCI/DEL/2010/4491',
    counselAgency: 'Directorate of Public Prosecutions',
    statedLegalGrounds: 'Authenticity verification of batch analysis report #NP-2026-88. Chemist signature required to confirm adulteration findings.',
    statutoryProvision: 'Drugs & Cosmetics Act § 25 / Evidence Act § 45',
    timestamp: '04 Aug 2026, 02:20 PM',
    urgency: 'High',
    status: 'Pending Judicial Review',
    validatorConsensus: '3 of 3 Nodes Verified (100% ZKP Integrity)',
    relatedExhibits: [
      { id: 'EXH-301', title: 'Batch Analysis Certificate #NP-2026-88', type: 'PDF Report', hash: '0x99e2...0011' },
    ],
    statutoryChecklist: [
      { item: 'Drugs & Cosmetics Act § 25 Analyst Verification', passed: true, note: 'Government Analyst report nexus established' },
      { item: 'Zero-Knowledge Proof Audit', passed: true, note: 'ZKP Hash anchor matched' },
    ],
    precedents: [],
    directives: [],
  },
  {
    id: 'REQ-UNK-2026-04',
    caseId: 'CR-2025-044',
    caseTitle: 'State vs. Sharma (Landmark Digital Contract Case)',
    courtBench: 'Supreme Court Precedent Division',
    witnessAlias: 'Witness #044-Epsilon (Smart Contract Auditor)',
    witnessZkpHash: '0x44aa55bb66cc77dd88ee99ff00112233',
    zkpMerkleRoot: '0x44aa...99bb00112233',
    witnessRiskIndex: 40,
    threatAssessmentSummary: 'Low physical risk score. Trial completed and sealed.',
    protectionCategory: 'Grade C (Standard Protection)',
    requestingParty: 'Adv. P. N. Merchant (Counsel)',
    requestingPartyRole: 'Defense Counsel',
    counselBarId: 'BCI/MAH/1999/0012',
    counselAgency: 'Supreme Court Bar Association',
    statedLegalGrounds: 'Retrial petition request based on contract code audit review.',
    statutoryProvision: 'Criminal Procedure Code § 397 (Revisionary Powers)',
    timestamp: '28 Jul 2026, 04:10 PM',
    urgency: 'Standard',
    status: 'Rejected',
    validatorConsensus: '3 of 3 Nodes Verified (100% ZKP Integrity)',
    relatedExhibits: [],
    statutoryChecklist: [
      { item: 'Statutory Necessity Test', passed: false, note: 'Failed: Case is permanently sealed under Supreme Court final order' },
    ],
    precedents: [],
    directives: [],
  },
];

const INITIAL_PERMANENT_LOG: PermanentUnlockLogEntry[] = [
  {
    logId: 'LOG-UNLOCK-0082',
    requestId: 'REQ-UNK-2026-02',
    caseId: 'FIR-2026-102',
    witnessAlias: 'Witness #102-Gamma',
    judgeName: 'Hon. Justice K. V. Subramanian',
    judgeKeyId: 'BENCH-KEY-IND-004',
    decision: 'Approved',
    timestamp: '01 Aug 2026, 11:45:02 AM',
    blockNumber: 88120,
    digitalSignatureHash: '0xSIG_JUDGE_KV_SUB_99018274A1C8',
    legalJustificationSummary: 'Admitted under Witness Protection Scheme Grade A. Full judicial record sealed.',
  },
  {
    logId: 'LOG-UNLOCK-0081',
    requestId: 'REQ-UNK-2026-04',
    caseId: 'CR-2025-044',
    witnessAlias: 'Witness #044-Epsilon',
    judgeName: 'Hon. Justice Archana P. Sen',
    judgeKeyId: 'BENCH-KEY-IND-001',
    decision: 'Rejected',
    timestamp: '28 Jul 2026, 04:12:30 PM',
    blockNumber: 86900,
    digitalSignatureHash: '0xSIG_JUDGE_APS_33918200B912',
    legalJustificationSummary: 'Rejected due to insufficient statutory grounds. Defense failed to demonstrate material relevance in sealed precedent.',
  },
];

export function IdentityUnlockTab() {
  const [requests, setRequests] = useState<IdentityUnlockRequest[]>(INITIAL_REQUESTS);
  const [logs, setLogs] = useState<PermanentUnlockLogEntry[]>(INITIAL_PERMANENT_LOG);

  // VIEW SELECTION: null = Directory/List; Request ID = Deep Detailed Inner Pager View
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // INNER DEEP SUB-TAB SELECTION
  const [innerSubTab, setInnerSubTab] = useState<
    'overview' | 'zkp_verification' | 'statutory_analysis' | 'decrypted_vault' | 'directives' | 'audit_log'
  >('overview');

  // FILTERS & SEARCH FOR REPOSITORY LIST
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // FORM & MODAL STATES inside Deep Detailed View
  const [judgePasskey, setJudgePasskey] = useState('JUDGE-BENCH-KEY-2026-SECRET');
  const [judgeRemarks, setJudgeRemarks] = useState('');
  const [agreedToLegalOath, setAgreedToLegalOath] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  // NEW DIRECTIVE FORM
  const [newDirectiveType, setNewDirectiveType] = useState<DirectiveEntry['type']>('In-Camera Directive');
  const [newDirectiveNote, setNewDirectiveNote] = useState('');

  // TOAST NOTIFICATION
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

  const filteredRequests = requests.filter((r) => {
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Pending' && r.status === 'Pending Judicial Review') ||
      (statusFilter === 'Approved' && r.status === 'Approved & Unlocked') ||
      (statusFilter === 'Rejected' && r.status === 'Rejected');

    const matchesUrgency = urgencyFilter === 'All' || r.urgency === urgencyFilter;

    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.witnessAlias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestingParty.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesUrgency && matchesSearch;
  });

  const handleOpenDeepView = (reqId: string, defaultTab: typeof innerSubTab = 'overview') => {
    setSelectedRequestId(reqId);
    setInnerSubTab(defaultTab);
    setJudgeRemarks('');
    setAgreedToLegalOath(false);
  };

  const handleAuthorizeOrReject = (decision: 'Approved' | 'Rejected') => {
    if (!selectedRequest) return;
    if (!agreedToLegalOath) {
      showToast('Mandatory Legal Statutory Oath acknowledgment is required before signing.');
      return;
    }
    if (!judgePasskey.trim()) {
      showToast('Judicial Private Signature Token is required.');
      return;
    }

    setIsSigning(true);

    setTimeout(() => {
      const now = new Date();
      const timestampStr =
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const sigHash = `0xSIG_JUDGE_${decision === 'Approved' ? 'APP' : 'REJ'}_${Math.floor(
        Math.random() * 899999 + 100000
      )}`;

      const updatedUnlockedDetails: UnlockedIdentityData = {
        realName: 'Anil Kumar S. Sharma (Principal Systems Engineer)',
        aadhaarPanHash: '0x7782...A912 (Verified UIDAI Cryptographic Vault)',
        addressMasked: 'Plot 104, Tech Park Enclave, Sector 4, Navi Mumbai',
        phoneEncrypted: '+91 99*** **102 (Encrypted Channel #2)',
        emergencyContact: 'Commandant R. Kulkarni (State Special Cyber Cell)',
        unlockedAt: timestampStr,
        unlockedByJudge: 'Hon. Presiding Magistrate (Bench 3)',
        digitalSignature: sigHash,
        accessDurationWindow: '48 Hours (In-Camera Cross Examination Window)',
      };

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === selectedRequest.id) {
            return {
              ...r,
              status: decision === 'Approved' ? 'Approved & Unlocked' : 'Rejected',
              unlockedDetails: decision === 'Approved' ? updatedUnlockedDetails : undefined,
            };
          }
          return r;
        })
      );

      // Append to Permanent Ledger Log
      const newLog: PermanentUnlockLogEntry = {
        logId: `LOG-UNLOCK-${String(logs.length + 83).padStart(4, '0')}`,
        requestId: selectedRequest.id,
        caseId: selectedRequest.caseId,
        witnessAlias: selectedRequest.witnessAlias,
        judgeName: 'Hon. Presiding Magistrate (Bench 3)',
        judgeKeyId: 'BENCH-KEY-IND-003',
        decision,
        timestamp: timestampStr,
        blockNumber: 89350 + logs.length,
        digitalSignatureHash: sigHash,
        legalJustificationSummary: judgeRemarks || selectedRequest.statedLegalGrounds,
      };

      setLogs((prev) => [newLog, ...prev]);

      setIsSigning(false);
      showToast(
        `Identity Disclosure Request ${selectedRequest.id} ${decision.toUpperCase()}. Signed with hash ${sigHash.substring(0, 16)}...`
      );

      // Automatically pivot to Decrypted Vault tab if approved
      if (decision === 'Approved') {
        setInnerSubTab('decrypted_vault');
      }
    }, 700);
  };

  const handleAddDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !newDirectiveNote.trim()) return;

    const newDir: DirectiveEntry = {
      id: `DIR-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-3)}`,
      judgeName: 'Hon. Presiding Magistrate (Bench 3)',
      date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      type: newDirectiveType,
      note: newDirectiveNote,
      hash: `0xDIR_SEAL_${Math.floor(Math.random() * 899 + 100)}`,
    };

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === selectedRequestId) {
          return {
            ...r,
            directives: [newDir, ...r.directives],
          };
        }
        return r;
      })
    );

    setNewDirectiveNote('');
    showToast('Judicial Directive Executed & Cryptographically Sealed');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto font-sans pb-16"
    >
      {/* GLOBAL TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center justify-between gap-4 border border-amber-500/30 max-w-lg"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW 1: REPOSITORY LIST OF DISCLOSURE REQUESTS */}
      {!selectedRequestId ? (
        <div className="space-y-6">
          {/* Header Banner - High Court Bench Authority Clearance */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Scale className="w-64 h-64 text-amber-300" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
                  <LockKeyhole className="w-3.5 h-3.5 text-amber-400" />
                  Judge-Tier Restricted Vault • High Security Authorization
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Witness Identity Unlock Portal
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Cryptographic portal for Presiding Magistrates to inspect Layer-3 Zero-Knowledge protected witness disclosures, evaluate statutory necessity, and append digital signatures.
                </p>
              </div>

              {/* Status Metrics Cards */}
              <div className="grid grid-cols-3 gap-3 shrink-0">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Pending Review</span>
                  <span className="text-xl font-bold text-amber-400 font-mono">
                    {requests.filter((r) => r.status === 'Pending Judicial Review').length}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Approved</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">
                    {requests.filter((r) => r.status === 'Approved & Unlocked').length}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">Rejected</span>
                  <span className="text-xl font-bold text-rose-400 font-mono">
                    {requests.filter((r) => r.status === 'Rejected').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-amber-200/80 flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
                <strong>PRAMANA Mandate:</strong> Every identity unlock requires individual review and an isolated cryptographic digital signature.
              </span>
              <span className="font-mono text-[11px] bg-white/10 px-3 py-1 rounded-full text-white">
                Active Bench Key: BENCH-KEY-IND-003
              </span>
            </div>
          </div>

          {/* Filter, Search, and Sort Toolbar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      statusFilter === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'Pending' ? 'Pending Review' : st}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Urgency Filter */}
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                >
                  <option value="All">All Priority Urgencies</option>
                  <option value="Critical">Critical Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Standard">Standard Priority</option>
                </select>

                {/* Search Input */}
                <div className="w-full sm:w-72 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search request ID, case, witness..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-indigo-500 placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* List Cards of Disclosure Requests */}
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => handleOpenDeepView(req.id, 'overview')}
                  className={`p-6 rounded-3xl border transition-all space-y-4 cursor-pointer group hover:shadow-md ${
                    req.status === 'Pending Judicial Review'
                      ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400'
                      : req.status === 'Approved & Unlocked'
                      ? 'bg-emerald-50/20 border-emerald-300'
                      : 'bg-rose-50/20 border-rose-200'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                          {req.id}
                        </span>
                        <span className="text-xs font-bold text-indigo-700">
                          Case: {req.caseId}
                        </span>
                        <span className="text-xs text-slate-400">• Submitted {req.timestamp}</span>
                        {req.urgency === 'Critical' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                            Critical Priority
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Risk: {req.witnessRiskIndex}/100
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {req.witnessAlias}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        Case Title: <strong className="text-slate-900">{req.caseTitle}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'Pending Judicial Review' && (
                        <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          Pending Judicial Review
                        </span>
                      )}
                      {req.status === 'Approved & Unlocked' && (
                        <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5">
                          <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                          Approved & Unlocked
                        </span>
                      )}
                      {req.status === 'Rejected' && (
                        <span className="px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold flex items-center gap-1.5">
                          <UserX className="w-3.5 h-3.5 text-rose-700" />
                          Request Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Context Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-white border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                        Requesting Party & Agency
                      </span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {req.requestingParty} ({req.requestingPartyRole})
                      </span>
                      <span className="text-slate-500 text-[11px] block mt-0.5 font-mono">
                        Bar ID: {req.counselBarId} • {req.counselAgency}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                        Stated Legal Grounds & Statutory Basis
                      </span>
                      <p className="font-medium text-slate-800 mt-0.5 line-clamp-2">
                        "{req.statedLegalGrounds}"
                      </p>
                      <span className="text-indigo-700 font-bold text-[10px] block mt-1">
                        Statute: {req.statutoryProvision}
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                      <Fingerprint className="w-3.5 h-3.5 text-indigo-600" />
                      ZKP Hash: {req.witnessZkpHash.substring(0, 22)}...
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeepView(req.id, 'overview');
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Open Deep Detailed File</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {req.status === 'Pending Judicial Review' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeepView(req.id, 'decrypted_vault');
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <FileSignature className="w-3.5 h-3.5" />
                          <span>Review & Sign</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredRequests.length === 0 && (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-900">No matching disclosure requests found</p>
                  <p className="text-xs text-slate-500">Try clearing your search query or changing filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* PERMANENT UNERASABLE JUDICIAL LOG TABLE */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <History className="w-4 h-4" />
                  Permanent Court Audit Log
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Immutable Identity Disclosure Log
                </h3>
                <p className="text-slate-500 text-xs">
                  Unerasable chronological ledger of all judicial disclosure approvals and rejections.
                </p>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-mono font-bold self-start sm:self-auto">
                {logs.length} Total Historical Decisions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider bg-slate-50">
                    <th className="py-3.5 px-4 rounded-l-2xl">Log ID & Block</th>
                    <th className="py-3.5 px-4">Request & Case</th>
                    <th className="py-3.5 px-4">Presiding Judge</th>
                    <th className="py-3.5 px-4">Decision</th>
                    <th className="py-3.5 px-4">Digital Signature Hash</th>
                    <th className="py-3.5 px-4 rounded-r-2xl">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.logId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div>{log.logId}</div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Block #{log.blockNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{log.requestId}</span>
                        <span className="text-slate-500 text-[11px]">{log.caseId} • {log.witnessAlias}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{log.judgeName}</div>
                        <span className="text-[10px] text-indigo-700 font-mono">
                          Key: {log.judgeKeyId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {log.decision === 'Approved' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300">
                            APPROVED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 text-[10px] font-bold border border-rose-300">
                            REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 max-w-[180px] truncate">
                        {log.digitalSignatureHash}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : selectedRequest ? (
        /* VIEW 2: DEEP DETAILED INNER PAGE / PAGER FOR SELECTED DISCLOSURE REQUEST */
        <div className="space-y-6">
          {/* Top Navigation & Action Header */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedRequestId(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Return to Requests Repository</span>
              </button>
              <div className="h-4 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                  {selectedRequest.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded border ${
                    selectedRequest.status === 'Pending Judicial Review'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : selectedRequest.status === 'Approved & Unlocked'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border-rose-300'
                  }`}
                >
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => showToast('Certified Disclosure Audit Certificate Exported as PDF')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export PDF Seal</span>
              </button>

              {selectedRequest.status === 'Pending Judicial Review' && (
                <button
                  onClick={() => setInnerSubTab('decrypted_vault')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <FileSignature className="w-4 h-4" />
                  <span>Perform Review & Sign</span>
                </button>
              )}
            </div>
          </div>

          {/* Hero Banner for Request */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-indigo-300 text-xs font-bold border border-white/15">
                    Case ID: {selectedRequest.caseId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-amber-300 text-xs font-bold border border-amber-400/30">
                    {selectedRequest.protectionCategory}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-slate-300 text-xs font-bold border border-white/15">
                    Threat Score: {selectedRequest.witnessRiskIndex}/100
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {selectedRequest.witnessAlias}
                </h1>

                <p className="text-xs text-slate-300 font-medium">
                  {selectedRequest.courtBench} • Counsel: {selectedRequest.requestingParty} ({selectedRequest.requestingPartyRole})
                </p>
              </div>

              {/* Status Badge */}
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center shrink-0 min-w-[150px]">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                  Validator Quorum
                </span>
                <span className="text-xs font-bold text-emerald-400 block mt-1">
                  {selectedRequest.validatorConsensus}
                </span>
              </div>
            </div>

            {/* Statutory Basis Bar */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Statutory Grounds:</span>
              <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200 font-mono text-[11px] border border-indigo-400/30">
                {selectedRequest.statutoryProvision}
              </span>
            </div>
          </div>

          {/* DEEP INNER SUB-TABS NAVIGATION PAGER */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {[
              { id: 'overview', label: '1. Executive Overview', icon: Cpu },
              { id: 'zkp_verification', label: '2. Cryptographic ZKP Verification', icon: Fingerprint },
              { id: 'statutory_analysis', label: '3. Statutory Standards & Precedents', icon: Scale },
              { id: 'decrypted_vault', label: '4. Identity Vault & Signing', icon: LockKeyhole },
              { id: 'directives', label: `5. Judicial Directives (${selectedRequest.directives.length})`, icon: Gavel },
              { id: 'audit_log', label: '6. Immutable Audit Chain', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setInnerSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  innerSubTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* INNER TAB 1: EXECUTIVE OVERVIEW */}
          {innerSubTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Stated Legal Necessity & Justification */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <FileText className="w-5 h-5 text-indigo-600" /> Stated Legal Ground & Judicial Necessity Test
                  </h3>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Submitted Counsel Justification Statement</span>
                    <p className="text-slate-900 font-medium leading-relaxed italic bg-white p-4 rounded-xl border border-slate-200">
                      "{selectedRequest.statedLegalGrounds}"
                    </p>
                  </div>

                  {/* Threat Assessment & Risk Score */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Witness Physical Security & Threat Score</h4>
                    <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between font-bold text-rose-950">
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          Threat Assessment Score
                        </span>
                        <span className="text-sm font-mono text-rose-700">{selectedRequest.witnessRiskIndex} / 100</span>
                      </div>
                      <p className="text-rose-900/80 leading-relaxed">{selectedRequest.threatAssessmentSummary}</p>
                    </div>
                  </div>

                  {/* Requesting Counsel Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Requesting Counsel</span>
                      <span className="font-bold text-slate-900 block">{selectedRequest.requestingParty}</span>
                      <span className="text-slate-500">{selectedRequest.requestingPartyRole}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Bar Association Credentials</span>
                      <span className="font-mono font-bold text-slate-900 block">{selectedRequest.counselBarId}</span>
                      <span className="text-slate-500">{selectedRequest.counselAgency}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Statutory Checklist & Quick Status */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Statutory Criteria Checklist
                  </h3>

                  <div className="space-y-3">
                    {selectedRequest.statutoryChecklist.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{item.item}</span>
                          {item.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-slate-500 text-[11px]">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 2: CRYPTOGRAPHIC ZKP VERIFICATION */}
          {innerSubTab === 'zkp_verification' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-indigo-600" /> Zero-Knowledge Proof & Merkle Anchor Verification
                    </h3>
                    <p className="text-xs text-slate-500">
                      Layer-3 ZKP proof guarantees identity authenticity without exposing raw PII prior to judicial unlock.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
                    100% Validated
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                    <span className="text-indigo-400 text-[10px] block font-bold uppercase">Witness ZKP Hash Anchor</span>
                    <span className="text-emerald-400 font-bold break-all block">{selectedRequest.witnessZkpHash}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                    <span className="text-indigo-400 text-[10px] block font-bold uppercase">Merkle Root Tree Hash</span>
                    <span className="text-emerald-400 font-bold break-all block">{selectedRequest.zkpMerkleRoot}</span>
                  </div>
                </div>

                {/* Linked Evidence Exhibits */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Associated Case Evidence Exhibits</h4>
                  <div className="space-y-2">
                    {selectedRequest.relatedExhibits.map((ex) => (
                      <div key={ex.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileCode className="w-4 h-4 text-indigo-600" />
                          <div>
                            <span className="font-bold text-slate-900 block">{ex.id}: {ex.title}</span>
                            <span className="text-slate-500 font-mono text-[11px]">{ex.type} • Hash: {ex.hash}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded">
                          Hash Aligned
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 3: STATUTORY STANDARDS & PRECEDENTS */}
          {innerSubTab === 'statutory_analysis' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
                  <BookOpen className="w-5 h-5 text-indigo-600" /> Judicial Precedents & Statutory Reference
                </h3>

                <div className="space-y-4">
                  {selectedRequest.precedents.map((prec) => (
                    <div key={prec.caseId} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{prec.caseId}: {prec.title}</span>
                        <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 font-bold text-[10px]">
                          {prec.relevanceScore}% Legal Relevance Match
                        </span>
                      </div>
                      <span className="text-slate-500 font-semibold block">{prec.court}</span>
                      <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                        "{prec.rulingSummary}"
                      </p>
                    </div>
                  ))}

                  {selectedRequest.precedents.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No precedent matches flagged for this case.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 4: DECRYPTED VAULT & SIGNING PANEL */}
          {innerSubTab === 'decrypted_vault' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {selectedRequest.status === 'Approved & Unlocked' && selectedRequest.unlockedDetails ? (
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/40 shadow-2xl space-y-6 font-mono">
                  <div className="flex items-center justify-between border-b border-emerald-800 pb-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      DECRYPTED WITNESS IDENTITY VAULT RECORD
                    </div>
                    <span className="text-xs text-emerald-300">
                      Unlocked on {selectedRequest.unlockedDetails.unlockedAt}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-800/60 space-y-1">
                      <span className="text-emerald-400 text-[10px] block">DECRYPTED LEGAL NAME</span>
                      <span className="text-white text-base font-bold font-sans">
                        {selectedRequest.unlockedDetails.realName}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-800/60 space-y-1">
                      <span className="text-emerald-400 text-[10px] block">IDENTITY HASH (UIDAI / PAN)</span>
                      <span className="text-white text-xs font-mono font-bold">
                        {selectedRequest.unlockedDetails.aadhaarPanHash}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-800/60 space-y-1">
                      <span className="text-emerald-400 text-[10px] block">MASKED RESIDENTIAL RECORD</span>
                      <span className="text-emerald-200 text-xs font-sans">
                        {selectedRequest.unlockedDetails.addressMasked}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-800/60 space-y-1">
                      <span className="text-emerald-400 text-[10px] block">EMERGENCY PROTECTION CONTACT</span>
                      <span className="text-emerald-200 text-xs font-sans">
                        {selectedRequest.unlockedDetails.emergencyContact}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-emerald-300">
                      <span>DIGITAL SIGNATURE: {selectedRequest.unlockedDetails.digitalSignature}</span>
                      <span>PRESIDING: {selectedRequest.unlockedDetails.unlockedByJudge}</span>
                    </div>
                    <p className="text-emerald-200/80 text-[11px] font-sans">
                      Disclosure window active: {selectedRequest.unlockedDetails.accessDurationWindow}. All views logged into permanent ledger.
                    </p>
                  </div>
                </div>
              ) : selectedRequest.status === 'Pending Judicial Review' ? (
                /* INTERACTIVE JUDICIAL DIGITAL SIGNATURE FORM */
                <div className="bg-white rounded-3xl border border-amber-300 p-6 sm:p-8 space-y-6 shadow-lg">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-base pb-3 border-b border-slate-100">
                    <FileSignature className="w-5 h-5 text-amber-600" />
                    Judicial Authority Authorization & Digital Signing Panel
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Judicial Bench Private Key / Security Passkey *
                      </label>
                      <div className="relative">
                        <Key className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={judgePasskey}
                          onChange={(e) => setJudgePasskey(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold outline-none focus:bg-white focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Judicial Remarks / Bench Directives Summary
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Enter specific judicial directives, in-camera conditions, or legal order rationale..."
                        value={judgeRemarks}
                        onChange={(e) => setJudgeRemarks(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:bg-white focus:border-amber-500"
                      />
                    </div>

                    <label className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToLegalOath}
                        onChange={(e) => setAgreedToLegalOath(e.target.checked)}
                        className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs text-amber-950 font-medium leading-relaxed">
                        I solemnly affirm under judicial oath that I have evaluated the statutory necessity test for Witness Identity Disclosure in accordance with the Witness Protection Scheme 2018.
                      </span>
                    </label>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={isSigning}
                        onClick={() => handleAuthorizeOrReject('Rejected')}
                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Reject Request</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSigning}
                        onClick={() => handleAuthorizeOrReject('Approved')}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isSigning ? 'Signing Block...' : 'Authorize & Decrypt Identity'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200 text-rose-900 space-y-2">
                  <UserX className="w-10 h-10 text-rose-600 mx-auto" />
                  <p className="text-sm font-bold">Identity Disclosure Rejected</p>
                  <p className="text-xs text-rose-700">
                    This request was rejected by judicial decision due to insufficient statutory grounds.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* INNER TAB 5: JUDICIAL DIRECTIVES */}
          {innerSubTab === 'directives' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Form to issue directive */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Gavel className="w-5 h-5 text-indigo-600" /> Issue Judicial Directive for this Request
                </h3>

                <form onSubmit={handleAddDirective} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Directive Category</label>
                      <select
                        value={newDirectiveType}
                        onChange={(e) => setNewDirectiveType(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                      >
                        <option value="In-Camera Directive">In-Camera Directive</option>
                        <option value="Transcript Restriction">Transcript Restriction</option>
                        <option value="Security Detail">Security Detail</option>
                        <option value="Access Limit">Access Limit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Directive Order Details</label>
                      <input
                        type="text"
                        placeholder="e.g. Order armed police escort during court transport..."
                        value={newDirectiveNote}
                        onChange={(e) => setNewDirectiveNote(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!newDirectiveNote.trim()}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Issue Court Order Directive</span>
                  </button>
                </form>

                {/* Timeline of Directives */}
                <div className="space-y-3 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Bench Directives</h4>
                  <div className="space-y-3">
                    {selectedRequest.directives.map((dir) => (
                      <div key={dir.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{dir.type}</span>
                          <span className="font-mono text-[10px] text-indigo-700">{dir.hash}</span>
                        </div>
                        <p className="text-slate-800 font-medium">{dir.note}</p>
                        <span className="text-slate-400 text-[10px] block">{dir.judgeName} • {dir.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 6: IMMUTABLE AUDIT CHAIN */}
          {innerSubTab === 'audit_log' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
                  <History className="w-5 h-5 text-indigo-600" /> Request Audit Log History
                </h3>

                <div className="space-y-3">
                  {logs
                    .filter((l) => l.requestId === selectedRequest.id)
                    .map((log) => (
                      <div key={log.logId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-slate-900">{log.logId} (Block #{log.blockNumber})</span>
                          <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                            {log.decision}
                          </span>
                        </div>
                        <p className="text-slate-700">{log.legalJustificationSummary}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                          <span>Sig: {log.digitalSignatureHash}</span>
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    ))}

                  {logs.filter((l) => l.requestId === selectedRequest.id).length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No decision logged for this request yet. Pending judicial review.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
