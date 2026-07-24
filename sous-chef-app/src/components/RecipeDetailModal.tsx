import React, { useState, useEffect } from 'react';
import type { Recipe } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { apiClient } from '../utils/apiClient';
import { getDeterministicImageForRecipe } from '../utils/imageUtils';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  isOpen,
  onClose,
}) => {
  const { isRecipeSaved, toggleSaveRecipe } = useUser();
  const [activeTab, setActiveTab] = useState<'ingredients' | 'chemistry' | 'allergy' | 'heat'>('ingredients');
  const [servings, setServings] = useState<number>(2);
  const [appliedSwaps, setAppliedSwaps] = useState<Record<string, string>>({});
  const [detailedRecipe, setDetailedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && recipe) {
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        setIsLoading(true);
        apiClient.getRecipeById(recipe.id.toString())
          .then(data => {
            setDetailedRecipe({ ...recipe, ...data });
          })
          .catch(err => console.error("Failed to fetch recipe details", err))
          .finally(() => setIsLoading(false));
      }
    } else {
      setDetailedRecipe(null);
      setAppliedSwaps({});
      setServings(2);
      setActiveTab('ingredients');
    }
  }, [isOpen, recipe]);

  if (!isOpen || !recipe) return null;
  const activeRecipe = detailedRecipe || recipe;

  const saved = isRecipeSaved(activeRecipe.id);

  // Helper to scale ingredient amounts
  const scaleAmount = (ingredientStr: string, multiplier: number) => {
    // Check if swap was applied
    let currentStr = ingredientStr;
    Object.entries(appliedSwaps).forEach(([orig, sub]) => {
      if (currentStr.toLowerCase().includes(orig.toLowerCase())) {
        currentStr = currentStr.replace(new RegExp(orig, 'gi'), sub);
      }
    });

    if (multiplier === 1) return currentStr;

    // Match leading numbers or numbers before units
    return currentStr.replace(/(\d+(?:\.\d+)?)/g, (match) => {
      const val = parseFloat(match);
      const scaled = val * multiplier;
      return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
    });
  };

  const scaleFactor = servings / 2;

  const defaultChemistry = activeRecipe.chemistry || {
    maillardTemp: '145°C - 165°C (Optimal amino-acid browning)',
    phLevel: 5.8,
    emulsionStability: '94% Equilibrium (Lipid-Aqueous Bond)',
    gelatinizationTemp: '65°C Starch Hydration',
    keyFlavors: ['Pyrazines', 'Limonene', 'Guaiacol', 'Glutamate'],
  };

  const defaultHeat = activeRecipe.heatRequirement || {
    cookingMethod: 'High Thermal Conductivity Pan-Sear & Low Simmer',
    recommendedVessel: 'Heavy Cast Iron Skillet / Enamelled Dutch Oven',
    preheatDuration: '4 to 5 minutes over medium-high heat',
    targetInternalTemp: '74°C (Poultry) / 63°C (Fish/Beef)',
    stovetopSetting: 'Medium-High (70% Dial Output)',
  };

  const defaultSwaps = activeRecipe.allergySwaps || [
    {
      allergen: 'Dairy',
      original: 'Butter',
      substitute: 'Extra Virgin Olive Oil / Avocado Oil',
      macroImpact: '-5g Saturated Fat, +Oleic Acid',
    },
    {
      allergen: 'Gluten',
      original: 'Flour',
      substitute: 'Almond Flour / Cassava Flour blend',
      macroImpact: 'Gluten-Free, +2g Fiber',
    },
    {
      allergen: 'Nuts',
      original: 'Peanuts / Almonds',
      substitute: 'Toasted Pumpkin Seeds (Pepitas)',
      macroImpact: 'Nut-Free, +High Magnesium',
    },
    {
      allergen: 'Egg',
      original: 'Eggs',
      substitute: 'Flax Egg (1 tbsp ground flax + 3 tbsp water)',
      macroImpact: 'Vegan, +Omega-3 ALA',
    },
  ];

  const toggleSwap = (original: string, substitute: string) => {
    setAppliedSwaps((prev) => {
      if (prev[original] === substitute) {
        const copy = { ...prev };
        delete copy[original];
        return copy;
      }
      return { ...prev, [original]: substitute };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-surface/95 border border-outline-variant/30 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="relative h-48 md:h-64 overflow-hidden shrink-0">
          <img
            src={activeRecipe.image || getDeterministicImageForRecipe(activeRecipe.title)}
            onError={(e) => {
              const fallback = getDeterministicImageForRecipe(activeRecipe.title);
              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
            alt={activeRecipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition-all z-10"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Top Left Tags & Save */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="bg-secondary text-surface font-label-sm px-3 py-1 rounded-full text-xs font-bold uppercase">
              {activeRecipe.cuisine}
            </span>
            <button
              onClick={() => toggleSaveRecipe(activeRecipe.id)}
              className="px-3 py-1 rounded-full bg-black/40 text-white backdrop-blur-md text-xs font-label-sm flex items-center gap-1 hover:bg-black/60 transition-all"
            >
              <span
                className="material-symbols-outlined text-sm"
                style={{
                  fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0",
                  color: saved ? '#fe9e72' : '#ffffff',
                }}
              >
                favorite
              </span>
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-surface">
          {/* Title & Macros (Moved from image overlay) */}
          <div className="mb-8">
            <h2 className="font-display-lg text-2xl md:text-3xl text-on-surface font-bold leading-tight">
              {activeRecipe.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-on-surface-variant text-sm font-label-sm mt-3">
              <span className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-md">
                <span className="material-symbols-outlined text-[16px]">timer</span>
                {activeRecipe.prepTime}
              </span>
              <span className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-md">
                <span className="material-symbols-outlined text-[16px] text-secondary">local_fire_department</span>
                {Math.round(activeRecipe.calories * scaleFactor)} kcal ({servings} servings)
              </span>
              <span className="bg-surface-container-high px-2 py-1 rounded-md">P: {Math.round(activeRecipe.protein * scaleFactor)}g</span>
              <span className="bg-surface-container-high px-2 py-1 rounded-md">F: {Math.round(activeRecipe.fat * scaleFactor)}g</span>
              <span className="bg-surface-container-high px-2 py-1 rounded-md">C: {Math.round(activeRecipe.carbs * scaleFactor)}g</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-outline-variant/20 bg-surface-container-low/80 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`flex items-center gap-2 px-6 py-4 font-label-sm text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'ingredients'
                ? 'border-secondary text-secondary bg-surface'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">scale</span>
            Ingredients & Portion Scaler
          </button>

          <button
            onClick={() => setActiveTab('chemistry')}
            className={`flex items-center gap-2 px-6 py-4 font-label-sm text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'chemistry'
                ? 'border-secondary text-secondary bg-surface'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">science</span>
            Chemistry Evaluator
          </button>

          <button
            onClick={() => setActiveTab('allergy')}
            className={`flex items-center gap-2 px-6 py-4 font-label-sm text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'allergy'
                ? 'border-secondary text-secondary bg-surface'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">published_with_changes</span>
            Allergy Swapper
          </button>

          <button
            onClick={() => setActiveTab('heat')}
            className={`flex items-center gap-2 px-6 py-4 font-label-sm text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'heat'
                ? 'border-secondary text-secondary bg-surface'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">thermostat</span>
            Heat & Thermal Guide
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: INGREDIENTS & PORTION SCALER */}
          {activeTab === 'ingredients' && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin"></div>
                </div>
              ) : (
                <>
              {/* Scaler Controls */}
              <div className="bg-surface-container-high/60 p-4 rounded-2xl border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-display-lg text-lg text-primary">
                    Ingredients Amount Requirement
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Dynamically recalculate exact measurements and weights for your target yield.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-surface p-1.5 rounded-xl border border-outline-variant/30">
                  <span className="text-xs font-label-sm text-on-surface-variant px-2">
                    Servings:
                  </span>
                  <button
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="w-8 h-8 rounded-lg bg-surface-container text-primary font-bold hover:bg-secondary hover:text-white transition-colors flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="font-display-lg text-lg font-bold w-6 text-center text-secondary">
                    {servings}
                  </span>
                  <button
                    onClick={() => setServings(servings + 1)}
                    className="w-8 h-8 rounded-lg bg-surface-container text-primary font-bold hover:bg-secondary hover:text-white transition-colors flex items-center justify-center"
                  >
                    +
                  </button>

                  <div className="flex gap-1 ml-2 border-l border-outline-variant/30 pl-2">
                    {[1, 2, 4, 6, 8].map((num) => (
                      <button
                        key={num}
                        onClick={() => setServings(num)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-label-sm transition-all ${
                          servings === num
                            ? 'bg-secondary text-surface font-bold'
                            : 'hover:bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {num}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-outline-variant/20">
                  <h4 className="font-label-sm text-secondary uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">grocery</span>
                    Scaled Ingredient Quantities
                  </h4>
                  <ul className="space-y-3">
                    {activeRecipe.ingredients && activeRecipe.ingredients.map((ing, idx) => {
                      const scaledText = scaleAmount(ing, scaleFactor);
                      return (
                        <li
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-surface/80 border border-outline-variant/10 text-sm"
                        >
                          <span className="text-on-surface-variant font-medium">
                            {scaledText}
                          </span>
                          <span className="material-symbols-outlined text-secondary/60 text-sm">
                            check_circle
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-outline-variant/20">
                  <h4 className="font-label-sm text-secondary uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                    Cooking Steps
                  </h4>
                  <ol className="space-y-3">
                    {activeRecipe.directions && activeRecipe.directions.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-xs text-on-surface-variant">
                        <span className="w-5 h-5 rounded-full bg-primary text-surface flex items-center justify-center shrink-0 font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              </>
              )}
            </div>
          )}

          {/* TAB 2: CHEMISTRY EVALUATOR */}
          {activeTab === 'chemistry' && (
            <div className="space-y-6">
              <div className="bg-secondary/10 p-5 rounded-2xl border border-secondary/20 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary text-surface flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">science</span>
                </div>
                <div>
                  <h3 className="font-display-lg text-xl text-primary">
                    Culinary Chemistry Evaluator
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Real-time molecular thermodynamics, Maillard reaction kinetics, and pH balance analysis optimized for maximum flavor extraction.
                  </p>
                </div>
              </div>

              {activeRecipe.chemistry_notes && (
                <div className="bg-purple-500/10 p-5 rounded-2xl border border-purple-500/20 shadow-inner">
                  <h4 className="font-bold text-sm text-purple-700 flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                    AI Chemistry Insights
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed italic">
                    "{activeRecipe.chemistry_notes}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Meter 1: Maillard Reaction */}
                <div className="glass-card p-5 rounded-2xl border border-outline-variant/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-base">
                        local_fire_department
                      </span>
                      Maillard Reaction Threshold
                    </span>
                    <span className="text-xs font-mono text-secondary font-bold">155°C</span>
                  </div>
                  <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 h-full rounded-full"
                      style={{ width: '85%' }}
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant leading-normal">
                    {defaultChemistry.maillardTemp}
                  </p>
                </div>

                {/* Meter 2: pH Acidity */}
                <div className="glass-card p-5 rounded-2xl border border-outline-variant/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-base">
                        water_ph
                      </span>
                      pH Acidity Profile
                    </span>
                    <span className="text-xs font-mono text-tertiary font-bold">
                      pH {defaultChemistry.phLevel}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-gradient-to-r from-emerald-400 via-teal-500 to-sky-500 h-full rounded-full"
                      style={{ width: `${(defaultChemistry.phLevel / 14) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant leading-normal">
                    Balanced acid ratio optimizes tenderization and enhances umami perception.
                  </p>
                </div>

                {/* Meter 3: Emulsion Stability */}
                <div className="glass-card p-5 rounded-2xl border border-outline-variant/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-base">
                        opacity
                      </span>
                      Emulsion & Moisture Stability
                    </span>
                    <span className="text-xs font-mono text-amber-600 font-bold">Stable</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-normal mb-2">
                    {defaultChemistry.emulsionStability}
                  </p>
                  <div className="text-[11px] bg-surface-container p-2.5 rounded-xl text-on-surface-variant">
                    Starch Gelatinization: <strong>{defaultChemistry.gelatinizationTemp}</strong>
                  </div>
                </div>

                {/* Aromatic Compounds */}
                <div className="glass-card p-5 rounded-2xl border border-outline-variant/20">
                  <span className="font-bold text-sm text-primary flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-purple-500 text-base">
                      bubble_chart
                    </span>
                    Dominant Molecular Aromatics
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {defaultChemistry.keyFlavors.map((flavor) => (
                      <span
                        key={flavor}
                        className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-700 text-xs font-mono border border-purple-500/20"
                      >
                        🧪 {flavor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALLERGY SWAPPER */}
          {activeTab === 'allergy' && (
            <div className="space-y-6">
              <div className="bg-tertiary/10 p-5 rounded-2xl border border-tertiary/20 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary text-surface flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">published_with_changes</span>
                </div>
                <div>
                  <h3 className="font-display-lg text-xl text-primary">
                    Interactive Allergy Swapper
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Select an ingredient or allergen below to substitute safely while preserving moisture, texture, and flavor harmony.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {defaultSwaps.map((swap, idx) => {
                  const isApplied = appliedSwaps[swap.original] === swap.substitute;
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border transition-all ${
                        isApplied
                          ? 'bg-tertiary/10 border-tertiary/50 shadow-md'
                          : 'bg-surface border-outline-variant/20 hover:border-tertiary/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-tertiary/20 text-tertiary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                              {swap.allergen} Safe
                            </span>
                            <span className="text-xs text-on-surface-variant line-through opacity-70">
                              Original: {swap.original}
                            </span>
                          </div>
                          <p className="font-bold text-sm text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-tertiary text-base">
                              arrow_forward
                            </span>
                            Substitute: {swap.substitute}
                          </p>
                          <p className="text-xs text-secondary font-mono">{swap.macroImpact}</p>
                        </div>

                        <button
                          onClick={() => toggleSwap(swap.original, swap.substitute)}
                          className={`px-5 py-2.5 rounded-xl font-label-sm text-xs transition-all flex items-center gap-2 shrink-0 ${
                            isApplied
                              ? 'bg-tertiary text-surface shadow-md'
                              : 'bg-surface-container text-primary hover:bg-tertiary/20'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isApplied ? 'check_circle' : 'swap_horiz'}
                          </span>
                          {isApplied ? 'Swap Applied' : 'Apply Substitute'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: HEAT REQUIREMENT */}
          {activeTab === 'heat' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-600 text-surface flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">thermostat</span>
                </div>
                <div>
                  <h3 className="font-display-lg text-xl text-primary">
                    Heat Requirement & Thermal Guidance
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Precise thermal curve recommendations for heat conductivity, vessel material selection, and internal target temperatures.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-outline-variant/20 space-y-4">
                  <div>
                    <span className="text-[10px] font-label-sm uppercase tracking-wider text-on-surface-variant block mb-1">
                      Recommended Vessel
                    </span>
                    <p className="font-bold text-sm text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-base">skillet</span>
                      {defaultHeat.recommendedVessel}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-label-sm uppercase tracking-wider text-on-surface-variant block mb-1">
                      Preheat Duration
                    </span>
                    <p className="font-bold text-sm text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-base">timer</span>
                      {defaultHeat.preheatDuration}
                    </p>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-outline-variant/20 space-y-4">
                  <div>
                    <span className="text-[10px] font-label-sm uppercase tracking-wider text-on-surface-variant block mb-1">
                      Stovetop / Oven Setting
                    </span>
                    <p className="font-bold text-sm text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500 text-base">equalizer</span>
                      {defaultHeat.stovetopSetting}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-label-sm uppercase tracking-wider text-on-surface-variant block mb-1">
                      Target Core Temperature
                    </span>
                    <p className="font-bold text-sm text-secondary flex items-center gap-2 font-mono">
                      <span className="material-symbols-outlined text-secondary text-base">device_thermostat</span>
                      {defaultHeat.targetInternalTemp}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
