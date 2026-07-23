import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import type { RecipeSnapshot, CookingSession } from '../utils/apiClient';
import { useUser } from '../context/UserContext';

interface RecipeDraftTimelineProps {
  currentRecipeData?: {
    title: string;
    ingredients: string[];
    steps: string[];
  };
  onSelectSnapshot?: (snapshot: RecipeSnapshot) => void;
}

export const RecipeDraftTimeline: React.FC<RecipeDraftTimelineProps> = ({
  currentRecipeData,
  onSelectSnapshot,
}) => {
  const { activeUser } = useUser();
  const [sessions, setSessions] = useState<CookingSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('sess_991');
  const [history, setHistory] = useState<RecipeSnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveActionType, setSaveActionType] = useState<RecipeSnapshot['action_type']>('MODIFY');

  // Load sessions on mount or user change
  useEffect(() => {
    async function loadUserSessions() {
      const sessList = await apiClient.getUserSessions(activeUser.id);
      if (sessList.length === 0) {
        const newSess = await apiClient.createSession(activeUser.id);
        setSessions([newSess]);
        setActiveSessionId(newSess.session_id);
      } else {
        setSessions(sessList);
        setActiveSessionId(sessList[0].session_id);
      }
    }
    loadUserSessions();
  }, [activeUser.id]);

  // Load history when active session changes
  useEffect(() => {
    async function fetchHistory() {
      if (!activeSessionId) return;
      const hList = await apiClient.getRecipeHistory(activeSessionId);
      setHistory(hList);
      setCurrentIndex(Math.max(0, hList.length - 1));
      if (hList.length > 0 && onSelectSnapshot) {
        onSelectSnapshot(hList[hList.length - 1]);
      }
    }
    fetchHistory();
  }, [activeSessionId]);

  const handleCreateNewSession = async () => {
    const newSess = await apiClient.createSession(activeUser.id);
    setSessions((prev) => [newSess, ...prev]);
    setActiveSessionId(newSess.session_id);
  };

  const handleSaveSnapshot = async () => {
    if (!currentRecipeData) return;
    setLoading(true);
    const snap = await apiClient.saveRecipeSnapshot(
      activeSessionId,
      currentRecipeData,
      saveActionType
    );
    const updatedHistory = await apiClient.getRecipeHistory(activeSessionId);
    setHistory(updatedHistory);
    setCurrentIndex(updatedHistory.length - 1);
    setLoading(false);
    if (onSelectSnapshot) onSelectSnapshot(snap);
  };

  const handleUndo = async () => {
    if (currentIndex <= 0) return;
    setLoading(true);
    const result = await apiClient.undoRecipeState(activeSessionId);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setLoading(false);
    if (result.current_recipe && onSelectSnapshot) {
      onSelectSnapshot(result.current_recipe);
    }
  };

  const handleRedo = async () => {
    if (currentIndex >= history.length - 1) return;
    setLoading(true);
    const result = await apiClient.redoRecipeState(activeSessionId);
    setCurrentIndex((prev) => Math.min(history.length - 1, prev + 1));
    setLoading(false);
    if (result.current_recipe && onSelectSnapshot) {
      onSelectSnapshot(result.current_recipe);
    }
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] bg-surface-container-lowest/80 border border-outline-variant/20 shadow-xl space-y-6">
      {/* Session Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-secondary">
            <span className="material-symbols-outlined text-lg">history</span>
            <span className="font-label-sm uppercase font-bold text-xs">
              Phase 2: Recipe Drafts & Session Timeline
            </span>
          </div>
          <h3 className="font-display-lg text-xl text-primary font-bold">
            Dynamic State Memory (Undo / Redo)
          </h3>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Active Session Select */}
          <select
            value={activeSessionId}
            onChange={(e) => setActiveSessionId(e.target.value)}
            className="bg-surface-container py-2 px-3 rounded-xl text-xs font-label-sm font-bold text-primary border border-outline-variant/30 focus:outline-none focus:border-secondary"
          >
            {sessions.map((s) => (
              <option key={s.session_id} value={s.session_id}>
                Session: {s.session_id} ({new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </option>
            ))}
          </select>

          <button
            onClick={handleCreateNewSession}
            className="p-2 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-colors"
            title="Start New Cooking Session"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
          </button>
        </div>
      </div>

      {/* Undo / Redo & Snapshot Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-outline-variant/20">
        <div className="flex items-center gap-2">
          {/* UNDO BUTTON */}
          <button
            onClick={handleUndo}
            disabled={currentIndex <= 0 || loading}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high text-primary font-label-sm text-xs font-bold hover:bg-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">undo</span>
            Undo ({currentIndex})
          </button>

          {/* REDO BUTTON */}
          <button
            onClick={handleRedo}
            disabled={currentIndex >= history.length - 1 || loading}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high text-primary font-label-sm text-xs font-bold hover:bg-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">redo</span>
            Redo ({history.length - 1 - currentIndex})
          </button>
        </div>

        {/* SAVE SNAPSHOT CONTROLS */}
        {currentRecipeData && (
          <div className="flex items-center gap-2">
            <select
              value={saveActionType}
              onChange={(e) => setSaveActionType(e.target.value as any)}
              className="bg-surface-container py-2 px-3 rounded-xl text-xs font-label-sm text-on-surface-variant border border-outline-variant/20"
            >
              <option value="CREATE">CREATE</option>
              <option value="MODIFY">MODIFY</option>
              <option value="ALLERGEN_SWAP">ALLERGEN_SWAP</option>
              <option value="EDIT_DIRECTIONS">EDIT_DIRECTIONS</option>
            </select>

            <button
              onClick={handleSaveSnapshot}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary text-surface font-label-sm text-xs font-bold hover:bg-secondary transition-all shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">bookmark</span>
              Save Snapshot
            </button>
          </div>
        )}
      </div>

      {/* Timeline Snapshot History List */}
      <div>
        <h4 className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
          Draft History Timeline ({history.length} snapshots)
        </h4>

        {history.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
            {history.map((snap, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={snap.history_id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    if (onSelectSnapshot) onSelectSnapshot(snap);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-secondary/10 border-secondary shadow-md ring-2 ring-secondary/20'
                      : 'bg-surface border-outline-variant/20 hover:border-secondary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        isActive ? 'bg-secondary text-surface' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-primary">{snap.recipe_data.title}</span>
                        <span className="bg-secondary/20 text-secondary text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                          {snap.action_type}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {snap.recipe_data.ingredients.length} ingredients • {snap.recipe_data.steps.length} directions steps
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-on-surface-variant shrink-0">
                    {new Date(snap.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-on-surface-variant bg-surface rounded-2xl border border-dashed border-outline-variant/30">
            No draft history snapshots saved for session <code className="font-mono text-secondary">{activeSessionId}</code> yet. Click "Save Snapshot" above to create one.
          </div>
        )}
      </div>
    </div>
  );
};
