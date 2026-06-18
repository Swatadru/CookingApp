import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentCriticLogs } from '../components/AgentCriticLogs';
import { ConfidenceAwareGenerator, ExplainableChemistryEngine, AdaptiveSkillRewriter } from '../components/InnovationWidgets';
import { ContradictionGraph } from '../components/KitchenWidgets';

export const InnovationLab = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-24 min-h-screen">
      {/* Hero Header */}
      <header className="relative pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-[614px] flex flex-col justify-center items-start overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40"></div>
        <div className="max-w-2xl">
          <span className="font-label-sm uppercase tracking-widest text-secondary block mb-4 reveal-up">Innovation Suite</span>
          <h1 className="font-display-lg text-display-lg text-primary mb-6 reveal-up" style={{ '--delay': '100ms' } as React.CSSProperties}>Culinary Intelligence <br/><span className="italic font-normal">Beyond Intuition.</span></h1>
          <p className="font-body-md text-on-surface-variant max-w-lg mb-8 leading-relaxed reveal-up" style={{ '--delay': '200ms' } as React.CSSProperties}>
            Step into the laboratory of the Omniscient Sous-Chef. Where advanced physics, real-time chemical tracking, and cultural empathy converge to redefine the human cooking experience.
          </p>
          <div className="flex gap-4 reveal-up" style={{ '--delay': '350ms' } as React.CSSProperties}>
            <button className="bg-primary text-surface px-8 py-3 rounded-full font-label-sm flex items-center gap-2 liquid-hover shadow-lg" onClick={() => document.getElementById('culinary-physics')?.scrollIntoView({ behavior: 'smooth' })}>
              EXPLORE LABS <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="glass-card text-primary px-8 py-3 rounded-full font-label-sm border border-primary/20 hover:bg-primary/5 transition-all duration-300" onClick={() => navigate('/kitchen')}>
              WATCH FILM
            </button>
          </div>
        </div>
      </header>

      {/* Tech Showcase Grid */}
      <div className="px-margin-mobile md:px-margin-desktop py-16 md:py-24 max-w-container-max mx-auto space-y-16 md:space-y-32">
        {/* Section: Culinary Physics */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center" id="culinary-physics">
          {/* Culinary Physics: text left, visual right */}
          <div className="lg:col-span-5 order-2 lg:order-1 reveal-left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined">science</span>
                <span className="font-label-sm uppercase font-bold">Culinary Physics</span>
              </div>
              <h2 className="font-display-lg text-headline-lg text-primary">Molecular Integrity Validation</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Our AI doesn't just guess; it simulates. Using real-time thermal conductivity models, the Omniscient Sous-Chef predicts exactly how heat penetrates protein structures. It ensures every steak reaches its Maillard reaction peak without compromising internal moisture.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                  <span className="text-body-md">Thermal Gradient Analysis (TGA)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                  <span className="text-body-md">Protein Denaturation Tracking</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 glass-card rounded-3xl p-4 bg-white/40 shadow-xl overflow-hidden min-h-[400px] flex items-center justify-center relative reveal-right">
            <div className="absolute inset-0 z-0"></div>
            <div className="relative z-10 bg-white/80 p-6 rounded-2xl border border-white/40 shadow-sm max-w-xs w-full">
              <p className="font-label-sm text-secondary mb-2">LIVE DATA FEED</p>
              <div className="flex justify-between items-end mb-4">
                <span className="text-3xl font-bold text-primary">54.4°C</span>
                <span className="text-xs text-on-surface-variant">Optimal Medium Rare</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Explainable Chemistry Engine (Innovation #3) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center" id="explainable-chemistry">
          <div className="lg:col-span-6 reveal-left">
            <ExplainableChemistryEngine />
          </div>
          <div className="lg:col-span-6 px-4 lg:px-12 space-y-6 reveal-right">
            <div className="inline-flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">psychology</span>
              <span className="font-label-sm uppercase font-bold">Innovation #3</span>
            </div>
            <h2 className="font-display-lg text-headline-lg text-primary">Explainable Food Chemistry Engine</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Most existing recipe generation systems are black boxes. They output a valid recipe or fail silently. Our validator is fully explainable. It mathematically bounds ingredients to their safe operating ranges and explicitly flags the physical risks of violating them.
            </p>
          </div>
        </section>

        {/* Section: Dynamic State Memory */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center" id="state-memory">
          <div className="lg:col-span-7 glass-card rounded-3xl aspect-video bg-primary-container relative overflow-hidden shadow-2xl reveal-left">
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-surface/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/20">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">memory</span>
                </div>
                <div>
                  <p className="font-label-sm font-bold">STATE: OXIDIZING</p>
                  <p className="text-[10px] text-on-surface-variant">Ingredient: Hass Avocado (Sliced)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-secondary">T-MINUS 12M</p>
                <p className="text-[10px] text-on-surface-variant">To Visual Degradation</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 px-4 lg:px-12 space-y-6 reveal-right">
            <div className="inline-flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">track_changes</span>
              <span className="font-label-sm uppercase font-bold">Dynamic State Memory</span>
            </div>
            <h2 className="font-display-lg text-headline-lg text-primary">The Ingredient Lifecycle</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Recipes are static; ingredients are alive. Our Dynamic State Memory tracks the chemical evolution of your produce from the moment it hits the counter. From oxidative stress in sliced fruit to the hydration levels of dough, the AI adapts instructions in real-time based on the ingredients' current physical state.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-high">
                <h4 className="font-bold text-primary mb-1">Volatiles</h4>
                <p className="text-xs text-on-surface-variant">Aromatic tracking for optimal seasoning windows.</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-high">
                <h4 className="font-bold text-primary mb-1">Enzymes</h4>
                <p className="text-xs text-on-surface-variant">Predicting texture changes in marinades.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Contradiction Detection Graph (Innovation #5) */}
        <section className="space-y-12" id="contradiction-graph">
          <div className="text-center max-w-2xl mx-auto space-y-4 reveal-up">
            <div className="inline-flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">account_tree</span>
              <span className="font-label-sm uppercase font-bold">Innovation #5</span>
            </div>
            <h2 className="font-display-lg text-headline-lg text-primary">Contradiction Detection Graph</h2>
            <p className="text-on-surface-variant">
              The AI builds a Directed Acyclic Graph (DAG) dependency tree of every food state. It inherently understands that physical transformations are one-way. This instantly catches hallucinations where the AI tries to perform impossible physical actions on previously altered ingredients.
            </p>
          </div>
          <div className="max-w-4xl mx-auto reveal-up" style={{ '--delay': '200ms' } as React.CSSProperties}>
            <ContradictionGraph />
          </div>
        </section>

        {/* Section: Confidence-Aware Generation (Innovation #2) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center" id="confidence-generation">
          <div className="lg:col-span-5 px-4 lg:px-12 space-y-6 reveal-left">
            <div className="inline-flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">rule</span>
              <span className="font-label-sm uppercase font-bold">Innovation #2</span>
            </div>
            <h2 className="font-display-lg text-headline-lg text-primary">Confidence-Aware Generation</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Standard language models blindly generate text. The Omniscient Sous-Chef enforces strict step validity scoring. Every generated instruction is graded against three independent metrics: Chemical Viability, Food Safety standards (USDA/FDA), and Cultural Authenticity.
            </p>
          </div>
          <div className="lg:col-span-7 reveal-right">
            <ConfidenceAwareGenerator />
          </div>
        </section>

        {/* Section: Adaptive Skill-Level Rewriter (Innovation #6) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center" id="skill-rewriter">
          <div className="lg:col-span-7 reveal-left">
            <AdaptiveSkillRewriter />
          </div>
          <div className="lg:col-span-5 px-4 lg:px-12 space-y-6 reveal-right">
            <div className="inline-flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">tune</span>
              <span className="font-label-sm uppercase font-bold">Innovation #6</span>
            </div>
            <h2 className="font-display-lg text-headline-lg text-primary">Adaptive Skill-Level Rewriter</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Current systems personalize ingredients based on dietary needs. Our system personalizes <em>execution complexity</em> based on the user's culinary skill. The underlying chemical graph remains identical, but the procedural instruction language shifts to match the user's expertise.
            </p>
          </div>
        </section>

        {/* Section: Cultural Allergen Swapper */}
        <section className="space-y-12" id="allergen-swapper">
          {/* Allergen Swapper: center-aligned */}
          <div className="text-center max-w-2xl mx-auto space-y-4 reveal-up">
            <div className="inline-flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">autostop</span>
              <span className="font-label-sm uppercase font-bold">Inclusivity Engine</span>
            </div>
            <h2 className="font-display-lg text-headline-lg text-primary">Cultural Allergen Swapper</h2>
            <p className="text-on-surface-variant">
              Swap ingredients without losing the soul of the dish. Our engine understands the functional and cultural role of every ingredient, providing replacements that preserve flavor profile and heritage.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter stagger-children">
            <div className="group relative bg-white/60 p-8 rounded-3xl border border-outline-variant/30 liquid-hover cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-4xl">info</span>
              </div>
              <div className="mb-6 w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-3xl">egg_alt</span>
              </div>
              <h3 className="font-display-lg text-xl text-primary mb-2">Egg Substitute</h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">Maintaining structure and richness in traditional Chiffon cakes without poultry allergens.</p>
              <div className="flex items-center gap-2 text-secondary font-label-sm text-xs">
                <span className="font-bold">SUGGESTION:</span>
                <span className="bg-secondary/10 px-2 py-1 rounded">Aquafaba + Cream of Tartar</span>
              </div>
            </div>
            
            <div className="group relative bg-white/60 p-8 rounded-3xl border border-outline-variant/30 liquid-hover cursor-pointer overflow-hidden shadow-xl ring-2 ring-secondary/20">
              <div className="absolute top-0 right-0 p-4">
                <span className="material-symbols-outlined text-secondary fill-current">star</span>
              </div>
              <div className="mb-6 w-16 h-16 rounded-2xl bg-tertiary-fixed-dim flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-3xl">set_meal</span>
              </div>
              <h3 className="font-display-lg text-xl text-primary mb-2">Fish Sauce Substitute</h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">Replicating the deep umami and salinity of Southeast Asian cuisine for vegan palates.</p>
              <div className="flex items-center gap-2 text-on-tertiary-container font-label-sm text-xs">
                <span className="font-bold">SUGGESTION:</span>
                <span className="bg-tertiary-fixed-dim px-2 py-1 rounded">Fermented Shiitake + Kelp</span>
              </div>
            </div>

            <div className="group relative bg-white/60 p-8 rounded-3xl border border-outline-variant/30 liquid-hover cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-4xl">info</span>
              </div>
              <div className="mb-6 w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-3xl">bakery_dining</span>
              </div>
              <h3 className="font-display-lg text-xl text-primary mb-2">Gluten-Free Binding</h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">Achieving the elasticity of hand-pulled noodles without wheat-based proteins.</p>
              <div className="flex items-center gap-2 text-secondary font-label-sm text-xs">
                <span className="font-bold">SUGGESTION:</span>
                <span className="bg-secondary/10 px-2 py-1 rounded">Psyllium Husk + Rice Flour</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Missing Ingredient Architecture */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center" id="missing-ingredients">
          <div className="lg:col-span-5 order-2 lg:order-1 px-4 lg:px-12 space-y-6 reveal-left">
            <div className="inline-flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">hub</span>
              <span className="font-label-sm uppercase font-bold">Ontological Inference</span>
            </div>
            <h2 className="font-display-lg text-headline-lg text-primary">Missing Ingredient Architecture</h2>
            <p className="text-on-surface-variant leading-relaxed">
              When confronted with a rare or unknown ingredient, the AI utilizes a two-step fallback mechanism. It first attempts <strong>Ontological Inheritance</strong> to map the ingredient to a known parent category. If that fails, it triggers a <strong>Dynamic Web-RAG Fallback</strong>, instantly searching scientific databases for exact chemical profiles.
            </p>
            <AgentCriticLogs />
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 glass-card rounded-3xl p-8 bg-surface-container-low shadow-xl reveal-right">
            <h3 className="font-label-sm text-primary uppercase mb-6 tracking-widest border-b border-outline-variant/30 pb-2">Knowledge Graph Fallback</h3>
            <div className="space-y-4">
              <div className="bg-surface p-4 rounded-xl flex items-center justify-between border-l-4 border-secondary">
                <div>
                  <p className="font-bold text-primary">Target: "Buddha's Hand Citron"</p>
                  <p className="text-xs text-on-surface-variant">Status: Unknown Local Chemical Profile</p>
                </div>
                <span className="material-symbols-outlined text-secondary animate-spin" style={{ animationDuration: '4s' }}>radar</span>
              </div>
              <div className="pl-8 border-l-2 border-dashed border-outline-variant/50 space-y-4">
                <div className="bg-surface-container-high p-4 rounded-xl relative">
                  <div className="absolute top-1/2 -left-10 w-8 h-0.5 bg-outline-variant/50"></div>
                  <p className="text-sm font-bold">Step 1: Ontological Inheritance</p>
                  <p className="text-xs text-on-surface-variant">Mapping to closest parent: <span className="font-mono text-secondary bg-secondary/10 px-1">Citrus Medica</span>. Inheriting acidity and sugar content baselines.</p>
                </div>
                <div className="bg-tertiary/10 p-4 rounded-xl relative border border-tertiary/20">
                  <div className="absolute top-1/2 -left-10 w-8 h-0.5 bg-outline-variant/50"></div>
                  <p className="text-sm font-bold text-tertiary">Step 2: Dynamic Web-RAG</p>
                  <p className="text-xs text-on-surface-variant">Querying food science API... <br/>Found: High essential oils, zero pulp/juice. Adjusting recipe state to extract zest only.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Processing Optimization Visualizer */}
        <section className="space-y-12 bg-primary text-surface p-12 rounded-[40px] shadow-2xl relative overflow-hidden reveal-rotate" id="processing-optimization">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent"></div>
           <div className="relative z-10 text-center max-w-2xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 text-secondary-fixed">
              <span className="material-symbols-outlined">speed</span>
              <span className="font-label-sm uppercase font-bold">System Architecture</span>
            </div>
            <h2 className="font-display-lg text-headline-lg">Processing Optimization</h2>
            <p className="text-surface/80">
              Balancing complex physics simulations with instantaneous user feedback requires a highly optimized, asynchronous routing layer.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 stagger-children">
            <div className="bg-surface/10 p-6 rounded-2xl backdrop-blur-md border border-surface/20">
              <div className="w-12 h-12 bg-surface/20 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary-fixed">route</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Semantic Routers</h3>
              <p className="text-sm text-surface/70 leading-relaxed">Instantly classifies user intent. Sends basic queries (timers, conversions) to lightning-fast Small Language Models (SLMs) to save compute.</p>
            </div>
            <div className="bg-surface/10 p-6 rounded-2xl backdrop-blur-md border border-surface/20 relative mt-0 md:mt-8">
              <div className="w-12 h-12 bg-surface/20 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary-fixed">memory_alt</span>
              </div>
              <h3 className="font-bold text-lg mb-2">State Vector Caching</h3>
              <p className="text-sm text-surface/70 leading-relaxed">Caches the physical state of the dish at every step. If you burn the onions at step 4, the AI computes recovery from step 4, not step 1.</p>
            </div>
            <div className="bg-surface/10 p-6 rounded-2xl backdrop-blur-md border border-surface/20">
              <div className="w-12 h-12 bg-surface/20 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary-fixed">call_split</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Async Parallel Processing</h3>
              <p className="text-sm text-surface/70 leading-relaxed">While you chop vegetables, the backend runs parallel chemistry validation checks on upcoming steps to ensure zero latency during execution.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
