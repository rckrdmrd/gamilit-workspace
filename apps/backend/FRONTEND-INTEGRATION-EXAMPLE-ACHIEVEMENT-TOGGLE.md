# Frontend Integration Example - Achievement Toggle

**Endpoint:** `PATCH /api/v1/gamification/achievements/:id`
**Componente:** `AdminGamificationPage` (Tab de Logros)
**Fecha:** 2025-11-25

---

## 🎯 Objetivo

Integrar el endpoint de toggle de achievements en el componente `AdminGamificationPage` para persistir el cambio de estado activo/inactivo.

---

## 📦 API Service Implementation

### Opción 1: Usando `apiClient` existente

```typescript
// apps/frontend/src/services/api/gamificationAPI.ts

import { apiClient } from './apiClient';
import { API_ROUTES } from '@shared/constants';

/**
 * Actualiza el estado activo/inactivo de un achievement
 * @param achievementId - UUID del achievement
 * @param isActive - Nuevo estado (true: activo, false: inactivo)
 * @returns Achievement actualizado
 */
export const updateAchievementStatus = async (
  achievementId: string,
  isActive: boolean
): Promise<{
  success: boolean;
  achievement: Achievement;
}> => {
  const response = await apiClient.patch(
    `${API_ROUTES.GAMIFICATION.BASE}/achievements/${achievementId}`,
    { is_active: isActive }
  );

  return response.data;
};
```

### Opción 2: Usando `fetch` directo

```typescript
// apps/frontend/src/features/admin/api/adminAPI.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const toggleAchievementStatus = async (
  achievementId: string,
  isActive: boolean,
  token: string
): Promise<{
  success: boolean;
  achievement: Achievement;
}> => {
  const response = await fetch(
    `${API_BASE_URL}/gamification/achievements/${achievementId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ is_active: isActive }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
```

---

## 🎨 Component Integration

### AdminGamificationPage - Tab de Logros

```typescript
// apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { updateAchievementStatus } from '@/services/api/gamificationAPI';
import { useAuth } from '@/app/providers/AuthContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  // ... otros campos
}

const AchievementsTab: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { token } = useAuth();

  /**
   * Maneja el toggle del estado activo/inactivo de un achievement
   */
  const handleToggleAchievement = async (
    achievementId: string,
    currentStatus: boolean
  ) => {
    const newStatus = !currentStatus;

    // Optimistic update
    setAchievements(prev =>
      prev.map(ach =>
        ach.id === achievementId
          ? { ...ach, is_active: newStatus }
          : ach
      )
    );

    // Set loading state
    setLoading(prev => ({ ...prev, [achievementId]: true }));

    try {
      const result = await updateAchievementStatus(achievementId, newStatus);

      if (result.success) {
        // Update with server response
        setAchievements(prev =>
          prev.map(ach =>
            ach.id === achievementId
              ? result.achievement
              : ach
          )
        );

        toast({
          title: 'Éxito',
          description: `Achievement ${newStatus ? 'activado' : 'desactivado'} correctamente`,
          variant: 'success',
        });
      }
    } catch (error) {
      // Rollback on error
      setAchievements(prev =>
        prev.map(ach =>
          ach.id === achievementId
            ? { ...ach, is_active: currentStatus }
            : ach
        )
      );

      toast({
        title: 'Error',
        description: 'No se pudo actualizar el achievement. Intenta nuevamente.',
        variant: 'destructive',
      });

      console.error('Error updating achievement:', error);
    } finally {
      setLoading(prev => ({ ...prev, [achievementId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {achievements.map(achievement => (
        <div
          key={achievement.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex-1">
            <h3 className="font-semibold">{achievement.name}</h3>
            <p className="text-sm text-gray-600">{achievement.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {achievement.is_active ? 'Activo' : 'Inactivo'}
            </span>
            <Switch
              checked={achievement.is_active}
              onCheckedChange={() =>
                handleToggleAchievement(achievement.id, achievement.is_active)
              }
              disabled={loading[achievement.id]}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementsTab;
```

---

## 🪝 Custom Hook Approach

### useAchievements Hook

```typescript
// apps/frontend/src/apps/admin/hooks/useAchievements.ts

import { useState, useCallback } from 'react';
import { updateAchievementStatus } from '@/services/api/gamificationAPI';
import { useToast } from '@/components/ui/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  /**
   * Toggle achievement status
   */
  const toggleAchievement = useCallback(
    async (achievementId: string, currentStatus: boolean) => {
      const newStatus = !currentStatus;

      // Optimistic update
      setAchievements(prev =>
        prev.map(ach =>
          ach.id === achievementId ? { ...ach, is_active: newStatus } : ach
        )
      );

      setLoading(prev => ({ ...prev, [achievementId]: true }));

      try {
        const result = await updateAchievementStatus(achievementId, newStatus);

        if (result.success) {
          setAchievements(prev =>
            prev.map(ach =>
              ach.id === achievementId ? result.achievement : ach
            )
          );

          toast({
            title: 'Éxito',
            description: `Achievement ${newStatus ? 'activado' : 'desactivado'}`,
            variant: 'success',
          });

          return result.achievement;
        }
      } catch (error) {
        // Rollback
        setAchievements(prev =>
          prev.map(ach =>
            ach.id === achievementId ? { ...ach, is_active: currentStatus } : ach
          )
        );

        toast({
          title: 'Error',
          description: 'No se pudo actualizar el achievement',
          variant: 'destructive',
        });

        throw error;
      } finally {
        setLoading(prev => ({ ...prev, [achievementId]: false }));
      }
    },
    [toast]
  );

  return {
    achievements,
    setAchievements,
    loading,
    toggleAchievement,
  };
};
```

### Uso del Hook

```typescript
// apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx

import { useAchievements } from '@/apps/admin/hooks/useAchievements';

const AchievementsTab: React.FC = () => {
  const { achievements, loading, toggleAchievement } = useAchievements();

  return (
    <div className="space-y-4">
      {achievements.map(achievement => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          loading={loading[achievement.id]}
          onToggle={() => toggleAchievement(achievement.id, achievement.is_active)}
        />
      ))}
    </div>
  );
};
```

---

## 🧩 Reusable Component

### AchievementToggleSwitch Component

```typescript
// apps/frontend/src/apps/admin/components/achievements/AchievementToggleSwitch.tsx

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface AchievementToggleSwitchProps {
  isActive: boolean;
  loading?: boolean;
  onToggle: (newStatus: boolean) => void;
  disabled?: boolean;
}

export const AchievementToggleSwitch: React.FC<AchievementToggleSwitchProps> = ({
  isActive,
  loading = false,
  onToggle,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}

      <span className={`text-sm ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
        {isActive ? 'Activo' : 'Inactivo'}
      </span>

      <Switch
        checked={isActive}
        onCheckedChange={onToggle}
        disabled={disabled || loading}
        aria-label={`Toggle achievement ${isActive ? 'off' : 'on'}`}
      />
    </div>
  );
};
```

### Uso del Componente

```typescript
<AchievementToggleSwitch
  isActive={achievement.is_active}
  loading={loading[achievement.id]}
  onToggle={() => handleToggleAchievement(achievement.id, achievement.is_active)}
/>
```

---

## 🔄 Zustand Store Integration (Opcional)

### Achievement Store

```typescript
// apps/frontend/src/stores/achievementStore.ts

import { create } from 'zustand';
import { updateAchievementStatus } from '@/services/api/gamificationAPI';

interface Achievement {
  id: string;
  name: string;
  is_active: boolean;
}

interface AchievementStore {
  achievements: Achievement[];
  loading: Record<string, boolean>;
  setAchievements: (achievements: Achievement[]) => void;
  toggleAchievement: (id: string, currentStatus: boolean) => Promise<void>;
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  achievements: [],
  loading: {},

  setAchievements: (achievements) => set({ achievements }),

  toggleAchievement: async (id, currentStatus) => {
    const newStatus = !currentStatus;

    // Optimistic update
    set((state) => ({
      achievements: state.achievements.map((ach) =>
        ach.id === id ? { ...ach, is_active: newStatus } : ach
      ),
      loading: { ...state.loading, [id]: true },
    }));

    try {
      const result = await updateAchievementStatus(id, newStatus);

      if (result.success) {
        set((state) => ({
          achievements: state.achievements.map((ach) =>
            ach.id === id ? result.achievement : ach
          ),
          loading: { ...state.loading, [id]: false },
        }));
      }
    } catch (error) {
      // Rollback
      set((state) => ({
        achievements: state.achievements.map((ach) =>
          ach.id === id ? { ...ach, is_active: currentStatus } : ach
        ),
        loading: { ...state.loading, [id]: false },
      }));

      throw error;
    }
  },
}));
```

---

## 🧪 Testing Example

### Component Test

```typescript
// apps/frontend/src/apps/admin/components/__tests__/AchievementsTab.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AchievementsTab } from '../AchievementsTab';
import { updateAchievementStatus } from '@/services/api/gamificationAPI';

jest.mock('@/services/api/gamificationAPI');

describe('AchievementsTab', () => {
  it('should toggle achievement status', async () => {
    const mockAchievement = {
      id: '123',
      name: 'Test Achievement',
      description: 'Test',
      is_active: true,
    };

    (updateAchievementStatus as jest.Mock).mockResolvedValue({
      success: true,
      achievement: { ...mockAchievement, is_active: false },
    });

    render(<AchievementsTab achievements={[mockAchievement]} />);

    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(updateAchievementStatus).toHaveBeenCalledWith('123', false);
    });

    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });
});
```

---

## 📝 TypeScript Types

```typescript
// apps/frontend/src/shared/types/gamification.types.ts

export interface Achievement {
  id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  icon: string;
  category: AchievementCategoryEnum;
  rarity: string;
  difficulty_level: DifficultyLevelEnum;
  conditions: Record<string, any>;
  rewards: Record<string, any>;
  ml_coins_reward: number;
  is_secret: boolean;
  is_active: boolean;
  is_repeatable: boolean;
  order_index: number;
  points_value: number;
  unlock_message?: string;
  instructions?: string;
  tips?: string[];
  metadata: Record<string, any>;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateAchievementStatusResponse {
  success: boolean;
  achievement: Achievement;
}
```

---

## 🎯 Best Practices Implementadas

1. **Optimistic Updates:** UI responde inmediatamente antes de la respuesta del servidor
2. **Error Handling:** Rollback en caso de error
3. **Loading States:** Indicadores visuales durante la operación
4. **Toast Notifications:** Feedback visual al usuario
5. **Type Safety:** TypeScript en toda la implementación
6. **Reusability:** Componentes y hooks reutilizables
7. **Testing:** Ejemplos de tests unitarios

---

## 🚀 Deployment Checklist

- [ ] Agregar el método `updateAchievementStatus` en `gamificationAPI.ts`
- [ ] Crear el hook `useAchievements` (opcional)
- [ ] Actualizar `AdminGamificationPage` con el toggle handler
- [ ] Agregar tipos TypeScript en `gamification.types.ts`
- [ ] Probar en desarrollo
- [ ] Agregar tests unitarios
- [ ] Documentar en Storybook (opcional)
- [ ] Code review
- [ ] Deploy a staging
- [ ] QA testing
- [ ] Deploy a production

---

**Desarrollado por:** Claude Code
**Fecha:** 2025-11-25
**Versión:** 1.0
