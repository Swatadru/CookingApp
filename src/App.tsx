import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Fab } from './components/Fab';
import { IntroSplash } from './components/IntroSplash';
import { Home } from './pages/Home';
import { RecipeLibrary } from './pages/RecipeLibrary';
import { InnovationLab } from './pages/InnovationLab';
import { KitchenDashboard } from './pages/KitchenDashboard';
import { CookWithAI } from './pages/CookWithAI';
import { GenerateRecipe } from './pages/GenerateRecipe';
import { Profile } from './pages/Profile';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('intro_seen');
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('intro_seen', 'true');
    setShowIntro(false);
  }, []);

  // Scroll-driven reveal observer
  useEffect(() => {
    const revealClasses = [
      'reveal-up', 'reveal-left', 'reveal-right',
      'reveal-scale', 'reveal-rotate', 'stagger-children',
      'fade-in-section'
    ];

    const selector = revealClasses.map(c => `.${c}:not(.revealed):not(.visible)`).join(', ');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.classList.contains('fade-in-section')) {
              el.classList.add('visible');
            } else {
              el.classList.add('revealed');
            }
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );

    const observeAll = () => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => observer.observe(el));
      } catch { /* ignore if selector is empty */ }
    };

    observeAll();

    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(observeAll);
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [showIntro]);

  return (
    <>
      {showIntro && <IntroSplash onComplete={handleIntroComplete} />}
      <div className={`bg-surface text-on-surface font-body-md text-body-md overflow-x-hidden relative min-h-screen ${showIntro ? 'opacity-0' : 'opacity-100'}`}
           style={{ transition: 'opacity 0.5s ease 0.3s' }}>
        <Navigation />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate" element={<GenerateRecipe />} />
            <Route path="/library" element={<RecipeLibrary />} />
            <Route path="/lab" element={<InnovationLab />} />
            <Route path="/kitchen" element={<KitchenDashboard />} />
            <Route path="/cook-with-ai" element={<CookWithAI />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        {/* Sidebar Backdrop */}
        <div
          className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
        <Footer />
        <Fab toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
      </div>
    </>
  );
}

export default App;
