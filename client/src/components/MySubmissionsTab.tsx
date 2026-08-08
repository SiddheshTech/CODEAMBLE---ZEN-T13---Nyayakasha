import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, ChevronLeft, FileText, Camera, 
  MapPin, Clock, ShieldCheck, Download, ExternalLink,
  CheckCircle2, AlertCircle, FileAudio, Video, Image as ImageIcon,
  Shield, User, Hash, Lock, Check
} from 'lucide-react';

const MOCK_SUBMISSIONS = [
  {
    id: 'SUB-2026-901',
    caseId: 'FIR-2026-001',
    title: 'CCTV Footage - Main Server Room',
    type: 'Digital Evidence',
    status: 'Verified',
    timestamp: 'Oct 12, 2026 • 10:42 AM',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    description: 'Surveillance footage extracted from the primary backup server. Shows unauthorized access at 02:14 AM.',
    location: 'Sector 4 Data Center',
    officer: 'Officer R. Kulkarni',
    attachments: [
      { name: 'cam_04_feed.mp4', size: '245 MB', type: 'video' },
      { name: 'extraction_log.txt', size: '12 KB', type: 'doc' }
    ],
    chainOfCustodyVerified: true
  },
  {
    id: 'SUB-2026-902',
    caseId: 'FIR-2026-002',
    title: 'Witness Statement - Property Fraud',
    type: 'Testimony',
    status: 'Pending Review',
    timestamp: 'Oct 14, 2026 • 09:15 AM',
    hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    description: 'Audio recording and translated transcript of the primary witness regarding forged documents.',
    location: 'Western Suburbs Precinct',
    officer: 'Inspector S. Patel',
    attachments: [
      { name: 'witness_audio_01.wav', size: '14 MB', type: 'audio' },
      { name: 'transcript_EN.pdf', size: '2 MB', type: 'doc' }
    ],
    chainOfCustodyVerified: true
  },
  {
    id: 'SUB-2026-903',
    caseId: 'FIR-2026-003',
    title: 'Recovered License Plates',
    type: 'Physical Evidence',
    status: 'Secured',
    timestamp: 'Oct 15, 2026 • 14:30 PM',
    hash: '4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5',
    description: 'Two sets of counterfeit plates recovered from the abandoned warehouse on Highway 9. Bagged and tagged.',
    location: 'Highway 9 Abandoned Warehouse',
    officer: 'Officer R. Kulkarni',
    attachments: [
      { name: 'scene_photo_1.jpg', size: '4.2 MB', type: 'image' },
      { name: 'scene_photo_2.jpg', size: '3.8 MB', type: 'image' }
    ],
    chainOfCustodyVerified: true
  },
  {
    id: 'SUB-2026-904',
    caseId: 'FIR-2026-004',
    title: 'Confidential Informant Tip',
    type: 'Intelligence Report',
    status: 'Action Required',
    timestamp: 'Oct 16, 2026 • 21:05 PM',
    hash: 'pending_verification',
    description: 'Anonymous tip regarding the tech espionage case. Requires immediate verification by the cyber cell.',
    location: 'Encrypted Drop',
    officer: 'Chief Inv. M. Singh',
    attachments: [
      { name: 'encrypted_payload.dat', size: '1.1 MB', type: 'doc' }
    ],
    chainOfCustodyVerified: false
  }
];

import { api } from '../services/api';

export function MySubmissionsTab() {
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [realSubmissions, setRealSubmissions] = useState<any[]>([]);

  React.useEffect(() => {
    api.getEvidence().then(res => {
      if (res && res.evidence && res.evidence.length > 0) {
        setRealSubmissions(res.evidence.map((e: any) => ({
          id: e.id,
          caseId: e.caseId || 'FIR-2026-001',
          title: e.title,
          type: e.type || 'Digital Evidence',
          status: e.status === 'Sealed' ? 'Verified' : e.status || 'Verified',
          timestamp: e.date || new Date().toLocaleString(),
          hash: e.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          description: e.evidenceNotes || e.customMetadata || 'Cryptographically sealed evidence exhibit recorded in blockchain audit ledger.',
          location: e.incidentLocation || 'Field Location',
          officer: e.custodian || 'Officer Siddhesh Harwande',
          attachments: [
            { name: `${e.id}_payload.${e.type === 'Video' ? 'mp4' : e.type === 'Photo' ? 'jpg' : e.type === 'Audio' ? 'wav' : 'pdf'}`, size: '4.2 MB', type: e.type === 'Video' ? 'video' : e.type === 'Photo' ? 'image' : e.type === 'Audio' ? 'audio' : 'doc' }
          ],
          chainOfCustodyVerified: true
        })));
      }
    }).catch(err => console.log('MySubmissions API error:', err));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
      case 'Secured':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending Review':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Action Required':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-black/5 text-black/60 border-black/10';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-blue-600" />;
      case 'audio': return <FileAudio className="w-4 h-4 text-purple-600" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-emerald-600" />;
      default: return <FileText className="w-4 h-4 text-black/60" />;
    }
  };

  if (selectedSub) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-6"
      >
        <button 
          onClick={() => setSelectedSub(null)}
          className="flex items-center gap-2 text-sm font-bold text-black/60 hover:text-black transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Submissions
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-black/5 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-black/5 text-black text-[10px] font-bold uppercase tracking-wider rounded-md">
                      {selectedSub.type}
                    </span>
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getStatusColor(selectedSub.status)}`}>
                      {selectedSub.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-2 leading-tight">
                    {selectedSub.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-mono text-black/50">
                    <span>ID: {selectedSub.id}</span>
                    <span>Case: {selectedSub.caseId}</span>
                  </div>
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-black/70 leading-relaxed text-sm">
                  {selectedSub.description}
                </p>
              </div>

              {/* Raw Image / Media Preview if available */}
              {(selectedSub.fileUrl || selectedSub.dataUrl) && (
                <div className="space-y-2 pt-4 border-t border-black/5">
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider">Captured Raw Media Payload</h4>
                  <div className="rounded-2xl overflow-hidden border border-black/10 max-h-80 bg-black flex items-center justify-center">
                    <img src={selectedSub.fileUrl || selectedSub.dataUrl} alt={selectedSub.title} className="max-h-80 object-contain w-full" />
                  </div>
                </div>
              )}

              {/* Immutability & Anti-Tamper Notice */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-900">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Immutable Record Sealed</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Under Section 65B of the Indian Evidence Act & Polygon PoS Consensus Protocol, once submitted, field submitters strictly cannot edit, modify, download, or erase this evidence exhibit.
                  </p>
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-3 pt-6 border-t border-black/5">
                <h4 className="text-sm font-bold text-black flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Attached Files ({selectedSub.attachments?.length || 0})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedSub.attachments || []).map((file: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[#F5F5F5] rounded-xl border border-black/5 flex items-center justify-between group hover:border-black/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-black/5 flex items-center justify-center shadow-sm">
                          {getFileIcon(file.type)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-black truncate w-32 sm:w-40">{file.name}</p>
                          <p className="text-[10px] text-black/50 font-mono">{file.size}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cryptographic Proof Card */}
            <div className="bg-black text-white p-6 sm:p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Shield className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-400" />
                    Cryptographic Integrity
                  </h3>
                  <p className="text-xs text-white/60">This submission is sealed with a zero-knowledge proof hash.</p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">SHA-256 Signature Hash</span>
                    {selectedSub.chainOfCustodyVerified ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-white/90 break-all leading-relaxed">
                    {selectedSub.hash}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-white/90 transition-colors">
                    View Audit Log
                  </button>
                  <button className="px-4 py-2 bg-white/10 text-white text-sm font-bold rounded-lg hover:bg-white/20 transition-colors border border-white/10">
                    Verify Hash
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Meta Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-black uppercase tracking-wider">Submission Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-black/60" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider mb-0.5">Timestamp</p>
                    <p className="text-xs font-semibold text-black">{selectedSub.timestamp}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-black/60" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider mb-0.5">Location Recorded</p>
                    <p className="text-xs font-semibold text-black">{selectedSub.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider mb-0.5">Submitting Officer</p>
                    <p className="text-xs font-semibold text-black">{selectedSub.officer}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Hash className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider mb-0.5">Related Case</p>
                    <p className="text-xs font-semibold text-black hover:text-purple-600 cursor-pointer transition-colors flex items-center gap-1">
                      {selectedSub.caseId} <ExternalLink className="w-3 h-3" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Structural Isolation Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-[2rem] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Lock className="w-4 h-4 text-amber-400" />
            Field Submitter Access Boundary
          </div>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            "Field Submitter can check on what they submitted. Only Court Authority can see the whole case — because only they need the whole picture to actually rule on it."
          </p>
        </div>
        <div className="shrink-0 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 text-[11px] text-slate-300 font-mono">
          Status Tracking Only • Protected Case Files
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-black/5 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-black mb-1">
              My Submissions Vault
            </h2>
            <p className="text-sm text-black/60">
              Track the verification status ('Under Review', 'Verified', 'Secured') of your submitted field evidence & testimonies.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
             <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="text"
                  placeholder="Search submissions by ID, Title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#F5F5F5] text-sm font-medium rounded-xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                {['All', 'Evidence', 'Testimony', 'Reports'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                      activeFilter === filter 
                        ? 'bg-black text-white' 
                        : 'bg-[#F5F5F5] text-black/60 hover:bg-black/5'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
          </div>
        </div>

        {/* Analytics / Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/5 p-4 rounded-2xl border border-black/5">
            <p className="text-[10px] uppercase font-bold text-black/50 mb-1">Total Submissions</p>
            <p className="text-2xl font-bold text-black">{realSubmissions.length > 0 ? realSubmissions.length : 42}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <p className="text-[10px] uppercase font-bold text-emerald-600/70 mb-1">Verified Entries</p>
            <p className="text-2xl font-bold text-emerald-700">{realSubmissions.filter(s => s.status === 'Verified' || s.status === 'Secured').length || 38}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <p className="text-[10px] uppercase font-bold text-amber-600/70 mb-1">Pending Review</p>
            <p className="text-2xl font-bold text-amber-700">{realSubmissions.filter(s => s.status === 'Pending Review' || s.status === 'Pending').length || 3}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
            <p className="text-[10px] uppercase font-bold text-purple-600/70 mb-1">Total Data Secured</p>
            <p className="text-2xl font-bold text-purple-700">1.2 GB</p>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-3">
          {(realSubmissions.length > 0 ? realSubmissions : MOCK_SUBMISSIONS).map((sub) => (
            <div
              key={sub.id}
              onClick={() => setSelectedSub(sub)}
              className="p-4 sm:p-5 bg-white border border-black/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-black/30 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F5F5F5] border border-black/5 flex items-center justify-center shrink-0 group-hover:bg-purple-50 group-hover:border-purple-100 transition-colors">
                  {sub.type.includes('Evidence') ? <Camera className="w-5 h-5 text-black/60 group-hover:text-purple-600" /> : <FileText className="w-5 h-5 text-black/60 group-hover:text-purple-600" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-black bg-black/5 px-2 py-0.5 rounded">
                      {sub.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">
                      {sub.type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-black mb-1 group-hover:text-purple-700 transition-colors">
                    {sub.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-black/50">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {sub.timestamp}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 font-mono"><Hash className="w-3.5 h-3.5" /> {sub.hash.substring(0, 16)}...</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:border-l sm:border-black/5 sm:pl-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(sub.status)}`}>
                  {sub.status}
                </span>
                <ChevronLeft className="w-5 h-5 text-black/20 group-hover:text-black/60 rotate-180 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
