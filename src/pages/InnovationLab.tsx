import { useNavigate } from 'react-router-dom';
import { AgentCriticLogs } from '../components/AgentCriticLogs';
import { ConfidenceAwareGenerator, ExplainableChemistryEngine, AdaptiveSkillRewriter } from '../components/InnovationWidgets';
import { RecipeDraftTimeline } from '../components/RecipeDraftTimeline';
import { ContradictionDetectorWidget } from '../components/ContradictionDetectorWidget';
import { RecipeScoreGauge } from '../components/RecipeScoreGauge';
import { CuisineClassifierWidget } from '../components/CuisineClassifierWidget';
import { AllergenScannerWidget } from '../components/AllergenScannerWidget';

export const InnovationLab = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-[96px] min-h-screen" style={{ paddingTop: '280px' }}>
      {/* Hero Header */}
      <header className="relative pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-[500px] flex flex-col justify-center items-start overflow-hidden">
        <div className="max-w-2xl">
          <span className="font-label-sm uppercase tracking-widest text-secondary block mb-4 reveal-up font-bold">
            FastAPI Backend Architecture Suite
          </span>
          <h1 className="font-display-lg text-4xl md:text-5xl text-primary mb-6 reveal-up" style={{ '--delay': '100ms' } as React.CSSProperties}>
            Culinary Intelligence & <br />
            <span className="italic font-normal text-secondary">Backend Interactive Lab</span>
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-lg mb-8 leading-relaxed reveal-up" style={{ '--delay': '200ms' } as React.CSSProperties}>
            Step into the laboratory of the Omniscient Sous-Chef. Test User Sessions, Recipe Draft Undo/Redo timelines, Contradiction Detection, Cuisine Classification, and Validity Scoring powered by FastAPI.
          </p>
          <div className="flex flex-wrap gap-4 reveal-up" style={{ '--delay': '350ms' } as React.CSSProperties}>
            <button
              className="bg-primary text-surface px-8 py-3 rounded-full font-label-sm flex items-center gap-2 shadow-lg hover:bg-secondary transition-all"
              onClick={() => document.getElementById('fastapi-modules')?.scrollIntoView({ behavior: 'smooth' })}
            >
              EXPLORE FASTAPI MODULES <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button
              className="glass-card text-primary px-8 py-3 rounded-full font-label-sm border border-primary/20 hover:bg-primary/5 transition-all duration-300"
              onClick={() => navigate('/chat')}
            >
              OPEN AI CHATBOT
            </button>
          </div>
        </div>
      </header>

      {/* Main Showcase Grid */}
      <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max mx-auto space-y-16" id="fastapi-modules">
        {/* FASTAPI MODULE 1: Recipe Drafts & Session Timeline (Undo/Redo) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-secondary">
            <span className="material-symbols-outlined text-lg">history</span>
            <span className="font-label-sm uppercase font-bold text-xs">Module 1: `/api/sessions` & `/api/recipes`</span>
          </div>
          <RecipeDraftTimeline />
        </section>

        {/* FASTAPI MODULE 2 & 3: Contradiction Detector & Validity Score */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ContradictionDetectorWidget />
          <RecipeScoreGauge />
        </section>

        {/* FASTAPI MODULE 4 & 5: Cuisine Classifier & Allergen Swapper */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CuisineClassifierWidget />
          <AllergenScannerWidget />
        </section>

        {/* Section: Culinary Physics */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center pt-8">
          <div className="lg:col-span-5 order-2 lg:order-1 reveal-left space-y-6">
            <div className="inline-flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">science</span>
              <span className="font-label-sm uppercase font-bold">Culinary Physics</span>
            </div>
            <h2 className="font-display-lg text-3xl text-primary font-bold">Molecular Integrity Validation</h2>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Our AI simulates real-time thermal conductivity models to predict exactly how heat penetrates protein structures. It ensures every steak reaches its Maillard reaction peak without compromising internal moisture.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                <span>Thermal Gradient Analysis (TGA)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                <span>Protein Denaturation Tracking</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 glass-card rounded-3xl p-6 bg-white/40 shadow-xl overflow-hidden min-h-[300px] flex items-center justify-center relative reveal-right">
            <div className="relative z-10 bg-white/90 p-6 rounded-2xl border border-white/40 shadow-md max-w-xs w-full">
              <p className="font-label-sm text-secondary mb-2 text-xs font-bold">LIVE DATA FEED</p>
              <div className="flex justify-between items-end mb-4">
                <span className="text-3xl font-bold text-primary font-mono">54.4°C</span>
                <span className="text-xs text-on-surface-variant">Optimal Medium Rare</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-3/4 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Explainable Chemistry Engine */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          <div className="lg:col-span-6 reveal-left">
            <ExplainableChemistryEngine />
          </div>
          <div className="lg:col-span-6 px-4 lg:px-12 space-y-6 reveal-right">
            <div className="inline-flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">psychology</span>
              <span className="font-label-sm uppercase font-bold">Innovation #3</span>
            </div>
            <h2 className="font-display-lg text-3xl text-primary font-bold">Explainable Food Chemistry Engine</h2>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Most existing recipe generation systems are black boxes. Our validator is fully explainable. It mathematically bounds ingredients to their safe operating ranges and explicitly flags physical risks of violating them.
            </p>
          </div>
        </section>

        {/* Section: Confidence-Aware Generation */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          <div className="lg:col-span-5 px-4 lg:px-12 space-y-6 reveal-left">
            <div className="inline-flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">rule</span>
              <span className="font-label-sm uppercase font-bold">Innovation #2</span>
            </div>
            <h2 className="font-display-lg text-3xl text-primary font-bold">Confidence-Aware Generation</h2>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Enforces strict step validity scoring. Every generated instruction is graded against three independent metrics: Chemical Viability, Food Safety standards (USDA/FDA), and Cultural Authenticity.
            </p>
          </div>
          <div className="lg:col-span-7 reveal-right">
            <ConfidenceAwareGenerator />
          </div>
        </section>

        {/* Section: Adaptive Skill Rewriter */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          <div className="lg:col-span-7 reveal-left">
            <AdaptiveSkillRewriter />
          </div>
          <div className="lg:col-span-5 px-4 lg:px-12 space-y-6 reveal-right">
            <div className="inline-flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">tune</span>
              <span className="font-label-sm uppercase font-bold">Innovation #6</span>
            </div>
            <h2 className="font-display-lg text-3xl text-primary font-bold">Adaptive Skill-Level Rewriter</h2>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Personalizes execution complexity based on user culinary skill level while maintaining identical chemical graphs.
            </p>
          </div>
        </section>

        {/* Section: Missing Ingredient Architecture */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 px-4 lg:px-12 space-y-6 reveal-left">
            <div className="inline-flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">hub</span>
              <span className="font-label-sm uppercase font-bold">Ontological Inference</span>
            </div>
            <h2 className="font-display-lg text-3xl text-primary font-bold">Missing Ingredient Architecture</h2>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              When confronted with a rare or unknown ingredient, the AI utilizes a two-step fallback mechanism: Ontological Inheritance followed by Dynamic Web-RAG Fallback.
            </p>
            <AgentCriticLogs />
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 glass-card rounded-3xl p-8 bg-surface-container-low shadow-xl reveal-right">
            <h3 className="font-label-sm text-primary uppercase mb-6 tracking-widest border-b border-outline-variant/30 pb-2 text-xs font-bold">
              Knowledge Graph Fallback
            </h3>
            <div className="space-y-4">
              <div className="bg-surface p-4 rounded-xl flex items-center justify-between border-l-4 border-secondary">
                <div>
                  <p className="font-bold text-primary text-sm">Target: "Buddha's Hand Citron"</p>
                  <p className="text-xs text-on-surface-variant">Status: Unknown Local Chemical Profile</p>
                </div>
                <span className="material-symbols-outlined text-secondary animate-spin" style={{ animationDuration: '4s' }}>
                  radar
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
