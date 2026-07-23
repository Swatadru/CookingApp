import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { mockRecipes } from '../data/mockData';
import { RecipeCard } from '../components/RecipeCard';

export const Profile = () => {
  const {
    profiles,
    activeUser,
    activeUserId,
    setActiveUserId,
    savedRecipeIds,
    chatHistory,
    clearChatHistory,
    updateActiveUser,
  } = useUser();

  const [activeTab, setActiveTab] = useState<'saved' | 'chat' | 'preferences'>('saved');

  // Filter recipes for saved recipes tab
  const savedRecipes = mockRecipes.filter((r) => savedRecipeIds.includes(r.id));

  return (
    <div className="pt-24 pb-24 min-h-screen relative">

      {/* ═══════════════════════════════════════
          PREMIUM PROFILE HERO
         ═══════════════════════════════════════ */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(135deg, #26170c 0%, #3d2b1f 30%, #574335 60%, #944925 100%)',
          }}
        />
        {/* Decorative Circles */}
        <div className="absolute top-[-60px] right-[-40px] w-[300px] h-[300px] rounded-full opacity-10 z-0"
          style={{ background: 'radial-gradient(circle, #fe9e72 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] left-[10%] w-[400px] h-[400px] rounded-full opacity-8 z-0"
          style={{ background: 'radial-gradient(circle, #fbddca 0%, transparent 70%)' }} />
        <div className="absolute top-[20%] left-[60%] w-[150px] h-[150px] rounded-full opacity-5 z-0"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }} />

        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8">

            {/* Left: Avatar + Identity */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar Ring */}
              <div className="relative group">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #fe9e72 0%, #944925 100%)',
                    padding: '3px',
                  }}>
                  <div className="w-full h-full rounded-full bg-[#26170c] flex items-center justify-center overflow-hidden">
                    <span className="material-symbols-outlined text-6xl md:text-7xl text-[#fe9e72]/80">{activeUser.avatar}</span>
                  </div>
                </div>
                {/* Online Pulse */}
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#4ade80] border-[3px] border-[#26170c]">
                  <div className="w-full h-full rounded-full bg-[#4ade80] animate-ping opacity-75" />
                </div>
              </div>

              {/* Name & Title */}
              <div className="text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
                  <h1 className="font-display-lg text-3xl md:text-4xl text-white font-bold tracking-tight">
                    {activeUser.name}
                  </h1>
                  <span className="px-3 py-1 rounded-full text-[10px] font-label-sm font-bold uppercase tracking-widest border border-[#fe9e72]/40 text-[#fe9e72] bg-[#fe9e72]/10 backdrop-blur-sm">
                    Active
                  </span>
                </div>
                <p className="text-[#fe9e72]/90 font-label-sm text-xs tracking-widest uppercase mb-1 flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="material-symbols-outlined text-sm">stars</span>
                  {activeUser.title}
                </p>
                <p className="text-white/40 text-xs font-body-md">Joined {activeUser.joinedDate}</p>
              </div>
            </div>

            {/* Right: Profile Switcher */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 min-w-[240px]">
              <label className="text-[10px] font-label-sm uppercase tracking-widest text-white/50 font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#fe9e72]">swap_horizontal_circle</span>
                Switch Profile
              </label>
              <select
                value={activeUserId}
                onChange={(e) => setActiveUserId(e.target.value)}
                className="bg-white/10 py-2.5 px-4 rounded-xl text-sm font-label-sm font-bold text-white border border-white/10 focus:outline-none focus:border-[#fe9e72]/50 cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255,255,255,0.5)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#26170c] text-white">
                    {p.name} ({p.title.split('•')[0].trim()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-3 gap-4 mt-10 max-w-xl">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-all duration-300 group cursor-default">
              <p className="text-2xl md:text-3xl font-display-lg font-bold text-white group-hover:text-[#fe9e72] transition-colors">
                {savedRecipeIds.length}
              </p>
              <p className="text-[10px] font-label-sm uppercase tracking-widest text-white/40 mt-1">
                Saved
              </p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-all duration-300 group cursor-default">
              <p className="text-2xl md:text-3xl font-display-lg font-bold text-white group-hover:text-[#fe9e72] transition-colors">
                {chatHistory.length}
              </p>
              <p className="text-[10px] font-label-sm uppercase tracking-widest text-white/40 mt-1">
                Chats
              </p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-all duration-300 group cursor-default">
              <p className="text-2xl md:text-3xl font-display-lg font-bold text-[#fe9e72] capitalize">
                {activeUser.skillLevel}
              </p>
              <p className="text-[10px] font-label-sm uppercase tracking-widest text-white/40 mt-1">
                Level
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          PILL NAVIGATION TABS
         ═══════════════════════════════════════ */}
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex gap-2 py-8 overflow-x-auto no-scrollbar">
          {([
            { key: 'saved', icon: 'favorite', label: `Saved Recipes (${savedRecipeIds.length})` },
            { key: 'chat', icon: 'forum', label: `Chat History (${chatHistory.length})` },
            { key: 'preferences', icon: 'tune', label: 'Preferences & Devices' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-label-sm text-sm font-bold transition-all duration-300 whitespace-nowrap border ${
                activeTab === tab.key
                  ? 'bg-primary text-surface border-primary shadow-lg shadow-primary/20'
                  : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high hover:border-primary/30 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════
            TAB 1: SAVED RECIPES
           ═══════════════════════════════════════ */}
        {activeTab === 'saved' && (
          <div className="animate-fade-in">
            {savedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                {savedRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center rounded-[2rem] border-2 border-dashed border-outline-variant/30 bg-surface-container-low/40">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                  style={{ background: 'linear-gradient(135deg, #fe9e72 0%, #944925 100%)' }}>
                  <span className="material-symbols-outlined text-4xl text-white">favorite_border</span>
                </div>
                <h3 className="font-display-lg text-xl text-primary mb-2">No Saved Recipes Yet</h3>
                <p className="text-on-surface-variant text-sm max-w-md mb-6 leading-relaxed">
                  Explore our Recipe Book or generate custom AI recipes to build {activeUser.name}'s collection!
                </p>
                <Link
                  to="/recipe-book"
                  className="px-7 py-3 rounded-full bg-primary text-surface font-label-sm text-sm hover:bg-secondary transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-0.5"
                >
                  Browse Recipe Book
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB 2: CHAT HISTORY
           ═══════════════════════════════════════ */}
        {activeTab === 'chat' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="font-display-lg text-xl text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">history</span>
                AI Sous-Chef Chat Log
              </h2>
              <div className="flex items-center gap-3">
                {chatHistory.length > 0 && (
                  <button
                    onClick={clearChatHistory}
                    className="px-4 py-2.5 rounded-full text-xs font-label-sm text-error hover:bg-error/10 border border-error/20 transition-all duration-300 flex items-center gap-1.5 hover:shadow-md"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Clear History
                  </button>
                )}
                <Link
                  to="/chat"
                  className="px-5 py-2.5 rounded-full text-xs font-label-sm bg-secondary text-surface hover:bg-primary transition-all duration-300 flex items-center gap-1.5 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  Open AI Chatbot
                </Link>
              </div>
            </div>

            {chatHistory.length > 0 ? (
              <div className="rounded-[2rem] bg-surface-container-lowest border border-outline-variant/20 shadow-lg overflow-hidden">
                <div className="p-6 md:p-8 space-y-4 max-h-[600px] overflow-y-auto no-scrollbar">
                  {chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl max-w-[85%] shadow-sm transition-all duration-300 hover:shadow-md ${
                        msg.role === 'ai'
                          ? 'bg-surface-container-high text-on-surface-variant rounded-tl-none border border-outline-variant/20'
                          : 'bg-secondary text-surface rounded-tr-none ml-auto'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-70 mb-1.5 font-mono">
                        <span>{msg.role === 'ai' ? '🤖 AI Sous-Chef' : `👤 ${activeUser.name}`}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="text-sm font-body-md leading-relaxed whitespace-pre-line">
                        {msg.text}
                      </p>
                      {msg.recipeTitle && (
                        <div className="mt-2 pt-2 border-t border-black/10 text-xs font-label-sm font-bold flex items-center gap-1 text-secondary">
                          <span className="material-symbols-outlined text-sm">restaurant</span>
                          Recipe Context: {msg.recipeTitle}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center rounded-[2rem] border-2 border-dashed border-outline-variant/30 bg-surface-container-low/40">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                  style={{ background: 'linear-gradient(135deg, #fe9e72 0%, #944925 100%)' }}>
                  <span className="material-symbols-outlined text-4xl text-white">chat_bubble_outline</span>
                </div>
                <h3 className="font-display-lg text-xl text-primary mb-2">No Chat History Saved</h3>
                <p className="text-on-surface-variant text-sm max-w-md mb-6 leading-relaxed">
                  Start a conversation with the AI Chatbot to ask questions, solve kitchen disasters, or co-create recipes.
                </p>
                <Link
                  to="/chat"
                  className="px-7 py-3 rounded-full bg-primary text-surface font-label-sm text-sm hover:bg-secondary transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-0.5"
                >
                  Launch AI Chatbot
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB 3: PREFERENCES & HARDWARE (Bento Grid)
           ═══════════════════════════════════════ */}
        {activeTab === 'preferences' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">

            {/* ── Culinary Skill Level ─────────────── */}
            <section className="lg:col-span-7 rounded-[2rem] p-8 border border-outline-variant/20 bg-surface-container-low/60 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/3 group-hover:to-secondary/5 transition-all duration-500 z-0 rounded-[2rem]" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #26170c 0%, #574335 100%)' }}>
                    <span className="material-symbols-outlined text-xl">restaurant_menu</span>
                  </div>
                  <div>
                    <h2 className="font-display-lg text-xl text-primary">Culinary Skill Level</h2>
                    <p className="text-[10px] text-on-surface-variant font-label-sm uppercase tracking-widest">Powers the Adaptive Instruction Rewriter</p>
                  </div>
                </div>

                <div className="flex bg-surface-container p-1.5 rounded-2xl w-full max-w-[360px] relative">
                  <button
                    onClick={() => updateActiveUser({ skillLevel: 'beginner' })}
                    className={`flex-1 py-3 rounded-xl font-label-sm text-sm transition-all duration-300 relative z-10 text-center font-bold ${
                      activeUser.skillLevel === 'beginner' ? 'text-surface' : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    🌱 Beginner
                  </button>
                  <button
                    onClick={() => updateActiveUser({ skillLevel: 'pro' })}
                    className={`flex-1 py-3 rounded-xl font-label-sm text-sm transition-all duration-300 relative z-10 text-center font-bold ${
                      activeUser.skillLevel === 'pro' ? 'text-surface' : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    👨‍🍳 Professional
                  </button>
                  <div
                    className="absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-500 ease-out shadow-md z-0"
                    style={{
                      width: 'calc(50% - 6px)',
                      left: '6px',
                      transform: activeUser.skillLevel === 'beginner' ? 'translateX(0)' : 'translateX(calc(100% + 6px))',
                      background: 'linear-gradient(135deg, #26170c 0%, #574335 100%)',
                    }}
                  />
                </div>

                <p className="text-sm text-on-surface-variant mt-5 leading-relaxed max-w-xl">
                  {activeUser.skillLevel === 'pro'
                    ? "Recipes will use professional culinary terminology (e.g. 'macedoine', 'beurre monté') and assume advanced knife skills and temperature control."
                    : "Recipes will use clear, descriptive language with step-by-step visual cues to help you master fundamental techniques safely."}
                </p>
              </div>
            </section>

            {/* ── Connected Kitchen ─────────────── */}
            <section className="lg:col-span-5 rounded-[2rem] p-7 relative overflow-hidden shadow-xl"
              style={{ background: 'linear-gradient(160deg, #111111 0%, #1a1a1a 50%, #222222 100%)' }}>
              {/* Decorative glow */}
              <div className="absolute top-[-40px] right-[-30px] w-[200px] h-[200px] rounded-full opacity-15 z-0"
                style={{ background: 'radial-gradient(circle, #fe9e72 0%, transparent 70%)' }} />
              <div className="absolute bottom-[-60px] left-[-30px] w-[250px] h-[250px] rounded-full opacity-8 z-0"
                style={{ background: 'radial-gradient(circle, #4ade80 0%, transparent 70%)' }} />

              <h2 className="font-display-lg text-xl text-white mb-6 flex items-center gap-2.5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#4ade80]">bluetooth</span>
                </div>
                Connected Kitchen
              </h2>

              <div className="space-y-3 relative z-10">
                <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all duration-300 group/device cursor-default">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                    style={{ background: 'linear-gradient(135deg, #fe9e72 0%, #944925 100%)' }}>
                    <span className="material-symbols-outlined text-xl text-white">device_thermostat</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white group-hover/device:text-[#fe9e72] transition-colors">Meater Block Pro</p>
                    <p className="text-xs text-white/50 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse shrink-0" />
                      Connected — Probe 1: 54°C
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-display-lg font-bold text-[#fe9e72]">54°</p>
                    <p className="text-[10px] text-white/30 font-label-sm uppercase">Live</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all duration-300 group/device cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shadow-lg shrink-0">
                    <span className="material-symbols-outlined text-xl text-white">scale</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white group-hover/device:text-white/90 transition-colors">Acaia Pearl Scale</p>
                    <p className="text-xs text-white/50 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse shrink-0" />
                      Standby — 0.0g
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-display-lg font-bold text-white/60">0.0g</p>
                    <p className="text-[10px] text-white/30 font-label-sm uppercase">Idle</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Dietary Profile ─────────────── */}
            <section className="lg:col-span-12 rounded-[2rem] p-8 border border-outline-variant/20 bg-surface-container-low/60 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #944925 0%, #fe9e72 100%)' }}>
                  <span className="material-symbols-outlined text-xl">health_and_safety</span>
                </div>
                <div>
                  <h2 className="font-display-lg text-xl text-primary">Dietary Profile</h2>
                  <p className="text-[10px] text-on-surface-variant font-label-sm uppercase tracking-widest">Powers the Cultural Allergen Swapper</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Vegan */}
                <label
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer group/diet hover:shadow-lg hover:-translate-y-0.5 ${
                    activeUser.dietary.vegan
                      ? 'bg-[#f0fdf4] border-[#4ade80]/50 shadow-md shadow-[#4ade80]/10'
                      : 'bg-surface border-outline-variant/20 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${
                      activeUser.dietary.vegan ? 'bg-[#4ade80]/20' : 'bg-surface-container-high'
                    }`}>
                      🌿
                    </div>
                    <div>
                      <span className="font-bold text-primary block text-sm">Vegan</span>
                      <span className="text-[11px] text-on-surface-variant">No animal products</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[#4ade80] rounded cursor-pointer"
                    checked={activeUser.dietary.vegan}
                    onChange={(e) =>
                      updateActiveUser({
                        dietary: { ...activeUser.dietary, vegan: e.target.checked },
                      })
                    }
                  />
                </label>

                {/* Gluten-Free */}
                <label
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer group/diet hover:shadow-lg hover:-translate-y-0.5 ${
                    activeUser.dietary.glutenFree
                      ? 'bg-[#fefce8] border-[#facc15]/50 shadow-md shadow-[#facc15]/10'
                      : 'bg-surface border-outline-variant/20 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${
                      activeUser.dietary.glutenFree ? 'bg-[#facc15]/20' : 'bg-surface-container-high'
                    }`}>
                      🌾
                    </div>
                    <div>
                      <span className="font-bold text-primary block text-sm">Gluten-Free</span>
                      <span className="text-[11px] text-on-surface-variant">Celiac protocol</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[#facc15] rounded cursor-pointer"
                    checked={activeUser.dietary.glutenFree}
                    onChange={(e) =>
                      updateActiveUser({
                        dietary: { ...activeUser.dietary, glutenFree: e.target.checked },
                      })
                    }
                  />
                </label>

                {/* Nut Allergy */}
                <label
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer group/diet hover:shadow-lg hover:-translate-y-0.5 ${
                    activeUser.dietary.nutAllergy
                      ? 'bg-[#fef2f2] border-error/40 shadow-md shadow-error/10'
                      : 'bg-surface border-outline-variant/20 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${
                      activeUser.dietary.nutAllergy ? 'bg-error/15' : 'bg-surface-container-high'
                    }`}>
                      🥜
                    </div>
                    <div>
                      <span className="font-bold text-primary block text-sm">Nut Allergy</span>
                      <span className="text-[11px] text-on-surface-variant">Anaphylaxis risk</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[#ef4444] rounded cursor-pointer"
                    checked={activeUser.dietary.nutAllergy}
                    onChange={(e) =>
                      updateActiveUser({
                        dietary: { ...activeUser.dietary, nutAllergy: e.target.checked },
                      })
                    }
                  />
                </label>

                {/* Pescatarian */}
                <label
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer group/diet hover:shadow-lg hover:-translate-y-0.5 ${
                    activeUser.dietary.pescatarian
                      ? 'bg-[#eff6ff] border-[#3b82f6]/40 shadow-md shadow-[#3b82f6]/10'
                      : 'bg-surface border-outline-variant/20 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${
                      activeUser.dietary.pescatarian ? 'bg-[#3b82f6]/15' : 'bg-surface-container-high'
                    }`}>
                      🐟
                    </div>
                    <div>
                      <span className="font-bold text-primary block text-sm">Pescatarian</span>
                      <span className="text-[11px] text-on-surface-variant">Seafood allowed</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[#3b82f6] rounded cursor-pointer"
                    checked={activeUser.dietary.pescatarian}
                    onChange={(e) =>
                      updateActiveUser({
                        dietary: { ...activeUser.dietary, pescatarian: e.target.checked },
                      })
                    }
                  />
                </label>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Fade-in animation keyframe */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
