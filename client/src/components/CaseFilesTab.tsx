import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import {
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  Plus,
  ArrowLeft,
  Calendar,
  User,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  ExternalLink,
  ChevronRight,
  Sparkles,
  FileCode,
  StickyNote,
  Send,
  Check,
  X,
  BadgeCheck,
  FolderOpen,
  ArrowUpDown,
  Download,
  Scale,
  Cpu,
  Fingerprint,
  ShieldAlert,
  Award,
  RefreshCw,
  Zap,
  Sliders,
  Info,
  MapPin,
  UserCheck,
  Terminal,
  Copy,
  Share2,
  Key,
  Layers,
  Activity,
  FileCheck,
  Edit3,
  Gavel,
  Printer,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

export interface EvidenceItem {
  id: string;
  title: string;
  type: string;
  submittedBy: string;
  timestamp: string;
  pramanaHash: string;
  blockNumber: number;
  integrityStatus: 'Pass' | 'Flagged';
  integrityScore: string;
  details: string;
  expectedHash?: string;
  actualHash?: string;
  anomalyTimeWindow?: string;
  previewImageDataUrl?: string;
}

export interface TestimonyItem {
  id: string;
  zkpHash: string;
  summary: string;
  timestamp: string;
  isUnlocked: boolean;
  unlockedIdentity?: string;
  witnessRole: string;
  verificationNode?: string;
}

export interface CustodyStep {
  id: string;
  title: string;
  actor: string;
  location: string;
  timestamp: string;
  status: string;
  biometricVerified: boolean;
  gpsCoordinates?: string;
}

export interface CaseOrder {
  id: string;
  title: string;
  issuedBy: string;
  timestamp: string;
  summary: string;
  sealHash: string;
  type: 'Evidentiary Direction' | 'Custody Order' | 'Bench Notice' | 'Final Ruling';
}

export interface CaseNote {
  id: string;
  author: string;
  timestamp: string;
  category: 'Judicial Directive' | 'Evidence Note' | 'Precedent Reference' | 'Ruling';
  content: string;
}

export interface PrecedentMatch {
  caseId: string;
  title: string;
  court: string;
  similarityScore: number;
  relevantSections: string[];
  summary: string;
}

export interface CaseRecord {
  id: string;
  title: string;
  caseType: 'Cyber Crime' | 'Financial Fraud' | 'Document Forgery' | 'Public Health' | 'Corporate Theft';
  filingDate: string;
  currentStage: 'Evidence Collection' | 'Judicial Review' | 'Pre-Trial Hearing' | 'Consensus Voting' | 'Final Ruling Sealed';
  status: 'Active' | 'Under Review' | 'Ruled' | 'Sealed';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  mayaBreakStatus: 'Pass' | 'Flagged';
  mayaBreakDetails: string;
  officerInCharge: string;
  courtBench: string;
  prosecutor: string;
  defenseCounsel: string;
  statutorySections: string[];
  evidenceTimeline: EvidenceItem[];
  testimonies: TestimonyItem[];
  custodyHistory: CustodyStep[];
  orders: CaseOrder[];
  notes: CaseNote[];
  precedents: PrecedentMatch[];
}



interface CaseFilesTabProps {
  initialCaseId?: string | null;
  onClearSelectedCase?: () => void;
  role?: string;
}

const getFallbackExhibitImage = (item: EvidenceItem): string => {
  if (item.previewImageDataUrl) return item.previewImageDataUrl;
  const t = (item.title + ' ' + (item.type || '')).toLowerCase();
  if (t.includes('deed') || t.includes('document') || t.includes('tiff') || t.includes('pdf') || t.includes('property') || t.includes('scan')) {
    return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('cctv') || t.includes('video') || t.includes('camera') || t.includes('footage')) {
    return 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('syslog') || t.includes('log') || t.includes('code') || t.includes('server')) {
    return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('drive') || t.includes('usb') || t.includes('memory') || t.includes('hardware')) {
    return 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
};

export function CaseFilesTab({ initialCaseId, onClearSelectedCase, role = 'Court Authority' }: CaseFilesTabProps) {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const res = await api.getRichCases();
      if (res && res.success) {
        setCases(res.cases);
      }
    } catch (e) {
      console.error('Error fetching rich cases:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync dynamically submitted evidence from Field Submitter / localStorage into Backend Store
  React.useEffect(() => {
    const syncLocalStorageEvidence = async () => {
      try {
        const stored = localStorage.getItem('nyayakasha_submitted_evidence');
        if (stored) {
          const customItems = JSON.parse(stored);
          if (Array.isArray(customItems) && customItems.length > 0) {
            for (const ci of customItems) {
              const caseTargetId = ci.caseId || 'CR-2026-904';
              await api.addRichCaseEvidence(caseTargetId, {
                title: ci.title || 'Field Captured Evidence Snapshot',
                type: 'Image Snapshot (JPG)',
                details: ci.anomalySummary || 'Uploaded on Field Submitter page, cryptographically verified & passed forgery scan.',
                submittedBy: ci.submitter || 'Officer R. Kulkarni'
              });
            }
            // Clear once synced to prevent duplicate submissions
            localStorage.removeItem('nyayakasha_submitted_evidence');
          }
        }
      } catch (e) {
        console.error("Error syncing custom evidence to backend", e);
      } finally {
        fetchCases();
      }
    };

    syncLocalStorageEvidence();
  }, []);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(initialCaseId || null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

  // INNER CASE TAB STATE
  const [caseInnerTab, setCaseInnerTab] = useState<'overview' | 'evidence' | 'testimony' | 'custody' | 'orders' | 'precedents'>('overview');

  // MODAL STATES
  const [inspectingExhibit, setInspectingExhibit] = useState<EvidenceItem | null>(null);
  const [isAddEvidenceModalOpen, setIsAddEvidenceModalOpen] = useState(false);
  const [newExhibitTitle, setNewExhibitTitle] = useState('');
  const [newExhibitType, setNewExhibitType] = useState('PDF Document');
  const [newExhibitDetails, setNewExhibitDetails] = useState('');

  const [unlockModalTestimony, setUnlockModalTestimony] = useState<TestimonyItem | null>(null);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');

  const [isDraftOrderModalOpen, setIsDraftOrderModalOpen] = useState(false);
  const [newOrderTitle, setNewOrderTitle] = useState('');
  const [newOrderType, setNewOrderType] = useState<CaseOrder['type']>('Evidentiary Direction');
  const [newOrderSummary, setNewOrderSummary] = useState('');
  const [isSigningOrder, setIsSigningOrder] = useState(false);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState('Zone 4 Forensic Division');
  const [transferReason, setTransferReason] = useState('');

  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<CaseNote['category']>('Judicial Directive');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  // Filter & Sort Cases
  const filteredCases = cases
    .filter((c) => {
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && c.status === 'Active') ||
        (statusFilter === 'Under Review' && c.status === 'Under Review') ||
        (statusFilter === 'Ruled' && c.status === 'Ruled') ||
        (statusFilter === 'Sealed' && c.status === 'Sealed');

      const matchesCategory = categoryFilter === 'All' || c.caseType === categoryFilter;

      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.caseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.officerInCharge.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.courtBench.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.filingDate.localeCompare(a.filingDate);
      if (sortBy === 'oldest') return a.filingDate.localeCompare(b.filingDate);
      if (sortBy === 'priority') {
        const pMap: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
      }
      return 0;
    });

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    setCaseInnerTab('overview');
  };

  const handleBackToList = () => {
    setSelectedCaseId(null);
    if (onClearSelectedCase) onClearSelectedCase();
  };

  const handleAddEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !newExhibitTitle.trim()) return;

    try {
      const res = await api.addRichCaseEvidence(selectedCaseId, {
        title: newExhibitTitle,
        type: newExhibitType,
        details: newExhibitDetails
      });
      if (res && res.success) {
        setCases((prev) =>
          prev.map((c) => (c.id === selectedCaseId ? res.case : c))
        );
        setNewExhibitTitle('');
        setNewExhibitDetails('');
        setIsAddEvidenceModalOpen(false);
        showToast('Exhibit Formally Filed & Anchored to PRAMANA Ledger');
      } else {
        showToast('Failed to file exhibit: ' + (res.error || 'unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error filing exhibit');
    }
  };

  const handleAddNote = async () => {
    if (!selectedCaseId || !newNoteContent.trim()) return;

    try {
      const res = await api.addRichCaseNote(selectedCaseId, {
        content: newNoteContent,
        category: newNoteCategory
      });
      if (res && res.success) {
        setCases((prev) =>
          prev.map((c) => (c.id === selectedCaseId ? res.case : c))
        );
        setNewNoteContent('');
        showToast('Judicial Note Added to Case Record');
      } else {
        showToast('Failed to add note: ' + (res.error || 'unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error adding note');
    }
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !newOrderTitle.trim()) return;

    setIsSigningOrder(true);
    try {
      const res = await api.addRichCaseOrder(selectedCaseId, {
        title: newOrderTitle,
        type: newOrderType,
        summary: newOrderSummary
      });
      if (res && res.success) {
        setCases((prev) =>
          prev.map((c) => (c.id === selectedCaseId ? res.case : c))
        );
        setNewOrderTitle('');
        setNewOrderSummary('');
        setIsDraftOrderModalOpen(false);
        showToast(`Bench Direction Issued & Cryptographically Sealed`);
      } else {
        showToast('Failed to sign order: ' + (res.error || 'unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error signing order');
    } finally {
      setIsSigningOrder(false);
    }
  };

  const handleUnlockIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !unlockModalTestimony || !passkeyInput.trim()) return;

    try {
      const res = await api.unlockRichCaseTestimony(selectedCaseId, unlockModalTestimony.id, passkeyInput);
      if (res && res.success) {
        setCases((prev) =>
          prev.map((c) => (c.id === selectedCaseId ? res.case : c))
        );
        setUnlockModalTestimony(null);
        setPasskeyInput('');
        setPasskeyError('');
        showToast('Witness Identity Unlocked via Judicial Passkey Authentication');
      } else {
        setPasskeyError(res.error || 'Invalid Judicial Passkey. Access Denied.');
      }
    } catch (err: any) {
      console.error(err);
      setPasskeyError('Error unlocking witness identity.');
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !transferReason.trim()) return;

    try {
      const res = await api.authorizeRichCaseCustodyTransfer(selectedCaseId, {
        recipient: transferRecipient,
        reason: transferReason
      });
      if (res && res.success) {
        setCases((prev) =>
          prev.map((c) => (c.id === selectedCaseId ? res.case : c))
        );
        setIsTransferModalOpen(false);
        setTransferReason('');
        showToast(`Custody Transfer Authorized for ${transferRecipient}`);
      } else {
        showToast('Failed to authorize transfer: ' + (res.error || 'unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error authorizing transfer');
    }
  };

  const handleStrikeOrAdmitExhibit = async (decision: 'ADMIT' | 'STRIKE') => {
    if (!selectedCaseId || !inspectingExhibit) return;

    try {
      const res = await api.updateRichCaseEvidenceStatus(selectedCaseId, inspectingExhibit.id, decision);
      if (res && res.success) {
        setCases((prev) =>
          prev.map((c) => (c.id === selectedCaseId ? res.case : c))
        );
        const msg = decision === 'ADMIT' ? 'Exhibit Admitted to Trial Record' : 'Exhibit Struck from Court Record';
        setInspectingExhibit(null);
        showToast(msg);
      } else {
        showToast('Failed to update exhibit status: ' + (res.error || 'unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error updating exhibit status');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto font-sans pb-12"
    >
      {/* GLOBAL TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center justify-between gap-4 border border-white/10 max-w-md"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW 1: CASE REPOSITORY DIRECTORY */}
      {!selectedCaseId ? (
        <div className="space-y-6">
          {/* Repository Header & Summary Metrics */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-900 text-xs font-bold border border-indigo-200 mb-2">
                  <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
                  PRAMANA Digital Repository • High Court Judicial Portal
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Case Files Repository
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Immutable blockchain case records, MAYA-BREAK forensic status, ZKP testimonies, and judicial bench orders.
                </p>
              </div>

              {/* Top Summary Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Cases</span>
                  <span className="text-xl font-bold text-slate-900">{cases.length}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Under Review</span>
                  <span className="text-xl font-bold text-amber-950">
                    {cases.filter((c) => c.status === 'Under Review').length}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Flagged Exhibits</span>
                  <span className="text-xl font-bold text-rose-950">
                    {cases.filter((c) => c.mayaBreakStatus === 'Flagged').length}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Sealed Precedents</span>
                  <span className="text-xl font-bold text-indigo-950">
                    {cases.filter((c) => c.status === 'Sealed').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Bar: Status, Category, Search, Sort */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-slate-100">
              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                {['All', 'Active', 'Under Review', 'Ruled', 'Sealed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      statusFilter === st
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Category Dropdown */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                >
                  <option value="All">All Case Categories</option>
                  <option value="Cyber Crime">Cyber Crime</option>
                  <option value="Financial Fraud">Financial Fraud</option>
                  <option value="Document Forgery">Document Forgery</option>
                  <option value="Public Health">Public Health</option>
                  <option value="Corporate Theft">Corporate Theft</option>
                </select>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="priority">Sort: Highest Priority</option>
                </select>

                {/* Search Bar */}
                <div className="w-full sm:w-64 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search ID, title, officer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-indigo-500 placeholder:text-slate-400"
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
            </div>

            {/* Case Repository Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-50">
                    <th className="py-3.5 px-4 rounded-l-2xl">Case ID & Priority</th>
                    <th className="py-3.5 px-4">Title & Court Bench</th>
                    <th className="py-3.5 px-4">Type & Stage</th>
                    <th className="py-3.5 px-4">Filing Date</th>
                    <th className="py-3.5 px-4">MAYA-BREAK Integrity</th>
                    <th className="py-3.5 px-4 text-right rounded-r-2xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCases.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => handleSelectCase(c.id)}
                      className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm block">{c.id}</span>
                          <span
                            className={`px-2 py-0.5 text-[9px] font-extrabold rounded ${
                              c.priority === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : c.priority === 'HIGH'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {c.priority}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-sans">{c.officerInCharge}</span>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                          {c.title}
                        </p>
                        <p className="text-[11px] text-slate-500">{c.courtBench}</p>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-800 block">{c.caseType}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px] inline-block mt-0.5">
                          {c.currentStage}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-600">
                        {c.filingDate}
                      </td>

                      <td className="py-4 px-4">
                        {c.mayaBreakStatus === 'Pass' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>100% Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Flagged Anomaly</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCase(c.id);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Open Record</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCases.length === 0 && (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <FolderOpen className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-900">No matching case records found</p>
                  <p className="text-xs text-slate-500">
                    Try adjusting your status filter, category, or search keywords.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : selectedCase ? (
        /* VIEW 2: DEEP DETAILED CASE RECORD VIEW */
        <div className="space-y-6">
          {/* Top Breadcrumb & Control Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Return to Case Repository</span>
              </button>
              <div className="h-4 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                  {selectedCase.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded border ${
                    selectedCase.status === 'Under Review'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : selectedCase.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {selectedCase.status}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {role === 'Court Authority' && (
                <button
                  onClick={() => setIsDraftOrderModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Gavel className="w-4 h-4 text-amber-400" />
                  <span>Issue Bench Order</span>
                </button>
              )}

              {role !== 'Independent Validator' && (
                <button
                  onClick={() => setIsAddEvidenceModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Formally File Exhibit</span>
                </button>
              )}
            </div>
          </div>

          {/* Hero Case Details Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-indigo-300 text-xs font-bold border border-white/15">
                    {selectedCase.caseType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-slate-300 text-xs font-bold border border-white/15">
                    Stage: {selectedCase.currentStage}
                  </span>
                  {selectedCase.mayaBreakStatus === 'Pass' ? (
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      MAYA-BREAK Verified
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-400/30 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      Exhibit Flagged Anomaly
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {selectedCase.title}
                </h1>

                <p className="text-xs text-slate-300 font-medium">
                  {selectedCase.courtBench} • Presiding Officer: {selectedCase.officerInCharge}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {role === 'Court Authority' && (
                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 border border-white/15"
                  >
                    <Fingerprint className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Transfer Custody</span>
                  </button>
                )}

                <button
                  onClick={() => showToast('Certified Copy Generated with QR Seal')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 border border-white/15"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Certified PDF</span>
                </button>
              </div>
            </div>

            {/* Statutory Sections Tag Bar */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Statutory Charges:</span>
              {selectedCase.statutorySections.map((sec, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200 font-mono text-[11px] border border-indigo-400/30">
                  {sec}
                </span>
              ))}
            </div>
          </div>

          {/* INNER DETAILED SUB-TABS NAVIGATION */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {[
              { id: 'overview', label: '1. Executive Summary', icon: Cpu },
              { id: 'evidence', label: `2. Evidence & MAYA-BREAK (${selectedCase.evidenceTimeline.length})`, icon: FileText },
              { id: 'testimony', label: `3. Witness Testimonies & ZKP (${selectedCase.testimonies.length})`, icon: Lock },
              { id: 'custody', label: `4. Chain of Custody (${selectedCase.custodyHistory.length})`, icon: Fingerprint },
              { id: 'orders', label: `5. Bench Orders & Notes (${selectedCase.orders.length})`, icon: Scale },
              { id: 'precedents', label: `6. Legal Twin Matches (${selectedCase.precedents.length})`, icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCaseInnerTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  caseInnerTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* SUB-TAB 1: EXECUTIVE SUMMARY */}
          {caseInnerTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
            >
              {/* Left Column: Flow & Details */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                {/* 1. Procedural Flow */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" /> Procedural Stage Milestones
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-between max-w-2xl text-xs font-bold text-slate-400">
                    {['FIR Filed', 'Evidence Anchored', 'MAYA-BREAK Audit', 'Judicial Review', 'Final Ruling'].map((step, idx) => {
                      const isActive =
                        (selectedCase.currentStage === 'Evidence Collection' && idx <= 1) ||
                        (selectedCase.currentStage === 'Pre-Trial Hearing' && idx <= 2) ||
                        (selectedCase.currentStage === 'Judicial Review' && idx <= 3) ||
                        (selectedCase.currentStage === 'Consensus Voting' && idx <= 3) ||
                        (selectedCase.currentStage === 'Final Ruling Sealed' && idx <= 4);

                      const isCurrent =
                        (selectedCase.currentStage === 'Evidence Collection' && idx === 1) ||
                        (selectedCase.currentStage === 'Pre-Trial Hearing' && idx === 2) ||
                        (selectedCase.currentStage === 'Judicial Review' && idx === 3) ||
                        (selectedCase.currentStage === 'Consensus Voting' && idx === 3) ||
                        (selectedCase.currentStage === 'Final Ruling Sealed' && idx === 4);

                      return (
                        <div
                          key={step}
                          className={`flex-1 text-center py-4 px-2 rounded-xl transition-colors border ${
                            isCurrent
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : isActive
                              ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100'
                              : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <span className="block mb-1 text-[10px] opacity-70">
                            {idx + 1}.
                          </span>
                          {step}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Stakeholders */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider px-2">
                    Case Stakeholders & Counsel
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">State Prosecutor</p>
                      <p className="text-sm font-bold text-slate-900">{selectedCase.prosecutor}</p>
                      <p className="text-xs text-slate-500">Special Cyber Cell Division</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Defense Counsel</p>
                      <p className="text-sm font-bold text-slate-900">{selectedCase.defenseCounsel}</p>
                      <p className="text-xs text-slate-500">High Court Bar Association</p>
                    </div>
                  </div>
                </div>

                {/* 3. Block Audit */}
                <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between text-indigo-900">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      <h3 className="text-sm font-bold">PRAMANA Cryptographic Ledger Guarantee</h3>
                    </div>
                    <span className="text-xs font-bold font-mono">Block Range #89201 - #89240</span>
                  </div>
                  <p className="text-xs text-indigo-800 leading-relaxed max-w-2xl">
                    All exhibits and witness testimonies associated with <strong className="font-mono text-[11px]">{selectedCase.id}</strong> are anchored across 3 independent court validator nodes using SHA-256 Merkle proofs.
                  </p>
                </div>
              </div>

              {/* Right Column: Court Actions */}
              <div className="col-span-1 space-y-6">
                {role === 'Court Authority' && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Zap className="w-4 h-4 text-indigo-600" /> Presiding Bench Controls
                    </h3>

                    <div className="space-y-2.5">
                      <button
                        onClick={() => setIsDraftOrderModalOpen(true)}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-between"
                      >
                        <span>Draft Custom Bench Order</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setIsAddEvidenceModalOpen(true)}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-between"
                      >
                        <span>Formally Admit New Exhibit</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => showToast('Hearing Scheduled for Tomorrow, 10:30 AM')}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-all flex items-center justify-between border border-slate-200"
                      >
                        <span>Schedule Bench Hearing</span>
                        <Calendar className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SUB-TAB 2: EVIDENCE TIMELINE & MAYA-BREAK */}
          {caseInnerTab === 'evidence' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" /> Evidence Timeline & MAYA-BREAK Forensic Status
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Inspect individual exhibit hashes, neural forgery scores, and PRAMANA block anchors.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddEvidenceModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>File New Exhibit</span>
                </button>
              </div>

              <div className="space-y-4">
                {selectedCase.evidenceTimeline.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                            {item.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            • {item.type}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {item.title}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-medium text-slate-400 block">
                          {item.timestamp}
                        </span>
                        <span className="text-[11px] text-slate-600 font-medium">
                          Submitted by: {item.submittedBy}
                        </span>
                      </div>
                    </div>

                    {/* PRAMANA Block Anchor Box */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs font-mono">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                          <BadgeCheck className="w-4 h-4 text-indigo-600" />
                          <span>PRAMANA Anchor Block #{item.blockNumber}</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">
                          Ledger Hash: <strong className="text-slate-900">{item.pramanaHash}</strong>
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 font-sans text-xs">
                        <span className="text-slate-600">MAYA-BREAK Forensic Score:</span>
                        <span
                          className={`font-bold ${
                            item.integrityStatus === 'Pass'
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {item.integrityScore}
                        </span>
                      </div>
                    </div>

                    {/* Evidence Image Preview Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-amber-400" />
                          Official Evidence Image (Stage 4 • Judicial Record)
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">PRAMANA Verified</span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-slate-700 bg-black/70 p-2 flex justify-center">
                        <img
                          src={getFallbackExhibitImage(item)}
                          alt={item.title}
                          className="max-h-64 w-auto object-contain rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <p className="text-xs text-slate-600 italic">
                        "{item.details}"
                      </p>

                      <button
                        onClick={() => setInspectingExhibit(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Deep Forensic Inspector</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SUB-TAB 3: WITNESS TESTIMONIES & ZKP */}
          {caseInnerTab === 'testimony' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" /> Linked Witness Testimonies (ZKP Proof Vault)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Zero-Knowledge Proofs guarantee witness statements without exposing identity unless legally unlocked by judicial MFA.
                </p>
              </div>

              <div className="space-y-4">
                {selectedCase.testimonies.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-xs font-mono font-bold border border-indigo-200">
                          {t.id}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          Proof Hash: {t.zkpHash}
                        </span>
                      </div>

                      {t.isUnlocked ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1">
                          <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                          Identity Legally Unlocked
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-slate-600" />
                          Anonymized ZKP
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      "{t.summary}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      {t.isUnlocked ? (
                        <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                          <User className="w-4 h-4 text-emerald-700" />
                          <span>{t.unlockedIdentity} ({t.witnessRole})</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">
                          Witness Identity Protected under Judicial Privacy Act
                        </span>
                      )}

                      {!t.isUnlocked && (
                        <button
                          onClick={() => setUnlockModalTestimony(t)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs transition-colors flex items-center gap-1.5 border border-indigo-200 shadow-xs"
                        >
                          <Unlock className="w-3.5 h-3.5 text-indigo-700" />
                          <span>Unlock Identity with Passkey</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {selectedCase.testimonies.length === 0 && (
                  <p className="text-xs text-slate-400 italic p-6 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    No linked testimony ZKP proofs recorded for this case record.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* SUB-TAB 4: CHAIN OF CUSTODY */}
          {caseInnerTab === 'custody' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-indigo-600" /> Chain of Custody History & Vault Audits
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verifiable sequential tracking of physical and digital evidence custody transfers.
                  </p>
                </div>

                {role === 'Court Authority' && (
                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Fingerprint className="w-4 h-4 text-amber-400" />
                    <span>Authorize Custody Transfer</span>
                  </button>
                )}
              </div>

              <div className="relative pl-6 space-y-6 border-l-2 border-indigo-200 ml-3">
                {selectedCase.custodyHistory.map((step) => (
                  <div key={step.id} className="relative space-y-1">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                      <span className="text-[11px] font-mono text-slate-400">{step.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Actor: {step.actor} • Location: {step.location}</p>
                    {step.gpsCoordinates && (
                      <p className="text-[10px] text-indigo-600 font-mono">GPS: {step.gpsCoordinates}</p>
                    )}
                    <span className="inline-block px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold font-mono">
                      {step.status}
                    </span>
                  </div>
                ))}

                {selectedCase.custodyHistory.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-4">No custody transfers recorded yet.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* SUB-TAB 5: BENCH ORDERS & NOTES */}
          {caseInnerTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left 2 Cols: Issued Orders List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-indigo-600" /> Formally Issued Bench Orders
                    </h3>
                    {role === 'Court Authority' && (
                      <button
                        onClick={() => setIsDraftOrderModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Issue Order</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedCase.orders.map((ord) => (
                      <div key={ord.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-mono text-xs font-bold border border-indigo-200">
                            {ord.id}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{ord.timestamp}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{ord.title}</h4>
                        <p className="text-xs text-slate-700 leading-relaxed">{ord.summary}</p>
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-indigo-900">
                          <span>Issued by: {ord.issuedBy}</span>
                          <span>Digital Seal: {ord.sealHash}</span>
                        </div>
                      </div>
                    ))}

                    {selectedCase.orders.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 rounded-2xl border border-slate-200">
                        No bench directions issued yet for this case.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right 1 Col: Case Notes Thread */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <StickyNote className="w-4 h-4 text-indigo-600" /> Judicial Case Notes Thread
                  </h3>

                  {/* Add Note Form */}
                  <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <select
                      value={newNoteCategory}
                      onChange={(e) => setNewNoteCategory(e.target.value as CaseNote['category'])}
                      className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="Judicial Directive">Judicial Directive</option>
                      <option value="Evidence Note">Evidence Note</option>
                      <option value="Precedent Reference">Precedent Reference</option>
                      <option value="Ruling">Ruling</option>
                    </select>

                    <textarea
                      rows={3}
                      placeholder="Type judicial observation or note..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 font-medium"
                    />

                    <button
                      onClick={handleAddNote}
                      disabled={!newNoteContent.trim()}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Attach Note</span>
                    </button>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                    {selectedCase.notes.map((n) => (
                      <div key={n.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded text-[10px]">
                            {n.category}
                          </span>
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-800">{n.content}</p>
                        <p className="text-[10px] text-slate-500 italic text-right">— {n.author}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUB-TAB 6: PRECEDENTS */}
          {caseInnerTab === 'precedents' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" /> Layer 6 Precedent-Twin Legal Matches
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated legal vector analysis identifying Supreme Court and High Court precedents with similar evidentiary structures.
                </p>
              </div>

              <div className="space-y-4">
                {selectedCase.precedents.map((p, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200 px-2.5 py-0.5 rounded-md">
                          {p.caseId}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{p.title}</h4>
                        <p className="text-xs text-slate-500">{p.court}</p>
                      </div>

                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200">
                          {p.similarityScore}% Vector Match
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{p.summary}</p>

                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-bold text-[10px] uppercase">Matched Sections:</span>
                        {p.relevantSections.map((sec, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-200 font-mono text-[11px] text-slate-800">
                            {sec}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => showToast(`Precedent ${p.caseId} cited into order draft`)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cite Precedent</span>
                      </button>
                    </div>
                  </div>
                ))}

                {selectedCase.precedents.length === 0 && (
                  <p className="text-xs text-slate-400 italic p-6 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    No precedent twin matches identified yet for this case profile.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      ) : null}

      {/* MODAL 1: DEEP FORENSIC EXHIBIT INSPECTOR */}
      <AnimatePresence>
        {inspectingExhibit && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-900 font-mono text-xs font-bold">
                    {inspectingExhibit.id}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {inspectingExhibit.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Deep MAYA-BREAK Layer 2 Neural Forensic Inspector
                  </p>
                </div>
                <button
                  onClick={() => setInspectingExhibit(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Spectral & Anomaly Breakdown Box */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-300 border-b border-white/10 pb-2">
                  <span>SHA-256 Vector Consistency Analysis</span>
                  <span className={inspectingExhibit.integrityStatus === 'Pass' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {inspectingExhibit.integrityScore}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-slate-400">// Expected Baseline SHA-256 Hash</p>
                  <p className="text-emerald-300 break-all">{inspectingExhibit.expectedHash || '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f'}</p>
                </div>

                <div className="space-y-1 pt-1">
                  <p className="text-slate-400">// Actual Ledger SHA-256 Hash</p>
                  <p className={inspectingExhibit.integrityStatus === 'Pass' ? 'text-emerald-300 break-all' : 'text-rose-400 break-all'}>
                    {inspectingExhibit.actualHash || inspectingExhibit.expectedHash || '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f'}
                  </p>
                </div>

                {inspectingExhibit.anomalyTimeWindow && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-sans space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Frame Insertion Anomaly Detected:
                    </p>
                    <p className="font-mono text-[11px]">{inspectingExhibit.anomalyTimeWindow}</p>
                  </div>
                )}
              </div>

              {/* Image Preview Box inside Deep Forensic Inspector */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    <Eye className="w-4 h-4" /> Captured Photo Evidence Exhibit
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">PRAMANA Sealed</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-black/80 p-2 flex justify-center">
                  <img
                    src={getFallbackExhibitImage(inspectingExhibit)}
                    alt={inspectingExhibit.title}
                    className="max-h-72 w-auto object-contain rounded-lg"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">Submission Audit Data</span>
                <p className="text-slate-800">Submitted by: <strong>{inspectingExhibit.submittedBy}</strong> on {inspectingExhibit.timestamp}</p>
                <p className="text-slate-600 italic">"{inspectingExhibit.details}"</p>
              </div>

              {/* Judicial Decision Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  onClick={() => handleStrikeOrAdmitExhibit('STRIKE')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <X className="w-4 h-4" />
                  <span>Strike Exhibit from Trial Record</span>
                </button>

                <button
                  onClick={() => handleStrikeOrAdmitExhibit('ADMIT')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Admit Exhibit to Record</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: FORMALLY FILE EXHIBIT */}
      <AnimatePresence>
        {isAddEvidenceModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Formally File Evidence Exhibit
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Admit verified exhibit into PRAMANA blockchain ledger for {selectedCaseId}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddEvidenceModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddEvidenceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Exhibit Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CFSL Hard Drive Forensic Hash Dump #2"
                    value={newExhibitTitle}
                    onChange={(e) => setNewExhibitTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Exhibit Type
                    </label>
                    <select
                      value={newExhibitType}
                      onChange={(e) => setNewExhibitType(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                    >
                      <option value="PDF Document">PDF Document</option>
                      <option value="Video MP4">Video MP4</option>
                      <option value="Audio WAV">Audio WAV</option>
                      <option value="Syslog Text">Syslog Text</option>
                      <option value="Forensic Memory Dump">Forensic Memory Dump</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      MAYA-BREAK Pre-Audit
                    </label>
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Pass</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admissions Note / Chain of Custody Ref
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide context regarding forensic verification..."
                    value={newExhibitDetails}
                    onChange={(e) => setNewExhibitDetails(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddEvidenceModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm & Anchor Exhibit</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: UNLOCK WITNESS IDENTITY */}
      <AnimatePresence>
        {unlockModalTestimony && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-6"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-indigo-600" />
                    Unlock Witness Identity
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter Judicial MFA Passkey to reveal anonymized ZKP proof identity
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUnlockModalTestimony(null);
                    setPasskeyError('');
                  }}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUnlockIdentitySubmit} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-1">
                  <p className="font-bold">Testimony Reference:</p>
                  <p className="font-mono text-[11px]">{unlockModalTestimony.id}</p>
                  <p className="text-[11px] font-medium">"{unlockModalTestimony.summary}"</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judicial Passkey (Demo: <code className="text-indigo-700">JUDGE-2026</code>)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter passkey..."
                    value={passkeyInput}
                    onChange={(e) => {
                      setPasskeyInput(e.target.value);
                      setPasskeyError('');
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-indigo-500"
                  />
                  {passkeyError && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1">
                      {passkeyError}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUnlockModalTestimony(null);
                      setPasskeyError('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Authenticate & Unlock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: DRAFT BENCH ORDER */}
      <AnimatePresence>
        {isDraftOrderModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-indigo-600" /> Issue Official Judicial Order
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Draft directions for Case <strong className="text-slate-900">{selectedCaseId}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setIsDraftOrderModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Order Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Order Admitting CCTV Exhibit #4 to Trial Record"
                    value={newOrderTitle}
                    onChange={(e) => setNewOrderTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Order Type
                  </label>
                  <select
                    value={newOrderType}
                    onChange={(e) => setNewOrderType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                  >
                    <option value="Evidentiary Direction">Evidentiary Direction</option>
                    <option value="Custody Order">Custody Order</option>
                    <option value="Bench Notice">Bench Notice</option>
                    <option value="Final Ruling">Final Ruling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Formal Directions & Summary
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. UPON HEARING Advocates for the State and inspecting the Layer 2 Forensic Report, IT IS HEREBY ORDERED that..."
                    value={newOrderSummary}
                    onChange={(e) => setNewOrderSummary(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-indigo-600" /> Hardware PKI Signature Token Active
                  </p>
                  <p className="text-[11px] text-indigo-900/80">
                    Submitting applies YubiKey / PKI signature stamp and publishes hash seal to High Court registry.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDraftOrderModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSigningOrder}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    {isSigningOrder ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Applying PKI Seal...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-amber-400" />
                        <span>Sign & Issue Court Order</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: AUTHORIZE CUSTODY TRANSFER */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-indigo-600" /> Authorize Sealed Custody Transfer
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorize physical/digital evidence transfer across precincts or lab facilities
                  </p>
                </div>
                <button
                  onClick={() => setIsTransferModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Receiving Unit / Vault Facility
                  </label>
                  <select
                    value={transferRecipient}
                    onChange={(e) => setTransferRecipient(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                  >
                    <option value="Zone 4 Cyber Forensics Division">Zone 4 Cyber Forensics Division</option>
                    <option value="Central Forensic Science Laboratory (CFSL)">Central Forensic Science Laboratory (CFSL)</option>
                    <option value="High Court Evidence Vault 3">High Court Evidence Vault 3</option>
                    <option value="Special Investigation Team (SIT) Vault">Special Investigation Team (SIT) Vault</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transfer Justification & Order Reference
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide justification for physical/digital movement..."
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsTransferModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Authorize Sealed Dispatch</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
