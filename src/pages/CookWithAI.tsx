import { useState } from 'react';

export const CookWithAI = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello Chef. I am ready to assist. What ingredients are we working with today, or do you have a specific flavor profile in mind?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: inputValue }]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI thinking and generating a recipe
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Analyzing flavor pairings... I see you want to use the Lemon and Thyme. Let me construct a high-protein dish with those aromatics.' 
      }]);
      
      setTimeout(() => {
        setIsTyping(false);
        setGeneratedRecipe(true);
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: 'I have compiled a "Lemon-Thyme Poached Chicken with Asparagus". It optimizes for moisture retention using a low-temperature poach.' 
        }]);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      <header className="mb-12 reveal-up">
        <h1 className="font-display-lg text-display-lg text-primary mb-2">Cook with AI</h1>
        <p className="text-on-surface-variant max-w-2xl">
          Your personal culinary intelligence. Co-create recipes, debug kitchen disasters in real-time, or generate completely new flavor profiles based on what's in your pantry.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter min-h-[600px] stagger-children">
        
        {/* Left Panel: Chat Interface */}
        <div className="lg:col-span-5 flex flex-col glass-card rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden bg-white/40">
          {/* Subtle Background Glow */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/30 relative z-10">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-surface shadow-md">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <div>
              <h2 className="font-display-lg text-xl text-primary">Sous-Chef AI</h2>
              <p className="font-label-sm text-[10px] uppercase tracking-widest text-secondary">Active Session</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-6 relative z-10 no-scrollbar">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${
                  msg.role === 'ai' 
                    ? 'bg-surface-container-high rounded-tl-none text-on-surface-variant'
                    : 'bg-secondary text-surface rounded-tr-none ml-auto'
                }`}
              >
                <p className="font-body-md text-sm leading-relaxed">{msg.text}</p>
              </div>
            ))}
            {isTyping && (
              <div className="bg-surface-container-high p-4 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm flex items-center gap-2 w-fit">
                <div className="w-2 h-2 rounded-full bg-on-surface-variant/50 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-on-surface-variant/50 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-on-surface-variant/50 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </div>

          <div className="relative z-10">
            <input 
              type="text" 
              placeholder="e.g. I have chicken, lemon, and thyme..." 
              className="w-full bg-white border border-outline-variant/20 rounded-2xl py-4 pl-6 pr-16 focus:ring-2 focus:ring-secondary/20 font-body-md shadow-inner"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              className="absolute right-3 top-3 w-10 h-10 bg-secondary text-surface rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all hover:bg-primary"
              onClick={handleSend}
            >
              <span className="material-symbols-outlined text-xl text-white">send</span>
            </button>
          </div>
        </div>

        {/* Right Panel: Dynamic Recipe Preview */}
        <div className="lg:col-span-7 relative group">
          {generatedRecipe ? (
            <div className="glass-card rounded-[2.5rem] h-full p-8 shadow-xl bg-surface-container-lowest overflow-y-auto no-scrollbar fade-in-section visible">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-sm px-3 py-1 rounded-full text-xs mb-4 inline-block">AI Generated</span>
                  <h2 className="font-display-lg text-4xl text-primary">Lemon-Thyme Poached Chicken</h2>
                  <p className="font-body-md text-on-surface-variant mt-2">Perfectly moist protein optimized via controlled thermal gradients.</p>
                </div>
                <button className="w-12 h-12 rounded-full bg-primary-container text-surface flex items-center justify-center hover:scale-105 transition-all shadow-md">
                  <span className="material-symbols-outlined text-white">play_arrow</span>
                </button>
              </div>

              <div className="h-64 rounded-2xl overflow-hidden mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe0AD34aGqd6r8D8xiDCvgetSz6Mey7g8xX66LOKCsQtj40wmuqU7w_tMRM2nEqQzMPn_nXiQssADv1xm3CeWPQNaR9Bzz3XOXN0MKUqZECCoKP2XCh2UPPRbHWZ8y1Xd0j7Uu4ScmTRxAx-ebOx0VaND0MmjmVZ7MBO7NcgkjrN4A5RvGSCUyfkcD2NnWGoY6-H8BdJU7ST0h9xcBinylT7djF3V2_cz5xkzY95H4rGbRQoQ_o96vNd-tDEEMMiZCe_Cv-wsVm4K_" 
                  alt="AI Recipe Result" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute bottom-4 left-4 z-20 flex gap-4 text-surface font-label-sm text-sm">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-white text-sm">timer</span> 25m</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-white text-sm">restaurant</span> 380 kcal</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-label-sm text-secondary uppercase tracking-widest mb-4">Ingredients</h3>
                  <ul className="space-y-3 font-body-md text-on-surface-variant">
                    <li className="flex justify-between border-b border-outline-variant/20 pb-1"><span>Chicken Breast</span> <span className="font-bold">200g</span></li>
                    <li className="flex justify-between border-b border-outline-variant/20 pb-1"><span>Fresh Thyme</span> <span className="font-bold">3 sprigs</span></li>
                    <li className="flex justify-between border-b border-outline-variant/20 pb-1"><span>Lemon</span> <span className="font-bold">1 whole</span></li>
                    <li className="flex justify-between border-b border-outline-variant/20 pb-1"><span>Asparagus</span> <span className="font-bold">150g</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-label-sm text-secondary uppercase tracking-widest mb-4">AI Chemistry Notes</h3>
                  <div className="bg-surface-container p-4 rounded-xl text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary mb-2">science</span>
                    <p>Poaching at exactly 74°C ensures the actin proteins denature without squeezing out internal moisture. The lemon acid will gently tenderize the surface.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-[2.5rem] h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-outline-variant/40 bg-surface/30">
              <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl text-secondary opacity-50">restaurant_menu</span>
              </div>
              <h2 className="font-display-lg text-2xl text-primary mb-2">Digital Kitchen Canvas</h2>
              <p className="font-body-md text-on-surface-variant max-w-sm opacity-80">
                Chat with the AI on the left to generate a dynamic recipe. Watch the culinary physics simulate right here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
