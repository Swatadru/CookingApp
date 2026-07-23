import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const TiltCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px)';
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.2s ease-out, box-shadow 0.3s ease' }}
    >
      {children}
    </div>
  );
};

export const FeatureGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-gutter stagger-children">
        {/* AI Analysis */}
        <TiltCard className="md:col-span-2 glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] flex flex-col justify-between hover:shadow-xl transition-shadow duration-500 cursor-pointer">
          <div>
            <div className="w-14 h-14 bg-tertiary-fixed rounded-2xl flex items-center justify-center mb-4 md:mb-6">
              <span className="material-symbols-outlined text-primary">camera</span>
            </div>
            <h3 className="font-display-lg text-headline-lg text-primary mb-3 md:mb-4">Vision AI Prep</h3>
            <p className="text-on-surface-variant max-w-md">
              Point your camera at your ingredients. Our AI identifies every item and suggests optimal cutting techniques and recipe pairings instantly.
            </p>
          </div>
          <div className="mt-6 md:mt-8 flex gap-2">
            <div className="h-2 w-12 bg-primary rounded-full"></div>
            <div className="h-2 w-4 bg-outline-variant rounded-full"></div>
            <div className="h-2 w-4 bg-outline-variant rounded-full"></div>
          </div>
        </TiltCard>

        {/* Allergen Swapper */}
        <TiltCard className="bg-primary-container p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] text-surface flex flex-col justify-center items-center text-center group cursor-pointer">
          <div className="w-16 md:w-20 h-16 md:h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-secondary text-3xl md:text-4xl">swap_horiz</span>
          </div>
          <h3 className="font-display-lg text-headline-lg mb-3 md:mb-4">Allergen Swapper</h3>
          <p className="opacity-80 font-body-md mb-6 md:mb-8">
            One click to reinvent any recipe for dairy-free, gluten-free, or vegan lifestyles without losing the soul of the dish.
          </p>
          <button onClick={() => navigate('/library')} className="font-label-sm border-b border-surface/30 pb-1 hover:border-surface transition-all">
            Try it now
          </button>
        </TiltCard>

        {/* Culinary Physics */}
        <TiltCard className="bg-surface-container-highest p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-start cursor-pointer">
          <span className="font-label-sm text-secondary font-bold mb-3 md:mb-4">NEW MODULE</span>
          <h3 className="font-display-lg text-headline-lg text-primary mb-3 md:mb-4">Culinary Physics</h3>
          <p className="text-on-surface-variant font-body-md">
            Master the science of emulsification and Maillard reactions with real-time temperature guides.
          </p>
          <div className="mt-auto pt-6 md:pt-8 w-full">
            <div className="bg-white/40 h-32 rounded-xl border border-white/20 flex items-end p-4 gap-2">
              <div className="bg-secondary w-full rounded-t-sm transition-all duration-1000" style={{ height: '40%' }}></div>
              <div className="bg-secondary w-full rounded-t-sm transition-all duration-1000" style={{ height: '70%' }}></div>
              <div className="bg-secondary w-full rounded-t-sm transition-all duration-1000" style={{ height: '55%' }}></div>
              <div className="bg-secondary w-full rounded-t-sm transition-all duration-1000" style={{ height: '90%' }}></div>
            </div>
          </div>
        </TiltCard>

        {/* Digital Cookbook */}
        <TiltCard className="md:col-span-2 relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-lg min-h-[240px] md:min-h-[280px] cursor-pointer">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDr52QhRSrp7UQQxla8K4QbmN6_Vq_uBGTwT7FYrAz3HjwkvP_VN9e7OWiu9xjnHC_0LrVHTfJVhfVQV_5-wCxaJvO4v4iIvGuIDsNitLADbD-SxgGFRnc5RZUyJj3Lhy1ypJ7TsZxYukl5qjgO9u9w7m6JLsV8MPKiY1FG0ty1Ttvvtg6-jTparRHHsxhU5skI7nRcJhr1kSMFPnMFoiBSY6bQRdjdj-XG0zHutilS9WXfIYLuiUGbW5j9YpV6j-asVFFLHHNNUSBg" 
            alt="Cookbook Preview" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-secondary/40 backdrop-blur-[2px]"></div>
          <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-end text-surface">
            <h3 className="font-display-lg text-[32px] leading-[40px] md:text-display-lg mb-3 md:mb-4">The Digital Library</h3>
            <p className="max-w-md opacity-90 mb-4 md:mb-6">
              Access 10,000+ curated recipes and save your own AI creations in a stunning visual journal.
            </p>
            <button className="bg-surface text-primary w-fit px-6 md:px-8 py-3 rounded-full font-label-sm hover:scale-105 transition-all duration-300 shadow-md" onClick={() => navigate('/library')}>
              Browse Collection
            </button>
          </div>
        </TiltCard>
      </div>
    </section>
  );
};
