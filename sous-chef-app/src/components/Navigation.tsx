import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navLinks } from '../data/mockData';
import { useUser } from '../context/UserContext';

export const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { activeUser } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav
        id="main-nav"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out ${
          scrolled
            ? 'py-2 bg-surface/95 shadow-lg backdrop-blur-xl border-b border-outline-variant/20'
            : 'py-3 md:py-5 bg-transparent backdrop-blur-sm border-b border-white/10'
        }`}
      >
        <div className="flex items-center justify-between px-4 md:px-6 lg:px-margin-desktop max-w-container-max mx-auto w-full gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight hover:text-secondary transition-colors duration-300 z-10 whitespace-nowrap"
          >
            Sous-Chef <span className="text-secondary italic">AI</span>
          </Link>

          {/* Center — Desktop links */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-8">
            {navLinks.map((link, idx) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={idx}
                  to={link.href}
                  className={`font-body-md whitespace-nowrap relative transition-colors duration-300 py-1 ${
                    isActive
                      ? 'text-secondary font-semibold'
                      : 'text-on-surface-variant hover:text-secondary'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full"
                      style={{
                        animation: 'shimmer 2s ease-in-out infinite',
                        backgroundSize: '200% auto',
                        backgroundImage:
                          'linear-gradient(90deg, #944925, #fe9e72, #944925)',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right — AI Chatbot CTA + User Avatar + mobile menu */}
          <div className="flex items-center gap-3 z-10">
            {/* User Profile Avatar shortcut */}
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1.5 rounded-full bg-surface-container/60 hover:bg-secondary/10 border border-outline-variant/20 transition-all text-xs font-label-sm text-primary"
              title={`Active Profile: ${activeUser.name}`}
            >
              <div className="w-7 h-7 rounded-full bg-secondary text-surface flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-sm">{activeUser.avatar}</span>
              </div>
              <span className="hidden xl:inline font-bold pr-1">{activeUser.name}</span>
            </Link>

            {/* AI Chatbot CTA (Replaces old Generate CTA) */}
            <Link
              to="/chat"
              className="hidden md:flex items-center gap-2 bg-primary text-surface px-5 py-2.5 rounded-full font-label-sm hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg shimmer-btn whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base text-secondary">smart_toy</span>
              AI Chatbot
            </Link>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-surface-container/50 backdrop-blur-md border border-outline-variant/20 hover:bg-surface-container transition-colors relative z-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <span
                className={`block w-5 h-0.5 bg-primary rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? 'rotate-45 translate-y-[3px]' : ''
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-primary rounded-full transition-all duration-300 mt-1 ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-primary rounded-full transition-all duration-300 mt-1 ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-[5px]' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
          mobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-primary/60 backdrop-blur-md transition-opacity duration-400 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-sm bg-surface/98 backdrop-blur-2xl shadow-2xl transition-transform duration-500 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full pt-24 pb-8 px-6">
            <div className="flex-1 flex flex-col gap-1">
              {navLinks.map((link, idx) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={idx}
                    to={link.href}
                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-body-md transition-all duration-300 ${
                      isActive
                        ? 'bg-secondary/10 text-secondary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                    }`}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-6 border-t border-outline-variant/20">
              <Link
                to="/chat"
                className="flex items-center justify-center gap-2 bg-primary text-surface px-6 py-4 rounded-2xl font-label-sm text-base shadow-md shimmer-btn w-full"
              >
                <span className="material-symbols-outlined text-base text-secondary">smart_toy</span>
                AI Chatbot
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
