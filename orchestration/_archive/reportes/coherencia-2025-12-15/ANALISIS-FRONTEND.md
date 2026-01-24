# REPORTE DE COHERENCIA FRONTEND - ACHIEVEMENTS

**Proyecto:** GAMILIT
**Fecha:** 2025-12-15
**Analista:** Frontend-Auditor
**Alcance:** Tipos Achievement en Frontend vs Backend

---

## RESUMEN EJECUTIVO

Se analizó la coherencia entre los tipos relacionados con achievements en el frontend (React/TypeScript) y las entidades del backend (NestJS/TypeORM). Se encontraron **discrepancias significativas** en la estructura de tipos, enums desalineados, y duplicación de definiciones.

**Hallazgos Principales:**
- 2 archivos de definición de tipos Achievement con estructuras diferentes
- Enum AchievementCategory con valores desalineados (Backend tiene 9 valores, Frontend también pero recién sincronizados)
- Interface Achievement con campos que no mapean 1:1 con la entity
- API que transforma snake_case a camelCase de manera inconsistente
- Store que mezcla tipos de ambos archivos de definición

---

## 1. INVENTARIO-TYPES

### 1.1 Frontend - Shared Types

**Archivo:** `/apps/frontend/src/shared/types/achievement.types.ts`

```typescript
// ENUMS Y TYPES
export type AchievementCategory =
  'progress' | 'streak' | 'completion' | 'social' | 'special'
  | 'mastery' | 'exploration' | 'collection' | 'hidden'

export const AchievementCategoryEnum = {
  PROGRESS, STREAK, COMPLETION, SOCIAL, SPECIAL,
  MASTERY, EXPLORATION, COLLECTION
} // NOTA: Falta 'HIDDEN' en objeto const

export enum AchievementType {
  BADGE = 'badge',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
  RANK_PROMOTION = 'rank_promotion'
}

export type AchievementStatus =
  'locked' | 'in_progress' | 'earned' | 'claimed'

// INTERFACES
export interface Achievement {
  id: string
  name: string
  description: string
  detailedDescription?: string
  icon: string
  category: AchievementCategory
  type: AchievementType
  conditions: AchievementCondition[]
  rewards: AchievementReward
  isHidden: boolean
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  createdAt?: string
  updatedAt?: string

  // Backend alignment fields
  tenant_id?: string
  difficulty_level?: 'easy' | 'medium' | 'hard' | 'expert'
  is_secret: boolean
  is_active: boolean
  is_repeatable: boolean
  order_index: number
  points_value: number
  metadata?: Record<string, unknown>
  created_by?: string
}

export interface AchievementCondition {
  type: string
  target: number
  current?: number
  description: string
}

export interface AchievementReward {
  xp: number
  mlCoins: number
  items?: string[]
  rankPromotion?: string
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  progress: number
  earnedAt?: string
  claimedAt?: string
  unlockedAt?: string
  achievement: Achievement
  status: AchievementStatus
}
```

**Total Tipos Definidos:** 10
- 2 enums (AchievementType, legacy status/category)
- 2 type unions (AchievementCategory, AchievementStatus)
- 6 interfaces (Achievement, UserAchievement, AchievementCondition, AchievementReward, AchievementFilter, AchievementSummary)

---

### 1.2 Frontend - Feature Types

**Archivo:** `/apps/frontend/src/features/gamification/social/types/achievementsTypes.ts`

```typescript
// RE-EXPORTS FROM SHARED
export type { AchievementCategory, AchievementReward }
export type { BaseAchievement }

// LOCAL TYPES
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface AchievementProgress {
  current: number
  required: number
  percentage?: number
}

export interface AchievementRequirements {
  prerequisiteAchievements?: string[]
  rank?: string
  level?: number
  exercisesCompleted?: number
  perfectScores?: number
  friendsCount?: number
  guildMembership?: boolean
}

export interface AchievementWithProgress {
  id: string
  title: string          // DIFERENTE: "name" en shared
  name?: string          // Optional alias
  description: string
  category: AchievementCategory
  rarity: AchievementRarity
  icon: string
  mlCoinsReward: number  // DIFERENTE: campo plano vs nested en rewards
  xpReward: number       // DIFERENTE: campo plano vs nested en rewards
  rewards?: AchievementReward  // Alternative structured

  // User progress
  isUnlocked: boolean
  unlockedAt?: Date
  progress?: AchievementProgress
  requirements?: AchievementRequirements
  isHidden?: boolean
  rewardsClaimed?: boolean
}

export type Achievement = AchievementWithProgress  // ALIAS DEPRECATED

export interface AchievementUnlockNotification {
  achievement: Achievement
  timestamp: Date
  showConfetti: boolean
}

export interface AchievementStats {
  totalAchievements: number
  unlockedAchievements: number
  progressAchievements: number
  masteryAchievements: number
  socialAchievements: number
  hiddenAchievements: number
  totalMlCoinsEarned: number
  totalXpEarned: number
  completionRate?: number
}
```

**Total Tipos Definidos:** 6
- 1 type alias (AchievementRarity)
- 5 interfaces (AchievementProgress, AchievementRequirements, AchievementWithProgress, AchievementUnlockNotification, AchievementStats)

---

### 1.3 Frontend - API Types

**Archivo:** `/apps/frontend/src/features/gamification/social/api/achievementsAPI.ts`

```typescript
export interface BackendAchievement {
  id: string
  tenant_id?: string
  name: string
  description: string
  icon: string
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  difficulty_level?: string
  ml_coins_reward: number
  is_repeatable: boolean
  is_secret?: boolean
  is_active?: boolean
  order_index?: number
  points_value?: number
  unlock_message?: string
  instructions?: string
  tips?: string[]
  conditions: {
    type: string
    requirements: Record<string, unknown>
  }
  rewards: {
    xp: number
    ml_coins: number
    badge?: string
  }
  metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface BackendUserAchievement {
  id: string
  achievement_id: string
  user_id: string
  progress: number
  max_progress: number
  is_completed: boolean
  completion_percentage: string  // Backend returns as string!
  completed_at?: string
  started_at?: string
  rewards_claimed: boolean
  rewards_received?: {
    xp: number
    ml_coins: number
  }
  progress_data?: Record<string, unknown>
  milestones_reached?: string[]
  notified?: boolean
  viewed?: boolean
  metadata?: Record<string, unknown>
}

export interface AchievementWithProgress extends BackendAchievement {
  isUnlocked: boolean
  unlockedAt?: Date
  progress?: {
    current: number
    required: number
  }
  completionPercentage?: number
  rewardsClaimed?: boolean
}
```

**Total Tipos Definidos:** 3
- 3 interfaces (BackendAchievement, BackendUserAchievement, AchievementWithProgress)

---

### 1.4 Backend - Entity

**Archivo:** `/apps/backend/src/modules/gamification/entities/achievement.entity.ts`

```typescript
@Entity({ schema: 'gamification_system', name: 'achievements' })
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'uuid', nullable: true })
  tenant_id?: string

  @Column({ type: 'text' })
  name!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'text', default: 'trophy' })
  icon!: string

  @Column({ type: 'enum', enum: AchievementCategoryEnum })
  category!: AchievementCategoryEnum

  @Column({ type: 'text', default: 'common' })
  rarity!: string

  @Column({ type: 'enum', enum: DifficultyLevelEnum, default: DifficultyLevelEnum.BEGINNER })
  difficulty_level!: DifficultyLevelEnum

  @Column({ type: 'jsonb' })
  conditions!: Record<string, unknown>

  @Column({ type: 'jsonb', default: { xp: 100, badge: null, ml_coins: 50 } })
  rewards!: Record<string, unknown>

  @Column({ type: 'integer', default: 0 })
  ml_coins_reward!: number

  @Column({ type: 'boolean', default: false })
  is_secret!: boolean

  @Column({ type: 'boolean', default: true })
  is_active!: boolean

  @Column({ type: 'boolean', default: false })
  is_repeatable!: boolean

  @Column({ type: 'integer', default: 0 })
  order_index!: number

  @Column({ type: 'integer', default: 0 })
  points_value!: number

  @Column({ type: 'text', nullable: true })
  unlock_message?: string

  @Column({ type: 'text', nullable: true })
  instructions?: string

  @Column({ type: 'text', array: true, nullable: true })
  tips?: string[]

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>

  @Column({ type: 'uuid', nullable: true })
  created_by?: string

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date
}
```

**Archivo:** `/apps/backend/src/modules/gamification/entities/user-achievement.entity.ts`

```typescript
@Entity({ schema: 'gamification_system', name: 'user_achievements' })
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'uuid' })
  user_id!: string

  @Column({ type: 'uuid' })
  achievement_id!: string

  @Column({ type: 'integer', default: 0 })
  progress!: number

  @Column({ type: 'integer', default: 100 })
  max_progress!: number

  @Column({ type: 'boolean', default: false })
  is_completed!: boolean

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0.0 })
  completion_percentage!: number

  @Column({ type: 'timestamptz', nullable: true })
  completed_at!: Date | null

  @Column({ type: 'boolean', default: false })
  notified!: boolean

  @Column({ type: 'boolean', default: false })
  viewed!: boolean

  @Column({ type: 'boolean', default: false })
  rewards_claimed!: boolean

  @Column({ type: 'jsonb', default: {} })
  rewards_received!: Record<string, unknown>

  @Column({ type: 'jsonb', default: {} })
  progress_data!: Record<string, unknown>

  @Column({ type: 'text', array: true, nullable: true })
  milestones_reached: string[] | null = null

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>

  @Column({ type: 'timestamptz', default: () => 'gamilit.now_mexico()' })
  started_at!: Date

  @Column({ type: 'timestamptz', default: () => 'gamilit.now_mexico()' })
  created_at!: Date
}
```

---

### 1.5 Backend - Enums

**Archivo:** `/apps/backend/src/shared/constants/enums.constants.ts`

```typescript
export enum AchievementCategoryEnum {
  PROGRESS = 'progress',
  STREAK = 'streak',
  COMPLETION = 'completion',
  SOCIAL = 'social',
  SPECIAL = 'special',
  MASTERY = 'mastery',
  EXPLORATION = 'exploration',
  COLLECTION = 'collection',  // v1.1
  HIDDEN = 'hidden',          // v1.1
}

export enum AchievementTypeEnum {
  BADGE = 'badge',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
  RANK_PROMOTION = 'rank_promotion',
}
```

---

## 2. MATRIZ-TYPES-ENTITY

Comparación campo por campo entre Frontend Achievement interface y Backend Achievement entity.

| Campo | Frontend Shared | Frontend Feature | Backend Entity | Tipo Frontend | Tipo Backend | Match | Notas |
|-------|----------------|------------------|----------------|---------------|--------------|-------|-------|
| **id** | ✅ | ✅ | ✅ | string | string (uuid) | ✅ | |
| **tenant_id** | ✅ | ❌ | ✅ | string? | string? (uuid) | ⚠️ | Falta en feature types |
| **name** | ✅ | ✅ (como title) | ✅ | string | string | ⚠️ | Feature usa "title" como principal |
| **description** | ✅ | ✅ | ✅ | string | string? | ⚠️ | Backend nullable, Frontend required |
| **detailedDescription** | ✅ | ❌ | ❌ | string? | - | ❌ | Solo en frontend shared, no en backend |
| **icon** | ✅ | ✅ | ✅ | string | string | ✅ | |
| **category** | ✅ | ✅ | ✅ | AchievementCategory | AchievementCategoryEnum | ✅ | Enum values ahora sincronizados |
| **type** | ✅ | ❌ | ❌ | AchievementType | - | ❌ | Solo en frontend shared, no en backend entity |
| **rarity** | ✅ | ✅ | ✅ | union? | string | ⚠️ | Frontend typed union, backend string |
| **difficulty_level** | ✅ | ❌ | ✅ | union? | DifficultyLevelEnum | ⚠️ | Diferentes valores: Frontend (easy/medium/hard/expert), Backend (CEFR levels) |
| **conditions** | ✅ | ❌ | ✅ | AchievementCondition[] | Record<string, unknown> | ❌ | Estructura diferente: Frontend array tipado, Backend JSONB |
| **rewards** | ✅ | ✅ | ✅ | AchievementReward | Record<string, unknown> | ⚠️ | Frontend typed, backend JSONB |
| **ml_coins_reward** | ❌ | ✅ (mlCoinsReward) | ✅ | - | number | ⚠️ | Feature usa camelCase, backend snake_case |
| **points_value** | ✅ | ❌ | ✅ | number | number | ⚠️ | Falta en feature types |
| **is_secret** | ✅ | ❌ | ✅ | boolean | boolean | ⚠️ | Shared usa "is_secret", Feature usa "isHidden" |
| **isHidden** | ✅ | ✅ | ❌ | boolean | - | ⚠️ | Frontend computed (is_secret OR category=hidden) |
| **is_active** | ✅ | ❌ | ✅ | boolean | boolean | ⚠️ | Falta en feature types |
| **is_repeatable** | ✅ | ❌ | ✅ | boolean | boolean | ⚠️ | Falta en feature types |
| **order_index** | ✅ | ❌ | ✅ | number | number | ⚠️ | Falta en feature types |
| **unlock_message** | ❌ | ❌ | ✅ | - | string? | ❌ | Solo en backend |
| **instructions** | ❌ | ❌ | ✅ | - | string? | ❌ | Solo en backend |
| **tips** | ❌ | ❌ | ✅ | - | string[]? | ❌ | Solo en backend |
| **metadata** | ✅ | ❌ | ✅ | Record | Record | ⚠️ | Falta en feature types |
| **created_by** | ✅ | ❌ | ✅ | string? | string? (uuid) | ⚠️ | Falta en feature types |
| **created_at** | ✅ | ❌ | ✅ | string? | Date | ⚠️ | Tipo diferente: string vs Date |
| **updated_at** | ✅ | ❌ | ✅ | string? | Date | ⚠️ | Tipo diferente: string vs Date |
| **mlCoinsReward** | ❌ | ✅ | ❌ | number | - | ❌ | Solo en feature (camelCase transform) |
| **xpReward** | ❌ | ✅ | ❌ | number | - | ❌ | Solo en feature (extracted from rewards) |
| **isUnlocked** | ❌ | ✅ | ❌ | boolean | - | ❌ | User progress, no entity field |
| **unlockedAt** | ❌ | ✅ | ❌ | Date? | - | ❌ | User progress, no entity field |
| **progress** | ❌ | ✅ | ❌ | AchievementProgress? | - | ❌ | User progress, no entity field |
| **requirements** | ❌ | ✅ | ❌ | AchievementRequirements? | - | ❌ | Computed from conditions |
| **rewardsClaimed** | ❌ | ✅ | ❌ | boolean? | - | ❌ | User progress, no entity field |

**Resumen:**
- **Total campos analizados:** 32
- **Match perfecto:** 4 (12.5%)
- **Match con advertencia:** 17 (53.1%)
- **Sin match:** 11 (34.4%)

---

## 3. MATRIZ-ENUM-FRONTEND-BACKEND

### 3.1 AchievementCategory

| Valor | Frontend Type Union | Frontend Const Enum | Backend Enum | Match | Notas |
|-------|---------------------|---------------------|--------------|-------|-------|
| **progress** | ✅ | ✅ (PROGRESS) | ✅ (PROGRESS) | ✅ | |
| **streak** | ✅ | ✅ (STREAK) | ✅ (STREAK) | ✅ | |
| **completion** | ✅ | ✅ (COMPLETION) | ✅ (COMPLETION) | ✅ | |
| **social** | ✅ | ✅ (SOCIAL) | ✅ (SOCIAL) | ✅ | |
| **special** | ✅ | ✅ (SPECIAL) | ✅ (SPECIAL) | ✅ | |
| **mastery** | ✅ | ✅ (MASTERY) | ✅ (MASTERY) | ✅ | |
| **exploration** | ✅ | ✅ (EXPLORATION) | ✅ (EXPLORATION) | ✅ | |
| **collection** | ✅ | ❌ | ✅ (COLLECTION) | ⚠️ | Falta en AchievementCategoryEnum const object (línea 29-38) |
| **hidden** | ✅ | ❌ | ✅ (HIDDEN) | ⚠️ | Falta en AchievementCategoryEnum const object (línea 29-38) |

**Resumen:**
- Backend enum actualizado con 9 valores (v1.1 - 2025-12-15)
- Frontend type union tiene los 9 valores
- Frontend const enum object solo tiene 8 valores (falta 'COLLECTION' y 'HIDDEN')

**Estado:** ✅ SINCRONIZADO (con advertencia en const object)

---

### 3.2 AchievementType

| Valor | Frontend Enum | Backend Enum | Match | Notas |
|-------|---------------|--------------|-------|-------|
| **badge** | ✅ (BADGE) | ✅ (BADGE) | ✅ | |
| **milestone** | ✅ (MILESTONE) | ✅ (MILESTONE) | ✅ | |
| **special** | ✅ (SPECIAL) | ✅ (SPECIAL) | ✅ | |
| **rank_promotion** | ✅ (RANK_PROMOTION) | ✅ (RANK_PROMOTION) | ✅ | |

**Estado:** ✅ COMPLETAMENTE SINCRONIZADO

---

### 3.3 AchievementStatus

| Valor | Frontend Type Union | Backend | Match | Notas |
|-------|---------------------|---------|-------|-------|
| **locked** | ✅ | ❌ | ❌ | Solo en frontend (computed) |
| **in_progress** | ✅ | ❌ | ❌ | Solo en frontend (computed) |
| **earned** | ✅ | ❌ | ❌ | Solo en frontend (computed) |
| **claimed** | ✅ | ❌ | ❌ | Solo en frontend (computed) |

**Estado:** ❌ NO EXISTE EN BACKEND
**Nota:** Backend usa campos booleanos (is_completed, rewards_claimed) en lugar de enum de estado

---

### 3.4 Difficulty Levels

| Frontend (achievement.types.ts) | Backend (DifficultyLevelEnum) | Match | Notas |
|---------------------------------|-------------------------------|-------|-------|
| easy | ❌ | ❌ | Frontend usa niveles simples |
| medium | ❌ | ❌ | |
| hard | ❌ | ❌ | |
| expert | ❌ | ❌ | |
| ❌ | BEGINNER (A1) | ❌ | Backend usa estándar CEFR |
| ❌ | ELEMENTARY (A2) | ❌ | |
| ❌ | PRE_INTERMEDIATE (B1) | ❌ | |
| ❌ | INTERMEDIATE (B2) | ❌ | |
| ❌ | UPPER_INTERMEDIATE (C1) | ❌ | |
| ❌ | ADVANCED (C2) | ❌ | |
| ❌ | PROFICIENT (C2+) | ❌ | |
| ❌ | NATIVE | ❌ | |

**Estado:** ❌ COMPLETAMENTE DESALINEADO
**Impacto:** P1 - Los achievement difficulty levels no se pueden mapear correctamente

---

### 3.5 Rarity

| Frontend | Backend | Match | Notas |
|----------|---------|-------|-------|
| common | common | ✅ | String literal, no enum |
| rare | rare | ✅ | |
| epic | epic | ✅ | |
| legendary | legendary | ✅ | |

**Estado:** ✅ SINCRONIZADO (string literals, no enum)

---

## 4. LISTA-DUPLICACIONES

### 4.1 Definiciones Duplicadas de Achievement

**DUPLICACIÓN CRÍTICA:** Existen 2 definiciones principales de Achievement:

1. **Shared Achievement** (`/shared/types/achievement.types.ts`)
   - Alineada con backend entity
   - Usa snake_case para campos backend
   - Incluye campos de configuración (tenant_id, is_active, etc.)
   - **Uso:** Base canónica del sistema

2. **Feature Achievement** (`/features/gamification/social/types/achievementsTypes.ts`)
   - Optimizada para UI
   - Usa camelCase
   - Campos computados (isUnlocked, progress, rewardsClaimed)
   - **Uso:** View models en componentes

**Problema:** Los componentes y stores mezclan ambas definiciones sin conversión clara.

**Ejemplo de Confusión en Store:**
```typescript
// achievementsStore.ts línea 150-165
const achievements: Achievement[] = achievementsWithProgress.map((ach) => ({
  id: ach.id,
  title: ach.name,           // Convierte name -> title
  description: ach.description,
  category: ach.category as Achievement['category'],
  rarity: ach.rarity,
  icon: ach.icon,
  mlCoinsReward: ach.rewards?.ml_coins || ach.ml_coins_reward || 0,  // Mezcla ambos
  xpReward: ach.rewards?.xp || 0,
  isUnlocked: ach.isUnlocked || false,
  // ... mezcla de campos de ambas definiciones
}));
```

---

### 4.2 AchievementWithProgress Duplicado

Existen 2 interfaces con el mismo nombre:

1. **Feature Types** (`achievementsTypes.ts` línea 62-80)
   ```typescript
   export interface AchievementWithProgress {
     title: string
     mlCoinsReward: number
     xpReward: number
     // ... campos UI
   }
   ```

2. **API Types** (`achievementsAPI.ts` línea 90-99)
   ```typescript
   export interface AchievementWithProgress extends BackendAchievement {
     isUnlocked: boolean
     unlockedAt?: Date
     progress?: { current: number; required: number }
     // ... campos estado
   }
   ```

**Impacto:** P0 - Dependiendo del import, se usa una u otra definición con campos incompatibles.

---

### 4.3 Enum AchievementCategory Triplicado

1. **Type Union** (achievement.types.ts línea 14-23)
2. **Const Object** (achievement.types.ts línea 29-38) - FALTA 'collection' y 'hidden'
3. **Backend Enum** (enums.constants.ts línea 259-269)

**Recomendación:** Usar solo type union y backend enum. Deprecar const object.

---

## 5. LISTA-DISCREPANCIAS

### P0 - CRÍTICAS (Bloquean funcionalidad)

#### P0-001: AchievementWithProgress duplicado con estructuras incompatibles
- **Ubicación:**
  - `/features/gamification/social/types/achievementsTypes.ts` (línea 62)
  - `/features/gamification/social/api/achievementsAPI.ts` (línea 90)
- **Impacto:** Componentes que importan de uno u otro archivo obtienen tipos incompatibles
- **Ejemplo:**
  ```typescript
  // Component A
  import { AchievementWithProgress } from '../types/achievementsTypes';
  // Espera: title, mlCoinsReward, xpReward

  // Component B
  import { AchievementWithProgress } from '../api/achievementsAPI';
  // Espera: name, rewards.ml_coins, extends BackendAchievement
  ```
- **Solución:** Renombrar uno de los dos (ej: `AchievementViewModel` vs `AchievementAPIResponse`)

---

#### P0-002: Transformación inconsistente rewards en API
- **Ubicación:** `/features/gamification/social/api/achievementsAPI.ts`
- **Problema:** La función `mapToFrontendAchievement` (línea 362-390) hace fallback a múltiples fuentes:
  ```typescript
  mlCoinsReward: backendAchievement.rewards?.ml_coins ||
                 backendAchievement.ml_coins_reward || 0
  ```
- **Impacto:** Si el backend tiene `rewards.ml_coins = 0` (válido), el fallback usa `ml_coins_reward` incorrectamente
- **Solución:** Priorizar una única fuente de verdad

---

#### P0-003: Campo conditions con estructura diferente
- **Frontend:** Array de `AchievementCondition[]` con shape `{ type, target, current?, description }`
- **Backend:** JSONB `Record<string, unknown>` con shape `{ type, requirements: {...} }`
- **API Response:** `{ type: string, requirements: Record<string, unknown> }`
- **Problema:** Frontend espera array, backend devuelve objeto
- **Ubicación:**
  - Frontend: `/shared/types/achievement.types.ts` línea 74-79
  - Backend: `/entities/achievement.entity.ts` línea 106-107
- **Solución:** Backend debe serializar como array o frontend debe adaptarse

---

### P1 - ALTAS (Causan errores o bugs)

#### P1-001: Difficulty levels completamente desalineados
- **Frontend:** `'easy' | 'medium' | 'hard' | 'expert'`
- **Backend:** `DifficultyLevelEnum` con 8 niveles CEFR (BEGINNER, ELEMENTARY, ..., NATIVE)
- **Impacto:** No hay mapeo posible, filtros de dificultad en UI no funcionan
- **Ubicación:**
  - Frontend: `/shared/types/achievement.types.ts` línea 114
  - Backend: `/shared/constants/enums.constants.ts` línea 143-152

---

#### P1-002: Campo type no existe en backend entity
- **Frontend:** `type: AchievementType` (enum: badge, milestone, special, rank_promotion)
- **Backend Entity:** No tiene campo `type`
- **Backend Enum:** Existe `AchievementTypeEnum` pero no se usa en entity
- **Impacto:** Frontend no puede filtrar por tipo de achievement
- **Ubicación:**
  - Frontend: `/shared/types/achievement.types.ts` línea 104
  - Backend Entity: `/entities/achievement.entity.ts` (campo ausente)

---

#### P1-003: Campo detailedDescription solo en frontend
- **Frontend:** `detailedDescription?: string`
- **Backend:** No existe
- **Impacto:** Si frontend intenta enviar este campo al backend, será ignorado
- **Ubicación:** `/shared/types/achievement.types.ts` línea 101

---

#### P1-004: Campos unlock_message, instructions, tips solo en backend
- **Backend:**
  - `unlock_message?: string`
  - `instructions?: string`
  - `tips?: string[]`
- **Frontend:** No existen en ninguna interface
- **Impacto:** Frontend no puede mostrar estos mensajes guía del backend
- **Ubicación:** Backend entity líneas 165-180

---

#### P1-005: completion_percentage devuelto como string por backend
- **Backend Entity:** `completion_percentage: number` (numeric)
- **API Response:** `completion_percentage: string` (según BackendUserAchievement línea 72)
- **Frontend:** Espera `number`
- **Problema:** Serialización PostgreSQL numeric -> string
- **Ubicación:** `/features/gamification/social/api/achievementsAPI.ts` línea 72
- **Solución:** Backend debe parsear a number antes de enviar, o frontend debe parsear

---

### P2 - MEDIAS (Inconsistencias menores)

#### P2-001: Naming inconsistente name vs title
- **Backend:** `name: string`
- **Frontend Shared:** `name: string`
- **Frontend Feature:** `title: string` (con `name?: string` opcional)
- **Impacto:** Confusión al leer código
- **Solución:** Estandarizar en `name` en todos lados

---

#### P2-002: createdAt/updatedAt como string vs Date
- **Backend:** `created_at: Date`, `updated_at: Date`
- **Frontend:** `createdAt?: string`, `updatedAt?: string`
- **Impacto:** Frontend debe parsear a Date para operaciones
- **Nota:** Correcto para serialización JSON, pero inconsistente con `unlockedAt: Date`

---

#### P2-003: AchievementCategoryEnum const object incompleto
- **Ubicación:** `/shared/types/achievement.types.ts` línea 29-38
- **Problema:** Falta `COLLECTION` y `HIDDEN`
- **Impacto:** Si se usa el const object en lugar del type union, faltan valores
- **Solución:** Agregar valores faltantes o deprecar el const object

---

#### P2-004: Campo description nullable en backend, required en frontend
- **Backend:** `description?: string` (nullable)
- **Frontend:** `description: string` (required)
- **Impacto:** Si backend envía null, frontend puede fallar
- **Solución:** Frontend debe hacer description opcional

---

### P3 - BAJAS (Mejoras de calidad)

#### P3-001: Usar type union en lugar de const object para categories
- **Ubicación:** `/shared/types/achievement.types.ts`
- **Recomendación:** Deprecar `AchievementCategoryEnum` const object
- **Motivo:** Type union es más type-safe y moderno

---

#### P3-002: Export Achievement como alias deprecated
- **Ubicación:** `/features/gamification/social/types/achievementsTypes.ts` línea 86
- **Código:** `export type Achievement = AchievementWithProgress`
- **Problema:** Nombre genérico que colisiona con shared Achievement
- **Solución:** Eliminar alias o renombrar

---

#### P3-003: Documentar mapeo de categorías en API
- **Ubicación:** `/features/gamification/social/types/achievementsTypes.ts` línea 7-12
- **Existe:** Comentario de mapeo pero no se usa en código
- **Solución:** Implementar función de mapeo formal o eliminar comentario

---

## 6. ANÁLISIS DE ENDPOINTS Y USOS

### 6.1 Endpoints Backend

**Controller:** Gamification/Achievements

1. `GET /api/gamification/achievements`
   - Response: `BackendAchievement[]`
   - Usado en: `getAllAchievements()`

2. `GET /api/gamification/users/:userId/achievements`
   - Response: `{ achievements: BackendUserAchievement[], total: number }`
   - Usado en: `getUserAchievements()`

3. `GET /api/gamification/achievements/:achievementId`
   - Response: `BackendAchievement`
   - Usado en: `getAchievementById()`

4. `GET /api/gamification/achievements/user/:userId/progress/:achievementId`
   - Response: `BackendUserAchievement`
   - Usado en: `getAchievementProgress()`

5. `PUT /api/gamification/achievements/user/:userId/progress/:achievementId`
   - Body: `{ increment: number }`
   - Response: `BackendUserAchievement`
   - Usado en: `updateAchievementProgress()`

6. `POST /api/gamification/users/:userId/achievements/:achievementId/claim`
   - Response: `BackendUserAchievement`
   - Usado en: `claimAchievementRewards()`

---

### 6.2 Uso en Hooks

**Hook:** `useAchievements` (`/features/gamification/social/hooks/useAchievements.ts`)

- **Store consumido:** `useAchievementsStore`
- **Tipo Achievement usado:** Feature `Achievement` (alias de `AchievementWithProgress`)
- **Funciones:**
  - `fetchAchievements(userId)` - Llama API y mapea a feature types
  - `unlockAchievement(id)` - Local state update
  - `updateProgress(id, current)` - Local state update
  - Helpers de filtrado por category, rarity, locked

---

### 6.3 Uso en Store

**Store:** `achievementsStore` (`/features/gamification/social/store/achievementsStore.ts`)

- **Tipo Achievement usado:** Feature `Achievement`
- **Problema detectado (línea 150-165):** Mezcla campos de BackendAchievement y Feature Achievement
  ```typescript
  mlCoinsReward: ach.rewards?.ml_coins || ach.ml_coins_reward || 0
  ```
  Demuestra que el tipo `ach` es híbrido (tiene ambos campos)

---

### 6.4 Uso en Componentes

**Componentes principales que usan achievements:**

1. `AchievementCard.tsx` - Usa Feature `Achievement`
2. `AchievementsList.tsx` - Usa Feature `Achievement`
3. `AchievementUnlockModal.tsx` - Usa Feature `AchievementUnlockNotification`
4. `TrophyRoom.tsx` - Usa Feature `Achievement` y `AchievementStats`
5. `AchievementsPreview.tsx` (student) - Usa Feature types

**Observación:** Todos los componentes usan Feature types, no Shared types.

---

## 7. RECOMENDACIONES

### 7.1 Prioridad Inmediata (P0)

1. **Renombrar interfaces duplicadas**
   - `AchievementWithProgress` en API → `AchievementAPIResponse`
   - `Achievement` en Feature → `AchievementViewModel`

2. **Estandarizar estructura de rewards**
   - Backend debe garantizar que `rewards` siempre tiene `{ xp, ml_coins }`
   - Eliminar campo redundante `ml_coins_reward` de entity o usarlo como computed

3. **Alinear campo conditions**
   - Backend debe serializar conditions como array
   - O frontend debe adaptarse a la estructura `{ type, requirements }`

---

### 7.2 Prioridad Alta (P1)

1. **Alinear difficulty_level**
   - Opción A: Frontend adopta CEFR levels
   - Opción B: Backend agrega mapeo simple → CEFR
   - Opción C: Backend entity agrega campo `simple_difficulty` adicional

2. **Agregar campo type a backend entity**
   - Ya existe el enum, solo falta agregarlo a la tabla

3. **Agregar campos de mensajes a frontend**
   - `unlock_message`, `instructions`, `tips`
   - Permitirá mostrar guías desde backend

4. **Parsear completion_percentage a number**
   - En backend antes de enviar
   - O documentar que siempre es string y frontend debe parsear

---

### 7.3 Prioridad Media (P2)

1. **Estandarizar naming**
   - Usar `name` en todos lados (no `title`)

2. **Hacer description opcional en frontend**
   - Alinearse con backend nullable

3. **Completar AchievementCategoryEnum const object**
   - Agregar COLLECTION y HIDDEN
   - O deprecarlo completamente

---

### 7.4 Prioridad Baja (P3)

1. **Consolidar type definitions**
   - Mantener Shared types como SSOT
   - Feature types solo para view models específicos
   - Documentar claramente el uso de cada archivo

2. **Implementar DTO de transformación formal**
   - Clase `AchievementMapper` con métodos:
     - `toViewModel(backendAchievement, userProgress)`
     - `toAPIRequest(viewModel)`

3. **Agregar validación de tipos en runtime**
   - Usar zod o yup para validar responses del backend
   - Detectar desalineaciones temprano

---

## 8. MAPA DE DEPENDENCIAS

```
Backend Entity (achievement.entity.ts)
    ↓
Backend API Response (snake_case)
    ↓
achievementsAPI.ts (BackendAchievement, BackendUserAchievement)
    ↓ mapToFrontendAchievement()
    ↓
Feature Achievement (achievementsTypes.ts)
    ↓
achievementsStore.ts (Achievement)
    ↓
useAchievements hook
    ↓
Components (AchievementCard, TrophyRoom, etc.)
```

**Punto de conflicto:** La transformación en `achievementsStore.fetchAchievements` (línea 150) mezcla ambas estructuras.

---

## 9. CONCLUSIONES

### Estado General: ⚠️ COHERENCIA PARCIAL CON GAPS CRÍTICOS

1. **Enums:** Mayormente sincronizados (AchievementCategory y AchievementType)
   - ⚠️ Const object de categorías incompleto
   - ❌ Difficulty levels completamente desalineados

2. **Interfaces:** Duplicación crítica con estructuras incompatibles
   - 2 archivos de definición de Achievement
   - 2 interfaces AchievementWithProgress diferentes
   - Transformación inconsistente entre backend y frontend

3. **Campos:** 34% sin match, 53% con advertencias
   - Campos solo en backend: unlock_message, instructions, tips, type
   - Campos solo en frontend: detailedDescription, isUnlocked, progress (computed)
   - Campos con tipos diferentes: conditions, rewards, difficulty_level

4. **API:** Funciona pero con transformaciones frágiles
   - Múltiples fallbacks en mapeo de rewards
   - completion_percentage como string causa confusión
   - Mezcla de snake_case y camelCase

### Riesgo de Regresión: MEDIO-ALTO

- Los cambios en backend pueden romper frontend fácilmente
- La duplicación de tipos dificulta mantenimiento
- No hay validación de tipos en runtime

### Próximos Pasos Sugeridos

1. **Inmediato:** Resolver P0-001, P0-002, P0-003
2. **Corto plazo:** Crear DTOs formales de transformación
3. **Mediano plazo:** Consolidar definiciones de tipos
4. **Largo plazo:** Implementar validación de schemas compartidos (monorepo shared package)

---

**Fin del Reporte**
**Generado:** 2025-12-15
**Herramienta:** Claude Code - Frontend Auditor Agent
