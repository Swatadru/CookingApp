import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  joinedDate: string;
  skillLevel: 'beginner' | 'pro';
  dietary: {
    vegan: boolean;
    glutenFree: boolean;
    nutAllergy: boolean;
    pescatarian: boolean;
    dairyFree: boolean;
  };
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
  recipeTitle?: string;
}

export const defaultProfiles: UserProfile[] = [
  {
    id: 'u1',
    name: 'Chef Swatadru',
    title: 'Artisan Poissonnier • Level 12',
    avatar: 'person',
    joinedDate: 'June 2026',
    skillLevel: 'pro',
    dietary: {
      vegan: false,
      glutenFree: true,
      nutAllergy: false,
      pescatarian: true,
      dairyFree: false,
    },
  },
  {
    id: 'u2',
    name: 'Chef Elena Vance',
    title: 'Pastry & Science Specialist • Level 16',
    avatar: 'face_3',
    joinedDate: 'January 2026',
    skillLevel: 'pro',
    dietary: {
      vegan: true,
      glutenFree: false,
      nutAllergy: true,
      pescatarian: false,
      dairyFree: true,
    },
  },
  {
    id: 'u3',
    name: 'Chef Marcus Lin',
    title: 'Home Culinary Enthusiast • Level 8',
    avatar: 'face_6',
    joinedDate: 'March 2026',
    skillLevel: 'beginner',
    dietary: {
      vegan: false,
      glutenFree: false,
      nutAllergy: false,
      pescatarian: false,
      dairyFree: false,
    },
  },
];

const initialChatHistories: Record<string, ChatMessageItem[]> = {
  u1: [
    {
      id: 'c1',
      role: 'ai',
      text: 'Welcome back Chef Swatadru! I noticed you enjoy seafood and gluten-free pairing. What are we cooking today?',
      timestamp: 'Today at 14:30',
    },
    {
      id: 'c2',
      role: 'user',
      text: 'I want a Mediterranean grilled sea bass recipe with lemon and herbs.',
      timestamp: 'Today at 14:31',
    },
    {
      id: 'c3',
      role: 'ai',
      text: 'Excellent choice! Searing the skin at 220°C creates crispness while keeping the flesh juicy at 63°C internal temperature.',
      timestamp: 'Today at 14:32',
      recipeTitle: 'Mediterranean Grilled Sea Bass',
    },
  ],
  u2: [
    {
      id: 'c4',
      role: 'ai',
      text: 'Hello Chef Elena! Ready for some molecular pastry exploration?',
      timestamp: 'Yesterday at 18:10',
    },
    {
      id: 'c5',
      role: 'user',
      text: 'How can I replace heavy cream in molten chocolate cake without changing emulsion density?',
      timestamp: 'Yesterday at 18:12',
    },
    {
      id: 'c6',
      role: 'ai',
      text: 'Use coconut cream emulsion fortified with 0.2% xanthan gum to match lipid viscosity!',
      timestamp: 'Yesterday at 18:13',
      recipeTitle: 'Lava Cake AI-X',
    },
  ],
  u3: [
    {
      id: 'c7',
      role: 'ai',
      text: 'Hi Marcus! Need simple step-by-step help with your dinner tonight?',
      timestamp: '2 days ago',
    },
    {
      id: 'c8',
      role: 'user',
      text: 'What heat setting should I use on my stove for chicken breast so it stays tender?',
      timestamp: '2 days ago',
    },
    {
      id: 'c9',
      role: 'ai',
      text: 'Medium-high heat for 5 minutes per side! Let it rest for 5 minutes after cooking to retain juices.',
      timestamp: '2 days ago',
      recipeTitle: 'Lemon-Herb Chicken',
    },
  ],
};

const initialSavedRecipes: Record<string, string[]> = {
  u1: ['r1', 'r8'],
  u2: ['r3', 'r5', 'r6'],
  u3: ['r2', 'r7', 'r9'],
};

interface UserContextType {
  profiles: UserProfile[];
  activeUser: UserProfile;
  activeUserId: string;
  setActiveUserId: (id: string) => void;
  savedRecipeIds: string[];
  toggleSaveRecipe: (recipeId: string) => void;
  isRecipeSaved: (recipeId: string) => boolean;
  chatHistory: ChatMessageItem[];
  addChatMessage: (msg: { role: 'user' | 'ai'; text: string; recipeTitle?: string }) => void;
  clearChatHistory: () => void;
  updateActiveUser: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_ACTIVE_USER = 'sous_chef_active_user_id';
const STORAGE_SAVED_MAP = 'sous_chef_saved_map';
const STORAGE_CHAT_MAP = 'sous_chef_chat_map';
const STORAGE_PROFILES = 'sous_chef_profiles';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PROFILES);
      return raw ? JSON.parse(raw) : defaultProfiles;
    } catch {
      return defaultProfiles;
    }
  });

  const [activeUserId, setActiveUserId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_ACTIVE_USER) || 'u1';
    } catch {
      return 'u1';
    }
  });

  const [savedMap, setSavedMap] = useState<Record<string, string[]>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_MAP);
      return raw ? JSON.parse(raw) : initialSavedRecipes;
    } catch {
      return initialSavedRecipes;
    }
  });

  const [chatMap, setChatMap] = useState<Record<string, ChatMessageItem[]>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CHAT_MAP);
      return raw ? JSON.parse(raw) : initialChatHistories;
    } catch {
      return initialChatHistories;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_ACTIVE_USER, activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_SAVED_MAP, JSON.stringify(savedMap));
  }, [savedMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CHAT_MAP, JSON.stringify(chatMap));
  }, [chatMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  const activeUser = profiles.find((p) => p.id === activeUserId) || profiles[0];
  const savedRecipeIds = savedMap[activeUserId] || [];
  const chatHistory = chatMap[activeUserId] || [];

  const toggleSaveRecipe = (recipeId: string) => {
    setSavedMap((prev) => {
      const currentSaved = prev[activeUserId] || [];
      const updated = currentSaved.includes(recipeId)
        ? currentSaved.filter((id) => id !== recipeId)
        : [...currentSaved, recipeId];
      return { ...prev, [activeUserId]: updated };
    });
  };

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipeIds.includes(recipeId);
  };

  const addChatMessage = ({
    role,
    text,
    recipeTitle,
  }: {
    role: 'user' | 'ai';
    text: string;
    recipeTitle?: string;
  }) => {
    const newMsg: ChatMessageItem = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recipeTitle,
    };
    setChatMap((prev) => {
      const currentHistory = prev[activeUserId] || [];
      return { ...prev, [activeUserId]: [...currentHistory, newMsg] };
    });
  };

  const clearChatHistory = () => {
    setChatMap((prev) => ({ ...prev, [activeUserId]: [] }));
  };

  const updateActiveUser = (updates: Partial<UserProfile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === activeUserId ? { ...p, ...updates } : p))
    );
  };

  return (
    <UserContext.Provider
      value={{
        profiles,
        activeUser,
        activeUserId,
        setActiveUserId,
        savedRecipeIds,
        toggleSaveRecipe,
        isRecipeSaved,
        chatHistory,
        addChatMessage,
        clearChatHistory,
        updateActiveUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
