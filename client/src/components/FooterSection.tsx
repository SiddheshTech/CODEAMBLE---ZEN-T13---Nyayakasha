import { ShieldCheck, Fingerprint, LockKeyhole } from 'lucide-react';
import { LogoIcon } from './LogoIcon';

export function FooterSection({ onOpenWhitepaper, onNavigate }: { onOpenWhitepaper?: () => void, onNavigate?: (page: string) => void }) {
  return (
    <footer className="bg-[#0A0A0A] text-white pt-16 md:pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-white/10 pb-16 mb-12">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <LockKeyhole className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-medium tracking-tight mb-1" style={{ letterSpacing: '-0.02em' }}>
              Ready for the Future
            </h3>
            <p className="text-white/60 text-base leading-relaxed max-w-md">
              Secured by the most advanced math, ensuring court records, evidence, and citizen data stay completely safe from future supercomputer attacks.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Fingerprint className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-medium tracking-tight mb-1" style={{ letterSpacing: '-0.02em' }}>
              Total Privacy Maintained
            </h3>
            <p className="text-white/60 text-base leading-relaxed max-w-md">
              Built using advanced math to guarantee complete privacy. Sensitive data and witness identities are checked securely without ever being opened or shown.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/10 pb-12 mb-8">
          <div>
            <h3 className="text-3xl font-medium tracking-tight mb-4 text-white">Review the technical architecture</h3>
            <p className="text-white/60 text-lg max-w-lg mb-6">
              A comprehensive breakdown of our post-quantum security measures, zero-knowledge proofs, and sovereign deployment model.
            </p>
            <button 
              onClick={onOpenWhitepaper}
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors"
            >
              Read Technical Whitepaper
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-3">
            <LogoIcon className="w-6 h-6 text-white" />
            <span className="text-xl font-medium tracking-tight">Nyayakasha</span>
          </div>
          
          <div className="flex flex-wrap gap-8 text-sm font-medium text-white/60 items-center">
            <button onClick={onOpenWhitepaper} className="hover:text-white transition-colors duration-200 cursor-pointer">Whitepaper</button>
            <button onClick={() => onNavigate?.('security')} className="hover:text-white transition-colors duration-200 cursor-pointer">Security</button>
            <button onClick={() => onNavigate?.('infrastructure')} className="hover:text-white transition-colors duration-200 cursor-pointer">Infrastructure</button>
            <button onClick={() => onNavigate?.('evidence')} className="hover:text-white transition-colors duration-200 cursor-pointer">Evidence</button>
            <button onClick={() => onNavigate?.('contact')} className="hover:text-white transition-colors duration-200 cursor-pointer">Contact</button>
            <button onClick={() => onNavigate?.('invite')} className="hover:text-white transition-colors duration-200 text-yellow-500/80 hover:text-yellow-400 cursor-pointer">Demo Invite Link</button>
          </div>
        </div>
        
        <div className="mt-8 text-white/40 text-sm">
          &copy; {new Date().getFullYear()} Nyayakasha Infrastructure. The Ledger That Cannot Lie.
        </div>
      </div>
    </footer>
  );
}
