# GUIA DE IMPLEMENTACION - FRONTEND AGENT

**Tarea:** Integrar API real de gamificación en frontend
**Prioridad:** P1
**Estimado:** 2 días

---

## RESUMEN

Reemplazar mock data con llamadas API reales en:
1. Hook `useUserGamification.ts` (33 páginas afectadas)
2. Store `economyStore.ts`
3. Store `ranksStore.ts`
4. Agregar loading states y error handling

---

## CHECKLIST DE TAREAS

### ✅ FASE 1: Preparación (30 min)

- [ ] Leer el reporte completo de integración
- [ ] Familiarizarse con endpoints backend disponibles
- [ ] Verificar que apiClient.ts está configurado correctamente
- [ ] Verificar variables de entorno (VITE_API_URL)

### ✅ FASE 2: Actualizar useUserGamification (2h)

**Archivo:** `/apps/frontend/src/shared/hooks/useUserGamification.ts`

**Cambios:**
1. Reemplazar mock data con llamadas API reales
2. Agregar transformación de datos
3. Implementar error handling

**Código:**

```typescript
import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/apiClient';
import type { UserGamificationData } from '@shared/types';

export function useUserGamification(userId?: string) {
  const [gamificationData, setGamificationData] = useState<UserGamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setGamificationData(null);
      setLoading(false);
      return;
    }

    const fetchGamificationData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user stats and achievements in parallel
        const [statsResponse, achievementsResponse] = await Promise.all([
          apiClient.get(`/api/v1/gamification/users/${userId}/stats`),
          apiClient.get(`/api/v1/gamification/users/${userId}/achievements`)
        ]);

        const stats = statsResponse.data;
        const achievements = achievementsResponse.data;

        // Transform backend data to frontend format
        const data: UserGamificationData = {
          userId: stats.user_id,
          level: stats.level,
          totalXP: stats.total_xp,
          mlCoins: stats.ml_coins,
          rank: stats.current_rank,
          achievements: achievements.map((a: any) => a.achievement_id),
        };

        setGamificationData(data);
      } catch (err: any) {
        console.error('Failed to fetch gamification data:', err);
        setError(err?.message || 'Failed to load gamification data');

        // Fallback to basic data if API fails
        setGamificationData({
          userId,
          level: 1,
          totalXP: 0,
          mlCoins: 0,
          rank: 'Nacom',
          achievements: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGamificationData();
  }, [userId]);

  return {
    gamificationData,
    loading,
    error,
  };
}
```

**Tests:**
```typescript
// useUserGamification.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useUserGamification } from './useUserGamification';
import { apiClient } from '@/services/api/apiClient';

jest.mock('@/services/api/apiClient');

describe('useUserGamification', () => {
  it('fetches user gamification data successfully', async () => {
    const mockStats = {
      user_id: 'user-123',
      level: 5,
      total_xp: 500,
      ml_coins: 250,
      current_rank: 'Nacom',
    };

    const mockAchievements = [
      { achievement_id: 'achievement-1' },
      { achievement_id: 'achievement-2' },
    ];

    (apiClient.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockStats })
      .mockResolvedValueOnce({ data: mockAchievements });

    const { result } = renderHook(() => useUserGamification('user-123'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.gamificationData).toEqual({
      userId: 'user-123',
      level: 5,
      totalXP: 500,
      mlCoins: 250,
      rank: 'Nacom',
      achievements: ['achievement-1', 'achievement-2'],
    });
  });

  it('handles errors gracefully', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useUserGamification('user-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.gamificationData).toEqual({
      userId: 'user-123',
      level: 1,
      totalXP: 0,
      mlCoins: 0,
      rank: 'Nacom',
      achievements: [],
    });
  });
});
```

### ✅ FASE 3: Actualizar economyStore (3h)

**Archivo:** `/apps/frontend/src/features/gamification/economy/store/economyStore.ts`

**Cambios en funciones:**

#### 1. fetchBalance (ya existe, verificar)
```typescript
fetchBalance: async () => {
  set({ isLoading: true, error: null });
  try {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      throw new Error('User not authenticated. Please login first.');
    }

    // Fetch from user stats endpoint (ML Coins part of stats)
    const { data } = await apiClient.get(`/api/v1/gamification/users/${userId}/stats`);

    const balance: MLCoinsBalance = {
      current: data.ml_coins,
      lifetime: data.ml_coins_earned_total,
      spent: data.ml_coins_spent_total,
      pending: 0, // Backend doesn't track pending
    };

    set({
      balance,
      isLoading: false,
      error: null
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch balance';
    set({
      isLoading: false,
      error: errorMessage
    });
    console.error('Error fetching balance:', error);
  }
},
```

#### 2. addCoins (actualizar para usar API)
```typescript
addCoins: async (amount, source, description) => {
  const state = get();

  try {
    set({ isLoading: true, error: null });

    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Update stats in backend (increment total XP and ML Coins)
    const { data } = await apiClient.patch(
      `/api/v1/gamification/users/${userId}/stats`,
      {
        ml_coins_increment: amount,
        source,
        description,
      }
    );

    // Create transaction record locally
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'earn',
      amount,
      source,
      description: description || `Earned ${amount} ML from ${source}`,
      timestamp: new Date(),
      balanceAfter: data.ml_coins,
    };

    set({
      balance: {
        current: data.ml_coins,
        lifetime: data.ml_coins_earned_total,
        spent: data.ml_coins_spent_total,
        pending: 0,
      },
      transactions: [transaction, ...state.transactions],
      isLoading: false,
      error: null,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add coins';
    set({
      isLoading: false,
      error: errorMessage
    });
    throw error;
  }
},
```

#### 3. spendCoins (actualizar para usar API)
```typescript
spendCoins: async (amount, itemName, itemId) => {
  const state = get();

  try {
    set({ isLoading: true, error: null });

    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (state.balance.current < amount) {
      throw new Error('Insufficient ML Coins balance');
    }

    // Update stats in backend (decrement ML Coins)
    const { data } = await apiClient.patch(
      `/api/v1/gamification/users/${userId}/stats`,
      {
        ml_coins_decrement: amount,
        reason: `Purchased ${itemName}`,
        item_id: itemId,
      }
    );

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'spend',
      amount: -amount,
      source: 'shop',
      description: `Purchased ${itemName}`,
      timestamp: new Date(),
      balanceAfter: data.ml_coins,
      metadata: itemId ? { itemId } : undefined,
    };

    set({
      balance: {
        current: data.ml_coins,
        lifetime: data.ml_coins_earned_total,
        spent: data.ml_coins_spent_total,
        pending: 0,
      },
      transactions: [transaction, ...state.transactions],
      isLoading: false,
      error: null,
    });

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to spend coins';
    set({
      isLoading: false,
      error: errorMessage
    });
    return false;
  }
},
```

#### 4. purchaseItem (usar comodines API)
```typescript
purchaseItem: async (itemId) => {
  const state = get();
  const item = state.cart.find((i) => i.id === itemId);

  if (!item) {
    return {
      success: false,
      error: 'Item not found in cart',
    };
  }

  try {
    set({ isLoading: true, error: null });

    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const totalCost = item.price * item.quantity;

    if (!state.canAfford(totalCost)) {
      return {
        success: false,
        error: `Insufficient balance. Need ${totalCost} ML, have ${state.balance.current} ML`,
      };
    }

    // Use comodines purchase API
    const { data } = await apiClient.post('/api/v1/gamification/comodines/purchase', {
      user_id: userId,
      comodin_type: item.category, // Assuming item category maps to comodin type
      quantity: item.quantity,
    });

    // Remove from cart and add to inventory
    state.removeFromCart(itemId);
    state.addToInventory(item);

    // Update balance from response
    await state.fetchBalance();

    set({ isLoading: false, error: null });

    return {
      success: true,
      transactionId: crypto.randomUUID(),
      newBalance: state.balance.current,
      itemsAcquired: [item],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
    set({
      isLoading: false,
      error: errorMessage
    });
    return {
      success: false,
      error: errorMessage,
    };
  }
},
```

**Tests:**
```typescript
// economyStore.test.ts
import { useEconomyStore } from './economyStore';
import { apiClient } from '@/services/api/apiClient';

jest.mock('@/services/api/apiClient');
jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: {
    getState: () => ({ user: { id: 'user-123' } }),
  },
}));

describe('economyStore', () => {
  beforeEach(() => {
    useEconomyStore.getState().reset();
  });

  it('fetchBalance updates balance from API', async () => {
    const mockResponse = {
      data: {
        ml_coins: 500,
        ml_coins_earned_total: 1000,
        ml_coins_spent_total: 500,
      },
    };

    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    await useEconomyStore.getState().fetchBalance();

    expect(useEconomyStore.getState().balance).toEqual({
      current: 500,
      lifetime: 1000,
      spent: 500,
      pending: 0,
    });
  });

  it('addCoins updates balance via API', async () => {
    const mockResponse = {
      data: {
        ml_coins: 550,
        ml_coins_earned_total: 1050,
        ml_coins_spent_total: 500,
      },
    };

    (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse);

    await useEconomyStore.getState().addCoins(50, 'exercise_completion', 'Completed exercise');

    expect(useEconomyStore.getState().balance.current).toBe(550);
  });
});
```

### ✅ FASE 4: Actualizar ranksStore (3h)

**Archivo:** `/apps/frontend/src/features/gamification/ranks/store/ranksStore.ts`

**Cambios:**

#### 1. fetchUserProgress (verificar implementación actual)
```typescript
fetchUserProgress: async () => {
  set({ isLoading: true, error: null });
  try {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data } = await apiClient.get(
      `/api/v1/gamification/users/${userId}/rank-progress`
    );

    // Transform backend response to UserRankProgress
    const userProgress: UserRankProgress = {
      currentRank: data.current_rank,
      currentLevel: data.level,
      currentXP: data.current_xp,
      xpToNextLevel: data.xp_to_next_level,
      totalXP: data.total_xp,
      mlCoinsEarned: data.ml_coins_earned,
      prestigeLevel: data.prestige_level || 0,
      multiplier: data.multiplier,
      lastRankUp: data.last_rank_up ? new Date(data.last_rank_up) : null,
      activityStreak: data.current_streak,
      lastActivityDate: new Date(),
      canRankUp: data.can_rank_up,
      nextRank: data.next_rank,
      canPrestige: data.can_prestige || false,
    };

    set({
      userProgress,
      isLoading: false,
      error: null
    });

    // Update multipliers after fetching progress
    get().updateMultipliers();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user progress';
    set({
      isLoading: false,
      error: errorMessage
    });
    console.error('Error fetching user progress:', error);
  }
},
```

#### 2. addXP (usar user stats API)
```typescript
addXP: async (amount: number, source: XPSource, description?: string) => {
  const state = get();

  try {
    set({ isLoading: true, error: null });

    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Update stats in backend
    const { data } = await apiClient.patch(
      `/api/v1/gamification/users/${userId}/stats`,
      {
        total_xp_increment: amount,
        xp_source: source,
        description,
      }
    );

    // Create XP event
    const xpEvent: XPEvent = {
      id: crypto.randomUUID(),
      amount,
      source,
      timestamp: new Date(),
      description,
    };

    // Update state
    set({
      userProgress: {
        ...state.userProgress,
        currentXP: data.current_xp || state.userProgress.currentXP + amount,
        totalXP: data.total_xp,
        currentLevel: data.level,
        xpToNextLevel: data.xp_to_next_level,
        currentRank: data.current_rank,
        lastActivityDate: new Date(),
      },
      xpEvents: [...state.xpEvents, xpEvent],
      isLoading: false,
      error: null,
    });

    // Check for level up (backend might handle this)
    if (data.leveled_up) {
      get().levelUp();
    }

    // Check for rank up
    if (data.ranked_up || get().checkRankUp()) {
      get().rankUp();
    }

    // Update multipliers
    get().updateMultipliers();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add XP';
    set({
      isLoading: false,
      error: errorMessage
    });
    throw error;
  }
},
```

#### 3. rankUp (usar ranks API)
```typescript
rankUp: async () => {
  const state = get();
  const currentProgress = state.userProgress;

  try {
    set({ isLoading: true, error: null });

    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Call backend to promote user
    const { data } = await apiClient.post(
      `/api/v1/gamification/ranks/promote/${userId}`
    );

    const nextRank = MAYA_RANKS[data.new_rank];
    if (!nextRank) {
      throw new Error('Invalid rank returned from server');
    }

    // Create rank up event
    const rankUpEvent: RankUpEvent = {
      fromRank: data.previous_rank,
      toRank: data.new_rank,
      timestamp: new Date(),
      newBenefits: nextRank.benefits,
      newMultiplier: data.new_multiplier,
      isPrestige: false,
    };

    // Add history entry
    const historyEntry: ProgressionHistoryEntry = {
      id: crypto.randomUUID(),
      type: 'rank_up',
      timestamp: new Date(),
      title: `Ascendido a ${nextRank.nameSpanish}`,
      description: `¡Has alcanzado el rango ${nextRank.name}! Nuevos beneficios desbloqueados.`,
      rank: data.new_rank,
      xpSnapshot: currentProgress.totalXP,
      levelSnapshot: currentProgress.currentLevel,
      multiplierSnapshot: data.new_multiplier,
    };

    set({
      userProgress: {
        ...currentProgress,
        currentRank: data.new_rank,
        multiplier: data.new_multiplier,
        lastRankUp: new Date(),
        canRankUp: false,
        nextRank: data.next_rank || null,
        canPrestige: data.new_rank === "K'uk'ulkan",
      },
      progressionHistory: [...state.progressionHistory, historyEntry],
      showRankUpModal: true,
      isRankingUp: true,
      isLoading: false,
      error: null,
    });

    // Update multipliers
    get().updateMultipliers();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to rank up';
    set({
      isLoading: false,
      error: errorMessage
    });
    throw error;
  }
},
```

**Tests:**
```typescript
// ranksStore.test.ts
import { useRanksStore } from './ranksStore';
import { apiClient } from '@/services/api/apiClient';

jest.mock('@/services/api/apiClient');
jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: {
    getState: () => ({ user: { id: 'user-123' } }),
  },
}));

describe('ranksStore', () => {
  beforeEach(() => {
    useRanksStore.getState().resetProgress();
  });

  it('fetchUserProgress updates progress from API', async () => {
    const mockResponse = {
      data: {
        current_rank: 'Nacom',
        level: 5,
        current_xp: 250,
        xp_to_next_level: 100,
        total_xp: 500,
        multiplier: 1.0,
      },
    };

    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    await useRanksStore.getState().fetchUserProgress();

    expect(useRanksStore.getState().userProgress.currentRank).toBe('Nacom');
    expect(useRanksStore.getState().userProgress.currentLevel).toBe(5);
  });

  it('addXP updates XP via API', async () => {
    const mockResponse = {
      data: {
        current_xp: 300,
        total_xp: 550,
        level: 5,
        xp_to_next_level: 50,
        current_rank: 'Nacom',
      },
    };

    (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse);

    await useRanksStore.getState().addXP(50, 'exercise_completion', 'Completed exercise');

    expect(useRanksStore.getState().userProgress.currentXP).toBe(300);
    expect(useRanksStore.getState().userProgress.totalXP).toBe(550);
  });
});
```

### ✅ FASE 5: Agregar Loading States (2h)

**Crear componente Skeleton:**

```typescript
// /apps/frontend/src/shared/components/ui/Skeleton.tsx
interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
    />
  );
};
```

**Actualizar páginas para usar loading states:**

Ejemplo en DashboardComplete:
```typescript
import { Skeleton } from '@/shared/components/ui/Skeleton';

function DashboardComplete() {
  const { user } = useAuth();
  const { gamificationData, loading, error } = useUserGamification(user?.id);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        {/* Header skeleton */}
        <Skeleton className="h-20 w-full" />

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Content skeleton */}
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Error Loading Dashboard
        </h3>
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Normal render with gamificationData
  return (
    <div>
      <GamifiedHeader
        user={user}
        gamificationData={gamificationData}
        onLogout={handleLogout}
      />
      {/* Rest of dashboard */}
    </div>
  );
}
```

Aplicar patrón similar a todas las 33 páginas.

### ✅ FASE 6: Error Boundaries (1h)

**Crear GamificationErrorBoundary:**

```typescript
// /apps/frontend/src/features/gamification/components/GamificationErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GamificationErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Gamification error:', error, errorInfo);

    // Send to error tracking service (e.g., Sentry)
    // trackError(error, { context: 'gamification', ...errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 m-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Gamification Temporarily Unavailable
              </h3>
              <p className="text-yellow-800 mb-4">
                We're having trouble loading your gamification data.
                Don't worry, your progress is safe and will be restored automatically!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usar en layouts:**

```typescript
// En MainLayout o donde uses GamifiedHeader
<GamificationErrorBoundary>
  <GamifiedHeader
    user={user}
    gamificationData={gamificationData}
    onLogout={handleLogout}
  />
</GamificationErrorBoundary>
```

### ✅ FASE 7: Testing (3h)

**Unit Tests:** Ejecutar tests para hooks y stores

```bash
npm run test -- --coverage
```

**Integration Tests:** Verificar flujos completos

```bash
npm run test:integration
```

**E2E Tests:** Probar en navegador

```bash
npm run test:e2e
```

**Manual Testing Checklist:**
- [ ] Login y ver dashboard
- [ ] Completar ejercicio y ganar XP
- [ ] Ganar ML Coins
- [ ] Comprar comodin
- [ ] Usar comodin
- [ ] Ver leaderboard
- [ ] Level up
- [ ] Rank up (si es posible)
- [ ] Ver achievements
- [ ] Navegar entre las 33 páginas sin errores

---

## COMANDOS UTILES

```bash
# Ejecutar frontend con API real
VITE_USE_MOCK_DATA=false npm run dev

# Ejecutar con mock data (para comparación)
VITE_USE_MOCK_DATA=true npm run dev

# Run tests
npm run test

# Run tests con coverage
npm run test -- --coverage

# Type checking
npm run type-check

# Lint
npm run lint
```

---

## VERIFICACION FINAL

Antes de marcar como completado:

- [ ] `useUserGamification` no usa mock data
- [ ] `economyStore` usa API para todas las operaciones
- [ ] `ranksStore` usa API para todas las operaciones
- [ ] Todas las 33 páginas tienen loading states
- [ ] Error boundaries implementados
- [ ] Tests pasan (>80% coverage)
- [ ] No hay errores de TypeScript
- [ ] No hay errores de consola en navegador
- [ ] Performance es aceptable (<300ms)
- [ ] Documentación actualizada

---

## NOTAS ADICIONALES

- Mantener backward compatibility durante transición
- Usar feature flags si es necesario
- Reportar cualquier endpoint faltante a Backend-Agent
- Documentar cualquier discrepancia encontrada

**Contacto Backend-Agent:** Para cualquier issue con endpoints o respuestas de API

