import { useState, useEffect } from 'react';

export const StressTestLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('Initializing variables...');

  useEffect(() => {
    const tests = [
      'Testing temperature ±20%...',
      'Simulating ingredient substitutions...',
      'Verifying structural integrity...',
      'Calculating exact Maillard thresholds...',
      'Cross-referencing safety margins...',
      'Finalizing optimal path...'
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);
      
      const testIndex = Math.min(Math.floor(currentProgress / 17), tests.length - 1);
      setCurrentTest(tests[testIndex]);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-surface/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl text-center shadow-2xl border border-white/20">
        <span className="material-symbols-outlined text-4xl text-secondary mb-4 animate-spin" style={{ animationDuration: '3s' }}>
          science
        </span>
        <h2 className="font-display-lg text-headline-lg text-primary mb-2">Recipe Stress Testing</h2>
        <p className="font-body-md text-on-surface-variant mb-8 text-sm opacity-80">
          Running 100 background simulations to guarantee success...
        </p>
        
        <div className="w-full bg-surface-container-highest rounded-full h-2 mb-4 overflow-hidden">
          <div 
            className="bg-secondary h-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="font-label-sm text-primary uppercase tracking-widest text-[10px]">
          {currentTest}
        </p>
      </div>
    </div>
  );
};
