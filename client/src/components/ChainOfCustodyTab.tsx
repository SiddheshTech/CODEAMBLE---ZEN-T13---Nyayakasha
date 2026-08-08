import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Link2, CheckCircle2, Camera, Shield, 
  MapPin, Clock, FileCode, ArrowRight, User, Key,
  Lock, AlertTriangle, FileText, Download, QrCode,
  ChevronLeft, Fingerprint, Eye, X
} from 'lucide-react';

const MOCK_CUSTODY_ITEMS = [
  {
    id: 'EV-2026-8821',
    caseId: 'FIR-2026-001',
    title: 'CCTV Footage - Main Server Room',
    type: 'Digital Asset',
    currentCustodian: 'Officer R. Kulkarni',
    status: 'In Transit',
    lastUpdated: '10 mins ago',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'EV-2026-8822',
    caseId: 'FIR-2026-001',
    title: 'Server Access Logs (Encrypted)',
    type: 'Document',
    currentCustodian: 'Cyber Forensics Lab',
    status: 'Secured',
    lastUpdated: '2 hours ago',
    hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
  },
  {
    id: 'EV-2026-8823',
    caseId: 'FIR-2026-003',
    title: 'Tampered Network Switch',
    type: 'Physical Evidence',
    currentCustodian: 'Evidence Room A',
    status: 'Archived',
    lastUpdated: '1 day ago',
    hash: '4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5'
  },
  {
    id: 'EV-2026-8824',
    caseId: 'FIR-2026-006',
    title: 'Counterfeit Currency Batch',
    type: 'Physical Evidence',
    currentCustodian: 'Pending Acceptance',
    status: 'Transfer Pending',
    lastUpdated: 'Just now',
    hash: '7d34dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1abc'
  }
];

const MOCK_TIMELINE = [
  {
    time: "Oct 12, 2026 • 10:42 AM",
    title: "Evidence Seized at Scene",
    desc: "Digital asset acquired at Sector 4 Server Room. Initial hash generated and sealed on-device.",
    actor: "Officer R. Kulkarni",
    role: "Field Submitter",
    icon: Camera,
    status: "Verified",
    hash: "e3b0c442...b855"
  },
  {
    time: "Oct 12, 2026 • 11:15 AM",
    title: "Transfer Initiated",
    desc: "Officer R. Kulkarni requested transfer to Cyber Forensics Lab. Waiting for acceptance.",
    actor: "Officer R. Kulkarni",
    role: "Field Submitter",
    icon: ArrowRight,
    status: "Pending",
    hash: "Signature Generated"
  },
  {
    time: "Oct 12, 2026 • 11:30 AM",
    title: "Handover Accepted via ZKP",
    desc: "Dr. Mehta mathematically verified the asset hash and accepted custody. Ownership transferred.",
    actor: "Dr. S. Mehta",
    role: "Forensics Analyst",
    icon: Link2,
    status: "Verified",
    hash: "ZKP Validated"
  },
  {
    time: "Oct 12, 2026 • 02:30 PM",
    title: "Analysis Completed & Logged",
    desc: "Asset accessed for malware analysis. Read-only lock enforced during examination.",
    actor: "Dr. S. Mehta",
    role: "Forensics Analyst",
    icon: CheckCircle2,
    status: "Logged",
    hash: "Audit ID: 9012"
  }
];

export function ChainOfCustodyTab() {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransferModalOpen(false);
  };

  if (selectedItem) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <button 
          onClick={() => setSelectedItem(null)}
          className="flex items-center gap-2 text-sm font-bold text-black/60 hover:text-black transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Custody Ledger
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-black/5 text-black text-[10px] font-bold uppercase tracking-wider rounded-md">
                    {selectedItem.type}
                  </span>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                    selectedItem.status === 'Secured' ? 'bg-emerald-100 text-emerald-700' :
                    selectedItem.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                    selectedItem.status === 'Transfer Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-black/5 text-black/60'
                  }`}>
                    {selectedItem.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-black leading-tight mb-2">
                  {selectedItem.title}
                </h2>
                <p className="font-mono text-xs text-black/50">ID: {selectedItem.id}</p>
                <p className="font-mono text-xs text-black/50">Case: {selectedItem.caseId}</p>
              </div>

              <div className="p-4 bg-[#F5F5F5] rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-black/50 font-bold mb-0.5">Current Custodian</p>
                    <p className="text-sm font-bold text-black">{selectedItem.currentCustodian}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-black/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black/70">Cryptographic Proof</h4>
                <div className="p-3 bg-black/5 rounded-xl flex items-start gap-3">
                  <Shield className="w-4 h-4 text-black/40 shrink-0 mt-0.5" />
                  <p className="font-mono text-[10px] text-black/60 break-all leading-relaxed">
                    {selectedItem.hash}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setIsTransferModalOpen(true)}
                  className="w-full py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-black/80 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                >
                  <ArrowRight className="w-4 h-4" />
                  Initiate Transfer
                </button>
                <button className="w-full py-3 bg-white border border-black/10 text-black rounded-xl text-sm font-bold hover:bg-black/5 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Audit Report
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-black/5 shadow-sm space-y-8 h-full">
              <div>
                <h3 className="text-lg font-bold text-black mb-1">Immutable Ledger History</h3>
                <p className="text-xs text-black/60">Cryptographically verified trail of custody and access.</p>
              </div>

              <div className="relative pl-6 border-l-2 border-black/5 space-y-8">
                {MOCK_TIMELINE.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[35px] w-8 h-8 rounded-full bg-white border-2 border-black/10 flex items-center justify-center z-10">
                      <step.icon className="w-4 h-4 text-black/60" />
                    </div>
                    <div className="bg-[#F5F5F5] rounded-2xl p-5 border border-black/5 hover:border-black/10 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                        <div>
                          <h4 className="font-bold text-black text-sm">{step.title}</h4>
                          <span className="text-xs font-medium text-black/50">{step.time}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-black/5 shadow-sm w-fit">
                          {step.status === 'Verified' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                          <span className="text-[10px] font-bold uppercase tracking-wider text-black">{step.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-black/70 leading-relaxed mb-4">{step.desc}</p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-black/5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                            <User className="w-3 h-3 text-black/60" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-black leading-tight">{step.actor}</p>
                            <p className="text-[10px] text-black/50">{step.role}</p>
                          </div>
                        </div>
                        <div className="sm:ml-auto flex items-center gap-2 text-[10px] font-mono text-black/40 bg-white px-2 py-1 rounded border border-black/5">
                          <Key className="w-3 h-3" />
                          {step.hash}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Modal */}
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] shadow-2xl border border-black/5 w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-black">Initiate Secure Transfer</h3>
                  <p className="text-xs text-black/50">Create a zero-knowledge proof handover request.</p>
                </div>
                <button onClick={() => setIsTransferModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors">
                  <X className="w-4 h-4 text-black" />
                </button>
              </div>
              
              <form onSubmit={handleTransferSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-black/70 uppercase tracking-wider mb-2">Select Recipient</label>
                  <select className="w-full px-4 py-3 bg-[#F5F5F5] border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50">
                    <option>Dr. S. Mehta (Cyber Forensics)</option>
                    <option>Inspector S. Patel (Homicide)</option>
                    <option>Evidence Room B (Sector 4)</option>
                    <option>Central Archives</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/70 uppercase tracking-wider mb-2">Transfer Reason / Remarks</label>
                  <textarea 
                    rows={3} 
                    className="w-full px-4 py-3 bg-[#F5F5F5] border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 resize-none"
                    placeholder="Provide context for this transfer..."
                  ></textarea>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl flex gap-3 border border-purple-100">
                  <Fingerprint className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-purple-900 mb-1">Cryptographic Signing Required</h4>
                    <p className="text-xs text-purple-700 leading-relaxed">This action will generate a temporary QR code for the recipient to scan and cryptographically accept custody.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsTransferModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-black hover:bg-black/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-black hover:bg-black/80 shadow-lg flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    Generate Handover QR
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-black/5 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-black mb-1">
              Chain of Custody Ledger
            </h2>
            <p className="text-sm text-black/60">
              Track, verify, and transfer evidence with cryptographic certainty.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="text"
                  placeholder="Search Evidence ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F5F5F5] text-sm font-medium rounded-xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all"
                />
              </div>
              <button className="px-3 py-2 bg-[#F5F5F5] text-black rounded-xl hover:bg-black/5 transition-colors border border-transparent flex items-center justify-center shrink-0">
                <Filter className="w-4 h-4" />
              </button>
          </div>
        </div>

        {/* Analytics / Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/5 p-4 rounded-2xl border border-black/5">
            <p className="text-[10px] uppercase font-bold text-black/50 mb-1">Total Active Tracking</p>
            <p className="text-2xl font-bold text-black">142</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
            <p className="text-[10px] uppercase font-bold text-purple-600/70 mb-1">In Transit</p>
            <p className="text-2xl font-bold text-purple-700">8</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <p className="text-[10px] uppercase font-bold text-amber-600/70 mb-1">Pending Transfer</p>
            <p className="text-2xl font-bold text-amber-700">12</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <p className="text-[10px] uppercase font-bold text-emerald-600/70 mb-1">Secured in Labs</p>
            <p className="text-2xl font-bold text-emerald-700">122</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5">
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-black/50">Item / ID</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-black/50">Type</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-black/50">Current Custodian</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-black/50">Status</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-black/50">Last Updated</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-black/50 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {MOCK_CUSTODY_ITEMS.map((item, idx) => (
                <tr key={idx} className="hover:bg-black/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <td className="py-4 px-4">
                    <div className="font-bold text-sm text-black mb-0.5">{item.title}</div>
                    <div className="font-mono text-xs text-black/50">{item.id}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-black/5 text-black/70">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-black/40" />
                      <span className="text-sm font-medium text-black">{item.currentCustodian}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                      item.status === 'Secured' ? 'bg-emerald-100 text-emerald-700' :
                      item.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                      item.status === 'Transfer Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-black/5 text-black/60'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-black/60 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.lastUpdated}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors inline-flex">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
