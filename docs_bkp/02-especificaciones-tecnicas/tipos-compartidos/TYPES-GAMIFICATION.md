# Tipos Compartidos - Gamificación

**Proyecto:** Gamilit Platform
**Módulo:** Tipos TypeScript Compartidos
**Categoría:** Gamification (Ranks, Achievements, Coins, Missions)
**Archivo original:** SHARED-TYPES-LIBRARY.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Este archivo contiene todos los tipos relacionados con el sistema de gamificación:
- **MayaRank**: Rangos mayas del sistema
- **UserStats**: Estadísticas de usuario
- **Achievement**: Logros y trofeos
- **MLCoinsTransaction**: Transacciones de monedas ML
- **RankRequirements**: Requisitos para avanzar de rango
- **PowerupInventory**: Inventario de power-ups
- **LeaderboardEntry**: Entrada de tabla de clasificación
- **Mission**: Sistema de misiones

---

### 6.4 Gamification Types

#### 6.4.1 MayaRank

**Description**: Maya civilization rank system

**TypeScript Definition**:
```typescript
type MayaRank = 'Ajaw' | 'Nacom' | 'Ah K'in' | 'Halach Uinic' | 'K'uk'ulkan';

enum MayaRankEnum {
  Ajaw = 'Ajaw',
  Nacom = 'Nacom',
  Ah K'in = 'Ah K'in',
  Halach Uinic = 'Halach Uinic',
  K'uk'ulkan = 'K'uk'ulkan'
}
```

**Zod Schema**:
```typescript
const mayaRankSchema = z.enum(['Ajaw', 'Nacom', 'Ah K'in', 'Halach Uinic', 'K'uk'ulkan']);
```

**PostgreSQL DDL:**
```sql
CREATE TYPE gamification_system.maya_rank AS ENUM (
  'Ajaw',
  'Nacom',
  'Ah K''in',
  'Halach Uinic',
  'K''uk''ulkan'
);
```

**Estado:** ✅ DDL actualizado y sincronizado (2025-11-03)

**Histórico:**
- **v2.0 (2025-11-03)**: Migración completada. Valores legacy eliminados, enum sincronizado con especificación oficial.
- **v1.0 (legacy)**: Valores antiguos: 'NACOM', 'BATAB', 'HOLCATTE', 'GUERRERO', 'MERCENARIO' (obsoletos)

**Decisión Oficial:** Según DECISION-LOG-006 (2025-11-02), el sistema de seed data es la fuente de verdad. Los 5 rangos oficiales son: Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan.

**Referencia:** Ver `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql` para DDL completo con documentación.

---

#### 6.4.2 UserStats

**Description**: User gamification statistics

**TypeScript Definition**:
```typescript
interface UserStats {
  user_id: string;
  ml_coins: number;
  ml_coins_earned_total: number;
  ml_coins_spent_total: number;
  total_xp: number;
  current_level: number;
  current_rank: MayaRank;
  rank_progress: number;
  current_streak: number;  // Racha actual de días consecutivos
  max_streak: number;       // Racha máxima histórica
  last_login_at?: Date;
  total_exercises_completed: number;
  perfect_scores: number;
  average_score: number;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const userStatsSchema = z.object({
  user_id: z.string().uuid(),
  ml_coins: z.number().int().min(0),
  ml_coins_earned_total: z.number().int().min(0),
  ml_coins_spent_total: z.number().int().min(0),
  total_xp: z.number().int().min(0),
  current_level: z.number().int().min(1),
  current_rank: mayaRankSchema,
  rank_progress: z.number().min(0).max(100),
  current_streak: z.number().int().min(0),  // Racha actual
  max_streak: z.number().int().min(0),       // Racha máxima histórica
  last_login_at: z.date().optional(),
  total_exercises_completed: z.number().int().min(0),
  perfect_scores: z.number().int().min(0),
  average_score: z.number().min(0).max(100),
  created_at: z.date(),
  updated_at: z.date()
});
```

**Example Data**:
```typescript
const exampleUserStats: UserStats = {
  user_id: 'user-123',
  ml_coins: 450,
  ml_coins_earned_total: 1200,
  ml_coins_spent_total: 750,
  total_xp: 3500,
  current_level: 12,
  current_rank: 'Nacom',
  rank_progress: 65,
  current_streak: 7,
  max_streak: 15,
  last_login_at: new Date('2025-01-15'),
  total_exercises_completed: 45,
  perfect_scores: 12,
  average_score: 82.5,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-15')
};
```

---

#### 6.4.3 Achievement

**Description**: Achievement definition

**TypeScript Definition**:
```typescript
type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
type AchievementCategory = 'progress' | 'streak' | 'completion' | 'social' | 'special' | 'mastery' | 'exploration';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: AchievementRarity;
  ml_coins_reward: number;
  xp_reward: number;
  conditions?: any;
  is_secret: boolean;
  created_at: Date;
}
```

**Zod Schema**:
```typescript
const achievementRaritySchema = z.enum(['common', 'rare', 'epic', 'legendary']);
const achievementCategorySchema = z.enum(['progress', 'streak', 'completion', 'social', 'special', 'mastery', 'exploration']);

const achievementSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: achievementCategorySchema,
  icon: z.string(),
  rarity: achievementRaritySchema,
  ml_coins_reward: z.number().int().min(0),
  xp_reward: z.number().int().min(0),
  conditions: z.any().optional(),
  is_secret: z.boolean(),
  created_at: z.date()
});
```

**Example Data**:
```typescript
const exampleAchievement: Achievement = {
  id: 'achievement-001',
  name: 'Primera Victoria',
  description: 'Completa tu primer ejercicio',
  category: 'progress',
  icon: '🏆',
  rarity: 'common',
  ml_coins_reward: 50,
  xp_reward: 100,
  conditions: {
    exercises_completed: 1
  },
  is_secret: false,
  created_at: new Date('2025-01-01')
};
```

---

#### 6.4.4 MLCoinsTransaction

**Description**: ML Coins transaction record

**TypeScript Definition**:
```typescript
type TransactionType =
  | 'earned_exercise'
  | 'earned_module'
  | 'earned_achievement'
  | 'earned_rank'
  | 'earned_streak'
  | 'earned_daily'
  | 'earned_bonus'
  | 'spent_powerup'
  | 'spent_hint'
  | 'spent_retry'
  | 'admin_adjustment'
  | 'refund'
  | 'bonus'
  | 'welcome_bonus';

interface MLCoinsTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: TransactionType;
  reason: string;
  reference_id?: string;
  reference_type?: string;
  balance_after: number;
  balance_before?: number;
  multiplier?: number;
  bonus_applied?: boolean;
  metadata?: any;
  created_at: Date;
}
```

**Zod Schema**:
```typescript
const transactionTypeSchema = z.enum([
  'earned_exercise',
  'earned_module',
  'earned_achievement',
  'earned_rank',
  'earned_streak',
  'earned_daily',
  'earned_bonus',
  'spent_powerup',
  'spent_hint',
  'spent_retry',
  'admin_adjustment',
  'refund',
  'bonus',
  'welcome_bonus'
]);

const mlCoinsTransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().int(),
  transaction_type: transactionTypeSchema,
  reason: z.string(),
  reference_id: z.string().optional(),
  reference_type: z.string().optional(),
  balance_after: z.number().int().min(0),
  balance_before: z.number().int().min(0).optional(),
  multiplier: z.number().min(1).optional(),
  bonus_applied: z.boolean().optional(),
  metadata: z.any().optional(),
  created_at: z.date()
});
```

**Example Data**:
```typescript
const exampleTransaction: MLCoinsTransaction = {
  id: 'txn-123',
  user_id: 'user-456',
  amount: 50,
  transaction_type: 'earned_exercise',
  reason: 'Ejercicio completado: Crucigrama Científico',
  reference_id: 'exercise-001',
  reference_type: 'exercise',
  balance_before: 400,
  balance_after: 450,
  multiplier: 1.0,
  bonus_applied: false,
  created_at: new Date('2025-01-15T10:30:00Z')
};
```

---

#### 6.4.5 RankRequirements

**Description**: Requirements for achieving a rank

**TypeScript Definition**:
```typescript
interface RankRequirements {
  rank: MayaRank;
  xpRequired: number;
  modulesRequired: number;
  mlCoinsThreshold: number;
  achievementsRequired: number;
  minimumScore: number;
  multiplier: number;
  mlBonus: number;
}
```

**Zod Schema**:
```typescript
const rankRequirementsSchema = z.object({
  rank: mayaRankSchema,
  xpRequired: z.number().int().min(0),
  modulesRequired: z.number().int().min(0),
  mlCoinsThreshold: z.number().int().min(0),
  achievementsRequired: z.number().int().min(0),
  minimumScore: z.number().min(0).max(100),
  multiplier: z.number().min(1),
  mlBonus: z.number().int().min(0)
});
```

**Example Data**:
```typescript
const rankRequirements: Record<MayaRank, RankRequirements> = {
  Ajaw: {
    rank: 'Ajaw',
    xpRequired: 0,
    modulesRequired: 0,
    mlCoinsThreshold: 0,
    achievementsRequired: 0,
    minimumScore: 0,
    multiplier: 1.0,
    mlBonus: 0
  },
  Nacom: {
    rank: 'Nacom',
    xpRequired: 500,
    modulesRequired: 2,
    mlCoinsThreshold: 200,
    achievementsRequired: 3,
    minimumScore: 70,
    multiplier: 1.2,
    mlBonus: 100
  },
  Ah K'in: {
    rank: 'Ah K'in',
    xpRequired: 1500,
    modulesRequired: 5,
    mlCoinsThreshold: 500,
    achievementsRequired: 8,
    minimumScore: 75,
    multiplier: 1.5,
    mlBonus: 250
  },
  Halach Uinic: {
    rank: 'Halach Uinic',
    xpRequired: 3500,
    modulesRequired: 10,
    mlCoinsThreshold: 1000,
    achievementsRequired: 15,
    minimumScore: 80,
    multiplier: 2.0,
    mlBonus: 500
  },
  K'uk'ulkan: {
    rank: 'K'uk'ulkan',
    xpRequired: 7500,
    modulesRequired: 20,
    mlCoinsThreshold: 2500,
    achievementsRequired: 30,
    minimumScore: 85,
    multiplier: 3.0,
    mlBonus: 1000
  }
};
```

---

#### 6.4.6 PowerupInventory

**Description**: User's powerup inventory

**TypeScript Definition**:
```typescript
interface PowerupInventory {
  pistas: PowerupItem;
  visionLectora: PowerupItem;
  segundaOportunidad: PowerupItem;
}

interface PowerupItem {
  available: number;
  purchased: number;
  used: number;
  cost: number;
}
```

**Zod Schema**:
```typescript
const powerupItemSchema = z.object({
  available: z.number().int().min(0),
  purchased: z.number().int().min(0),
  used: z.number().int().min(0),
  cost: z.number().int().min(0)
});

const powerupInventorySchema = z.object({
  pistas: powerupItemSchema,
  visionLectora: powerupItemSchema,
  segundaOportunidad: powerupItemSchema
});
```

**Example Data**:
```typescript
const exampleInventory: PowerupInventory = {
  pistas: {
    available: 3,
    purchased: 5,
    used: 2,
    cost: 50
  },
  visionLectora: {
    available: 1,
    purchased: 2,
    used: 1,
    cost: 100
  },
  segundaOportunidad: {
    available: 2,
    purchased: 3,
    used: 1,
    cost: 75
  }
};
```

---

#### 6.4.7 LeaderboardEntry

**Description**: Entry in the leaderboard

**TypeScript Definition**:
```typescript
interface LeaderboardEntry {
  position: number;
  userId: string;
  name: string;
  xp?: number;
  mlCoins?: number;
  modulesCompleted?: number;
  achievementsEarned?: number;
  streak?: number;
  rank?: MayaRank;
  weeklyXp?: number;
  avatarUrl?: string;
}
```

**Zod Schema**:
```typescript
const leaderboardEntrySchema = z.object({
  position: z.number().int().positive(),
  userId: z.string().uuid(),
  name: z.string(),
  xp: z.number().int().min(0).optional(),
  mlCoins: z.number().int().min(0).optional(),
  modulesCompleted: z.number().int().min(0).optional(),
  achievementsEarned: z.number().int().min(0).optional(),
  streak: z.number().int().min(0).optional(),
  rank: mayaRankSchema.optional(),
  weeklyXp: z.number().int().min(0).optional(),
  avatarUrl: z.string().url().optional()
});
```

---

#### 6.4.8 Mission

**Description**: User mission/quest

**TypeScript Definition**:
```typescript
type MissionType = 'daily' | 'weekly' | 'special';
type MissionStatus = 'active' | 'in_progress' | 'completed' | 'claimed' | 'expired';
type ObjectiveType =
  | 'exercises_completed'
  | 'ml_coins_earned'
  | 'modules_completed'
  | 'powerups_used'
  | 'achievements_unlocked'
  | 'perfect_scores'
  | 'streak_maintained'
  | 'friends_helped'
  | 'login_days'
  | 'rank_up'
  | 'guild_joined'
  | 'exercises_no_hints'
  | 'weekly_exercises'
  | 'total_xp_earned';

interface MissionObjective {
  type: ObjectiveType;
  target: number;
  current: number;
  description?: string;
}

interface MissionRewards {
  ml_coins: number;
  xp: number;
  items?: string[];
}

interface Mission {
  id: string;
  user_id: string;
  template_id: string;
  title: string;
  description: string;
  mission_type: MissionType;
  objectives: MissionObjective[];
  rewards: MissionRewards;
  status: MissionStatus;
  progress: number;
  start_date: Date;
  end_date: Date;
  completed_at?: Date;
  claimed_at?: Date;
  created_at: Date;
}
```

**Zod Schema**:
```typescript
const missionTypeSchema = z.enum(['daily', 'weekly', 'special']);
const missionStatusSchema = z.enum(['active', 'in_progress', 'completed', 'claimed', 'expired']);
const objectiveTypeSchema = z.enum([
  'exercises_completed',
  'ml_coins_earned',
  'modules_completed',
  'powerups_used',
  'achievements_unlocked',
  'perfect_scores',
  'streak_maintained',
  'friends_helped',
  'login_days',
  'rank_up',
  'guild_joined',
  'exercises_no_hints',
  'weekly_exercises',
  'total_xp_earned'
]);

const missionObjectiveSchema = z.object({
  type: objectiveTypeSchema,
  target: z.number().int().positive(),
  current: z.number().int().min(0),
  description: z.string().optional()
});

const missionRewardsSchema = z.object({
  ml_coins: z.number().int().min(0),
  xp: z.number().int().min(0),
  items: z.array(z.string()).optional()
});

const missionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  template_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  mission_type: missionTypeSchema,
  objectives: z.array(missionObjectiveSchema),
  rewards: missionRewardsSchema,
  status: missionStatusSchema,
  progress: z.number().min(0).max(100),
  start_date: z.date(),
  end_date: z.date(),
  completed_at: z.date().optional(),
  claimed_at: z.date().optional(),
  created_at: z.date()
});
```

**Example Data**:
```typescript
const exampleMission: Mission = {
  id: 'mission-123',
  user_id: 'user-456',
  template_id: 'template-daily-001',
  title: 'Explorador Diario',
  description: 'Completa 3 ejercicios hoy',
  mission_type: 'daily',
  objectives: [
    {
      type: 'exercises_completed',
      target: 3,
      current: 1,
      description: 'Completar 3 ejercicios'
    }
  ],
  rewards: {
    ml_coins: 100,
    xp: 50
  },
  status: 'in_progress',
  progress: 33,
  start_date: new Date('2025-01-15T00:00:00Z'),
  end_date: new Date('2025-01-15T23:59:59Z'),
  created_at: new Date('2025-01-15T00:00:00Z')
};
```

---

