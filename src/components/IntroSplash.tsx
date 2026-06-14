import { useState, useEffect } from 'react';

export const IntroSplash = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState(0); // 0=embers, 1=title, 2=tagline, 3=lifting

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2400),
      setTimeout(() => setPhase(3), 3800),
      setTimeout(() => onComplete(), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const embers = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 3,
    opacity: 0.3 + Math.random() * 0.7,
  }));

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 80%, #3d2b1f 0%, #1a0f08 50%, #0a0503 100%)',
        animation: phase >= 3 ? 'splash-lift 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none',
        transformOrigin: 'center top',
      }}
    >
      {/* Ember Particles */}
      {embers.map((e) => (
        <div
          key={e.id}
          className="absolute rounded-full"
          style={{
            left: e.left,
            bottom: '-10px',
            width: `${e.size}px`,
            height: `${e.size}px`,
            background: `radial-gradient(circle, #fe9e72 0%, #944925 60%, transparent 100%)`,
            boxShadow: `0 0 ${e.size * 3}px ${e.size}px rgba(254, 158, 114, ${e.opacity * 0.5})`,
            animation: `ember-drift ${e.duration}s ease-out ${e.delay}s infinite`,
            opacity: phase >= 0 ? 1 : 0,
          }}
        />
      ))}

      {/* Ambient glow behind text */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(148, 73, 37, 0.25) 0%, transparent 70%)',
          filter: 'blur(60px)',
          opacity: phase >= 1 ? 1 : 0,
          transition: 'opacity 1s ease',
        }}
      />

      {/* Title */}
      <h1
        className="relative z-10 font-display-lg text-center select-none"
        style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          background: 'linear-gradient(90deg, #dec1af 0%, #fe9e72 30%, #ffdbcd 60%, #dec1af 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          clipPath: phase >= 1 ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
          transition: 'clip-path 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          animation: phase >= 1 ? 'golden-sweep 4s ease-in-out infinite' : 'none',
        }}
      >
        Omniscient
        <br />
        Sous-Chef
      </h1>

      {/* Tagline */}
      <p
        className="relative z-10 mt-6 font-label-sm text-center tracking-[0.3em] uppercase select-none"
        style={{
          color: '#dec1af',
          fontSize: 'clamp(10px, 1.5vw, 14px)',
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        Culinary Intelligence Elevated
      </p>

      {/* Thin golden line */}
      <div
        className="relative z-10 mt-8 h-[1px] bg-gradient-to-r from-transparent via-secondary to-transparent"
        style={{
          width: phase >= 2 ? '120px' : '0px',
          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
        }}
      />
    </div>
  );
};
