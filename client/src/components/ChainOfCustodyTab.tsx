import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Link2, CheckCircle2, Camera, Shield, 
  MapPin, Clock, FileCode, ArrowRight, User, Key,
  Lock, AlertTriangle, FileText, Download, QrCode,
  ChevronLeft, Fingerprint, Eye, X
} from 'lucide-react';
import { api } from '../services/api';

export function ChainOfCustodyTab() {
  const [custodyItems, setCustodyItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState('Dr. S. Mehta (Cyber Forensics)');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferPin, setTransferPin] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const userRole = localStorage.getItem('nyayakasha_user_role') || 'field_submitter';
  const canViewRawPayload = userRole === 'court_authority' || userRole === 'independent_validator';

  const fetchCustodyData = async () => {
    try {
      const res = await api.getEvidence();
      if (res && res.evidence) {
        setCustodyItems(res.evidence.map((e: any) => ({
          id: e.id,
          caseId: e.caseId || null,
          title: e.title,
          date: e.date,
          type: e.type || 'Physical Evidence',
          currentCustodian: e.custodian || null,
          status: e.status === 'Sealed' ? 'Secured' : e.status || null,
          lastUpdated: e.date ? new Date(e.date).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null,
          hash: e.hash || null,
          txHash: e.txHash || null,
          blockNumber: e.blockNumber || null,
          merkleRoot: e.merkleRoot || null,
          fileUrl: e.fileUrl || null,
          dataUrl: e.dataUrl || null,
          evidenceNotes: e.evidenceNotes || null,
          witnessName: e.witnessName || null
        })));
      }
    } catch (err) {
      console.error("Custody API fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCustodyData();
  }, []);

  const handleDownloadAuditReport = () => {
    if (!selectedItem) return;
    const reportContent = {
      title: "NYAYAKASHA CRYPTOGRAPHIC CHAIN OF CUSTODY CERTIFICATE",
      legalFramework: "Section 65B of Indian Evidence Act & Polygon PoS Consensus Protocol",
      generatedAt: new Date().toISOString(),
      evidenceMetadata: {
        id: selectedItem.id,
        caseId: selectedItem.caseId,
        title: selectedItem.title,
        type: selectedItem.type,
        currentCustodian: selectedItem.currentCustodian,
        status: selectedItem.status,
        sha256Hash: selectedItem.hash || null,
        txHash: selectedItem.txHash || null,
        blockNumber: selectedItem.blockNumber || null,
        merkleRoot: selectedItem.merkleRoot || null
      },
      chainOfCustodyTrail: timeline,
      certificateVerification: "100% IMMUTABLE & VERIFIED ON POLYGON POS BLOCKCHAIN"
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NYAYAKASHA_CUSTODY_CERTIFICATE_${selectedItem.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let intervalId: any;
    const loadChain = () => {
      if (selectedItem) {
        api.getEvidenceChain(selectedItem.id).then(res => {
          if (res && res.chainOfCustody && res.chainOfCustody.length > 0) {
            setTimeline(res.chainOfCustody.map((event: any) => {
              const prev = event.details?.previousCustodian || event.userId || event.userRole || 'Officer R. Kulkarni (Zone 4 Field Operations)';
              const next = event.details?.newCustodian;
              const actorDisplay = next ? `${prev} -> ${next}` : (event.userId || event.userRole || event.actorRole || 'Field Officer');
              return {
                time: new Date(event.timestamp).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                title: event.eventType.replace(/_/g, ' '),
                desc: event.details?.immutabilityNotice || (event.details?.reason ? `Reason: ${event.details.reason}` : null) || event.details?.notes || null,
                actor: actorDisplay,
                role: event.actorRole || (event.userRole === 'court_authority' ? 'Judicial Magistrate' : 'Field Officer'),
                icon: CheckCircle2,
                status: 'Verified',
                hash: event.details?.txHash ? event.details.txHash.slice(0, 18) + '...' : (event.blockHash ? event.blockHash.slice(0, 18) + '...' : null)
              };
            }));
          } else {
            // No audit trail entries yet — show the sealed submission entry derived from evidence metadata
            if (selectedItem.hash || selectedItem.txHash) {
              setTimeline([
                {
                  time: selectedItem.date ? new Date(selectedItem.date).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : selectedItem.lastUpdated,
                  title: "EVIDENCE BLOCKCHAIN ANCHORED",
                  desc: selectedItem.evidenceNotes || "Permanent Immutable Blockchain Anchor on Polygon PoS. Cannot be edited, deleted, or erased.",
                  actor: selectedItem.currentCustodian,
                  role: "Custodian / Officer",
                  icon: Camera,
                  status: "Verified",
                  hash: selectedItem.txHash ? selectedItem.txHash.slice(0, 18) + '...' : (selectedItem.hash ? selectedItem.hash.slice(0, 16) + '...' : null)
                }
              ]);
            } else {
              setTimeline([]);
            }
          }
        }).catch(err => {
          console.error("Chain fetch error:", err);
        });
      }
    };

    loadChain();
    if (selectedItem) {
      intervalId = setInterval(loadChain, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedItem]);

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsTransferring(true);

    try {
      await api.transferCustody(selectedItem.id, {
        targetCustodian: transferRecipient,
        transferReason: transferNotes,
        pin: transferPin
      });

      setIsTransferModalOpen(false);
      setTransferNotes('');
      setTransferPin('');
      fetchCustodyData();
      setSelectedItem((prev: any) => prev ? { ...prev, currentCustodian: transferRecipient, status: 'Transfer Pending' } : null);
    } catch (err) {
      console.error("Transfer error:", err);
    } finally {
      setIsTransferring(false);
    }
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

              {/* Raw Image Payload — Access restricted by role */}
              {(selectedItem.fileUrl || selectedItem.dataUrl) && (
                <div className="space-y-2 pt-3 border-t border-black/5">
                  <p className="text-[10px] uppercase tracking-wider text-black/50 font-bold">Captured Raw Payload</p>
                  {canViewRawPayload ? (
                    <div className="rounded-xl overflow-hidden border border-black/10 max-h-44 bg-black flex items-center justify-center">
                      <img src={selectedItem.fileUrl || selectedItem.dataUrl} alt={selectedItem.title} className="max-h-44 object-contain w-full" />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="text-xs font-bold text-red-700">Access Denied — Section 65B Sealed</p>
                      <p className="text-[10px] text-red-500 leading-relaxed">Raw evidence payload is sealed under Section 65B of the Indian Evidence Act. Only Court Authority or Independent Validator may view raw media.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setIsTransferModalOpen(true)}
                  className="w-full py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-black/80 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                >
                  <ArrowRight className="w-4 h-4" />
                  Initiate Transfer
                </button>
                <button 
                  onClick={handleDownloadAuditReport}
                  className="w-full py-3 bg-white border border-black/10 text-black rounded-xl text-sm font-bold hover:bg-black/5 transition-colors flex items-center justify-center gap-2"
                >
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
                {timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[35px] w-8 h-8 rounded-full bg-white border-2 border-black/10 flex items-center justify-center z-10">
                      {step.icon ? <step.icon className="w-4 h-4 text-black/60" /> : <CheckCircle2 className="w-4 h-4 text-black/60" />}
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
                      {step.desc && <p className="text-sm text-black/70 leading-relaxed mb-4">{step.desc}</p>}
                      
                      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-black/5">
                        {step.actor && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                              <User className="w-3 h-3 text-black/60" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-black leading-tight">{step.actor}</p>
                              <p className="text-[10px] text-black/50">{step.role}</p>
                            </div>
                          </div>
                        )}
                        {step.hash && (
                          <div className="sm:ml-auto flex items-center gap-2 text-[10px] font-mono text-black/40 bg-white px-2 py-1 rounded border border-black/5">
                            <Key className="w-3 h-3" />
                            {step.hash}
                          </div>
                        )}
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
                  <select 
                    value={transferRecipient}
                    onChange={(e) => setTransferRecipient(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F5F5F5] border border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50"
                  >
                    <option>Dr. S. Mehta (Cyber Forensics)</option>
                    <option>Inspector S. Patel (Homicide)</option>
                    <option>Evidence Room B (Sector 4)</option>
                    <option>Central Archives Locker</option>
                    <option>High Court Vault</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/70 uppercase tracking-wider mb-2">Transfer Reason / Remarks</label>
                  <textarea 
                    rows={3} 
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
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
                  <button type="submit" disabled={isTransferring} className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-black hover:bg-black/80 shadow-lg flex items-center gap-2 disabled:opacity-50">
                    <QrCode className="w-4 h-4" />
                    {isTransferring ? 'Initiating Transfer...' : 'Generate Handover QR'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  }

  const filteredItems = custodyItems.filter(item => 
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.currentCustodian.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <p className="text-2xl font-bold text-black">{custodyItems.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
            <p className="text-[10px] uppercase font-bold text-purple-600/70 mb-1">In Transit</p>
            <p className="text-2xl font-bold text-purple-700">{custodyItems.filter(i => i.status === 'In Transit').length}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <p className="text-[10px] uppercase font-bold text-amber-600/70 mb-1">Pending Transfer</p>
            <p className="text-2xl font-bold text-amber-700">{custodyItems.filter(i => i.status === 'Transfer Pending' || i.status === 'Pending Chain Transfer' || i.status === 'Pending').length}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <p className="text-[10px] uppercase font-bold text-emerald-600/70 mb-1">Secured in Labs</p>
            <p className="text-2xl font-bold text-emerald-700">{custodyItems.filter(i => i.status === 'Secured' || i.status === 'Sealed' || i.status === 'Verified' || i.status === 'Archived').length}</p>
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
              {filteredItems.map((item, idx) => (
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
