# GAMIF - Missions (Misiones)

**Proyecto:** GAMILIT Platform
**Feature:** Gamification → Missions
**Componente:** Daily/Weekly Missions System
**Versión:** 2.0
**Fecha:** 2025-11-07
**Ubicación:** `apps/frontend/src/features/gamification/missions/`

---

## 📋 Índice

1. [Propósito](#-propósito)
2. [Tipos de Misiones](#-tipos-de-misiones)
3. [Arquitectura](#-arquitectura)
4. [Componentes UI](#-componentes-ui)
5. [Hooks](#-hooks)
6. [API Client](#-api-client)
7. [Flujos Principales](#-flujos-principales)

---

## 🎯 Propósito

Sistema de **misiones temporales** que incentivan actividad diaria/semanal y variedad de acciones.

**Características:**
- **Misiones Diarias:** Reset cada medianoche (5-10 misiones)
- **Misiones Semanales:** Reset cada lunes (3-5 misiones)
- **Misiones Especiales:** Eventos temporales
- **Progreso en tiempo real:** Actualización automática
- **Recompensas atractivas:** 50-500 ML Coins + XP

**Principios:**
- Variedad de objetivos (no solo "completar ejercicios")
- Dificultad balanceada (100% alcanzable en tiempo razonable)
- Recompensas proporcionales al esfuerzo

---

## 📚 Referencias a Documentación Base

### Requerimientos
- **Sistemas Complementarios:** [`docs/01-requerimientos/gamificacion/04-SISTEMAS-COMPLEMENTARIOS.md`](../../../../01-requerimientos/gamificacion/04-SISTEMAS-COMPLEMENTARIOS.md)
  - Misiones diarias/semanales/especiales
  - Tipos de objetivos
  - Recompensas

### Especificaciones Técnicas
- **ADR-004:** [`docs/02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md`](../../../../02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md)
  - Diseño del sistema de misiones

### Documentación Feature
- **Overview:** [README.md](./README.md#4-missions-misiones)

---

## 📜 Tipos de Misiones

### 1. Misiones Diarias

**Reset:** Cada día a medianoche (00:00)
**Cantidad:** 5-10 misiones
**Duración:** 24 horas

**Ejemplos:**
- "Completa 5 ejercicios hoy" → 50 ML + 25 XP
- "Obtén 3 puntuaciones perfectas" → 75 ML + 40 XP
- "Usa un Power-Up" → 30 ML + 15 XP
- "Ayuda a un compañero" → 40 ML + 20 XP

---

### 2. Misiones Semanales

**Reset:** Cada lunes a medianoche
**Cantidad:** 3-5 misiones
**Duración:** 7 días

**Ejemplos:**
- "Completa 20 ejercicios esta semana" → 200 ML + 100 XP
- "Mantén tu racha diaria por 5 días" → 150 ML + 75 XP
- "Alcanza Top 10 en leaderboard de aula" → 300 ML + 150 XP
- "Desbloquea 2 achievements" → 250 ML + 125 XP

---

### 3. Misiones Especiales

**Trigger:** Eventos especiales (aniversarios, fechas culturales)
**Duración:** Variable (1-7 días)
**Cantidad:** 1-3 misiones

**Ejemplos:**
- "Evento: Día de Muertos - Completa módulo de lectura cultural" → 500 ML + 250 XP
- "Aniversario: Invita a 3 amigos" → 400 ML + 200 XP

---

## 🏗️ Arquitectura

### Estructura de Archivos

```
apps/frontend/src/features/gamification/missions/
├── components/
│   ├── MissionCard.tsx             # Card individual de misión
│   ├── MissionsList.tsx            # Lista de misiones
│   ├── MissionProgress.tsx         # Barra de progreso
│   ├── DailyMissions.tsx           # Vista de diarias
│   ├── WeeklyMissions.tsx          # Vista de semanales
│   └── MissionRewards.tsx          # Recompensas al completar
├── types/
│   └── missionsTypes.ts            # Tipos TypeScript
├── hooks/
│   ├── useMissions.ts              # Hook principal
│   └── useMissionProgress.ts       # Hook de progreso
├── api/
│   └── missionsAPI.ts              # API client
└── utils/
    ├── missionHelpers.ts           # Utilidades
    └── missionTemplates.ts         # Templates de misiones
```

---

## 📦 Tipos TypeScript

```typescript
// missions/types/missionsTypes.ts
type MissionType = 'daily' | 'weekly' | 'special';
type MissionStatus = 'active' | 'completed' | 'claimed' | 'expired';
type MissionObjectiveType =
  | 'exercises_completed'
  | 'perfect_scores'
  | 'streak_days'
  | 'achievements_unlocked'
  | 'powerups_used'
  | 'friends_helped'
  | 'leaderboard_rank';

interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  icon: string;
  objectiveType: MissionObjectiveType;
  targetValue: number;              // Valor objetivo (ej: 5 ejercicios)
  currentProgress: number;          // Progreso actual del usuario
  rewards: {
    mlCoins: number;
    xp: number;
  };
  status: MissionStatus;
  startDate: Date;
  endDate: Date;
  isNew?: boolean;                  // Si es nueva (mostrar badge)
}

interface UserMission {
  missionId: string;
  userId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  rewardsClaimed: boolean;
  claimedAt?: Date;
}
```

---

## ⚛️ Componentes UI

### 1. MissionCard

Card visual de una misión individual.

```typescript
// missions/components/MissionCard.tsx
import { Mission } from '../types/missionsTypes';

interface MissionCardProps {
  mission: Mission;
  onClaim?: (missionId: string) => void;
}

export const MissionCard = ({ mission, onClaim }: MissionCardProps) => {
  const progressPercentage = (mission.currentProgress / mission.targetValue) * 100;
  const isCompleted = mission.status === 'completed';
  const isClaimed = mission.status === 'claimed';

  return (
    <div className={`mission-card mission-card--${mission.type}`}>
      {mission.isNew && <div className="new-badge">NUEVA</div>}

      <div className="mission-icon">{mission.icon}</div>

      <div className="mission-content">
        <h3 className="mission-title">{mission.title}</h3>
        <p className="mission-description">{mission.description}</p>

        <div className="mission-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <span className="progress-text">
            {mission.currentProgress} / {mission.targetValue}
          </span>
        </div>

        <div className="mission-rewards">
          <span className="reward">🪙 {mission.rewards.mlCoins} ML</span>
          <span className="reward">⭐ {mission.rewards.xp} XP</span>
        </div>
      </div>

      <div className="mission-action">
        {isClaimed ? (
          <span className="claimed">✓ Reclamado</span>
        ) : isCompleted ? (
          <button onClick={() => onClaim?.(mission.id)} className="btn-claim">
            Reclamar Recompensa
          </button>
        ) : (
          <span className="in-progress">En progreso...</span>
        )}
      </div>
    </div>
  );
};
```

---

### 2. MissionsList

Lista de misiones con filtros.

```typescript
// missions/components/MissionsList.tsx
import { Mission } from '../types/missionsTypes';

interface MissionsListProps {
  missions: Mission[];
  type: 'daily' | 'weekly' | 'special';
  onClaim: (missionId: string) => void;
}

export const MissionsList = ({ missions, type, onClaim }: MissionsListProps) => {
  const activeMissions = missions.filter((m) => m.status === 'active' || m.status === 'completed');
  const completedCount = missions.filter((m) => m.status === 'completed' || m.status === 'claimed').length;

  return (
    <div className="missions-list">
      <div className="missions-header">
        <h2>
          {type === 'daily' && '📅 Misiones Diarias'}
          {type === 'weekly' && '📆 Misiones Semanales'}
          {type === 'special' && '⭐ Misiones Especiales'}
        </h2>
        <span className="missions-count">
          {completedCount} / {missions.length} completadas
        </span>
      </div>

      <div className="missions-grid">
        {activeMissions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} onClaim={onClaim} />
        ))}
      </div>

      {activeMissions.length === 0 && (
        <div className="no-missions">
          <p>No hay misiones {type === 'daily' ? 'diarias' : 'semanales'} disponibles</p>
        </div>
      )}
    </div>
  );
};
```

---

### 3. DailyMissions

Vista de misiones diarias con countdown.

```typescript
// missions/components/DailyMissions.tsx
import { useEffect, useState } from 'react';
import { useMissions } from '../hooks/useMissions';

export const DailyMissions = ({ userId }: { userId: string }) => {
  const { dailyMissions, claimMission, isLoading } = useMissions(userId);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <div className="daily-missions">
      <div className="reset-countdown">
        Resetea en: {timeRemaining}
      </div>

      <MissionsList
        missions={dailyMissions}
        type="daily"
        onClaim={claimMission}
      />
    </div>
  );
};
```

---

## 🪝 Hooks

### 1. useMissions()

Hook principal para acceder a las misiones.

```typescript
// missions/hooks/useMissions.ts
import { useEffect, useState } from 'react';
import { missionsAPI } from '../api/missionsAPI';
import { Mission } from '../types/missionsTypes';

export const useMissions = (userId: string) => {
  const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<Mission[]>([]);
  const [specialMissions, setSpecialMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = async () => {
    setIsLoading(true);

    try {
      const [daily, weekly, special] = await Promise.all([
        missionsAPI.getDailyMissions(userId),
        missionsAPI.getWeeklyMissions(userId),
        missionsAPI.getSpecialMissions(userId),
      ]);

      setDailyMissions(daily);
      setWeeklyMissions(weekly);
      setSpecialMissions(special);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar misiones');
    } finally {
      setIsLoading(false);
    }
  };

  const claimMission = async (missionId: string) => {
    try {
      await missionsAPI.claimReward(missionId);
      await fetchMissions(); // Re-fetch para actualizar estado
    } catch (err) {
      setError('Error al reclamar recompensa');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMissions();
    }
  }, [userId]);

  return {
    dailyMissions,
    weeklyMissions,
    specialMissions,
    claimMission,
    refetch: fetchMissions,
    isLoading,
    error,
  };
};
```

---

### 2. useMissionProgress()

Hook para trackear progreso de una misión específica.

```typescript
// missions/hooks/useMissionProgress.ts
export const useMissionProgress = (mission: Mission) => {
  const progressPercentage = (mission.currentProgress / mission.targetValue) * 100;
  const isCompleted = mission.currentProgress >= mission.targetValue;
  const remaining = mission.targetValue - mission.currentProgress;

  return {
    progressPercentage: Math.min(progressPercentage, 100),
    isCompleted,
    remaining: Math.max(remaining, 0),
    canClaim: isCompleted && mission.status === 'completed',
  };
};
```

---

## 📡 API Client

```typescript
// missions/api/missionsAPI.ts
import { apiClient } from '@/shared/api/apiClient';
import { Mission } from '../types/missionsTypes';

export const missionsAPI = {
  // Obtener misiones diarias del usuario
  async getDailyMissions(userId: string): Promise<Mission[]> {
    const response = await apiClient.get(`/api/gamification/missions/daily/${userId}`);
    return response.data.data;
  },

  // Obtener misiones semanales del usuario
  async getWeeklyMissions(userId: string): Promise<Mission[]> {
    const response = await apiClient.get(`/api/gamification/missions/weekly/${userId}`);
    return response.data.data;
  },

  // Obtener misiones especiales activas
  async getSpecialMissions(userId: string): Promise<Mission[]> {
    const response = await apiClient.get(`/api/gamification/missions/special/${userId}`);
    return response.data.data;
  },

  // Actualizar progreso de una misión
  async updateProgress(missionId: string, progress: number): Promise<void> {
    await apiClient.post(`/api/gamification/missions/${missionId}/progress`, { progress });
  },

  // Reclamar recompensa de misión completada
  async claimReward(missionId: string): Promise<{ mlCoins: number; xp: number }> {
    const response = await apiClient.post(`/api/gamification/missions/${missionId}/claim`);
    return response.data.data;
  },

  // Obtener todas las misiones del usuario
  async getAllMissions(userId: string): Promise<{
    daily: Mission[];
    weekly: Mission[];
    special: Mission[];
  }> {
    const response = await apiClient.get(`/api/gamification/missions/${userId}`);
    return response.data.data;
  },
};
```

### Endpoints Backend

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/gamification/missions/daily/:userId` | Misiones diarias |
| GET | `/api/gamification/missions/weekly/:userId` | Misiones semanales |
| GET | `/api/gamification/missions/special/:userId` | Misiones especiales |
| POST | `/api/gamification/missions/:id/progress` | Actualizar progreso |
| POST | `/api/gamification/missions/:id/claim` | Reclamar recompensa |
| GET | `/api/gamification/missions/:userId` | Todas las misiones |

---

## 🔄 Flujos Principales

### 1. Progreso Automático de Misión

```
Usuario completa acción (ej: completa ejercicio)
  ↓
Backend detecta acción en evento
  ↓
Backend: missions.service.ts
  - Busca misiones activas del usuario relacionadas
  - Incrementa progress de misiones aplicables
  ↓
Si progress >= targetValue:
  - UPDATE mission status = 'completed'
  - Emit WebSocket event 'mission_completed'
  ↓
Frontend recibe WebSocket notification
  ↓
Muestra notificación:
  "¡Misión completada! Reclama tu recompensa"
  ↓
Usuario navega a Misiones
  ↓
Click en "Reclamar Recompensa"
  ↓
POST /api/gamification/missions/:id/claim
  ↓
Backend:
  - INSERT ml_coins_transaction (+recompensa)
  - UPDATE user_stats (ml_coins, xp)
  - UPDATE mission status = 'claimed'
  ↓
Frontend:
  - Actualiza balance de coins
  - Muestra animación de recompensa
  - Actualiza lista de misiones
```

---

### 2. Reset Diario (CRON Job)

```
CRON: Cada día a 00:00
  ↓
Backend ejecuta: missions.resetDaily()
  ↓
Para cada usuario:
  1. Marca misiones diarias anteriores como 'expired'
  2. Genera nuevas misiones diarias desde templates
  3. INSERT new missions con status 'active'
  ↓
Frontend al refrescar:
  - Fetches nuevas misiones
  - Muestra badge "NUEVA" en misiones
```

---

### 3. Templates de Misiones

```typescript
// missions/utils/missionTemplates.ts
export const DAILY_MISSION_TEMPLATES = [
  {
    title: 'Estudiante Dedicado',
    description: 'Completa 5 ejercicios hoy',
    icon: '📚',
    objectiveType: 'exercises_completed',
    targetValue: 5,
    rewards: { mlCoins: 50, xp: 25 },
  },
  {
    title: 'Perfeccionista',
    description: 'Obtén 3 puntuaciones perfectas',
    icon: '💯',
    objectiveType: 'perfect_scores',
    targetValue: 3,
    rewards: { mlCoins: 75, xp: 40 },
  },
  {
    title: 'Estratega',
    description: 'Usa un Power-Up',
    icon: '⚡',
    objectiveType: 'powerups_used',
    targetValue: 1,
    rewards: { mlCoins: 30, xp: 15 },
  },
  {
    title: 'Amigo Solidario',
    description: 'Ayuda a un compañero',
    icon: '🤝',
    objectiveType: 'friends_helped',
    targetValue: 1,
    rewards: { mlCoins: 40, xp: 20 },
  },
];

export const WEEKLY_MISSION_TEMPLATES = [
  {
    title: 'Maratonista del Conocimiento',
    description: 'Completa 20 ejercicios esta semana',
    icon: '🏃',
    objectiveType: 'exercises_completed',
    targetValue: 20,
    rewards: { mlCoins: 200, xp: 100 },
  },
  {
    title: 'Consistencia es Clave',
    description: 'Mantén tu racha diaria por 5 días',
    icon: '🔥',
    objectiveType: 'streak_days',
    targetValue: 5,
    rewards: { mlCoins: 150, xp: 75 },
  },
  {
    title: 'Competidor de Elite',
    description: 'Alcanza Top 10 en leaderboard de aula',
    icon: '🏆',
    objectiveType: 'leaderboard_rank',
    targetValue: 10,
    rewards: { mlCoins: 300, xp: 150 },
  },
];
```

---

## 🐛 Bugs Conocidos

### P2 - Mejoras

⚠️ **Misiones no auto-progresan** - Workaround: Usuarios deben refrescar para ver progreso

**Impacto:** UX subóptima, pero funcional
**Fix estimado:** Sprint 3 (1 semana)
**Solución:** Implementar WebSocket real-time updates

---

## 🧪 Testing

```typescript
// __tests__/useMissions.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMissions } from '../useMissions';
import { missionsAPI } from '../api/missionsAPI';

vi.mock('../api/missionsAPI');

describe('useMissions', () => {
  it('should fetch all missions on mount', async () => {
    const mockDailyMissions = [
      { id: '1', title: 'Test Mission', type: 'daily', currentProgress: 0, targetValue: 5 },
    ];

    vi.mocked(missionsAPI.getDailyMissions).mockResolvedValue(mockDailyMissions);

    const { result } = renderHook(() => useMissions('user-1'));

    await waitFor(() => {
      expect(result.current.dailyMissions).toEqual(mockDailyMissions);
    });
  });

  it('should claim mission reward', async () => {
    const mockReward = { mlCoins: 50, xp: 25 };
    vi.mocked(missionsAPI.claimReward).mockResolvedValue(mockReward);

    const { result } = renderHook(() => useMissions('user-1'));

    await act(async () => {
      await result.current.claimMission('mission-1');
    });

    expect(missionsAPI.claimReward).toHaveBeenCalledWith('mission-1');
  });
});
```

---

## 📊 Métricas

### Engagement

**Objetivos:**
- 70% de usuarios completan al menos 1 misión diaria
- 40% de usuarios completan todas las misiones diarias
- 50% de usuarios completan al menos 1 misión semanal

### Recompensas Distribuidas

```sql
-- Total ML Coins distribuidos por misiones
SELECT
  DATE_TRUNC('week', created_at) as week,
  SUM(amount) as total_coins_from_missions
FROM gamification_system.ml_coins_transactions
WHERE transaction_type = 'mission_reward'
GROUP BY week
ORDER BY week DESC;
```

---

**Mantenedores:** @frontend-team, @gamification-owner
**Última actualización:** 2025-11-07
**Documentos relacionados:** [README.md](./README.md), [GAMIF-Economy.md](./GAMIF-Economy.md), [GAMIF-Social.md](./GAMIF-Social.md)
