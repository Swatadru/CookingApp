import React from 'react';
import { useNavigate } from 'react-router-dom';
import { features } from '../data/mockData';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* ════════════════════════════════════════════
          HERO SECTION
         ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        {/* Floating 3D Background Icons */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute top-[18%] right-[8%] float-3d hidden md:block"
            style={{ animationDelay: '0s', animationDuration: '10s' }}
          >
            <span className="material-symbols-outlined text-secondary opacity-[0.12] text-[120px]">
              restaurant
            </span>
          </div>
          <div
            className="absolute bottom-[15%] left-[4%] float-3d"
            style={{ animationDelay: '3s', animationDuration: '12s' }}
          >
            <span className="material-symbols-outlined text-on-secondary-container opacity-[0.12] text-[70px]">
              skillet
            </span>
          </div>
          <div
            className="absolute top-[40%] left-[14%] float-3d hidden sm:block"
            style={{ animationDelay: '1.5s', animationDuration: '9s' }}
          >
            <span className="material-symbols-outlined text-tertiary opacity-[0.08] text-[60px]">
              egg_alt
            </span>
          </div>
          <div
            className="absolute top-[60%] right-[18%] float-3d hidden sm:block"
            style={{ animationDelay: '2s', animationDuration: '11s' }}
          >
            <span className="material-symbols-outlined text-secondary opacity-[0.08] text-[50px]">
              local_fire_department
            </span>
          </div>
          {/* Gradient blobs */}
          <div className="absolute top-[10%] left-[30%] w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-tertiary/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 reveal-up">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-sm text-secondary uppercase tracking-widest text-xs">
              AI-Powered Culinary Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display-lg text-[40px] leading-[48px] md:text-[56px] md:leading-[64px] text-primary max-w-4xl mx-auto mb-6 reveal-up">
            Your Kitchen,{' '}
            <span className="italic text-secondary">Reimagined&nbsp;by&nbsp;AI</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-on-surface-variant max-w-2xl mx-auto font-body-md text-lg mb-12 reveal-up"
            style={{ '--delay': '150ms' } as React.CSSProperties}
          >
            Sous-Chef AI fuses generative recipe synthesis with USDA-grade
            nutritional tracking. From creative inspiration to precise dietary
            facts — every meal is a masterpiece backed by science.
          </p>

          {/* Dual CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-5 justify-center items-center reveal-up"
            style={{ '--delay': '300ms' } as React.CSSProperties}
          >
            <button
              id="cta-generate"
              onClick={() => navigate('/generate')}
              className="group relative bg-primary text-surface px-10 py-5 rounded-2xl font-label-sm text-base shadow-[0_12px_40px_rgba(61,43,31,0.25)] hover:shadow-[0_20px_60px_rgba(61,43,31,0.35)] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                Start Cooking
              </span>
            </button>
            <button
              id="cta-recipe-book"
              onClick={() => navigate('/recipe-book')}
              className="group glass-card px-10 py-5 rounded-2xl font-label-sm text-base text-primary border border-primary/20 hover:bg-primary/5 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">menu_book</span>
                Explore Saved Recipes
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <div className="relative h-20 -mt-1 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f5f5dc" />
        </svg>
      </div>

      {/* ════════════════════════════════════════════
          FEATURE GRID
         ════════════════════════════════════════════ */}
      <section className="bg-surface-container-low py-24 relative">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center mb-16 reveal-up">
            <span className="font-label-sm text-secondary uppercase tracking-widest text-xs mb-3 block">
              Capabilities
            </span>
            <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary">
              Intelligence at Every Step
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="glass-card rounded-3xl p-8 transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(61,43,31,0.1)] group"
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors duration-300">
                  <span className="material-symbols-outlined text-secondary text-2xl">
                    {feature.icon}
                  </span>
                </div>
                <h3 className="font-display-lg text-xl text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-on-surface-variant font-body-md leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave divider back to surface */}
      <div className="relative h-20 -mt-1 overflow-hidden bg-surface-container-low">
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path d="M0,60 C480,10 960,70 1440,30 L1440,80 L0,80 Z" fill="#fbfbe2" />
        </svg>
      </div>

      {/* ════════════════════════════════════════════
          CTA CARDS SECTION
         ════════════════════════════════════════════ */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 reveal-up">
          {/* Card 1: Generate */}
          <button
            id="cta-card-generate"
            onClick={() => navigate('/generate')}
            className="group glass-card rounded-[2rem] p-10 text-left transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_30px_60px_rgba(61,43,31,0.12)] relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-52 h-52 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-colors duration-500" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg group-hover:shadow-[0_8px_30px_rgba(61,43,31,0.3)] transition-shadow duration-300">
                <span className="material-symbols-outlined text-surface text-3xl">
                  auto_awesome
                </span>
              </div>
              <h3 className="font-display-lg text-2xl text-primary mb-3">
                Recipe Generation
              </h3>
              <p className="text-on-surface-variant font-body-md leading-relaxed mb-6">
                Describe your cravings in plain language. Our AI synthesizes a unique
                recipe complete with USDA-accurate macros and step-by-step
                instructions.
              </p>
              <span className="inline-flex items-center gap-2 text-secondary font-label-sm group-hover:gap-3 transition-all duration-300">
                Start Cooking
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
          </button>

          {/* Card 2: Recipe Book */}
          <button
            id="cta-card-recipe-book"
            onClick={() => navigate('/recipe-book')}
            className="group glass-card rounded-[2rem] p-10 text-left transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_30px_60px_rgba(61,43,31,0.12)] relative overflow-hidden"
          >
            <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-tertiary/10 rounded-full blur-3xl group-hover:bg-tertiary/15 transition-colors duration-500" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-tertiary-container flex items-center justify-center mb-6 shadow-lg group-hover:shadow-[0_8px_30px_rgba(17,29,0,0.3)] transition-shadow duration-300">
                <span className="material-symbols-outlined text-surface text-3xl">
                  menu_book
                </span>
              </div>
              <h3 className="font-display-lg text-2xl text-primary mb-3">
                Recipe Book
              </h3>
              <p className="text-on-surface-variant font-body-md leading-relaxed mb-6">
                Browse a curated collection of recipes across cuisines. Filter by
                category, save your favourites, and build your personal digital
                cookbook.
              </p>
              <span className="inline-flex items-center gap-2 text-secondary font-label-sm group-hover:gap-3 transition-all duration-300">
                Explore Recipes
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
          </button>
        </div>
      </section>
    </>
  );
};
