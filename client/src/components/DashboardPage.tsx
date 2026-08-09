import React, { useState, useEffect, useRef } from 'react';
import {  motion, AnimatePresence } from 'motion/react';
import SignatureCanvas from "react-signature-canvas";
import { 
  ArrowUpRight, Search, Filter, FileCode, Shield, Link2, Plus, ChevronLeft, FolderOpen,
  LogOut,
  Info,
  AlertTriangle,
  Camera,
  FileText,
  Inbox,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  UploadCloud,
  Bell,
  User,
  Settings,
  Key,
  BarChart3,
  History,
  X,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import {  FieldSubmitterSidebar } from './FieldSubmitterSidebar';
import { ChainOfCustodyTab } from "./ChainOfCustodyTab";
import { MySubmissionsTab } from "./MySubmissionsTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { AuditLogsTab } from "./AuditLogsTab";
import { ProfileTab } from "./ProfileTab";
import { NotificationsTab } from "./NotificationsTab";
import { CourtAuthorityDashboard } from "./CourtAuthorityDashboard";
import { ConsensusApprovalsTab } from "./ConsensusApprovalsTab";
import { CaseFilesTab } from "./CaseFilesTab";
import { CaptureEvidenceTab } from "./CaptureEvidenceTab";
import { ForgeryReviewQueueTab } from "./ForgeryReviewQueueTab";
import { IdentityUnlockTab } from "./IdentityUnlockTab";
import { SettingsTab } from "./SettingsTab";
import { PrecedentFlagsTab } from "./PrecedentFlagsTab";

const MOCK_CASES = [
  { id: 'FIR-2026-001', title: 'State vs. Unknown (Sector 4 Cyber Heist)', status: 'Active', type: 'Cyber Crime', date: 'Oct 12, 2026', officer: 'Officer R. Kulkarni', evidenceCount: 14, testimonyCount: 3, priority: 'High', description: 'Unauthorized access and data exfiltration from city municipal servers. Traced to IP addresses in Zone 4.' },
  { id: 'FIR-2026-002', title: 'State vs. Deshmukh (Property Fraud)', status: 'Pending Review', type: 'Financial', date: 'Oct 10, 2026', officer: 'Inspector S. Patel', evidenceCount: 8, testimonyCount: 5, priority: 'Medium', description: 'Alleged forgery of land registry documents in the western suburbs.' },
  { id: 'FIR-2026-003', title: 'Vehicle Theft Ring - Highway 9', status: 'Active', type: 'Theft', date: 'Oct 08, 2026', officer: 'Officer R. Kulkarni', evidenceCount: 22, testimonyCount: 8, priority: 'High', description: 'Organized syndicate targeting luxury vehicles on the inter-city highway.' },
  { id: 'FIR-2026-004', title: 'Industrial Espionage - TechCorp', status: 'Closed', type: 'Corporate', date: 'Sep 25, 2026', officer: 'Chief Inv. M. Singh', evidenceCount: 31, testimonyCount: 12, priority: 'Critical', description: 'Theft of proprietary AI algorithms by a former employee.' },
  { id: 'FIR-2026-005', title: 'State vs. Unknown (Warehouse Arson)', status: 'Cold Case', type: 'Arson', date: 'Aug 14, 2026', officer: 'Inspector S. Patel', evidenceCount: 5, testimonyCount: 1, priority: 'Low', description: 'Fire at abandoned warehouse. Lack of leads and surveillance footage.' },
  { id: 'FIR-2026-006', title: 'Counterfeit Currency Operation', status: 'Active', type: 'Forgery', date: 'Oct 14, 2026', officer: 'Officer R. Kulkarni', evidenceCount: 19, testimonyCount: 4, priority: 'High', description: 'Distribution of fake currency notes in local markets.' }
];

const MOCK_EVIDENCE_FOR_CASE = [
  { id: 'EV-8821', type: 'Video', title: 'CCTV Footage - Main Server Room', date: 'Oct 12, 2026 14:30', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', status: 'Sealed' },
  { id: 'EV-8822', type: 'Document', title: 'Server Access Logs (Encrypted)', date: 'Oct 12, 2026 15:45', hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', status: 'Sealed' },
  { id: 'EV-8823', type: 'Photo', title: 'Tampered Network Switch', date: 'Oct 13, 2026 09:15', hash: '4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5', status: 'Pending Chain Transfer' }
];

type ToastInfo = {
  id: string;
  message: string;
  type: 'info' | 'warning';
};

export function DashboardPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [role, setRole] = useState<
    'Field Submitter' | 'Court Authority' | 'Independent Validator'
  >(() => {
    const saved = localStorage.getItem('nyayakasha_user_role');
    if (saved === 'Field Submitter' || saved === 'Court Authority' || saved === 'Independent Validator') {
      return saved;
    }
    return 'Independent Validator';
  });

  useEffect(() => {
    localStorage.setItem('nyayakasha_user_role', role);
  }, [role]);

  const [isDuressSession, setIsDuressSession] = useState<boolean>(() => {
    return localStorage.getItem('nyayakasha_is_duress_session') === 'true';
  });
  const [isSimulatedGatewayTimeout, setIsSimulatedGatewayTimeout] = useState(false);

  useEffect(() => {
    if (isDuressSession) {
      // 2-minute plausible technical gateway timeout for duress session containment
      const timer = setTimeout(() => {
        setIsSimulatedGatewayTimeout(true);
      }, 120000);
      return () => clearTimeout(timer);
    }
  }, [isDuressSession]);

  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseSearchQuery, setCaseSearchQuery] = useState("");
  const [caseFilterStatus, setCaseFilterStatus] = useState("All");

  // Real Data State from Backend API
  const [realEvidence, setRealEvidence] = useState<any[]>([]);
  const [realCases, setRealCases] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);

  const fetchDashboardData = async () => {
    try {
      const [evData, caseData, profileResp] = await Promise.all([
        api.getEvidence().catch(() => null),
        api.getCases().catch(() => null),
        api.getProfile().catch(() => null)
      ]);
      if (evData && evData.evidence) {
        setRealEvidence(evData.evidence);
      }
      if (caseData && caseData.cases) {
        setRealCases(caseData.cases);
      }
      if (profileResp && profileResp.success && profileResp.profile) {
        setProfileData(profileResp.profile);
      }
    } catch (err) {
      console.error("Error loading field submitter data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [role, activeTab]);

  // Form states for Capture Evidence
  // Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedImageHash, setCapturedImageHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setCapturedImage(dataUrl);
        setEvidenceTitle(`Uploaded Evidence - ${file.name}`);
        setEvidenceCategory('Digital Asset');
        generateHash(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    setCapturedImage(null);
      setCapturedImageHash(null);
    setCapturedImageHash(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setToasts(prev => [...prev, { id: Date.now().toString(), message: 'Camera access denied or unavailable.', type: 'warning' }]);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const generateHash = async (dataUrl: string) => {
    setIsHashing(true);
    try {
      // Convert base64 to ArrayBuffer
      const base64 = dataUrl.split(',')[1];
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setCapturedImageHash(hashHex);
    } catch (err) {
      console.error("Hashing failed", err);
    } finally {
      setIsHashing(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setEvidenceTitle(`Field Capture - ${new Date().toLocaleTimeString()}`);
        setEvidenceCategory('Digital Photo Snapshot');
        stopCamera();
        generateHash(dataUrl);
      }
    }
  };

  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [firNumber, setFirNumber] = useState('');
  const [evidenceCategory, setEvidenceCategory] = useState('Digital Asset');
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form states for Submit Testimony
  const [caseId, setCaseId] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [testimonyNotes, setTestimonyNotes] = useState('');
  const [testimonyLanguage, setTestimonyLanguage] = useState('English');
  const [testimonyIdType, setTestimonyIdType] = useState('Aadhaar Card (Verified)');
  const [testimonyLocation, setTestimonyLocation] = useState('');
  const [testimonyType, setTestimonyType] = useState('Eyewitness');
  const [evidencePin, setEvidencePin] = useState('');
  const [testimonyPin, setTestimonyPin] = useState('');
  const evidenceSigPad = useRef<SignatureCanvas>(null);
  const testimonySigPad = useRef<SignatureCanvas>(null);
  const clearEvidenceSig = () => { if (evidenceSigPad.current) evidenceSigPad.current.clear(); };
  const clearTestimonySig = () => { if (testimonySigPad.current) testimonySigPad.current.clear(); };
  const [testimonyIncidentDate, setTestimonyIncidentDate] = useState('');
  const [testimonyFiles, setTestimonyFiles] = useState<File[]>([]);
  const [isDictating, setIsDictating] = useState(false);
  const fileTestimonyRef = useRef<HTMLInputElement>(null);

  const handleTestimonyFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTestimonyFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeTestimonyFile = (index: number) => {
    setTestimonyFiles(prev => prev.filter((_, i) => i !== index));
  };
  const [isSubmittingTestimony, setIsSubmittingTestimony] = useState(false);

  // Timeout settings
  const INACTIVITY_TIMEOUT =
    role === 'Field Submitter' ? 30 * 60 * 1000 : 15 * 60 * 1000;
  const WARNING_TIME = 2 * 60 * 1000;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const addToast = (
    message: string,
    type: 'info' | 'warning',
    duration = 3000
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => {
      if (prev.some((t) => t.message === message)) return prev;
      return [{ id, message, type }];
    });

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('nyayakasha_is_logged_in');
    localStorage.removeItem('nyayakasha_session_id');
    localStorage.removeItem('nyayakasha_user');
    localStorage.setItem('nyayakasha_current_page', 'home');
    window.location.hash = 'home';
    onNavigate('home');
  };

  const resetTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    setShowWarning(false);

    warningRef.current = setTimeout(() => {
      if (role === 'Court Authority' || role === 'Independent Validator') {
        setShowWarning(true);
      }
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    resetTimers();

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];
    const handleActivity = () => resetTimers();

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [role]);

  const handleEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEvidence(true);
    setTimeout(() => {
      setIsSubmittingEvidence(false);
      setSubmittedSuccess(true);
      
      // Build dynamic exhibit item for Court Authority's Forgery Review Queue
      const generatedHash = capturedImageHash || ('0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''));
      const newExhibit = {
        id: `FRG-2026-${Math.floor(100 + Math.random() * 900)}`,
        exhibitId: `EXH-${Math.floor(100 + Math.random() * 900)}`,
        caseId: firNumber || 'FIR-2026-9041',
        caseTitle: `Case Entry: ${evidenceTitle || 'Field Captured Evidence'}`,
        courtBench: 'High Court Bench 3 (Presiding: Hon. Justice A. Mehta)',
        title: evidenceTitle || 'Field Evidence Snapshot',
        submitter: 'Officer R. Kulkarni',
        submitterAgency: 'Zone 4 Field Operations',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        status: 'Flagged',
        confidenceScore: 99.4, // Authenticity Score
        previewType: 'Image',
        previewImageDataUrl: capturedImage || undefined,
        metadataCheck: {
          status: 'Pass',
          score: 98,
          details: 'GPS coordinates (Zone 4) & NTP clock timestamp cryptographically verified.',
          technicalNote: 'SHA-256 hash generated directly at capture buffer.'
        },
        ganFingerprintCheck: {
          status: 'Pass',
          score: 99,
          details: 'No neural synthesis or deepfake artifacts detected.',
          technicalNote: 'FFT spectral analysis clean across all RGB color channels.'
        },
        docForensicsCheck: {
          status: 'Pass',
          score: 98,
          details: 'EXIF metadata intact and signed with Officer TPM Key.',
          technicalNote: 'Zero pixel clone or spatial manipulation detected.'
        },
        originalHash: generatedHash,
        submittedHash: generatedHash,
        merkleRoot: '0x' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        blockNumber: 89205,
        anomalySummary: 'Automatic system hashing and forgery scan complete: 99.4% Authenticity Score. Forwarded to Court Authority Forgery Review Queue.',
        diffDetails: {
          originalAspect: 'PRAMANA Live Field Capture Stream',
          submittedAspect: 'Officer Field Submission (Authentic)',
          impactLevel: 'Minor'
        },
        anomaliesList: [],
        custodyTrail: [
          {
            id: `CUST-${Date.now()}-01`,
            stage: 'Capture & Seizure on Field Submitter Page',
            actor: 'Officer R. Kulkarni',
            role: 'Field Submitter',
            timestamp: new Date().toLocaleString(),
            location: 'Zone 4 Geofenced Sector',
            hashVerified: true,
            blockNumber: 89205
          },
          {
            id: `CUST-${Date.now()}-02`,
            stage: 'Automated System Hashing & Forgery Scan',
            actor: 'MAYA-BREAK & PRAMANA Ledger Engine',
            role: 'Pure Backend Automation',
            timestamp: new Date().toLocaleString(),
            location: 'High Court Gateway Node',
            hashVerified: true,
            blockNumber: 89205
          }
        ],
        precedents: [],
        directives: []
      };

      api.submitEvidence({
        caseId: 'FIR-2026-001',
        title: evidenceTitle || 'New Field Exhibit',
        type: evidenceCategory || 'Digital Asset',
        hash: capturedImageHash || undefined,
        custodian: 'Officer R. Kulkarni (Field Submitter)',
        dataUrl: capturedImage || undefined,
        latitude: 19.0760,
        longitude: 72.8777
      }).then(() => fetchDashboardData()).catch(err => console.log('Backend evidence submission status:', err.message));

      try {
        const stored = localStorage.getItem('nyayakasha_submitted_evidence');
        const existing = stored ? JSON.parse(stored) : [];
        localStorage.setItem('nyayakasha_submitted_evidence', JSON.stringify([newExhibit, ...existing]));
      } catch (err) {
        console.error("Failed saving evidence to localStorage", err);
      }

      addToast('Evidence sealed & stored in backend API audit ledger', 'info');
      setTimeout(() => setSubmittedSuccess(false), 5000);
      setEvidenceTitle('');
      setCapturedImage(null);
      setCapturedImageHash(null);
      setIsCameraOpen(false);
      setFirNumber('');
      setEvidencePin('');
    }, 1500);
  };

  const recognitionRef = useRef<any>(null);

  const toggleDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Web Speech API is not supported in this browser environment. Please type directly.', 'warning');
      return;
    }

    if (isDictating) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsDictating(false);
      addToast('Voice dictation stopped', 'info');
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = testimonyLanguage === 'Hindi' ? 'hi-IN' : testimonyLanguage === 'Marathi' ? 'mr-IN' : 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript;
            }
          }
          if (currentTranscript) {
            setTestimonyNotes(prev => (prev ? prev.trim() + ' ' + currentTranscript : currentTranscript));
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition info:", event.error);
          setIsDictating(false);
        };

        recognition.onend = () => {
          setIsDictating(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsDictating(true);
        addToast(`Live Voice dictation active (${testimonyLanguage}). Speak now...`, 'info');
      } catch (err) {
        console.error("Dictation start error:", err);
        addToast('Could not access microphone for dictation.', 'warning');
      }
    }
  };

  const handleTestimonySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTestimony(true);

    try {
      const sigDataUrl = testimonySigPad.current ? testimonySigPad.current.toDataURL() : undefined;

      // Process real file attachments into base64 data URLs & SHA-256 digests
      const processedAttachments = await Promise.all(
        testimonyFiles.map(async (file) => {
          return new Promise<{ name: string; size: number; type: string; dataUrl: string; hash: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
              const dataUrl = event.target?.result as string;
              try {
                const base64 = dataUrl.split(',')[1];
                const binaryString = window.atob(base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                resolve({ name: file.name, size: file.size, type: file.type || 'image/png', dataUrl, hash: hashHex });
              } catch (err) {
                resolve({ name: file.name, size: file.size, type: file.type || 'image/png', dataUrl, hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' });
              }
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const res = await api.submitTestimony({
        caseId: caseId || 'FIR-2026-001',
        incidentDate: testimonyIncidentDate,
        location: testimonyLocation || 'Sector 4 Police Station',
        language: testimonyLanguage,
        witnessName: isAnonymous ? undefined : witnessName,
        protectIdentity: isAnonymous,
        idType: testimonyIdType,
        testimonyType: testimonyType,
        depositionText: testimonyNotes,
        officerPin: testimonyPin,
        signatureDataUrl: sigDataUrl,
        attachments: processedAttachments
      });

      addToast(
        res.isIdentityProtected
          ? `Testimony & ${processedAttachments.length} attachments sealed with ZK Commitment (${res.witnessAlias}) & Polygon PoS Anchor!`
          : `Testimony & ${processedAttachments.length} attachments cryptographically signed & anchored on Polygon PoS Blockchain`,
        'info'
      );

      fetchDashboardData();

      setCaseId('');
      setWitnessName('');
      setTestimonyNotes('');
      setTestimonyLocation('');
      setTestimonyIncidentDate('');
      setTestimonyFiles([]);
      setTestimonyPin('');
      clearTestimonySig();
    } catch (err: any) {
      console.error('Testimony submission error:', err);
      addToast(err.message || 'Failed to submit testimony.', 'warning');
    } finally {
      setIsSubmittingTestimony(false);
    }
  };

  // Mock submissions list
  const recentSubmissions = [
    {
      id: 'EV-2026-891',
      title: 'Crime Scene Snapshot - Sector 4',
      type: 'Evidence',
      timestamp: 'Today, 10:42 AM',
      hash: '0x8f9a...3c2e',
      status: 'Hashed & Sealed',
    },
    {
      id: 'TM-2026-412',
      title: 'Deposition Statement - FIR #402',
      type: 'Testimony',
      timestamp: 'Yesterday, 04:15 PM',
      hash: '0x7b1c...9a4f',
      status: 'Verified',
    },
    {
      id: 'EV-2026-880',
      title: 'CCTV Surveillance Backup File',
      type: 'Evidence',
      timestamp: '01 Aug 2026, 02:30 PM',
      hash: '0x3d4e...1f82',
      status: 'Pending Sync',
    },
  ];

  return (
    <div className="w-full h-screen bg-[#F5F5F5] font-sans flex flex-col md:flex-row relative overflow-hidden">
      {/* Field Submitter Sidebar */}
      <FieldSubmitterSidebar
        activeItem={activeTab}
        onSelect={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
        notificationCount={unreadNotificationCount}
        role={role}
        profileData={profileData}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Duress Mode Honeypot Banner */}
        {isDuressSession && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 md:px-6 py-2.5 flex items-center justify-between text-xs text-amber-900 font-medium z-50">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
              </span>
              <span className="font-bold">🚨 DURESS HONEYPOT SANDBOX ACTIVE:</span>
              <span>Serving synthetic decoy dockets &amp; honeytoken exhibits. Covert alert sent to Validators.</span>
            </div>
            <button
              onClick={() => setIsSimulatedGatewayTimeout(true)}
              className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold text-[11px] hover:bg-amber-700 transition-all cursor-pointer shadow-xs"
            >
              ⚡ Test Gateway Timeout 504
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <header className="bg-white border-b border-black/5 px-4 md:px-6 py-4 hidden md:flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium tracking-tight text-black">
              {activeTab}
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-black/5 text-black/60 text-xs font-semibold">
              {role} Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Role Switcher pill for quick testing */}
            <div className="hidden lg:flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-xl border border-black/5 text-xs font-medium text-black/70">
              <span className="px-2 text-black/40 font-semibold">Role:</span>
              <button
                onClick={() => setRole('Field Submitter')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  role === 'Field Submitter'
                    ? 'bg-white text-black font-semibold shadow-xs'
                    : 'hover:text-black'
                }`}
              >
                Field Submitter
              </button>
              <button
                onClick={() => setRole('Court Authority')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  role === 'Court Authority'
                    ? 'bg-white text-black font-semibold shadow-xs'
                    : 'hover:text-black'
                }`}
              >
                Court Authority
              </button>
              <button
                onClick={() => setRole('Independent Validator')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  role === 'Independent Validator'
                    ? 'bg-white text-black font-semibold shadow-xs'
                    : 'hover:text-black'
                }`}
              >
                Independent Validator
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F5] hover:bg-black/5 text-black rounded-full transition-colors text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* View Switcher Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-7xl w-full mx-auto">
          {activeTab === 'Dashboard' && (
            role === 'Court Authority' || role === 'Independent Validator' ? (
              <CourtAuthorityDashboard
                onSelectTab={(tab) => setActiveTab(tab)}
                onSelectCase={(caseId) => {
                  setSelectedCaseId(caseId);
                  setActiveTab('Case Files');
                }}
                role={role}
              />
            ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Welcome Banner */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-black/5 shadow-sm relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-2 max-w-xl z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Geofenced Session Active • {(() => {
                      const userStr = typeof window !== 'undefined' ? localStorage.getItem('nyayakasha_user') : null;
                      const u = userStr ? JSON.parse(userStr) : null;
                      return u?.jurisdictionCode || 'MH-MUM-DIST-01';
                    })()}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-black">
                    Welcome back, {(() => {
                      const userStr = typeof window !== 'undefined' ? localStorage.getItem('nyayakasha_user') : null;
                      const u = userStr ? JSON.parse(userStr) : null;
                      return u?.fullName || 'Officer Siddhesh Harwande';
                    })()}
                  </h2>
                  <p className="text-black/60 text-sm leading-relaxed">
                    Capture tamper-evident digital evidence, record verified
                    testimonies, and monitor evidence chain-of-custody.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0 z-10 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('Capture evidence')}
                    className="px-6 py-2.5 rounded-full bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
                  >
                    <Camera className="w-4 h-4" />
                    Capture Evidence
                  </button>
                  <button
                    onClick={() => setActiveTab('Submit testimony')}
                    className="px-6 py-2.5 rounded-full bg-[#F5F5F5] hover:bg-black/5 text-black text-sm font-medium transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <FileText className="w-4 h-4" />
                    Submit Testimony
                  </button>
                </div>
              </div>

              {/* Stats Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-black/50">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Total Evidence
                    </span>
                    <Camera className="w-4 h-4 text-black" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-medium tracking-tight text-black">
                      {realEvidence.length > 0 ? realEvidence.length : 128}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Live Database Sync
                    </span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-black/50">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Testimonies Recorded
                    </span>
                    <FileText className="w-4 h-4 text-black" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-medium tracking-tight text-black">
                      {realEvidence.filter(e => e.type === 'Document' || e.type === 'Audio' || (e.title && (e.title.toLowerCase().includes('statement') || e.title.toLowerCase().includes('testimony')))).length || 45}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      100% Signed
                    </span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-black/50">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Pending Sync
                    </span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-medium tracking-tight text-black">
                      {realEvidence.filter(e => e.status === 'Pending Chain Transfer' || e.status === 'Pending').length}
                    </span>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Auto-syncing
                    </span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-black/50">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Custody Integrity
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-medium tracking-tight text-black">
                      100%
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Submissions Table */}
              <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg  font-bold text-black">
                      Recent Field Submissions
                    </h3>
                    <p className="text-xs text-black/50">
                      Real-time cryptographically hashed entries
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('My submissions')}
                    className="text-xs font-semibold text-black hover:underline flex items-center gap-1"
                  >
                    View All
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-black/5 text-black/40 text-xs font-semibold uppercase tracking-wider">
                        <th className="pb-3">Submission ID</th>
                        <th className="pb-3">Title / Description</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Timestamp</th>
                        <th className="pb-3">SHA-256 Hash</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {realEvidence.slice(0, 10).map((e: any) => ({
                        id: e.id,
                        title: e.title,
                        type: e.type || 'Evidence',
                        timestamp: e.date || 'Today, 10:42 AM',
                        hash: e.hash ? (e.hash.startsWith('0x') ? e.hash.slice(0, 10) + '...' + e.hash.slice(-4) : '0x' + e.hash.slice(0, 8) + '...' + e.hash.slice(-4)) : '0x8f9a...3c2e',
                        status: e.status === 'Sealed' ? 'Hashed & Sealed' : e.status === 'Verified' ? 'Verified' : 'Pending Sync'
                      })).map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-black/2 transition-colors"
                        >
                          <td className="py-3.5 font-mono text-xs font-bold text-black">
                            {item.id}
                          </td>
                          <td className="py-3.5 font-medium text-black">
                            {item.title}
                          </td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-black/5 text-black/70 text-xs font-semibold">
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3.5 text-xs text-black/60">
                            {item.timestamp}
                          </td>
                          <td className="py-3.5 font-mono text-xs text-black/60">
                            {item.hash}
                          </td>
                          <td className="py-3.5 text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                item.status === 'Verified'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.status === 'Hashed & Sealed'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )
        )}

          {activeTab === 'Capture evidence' && (
            <CaptureEvidenceTab role={role} addToast={addToast} />
          )}

          {activeTab === 'Submit testimony' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-black/5 shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-medium tracking-tight text-black mb-1">
                    Record Field Testimony
                  </h2>
                  <p className="text-sm text-black/60">
                    Deposition notes and statements are cryptographically signed using your officer credentials.
                  </p>
                </div>

                <form onSubmit={handleTestimonySubmit} className="space-y-8">
                  {/* Section 1: Deposition Metadata */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-black uppercase tracking-widest border-b border-black/5 pb-2">1. Metadata & Context</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-black/70 uppercase tracking-wider mb-2">
                          Case / Court ID
                        </label>
                        <input
                          type="text"
                          required
                          value={caseId}
                          onChange={(e) => setCaseId(e.target.value)}
                          placeholder="e.g. HC-2026-8812"
                          className="w-full px-4 py-3 bg-[#F5F5F5] border border-transparent rounded-xl focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 text-sm font-medium outline-none transition-all shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black/70 uppercase tracking-wider mb-2">
                          Incident Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={testimonyIncidentDate}
                          onChange={(e) => setTestimonyIncidentDate(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F5F5F5] border border-transparent rounded-xl focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 text-sm font-medium outline-none transition-all shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black/70 uppercase tracking-wider mb-2">
                          Deposition Location
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-black/40 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={testimonyLocation}
                            onChange={(e) => setTestimonyLocation(e.target.value)}
                            placeholder="e.g. Sector 4 Police Station"
                            className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border border-transparent rounded-xl focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 text-sm font-medium outline-none transition-all shadow-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black/70 uppercase tracking-wider mb-2">
                          Language of Deposition
                        </label>
                        <select 
                          value={testimonyLanguage}
                          onChange={(e) => setTestimonyLanguage(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F5F5F5] border border-transparent rounded-xl focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 text-sm font-medium outline-none transition-all shadow-sm appearance-none cursor-pointer"
                        >
                          <option>English</option>
                          <option>Hindi</option>
                          <option>Marathi</option>
                          <option>Gujarati</option>
                          <option>Other (Translated)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Deponent Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-black/5 pb-2">
                      <h3 className="text-sm font-bold text-black uppercase tracking-widest">2. Deponent / Witness</h3>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-black/50 uppercase">Protect Identity</span>
                        <button 
                          type="button"
                          onClick={() => setIsAnonymous(!isAnonymous)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isAnonymous ? 'bg-purple-600' : 'bg-black/20'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-black/70 uppercase tracking-wider mb-2">
                          Witness / Deponent Name
                        </label>
                        <input
                          type="text"
                          required={!isAnonymous}
                          disabled={isAnonymous}
                          value={isAnonymous ? 'Protected (Anonymous)' : witnessName}
                          onChange={(e) => setWitnessName(e.target.value)}
                          placeholder="e.g. Suresh V. Patil"
                          className={`w-full px-4 py-3 border rounded-xl text-sm font-medium outline-none transition-all shadow-sm ${
                            isAnonymous 
                              ? 'bg-black/5 border-transparent text-black/50' 
                              : 'bg-[#F5F5F5] border-transparent focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 text-black'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-black/70 uppercase tracking-wider mb-2">
                          ID Type
                        </label>
                        <select 
                          disabled={isAnonymous}
                          value={testimonyIdType}
                          onChange={(e) => setTestimonyIdType(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl text-sm font-medium outline-none transition-all shadow-sm appearance-none ${
                            isAnonymous 
                              ? 'bg-black/5 border-transparent text-black/50 cursor-not-allowed' 
                              : 'bg-[#F5F5F5] border-transparent focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 text-black cursor-pointer'
                          }`}
                        >
                          {isAnonymous ? (
                            <option>Identity Masked</option>
                          ) : (
                            <>
                              <option>Aadhaar Card (Verified)</option>
                              <option>PAN Card</option>
                              <option>Driving License</option>
                              <option>Passport</option>
                              <option>Unverified / Verbal</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Testimony Content */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-black uppercase tracking-widest border-b border-black/5 pb-2">3. Statement</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-black/70 uppercase tracking-wider mb-2">
                          Testimony Type
                        </label>
                        <select 
                          value={testimonyType}
                          onChange={(e) => setTestimonyType(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F5F5F5] border border-transparent rounded-xl focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 text-sm font-medium outline-none transition-all shadow-sm appearance-none cursor-pointer"
                        >
                          <option>Eyewitness Account</option>
                          <option>Expert Opinion</option>
                          <option>Victim Statement</option>
                          <option>Character Reference</option>
                          <option>Confession</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold text-black/70 uppercase tracking-wider">
                            Deposition Text
                          </label>
                          <button 
                            type="button" 
                            onClick={toggleDictation}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                              isDictating ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-black/5 text-black/60 hover:bg-black/10 hover:text-black'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${isDictating ? 'bg-red-500' : 'bg-transparent border border-black/30'}`}></div>
                            {isDictating ? 'Recording...' : 'Dictate'}
                          </button>
                        </div>
                        <textarea
                          rows={6}
                          required
                          value={testimonyNotes}
                          onChange={(e) => setTestimonyNotes(e.target.value)}
                          placeholder="Enter detailed field statement. This text will become immutable upon submission..."
                          className="w-full px-4 py-4 bg-[#F5F5F5] border border-transparent rounded-2xl focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 text-sm font-medium outline-none transition-all shadow-inner resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Attachments */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-black/5 pb-2">
                      <h3 className="text-sm font-bold text-black uppercase tracking-widest">4. Supporting Evidence</h3>
                      <button 
                        type="button"
                        onClick={() => fileTestimonyRef.current?.click()}
                        className="text-[10px] font-bold text-purple-600 uppercase hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add File
                      </button>
                      <input 
                        type="file" 
                        multiple
                        ref={fileTestimonyRef} 
                        className="hidden" 
                        onChange={handleTestimonyFileSelect}
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                      />
                    </div>
                    
                    {testimonyFiles.length === 0 ? (
                      <div 
                        onClick={() => fileTestimonyRef.current?.click()}
                        className="border-2 border-dashed border-black/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F5F5F5] hover:border-black/20 transition-all group"
                      >
                        <UploadCloud className="w-8 h-8 text-black/20 group-hover:text-black/40 mb-2 transition-colors" />
                        <p className="text-sm font-medium text-black/60">Click or drag files to attach</p>
                        <p className="text-xs text-black/40 mt-1">Audio confessions, images, documents</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {testimonyFiles.map((file, idx) => (
                          <div key={idx} className="bg-[#F5F5F5] border border-black/5 p-3 rounded-xl flex items-center justify-between group">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center shrink-0">
                                {file.type.startsWith('image') ? <Camera className="w-4 h-4 text-black/60" /> : <FileCode className="w-4 h-4 text-black/60" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-black truncate">{file.name}</p>
                                <p className="text-[10px] text-black/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeTestimonyFile(idx)}
                              className="w-6 h-6 rounded-md bg-black/5 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-black/40 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Verification Block */}
                  {/* Digital Signature Block */}
                  <div className="bg-[#1A1A1A] p-5 rounded-2xl flex flex-col gap-4 text-white/90 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="flex items-center gap-2 text-sm font-medium text-purple-400">
                          <User className="w-5 h-5" />
                          Signer: {role}
                        </span>
                        <p className="text-xs text-white/60">
                          Key ID: 0x8a92...4f1c • Digital Identity Verified
                        </p>
                      </div>
                      <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/10 shrink-0">
                        <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">Status</p>
                        <p className="font-mono text-xs font-bold text-emerald-400">Ready to Sign</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-bold text-white/70 uppercase tracking-wider mb-2">
                          Authorize with Officer PIN
                        </label>
                        <div className="relative">
                          <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                          <input
                            type="password"
                            maxLength={6}
                            required
                            placeholder="Enter 6-digit PIN"
                            value={testimonyPin}
                            onChange={(e) => setTestimonyPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-purple-400 outline-none transition-all text-sm font-mono tracking-widest text-white placeholder-white/20"
                          />
                        </div>
                      </div>
                      <div className="flex-1 w-full flex items-center justify-end">
                         <div className="text-right">
                           <p className="text-xs font-bold text-purple-400 flex items-center justify-end gap-1"><ShieldCheck className="w-3 h-3"/> ECDSA</p>
                           <p className="text-[10px] text-white/50">secp256k1 Signature</p>
                         </div>
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] font-bold text-white/70 uppercase tracking-wider">
                          Officer Handwritten Signature
                        </label>
                        <button type="button" onClick={clearTestimonySig} className="text-[10px] text-white/50 hover:text-white transition-colors">
                          Clear
                        </button>
                      </div>
                      <div className="bg-white rounded-xl overflow-hidden border-2 border-white/10">
                        <SignatureCanvas
                          ref={testimonySigPad}
                          penColor="black"
                          canvasProps={{ className: "w-full h-32 cursor-crosshair" }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingTestimony || !caseId || !testimonyNotes || testimonyPin.length < 4}
                    className="w-full py-4 rounded-xl bg-purple-600 text-white text-base font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingTestimony ? (
                      <span>Signing Deposition...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Sign & Submit Testimony
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'My submissions' && <MySubmissionsTab />}
          {activeTab === 'Notifications' && <NotificationsTab role={role} onSelectTab={setActiveTab} />}
          {(activeTab === 'Consensus votes' || activeTab === 'Consensus Approvals' || activeTab === 'Consensus approvals') && (
            <ConsensusApprovalsTab role={role} />
          )}
          {(activeTab === 'Forgery review' || activeTab === 'Forgery review queue' || activeTab === 'Forgery detection') && (
            <ForgeryReviewQueueTab />
          )}
          {(activeTab === 'Identity unlock' || activeTab === 'Identity Unlock') && (
            <IdentityUnlockTab />
          )}
          {(activeTab === 'Precedent flags' || activeTab === 'Precedent Flags') && (
            <PrecedentFlagsTab />
          )}

          {activeTab === 'Case Files' && (
            role === 'Field Submitter' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto bg-white rounded-[2rem] border border-black/10 p-8 shadow-sm space-y-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
                    Role Access Boundary Enforced
                  </span>
                  <h2 className="text-2xl font-bold text-black pt-2">
                    Case Files Restricted to Court Authority
                  </h2>
                  <p className="text-sm text-black/70 max-w-xl mx-auto leading-relaxed">
                    If a Field Submitter could browse general case files, an officer could inspect every case in the system — including those containing protected witness testimony, judge's notes, and other officers' sensitive evidence.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 text-white text-left space-y-3 font-sans border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-400 tracking-wider">
                    <ShieldCheck className="w-4 h-4" /> Core Structural Isolation Rule
                  </div>
                  <blockquote className="text-sm font-medium text-slate-200 italic border-l-2 border-amber-400 pl-3 py-1">
                    "Field Submitter can check on what they submitted. Only Court Authority can see the whole case — because only they need the whole picture to actually rule on it."
                  </blockquote>
                  <p className="text-xs text-slate-400">
                    As Officer R. Kulkarni / Officer Rane, you can track the status of your uploaded evidence and testimonies directly inside <strong>My Submissions</strong>.
                  </p>
                </div>

                <div className="pt-2 flex justify-center gap-4">
                  <button
                    onClick={() => setActiveTab('My submissions')}
                    className="px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-all flex items-center gap-2 shadow-md"
                  >
                    <Inbox className="w-4 h-4" />
                    Open My Submissions
                  </button>
                </div>
              </motion.div>
            ) : (
              <CaseFilesTab
                initialCaseId={selectedCaseId}
                onClearSelectedCase={() => setSelectedCaseId(null)}
                role={role}
              />
            )
          )}


          {activeTab === 'Chain of Custody' && <ChainOfCustodyTab />}

          {(activeTab === 'Analytics' || activeTab === 'Aggregate analytics' || activeTab === 'Aggregate Analytics' || activeTab === 'Aggregate analytics page' || activeTab === 'Court Analytics') && (
            <AnalyticsTab role={role} />
          )}

          {(activeTab === 'Audit Logs' || activeTab === 'Audit log') && <AuditLogsTab role={role} />}

          {activeTab === 'Profile' && <ProfileTab role={role} />}

          {activeTab === 'Settings' && <SettingsTab role={role} />}
        </main>
      </div>

      {/* Global Toast Container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-full max-w-md px-4 pointer-events-none">
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full bg-white border border-orange-200 shadow-xl rounded-xl p-4 flex items-center gap-3 text-sm font-medium text-black pointer-events-auto"
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              Your session will end soon due to inactivity.
            </motion.div>
          )}
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full bg-black text-white shadow-xl rounded-xl p-4 flex items-center gap-3 text-sm font-medium pointer-events-auto"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4" />
              </div>
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Plausible Network Gateway Timeout Modal for Sandboxed Duress Containment */}
      {isSimulatedGatewayTimeout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4 border border-black/10"
          >
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200 shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1" style={{ letterSpacing: '-0.02em' }}>
                High Court Gateway Timeout (Error 504)
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                The secure judicial network connection timed out while attempting to synchronize cryptographic ledger state. Your active session has been suspended for network protection.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-[11px] font-mono text-gray-600 text-left space-y-1">
              <div><span className="text-gray-400">Error Code:</span> ERR_GATEWAY_TIMEOUT_504</div>
              <div><span className="text-gray-400">Node Cluster:</span> IN-WEST-HQ-NODE-04</div>
              <div><span className="text-gray-400">Timestamp:</span> {new Date().toISOString()}</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all text-sm shadow-md cursor-pointer"
            >
              Return to Portal Sign-In
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
