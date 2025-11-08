# Stores de Gamificación - GAMILIT Platform v2

**Dominio:** Sistema completo de gamificación
**Total de Stores:** 6 (1 persistente)

---

## 1. economyStore (PERSISTENT)

**Ubicación:** `/src/features/gamification/economy/store/economyStore.ts`
**Persistencia:** ✅ Sí (localStorage completo)

### Responsabilidad

- Balance de ML Coins
- Historial de transacciones
- Carrito de compras
- Inventario de usuario
- Operaciones de compra/gasto

### State Shape

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

interface MLCoinsBalance {
  current: number;
  lifetime: number;
  spent: number;
}

interface Transaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  source: string;
  description: string;
  timestamp: Date;
  balanceAfter: number;
}

type EarningSource =
  | 'exercise_completion'
  | 'mission_completion'
  | 'achievement_unlock'
  | 'daily_login'
  | 'streak_bonus'
  | 'rank_up'
  | 'guild_reward';
```

### Implementación - Acciones Destacadas

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

// Spend Coins
spendCoins: async (amount, itemName, itemId) => {
  const state = get();

  if (!state.canAfford(amount)) {
    set({ error: 'Insufficient funds' });
    return false;
  }

  const newBalance = state.balance.current - amount;

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    type: 'spend',
    amount,
    source: 'shop_purchase',
    description: `Purchased ${itemName}`,
    timestamp: new Date(),
    balanceAfter: newBalance,
  };

  set({
    balance: {
      ...state.balance,
      current: newBalance,
      spent: state.balance.spent + amount,
    },
    transactions: [transaction, ...state.transactions],
  });

  return true;
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

// Can Afford
canAfford: (amount) => {
  return get().balance.current >= amount;
},
```

### Flujo de Compra

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

## 2. ranksStore

**Ubicación:** `/src/features/gamification/ranks/store/ranksStore.ts`
**Persistencia:** ❌ No (datos volátiles)

### Responsabilidad

- Progreso de rangos Maya
- Sistema de XP
- Multiplicadores
- Prestigio
- Nivel de usuario

### State Shape

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

### Rangos Maya

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

### Ejemplo: Add XP con Level Up

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

## 3. achievementsStore

**Ubicación:** `/src/features/gamification/social/store/achievementsStore.ts`
**Persistencia:** ❌ No

### Responsabilidad

- Logros del usuario
- Progreso de logros
- Desbloqueo de achievements
- Estadísticas

### State Shape

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

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  mlCoinsReward: number;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

type AchievementCategory =
  | 'learning'
  | 'social'
  | 'exploration'
  | 'mastery'
  | 'special';
```

---

## 4. missionsStore

**Ubicación:** `/src/features/gamification/missions/store/missionsStore.ts`
**Persistencia:** ❌ No

### Responsabilidad

- Misiones diarias/semanales
- Progreso de misiones
- Claim de recompensas
- Tracking de misiones activas

### State Shape

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

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  mlCoinsReward: number;
  xpReward: number;
  progress: number;
  maxProgress: number;
  status: 'active' | 'completed' | 'claimed';
  expiresAt: Date;
}
```

### Ejemplo: Claim Reward

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

## 5. leaderboardsStore

**Ubicación:** `/src/features/gamification/social/store/leaderboardsStore.ts`
**Persistencia:** ❌ No

### Responsabilidad

- Rankings de XP, Coins, Streaks
- Posición del usuario
- Filtros y búsqueda
- Actualizaciones en tiempo real

### State Shape

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

interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatar?: string;
  rank: number;
  score: number;
  change: number; // Cambio desde última semana
}

type LeaderboardType = 'xp' | 'ml_coins' | 'streak' | 'exercises_completed';
```

### Implementación

```typescript
fetchLeaderboard: async (type, scope = 'global') => {
  set({ isLoading: true, filter: type, scope });

  try {
    const entries = await leaderboardAPI.getLeaderboard(type, scope);
    const userRank = entries.findIndex(e => e.userId === currentUserId) + 1;

    set({
      entries,
      userRank: userRank || null,
      isLoading: false,
    });
  } catch (error) {
    set({ error: error.message, isLoading: false });
  }
},
```

---

## 6. powerUpsStore

**Ubicación:** `/src/features/gamification/social/store/powerUpsStore.ts`
**Persistencia:** ❌ No

### Responsabilidad

- PowerUps disponibles
- PowerUps activos
- Cooldowns
- Compra y uso de powerups

### State Shape

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

interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: PowerUpType;
  duration: number; // segundos
  cooldown: number; // segundos
  mlCoinsPrice: number;
}

interface ActivePowerUp {
  powerUpId: string;
  activatedAt: Date;
  expiresAt: Date;
  effectMultiplier: number;
}

type PowerUpType =
  | 'double_xp'
  | 'double_coins'
  | 'time_freeze'
  | 'hint_reveal'
  | 'second_chance';
```

---

## Integración entre Stores de Gamificación

### Ejemplo: Completar Ejercicio

```typescript
// Cuando un estudiante completa un ejercicio
const completeExercise = async (exerciseId: string, score: number) => {
  const { addCoins } = useEconomyStore.getState();
  const { addXP } = useRanksStore.getState();
  const { updateProgress } = useAchievementsStore.getState();

  // Calcular recompensas
  const mlCoins = Math.floor(score * 0.5);
  const xp = Math.floor(score * 2);

  // Actualizar economía
  addCoins(mlCoins, 'exercise_completion', `Completed exercise ${exerciseId}`);

  // Actualizar XP y rangos
  await addXP(xp, 'exercise_completion', `Completed exercise ${exerciseId}`);

  // Verificar achievements
  updateProgress('exercises_completed', 1);

  // Actualizar misiones
  // (si hay una misión activa relacionada)
};
```

---

## Performance y Optimización

### Optimistic Updates

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

**Última actualización:** 2025-10-27
**Versión:** 1.0
