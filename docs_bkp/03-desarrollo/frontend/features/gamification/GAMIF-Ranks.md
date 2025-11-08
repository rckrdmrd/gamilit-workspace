# GAMIF - Ranks (Rangos Maya)

**Proyecto:** GAMILIT Platform
**Feature:** Gamification → Ranks
**Componente:** Maya Ranks System
**Versión:** 2.0
**Fecha:** 2025-11-07
**Ubicación:** `apps/frontend/src/features/gamification/ranks/`

---

## 📋 Índice

1. [Propósito](#-propósito)
2. [Referencias](#-referencias-a-documentación-base)
3. [Los 5 Rangos Maya](#-los-5-rangos-maya)
4. [Arquitectura](#-arquitectura)
5. [Store (ranksStore)](#-store-ranksstore)
6. [Componentes UI](#-componentes-ui)
7. [Hooks](#-hooks)
8. [API Client](#-api-client)
9. [Flujos Principales](#-flujos-principales)

---

## 🎯 Propósito

Sistema de **progresión de rangos** basado en la estructura social de la civilización Maya clásica, adaptado para contexto educativo moderno.

**Características:**
- **5 rangos progresivos** con significado histórico-cultural
- **Multiplicadores permanentes** (1.0x → 2.0x) para recompensas
- **Promoción automática** al cumplir requisitos
- **Bonificaciones ML Coins** al promocionar
- **Valor pedagógico**: Enseña historia Maya mientras motiva progreso

**Principios:**
- **Cultural Relevance**: Rangos auténticos con contexto histórico
- **Fair Progression**: Basado en dominio de contenido, no tiempo
- **Learning-First**: Requiere comprensión real (score ≥70%)

---

## 📚 Referencias a Documentación Base

### Requerimientos
- **Rangos Maya:** [`docs/01-requerimientos/gamificacion/01-RANGOS-MAYA.md`](../../../../01-requerimientos/gamificacion/01-RANGOS-MAYA.md)
  - Jerarquía de 5 rangos
  - Algoritmo de promoción
  - Multiplicadores y bonificaciones

### Especificaciones Técnicas
- **ADR-004:** [`docs/02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md`](../../../../02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md#2-rangos-maya-5-tiers)
  - Diseño del sistema de rangos
  - Requisitos de promoción
  - Beneficios por rango

- **Tipos Compartidos:** [`docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md`](../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md#641-mayarank)
  - `MayaRank` enum
  - `UserRank` interface
  - `RankRequirements`

### Documentación Feature
- **Overview:** [README.md](./README.md#2-ranks-rangos-maya)

---

## 🏆 Los 5 Rangos Maya

### Tabla de Rangos

| Rango | Significado | Nivel | XP Req. | Módulos | Multiplier | ML Bonus |
|-------|-------------|-------|---------|---------|------------|----------|
| **Ajaw** | Señor/Gobernante | 1 | 0 | 1 | 1.0x | 50 |
| **Nacom** | Capitán de Guerra | 2 | 1,000 | 2 | 1.25x | 75 |
| **Ah K'in** | Sacerdote del Sol | 3 | 3,000 | 3 | 1.5x | 100 |
| **Halach Uinic** | Hombre Verdadero | 4 | 6,000 | 4 | 1.75x | 125 |
| **K'uk'ulkan** | Serpiente Emplumada | 5 | 10,000 | 5 | 2.0x | 150 |

### Significado Cultural

#### 1. Ajaw (Iniciado)
**Contexto Histórico:** Título de nobleza menor, gobernante local
**En GAMILIT:** Primer rango, estudiante recién iniciado
**Nivel de Comprensión:** Literal (Módulo 1)

#### 2. Nacom (Explorador)
**Contexto Histórico:** Capitán de guerra, estratega militar
**En GAMILIT:** Estudiante que explora y conquista nuevo conocimiento
**Nivel de Comprensión:** Inferencial (Módulo 2)

#### 3. Ah K'in (Analítico)
**Contexto Histórico:** Sacerdote del sol, guardián del conocimiento
**En GAMILIT:** Estudiante analítico con comprensión profunda
**Nivel de Comprensión:** Crítica (Módulo 3)

#### 4. Halach Uinic (Crítico)
**Contexto Histórico:** "Hombre Verdadero", líder supremo de ciudad-estado
**En GAMILIT:** Estudiante avanzado con pensamiento crítico
**Nivel de Comprensión:** Lectura Digital (Módulo 4)

#### 5. K'uk'ulkan (Maestro)
**Contexto Histórico:** Serpiente Emplumada, deidad del conocimiento
**En GAMILIT:** Máximo rango, dominio completo del sistema
**Nivel de Comprensión:** Producción Lectora (Módulo 5)

**Referencia:** [`01-RANGOS-MAYA.md`](../../../../01-requerimientos/gamificacion/01-RANGOS-MAYA.md#1-jerarquía-de-rangos)

---

## 🏗️ Arquitectura

### Estructura de Archivos

```
apps/frontend/src/features/gamification/ranks/
├── api/
│   └── ranksAPI.ts              # API client de ranks
├── components/
│   ├── RankBadge.tsx            # Badge visual del rango
│   ├── RankProgress.tsx         # Barra de progreso al siguiente rango
│   ├── RankPromotion.tsx        # Modal de promoción
│   ├── RankIcon.tsx             # Icono del rango
│   └── RankTooltip.tsx          # Tooltip con info del rango
├── hooks/
│   ├── useRanks.ts              # Hook principal de ranks
│   └── useRankProgress.ts       # Hook de progreso
├── store/
│   └── ranksStore.ts            # Zustand store de ranks
├── types/
│   └── ranksTypes.ts            # Tipos TypeScript
├── schemas/
│   └── ranksSchemas.ts          # Validación Zod
├── mockData/
│   └── ranksMockData.ts         # Mock data para testing
└── utils/
    ├── rankHelpers.ts           # Utilidades (getRankMultiplier, etc.)
    └── rankConstants.ts         # Constantes de rangos
```

---

## 🗄️ Store (ranksStore)

### Estado

```typescript
// ranks/store/ranksStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RanksState {
  // Estado actual
  currentRank: MayaRank;                // Rango actual del usuario
  previousRank: MayaRank | null;        // Rango anterior (para animaciones)
  rankProgress: number;                  // Progreso 0-100 al siguiente rango

  // Requisitos
  modulesCompleted: number;              // Módulos completados
  modulesRequired: number;               // Módulos requeridos para next rank
  averageScore: number;                  // Puntuación promedio

  // Multipliers
  currentMultiplier: number;             // Multiplicador actual (1.0x - 2.0x)

  // Estado UI
  showPromotionModal: boolean;           // Mostrar modal de promoción
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchRankInfo: (userId: string) => Promise<void>;
  checkPromotion: (userId: string) => Promise<void>;
  setShowPromotionModal: (show: boolean) => void;
}

export const useRanksStore = create<RanksState>()(
  persist(
    (set, get) => ({
      currentRank: 'Ajaw',
      previousRank: null,
      rankProgress: 0,
      modulesCompleted: 0,
      modulesRequired: 1,
      averageScore: 0,
      currentMultiplier: 1.0,
      showPromotionModal: false,
      isLoading: false,
      error: null,

      // Implementación de acciones...
    }),
    {
      name: 'ranks-storage',
      partialize: (state) => ({
        currentRank: state.currentRank,
        currentMultiplier: state.currentMultiplier,
      }),
    }
  )
);
```

### Tipos

```typescript
// ranks/types/ranksTypes.ts
type MayaRank = 'Ajaw' | 'Nacom' | 'Ah K\'in' | 'Halach Uinic' | 'K\'uk\'ulkan';

interface UserRank {
  id: string;
  userId: string;
  currentRank: MayaRank;
  previousRank: MayaRank | null;
  rankProgress: number;              // 0-100
  modulesCompleted: number;
  modulesRequired: number;
  averageScore: number;
  achievedAt: Date;
  rankMetadata?: {
    historicalContext: string;
    educationalLevel: string;
    iconUrl: string;
  };
}

interface RankRequirements {
  rank: MayaRank;
  level: number;
  minXP: number;
  modulesRequired: number;
  minAverageScore: number;           // 70%
  multiplier: number;
  mlCoinsBonus: number;
}

interface RankPromotionResult {
  promoted: boolean;
  newRank?: MayaRank;
  previousRank: MayaRank;
  bonusReceived?: number;            // ML Coins bonus
  message: string;
}
```

**Referencia:** [`TYPES-GAMIFICATION.md`](../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md#641-mayarank)

---

## 📡 API Client

### Métodos

```typescript
// ranks/api/ranksAPI.ts
import { apiClient } from '@/shared/api/apiClient';

export const ranksAPI = {
  // Obtener información del rango actual
  async getRankInfo(userId: string): Promise<UserRank> {
    const response = await apiClient.get(`/api/gamification/ranks/user/${userId}`);
    return response.data.data;
  },

  // Obtener todos los rangos disponibles
  async getAllRanks(): Promise<RankRequirements[]> {
    const response = await apiClient.get('/api/gamification/ranks');
    return response.data.data;
  },

  // Verificar y ejecutar promoción si aplica
  async checkAndPromote(userId: string): Promise<RankPromotionResult> {
    const response = await apiClient.post(`/api/gamification/ranks/promote/${userId}`);
    return response.data.data;
  },

  // Obtener multiplicador del rango actual
  async getRankMultiplier(rank: MayaRank): Promise<number> {
    const response = await apiClient.get(`/api/gamification/ranks/${rank}/multiplier`);
    return response.data.data.multiplier;
  },

  // Obtener progreso hacia el siguiente rango
  async getRankProgress(userId: string): Promise<{ progress: number; nextRank: MayaRank }> {
    const response = await apiClient.get(`/api/gamification/ranks/${userId}/progress`);
    return response.data.data;
  },
};
```

### Endpoints Backend

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/gamification/ranks` | Lista de todos los rangos |
| GET | `/api/gamification/ranks/user/:userId` | Info del rango del usuario |
| POST | `/api/gamification/ranks/promote/:userId` | Verificar y promocionar |
| GET | `/api/gamification/ranks/:rank/multiplier` | Multiplicador del rango |
| GET | `/api/gamification/ranks/:userId/progress` | Progreso al siguiente rango |

---

## ⚛️ Componentes UI

### 1. RankBadge

Badge visual que muestra el rango actual.

```typescript
// ranks/components/RankBadge.tsx
import { MayaRank } from '../types/ranksTypes';
import { getRankIcon, getRankColor } from '../utils/rankHelpers';

interface RankBadgeProps {
  rank: MayaRank;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showMultiplier?: boolean;
  className?: string;
}

export const RankBadge = ({
  rank,
  size = 'medium',
  showLabel = true,
  showMultiplier = false
}: RankBadgeProps) => {
  const icon = getRankIcon(rank);
  const color = getRankColor(rank);
  const multiplier = getRankMultiplier(rank);

  return (
    <div className={`rank-badge rank-badge--${size}`} style={{ borderColor: color }}>
      <span className="rank-icon">{icon}</span>
      {showLabel && <span className="rank-label">{rank}</span>}
      {showMultiplier && <span className="rank-multiplier">{multiplier}x</span>}
    </div>
  );
};
```

**Utilidades:**
```typescript
// ranks/utils/rankHelpers.ts
export const getRankIcon = (rank: MayaRank): string => {
  const icons: Record<MayaRank, string> = {
    'Ajaw': '🌟',
    'Nacom': '⚔️',
    'Ah K\'in': '☀️',
    'Halach Uinic': '👑',
    'K\'uk\'ulkan': '🐉',
  };
  return icons[rank];
};

export const getRankColor = (rank: MayaRank): string => {
  const colors: Record<MayaRank, string> = {
    'Ajaw': '#8B4513',
    'Nacom': '#4169E1',
    'Ah K\'in': '#FFD700',
    'Halach Uinic': '#9370DB',
    'K\'uk\'ulkan': '#FF4500',
  };
  return colors[rank];
};

export const getRankMultiplier = (rank: MayaRank): number => {
  const multipliers: Record<MayaRank, number> = {
    'Ajaw': 1.0,
    'Nacom': 1.25,
    'Ah K\'in': 1.5,
    'Halach Uinic': 1.75,
    'K\'uk\'ulkan': 2.0,
  };
  return multipliers[rank];
};
```

---

### 2. RankProgress

Barra de progreso hacia el siguiente rango.

```typescript
// ranks/components/RankProgress.tsx
import { useRankProgress } from '../hooks/useRankProgress';

export const RankProgress = ({ userId }: { userId: string }) => {
  const {
    currentRank,
    nextRank,
    progress,
    modulesCompleted,
    modulesRequired,
    averageScore
  } = useRankProgress(userId);

  const meetsScoreRequirement = averageScore >= 70;

  return (
    <div className="rank-progress">
      <div className="rank-progress__header">
        <RankBadge rank={currentRank} size="small" />
        <span className="arrow">→</span>
        <RankBadge rank={nextRank} size="small" />
      </div>

      <div className="rank-progress__bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="rank-progress__details">
        <div className="requirement">
          <span className="label">Módulos:</span>
          <span className={modulesCompleted >= modulesRequired ? 'met' : 'unmet'}>
            {modulesCompleted} / {modulesRequired}
          </span>
        </div>

        <div className="requirement">
          <span className="label">Puntuación promedio:</span>
          <span className={meetsScoreRequirement ? 'met' : 'unmet'}>
            {averageScore.toFixed(1)}% {meetsScoreRequirement ? '✓' : '(necesitas 70%)'}
          </span>
        </div>
      </div>
    </div>
  );
};
```

---

### 3. RankPromotion (Modal)

Modal de celebración cuando el usuario sube de rango.

```typescript
// ranks/components/RankPromotion.tsx
import { motion } from 'framer-motion';
import { useRanksStore } from '../store/ranksStore';

export const RankPromotion = () => {
  const showPromotionModal = useRanksStore((state) => state.showPromotionModal);
  const currentRank = useRanksStore((state) => state.currentRank);
  const previousRank = useRanksStore((state) => state.previousRank);
  const setShowPromotionModal = useRanksStore((state) => state.setShowPromotionModal);

  if (!showPromotionModal || !previousRank) return null;

  const bonusCoins = getRankBonus(currentRank);
  const multiplier = getRankMultiplier(currentRank);

  return (
    <motion.div
      className="rank-promotion-modal"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <div className="modal-content">
        <h2>¡Promoción de Rango!</h2>

        <div className="rank-change">
          <RankBadge rank={previousRank} size="large" showLabel />
          <span className="arrow">→</span>
          <RankBadge rank={currentRank} size="large" showLabel />
        </div>

        <div className="benefits">
          <h3>Beneficios Desbloqueados:</h3>
          <ul>
            <li>🪙 +{bonusCoins} ML Coins (bonificación)</li>
            <li>⚡ Multiplicador {multiplier}x permanente</li>
            <li>📚 Acceso a nuevos módulos</li>
          </ul>
        </div>

        <div className="historical-context">
          <h4>{currentRank}</h4>
          <p>{getRankDescription(currentRank)}</p>
        </div>

        <button onClick={() => setShowPromotionModal(false)}>
          ¡Continuar!
        </button>
      </div>
    </motion.div>
  );
};
```

---

### 4. RankTooltip

Tooltip informativo sobre el rango.

```typescript
// ranks/components/RankTooltip.tsx
export const RankTooltip = ({ rank }: { rank: MayaRank }) => {
  const multiplier = getRankMultiplier(rank);
  const description = getRankDescription(rank);
  const requirements = getRankRequirements(rank);

  return (
    <div className="rank-tooltip">
      <div className="rank-tooltip__header">
        <RankBadge rank={rank} size="small" />
        <span className="rank-name">{rank}</span>
      </div>

      <p className="rank-description">{description}</p>

      <div className="rank-stats">
        <div className="stat">
          <span className="label">Multiplicador:</span>
          <span className="value">{multiplier}x</span>
        </div>
        <div className="stat">
          <span className="label">Módulos requeridos:</span>
          <span className="value">{requirements.modulesRequired}</span>
        </div>
      </div>
    </div>
  );
};
```

---

## 🪝 Hooks

### 1. useRanks()

Hook principal para acceder al rango del usuario.

```typescript
// ranks/hooks/useRanks.ts
import { useEffect } from 'react';
import { useRanksStore } from '../store/ranksStore';

export const useRanks = (userId: string) => {
  const currentRank = useRanksStore((state) => state.currentRank);
  const currentMultiplier = useRanksStore((state) => state.currentMultiplier);
  const isLoading = useRanksStore((state) => state.isLoading);
  const error = useRanksStore((state) => state.error);

  const fetchRankInfo = useRanksStore((state) => state.fetchRankInfo);
  const checkPromotion = useRanksStore((state) => state.checkPromotion);

  // Auto-fetch rank info on mount
  useEffect(() => {
    if (userId) {
      fetchRankInfo(userId);
    }
  }, [userId]);

  return {
    currentRank,
    currentMultiplier,
    isLoading,
    error,
    checkPromotion: () => checkPromotion(userId),
  };
};
```

---

### 2. useRankProgress()

Hook para mostrar progreso al siguiente rango.

```typescript
// ranks/hooks/useRankProgress.ts
export const useRankProgress = (userId: string) => {
  const currentRank = useRanksStore((state) => state.currentRank);
  const rankProgress = useRanksStore((state) => state.rankProgress);
  const modulesCompleted = useRanksStore((state) => state.modulesCompleted);
  const modulesRequired = useRanksStore((state) => state.modulesRequired);
  const averageScore = useRanksStore((state) => state.averageScore);

  const nextRank = getNextRank(currentRank);
  const isMaxRank = currentRank === 'K\'uk\'ulkan';

  return {
    currentRank,
    nextRank,
    progress: rankProgress,
    modulesCompleted,
    modulesRequired,
    averageScore,
    isMaxRank,
    canPromote: modulesCompleted >= modulesRequired && averageScore >= 70,
  };
};
```

---

## 🔄 Flujos Principales

### 1. Verificar y Promocionar Rango

```
Usuario completa módulo
  ↓
Backend actualiza user_stats.modules_completed
  ↓
Backend ejecuta ranks.autoCheckPromotion(userId)
  ↓
Verifica requisitos:
  - modules_completed >= modulesRequired ✓
  - average_score >= 70% ✓
  ↓
Si cumple AMBOS:
  1. UPDATE user_ranks SET is_current = false WHERE user_id = ? AND is_current = true
  2. INSERT INTO user_ranks (new rank)
  3. INSERT INTO ml_coins_transactions (rank bonus)
  4. UPDATE user_stats SET current_rank = newRank
  5. Emit event 'rank_promoted'
  ↓
Frontend recibe WebSocket notification
  ↓
ranksStore.fetchRankInfo() actualiza estado
  ↓
ranksStore.setShowPromotionModal(true)
  ↓
Muestra RankPromotion modal con animación
  ↓
Usuario celebra y cierra modal
```

### Algoritmo de Promoción

```typescript
// Backend: ranks.service.ts
async autoCheckPromotion(userId: string): Promise<RankPromotionResult> {
  const userStats = await getUserStats(userId);
  const currentRankData = getRankData(userStats.currentRank);
  const nextRankData = getNextRankData(userStats.currentRank);

  if (!nextRankData) {
    return { promoted: false, message: 'Ya estás en el rango máximo' };
  }

  // Verificar requisitos
  const meetsModules = userStats.modulesCompleted >= nextRankData.modulesRequired;
  const meetsScore = userStats.averageScore >= 70;

  if (meetsModules && meetsScore) {
    // Promocionar
    await promoteUserToRank(userId, nextRankData.rank);

    return {
      promoted: true,
      newRank: nextRankData.rank,
      previousRank: currentRankData.rank,
      bonusReceived: nextRankData.mlCoinsBonus,
      message: `¡Felicidades! Has sido promocionado a ${nextRankData.rank}`,
    };
  }

  return {
    promoted: false,
    message: `Necesitas ${nextRankData.modulesRequired} módulos y 70% promedio`
  };
}
```

**Referencia:** [`01-RANGOS-MAYA.md`](../../../../01-requerimientos/gamificacion/01-RANGOS-MAYA.md#2-algoritmo-de-promoción)

---

### 2. Cálculo de Progreso

```typescript
// ranks/utils/rankHelpers.ts
export const calculateRankProgress = (
  modulesCompleted: number,
  modulesRequired: number,
  averageScore: number
): number => {
  // Fórmula oficial:
  // progress = (modulesProgress × 0.8) + (scoreProgress × 0.2)

  const modulesProgress = Math.min(modulesCompleted / modulesRequired, 1);
  const scoreProgress = Math.min(averageScore / 70, 1);

  const totalProgress = (modulesProgress * 0.8) + (scoreProgress * 0.2);

  return Math.round(totalProgress * 100); // 0-100
};
```

**Ejemplo:**
```typescript
// Estudiante con 2/3 módulos y 85% promedio
const progress = calculateRankProgress(2, 3, 85);
// modulesProgress = 2/3 = 0.667
// scoreProgress = 85/70 = 1.0 (capped)
// totalProgress = (0.667 * 0.8) + (1.0 * 0.2) = 0.734
// Result: 73% progress
```

---

## 🧪 Testing

### Test del Store

```typescript
// __tests__/ranksStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useRanksStore } from '../ranksStore';
import { ranksAPI } from '../api/ranksAPI';

vi.mock('../api/ranksAPI');

describe('ranksStore', () => {
  it('should fetch rank info successfully', async () => {
    const mockRankInfo = {
      currentRank: 'Nacom',
      modulesCompleted: 2,
      modulesRequired: 2,
      averageScore: 82,
      currentMultiplier: 1.25,
    };

    vi.mocked(ranksAPI.getRankInfo).mockResolvedValue(mockRankInfo);

    const { result } = renderHook(() => useRanksStore());

    await act(async () => {
      await result.current.fetchRankInfo('user-1');
    });

    expect(result.current.currentRank).toBe('Nacom');
    expect(result.current.currentMultiplier).toBe(1.25);
  });

  it('should show promotion modal when promoted', async () => {
    const mockPromotion = {
      promoted: true,
      newRank: 'Ah K\'in',
      previousRank: 'Nacom',
      bonusReceived: 100,
    };

    vi.mocked(ranksAPI.checkAndPromote).mockResolvedValue(mockPromotion);

    const { result } = renderHook(() => useRanksStore());

    await act(async () => {
      await result.current.checkPromotion('user-1');
    });

    expect(result.current.currentRank).toBe('Ah K\'in');
    expect(result.current.previousRank).toBe('Nacom');
    expect(result.current.showPromotionModal).toBe(true);
  });
});
```

---

## 📊 Constantes de Rangos

```typescript
// ranks/utils/rankConstants.ts
export const MAYA_RANKS: RankRequirements[] = [
  {
    rank: 'Ajaw',
    level: 1,
    minXP: 0,
    modulesRequired: 1,
    minAverageScore: 70,
    multiplier: 1.0,
    mlCoinsBonus: 50,
  },
  {
    rank: 'Nacom',
    level: 2,
    minXP: 1000,
    modulesRequired: 2,
    minAverageScore: 70,
    multiplier: 1.25,
    mlCoinsBonus: 75,
  },
  {
    rank: 'Ah K\'in',
    level: 3,
    minXP: 3000,
    modulesRequired: 3,
    minAverageScore: 70,
    multiplier: 1.5,
    mlCoinsBonus: 100,
  },
  {
    rank: 'Halach Uinic',
    level: 4,
    minXP: 6000,
    modulesRequired: 4,
    minAverageScore: 70,
    multiplier: 1.75,
    mlCoinsBonus: 125,
  },
  {
    rank: 'K\'uk\'ulkan',
    level: 5,
    minXP: 10000,
    modulesRequired: 5,
    minAverageScore: 70,
    multiplier: 2.0,
    mlCoinsBonus: 150,
  },
];

export const getNextRank = (currentRank: MayaRank): MayaRank | null => {
  const rankOrder: MayaRank[] = ['Ajaw', 'Nacom', 'Ah K\'in', 'Halach Uinic', 'K\'uk\'ulkan'];
  const currentIndex = rankOrder.indexOf(currentRank);

  if (currentIndex === -1 || currentIndex === rankOrder.length - 1) {
    return null; // Max rank
  }

  return rankOrder[currentIndex + 1];
};
```

---

**Mantenedores:** @frontend-team, @gamification-owner
**Última actualización:** 2025-11-07
**Documentos relacionados:** [README.md](./README.md), [GAMIF-Economy.md](./GAMIF-Economy.md)
