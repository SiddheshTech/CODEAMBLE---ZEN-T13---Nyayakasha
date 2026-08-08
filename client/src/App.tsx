import { useState } from 'react';
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

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isWhitepaperOpen, setIsWhitepaperOpen] = useState(false);

  return (
    <div className="flex flex-col bg-[#F5F5F5] min-h-screen overflow-x-hidden">
      <WhitepaperModal 
        isOpen={isWhitepaperOpen} 
        onClose={() => setIsWhitepaperOpen(false)} 
      />
      {currentPage === 'home' ? (
        <>
          <div className="relative h-screen flex flex-col overflow-hidden">
            <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
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
          <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
          <ContactPage />
        </>
      ) : currentPage === 'infrastructure' ? (
        <>
          <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
          <InfrastructurePage />
        </>
      ) : currentPage === 'evidence' ? (
        <>
          <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
          <EvidencePage />
        </>
      ) : currentPage === 'security' ? (
        <>
          <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
          <SecurityPage onNavigate={setCurrentPage} />
        </>
      ) : currentPage === 'auth' ? (
        <AuthPage onNavigate={setCurrentPage} />
      ) : currentPage === 'invite' ? (
        <InviteSignupPage onNavigate={setCurrentPage} />
      ) : currentPage === 'dashboard' ? (
        <DashboardPage onNavigate={setCurrentPage} />
      ) : null}
      {currentPage !== 'auth' && currentPage !== 'invite' && currentPage !== 'dashboard' && (
        <FooterSection 
          onOpenWhitepaper={() => setIsWhitepaperOpen(true)} 
          onNavigate={setCurrentPage}
        />
      )}
    </div>
  );
}
