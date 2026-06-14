import { useState } from 'react';
import { ConfidenceBadges, AllergenSwapper } from '../components/RecipeAIWidgets';

export const RecipeLibrary = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All Recipes');
  const totalPages = 2;

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop min-h-screen">
      {/* Category Carousel */}
      <header className="mb-12 max-w-4xl mx-auto reveal-up">
        <div className="flex flex-col items-center justify-center mb-8 gap-6 text-center">
          <h1 className="font-display-lg text-display-lg text-primary">Recipe Library</h1>
          <div className="flex gap-4">
            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-surface-container transition-colors" onClick={prevPage}>
              <span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
            </button>
            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-surface-container transition-colors" onClick={nextPage}>
              <span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar justify-center">
          {['All Recipes', 'Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Appetizers'].map(cat => (
            <button
              key={cat}
              className={`px-8 py-3 rounded-full font-label-sm whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-secondary text-surface shadow-md'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
              }`}
              onClick={() => setActiveCategory(cat)}
            >{cat}</button>
          ))}
        </div>
      </header>

      {/* 3D Cookbook Container */}
      <div className="flex justify-center w-full relative z-10">
        <div className="book-container w-full max-w-5xl mx-auto h-[650px] relative reveal-rotate">
        <div className="book w-full h-full shadow-[0_50px_100px_rgba(61,43,31,0.15)] rounded-r-xl overflow-visible">
          {/* Left Persistent Page */}
          <div className="absolute left-0 top-0 w-1/2 h-full bg-surface-container-low p-12 border-r border-outline-variant/30 rounded-l-3xl flex flex-col">
            <div className="mb-8">
              <span className="font-label-sm text-secondary tracking-widest uppercase mb-2 block">Featured Collection</span>
              <h2 className="font-display-lg text-4xl text-primary leading-tight">Artisanal Winter Gastronomy</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-4 no-scrollbar">
              <p className="font-body-md text-on-surface-variant leading-relaxed mb-6">
                Explore the delicate balance between molecular precision and rustic comfort. This curated collection features AI-optimized recipes that bridge the gap between home cooking and fine dining.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-surface-container rounded-2xl flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary" data-icon="restaurant">restaurant</span>
                  <div>
                    <p className="font-label-sm font-bold">128 Recipes</p>
                    <p className="text-xs text-on-surface-variant">In your library</p>
                  </div>
                </div>
                <div className="p-4 bg-surface-container rounded-2xl flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary" data-icon="timer">timer</span>
                  <div>
                    <p className="font-label-sm font-bold">Avg. Prep 45m</p>
                    <p className="text-xs text-on-surface-variant">Chef-level efficiency</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-outline-variant/20 flex justify-between items-center">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-surface object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrV88qcCj90ZTIGSqRoRJT-HPyRFAmI_AnQMdWIL7v58JA5_8iE_fglGUSFJJXtOmsAdETHJoG_vVAl19M34rhiNAX4m1TeyC2M2h0EQQ5wgtCmUmc3nyHiKYfPCYjFTciytAja4ESDb1GgBCOxj6Yy0TAdZRkYeXWPM0V5ArAmroFvu2gM7qFNsFaFruMo2qCAHlBXXk_VPGjC4zHPEamydaDmWHQPkHvejqM2nPCjj_wzr2LfXMk5pysgVjjrbqhvrXcptxmY597" alt="Chef 1" />
                <img className="w-10 h-10 rounded-full border-2 border-surface object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHQ9Tiil2lOIJIrb4p7tHogCVkb6oet1FjqoxEuUBVKCUU9E2ePJJkKoqVotAvhPInOD_4vWcy82FDvm3psXcXUhVOelD36O2o29nYv-zj2TkUEeqBmHnoDTeMTwOGq4D-_nwJxrRSlesvyFKQXaHY6xFjG290Moken0VPzGfo8ux7UpLmVg8sX_UJnQbJ_hTq-Rc80_CSEVg6OTkpEp9SNQ7yr8L4Fu6E2uMrwsxj4bCIPpSTZ2mgvg1HoxehLzl229Se6GkqJKHV" alt="Chef 2" />
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-[10px] text-surface border-2 border-surface font-bold">+12</div>
              </div>
              <span className="font-label-sm text-on-surface-variant">Collaborative Library</span>
            </div>
          </div>

          {/* Animated Flipping Pages */}
          {/* Page 1 */}
          <div className={`page z-30 ${currentPage > 1 ? 'flipped' : ''}`} id="page-1">
            <div className="page-front bg-surface-container-lowest p-8 flex flex-col justify-center items-center h-full">
              <img className="w-full h-80 object-cover rounded-2xl mb-6 shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpNOLL90rmwFSrRSLAIX75MmIeSiZGG1qsY2nK64B5LANUyjkJN4uHIH0iyhFHMYTqPsqrjAvXs8KRkbF4XiEuun8AqFluV2yhLrM1xtekDhY0E-1X2R3vSB9-Yy6ZP2tEsaSLJoRanpBKSdYrNryZ6Eg-qp2ZSsQc_EielZDEOovF-FqpiyaQPkNsiI1Le9l45sQa8DWARvM8yc2DH1lmxevJy6KD30slNsZwOrfybBAwkwrWyaZWc8Vn9fyDblie0FGnSux8CNO4" alt="Morning Radiance Bowl" />
              <h3 className="font-display-lg text-2xl text-primary mb-2">Morning Radiance Bowl</h3>
              <p className="font-body-md text-on-surface-variant text-center px-4">Superfoods meets high-end breakfast culture.</p>
            </div>
            <div className="page-back bg-surface-container-lowest p-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-display-lg text-3xl text-primary">Saffron Risotto</h3>
                  <p className="font-label-sm text-secondary">Milanese Classic • 35 Mins</p>
                </div>
                <button className="text-on-surface-variant hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined" data-icon="bookmark">bookmark</span>
                </button>
              </div>
              <img className="w-full h-48 object-cover rounded-xl mb-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFO6pVvgaBXRMUko2Cx51l8bEOdEWpAk151Ckh8a3WbJ7Y2IPrT4AVVohg-uffWeh7B0L7khPhejZESlT_BNU39scGXzCubD2S2MR2LA-wfh5xRPLb6yeC3VSf1VqjDhcdKdCa_JVGGQ9by9tIHhvq6Ku881b8XoZy4SdSV7qqXEkbFmkFasXVaxPVhDTd23Nri9pPzZ2VsGLWHvGRuj8vPlR2CcUgcLRva1e52Cf-MPqO7PKh_-qZAr-7gPxy7lSTWlnkFJK-Biau" alt="Saffron Risotto" />
              <div className="space-y-4 flex-1">
                <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                  <span className="font-body-md">Saffron Threads</span>
                  <span className="font-label-sm">0.5g</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/30 pb-2 items-center">
                  <span className="font-body-md">Arborio Rice</span>
                  <span className="font-label-sm">300g</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/30 pb-2 items-center">
                  <AllergenSwapper ingredientName="Parmigiano Reggiano" />
                  <span className="font-label-sm">50g</span>
                </div>
              </div>
              <button className="mt-auto w-full bg-primary-container text-surface py-4 rounded-2xl font-bold flex items-center justify-center gap-3 group hover:bg-secondary transition-colors duration-300" onClick={() => window.location.href='/cook-with-ai'}>
                <span className="material-symbols-outlined group-hover:animate-pulse" data-icon="bolt">bolt</span>
                Analyze Nutrition with AI
              </button>
            </div>
          </div>

          {/* Page 2 */}
          <div className="page z-20" id="page-2">
            <div className="page-front bg-surface-container-lowest p-8 flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-display-lg text-3xl text-primary">Wild Mushroom Tart</h3>
                  <p className="font-label-sm text-secondary">Forest Foraged • 50 Mins</p>
                </div>
                <button className="text-on-surface-variant hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined" data-icon="bookmark">bookmark</span>
                </button>
              </div>
              <img className="w-full h-48 object-cover rounded-xl mb-4 shadow-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8O3dbV9Tpgkn7NvC4nVSXecGPaJBTTBc2RKDpE9RjM2atoPirgVmPm9Z9kHlLztlmn4hfsV5J7qbXDXCU12gafyQvxJE1QeBFWDw3gCdmqFpl6aBXYHlpLdEONLDlkZCK7M7mvNdUa93UT8qR1I_VspZxHHQ8YtPIrhcSer6WKI6yZLzf6m33K0v-HCbNyJpwHa2g3DJ0A7UA9e7dYxYa0UZhszRAPMX1VjHt16kpMeQrBZsp0EKgs-v2mtThSbBa9RpLvQqLiNEd" alt="Wild Mushroom Tart" />
              
              <ConfidenceBadges />
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed font-label-sm rounded-full">Vegetarian</span>
                <span className="px-3 py-1 bg-surface-container text-on-surface-variant font-label-sm rounded-full">Seasonal</span>
                <span className="px-3 py-1 bg-surface-container text-on-surface-variant font-label-sm rounded-full">Pro Skill</span>
              </div>
              <p className="font-body-md text-on-surface-variant mb-4 line-clamp-2">
                A delicate buttery crust layered with a rich duxelles and topped with hand-picked chanterelles. This recipe uses AI to suggest the perfect wine pairing based on your current cellar.
              </p>
              <div className="mt-auto grid grid-cols-2 gap-3">
                <button className="bg-primary-container text-surface py-4 px-2 rounded-2xl font-bold flex items-center justify-center gap-2 group hover:bg-secondary transition-colors duration-300 text-sm" onClick={() => window.location.href='/cook-with-ai'}>
                  <span className="material-symbols-outlined group-hover:animate-pulse text-lg" data-icon="bolt">bolt</span>
                  Cook
                </button>
                <button className="border border-primary-container text-primary-container py-4 px-2 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container/10 transition-colors duration-300 text-sm" onClick={() => window.location.href='/kitchen'}>
                  <span className="material-symbols-outlined text-lg" data-icon="menu_book">menu_book</span>
                  Details
                </button>
              </div>
            </div>
            <div className="page-back bg-surface-container-lowest p-8 h-full">
              {/* Content for next page front */}
            </div>
          </div>
          {/* Underlay Page (Page 3) */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-surface-container-low p-12 border-l border-outline-variant/30 rounded-r-3xl flex flex-col z-10">
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
              <span className="material-symbols-outlined text-6xl mb-4 text-secondary" data-icon="auto_awesome">auto_awesome</span>
              <h3 className="font-display-lg text-2xl mb-2 text-primary">Discover More</h3>
              <p className="font-body-md max-w-xs text-on-surface-variant">Flip back to review, or scroll down to explore the rest of your recipe collection.</p>
            </div>
          </div>
          <div className="book-spine"></div>
        </div>

        {/* Page Flip Controls Overlay */}
        <div className="absolute inset-y-0 -left-16 flex items-center">
          <button className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-md border border-white/20 shadow-xl flex items-center justify-center text-primary hover:bg-white transition-all group active:scale-90" onClick={prevPage}>
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform" data-icon="arrow_back_ios">arrow_back_ios</span>
          </button>
        </div>
        <div className="absolute inset-y-0 -right-16 flex items-center">
          <button className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-md border border-white/20 shadow-xl flex items-center justify-center text-primary hover:bg-white transition-all group active:scale-90" onClick={nextPage}>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" data-icon="arrow_forward_ios">arrow_forward_ios</span>
          </button>
        </div>
      </div>
      </div>

      {/* Recipe Grid for Discovery */}
      <section className="mt-32 max-w-container-max mx-auto">
        <h2 className="font-display-lg text-headline-lg text-primary mb-12 reveal-up text-center">More for Your Palette</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter stagger-children">
          {/* Recipe Card 1 */}
          <div className="group relative bg-surface-container-low rounded-[32px] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
            <div className="relative h-64 overflow-hidden">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqFCmrg_B9wMgymNRgJOXIOfFVk_6defchY4RvPRV5cVzWsrI5c9P3Lbtm78Y4_P5EbOx2BW62PQvs4iusr5zAYoQYt_nizCxSe0Nbk7U77qLBobGDeuyLVYk2vz2_T86KPJztwB958JzsypIaUo1QOHL7SIIkIRLA4bAIdxJ7hZwvCnoaTkyYHyVFI4yU0OiAkPo7FHJ456PRhp0NJZzKCO6HeW_gp9qAe7NnEijcoy_W55W6twnlL9VM-YhMMDo9UzXs1qqIYnd7" alt="Braised Short Ribs" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                  <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter mb-1 inline-block">Dinner</span>
                  <h4 className="text-surface font-display-lg text-xl">Braised Short Ribs</h4>
                </div>
                <span className="material-symbols-outlined text-surface" data-icon="timer">timer</span>
              </div>
            </div>
            <div className="p-6 bg-surface/90 backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-1">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-secondary text-sm">star</span>
                </div>
                <span className="font-label-sm text-on-surface-variant">420 kcal</span>
              </div>
              <button className="w-full py-3 rounded-2xl bg-primary-container text-surface font-bold hover:bg-secondary transition-colors duration-300" onClick={() => window.location.href='/library'}>View Recipe</button>
            </div>
          </div>
          {/* Recipe Card 2 */}
          <div className="group relative bg-surface-container-low rounded-[32px] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
            <div className="relative h-64 overflow-hidden">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDL2qk_BfPLxgZALT2jxWjpJw4pGS5HRctHMlWrmqIMIOuuIgzWL4zF1NbkJusEO71RXhO_EangMT4z1sVLSilrnpLmP9EzqAXCqflIweQ0R-3zm-dldWFa-Ux9Ighzx-6LxM_O7_ikWBgEeX2dL8wydmCzFfCLJL7wxKZE_8I9KLDJqvyUMXaClIffWm5cfHAz5yMfkGptwZUdjULQPIa_VKExoaWPpYhJxg8fPaxktanWTT_lAWqaOhD0n_Zp4Zv6KNzr8g6uX6o" alt="Lava Cake" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                  <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter mb-1 inline-block">Dessert</span>
                  <h4 className="text-surface font-display-lg text-xl">Lava Cake AI-X</h4>
                </div>
                <span className="material-symbols-outlined text-surface" data-icon="timer">timer</span>
              </div>
            </div>
            <div className="p-6 bg-surface/90 backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-1">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <span className="font-label-sm text-on-surface-variant">580 kcal</span>
              </div>
              <button className="w-full py-3 rounded-2xl bg-primary-container text-surface font-bold hover:bg-secondary transition-colors duration-300" onClick={() => window.location.href='/library'}>View Recipe</button>
            </div>
          </div>
          {/* Recipe Card 3 */}
          <div className="group relative bg-surface-container-low rounded-[32px] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
            <div className="relative h-64 overflow-hidden">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-PEPw8FQpcIqS4_eXL9Q1MOoSSupqXTQpcM-DXzI3AGXUk1Ao_R1D8qvIOSe27yAjxuDmHdFNFn5f06ifEZWXAHQUSEUp_uqYcmpDO3yGcrBFkQhqB7xAZOscfQXqk9g9xMK2ZtvGy53fvepeFt-b9wg64c3iAg0Wtai9jKyOrbmqpdV6mIFR6UvDK2R6R77D5anQz0TeTXcV8QhjOX9emO6KernP2ekJU7rvogB0-tp7MFxMO-O2gN2K_jfkPwdIfHYbOm8GyMgi" alt="Zen Garden Bowl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                  <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter mb-1 inline-block">Lunch</span>
                  <h4 className="text-surface font-display-lg text-xl">Zen Garden Bowl</h4>
                </div>
                <span className="material-symbols-outlined text-surface" data-icon="timer">timer</span>
              </div>
            </div>
            <div className="p-6 bg-surface/90 backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-1">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <span className="font-label-sm text-on-surface-variant">320 kcal</span>
              </div>
              <button className="w-full py-3 rounded-2xl bg-primary-container text-surface font-bold hover:bg-secondary transition-colors duration-300" onClick={() => window.location.href='/library'}>View Recipe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
