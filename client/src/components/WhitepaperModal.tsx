import { X, FileText, Download, ShieldCheck, Cpu, Database, EyeOff } from 'lucide-react';

export function WhitepaperModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 transition-opacity">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all">
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-black/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
              <FileText className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-medium tracking-tight text-black">Nyayakasha Protocol Overview</h2>
              <p className="text-sm font-medium text-black/50 uppercase tracking-widest mt-0.5">Executive Summary</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-black/70" />
          </button>
        </div>

        <div className="p-6 md:p-10 overflow-y-auto">
          <div className="prose prose-lg max-w-none text-black/80">
            <h3 className="text-3xl font-medium text-black mb-6 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Securing the Foundations of Justice
            </h3>
            
            <p className="text-lg leading-relaxed mb-10 text-black/70">
              The Nyayakasha protocol is a decentralized, post-quantum cryptographic ledger designed strictly for the judicial and law enforcement sectors. It provides an immutable, zero-trust infrastructure to ensure evidence, testimonies, and judgments cannot be fabricated, coerced, or silently altered.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-[#F5F5F5] rounded-2xl p-6 border border-black/5">
                <ShieldCheck className="w-6 h-6 text-black mb-4" />
                <h4 className="text-lg font-medium text-black mb-2">Post-Quantum Resilience</h4>
                <p className="text-base text-black/70 leading-relaxed">
                  Secured by lattice-based cryptographic algorithms (Kyber/Dilithium), ensuring the integrity of the evidence chain against both classical brute-force and future quantum decryption vectors.
                </p>
              </div>

              <div className="bg-[#F5F5F5] rounded-2xl p-6 border border-black/5">
                <EyeOff className="w-6 h-6 text-black mb-4" />
                <h4 className="text-lg font-medium text-black mb-2">Zero-Knowledge Proofs</h4>
                <p className="text-base text-black/70 leading-relaxed">
                  Utilizes zk-SNARKs to allow mathematical verification of sensitive claims (such as witness presence or document authenticity) without ever exposing the underlying identities or raw data.
                </p>
              </div>

              <div className="bg-[#F5F5F5] rounded-2xl p-6 border border-black/5">
                <Database className="w-6 h-6 text-black mb-4" />
                <h4 className="text-lg font-medium text-black mb-2">Data Sovereignty</h4>
                <p className="text-base text-black/70 leading-relaxed">
                  Architected to respect stringent state compliance. Nyayakasha acts as a hash-anchoring layer running in parallel with existing databases, never storing the raw sovereign data itself.
                </p>
              </div>

              <div className="bg-[#F5F5F5] rounded-2xl p-6 border border-black/5">
                <Cpu className="w-6 h-6 text-black mb-4" />
                <h4 className="text-lg font-medium text-black mb-2">AI-Driven Forensics</h4>
                <p className="text-base text-black/70 leading-relaxed">
                  Integrated homomorphic encryption allows AI to analyze patterns and detect systemic anomalies directly on encrypted data without ever decrypting citizen records.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-[#F5F5F5] border-t border-black/5 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-black/60">
            For technical stakeholders and judicial architects.
          </p>
          <a 
            href="https://drive.google.com/file/d/16C5TkgOz86BCctnn-ciqD8YqEb0VDm3K/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm w-full sm:w-auto justify-center"
          >
            <Download className="w-4 h-4" />
            Download Full Whitepaper
          </a>
        </div>
      </div>
    </div>
  );
}
