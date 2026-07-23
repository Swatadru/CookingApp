import { useState } from 'react';
import type { Recipe } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { RecipeDetailModal } from './RecipeDetailModal';
import { getDeterministicImageForRecipe } from '../utils/imageUtils';

interface RecipeCardProps {
  recipe: Recipe;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export const RecipeCard = ({ recipe, isSaved: propIsSaved, onToggleSave: propOnToggleSave }: RecipeCardProps) => {
  const { isRecipeSaved, toggleSaveRecipe } = useUser();
  const [modalOpen, setModalOpen] = useState(false);

  const isSaved = propIsSaved !== undefined ? propIsSaved : isRecipeSaved(recipe.id);

  const fallbackImage = getDeterministicImageForRecipe(recipe.title);
  const [imgSrc, setImgSrc] = useState(recipe.image || fallbackImage);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (propOnToggleSave) {
      propOnToggleSave(recipe.id);
    } else {
      toggleSaveRecipe(recipe.id);
    }
  };

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="group relative bg-surface-container-low rounded-[24px] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_24px_48px_rgba(61,43,31,0.14)] cursor-pointer"
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            src={imgSrc}
            onError={() => {
              if (imgSrc !== fallbackImage) {
                setImgSrc(fallbackImage);
              }
            }}
            alt={recipe.title}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />

          {/* Category Badge */}
          <span className="absolute top-4 left-4 bg-secondary-container text-on-secondary-container text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {recipe.cuisine}
          </span>

          {/* Save / Heart Button */}
          <button
            id={`save-btn-${recipe.id}`}
            onClick={handleSaveClick}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:bg-black/60 active:scale-90 z-10"
            aria-label={isSaved ? 'Unsave recipe' : 'Save recipe'}
          >
            <span
              className="material-symbols-outlined text-xl transition-all duration-300"
              style={{
                fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
                color: isSaved ? '#fe9e72' : '#ffffff',
              }}
            >
              favorite
            </span>
          </button>

        </div>

        {/* Card Body */}
        <div className="p-5 bg-surface/90 backdrop-blur-md flex flex-col h-full">
          <div className="flex justify-between items-start mb-3 gap-3">
            <h4 className="text-on-surface font-display-lg text-lg leading-tight font-bold line-clamp-2">
              {recipe.title}
            </h4>
            <div className="flex items-center gap-1 text-on-surface-variant text-xs font-label-sm shrink-0 mt-1 bg-surface-container-high px-2 py-1 rounded-md">
              <span className="material-symbols-outlined text-[14px]">timer</span>
              {recipe.prepTime}
            </div>
          </div>
          <p className="text-on-surface-variant text-sm mb-4 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>

          {/* Quick Analyzer badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-label-sm rounded-full flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[12px]">science</span> Chemistry
            </span>
            <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-label-sm rounded-full flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[12px]">published_with_changes</span> Swapper
            </span>
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 text-[10px] font-label-sm rounded-full flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[12px]">thermostat</span> Thermal
            </span>
          </div>

          {/* Macro bar */}
          <div className="flex items-center justify-between text-[11px] font-label-sm text-on-surface-variant border-t border-outline-variant/20 pt-3">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-secondary text-sm">local_fire_department</span>
              {recipe.calories} kcal
            </span>
            <span>P: {recipe.protein}g</span>
            <span>F: {recipe.fat}g</span>
            <span>C: {recipe.carbs}g</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <RecipeDetailModal
        recipe={recipe}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
