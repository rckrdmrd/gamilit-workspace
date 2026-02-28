---
title: Portal Student - Hooks, APIs y Estado
status: activo
last_updated: "2026-02-28"
---

# Portal Student - Hooks, APIs y Estado

[<-- Volver al Hub](../PORTAL-STUDENT-GUIDE.md) | Anterior: [02-MODULOS-NAVEGACION.md](./02-MODULOS-NAVEGACION.md) | Siguiente: [04-FEATURES.md](./04-FEATURES.md)

---

## 5. Hooks Principales

### 5.1 useDashboardData

**Propósito:** Fetches aggregated dashboard data con React Query.

**Endpoints llamados (en paralelo):**

```typescript
GET /api/v1/gamification/users/:userId/ml-coins
GET /api/v1/gamification/ranks/current
GET /api/v1/gamification/ranks/users/:userId/rank-progress
GET /api/v1/gamification/users/:userId/achievements
GET /api/v1/progress/users/:userId
```

**Return value:**

```typescript
{
  coins: MLCoinsData | null,
  rank: RankData | null,
  achievements: AchievementData[],
  progress: ProgressData | null,
  recentAchievements: AchievementData[],
  loading: boolean,
  error: string | null,
  isRefreshing: boolean,
  refresh: () => Promise<void>
}
```

**Configuración React Query:**

- **staleTime:** 5 minutos
- **gcTime:** 10 minutos
- **refetchOnWindowFocus:** true
- **retry:** 2 veces con backoff exponencial

### 5.2 useUserModules

**Propósito:** Fetches módulos educativos del usuario, opcionalmente filtrados por classroom.

**API:**

```typescript
GET /api/v1/educational/modules
GET /api/v1/educational/modules/:classroomId/assigned
```

**Return value:**

```typescript
{
  modules: Module[],
  loading: boolean,
  error: string | null
}
```

### 5.3 useExerciseState

**Propósito:** Gestiona estado local de ejercicio en progreso.

**State:**

```typescript
{
  currentStep: number,
  totalSteps: number,
  score: number,
  answers: Record<string, any>,
  hintsUsed: number,
  timeSpent: number,
  powerupsUsed: string[],
  completed: boolean
}
```

**Métodos:**

- `updateProgress(progress: Partial<ExerciseProgress>)`
- `submitExercise()`
- `resetExercise()`

### 5.4 useExerciseAutoSave

**Propósito:** Auto-save de progreso cada 30s mientras ejercicio no completado.

**API:**

```typescript
POST /api/v1/progress/exercises/:exerciseId/save
{
  progress: ExerciseProgress,
  answers: any
}
```

**Configuración:**

```typescript
useExerciseAutoSave(exerciseId, exerciseState, {
  interval: 30000, // 30 segundos
  enabled: !exerciseState.completed,
});
```

### 5.5 useExercisePowerUps

**Propósito:** Gestión de power-ups activos durante ejercicio.

**API:**

```typescript
POST /api/v1/gamification/comodines/use
{
  comodinId: string,
  exerciseId: string
}
```

**Métodos:**

- `usePowerUp(powerUpId: string)`
- `getActivePowerUps()`
- `checkPowerUpActive(type: string)`

---

## 6. APIs del Portal Student

### 6.1 Endpoints Principales

| Módulo | Método | Endpoint | Descripción | Guard |
|--------|--------|----------|-------------|-------|
| **Progress** |
| | GET | `/progress/users/:userId` | Progreso general del usuario | JwtAuth |
| | GET | `/progress/users/:userId/recent-activities` | Últimas actividades | JwtAuth |
| | GET | `/progress/modules/:moduleId/progress` | Progreso en módulo | JwtAuth |
| | POST | `/progress/exercises/:exerciseId/save` | Auto-save de ejercicio | JwtAuth |
| | POST | `/progress/exercises/:exerciseId/submit` | Enviar ejercicio completo | JwtAuth |
| **Gamification** |
| | GET | `/gamification/users/:userId/ml-coins` | Balance de ML Coins | JwtAuth |
| | GET | `/gamification/users/:userId/ml-coins/transactions` | Historial de transacciones | JwtAuth |
| | GET | `/gamification/ranks/current` | Ranks disponibles | JwtAuth |
| | GET | `/gamification/ranks/users/:userId/rank-progress` | Progreso de rank | JwtAuth |
| | GET | `/gamification/achievements` | Todos los achievements | JwtAuth |
| | GET | `/gamification/users/:userId/achievements` | Achievements del usuario | JwtAuth |
| | GET | `/gamification/missions/active` | Misiones activas | JwtAuth |
| | POST | `/gamification/missions/:missionId/claim` | Reclamar recompensa | JwtAuth |
| | GET | `/gamification/leaderboard/global` | Ranking global | JwtAuth |
| | GET | `/gamification/leaderboard/classroom/:id` | Ranking del aula | JwtAuth |
| | GET | `/gamification/shop/items` | Items de la tienda | JwtAuth |
| | POST | `/gamification/shop/purchase` | Comprar item | JwtAuth |
| | POST | `/gamification/comodines/use` | Usar power-up | JwtAuth |
| **Educational** |
| | GET | `/educational/modules` | Lista de módulos | JwtAuth |
| | GET | `/educational/modules/:id` | Detalle de módulo | JwtAuth |
| | GET | `/educational/modules/:id/exercises` | Ejercicios del módulo | JwtAuth |
| | GET | `/educational/exercises/:id` | Detalle de ejercicio | JwtAuth |
| | GET | `/educational/exercises/:id/hints` | Pistas disponibles | JwtAuth |
| **Social** |
| | GET | `/social/friendships` | Lista de amigos | JwtAuth |
| | POST | `/social/friendships` | Enviar solicitud de amistad | JwtAuth |
| | GET | `/social/teams/:id` | Detalle de guild | JwtAuth |

### 6.2 Frontend API Services

```
services/api/
├── educationalAPI.ts          # Módulos y ejercicios
├── progressAPI.ts             # Progreso y submissions
├── gamificationAPI.ts         # Gamificación general (incluye misiones, REC-003)
├── ranksAPI.ts                # Sistema de ranks
├── achievementsAPI.ts         # Achievements
├── economyAPI.ts              # ML Coins y shop
├── socialAPI.ts               # Amigos, guilds, leaderboard
└── apiClient.ts               # Axios instance configurado

> **Nota:** `missionsAPI.ts` fue eliminado en REC-003 (2026-02-18). Las misiones se consumen
> ahora via `gamificationAPI.ts` y el hook `useMissions`.
```

---

## 7. Estado y Stores (Zustand)

### 7.1 Stores Principales

```typescript
// Auth Store
authStore:
  - user: User | null
  - isAuthenticated: boolean
  - login()
  - logout()
  - register()

// Ranks Store
ranksStore:
  - userProgress: UserRankProgress
  - multiplierBreakdown: MultiplierData
  - prestigeProgress: PrestigeData
  - progressionHistory: ProgressEvent[]
  - fetchUserProgress()
  - showRankUpModal: boolean
  - closeRankUpModal()

// Economy Store
economyStore:
  - balance: MLCoinsBalance
  - transactions: Transaction[]
  - fetchBalance()
  - addTransaction()

// Achievements Store
achievementsStore:
  - achievements: Achievement[]
  - userAchievements: UserAchievement[]
  - stats: AchievementStats
  - fetchAchievements()
  - claimAchievement()

// Notifications Store
notificationsStore:
  - notifications: Notification[]
  - unreadCount: number
  - fetchNotifications()
  - markAsRead()
  - fetchUnreadCount()
```

---

[<-- Volver al Hub](../PORTAL-STUDENT-GUIDE.md) | Anterior: [02-MODULOS-NAVEGACION.md](./02-MODULOS-NAVEGACION.md) | Siguiente: [04-FEATURES.md](./04-FEATURES.md)
