import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navLinks } from '../data/mockData';

export const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out ${
        scrolled
          ? 'py-2 bg-surface/95 shadow-lg backdrop-blur-xl border-b border-outline-variant/20'
          : 'py-5 bg-transparent backdrop-blur-sm border-b border-white/10'
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-margin-desktop max-w-container-max mx-auto w-full gap-4">
        {/* Left Side */}
        <div className="flex-shrink-0">
          <Link to="/" className="font-display-lg text-headline-md md:text-headline-lg text-primary tracking-tight hover:text-secondary transition-colors duration-300 z-10 whitespace-nowrap">
            Omniscient Sous-Chef
          </Link>
        </div>

        {/* Center */}
        <div className="hidden lg:flex flex-1 justify-center items-center gap-4 xl:gap-8">
          {navLinks.map((link, idx) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={idx}
                to={link.href}
                className={`font-body-sm xl:font-body-md whitespace-nowrap relative transition-colors duration-300 py-1 ${
                  isActive
                    ? 'text-secondary'
                    : 'text-on-surface-variant hover:text-secondary'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full" 
                        style={{ animation: 'shimmer 2s ease-in-out infinite', backgroundSize: '200% auto', backgroundImage: 'linear-gradient(90deg, #944925, #fe9e72, #944925)' }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex-shrink-0 flex justify-end items-center gap-4 z-10">
          <Link to="/cook-with-ai"
            className="hidden lg:flex items-center gap-2 bg-primary-container text-on-tertiary px-5 xl:px-6 py-2 xl:py-2.5 rounded-full font-label-sm hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg shimmer-btn whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">bolt</span>
            Cook with AI
          </Link>
          <Link to="/profile" className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors">
            <span className="material-symbols-outlined cursor-pointer">
              account_circle
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
