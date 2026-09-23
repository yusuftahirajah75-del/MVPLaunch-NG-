import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/landing/Navbar';
import HeroSection from './components/landing/HeroSection';
import ProblemSection from './components/landing/ProblemSection';
import BeforeAfterSection from './components/landing/BeforeAfterSection';
import WorkflowSection from './components/landing/WorkflowSection';
import PackagesSection from './components/landing/PackagesSection';
import WorkspacePreview from './components/landing/WorkspacePreview';
import WhyUsSection from './components/landing/WhyUsSection';
import ReviewsSection from './components/landing/ReviewsSection';
import FaqSection from './components/landing/FaqSection';
import CtaBanner from './components/landing/CtaBanner';
import Footer from './components/landing/Footer';
import AuthModal from './components/modals/AuthModal';
import SubmitIdeaModal from './components/modals/SubmitIdeaModal';
import ClientPortal from './components/portal/ClientPortal';
import DeveloperPortal from './components/portal/DeveloperPortal';
import AdminPortal from './components/portal/AdminPortal';

export default function App() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'client' | 'developer' | 'admin'

  // When a user logs in, automatically navigate to their portal
  useEffect(() => {
    if (user && user.role) {
      const targetView = user.role.toLowerCase();
      setCurrentView(targetView);
      window.location.hash = targetView;
    } else if (!user && currentView !== 'landing') {
      setCurrentView('landing');
      window.location.hash = '';
    }
  }, [user]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (['client', 'developer', 'admin'].includes(hash)) {
      setCurrentView(hash);
    }
  }, []);

  const navigateToPortal = (role) => {
    setCurrentView(role.toLowerCase());
    window.location.hash = role.toLowerCase();
  };

  const navigateToLanding = () => {
    setCurrentView('landing');
    window.location.hash = '';
  };

  // Render Portals if user navigates to them
  if (currentView === 'client') {
    return (
      <>
        <ClientPortal onBackToLanding={navigateToLanding} />
        <SubmitIdeaModal onIdeaSubmitted={() => {}} />
      </>
    );
  }

  if (currentView === 'developer') {
    return <DeveloperPortal onBackToLanding={navigateToLanding} />;
  }

  if (currentView === 'admin') {
    return <AdminPortal onBackToLanding={navigateToLanding} />;
  }

  // Default: Public Landing Page
  return (
    <div style={{ position: 'relative' }}>
      <Navbar onNavigatePortal={navigateToPortal} />
      <HeroSection />
      <ProblemSection />
      <BeforeAfterSection />
      <WorkflowSection />
      <PackagesSection />
      <WorkspacePreview />
      <WhyUsSection />
      <ReviewsSection />
      <FaqSection />
      <CtaBanner />
      <Footer />

      {/* Global Modals */}
      <AuthModal />
      <SubmitIdeaModal onIdeaSubmitted={() => navigateToPortal('client')} />
    </div>
  );
}
