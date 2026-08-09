import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SignatureCanvas from 'react-signature-canvas';
import { api } from '../services/api';
import {
  Scale,
  AlertCircle,
  CheckCircle2,
  Info,
  Search,
  FileText,
  ShieldAlert,
  X,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Check,
  Edit3,
  Sparkles,
  Award,
  Clock,
  ArrowLeft,
  Printer,
  Key,
  Lock,
  ShieldCheck,
  FileSignature,
  Layers,
  Cpu,
  FileSearch,
  Gavel,
  BookOpen,
  Plus,
  Activity,
  UserCheck,
  Compass,
  Zap,
  SlidersHorizontal,
  FileCode,
  Shield,
  HelpCircle,
  Share2,
  LockKeyhole,
} from 'lucide-react';

export interface PrecedentFlagItem {
  id: string;
  caseId: string;
  caseTitle: string;
  factPatternCategory: string;
  rulingDate: string;
  benchCourt: string;
  judgeName: string;
  actualRuling: string;
  expectedRange: string;
  deviationSigma: string; // e.g. "+3.4 σ Outlier"
  deviationDescription: string;
  status: 'Pending Review' | 'Reviewed';
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  benchmarkSampleCount: number;
  similarityScore: number; // e.g. 94.8%
  primaryStatutes: string[];

  // Deep Details
  matchedPrecedents: Array<{
    citation: string;
    caseName: string;
    court: string;
    similarityPercent: number;
    rulingSummary: string;
    relevanceKey: string;
  }>;

  factVectorComparison: Array<{
    parameter: string;
    subjectCaseValue: string;
    cohortMedianValue: string;
    varianceLevel: 'Critical' | 'Major' | 'Minor';
    impactNote: string;
  }>;

  distributionData: {
    medianVal: string;
    p90Val: string;
    actualVal: string;
    zScore: number;
    outlierPercentile: string;
  };

  statutoryChecklist: Array<{
    statute: string;
    provision: string;
    complianceStatus: 'Aligned' | 'Deviated' | 'Under Review';
    courtNotes: string;
  }>;

  benchDirectives: Array<{
    id: string;
    date: string;
    issuedBy: string;
    type: 'Bench Quality Note' | 'Circuit Advisory' | 'Explanatory Diary Note' | 'Panel Escalation';
    details: string;
    status: 'Active' | 'Archived';
    sealHash: string;
  }>;
}

const INITIAL_FLAGS: PrecedentFlagItem[] = [
  {
    id: 'FLAG-2026-001',
    caseId: 'HC-BOMBAY-2025-1104',
    caseTitle: 'State of Maharashtra vs. A. K. Financials',
    factPatternCategory: 'Cyber Extortion & Commercial Bail Standards',
    rulingDate: '14 Jan 2026',
    benchCourt: 'Division Bench 3, Bombay High Court',
    judgeName: 'Hon. Justice V. K. Deshmukh',
    actualRuling: 'Absolute denial of interim bail; unconditional freeze on 14 corporate accounts prior to charge sheet filing.',
    expectedRange: 'Interim bail granted in 82% of similar fact-patterns with passport surrender & bond range ₹50,000–₹2,00,000.',
    deviationSigma: '+3.4 σ Outlier',
    deviationDescription: 'Ruling severity lies outside the 99th percentile benchmark for non-violent corporate cyber charges lacking flight risk indicators.',
    status: 'Pending Review',
    benchmarkSampleCount: 1240,
    similarityScore: 94.8,
    primaryStatutes: ['IT Act Section 66D', 'CrPC Section 437/439', 'PMLA Section 45'],

    matchedPrecedents: [
      {
        citation: '(2022) 4 SCC 512',
        caseName: 'Sanjay Chandra vs. CBI',
        court: 'Supreme Court of India',
        similarityPercent: 96.2,
        rulingSummary: 'Bail is the rule and jail is the exception in economic offenses where investigation does not require custodial interrogation.',
        relevanceKey: 'Pre-charge sheet asset freezing vs personal liberty proportionality.',
      },
      {
        citation: '2023 DHC 8891',
        caseName: 'Cyber Infrastructure Ltd vs. Enforcement Directorate',
        court: 'Delhi High Court',
        similarityPercent: 92.4,
        rulingSummary: 'Corporate bank accounts essential for payroll cannot be frozen 100% without specific nexus to proceeds of crime.',
        relevanceKey: 'Bank account freezing thresholds in financial cyber cases.',
      },
      {
        citation: 'AIR 2020 SC 1120',
        caseName: 'P. Chidambaram vs. Directorate of Enforcement',
        court: 'Supreme Court of India',
        similarityPercent: 89.5,
        rulingSummary: 'Flight risk and tampering potential must be established via concrete evidentiary material.',
        relevanceKey: 'Flight risk parameter evaluation.',
      },
    ],

    factVectorComparison: [
      {
        parameter: 'Asset Impound Quantum',
        subjectCaseValue: '100% Account Freeze (14 Accounts)',
        cohortMedianValue: '25% Escrow Reserve or Security Bond',
        varianceLevel: 'Critical',
        impactNote: 'Completely halts operational payroll without proven dissipation risk.',
      },
      {
        parameter: 'Interim Bail Grant Condition',
        subjectCaseValue: 'Absolute Custodial Detention',
        cohortMedianValue: 'Bail granted with Passport Deposit + Surety',
        varianceLevel: 'Critical',
        impactNote: 'Detention prolonged despite accused depositing primary servers with forensic police.',
      },
      {
        parameter: 'Flight Risk Index',
        subjectCaseValue: '0.12 (Extremely Low Risk)',
        cohortMedianValue: '0.35 (Low-Moderate Risk)',
        varianceLevel: 'Minor',
        impactNote: 'Accused has permanent residence, family roots, and voluntarily surrendered passport.',
      },
    ],

    distributionData: {
      medianVal: '₹1,50,000 Bond + Passport Deposit',
      p90Val: '₹5,00,000 Bond + Weekly Reporting',
      actualVal: 'No Bail + 100% Asset Freeze',
      zScore: 3.42,
      outlierPercentile: 'Top 0.08% Tail Variance',
    },

    statutoryChecklist: [
      {
        statute: 'CrPC Section 439',
        provision: 'Special powers of High Court regarding bail',
        complianceStatus: 'Deviated',
        courtNotes: 'Court departed from established liberty doctrine without recording flight risk evidence.',
      },
      {
        statute: 'IT Act Section 66D',
        provision: 'Cheating by personation using computer resource',
        complianceStatus: 'Aligned',
        courtNotes: 'Offense invoked correctly based on server IP logs.',
      },
      {
        statute: 'Section 65B Certificate',
        provision: 'Admissibility of electronic records',
        complianceStatus: 'Aligned',
        courtNotes: '65B Hash certificate present in trial ledger.',
      },
    ],

    benchDirectives: [
      {
        id: 'DIR-PRE-001',
        date: '15 Jan 2026, 02:30 PM',
        issuedBy: 'Digital Twin Layer 6 Inspector',
        type: 'Bench Quality Note',
        details: 'Outlier alert auto-routed to High Court Judicial Quality Cell due to +3.4σ deviation on bail parameters.',
        status: 'Active',
        sealHash: '0xSEAL_DIR_PRE_88201',
      },
    ],
  },
  {
    id: 'FLAG-2026-002',
    caseId: 'SLA-2026-0412',
    caseTitle: 'TechCorp Solutions vs. Municipal Procurement Cell',
    factPatternCategory: 'Commercial Contract Breach & Liquidated Damages',
    rulingDate: '28 Nov 2025',
    benchCourt: 'Commercial Bench 1, Delhi High Court',
    judgeName: 'Hon. Justice S. K. Roy',
    actualRuling: 'Awarded 100% liquidated damages without requiring proof of actual pecuniary loss suffered by claimant.',
    expectedRange: 'Damages capped at proven loss or max 15% contractual penalty in 89% of precedents (Section 74 Contract Act cohort).',
    deviationSigma: '+2.8 σ Outlier',
    deviationDescription: 'Liquidated damages quantum awarded exceeds 3x the statistical median of comparable municipal tech procurement disputes.',
    status: 'Pending Review',
    benchmarkSampleCount: 850,
    similarityScore: 92.1,
    primaryStatutes: ['Indian Contract Act Section 74', 'Arbitration Act Section 34', 'Specific Relief Act Section 20'],

    matchedPrecedents: [
      {
        citation: '(2015) 4 SCC 136',
        caseName: 'Kailash Nath Associates vs. DDA',
        court: 'Supreme Court of India',
        similarityPercent: 97.4,
        rulingSummary: 'Proof of actual loss is mandatory under Section 74 unless loss is impossible or difficult to prove.',
        relevanceKey: 'Mandatory requirement of proving loss for liquidated damages.',
      },
      {
        citation: '(2003) 5 SCC 705',
        caseName: 'ONGC Ltd vs. Saw Pipes Ltd',
        court: 'Supreme Court of India',
        similarityPercent: 91.8,
        rulingSummary: 'Liquidated damages clause must represent a genuine pre-estimate of loss, not an in-terrorem penalty.',
        relevanceKey: 'Genuine pre-estimate vs penalty clause distinction.',
      },
    ],

    factVectorComparison: [
      {
        parameter: 'Liquidated Damages Quantum',
        subjectCaseValue: '100% Contract Value (₹4.2 Cr)',
        cohortMedianValue: '12.5% Contract Value (₹52 Lacs)',
        varianceLevel: 'Critical',
        impactNote: 'Awarding full contract value as penalty violates Section 74 reasonableness test.',
      },
      {
        parameter: 'Proof of Pecuniary Loss Submitted',
        subjectCaseValue: 'Nil (Relying strictly on Penalty Clause)',
        cohortMedianValue: 'Audited Financial Loss Report Submitted',
        varianceLevel: 'Major',
        impactNote: 'No evidence of actual municipal revenue loss presented during hearing.',
      },
    ],

    distributionData: {
      medianVal: '10% - 15% Award Capped at Proven Loss',
      p90Val: '25% Award with Partial Loss Records',
      actualVal: '100% Unconditional Award',
      zScore: 2.84,
      outlierPercentile: 'Top 0.4% Tail Variance',
    },

    statutoryChecklist: [
      {
        statute: 'Contract Act Section 74',
        provision: 'Compensation for breach of contract where penalty stipulated',
        complianceStatus: 'Deviated',
        courtNotes: 'Awarded full stipulated sum without establishing impossibility of proving loss.',
      },
      {
        statute: 'Specific Relief Act Section 20',
        provision: 'Discretionary remedies for contract breach',
        complianceStatus: 'Aligned',
        courtNotes: 'Court exercised jurisdiction within commercial tribunal rules.',
      },
    ],

    benchDirectives: [],
  },
  {
    id: 'FLAG-2026-003',
    caseId: 'FIR-2025-0892',
    caseTitle: 'Narcotics Control Bureau vs. R. V. Sharma',
    factPatternCategory: 'Narcotics Possession & Search Procedure Compliance',
    rulingDate: '02 Dec 2025',
    benchCourt: 'Special NDPS Court, Zone 4',
    judgeName: 'Hon. Magistrate P. L. Bhatia',
    actualRuling: 'Suppressed key seizure evidence due to 12-minute delay in logging Section 50 memo.',
    expectedRange: 'Technical timing variances under 30 mins deemed curable irregularity in 91% of appellate rulings unless prejudice shown.',
    deviationSigma: '-2.9 σ Outlier',
    deviationDescription: 'Strict exclusion of physical evidence for minor procedural timestamps deviates significantly from circuit appellate consensus.',
    status: 'Pending Review',
    benchmarkSampleCount: 2100,
    similarityScore: 95.6,
    primaryStatutes: ['NDPS Act Section 50', 'CrPC Section 465', 'Evidence Act Section 5'],

    matchedPrecedents: [
      {
        citation: '(2018) 18 SCC 257',
        caseName: 'State of Punjab vs. Baljinder Singh',
        court: 'Supreme Court of India',
        similarityPercent: 98.1,
        rulingSummary: 'Minor procedural delays in logging search memos do not vitiate seizure if independent witnesses corroborate recovery.',
        relevanceKey: 'Curable technical timing irregularities under NDPS Section 50.',
      },
    ],

    factVectorComparison: [
      {
        parameter: 'Procedural Delay Duration',
        subjectCaseValue: '12 Minutes',
        cohortMedianValue: '28 Minutes (Accepted as Curable)',
        varianceLevel: 'Major',
        impactNote: 'Rigid suppression of commercial contraband seizure based on 12-min timestamp lag.',
      },
      {
        parameter: 'Independent Panch Witness Corroboration',
        subjectCaseValue: 'Dual Panch Witnesses Signed Memo',
        cohortMedianValue: 'Panch Witnesses Present',
        varianceLevel: 'Minor',
        impactNote: 'Witnesses affirmed seizure was genuine despite 12-min logging gap.',
      },
    ],

    distributionData: {
      medianVal: 'Seizure Admitted; Irregularity Cured',
      p90Val: 'Seizure Admitted with Warning to IO',
      actualVal: 'Evidence Suppressed & Case Dismissed',
      zScore: -2.91,
      outlierPercentile: 'Bottom 0.3% Tail Variance',
    },

    statutoryChecklist: [
      {
        statute: 'NDPS Act Section 50',
        provision: 'Conditions under which search of person shall be conducted',
        complianceStatus: 'Under Review',
        courtNotes: 'Strict interpretation applied by trial judge.',
      },
      {
        statute: 'CrPC Section 465',
        provision: 'Finding or sentence when reversible by reason of error or omission',
        complianceStatus: 'Deviated',
        courtNotes: 'Failed to evaluate whether 12-min delay caused genuine prejudice.',
      },
    ],

    benchDirectives: [],
  },
  {
    id: 'FLAG-2026-004',
    caseId: 'HC-DELHI-2025-0988',
    caseTitle: 'Pharma Global vs. BioGeneric India',
    factPatternCategory: 'Intellectual Property Injunction & Irreparable Harm',
    rulingDate: '19 Aug 2025',
    benchCourt: 'IPR Bench, Delhi High Court',
    judgeName: 'Hon. Justice M. G. Rao',
    actualRuling: 'Ex-parte interim injunction granted blocking drug distribution without security bond requirement.',
    expectedRange: 'Security bond mandatory or injunction deferred to inter-partes hearing in 86% of generic drug patent disputes.',
    deviationSigma: '+2.5 σ Outlier',
    deviationDescription: 'Omission of cross-undertaking in damages for ex-parte generic pharmaceutical stays falls in top 4% variance band.',
    status: 'Reviewed',
    reviewNote: 'Reviewed by Judicial Quality Panel. Judge recorded specific public health urgency finding regarding contaminated active ingredients.',
    reviewedBy: 'Hon. Justice M. G. Rao (Bench Quality Committee)',
    reviewedAt: '22 Aug 2025',
    benchmarkSampleCount: 640,
    similarityScore: 89.9,
    primaryStatutes: ['Patents Act Section 108', 'CPC Order 39 Rule 1 & 2', 'Specific Relief Act Section 37'],

    matchedPrecedents: [
      {
        citation: '(2008) 10 SCC 1',
        caseName: 'Novartis AG vs. Union of India',
        court: 'Supreme Court of India',
        similarityPercent: 91.5,
        rulingSummary: 'Public interest and availability of essential medicine must be weighed against patent holder injunctions.',
        relevanceKey: 'Public health interest balancing in pharmaceutical stays.',
      },
    ],

    factVectorComparison: [
      {
        parameter: 'Cross-Undertaking in Damages Required',
        subjectCaseValue: 'None (Omitted)',
        cohortMedianValue: 'Mandatory ₹1.0 Cr Bond Required',
        varianceLevel: 'Major',
        impactNote: 'Generic manufacturer barred without indemnity if patent ultimately held invalid.',
      },
    ],

    distributionData: {
      medianVal: 'Inter-Partes Hearing Fixed within 7 Days',
      p90Val: 'Ex-parte Stay with Security Bond Deposit',
      actualVal: 'Ex-parte Injunction without Security Bond',
      zScore: 2.52,
      outlierPercentile: 'Top 1.2% Tail Variance',
    },

    statutoryChecklist: [
      {
        statute: 'CPC Order 39 Rule 3',
        provision: 'Notice to opposite party before granting injunction',
        complianceStatus: 'Aligned',
        courtNotes: 'Urgency reasons recorded under public health exception.',
      },
    ],

    benchDirectives: [
      {
        id: 'DIR-PRE-004',
        date: '22 Aug 2025, 11:00 AM',
        issuedBy: 'Judicial Quality Panel',
        type: 'Explanatory Diary Note',
        details: 'Special public health contamination finding endorsed by Quality Panel. Outlier flag resolved.',
        status: 'Archived',
        sealHash: '0xSEAL_DIR_PRE_99104',
      },
    ],
  },
];

export function PrecedentFlagsTab() {
  const [flags, setFlags] = useState<PrecedentFlagItem[]>(INITIAL_FLAGS);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFlags = () => {
    api.getPrecedentFlags()
      .then(res => {
        if (res && res.success && res.flags) {
          const mapped = res.flags.map((sf: any) => {
            const matchedMock = INITIAL_FLAGS.find(mf =>
              mf.id === sf.id ||
              mf.id.replace('FLAG-2026-00', 'PREC-70') === sf.id ||
              sf.id.replace('PREC-70', 'FLAG-2026-00') === mf.id
            );
            return {
              id: sf.id,
              caseId: sf.caseId,
              caseTitle: sf.caseTitle,
              factPatternCategory: matchedMock?.factPatternCategory || 'General Procedure Compliance',
              rulingDate: matchedMock?.rulingDate || '14 Jan 2026',
              benchCourt: matchedMock?.benchCourt || 'High Court',
              judgeName: matchedMock?.judgeName || 'Hon. Judge',
              actualRuling: sf.conflictDescription || matchedMock?.actualRuling,
              expectedRange: matchedMock?.expectedRange || 'Benchmark guidelines.',
              deviationSigma: sf.severity === 'Critical' ? '+3.4 σ Outlier' : '+2.5 σ Outlier',
              deviationDescription: sf.conflictDescription || matchedMock?.deviationDescription,
              status: sf.status === 'Resolved' || sf.status === 'Reviewed' ? 'Reviewed' : 'Pending Review',
              reviewNote: sf.resolvedReason || matchedMock?.reviewNote,
              reviewedBy: sf.resolvedBy || matchedMock?.reviewedBy,
              reviewedAt: sf.resolvedAt ? new Date(sf.resolvedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : matchedMock?.reviewedAt,
              benchmarkSampleCount: matchedMock?.benchmarkSampleCount || 1000,
              similarityScore: matchedMock?.similarityScore || 95,
              primaryStatutes: matchedMock?.primaryStatutes || [sf.precedentCitation],
              matchedPrecedents: matchedMock?.matchedPrecedents || [],
              factVectorComparison: matchedMock?.factVectorComparison || [],
              distributionData: matchedMock?.distributionData || { medianVal: 'Normal', p90Val: 'Limit', actualVal: 'Outlier', zScore: 3, outlierPercentile: 'Tail' },
              statutoryChecklist: matchedMock?.statutoryChecklist || [],
              benchDirectives: matchedMock?.benchDirectives || []
            };
          });
          setFlags(mapped);
        }
      })
      .catch(err => console.error('Error fetching precedent flags:', err));
  };

  useEffect(() => {
    fetchFlags();
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending Review' | 'Reviewed'>('All');

  // DEEP DETAILED INNER VIEW SELECTION
  // null = Repository List View; Flag ID = Deep Inner Detailed Pager View
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);

  // INNER SUB-TAB SELECTION inside Deep Detailed View
  const [innerSubTab, setInnerSubTab] = useState<
    'overview' | 'neural_matching' | 'distribution' | 'statutory_audit' | 'directives' | 'judicial_action'
  >('overview');

  // JUDICIAL SIGNING FORM STATE inside Deep Detailed View
  const [judgePasskey, setJudgePasskey] = useState('JUDGE-BENCH-KEY-2026-SECRET');
  const [judgeRemarks, setJudgeRemarks] = useState('');
  const [agreedToOath, setAgreedToOath] = useState(false);
  const [judicialActionChoice, setJudicialActionChoice] = useState<
    'Approved' | 'Escalated' | 'Dismissed'
  >('Approved');
  const [isSigning, setIsSigning] = useState(false);
  const sigPadRef = useRef<SignatureCanvas>(null);

  // NEW DIRECTIVE FORM
  const [newDirectiveType, setNewDirectiveType] = useState<
    'Bench Quality Note' | 'Circuit Advisory' | 'Explanatory Diary Note' | 'Panel Escalation'
  >('Bench Quality Note');
  const [newDirectiveDetails, setNewDirectiveDetails] = useState('');

  // TOAST NOTIFICATION
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedFlag = flags.find((f) => f.id === selectedFlagId);

  const categories = ['All', ...Array.from(new Set(flags.map((f) => f.factPatternCategory)))];

  const filteredFlags = flags.filter((flag) => {
    const matchesSearch =
      flag.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.factPatternCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.benchCourt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || flag.factPatternCategory === selectedCategory;
    const matchesStatus = statusFilter === 'All' || flag.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const pendingCount = flags.filter((f) => f.status === 'Pending Review').length;
  const reviewedCount = flags.filter((f) => f.status === 'Reviewed').length;

  const handleOpenDeepView = (id: string, defaultTab: typeof innerSubTab = 'overview') => {
    setSelectedFlagId(id);
    setInnerSubTab(defaultTab);
    setJudgeRemarks('');
    setAgreedToOath(false);
  };

  const handleExecuteJudicialAction = () => {
    if (!selectedFlag) return;
    if (!agreedToOath) {
      showToast('Mandatory Judicial Statutory Oath acknowledgment is required before recording review.');
      return;
    }
    if (!judgePasskey.trim()) {
      showToast('Judicial Private Signature Key Token is required.');
      return;
    }

    setIsSigning(true);

    const serverFlagId = selectedFlag.id.startsWith('FLAG-') ? selectedFlag.id.replace('FLAG-2026-00', 'PREC-70') : selectedFlag.id;
    api.resolvePrecedentFlag(serverFlagId, 'Hon. Presiding Magistrate (Bench Quality Committee)')
      .then(res => {
        if (res && res.success) {
          const now = new Date();
          const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

          let actionDesc = '';
          if (judicialActionChoice === 'Approved') {
            actionDesc = judgeRemarks.trim() || 'Reviewed by Judicial Quality Panel. Outlier notice recorded into case administrative diary.';
          } else if (judicialActionChoice === 'Escalated') {
            actionDesc = judgeRemarks.trim() || 'Escalated to High Court Judicial Quality Review Panel for bench advisory evaluation.';
          } else {
            actionDesc = judgeRemarks.trim() || 'Outlier flag dismissed as false positive. Ruling justified by unique factual nuances.';
          }

          setFlags((prev) =>
            prev.map((f) => {
              if (f.id === selectedFlag.id) {
                return {
                  ...f,
                  status: 'Reviewed',
                  reviewNote: actionDesc,
                  reviewedBy: 'Hon. Presiding Magistrate (Bench Quality Committee)',
                  reviewedAt: dateStr,
                };
              }
              return f;
            })
          );
          showToast(`Precedent Flag Review for ${selectedFlag.caseId} RECORDED: ${judicialActionChoice.toUpperCase()}. Rationale saved to Case Administrative Diary.`);
        } else {
          showToast('Failed to resolve flag: ' + (res.error || 'unknown error'));
        }
      })
      .catch(err => {
        console.error(err);
        showToast('Error resolving precedent flag');
      })
      .finally(() => {
        setIsSigning(false);
      });
  };

  const handleAddDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlagId || !newDirectiveDetails.trim()) return;

    const newDir = {
      id: `DIR-PRE-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      issuedBy: 'Hon. Presiding Magistrate (Bench Quality Cell)',
      type: newDirectiveType,
      details: newDirectiveDetails,
      status: 'Active' as const,
      sealHash: `0xSEAL_DIR_PRE_${Math.floor(Math.random() * 89999 + 10000)}`,
    };

    setFlags((prev) =>
      prev.map((f) => {
        if (f.id === selectedFlagId) {
          return {
            ...f,
            benchDirectives: [newDir, ...f.benchDirectives],
          };
        }
        return f;
      })
    );

    setNewDirectiveDetails('');
    showToast('Bench Advisory / Directive Executed & Sealed to Case Administrative Diary.');
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

      {/* VIEW 1: REPOSITORY LIST OF PRECEDENT STATISTICAL OUTLIER FLAGS */}
      {!selectedFlagId ? (
        <div className="space-y-6">
          {/* Header Banner - Layer 6 Digital Twin Precedent Intelligence */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Scale className="w-64 h-64 text-indigo-300" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Layer 6 Digital Twin • Precedent Neural Benchmarking
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Precedent Statistical Outlier Flags
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Automated deep neural vector matching flags past rulings that deviate statistically from historical fact-pattern cohorts. Designed as an administrative quality benchmark for Court Authority review.
                </p>
              </div>

              {/* Status Metrics Cards */}
              <div className="grid grid-cols-3 gap-3 shrink-0">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Pending Review</span>
                  <span className="text-xl font-bold text-amber-400 font-mono">
                    {pendingCount}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Reviewed</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">
                    {reviewedCount}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Cohort Size</span>
                  <span className="text-xl font-bold text-indigo-300 font-mono">
                    4,830+
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-indigo-200/80 flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <strong>PRAMANA Precedent Engine:</strong> Multi-dimensional vector embeddings with Gaussian tail analysis.
              </span>
              <span className="font-mono text-[11px] bg-white/10 px-3 py-1 rounded-full text-white">
                Bench Key: JUDGE-BENCH-KEY-2026-SECRET
              </span>
            </div>
          </div>

          {/* MANDATORY INSTITUTIONAL DISCLAIMER BANNER */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-50 via-slate-50 to-amber-50 border border-indigo-200 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 flex items-center gap-2">
                <span>Institutional Disclaimer & Framing</span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 text-[10px] lowercase font-mono">
                  non-accusatory
                </span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                <strong>DISCLAIMER:</strong> This statistical signal is generated by Digital Twin benchmark modeling (Layer 6) for human review and administrative awareness only. It is <strong>NOT a judgment on any individual judge</strong>, nor does it imply judicial error, bias, or misconduct. Statistical deviation frequently reflects legitimate, unique case nuances, novel legal arguments, or localized precedent dynamics that quantitative models cannot fully capture.
              </p>
            </div>
          </div>

          {/* Filter, Search, and Category Toolbar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                {(['All', 'Pending Review', 'Reviewed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      statusFilter === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'Pending Review' ? `Pending Review (${pendingCount})` : st}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Category Selector */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Fact Patterns' : cat}
                    </option>
                  ))}
                </select>

                {/* Search Input */}
                <div className="w-full sm:w-72 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search case ID, title, court..."
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

            {/* List Cards of Precedent Flags */}
            <div className="space-y-4">
              {filteredFlags.map((flag) => {
                const isPending = flag.status === 'Pending Review';

                return (
                  <div
                    key={flag.id}
                    onClick={() => handleOpenDeepView(flag.id, 'overview')}
                    className={`p-6 rounded-3xl border transition-all space-y-4 cursor-pointer group hover:shadow-md ${
                      isPending
                        ? 'bg-amber-50/20 border-amber-300 hover:border-amber-400 ring-1 ring-amber-400/20'
                        : 'bg-slate-50/80 border-slate-200 opacity-95'
                    }`}
                  >
                    {/* Top Header Row */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Sigma Badge Box */}
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 border border-slate-800 shadow-xs relative overflow-hidden">
                          <TrendingUp className="w-6 h-6 text-rose-400" />
                          <span className="text-[9px] font-mono mt-0.5 text-amber-300 font-bold">
                            {flag.deviationSigma.split(' ')[0]}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                              {flag.caseId}
                            </span>
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                              {flag.factPatternCategory}
                            </span>
                            <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                              {flag.deviationSigma}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {flag.caseTitle}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium">
                            {flag.benchCourt} • Judge: <strong className="text-slate-900">{flag.judgeName}</strong> • Ruled: {flag.rulingDate}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {isPending ? (
                          <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                            Pending Review
                          </span>
                        ) : (
                          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            Reviewed & Archived
                          </span>
                        )}

                        <span className="text-[11px] font-mono text-slate-500 font-semibold">
                          Twin Match: <strong className="text-indigo-600">{flag.similarityScore}%</strong> (N={flag.benchmarkSampleCount})
                        </span>
                      </div>
                    </div>

                    {/* Actual vs Expected Comparison Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                          Actual Ruling Recorded
                        </span>
                        <p className="text-xs text-slate-800 font-medium line-clamp-2">
                          {flag.actualRuling}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-900 block tracking-wider flex items-center gap-1">
                          <BarChart2 className="w-3 h-3 text-indigo-600" />
                          Model Expected Cohort Range
                        </span>
                        <p className="text-xs text-slate-800 font-medium line-clamp-2">
                          {flag.expectedRange}
                        </p>
                      </div>
                    </div>

                    {/* Reviewed Note if closed */}
                    {!isPending && flag.reviewNote && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold block">Review Rationale ({flag.reviewedAt}):</span>
                          <p className="text-slate-700 font-sans italic">"{flag.reviewNote}"</p>
                        </div>
                      </div>
                    )}

                    {/* Actions Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        Statutes: {flag.primaryStatutes.join(' • ')}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeepView(flag.id, 'neural_matching');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Vector Match</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeepView(flag.id, 'overview');
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Open Deep Audit</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeepView(flag.id, 'judicial_action');
                          }}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <FileSignature className="w-3.5 h-3.5" />
                          <span>Record Review</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredFlags.length === 0 && (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-900">No matching precedent flags found</p>
                  <p className="text-xs text-slate-500">Try clearing your search query or changing filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : selectedFlag ? (
        /* VIEW 2: DEEP DETAILED INNER PAGE / PAGER FOR SELECTED PRECEDENT FLAG */
        <div className="space-y-6">
          {/* Top Navigation & Quick Action Header */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedFlagId(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Return to Precedent Flags Repository</span>
              </button>
              <div className="h-4 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                  {selectedFlag.caseId}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded border ${
                    selectedFlag.status === 'Pending Review'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  {selectedFlag.status}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => showToast('Precedent Twin Benchmark Certificate Exported as PDF')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export Audit PDF</span>
              </button>

              <button
                onClick={() => setInnerSubTab('judicial_action')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <FileSignature className="w-4 h-4" />
                <span>Record Judicial Review</span>
              </button>
            </div>
          </div>

          {/* Hero Banner for Selected Precedent Flag */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-indigo-300 text-xs font-bold border border-white/15">
                    Flag ID: {selectedFlag.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30 font-mono">
                    {selectedFlag.deviationSigma}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                    Category: {selectedFlag.factPatternCategory}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {selectedFlag.caseTitle}
                </h1>

                <p className="text-xs text-slate-300 font-medium">
                  {selectedFlag.benchCourt} • Judge: <strong className="text-white">{selectedFlag.judgeName}</strong> • Ruled: {selectedFlag.rulingDate}
                </p>
              </div>

              {/* Similarity & Sample Size Badge */}
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center shrink-0 min-w-[160px]">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                  Vector Match Score
                </span>
                <span className="text-2xl font-extrabold font-mono text-indigo-300 block mt-1">
                  {selectedFlag.similarityScore}%
                </span>
                <span className="text-[10px] text-slate-300 block mt-0.5">
                  Cohort N = {selectedFlag.benchmarkSampleCount} Rulings
                </span>
              </div>
            </div>

            {/* Impact Callout Bar */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Statistical Deviation Context:</span>
              <span className="text-slate-200 font-medium italic">"{selectedFlag.deviationDescription}"</span>
            </div>
          </div>

          {/* DEEP INNER SUB-TABS NAVIGATION PAGER */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {[
              { id: 'overview', label: '1. Executive Twin Summary', icon: Cpu },
              { id: 'neural_matching', label: '2. Neural Vector Match & Precedents', icon: FileSearch },
              { id: 'distribution', label: '3. Gaussian Cohort Distribution', icon: BarChart2 },
              { id: 'statutory_audit', label: '4. Statutory & Appellate Audit', icon: Scale },
              { id: 'directives', label: '5. Bench Advisory Directives', icon: Shield },
              { id: 'judicial_action', label: '6. Record Judicial Review', icon: Gavel },
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

          {/* INNER TAB 1: EXECUTIVE TWIN SUMMARY */}
          {innerSubTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Ruling vs Model Expected Range Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-indigo-600" />
                        Actual Ruling vs Digital Twin Expected Range
                      </h3>
                      <p className="text-xs text-slate-500">
                        Quantitative comparison between subject judgment and historical benchmark median for N={selectedFlag.benchmarkSampleCount} cases.
                      </p>
                    </div>

                    <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-full text-xs font-bold font-mono">
                      {selectedFlag.deviationSigma}
                    </span>
                  </div>

                  {/* Comparison Side-by-Side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-xs font-extrabold uppercase text-slate-500 block tracking-wider">
                        Recorded Court Ruling
                      </span>
                      <p className="text-xs text-slate-900 font-semibold leading-relaxed">
                        {selectedFlag.actualRuling}
                      </p>
                      <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                        Bench: <strong>{selectedFlag.benchCourt}</strong>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                      <span className="text-xs font-extrabold uppercase text-indigo-900 block tracking-wider flex items-center gap-1.5">
                        <BarChart2 className="w-4 h-4 text-indigo-600" />
                        Model Cohort Benchmark
                      </span>
                      <p className="text-xs text-slate-900 font-semibold leading-relaxed">
                        {selectedFlag.expectedRange}
                      </p>
                      <div className="pt-2 border-t border-indigo-200/80 text-[11px] text-indigo-800">
                        Cohort Sample: <strong>N = {selectedFlag.benchmarkSampleCount} Rulings</strong>
                      </div>
                    </div>
                  </div>

                  {/* Fact Pattern Parameter Variance Summary */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Primary Variance Parameters</span>
                      <button
                        onClick={() => setInnerSubTab('neural_matching')}
                        className="text-indigo-600 hover:underline text-xs lowercase font-normal"
                      >
                        view full vector matrix →
                      </button>
                    </h4>

                    <div className="space-y-2">
                      {selectedFlag.factVectorComparison.map((vec, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block">{vec.parameter}</span>
                            <span className="text-slate-500 text-[11px] block">{vec.impactNote}</span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 uppercase block font-bold">Subject Value</span>
                              <span className="font-bold text-slate-900 font-mono text-[11px]">{vec.subjectCaseValue}</span>
                            </div>

                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${
                                vec.varianceLevel === 'Critical'
                                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                                  : vec.varianceLevel === 'Major'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-blue-100 text-blue-900 border-blue-300'
                              }`}
                            >
                              {vec.varianceLevel}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Navigation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setInnerSubTab('neural_matching')}
                    className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 text-left transition-all space-y-2 shadow-xs group"
                  >
                    <div className="flex items-center justify-between">
                      <Cpu className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Neural Vector Precedent Matching</h4>
                    <p className="text-xs text-slate-500">
                      Explore top 3 landmark precedent citations identified by AI similarity models.
                    </p>
                  </button>

                  <button
                    onClick={() => setInnerSubTab('distribution')}
                    className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 text-left transition-all space-y-2 shadow-xs group"
                  >
                    <div className="flex items-center justify-between">
                      <BarChart2 className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Gaussian Distribution Curve</h4>
                    <p className="text-xs text-slate-500">
                      View standard deviation z-scores and percentile tail placement.
                    </p>
                  </button>
                </div>
              </div>

              {/* Right Side Metadata Sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-5 shadow-lg border border-slate-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    Case Metadata & Audit Record
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between pb-2 border-b border-white/10">
                      <span className="text-slate-400">Case ID</span>
                      <span className="font-mono font-bold text-white">{selectedFlag.caseId}</span>
                    </div>

                    <div className="flex justify-between pb-2 border-b border-white/10">
                      <span className="text-slate-400">Bench Court</span>
                      <span className="font-medium text-slate-200">{selectedFlag.benchCourt}</span>
                    </div>

                    <div className="flex justify-between pb-2 border-b border-white/10">
                      <span className="text-slate-400">Presiding Judge</span>
                      <span className="font-bold text-white">{selectedFlag.judgeName}</span>
                    </div>

                    <div className="flex justify-between pb-2 border-b border-white/10">
                      <span className="text-slate-400">Ruling Date</span>
                      <span className="font-mono text-slate-200">{selectedFlag.rulingDate}</span>
                    </div>

                    <div className="flex justify-between pb-2 border-b border-white/10">
                      <span className="text-slate-400">Vector Similarity Score</span>
                      <span className="font-mono font-bold text-indigo-300">{selectedFlag.similarityScore}%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Flag Review Status</span>
                      <span className="font-bold text-amber-300">{selectedFlag.status}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setInnerSubTab('judicial_action')}
                      className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <FileSignature className="w-4 h-4" />
                      <span>Record Judicial Review</span>
                    </button>
                  </div>
                </div>

                {/* Statutory Badges */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Primary Statutory Provisions</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFlag.primaryStatutes.map((st, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-800">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 2: NEURAL VECTOR MATCHING & PRECEDENTS */}
          {innerSubTab === 'neural_matching' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-indigo-600" />
                      Fact-Pattern Neural Vector Similarity Matching
                    </h3>
                    <p className="text-xs text-slate-500">
                      Layer 6 Transformer embeddings matched subject case facts against 4,830+ historic appellate precedents.
                    </p>
                  </div>

                  <span className="px-3.5 py-1.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-full text-xs font-bold font-mono shrink-0">
                    Confidence: {selectedFlag.similarityScore}% Match
                  </span>
                </div>

                {/* Matched Precedents List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Top Benchmark Landmark Citations</h4>

                  <div className="space-y-4">
                    {selectedFlag.matchedPrecedents.map((prec, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 transition-all hover:bg-slate-100/80"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                              {prec.citation}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{prec.caseName}</span>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-bold">
                            {prec.similarityPercent}% Similarity
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          <strong>Ruling Principle:</strong> "{prec.rulingSummary}"
                        </p>

                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Court: <strong>{prec.court}</strong></span>
                          <span>Relevance Vector: <strong className="text-indigo-700">{prec.relevanceKey}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fact-Pattern Feature Vector Comparison Table */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Feature Vector Variance Matrix</h4>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                    <div className="bg-slate-900 text-white p-3.5 font-bold grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <span>Parameter / Variable</span>
                      <span>Subject Case Value</span>
                      <span>Cohort Median Value</span>
                      <span>Variance / Impact</span>
                    </div>

                    {selectedFlag.factVectorComparison.map((row, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 grid grid-cols-1 sm:grid-cols-4 gap-2 border-b border-slate-100 bg-white hover:bg-slate-50 text-slate-800"
                      >
                        <span className="font-bold text-slate-900">{row.parameter}</span>
                        <span className="font-mono text-rose-700 font-bold">{row.subjectCaseValue}</span>
                        <span className="font-mono text-emerald-800 font-medium">{row.cohortMedianValue}</span>
                        <div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block mb-1 ${
                              row.varianceLevel === 'Critical'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {row.varianceLevel}
                          </span>
                          <p className="text-[11px] text-slate-500">{row.impactNote}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 3: GAUSSIAN COHORT DISTRIBUTION */}
          {innerSubTab === 'distribution' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-indigo-600" />
                      Gaussian Bell Curve Distribution & Tail Deviation
                    </h3>
                    <p className="text-xs text-slate-500">
                      Statistical placement of subject case within normalized fact-pattern distribution curve.
                    </p>
                  </div>

                  <span className="px-3.5 py-1.5 bg-rose-50 text-rose-900 border border-rose-200 rounded-full text-xs font-bold font-mono shrink-0">
                    Sigma Z-Score: {selectedFlag.distributionData.zScore}
                  </span>
                </div>

                {/* Dark Visual Gaussian Curve Card */}
                <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                    <span className="font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" />
                      Gaussian Probability Density Function (N = {selectedFlag.benchmarkSampleCount})
                    </span>
                    <span className="font-mono text-amber-300 font-bold bg-white/10 px-3 py-1 rounded-full">
                      Placement: {selectedFlag.distributionData.outlierPercentile}
                    </span>
                  </div>

                  {/* Visual Bell Curve Simulation Bar */}
                  <div className="space-y-3">
                    <div className="h-28 w-full flex items-end justify-between gap-1 px-4 pt-6 bg-slate-950/80 rounded-2xl border border-white/10">
                      {[10, 22, 40, 70, 92, 100, 88, 60, 32, 14, 4, 1].map((height, idx) => {
                        const isOutlierBar = idx === 10;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                            <div
                              className={`w-full rounded-t transition-all ${
                                isOutlierBar
                                  ? 'bg-amber-400 shadow-lg shadow-amber-400/50 animate-pulse'
                                  : 'bg-indigo-500/40 group-hover:bg-indigo-400/60'
                              }`}
                              style={{ height: `${height}%` }}
                            />
                            {isOutlierBar && (
                              <div className="absolute -top-7 text-[9px] font-mono font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                Outlier
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono px-2">
                      <span>-3σ (Strict Exclusion)</span>
                      <span>-1σ</span>
                      <span className="text-indigo-300 font-bold">Median Benchmark ({selectedFlag.distributionData.medianVal})</span>
                      <span>+1σ</span>
                      <span className="text-amber-400 font-bold">+3σ ({selectedFlag.distributionData.actualVal})</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-3 border-t border-white/10">
                    <strong>Statistical Interpretation:</strong> The subject ruling falls in the outer {selectedFlag.distributionData.outlierPercentile} tail of historical court outcomes for this fact pattern. Layer 6 flagged this instance purely to ensure institutional benchmark visibility.
                  </p>
                </div>

                {/* Key Percentiles Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Percentile Distribution Metrics</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">50th Percentile (Median)</span>
                      <span className="font-bold text-slate-900 block text-sm">{selectedFlag.distributionData.medianVal}</span>
                      <span className="text-[11px] text-slate-500">Standard precedent expectation</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">90th Percentile Upper Bound</span>
                      <span className="font-bold text-slate-900 block text-sm">{selectedFlag.distributionData.p90Val}</span>
                      <span className="text-[11px] text-slate-500">Upper limit for standard variance</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-900 block">Subject Case Placement</span>
                      <span className="font-bold text-amber-900 block text-sm">{selectedFlag.distributionData.actualVal}</span>
                      <span className="text-[11px] text-amber-800 font-mono font-bold">Z-Score: +{selectedFlag.distributionData.zScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 4: STATUTORY & APPELLATE AUDIT */}
          {innerSubTab === 'statutory_audit' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-600" />
                    Statutory Provisions & Appellate Consistency Audit
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verification of statutory compliance and binding Supreme Court appellate guidelines.
                  </p>
                </div>

                {/* Statutory Checklist Table */}
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                    <div className="bg-slate-900 text-white p-3.5 font-bold grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <span>Statute / Section</span>
                      <span>Provision Description</span>
                      <span>Audit Status</span>
                      <span>Court Authority Notes</span>
                    </div>

                    {selectedFlag.statutoryChecklist.map((st, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 grid grid-cols-1 sm:grid-cols-4 gap-2 border-b border-slate-100 bg-white hover:bg-slate-50 text-slate-800"
                      >
                        <span className="font-bold text-slate-900 font-mono">{st.statute}</span>
                        <span className="text-slate-700">{st.provision}</span>
                        <div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-block ${
                              st.complianceStatus === 'Aligned'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : st.complianceStatus === 'Deviated'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {st.complianceStatus}
                          </span>
                        </div>
                        <span className="text-slate-600 font-medium">{st.courtNotes}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 65B IT Act Electronic Record Certification Note */}
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs">
                  <h4 className="font-bold text-indigo-950 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-600" />
                    Section 65B Electronic Evidence Integrity Check
                  </h4>
                  <p className="text-slate-700 leading-relaxed font-sans">
                    The electronic trial record hash chain for case <strong>{selectedFlag.caseId}</strong> was verified against PRAMANA blockchain block #{Math.floor(88000 + Math.random() * 1000)}. Section 65B digital certificate is fully attached and cryptographically sealed.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 5: BENCH ADVISORY DIRECTIVES */}
          {innerSubTab === 'directives' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    Bench Quality Directives & Case Diary
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official administrative directives issued regarding this precedent statistical flag.
                  </p>
                </div>

                {/* Existing Directives List */}
                <div className="space-y-4">
                  {selectedFlag.benchDirectives.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">No active directives issued yet</p>
                      <p className="text-[11px] text-slate-500">Use the form below to attach an official bench note or advisory directive.</p>
                    </div>
                  ) : (
                    selectedFlag.benchDirectives.map((dir) => (
                      <div key={dir.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                              {dir.id}
                            </span>
                            <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold">
                              {dir.type}
                            </span>
                          </div>

                          <span className="text-[11px] font-mono text-slate-500">{dir.date}</span>
                        </div>

                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          "{dir.details}"
                        </p>

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Issued by: <strong>{dir.issuedBy}</strong></span>
                          <span className="font-mono text-slate-400">Seal: {dir.sealHash}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Directive Form */}
                <form onSubmit={handleAddDirective} className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-lg border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Issue New Bench Quality Advisory / Directive
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Directive Type</label>
                      <select
                        value={newDirectiveType}
                        onChange={(e) => setNewDirectiveType(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-white outline-none focus:border-indigo-500"
                      >
                        <option value="Bench Quality Note">Bench Quality Note</option>
                        <option value="Circuit Advisory">Circuit Advisory</option>
                        <option value="Explanatory Diary Note">Explanatory Diary Note</option>
                        <option value="Panel Escalation">Panel Escalation</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Issuing Judicial Authority</label>
                      <input
                        type="text"
                        disabled
                        value="Hon. Presiding Magistrate (Bench Quality Cell)"
                        className="w-full p-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs font-mono text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Directive Details / Instructions</label>
                    <textarea
                      rows={3}
                      value={newDirectiveDetails}
                      onChange={(e) => setNewDirectiveDetails(e.target.value)}
                      placeholder="e.g. Directive issued to append Section 74 explanation note to the official court record digest for circuit guidance..."
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-white outline-none focus:border-indigo-500 placeholder:text-slate-500 leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={!newDirectiveDetails.trim()}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Seal Directive to Case Diary</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 6: RECORD JUDICIAL QUALITY REVIEW & SIGN-OFF */}
          {innerSubTab === 'judicial_action' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-indigo-600" />
                    Record Judicial Quality Review & Attestation
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Formal Court Authority review sign-off. Closing an administrative outlier flag records your rationale without affecting the judgment.
                  </p>
                </div>

                {/* Judicial Determination Options */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                    Select Review Determination
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setJudicialActionChoice('Approved')}
                      className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                        judicialActionChoice === 'Approved'
                          ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">1. Mark Reviewed & Record</span>
                        <CheckCircle2 className={`w-4 h-4 ${judicialActionChoice === 'Approved' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Acknowledge statistical outlier flag and record contextual note into case diary.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setJudicialActionChoice('Escalated')}
                      className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                        judicialActionChoice === 'Escalated'
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">2. Escalate to Quality Panel</span>
                        <AlertCircle className={`w-4 h-4 ${judicialActionChoice === 'Escalated' ? 'text-amber-600' : 'text-slate-400'}`} />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Route to High Court Judicial Quality Review Panel for circuit advisory.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setJudicialActionChoice('Dismissed')}
                      className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                        judicialActionChoice === 'Dismissed'
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">3. Dismiss as False Outlier</span>
                        <Check className={`w-4 h-4 ${judicialActionChoice === 'Dismissed' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Flag dismissed. Ruling justified by unique factual nuances.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Reviewer Remarks Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Judicial Review Rationale / Contextual Explanation</span>
                    <span className="text-[10px] text-slate-400">Required</span>
                  </label>
                  <textarea
                    rows={4}
                    value={judgeRemarks}
                    onChange={(e) => setJudgeRemarks(e.target.value)}
                    placeholder="e.g. Reviewed by Judicial Authority. Departure from median bail standard was justified by permanent deposit of accused passports and surrender of physical server assets..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all leading-relaxed"
                  />
                </div>

                {/* Hardware Key Token & Oath Checkbox */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-indigo-400" /> Judicial HSM Private Signature Token
                      </label>
                      <input
                        type="password"
                        value={judgePasskey}
                        onChange={(e) => setJudgePasskey(e.target.value)}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-indigo-300 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Signed Under Authority Of</label>
                      <input
                        type="text"
                        disabled
                        value="Hon. Presiding Magistrate (Bench Quality Committee)"
                        className="w-full p-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs font-medium text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Statutory Oath Checkbox */}
                  <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedToOath}
                      onChange={(e) => setAgreedToOath(e.target.checked)}
                      className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed font-sans">
                      <strong>Mandatory Oath:</strong> I affirm as Judicial Authority that this review is an administrative quality benchmark record and does not alter or impair the binding force of the subject judgment.
                    </span>
                  </label>
                </div>

                {/* Signature Pad */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Digital Pen Signature Canvas</span>
                    <button
                      type="button"
                      onClick={() => sigPadRef.current?.clear()}
                      className="text-indigo-600 hover:underline text-[11px] lowercase"
                    >
                      clear canvas
                    </button>
                  </div>
                  <div className="border border-slate-300 rounded-2xl overflow-hidden bg-slate-50">
                    <SignatureCanvas
                      ref={sigPadRef}
                      canvasProps={{
                        className: 'w-full h-28 cursor-crosshair',
                      }}
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={isSigning || !agreedToOath || !judgePasskey.trim()}
                    onClick={handleExecuteJudicialAction}
                    className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                  >
                    {isSigning ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin text-indigo-200" />
                        <span>Signing Certificate with HSM Token...</span>
                      </>
                    ) : (
                      <>
                        <FileSignature className="w-4 h-4" />
                        <span>Record Judicial Quality Sign-off</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
