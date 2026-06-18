import { useState, useEffect } from 'react';
import { chatHistory } from '../data/mockData';
import { useCookingSession } from '../context/CookingSessionContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { skillLevel, triggerSelfHealing } = useCookingSession();
  const [messages, setMessages] = useState(chatHistory);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Resizing state
  const [width, setWidth] = useState(() => Math.min(400, typeof window !== 'undefined' ? window.innerWidth : 400));
  const [isResizing, setIsResizing] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = document.documentElement.clientWidth - e.clientX;
      setWidth(Math.max(300, Math.min(newWidth, 800))); // Min 300px, Max 800px
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: inputValue }]);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm processing your request. Please wait a moment." }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleDiagnosticClick = (issue: string) => {
    setMessages(prev => [...prev, { role: 'user', text: issue }]);
    triggerSelfHealing();
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `I've detected a state conflict. Initiating Self-Healing Protocol... I am recalculating the next steps based on your ${skillLevel} skill level. Please reduce heat by 10% immediately.` 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMessages(prev => [...prev, { role: 'user', text: '[Image Uploaded for Visual Diagnosis]' }]);
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: 'VLM Analysis complete. Surface browning is currently at level 7 (optimal). The pan temperature appears to be slightly too high. Reduce heat to medium.' 
        }]);
        setIsTyping(false);
      }, 2000);
    }
  };
  return (
    <aside 
      id="ai-sidebar" 
      style={{ width: isMobile ? '100vw' : `${width}px` }}
      className={`fixed right-0 top-0 h-full z-50 bg-primary/95 text-surface backdrop-blur-2xl border-l border-white/10 shadow-[0_0_80px_rgba(61,43,31,0.6)] ${
        isResizing ? 'transition-none' : 'transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)'
      } ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Drag Handle — hidden on mobile */}
      {!isMobile && (
        <div 
          className="absolute left-0 top-0 w-2 h-full cursor-col-resize hover:bg-white/10 active:bg-white/20 transition-colors z-50 flex items-center justify-center group"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        >
          <div className="w-[2px] h-8 bg-white/30 rounded-full group-hover:bg-white/70 transition-colors"></div>
        </div>
      )}
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full flex items-center justify-center p-[2px] bg-gradient-to-tr from-secondary via-[#fe9e72] to-transparent animate-spin-slow">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary bg-primary">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtj0SkdmdUEetCoqqubiTU81KQBPeFHhZRyBhBwcYLylJEQ7nR6ciVuFJJqebNYsiQA1uezmHCCxdOeJJXZIo_hB70eU-Xh_tO1IljGKe0q1XqPW09HbCANGen0Omw1QGzj6QEwhsCk5_1wn34Y13oOrM4nZUPE5xucLxcoGzsmLfEwQOt5wdtJj2WgSdmjJAtNVMP2Pb6lhCMx3qkanrEx0QKj6xYi367ezbILqlOA2DaPj6cessU_pIZPtp_ZzKSJmfig-jdaAOC" 
                  alt="Chef Avatar" 
                  className="w-full h-full object-cover animate-spin-reverse-slow" 
                />
              </div>
            </div>
            <div>
              <h4 className="font-display-lg text-headline-lg text-surface tracking-wide">Sous-Chef <span className="text-secondary-fixed">AI</span></h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="font-label-sm text-surface/70 text-[10px] uppercase tracking-widest">Active Intelligence</p>
              </div>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 text-surface/70 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all hover:rotate-90 active:scale-90"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Chat Content area */}
        <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4 no-scrollbar">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={msg.role === 'ai' 
                ? "bg-white/5 border border-white/10 p-5 rounded-3xl rounded-tl-sm max-w-[85%] shadow-lg backdrop-blur-md"
                : "bg-gradient-to-br from-secondary to-[#ffb596] text-primary p-5 rounded-3xl rounded-tr-sm max-w-[85%] ml-auto shadow-[0_8px_30px_rgba(148,73,37,0.3)]"
              }
            >
              <p className={msg.role === 'ai' ? "text-surface/90 font-body-md text-sm leading-relaxed" : "font-body-md text-sm font-medium leading-relaxed"}>
                {msg.text}
              </p>
            </div>
          ))}
          {isTyping && (
            <div className="bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-sm shadow-lg backdrop-blur-md flex items-center gap-1.5 w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          )}
        </div>

        {/* Guided Diagnostic Decision Trees */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-2 snap-x no-scrollbar">
          <button 
            onClick={() => handleDiagnosticClick("Too sticky")}
            className="shrink-0 snap-start px-5 py-2.5 rounded-full border border-secondary/50 text-secondary-fixed font-label-sm text-xs hover:bg-secondary hover:text-surface hover:shadow-[0_0_20px_rgba(148,73,37,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Too sticky
          </button>
          <button 
            onClick={() => handleDiagnosticClick("Burning smell")}
            className="shrink-0 snap-start px-5 py-2.5 rounded-full border border-secondary/50 text-secondary-fixed font-label-sm text-xs hover:bg-secondary hover:text-surface hover:shadow-[0_0_20px_rgba(148,73,37,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Burning smell
          </button>
          <button 
            onClick={() => handleDiagnosticClick("Not browning")}
            className="shrink-0 snap-start px-5 py-2.5 rounded-full border border-secondary/50 text-secondary-fixed font-label-sm text-xs hover:bg-secondary hover:text-surface hover:shadow-[0_0_20px_rgba(148,73,37,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Not browning
          </button>
          {/* Spacer to prevent the last chip from being cut off by the container edge */}
          <div className="w-4 shrink-0"></div>
        </div>

        <div className="mt-auto">
          <div className="relative flex items-center group">
            <label className="absolute left-3 w-10 h-10 flex items-center justify-center text-surface/50 hover:text-secondary-fixed cursor-pointer transition-colors z-10">
              <span className="material-symbols-outlined">photo_camera</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
            <input 
              type="text" 
              placeholder="Ask your sous-chef..." 
              className="w-full bg-black/40 border border-white/10 rounded-full py-5 pl-14 pr-16 focus:ring-2 focus:ring-secondary/40 focus:border-secondary/50 font-body-md text-surface shadow-inner placeholder:text-surface/30 transition-all outline-none backdrop-blur-md" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              className={`absolute right-2 top-2 bottom-2 w-12 bg-gradient-to-tr from-secondary to-[#fe9e72] text-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(148,73,37,0.5)] transition-all duration-300 ${!inputValue.trim() ? 'opacity-30 cursor-not-allowed scale-90' : 'hover:scale-110 hover:shadow-[0_0_25px_rgba(148,73,37,0.8)] active:scale-95'}`} 
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
