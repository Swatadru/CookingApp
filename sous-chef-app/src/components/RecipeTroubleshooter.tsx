import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../data/mockData';
import { troubleshooterResponses } from '../data/mockData';

interface RecipeTroubleshooterProps {
  isOpen: boolean;
  onClose: () => void;
  recipeTitle: string;
}

function getAIResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const entry of troubleshooterResponses) {
    if (entry.keywords.some((kw: string) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return `That's a great question about "${userMessage.slice(0, 40)}…"!\n\nBased on the recipe's composition, I'd suggest experimenting carefully — adjust one variable at a time and taste as you go. The flavour chemistry in this dish is well-balanced, so small tweaks can make a big difference.\n\nWant me to look into something more specific?`;
}

export const RecipeTroubleshooter = ({
  isOpen,
  onClose,
  recipeTitle,
}: RecipeTroubleshooterProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: `Hi there! I'm your cooking assistant for **"${recipeTitle}"**. Ask me anything — substitutions, technique tips, timing, or pairing ideas.`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [prevTitle, setPrevTitle] = useState(recipeTitle);

  // Reset when recipe changes
  if (recipeTitle !== prevTitle) {
    setPrevTitle(recipeTitle);
    setMessages([
      {
        role: 'ai',
        text: `Hi there! I'm your cooking assistant for **"${recipeTitle}"**. Ask me anything — substitutions, technique tips, timing, or pairing ideas.`,
      },
    ]);
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg = inputValue.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(userMsg);
      setMessages((prev) => [...prev, { role: 'ai', text: response }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  // Render markdown-lite bold
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-secondary">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      <style>{`
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(12px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up {
          animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[60] transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside
        id="troubleshooter-drawer"
        className={`fixed right-0 top-0 h-full w-full max-w-md z-[61] bg-gradient-to-b from-[#1c120c] to-[#0a0604] text-surface backdrop-blur-3xl border-l border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.8)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full relative">
          {/* Subtle top glare */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-[#ffb596] flex items-center justify-center shadow-[0_0_20px_rgba(254,158,114,0.3)] border border-white/20">
                <span className="material-symbols-outlined text-primary text-xl">
                  psychology
                </span>
              </div>
              <div>
                <h3 className="font-display-lg text-lg text-white font-medium tracking-wide">
                  Recipe Assistant
                </h3>
                <p className="font-label-sm text-[10px] uppercase tracking-[0.2em] text-secondary/80 mt-0.5">
                  Contextual help
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 text-surface/70 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all duration-300 hover:rotate-90 hover:scale-105 active:scale-95"
              aria-label="Close troubleshooter"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 no-scrollbar relative z-10">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`animate-slide-up ${
                  msg.role === 'ai'
                    ? 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl'
                    : 'bg-gradient-to-tr from-secondary to-[#ffb596] text-[#2c160a] p-4 rounded-2xl rounded-tr-sm max-w-[85%] ml-auto shadow-[0_8px_24px_-6px_rgba(254,158,114,0.4)] border border-white/20'
                }`}
                style={{ animationDelay: `${Math.min(idx * 0.05, 0.3)}s` }}
              >
                <p
                  className={`text-[15px] leading-relaxed whitespace-pre-line ${
                    msg.role === 'ai'
                      ? 'text-white/90'
                      : 'font-medium'
                  }`}
                >
                  {renderText(msg.text)}
                </p>
              </div>
            ))}
            {isTyping && (
              <div className="animate-slide-up bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-sm shadow-lg backdrop-blur-xl flex items-center gap-1.5 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2.5 px-6 pb-4 pt-2 relative z-10">
            {['Substitutions?', 'Faster method?', 'Side pairings?', 'Storage tips?'].map(
              (chip, idx) => (
                <button
                  key={chip}
                  onClick={() => {
                    setInputValue(chip);
                    setTimeout(() => {
                      setInputValue('');
                      setMessages((prev) => [
                        ...prev,
                        { role: 'user', text: chip },
                      ]);
                      setIsTyping(true);
                      setTimeout(() => {
                        setMessages((prev) => [
                          ...prev,
                          { role: 'ai', text: getAIResponse(chip) },
                        ]);
                        setIsTyping(false);
                      }, 1200);
                    }, 100);
                  }}
                  className="animate-slide-up shrink-0 px-4 py-2 rounded-full border border-white/20 bg-white/10 text-white/90 font-medium text-[13px] shadow-sm backdrop-blur-md hover:bg-white/20 hover:border-[#fe9e72]/50 hover:text-[#fe9e72] hover:shadow-[0_0_15px_rgba(254,158,114,0.3)] transition-all duration-300 active:scale-95"
                  style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
                >
                  {chip}
                </button>
              )
            )}
          </div>

          {/* Input Area */}
          <div className="px-5 pb-6 pt-2 relative z-10">
            <div className="relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 focus-within:bg-white/10 focus-within:border-secondary/40 focus-within:shadow-[0_0_30px_rgba(254,158,114,0.15)]">
              <input
                type="text"
                placeholder="Ask about this recipe..."
                className="w-full bg-transparent border-none py-4 pl-6 pr-16 focus:ring-0 font-body-md text-white placeholder:text-white/30 transition-all outline-none text-[15px]"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                className={`absolute right-2 top-2 bottom-2 w-11 bg-gradient-to-br from-secondary to-[#fe9e72] text-[#2c160a] rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(254,158,114,0.4)] transition-all duration-300 ${
                  !inputValue.trim()
                    ? 'opacity-40 cursor-not-allowed scale-90 grayscale-[30%]'
                    : 'hover:scale-105 hover:brightness-110 hover:shadow-[0_4px_25px_rgba(254,158,114,0.6)] active:scale-95'
                }`}
                onClick={handleSend}
                disabled={!inputValue.trim()}
                aria-label="Send message"
              >
                <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
