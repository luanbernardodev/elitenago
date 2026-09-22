import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { ScrollyCanvas } from './components/ScrollyCanvas';
import { Navbar } from './components/Navbar';
import { HeroOverlay } from './components/HeroOverlay';
import { MestresSection } from './components/MestresSection';
import { NewsSection } from './components/NewsSection';
import { NewsPage } from './components/NewsPage';
import { PlaylistPage } from './components/PlaylistPage';
import { MediaSection } from './components/MediaSection';
import { MediaPage } from './components/MediaPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PartnersSection } from './components/PartnersSection';
import { SoundboardSection } from './components/SoundboardSection';
import { AcademySection } from './components/AcademySection';
import { ContactFooter } from './components/ContactFooter';
import { ScrollTopButton } from './components/ScrollTopButton';
import { trackSiteVisit } from './lib/visitorTracker';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'noticias' | 'playlist' | 'midias' | 'admin'>('home');
  const [isLoaded, setIsLoaded] = useState(false);

  // Automatically track site visit with geolocation on mount (runs once in background)
  useEffect(() => {
    trackSiteVisit();
  }, []);

  // Check URL params / hash on mount and on popstate
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const isNewsParam = params.get('view') === 'noticias';
      const isNewsHash = window.location.hash === '#/noticias';
      const isPlaylistParam = params.get('view') === 'playlist';
      const isPlaylistHash = window.location.hash === '#/playlist';
      const isMediaParam = params.get('view') === 'midias';
      const isMediaHash = window.location.hash === '#/midias';
      const isAdminParam = params.get('view') === 'admin' || params.get('view') === 'dashboard';
      const isAdminHash = window.location.hash === '#/admin' || window.location.hash === '#/dashboard';

      if (isAdminParam || isAdminHash) {
        setCurrentView('admin');
        window.scrollTo(0, 0);
      } else if (isNewsParam || isNewsHash) {
        setCurrentView('noticias');
        window.scrollTo(0, 0);
      } else if (isPlaylistParam || isPlaylistHash) {
        setCurrentView('playlist');
        window.scrollTo(0, 0);
      } else if (isMediaParam || isMediaHash) {
        setCurrentView('midias');
        window.scrollTo(0, 0);
      } else {
        setCurrentView('home');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    // Discreet shortcut Ctrl+Shift+A for Admin Access
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.history.pushState({}, '', '?view=admin');
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Initialize Lenis Smooth Scrolling Engine (only for home page canvas scrollytelling)
  useEffect(() => {
    if (currentView !== 'home') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [currentView]);

  const navigateToNews = () => {
    window.history.pushState({}, '', '?view=noticias');
    setCurrentView('noticias');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPlaylist = () => {
    window.history.pushState({}, '', '?view=playlist');
    setCurrentView('playlist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToMedia = () => {
    window.history.pushState({}, '', '?view=midias');
    setCurrentView('midias');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', window.location.pathname);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin Dashboard View, render standalone AdminDashboard component
  if (currentView === 'admin') {
    return <AdminDashboard onBackToHome={navigateToHome} />;
  }

  // If in News Page View, render standalone NewsPage component
  if (currentView === 'noticias') {
    return <NewsPage onBackToHome={navigateToHome} />;
  }

  // If in Playlist Page View, render standalone PlaylistPage component
  if (currentView === 'playlist') {
    return <PlaylistPage onBackToHome={navigateToHome} />;
  }

  // If in Media Page View, render standalone MediaPage component
  if (currentView === 'midias') {
    return <MediaPage onBackToHome={navigateToHome} />;
  }

  return (
    <div className="relative min-h-[950vh] bg-[#050505] text-amber-50 selection:bg-amber-500 selection:text-black">
      {/* Background Fullscreen Canvas Scrollytelling Engine */}
      <ScrollyCanvas onLoadComplete={() => setIsLoaded(true)} />

      {/* Floating UI Elements */}
      <Navbar visible={isLoaded} />
      <ScrollTopButton />

      {/* Overlay Content Layers over 950vh Scroll Container */}
      <div className="relative z-10">
        <HeroOverlay />

        {/* Content Sections Wrapper */}
        <div className="space-y-32 py-20 bg-gradient-to-b from-transparent via-black/80 to-[#050505]">
          <MestresSection />
          <NewsSection onOpenNewsPage={navigateToNews} />
          <MediaSection onOpenMediaPage={navigateToMedia} />
          <SoundboardSection onOpenPlaylistPage={navigateToPlaylist} />
          <PartnersSection />

          {/* Extended Cabaça Pitch-Black Entrance Buffer */}
          <div className="h-[340vh] md:h-[420vh] lg:h-[480vh] pointer-events-none" />

          <AcademySection />
          <ContactFooter />
        </div>
      </div>
    </div>
  );
}

export default App;
