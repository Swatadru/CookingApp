import { useState } from 'react';

export const ConfidenceAwareGenerator = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Current LLM */}
      <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/30 opacity-75">
        <h4 className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Current LLM</h4>
        <div className="bg-surface p-4 rounded-xl border border-outline-variant/30 mb-4 font-mono text-sm">
          Cook chicken at 55°C
        </div>
        <p className="font-label-sm text-error flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">warning</span>
          No confidence guarantees.
        </p>
      </div>

      {/* Omniscient System */}
      <div className="bg-surface-container-high rounded-2xl p-6 border border-secondary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl rounded-full"></div>
        <h4 className="font-label-sm text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">verified</span>
          Omniscient System
        </h4>
        
        <div className="bg-surface p-4 rounded-xl border border-outline-variant/30 mb-4">
          <div className="flex justify-between items-end mb-2">
            <span className="font-bold text-primary">Step Validity Score:</span>
            <span className="font-display-lg text-secondary text-2xl">0.97</span>
          </div>
          <p className="text-xs text-on-surface-variant font-mono bg-surface-container p-2 rounded">
            Evidence: USDA safe chicken temperature = 74°C
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-on-surface-variant">Chemical Confidence</span>
              <span className="text-secondary">95%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-[95%]"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-on-surface-variant">Safety Confidence</span>
              <span className="text-primary">100%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary w-full"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-on-surface-variant">Cultural Confidence</span>
              <span className="text-tertiary">92%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-tertiary w-[92%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExplainableChemistryEngine = () => {
  return (
    <div className="bg-[#111111] p-8 rounded-3xl border border-white/10 text-white font-mono shadow-2xl relative overflow-hidden group">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-error/5 rounded-full blur-3xl group-hover:bg-error/10 transition-colors duration-700"></div>
      
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <span className="material-symbols-outlined text-error text-3xl">warning</span>
        <div>
          <h4 className="font-bold text-lg text-error tracking-wider uppercase">Validation Failed</h4>
          <p className="text-xs text-white/50 uppercase tracking-widest">Step 4: Melting Chocolate</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-white/50 text-xs uppercase mb-1">Required Range</p>
            <p className="text-lg">30-45°C</p>
          </div>
          <div className="bg-error/10 p-4 rounded-xl border border-error/20">
            <p className="text-error/70 text-xs uppercase mb-1">Generated</p>
            <p className="text-lg text-error">90°C</p>
          </div>
        </div>
        
        <div className="bg-error/5 p-5 rounded-xl border border-error/10">
          <p className="text-error/70 text-xs uppercase mb-2">Identified Physics Risk</p>
          <p className="text-error font-bold leading-relaxed">
            Heating cocoa butter beyond 45°C causes irreversible crystalline structure breakdown, resulting in burning and fat separation.
          </p>
        </div>
      </div>
    </div>
  );
};

export const AdaptiveSkillRewriter = () => {
  const [skill, setSkill] = useState<'pro' | 'beginner'>('pro');

  return (
    <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant shadow-sm w-full">
      <div className="flex bg-surface-container p-1 rounded-xl mb-8 w-[340px] mx-auto relative">
        <button 
          onClick={() => setSkill('pro')}
          className={`flex-1 py-2.5 rounded-lg font-label-sm transition-all duration-300 relative z-10 text-center ${skill === 'pro' ? 'text-surface' : 'text-on-surface-variant hover:text-primary'}`}
        >
          Professional Chef
        </button>
        <button 
          onClick={() => setSkill('beginner')}
          className={`flex-1 py-2.5 rounded-lg font-label-sm transition-all duration-300 relative z-10 text-center ${skill === 'beginner' ? 'text-surface' : 'text-on-surface-variant hover:text-primary'}`}
        >
          Beginner
        </button>
        <div 
          className="absolute top-1 bottom-1 bg-primary rounded-lg transition-transform duration-300 shadow-sm z-0"
          style={{ 
            width: 'calc(50% - 4px)',
            left: '4px',
            transform: skill === 'pro' ? 'translateX(0)' : 'translateX(100%)'
          }}
        ></div>
      </div>

      <div className="space-y-6 min-h-[120px] flex flex-col justify-center">
        {skill === 'pro' ? (
          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-colors animate-fade-in">
            <span className="font-mono text-sm text-primary">Prepare a beurre monté.</span>
            <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">content_copy</span>
          </div>
        ) : (
          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-colors animate-fade-in">
            <span className="font-mono text-sm text-secondary leading-relaxed">Slowly whisk cold butter into warm water to create an emulsion.</span>
            <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">content_copy</span>
          </div>
        )}
      </div>
      <p className="text-center text-xs text-on-surface-variant mt-6 uppercase tracking-widest">
        Same recipe. Different skill levels.
      </p>
    </div>
  );
};
