import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SignatureCanvas from 'react-signature-canvas';
import { api } from '../services/api';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  X,
  Check,
  Search,
  Lock,
  UserCheck,
  FileCode,
  Info,
  ArrowLeft,
  ChevronRight,
  Scale,
  Fingerprint,
  History,
  Cpu,
  FileSearch,
  Gavel,
  Printer,
  Sliders,
  Layers,
  RefreshCw,
  Key,
  FileSignature,
  Award,
  Activity,
  Building,
  LockKeyhole,
  Unlock,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Copy,
  Share2,
  Plus,
  Database,
  Terminal,
  SlidersHorizontal,
  ArrowRight,
  Shield,
  FileText,
} from 'lucide-react';

export interface ConsensusNodeVote {
  nodeName: string;
  nodeRole: string;
  keyId: string;
  status: 'Approved' | 'Rejected' | 'Pending' | 'Flagged';
  timestamp: string;
  signatureHash: string;
}

export interface FieldDiff {
  fieldName: string;
  originalValue: string;
  proposedValue: string;
  impactLevel: 'Critical' | 'Major' | 'Minor';
  note: string;
}

export interface CustodyLog {
  id: string;
  stage: string;
  actor: string;
  role: string;
  timestamp: string;
  location: string;
  hashVerified: boolean;
  blockNumber: number;
}

export interface LegalPrecedent {
  citation: string;
  title: string;
  court: string;
  relevanceScore: number;
  principle: string;
}

export interface BenchDirective {
  id: string;
  date: string;
  issuedBy: string;
  type: 'CFSL Forensic Subpoena' | 'Device Seizure Directive' | 'In-Camera Demonstration Order' | 'Section 65B Certificate Re-audit' | 'Quorum Re-vote Order';
  details: string;
  status: 'Active' | 'Fulfilled' | 'Pending';
  sealHash: string;
}

export interface JudicialVoteDecision {
  action: 'Approved & Cast Vote' | 'Rejected & Struck Request' | 'Escalated for In-Camera Audit';
  judgeName: string;
  benchKeyId: string;
  timestamp: string;
  justification: string;
  digitalSignatureHash: string;
}

export interface ConsensusItem {
  id: string;
  caseRef: string;
  caseTitle: string;
  title: string;
  category: 'Metadata Correction' | 'Record Sealing' | 'Evidence Deletion' | 'Section 65B Re-hash' | 'Custody Handover';
  changeTypeLabel?: string;
  requestedBy: string;
  requestAgency: string;
  timestamp: string;
  status: 'Awaiting your vote' | 'Awaiting validator' | 'Flagged suspicious' | 'Approved' | 'Rejected';
  
  courtAuthorityVoteStatus?: 'Approved' | 'Pending' | 'Rejected';
  validatorVoteStatus?: 'Approved' | 'Pending' | 'Rejected';
  reasonForRequest?: string;

  systemFlagIndicator?: {
    isFlagged: boolean;
    flagType: string;
    title: string;
    description: string;
  } | null;

  thresholdRequired: '2 of 2' | '2 of 3';
  currentApprovalCount: number;
  totalRequiredCount: number;

  yourVote: 'pending' | 'approved' | 'rejected';
  validatorVote: 'pending' | 'approved' | 'rejected';
  auditorVote: 'pending' | 'approved' | 'rejected' | 'n/a';

  riskScore: number; // 0 to 100 (0 = Safe, 100 = Critical Risk)
  description: string;
  impactSummary: string;

  // Hashes & Blockchain
  targetRecordHash: string;
  proposedRecordHash: string;
  previousBlockHash: string;
  merkleRoot: string;
  blockNumber: number;

  // Multi-Node Consensus Details
  nodeVotes: ConsensusNodeVote[];

  // Payload Diffs
  fieldDiffs: FieldDiff[];

  // Audit Logs & Custody
  custodyLogs: CustodyLog[];

  // Legal Precedents
  precedents: LegalPrecedent[];

  // Bench Directives
  directives: BenchDirective[];

  // Recorded Decision
  judicialDecision?: JudicialVoteDecision;
  validatorJustificationNote?: string;
}

const INITIAL_CONSENSUS_QUEUE: ConsensusItem[] = [
  {
    id: 'CNS-2026-101',
    caseRef: 'CR-2026-904',
    caseTitle: 'State vs. Sector 4 Cyber Heist Syndicate',
    title: 'Evidence Record Metadata Offset Realignment (CCTV #04)',
    category: 'Metadata Correction',
    changeTypeLabel: 'correct evidence entry',
    requestedBy: 'Registry Clerk V. Deshmukh',
    requestAgency: 'High Court Registry Wing 3',
    timestamp: '12 Oct 2026, 10:14 AM',
    status: 'Awaiting your vote',

    courtAuthorityVoteStatus: 'Pending',
    validatorVoteStatus: 'Approved',
    reasonForRequest: 'Correction requested for timestamp offset (+04:00 hrs UTC drift) on CCTV dump container creation date to synchronize with municipal ISP gateway NTP logs.',
    systemFlagIndicator: null,

    thresholdRequired: '2 of 2',
    currentApprovalCount: 1,
    totalRequiredCount: 2,

    yourVote: 'pending',
    validatorVote: 'approved',
    auditorVote: 'n/a',

    riskScore: 28, // Low to moderate risk
    description: 'Correction requested for timestamp offset (+04:00 hrs UTC drift) on CCTV mobile dump file #4 to align with ISP gateway network NTP logs.',
    impactSummary: 'Re-aligns 50 video frame timestamps with verified ISP router packet logs without altering raw video payload hashes.',

    targetRecordHash: '0x8f2a9910b2a3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123',
    proposedRecordHash: '0x8f2a9910b2a3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0188',
    previousBlockHash: '0x3c1100984a890012bc889021a3345109',
    merkleRoot: '0x99a0b112c334d556e778f99011a22b33',
    blockNumber: 89201,

    nodeVotes: [
      {
        nodeName: 'Independent Validator Node #02',
        nodeRole: 'Certified Forensic Auditor',
        keyId: 'VAL-KEY-IND-002',
        status: 'Approved',
        timestamp: '12 Oct 2026, 10:20 AM',
        signatureHash: '0xSIG_VAL_APPROVED_8829100419283711',
      },
      {
        nodeName: 'High Court Presiding Magistrate (You)',
        nodeRole: 'Judicial Court Authority',
        keyId: 'BENCH-KEY-IND-003',
        status: 'Pending',
        timestamp: 'Awaiting Sign-off',
        signatureHash: '0xPENDING_JUDICIAL_SIGNATURE',
      },
    ],

    fieldDiffs: [
      {
        fieldName: 'container_creation_timestamp',
        originalValue: '2026-10-11T19:15:00.000Z (Uncalibrated UTC)',
        proposedValue: '2026-10-11T23:15:00.000Z (+04:00 NTP Adjusted)',
        impactLevel: 'Minor',
        note: 'Header creation date adjusted to match physical clock sync.',
      },
      {
        fieldName: 'timecode_track_reference',
        originalValue: 'LTC_INTERNAL_01',
        proposedValue: 'NTP_SERVER_MUNI_ZONE4',
        impactLevel: 'Minor',
        note: 'Timecode track linked to verified municipal NTP server authority.',
      },
    ],

    custodyLogs: [
      {
        id: 'CUST-101-01',
        stage: 'Metadata Correction Request Filed',
        actor: 'Clerk V. Deshmukh',
        role: 'Court Registry Clerk',
        timestamp: '12 Oct 2026, 10:14 AM',
        location: 'High Court Registry Office',
        hashVerified: true,
        blockNumber: 89195,
      },
      {
        id: 'CUST-101-02',
        stage: 'Independent Validator Signature Executed',
        actor: 'Dr. M. Roy',
        role: 'Independent Forensic Validator',
        timestamp: '12 Oct 2026, 10:20 AM',
        location: 'Node #02 Server Center',
        hashVerified: true,
        blockNumber: 89199,
      },
    ],

    precedents: [
      {
        citation: '(2020) 3 SCC 637',
        title: 'Arjun Panditrao Khotkar vs. Kailash Kushanrao Gorantyal',
        court: 'Supreme Court of India',
        relevanceScore: 96.4,
        principle: 'Metadata adjustments must be verified by dual-key threshold signatures to maintain admissibility under Section 65B.',
      },
    ],

    directives: [],
  },
  {
    id: 'CNS-2026-102',
    caseRef: 'SHV-2150',
    caseTitle: 'State vs. Land Registry Cartel (Deed Forgery)',
    title: 'Judicial Order under Section 144 to Seal Sensitive Witness Identity',
    category: 'Record Sealing',
    changeTypeLabel: 'seal judgment',
    requestedBy: 'Hon. Justice A. Mehta',
    requestAgency: 'Sessions Bench 2',
    timestamp: '11 Oct 2026, 04:30 PM',
    status: 'Awaiting validator',

    courtAuthorityVoteStatus: 'Approved',
    validatorVoteStatus: 'Pending',
    reasonForRequest: 'Judicial order restricting public ledger access to sensitive witness Aadhaar and biometric hashes under Section 144 witness protection protocol.',
    systemFlagIndicator: null,

    thresholdRequired: '2 of 2',
    currentApprovalCount: 1,
    totalRequiredCount: 2,

    yourVote: 'approved',
    validatorVote: 'pending',
    auditorVote: 'n/a',

    riskScore: 15,
    description: 'Judicial order restricting public ledger access to sensitive witness Aadhaar and biometric hashes under Section 144 witness protection protocol.',
    impactSummary: 'Converts witness identity fields to Zero-Knowledge Proof (ZKP) hashes on public ledger while preserving full unmasked data in Judicial Vault.',

    targetRecordHash: '0x4e9d110022f133a44b55c66d77e88f9900a11b22c33d44e55f66a77b88c99d00',
    proposedRecordHash: '0x4e9d110022f133a44b55c66d77e88f9900a11b22c33d44e55f66a77b88c99d88',
    previousBlockHash: '0x4e9d110022f133a44b55c66d77e88f90',
    merkleRoot: '0x88b11c22d33e44f55a66b77c88d99e00',
    blockNumber: 88910,

    nodeVotes: [
      {
        nodeName: 'High Court Presiding Magistrate (You)',
        nodeRole: 'Judicial Court Authority',
        keyId: 'BENCH-KEY-IND-003',
        status: 'Approved',
        timestamp: '11 Oct 2026, 04:35 PM',
        signatureHash: '0xSIG_BENCH_SEAL_9918230192837122',
      },
      {
        nodeName: 'Independent Validator Node #02',
        nodeRole: 'Certified Forensic Auditor',
        keyId: 'VAL-KEY-IND-002',
        status: 'Pending',
        timestamp: 'Awaiting Sign-off',
        signatureHash: '0xPENDING_VALIDATOR_SIGNATURE',
      },
    ],

    fieldDiffs: [
      {
        fieldName: 'witness_identity_visibility',
        originalValue: 'PUBLIC_LEDGER_UNMASKED',
        proposedValue: 'ZKP_ENCRYPTED_VAULT_SEALED',
        impactLevel: 'Major',
        note: 'Protects witness identity from public scraping while retaining cryptographic verifiability.',
      },
    ],

    custodyLogs: [
      {
        id: 'CUST-102-01',
        stage: 'In-Camera Sealing Motion Order Issued',
        actor: 'Hon. Justice A. Mehta',
        role: 'Presiding Judge',
        timestamp: '11 Oct 2026, 04:30 PM',
        location: 'Bench 2 Chambers',
        hashVerified: true,
        blockNumber: 88900,
      },
    ],

    precedents: [
      {
        citation: 'AIR 2017 SC 4161',
        title: 'K.S. Puttaswamy vs. Union of India',
        court: 'Supreme Court of India',
        relevanceScore: 99.1,
        principle: 'Judicial mandate to redact personal biometric identifiers from public court records to enforce Fundamental Right to Privacy.',
      },
    ],

    directives: [],
  },
  {
    id: 'CNS-2026-103',
    caseRef: 'SHV-1987',
    caseTitle: 'State vs. Port Customs Smuggling Ring',
    title: 'Unauthorized Request to Delete Evidence Entry (CCTV #2)',
    category: 'Evidence Deletion',
    changeTypeLabel: 'delete entry — flagged',
    requestedBy: 'Registry Assistant P. Nair',
    requestAgency: 'Zone 1 Customs Bureau',
    timestamp: '04 Aug 2026, 02:15 PM',
    status: 'Flagged suspicious',

    courtAuthorityVoteStatus: 'Pending',
    validatorVoteStatus: 'Pending',
    reasonForRequest: 'Requested deletion of primary CCTV exhibit video block #87110 citing corruption during customs transfer.',
    systemFlagIndicator: {
      isFlagged: true,
      flagType: 'Deletion Request',
      title: 'CRITICAL ANOMALY: Deletion Request Tied to Case with Prior Silent Duress Alert (#DURESS-SIG-04)',
      description: 'Attempted expungement of video evidence without judicial clearance. System detected silent duress PIN event logged by field officer on same case 42 mins ago.',
    },

    thresholdRequired: '2 of 3',
    currentApprovalCount: 0,
    totalRequiredCount: 2,

    yourVote: 'pending',
    validatorVote: 'rejected',
    auditorVote: 'rejected',

    riskScore: 94, // Critical Risk
    description: 'Deletion request for CCTV video segment #2 citing file corruption. Flagged as suspicious due to merkle hash chain mismatch.',
    impactSummary: 'PREVENTED: Unilateral removal of key CCTV evidence without judicial authorization would violate chain-of-custody integrity.',

    targetRecordHash: '0x99a1bb22cc33dd44ee55ff66aa77bb88cc99dd00ee11ff22aa33bb44cc55ff02',
    proposedRecordHash: '0x000000000000000000000000000000000000000000000000000000000000NULL',
    previousBlockHash: '0x99a1bb22cc33dd44ee55ff66aa77bb88',
    merkleRoot: '0x11223344556677889900aabbccddeeff',
    blockNumber: 87110,

    nodeVotes: [
      {
        nodeName: 'Independent Validator Node #01',
        nodeRole: 'Certified Forensic Auditor',
        keyId: 'VAL-KEY-IND-001',
        status: 'Rejected',
        timestamp: '04 Aug 2026, 02:20 PM',
        signatureHash: '0xSIG_VAL_REJECTED_CHAIN_MISMATCH_9921',
      },
      {
        nodeName: 'State Cyber Security Auditor Node',
        nodeRole: 'Cyber Crime Auditor',
        keyId: 'AUDIT-NODE-CYBER-04',
        status: 'Rejected',
        timestamp: '04 Aug 2026, 02:25 PM',
        signatureHash: '0xSIG_AUDIT_REJECTED_HASH_BREACH_0019',
      },
      {
        nodeName: 'High Court Presiding Magistrate (You)',
        nodeRole: 'Judicial Court Authority',
        keyId: 'BENCH-KEY-IND-003',
        status: 'Pending',
        timestamp: 'Awaiting Sign-off',
        signatureHash: '0xPENDING_JUDICIAL_SIGNATURE',
      },
    ],

    fieldDiffs: [
      {
        fieldName: 'evidence_record_status',
        originalValue: 'SEALED_IN_LEDGER_BLOCK_87110',
        proposedValue: 'DELETED_EXPUNGED_FROM_CHAIN',
        impactLevel: 'Critical',
        note: 'Attempted expungement of primary CCTV video exhibit without Section 65B clearance.',
      },
    ],

    custodyLogs: [
      {
        id: 'CUST-103-01',
        stage: 'Deletion Motion Logged',
        actor: 'Assistant P. Nair',
        role: 'Customs Officer',
        timestamp: '04 Aug 2026, 02:15 PM',
        location: 'Customs Terminal Station',
        hashVerified: false,
        blockNumber: 87110,
      },
      {
        id: 'CUST-103-02',
        stage: 'Automated Quorum Anomaly Alert Triggered',
        actor: 'MAYA-BREAK Consensus Shield',
        role: 'Automated Inspector',
        timestamp: '04 Aug 2026, 02:16 PM',
        location: 'High Court Gateway Node',
        hashVerified: false,
        blockNumber: 87111,
      },
    ],

    precedents: [
      {
        citation: '(2014) 10 SCC 473',
        title: 'Anvar P.V. vs. P.K. Basheer & Ors.',
        court: 'Supreme Court of India',
        relevanceScore: 98.9,
        principle: 'Spoliation or unauthorized deletion of electronic evidence creates adverse inference against the party in possession.',
      },
    ],

    directives: [
      {
        id: 'DIR-CNS-103-01',
        date: '04 Aug 2026, 03:00 PM',
        issuedBy: 'Hon. Presiding Magistrate (Bench 3)',
        type: 'CFSL Forensic Subpoena',
        details: 'Issued immediate freeze order on Zone 1 Customs Terminal workstation and summoned Assistant P. Nair for in-camera hearing.',
        status: 'Active',
        sealHash: '0xSEAL_DIR_CNS_103_7719',
      },
    ],
  },
  {
    id: 'CNS-2026-104',
    caseRef: 'SHV-2291',
    caseTitle: 'State vs. Nexus Pharma (Substandard Drug Distribution)',
    title: 'Section 65B Certificate Re-Hash for Seizure Inventory Ledger',
    category: 'Section 65B Re-hash',
    changeTypeLabel: 'Section 65B re-hash',
    requestedBy: 'Inspector S. Deshmukh',
    requestAgency: 'Food & Drug Control Wing',
    timestamp: '02 Aug 2026, 11:30 AM',
    status: 'Approved',

    courtAuthorityVoteStatus: 'Approved',
    validatorVoteStatus: 'Approved',
    reasonForRequest: 'Re-anchoring Section 65B certificate hash following updated batch testing laboratory analysis report.',
    systemFlagIndicator: null,

    thresholdRequired: '2 of 2',
    currentApprovalCount: 2,
    totalRequiredCount: 2,

    yourVote: 'approved',
    validatorVote: 'approved',
    auditorVote: 'n/a',

    riskScore: 8,
    description: 'Re-anchoring Section 65B certificate hash following updated batch testing laboratory analysis report.',
    impactSummary: 'Successfully verified and updated 65B hash chain with 100% consensus from Bench and Independent Validator.',

    targetRecordHash: '0x33b44c55d66e77f88a99b00c11d22e33f44a55b66c77d88e99f001122334455',
    proposedRecordHash: '0x33b44c55d66e77f88a99b00c11d22e33f44a55b66c77d88e99f001122334455',
    previousBlockHash: '0x33b44c55d66e77f88a99b00c11d22e33',
    merkleRoot: '0x3334445556667778889990001112223',
    blockNumber: 88104,

    nodeVotes: [
      {
        nodeName: 'High Court Presiding Magistrate (You)',
        nodeRole: 'Judicial Court Authority',
        keyId: 'BENCH-KEY-IND-003',
        status: 'Approved',
        timestamp: '02 Aug 2026, 11:40 AM',
        signatureHash: '0xSIG_BENCH_65B_CONFIRMED_8810029',
      },
      {
        nodeName: 'Independent Validator Node #02',
        nodeRole: 'Certified Forensic Auditor',
        keyId: 'VAL-KEY-IND-002',
        status: 'Approved',
        timestamp: '02 Aug 2026, 11:42 AM',
        signatureHash: '0xSIG_VAL_65B_CONFIRMED_9918233',
      },
    ],

    fieldDiffs: [
      {
        fieldName: 'section_65b_certificate_status',
        originalValue: 'PROVISIONAL_HASH_SEAL',
        proposedValue: 'FINAL_CERTIFIED_CFSL_SEAL',
        impactLevel: 'Minor',
        note: 'Upgraded provisional seal to permanent CFSL verified certificate.',
      },
    ],

    custodyLogs: [
      {
        id: 'CUST-104-01',
        stage: 'Re-hash Approval Completed',
        actor: 'Hon. Justice A. Mehta',
        role: 'Presiding Judge',
        timestamp: '02 Aug 2026, 11:45 AM',
        location: 'Bench 3 High Court',
        hashVerified: true,
        blockNumber: 88104,
      },
    ],

    precedents: [],
    directives: [],
  },
];

export function ConsensusApprovalsTab({ role = 'Court Authority' }: { role?: string }) {
  const [items, setItems] = useState<ConsensusItem[]>(INITIAL_CONSENSUS_QUEUE);

  // INDEPENDENT VALIDATOR STATE
  const [validatorTab, setValidatorTab] = useState<'pending' | 'history'>('pending');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected' | 'Flagged'>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [slideOverItemId, setSlideOverItemId] = useState<string | null>(null);

  const [validatorJustifications, setValidatorJustifications] = useState<Record<string, string>>({
    'CNS-2026-101': 'Verified against ISP router NTP clock logs. Time offset realignment is cryptographically valid and preserves raw payload hashes.',
  });
  const [validatorPins, setValidatorPins] = useState<Record<string, string>>({
    'CNS-2026-101': '882091',
    'CNS-2026-102': '882091',
    'CNS-2026-103': '882091',
    'CNS-2026-104': '882091',
  });
  const [validatorErrors, setValidatorErrors] = useState<Record<string, string | null>>({});

  const handleValidatorVoteSubmit = (itemId: string, voteAction: 'Approved' | 'Rejected') => {
    const note = (validatorJustifications[itemId] || '').trim();
    if (!note) {
      setValidatorErrors((prev) => ({
        ...prev,
        [itemId]: '⚠️ Mandatory Short Justification Note Required: You must state your reasoning before casting your vote to establish validator accountability.',
      }));
      return;
    }

    setValidatorErrors((prev) => ({ ...prev, [itemId]: null }));

    api.voteConsensus(itemId, voteAction === 'Approved' ? 'APPROVE' : 'REJECT', note, 'Validator Node 04')
      .catch(err => console.log('Backend vote consensus status:', err.message));

    const pin = (validatorPins[itemId] || '882091').trim();
    const now = new Date();
    const timestampStr =
      now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const sigHash = `0xSIG_VALIDATOR_${voteAction === 'Approved' ? 'ADM' : 'REJ'}_${Math.floor(
      Math.random() * 899999 + 100000
    )}`;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newVoteStatus = voteAction === 'Approved' ? 'approved' : 'rejected';
          let newStatus = item.status;

          if (voteAction === 'Rejected') {
            newStatus = 'Rejected';
          } else if (voteAction === 'Approved') {
            if (item.yourVote === 'approved' || item.courtAuthorityVoteStatus === 'Approved') {
              newStatus = 'Approved';
            } else {
              newStatus = 'Awaiting your vote';
            }
          }

          const newApprovalCount = voteAction === 'Approved' ? Math.min(item.totalRequiredCount, item.currentApprovalCount + 1) : item.currentApprovalCount;

          const updatedNodeVotes = [
            ...item.nodeVotes.filter((nv) => !nv.nodeRole.includes('Validator') && !nv.nodeName.includes('Validator')),
            {
              nodeName: 'Independent Validator Node #02 (You)',
              nodeRole: 'Certified Independent Validator',
              keyId: 'VAL-KEY-IND-002',
              status: voteAction === 'Approved' ? ('Approved' as const) : ('Rejected' as const),
              timestamp: timestampStr,
              signatureHash: sigHash,
            },
          ];

          return {
            ...item,
            status: newStatus,
            validatorVote: newVoteStatus,
            validatorVoteStatus: voteAction === 'Approved' ? 'Approved' : 'Rejected',
            currentApprovalCount: newApprovalCount,
            validatorJustificationNote: note,
            nodeVotes: updatedNodeVotes,
          };
        }
        return item;
      })
    );

    const targetItem = items.find((i) => i.id === itemId);
    showToast(`Validator Vote Cast for ${targetItem?.caseRef || itemId}: ${voteAction} • Mandatory Justification Recorded`);
  };

  // DEEP DETAILED VIEW SELECTION
  // null = Directory/List View; Item ID = Deep Detailed Inner Pager View
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // INNER DEEP SUB-TAB SELECTION
  const [innerSubTab, setInnerSubTab] = useState<
    'overview' | 'payload_diff' | 'crypto_proofs' | 'custody_audit' | 'statutory_rules' | 'bench_action'
  >('overview');

  // FILTERS & SEARCH FOR LIST REPOSITORY
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // JUDICIAL SIGNING FORM STATE
  const [judgePasskey, setJudgePasskey] = useState('JUDGE-BENCH-KEY-2026-SECRET');
  const [judgeRemarks, setJudgeRemarks] = useState('');
  const [agreedToOath, setAgreedToOath] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const sigPadRef = useRef<SignatureCanvas>(null);

  // NEW DIRECTIVE FORM
  const [newDirectiveType, setNewDirectiveType] = useState<BenchDirective['type']>('CFSL Forensic Subpoena');
  const [newDirectiveDetails, setNewDirectiveDetails] = useState('');

  // TOAST NOTIFICATION
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedItem = items.find((i) => i.id === selectedItemId);

  // Filtered List
  const filteredItems = items.filter((item) => {
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Awaiting' && (item.status === 'Awaiting your vote' || item.yourVote === 'pending')) ||
      (filterStatus === 'Flagged' && item.status === 'Flagged suspicious') ||
      (filterStatus === 'Approved' && item.status === 'Approved') ||
      (filterStatus === 'Rejected' && item.status === 'Rejected');

    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;

    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caseRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleOpenDeepView = (id: string, defaultTab: typeof innerSubTab = 'overview') => {
    setSelectedItemId(id);
    setInnerSubTab(defaultTab);
    setJudgeRemarks('');
    setAgreedToOath(false);
  };

  const handleJudicialVote = (voteAction: 'Approved & Cast Vote' | 'Rejected & Struck Request' | 'Escalated for In-Camera Audit') => {
    if (!selectedItem) return;
    if (!agreedToOath) {
      showToast('Mandatory Judicial Statutory Oath acknowledgment is required before threshold signing.');
      return;
    }
    if (!judgePasskey.trim()) {
      showToast('Judicial Private Signature Key Token is required.');
      return;
    }

    setIsSigning(true);

    setTimeout(() => {
      const now = new Date();
      const timestampStr =
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const sigHash = `0xSIG_BENCH_${voteAction.startsWith('Approved') ? 'ADM' : voteAction.startsWith('Rejected') ? 'REJ' : 'ESC'}_${Math.floor(
        Math.random() * 899999 + 100000
      )}`;

      const newYourVote: ConsensusItem['yourVote'] = voteAction.startsWith('Approved')
        ? 'approved'
        : 'rejected';

      let newStatus: ConsensusItem['status'] = selectedItem.status;
      if (voteAction.startsWith('Rejected')) {
        newStatus = 'Rejected';
      } else if (voteAction.startsWith('Approved')) {
        if (selectedItem.validatorVote === 'approved') {
          newStatus = 'Approved';
        } else {
          newStatus = 'Awaiting validator';
        }
      }

      const newApprovalCount =
        voteAction.startsWith('Approved') ? selectedItem.currentApprovalCount + 1 : selectedItem.currentApprovalCount;

      setItems((prev) =>
        prev.map((i) => {
          if (i.id === selectedItem.id) {
            return {
              ...i,
              status: newStatus,
              yourVote: newYourVote,
              currentApprovalCount: newApprovalCount,
              nodeVotes: i.nodeVotes.map((nv) => {
                if (nv.nodeRole.includes('Judicial')) {
                  return {
                    ...nv,
                    status: voteAction.startsWith('Approved') ? 'Approved' : 'Rejected',
                    timestamp: timestampStr,
                    signatureHash: sigHash,
                  };
                }
                return nv;
              }),
              judicialDecision: {
                action: voteAction,
                judgeName: 'Hon. Presiding Magistrate (Bench 3)',
                benchKeyId: 'BENCH-KEY-IND-003',
                timestamp: timestampStr,
                justification: judgeRemarks || 'Judicial threshold vote cast following payload diff audit.',
                digitalSignatureHash: sigHash,
              },
            };
          }
          return i;
        })
      );

      setIsSigning(false);
      showToast(
        `Consensus Vote for ${selectedItem.id} (${selectedItem.caseRef}) RECORDED: ${voteAction.toUpperCase()}. Signature: ${sigHash.substring(
          0,
          18
        )}...`
      );
    }, 700);
  };

  const handleAddDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !newDirectiveDetails.trim()) return;

    const newDir: BenchDirective = {
      id: `DIR-CNS-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-3)}`,
      date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      issuedBy: 'Hon. Presiding Magistrate (Bench 3)',
      type: newDirectiveType,
      details: newDirectiveDetails,
      status: 'Active',
      sealHash: `0xSEAL_DIR_${Math.floor(Math.random() * 8999 + 1000)}`,
    };

    setItems((prev) =>
      prev.map((i) => {
        if (i.id === selectedItemId) {
          return {
            ...i,
            directives: [newDir, ...i.directives],
          };
        }
        return i;
      })
    );

    setNewDirectiveDetails('');
    showToast('Bench Order / Directive Executed & Sealed to Case Diary.');
  };

  const awaitingCount = items.filter((i) => i.yourVote === 'pending').length;
  const flaggedCount = items.filter((i) => i.status === 'Flagged suspicious').length;
  const approvedCount = items.filter((i) => i.status === 'Approved').length;

  if (role === 'Independent Validator') {
    const pendingItems = items.filter((i) => i.validatorVote === 'pending');
    const historyItems = items.filter((i) => i.validatorVote !== 'pending');
    const tabSourceItems = validatorTab === 'pending' ? pendingItems : historyItems;

    const filteredValidatorItems = tabSourceItems.filter((item) => {
      const isFlagged = item.systemFlagIndicator?.isFlagged || item.status === 'Flagged suspicious';

      let matchesStatus = true;
      if (statusFilter === 'Pending') {
        matchesStatus = item.validatorVote === 'pending' || item.status.includes('Awaiting');
      } else if (statusFilter === 'Approved') {
        matchesStatus = item.validatorVote === 'approved' || item.status === 'Approved';
      } else if (statusFilter === 'Rejected') {
        matchesStatus = item.validatorVote === 'rejected' || item.status === 'Rejected';
      } else if (statusFilter === 'Flagged') {
        matchesStatus = isFlagged;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.caseRef.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.changeTypeLabel && item.changeTypeLabel.toLowerCase().includes(q)) ||
        item.requestedBy.toLowerCase().includes(q) ||
        item.requestAgency.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });

    const sortedValidatorItems = [...filteredValidatorItems].sort((a, b) => {
      if (sortOrder === 'oldest') {
        return a.id.localeCompare(b.id);
      } else {
        return b.id.localeCompare(a.id);
      }
    });

    const slideOverItem = items.find((i) => i.id === slideOverItemId);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-7xl mx-auto font-sans pb-16 relative"
      >
        {/* GLOBAL TOAST NOTIFICATION */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center justify-between gap-4 border border-indigo-500/30 max-w-lg"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Banner - Independent Validator Consensus Portal */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Lock className="w-64 h-64 text-indigo-300" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Independent Validator Portal • Zero-Knowledge Blind Validation Protocol
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Consensus Votes
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Review and vote on pending DHARMA consensus state change requests. To eliminate contextual bias and protect privacy, only case identifiers, change types, requesting agency, and payload diffs are surfaced — underlying evidence media and testimony transcripts are strictly obfuscated.
              </p>
            </div>

            {/* Status Metrics Cards */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center min-w-[100px]">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Pending Votes</span>
                <span className="text-xl font-bold text-amber-400 font-mono">
                  {pendingItems.length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center min-w-[100px]">
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">System Flags</span>
                <span className="text-xl font-bold text-rose-400 font-mono">
                  {items.filter((i) => i.systemFlagIndicator?.isFlagged || i.status === 'Flagged suspicious').length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center min-w-[100px]">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Votes Cast</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  {historyItems.length}
                </span>
              </div>
            </div>
          </div>

          {/* Zero-Knowledge Privacy Notice Banner */}
          <div className="relative z-10 p-4 rounded-2xl bg-indigo-950/80 border border-indigo-400/30 text-xs text-indigo-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <EyeOff className="w-4 h-4 text-amber-400" />
              <span>Zero-Knowledge Privacy Boundary Enforced (Stage 5)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              As an Independent Validator, your role is strictly to verify cryptographic hash chains and proposed change requests (e.g. deletion/alteration logs). Raw evidence images and video exhibits remain completely sealed from your view — only case IDs, change types, and cryptographic signatures are visible.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-indigo-200/80 flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-2">
              <LockKeyhole className="w-4 h-4 text-indigo-400 shrink-0" />
              <strong>Blind Validation Protocol:</strong> Zero case file contents or witness statements displayed. Validator accountability enforced via mandatory justification logs.
            </span>
            <span className="font-mono text-[11px] bg-white/10 px-3 py-1 rounded-full text-white">
              Validator Node: VAL-NODE-IND-002
            </span>
          </div>
        </div>

        {/* Main Section Card: Inner Tabs + Filter Controls + List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Inner Pages / Tabs Header */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-4 gap-2">
            <button
              onClick={() => {
                setValidatorTab('pending');
                setStatusFilter('All');
              }}
              className={`px-5 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all rounded-t-xl ${
                validatorTab === 'pending'
                  ? 'border-indigo-600 text-indigo-950 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Pending Requests (Awaiting Vote)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono font-bold">
                {pendingItems.length}
              </span>
            </button>

            <button
              onClick={() => {
                setValidatorTab('history');
                setStatusFilter('All');
              }}
              className={`px-5 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all rounded-t-xl ${
                validatorTab === 'history'
                  ? 'border-indigo-600 text-indigo-950 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4 text-indigo-600" />
              <span>Vote History (Past Cast Votes)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800 font-mono font-bold">
                {historyItems.length}
              </span>
            </button>
          </div>

          {/* List Toolbar & Filters */}
          <div className="p-6 border-b border-slate-100 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by case ID or request type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-indigo-500 placeholder:text-slate-400 shadow-2xs"
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

              {/* Status Filter Dropdown & Sort Control */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Status Filter:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Flagged">Flagged Suspicious</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Sort:</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* List View Rows */}
          <div className="p-6 space-y-3 bg-slate-50/50">
            {sortedValidatorItems.map((item) => {
              const isFlagged = item.systemFlagIndicator?.isFlagged || item.status === 'Flagged suspicious';

              return (
                <div
                  key={item.id}
                  onClick={() => setSlideOverItemId(item.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:shadow-md ${
                    isFlagged
                      ? 'bg-rose-50/40 border-rose-300 hover:border-rose-400'
                      : item.validatorVote === 'approved'
                      ? 'bg-emerald-50/20 border-emerald-200 hover:border-emerald-300'
                      : item.validatorVote === 'rejected'
                      ? 'bg-slate-100/80 border-slate-300 hover:border-slate-400'
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 border border-slate-800 shadow-2xs">
                        {item.category === 'Evidence Deletion' ? (
                          <AlertTriangle className="w-5 h-5 text-rose-400" />
                        ) : item.category === 'Record Sealing' ? (
                          <LockKeyhole className="w-5 h-5 text-indigo-400" />
                        ) : (
                          <FileCode className="w-5 h-5 text-blue-400" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                            {item.id}
                          </span>
                          <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200">
                            Case ID: {item.caseRef}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
                            {item.changeTypeLabel || item.category}
                          </span>
                          <span className="text-xs text-slate-400">• Requested {item.timestamp}</span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </h3>

                        <p className="text-xs text-slate-600 font-medium">
                          Requesting Party: <strong className="text-slate-900">{item.requestedBy}</strong> ({item.requestAgency})
                        </p>
                      </div>
                    </div>

                    {/* Status & Review Button */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Court Status */}
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                            <Gavel className="w-3 h-3 text-slate-500" />
                            Court: {item.courtAuthorityVoteStatus || 'Pending'}
                          </span>

                          {/* Validator Status */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                            item.validatorVote === 'approved'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : item.validatorVote === 'rejected'
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                          }`}>
                            <UserCheck className="w-3 h-3 text-indigo-600" />
                            Validator: {item.validatorVote === 'approved' ? 'Approved' : item.validatorVote === 'rejected' ? 'Rejected' : 'Pending'}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          Quorum: {item.currentApprovalCount} / {item.totalRequiredCount}
                        </span>
                      </div>

                      {/* Review Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlideOverItemId(item.id);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs shrink-0"
                      >
                        <span>{validatorTab === 'history' ? 'View Vote Details →' : 'Review →'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Flag warning strip if flagged */}
                  {isFlagged && item.systemFlagIndicator && (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="truncate"><strong>{item.systemFlagIndicator.title}:</strong> {item.systemFlagIndicator.description}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {sortedValidatorItems.length === 0 && (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-900">
                  {validatorTab === 'pending' ? 'No pending consensus requests awaiting your vote' : 'No past vote history found'}
                </p>
                <p className="text-xs text-slate-500">Try adjusting your status filter or search query.</p>
              </div>
            )}
          </div>
        </div>

        {/* SLIDE-OVER REQUEST DETAIL PANEL / MODAL */}
        <AnimatePresence>
          {slideOverItem && (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSlideOverItemId(null)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              />

              {/* Slide-over Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col font-sans overflow-hidden border-l border-slate-200"
              >
                {/* Drawer Header */}
                <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {slideOverItem.id}
                      </span>
                      <span className="text-xs font-mono font-extrabold px-3 py-0.5 rounded bg-white/10 text-white">
                        Case ID: {slideOverItem.caseRef}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider text-[10px]">
                        {slideOverItem.changeTypeLabel || slideOverItem.category}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white leading-snug">
                      {slideOverItem.title}
                    </h2>
                    <p className="text-xs text-slate-300">
                      Requested by <strong className="text-white">{slideOverItem.requestedBy}</strong> ({slideOverItem.requestAgency}) • {slideOverItem.timestamp}
                    </p>
                  </div>

                  <button
                    onClick={() => setSlideOverItemId(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Content Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Zero-Knowledge Isolation Banner */}
                  <div className="p-4 rounded-2xl bg-indigo-900 text-white border border-indigo-700 flex items-start gap-3 shadow-inner">
                    <ShieldAlert className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-200">
                        Zero-Knowledge Case Content Isolation Protocol
                      </h4>
                      <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                        This Independent Validator view displays strictly necessary technical payload diffs and change rationale for <strong>Case ID {slideOverItem.caseRef}</strong>. Underlying evidence media, transcripts, and litigant personal data are suppressed to prevent bias.
                      </p>
                    </div>
                  </div>

                  {/* System Flag if present */}
                  {slideOverItem.systemFlagIndicator?.isFlagged && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 space-y-2">
                      <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{slideOverItem.systemFlagIndicator.title}</span>
                      </div>
                      <p className="text-xs text-rose-800 leading-relaxed font-medium">
                        {slideOverItem.systemFlagIndicator.description}
                      </p>
                    </div>
                  )}

                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nature of Change</span>
                      <p className="text-xs font-medium text-slate-800 leading-relaxed">
                        {slideOverItem.description}
                      </p>
                      <span className="text-xs font-bold italic text-slate-900 block pt-1 border-t border-slate-200">
                        "{slideOverItem.impactSummary}"
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Rationale</span>
                      <p className="text-xs font-medium text-slate-800 leading-relaxed">
                        {slideOverItem.reasonForRequest || slideOverItem.description}
                      </p>
                      <div className="pt-1 border-t border-slate-200 text-xs flex justify-between font-bold text-slate-700">
                        <span>Risk Score:</span>
                        <span className={slideOverItem.riskScore > 50 ? 'text-rose-600 font-mono' : 'text-emerald-600 font-mono'}>
                          {slideOverItem.riskScore} / 100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Field Diffs Table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-600" />
                      Technical Payload Field Diffs ({slideOverItem.fieldDiffs.length})
                    </h4>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                            <th className="p-3">Field Name</th>
                            <th className="p-3">Original State</th>
                            <th className="p-3">Proposed Mutation</th>
                            <th className="p-3">Impact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {slideOverItem.fieldDiffs.map((fd, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold text-slate-900">{fd.fieldName}</td>
                              <td className="p-3 font-mono text-rose-800 bg-rose-50/70 rounded">{fd.originalValue}</td>
                              <td className="p-3 font-mono text-emerald-900 bg-emerald-50/70 font-bold rounded">{fd.proposedValue}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  fd.impactLevel === 'Critical'
                                    ? 'bg-rose-100 text-rose-800'
                                    : fd.impactLevel === 'Major'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {fd.impactLevel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Multi-node Consensus Quorum */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      Multi-Node Consensus Quorum ({slideOverItem.currentApprovalCount} / {slideOverItem.totalRequiredCount} Signatures)
                    </h4>
                    <div className="space-y-2">
                      {slideOverItem.nodeVotes.map((nv, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="font-bold text-slate-900 block">{nv.nodeName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{nv.nodeRole} • Key: {nv.keyId}</span>
                          </div>
                          <div className="text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              nv.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-900'
                                : nv.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}>
                              {nv.status}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{nv.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ACTION SECTION OR PAST VOTE SUMMARY */}
                  {slideOverItem.validatorVote === 'pending' ? (
                    <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5 border border-indigo-500/30 shadow-lg">
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Key className="w-4 h-4 text-indigo-400" />
                          Cast Independent Validator Threshold Vote
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Submitting a vote requires a <strong>mandatory justification note</strong> to create validator accountability for your decision.
                        </p>
                      </div>

                      {/* Error Alert */}
                      {validatorErrors[slideOverItem.id] && (
                        <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{validatorErrors[slideOverItem.id]}</span>
                        </div>
                      )}

                      {/* Mandatory Justification Note Field */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                          Mandatory Short Justification Note <span className="text-rose-400">* Required</span>
                        </label>
                        <textarea
                          rows={3}
                          value={validatorJustifications[slideOverItem.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setValidatorJustifications((prev) => ({ ...prev, [slideOverItem.id]: val }));
                            if (val.trim()) {
                              setValidatorErrors((prev) => ({ ...prev, [slideOverItem.id]: null }));
                            }
                          }}
                          placeholder="State brief reasoning for your vote (e.g., 'Payload diff verified against network time logs; no hash anomalies detected')..."
                          className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white outline-none focus:border-indigo-400 placeholder:text-slate-500"
                        />
                      </div>

                      {/* Validator Hardware PIN & Buttons */}
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                            6-Digit Validator Hardware Token PIN
                          </label>
                          <input
                            type="password"
                            value={validatorPins[slideOverItem.id] || '882091'}
                            onChange={(e) =>
                              setValidatorPins((prev) => ({ ...prev, [slideOverItem.id]: e.target.value }))
                            }
                            placeholder="Enter 6-digit PIN"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white font-mono outline-none focus:border-indigo-400"
                          />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleValidatorVoteSubmit(slideOverItem.id, 'Approved');
                            }}
                            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve Consensus</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleValidatorVoteSubmit(slideOverItem.id, 'Rejected');
                            }}
                            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject & Strike</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* History Read-only Summary */
                    <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 border border-indigo-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Validator Past Vote Record (Read-Only)
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                          slideOverItem.validatorVote === 'approved' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                        }`}>
                          Cast Vote: {slideOverItem.validatorVote}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                          Recorded Justification Note:
                        </span>
                        <p className="text-slate-200 font-mono italic">
                          "{slideOverItem.validatorJustificationNote || validatorJustifications[slideOverItem.id] || 'Verified against technical criteria.'}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Node: VAL-NODE-IND-002</span>
                        <span>Sealed on Ledger</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

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
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center justify-between gap-4 border border-blue-500/30 max-w-lg"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW 1: REPOSITORY LIST OF CONSENSUS VOTE REQUESTS */}
      {!selectedItemId ? (
        <div className="space-y-6">
          {/* Header Banner - Multi-Party Threshold Governance Portal */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <LockKeyhole className="w-64 h-64 text-blue-300" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  Multi-Party Threshold Cryptography • 2-of-2 / 2-of-3 Quorum
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Consensus Votes & Governance Portal
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Cryptographic threshold voting portal for Court Authorities & Independent Validators. Sensitive evidence mutations, record sealings, and Section 65B re-anchors require multi-party consensus before ledger commitment.
                </p>
              </div>

              {/* Status Metrics Cards */}
              <div className="grid grid-cols-3 gap-3 shrink-0">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Awaiting Vote</span>
                  <span className="text-xl font-bold text-amber-400 font-mono">
                    {awaitingCount}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">Flagged Breaches</span>
                  <span className="text-xl font-bold text-rose-400 font-mono">
                    {flaggedCount}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Approved</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">
                    {approvedCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-blue-200/80 flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <strong>PRAMANA Consensus Protocol:</strong> ECDSA secp256k1 threshold signatures backed by hardware HSM modules.
              </span>
              <span className="font-mono text-[11px] bg-white/10 px-3 py-1 rounded-full text-white">
                Bench Key: BENCH-KEY-IND-003
              </span>
            </div>
          </div>

          {/* Filter, Search, and Category Toolbar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                {(['All', 'Awaiting', 'Flagged', 'Approved', 'Rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      filterStatus === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'Awaiting' ? 'Awaiting Vote' : st === 'Flagged' ? 'Suspicious Flags' : st}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                >
                  <option value="All">All Request Types</option>
                  <option value="Metadata Correction">Metadata Correction</option>
                  <option value="Record Sealing">Record Sealing (§ 144)</option>
                  <option value="Evidence Deletion">Evidence Expungement</option>
                  <option value="Section 65B Re-hash">Section 65B Re-hash</option>
                </select>

                {/* Search Input */}
                <div className="w-full sm:w-72 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search request ID, case, title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* List Cards of Consensus Vote Items */}
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const isPendingYourVote = item.yourVote === 'pending';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenDeepView(item.id, 'overview')}
                    className={`p-6 rounded-3xl border transition-all space-y-4 cursor-pointer group hover:shadow-md ${
                      item.status === 'Flagged suspicious'
                        ? 'bg-rose-50/30 border-rose-300 hover:border-rose-400'
                        : item.status === 'Awaiting your vote'
                        ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400'
                        : item.status === 'Approved'
                        ? 'bg-emerald-50/20 border-emerald-300'
                        : 'bg-slate-100/80 border-slate-300'
                    }`}
                  >
                    {/* Top Header Row */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Icon Box */}
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 border border-slate-800 shadow-xs relative overflow-hidden">
                          {item.category === 'Evidence Deletion' ? (
                            <AlertTriangle className="w-6 h-6 text-rose-400" />
                          ) : item.category === 'Record Sealing' ? (
                            <LockKeyhole className="w-6 h-6 text-indigo-400" />
                          ) : (
                            <FileCode className="w-6 h-6 text-blue-400" />
                          )}
                          <span className="text-[9px] font-mono mt-1 text-slate-300 font-bold">
                            {item.thresholdRequired}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                              {item.id}
                            </span>
                            <span className="text-xs font-bold text-blue-700">
                              Case: {item.caseRef}
                            </span>
                            <span className="text-xs text-slate-400">• Requested {item.timestamp}</span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium">
                            Requester: <strong className="text-slate-900">{item.requestedBy}</strong> ({item.requestAgency})
                          </p>
                        </div>
                      </div>

                      {/* Status Badges & Quorum Meter */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          {item.status === 'Awaiting your vote' && (
                            <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              Awaiting Your Vote
                            </span>
                          )}
                          {item.status === 'Awaiting validator' && (
                            <span className="px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                              Awaiting Validator
                            </span>
                          )}
                          {item.status === 'Flagged suspicious' && (
                            <span className="px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                              Flagged Suspicious
                            </span>
                          )}
                          {item.status === 'Approved' && (
                            <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              Approved & Committed
                            </span>
                          )}
                          {item.status === 'Rejected' && (
                            <span className="px-3.5 py-1.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5">
                              <X className="w-3.5 h-3.5 text-slate-600" />
                              Rejected & Struck
                            </span>
                          )}
                        </div>

                        {/* Quorum Progress */}
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            Quorum Progress
                          </span>
                          <span className="text-xs font-bold font-mono text-slate-800">
                            {item.currentApprovalCount} of {item.totalRequiredCount} Signatures
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Voting Node Status Chips */}
                    <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                        Node Votes:
                      </span>
                      {item.nodeVotes.map((nv, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 ${
                            nv.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : nv.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <Key className="w-3 h-3" />
                          <span>{nv.nodeName.split('(')[0].trim()}:</span>
                          <span>{nv.status}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                        <Fingerprint className="w-3.5 h-3.5 text-blue-600" />
                        Target Record: {item.targetRecordHash.substring(0, 24)}...
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeepView(item.id, 'overview');
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Open Deep Vote File</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeepView(item.id, 'bench_action');
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <FileSignature className="w-3.5 h-3.5" />
                          <span>Cast Threshold Vote</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-900">No matching consensus requests found</p>
                  <p className="text-xs text-slate-500">Try clearing your search query or changing filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : selectedItem ? (
        /* VIEW 2: DEEP DETAILED INNER PAGE / PAGER FOR SELECTED CONSENSUS ITEM */
        <div className="space-y-6">
          {/* Top Navigation & Quick Action Header */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedItemId(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Return to Consensus Queue</span>
              </button>
              <div className="h-4 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                  {selectedItem.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded border ${
                    selectedItem.status === 'Flagged suspicious'
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : selectedItem.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {selectedItem.status}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => showToast('Consensus Threshold Audit Certificate Exported as PDF')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span>Export PDF Certificate</span>
              </button>

              <button
                onClick={() => setInnerSubTab('bench_action')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <FileSignature className="w-4 h-4" />
                <span>Cast Bench Threshold Vote</span>
              </button>
            </div>
          </div>

          {/* Hero Banner for Selected Consensus Item */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-blue-300 text-xs font-bold border border-white/15">
                    Case Ref: {selectedItem.caseRef}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                    Category: {selectedItem.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-amber-300 text-xs font-bold border border-white/15">
                    PRAMANA Block #{selectedItem.blockNumber}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {selectedItem.title}
                </h1>

                <p className="text-xs text-slate-300 font-medium">
                  {selectedItem.caseTitle} • Requester: {selectedItem.requestedBy} ({selectedItem.requestAgency})
                </p>
              </div>

              {/* Quorum Progress Badge */}
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center shrink-0 min-w-[160px]">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                  Quorum Consensus
                </span>
                <span className="text-2xl font-extrabold font-mono text-blue-300 block mt-1">
                  {selectedItem.currentApprovalCount} / {selectedItem.totalRequiredCount}
                </span>
                <span className="text-[10px] text-slate-300 block mt-0.5">
                  Threshold: {selectedItem.thresholdRequired}
                </span>
              </div>
            </div>

            {/* Impact Callout Bar */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px]">Impact Assessment:</span>
              <span className="text-slate-200 font-medium italic">"{selectedItem.impactSummary}"</span>
            </div>
          </div>

          {/* DEEP INNER SUB-TABS NAVIGATION PAGER */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {[
              { id: 'overview', label: '1. Executive Consensus Summary', icon: Cpu },
              { id: 'payload_diff', label: '2. Field & Byte Payload Diff', icon: FileSearch },
              { id: 'crypto_proofs', label: '3. Cryptographic Proofs & Merkle Tree', icon: Fingerprint },
              { id: 'custody_audit', label: '4. Chain of Custody & Node Logs', icon: History },
              { id: 'statutory_rules', label: '5. Statutory Rules & Precedents', icon: Scale },
              { id: 'bench_action', label: '6. Judicial Vote & Directives', icon: Gavel },
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

          {/* INNER TAB 1: EXECUTIVE CONSENSUS SUMMARY */}
          {innerSubTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Voting Threshold Matrix */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-600" />
                        Multi-Party Threshold Signature Matrix
                      </h3>
                      <p className="text-xs text-slate-500">
                        This mutation requires {selectedItem.thresholdRequired} cryptographic approvals to commit changes to PRAMANA ledger.
                      </p>
                    </div>

                    <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-xs font-bold font-mono">
                      Quorum {selectedItem.currentApprovalCount}/{selectedItem.totalRequiredCount}
                    </span>
                  </div>

                  {/* Node Votes Timeline */}
                  <div className="space-y-4">
                    {selectedItem.nodeVotes.map((node, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          node.status === 'Approved'
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : node.status === 'Rejected'
                            ? 'bg-rose-50/50 border-rose-200'
                            : 'bg-amber-50/50 border-amber-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{node.nodeName}</span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                              {node.keyId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">{node.nodeRole}</p>
                          <p className="text-[11px] font-mono text-slate-500">
                            Sig Hash: {node.signatureHash.substring(0, 28)}...
                          </p>
                        </div>

                        <div className="flex flex-col sm:items-end gap-1">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              node.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : node.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {node.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{node.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Description Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Proposed Ledger Mutation Details:
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {selectedItem.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar Quick Info */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Fingerprint className="w-4 h-4 text-blue-600" />
                    Block Hashes & State
                  </h3>

                  <div className="space-y-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase block font-sans font-bold">Target Record Hash</span>
                      <span className="text-slate-900 font-bold break-all">{selectedItem.targetRecordHash}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase block font-sans font-bold">Proposed Record Hash</span>
                      <span className="text-blue-700 font-bold break-all">{selectedItem.proposedRecordHash}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase block font-sans font-bold">Previous Block Hash</span>
                      <span className="text-slate-600 break-all">{selectedItem.previousBlockHash}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setInnerSubTab('bench_action')}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <FileSignature className="w-4 h-4" />
                    <span>Proceed to Judicial Vote</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 2: FIELD & BYTE PAYLOAD DIFF */}
          {innerSubTab === 'payload_diff' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileSearch className="w-5 h-5 text-blue-600" />
                    Field & Byte Payload Mutation Inspector
                  </h3>
                  <p className="text-xs text-slate-500">
                    Side-by-side comparison of current immutable ledger state versus the proposed mutated state.
                  </p>
                </div>

                <div className="space-y-4">
                  {selectedItem.fieldDiffs.map((diff, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-200 px-3 py-1 rounded-lg">
                          Field: {diff.fieldName}
                        </span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${
                            diff.impactLevel === 'Critical'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          Impact: {diff.impactLevel}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        {/* Original Value */}
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                          <span className="text-rose-800 text-[10px] font-bold uppercase block font-sans">
                            Current Ledger Value (Before)
                          </span>
                          <span className="text-rose-950 font-bold block break-all">{diff.originalValue}</span>
                        </div>

                        {/* Proposed Value */}
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                          <span className="text-emerald-800 text-[10px] font-bold uppercase block font-sans">
                            Proposed Ledger Value (After)
                          </span>
                          <span className="text-emerald-950 font-bold block break-all">{diff.proposedValue}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 font-medium italic">
                        Note: "{diff.note}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 3: CRYPTOGRAPHIC PROOFS & MERKLE TREE */}
          {innerSubTab === 'crypto_proofs' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-blue-600" />
                    Merkle Tree Root & Zero-Knowledge Proof Verification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cryptographic proof validation verifying that the proposed mutation preserves block history continuity.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-blue-400 font-bold">PRAMANA Ledger Block #{selectedItem.blockNumber}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> ZK-Proof Validated
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Merkle Root Hash:</span>
                      <span className="text-white font-bold">{selectedItem.merkleRoot}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Target Record Leaf Hash:</span>
                      <span className="text-white font-bold">{selectedItem.targetRecordHash.substring(0, 28)}...</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Proposed Record Leaf Hash:</span>
                      <span className="text-blue-400 font-bold">{selectedItem.proposedRecordHash.substring(0, 28)}...</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 4: CHAIN OF CUSTODY & NODE LOGS */}
          {innerSubTab === 'custody_audit' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600" />
                    Chain of Custody & Node Validator Audit Logs
                  </h3>
                  <p className="text-xs text-slate-500">
                    Immutable chronological timeline tracking all node interactions and validator votes.
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                  {selectedItem.custodyLogs.map((log) => (
                    <div key={log.id} className="relative space-y-2">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{log.stage}</span>
                        <span className="font-mono text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Actor: <strong className="text-slate-800">{log.actor}</strong> ({log.role}) • Location: {log.location}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 5: STATUTORY RULES & PRECEDENTS */}
          {innerSubTab === 'statutory_rules' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-blue-600" />
                    Statutory Admissibility (§ 65B) & Judicial Precedents
                  </h3>
                  <p className="text-xs text-slate-500">
                    Legal framework governing threshold consensus approvals and electronic evidence mutations.
                  </p>
                </div>

                <div className="space-y-4">
                  {selectedItem.precedents.map((prec, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                          {prec.citation}
                        </span>
                        <span className="text-xs font-bold text-emerald-700">
                          {prec.relevanceScore}% Judicial Relevance
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{prec.title}</h4>
                      <p className="text-xs text-slate-600 font-medium">{prec.principle}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 6: JUDICIAL VOTE & BENCH DIRECTIVES */}
          {innerSubTab === 'bench_action' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Judicial Vote Form */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 space-y-6 shadow-xl">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 mb-2">
                    <Key className="w-3.5 h-3.5 text-blue-400" />
                    Court Authority Threshold Vote
                  </div>
                  <h3 className="text-xl font-bold text-white">Cast Judicial Threshold Signature</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Your vote will execute an ECDSA secp256k1 digital signature to seal or reject this consensus request.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Oath Checkbox */}
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToOath}
                      onChange={(e) => setAgreedToOath(e.target.checked)}
                      className="mt-0.5 rounded text-blue-500 focus:ring-blue-400"
                    />
                    <span className="text-xs text-slate-200 font-medium leading-relaxed">
                      I certify under penalty of perjury that I have inspected the forensic payload and endorse this consensus state change.
                    </span>
                  </label>

                  {/* Passkey */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Judicial Signature Token Passkey
                    </label>
                    <input
                      type="password"
                      value={judgePasskey}
                      onChange={(e) => setJudgePasskey(e.target.value)}
                      placeholder="Enter Judicial Secret Passkey"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white font-mono outline-none focus:border-blue-400"
                    />
                  </div>

                  {/* Remarks */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Judicial Order Justification / Remarks
                    </label>
                    <textarea
                      rows={3}
                      value={judgeRemarks}
                      onChange={(e) => setJudgeRemarks(e.target.value)}
                      placeholder="Enter reasoning for judicial record diary..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white outline-none focus:border-blue-400"
                    />
                  </div>

                  {/* Handwritten Signature Pad */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Handwritten Digital Signature
                      </label>
                      <button
                        type="button"
                        onClick={() => sigPadRef.current?.clear()}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear Signature
                      </button>
                    </div>
                    <div className="bg-white rounded-xl overflow-hidden border border-white/20">
                      <SignatureCanvas
                        ref={sigPadRef}
                        penColor="black"
                        canvasProps={{ className: 'w-full h-24 cursor-crosshair' }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isSigning}
                      onClick={() => handleJudicialVote('Approved & Cast Vote')}
                      className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Sign</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSigning}
                      onClick={() => handleJudicialVote('Rejected & Struck Request')}
                      className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject & Strike</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bench Directives Form & History */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-blue-600" />
                    Issue Bench Order / Directive
                  </h3>
                  <p className="text-xs text-slate-500">
                    Issue legally binding directives to law enforcement or forensic labs regarding this consensus item.
                  </p>
                </div>

                <form onSubmit={handleAddDirective} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Directive Type
                    </label>
                    <select
                      value={newDirectiveType}
                      onChange={(e) => setNewDirectiveType(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="CFSL Forensic Subpoena">CFSL Forensic Subpoena</option>
                      <option value="In-Camera Demonstration Order">In-Camera Demonstration Order</option>
                      <option value="Section 65B Certificate Re-audit">Section 65B Certificate Re-audit</option>
                      <option value="Quorum Re-vote Order">Quorum Re-vote Order</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Directive Details & Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={newDirectiveDetails}
                      onChange={(e) => setNewDirectiveDetails(e.target.value)}
                      placeholder="Specify court order instructions..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Execute & Seal Bench Order
                  </button>
                </form>

                {/* Existing Directives */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Sealed Bench Directives Diary ({selectedItem.directives.length})
                  </h4>
                  {selectedItem.directives.map((dir) => (
                    <div key={dir.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-blue-700">{dir.type}</span>
                        <span className="font-mono text-slate-400 text-[10px]">{dir.date}</span>
                      </div>
                      <p className="text-slate-700">{dir.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
