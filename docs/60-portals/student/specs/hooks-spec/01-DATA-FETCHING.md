---
title: Student Portal Hooks — Data Fetching
status: activo
last_updated: "2026-02-28"
---

## Resumen

Este documento especifica los 14 hooks custom del Student Portal ubicados en:
```
apps/frontend/src/apps/student/hooks/
```

| Categoria | Hooks | Descripcion |
|-----------|-------|-------------|
| Data Fetching | 4 | Obtienen datos del backend via API |
| State Management | 2 | Gestionan estado complejo de ejercicios |
| UI/UX | 4 | Responsive, gestos, teclado |
| Gamification | 2 | Achievements y Power-ups |
| Profile (Phase 4) | 2 | Datos de perfil y avatar |

---

## Categoria: Data Fetching

### useDashboardData

**Archivo:** `hooks/useDashboardData.ts`
**Proposito:** Obtiene datos del dashboard del estudiante usando React Query para manejo de cache y estado del servidor.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| - | - | - | No recibe parametros (usa `useAuth` internamente) |

#### Retorno

```typescript
interface UseDashboardDataReturn {
  coins: MLCoinsData | null;
  rank: RankData;
  achievements: AchievementData[];
  progress: ProgressData | null;
  recentAchievements: AchievementData[];
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
}

interface MLCoinsData {
  balance: number;
  todayEarned: number;
  todaySpent: number;
  recentTransactions: {
    id: string;
    type: 'earned' | 'spent';
    amount: number;
    description: string;
    timestamp: string;
  }[];
}

interface RankData {
  currentRank: string;
  currentXP: number;
  nextRankXP: number;
  multiplier: number;
  rankIcon: string;
  progress: number;
}

interface AchievementData {
  id: string;
  name: string;
  title?: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category?: string;
  icon: string;
  unlocked: boolean;
  isUnlocked?: boolean;
  unlockedAt?: string;
  progress?: number;
  required?: number;
  mlCoinsReward?: number;
  xpReward?: number;
  rewards?: { ml_coins?: number; xp?: number };
}

interface ProgressData {
  totalModules: number;
  completedModules: number;
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
}
```

#### Ejemplo de uso

```typescript
const {
  coins,
  rank,
  achievements,
  progress,
  loading,
  error,
  refresh
} = useDashboardData();

if (loading) return <Spinner />;
if (error) return <ErrorMessage message={error} />;

return (
  <Dashboard
    mlCoins={coins?.balance ?? 0}
    currentRank={rank.currentRank}
    progressPercent={rank.progress}
  />
);
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/gamification/users/:userId/ml-coins` | Balance y transacciones de ML Coins |
| GET | `/api/v1/gamification/ranks/current` | Rango actual del sistema |
| GET | `/api/v1/gamification/ranks/users/:userId/rank-progress` | Progreso hacia siguiente rango |
| GET | `/api/v1/gamification/users/:userId/achievements` | Achievements del usuario |
| GET | `/api/v1/progress/users/:userId/summary` | Resumen de progreso educativo |

#### Dependencias

- `@tanstack/react-query` - Manejo de cache y estado del servidor
- `useAuth` - Obtiene userId del usuario autenticado
- `apiClient` - Cliente HTTP centralizado

#### Query Keys

```typescript
export const dashboardKeys = {
  all: ['dashboard'] as const,
  user: (userId: string) => [...dashboardKeys.all, userId] as const,
  coins: (userId: string) => [...dashboardKeys.user(userId), 'coins'] as const,
  rank: (userId: string) => [...dashboardKeys.user(userId), 'rank'] as const,
  achievements: (userId: string) => [...dashboardKeys.user(userId), 'achievements'] as const,
  progress: (userId: string) => [...dashboardKeys.user(userId), 'progress'] as const,
};
```

---

### useUserClassroom

**Archivo:** `hooks/useUserClassroom.ts`
**Proposito:** Obtiene la membresia de aula principal del usuario para filtrado de contenido.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| userId | `string \| undefined` | Si | ID del usuario |

#### Retorno

```typescript
interface UseUserClassroomReturn {
  classroomId: string | null;
  classroomMember: ClassroomMember | null;
  loading: boolean;
  error: Error | null;
}

// ClassroomMember viene de @/shared/types/social.types
interface ClassroomMember {
  id: string;
  user_id: string;
  classroom_id: string;
  role: 'student' | 'teacher' | 'admin';
  joined_at: string;
  // ... otros campos
}
```

#### Ejemplo de uso

```typescript
const { user } = useAuth();
const { classroomId, loading, error } = useUserClassroom(user?.id);

// Usar classroomId para filtrar modulos
const { modules } = useUserModules({ classroomId });
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/social/classroom-members/users/:userId` | Membresias del usuario |

#### Dependencias

- `apiClient` - Cliente HTTP centralizado
- `ClassroomMember` type de `@/shared/types/social.types`

#### Notas importantes

- Los usuarios pueden pertenecer a multiples aulas (relacion M:N)
- Este hook retorna la primera aula activa como "principal"
- El `classroom_id` NO esta en el objeto User directamente

---

### useUserModules

**Archivo:** `hooks/useUserModules.ts`
**Proposito:** Obtiene modulos del usuario con su progreso usando React Query.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| params.classroomId | `string \| undefined` | No | Filtrar por aula |

#### Retorno

```typescript
interface UseUserModulesReturn {
  modules: UserModuleData[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

interface UserModuleData {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'in_progress' | 'available' | 'locked' | 'backlog';
  progress: number; // 0-100
  totalExercises: number;
  completedExercises: number;
  estimatedTime: number; // minutos
  xpReward: number;
  icon: string;
  category: string;
  mlCoinsReward?: number;
}
```

#### Ejemplo de uso

```typescript
const { classroomId } = useUserClassroom(userId);
const { modules, loading, refresh } = useUserModules({ classroomId });

return (
  <ModuleList
    modules={modules.filter(m => m.status !== 'locked')}
    onRefresh={refresh}
  />
);
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/educational/users/:userId/modules` | Modulos con progreso |

#### Dependencias

- `@tanstack/react-query` - Manejo de cache
- `useAuth` - Usuario autenticado
- `getUserModules` de `@/services/api/educationalAPI`

#### Query Keys

```typescript
export const userModulesKeys = {
  all: ['userModules'] as const,
  user: (userId: string) => [...userModulesKeys.all, userId] as const,
  byClassroom: (userId: string, classroomId?: string) =>
    [...userModulesKeys.user(userId), 'classroom', classroomId ?? 'all'] as const,
};
```

---

### useRecentActivities

**Archivo:** `hooks/useRecentActivities.ts`
**Proposito:** Obtiene las actividades recientes del usuario para el feed de actividad.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| limit | `number` | No | Maximo de actividades (default: 10) |

#### Retorno

```typescript
interface UseRecentActivitiesReturn {
  activities: ActivityData[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

interface ActivityData {
  id: string;
  type: 'exercise_completed' | 'achievement_unlocked' | 'streak_milestone' | 'level_up' | 'module_completed';
  title: string;
  description: string;
  timestamp: Date;
  metadata: {
    xp?: number;
    ml?: number;
    exerciseName?: string;
    moduleName?: string;
    achievementName?: string;
    streakDays?: number;
    score?: number;
  };
  category: string;
}
```

#### Ejemplo de uso

```typescript
const { activities, loading, refresh } = useRecentActivities(5);

return (
  <ActivityFeed>
    {activities.map(activity => (
      <ActivityCard key={activity.id} activity={activity} />
    ))}
  </ActivityFeed>
);
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/educational/users/:userId/activities` | Actividades recientes |

#### Dependencias

- `useAuth` - Usuario autenticado
- `getUserActivities` de `@/services/api/educationalAPI`

---
