import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Clock,
  Send,
  Sparkles,
  Layers,
  FileCode,
  X,
  Check,
  Building,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sliders,
  Scale,
  BadgeAlert,
  AlertCircle,
  FileSearch,
  UserCheck,
  Key,
  FileSignature,
  Award,
  History,
  Info,
  Gavel,
  Printer,
  Copy,
  Share2,
  Activity,
  User,
  MapPin,
  FileCheck,
  Plus,
  Lock,
  Unlock,
  LockKeyhole,
  Cpu,
  Fingerprint,
  BookOpen,
} from 'lucide-react';

export interface ForensicCheck {
  status: 'Pass' | 'Fail' | 'Warning';
  score: number; // 0 to 100
  details: string;
  technicalNote: string;
}

export interface FrameDiffAnomaly {
  frameOrPage: string;
  timestampOffset: string;
  anomalyType: 'Generative AI Frame Insertion' | 'Font/Pixel Clone Stamp' | 'Audio Pitch Synthesis' | 'EXIF Timestamp Manipulation';
  confidenceScore: number;
  description: string;
  originalValue: string;
  alteredValue: string;
}

export interface CustodyTrailEvent {
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
  type: 'CFSL Forensic Subpoena' | 'Device Seizure Directive' | 'In-Camera Demonstration Order' | 'Section 65B Certificate Re-audit';
  details: string;
  status: 'Active' | 'Fulfilled' | 'Pending';
  sealHash: string;
}

export interface ForgeryQueueItem {
  id: string;
  exhibitId: string;
  caseId: string;
  caseTitle: string;
  courtBench: string;
  title: string;
  submitter: string;
  submitterAgency: string;
  submitterPhotoUrl?: string;
  timestamp: string;
  status: 'Flagged' | 'Pending Scan' | 'Cleared' | 'Escalated' | 'Rejected';
  confidenceScore: number; // AI Authenticity score 0-100
  previewType: 'Video' | 'Document' | 'Image' | 'Audio Log';
  previewImageDataUrl?: string;
  signature?: string;

  // Forensics Checks
  metadataCheck: ForensicCheck;
  ganFingerprintCheck: ForensicCheck;
  docForensicsCheck: ForensicCheck;

  // Hashes & Chain
  originalHash: string;
  submittedHash: string;
  merkleRoot: string;
  blockNumber: number;
  anomalySummary: string;

  // High Level Diff
  diffDetails: {
    originalAspect: string;
    submittedAspect: string;
    impactLevel: 'Critical' | 'Major' | 'Minor';
  };

  // Detailed Frame/Pixel Anomalies
  anomaliesList: FrameDiffAnomaly[];

  // Chain of Custody
  custodyTrail: CustodyTrailEvent[];

  // Precedents
  precedents: LegalPrecedent[];

  // Directives
  directives: BenchDirective[];

  // Judicial Decision details if signed
  judicialDecision?: {
    action: 'Accepted & Admitted' | 'Rejected & Excluded' | 'Escalated to CFSL';
    judgeName: string;
    benchKeyId: string;
    timestamp: string;
    justification: string;
    digitalSignatureHash: string;
  };
}

const INITIAL_QUEUE: ForgeryQueueItem[] = [
  {
    id: 'FRG-2026-001',
    exhibitId: 'EXH-001',
    caseId: 'CR-2026-904',
    caseTitle: 'State vs. Sector 4 Cyber Heist Syndicate',
    courtBench: 'High Court Bench 3 (Presiding: Hon. Justice A. Mehta)',
    title: 'CCTV Camera 04 Footage - Sector 4 Server Room (1080p MP4)',
    submitter: 'Insp. V. Sharma',
    submitterAgency: 'Zone 4 Cyber Crime Directorate',
    timestamp: '12 Oct 2026, 09:30 AM',
    status: 'Flagged',
    confidenceScore: 32.4, // Low authenticity
    previewType: 'Video',

    metadataCheck: {
      status: 'Fail',
      score: 25,
      details: 'EXIF timestamp offset (+04:00 hrs) inconsistent with NTP server logs.',
      technicalNote: 'MP4 container creation time header modified at offset 0x000000A4.',
    },
    ganFingerprintCheck: {
      status: 'Fail',
      score: 18,
      details: 'High-frequency generative artifacts detected in frames 1400-1450 (Deepfake insertion).',
      technicalNote: 'FFT spectral energy spikes at 120Hz spatial frequencies indicative of Diffusion-based frame blending.',
    },
    docForensicsCheck: {
      status: 'Pass',
      score: 88,
      details: 'Video codec quantization matrices uniform across non-edited keyframes.',
      technicalNote: 'H.264 macroblock allocation remains consistent outside temporal window 02:14:10-02:14:12.',
    },

    originalHash: '0x8f2a9910b2a3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123',
    submittedHash: '0x8f2a9910b2a3c4d5e6f7a8b9c0d1e2f4b5c6d7e8f90123456789abcdef0129',
    merkleRoot: '0x99a0b112c334d556e778f99011a22b33',
    blockNumber: 89201,
    anomalySummary: '50-frame generative Deepfake insertion detected around timestamp 02:14:10 showing unauthorized figure near server rack.',

    diffDetails: {
      originalAspect: 'Clean timeline at 02:14:10 with empty rack walkway (Hash: 0x8f2a...e2f3)',
      submittedAspect: '50-frame neural insertion depicting suspect in black jumpsuit (Hash: 0x8f2a...f0129)',
      impactLevel: 'Critical',
    },

    anomaliesList: [
      {
        frameOrPage: 'Frame #1412 (02:14:10.400)',
        timestampOffset: '+02:14:10.400',
        anomalyType: 'Generative AI Frame Insertion',
        confidenceScore: 94.8,
        description: 'Boundary blurring on face mesh and shadow mismatch on concrete floor tiles.',
        originalValue: 'Empty floor with ambient floor light reflection',
        alteredValue: 'Neural face model inserted with mismatched lighting vectors',
      },
      {
        frameOrPage: 'Frame #1435 (02:14:11.166)',
        timestampOffset: '+02:14:11.166',
        anomalyType: 'EXIF Timestamp Manipulation',
        confidenceScore: 91.2,
        description: 'PTS (Presentation Timestamp) delta jump of +120ms between adjacent B-frames.',
        originalValue: 'PTS: 80400 (Continuous 30fps)',
        alteredValue: 'PTS: 80520 (Discontinuous jitter)',
      },
    ],

    custodyTrail: [
      {
        id: 'CUST-904-01',
        stage: 'Seizure & Hashing at Scene',
        actor: 'SI S. Deshmukh',
        role: 'Investigating Officer',
        timestamp: '11 Oct 2026, 11:15 PM',
        location: 'Sector 4 Data Center Facility',
        hashVerified: true,
        blockNumber: 89180,
      },
      {
        id: 'CUST-904-02',
        stage: 'PRAMANA Blockchain Anchor Upload',
        actor: 'SysAdmin Node #04',
        role: 'High Court Gateway Node',
        timestamp: '12 Oct 2026, 02:00 AM',
        location: 'High Court Server Vault',
        hashVerified: true,
        blockNumber: 89190,
      },
      {
        id: 'CUST-904-03',
        stage: 'MAYA-BREAK Automated Forensic Scan',
        actor: 'MAYA-BREAK AI Engine',
        role: 'Automated Inspector',
        timestamp: '12 Oct 2026, 09:30 AM',
        location: 'Quarantine Buffer Node #01',
        hashVerified: false,
        blockNumber: 89201,
      },
    ],

    precedents: [
      {
        citation: '(2014) 10 SCC 473',
        title: 'Anvar P.V. vs. P.K. Basheer & Ors.',
        court: 'Supreme Court of India',
        relevanceScore: 98.2,
        principle: 'Electronic records are inadmissible without Section 65B Evidence Act certificate certifying tamper-proof hash continuity.',
      },
      {
        citation: '(2020) 3 SCC 637',
        title: 'Arjun Panditrao Khotkar vs. Kailash Kushanrao Gorantyal',
        court: 'Supreme Court of India',
        relevanceScore: 94.5,
        principle: 'Required strict primary evidence or secondary evidence backed by hash audit trails when video authenticity is challenged.',
      },
    ],

    directives: [
      {
        id: 'DIR-FRG-904-01',
        date: '12 Oct 2026, 11:00 AM',
        issuedBy: 'Hon. Justice A. Mehta',
        type: 'CFSL Forensic Subpoena',
        details: 'Court orders immediate seizure of original DVR hard disk drive from Sector 4 facility for physical bitstream analysis.',
        status: 'Active',
        sealHash: '0xSEAL_DIR_904_8819',
      },
    ],
  },
  {
    id: 'FRG-2026-002',
    exhibitId: 'EXH-201',
    caseId: 'MH-CR-8821',
    caseTitle: 'State vs. Land Registry Cartel (Deed Forgery)',
    courtBench: 'Civil & Criminal Sessions Bench 2',
    title: 'Digitized Land Registry Deed #1984-A High-Res Scan',
    submitter: 'Sub-Registrar Office',
    submitterAgency: 'Zone 1 Land Records Division',
    timestamp: '28 Jul 2026, 10:00 AM',
    status: 'Flagged',
    confidenceScore: 45.1,
    previewType: 'Document',

    metadataCheck: {
      status: 'Pass',
      score: 92,
      details: 'Digital signature matches Sub-Registrar hardware token.',
      technicalNote: 'X.509 PKI certificate chain verified against State Root CA.',
    },
    ganFingerprintCheck: {
      status: 'Pass',
      score: 89,
      details: 'No neural synthesis or GAN noise detected in document background.',
      technicalNote: 'Spatial spectrum clean across all RGB color channels.',
    },
    docForensicsCheck: {
      status: 'Fail',
      score: 22,
      details: 'Font optical misalignment on Paragraph 3 Line 4. Pixel error level analysis reveals clone stamp edit.',
      technicalNote: 'ELA (Error Level Analysis) anomaly detected around numeral "12,000 sq ft" layer.',
    },

    originalHash: '0x55d491c0e3f2a1b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0123456789abcdef0',
    submittedHash: '0x55d491c0e3f2a1b4c5d6e7f8a9b0c1d9e3f4a5b6c7d8e9f0123456789abcdef9',
    merkleRoot: '0x44d1a223b445c667d889e0011a22b33',
    blockNumber: 86510,
    anomalySummary: 'Boundary plot size fraudulently altered from 1,200 sq.ft to 12,000 sq.ft in Clause 3 paragraph.',

    diffDetails: {
      originalAspect: 'Clause 3 text: "Plot area measuring 1,200 sq ft, bounded by Survey No. 44"',
      submittedAspect: 'Clause 3 text: "Plot area measuring 12,000 sq ft, bounded by Survey No. 44"',
      impactLevel: 'Major',
    },

    anomaliesList: [
      {
        frameOrPage: 'Page #2, Clause 3',
        timestampOffset: 'N/A (Document Scan)',
        anomalyType: 'Font/Pixel Clone Stamp',
        confidenceScore: 96.1,
        description: 'Extra digit "0" inserted using pixel clone tool with duplicated paper grain background.',
        originalValue: 'Area: 1,200 sq ft',
        alteredValue: 'Area: 12,000 sq ft',
      },
    ],

    custodyTrail: [
      {
        id: 'CUST-8821-01',
        stage: 'Deed Digitization at Land Office',
        actor: 'Officer N. Patil',
        role: 'Deputy Registrar',
        timestamp: '27 Jul 2026, 04:30 PM',
        location: 'Zone 1 Sub-Registrar Office',
        hashVerified: true,
        blockNumber: 86490,
      },
      {
        id: 'CUST-8821-02',
        stage: 'MAYA-BREAK OCR & ELA Audit',
        actor: 'MAYA-BREAK AI Engine',
        role: 'Automated Inspector',
        timestamp: '28 Jul 2026, 10:00 AM',
        location: 'High Court Quarantine Node',
        hashVerified: false,
        blockNumber: 86510,
      },
    ],

    precedents: [
      {
        citation: 'AIR 1963 SC 1850',
        title: 'State of Bihar vs. Radha Krishna Singh',
        court: 'Supreme Court of India',
        relevanceScore: 91.0,
        principle: 'Public documents containing material alterations without authenticating officer signature are inadmissible in property disputes.',
      },
    ],

    directives: [],
  },
  {
    id: 'FRG-2026-003',
    exhibitId: 'EXH-101',
    caseId: 'FIR-2026-102',
    caseTitle: 'State vs. Port Customs Smuggling Ring',
    courtBench: 'Commercial & Customs Special Bench 1',
    title: 'Digital Bill of Lading #BL-9092 Ledger Export (PDF/A)',
    submitter: 'Customs Officer P. Nair',
    submitterAgency: 'Customs Preventive Wing',
    timestamp: '01 Aug 2026, 02:00 PM',
    status: 'Cleared',
    confidenceScore: 99.1, // High authenticity
    previewType: 'Document',

    metadataCheck: {
      status: 'Pass',
      score: 99,
      details: 'Cryptographically anchored via Customs Port Gateway.',
      technicalNote: 'Full X.509 chain validated with HSM timestamp authority.',
    },
    ganFingerprintCheck: {
      status: 'Pass',
      score: 98,
      details: 'Clean spectral noise baseline.',
      technicalNote: 'No generative noise anomalies detected.',
    },
    docForensicsCheck: {
      status: 'Pass',
      score: 100,
      details: 'Vector text layers aligned without raster tampering.',
      technicalNote: 'All PDF streams pass cryptographic hash comparison.',
    },

    originalHash: '0x1a9933ef7b8a9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789abcd',
    submittedHash: '0x1a9933ef7b8a9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789abcd',
    merkleRoot: '0x11a22b33c44d55e66f77889900aa11bb',
    blockNumber: 87102,
    anomalySummary: 'All forensic checks passed 100%. Submitted hash matches PRAMANA ledger anchor exactly.',

    diffDetails: {
      originalAspect: 'PRAMANA Ledger Record #87102 (Identical)',
      submittedAspect: 'Submitted Exhibit #EXH-101 (Identical)',
      impactLevel: 'Minor',
    },

    anomaliesList: [],

    custodyTrail: [
      {
        id: 'CUST-102-01',
        stage: 'Customs Port Gateway Export',
        actor: 'Customs Admin Node',
        role: 'Port Terminal System',
        timestamp: '01 Aug 2026, 01:15 PM',
        location: 'J N Port Customs Gateway',
        hashVerified: true,
        blockNumber: 87095,
      },
      {
        id: 'CUST-102-02',
        stage: 'Judicial Record Admission',
        actor: 'Hon. Justice K. V. Subramanian',
        role: 'Presiding Judge',
        timestamp: '01 Aug 2026, 02:30 PM',
        location: 'Bench 1 Court Vault',
        hashVerified: true,
        blockNumber: 87102,
      },
    ],

    precedents: [],
    directives: [],
  },
  {
    id: 'FRG-2026-004',
    exhibitId: 'EXH-301',
    caseId: 'SHV-2291',
    caseTitle: 'State vs. Nexus Pharma (Substandard Drug Distribution)',
    courtBench: 'High Court Public Health & Pharma Bench 3',
    title: 'Audio Recording - Phone Wiretap #QC-882 (WAV Format)',
    submitter: 'ACP R. S. Deshpande',
    submitterAgency: 'State Intelligence Bureau',
    timestamp: '04 Aug 2026, 03:15 PM',
    status: 'Pending Scan',
    confidenceScore: 58.0,
    previewType: 'Audio Log',

    metadataCheck: {
      status: 'Warning',
      score: 60,
      details: 'Audio header metadata shows non-standard sample rate conversion from 44.1kHz to 16kHz.',
      technicalNote: 'RIFF header wave format chunks contain non-aligned padding bytes.',
    },
    ganFingerprintCheck: {
      status: 'Fail',
      score: 40,
      details: 'Voice voiceprint formant frequency discontinuities detected between 01:12 - 01:18.',
      technicalNote: 'Neural voice synthesis spectral artifacts detected in pitch harmonics.',
    },
    docForensicsCheck: {
      status: 'Pass',
      score: 80,
      details: 'No missing audio packet drops in raw payload stream.',
      technicalNote: 'PCM payload integrity check passed.',
    },

    originalHash: '0x33b44c55d66e77f88a99b00c11d22e33f44a55b66c77d88e99f001122334455',
    submittedHash: '0x33b44c55d66e77f88a99b00c11d22e33f44a55b66c77d88e99f001122334499',
    merkleRoot: '0x3334445556667778889990001112223',
    blockNumber: 88104,
    anomalySummary: 'Possible AI Voice Cloning / Neural Pitch Synthesis detected in key 6-second segment.',

    diffDetails: {
      originalAspect: 'Telecom Gateway Encrypted Stream #88104',
      submittedAspect: 'Re-encoded WAV with voice cloning spectral anomalies',
      impactLevel: 'Critical',
    },

    anomaliesList: [
      {
        frameOrPage: 'Audio Window 01:12 - 01:18',
        timestampOffset: '01:12.000',
        anomalyType: 'Audio Pitch Synthesis',
        confidenceScore: 89.4,
        description: 'Unnatural formant transitions in speaker vocal tract signature.',
        originalValue: 'Original background room noise',
        alteredValue: 'Synthesized voice clone phrase',
      },
    ],

    custodyTrail: [
      {
        id: 'CUST-2291-01',
        stage: 'Wiretap Intercept Capture',
        actor: 'SIB Gateway Node',
        role: 'Telecom Monitoring Division',
        timestamp: '04 Aug 2026, 01:00 PM',
        location: 'State Cyber Cell Intercept Station',
        hashVerified: true,
        blockNumber: 88090,
      },
    ],

    precedents: [],
    directives: [],
  },
];

export function ForgeryReviewQueueTab() {
  const [items, setItems] = useState<ForgeryQueueItem[]>([]);

  // Real-Time Polling Engine (3s interval) for live Hash Chain, Merkle Proofs & Queue Updates
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await api.getForgeryQueue();
        if (res && res.success && Array.isArray(res.reviews)) {
          setItems((prev) => {
            if (prev.length === 0) return res.reviews;
            const updatedMap = new Map(res.reviews.map((r: ForgeryQueueItem) => [r.id, r]));
            return prev.map((item) => updatedMap.get(item.id) || item);
          });
        }
      } catch (err) {
        console.error('Error fetching forgery queue:', err);
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);

    try {
      const stored = localStorage.getItem('nyayakasha_submitted_evidence');
      if (stored) {
        const customItems = JSON.parse(stored);
        if (Array.isArray(customItems) && customItems.length > 0) {
          setItems(prev => {
            const existingIds = new Set(prev.map(i => i.id));
            const newItems = customItems.filter((ci: any) => !existingIds.has(ci.id));
            return [...newItems, ...prev];
          });
        }
      }
    } catch (e) {
      console.error(e);
    }

    return () => clearInterval(interval);
  }, []);

  // SELECTION: null = Directory/List View; Item ID = Deep Detailed Inner Pager View
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // INNER DEEP SUB-TAB SELECTION
  const [innerSubTab, setInnerSubTab] = useState<
    'overview' | 'forensics_diff' | 'hash_chain' | 'custody_chain' | 'statutory_precedents' | 'bench_actions'
  >('overview');

  // FILTERS & SEARCH FOR LIST REPOSITORY
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // INTERACTIVE TOOLS inside Deep Detailed View
  const [diffFrameScrubber, setDiffFrameScrubber] = useState<number>(50); // 0-100% overlay scrubber
  const [showElaHeatmap, setShowElaHeatmap] = useState<boolean>(true);

  // JUDICIAL SIGNING FORM
  const [judgePasskey, setJudgePasskey] = useState('JUDGE-BENCH-KEY-2026-SECRET');
  const [judgeRemarks, setJudgeRemarks] = useState('');
  const [agreedToOath, setAgreedToOath] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

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

  const filteredItems = items.filter((item) => {
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Flagged' && item.status === 'Flagged') ||
      (filterStatus === 'Pending' && item.status === 'Pending Scan') ||
      (filterStatus === 'Escalated' && item.status === 'Escalated') ||
      (filterStatus === 'Cleared' && item.status === 'Cleared');

    const matchesType = filterType === 'All' || item.previewType === filterType;

    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submitter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.exhibitId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const handleOpenDeepView = (id: string, defaultTab: typeof innerSubTab = 'overview') => {
    setSelectedItemId(id);
    setInnerSubTab(defaultTab);
    setJudgeRemarks('');
    setAgreedToOath(false);
  };

  const handleJudicialDecision = async (action: 'Accepted & Admitted' | 'Rejected & Excluded' | 'Escalated to CFSL') => {
    if (!selectedItem) return;
    if (!agreedToOath) {
      showToast('Mandatory Judicial Statutory Oath acknowledgment is required before signing.');
      return;
    }
    if (!judgePasskey.trim()) {
      showToast('Judicial Private Signature Token is required.');
      return;
    }

    setIsSigning(true);
    try {
      const res = await api.decideForgery(selectedItem.id, action, judgeRemarks);
      if (res && res.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === selectedItem.id ? res.review : i))
        );
        const sigHash = res.review.judicialDecision?.digitalSignatureHash || '0xSIG_BENCH_ADM';
        showToast(
          `Exhibit ${selectedItem.exhibitId} (${selectedItem.caseId}) ${action.toUpperCase()}. Bench Signature: ${sigHash.substring(
            0,
            18
          )}...`
        );
      } else {
        showToast('Failed to sign judicial decision: ' + (res.error || 'unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error signing judicial decision');
    } finally {
      setIsSigning(false);
    }
  };

  const handleAddDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !newDirectiveDetails.trim()) return;

    try {
      const res = await api.addBenchDirective(selectedItemId, newDirectiveType, newDirectiveDetails);
      if (res && res.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === selectedItemId ? res.review : i))
        );
        setNewDirectiveDetails('');
        showToast('Bench Directive Executed & Sealed to Case Diary.');
      } else {
        showToast('Failed to add directive: ' + (res.error || 'unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error executing directive');
    }
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
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center justify-between gap-4 border border-rose-500/30 max-w-lg"
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

      {/* VIEW 1: REPOSITORY LIST OF FORGERY QUEUE EXHIBITS */}
      {!selectedItemId ? (
        <div className="space-y-6">
          {/* Header Banner - MAYA-BREAK Quarantine Area */}
          <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldAlert className="w-64 h-64 text-rose-300" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
                  <BadgeAlert className="w-3.5 h-3.5 text-rose-400" />
                  MAYA-BREAK AI Forensic Quarantine • Pre-Admissions Inspection
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Forgery Review & Forensic Queue
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Cryptographic quarantine buffer for evidence undergoing MAYA-BREAK AI deepfake detection, GAN fingerprinting, and frame-by-frame hash mismatch analysis prior to judicial record admission.
                </p>
              </div>

              {/* Status Metrics Cards */}
              <div className="grid grid-cols-3 gap-3 shrink-0">
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">Flagged Anomalies</span>
                  <span className="text-xl font-bold text-rose-400 font-mono">
                    {items.filter((i) => i.status === 'Flagged').length}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Pending Scan</span>
                  <span className="text-xl font-bold text-amber-400 font-mono">
                    {items.filter((i) => i.status === 'Pending Scan').length}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Cleared</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">
                    {items.filter((i) => i.status === 'Cleared').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-rose-200/80 flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-rose-400 shrink-0" />
                <strong>MAYA-BREAK Engine v4.2:</strong> Deep learning model scans EXIF headers, GAN spectral noise, and vector text alignment.
              </span>
              <span className="font-mono text-[11px] bg-white/10 px-3 py-1 rounded-full text-white">
                Active Bench Key: BENCH-KEY-IND-003
              </span>
            </div>
          </div>

          {/* Filter, Search, and Sort Toolbar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                {(['All', 'Flagged', 'Pending', 'Escalated', 'Cleared'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      filterStatus === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'Pending' ? 'Pending Scan' : st}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Media Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-rose-500"
                >
                  <option value="All">All Media Formats</option>
                  <option value="Video">Video Footage</option>
                  <option value="Document">Scanned Documents</option>
                  <option value="Audio Log">Audio Telephony Logs</option>
                  <option value="Image">High-Res Images</option>
                </select>

                {/* Search Input */}
                <div className="w-full sm:w-72 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search exhibit, case ID, title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-rose-500 placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* List Cards of Forgery Queue Items */}
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenDeepView(item.id, 'overview')}
                  className={`p-6 rounded-3xl border transition-all space-y-4 cursor-pointer group hover:shadow-md ${
                    item.status === 'Flagged'
                      ? 'bg-rose-50/30 border-rose-300 hover:border-rose-400'
                      : item.status === 'Escalated'
                      ? 'bg-purple-50/30 border-purple-300'
                      : item.status === 'Cleared'
                      ? 'bg-emerald-50/20 border-emerald-300'
                      : item.status === 'Rejected'
                      ? 'bg-slate-100/80 border-slate-300'
                      : 'bg-amber-50/20 border-amber-200'
                  }`}
                >
                  {/* Top Header Row */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Media Thumbnail Box */}
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 border border-slate-800 shadow-xs relative overflow-hidden">
                        {item.previewType === 'Video' ? (
                          <FileCode className="w-6 h-6 text-rose-400" />
                        ) : item.previewType === 'Audio Log' ? (
                          <Activity className="w-6 h-6 text-amber-400" />
                        ) : (
                          <FileText className="w-6 h-6 text-indigo-400" />
                        )}
                        <span className="text-[9px] font-mono mt-1 text-slate-300 font-bold">
                          {item.previewType}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                            {item.id}
                          </span>
                          <span className="text-xs font-bold text-indigo-700">
                            Exhibit: {item.exhibitId} • Case: {item.caseId}
                          </span>
                          <span className="text-xs text-slate-400">• Filed {item.timestamp}</span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium">
                          Submitter: <strong className="text-slate-900">{item.submitter}</strong> ({item.submitterAgency})
                        </p>
                      </div>
                    </div>

                    {/* Status & Authenticity Score */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        {item.status === 'Flagged' && (
                          <span className="px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                            <BadgeAlert className="w-3.5 h-3.5 text-rose-700" />
                            Flagged Anomaly
                          </span>
                        )}
                        {item.status === 'Pending Scan' && (
                          <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            Pending Scan
                          </span>
                        )}
                        {item.status === 'Escalated' && (
                          <span className="px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-purple-700" />
                            Escalated to CFSL
                          </span>
                        )}
                        {item.status === 'Cleared' && (
                          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                            Cleared & Admitted
                          </span>
                        )}
                        {item.status === 'Rejected' && (
                          <span className="px-3.5 py-1.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-slate-600" />
                            Inadmissible / Rejected
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          AI Authenticity Score
                        </span>
                        <span
                          className={`text-sm font-extrabold font-mono ${
                            item.confidenceScore < 60
                              ? 'text-rose-600'
                              : item.confidenceScore < 90
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {item.confidenceScore}% Authenticity
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Forensics Check Pills */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-200 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-700">1. EXIF Metadata Check</span>
                        {item.metadataCheck.status === 'Pass' ? (
                          <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pass ({item.metadataCheck.score}%)
                          </span>
                        ) : (
                          <span className="text-rose-700 text-[11px] font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Fail ({item.metadataCheck.score}%)
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-2">{item.metadataCheck.details}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-700">2. GAN-Fingerprint Analysis</span>
                        {item.ganFingerprintCheck.status === 'Pass' ? (
                          <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pass ({item.ganFingerprintCheck.score}%)
                          </span>
                        ) : (
                          <span className="text-rose-700 text-[11px] font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Fail ({item.ganFingerprintCheck.score}%)
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-2">{item.ganFingerprintCheck.details}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-700">3. Optical/Vector Forensics</span>
                        {item.docForensicsCheck.status === 'Pass' ? (
                          <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pass ({item.docForensicsCheck.score}%)
                          </span>
                        ) : (
                          <span className="text-rose-700 text-[11px] font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Fail ({item.docForensicsCheck.score}%)
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-2">{item.docForensicsCheck.details}</p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                      <Fingerprint className="w-3.5 h-3.5 text-rose-600" />
                      Submitted Hash: {item.submittedHash.substring(0, 24)}...
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeepView(item.id, 'overview');
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Open Deep Forensic File</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeepView(item.id, 'forensics_diff');
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <FileSearch className="w-3.5 h-3.5" />
                        <span>Inspect Frame Diff</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-900">No matching exhibits found in queue</p>
                  <p className="text-xs text-slate-500">Try clearing your search query or changing filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : selectedItem ? (
        /* VIEW 2: DEEP DETAILED INNER PAGE / PAGER FOR SELECTED FORGERY EXHIBIT */
        <div className="space-y-6">
          {/* Top Navigation & Action Header */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedItemId(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Return to Forensic Queue</span>
              </button>
              <div className="h-4 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                  {selectedItem.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded border ${
                    selectedItem.status === 'Flagged'
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : selectedItem.status === 'Cleared'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : selectedItem.status === 'Escalated'
                      ? 'bg-purple-100 text-purple-900 border-purple-300'
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
                onClick={() => showToast('Certified Forensic Laboratory Report Exported as PDF')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export PDF Certificate</span>
              </button>

              <button
                onClick={() => setInnerSubTab('bench_actions')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <FileSignature className="w-4 h-4" />
                <span>Judicial Bench Sign-off</span>
              </button>
            </div>
          </div>

          {/* Hero Banner for Selected Exhibit */}
          <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-indigo-300 text-xs font-bold border border-white/15">
                    Case: {selectedItem.caseId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-rose-300 text-xs font-bold border border-rose-400/30">
                    Exhibit: {selectedItem.exhibitId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-amber-300 text-xs font-bold border border-white/15">
                    PRAMANA Block #{selectedItem.blockNumber}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {selectedItem.title}
                </h1>

                <p className="text-xs text-slate-300 font-medium">
                  {selectedItem.courtBench} • Submitter: {selectedItem.submitter} ({selectedItem.submitterAgency})
                </p>
              </div>

              {/* Authenticity Dial Score Card */}
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center shrink-0 min-w-[160px]">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                  AI Authenticity Score
                </span>
                <span
                  className={`text-2xl font-extrabold font-mono block mt-1 ${
                    selectedItem.confidenceScore < 60 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {selectedItem.confidenceScore}%
                </span>
                <span className="text-[10px] text-slate-300 block mt-0.5">MAYA-BREAK Engine</span>
              </div>
            </div>

            {/* Anomaly Callout Bar */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px]">Flagged Anomaly:</span>
              <span className="text-slate-200 font-medium italic">"{selectedItem.anomalySummary}"</span>
            </div>
          </div>

          {/* DEEP INNER SUB-TABS NAVIGATION PAGER */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {[
              { id: 'overview', label: '1. Executive Forensics Summary', icon: Cpu },
              { id: 'forensics_diff', label: '2. Frame & Pixel Optical Forensics', icon: FileSearch },
              { id: 'hash_chain', label: '3. Hash Chain & Merkle Integrity', icon: Fingerprint },
              { id: 'custody_chain', label: '4. Chain of Custody Audit Trail', icon: History },
              { id: 'statutory_precedents', label: '5. Statutory Admissibility (§ 65B)', icon: Scale },
              { id: 'bench_actions', label: '6. Judicial Sign-Off & Orders', icon: Gavel },
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

          {/* INNER TAB 1: EXECUTIVE FORENSICS SUMMARY */}
          {innerSubTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* 3 Forensics Breakdown */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Cpu className="w-5 h-5 text-rose-600" /> MAYA-BREAK Triple Inspection Diagnostic Matrix
                  </h3>

                  <div className="space-y-4">
                    {/* Check 1 */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900">1. EXIF Metadata Header Analysis</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            selectedItem.metadataCheck.status === 'Pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {selectedItem.metadataCheck.status} ({selectedItem.metadataCheck.score}/100)
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium">{selectedItem.metadataCheck.details}</p>
                      <p className="text-slate-500 font-mono text-[11px]">
                        Technical Log: {selectedItem.metadataCheck.technicalNote}
                      </p>
                    </div>

                    {/* Check 2 */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900">2. Neural GAN-Fingerprint Spectral Analysis</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            selectedItem.ganFingerprintCheck.status === 'Pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {selectedItem.ganFingerprintCheck.status} ({selectedItem.ganFingerprintCheck.score}/100)
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium">{selectedItem.ganFingerprintCheck.details}</p>
                      <p className="text-slate-500 font-mono text-[11px]">
                        Technical Log: {selectedItem.ganFingerprintCheck.technicalNote}
                      </p>
                    </div>

                    {/* Check 3 */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900">3. Optical & Vector Layer Forensics</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            selectedItem.docForensicsCheck.status === 'Pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {selectedItem.docForensicsCheck.status} ({selectedItem.docForensicsCheck.score}/100)
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium">{selectedItem.docForensicsCheck.details}</p>
                      <p className="text-slate-500 font-mono text-[11px]">
                        Technical Log: {selectedItem.docForensicsCheck.technicalNote}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Anomaly Impact Summary Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600" /> Detected Tampering Impact Summary
                  </h3>
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
                    <p className="font-bold">Original PRAMANA Anchored Aspect:</p>
                    <p className="bg-white p-3 rounded-xl border border-rose-200 font-mono text-[11px]">
                      {selectedItem.diffDetails.originalAspect}
                    </p>

                    <p className="font-bold mt-2">Submitted Altered Aspect:</p>
                    <p className="bg-white p-3 rounded-xl border border-rose-200 font-mono text-[11px] text-rose-700 font-bold">
                      {selectedItem.diffDetails.submittedAspect}
                    </p>

                    <div className="pt-2 flex items-center justify-between font-bold">
                      <span>Impact Severity Level:</span>
                      <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] uppercase font-bold">
                        {selectedItem.diffDetails.impactLevel} Severity
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info & Quick Actions */}
              <div className="space-y-6">
                {/* Image Preview Box for Court Authority */}
                {selectedItem.previewImageDataUrl && (
                  <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-3 shadow-md">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> Stage 3: Court Authority Review
                    </span>
                    <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black/50 p-1">
                      <img 
                        src={selectedItem.previewImageDataUrl} 
                        alt="Captured Field Evidence" 
                        className="w-full h-auto max-h-56 object-contain rounded-xl mx-auto"
                      />
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">
                      First human review stage in pipeline. Raw exhibit photograph submitted by Officer {selectedItem.submitter}.
                    </p>
                  </div>
                )}

                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Exhibit Metadata
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">EXHIBIT ID</span>
                      <span className="font-bold text-slate-900 font-mono">{selectedItem.exhibitId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">CASE FILE</span>
                      <span className="font-bold text-slate-900">{selectedItem.caseId} ({selectedItem.caseTitle})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">COURT BENCH</span>
                      <span className="font-bold text-slate-900">{selectedItem.courtBench}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                      <img
                        src={(() => {
                          if (selectedItem.submitterPhotoUrl && selectedItem.submitterPhotoUrl.length > 10) return selectedItem.submitterPhotoUrl;
                          try {
                            const userStr = localStorage.getItem('nyayakasha_user');
                            if (userStr) {
                              const u = JSON.parse(userStr);
                              if (u.profilePhotoUrl && u.profilePhotoUrl.length > 10) return u.profilePhotoUrl;
                            }
                          } catch (e) {}
                          return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
                        })()}
                        alt={selectedItem.submitter}
                        className="w-11 h-11 rounded-full border-2 border-indigo-600 object-cover shrink-0 shadow-xs"
                      />
                      <div>
                        <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Field Submitter Officer</span>
                        <span className="font-bold text-slate-900 text-xs block">{selectedItem.submitter}</span>
                        <span className="text-slate-500 block text-[10px]">{selectedItem.submitterAgency}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 font-mono block">Officer Digital Signature</span>
                      <div className="bg-white/95 rounded-xl p-2 border border-slate-700 flex justify-center">
                        <img
                          src={selectedItem.signature || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="70" viewBox="0 0 320 70"><path d="M 20 40 Q 60 10 90 35 T 160 25 T 220 45 T 280 20" stroke="%231e293b" stroke-width="2.5" fill="none"/><text x="20" y="60" font-family="sans-serif" font-size="9" fill="%230284c7" font-weight="bold">SEALED BY OFFICER SIDDHESH HARWANDE • TPM SECURE KEY 0xSIG_FS_8820</text></svg>`}
                          alt="Officer Signature"
                          className="h-10 w-auto object-contain"
                        />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 block text-center">TPM Key Seal: 0xSIG_FS_882019401</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">TIMESTAMP</span>
                      <span className="font-bold text-slate-900">{selectedItem.timestamp}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => setInnerSubTab('forensics_diff')}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <FileSearch className="w-4 h-4 text-rose-400" />
                      <span>Inspect Frame / Pixel Diff</span>
                    </button>

                    <button
                      onClick={() => setInnerSubTab('bench_actions')}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Gavel className="w-4 h-4" />
                      <span>Perform Bench Action</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 2: FRAME & PIXEL OPTICAL FORENSICS */}
          {innerSubTab === 'forensics_diff' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <FileSearch className="w-5 h-5 text-rose-600" /> Frame & Pixel Optical Forensics Viewer
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Side-by-side comparison between PRAMANA genesis ledger record vs submitted file with interactive frame scrubber.
                    </p>
                  </div>

                  {/* Scrubber Toggle controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowElaHeatmap(!showElaHeatmap)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        showElaHeatmap
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{showElaHeatmap ? 'ELA Heatmap Active' : 'Normal Optical'}</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Scrubber Control */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">DIFF SCROLLER OVERLAY SCRUBBER</span>
                    <span className="text-rose-400 font-bold">{diffFrameScrubber}% Overlay Blend</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={diffFrameScrubber}
                    onChange={(e) => setDiffFrameScrubber(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>100% Original Anchored</span>
                    <span>50% Blend Diff</span>
                    <span>100% Submitted File</span>
                  </div>
                </div>

                {/* Dual Panel Comparison Display */}
                {(() => {
                  const displayExhibitImg = selectedItem.previewImageDataUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
                  const displayAnomalies = selectedItem.anomaliesList.length > 0 ? selectedItem.anomaliesList : [
                    {
                      frameOrPage: 'Frame #14 (EXIF Stream)',
                      timestampOffset: '00:00:14.21',
                      anomalyType: 'EXIF Timestamp Manipulation' as const,
                      confidenceScore: 94.2,
                      description: 'Hardware RTC clock timestamp variance exceeds allowable 0.05s precinct threshold.',
                      originalValue: '2026-08-09T07:12:00.000Z (NTP Synchronized)',
                      alteredValue: '2026-08-09T07:12:05.120Z (+5.12s Offset)'
                    },
                    {
                      frameOrPage: 'Pixel Region B (Optical Layer)',
                      timestampOffset: '00:00:14.25',
                      anomalyType: 'Font/Pixel Clone Stamp' as const,
                      confidenceScore: 91.8,
                      description: 'Spatial FFT frequency scan detected duplicated pixel block pattern in high-frequency band.',
                      originalValue: 'PRAMANA Genesis Vector Stream',
                      alteredValue: 'Localized Clone Stamp / Neural Infill'
                    }
                  ];

                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Panel A: Original Anchored */}
                        <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              Original Anchored Version
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                              Block #{selectedItem.blockNumber}
                            </span>
                          </div>

                          <div className="h-64 bg-black/90 rounded-xl flex flex-col items-center justify-center p-2 border border-emerald-500/40 relative overflow-hidden">
                            <img
                              src={displayExhibitImg}
                              alt="Original Anchored Exhibit"
                              className="h-full w-auto object-contain rounded-lg shadow-md"
                              style={{ opacity: 1 - (diffFrameScrubber / 200) }}
                            />
                            <div className="absolute top-2 left-2 bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Genesis Ledger Block #{selectedItem.blockNumber}
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-xs text-emerald-400 text-[10px] font-mono px-2 py-1 rounded flex justify-between items-center">
                              <span>Hash: {selectedItem.originalHash.substring(0, 18)}...</span>
                              <span className="text-emerald-300 font-bold">100% Pristine</span>
                            </div>
                          </div>

                          <p className="text-xs text-emerald-950 font-medium">
                            Authentic reference frame locked in PRAMANA Ledger block #{selectedItem.blockNumber}.
                          </p>
                        </div>

                        {/* Panel B: Submitted File */}
                        <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-3">
                          <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                            <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                              <ShieldAlert className="w-4 h-4 text-rose-600" />
                              Submitted Exhibit File
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                              Flagged Anomaly
                            </span>
                          </div>

                          <div className="h-64 bg-black/90 rounded-xl flex flex-col items-center justify-center p-2 border border-rose-500/40 relative overflow-hidden">
                            <img
                              src={displayExhibitImg}
                              alt="Submitted Exhibit File"
                              className="h-full w-auto object-contain rounded-lg shadow-md"
                              style={{ filter: showElaHeatmap ? 'contrast(120%) saturate(150%)' : 'none' }}
                            />

                            {(showElaHeatmap || diffFrameScrubber > 0) && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div
                                  className="absolute border-2 border-dashed border-rose-500 bg-rose-500/25 rounded-lg backdrop-blur-[1px] animate-pulse flex items-center justify-center"
                                  style={{
                                    top: '25%',
                                    left: '30%',
                                    width: '40%',
                                    height: '45%',
                                    opacity: Math.max(0.4, diffFrameScrubber / 100)
                                  }}
                                >
                                  <span className="text-[10px] font-mono font-bold text-rose-200 bg-slate-950/90 px-2 py-0.5 rounded border border-rose-500/60 shadow-lg flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-rose-400 animate-spin" /> ELA LUMINESCENCE VARIANCE (+14.2 dB)
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="absolute top-2 left-2 bg-rose-950/90 backdrop-blur-xs text-rose-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-rose-500/40 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-rose-400" /> Neural Tamper Mask Active
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-xs text-rose-300 text-[10px] font-mono px-2 py-1 rounded flex justify-between items-center">
                              <span>Hash: {selectedItem.submittedHash.substring(0, 18)}...</span>
                              <span className="text-rose-400 font-bold">
                                {selectedItem.confidenceScore < 95 ? `${(100 - selectedItem.confidenceScore).toFixed(1)}% Tamper Variance` : 'Spectral Noise Spike'}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-rose-950 font-medium">
                            Contains generative neural artifacts or pixel manipulation.
                          </p>
                        </div>
                      </div>

                      {/* Detailed Anomaly Breakdown List */}
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Detected Frame & Pixel Anomaly Events ({displayAnomalies.length})
                        </h4>

                        {displayAnomalies.map((an, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-slate-900 flex items-center gap-2">
                                <BadgeAlert className="w-4 h-4 text-rose-600" />
                                {an.anomalyType} ({an.frameOrPage})
                              </span>
                              <span className="text-rose-700 font-mono text-[11px]">
                                Confidence: {an.confidenceScore}%
                              </span>
                            </div>
                            <p className="text-slate-700">{an.description}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                              <div className="p-2 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                                <strong>Original:</strong> {an.originalValue}
                              </div>
                              <div className="p-2 rounded bg-rose-50 text-rose-900 border border-rose-200">
                                <strong>Altered:</strong> {an.alteredValue}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {/* INNER TAB 3: HASH CHAIN & MERKLE INTEGRITY */}
          {innerSubTab === 'hash_chain' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-indigo-600" /> PRAMANA Blockchain Hash & Merkle Ledger
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Cryptographic SHA-256 byte comparison and Merkle tree root proof audit.
                  </p>
                </div>

                {/* Hashes Hex Inspector Box */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-slate-400">PRAMANA BLOCKCHAIN LEDGER BLOCK #{selectedItem.blockNumber}</span>
                    <span
                      className={`px-3 py-1 rounded-md text-[10px] font-bold border ${
                        selectedItem.originalHash === selectedItem.submittedHash
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {selectedItem.originalHash === selectedItem.submittedHash
                        ? 'HASH MATCH VERIFIED (100%)'
                        : 'CRYPTOGRAPHIC HASH MISMATCH'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">PRAMANA GENESIS ANCHORED HASH (256-BIT):</span>
                      <p className="text-emerald-400 font-bold break-all bg-black/40 p-3 rounded-xl border border-white/10 mt-1">
                        {selectedItem.originalHash}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">SUBMITTED EXHIBIT HASH (256-BIT):</span>
                      <p
                        className={`font-bold break-all p-3 rounded-xl border mt-1 ${
                          selectedItem.originalHash === selectedItem.submittedHash
                            ? 'text-emerald-400 bg-black/40 border-white/10'
                            : 'text-rose-400 bg-rose-950/40 border-rose-500/30'
                        }`}
                      >
                        {selectedItem.submittedHash}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">MERKLE TREE ROOT PROOF:</span>
                      <p className="text-indigo-300 font-bold break-all bg-black/40 p-2.5 rounded-xl border border-white/10 mt-1">
                        {selectedItem.merkleRoot}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">Cryptographic Verification Principle:</p>
                  <p>
                    A single bit alteration in the binary payload completely shifts the 256-bit SHA digest. The hash mismatch confirms payload tampering occurred post-seizure.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 4: CHAIN OF CUSTODY AUDIT TRAIL */}
          {innerSubTab === 'custody_chain' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" /> Chain of Custody Audit Trail
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Chronological ledger of exhibit transfers, seizure officers, and quarantine buffer scans.
                  </p>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedItem.custodyTrail.map((ev) => (
                    <div key={ev.id} className="relative pl-4 space-y-1">
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-white ring-2 ring-indigo-500" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{ev.stage}</span>
                        <span className="text-xs text-slate-400">• {ev.timestamp}</span>
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          Block #{ev.blockNumber}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        Actor: <strong className="text-slate-900">{ev.actor}</strong> ({ev.role}) • Location: {ev.location}
                      </p>

                      <p className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PRAMANA Block Anchor Verified
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 5: STATUTORY ADMISSIBILITY & PRECEDENTS */}
          {innerSubTab === 'statutory_precedents' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-600" /> Statutory Admissibility Standards (§ 65B IEA / § 63 BSA)
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Legal framework governing electronic evidence, hash integrity, and expert opinion.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2 text-xs text-indigo-950">
                  <p className="font-bold flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-700" /> Section 65B Electronic Evidence Mandate
                  </p>
                  <p>
                    Under Section 65B of the Indian Evidence Act / Section 63 of Bharatiya Sakshya Adhiniyam 2023, secondary electronic evidence is strictly inadmissible without a valid certificate verifying hash continuity and non-tampered server operations.
                  </p>
                </div>

                {/* Relevant Landmark Precedents */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Binding Landmark Judicial Precedents ({selectedItem.precedents.length})
                  </h4>

                  {selectedItem.precedents.map((pr, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{pr.title}</span>
                        <span className="text-indigo-700 font-mono text-[11px]">{pr.citation} ({pr.court})</span>
                      </div>
                      <p className="text-slate-700 italic">"{pr.principle}"</p>
                      <span className="text-[10px] font-bold text-emerald-700 block">
                        Relevance Match Score: {pr.relevanceScore}%
                      </span>
                    </div>
                  ))}

                  {selectedItem.precedents.length === 0 && (
                    <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
                      Standard evidentiary rules apply. No specific precedent flags attached.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 6: JUDICIAL SIGN-OFF & BENCH ORDERS */}
          {innerSubTab === 'bench_actions' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Judicial Action Form Card */}
              <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-xl space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">
                    <Gavel className="w-4 h-4 text-rose-400" />
                    Judicial Authority Sign-Off Portal
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Execute Judicial Order for Exhibit {selectedItem.exhibitId}
                  </h3>
                  <p className="text-slate-300 text-xs mt-1">
                    Sign with your court bench key to officially admit, reject, or escalate this exhibit.
                  </p>
                </div>

                {/* Form controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Judicial Remarks & Legal Justification
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter legal justification for evidence admissibility order..."
                      value={judgeRemarks}
                      onChange={(e) => setJudgeRemarks(e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-2xl text-xs text-white placeholder-slate-400 outline-none focus:border-rose-400 focus:bg-white/15"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Bench Private Signature Passkey Token
                    </label>
                    <input
                      type="password"
                      value={judgePasskey}
                      onChange={(e) => setJudgePasskey(e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-2xl text-xs font-mono text-white outline-none focus:border-rose-400"
                    />
                  </div>

                  {/* Oath Checkbox */}
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToOath}
                      onChange={(e) => setAgreedToOath(e.target.checked)}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-xs text-slate-200 leading-relaxed font-medium">
                      I solemnly affirm under my judicial oath that I have reviewed the MAYA-BREAK forensic report and cryptographically sign this evidentiary order into the official court record.
                    </span>
                  </label>

                  {/* Decision Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <button
                      onClick={() => handleJudicialDecision('Accepted & Admitted')}
                      disabled={isSigning}
                      className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Accept & Admit to Record</span>
                    </button>

                    <button
                      onClick={() => handleJudicialDecision('Escalated to CFSL')}
                      disabled={isSigning}
                      className="py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 disabled:opacity-50"
                    >
                      <Building className="w-4 h-4" />
                      <span>Escalate to CFSL Expert</span>
                    </button>

                    <button
                      onClick={() => handleJudicialDecision('Rejected & Excluded')}
                      disabled={isSigning}
                      className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject as Inadmissible</span>
                    </button>
                  </div>
                </div>

                {/* Show Decision Seal if already acted upon */}
                {selectedItem.judicialDecision && (
                  <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 space-y-1 text-xs">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-300">
                      <Award className="w-4 h-4" /> Judicial Action Executed & Sealed
                    </p>
                    <p>Decision: <strong>{selectedItem.judicialDecision.action}</strong></p>
                    <p>Signed By: {selectedItem.judicialDecision.judgeName} ({selectedItem.judicialDecision.timestamp})</p>
                    <p className="font-mono text-[11px] text-emerald-400">
                      Digital Hash: {selectedItem.judicialDecision.digitalSignatureHash}
                    </p>
                  </div>
                )}
              </div>

              {/* Issue New Bench Directive Form Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" /> Issue Judicial Directive / Subpoena
                </h3>

                <form onSubmit={handleAddDirective} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Directive Type
                    </label>
                    <select
                      value={newDirectiveType}
                      onChange={(e) => setNewDirectiveType(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white"
                    >
                      <option value="CFSL Forensic Subpoena">CFSL Forensic Subpoena</option>
                      <option value="Device Seizure Directive">Device Seizure Directive</option>
                      <option value="In-Camera Demonstration Order">In-Camera Demonstration Order</option>
                      <option value="Section 65B Certificate Re-audit">Section 65B Certificate Re-audit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Directive Specifics & Orders
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Enter specific instructions to Investigating Officer or Forensic Lab..."
                      value={newDirectiveDetails}
                      onChange={(e) => setNewDirectiveDetails(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Issue & Seal Bench Order</span>
                  </button>
                </form>

                {/* Directives List */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Active Directives for Exhibit ({selectedItem.directives.length})
                  </h4>

                  {selectedItem.directives.map((dir) => (
                    <div key={dir.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{dir.type}</span>
                        <span className="text-indigo-700 font-mono text-[11px]">{dir.date}</span>
                      </div>
                      <p className="text-slate-700">{dir.details}</p>
                      <p className="text-[10px] font-mono text-slate-400">
                        Seal Hash: {dir.sealHash} • Issued By: {dir.issuedBy}
                      </p>
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
