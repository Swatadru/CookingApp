export const ChemistryErrorModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-surface/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full p-8 rounded-3xl shadow-2xl border border-error/20 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div>
            <h3 className="font-display-lg text-2xl text-error">Chemistry Validation Failed</h3>
            <p className="font-label-sm text-on-surface-variant text-xs uppercase tracking-wider">Step 4: Emulsifying</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-surface p-4 rounded-xl border border-outline-variant/30">
            <p className="font-label-sm text-xs text-on-surface-variant mb-1 uppercase">Required Range</p>
            <p className="font-body-md text-primary font-bold">Butter temp: 4°C - 8°C</p>
          </div>
          <div className="bg-error/10 p-4 rounded-xl border border-error/20">
            <p className="font-label-sm text-xs text-error mb-1 uppercase">Generated Metric</p>
            <p className="font-body-md text-error font-bold">Butter temp: 22°C (Room Temp)</p>
          </div>
          <div className="bg-surface-container p-4 rounded-xl">
            <p className="font-label-sm text-xs text-on-surface-variant mb-1 uppercase">Specific Culinary Risk</p>
            <p className="font-body-md text-sm leading-relaxed">
              Using room temperature butter for mantecatura will cause the emulsion to break, resulting in a greasy risotto rather than a creamy suspension. 
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-error text-on-error py-3 rounded-xl font-bold hover:bg-error/90 transition-colors"
        >
          Acknowledge & Adjust Recipe
        </button>
      </div>
    </div>
  );
};

export const ContradictionGraph = () => {
  return (
    <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant shadow-sm mt-8">
      <h3 className="font-display-lg text-2xl text-primary mb-8 flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary">account_tree</span>
        State Dependency Graph
      </h3>
      
      <div className="relative bg-surface rounded-2xl border border-outline-variant/30 p-6 md:p-10 flex flex-col gap-10 overflow-x-auto no-scrollbar shadow-inner">
        
        {/* Graph Layout Container */}
        <div className="flex items-center min-w-max mx-auto py-4">
          
          {/* Node 1 */}
          <div className="bg-tertiary-container text-on-tertiary-container px-6 py-3 rounded-xl text-sm font-bold shadow-md border border-tertiary/20 flex-shrink-0 z-10 transition-transform hover:scale-105">
            1. Puree Tomatoes
          </div>

          {/* Connection 1 */}
          <div className="w-16 md:w-24 h-0.5 bg-outline-variant relative flex-shrink-0 mx-2">
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 border-t-2 border-r-2 border-outline-variant rotate-45"></div>
          </div>

          {/* Node 2 (Conflict) */}
          <div className="bg-error/10 text-error px-6 py-3 rounded-xl text-sm font-bold shadow-lg border-2 border-error border-dashed animate-pulse flex-shrink-0 relative z-10">
            2. Dice Tomatoes
            <span className="absolute -top-3 -right-3 bg-error text-white text-[10px] font-black tracking-widest px-2 py-1 rounded-md shadow-md uppercase">Conflict</span>
          </div>

          {/* Connection 2 */}
          <div className="w-16 md:w-24 h-0.5 bg-outline-variant/40 relative flex-shrink-0 mx-2">
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 border-t-2 border-r-2 border-outline-variant/40 rotate-45"></div>
          </div>

          {/* Node 3 */}
          <div className="bg-surface-variant/30 text-on-surface-variant px-6 py-3 rounded-xl text-sm font-bold shadow-sm border border-outline-variant/20 opacity-50 flex-shrink-0 z-10">
            3. Simmer Sauce
          </div>
          
        </div>

        {/* Error Details */}
        <div className="bg-error/10 text-error px-5 py-4 rounded-xl text-sm border border-error/20 flex items-start gap-3 mt-4 max-w-3xl mx-auto w-full">
          <span className="material-symbols-outlined text-2xl shrink-0">error</span>
          <div>
            <strong className="block mb-1 font-label-sm uppercase tracking-wider text-error">Physics Conflict Detected</strong>
            <span className="opacity-90 leading-relaxed">Cannot execute "Dice" on ingredient "Tomatoes" because its physical state was irreversibly altered to "Pureed" in Step 1.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

