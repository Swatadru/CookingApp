import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import type { AllergenViolation, AllergenSwapResult } from '../utils/apiClient';

export const AllergenScannerWidget: React.FC = () => {
  const [ingredientsText, setIngredientsText] = useState<string>(
    'wheat flour, heavy cream, peanut butter, sugar, milk'
  );
  const [allergies, setAllergies] = useState<string[]>(['Gluten-Free', 'Vegan', 'Nut Allergy']);
  const [violations, setViolations] = useState<AllergenViolation[]>([]);
  const [swapResult, setSwapResult] = useState<AllergenSwapResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const handleScan = async () => {
    const list = ingredientsText
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);
    setLoading(true);
    const vList = await apiClient.scanAllergens(list, allergies);
    setViolations(vList);
    setLoading(false);
  };

  const handleSwap = async () => {
    const list = ingredientsText
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);
    setLoading(true);
    const sRes = await apiClient.swapAllergens(list, allergies);
    setSwapResult(sRes);
    setLoading(false);
  };

  useEffect(() => {
    handleScan();
  }, [allergies, ingredientsText]);

  return (
    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] bg-surface-container-low/70 border border-outline-variant/20 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
        <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
          <span className="material-symbols-outlined text-xl">published_with_changes</span>
        </div>
        <div>
          <h3 className="font-display-lg text-xl text-primary font-bold">
            Phase 7: Cultural Allergen Scanner & Swapper
          </h3>
          <p className="text-xs text-on-surface-variant">
            Dietary constraint validation & cultural replacement engine (`/api/allergens/scan`, `/api/allergens/swap`)
          </p>
        </div>
      </div>

      {/* Allergies Chips */}
      <div>
        <label className="text-xs font-label-sm uppercase tracking-wider text-on-surface-variant font-bold block mb-2">
          Select Active Restrictions:
        </label>
        <div className="flex flex-wrap gap-2">
          {['Gluten-Free', 'Vegan', 'Nut Allergy', 'Dairy-Free'].map((item) => {
            const active = allergies.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggleAllergy(item)}
                className={`px-4 py-2 rounded-xl text-xs font-label-sm font-bold transition-all ${
                  active
                    ? 'bg-tertiary text-surface shadow-md'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                {active ? '✓ ' : '+ '}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ingredients Box */}
      <div>
        <label className="text-xs font-label-sm uppercase tracking-wider text-on-surface-variant font-bold block mb-2">
          Ingredient Input List:
        </label>
        <input
          type="text"
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          className="w-full bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-xs font-mono text-primary focus:outline-none focus:border-tertiary shadow-inner"
        />
      </div>

      {/* Scan Results */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-tertiary">health_and_safety</span>
            Scan Violations ({violations.length})
          </h4>

          <button
            onClick={handleSwap}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-tertiary text-surface font-label-sm text-xs font-bold hover:bg-primary transition-all shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">swap_horiz</span>
            Execute Cultural Swap
          </button>
        </div>

        {violations.length > 0 ? (
          <div className="space-y-2">
            {violations.map((v, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-error/10 border border-error/20 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-error">⚠️ {v.ingredient}</span>
                <span className="bg-error/20 text-error px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold">
                  Violates {v.violation}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
            Safe! No ingredient violations found against active dietary restrictions.
          </div>
        )}
      </div>

      {/* Swap Output Box */}
      {swapResult && (
        <div className="bg-surface p-5 rounded-2xl border border-tertiary/30 space-y-3">
          <h4 className="font-label-sm text-xs uppercase tracking-widest text-tertiary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">autostop</span>
            Backend Swap Recommendations (`/api/allergens/swap`)
          </h4>

          <div className="space-y-2">
            {swapResult.swaps_made.map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-tertiary/10 border border-tertiary/20 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="line-through text-on-surface-variant opacity-70 font-mono">
                    {s.original}
                  </span>
                  <span className="material-symbols-outlined text-tertiary text-sm">arrow_forward</span>
                  <span className="font-bold text-primary">{s.substitute}</span>
                </div>
                <p className="text-[11px] text-secondary font-mono">Reason: {s.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
