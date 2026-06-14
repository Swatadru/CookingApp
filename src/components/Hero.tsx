import { useRef, useCallback } from 'react';
import { heroContent } from '../data/mockData';

export const Hero = () => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
      {/* Floating 3D Background Icons */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[18%] right-[8%] float-3d" style={{ animationDelay: '0s', animationDuration: '10s' }}>
          <span className="material-symbols-outlined text-secondary opacity-15 text-[120px]">
            restaurant
          </span>
        </div>
        <div className="absolute bottom-[12%] left-[3%] float-3d" style={{ animationDelay: '3s', animationDuration: '12s' }}>
          <span className="material-symbols-outlined text-on-secondary-container opacity-15 text-[80px]">
            skillet
          </span>
        </div>
        <div className="absolute top-[35%] left-[12%] float-3d" style={{ animationDelay: '1.5s', animationDuration: '9s' }}>
          <span className="material-symbols-outlined text-tertiary opacity-8 text-[60px]">
            egg_alt
          </span>
        </div>
        <div className="absolute top-[60%] right-[20%] float-3d" style={{ animationDelay: '2s', animationDuration: '11s' }}>
          <span className="material-symbols-outlined text-secondary opacity-8 text-[50px]">
            local_fire_department
          </span>
        </div>
      </div>
      
      <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Text Content */}
        <div className="space-y-8">
          <h1 className="font-display-lg text-display-lg text-primary leading-tight reveal-up">
            {heroContent.titleStart} <span className="italic text-secondary">{heroContent.titleHighlight}</span>
          </h1>
          <p className="text-on-surface-variant max-w-lg font-body-md reveal-up" style={{ '--delay': '150ms' } as React.CSSProperties}>
            {heroContent.description}
          </p>
          <div className="flex flex-wrap gap-4 pt-4 reveal-up" style={{ '--delay': '300ms' } as React.CSSProperties}>
            <button className="bg-primary text-surface px-8 py-4 rounded-full font-label-sm shadow-[0_10px_30px_rgba(61,43,31,0.2)] hover:scale-105 hover:shadow-[0_16px_40px_rgba(61,43,31,0.3)] transition-all duration-300 shimmer-btn"
                    onClick={() => window.location.href='/generate'}>
              {heroContent.buttons[0].label}
            </button>
            <button className="border border-primary text-primary px-8 py-4 rounded-full font-label-sm backdrop-blur-sm hover:bg-primary/5 hover:scale-105 transition-all duration-300"
                    onClick={() => window.location.href='/library'}>
              {heroContent.buttons[1].label}
            </button>
          </div>
        </div>
        
        {/* 3D Tilt Image Card */}
        <div className="relative reveal-scale" style={{ '--delay': '200ms' } as React.CSSProperties}>
          <div
            ref={cardRef}
            className="glass-card rounded-[2rem] p-6 relative z-20 shadow-2xl border-white/40 cursor-pointer tilt-card"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transition: 'transform 0.2s ease-out' }}
          >
            <img 
              src={heroContent.image.src} 
              alt={heroContent.image.alt} 
              className="rounded-xl w-full h-[400px] object-cover shadow-inner" 
            />

          </div>
          <div className="absolute -top-16 -left-16 w-72 h-72 bg-secondary-container/15 rounded-full blur-3xl z-10 pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-tertiary-fixed/10 rounded-full blur-3xl z-10 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};
