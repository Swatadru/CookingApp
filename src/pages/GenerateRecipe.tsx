import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type GenerationState = 'idle' | 'generating' | 'result';

export const GenerateRecipe = () => {
  const navigate = useNavigate();
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [ingredients, setIngredients] = useState('');
  const [timeLimit, setTimeLimit] = useState('30m');
  const [dietary, setDietary] = useState<string[]>([]);
  const [generatedData, setGeneratedData] = useState<{title: string, ingredients: string[], directions: string} | null>(null);
  
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) return;
    setGenerationState('generating');
    
    try {
      const ingredientList = ingredients.split(',').map(i => i.trim()).filter(i => i);
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingredientList })
      });
      
      if (!res.ok) throw new Error('Generation failed');
      
      const data = await res.json();
      setGeneratedData(data);
      setGenerationState('result');
    } catch (err) {
      console.error(err);
      // Fallback if backend isn't running
      setTimeout(() => {
        setGeneratedData({
          title: "AI Synthesis Error",
          ingredients: ["Make sure the backend is running"],
          directions: "Run uvicorn app.main:app in the backend folder."
        });
        setGenerationState('result');
      }, 2000);
    }
  };

  const toggleDietary = (diet: string) => {
    setDietary(prev => 
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  return (
    <div className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop min-h-screen max-w-container-max mx-auto relative">
      
      {/* Background Ornaments */}
      <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-tertiary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="text-center mb-16 reveal-up">
          <div className="inline-flex items-center gap-2 text-secondary mb-4">
            <span className="material-symbols-outlined">psychology</span>
            <span className="font-label-sm uppercase font-bold tracking-widest">Recipe Engine</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary mb-4">Craft the Impossible.</h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">
            Input your available ingredients, constraints, and cravings. Our AI will synthesize a masterpiece tailored precisely to your kitchen's current state.
          </p>
        </header>

        {/* State: IDLE (Form) */}
        {generationState === 'idle' && (
          <form onSubmit={handleGenerate} className="glass-card p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/20 reveal-scale">
            
            <div className="space-y-10">
              {/* Ingredients Input */}
              <div className="space-y-4">
                <label className="font-label-sm text-primary uppercase tracking-widest">Base Ingredients</label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary/50 group-focus-within:text-secondary transition-colors">grocery</span>
                  <input 
                    type="text" 
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="e.g. Chicken thighs, lemons, forgotten spinach..." 
                    className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl py-5 pl-16 pr-6 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all shadow-inner text-lg placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Time Constraint */}
                <div className="space-y-4">
                  <label className="font-label-sm text-primary uppercase tracking-widest">Time Constraint</label>
                  <div className="flex bg-surface-container-low/50 p-2 rounded-2xl border border-outline-variant/30">
                    {['15m', '30m', '60m', 'Any'].map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setTimeLimit(time)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${timeLimit === time ? 'bg-secondary text-surface shadow-md' : 'text-on-surface-variant hover:bg-surface-container'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Profiles */}
                <div className="space-y-4">
                  <label className="font-label-sm text-primary uppercase tracking-widest">Dietary Profiles</label>
                  <div className="flex flex-wrap gap-2">
                    {['Vegetarian', 'Vegan', 'Keto', 'Gluten-Free', 'High Protein'].map(diet => (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => toggleDietary(diet)}
                        className={`px-4 py-2.5 rounded-xl font-label-sm border transition-all duration-300 ${dietary.includes(diet) ? 'bg-tertiary border-tertiary text-surface shadow-md shadow-tertiary/20' : 'bg-surface-container-low/50 border-outline-variant/30 text-on-surface-variant hover:border-secondary/50 hover:text-secondary'}`}
                      >
                        {diet}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={!ingredients.trim()}
                  className="w-full py-5 rounded-2xl bg-primary text-surface font-display-lg text-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary hover:shadow-[0_10px_40px_rgba(148,73,37,0.4)] transition-all duration-300 group"
                >
                  <span className="material-symbols-outlined group-hover:animate-spin">autorenew</span>
                  Synthesize Recipe
                </button>
              </div>
            </div>
          </form>
        )}

        {/* State: GENERATING (Loading) */}
        {generationState === 'generating' && (
          <div className="glass-card p-16 rounded-[3rem] shadow-2xl border border-secondary/30 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent animate-pulse"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full border-4 border-surface-container flex items-center justify-center relative mb-8">
                <div className="absolute inset-0 rounded-full border-t-4 border-secondary animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-r-4 border-tertiary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <span className="material-symbols-outlined text-4xl text-primary animate-pulse">model_training</span>
              </div>
              
              <h2 className="font-display-lg text-3xl text-primary mb-2">Omniscient Synthesis</h2>
              <div className="flex flex-col items-center gap-2 font-mono text-secondary text-sm">
                <span className="animate-pulse">Analyzing chemical compatibility...</span>
                <span className="animate-pulse" style={{ animationDelay: '1s' }}>Mapping {ingredients.split(',')[0] || 'ingredients'} to global flavor matrices...</span>
                <span className="animate-pulse" style={{ animationDelay: '2s' }}>Simulating thermodynamic requirements...</span>
              </div>
            </div>
          </div>
        )}

        {/* State: RESULT */}
        {generationState === 'result' && (
          <div className="reveal-up space-y-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="bg-secondary/10 text-secondary font-bold px-3 py-1 rounded-full uppercase tracking-tighter mb-3 inline-block">Synthesis Complete</span>
                <h2 className="font-display-lg text-4xl text-primary">{generatedData?.title || 'Generated Recipe'}</h2>
              </div>
              <button 
                onClick={() => setGenerationState('idle')}
                className="text-on-surface-variant hover:text-secondary flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined">restart_alt</span> Regenerate
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Recipe Image/Preview */}
              <div className="md:col-span-5 relative rounded-3xl overflow-hidden shadow-xl aspect-square">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqFCmrg_B9wMgymNRgJOXIOfFVk_6defchY4RvPRV5cVzWsrI5c9P3Lbtm78Y4_P5EbOx2BW62PQvs4iusr5zAYoQYt_nizCxSe0Nbk7U77qLBobGDeuyLVYk2vz2_T86KPJztwB958JzsypIaUo1QOHL7SIIkIRLA4bAIdxJ7hZwvCnoaTkyYHyVFI4yU0OiAkPo7FHJ456PRhp0NJZzKCO6HeW_gp9qAe7NnEijcoy_W55W6twnlL9VM-YhMMDo9UzXs1qqIYnd7" 
                  alt="Generated Recipe" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between text-surface">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">timer</span>
                    <span className="font-bold">{timeLimit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">local_fire_department</span>
                    <span className="font-bold">450 kcal</span>
                  </div>
                </div>
              </div>

              {/* Action Board */}
              <div className="md:col-span-7 flex flex-col gap-6 justify-center">
                <div className="glass-card p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 max-h-64 overflow-y-auto no-scrollbar">
                  <h4 className="font-bold text-primary mb-2">Ingredients</h4>
                  <ul className="list-disc pl-5 mb-4 text-on-surface-variant text-sm">
                    {generatedData?.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                  <h4 className="font-bold text-primary mb-2">Directions</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap">
                    {generatedData?.directions}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => navigate('/cook-with-ai')} className="w-full py-4 rounded-2xl bg-primary-container text-surface font-bold flex justify-center items-center gap-2 hover:bg-secondary transition-colors shadow-md group">
                    <span className="material-symbols-outlined group-hover:animate-pulse">bolt</span>
                    Cook with AI
                  </button>
                  <button onClick={() => navigate('/library')} className="w-full py-4 rounded-2xl border border-primary text-primary font-bold flex justify-center items-center gap-2 hover:bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined">bookmark_add</span>
                    Save to Library
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
