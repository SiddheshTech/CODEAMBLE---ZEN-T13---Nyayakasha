import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LogoIcon } from './LogoIcon';

export function Navbar({ onNavigate, currentPage = 'home' }: { onNavigate?: (page: string) => void, currentPage?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navClass = (currentPage === 'contact' || currentPage === 'infrastructure' || currentPage === 'evidence' || currentPage === 'security') 
    ? "relative top-0 left-0 right-0 z-40 px-6 py-5 bg-[#F5F5F5]"
    : `absolute top-0 left-0 right-0 z-40 px-6 py-5 ${isMobileMenuOpen ? 'bg-[#F5F5F5]' : ''}`;

  const handleNavigate = (page: string) => {
    setIsMobileMenuOpen(false);
    onNavigate?.(page);
  };

  return (
    <>
      <nav className={navClass}>
        <div className="max-w-[88rem] mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer relative z-50"
            onClick={() => handleNavigate('home')}
          >
            <LogoIcon className="w-7 h-7 text-black" />
            <span className="text-2xl font-medium tracking-tight text-black">Nyayakasha</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-base text-gray-700 font-medium">
            <button 
              onClick={() => onNavigate?.('infrastructure')} 
              className={`hover:text-black transition-colors duration-200 cursor-pointer ${currentPage === 'infrastructure' ? 'text-black font-semibold' : ''}`}
            >
              Infrastructure
            </button>
            <button 
              onClick={() => onNavigate?.('security')} 
              className={`hover:text-black transition-colors duration-200 cursor-pointer ${currentPage === 'security' ? 'text-black font-semibold' : ''}`}
            >
              Security
            </button>
            <button 
              onClick={() => onNavigate?.('evidence')} 
              className={`hover:text-black transition-colors duration-200 cursor-pointer ${currentPage === 'evidence' ? 'text-black font-semibold' : ''}`}
            >
              Evidence
            </button>
            <button 
              onClick={() => onNavigate?.('contact')} 
              className={`hover:text-black transition-colors duration-200 cursor-pointer ${currentPage === 'contact' ? 'text-black font-semibold' : ''}`}
            >
              Contact
            </button>
          </div>

          <div className="flex items-center gap-4 relative z-50">
            <button 
              onClick={() => onNavigate?.('auth')}
              className="hidden md:block bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200"
            >
              Access System
            </button>

            <button 
              className="md:hidden p-2 -mr-2 text-black"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-[#F5F5F5] z-30 transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-24 px-6 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6 text-2xl font-medium text-black">
          <button onClick={() => handleNavigate('infrastructure')} className="text-left py-2 border-b border-black/10 hover:text-black/70">Infrastructure</button>
          <button onClick={() => handleNavigate('security')} className="text-left py-2 border-b border-black/10 hover:text-black/70">Security</button>
          <button onClick={() => handleNavigate('evidence')} className="text-left py-2 border-b border-black/10 hover:text-black/70">Evidence</button>
          <button onClick={() => handleNavigate('contact')} className="text-left py-2 border-b border-black/10 hover:text-black/70">Contact</button>
        </div>
        
        <div className="mt-auto pb-12">
          <button 
            onClick={() => handleNavigate('auth')}
            className="w-full bg-black text-white text-lg font-medium px-7 py-4 rounded-full hover:bg-gray-800 transition-colors duration-200 shadow-lg"
          >
            Access System
          </button>
        </div>
      </div>
    </>
  );
}
