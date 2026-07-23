import { useState } from 'react';

export const AllergenSwapper = ({ ingredientName }: { ingredientName: string }) => {
  const [isSwapping, setIsSwapping] = useState(false);
  const [swappedTo, setSwappedTo] = useState<string | null>(null);

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      // Mock RAG logic
      if (ingredientName === 'Parmigiano Reggiano') {
        setSwappedTo('Nutritional Yeast + Cashew Dust (Dairy-Free, authentic umami match)');
      } else {
        setSwappedTo(`Allergy-safe ${ingredientName} alternative`);
      }
      setIsSwapping(false);
    }, 1500);
  };

  if (swappedTo) {
    return (
      <div className="flex flex-col items-end">
        <span className="font-body-md text-secondary line-through opacity-50">{ingredientName}</span>
        <span className="font-body-md text-tertiary-container">{swappedTo}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-body-md">{ingredientName}</span>
      <button 
        onClick={handleSwap}
        disabled={isSwapping}
        className="text-[10px] uppercase font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-full hover:bg-secondary/20 transition-colors flex items-center gap-1"
      >
        {isSwapping ? <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span> : <span className="material-symbols-outlined text-[12px]">swap_horiz</span>}
        Swap
      </button>
    </div>
  );
};

export const ConfidenceBadges = () => {
  return (
    <div className="flex flex-col gap-2 mb-4 p-4 bg-surface-container-high rounded-xl">
      <h4 className="font-label-sm text-primary uppercase tracking-widest text-[10px]">AI Recipe Confidence Metrics</h4>
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-surface border border-outline-variant/30 px-3 py-1 rounded-full text-xs">
          <span className="material-symbols-outlined text-tertiary text-sm">science</span>
          <span className="font-bold text-primary">Chemical: 98%</span>
        </div>
        <div className="flex items-center gap-1 bg-surface border border-outline-variant/30 px-3 py-1 rounded-full text-xs">
          <span className="material-symbols-outlined text-secondary text-sm">health_and_safety</span>
          <span className="font-bold text-primary">Safety: 100%</span>
        </div>
        <div className="flex items-center gap-1 bg-surface border border-outline-variant/30 px-3 py-1 rounded-full text-xs">
          <span className="material-symbols-outlined text-primary text-sm">public</span>
          <span className="font-bold text-primary">Cultural: 92%</span>
        </div>
      </div>
    </div>
  );
};
