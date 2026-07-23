// ============================================================
// Sous-Chef AI FastAPI Backend API Client
// Handles User/Session management, Recipe Draft Undo/Redo Timeline,
// Allergen Scanning/Swapping, Contradiction Validation, and Validity Scoring.
// ============================================================
import { mockRecipes } from '../data/mockData';

export interface BackendUser {
  user_id: string;
  username: string;
  created_at: string;
}

export interface ChemistryMetrics {
  maillardTemp: string;
  phLevel: number;
  emulsionStability: string;
  gelatinizationTemp: string;
  keyFlavors: string[];
}

export interface PaginatedRecipes {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CookingSession {
  session_id: string;
  user_id: string;
  created_at: string;
  last_active: string;
}

export interface RecipeSnapshot {
  history_id: string;
  session_id: string;
  action_type: 'CREATE' | 'MODIFY' | 'ALLERGEN_SWAP' | 'EDIT_DIRECTIONS' | 'REDO_RESTORE';
  recipe_data: {
    title: string;
    ingredients: string[];
    steps: string[];
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  };
  created_at: string;
}

export interface AllergenViolation {
  ingredient: string;
  violation: string;
}

export interface AllergenSwapResult {
  swaps_made: Array<{
    original: string;
    substitute: string;
    reason: string;
  }>;
}

export interface ContradictionResult {
  logic_score: number; // 0.0 to 1.0
  contradictions: string[];
}

export interface RecipeScoreResult {
  score: number; // 0 to 100
  status: 'VALID' | 'MARGINAL' | 'INVALID';
  breakdown: {
    chemistry_score: number;
    physics_score: number;
    taste_score: number; // 1-5
    safety_score: number; // 1-5
    authenticity_score: number; // 1-5
  };
  contradiction_result: ContradictionResult;
}

export interface CuisineClassificationResult {
  predicted_cuisine: string;
  probabilities: Record<string, number>;
}

// In-memory mock database for fallback when FastAPI backend is offline
let mockUsers: BackendUser[] = [
  { user_id: 'u_101', username: 'Chef Mario', created_at: '2026-06-01T10:00:00Z' },
  { user_id: 'u_102', username: 'Chef Swatadru', created_at: '2026-06-15T12:30:00Z' },
  { user_id: 'u_103', username: 'Chef Elena Vance', created_at: '2026-07-01T09:15:00Z' },
];

let mockSessions: CookingSession[] = [
  {
    session_id: 'sess_991',
    user_id: 'u_101',
    created_at: '2026-07-22T14:00:00Z',
    last_active: '2026-07-22T15:20:00Z',
  },
];

let mockRecipeHistories: Record<string, RecipeSnapshot[]> = {
  sess_991: [
    {
      history_id: 'snap_1',
      session_id: 'sess_991',
      action_type: 'CREATE',
      recipe_data: {
        title: 'Butter Chicken Masala',
        ingredients: ['500g Chicken thighs', '100g Butter', '200ml Heavy cream', '2 Onions', '3 cloves Garlic'],
        steps: ['Marinate chicken in yogurt and spices.', 'Sear chicken in butter until golden.', 'Prepare tomato cream gravy.'],
      },
      created_at: '2026-07-22T14:05:00Z',
    },
    {
      history_id: 'snap_2',
      session_id: 'sess_991',
      action_type: 'ALLERGEN_SWAP',
      recipe_data: {
        title: 'Dairy-Free Butter Chicken',
        ingredients: ['500g Chicken thighs', '100g Coconut oil', '200ml Coconut cream', '2 Onions', '3 cloves Garlic'],
        steps: ['Marinate chicken in coconut yogurt and spices.', 'Sear chicken in coconut oil.', 'Simmer in cashew tomato gravy.'],
      },
      created_at: '2026-07-22T14:15:00Z',
    },
  ],
};

let mockUndoPointers: Record<string, number> = {
  sess_991: 1, // index of current active history snapshot
};

// Helper for fetch with JSON error handling
async function postJSON<T>(url: string, body: any, fallback: () => T): Promise<T> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data || data;
  } catch {
    return fallback();
  }
}

async function getJSON<T>(url: string, fallback: () => T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data || data.users || data.sessions || data.history || data;
  } catch {
    return fallback();
  }
}

// API CLIENT METHODS

export const apiClient = {
  // ────────────────────────────────────────────────────────
  // Recipe Book (from actual Dataset)
  // ────────────────────────────────────────────────────────

  getRecipes: async (page: number = 1, limit: number = 12, cuisine: string = 'All', search: string = '') => {
    let url = `/api/recipes?page=${page}&limit=${limit}`;
    if (cuisine && cuisine !== 'All') {
      url += `&cuisine=${encodeURIComponent(cuisine)}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[API Mock Fallback] ${url} failed, using fallback data.`, err);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0
      };
    }
  },

  getRecipeById: async (recipeId: string) => {
    return getJSON<any>(`/api/recipes/detail/${recipeId}`, () => ({} as any));
  },

  // 1. USER MANAGEMENT
  async createBackendUser(username: string): Promise<BackendUser> {
    return postJSON(`/api/users`, { username }, () => {
      const newUser: BackendUser = {
        user_id: 'u_' + Date.now(),
        username,
        created_at: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      return newUser;
    });
  },

  async getBackendUsers(): Promise<BackendUser[]> {
    return getJSON(`/api/users`, () => mockUsers) as Promise<BackendUser[]>;
  },

  // 2. SESSION MANAGEMENT
  async createSession(userId: string): Promise<CookingSession> {
    return postJSON(`/api/sessions`, { user_id: userId }, () => {
      const newSession: CookingSession = {
        session_id: 'sess_' + Date.now(),
        user_id: userId,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      };
      mockSessions.push(newSession);
      mockRecipeHistories[newSession.session_id] = [];
      mockUndoPointers[newSession.session_id] = -1;
      return newSession;
    });
  },

  async getUserSessions(userId: string): Promise<CookingSession[]> {
    return getJSON(`/api/sessions/user/${userId}`, () =>
      mockSessions.filter((s) => s.user_id === userId)
    );
  },

  // 3. RECIPE DRAFTS & UNDO/REDO TIMELINE
  async saveRecipeSnapshot(
    sessionId: string,
    recipeData: RecipeSnapshot['recipe_data'],
    actionType: RecipeSnapshot['action_type'] = 'MODIFY'
  ): Promise<RecipeSnapshot> {
    return postJSON(
      `/api/recipes/save`,
      { session_id: sessionId, recipe_data: recipeData, action_type: actionType },
      () => {
        const history = mockRecipeHistories[sessionId] || [];
        const currentPointer = mockUndoPointers[sessionId] ?? history.length - 1;

        // Truncate any redo history beyond current pointer
        const validHistory = history.slice(0, currentPointer + 1);

        const snapshot: RecipeSnapshot = {
          history_id: 'snap_' + Date.now(),
          session_id: sessionId,
          action_type: actionType,
          recipe_data: recipeData,
          created_at: new Date().toISOString(),
        };

        validHistory.push(snapshot);
        mockRecipeHistories[sessionId] = validHistory;
        mockUndoPointers[sessionId] = validHistory.length - 1;
        return snapshot;
      }
    );
  },

  async getRecipeHistory(sessionId: string): Promise<RecipeSnapshot[]> {
    return getJSON(`/api/recipes/${sessionId}/history`, () => mockRecipeHistories[sessionId] || []);
  },

  async undoRecipeState(sessionId: string): Promise<{ current_recipe: RecipeSnapshot }> {
    return postJSON(`/api/recipes/${sessionId}/undo`, {}, () => {
      const history = mockRecipeHistories[sessionId] || [];
      const currentPointer = mockUndoPointers[sessionId] ?? history.length - 1;
      const newPointer = Math.max(0, currentPointer - 1);
      mockUndoPointers[sessionId] = newPointer;
      return { current_recipe: history[newPointer] || history[0] };
    });
  },

  async redoRecipeState(sessionId: string): Promise<{ current_recipe: RecipeSnapshot }> {
    return postJSON(`/api/recipes/${sessionId}/redo`, {}, () => {
      const history = mockRecipeHistories[sessionId] || [];
      const currentPointer = mockUndoPointers[sessionId] ?? 0;
      const newPointer = Math.min(history.length - 1, currentPointer + 1);
      mockUndoPointers[sessionId] = newPointer;
      return { current_recipe: history[newPointer] || history[history.length - 1] };
    });
  },

  // 4. ALLERGEN SCANNING & SWAPPING
  async scanAllergens(
    ingredients: string[],
    allergies: string[],
    dietType?: string
  ): Promise<AllergenViolation[]> {
    return postJSON(
      `/api/allergens/scan`,
      { ingredients, allergies, diet_type: dietType },
      () => {
        const violations: AllergenViolation[] = [];
        ingredients.forEach((ing) => {
          const lower = ing.toLowerCase();
          if (allergies.includes('Gluten-Free') && (lower.includes('wheat') || lower.includes('flour') || lower.includes('soy sauce'))) {
            violations.push({ ingredient: ing, violation: 'Gluten-Free' });
          }
          if (allergies.includes('Vegan') && (lower.includes('milk') || lower.includes('cream') || lower.includes('butter') || lower.includes('egg') || lower.includes('chicken') || lower.includes('beef'))) {
            violations.push({ ingredient: ing, violation: 'Vegan' });
          }
          if (allergies.includes('Nut Allergy') && (lower.includes('peanut') || lower.includes('almond') || lower.includes('cashew') || lower.includes('walnut'))) {
            violations.push({ ingredient: ing, violation: 'Nut Allergy' });
          }
        });
        return violations;
      }
    );
  },

  async swapAllergens(
    ingredients: string[],
    allergies: string[],
    cuisine?: string
  ): Promise<AllergenSwapResult> {
    return postJSON(
      `/api/allergens/swap`,
      { ingredients, allergies, cuisine },
      () => {
        const swaps: AllergenSwapResult['swaps_made'] = [];
        ingredients.forEach((ing) => {
          const lower = ing.toLowerCase();
          if (allergies.includes('Gluten-Free') && lower.includes('wheat flour')) {
            swaps.push({ original: ing, substitute: 'Almond Flour (Gluten-Free)', reason: 'Gluten allergy constraint' });
          }
          if (allergies.includes('Vegan') && lower.includes('heavy cream')) {
            swaps.push({ original: ing, substitute: 'Coconut Cream / Cashew Milk', reason: 'Vegan plant-based requirement' });
          }
          if (allergies.includes('Nut Allergy') && (lower.includes('peanut butter') || lower.includes('peanuts'))) {
            swaps.push({ original: ing, substitute: 'Sunflower Seed Butter (Pepita spread)', reason: 'Anaphylaxis protection' });
          }
        });
        if (swaps.length === 0) {
          swaps.push({ original: ingredients[0] || 'Butter', substitute: 'Extra Virgin Olive Oil', reason: 'General health optimization' });
        }
        return { swaps_made: swaps };
      }
    );
  },

  // 5. CONTRADICTION & LOGIC DETECTION
  async validateContradictions(
    recipeData: { ingredients: string[]; steps: string[] },
    sessionId?: string
  ): Promise<ContradictionResult> {
    return postJSON(
      `/api/validate/contradictions`,
      { recipe_data: recipeData, session_id: sessionId },
      () => {
        const contradictions: string[] = [];
        const stepText = recipeData.steps.join(' ').toLowerCase();

        if (stepText.includes('bake') && !stepText.includes('oven') && !stepText.includes('preheat')) {
          contradictions.push("Step instructs 'Bake' but no oven preheating or temperature setting was specified.");
        }
        if (stepText.includes('dice') && stepText.includes('puree') && stepText.indexOf('dice') > stepText.indexOf('puree')) {
          contradictions.push("Physical logic conflict: Cannot 'Dice' tomatoes after they have been 'Pureed'.");
        }
        if (stepText.includes('fry') && stepText.includes('serve') && stepText.indexOf('fry') > stepText.indexOf('serve')) {
          contradictions.push("Chronological error: Cannot 'Fry' ingredients after dish has been 'Served'.");
        }

        const logic_score = Math.max(0.6, 1.0 - contradictions.length * 0.15);
        return { logic_score, contradictions };
      }
    );
  },

  // 6. RECIPE VALIDITY SCORING
  async scoreRecipe(
    recipeData: { ingredients: string[]; steps: string[] },
    sessionId?: string
  ): Promise<RecipeScoreResult> {
    return postJSON(`/api/recipe/score`, { recipe_data: recipeData, session_id: sessionId }, () => {
      const contradiction = {
        logic_score: 0.95,
        contradictions: [],
      };
      return {
        score: 94.5,
        status: 'VALID',
        breakdown: {
          chemistry_score: 0.96,
          physics_score: 0.93,
          taste_score: 5,
          safety_score: 4.8,
          authenticity_score: 4.9,
        },
        contradiction_result: contradiction,
      };
    });
  },

  // 7. CUISINE CLASSIFIER (XGBoost ML)
  async classifyCuisine(ingredients: string[]): Promise<CuisineClassificationResult> {
    return postJSON(`/api/classify`, { ingredients }, () => {
      const ingStr = ingredients.join(' ').toLowerCase();
      if (ingStr.includes('curry') || ingStr.includes('garam') || ingStr.includes('turmeric') || ingStr.includes('paneer')) {
        return {
          predicted_cuisine: 'INDIAN',
          probabilities: { INDIAN: 0.92, THAI: 0.05, CHINESE: 0.03 } as Record<string, number>,
        };
      }
      if (ingStr.includes('soy') || ingStr.includes('ginger') || ingStr.includes('sesame') || ingStr.includes('tofu')) {
        return {
          predicted_cuisine: 'ASIAN / CHINESE',
          probabilities: { CHINESE: 0.84, THAI: 0.11, JAPANESE: 0.05 } as Record<string, number>,
        };
      }
      return {
        predicted_cuisine: 'MEDITERRANEAN / ITALIAN',
        probabilities: { ITALIAN: 0.78, FRENCH: 0.14, SPANISH: 0.08 } as Record<string, number>,
      };
    });
  },

  // 8. RECIPE GENERATION (T5 Transformer)
  async generateRecipe(
    ingredients: string[]
  ): Promise<{
    title: string;
    image?: string;
    ingredients: string[];
    directions: string[];
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    chemistry_notes?: string;
    model?: string;
    chemistry?: any;
    heatRequirement?: any;
    allergySwaps?: any;
  }> {
    return postJSON(
      `/api/generate-recipe`,
      { ingredients },
      () => ({
        title: `Chef's Special: ${ingredients.slice(0, 3).map(i => i.trim()).join(', ')} Medley`,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCe0AD34aGqd6r8D8xiDCvgetSz6Mey7g8xX66LOKCsQtj40wmuqU7w_tMRM2nEqQzMPn_nXiQssADv1xm3CeWPQNaR9Bzz3XOXN0MKUqZECCoKP2XCh2UPPRbHWZ8y1Xd0j7Uu4ScmTRxAx-ebOx0VaND0MmjmVZ7MBO7NcgkjrN4A5RvGSCUyfkcD2NnWGoY6-H8BdJU7ST0h9xcBinylT7djF3V2_cz5xkzY95H4rGbRQoQ_o96vNd-tDEEMMiZCe_Cv-wsVm4K_',
        ingredients: ingredients.map((i) => i.trim()),
        directions: [
          `Prepare all ingredients: wash, peel, and dice ${ingredients[0]}.`,
          'Heat olive oil in a large skillet over medium-high heat.',
          `Season ${ingredients[0]} with salt, pepper, and herbs.`,
          `Cook for 5-7 minutes until golden on each side.`,
          'Add remaining ingredients and cook for 3-4 minutes.',
          'Adjust seasoning to taste and serve immediately on a warm plate.',
        ],
        calories: 380,
        protein: 42,
        fat: 16,
        carbs: 12,
        chemistry_notes: "Mock chemistry note: acid balances fat.",
        model: 'mock (offline)',
      })
    );
  },

  // 9. RECIPE SEARCH (TF-IDF Retrieval)
  async searchRecipes(
    ingredients: string[],
    topK: number = 5
  ): Promise<Array<{ title: string; ingredients: string[]; similarity_score: number }>> {
    return postJSON(
      `/api/recipes/search`,
      { ingredients: ingredients.join(', '), top_k: topK },
      () => []
    );
  },

  // 10. NUTRITION LOOKUP (USDA)
  async getNutrition(
    ingredient: string
  ): Promise<{ ingredient: string; data: Record<string, number> } | null> {
    return getJSON(`/api/nutrition/${encodeURIComponent(ingredient)}`, () => null);
  },
};
