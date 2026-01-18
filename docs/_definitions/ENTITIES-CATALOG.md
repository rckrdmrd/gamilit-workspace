# Entities Catalog - GAMILIT

**Alias:** @PROJ_DEF_ENTITIES
**Version:** 1.0.0
**Ultima actualizacion:** 2026-01-18
**Fase CAPVED:** 0 - Documentacion Estado Actual
**Task ID:** TASK-2026-01-17-002

---

## 1. RESUMEN

| Metrica | Valor |
|---------|-------|
| **Total Entities Gamification** | 18 |
| **Criticas para Tests** | 5 |
| **Con DTOs Completos** | 3 |
| **Requieren Nuevos DTOs** | 2 |

---

## 2. ENTITIES GAMIFICATION - ESTADO ACTUAL

### 2.1 Core Stats & Ranks

| Entity | Archivo | Tabla BD | DTO Response | Estado |
|--------|---------|----------|--------------|--------|
| UserStats | `user-stats.entity.ts` | `user_stats` | `UserStatsResponseDto` | OK |
| UserRank | `user-rank.entity.ts` | `user_ranks` | `UserRankResponseDto` | OK |
| MayaRank | `maya-rank.entity.ts` | `maya_ranks` | `RankMetadataDto` | OK |

**UserStats Entity - Campos:**
```
id, user_id, tenant_id
level, total_xp, xp_to_next_level
current_rank, rank_progress
ml_coins, ml_coins_earned_total, ml_coins_spent_total, ml_coins_earned_today
current_streak, max_streak, streak_started_at, days_active_total
exercises_completed, modules_completed, total_score, average_score, perfect_scores
achievements_earned, certificates_earned
total_time_spent, weekly_time_spent, sessions_count
weekly_xp, monthly_xp, weekly_exercises
global_rank_position, class_rank_position, school_rank_position
last_activity_at, last_login_at
metadata, created_at, updated_at
```

**Campos FALTANTES que frontend UserRankProgress espera:**
- `current_xp` - XP dentro del nivel actual (calculado)
- `prestige_level` - Sistema de prestige no implementado
- `multiplier` - Multiplicador actual (calculado)
- `can_rank_up` - Elegibilidad para promocion (calculado)
- `can_prestige` - Elegibilidad para prestige (no implementado)
- `next_rank` - Siguiente rango (calculado)
- `last_rank_up` - Fecha ultimo ascenso (en UserRank, no UserStats)

**Recomendacion:** Crear `UserRankProgressResponseDto` que componga datos de UserStats + UserRank + calculos

---

### 2.2 Economy - ML Coins

| Entity | Archivo | Tabla BD | DTO Response | Estado |
|--------|---------|----------|--------------|--------|
| MlCoinsTransaction | `ml-coins-transaction.entity.ts` | `ml_coins_transactions` | `TransactionResponseDto` | MAPEO |
| InventoryTransaction | `inventory-transaction.entity.ts` | `inventory_transactions` | - | N/A |

**MlCoinsTransaction Entity - Campos:**
```
id, user_id, tenant_id
amount, balance_before, balance_after
transaction_type, description, reason
reference_id, reference_type     ← Frontend espera 'source'
multiplier, bonus_applied
metadata, created_at
```

**Discrepancia de Nomenclatura:**
| Entity/DTO | Frontend Type | Mapeo Requerido |
|------------|---------------|-----------------|
| `reference_type` | `source` | Renombrar |
| `created_at` | `timestamp` | Renombrar |
| `balance_after` | `balanceAfter` | camelCase |

---

### 2.3 Shop System

| Entity | Archivo | Tabla BD | DTO Response | Estado |
|--------|---------|----------|--------------|--------|
| ShopItem | `shop-item.entity.ts` | `shop_items` | `ShopItemResponseDto` | PARCIAL |
| ShopCategory | `shop-category.entity.ts` | `shop_categories` | - | N/A |
| UserPurchase | `user-purchase.entity.ts` | `user_purchases` | `PurchaseResponseDto` | OK |

**ShopItem Entity vs Frontend ShopItem:**

| Campo Entity/DTO | Campo Frontend | Estado |
|------------------|----------------|--------|
| `id, name, description, icon` | Igual | OK |
| `image_url` | `image` | RENOMBRAR |
| `category` | `category` | OK |
| `rarity` | `rarity` | OK |
| `tags` | `tags` | OK |
| `price, discount_price` | `price` | OK |
| `is_available` | `available` | RENOMBRAR |
| `stock` | `stock` | OK |
| `is_consumable` | - | N/A |
| `requirements` | `requirements` | OK |
| - | `isOwned` | **FALTA** (calculado) |
| - | `isPurchasable` | **FALTA** (calculado) |
| - | `previewData` | **FALTA** |
| - | `metadata.duration` | **FALTA** |
| - | `metadata.stackable` | **FALTA** |
| - | `metadata.tradeable` | **FALTA** |

---

### 2.4 Achievements System

| Entity | Archivo | Tabla BD | DTO Response | Estado |
|--------|---------|----------|--------------|--------|
| Achievement | `achievement.entity.ts` | `achievements` | `AchievementResponseDto` | OK |
| AchievementCategory | `achievement-category.entity.ts` | `achievement_categories` | - | N/A |
| UserAchievement | `user-achievement.entity.ts` | `user_achievements` | `UserAchievementResponseDto` | OK |

---

### 2.5 Missions System

| Entity | Archivo | Tabla BD | DTO Response | Estado |
|--------|---------|----------|--------------|--------|
| Mission | `mission.entity.ts` | `missions` | `MissionResponseDto` | OK |
| MissionTemplate | `mission-template.entity.ts` | `mission_templates` | `MissionTemplateDto` | OK |
| ClassroomMission | `classroom-mission.entity.ts` | `classroom_missions` | `ClassroomMissionResponseDto` | OK |

---

### 2.6 Comodines/Boosts System

| Entity | Archivo | Tabla BD | DTO Response | Estado |
|--------|---------|----------|--------------|--------|
| ComodinesInventory | `comodines-inventory.entity.ts` | `comodines_inventory` | `InventoryResponseDto` | OK |
| ActiveBoost | `active-boost.entity.ts` | `active_boosts` | - | N/A |
| ComodinUsageLog | `comodin-usage-log.entity.ts` | `comodin_usage_logs` | - | N/A |

---

### 2.7 Leaderboards

| Entity | Archivo | Tabla BD | DTO Response | Estado |
|--------|---------|----------|--------------|--------|
| LeaderboardMetadata | `leaderboard-metadata.entity.ts` | `leaderboard_metadata` | `LeaderboardEntryDto` | OK |

---

## 3. RELACIONES CRITICAS

```yaml
relaciones_criticas:
  UserStats:
    belongs_to: [User]
    nota: "1:1 con User, contiene level/xp/rank/coins"

  UserRank:
    belongs_to: [User, MayaRank]
    has_many: [UserRank] # historial
    nota: "Multiples registros por usuario (historial)"

  MlCoinsTransaction:
    belongs_to: [User]
    nota: "Historial de transacciones"

  ShopItem:
    belongs_to: [ShopCategory]
    has_many: [UserPurchase]

  UserAchievement:
    belongs_to: [User, Achievement]
```

---

## 4. DTOs FALTANTES (Identificados en TASK-2026-01-17-002)

### 4.1 UserRankProgressResponseDto (CRITICO)

```typescript
// NECESITA CREARSE - Compone datos de UserStats + UserRank
export class UserRankProgressResponseDto {
  user_id: string;

  // De UserStats
  level: number;
  total_xp: number;
  xp_to_next_level: number;
  current_rank: string;
  current_streak: number;
  ml_coins_earned_total: number;
  last_activity_at: Date | null;

  // Calculados
  current_xp: number;           // total_xp % xp_per_level
  prestige_level: number;       // 0 hasta implementar
  multiplier: number;           // Basado en rango
  can_rank_up: boolean;
  next_rank: string | null;
  can_prestige: boolean;        // false hasta implementar
  last_rank_up: Date | null;    // De UserRank mas reciente
}
```

**Impacto:** 28 tests frontendPrioridad: P0 - CRITICO

### 4.2 MultiplierBreakdownResponseDto

```typescript
// NECESITA CREARSE
export class MultiplierBreakdownResponseDto {
  base: number;
  rank_multiplier: number;
  streak_multiplier: number;
  event_multiplier: number;
  total: number;
  sources: MultiplierSource[];
}
```

**Impacto:** 3 tests frontendPrioridad: P2

---

## 5. VALIDACION DE COHERENCIA CAPAS

### DDL → Backend

| Tabla | Entity | Estado |
|-------|--------|--------|
| `user_stats` | `UserStats` | OK |
| `user_ranks` | `UserRank` | OK |
| `maya_ranks` | `MayaRank` | OK |
| `ml_coins_transactions` | `MlCoinsTransaction` | OK |
| `shop_items` | `ShopItem` | OK |
| `user_purchases` | `UserPurchase` | OK |

### Backend → Frontend

| DTO | Frontend Type | Estado |
|-----|---------------|--------|
| `UserStatsResponseDto` | `UserRankProgress` | **GAP** - estructura diferente |
| `UserRankResponseDto` | `RankUpEvent` | PARCIAL |
| `TransactionResponseDto` | `Transaction` | MAPEO requerido |
| `ShopItemResponseDto` | `ShopItem` | **GAP** - campos faltantes |

---

## 6. REFERENCIAS

- **Frontend Types:** `@/features/gamification/*/types/`
- **Backend DTOs:** `@/modules/gamification/dto/`
- **Backend Entities:** `@/modules/gamification/entities/`
- **Database Schema:** Ver DDL en `database/migrations/`

---

## 7. PROXIMOS PASOS (TASK-2026-01-17-002)

1. [ ] Crear `UserRankProgressResponseDto` - FASE 1
2. [ ] Crear endpoint `/users/:userId/progress` - FASE 1
3. [ ] Agregar campos faltantes a `ShopItemResponseDto` - FASE 1
4. [ ] Crear `MultiplierBreakdownResponseDto` - FASE 1
5. [ ] Implementar endpoint `/users/:userId/multipliers` - FASE 1
6. [ ] Actualizar este catalogo post-ejecucion - FASE 4

---

*Generado: 2026-01-18 - FASE 0 CAPVED*
*Documento de estado actual ANTES de correcciones*
