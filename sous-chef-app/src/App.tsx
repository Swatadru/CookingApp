import { useEffect, useCallback, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { IntroSplash } from './components/IntroSplash';
import { Home } from './pages/Home';
import { CookWithAI } from './pages/CookWithAI';
import { GenerateRecipe } from './pages/GenerateRecipe';
import { RecipeBook } from './pages/RecipeBook';
import { Profile } from './pages/Profile';

function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('intro_seen');
  });

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('intro_seen', 'true');
    setShowIntro(false);
  }, []);

  // Scroll-driven reveal observer
  useEffect(() => {
    const revealClasses = [
      'reveal-up', 'reveal-left', 'reveal-right',
      'reveal-scale', 'reveal-rotate', 'stagger-children',
      'fade-in-section',
    ];

    const selector = revealClasses
      .map((c) => `.${c}:not(.revealed):not(.visible)`)
      .join(', ');

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
      } catch {
        /* ignore if selector is empty */
      }
    };

    observeAll();

    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(observeAll);
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [showIntro]);

  return (
    <UserProvider>
      {showIntro && <IntroSplash onComplete={handleIntroComplete} />}
      <div
        className={`bg-surface text-on-surface font-body-md text-body-md overflow-x-hidden relative min-h-screen ${
          showIntro ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ transition: 'opacity 0.5s ease 0.3s' }}
      >
        <Navigation />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<CookWithAI />} />
            <Route path="/generate" element={<GenerateRecipe />} />
            <Route path="/recipe-book" element={<RecipeBook />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </UserProvider>
  );
}

export default App;
