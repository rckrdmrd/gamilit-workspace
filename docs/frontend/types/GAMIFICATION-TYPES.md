# Gamification Frontend Types - Estado Actual

**Documento:** GAMIFICATION-TYPES.md
**Fase CAPVED:** 0 - Documentacion Estado Actual
**Task ID:** TASK-2026-01-17-002
**Fecha:** 2026-01-18

---

## 1. Proposito

Este documento registra el estado actual de los tipos TypeScript del sistema de gamificacion frontend **ANTES de aplicar correcciones**. Sirve como baseline para validar cambios.

---

## 2. Archivos de Tipos

| Archivo | Ubicacion | Descripcion |
|---------|-----------|-------------|
| `economyTypes.ts` | `src/features/gamification/economy/types/` | Sistema de economia ML Coins |
| `ranksTypes.ts` | `src/features/gamification/ranks/types/` | Sistema de rangos Maya |
| `missionsTypes.ts` | `src/features/gamification/missions/types/` | Sistema de misiones |
| `guildsTypes.ts` | `src/features/gamification/social/types/` | Sistema de gremios |
| `achievementsTypes.ts` | `src/features/gamification/social/types/` | Sistema de logros |
| `friendsTypes.ts` | `src/features/gamification/social/types/` | Sistema social amigos |
| `leaderboardsTypes.ts` | `src/features/gamification/social/types/` | Sistema de leaderboards |
| `powerUpsTypes.ts` | `src/features/gamification/social/types/` | Sistema de power-ups |

---

## 3. Tipos Criticos - economyTypes.ts

### 3.1 Transaction

```typescript
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  source: EarningSource | string;  // DISCREPANCIA: Backend usa reference_type
  description: string;
  timestamp: Date;
  balanceAfter: number;
  metadata?: {
    itemId?: string;
    exerciseId?: string;
    achievementId?: string;
  };
}
```

**Discrepancias con Backend:**
- `source` vs `reference_type` - nomenclatura diferente
- `timestamp` vs `created_at` - nomenclatura diferente
- `balanceAfter` vs `balance_after` - camelCase vs snake_case

### 3.2 ShopItem

```typescript
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: number;
  icon: string;
  image?: string;              // DISCREPANCIA: Backend usa image_url
  rarity: ItemRarity;
  tags?: string[];
  isOwned?: boolean;           // NO EXISTE en backend DTO
  isPurchasable?: boolean;     // NO EXISTE en backend DTO
  requirements?: ShopItemRequirements;
  previewData?: unknown;       // NO EXISTE en backend DTO
  metadata?: {
    effectDescription?: string;
    duration?: number;         // DISCREPANCIA: Backend usa duration_days? (no existe)
    stackable?: boolean;       // NO EXISTE en backend DTO
    tradeable?: boolean;       // NO EXISTE en backend DTO
  };
  stock?: number;
  available?: boolean;         // Backend usa is_available
}
```

**Discrepancias con Backend DTO `ShopItemResponseDto`:**
- `image` → `image_url`
- `available` → `is_available`
- `isOwned`, `isPurchasable`, `previewData`, `metadata.stackable`, `metadata.tradeable` - NO existen en backend
- `metadata.duration` esperado pero backend no tiene `duration_days`

### 3.3 TransactionTypeEnum

```typescript
export enum TransactionTypeEnum {
  EARNED_EXERCISE = 'earned_exercise',
  EARNED_MODULE = 'earned_module',
  EARNED_ACHIEVEMENT = 'earned_achievement',
  EARNED_RANK = 'earned_rank',
  EARNED_STREAK = 'earned_streak',
  EARNED_DAILY = 'earned_daily',
  EARNED_BONUS = 'earned_bonus',
  SPENT_POWERUP = 'spent_powerup',
  SPENT_HINT = 'spent_hint',
  SPENT_RETRY = 'spent_retry',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  REFUND = 'refund',
  BONUS = 'bonus',
  WELCOME_BONUS = 'welcome_bonus',
}
```

**Estado:** Sincronizado con backend `TransactionTypeEnum`

### 3.4 EarningSource (DEPRECATED)

```typescript
export type EarningSource =
  | 'exercise_completion'
  | 'streak_bonus'
  | 'perfect_score'
  | 'achievement_unlock'
  | 'daily_login'
  | 'guild_challenge'
  | 'leaderboard_reward'
  | 'referral_bonus'
  | 'admin_grant';
```

**Estado:** Marcado como deprecated, pero aun usado en `Transaction.source`

---

## 4. Tipos Criticos - ranksTypes.ts

### 4.1 UserRankProgress

```typescript
export interface UserRankProgress {
  currentRank: MayaRank;
  currentLevel: number;         // NO PROVISTO por backend directamente
  currentXP: number;            // NO PROVISTO por backend directamente
  xpToNextLevel: number;
  totalXP: number;
  mlCoinsEarned: number;
  prestigeLevel: number;        // NO IMPLEMENTADO en backend
  multiplier: number;
  lastRankUp: Date;
  activityStreak: number;
  lastActivityDate: Date;
  canRankUp: boolean;           // NO CALCULADO en backend
  nextRank: MayaRank | null;
  canPrestige: boolean;         // NO IMPLEMENTADO en backend
}
```

**Discrepancias CRITICAS con Backend:**
- `currentLevel` - Backend tiene `level` en UserStats, no en UserRank
- `currentXP` - Backend no tiene campo separado, usa `total_xp`
- `prestigeLevel` - NO existe en backend
- `canRankUp` - NO calculado por backend
- `canPrestige` - NO implementado en backend
- camelCase vs snake_case en todos los campos

### 4.2 MultiplierBreakdown

```typescript
export interface MultiplierBreakdown {
  base: number;
  rank: MultiplierSource;
  sources: MultiplierSource[];
  total: number;
  hasExpiringSoon: boolean;
  expiringSoon: MultiplierSource[];
}
```

**Estado:** NO existe endpoint en backend para obtener esto

### 4.3 AddXPRequest / AddXPResponse

```typescript
export interface AddXPRequest {
  userId: string;
  amount: number;
  source: XPSource;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface AddXPResponse {
  success: boolean;
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
  rankedUp: boolean;
  newRank?: MayaRank;
  rankUpEvent?: RankUpEvent;
}
```

**Estado:** Backend PATCH /stats soporta `total_xp_increment` pero no retorna estructura `AddXPResponse`

---

## 5. Constantes Exportadas

```typescript
export const XP_PER_LEVEL = 100;
export const ML_COINS_TO_XP_RATE = 5;
export const MAX_PRESTIGE_LEVEL = 10;
export const DECAY_WARNING_DAYS = 7;
export const DECAY_START_DAYS = 14;
```

**Estado:** Constantes locales, no sincronizadas con backend

---

## 6. Imports de SSOT

```typescript
import { MayaRank } from '@shared/constants/ranks.constants';
export { MayaRank };
```

**Estado:** Correcto - Re-exporta de SSOT compartido

---

## 7. Resumen de Discrepancias

| Tipo Frontend | Campos Faltantes Backend | Nomenclatura Diferente |
|---------------|-------------------------|------------------------|
| `Transaction` | - | `source`→`reference_type`, camelCase→snake_case |
| `ShopItem` | `isOwned`, `isPurchasable`, `previewData`, `metadata.*` | `image`→`image_url`, `available`→`is_available` |
| `UserRankProgress` | `prestigeLevel`, `canRankUp`, `canPrestige` | Todos los campos (camelCase→snake_case) |
| `MultiplierBreakdown` | TODO el tipo | N/A (no existe endpoint) |
| `AddXPResponse` | Estructura completa | Backend retorna stats, no AddXPResponse |

---

## 8. Recomendaciones

1. **Crear DTOs compuestos** en backend para `UserRankProgress`
2. **Implementar endpoint** `/multipliers` en backend
3. **Estandarizar nomenclatura** con transformadores en DTOs
4. **Documentar campos calculados** vs campos de BD
5. **Deprecar EarningSource** y migrar a TransactionTypeEnum

---

*Generado: 2026-01-18 - FASE 0 CAPVED*
