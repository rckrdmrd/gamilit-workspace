# Algoritmos y Data Schemas

**Proyecto:** Gamilit Platform
**Módulo:** Gamification API
**Categoría:** Algorithms & Data Schemas
**Archivo original:** GAMIFICATION-API.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## XP Calculation Algorithm

**Fórmula:**
```
XP_total = XP_base × mult_rank × mult_difficulty × mult_streak × mult_perfect × mult_speed
```

**Variables:**
- `XP_base`: Base XP para completar quiz (default: 50)
- `mult_rank`: Multiplicador de rango (1.0x - 2.0x + bonus de prestigio)
- `mult_difficulty`: Multiplicador de dificultad
  - Easy: 1.0x
  - Medium: 1.5x
  - Hard: 2.0x
  - Expert: 2.5x
- `mult_streak`: Bonus por streak (1 + min(streak_days, 30) × 0.01), max 1.3x
- `mult_perfect`: Bonus por score perfecto (1.5x si 100%, sino 1.0x)
- `mult_speed`: Bonus por velocidad (1.1x si <60% del tiempo, sino 1.0x)

**Ejemplo de Implementación:**
```javascript
const calculateXP = (quiz) => {
  const baseXP = 50;
  const rankMultiplier = getRankMultiplier(user.rank) + user.prestigeBonus;
  const difficultyMultiplier = {
    EASY: 1.0,
    MEDIUM: 1.5,
    HARD: 2.0,
    EXPERT: 2.5
  }[quiz.difficulty];

  const streakBonus = 1 + Math.min(user.streakDays, 30) * 0.01;
  const perfectBonus = quiz.score === 100 ? 1.5 : 1.0;
  const speedBonus = quiz.timeUsed < quiz.timeLimit * 0.6 ? 1.1 : 1.0;

  const totalXP = Math.floor(
    baseXP *
    rankMultiplier *
    difficultyMultiplier *
    streakBonus *
    perfectBonus *
    speedBonus
  );

  return totalXP;
};
```

---

## ML Coins Calculation Algorithm

**Fórmula:**
```
Coins_total = (Coins_base + difficulty_bonus) × mult_rank × mult_perfect × mult_speed × penalty_powerups × factor_inflation
```

**Variables:**
- `Coins_base`: Coins base por completar quiz (default: 15)
- `difficulty_bonus`:
  - Easy: +0
  - Medium: +5
  - Hard: +10
  - Expert: +20
- `mult_rank`: Multiplicador de rango (1.0x - 2.0x)
- `mult_perfect`: Bonus por score perfecto (1.5x si 100%, sino 1.0x)
- `mult_speed`: Bonus por velocidad (1.1x si <60% del tiempo, sino 1.0x)
- `penalty_powerups`: 0.9x por power-up usado (mín 0.5x)
- `factor_inflation`: Factor de ajuste de inflación (calculado dinámicamente)

**Ejemplo de Implementación:**
```javascript
const calculateCoins = (quiz, user) => {
  const baseCoins = 15;
  const difficultyBonus = {
    EASY: 0,
    MEDIUM: 5,
    HARD: 10,
    EXPERT: 20
  }[quiz.difficulty];

  const rankMultiplier = getRankMultiplier(user.rank);
  const perfectBonus = quiz.score === 100 ? 1.5 : 1.0;
  const speedBonus = quiz.timeUsed < quiz.timeLimit * 0.6 ? 1.1 : 1.0;
  const powerupPenalty = Math.max(0.5, Math.pow(0.9, quiz.powerupsUsed));
  const inflationFactor = getInflationAdjustmentFactor();

  const totalCoins = Math.floor(
    (baseCoins + difficultyBonus) *
    rankMultiplier *
    perfectBonus *
    speedBonus *
    powerupPenalty *
    inflationFactor
  );

  return totalCoins;
};
```

---

## Inflation Control Algorithm

**Ajuste Logarítmico:**
```
factor_adjustment = 1 / (1 + log10(1 + inflation_current / inflation_target))
```

**Cuándo Aplicar:**
- Se ejecuta cada 24 horas
- Se activa si inflación > 2.5%
- Ajusta todas las recompensas de coins globalmente

**Variables:**
- `inflation_current`: Tasa de inflación mensual actual (%)
- `inflation_target`: Inflación objetivo (3.0%)
- `factor_adjustment`: Multiplicador aplicado a todas las recompensas de coins

**Ejemplo de Implementación:**
```javascript
const calculateInflationFactor = () => {
  const currentInflation = getCurrentInflation(); // e.g., 3.5%
  const targetInflation = 3.0;

  if (currentInflation <= targetInflation) {
    return 1.0; // No adjustment needed
  }

  const adjustmentFactor = 1 / (
    1 + Math.log10(1 + currentInflation / targetInflation)
  );

  // Example: 3.5% inflation
  // = 1 / (1 + log10(1 + 3.5/3.0))
  // = 1 / (1 + log10(2.167))
  // = 1 / (1 + 0.336)
  // = 0.748

  return Math.max(0.7, adjustmentFactor); // Floor at 0.7x
};

const getCurrentInflation = () => {
  const supplyLastMonth = getTotalSupply(Date.now() - 30 * DAY);
  const supplyNow = getTotalSupply(Date.now());

  return ((supplyNow - supplyLastMonth) / supplyLastMonth) * 100;
};
```

---

## Rank Progression Algorithm

**Verificación de Requisitos:**
```javascript
const checkRankEligibility = (user, nextRank) => {
  const requirements = RANK_REQUIREMENTS[nextRank];

  return {
    xp: user.xp >= requirements.xp,
    quizzes: user.quizzesCompleted >= requirements.quizzes,
    achievements: user.achievementsUnlocked >= requirements.achievements,
    streak: user.currentStreak >= requirements.streak,
    guildEvents: user.guildEventsParticipated >= (requirements.guildEvents || 0),
    leaderboard: user.leaderboardRank <= (requirements.leaderboardRank || Infinity),
    challenges: user.eliteChallengesCompleted >= (requirements.challenges || 0)
  };
};

const canRankUp = (user) => {
  const nextRank = getNextRank(user.currentRank);
  if (!nextRank) return false;

  const eligibility = checkRankEligibility(user, nextRank);
  return Object.values(eligibility).every(req => req === true);
};
```

---

## Leaderboard Ranking Algorithm

**Cálculo Eficiente de Posición:**
```javascript
// Using PostgreSQL window functions
const getLeaderboardPosition = async (userId, metric = 'xp') => {
  const query = `
    WITH ranked_users AS (
      SELECT
        user_id,
        ${metric},
        RANK() OVER (ORDER BY ${metric} DESC) as rank,
        PERCENT_RANK() OVER (ORDER BY ${metric} DESC) as percentile
      FROM gamification_stats
      WHERE active = true
    )
    SELECT rank, percentile
    FROM ranked_users
    WHERE user_id = $1
  `;

  const result = await db.query(query, [userId]);
  return result.rows[0];
};

// Redis caching for top 100
const getCachedLeaderboard = async (metric, limit = 100) => {
  const cacheKey = `leaderboard:${metric}:${limit}`;
  const cached = await redis.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const leaderboard = await db.query(`
    SELECT user_id, username, ${metric}, rank
    FROM gamification_stats
    WHERE active = true
    ORDER BY ${metric} DESC
    LIMIT $1
  `, [limit]);

  await redis.setex(cacheKey, 60, JSON.stringify(leaderboard.rows));
  return leaderboard.rows;
};
```

---

## Data Schemas

### User Gamification Profile
```typescript
interface UserGamificationProfile {
  userId: string;
  rank: 'Ajaw' | 'Nacom' | 'Nacom' | 'Halach Uinic' | 'K'uk'ulkan';
  rankLevel: number; // 1-5
  prestigeLevel: number;
  xp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  quizzesCompleted: number;
  achievementsUnlocked: number;
  guildId: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}
```

### Achievement Schema
```typescript
interface Achievement {
  id: string;
  name: string;
  nameSpanish: string;
  description: string;
  longDescription: string;
  category: 'PROGRESS' | 'MASTERY' | 'SOCIAL' | 'SECRET';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  hidden: boolean;
  reward: {
    coins: number;
    xp: number;
    badge?: string;
    title?: string;
  };
  requirements: Record<string, any>;
  prerequisiteId?: string;
  iconUrl: string;
  createdAt: Date;
}
```

### Power-up Schema
```typescript
interface PowerUp {
  id: string;
  name: string;
  nameSpanish: string;
  description: string;
  cost: number;
  effect: {
    type: 'TIME_EXTEND' | 'HINT' | 'COIN_MULTIPLIER' | 'XP_BOOST' | 'SHIELD' | 'SKIP' | 'SECOND_CHANCE' | 'DIFFICULTY_REDUCE';
    value: number;
    duration: string;
  };
  restrictions: string;
  cooldown: number; // seconds
  maxPerQuiz: number;
  active: boolean;
  iconUrl: string;
}
```

### Transaction Schema
```typescript
interface CoinTransaction {
  id: string;
  userId: string;
  type: 'EARN' | 'SPEND';
  amount: number;
  source: string;
  description: string;
  metadata: Record<string, any>;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
}
```

### Leaderboard Entry Schema
```typescript
interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  metric: number; // xp, coins, achievements, etc.
  userRank: string;
  prestigeLevel: number;
  streak: number;
  guildName?: string;
  changeFromLastPeriod: number;
  lastUpdated: Date;
}
```

---

## Performance Metrics (p95)

- **Get User Rank:** 45ms
- **Get Leaderboard (cached):** 12ms
- **Get Leaderboard (uncached):** 142ms
- **Award Coins:** 38ms
- **Check Achievements:** 67ms
- **Purchase Power-up:** 52ms

---

## Database Indexes

```sql
-- Leaderboard queries
CREATE INDEX idx_gamification_xp ON gamification_stats(xp DESC, user_id);
CREATE INDEX idx_gamification_weekly ON gamification_stats(xp_this_week DESC) WHERE active = true;

-- Guild rankings
CREATE INDEX idx_guild_points ON guilds(total_points DESC, guild_id);

-- Transactions
CREATE INDEX idx_transactions_user_date ON coin_transactions(user_id, created_at DESC);
```

---

**Última actualización:** 2025-11-01
**Mantenido por:** Backend Team + Game Design Team
