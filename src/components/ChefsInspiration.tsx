import { useNavigate } from 'react-router-dom';
import { inspirationContent } from '../data/mockData';

export const ChefsInspiration = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="mb-8 md:mb-12 reveal-left">
          <h2 className="font-display-lg text-headline-lg text-primary mb-2">Chef's Inspiration</h2>
          <div className="h-1 w-24 bg-secondary rounded-full"></div>
        </div>
        
        <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden group reveal-scale">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent z-10"></div>
          <img 
            src={inspirationContent.image.src} 
            alt={inspirationContent.image.alt} 
            className="w-full h-[400px] md:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20">
            <div className="max-w-2xl">
              <span className="font-label-sm text-surface bg-secondary px-4 py-1 rounded-full mb-4 md:mb-6 inline-block shadow-md">
                {inspirationContent.tag}
              </span>
              <blockquote className="font-quote-it-lg text-[28px] leading-[36px] md:text-display-lg italic text-surface mb-6 md:mb-8">
                {inspirationContent.quote}
              </blockquote>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <button className="bg-surface text-primary px-6 md:px-8 py-3 rounded-full font-label-sm hover:bg-secondary-fixed hover:scale-105 transition-all duration-300 shadow-md" onClick={() => navigate('/library')}>
                  View Full Recipe
                </button>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1 text-surface font-label-sm">
                    <span className="material-symbols-outlined text-sm">schedule</span> {inspirationContent.time}
                  </span>
                  <span className="flex items-center gap-1 text-surface font-label-sm">
                    <span className="material-symbols-outlined text-sm">local_fire_department</span> {inspirationContent.calories}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
