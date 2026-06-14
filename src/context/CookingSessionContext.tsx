import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type SkillLevel = 'Beginner' | 'Professional Chef';

export interface IngredientState {
  id: string;
  name: string;
  massGrams: number;
  temperatureCelsius: number;
  waterContentPercent: number;
  texture: string;
  browningLevel: number; // 0 to 10
}

interface CookingSessionContextType {
  skillLevel: SkillLevel;
  setSkillLevel: (level: SkillLevel) => void;
  digitalTwinState: IngredientState[];
  updateDigitalTwin: (id: string, updates: Partial<IngredientState>) => void;
  isRecovering: boolean;
  triggerSelfHealing: () => void;
  resolveRecovery: () => void;
}

const CookingSessionContext = createContext<CookingSessionContextType | undefined>(undefined);

export const CookingSessionProvider = ({ children }: { children: ReactNode }) => {
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Beginner');
  const [isRecovering, setIsRecovering] = useState(false);
  
  const [digitalTwinState, setDigitalTwinState] = useState<IngredientState[]>([
    {
      id: 'ing-1',
      name: 'Ribeye Steak',
      massGrams: 450,
      temperatureCelsius: 4,
      waterContentPercent: 70,
      texture: 'Raw, firm',
      browningLevel: 0
    },
    {
      id: 'ing-2',
      name: 'Butter',
      massGrams: 30,
      temperatureCelsius: 4,
      waterContentPercent: 16,
      texture: 'Solid',
      browningLevel: 0
    }
  ]);

  const updateDigitalTwin = (id: string, updates: Partial<IngredientState>) => {
    setDigitalTwinState(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const triggerSelfHealing = () => setIsRecovering(true);
  const resolveRecovery = () => setIsRecovering(false);

  return (
    <CookingSessionContext.Provider value={{
      skillLevel,
      setSkillLevel,
      digitalTwinState,
      updateDigitalTwin,
      isRecovering,
      triggerSelfHealing,
      resolveRecovery
    }}>
      {children}
    </CookingSessionContext.Provider>
  );
};

export const useCookingSession = () => {
  const context = useContext(CookingSessionContext);
  if (context === undefined) {
    throw new Error('useCookingSession must be used within a CookingSessionProvider');
  }
  return context;
};
