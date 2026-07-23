import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import type { CuisineClassificationResult } from '../utils/apiClient';

interface CuisineClassifierWidgetProps {
  ingredients?: string[];
}

export const CuisineClassifierWidget: React.FC<CuisineClassifierWidgetProps> = ({ ingredients }) => {
  const [testIngredients, setTestIngredients] = useState<string>(
    ingredients ? ingredients.join(', ') : 'Chicken, Butter, Garam Masala, Onion, Tomato, Cream'
  );
  const [classification, setClassification] = useState<CuisineClassificationResult>({
    predicted_cuisine: 'INDIAN',
    probabilities: { INDIAN: 0.92, THAI: 0.05, CHINESE: 0.03 },
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function classify() {
      const list = testIngredients
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);
      if (list.length === 0) return;
      setLoading(true);
      const res = await apiClient.classifyCuisine(list);
      setClassification(res);
      setLoading(false);
    }
    classify();
  }, [testIngredients]);

  return (
    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] bg-surface-container-low/70 border border-outline-variant/20 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined text-xl">psychology</span>
        </div>
        <div>
          <h3 className="font-display-lg text-xl text-primary font-bold">
            Phase 3: Cuisine Classifier (XGBoost ML)
          </h3>
          <p className="text-xs text-on-surface-variant">
            Analyzes ingredient vectors to predict authentic culinary origins (`/api/classify`)
          </p>
        </div>
      </div>

      {/* Ingredient Input Box */}
      <div>
        <label className="text-xs font-label-sm uppercase tracking-wider text-on-surface-variant font-bold block mb-2">
          Test Ingredient Vector:
        </label>
        <input
          type="text"
          value={testIngredients}
          onChange={(e) => setTestIngredients(e.target.value)}
          placeholder="e.g. Soy sauce, ginger, sesame oil, garlic, tofu"
          className="w-full bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-xs font-mono text-primary focus:outline-none focus:border-secondary shadow-inner"
        />
      </div>

      {/* Prediction Output Pill */}
      <div className="bg-surface p-5 rounded-2xl border border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-label-sm uppercase tracking-widest text-on-surface-variant block mb-1">
            Predicted Cuisine Output
          </span>
          <span className="font-display-lg text-2xl font-bold text-secondary uppercase tracking-wide">
            {classification.predicted_cuisine}
          </span>
        </div>

        <div className="bg-secondary/10 px-4 py-2 rounded-xl border border-secondary/20 font-mono text-xs font-bold text-secondary">
          ⚡ Model: XGBoost-v4
        </div>
      </div>

      {/* Probability Bars */}
      <div className="space-y-3">
        <h4 className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2">
          Cuisine Probability Distribution
        </h4>

        {loading ? (
          <div className="p-4 text-center text-xs text-on-surface-variant font-mono animate-pulse">
            Computing TF-IDF vector & XGBoost inference...
          </div>
        ) : (
          Object.entries(classification.probabilities).map(([cuisine, prob]) => {
            const pct = Math.round(prob * 100);
            return (
              <div key={cuisine} className="space-y-1">
                <div className="flex justify-between text-xs font-label-sm font-bold">
                  <span className="text-primary uppercase">{cuisine}</span>
                  <span className="text-secondary font-mono">{pct}%</span>
                </div>
                <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
