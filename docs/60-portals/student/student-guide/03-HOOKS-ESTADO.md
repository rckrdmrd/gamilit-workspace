---
title: Portal Student - Hooks, APIs y Estado
status: activo
last_updated: "2026-03-01"
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

### 5.6 useEquippedVisuals

**Propósito:** Extrae configuración visual de items cosméticos equipados del inventario del usuario.

**Fuente:** `features/gamification/social/hooks/useEquippedVisuals.ts`

**Return value:**

```typescript
{
  avatar: { assetUrl: string } | null,
  frame: { borderColor: string; cssClass: string; assetUrl: string } | null,
  badge: { assetUrl: string; name: string } | null,
  title: { text: string } | null,
  background: { assetUrl: string; cssClass: string } | null,
}
```

**Usado en (6 archivos):**
- `EnhancedProfilePage.tsx` — extrae avatar, frame, background, title, badge → pasa a ProfileHero
- `RankProgressWidget.tsx` — frame (priority: SVG overlay > CSS class > border color) y badge en el dashboard
- `EnhancedStatsGrid.tsx` — frame border y badge en el rank position badge del dashboard
- `GamifiedHeader.tsx` — avatar y frame → pasa a AvatarDisplay en el header
- `useEquipment.ts` — re-export del hook para conveniencia de importación
- `useEquippedVisuals.ts` — definición del hook (extractVisuals)

### 5.7 useExerciseComodines

**Propósito:** Gestión de comodines/consumibles reales via API backend durante ejercicios.

**Fuente:** `features/exercises/hooks/useExerciseComodines.ts`

**API:**

```typescript
GET /gamification/comodines/users/:userId/inventory  // Inventario
POST /gamification/comodines/use                     // Activar comodín
```

**Return value:**

```typescript
{
  inventory: ComodinInventory | null,              // Inventario del usuario desde backend
  comodinesContext: {                               // Estado de efectos activos
    hintsRevealed: number,
    visionActive: boolean,
    hasSecondChance: boolean,
    timeExtension: number,
    multiplierActive: boolean,
  },
  canUse: (type: ComodinType) => boolean,          // Verifica si comodín disponible + no excede límite por ejercicio
  useComodin: (type: ComodinType) => Promise<void>, // Activar comodín (decrementa inventario local, registra uso)
  getUsedComodinTypes: () => string[],              // Tipos usados (para payload submit)
  usageLimits: Record<ComodinType, { used: number; max: number }>, // Per-exercise tracking (max 1 por tipo)
  loading: boolean,                                 // Inventario siendo fetched
  error: string | null,                             // Mensaje de error si uso falló
}
```

**Métodos principales:**

- **`canUse(type: ComodinType): boolean`** — Verifica disponibilidad: tiene stock disponible AND no excede límite de uso por ejercicio (máximo 1 de cada tipo)
- **`useComodin(type: ComodinType): Promise<void>`** — Activa comodín en ejercicio actual, decrementa inventario local, registra uso en `usageLimits`, lanza error si no disponible
- **`getUsedComodinTypes(): string[]`** — Retorna tipos de comodines usados (para incluir en payload de submit)

**Efectos:**
- `hintsRevealed > 0` → ExerciseGuide auto-expande
- `visionActive` → Resaltado amber en texto del ejercicio
- `hasSecondChance` → Banner + mecánicas permiten reintento si score < 70

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
