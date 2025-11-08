# Trazabilidad: Gamification & Progression Systems

**Metadata RFC-0001**
- **Tipo:** Especificacion Tecnica - Trazabilidad Modular
- **Categoria:** Gamification, Ranks, Missions, Leaderboards, Achievements
- **Version:** 2.0
- **Fecha:** Octubre 2025
- **Stack:** PostgreSQL 16 → Node.js/TypeScript → React/TypeScript
- **Autor:** Sistema GAMILIT
- **Estado:** Activo

---

## Vision General

Este modulo documenta la trazabilidad completa de los sistemas de gamificacion en la plataforma GAMILIT, incluyendo progresion de rangos Maya, misiones diarias, leaderboards y achievements.

**Alcance:** Ranks, Daily Missions, Leaderboards, Achievements

---

## Flujo 4: Progresion de Rangos Maya

**Trigger:** Usuario acumula suficiente XP para subir de rango

### Frontend - Ranks Store
```typescript
// features/gamification/ranks/store/ranksStore.ts
addXP: async (amount, source, description) => {
  const state = get();
  const currentProgress = state.userProgress;

  // Crear evento XP
  const xpEvent: XPEvent = {
    id: crypto.randomUUID(),
    amount,
    source,
    timestamp: new Date(),
    description,
  };

  // Calcular nuevo XP
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

  // Verificar level up
  if (get().checkLevelUp()) {
    get().levelUp();
  }

  // Verificar rank up
  if (get().checkRankUp()) {
    set({ showRankUpModal: true });
  }
},

checkRankUp: () => {
  const { userProgress } = get();
  const nextRank = getNextRank(userProgress.currentRank);

  if (!nextRank) return false;

  const hasEnoughXP = userProgress.totalXP >= nextRank.mlCoinsRequired;
  const hasCompletedModules = userProgress.modulesCompleted >= nextRank.modulesRequired;

  return hasEnoughXP && hasCompletedModules;
},

rankUp: async () => {
  const { userProgress } = get();
  const nextRank = getNextRank(userProgress.currentRank);

  if (!nextRank) return;

  set({ isRankingUp: true });

  try {
    // Llamar al backend
    await ranksAPI.rankUp(userProgress.userId);

    set((state) => ({
      userProgress: {
        ...state.userProgress,
        currentRank: nextRank.id,
        rankMultiplier: nextRank.multiplier,
      },
      isRankingUp: false,
      showRankUpModal: true,
    }));

    // Ganar ML Coins bonus
    useEconomyStore.getState().addCoins(
      nextRank.coinsBonus,
      'rank_promotion'
    );

    toast.success(`¡Ascendiste a ${nextRank.nameSpanish}!`);

  } catch (error) {
    set({ isRankingUp: false, error: error.message });
  }
}
```

### Backend - Gamification Service
```typescript
// backend/modules/gamification/gamification.service.ts
async rankUp(userId: string) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Obtener progreso actual
    const userRanks = await gamificationRepository.getUserRanks(userId, client);
    const currentRank = userRanks.current_rank;

    // 2. Calcular siguiente rango
    const nextRank = this.getNextRank(currentRank);

    if (!nextRank) {
      throw new AppError('Already at max rank', 400);
    }

    // 3. Verificar requisitos
    const stats = await gamificationRepository.getUserStats(userId, client);

    if (stats.total_xp < nextRank.xpRequired) {
      throw new AppError('Insufficient XP', 400);
    }

    if (stats.modules_completed < nextRank.modulesRequired) {
      throw new AppError('Insufficient modules completed', 400);
    }

    // 4. Actualizar rango
    await client.query(
      `UPDATE gamification_system.user_ranks
       SET
         current_rank = $2,
         rank_achieved_at = NOW(),
         updated_at = NOW()
       WHERE user_id = $1`,
      [userId, nextRank.id]
    );

    // 5. Crear registro en historial
    await client.query(
      `INSERT INTO gamification_system.user_ranks_history (
         id, user_id, rank, achieved_at
       ) VALUES (
         gen_random_uuid(), $1, $2, NOW()
       )`,
      [userId, nextRank.id]
    );

    // 6. Otorgar bonus de ML Coins
    await this.addMLCoins({
      userId,
      amount: nextRank.coinsBonus,
      transactionType: 'earned_rank',
      reason: `Rank up to ${nextRank.name}`
    }, client);

    // 7. Desbloquear achievement
    await achievementsService.unlockAchievement({
      userId,
      achievementId: `rank_${nextRank.id}`,
    }, client);

    await client.query('COMMIT');

    // 8. Enviar notificacion
    await notificationsService.createNotification({
      userId,
      type: 'rank_up',
      title: 'Nuevo Rango!',
      message: `Has ascendido a ${nextRank.nameSpanish}`,
      data: { rank: nextRank, bonus: nextRank.coinsBonus }
    });

    return {
      newRank: nextRank,
      bonus: nextRank.coinsBonus
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### Database Schema
```sql
-- gamification_system.user_ranks
CREATE TABLE gamification_system.user_ranks (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE FK -> profiles(id),
  current_rank rango_maya DEFAULT 'nacom',
  rank_achieved_at TIMESTAMPTZ,
  rank_progress_percentage INTEGER CHECK (0-100),
  ml_coins_bonus INTEGER DEFAULT 0,
  modules_required INTEGER,
  xp_required INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Actualizacion
UPDATE gamification_system.user_ranks
SET
  current_rank = 'Nacom',
  rank_achieved_at = NOW(),
  ml_coins_bonus = 100,
  updated_at = NOW()
WHERE user_id = 'user-uuid';
```

---

## Flujo 5: Sistema de Misiones Diarias

**Trigger:** Cron job ejecuta refresh de misiones a las 00:00 hrs

### Backend - Missions Cron Job
```typescript
// backend/modules/gamification/missions/missions.cron.ts
import cron from 'node-cron';
import { missionsService } from './missions.service';

export function startMissionsCronJobs() {
  // Refresh daily missions: Todos los dias a las 00:00 (medianoche)
  cron.schedule('0 0 * * *', async () => {
    console.log('Refreshing daily missions...');
    await missionsService.refreshDailyMissions();
  });

  // Refresh weekly missions: Todos los lunes a las 00:00
  cron.schedule('0 0 * * 1', async () => {
    console.log('Refreshing weekly missions...');
    await missionsService.refreshWeeklyMissions();
  });

  // Check missions progress: Cada hora
  cron.schedule('0 * * * *', async () => {
    await missionsService.checkAllMissionsProgress();
  });

  // Cleanup expired missions: Todos los dias a las 03:00
  cron.schedule('0 3 * * *', async () => {
    await missionsService.cleanupExpiredMissions();
  });
}
```

### Frontend - Missions Display
```typescript
// features/gamification/missions/components/DailyMissionsWidget.tsx
const DailyMissionsWidget = () => {
  const { dailyMissions, claimReward } = useMissionsStore();

  return (
    <div className="missions-widget">
      <h3>Misiones Diarias</h3>
      {dailyMissions.map(mission => (
        <MissionCard
          key={mission.id}
          mission={mission}
          onClaim={() => claimReward(mission.id)}
        />
      ))}
    </div>
  );
};
```

---

## Flujo 7: Leaderboards Globales

**Trigger:** Usuario consulta leaderboard o se actualiza ranking

### Frontend - Leaderboard Component
```typescript
// features/gamification/leaderboards/components/GlobalLeaderboard.tsx
const GlobalLeaderboard = () => {
  const { rankings, userPosition, isLoading } = useLeaderboardStore();

  useEffect(() => {
    useLeaderboardStore.getState().fetchGlobalRankings('weekly');
  }, []);

  return (
    <div className="leaderboard">
      <h2>Ranking Global</h2>

      <div className="user-position">
        <span>Tu posicion: #{userPosition}</span>
      </div>

      <div className="rankings-list">
        {rankings.map((user, index) => (
          <LeaderboardRow
            key={user.id}
            position={index + 1}
            user={user}
            isCurrentUser={user.id === currentUserId}
          />
        ))}
      </div>
    </div>
  );
};
```

### Backend - Leaderboard Service
```typescript
// backend/modules/gamification/leaderboards/leaderboards.service.ts
async getGlobalLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all_time', limit = 100) {
  const timeFilter = this.getTimeFilter(period);

  const result = await pool.query(`
    WITH ranked_users AS (
      SELECT
        p.id,
        p.full_name,
        p.avatar_url,
        us.total_xp,
        us.ml_coins,
        ur.current_rank,
        ROW_NUMBER() OVER (ORDER BY us.total_xp DESC) as position
      FROM auth_management.profiles p
      JOIN gamification_system.user_stats us ON p.id = us.user_id
      JOIN gamification_system.user_ranks ur ON p.id = ur.user_id
      WHERE p.status = 'active'
        AND p.deleted_at IS NULL
        ${timeFilter}
    )
    SELECT * FROM ranked_users
    WHERE position <= $1
    ORDER BY position ASC
  `, [limit]);

  return result.rows;
}
```

---

## Flujo 8: Sistema de Achievements (Logros)

**Trigger:** Usuario completa requisitos para un achievement

### Frontend - Achievements Store
```typescript
// features/gamification/achievements/store/achievementsStore.ts
interface AchievementsState {
  achievements: Achievement[];
  unlockedIds: string[];
  recentlyUnlocked: Achievement[];
  showUnlockModal: boolean;

  fetchAchievements: () => Promise<void>;
  checkUnlock: (achievementId: string) => void;
}

const useAchievementsStore = create<AchievementsState>((set, get) => ({
  achievements: [],
  unlockedIds: [],
  recentlyUnlocked: [],
  showUnlockModal: false,

  fetchAchievements: async () => {
    const data = await achievementsAPI.getAll();
    set({ achievements: data.achievements, unlockedIds: data.unlockedIds });
  },

  checkUnlock: (achievementId) => {
    const achievement = get().achievements.find(a => a.id === achievementId);
    if (!achievement || get().unlockedIds.includes(achievementId)) return;

    set(state => ({
      unlockedIds: [...state.unlockedIds, achievementId],
      recentlyUnlocked: [achievement, ...state.recentlyUnlocked],
      showUnlockModal: true,
    }));
  }
}));
```

### Backend - Achievements Service
```typescript
// backend/modules/gamification/achievements/achievements.service.ts
async checkAndUnlock(userId: string, eventType: string, dbClient?: PoolClient) {
  const client = dbClient || await pool.connect();

  try {
    // Obtener achievements pendientes
    const pending = await this.getPendingAchievements(userId, eventType, client);

    for (const achievement of pending) {
      const meetsRequirements = await this.checkRequirements(
        userId,
        achievement.requirements,
        client
      );

      if (meetsRequirements) {
        await this.unlockAchievement({ userId, achievementId: achievement.id }, client);
      }
    }
  } finally {
    if (!dbClient) client.release();
  }
}

async unlockAchievement(dto: UnlockDto, dbClient?: PoolClient) {
  const client = dbClient || await pool.connect();

  try {
    if (!dbClient) await client.query('BEGIN');

    // Crear registro de desbloqueo
    await client.query(
      `INSERT INTO gamification_system.user_achievements (
         id, user_id, achievement_id, unlocked_at
       ) VALUES (gen_random_uuid(), $1, $2, NOW())`,
      [dto.userId, dto.achievementId]
    );

    // Otorgar recompensas
    const achievement = await this.getAchievementById(dto.achievementId, client);

    if (achievement.reward_ml_coins > 0) {
      await gamificationService.addMLCoins({
        userId: dto.userId,
        amount: achievement.reward_ml_coins,
        transactionType: 'earned_achievement',
        reason: `Achievement unlocked: ${achievement.title}`
      }, client);
    }

    if (!dbClient) await client.query('COMMIT');

    // Enviar notificacion
    await notificationsService.createNotification({
      userId: dto.userId,
      type: 'achievement_unlocked',
      title: 'Logro Desbloqueado!',
      message: achievement.title,
      data: { achievement }
    });

    return achievement;
  } catch (error) {
    if (!dbClient) await client.query('ROLLBACK');
    throw error;
  } finally {
    if (!dbClient) client.release();
  }
}
```

---

## Tipos de Datos

### Ranks Types
```typescript
interface MayaRank {
  id: string;
  name: string;
  nameSpanish: string;
  xpRequired: number;
  modulesRequired: number;
  multiplier: number;
  coinsBonus: number;
  badge: string;
}

interface UserRankProgress {
  userId: string;
  currentRank: string;
  currentXP: number;
  totalXP: number;
  modulesCompleted: number;
  rankMultiplier: number;
}
```

### Missions Types
```typescript
interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  requirements: any;
  rewards: {
    mlCoins: number;
    xp: number;
  };
  expiresAt: Date;
  progress: number;
  maxProgress: number;
  completed: boolean;
}
```

### Achievements Types
```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  requirements: any;
  reward_ml_coins: number;
  reward_xp: number;
  badge_icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

---

## Referencias

- **Documento Padre:** TRAZABILIDAD-COMPLETA.md
- **Relacionado con:** 02-educational-mechanics.md, 03-economy-transactions.md
- **RFC-0001:** Governance Model GAMILIT Platform
