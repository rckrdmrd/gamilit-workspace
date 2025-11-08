# Sistema de Estados - Frontend GAMILIT Platform v2

**Proyecto:** GAMILIT Platform v2
**Fecha:** 2025-10-27
**State Management:** Zustand v4.4.7
**Total de Stores:** 11

---

## 1. Resumen Ejecutivo

GAMILIT Platform utiliza **Zustand** como biblioteca de gestión de estado global. El sistema está organizado en **11 stores especializados** que manejan diferentes dominios de la aplicación, con **persistencia selectiva** en localStorage para datos críticos.

### Características del Sistema:

- **Zustand**: Lightweight y performante
- **TypeScript**: Type-safe al 100%
- **Persistencia Selectiva**: Solo datos críticos
- **Modular**: Stores por dominio
- **DevTools Ready**: Compatible con Redux DevTools
- **Middleware**: persist, devtools

---

## 2. Arquitectura de Estado

```
┌────────────────────────────────────────────────────────────────┐
│                    ZUSTAND STATE ECOSYSTEM                      │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  authStore (PERSISTENT)                                          │
│  - user, token, isAuthenticated, sessionExpiresAt               │
│  - Persisted in localStorage                                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ userId
                      │
        ┌─────────────┼─────────────────────┬──────────────┐
        │             │                     │              │
        ▼             ▼                     ▼              ▼
┌───────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│economyStore│  │ ranksStore  │  │missionsStore │  │achievements  │
│(PERSISTENT)│  │             │  │              │  │Store         │
└───────────┘  └─────────────┘  └──────────────┘  └──────────────┘
        │
        │ coins, inventory
        │
        ▼
┌──────────────────────────────────────────────────┐
│            SOCIAL LAYER                           │
├──────────────────────────────────────────────────┤
│  guildsStore | friendsStore | leaderboardsStore  │
│  powerUpsStore                                   │
└──────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│            COMMUNICATION LAYER                    │
├──────────────────────────────────────────────────┤
│  notificationsStore                              │
└──────────────────────────────────────────────────┘
```

---

## 3. Stores Implementados

### 3.1 authStore (PERSISTENT)

**Ubicación:** `/src/features/auth/store/authStore.ts`
**Persistencia:** ✅ Sí (localStorage)
**Campos Persistidos:** user, token, refreshToken, isAuthenticated, sessionExpiresAt

**Responsabilidad:**
- Autenticación de usuarios
- Gestión de sesiones
- Refresh de tokens
- Permisos y roles

**State Shape:**
```typescript
interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiresAt: number | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  checkSession: () => boolean;
  clearError: () => void;
}
```

**Implementación:**
```typescript
// features/auth/store/authStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpiresAt: null,

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login({ email, password });
          const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 horas

          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            sessionExpiresAt: expiresAt,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
        }
      },

      // Register
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(data);
          const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            sessionExpiresAt: expiresAt,
            isLoading: false,
          });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          sessionExpiresAt: null,
        });
      },

      // Refresh Session
      refreshSession: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;

        try {
          const response = await authAPI.refresh({ refreshToken });
          const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

          set({
            token: response.token,
            sessionExpiresAt: expiresAt,
          });
        } catch (error) {
          get().logout();
        }
      },

      // Update User
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      // Check Session
      checkSession: () => {
        const { sessionExpiresAt } = get();
        if (!sessionExpiresAt) return false;

        const isValid = Date.now() < sessionExpiresAt;
        if (!isValid) {
          get().logout();
        }
        return isValid;
      },

      // Clear Error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        sessionExpiresAt: state.sessionExpiresAt,
      }),
    }
  )
);
```

**Uso en Componentes:**
```typescript
// Leer estado
const { user, isAuthenticated } = useAuthStore();

// Ejecutar acciones
const login = useAuthStore((state) => state.login);
const logout = useAuthStore((state) => state.logout);

// En un componente
const LoginComponent = () => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error && <div className="error">{error}</div>}
      <button disabled={isLoading}>
        {isLoading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
};
```

---

### 3.2 economyStore (PERSISTENT)

**Ubicación:** `/src/features/gamification/economy/store/economyStore.ts`
**Persistencia:** ✅ Sí (localStorage completo)

**Responsabilidad:**
- Balance de ML Coins
- Historial de transacciones
- Carrito de compras
- Inventario de usuario
- Operaciones de compra/gasto

**State Shape:**
```typescript
interface EconomyState {
  // State
  balance: MLCoinsBalance;
  transactions: Transaction[];
  inventory: ShopItem[];
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;

  // Coin Operations
  addCoins: (amount: number, source: EarningSource, description?: string) => void;
  spendCoins: (amount: number, itemName: string, itemId?: string) => Promise<boolean>;
  updateBalance: (balance: Partial<MLCoinsBalance>) => void;

  // Cart Operations
  addToCart: (item: ShopItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;

  // Purchase Operations
  purchaseItem: (itemId: string) => Promise<PurchaseResult>;
  purchaseCart: () => Promise<PurchaseResult>;
  canAfford: (amount: number) => boolean;

  // Inventory Operations
  addToInventory: (item: ShopItem) => void;
  removeFromInventory: (itemId: string) => void;
  hasItem: (itemId: string) => boolean;

  // Statistics
  getEconomyStats: () => EconomyStats;
}
```

**Acciones Destacadas:**

```typescript
// Add Coins
addCoins: (amount, source, description) => {
  const state = get();
  const newBalance = state.balance.current + amount;

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    type: 'earn',
    amount,
    source,
    description: description || `Earned ${amount} ML from ${source}`,
    timestamp: new Date(),
    balanceAfter: newBalance,
  };

  set({
    balance: {
      ...state.balance,
      current: newBalance,
      lifetime: state.balance.lifetime + amount,
    },
    transactions: [transaction, ...state.transactions],
  });
},

// Purchase Item
purchaseItem: async (itemId) => {
  const state = get();
  const item = state.inventory.find(i => i.id === itemId);

  if (!item) {
    throw new Error('Item not found');
  }

  if (!state.canAfford(item.price)) {
    return { success: false, message: 'Insufficient funds' };
  }

  const success = await state.spendCoins(item.price, item.name, itemId);

  if (success) {
    state.addToInventory(item);
    return {
      success: true,
      message: 'Purchase successful',
      item,
    };
  }

  return { success: false, message: 'Purchase failed' };
},
```

**Flujo de Compra:**
```typescript
// Componente de tienda
const ShopComponent = () => {
  const { balance, cart, addToCart, purchaseCart } = useEconomyStore();

  const handlePurchase = async () => {
    const result = await purchaseCart();
    if (result.success) {
      toast.success('Compra exitosa!');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div>
      <div>Balance: {balance.current} ML</div>
      {/* Shop items */}
      <button onClick={handlePurchase}>
        Comprar ({cart.length} items)
      </button>
    </div>
  );
};
```

---

### 3.3 ranksStore

**Ubicación:** `/src/features/gamification/ranks/store/ranksStore.ts`
**Persistencia:** ❌ No (datos volátiles)

**Responsabilidad:**
- Progreso de rangos Maya
- Sistema de XP
- Multiplicadores
- Prestigio
- Nivel de usuario

**State Shape:**
```typescript
interface RanksState {
  // Core State
  userProgress: UserRankProgress;
  prestigeProgress: PrestigeProgress;
  multiplierBreakdown: MultiplierBreakdown;
  progressionHistory: ProgressionHistoryEntry[];
  xpEvents: XPEvent[];

  // UI State
  isRankingUp: boolean;
  showRankUpModal: boolean;
  showPrestigeModal: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions - XP
  addXP: (amount: number, source: XPSource, description?: string) => Promise<void>;
  checkLevelUp: () => boolean;
  checkRankUp: () => boolean;
  levelUp: () => void;
  rankUp: () => void;

  // Actions - Prestige
  canPrestige: () => boolean;
  prestige: () => Promise<void>;

  // Actions - Multipliers
  updateMultipliers: () => void;
  addMultiplierSource: (source: MultiplierSource) => void;
  getActiveMultipliers: () => MultiplierSource[];
}
```

**Rangos Maya:**
```typescript
const MAYA_RANKS: Record<MayaRank, RankDefinition> = {
  Ajaw: {
    id: 'Ajaw',
    name: 'Nacom',
    nameSpanish: 'Detective Novato',
    mlCoinsRequired: 0,
    multiplier: 1.0,
    order: 0,
  },
  Nacom: {
    id: 'Nacom',
    name: 'Batab',
    nameSpanish: 'Sargento',
    mlCoinsRequired: 500,
    multiplier: 1.25,
    order: 1,
  },
  Ah K'in: {
    id: 'Ah K'in',
    name: 'Holcatte',
    nameSpanish: 'Teniente',
    mlCoinsRequired: 1500,
    multiplier: 1.5,
    order: 2,
  },
  Halach Uinic: {
    id: 'Halach Uinic',
    name: 'Guerrero',
    nameSpanish: 'Capitán',
    mlCoinsRequired: 3000,
    multiplier: 1.75,
    order: 3,
  },
  K'uk'ulkan: {
    id: 'K'uk'ulkan',
    name: 'Mercenario',
    nameSpanish: 'Comisario',
    mlCoinsRequired: 5000,
    multiplier: 2.0,
    order: 4,
  },
};
```

**Ejemplo: Add XP con Level Up:**
```typescript
addXP: async (amount, source, description) => {
  const state = get();
  const currentProgress = state.userProgress;

  // Create XP event
  const xpEvent: XPEvent = {
    id: crypto.randomUUID(),
    amount,
    source,
    timestamp: new Date(),
    description,
  };

  // Calculate new XP
  const newCurrentXP = currentProgress.currentXP + amount;
  const newTotalXP = currentProgress.totalXP + amount;

  set((state) => ({
    userProgress: {
      ...state.userProgress,
      currentXP: newCurrentXP,
      totalXP: newTotalXP,
    },
    xpEvents: [xpEvent, ...state.xpEvents.slice(0, 99)],
  }));

  // Check for level up
  if (get().checkLevelUp()) {
    get().levelUp();
  }

  // Check for rank up
  if (get().checkRankUp()) {
    set({ showRankUpModal: true });
  }
},

levelUp: () => {
  const state = get();
  const newLevel = state.userProgress.currentLevel + 1;
  const xpForNextLevel = calculateXPForLevel(newLevel + 1);

  set((state) => ({
    userProgress: {
      ...state.userProgress,
      currentLevel: newLevel,
      currentXP: 0,
      xpToNextLevel: xpForNextLevel,
    },
  }));

  // Show notification
  toast.success(`¡Subiste al nivel ${newLevel}!`);
},
```

---

### 3.4 achievementsStore

**Ubicación:** `/src/features/gamification/social/store/achievementsStore.ts`
**Persistencia:** ❌ No

**Responsabilidad:**
- Logros del usuario
- Progreso de logros
- Desbloqueo de achievements
- Estadísticas

**State Shape:**
```typescript
interface AchievementsState {
  achievements: Achievement[];
  recentUnlocks: Achievement[];
  stats: AchievementStats;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAchievements: () => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  updateProgress: (achievementId: string, progress: number) => void;
  getUnlockedCount: () => number;
  getProgressPercentage: () => number;
}
```

---

### 3.5 missionsStore

**Ubicación:** `/src/features/gamification/missions/store/missionsStore.ts`
**Persistencia:** ❌ No

**Responsabilidad:**
- Misiones diarias/semanales
- Progreso de misiones
- Claim de recompensas
- Tracking de misiones activas

**State Shape:**
```typescript
interface MissionsState {
  missions: Mission[];
  activeMissions: Mission[];
  completedMissions: Mission[];
  stats: MissionStats;
  isLoading: boolean;

  // Actions
  fetchMissions: () => Promise<void>;
  claimReward: (missionId: string) => Promise<void>;
  trackMission: (missionId: string) => void;
  refreshDailyMissions: () => Promise<void>;
  getMissionsForToday: () => Mission[];
  getMissionsForWeek: () => Mission[];
}
```

**Ejemplo: Claim Reward:**
```typescript
claimReward: async (missionId) => {
  const mission = get().missions.find(m => m.id === missionId);

  if (!mission || mission.status !== 'completed') {
    throw new Error('Mission not completed');
  }

  set({ isLoading: true });

  try {
    const result = await missionsAPI.claimReward(missionId);

    // Update economy
    useEconomyStore.getState().addCoins(
      mission.mlCoinsReward,
      'mission_completion'
    );

    // Update ranks
    useRanksStore.getState().addXP(
      mission.xpReward,
      'mission_completion'
    );

    // Update mission status
    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === missionId ? { ...m, status: 'claimed' } : m
      ),
      completedMissions: state.completedMissions.filter(
        (m) => m.id !== missionId
      ),
    }));

    toast.success('¡Recompensa reclamada!');
  } finally {
    set({ isLoading: false });
  }
},
```

---

### 3.6 guildsStore

**Ubicación:** `/src/features/gamification/social/store/guildsStore.ts`
**Persistencia:** ❌ No

**Responsabilidad:**
- Lista de gremios
- Miembros del gremio
- Estadísticas del gremio
- Operaciones (join, leave, contribute)

---

### 3.7 friendsStore

**Ubicación:** `/src/features/gamification/social/store/friendsStore.ts`
**Persistencia:** ❌ No

**Responsabilidad:**
- Lista de amigos
- Solicitudes de amistad
- Actividad de amigos
- Operaciones sociales

---

### 3.8 leaderboardsStore

**Ubicación:** `/src/features/gamification/social/store/leaderboardsStore.ts`
**Persistencia:** ❌ No

**Responsabilidad:**
- Rankings de XP, Coins, Streaks
- Posición del usuario
- Filtros y búsqueda
- Actualizaciones en tiempo real

**State Shape:**
```typescript
interface LeaderboardsState {
  entries: LeaderboardEntry[];
  userRank: number | null;
  filter: LeaderboardType;
  scope: 'global' | 'school' | 'grade' | 'guild';
  isLoading: boolean;

  // Actions
  fetchLeaderboard: (type: LeaderboardType, scope?: string) => Promise<void>;
  filterLeaderboard: (type: LeaderboardType) => void;
  changeScope: (scope: string) => void;
  getUserPosition: () => LeaderboardEntry | null;
}
```

---

### 3.9 powerUpsStore

**Ubicación:** `/src/features/gamification/social/store/powerUpsStore.ts`
**Persistencia:** ❌ No

**Responsabilidad:**
- PowerUps disponibles
- PowerUps activos
- Cooldowns
- Compra y uso de powerups

**State Shape:**
```typescript
interface PowerUpsState {
  powerups: PowerUp[];
  activePowerups: ActivePowerUp[];
  isLoading: boolean;

  // Actions
  fetchPowerUps: () => Promise<void>;
  purchasePowerUp: (powerUpId: string) => Promise<void>;
  usePowerUp: (powerUpId: string) => Promise<void>;
  getActivePowerUps: () => ActivePowerUp[];
  isOnCooldown: (powerUpId: string) => boolean;
}
```

---

### 3.10 notificationsStore

**Ubicación:** `/src/features/notifications/store/notificationsStore.ts`
**Persistencia:** ❌ No

**Responsabilidad:**
- Notificaciones del usuario
- Contador de no leídas
- Marcado como leído
- Limpieza de notificaciones

**State Shape:**
```typescript
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  deleteNotification: (notificationId: string) => void;
}
```

**Integración con WebSocket:**
```typescript
// features/notifications/hooks/useWebSocket.ts
export const useNotificationWebSocket = () => {
  const addNotification = useNotificationsStore((state) => state.addNotification);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      addNotification(notification);
      toast.info(notification.message);
    };

    return () => ws.close();
  }, []);
};
```

---

## 4. Patrones de Uso

### 4.1 Selección Granular

Zustand permite selección granular de estado para evitar re-renders innecesarios:

```typescript
// ❌ MAL: Selecciona todo el estado
const state = useAuthStore();

// ✅ BIEN: Selecciona solo lo necesario
const user = useAuthStore((state) => state.user);
const login = useAuthStore((state) => state.login);
```

### 4.2 Acciones Asíncronas

```typescript
// Pattern para acciones asíncronas
someAction: async (param) => {
  set({ isLoading: true, error: null });

  try {
    const result = await api.someCall(param);
    set({ data: result, isLoading: false });
  } catch (error) {
    set({ error: error.message, isLoading: false });
  }
},
```

### 4.3 Comunicación entre Stores

```typescript
// Store A llama a Store B
purchaseItem: async (itemId) => {
  const item = await shopAPI.purchase(itemId);

  // Actualizar economyStore
  useEconomyStore.getState().spendCoins(item.price, item.name);

  // Actualizar inventory
  set((state) => ({
    inventory: [...state.inventory, item],
  }));
},
```

### 4.4 Subscripciones

```typescript
// Suscribirse a cambios
useEffect(() => {
  const unsubscribe = useAuthStore.subscribe(
    (state) => state.isAuthenticated,
    (isAuthenticated) => {
      if (!isAuthenticated) {
        navigate('/login');
      }
    }
  );

  return unsubscribe;
}, []);
```

---

## 5. Persistencia

### 5.1 Configuración de Persist

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... state y acciones
    }),
    {
      name: 'auth-storage', // Clave en localStorage
      version: 1, // Versión para migraciones
      partialize: (state) => ({
        // Solo persistir estos campos
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Opcional: Migración de versiones
      migrate: (persistedState, version) => {
        if (version === 0) {
          // Migrar de v0 a v1
          return { ...persistedState, newField: defaultValue };
        }
        return persistedState as AuthState;
      },
    }
  )
);
```

### 5.2 Stores Persistentes

| Store | Persistencia | Razón |
|-------|--------------|-------|
| **authStore** | ✅ Sí | Mantener sesión activa |
| **economyStore** | ✅ Sí | Caché de balance e inventario |
| **ranksStore** | ❌ No | Datos volátiles, se recalculan |
| **achievementsStore** | ❌ No | Datos del servidor |
| **missionsStore** | ❌ No | Cambian diariamente |
| **guildsStore** | ❌ No | Datos colaborativos |
| **friendsStore** | ❌ No | Datos sociales |
| **leaderboardsStore** | ❌ No | Rankings en tiempo real |
| **powerUpsStore** | ❌ No | Cooldowns del servidor |
| **notificationsStore** | ❌ No | Notificaciones efímeras |

---

## 6. DevTools

### 6.1 Habilitación de DevTools

```typescript
import { devtools } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // ... store implementation
      }),
      { name: 'auth-storage' }
    ),
    { name: 'AuthStore' } // Nombre en DevTools
  )
);
```

### 6.2 Time Travel Debugging

Con Redux DevTools instalado, se puede:
- Ver historial de acciones
- Viajar en el tiempo (undo/redo)
- Inspeccionar estado en cada punto
- Exportar/importar estado

---

## 7. Performance

### 7.1 Memoización de Selectores

```typescript
import { shallow } from 'zustand/shallow';

// Con shallow comparison
const { user, balance } = useEconomyStore(
  (state) => ({ user: state.user, balance: state.balance }),
  shallow
);
```

### 7.2 Optimistic Updates

```typescript
purchaseItem: async (itemId) => {
  const item = get().inventory.find(i => i.id === itemId);

  // Optimistic update
  set((state) => ({
    balance: {
      ...state.balance,
      current: state.balance.current - item.price,
    },
    inventory: [...state.inventory, item],
  }));

  try {
    await api.purchaseItem(itemId);
  } catch (error) {
    // Revert on error
    set((state) => ({
      balance: {
        ...state.balance,
        current: state.balance.current + item.price,
      },
      inventory: state.inventory.filter(i => i.id !== itemId),
    }));
    throw error;
  }
},
```

---

## 8. Testing

### 8.1 Test de Store

```typescript
// features/auth/store/__tests__/authStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store
    useAuthStore.getState().logout();
  });

  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });

  it('should handle login error', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('invalid@example.com', 'wrong');
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeDefined();
  });
});
```

---

## 9. Mejores Prácticas

### 9.1 Estructura de Store

1. **State Shape clara**: Definir interface antes de implementación
2. **Acciones agrupadas**: Organizar por dominio
3. **Error handling**: Siempre manejar errores en acciones async
4. **Loading states**: Indicar estados de carga
5. **TypeScript**: Tipar todo explícitamente

### 9.2 Naming Conventions

- **State**: Sustantivos (`user`, `balance`, `missions`)
- **Actions**: Verbos (`login`, `addCoins`, `fetchMissions`)
- **Booleans**: Prefijos `is`, `has`, `can` (`isLoading`, `hasError`, `canAfford`)

### 9.3 Evitar Anti-Patterns

```typescript
// ❌ MAL: Mutar estado directamente
set({ user: { ...state.user, name: 'New Name' } });

// ✅ BIEN: Usar función updater
set((state) => ({
  user: { ...state.user, name: 'New Name' },
}));

// ❌ MAL: Lógica compleja en componentes
const LoginComponent = () => {
  const { user, token } = useAuthStore();
  // ... 100 líneas de lógica
};

// ✅ BIEN: Lógica en store
const login = useAuthStore((state) => state.login);
```

---

## 10. Diagrama de Flujo de Estado

```
┌──────────────────────────────────────────────────────────┐
│                  USER ACTION                              │
│  (button click, form submit, etc.)                        │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│              COMPONENT CALLS STORE ACTION                 │
│  const login = useAuthStore(state => state.login)         │
│  login(email, password)                                   │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│                   STORE ACTION                            │
│  1. set({ isLoading: true })                              │
│  2. API call                                              │
│  3. set({ data, isLoading: false })                       │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│              STATE UPDATE TRIGGERS RE-RENDER              │
│  Components subscribed to changed state re-render         │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│                   UI UPDATES                              │
│  New state reflected in UI                                │
└──────────────────────────────────────────────────────────┘
```

---

## 11. Roadmap

### Fase Actual (v2.0)
- ✅ 11 stores implementados
- ✅ Persistencia selectiva
- ✅ Type-safe completo
- ✅ DevTools ready

### Próximos Pasos (v2.1)
- 🔄 Middleware de logging
- 🔄 Middleware de analytics
- 🔄 Store hydration strategies
- 🔄 Optimistic UI patterns

### Futuro (v3.0)
- 📋 Server state with React Query
- 📋 Real-time sync con WebSocket
- 📋 Offline-first con IndexedDB
- 📋 State time-travel debugging UI

---

**Documento generado:** 2025-10-27
**Versión:** 1.0
**Stores Documentados:** 11
**Líneas de Código Estado:** ~5,000+
