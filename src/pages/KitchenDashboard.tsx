import { useState } from 'react';

import { ChemistryErrorModal, ContradictionGraph } from '../components/KitchenWidgets';
import { StressTestLoader } from '../components/StressTestLoader';
import { useCookingSession } from '../context/CookingSessionContext';
import { RecipeDraftTimeline } from '../components/RecipeDraftTimeline';

export const KitchenDashboard = () => {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const { digitalTwinState } = useCookingSession();

  const handleSimulateError = () => setShowErrorModal(true);

  return (
    <div className="pt-24 px-margin-mobile md:px-margin-desktop pb-24 max-w-container-max mx-auto min-h-screen relative">
      {isStressTesting && <StressTestLoader onComplete={() => setIsStressTesting(false)} />}
      <ChemistryErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} />

      {/* Profile & Welcome Section */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 reveal-up">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary font-bold">Welcome back, Chef.</h1>
          <p className="text-on-surface-variant mt-2 max-w-xl">
            Your culinary sanctuary is prepped. Active sessions are tracked by the FastAPI backend with real-time digital twin state.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="font-label-sm text-xs text-secondary uppercase font-bold">Level 12</p>
            <p className="font-display-lg text-2xl text-primary font-bold">Artisan Poissonnier</p>
          </div>
        </div>
      </header>

      {/* Bento Grid: Your Kitchen */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-16 stagger-children">
        {/* Continue Cooking (Large Glass Card) */}
        <div className="md:col-span-8 group cursor-pointer">
          <div className="glass-card espresso-shadow-deep rounded-3xl overflow-hidden relative h-[400px] bg-white/20 transition-all duration-500 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaaWHSy-WHBDW8YTOWBnWmIwltDdoydxqAd7zxe5CNUwPtiaaOkY8HgAe0PXxIKKo741RhRx5H_XhSnff4nAUweQflSUTisqPWPp6iIJVz-wDvUiuLC3CoitRowlY9TMVEcMtdILmrP4xCvxNEAoK9y246CvSqYK1-wo6cGmZphW9t7qwTlBUMFpt_beE09VJGqcGWVvmg2CHGyoWDPGwW8M0ISS3Rx9lneMnLI6lQxuANJQsv6kC5akNFOTnN4wDssUONRZ0OueoI" alt="Active Session" />
            <div className="absolute bottom-0 left-0 p-8 z-20 w-full flex justify-between items-end">
              <div>
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">Active Session: sess_991</span>
                <h2 className="font-display-lg text-4xl text-surface font-bold">Truffle Infused Risotto</h2>
                <p className="text-surface/80 font-body-md mt-2">Step 4 of 12: Emulsifying the Mantecatura</p>
              </div>
              <button className="bg-surface text-primary w-14 h-14 rounded-full flex items-center justify-center hover:bg-secondary hover:text-surface transition-all duration-300 shadow-lg" onClick={handleSimulateError}>
                <span className="material-symbols-outlined text-3xl">play_arrow</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Mini Grid */}
        <div className="md:col-span-4 flex flex-col gap-gutter">
          <div className="glass-card p-6 rounded-3xl flex-1 bg-surface-container-low/60 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-secondary text-4xl">local_fire_department</span>
              <span className="text-xs font-label-sm text-secondary font-bold">+12% vs last week</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-sm uppercase tracking-tighter text-xs font-bold">Kitchen Efficiency</p>
              <p className="font-display-lg text-3xl text-primary font-bold">High Precision</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl flex-1 bg-surface-container-low/60 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-secondary text-4xl">restaurant</span>
              <span className="text-xs font-label-sm text-secondary font-bold">24 Ingredients</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-sm uppercase tracking-tighter text-xs font-bold">Pantry Health</p>
              <p className="font-display-lg text-3xl text-primary font-bold">Fully Stocked</p>
            </div>
          </div>
        </div>
      </section>

      {/* FASTAPI RECIPE DRAFT TIMELINE (UNDO / REDO) */}
      <section className="mb-16">
        <RecipeDraftTimeline />
      </section>

      {/* Digital Twin State Viewer */}
      <section className="mb-16 glass-card p-6 rounded-3xl bg-surface-container-low/60 flex flex-col gap-4">
        <h3 className="font-display-lg text-2xl text-primary flex items-center gap-2 font-bold">
          <span className="material-symbols-outlined">data_object</span>
          Culinary Digital Twin (Live State)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {digitalTwinState.map(ingredient => (
            <div key={ingredient.id} className="bg-surface p-4 rounded-xl live-pulse border border-outline-variant/20">
              <p className="font-bold text-primary mb-2 text-sm">{ingredient.name}</p>
              <p className="font-label-sm text-xs text-on-surface-variant">Mass: {ingredient.massGrams}g</p>
              <p className="font-label-sm text-xs text-on-surface-variant">Temp: {ingredient.temperatureCelsius}°C</p>
              <p className="font-label-sm text-xs text-on-surface-variant">Texture: {ingredient.texture}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contradiction Graph Section */}
      <section className="mb-16">
        <ContradictionGraph />
      </section>
    </div>
  );
};
