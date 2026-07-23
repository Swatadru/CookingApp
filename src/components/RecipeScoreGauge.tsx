import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import type { RecipeScoreResult } from '../utils/apiClient';

interface RecipeScoreGaugeProps {
  recipeData?: {
    ingredients: string[];
    steps: string[];
  };
}

export const RecipeScoreGauge: React.FC<RecipeScoreGaugeProps> = ({ recipeData }) => {
  const [scoreResult, setScoreResult] = useState<RecipeScoreResult>({
    score: 94.5,
    status: 'VALID',
    breakdown: {
      chemistry_score: 0.96,
      physics_score: 0.93,
      taste_score: 5,
      safety_score: 4.8,
      authenticity_score: 4.9,
    },
    contradiction_result: {
      logic_score: 0.95,
      contradictions: [],
    },
  });

  useEffect(() => {
    async function fetchScore() {
      if (!recipeData) return;
      const res = await apiClient.scoreRecipe(recipeData);
      setScoreResult(res);
    }
    fetchScore();
  }, [recipeData]);

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5 text-amber-500">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="material-symbols-outlined text-sm font-fill">
            {i < full ? 'star' : i === full && half ? 'star_half' : 'star_outline'}
          </span>
        ))}
        <span className="text-xs text-on-surface-variant font-mono ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] bg-surface-container-lowest/80 border border-outline-variant/20 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-xl">verified</span>
          </div>
          <div>
            <h3 className="font-display-lg text-xl text-primary font-bold">
              Phase 8: Recipe Validity Classifier
            </h3>
            <p className="text-xs text-on-surface-variant">
              Cookability Score & Safety Evaluation (`/api/recipe/score`)
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-label-sm font-bold uppercase tracking-wider ${
            scoreResult.status === 'VALID'
              ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
          }`}
        >
          {scoreResult.status}
        </span>
      </div>

      {/* Big Score Gauge Dial */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 bg-surface p-6 rounded-2xl border border-outline-variant/20">
        <div className="text-center sm:text-left">
          <span className="text-xs font-label-sm uppercase tracking-wider text-on-surface-variant font-bold block mb-1">
            Overall Cookability Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-5xl font-bold text-secondary">
              {scoreResult.score}
            </span>
            <span className="text-sm text-on-surface-variant font-mono">/ 100</span>
          </div>
          <p className="text-xs text-emerald-600 font-bold mt-1">
            ✓ Chemically & physically viable recipe
          </p>
        </div>

        {/* 3 Metrics Stars Breakdown */}
        <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-outline-variant/20 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
          <div className="flex items-center justify-between gap-6 text-xs">
            <span className="text-on-surface-variant font-bold">Taste Score:</span>
            {renderStars(scoreResult.breakdown.taste_score)}
          </div>
          <div className="flex items-center justify-between gap-6 text-xs">
            <span className="text-on-surface-variant font-bold">Safety Score (USDA):</span>
            {renderStars(scoreResult.breakdown.safety_score)}
          </div>
          <div className="flex items-center justify-between gap-6 text-xs">
            <span className="text-on-surface-variant font-bold">Authenticity Score:</span>
            {renderStars(scoreResult.breakdown.authenticity_score)}
          </div>
        </div>
      </div>

      {/* Chemistry & Physics breakdown meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-surface-container-high/60 border border-outline-variant/20">
          <div className="flex justify-between text-xs mb-1 font-bold">
            <span className="text-primary">Chemical Viability</span>
            <span className="text-secondary">{Math.round(scoreResult.breakdown.chemistry_score * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full"
              style={{ width: `${scoreResult.breakdown.chemistry_score * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-high/60 border border-outline-variant/20">
          <div className="flex justify-between text-xs mb-1 font-bold">
            <span className="text-primary">Physical Physics Score</span>
            <span className="text-tertiary">{Math.round(scoreResult.breakdown.physics_score * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-tertiary rounded-full"
              style={{ width: `${scoreResult.breakdown.physics_score * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
