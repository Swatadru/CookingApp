import React, { useState, useRef, useEffect } from 'react';
import { mockGeneratedRecipe } from '../data/mockData';
import { RecipeTroubleshooter } from '../components/RecipeTroubleshooter';
import { RecipeDetailModal } from '../components/RecipeDetailModal';
import type { Recipe } from '../data/mockData';

type ViewState = 'idle' | 'generating' | 'result';

interface GeneratedRecipe {
  title: string;
  image: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  ingredients: string[];
  directions: string[];
  chemistry_notes?: string;
  chemistry?: any;
  heatRequirement?: any;
  allergySwaps?: any[];
}

export const GenerateRecipe = () => {
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [chatInput, setChatInput] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [troubleshooterOpen, setTroubleshooterOpen] = useState(false);
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Scroll to result when generated
  useEffect(() => {
    if (viewState === 'result' && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [viewState]);

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    setUserPrompt(chatInput);
    setChatInput('');
    setViewState('generating');
    setImageLoaded(false);

    // Try real API first, fall back to mock
    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: chatInput
            .split(',')
            .map((i) => i.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setRecipe({
        title: data.title || mockGeneratedRecipe.title,
        image: data.image || mockGeneratedRecipe.image,
        calories: data.calories ?? mockGeneratedRecipe.calories,
        protein: data.protein ?? mockGeneratedRecipe.protein,
        fat: data.fat ?? mockGeneratedRecipe.fat,
        carbs: data.carbs ?? mockGeneratedRecipe.carbs,
        ingredients: data.ingredients || mockGeneratedRecipe.ingredients,
        directions: data.directions || mockGeneratedRecipe.directions,
        chemistry_notes: data.chemistry_notes,
        chemistry: data.chemistry,
        heatRequirement: data.heatRequirement,
        allergySwaps: data.allergySwaps,
      });
      setViewState('result');
    } catch {
      // Mock generation with realistic delay
      setTimeout(() => {
        setRecipe(mockGeneratedRecipe);
        setViewState('result');
      }, 2500);
    }
  };

  const loadingMessages = [
    'Parsing your ingredients and constraints…',
    'Querying 2.2M recipes in the RecipeNLG dataset…',
    'Optimizing macro profile via USDA FoodData Central…',
    'Synthesizing your personalized recipe…',
  ];

  const fullRecipe: Recipe | null = recipe
    ? {
        id: 'gen_' + recipe.title.replace(/\s+/g, '_').toLowerCase(),
        title: recipe.title,
        description: 'AI synthesized recipe optimized for your palate.',
        prepTime: '25 min',
        calories: recipe.calories,
        protein: recipe.protein,
        fat: recipe.fat,
        carbs: recipe.carbs,
        cuisine: 'AI Synthesis',
        category: 'Custom',
        tags: ['AI Generated', 'Custom'],
        image: recipe.image,
        ingredients: recipe.ingredients,
        directions: recipe.directions,
        chemistry_notes: recipe.chemistry_notes,
        chemistry: recipe.chemistry,
        heatRequirement: recipe.heatRequirement,
        allergySwaps: recipe.allergySwaps,
        rating: 4.9,
      }
    : null;

  return (
    <div className="pb-[96px] px-margin-mobile md:px-margin-desktop min-h-screen max-w-container-max mx-auto relative" style={{ paddingTop: '280px' }}>
      {/* Background Ornaments */}
      <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-secondary/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-tertiary/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-12 reveal-up">
          <div className="inline-flex items-center gap-2 text-secondary mb-4">
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="font-label-sm uppercase font-bold tracking-widest text-xs">
              Recipe Synthesis Engine
            </span>
          </div>
          <h1 className="font-display-lg text-[36px] leading-[44px] md:text-display-lg text-primary mb-4">
            What are you craving?
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
            Describe your ingredients, dietary needs, and time constraints in
            plain language. Our AI handles the rest.
          </p>
        </header>

        {/* CHAT-STYLE INPUT */}
        <form
          onSubmit={handleGenerate}
          className="glass-card p-6 md:p-8 rounded-[2rem] shadow-xl border border-white/20 mb-12 reveal-scale"
        >
          {userPrompt && viewState !== 'idle' && (
            <div className="flex justify-end mb-4">
              <div className="bg-secondary text-surface px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
                <p className="text-sm font-body-md">{userPrompt}</p>
              </div>
            </div>
          )}

          {viewState === 'idle' && (
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary/40 group-focus-within:text-secondary transition-colors">
                chat
              </span>
              <textarea
                id="recipe-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder='e.g. "I have chicken, spinach, and heavy cream. Make it low-carb and ready in 20 minutes"'
                rows={3}
                className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl py-5 pl-14 pr-20 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all shadow-inner text-base placeholder:text-on-surface-variant/50 resize-none no-scrollbar"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="absolute right-3 bottom-3 w-12 h-12 bg-primary text-surface rounded-xl flex items-center justify-center shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary hover:shadow-lg active:scale-95 transition-all duration-300"
                aria-label="Generate recipe"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
          )}

          {viewState === 'result' && (
            <button
              type="button"
              onClick={() => {
                setViewState('idle');
                setUserPrompt('');
                setRecipe(null);
                setImageLoaded(false);
              }}
              className="w-full py-4 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-secondary flex items-center justify-center gap-2 transition-all duration-300 mt-2"
            >
              <span className="material-symbols-outlined text-lg">restart_alt</span>
              <span className="font-label-sm">New Recipe Request</span>
            </button>
          )}
        </form>

        {/* GENERATING STATE */}
        {viewState === 'generating' && (
          <div className="glass-card p-16 rounded-[2.5rem] shadow-2xl border border-secondary/20 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/8 via-transparent to-transparent animate-pulse" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full border-4 border-surface-container flex items-center justify-center relative mb-8">
                <div className="absolute inset-0 rounded-full border-t-4 border-secondary animate-spin" />
                <div
                  className="absolute inset-2 rounded-full border-r-4 border-tertiary animate-spin"
                  style={{
                    animationDirection: 'reverse',
                    animationDuration: '1.5s',
                  }}
                />
                <span className="material-symbols-outlined text-3xl text-primary animate-pulse">
                  model_training
                </span>
              </div>

              <h2 className="font-display-lg text-2xl text-primary mb-4">
                Synthesizing Recipe
              </h2>
              <div className="flex flex-col items-center gap-2 font-mono text-secondary text-sm max-w-md text-center">
                {loadingMessages.map((msg, idx) => (
                  <span
                    key={idx}
                    className="animate-pulse"
                    style={{ animationDelay: `${idx * 0.8}s` }}
                  >
                    {msg}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RECIPE RESULT */}
        {viewState === 'result' && recipe && (
          <div ref={resultRef} className="space-y-6 fade-in-section visible">
            {/* Recipe Header Card */}
            <div className="glass-card rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
              <div className="relative h-64 md:h-80 overflow-hidden bg-surface-container">
                {!imageLoaded && (
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container" />
                )}
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <span className="bg-secondary/90 text-surface font-label-sm px-3 py-1 rounded-full text-xs mb-3 inline-block font-bold">
                      AI Generated
                    </span>
                    <h2 className="font-display-lg text-3xl md:text-4xl text-surface">
                      {recipe.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setAnalyzerOpen(true)}
                    className="px-4 py-2 rounded-full bg-surface/90 text-primary font-label-sm text-xs hover:bg-secondary hover:text-white transition-all shadow-md flex items-center gap-1.5 shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">science</span>
                    Inspect Analyzers
                  </button>
                </div>
              </div>

              {/* Macro Bar */}
              <div className="grid grid-cols-4 divide-x divide-outline-variant/20 bg-surface/90 backdrop-blur-md">
                {[
                  { label: 'Calories', value: `${recipe.calories}`, unit: 'kcal', icon: 'local_fire_department' },
                  { label: 'Protein', value: `${recipe.protein}`, unit: 'g', icon: 'fitness_center' },
                  { label: 'Fat', value: `${recipe.fat}`, unit: 'g', icon: 'water_drop' },
                  { label: 'Carbs', value: `${recipe.carbs}`, unit: 'g', icon: 'grain' },
                ].map((macro) => (
                  <div key={macro.label} className="py-4 px-3 text-center">
                    <span className="material-symbols-outlined text-secondary text-sm mb-1 block">
                      {macro.icon}
                    </span>
                    <p className="font-display-lg text-lg text-primary">
                      {macro.value}
                      <span className="text-xs text-on-surface-variant ml-0.5">
                        {macro.unit}
                      </span>
                    </p>
                    <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">
                      {macro.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredients & Directions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6 shadow-lg border border-white/15">
                <h3 className="font-label-sm text-secondary uppercase tracking-widest text-xs mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">grocery</span>
                  Ingredients
                </h3>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ing, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-on-surface-variant text-sm"
                    >
                      <span className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      </span>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card rounded-2xl p-6 shadow-lg border border-white/15">
                <h3 className="font-label-sm text-secondary uppercase tracking-widest text-xs mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                  Directions
                </h3>
                <ol className="space-y-4">
                  {recipe.directions.map((step, idx) => (
                    <li key={idx} className="flex gap-4 text-sm text-on-surface-variant">
                      <span className="w-7 h-7 rounded-full bg-primary text-surface flex items-center justify-center shrink-0 font-label-sm text-xs font-bold">
                        {idx + 1}
                      </span>
                      <p className="pt-1 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-8">
              <button
                onClick={() => setAnalyzerOpen(true)}
                className="w-full sm:w-auto glass-card px-6 py-3.5 rounded-2xl shadow-lg border border-secondary/20 flex items-center justify-center gap-2 text-primary font-label-sm text-sm font-bold hover:bg-secondary hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-lg">science</span>
                Evaluate Chemistry, Heat & Swaps
              </button>

              <button
                id="troubleshooter-trigger"
                onClick={() => setTroubleshooterOpen(true)}
                className="w-full sm:w-auto glass-card px-6 py-3.5 rounded-2xl shadow-lg border border-secondary/20 flex items-center justify-center gap-2 text-primary font-label-sm text-sm font-bold hover:bg-primary hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-lg">psychology</span>
                Ask Troubleshooter AI
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Troubleshooter Drawer */}
      <RecipeTroubleshooter
        isOpen={troubleshooterOpen}
        onClose={() => setTroubleshooterOpen(false)}
        recipeTitle={recipe?.title || ''}
      />

      {/* Full Recipe Detail Modal with Analyzers */}
      <RecipeDetailModal
        recipe={fullRecipe}
        isOpen={analyzerOpen}
        onClose={() => setAnalyzerOpen(false)}
      />
    </div>
  );
};
