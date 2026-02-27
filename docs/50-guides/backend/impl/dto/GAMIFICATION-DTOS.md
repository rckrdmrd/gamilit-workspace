---
titulo: Gamification Backend DTOs
tipo: guia
dominio: backend
ultima_actualizacion: 2026-02-27
---

# Gamification Backend DTOs - Estado Actual

**Documento:** GAMIFICATION-DTOS.md
**Fase CAPVED:** 0 - Documentacion Estado Actual
**Task ID:** TASK-2026-01-17-002
**Fecha:** 2026-01-18

---

## 1. Proposito

Este documento registra el estado actual de los DTOs del backend de gamificacion **ANTES de aplicar correcciones**. Sirve como baseline para validar cambios.

---

## 2. Directorio de DTOs

```
apps/backend/src/modules/gamification/dto/
├── achievements/
│   ├── achievement-response.dto.ts
│   ├── create-achievement.dto.ts
│   ├── update-achievement.dto.ts
│   └── update-achievement-status.dto.ts
├── comodines/
│   ├── inventory-response.dto.ts
│   ├── purchase-comodin.dto.ts
│   └── use-comodin.dto.ts
├── leaderboard/
│   └── leaderboard-entry.dto.ts
├── missions/
│   ├── assign-classroom-mission.dto.ts
│   ├── classroom-mission-response.dto.ts
│   ├── create-mission.dto.ts
│   ├── mission-response.dto.ts
│   ├── mission-stats.dto.ts
│   ├── update-mission.dto.ts
│   └── update-mission-progress.dto.ts
├── mission-templates/
│   ├── create-mission-template.dto.ts
│   ├── mission-template-filter.dto.ts
│   ├── mission-template.dto.ts
│   └── update-mission-template.dto.ts
├── ml-coins/
│   ├── create-transaction.dto.ts
│   └── transaction-response.dto.ts
├── notifications/
│   └── mark-read.dto.ts
├── shop/
│   ├── create-purchase.dto.ts
│   ├── purchase-response.dto.ts
│   └── shop-item-response.dto.ts
├── user-achievements/
│   ├── grant-achievement.dto.ts
│   └── user-achievement-response.dto.ts
├── user-ranks/
│   ├── create-user-rank.dto.ts
│   ├── update-user-rank.dto.ts
│   └── user-rank-response.dto.ts
├── user-stats/
│   ├── create-user-stats.dto.ts
│   ├── update-user-stats.dto.ts
│   └── user-stats-response.dto.ts
└── user-gamification-summary.dto.ts
```

---

## 3. DTOs Criticos para Tests

### 3.1 UserStatsResponseDto

**Ubicacion:** `dto/user-stats/user-stats-response.dto.ts`

```typescript
export class UserStatsResponseDto {
  id!: string;
  user_id!: string;
  tenant_id?: string;

  // LEVEL & XP SYSTEM
  level!: number;
  total_xp!: number;
  xp_to_next_level!: number;

  // RANK SYSTEM
  current_rank!: string;
  rank_progress!: number;

  // ML COINS SYSTEM
  ml_coins!: number;
  ml_coins_earned_total!: number;
  ml_coins_spent_total!: number;
  ml_coins_earned_today!: number;
  last_ml_coins_reset?: Date;

  // STREAK SYSTEM
  current_streak!: number;
  max_streak!: number;
  streak_started_at?: Date;
  days_active_total!: number;

  // PROGRESS & COMPLETION
  exercises_completed!: number;
  modules_completed!: number;
  total_score!: number;
  average_score?: number;
  perfect_scores!: number;

  // ACHIEVEMENTS & REWARDS
  achievements_earned!: number;
  certificates_earned!: number;

  // TIME TRACKING
  total_time_spent!: string;
  weekly_time_spent!: string;
  sessions_count!: number;

  // PERIODIC METRICS
  weekly_xp!: number;
  monthly_xp!: number;
  weekly_exercises!: number;

  // RANKING POSITIONS
  global_rank_position?: number;
  class_rank_position?: number;
  school_rank_position?: number;

  // ACTIVITY TIMESTAMPS
  last_activity_at?: Date;
  last_login_at?: Date;

  // METADATA & AUDIT
  metadata!: Record<string, unknown>;
  created_at!: Date;
  updated_at!: Date;
}
```

**Campos para Frontend UserRankProgress:**
- `level` → `currentLevel`
- `total_xp` → `totalXP`
- `xp_to_next_level` → `xpToNextLevel`
- `current_rank` → `currentRank`
- `current_streak` → `activityStreak`
- `last_activity_at` → `lastActivityDate`

**Campos FALTANTES que frontend espera:**
- `currentXP` (XP dentro del nivel actual)
- `prestigeLevel`
- `canRankUp`
- `canPrestige`
- `multiplier`
- `lastRankUp`
- `mlCoinsEarned`
- `nextRank`

---

### 3.2 UserRankResponseDto

**Ubicacion:** `dto/user-ranks/user-rank-response.dto.ts`

```typescript
export class UserRankResponseDto {
  id!: string;
  user_id!: string;
  tenant_id?: string;

  // RANK INFORMATION
  current_rank!: string;
  previous_rank?: string;

  // PROGRESS & METRICS
  rank_progress_percentage!: number;
  modules_required_for_next?: number;
  modules_completed_for_rank!: number;
  xp_required_for_next?: number;
  xp_earned_for_rank!: number;
  ml_coins_bonus!: number;

  // CERTIFICATES & BADGES
  certificate_url?: string;
  badge_url?: string;

  // ACHIEVEMENT DATES
  achieved_at?: Date;
  previous_rank_achieved_at?: Date;

  // STATUS
  is_current!: boolean;
  rank_metadata!: Record<string, unknown>;

  // AUDIT
  created_at!: Date;
  updated_at!: Date;
}
```

**Estado:** Este DTO es para historial de rangos, NO para progreso actual

---

### 3.3 TransactionResponseDto

**Ubicacion:** `dto/ml-coins/transaction-response.dto.ts`

```typescript
export class TransactionResponseDto {
  id!: string;
  user_id!: string;
  amount!: number;
  balance_before!: number;
  balance_after!: number;
  transaction_type!: TransactionTypeEnum;
  description!: string | null;
  reason!: string | null;
  reference_id!: string | null;
  reference_type!: string | null;    // FRONTEND ESPERA: source
  multiplier!: number;
  bonus_applied!: boolean;
  metadata!: Record<string, unknown>;
  created_at!: Date;                  // FRONTEND ESPERA: timestamp
}
```

**Mapeo necesario Frontend:**
- `reference_type` → `source`
- `created_at` → `timestamp`
- `balance_after` → `balanceAfter`

---

### 3.4 ShopItemResponseDto

**Ubicacion:** `dto/shop/shop-item-response.dto.ts`

```typescript
export class ShopItemResponseDto {
  id!: string;
  name!: string;
  description?: string;
  icon!: string;
  image_url?: string;           // FRONTEND ESPERA: image
  category!: ShopItemCategoryEnum;
  rarity!: string;
  tags!: string[];
  price!: number;
  discount_price?: number;
  is_available!: boolean;       // FRONTEND ESPERA: available
  stock?: number;
  is_consumable!: boolean;
  requirements?: {
    rank?: string;
    level?: number;
    achievement?: string;
  };
}
```

**Campos FALTANTES que frontend espera:**
- `isOwned` (calculado, no en DTO)
- `isPurchasable` (calculado, no en DTO)
- `previewData` (no existe)
- `metadata.effectDescription`
- `metadata.duration` / `duration_days`
- `metadata.stackable`
- `metadata.tradeable`

---

## 4. DTOs No Existentes (Requeridos)

### 4.1 UserRankProgressResponseDto (PROPUESTO)

```typescript
// NO EXISTE - NECESITA CREARSE
export class UserRankProgressResponseDto {
  // Basicos de UserStats
  user_id: string;
  level: number;
  total_xp: number;
  xp_to_next_level: number;
  current_rank: string;
  current_streak: number;
  ml_coins_earned_total: number;

  // Calculados
  current_xp: number;           // total_xp % xp_per_level
  prestige_level: number;       // Desde tabla futura o 0
  multiplier: number;           // Calculado de rank + bonuses
  can_rank_up: boolean;         // Calculado
  next_rank: string | null;     // Siguiente en lista
  can_prestige: boolean;        // false hasta implementar

  // Timestamps
  last_rank_up: Date | null;
  last_activity_at: Date | null;
}
```

### 4.2 MultiplierBreakdownResponseDto (PROPUESTO)

```typescript
// NO EXISTE - NECESITA CREARSE
export class MultiplierBreakdownResponseDto {
  base: number;                 // Siempre 1.0
  rank_multiplier: number;      // Del rango actual
  streak_multiplier: number;    // Por racha
  event_multiplier: number;     // Eventos especiales
  total: number;                // Producto de todos
  sources: Array<{
    type: string;
    name: string;
    value: number;
    expires_at?: Date;
  }>;
}
```

---

## 5. Controladores y Endpoints

### 5.1 RanksController

**Ruta base:** `/api/v1/gamification/ranks`

| Metodo | Ruta | DTO Response | Estado |
|--------|------|--------------|--------|
| GET | `/` | `RankMetadataDto[]` | OK |
| GET | `/current` | `UserRank` (entity) | OK |
| GET | `/users/:userId/rank-progress` | `RankProgressDto` | PARCIAL |
| GET | `/users/:userId/rank-history` | `UserRank[]` | OK |
| GET | `/check-promotion/:userId` | `{ eligible: boolean }` | OK |
| POST | `/promote/:userId` | `UserRank` | OK |
| GET | `/:id` | `UserRank` | OK |
| POST | `/admin/ranks` | `UserRank` | OK (admin) |
| PUT | `/admin/ranks/:id` | `UserRank` | OK (admin) |
| DELETE | `/admin/ranks/:id` | void | OK (admin) |

**Endpoints FALTANTES:**
- `GET /users/:userId/multipliers` - Obtener breakdown de multiplicadores
- `POST /users/:userId/add-xp` - Agregar XP con respuesta estructurada
- `POST /users/:userId/prestige` - Ejecutar prestige

### 5.2 UserStatsController

**Ruta base:** `/api/v1/gamification`

| Metodo | Ruta | DTO Response | Estado |
|--------|------|--------------|--------|
| GET | `/users/:userId/stats` | `UserStatsResponseDto` | OK |
| GET | `/users/:userId/summary` | `UserGamificationSummaryDto` | OK |
| GET | `/users/:userId/rank` | inline object | OK |
| PATCH | `/users/:userId/stats` | `UserStatsResponseDto + flags` | OK |

**Nota:** PATCH retorna `leveled_up` y `ranked_up` flags correctamente

---

## 6. Resumen de Estado

### DTOs Existentes y Funcionales

| DTO | Uso | Estado |
|-----|-----|--------|
| `UserStatsResponseDto` | Stats completas | OK |
| `UserRankResponseDto` | Historial de rangos | OK |
| `TransactionResponseDto` | Transacciones ML Coins | OK (requiere mapeo) |
| `ShopItemResponseDto` | Items de tienda | PARCIAL (faltan campos) |
| `UserGamificationSummaryDto` | Resumen para admin | OK |

### DTOs Faltantes

| DTO Propuesto | Uso | Prioridad |
|---------------|-----|-----------|
| `UserRankProgressResponseDto` | Progreso actual completo | P1 - CRITICO |
| `MultiplierBreakdownResponseDto` | Desglose multiplicadores | P2 |
| `AddXpResponseDto` | Respuesta al agregar XP | P2 |
| `PrestigeResponseDto` | Respuesta al prestigiar | P3 |

---

## 7. Decoradores y Transformacion

Todos los DTOs usan:
- `@Expose()` de class-transformer
- `@ApiProperty()` de @nestjs/swagger

**NO se usa:**
- `@Transform()` para mapeo de nombres
- Interceptores globales de transformacion

**Recomendacion:** Agregar transformadores para mapear snake_case a camelCase automaticamente

---

*Generado: 2026-01-18 - FASE 0 CAPVED*
