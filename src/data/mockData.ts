// ============================================================
// Types
// ============================================================

export interface AllergySwapOption {
  allergen: string;
  original: string;
  substitute: string;
  macroImpact: string;
}

export interface ChemistryMetrics {
  maillardTemp: string;
  phLevel: number;
  emulsionStability: string;
  gelatinizationTemp: string;
  keyFlavors: string[];
}

export interface HeatRequirement {
  cookingMethod: string;
  recommendedVessel: string;
  preheatDuration: string;
  targetInternalTemp: string;
  stovetopSetting: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  cuisine: string;
  category: string;
  tags: string[];
  image: string;
  ingredients: string[];
  directions: string[];
  rating: number;
  chemistry?: ChemistryMetrics;
  heatRequirement?: HeatRequirement;
  allergySwaps?: AllergySwapOption[];
  chemistry_notes?: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

// ============================================================
// Navigation
// ============================================================

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'AI Chatbot', href: '/chat' },
  { label: 'Recipe Book', href: '/recipe-book' },
  { label: 'Profile', href: '/profile' },
];

// ============================================================
// Features (Home page)
// ============================================================

export const features = [
  {
    icon: 'auto_awesome',
    title: 'Instant Synthesis',
    description:
      'Describe your cravings in natural language. Our T5-based model synthesizes a unique recipe from 2.2 million culinary data points in seconds.',
  },
  {
    icon: 'science',
    title: 'Factual Nutrition',
    description:
      'Every macro is sourced from the USDA FoodData Central database — not estimated. Get precise Calories, Protein, Fat, and Carb counts you can trust.',
  },
  {
    icon: 'smart_toy',
    title: 'Interactive Assistant',
    description:
      'Stuck mid-cook? Our contextual troubleshooter chatbot answers recipe-specific questions like substitutions, technique tips, and timing adjustments.',
  },
];

// ============================================================
// Mock Recipes (Recipe Book)
// ============================================================

export const cuisineFilters = [
  'All',
  'Italian',
  'Asian',
  'Mexican',
  'American',
  'Mediterranean',
  'French',
];


// MOCK RECIPES REMOVED
export const mockRecipes: Recipe[] = [];
