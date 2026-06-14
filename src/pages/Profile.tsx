import { useState } from 'react';

export const Profile = () => {
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'pro'>('pro');

  const [dietary, setDietary] = useState({
    vegan: false,
    glutenFree: true,
    nutAllergy: false,
    pescatarian: false,
  });

  return (
    <div className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen relative">
      
      {/* Header Profile Section */}
      <header className="mb-16 flex flex-col md:flex-row items-center md:items-end gap-8 reveal-up">
        <div className="w-32 h-32 rounded-full bg-[#111111] overflow-hidden border-4 border-surface shadow-xl relative group cursor-pointer flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <span className="material-symbols-outlined text-white">photo_camera</span>
          </div>
          <span className="material-symbols-outlined text-8xl text-white opacity-80 translate-y-2">person</span>
        </div>
        <div className="text-center md:text-left">
          <h1 className="font-display-lg text-headline-lg text-primary">Chef Swatadru</h1>
          <p className="text-secondary font-label-sm tracking-widest uppercase mt-2 mb-1 flex items-center justify-center md:justify-start gap-2">
            <span className="material-symbols-outlined text-sm">stars</span>
            Level 12 • Artisan Poissonnier
          </p>
          <p className="text-on-surface-variant text-sm">Joined June 2024</p>
        </div>
        <div className="md:ml-auto">
          <button className="bg-surface-container text-primary px-6 py-2 rounded-full font-label-sm hover:bg-surface-variant transition-colors flex items-center gap-2 border border-outline-variant/30">
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit Profile
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter stagger-children">
        
        {/* Left Column: Preferences */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Culinary Skill Level */}
          <section className="glass-card p-8 rounded-3xl bg-surface-container-low/60 shadow-sm border border-outline-variant/20 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-xl">restaurant_menu</span>
              </div>
              <div>
                <h2 className="font-display-lg text-xl text-primary">Culinary Skill Level</h2>
                <p className="text-xs text-on-surface-variant">Powers the Adaptive Instruction Rewriter</p>
              </div>
            </div>
            
            <div className="flex bg-surface-container p-1 rounded-xl w-[340px] relative">
              <button 
                onClick={() => setSkillLevel('beginner')}
                className={`flex-1 py-2.5 rounded-lg font-label-sm transition-all duration-300 relative z-10 text-center ${skillLevel === 'beginner' ? 'text-surface' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Beginner
              </button>
              <button 
                onClick={() => setSkillLevel('pro')}
                className={`flex-1 py-2.5 rounded-lg font-label-sm transition-all duration-300 relative z-10 text-center ${skillLevel === 'pro' ? 'text-surface' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Professional Chef
              </button>
              <div 
                className="absolute top-1 bottom-1 bg-primary rounded-lg transition-transform duration-300 shadow-sm z-0"
                style={{ 
                  width: 'calc(50% - 4px)',
                  left: '4px',
                  transform: skillLevel === 'beginner' ? 'translateX(0)' : 'translateX(100%)'
                }}
              ></div>
            </div>
            <p className="text-sm text-on-surface-variant mt-4 leading-relaxed max-w-xl">
              {skillLevel === 'pro' 
                ? "Recipes will be generated using professional culinary terminology (e.g. 'macedoine', 'beurre monté') and will assume you possess advanced knife skills and temperature control intuition."
                : "Recipes will be generated using clear, descriptive language with step-by-step visual cues to help you master fundamental techniques safely."}
            </p>
          </section>

          {/* Dietary Restrictions */}
          <section className="glass-card p-8 rounded-3xl bg-surface-container-low/60 shadow-sm border border-outline-variant/20 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-xl">health_and_safety</span>
              </div>
              <div>
                <h2 className="font-display-lg text-xl text-primary">Dietary Profile</h2>
                <p className="text-xs text-on-surface-variant">Powers the Cultural Allergen Swapper</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${dietary.vegan ? 'bg-tertiary/10 border-tertiary/50' : 'bg-surface border-outline-variant/30 hover:border-tertiary/30'}`}>
                <div>
                  <span className="font-bold text-primary block">Vegan</span>
                  <span className="text-xs text-on-surface-variant">No animal products</span>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-tertiary rounded" checked={dietary.vegan} onChange={(e) => setDietary({...dietary, vegan: e.target.checked})} />
              </label>
              <label className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${dietary.glutenFree ? 'bg-tertiary/10 border-tertiary/50' : 'bg-surface border-outline-variant/30 hover:border-tertiary/30'}`}>
                <div>
                  <span className="font-bold text-primary block">Gluten-Free</span>
                  <span className="text-xs text-on-surface-variant">Strict celiac protocol</span>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-tertiary rounded" checked={dietary.glutenFree} onChange={(e) => setDietary({...dietary, glutenFree: e.target.checked})} />
              </label>
              <label className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${dietary.nutAllergy ? 'bg-error/10 border-error/50' : 'bg-surface border-outline-variant/30 hover:border-error/30'}`}>
                <div>
                  <span className="font-bold text-primary block">Nut Allergy</span>
                  <span className="text-xs text-on-surface-variant">Severe anaphylaxis risk</span>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-error rounded" checked={dietary.nutAllergy} onChange={(e) => setDietary({...dietary, nutAllergy: e.target.checked})} />
              </label>
              <label className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${dietary.pescatarian ? 'bg-tertiary/10 border-tertiary/50' : 'bg-surface border-outline-variant/30 hover:border-tertiary/30'}`}>
                <div>
                  <span className="font-bold text-primary block">Pescatarian</span>
                  <span className="text-xs text-on-surface-variant">Seafood allowed</span>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-tertiary rounded" checked={dietary.pescatarian} onChange={(e) => setDietary({...dietary, pescatarian: e.target.checked})} />
              </label>
            </div>
          </section>

        </div>

        {/* Right Column: Hardware & Account */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Connected Hardware */}
          <section className="p-6 rounded-3xl bg-[#111111] border border-white/10 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl z-0"></div>
            <h2 className="font-display-lg text-xl mb-6 flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined">bluetooth</span>
              Connected Kitchen
            </h2>
            
            <div className="space-y-4">
              <div className="bg-surface/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center justify-between group cursor-pointer hover:bg-surface/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary text-surface flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-sm">device_thermostat</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Meater Block Pro</p>
                    <p className="text-xs text-surface/70 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
                      Connected (Probe 1: 54°C)
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors">chevron_right</span>
              </div>
              
              <div className="bg-surface/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center justify-between group cursor-pointer hover:bg-surface/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white text-[#111111] flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-sm">scale</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Acaia Pearl Scale</p>
                    <p className="text-xs text-surface/70 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
                      Standby (0.0g)
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors">chevron_right</span>
              </div>

              <button className="w-full py-3 border border-dashed border-white/30 rounded-xl text-sm font-label-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">add</span>
                Pair New Device
              </button>
            </div>
            <p className="text-[10px] text-surface/50 mt-4 text-center">Powers the Culinary Digital Twin</p>
          </section>

          {/* Account Actions */}
          <section className="glass-card p-6 rounded-3xl bg-surface-container-low/60 border border-outline-variant/20">
            <h2 className="font-label-sm tracking-widest uppercase text-on-surface-variant mb-4">Account Details</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-surface transition-colors text-sm">
                <span className="flex items-center gap-3"><span className="material-symbols-outlined text-on-surface-variant">mail</span> Email Preferences</span>
                <span className="material-symbols-outlined text-sm opacity-50">arrow_forward</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-surface transition-colors text-sm">
                <span className="flex items-center gap-3"><span className="material-symbols-outlined text-on-surface-variant">lock</span> Security Settings</span>
                <span className="material-symbols-outlined text-sm opacity-50">arrow_forward</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-error/10 text-error transition-colors text-sm mt-4">
                <span className="flex items-center gap-3 font-bold"><span className="material-symbols-outlined">logout</span> Sign Out</span>
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
