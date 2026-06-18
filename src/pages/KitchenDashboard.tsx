import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChemistryErrorModal, ContradictionGraph } from '../components/KitchenWidgets';
import { StressTestLoader } from '../components/StressTestLoader';
import { useCookingSession } from '../context/CookingSessionContext';

export const KitchenDashboard = () => {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const { digitalTwinState } = useCookingSession();

  const handleSimulateError = () => setShowErrorModal(true);
  const handleStartStressTest = () => setIsStressTesting(true);
  const navigate = useNavigate();

  return (
    <div className="pt-24 px-margin-mobile md:px-margin-desktop pb-24 max-w-container-max mx-auto min-h-screen relative">
      {isStressTesting && <StressTestLoader onComplete={() => setIsStressTesting(false)} />}
      <ChemistryErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} />

      {/* Profile & Welcome Section */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 reveal-up">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary">Welcome back, Chef.</h1>
          <p className="text-on-surface-variant mt-2 max-w-xl">Your culinary sanctuary is prepped. 4 recipes are in progress, and your library has 2 new AI-generated refinements.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="font-label-sm text-xs text-secondary uppercase">Level 12</p>
            <p className="font-display-lg text-2xl text-primary">Artisan Poissonnier</p>
          </div>
        </div>
      </header>

      {/* Bento Grid: Your Kitchen */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-24 stagger-children">
        {/* Continue Cooking (Large Glass Card) */}
        <div className="md:col-span-8 group cursor-pointer">
          <div className="glass-card espresso-shadow-deep rounded-3xl overflow-hidden relative h-[400px] bg-white/20 transition-all duration-500 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaaWHSy-WHBDW8YTOWBnWmIwltDdoydxqAd7zxe5CNUwPtiaaOkY8HgAe0PXxIKKo741RhRx5H_XhSnff4nAUweQflSUTisqPWPp6iIJVz-wDvUiuLC3CoitRowlY9TMVEcMtdILmrP4xCvxNEAoK9y246CvSqYK1-wo6cGmZphW9t7qwTlBUMFpt_beE09VJGqcGWVvmg2CHGyoWDPGwW8M0ISS3Rx9lneMnLI6lQxuANJQsv6kC5akNFOTnN4wDssUONRZ0OueoI" alt="Active Session" />
            <div className="absolute bottom-0 left-0 p-8 z-20 w-full flex justify-between items-end">
              <div>
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">Active Session</span>
                <h2 className="font-display-lg text-4xl text-surface">Truffle Infused Risotto</h2>
                <p className="text-surface/80 font-body-md mt-2">Step 4 of 12: Emulsifying the Mantecatura</p>
              </div>
              <button className="bg-surface text-primary w-14 h-14 rounded-full flex items-center justify-center hover:bg-secondary hover:text-surface transition-all duration-300 shadow-lg" onClick={handleSimulateError}>
                <span className="material-symbols-outlined text-3xl">play_arrow</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Mini Grid */}
        <div className="md:col-span-4 flex flex-col gap-gutter">
          <div className="glass-card p-6 rounded-3xl flex-1 bg-surface-container-low/60 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-secondary text-4xl">local_fire_department</span>
              <span className="text-xs font-label-sm text-secondary">+12% vs last week</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-sm uppercase tracking-tighter">Kitchen Efficiency</p>
              <p className="font-display-lg text-4xl text-primary">High Precision</p>
            </div>
          </div>
          <div className="glass-card p-6 rounded-3xl flex-1 bg-surface-container-low/60 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-secondary text-4xl">restaurant</span>
              <span className="text-xs font-label-sm text-secondary">24 Ingredients</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-sm uppercase tracking-tighter">Pantry Health</p>
              <p className="font-display-lg text-4xl text-primary">Fully Stocked</p>
            </div>
          </div>
        </div>

        {/* Digital Twin State Viewer */}
        <div className="md:col-span-12 mt-4 glass-card p-6 rounded-3xl bg-surface-container-low/60 flex flex-col gap-4">
          <h3 className="font-display-lg text-2xl text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">data_object</span>
            Culinary Digital Twin (Live State)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {digitalTwinState.map(ingredient => (
              <div key={ingredient.id} className="bg-surface p-4 rounded-xl live-pulse">
                <p className="font-bold text-primary mb-2">{ingredient.name}</p>
                <p className="font-label-sm text-xs text-on-surface-variant">Mass: {ingredient.massGrams}g</p>
                <p className="font-label-sm text-xs text-on-surface-variant">Temp: {ingredient.temperatureCelsius}°C</p>
                <p className="font-label-sm text-xs text-on-surface-variant">Texture: {ingredient.texture}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contradiction Graph Section */}
        <div className="md:col-span-12 mt-4">
          <ContradictionGraph />
        </div>

        {/* Saved Recipes Row */}
        <div className="md:col-span-12 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display-lg text-2xl text-primary">Saved Refinements</h3>
            <Link className="text-secondary font-label-sm flex items-center gap-2 hover:gap-3 transition-all" to="/library">View Library <span className="material-symbols-outlined">arrow_forward</span></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <div className="liquid-hover glass-card bg-white/40 rounded-2xl overflow-hidden espresso-shadow cursor-pointer">
              <div className="h-48 overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe0AD34aGqd6r8D8xiDCvgetSz6Mey7g8xX66LOKCsQtj40wmuqU7w_tMRM2nEqQzMPn_nXiQssADv1xm3CeWPQNaR9Bzz3XOXN0MKUqZECCoKP2XCh2UPPRbHWZ8y1Xd0j7Uu4ScmTRxAx-ebOx0VaND0MmjmVZ7MBO7NcgkjrN4A5RvGSCUyfkcD2NnWGoY6-H8BdJU7ST0h9xcBinylT7djF3V2_cz5xkzY95H4rGbRQoQ_o96vNd-tDEEMMiZCe_Cv-wsVm4K_" alt="Citrus Mediterranean" />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2">
                  <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] text-on-tertiary-container">LITE</span>
                  <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] text-on-tertiary-container">15 MIN</span>
                </div>
                <h4 className="font-display-lg text-lg text-primary">Citrus Mediterranean</h4>
                <p className="text-xs text-on-surface-variant mt-1">Refined by AI for low sodium</p>
              </div>
            </div>
            <div className="liquid-hover glass-card bg-white/40 rounded-2xl overflow-hidden espresso-shadow cursor-pointer">
              <div className="h-48 overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdd4-gUNjwG9_H3rzvxUIGvgscryFOVMb7zTdiGFqE6yeoHO0sJhNLtLHhwEIr44sZvVrSqYm1iHnfKTUfEhBf35gX7u6kZtzaSZ4S7gTdVG5SRZARG_teeqb73tFzXnpE1N_tErVa39J3gFSC69BShf4WGVTzp-0QH1WKPEsFXzYBME11n5OMbA8kQt6PqNeNt8TKOW47xOaTuuGWK4UFajpEudCKREC-WrymLtiOJ3FQWv5L-VWK665y_8pN4GMdS4hxkMkCNrDC" alt="Velvet Cacao Dome" />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2">
                  <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] text-on-tertiary-container">DESSERT</span>
                  <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] text-on-tertiary-container">45 MIN</span>
                </div>
                <h4 className="font-display-lg text-lg text-primary">Velvet Cacao Dome</h4>
                <p className="text-xs text-on-surface-variant mt-1">Sous-Chef Original Creation</p>
              </div>
            </div>
            <div className="liquid-hover glass-card bg-white/40 rounded-2xl overflow-hidden espresso-shadow cursor-pointer">
              <div className="h-48 overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAATIQ5-PrLwHpMASowUNTzMyuGIWPWHKal4jroBwd0-26KA4dBaE5VnmWRsznu8wHaCm4PalOS6cHRyWiUBzAkaWId5r70TruzzhiOeXTESlqVpfQkpFj49PcIm9k7SUqS3SBLIN4Dxd5eK_CyC-bFE4KVC6CHkv6wH1UGSLZazkxO_niHsZY33m6Oi0DRGOb6mL6hYtzRnaTKQ4YVgi8K-KB1SLaaJTpvjb9dQBfgptWZ_d8XwlcXI0W20jgfrmk7tkhuw_-HBHGf" alt="Hand-Cut Genovese" />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2">
                  <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] text-on-tertiary-container">ITALIAN</span>
                  <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] text-on-tertiary-container">30 MIN</span>
                </div>
                <h4 className="font-display-lg text-lg text-primary">Hand-Cut Genovese</h4>
                <p className="text-xs text-on-surface-variant mt-1">Manual adjustment saved</p>
              </div>
            </div>
            <div className="liquid-hover glass-card bg-white/40 rounded-2xl overflow-hidden espresso-shadow cursor-pointer">
              <div className="h-48 overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1KIjazrdlg9-QdUmuMtNdGvNDsbsLh3aWH5soUx4CMYMUGEVzFAxAqyfAfooWL9MNXKl-90O_YMXElXPwEA7ZI9hnWnnz4N41IN0p1OkTUwlv_filxEwAY3_1ZG_zRuK9Z-bZi7AVt661JI2930UZc6U5YNLa07hmxg0PFo3mTfcCiY-Ug8TGEoG7IjAOJKXV6SiWWlhmtKd3Xe_TXbVn8hc57Wrk1z2CRhKkl_N6bxeU0CvQ84sTLj-yNzh2NyFj5VojeQB8qiww" alt="Artisan Harvest Bowl" />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2">
                  <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] text-on-tertiary-container">VEGAN</span>
                  <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] text-on-tertiary-container">20 MIN</span>
                </div>
                <h4 className="font-display-lg text-lg text-primary">Artisan Harvest Bowl</h4>
                <p className="text-xs text-on-surface-variant mt-1">Bookmarked from 'Modern Green'</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bookmarked Cookbook Pages */}
      <section className="mb-24 reveal-up">
        <h3 className="font-display-lg text-2xl text-primary mb-8">Digital Cookbook Library</h3>
        <div className="flex overflow-x-auto pb-8 gap-gutter no-scrollbar">
          <div className="min-w-[320px] glass-card bg-white/20 p-8 rounded-3xl border border-secondary/10 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
            <span className="material-symbols-outlined text-secondary">auto_stories</span>
            <h4 className="font-display-lg text-xl text-primary">Modernist Cuisine: Vol 1</h4>
            <p className="text-sm italic opacity-70">"The Physics of Spherification"</p>
            <div className="mt-auto pt-6 border-t border-outline-variant/30 flex justify-between items-center">
              <span className="font-label-sm text-[10px] text-on-surface-variant">PAGE 142</span>
              <button className="text-secondary hover:underline font-label-sm text-xs" onClick={() => navigate('/library')}>Jump to Page</button>
            </div>
          </div>
          <div className="min-w-[320px] glass-card bg-white/20 p-8 rounded-3xl border border-secondary/10 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
            <span className="material-symbols-outlined text-secondary">auto_stories</span>
            <h4 className="font-display-lg text-xl text-primary">The Noma Guide</h4>
            <p className="text-sm italic opacity-70">"Mastering Koji and Fermentation"</p>
            <div className="mt-auto pt-6 border-t border-outline-variant/30 flex justify-between items-center">
              <span className="font-label-sm text-[10px] text-on-surface-variant">PAGE 289</span>
              <button className="text-secondary hover:underline font-label-sm text-xs" onClick={() => navigate('/library')}>Jump to Page</button>
            </div>
          </div>
          <div className="min-w-[320px] glass-card bg-white/20 p-8 rounded-3xl border border-secondary/10 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
            <span className="material-symbols-outlined text-secondary">auto_stories</span>
            <h4 className="font-display-lg text-xl text-primary">Mastering French Cooking</h4>
            <p className="text-sm italic opacity-70">"The Art of the Soufflé"</p>
            <div className="mt-auto pt-6 border-t border-outline-variant/30 flex justify-between items-center">
              <span className="font-label-sm text-[10px] text-on-surface-variant">PAGE 56</span>
              <button className="text-secondary hover:underline font-label-sm text-xs" onClick={() => navigate('/library')}>Jump to Page</button>
            </div>
          </div>
        </div>
      </section>

      {/* Cooking History */}
      <section className="mb-24 flex flex-col gap-4 reveal-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display-lg text-2xl text-primary">Culinary History</h3>
          <button onClick={handleStartStressTest} className="px-6 py-2 bg-secondary/10 text-secondary border border-secondary/30 rounded-full font-label-sm hover:bg-secondary/20 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">science</span>
            Stress Test New Recipe
          </button>
        </div>
        <div className="glass-card rounded-3xl overflow-hidden bg-white/10">
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest">
                <th className="p-6">Dish</th>
                <th className="p-6">Date</th>
                <th className="p-6">Duration</th>
                <th className="p-6">AI Feedback</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-sm">
              <tr className="border-b border-outline-variant/10 hover:bg-white/20 transition-colors">
                <td className="p-6 font-semibold">Osso Buco à la Milanese</td>
                <td className="p-6 opacity-60">Oct 12, 2026</td>
                <td className="p-6 opacity-60">3h 20m</td>
                <td className="p-6"><span className="text-secondary">Perfect Sear Achieved</span></td>
                <td className="p-6 text-right"><button className="material-symbols-outlined text-on-surface-variant hover:text-secondary transition-colors">history</button></td>
              </tr>
              <tr className="border-b border-outline-variant/10 hover:bg-white/20 transition-colors">
                <td className="p-6 font-semibold">Seared Scallops with Pea Puree</td>
                <td className="p-6 opacity-60">Oct 09, 2026</td>
                <td className="p-6 opacity-60">45m</td>
                <td className="p-6"><span className="text-on-surface-variant">Plating Improved (B+)</span></td>
                <td className="p-6 text-right"><button className="material-symbols-outlined text-on-surface-variant hover:text-secondary transition-colors">history</button></td>
              </tr>
              <tr className="hover:bg-white/20 transition-colors">
                <td className="p-6 font-semibold">Sourdough Boule (75% Hydration)</td>
                <td className="p-6 opacity-60">Oct 05, 2026</td>
                <td className="p-6 opacity-60">14h 00m</td>
                <td className="p-6"><span className="text-secondary">Crust Depth Optimal</span></td>
                <td className="p-6 text-right"><button className="material-symbols-outlined text-on-surface-variant hover:text-secondary transition-colors">history</button></td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </section>
    </div>
  );
};
