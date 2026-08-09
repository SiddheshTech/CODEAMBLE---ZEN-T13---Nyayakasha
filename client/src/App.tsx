import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DocumentFlowSection } from './components/DocumentFlowSection';
import { ClaimsSection } from './components/ClaimsSection';
import { LayersSection } from './components/LayersSection';
import { NetworkStatusSection } from './components/NetworkStatusSection';
import { BackedBySection } from './components/BackedBySection';
import { UseCasesSection } from './components/UseCasesSection';
import { FooterSection } from './components/FooterSection';
import { ContactPage } from './components/ContactPage';
import { InfrastructurePage } from './components/InfrastructurePage';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FAQSection } from './components/FAQSection';
import { WhitepaperModal } from './components/WhitepaperModal';
import { EvidencePage } from './components/EvidencePage';
import { SecurityPage } from './components/SecurityPage';
import { AuthPage } from './components/AuthPage';
import { InviteSignupPage } from './components/InviteSignupPage';
import { DashboardPage } from './components/DashboardPage';
import { CNNPage } from './components/CNNPage';
import { HigherAuthorityAuthPage } from './components/HigherAuthorityAuthPage';
import { HigherAuthorityDashboard } from './components/HigherAuthorityDashboard';

const VALID_PAGES = ['home', 'contact', 'infrastructure', 'evidence', 'security', 'auth', 'invite', 'dashboard', 'cnn', 'higher-authority-auth', 'higher-authority', 'invite-locked'];

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    let hash = window.location.hash.replace('#', '');
    if (hash.includes('?')) hash = hash.split('?')[0];
    if (hash && VALID_PAGES.includes(hash)) {
      return window.location.hash.replace('#', ''); // keep full string for routing props
    }
    const savedPage = localStorage.getItem('nyayakasha_current_page');
    const isLoggedIn = localStorage.getItem('nyayakasha_is_logged_in') === 'true';
    if (savedPage && VALID_PAGES.includes(savedPage)) {
      if (savedPage === 'dashboard' && !isLoggedIn) {
        return 'auth';
      }
      return savedPage;
    }
    if (isLoggedIn) {
      return 'dashboard';
    }
    return 'home';
  });

  const [isWhitepaperOpen, setIsWhitepaperOpen] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    localStorage.setItem('nyayakasha_current_page', page);
    window.location.hash = page;
  };

  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash.replace('#', '');
      let baseHash = hash;
      if (hash.includes('?')) baseHash = hash.split('?')[0];
      
      if (baseHash && VALID_PAGES.includes(baseHash)) {
        setCurrentPage(hash);
        localStorage.setItem('nyayakasha_current_page', baseHash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="flex flex-col bg-[#F5F5F5] min-h-screen overflow-x-hidden">
      <WhitepaperModal 
        isOpen={isWhitepaperOpen} 
        onClose={() => setIsWhitepaperOpen(false)} 
      />
      {currentPage === 'home' ? (
        <>
          <div className="relative h-screen flex flex-col overflow-hidden">
            <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
            <HeroSection onOpenWhitepaper={() => setIsWhitepaperOpen(true)} />
          </div>
          <DocumentFlowSection />
          <ClaimsSection />
          <LayersSection />
          <NetworkStatusSection />
          <UseCasesSection />
          <TestimonialsSection />
          <FAQSection />
          <BackedBySection />
        </>
      ) : currentPage === 'contact' ? (
        <>
          <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
          <ContactPage />
        </>
      ) : currentPage === 'infrastructure' ? (
        <>
          <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
          <InfrastructurePage />
        </>
      ) : currentPage === 'evidence' ? (
        <>
          <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
          <EvidencePage />
        </>
      ) : currentPage === 'security' ? (
        <>
          <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
          <SecurityPage onNavigate={handleNavigate} />
        </>
      ) : currentPage === 'auth' ? (
        <AuthPage onNavigate={handleNavigate} />
      ) : currentPage === 'invite' ? (
        <InviteSignupPage onNavigate={handleNavigate} />
      ) : currentPage === 'dashboard' ? (
        <DashboardPage onNavigate={handleNavigate} />
      ) : currentPage === 'higher-authority-auth' ? (
        <HigherAuthorityAuthPage onNavigate={handleNavigate} />
      ) : currentPage === 'higher-authority' ? (
        <HigherAuthorityDashboard onNavigate={handleNavigate} />
      ) : currentPage.startsWith('invite-locked') ? (
        <InviteSignupPage onNavigate={handleNavigate} isLocked={true} />
      ) : currentPage === 'cnn' ? (
        <>
          <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
          <CNNPage />
        </>
      ) : null}
      {currentPage !== 'auth' && !currentPage.startsWith('invite') && currentPage !== 'dashboard' && !currentPage.startsWith('higher-authority') && (
        <FooterSection 
          onOpenWhitepaper={() => setIsWhitepaperOpen(true)} 
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
