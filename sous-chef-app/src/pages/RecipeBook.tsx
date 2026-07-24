import { useState, useEffect } from 'react';
import { cuisineFilters } from '../data/mockData';
import { RecipeCard } from '../components/RecipeCard';
import { useUser } from '../context/UserContext';
import { apiClient } from '../utils/apiClient';

export const RecipeBook = () => {
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const { savedRecipeIds, toggleSaveRecipe, activeUser } = useUser();
  
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getRecipes(page, 24, activeCuisine);
        if (response && response.data) {
          setRecipes(response.data);
          setTotalPages(response.totalPages);
          setTotalCount(response.total);
        } else {
          setRecipes([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      } catch (err) {
        console.error("Failed to load recipes", err);
      } finally {
        setLoading(false);
      }
    };
    
    // If we only want to show saved recipes, we could filter here or fetch by ids.
    // For now we just fetch from API and filter locally if "show saved only".
    // Or ideally, we add a saved flag to API, but for simplicity:
    fetchRecipes();
  }, [page, activeCuisine]);

  // Filter recipes (for saved only, it might not work well with pagination, but it's a start)
  let filtered = recipes;
  if (showSavedOnly) {
    filtered = filtered.filter((r) => savedRecipeIds.includes(r.id.toString()) || savedRecipeIds.includes(r.id));
  }

  return (
    <div className="pb-[96px] px-margin-mobile md:px-margin-desktop min-h-screen max-w-container-max mx-auto" style={{ paddingTop: '280px' }}>
      {/* Header */}
      <header className="text-center mb-10 reveal-up">
        <div className="inline-flex items-center gap-2 text-secondary mb-4">
          <span className="material-symbols-outlined">menu_book</span>
          <span className="font-label-sm uppercase font-bold tracking-widest text-xs">
            Digital Cookbook
          </span>
        </div>
        <h1 className="font-display-lg text-[36px] leading-[44px] md:text-display-lg text-primary mb-3">
          Recipe Book
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
          Browse, filter, and save recipes across cuisines for{' '}
          <strong className="text-primary">{activeUser.name}</strong>. Click any recipe to evaluate chemistry, swap allergens, adjust heat, and scale portion amounts.
        </p>
      </header>

      {/* Controls Row */}
      <div
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-10 reveal-up"
        style={{ '--delay': '100ms' } as React.CSSProperties}
      >
        {/* Cuisine Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {cuisineFilters.map((cuisine) => (
            <button
              key={cuisine}
              id={`filter-${cuisine.toLowerCase()}`}
              onClick={() => setActiveCuisine(cuisine)}
              className={`px-5 py-2.5 rounded-full font-label-sm text-xs whitespace-nowrap transition-all duration-300 ${
                activeCuisine === cuisine
                  ? 'bg-secondary text-surface shadow-md'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>

        {/* Saved Toggle */}
        <button
          id="toggle-saved"
          onClick={() => setShowSavedOnly(!showSavedOnly)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-label-sm text-xs transition-all duration-300 shrink-0 ${
            showSavedOnly
              ? 'bg-secondary text-surface shadow-md'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
          }`}
        >
          <span
            className="material-symbols-outlined text-sm"
            style={{
              fontVariationSettings: showSavedOnly ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            favorite
          </span>
          {showSavedOnly ? `Saved (${savedRecipeIds.length})` : 'Show Saved'}
        </button>
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isSaved={savedRecipeIds.includes(recipe.id.toString()) || savedRecipeIds.includes(recipe.id)}
                onToggleSave={toggleSaveRecipe}
              />
            ))}
          </div>
          
          {/* Pagination Controls */}
          {!showSavedOnly && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-lg bg-surface-container-high disabled:opacity-50 transition-colors hover:bg-surface-variant"
              >
                Previous
              </button>
              <span className="font-label-sm">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-lg bg-surface-container-high disabled:opacity-50 transition-colors hover:bg-surface-variant"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-center reveal-up">
          <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-5xl text-secondary/40">
              {showSavedOnly ? 'favorite_border' : 'search_off'}
            </span>
          </div>
          <h3 className="font-display-lg text-xl text-primary mb-2">
            {showSavedOnly ? 'No saved recipes yet' : 'No recipes found'}
          </h3>
          <p className="text-on-surface-variant max-w-sm">
            {showSavedOnly
              ? `Heart some recipes to see them in ${activeUser.name}'s collection.`
              : 'Try selecting a different cuisine filter.'}
          </p>
          {showSavedOnly && (
            <button
              onClick={() => setShowSavedOnly(false)}
              className="mt-6 px-6 py-3 rounded-xl bg-primary text-surface font-label-sm hover:bg-secondary transition-colors duration-300 shadow-md"
            >
              Browse All Recipes
            </button>
          )}
        </div>
      )}

      {/* Recipe count */}
      {filtered.length > 0 && !loading && (
        <div className="text-center mt-6 text-on-surface-variant/60 font-label-sm text-xs">
          Showing {filtered.length} of {totalCount} recipe{totalCount !== 1 ? 's' : ''}
          {activeCuisine !== 'All' ? ` in ${activeCuisine}` : ''}
          {showSavedOnly ? ' (saved only)' : ''}
        </div>
      )}
    </div>
  );
};
