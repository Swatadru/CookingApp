import { useState, useEffect, useRef } from 'react';

export const AgentCriticLogs = () => {
  const [logs, setLogs] = useState<{agent: string, message: string}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const sequence = [
      { agent: 'Generator', message: 'Proposing step: Sear steak at 200°C for 5 minutes.' },
      { agent: 'Critic', message: 'Checking physics: 200°C for 5 min will overcook a 450g steak internally. Max safe time is 3 min per side.' },
      { agent: 'Generator', message: 'Revising step: Sear steak at 200°C for 2.5 minutes per side.' },
      { agent: 'Critic', message: 'Approved. Maillard reaction will be optimal.' }
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setLogs(prev => [...prev, sequence[i] || { agent: 'System', message: 'Processing...' }]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div ref={containerRef} className="bg-surface-container-low rounded-xl p-4 border border-outline-variant shadow-sm mt-4 min-h-[160px]">
      <h3 className="font-label-sm text-primary mb-3 uppercase tracking-wider flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px]">psychology</span>
        Dual-Agent Critic Loop
      </h3>
      <div className="space-y-3 font-body-md text-sm">
        {logs.map((log, idx) => (
          <div key={idx} className={`flex gap-3 ${log?.agent === 'Critic' ? 'text-secondary' : 'text-primary'}`}>
            <span className="font-bold w-20 shrink-0">{log?.agent || 'Unknown'}:</span>
            <span className="opacity-80">{log?.message || ''}</span>
          </div>
        ))}
        {logs.length < 4 && (
          <div className="flex gap-3 text-on-surface-variant animate-pulse">
            <span className="font-bold w-20 shrink-0">System:</span>
            <span className="opacity-80">Evaluating...</span>
          </div>
        )}
      </div>
    </div>
  );
};
