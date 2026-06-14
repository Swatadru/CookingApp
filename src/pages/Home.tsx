import { Hero } from '../components/Hero';
import { ChefsInspiration } from '../components/ChefsInspiration';
import { FeatureGrid } from '../components/FeatureGrid';

export const Home = () => {
  return (
    <>
      <Hero />

      {/* Wave divider: surface → surface-container-low */}
      <div className="relative h-20 -mt-1 overflow-hidden">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="#f5f5dc"
          />
        </svg>
      </div>

      <ChefsInspiration />

      {/* Wave divider: surface-container-low → surface */}
      <div className="relative h-20 -mt-1 overflow-hidden bg-surface-container-low">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            d="M0,60 C480,10 960,70 1440,30 L1440,80 L0,80 Z"
            fill="#fbfbe2"
          />
        </svg>
      </div>

      <FeatureGrid />
    </>
  );
};
