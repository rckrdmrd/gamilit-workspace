# GAMIF - Social Features

**Proyecto:** GAMILIT Platform
**Feature:** Gamification → Social
**Componentes:** Achievements, Leaderboards, PowerUps, Friends, Guilds
**Versión:** 2.0
**Fecha:** 2025-11-07
**Ubicación:** `apps/frontend/src/features/gamification/social/`

---

## 📋 Índice

1. [Propósito](#-propósito)
2. [Subsistemas](#-subsistemas)
3. [Achievements](#1-achievements-logros)
4. [Leaderboards](#2-leaderboards)
5. [PowerUps](#3-powerups)
6. [Friends](#4-friends)
7. [Guilds](#5-guilds)

---

## 🎯 Propósito

Conjunto de features **sociales y de engagement** que fomentan interacción, competencia sana y uso estratégico de recursos.

**Subsistemas:**
- **Achievements:** 50+ logros en 7 categorías
- **Leaderboards:** Rankings por contexto (global, escuela, aula, semanal)
- **PowerUps:** 3 comodines estratégicos (Pistas, Visión Lectora, Segunda Oportunidad)
- **Friends:** Sistema de amigos
- **Guilds:** Grupos colaborativos (futuro)

---

## 📚 Referencias a Documentación Base

### Requerimientos
- **Achievements:** [`docs/01-requerimientos/gamificacion/03-ACHIEVEMENTS.md`](../../../../01-requerimientos/gamificacion/03-ACHIEVEMENTS.md)
- **Sistemas Complementarios:** [`docs/01-requerimientos/gamificacion/04-SISTEMAS-COMPLEMENTARIOS.md`](../../../../01-requerimientos/gamificacion/04-SISTEMAS-COMPLEMENTARIOS.md)

### Especificaciones Técnicas
- **ADR-004:** [`docs/02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md`](../../../../02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md)
- **Tipos Compartidos:** [`docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md`](../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md)

---

## 🏗️ Subsistemas

```
social/
├── components/
│   ├── Achievements/
│   │   ├── AchievementCard.tsx
│   │   ├── AchievementGrid.tsx
│   │   ├── AchievementNotification.tsx
│   │   └── AchievementProgress.tsx
│   ├── Leaderboards/
│   │   ├── Leaderboard.tsx
│   │   ├── LeaderboardEntry.tsx
│   │   ├── LeaderboardFilters.tsx
│   │   └── LeaderboardWidget.tsx
│   ├── PowerUps/
│   │   ├── PowerUpCard.tsx
│   │   ├── PowerUpShop.tsx
│   │   ├── PowerUpInventory.tsx
│   │   └── PowerUpUsage.tsx
│   ├── Friends/
│   │   ├── FriendsList.tsx
│   │   └── AddFriend.tsx
│   └── Guilds/
│       ├── GuildCard.tsx
│       └── GuildLeaderboard.tsx
├── api/
│   ├── achievementsAPI.ts
│   ├── leaderboardsAPI.ts
│   ├── powerupsAPI.ts
│   └── friendsAPI.ts
├── store/
│   ├── achievementsStore.ts
│   ├── leaderboardsStore.ts
│   ├── powerupsStore.ts
│   └── friendsStore.ts
├── hooks/
│   ├── useAchievements.ts
│   ├── useLeaderboard.ts
│   ├── usePowerUps.ts
│   └── useFriends.ts
└── types/
    ├── achievementsTypes.ts
    ├── leaderboardTypes.ts
    └── powerupsTypes.ts
```

---

## 1. Achievements (Logros)

### 🎯 Propósito

Sistema de **50+ logros** en 7 categorías que incentivan exploración y dominio del contenido.

### Tipos

```typescript
// social/types/achievementsTypes.ts
type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
type AchievementCategory = 'progress' | 'streak' | 'completion' | 'mastery' | 'exploration' | 'social' | 'special';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: AchievementRarity;
  mlCoinsReward: number;
  xpReward: number;
  conditions?: Record<string, any>;
  isSecret: boolean;
  createdAt: Date;
}

interface UserAchievement {
  achievementId: string;
  userId: string;
  progress: number;                  // 0-100
  maxProgress: number;
  isCompleted: boolean;
  completedAt?: Date;
  rewardsClaimed: boolean;
}
```

### Store

```typescript
// social/store/achievementsStore.ts
interface AchievementsState {
  achievements: Achievement[];             // Todos los achievements disponibles
  userAchievements: UserAchievement[];     // Progress del usuario
  unlockedCount: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;

  fetchAchievements: () => Promise<void>;
  fetchUserAchievements: (userId: string) => Promise<void>;
  claimReward: (achievementId: string) => Promise<void>;
}
```

### Componentes

#### AchievementCard

```typescript
// social/components/Achievements/AchievementCard.tsx
interface AchievementCardProps {
  achievement: Achievement;
  userProgress?: UserAchievement;
  onClaim?: (id: string) => void;
}

export const AchievementCard = ({ achievement, userProgress }: Props) => {
  const isCompleted = userProgress?.isCompleted || false;
  const progress = userProgress?.progress || 0;

  return (
    <div className={`achievement-card achievement-card--${achievement.rarity}`}>
      <div className="achievement-icon">{achievement.icon}</div>

      <div className="achievement-info">
        <h3 className="achievement-name">{achievement.name}</h3>
        <p className="achievement-description">{achievement.description}</p>

        {!isCompleted && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <span className="progress-text">{progress}%</span>
          </div>
        )}

        <div className="achievement-rewards">
          <span>🪙 {achievement.mlCoinsReward} ML</span>
          <span>⭐ {achievement.xpReward} XP</span>
        </div>
      </div>

      {isCompleted && <div className="completed-badge">✓ Completado</div>}
    </div>
  );
};
```

#### AchievementNotification

```typescript
// social/components/Achievements/AchievementNotification.tsx
import { motion } from 'framer-motion';

export const AchievementNotification = ({ achievement }: { achievement: Achievement }) => {
  return (
    <motion.div
      className="achievement-notification"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
    >
      <div className="notification-content">
        <span className="achievement-icon">{achievement.icon}</span>
        <div className="notification-text">
          <h4>¡Logro Desbloqueado!</h4>
          <p>{achievement.name}</p>
        </div>
        <div className="notification-rewards">
          +{achievement.mlCoinsReward} ML
        </div>
      </div>
    </motion.div>
  );
};
```

### API Client

```typescript
// social/api/achievementsAPI.ts
export const achievementsAPI = {
  // Obtener todos los achievements
  async getAll(): Promise<Achievement[]> {
    const response = await apiClient.get('/api/gamification/achievements');
    return response.data.data;
  },

  // Obtener achievements del usuario
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const response = await apiClient.get(`/api/gamification/achievements/${userId}`);
    return response.data.data;
  },

  // Reclamar recompensa
  async claimReward(achievementId: string): Promise<void> {
    await apiClient.post(`/api/gamification/achievements/${achievementId}/claim`);
  },
};
```

### Hook

```typescript
// social/hooks/useAchievements.ts
export const useAchievements = (userId: string) => {
  const achievements = useAchievementsStore((state) => state.achievements);
  const userAchievements = useAchievementsStore((state) => state.userAchievements);
  const fetchUserAchievements = useAchievementsStore((state) => state.fetchUserAchievements);

  useEffect(() => {
    if (userId) {
      fetchUserAchievements(userId);
    }
  }, [userId]);

  const completed = userAchievements.filter((ua) => ua.isCompleted);
  const inProgress = userAchievements.filter((ua) => !ua.isCompleted && ua.progress > 0);

  return {
    achievements,
    completed,
    inProgress,
    unlockedCount: completed.length,
    totalCount: achievements.length,
  };
};
```

### Bug Conocido (P0)

⚠️ **Auto-detection no funciona** - Solo 2 achievements hardcoded (`first_10_exercises`, `perfectionist`)

**Workaround temporal:** Mock data en frontend
**Fix estimado:** Sprint 0 (3 días)

**Referencia:** [`03-ACHIEVEMENTS.md`](../../../../01-requerimientos/gamificacion/03-ACHIEVEMENTS.md#3-estado-actual---bug-crítico)

---

## 2. Leaderboards

### 🎯 Propósito

**Rankings contextuales** que fomentan competencia sana entre estudiantes.

### Tipos

```typescript
// social/types/leaderboardTypes.ts
type LeaderboardType = 'global' | 'school' | 'classroom' | 'weekly';
type LeaderboardCriteria = 'total_xp' | 'ml_coins' | 'exercises_completed' | 'current_streak';

interface LeaderboardEntry {
  userId: string;
  rank: number;
  displayName: string;
  avatarUrl?: string;
  value: number;                     // Score según criteria
  currentRank: MayaRank;
  change?: number;                   // Cambio de posición (+2, -1, etc.)
}

interface Leaderboard {
  id: string;
  type: LeaderboardType;
  criteria: LeaderboardCriteria;
  entries: LeaderboardEntry[];
  period?: { start: Date; end: Date };
  lastUpdated: Date;
}
```

### Store

```typescript
// social/store/leaderboardsStore.ts
interface LeaderboardsState {
  currentLeaderboard: Leaderboard | null;
  leaderboardType: LeaderboardType;
  criteria: LeaderboardCriteria;
  myPosition: number | null;
  isLoading: boolean;

  fetchLeaderboard: (type: LeaderboardType, criteria: LeaderboardCriteria) => Promise<void>;
  setLeaderboardType: (type: LeaderboardType) => void;
  setCriteria: (criteria: LeaderboardCriteria) => void;
}
```

### Componentes

#### Leaderboard

```typescript
// social/components/Leaderboards/Leaderboard.tsx
export const Leaderboard = ({ type, criteria }: Props) => {
  const { entries, myPosition, isLoading } = useLeaderboard(type, criteria);

  return (
    <div className="leaderboard">
      <LeaderboardFilters type={type} criteria={criteria} />

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="leaderboard-entries">
          {entries.map((entry, index) => (
            <LeaderboardEntry
              key={entry.userId}
              entry={entry}
              isCurrentUser={index + 1 === myPosition}
            />
          ))}
        </div>
      )}

      {myPosition && myPosition > 10 && (
        <div className="my-position">
          <span>Tu posición: #{myPosition}</span>
        </div>
      )}
    </div>
  );
};
```

#### LeaderboardEntry

```typescript
// social/components/Leaderboards/LeaderboardEntry.tsx
export const LeaderboardEntry = ({ entry, isCurrentUser }: Props) => {
  const medalEmoji = entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : '';

  return (
    <div className={`leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
      <div className="rank">
        {medalEmoji || `#${entry.rank}`}
      </div>

      <div className="user-info">
        <img src={entry.avatarUrl || '/default-avatar.png'} alt={entry.displayName} />
        <span className="name">{entry.displayName}</span>
        <RankBadge rank={entry.currentRank} size="small" />
      </div>

      <div className="score">
        {entry.value.toLocaleString()}
      </div>

      {entry.change && (
        <div className={`change ${entry.change > 0 ? 'positive' : 'negative'}`}>
          {entry.change > 0 ? '+' : ''}{entry.change}
        </div>
      )}
    </div>
  );
};
```

### API Client

```typescript
// social/api/leaderboardsAPI.ts
export const leaderboardsAPI = {
  async getGlobal(criteria: LeaderboardCriteria, limit = 100): Promise<Leaderboard> {
    const response = await apiClient.get('/api/gamification/leaderboard/global', {
      params: { criteria, limit }
    });
    return response.data.data;
  },

  async getClassroom(classroomId: string, criteria: LeaderboardCriteria): Promise<Leaderboard> {
    const response = await apiClient.get(`/api/gamification/leaderboard/classroom/${classroomId}`, {
      params: { criteria }
    });
    return response.data.data;
  },

  async getWeekly(criteria: LeaderboardCriteria): Promise<Leaderboard> {
    const response = await apiClient.get('/api/gamification/leaderboard/weekly', {
      params: { criteria }
    });
    return response.data.data;
  },

  async getMyPosition(userId: string, type: LeaderboardType): Promise<number> {
    const response = await apiClient.get(`/api/gamification/leaderboard/position/${userId}`, {
      params: { type }
    });
    return response.data.data.position;
  },
};
```

---

## 3. PowerUps

### 🎯 Propósito

**Comodines estratégicos** que ayudan sin regalar respuestas (principio "Help, not cheat").

### Tipos de PowerUps

| PowerUp | Costo | Efecto | Penalización | Límite |
|---------|-------|--------|--------------|--------|
| **Pistas (Hints)** | 15 ML | Revela pista sobre ejercicio | -10% XP/Coins | 3/ejercicio |
| **Visión Lectora** | 25 ML | Resalta palabras clave | -5% XP | 1/ejercicio |
| **Segunda Oportunidad** | 40 ML | Reintentar sin penalización | -15% XP/Coins | 2/día |

### Tipos TypeScript

```typescript
// social/types/powerupsTypes.ts
type PowerUpType = 'pistas' | 'vision_lectora' | 'segunda_oportunidad';

interface PowerUp {
  id: string;
  type: PowerUpType;
  name: string;
  description: string;
  cost: number;                      // ML Coins
  icon: string;
  penalty: number;                   // Penalización en %
  cooldown?: number;                 // En segundos
  maxPerExercise?: number;
  maxPerDay?: number;
}

interface PowerUpInventory {
  userId: string;
  pistasAvailable: number;
  pistasUsedTotal: number;
  visionLectoraAvailable: number;
  visionLectoraUsedTotal: number;
  segundaOportunidadAvailable: number;
  segundaOportunidadUsedTotal: number;
  lastPurchaseAt?: Date;
}
```

### Store

```typescript
// social/store/powerupsStore.ts
interface PowerUpsState {
  inventory: PowerUpInventory | null;
  availablePowerUps: PowerUp[];
  isLoading: boolean;

  fetchInventory: (userId: string) => Promise<void>;
  purchasePowerUp: (type: PowerUpType, quantity: number) => Promise<void>;
  usePowerUp: (type: PowerUpType, exerciseId: string) => Promise<void>;
}
```

### Componentes

#### PowerUpShop

```typescript
// social/components/PowerUps/PowerUpShop.tsx
export const PowerUpShop = () => {
  const { availablePowerUps, purchasePowerUp } = usePowerUps();
  const { balance } = useCoins();

  return (
    <div className="powerup-shop">
      <h2>Tienda de Power-Ups</h2>

      <div className="powerups-grid">
        {availablePowerUps.map((powerup) => (
          <PowerUpCard
            key={powerup.id}
            powerup={powerup}
            onPurchase={() => purchasePowerUp(powerup.type, 1)}
            canAfford={balance >= powerup.cost}
          />
        ))}
      </div>
    </div>
  );
};
```

#### PowerUpCard

```typescript
// social/components/PowerUps/PowerUpCard.tsx
export const PowerUpCard = ({ powerup, onPurchase, canAfford }: Props) => {
  return (
    <div className="powerup-card">
      <div className="powerup-icon">{powerup.icon}</div>

      <h3>{powerup.name}</h3>
      <p>{powerup.description}</p>

      <div className="powerup-details">
        <span className="cost">🪙 {powerup.cost} ML</span>
        <span className="penalty">Penalización: -{powerup.penalty}%</span>
      </div>

      <button
        onClick={onPurchase}
        disabled={!canAfford}
        className={canAfford ? 'btn-primary' : 'btn-disabled'}
      >
        {canAfford ? 'Comprar' : 'ML Coins insuficientes'}
      </button>
    </div>
  );
};
```

#### PowerUpUsage (Durante Ejercicio)

```typescript
// social/components/PowerUps/PowerUpUsage.tsx
export const PowerUpUsage = ({ exerciseId }: { exerciseId: string }) => {
  const { inventory, usePowerUp } = usePowerUps();

  const handleUsePista = async () => {
    if (inventory.pistasAvailable > 0) {
      await usePowerUp('pistas', exerciseId);
      // Mostrar hint en UI
    }
  };

  return (
    <div className="powerup-usage">
      <button
        onClick={handleUsePista}
        disabled={inventory.pistasAvailable === 0}
        className="powerup-btn"
      >
        💡 Pista ({inventory.pistasAvailable} disponibles)
      </button>

      <button
        onClick={() => usePowerUp('vision_lectora', exerciseId)}
        disabled={inventory.visionLectoraAvailable === 0}
        className="powerup-btn"
      >
        👁️ Visión Lectora ({inventory.visionLectoraAvailable})
      </button>
    </div>
  );
};
```

### API Client

```typescript
// social/api/powerupsAPI.ts
export const powerupsAPI = {
  async getInventory(userId: string): Promise<PowerUpInventory> {
    const response = await apiClient.get(`/api/gamification/powerups/${userId}`);
    return response.data.data;
  },

  async purchase(type: PowerUpType, quantity: number): Promise<void> {
    await apiClient.post('/api/gamification/powerups/purchase', { type, quantity });
  },

  async use(type: PowerUpType, exerciseId: string): Promise<{ hint?: string }> {
    const response = await apiClient.post('/api/gamification/powerups/use', {
      type,
      exerciseId
    });
    return response.data.data;
  },
};
```

### Flujo de Uso

```
Usuario está en ejercicio
  ↓
Click en botón "Pista"
  ↓
Verifica inventory.pistasAvailable > 0
  ↓
POST /api/gamification/powerups/use
  {
    type: 'pistas',
    exerciseId: 'exercise-123'
  }
  ↓
Backend:
  - Decrementa inventory.pistasAvailable
  - Incrementa inventory.pistasUsedTotal
  - Genera hint contextual
  - Marca penalización en attempt
  ↓
Frontend:
  - Actualiza inventory
  - Muestra hint en UI
  - Aplica -10% a recompensa final
```

**Referencia:** [`ADR-004`](../../../../02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md#4-powerups-3-tipos)

---

## 4. Friends

### 🎯 Propósito

Sistema de **amigos** para interacción social entre estudiantes.

### Tipos

```typescript
interface Friend {
  id: string;
  userId: string;
  friendUserId: string;
  friendName: string;
  friendAvatar?: string;
  friendRank: MayaRank;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
}
```

### Componente

```typescript
// social/components/Friends/FriendsList.tsx
export const FriendsList = ({ userId }: { userId: string }) => {
  const { friends, isLoading } = useFriends(userId);

  return (
    <div className="friends-list">
      <h3>Mis Amigos ({friends.length})</h3>

      {friends.map((friend) => (
        <div key={friend.id} className="friend-card">
          <img src={friend.friendAvatar} alt={friend.friendName} />
          <div className="friend-info">
            <span className="name">{friend.friendName}</span>
            <RankBadge rank={friend.friendRank} size="small" />
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## 5. Guilds

### 🎯 Propósito

**Grupos colaborativos** de estudiantes (feature futura).

**Estado:** 📋 Backlog (no implementado en MVP)

**Planeado para:** v1.2 (6 meses post-lanzamiento)

**Características planeadas:**
- Crear/unirse a guilds (máx 20 miembros)
- Guild leaderboard
- Guild missions
- Recompensas colectivas

---

## 📊 Resumen

| Subsistema | Componentes | APIs | Stores | Estado |
|------------|-------------|------|--------|--------|
| **Achievements** | 4 | 3 | 1 | ⚠️ Auto-detection broken (P0) |
| **Leaderboards** | 3 | 4 | 1 | ✅ Operacional 90% |
| **PowerUps** | 4 | 3 | 1 | ✅ Operacional 100% |
| **Friends** | 2 | 2 | 1 | ✅ Operacional 80% |
| **Guilds** | - | - | - | 📋 Backlog |

---

**Mantenedores:** @frontend-team, @gamification-owner
**Última actualización:** 2025-11-07
**Documentos relacionados:** [README.md](./README.md), [GAMIF-Economy.md](./GAMIF-Economy.md), [GAMIF-Ranks.md](./GAMIF-Ranks.md)
