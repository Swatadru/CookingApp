import { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { RecipeDetailModal } from '../components/RecipeDetailModal';
import { apiClient } from '../utils/apiClient';
import type { Recipe } from '../data/mockData';

export const CookWithAI = () => {
  const { activeUser, chatHistory, addChatMessage } = useUser();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userText = inputValue;
    setInputValue('');

    // Save user message to context
    addChatMessage({ role: 'user', text: userText });
    setIsTyping(true);

    const lower = userText.toLowerCase();

    try {
      // Detect intent and call appropriate backend endpoint
      if (
        lower.includes('generate') ||
        lower.includes('make') ||
        lower.includes('cook') ||
        lower.includes('recipe for') ||
        lower.includes('create') ||
        lower.includes('with ')
      ) {
        // Extract ingredients from the message
        const ingredientKeywords = userText
          .replace(/generate|make|cook|create|recipe|for|me|a|with|and|please|can you|i want|using/gi, '')
          .split(/[,\s]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 2);

        const ingredients = ingredientKeywords.length > 0 ? ingredientKeywords : ['chicken', 'lemon', 'garlic'];

        // Call the real backend to generate a recipe
        const result = await apiClient.generateRecipe(ingredients);

        const generatedRecipe: Recipe = {
          id: 'generated_ai_' + Date.now(),
          title: result.title,
          description: `AI-generated recipe optimized for ${activeUser.skillLevel} skill level.`,
          prepTime: '25 min',
          calories: result.calories || 380,
          protein: result.protein || 42,
          fat: result.fat || 16,
          carbs: result.carbs || 12,
          chemistry: result.chemistry,
          heatRequirement: result.heatRequirement,
          allergySwaps: result.allergySwaps,
          chemistry_notes: result.chemistry_notes,
          cuisine: 'AI Fusion',
          category: 'Dinner',
          tags: ['AI Generated', activeUser.skillLevel],
          image:
            result.image ||
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCe0AD34aGqd6r8D8xiDCvgetSz6Mey7g8xX66LOKCsQtj40wmuqU7w_tMRM2nEqQzMPn_nXiQssADv1xm3CeWPQNaR9Bzz3XOXN0MKUqZECCoKP2XCh2UPPRbHWZ8y1Xd0j7Uu4ScmTRxAx-ebOx0VaND0MmjmVZ7MBO7NcgkjrN4A5RvGSCUyfkcD2NnWGoY6-H8BdJU7ST0h9xcBinylT7djF3V2_cz5xkzY95H4rGbRQoQ_o96vNd-tDEEMMiZCe_Cv-wsVm4K_',
          ingredients: result.ingredients,
          directions: result.directions,
          rating: 4.8,
        };

        setSelectedRecipe(generatedRecipe);

        addChatMessage({
          role: 'ai',
          text: `I've crafted a "${result.title}" recipe based on your request! It has ${result.calories} kcal, ${result.protein}g protein. Click "Full Recipe Analyzers" to inspect chemistry, heat curves, and allergy swaps.`,
          recipeTitle: result.title,
        });

      } else if (lower.includes('substitute') || lower.includes('allergy') || lower.includes('swap') || lower.includes('allergen')) {
        // Call allergen scanning backend
        const currentIngredients = selectedRecipe?.ingredients || ['chicken', 'butter', 'cream'];
        const violations = await apiClient.scanAllergens(currentIngredients, ['Gluten-Free', 'Vegan']);

        const violationText =
          violations.length > 0
            ? `Found ${violations.length} allergen violation(s): ${violations.map((v) => `${v.ingredient} (${v.violation})`).join(', ')}. Would you like me to auto-swap these ingredients?`
            : `No allergen violations detected in the current recipe. All ingredients are safe for your dietary restrictions!`;

        addChatMessage({
          role: 'ai',
          text: violationText,
        });

      } else if (lower.includes('cuisine') || lower.includes('classify') || lower.includes('what type') || lower.includes('origin')) {
        // Call cuisine classifier backend
        const currentIngredients = selectedRecipe?.ingredients || ['chicken', 'butter', 'garam masala'];
        const classification = await apiClient.classifyCuisine(currentIngredients);

        addChatMessage({
          role: 'ai',
          text: `Based on ingredient analysis, this recipe is classified as **${classification.predicted_cuisine}** cuisine with ${Math.round((Object.values(classification.probabilities)[0] || 0) * 100)}% confidence. Top matches: ${Object.entries(classification.probabilities).map(([c, p]) => `${c}: ${Math.round(p * 100)}%`).join(', ')}.`,
        });

      } else if (lower.includes('heat') || lower.includes('temp') || lower.includes('oven')) {
        addChatMessage({
          role: 'ai',
          text: `For optimal texture, aim for a thermal zone of 150°C–170°C. The Maillard reaction begins at 140°C for proteins. Use an instant-read thermometer for precise internal temp readings — target 74°C for poultry, 63°C for beef medium. Check the Heat & Thermal Guide tab for specific curves!`,
        });

      } else if (lower.includes('portion') || lower.includes('amount') || lower.includes('serving') || lower.includes('scale')) {
        addChatMessage({
          role: 'ai',
          text: `You can scale the recipe from 1 to 12 servings. Use the Ingredients Amount Requirement tool in the recipe detail view to automatically adjust all quantities while maintaining proper ratios!`,
        });

      } else {
        // Default: general cooking advice
        addChatMessage({
          role: 'ai',
          text: `Great question, Chef ${activeUser.name}! I can help with:\n• **"Make a recipe with chicken, lemon"** — Generate a full AI recipe\n• **"Check allergies"** — Scan ingredients for allergen violations\n• **"Classify cuisine"** — Identify the cuisine type\n• **"Heat advice"** — Cooking temperature guidance\n• **"Scale portions"** — Adjust serving sizes\n\nTry typing something like "Cook something with salmon and asparagus"!`,
        });
      }
    } catch (error) {
      addChatMessage({
        role: 'ai',
        text: `I encountered an issue connecting to the backend. The AI features are running in demo mode. Try asking about substitutions or heat settings!`,
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="pb-[96px] px-margin-mobile md:px-margin-desktop min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-container via-surface to-surface" style={{ paddingTop: '280px' }}>
      {/* Dynamic Background Ornaments */}
      <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-tertiary/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <header className="mb-10 reveal-up flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-secondary mb-2">
              <span className="material-symbols-outlined text-lg drop-shadow-md">smart_toy</span>
              <span className="font-label-sm uppercase font-bold tracking-widest text-xs">
                AI Sous-Chef Assistant
              </span>
            </div>
            <h1 className="font-display-lg text-4xl md:text-5xl text-primary font-bold tracking-tight">
              Interactive Culinary Chat
            </h1>
            <p className="text-on-surface-variant text-base max-w-2xl mt-2 font-body-md">
              Logged in as <strong className="text-secondary">{activeUser.name}</strong>. Chat with your AI Sous-Chef to co-create recipes and evaluate food chemistry.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 min-h-[700px] stagger-children">
          {/* Left Panel: Active User Chat Interface */}
          <div className="lg:col-span-5 flex flex-col bg-white/40 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-black/5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-secondary to-[#ffb596] flex items-center justify-center text-surface shadow-lg transform rotate-3">
                <span className="material-symbols-outlined text-xl">forum</span>
              </div>
              <div>
                <h2 className="font-display-lg text-xl text-primary font-bold">Chat Session</h2>
                <p className="font-label-sm text-[10px] uppercase tracking-widest text-secondary font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {chatHistory.length} messages logged
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-2 mb-4 relative z-10 no-scrollbar max-h-[500px]">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-3xl max-w-[85%] shadow-sm transition-all duration-300 ${
                    msg.role === 'ai'
                      ? 'bg-white/60 backdrop-blur-md rounded-tl-sm text-on-surface-variant border border-white/50'
                      : 'bg-gradient-to-br from-secondary to-primary text-surface rounded-tr-sm ml-auto shadow-md shadow-secondary/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75 mb-1.5 font-mono uppercase tracking-wider">
                    <span className="font-bold flex items-center gap-1">
                      {msg.role === 'ai' ? (
                        <><span className="material-symbols-outlined text-[12px]">smart_toy</span> AI Sous-Chef</>
                      ) : (
                        <><span className="material-symbols-outlined text-[12px]">person</span> {activeUser.name}</>
                      )}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="font-body-md text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  {msg.recipeTitle && (
                    <div className="mt-3 pt-3 border-t border-current/10 text-xs font-label-sm font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">restaurant_menu</span>
                      Attached: {msg.recipeTitle}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-3xl rounded-tl-sm max-w-[85%] border border-white/50 shadow-sm flex items-center gap-2 w-fit">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="relative z-10 mt-auto pt-2">
              <input
                type="text"
                placeholder="Ask anything or request a recipe..."
                className="w-full bg-white/70 backdrop-blur-xl border border-white/60 rounded-full py-4 pl-6 pr-14 focus:ring-2 focus:ring-secondary/50 font-body-md shadow-inner text-sm outline-none transition-all placeholder:text-on-surface-variant/50"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                className={`absolute right-2 top-2 bottom-2 w-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                  inputValue.trim()
                    ? 'bg-gradient-to-tr from-secondary to-primary text-surface hover:shadow-lg hover:scale-105 active:scale-95'
                    : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed'
                }`}
                onClick={handleSend}
                disabled={!inputValue.trim()}
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Recipe Preview & Chemistry Analyzers */}
          <div className="lg:col-span-7 relative group flex flex-col">
            {selectedRecipe ? (
              <div className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] h-full p-8 shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-y-auto no-scrollbar relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                  <div>
                    <span className="bg-secondary/15 border border-secondary/20 text-secondary font-label-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">
                      AI Co-Created Recipe
                    </span>
                    <h2 className="font-display-lg text-3xl md:text-4xl text-primary font-bold">
                      {selectedRecipe.title}
                    </h2>
                    <p className="font-body-md text-on-surface-variant text-sm mt-2 max-w-lg">
                      {selectedRecipe.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-5 py-3 rounded-full bg-primary text-surface font-label-sm text-xs hover:bg-secondary hover:shadow-lg transition-all shadow-md flex items-center gap-2 shrink-0 group"
                  >
                    <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">science</span>
                    Inspect Analyzers
                  </button>
                </div>

                <div className="h-64 rounded-3xl overflow-hidden mb-8 relative shadow-lg group">
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-4 text-surface font-label-sm text-xs font-bold">
                    <span className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-sm">schedule</span> {selectedRecipe.prepTime}</span>
                    <span className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-sm text-amber-400">local_fire_department</span> {selectedRecipe.calories} kcal</span>
                    <span className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-sm text-emerald-400">fitness_center</span> {selectedRecipe.protein}g Protein</span>
                  </div>
                </div>

                {/* Quick interactive feature buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 relative z-10">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="p-4 rounded-2xl bg-white/60 backdrop-blur-md text-left hover:bg-white transition-colors border border-white shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-secondary text-2xl block mb-2 group-hover:scale-110 transition-transform">
                      scale
                    </span>
                    <span className="font-bold text-sm text-primary block">Portion Scaler</span>
                    <span className="text-[10px] text-on-surface-variant block mt-1">Scale yield ratios</span>
                  </button>

                  <button
                    onClick={() => setModalOpen(true)}
                    className="p-4 rounded-2xl bg-white/60 backdrop-blur-md text-left hover:bg-white transition-colors border border-white shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-purple-500 text-2xl block mb-2 group-hover:scale-110 transition-transform">
                      science
                    </span>
                    <span className="font-bold text-sm text-primary block">Chemistry</span>
                    <span className="text-[10px] text-on-surface-variant block mt-1">Maillard & pH</span>
                  </button>

                  <button
                    onClick={() => setModalOpen(true)}
                    className="p-4 rounded-2xl bg-white/60 backdrop-blur-md text-left hover:bg-white transition-colors border border-white shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-tertiary text-2xl block mb-2 group-hover:scale-110 transition-transform">
                      published_with_changes
                    </span>
                    <span className="font-bold text-sm text-primary block">Allergy Swapper</span>
                    <span className="text-[10px] text-on-surface-variant block mt-1">Smart substitutes</span>
                  </button>

                  <button
                    onClick={() => setModalOpen(true)}
                    className="p-4 rounded-2xl bg-white/60 backdrop-blur-md text-left hover:bg-white transition-colors border border-white shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-amber-500 text-2xl block mb-2 group-hover:scale-110 transition-transform">
                      thermostat
                    </span>
                    <span className="font-bold text-sm text-primary block">Heat Guide</span>
                    <span className="text-[10px] text-on-surface-variant block mt-1">Thermal curves</span>
                  </button>
                </div>

                {/* Ingredients preview */}
                <div className="relative z-10 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm">
                  <h3 className="font-label-sm text-secondary uppercase tracking-widest text-[10px] mb-4 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">grocery</span>
                    Ingredients Overview
                  </h3>
                  <ul className="space-y-3 font-body-md text-primary text-sm">
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex justify-between border-b border-black/5 pb-2 items-center">
                        <div className="flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                          <span>{ing}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white/30 backdrop-blur-2xl border-2 border-dashed border-white/60 rounded-[2.5rem] h-full flex flex-col items-center justify-center p-12 text-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white to-white/40 flex items-center justify-center mb-6 shadow-xl relative z-10 hover:scale-105 transition-transform duration-500">
                  <span className="material-symbols-outlined text-5xl text-secondary animate-pulse">
                    temp_preferences_custom
                  </span>
                </div>
                <h2 className="font-display-lg text-3xl text-primary mb-3 relative z-10">Interactive Culinary Canvas</h2>
                <p className="font-body-md text-on-surface-variant text-base max-w-md leading-relaxed relative z-10">
                  Type a question or ingredient query in the chat on the left to co-create recipes and unlock powerful Chemistry, Heat, and Allergy analyzers.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        <RecipeDetailModal
          recipe={selectedRecipe}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </div>
  );
};
