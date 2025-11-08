# GAMIF - Economy (ML Coins)

**Proyecto:** GAMILIT Platform
**Feature:** Gamification → Economy
**Componente:** ML Coins System
**Versión:** 2.0
**Fecha:** 2025-11-07
**Ubicación:** `apps/frontend/src/features/gamification/economy/`

---

## 📋 Índice

1. [Propósito](#-propósito)
2. [Referencias](#-referencias-a-documentación-base)
3. [Arquitectura](#-arquitectura)
4. [Store (coinsStore)](#-store-coinsstore)
5. [Componentes UI](#-componentes-ui)
6. [Hooks](#-hooks)
7. [API Client](#-api-client)
8. [Flujos Principales](#-flujos-principales)

---

## 🎯 Propósito

Sistema de **economía virtual cerrada** basado en ML Coins (Machine Learning Coins 🪙), la moneda de la plataforma.

**Características:**
- Moneda ganada solo por actividades educativas (no se compra)
- Sistema de multiplicadores (rank, difficulty, streak)
- Transacciones completas registradas
- Balance en tiempo real
- Límites diarios anti-inflación (500 ML/día)
- Historial detallado de transacciones

**Principios:**
- ❌ **No pay-to-win**: ML Coins NO se compran con dinero real
- ✅ **Learning-First**: Solo se ganan por aprendizaje
- ✅ **Fair Economy**: Límites diarios, anti-farming

---

## 📚 Referencias a Documentación Base

### Requerimientos
- **Economía ML Coins:** [`docs/01-requerimientos/gamificacion/02-ECONOMIA-ML-COINS.md`](../../../../01-requerimientos/gamificacion/02-ECONOMIA-ML-COINS.md)
  - Formas de ganar/gastar
  - Sistema de transacciones
  - Fórmulas de cálculo

### Especificaciones Técnicas
- **ADR-004:** [`docs/02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md`](../../../../02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md#3-ml-monedas-in-game-currency)
  - Diseño completo de economía virtual
  - Fórmulas de ganancia/gasto
  - Control de inflación

- **Tipos Compartidos:** [`docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md`](../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md)
  - `MLCoinsTransaction`
  - `UserStats` (campos de coins)

- **Trazabilidad:** [`docs/02-especificaciones-tecnicas/trazabilidad/03-economy-transactions.md`](../../../../02-especificaciones-tecnicas/trazabilidad/03-economy-transactions.md)
  - Flujo completo de transacciones

### Documentación Feature
- **Overview:** [README.md](./README.md#1-economy-ml-coins)

---

## 🏗️ Arquitectura

### Estructura de Archivos

```
apps/frontend/src/features/gamification/economy/
├── api/
│   └── coinsAPI.ts              # API client de ML Coins
├── components/
│   ├── CoinsBalance.tsx         # Balance actual del usuario
│   ├── CoinsHistory.tsx         # Historial de transacciones
│   ├── TransactionsList.tsx     # Lista de transacciones
│   ├── CoinsEarned.tsx          # Animación de ganancia
│   └── CoinsSpent.tsx           # Animación de gasto
├── hooks/
│   ├── useCoins.ts              # Hook principal de coins
│   └── useTransactions.ts       # Hook de transacciones
├── store/
│   └── coinsStore.ts            # Zustand store de economía
├── types/
│   └── coinsTypes.ts            # Tipos TypeScript
├── schemas/
│   └── coinsSchemas.ts          # Validación Zod
└── utils/
    ├── calculateCoins.ts        # Fórmulas de cálculo
    └── formatCoins.ts           # Formateo de coins
```

---

## 🗄️ Store (coinsStore)

### Estado

```typescript
// apps/frontend/src/features/gamification/economy/store/coinsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CoinsState {
  // Balance
  balance: number;                       // Balance actual
  totalEarned: number;                   // Total ganado (lifetime)
  totalSpent: number;                    // Total gastado (lifetime)
  earningsToday: number;                 // Ganado hoy (límite 500)

  // Transacciones
  transactions: MLCoinsTransaction[];    // Historial
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchBalance: (userId: string) => Promise<void>;
  earnCoins: (params: EarnCoinsParams) => Promise<void>;
  spendCoins: (params: SpendCoinsParams) => Promise<void>;
  fetchTransactions: (userId: string) => Promise<void>;
  checkDailyLimit: () => boolean;
}

export const useCoinsStore = create<CoinsState>()(
  persist(
    (set, get) => ({
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      earningsToday: 0,
      transactions: [],
      isLoading: false,
      error: null,

      // Implementación de acciones...
    }),
    {
      name: 'coins-storage',
      partialize: (state) => ({
        balance: state.balance,
        totalEarned: state.totalEarned,
        totalSpent: state.totalSpent,
      }),
    }
  )
);
```

### Tipos

```typescript
// economy/types/coinsTypes.ts
interface MLCoinsTransaction {
  id: string;
  userId: string;
  transactionType: 'earned' | 'spent_powerup' | 'spent_shop' | 'rank_promotion' | 'achievement';
  amount: number;                  // Positivo = earn, Negativo = spend
  balanceBefore: number;
  balanceAfter: number;
  multiplier?: number;             // Multiplicador aplicado
  bonusApplied?: boolean;
  referenceId?: string;            // ID de ejercicio/achievement/powerup
  referenceType?: string;          // 'exercise', 'achievement', 'powerup'
  metadata?: Record<string, any>;
  createdAt: Date;
}

interface EarnCoinsParams {
  userId: string;
  amount: number;
  transactionType: 'earned' | 'rank_promotion' | 'achievement';
  referenceId?: string;
  referenceType?: string;
  multiplier?: number;
  metadata?: Record<string, any>;
}

interface SpendCoinsParams {
  userId: string;
  amount: number;
  transactionType: 'spent_powerup' | 'spent_shop';
  referenceId: string;
  referenceType: string;
  metadata?: Record<string, any>;
}
```

**Referencia:** [`TYPES-GAMIFICATION.md`](../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md#644-mlcoinstransaction)

---

## 📡 API Client

### Métodos

```typescript
// economy/api/coinsAPI.ts
import { apiClient } from '@/shared/api/apiClient';

export const coinsAPI = {
  // Obtener balance actual
  async getBalance(userId: string): Promise<{ balance: number; totalEarned: number; totalSpent: number }> {
    const response = await apiClient.get(`/api/gamification/coins/balance/${userId}`);
    return response.data.data;
  },

  // Registrar ganancia de coins
  async earnCoins(params: EarnCoinsParams): Promise<MLCoinsTransaction> {
    const response = await apiClient.post('/api/gamification/coins/earn', params);
    return response.data.data;
  },

  // Gastar coins (con validación de balance)
  async spendCoins(params: SpendCoinsParams): Promise<MLCoinsTransaction> {
    const response = await apiClient.post('/api/gamification/coins/spend', params);
    return response.data.data;
  },

  // Obtener historial de transacciones
  async getTransactions(userId: string, limit?: number): Promise<MLCoinsTransaction[]> {
    const response = await apiClient.get(
      `/api/gamification/coins/transactions/${userId}`,
      { params: { limit } }
    );
    return response.data.data;
  },

  // Leaderboard por ML Coins
  async getLeaderboard(params?: { limit?: number; scope?: string }): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get('/api/gamification/coins/leaderboard', { params });
    return response.data.data;
  },

  // Estadísticas globales de economía
  async getEconomyStats(): Promise<EconomyStats> {
    const response = await apiClient.get('/api/gamification/coins/stats');
    return response.data.data;
  },
};
```

### Endpoints Backend

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/gamification/coins/balance/:userId` | Balance actual |
| POST | `/api/gamification/coins/earn` | Registrar ganancia |
| POST | `/api/gamification/coins/spend` | Gastar coins (validado) |
| GET | `/api/gamification/coins/transactions/:userId` | Historial |
| GET | `/api/gamification/coins/leaderboard` | Top usuarios |
| GET | `/api/gamification/coins/stats` | Estadísticas globales |

**Referencia:** [`02-ECONOMIA-ML-COINS.md`](../../../../01-requerimientos/gamificacion/02-ECONOMIA-ML-COINS.md#7-endpoints-backend)

---

## ⚛️ Componentes UI

### 1. CoinsBalance

Muestra el balance actual del usuario con animación.

```typescript
// economy/components/CoinsBalance.tsx
import { useCoins } from '../hooks/useCoins';
import { formatCoins } from '../utils/formatCoins';

export const CoinsBalance = () => {
  const { balance, isLoading } = useCoins();

  return (
    <div className="coins-balance">
      <span className="coins-icon">🪙</span>
      {isLoading ? (
        <span className="loading">...</span>
      ) : (
        <span className="balance">{formatCoins(balance)}</span>
      )}
      <span className="label">ML Coins</span>
    </div>
  );
};
```

**Props:**
```typescript
interface CoinsBalanceProps {
  userId: string;
  showDetails?: boolean;      // Mostrar total earned/spent
  className?: string;
}
```

---

### 2. CoinsHistory

Historial visual de transacciones.

```typescript
// economy/components/CoinsHistory.tsx
import { useTransactions } from '../hooks/useTransactions';
import { TransactionsList } from './TransactionsList';

export const CoinsHistory = ({ userId, limit = 20 }: Props) => {
  const { transactions, isLoading } = useTransactions(userId, limit);

  return (
    <div className="coins-history">
      <h3>Historial de ML Coins</h3>
      {isLoading ? (
        <Spinner />
      ) : (
        <TransactionsList transactions={transactions} />
      )}
    </div>
  );
};
```

**Props:**
```typescript
interface CoinsHistoryProps {
  userId: string;
  limit?: number;             // Límite de transacciones a mostrar
  filter?: TransactionType;   // Filtrar por tipo
  showFilters?: boolean;      // Mostrar filtros de tipo/fecha
}
```

---

### 3. TransactionsList

Lista de transacciones con iconos y colores.

```typescript
// economy/components/TransactionsList.tsx
export const TransactionsList = ({ transactions }: Props) => {
  return (
    <div className="transactions-list">
      {transactions.map((tx) => (
        <div key={tx.id} className={`transaction ${tx.amount > 0 ? 'earned' : 'spent'}`}>
          <span className="icon">{getTransactionIcon(tx.transactionType)}</span>
          <div className="details">
            <span className="type">{getTransactionLabel(tx.transactionType)}</span>
            <span className="date">{formatDate(tx.createdAt)}</span>
          </div>
          <span className={`amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
            {tx.amount > 0 ? '+' : ''}{tx.amount} ML
          </span>
        </div>
      ))}
    </div>
  );
};
```

**Utilidades:**
```typescript
// utils/formatCoins.ts
export const getTransactionIcon = (type: string): string => {
  const icons = {
    earned: '📚',
    spent_powerup: '⚡',
    spent_shop: '🛒',
    rank_promotion: '🏆',
    achievement: '🎖️',
  };
  return icons[type] || '🪙';
};

export const getTransactionLabel = (type: string): string => {
  const labels = {
    earned: 'Ejercicio completado',
    spent_powerup: 'Power-up usado',
    spent_shop: 'Compra en tienda',
    rank_promotion: 'Promoción de rango',
    achievement: 'Logro desbloqueado',
  };
  return labels[type] || type;
};
```

---

### 4. CoinsEarned (Animación)

Animación cuando el usuario gana ML Coins.

```typescript
// economy/components/CoinsEarned.tsx
import { motion } from 'framer-motion';

export const CoinsEarned = ({ amount, onComplete }: Props) => {
  return (
    <motion.div
      className="coins-earned-animation"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      onAnimationComplete={onComplete}
    >
      <span className="icon">🪙</span>
      <span className="amount">+{amount} ML</span>
    </motion.div>
  );
};
```

**Props:**
```typescript
interface CoinsEarnedProps {
  amount: number;
  multiplier?: number;        // Mostrar multiplicador aplicado
  onComplete?: () => void;
}
```

---

## 🪝 Hooks

### 1. useCoins()

Hook principal para operaciones de coins.

```typescript
// economy/hooks/useCoins.ts
import { useEffect } from 'react';
import { useCoinsStore } from '../store/coinsStore';

export const useCoins = (userId: string) => {
  const balance = useCoinsStore((state) => state.balance);
  const totalEarned = useCoinsStore((state) => state.totalEarned);
  const totalSpent = useCoinsStore((state) => state.totalSpent);
  const earningsToday = useCoinsStore((state) => state.earningsToday);
  const isLoading = useCoinsStore((state) => state.isLoading);
  const error = useCoinsStore((state) => state.error);

  const fetchBalance = useCoinsStore((state) => state.fetchBalance);
  const earnCoins = useCoinsStore((state) => state.earnCoins);
  const spendCoins = useCoinsStore((state) => state.spendCoins);
  const checkDailyLimit = useCoinsStore((state) => state.checkDailyLimit);

  // Auto-fetch balance on mount
  useEffect(() => {
    if (userId) {
      fetchBalance(userId);
    }
  }, [userId]);

  return {
    balance,
    totalEarned,
    totalSpent,
    earningsToday,
    isLoading,
    error,
    earnCoins,
    spendCoins,
    checkDailyLimit,
    canEarnMore: earningsToday < 500, // Límite diario
  };
};
```

**Uso:**
```typescript
import { useCoins } from '@/features/gamification/economy/hooks';

const Dashboard = () => {
  const { balance, earnCoins, canEarnMore } = useCoins(userId);

  return (
    <div>
      <p>Balance: {balance} ML</p>
      {!canEarnMore && <p>¡Límite diario alcanzado!</p>}
    </div>
  );
};
```

---

### 2. useTransactions()

Hook para historial de transacciones.

```typescript
// economy/hooks/useTransactions.ts
export const useTransactions = (userId: string, limit = 20) => {
  const transactions = useCoinsStore((state) => state.transactions);
  const fetchTransactions = useCoinsStore((state) => state.fetchTransactions);
  const isLoading = useCoinsStore((state) => state.isLoading);

  useEffect(() => {
    if (userId) {
      fetchTransactions(userId);
    }
  }, [userId]);

  return {
    transactions: transactions.slice(0, limit),
    isLoading,
    refetch: () => fetchTransactions(userId),
  };
};
```

---

## 🔄 Flujos Principales

### 1. Ganar ML Coins (Por Ejercicio Completado)

```
Usuario completa ejercicio
  ↓
Backend calcula recompensa:
  - Base: 15 ML
  - Bonus perfect: +6 a +12
  - Bonus first attempt: +15
  - Multiplier rank: 1.0x - 2.0x
  ↓
Backend: POST /api/gamification/coins/earn
  {
    userId: 'user-123',
    amount: 58,
    transactionType: 'earned',
    referenceId: 'exercise-456',
    referenceType: 'exercise',
    multiplier: 1.5,
    metadata: {
      difficulty: 'medium',
      score: 100,
      perfectScore: true
    }
  }
  ↓
Backend:
  - INSERT ml_coins_transactions
  - UPDATE user_stats.ml_coins += 58
  - UPDATE user_stats.ml_coins_earned_total += 58
  ↓
Frontend:
  - coinsStore.earnCoins() actualiza balance
  - Animación CoinsEarned(+58 ML)
  - Actualiza balance en UI
```

### Fórmula de Ganancia

```typescript
// economy/utils/calculateCoins.ts
export const calculateCoinsEarned = (params: {
  baseCoins: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  score: number;
  firstAttempt: boolean;
  rankMultiplier: number;
}): number => {
  const { baseCoins, difficulty, score, firstAttempt, rankMultiplier } = params;

  let total = baseCoins; // 15 base

  // Perfect score bonus
  if (score === 100) {
    const perfectBonus = {
      easy: 6,
      medium: 9,
      hard: 12,
      expert: 15,
    }[difficulty];
    total += perfectBonus;
  }

  // First attempt bonus
  if (firstAttempt && score >= 70) {
    total += 15;
  }

  // Apply rank multiplier
  total = Math.floor(total * rankMultiplier);

  return total;
};
```

**Ejemplo:**
```typescript
const earned = calculateCoinsEarned({
  baseCoins: 15,
  difficulty: 'medium',
  score: 100,
  firstAttempt: true,
  rankMultiplier: 1.5, // Ah K'in rank
});
// Result: Math.floor((15 + 9 + 15) * 1.5) = 58 ML
```

**Referencia:** [`ADR-004`](../../../../02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md#3-ml-monedas-in-game-currency)

---

### 2. Gastar ML Coins (PowerUp)

```
Usuario compra PowerUp "Pistas" (15 ML)
  ↓
Frontend: Verifica balance suficiente
  if (balance < 15) {
    show error: "ML Coins insuficientes"
    return;
  }
  ↓
Frontend: coinsStore.spendCoins()
  ↓
Backend: POST /api/gamification/coins/spend
  {
    userId: 'user-123',
    amount: 15,
    transactionType: 'spent_powerup',
    referenceId: 'powerup-pistas',
    referenceType: 'powerup'
  }
  ↓
Backend:
  - Verifica balance >= 15
  - INSERT ml_coins_transactions (amount: -15)
  - UPDATE user_stats.ml_coins -= 15
  - UPDATE user_stats.ml_coins_spent_total += 15
  - UPDATE powerups_inventory.pistas_available += 1
  ↓
Frontend:
  - Actualiza balance
  - Animación CoinsSpent(-15 ML)
  - Habilita PowerUp en UI
```

---

### 3. Balance en Tiempo Real

El store mantiene el balance sincronizado con el backend:

```typescript
// coinsStore.ts
fetchBalance: async (userId: string) => {
  set({ isLoading: true });

  try {
    const data = await coinsAPI.getBalance(userId);

    set({
      balance: data.balance,
      totalEarned: data.totalEarned,
      totalSpent: data.totalSpent,
      isLoading: false,
    });
  } catch (error) {
    set({ error: error.message, isLoading: false });
  }
}
```

**Optimistic Updates:**
```typescript
earnCoins: async (params: EarnCoinsParams) => {
  const currentBalance = get().balance;

  // Optimistic update
  set({ balance: currentBalance + params.amount });

  try {
    const transaction = await coinsAPI.earnCoins(params);

    // Confirmar con datos reales del backend
    set({
      balance: transaction.balanceAfter,
      totalEarned: get().totalEarned + params.amount,
    });
  } catch (error) {
    // Rollback si falla
    set({ balance: currentBalance, error: error.message });
  }
}
```

---

## 📊 Límites y Validaciones

### Límite Diario

```typescript
// coinsStore.ts
checkDailyLimit: () => {
  const { earningsToday } = get();
  const DAILY_LIMIT = 500; // ML Coins

  if (earningsToday >= DAILY_LIMIT) {
    set({ error: 'Límite diario alcanzado (500 ML)' });
    return false;
  }

  return true;
}
```

### Validación de Gasto

```typescript
spendCoins: async (params: SpendCoinsParams) => {
  const { balance } = get();

  // Validar balance suficiente
  if (balance < params.amount) {
    throw new Error(`ML Coins insuficientes. Necesitas ${params.amount} ML, tienes ${balance} ML`);
  }

  // Continuar con transacción...
}
```

---

## 🧪 Testing

### Test del Store

```typescript
// __tests__/coinsStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCoinsStore } from '../coinsStore';
import { coinsAPI } from '../api/coinsAPI';

vi.mock('../api/coinsAPI');

describe('coinsStore', () => {
  it('should earn coins successfully', async () => {
    const mockTransaction = {
      id: 'tx-1',
      userId: 'user-1',
      amount: 58,
      balanceAfter: 558,
    };

    vi.mocked(coinsAPI.earnCoins).mockResolvedValue(mockTransaction);

    const { result } = renderHook(() => useCoinsStore());

    await act(async () => {
      await result.current.earnCoins({
        userId: 'user-1',
        amount: 58,
        transactionType: 'earned',
      });
    });

    expect(result.current.balance).toBe(558);
  });

  it('should not spend coins if insufficient balance', async () => {
    const { result } = renderHook(() => useCoinsStore());

    act(() => {
      useCoinsStore.setState({ balance: 10 });
    });

    await expect(
      result.current.spendCoins({
        userId: 'user-1',
        amount: 15,
        transactionType: 'spent_powerup',
        referenceId: 'powerup-1',
        referenceType: 'powerup',
      })
    ).rejects.toThrow('ML Coins insuficientes');
  });
});
```

---

## 📊 Métricas

### Salud Económica

**Monitoreo Backend:**
```sql
-- Inflación mensual
SELECT
  DATE_TRUNC('month', created_at) as month,
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_earned,
  SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_spent,
  (SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) -
   SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END)) as net_supply
FROM gamification_system.ml_coins_transactions
GROUP BY month
ORDER BY month DESC;
```

**Targets:**
- Inflación mensual: 2-4%
- Velocity (transacciones/supply): 0.8-1.2
- Gini coefficient: <0.45
- % usuarios con balance >0: >85%

**Referencia:** [`ADR-004`](../../../../02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md#métricas-de-éxito)

---

**Mantenedores:** @frontend-team, @gamification-owner
**Última actualización:** 2025-11-07
**Documentos relacionados:** [README.md](./README.md), [GAMIF-Ranks.md](./GAMIF-Ranks.md)
