# SPEC-API-CONTRACTS - Student Portal API Contracts

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Autor:** Claude Code (Auditoría Automatizada)
**Estado:** COMPLETO

---

## 1. Vision General

Este documento consolida todos los contratos de API consumidos por el Student Portal, incluyendo:
- Endpoints por dominio
- Request/Response types
- Códigos de error
- Transformaciones de datos

---

## 2. Base Configuration

### 2.1 API Client

```typescript
// Base URL
const API_BASE = '/api/v1';

// Headers
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}

// Transformaciones automáticas
- snake_case (backend) → camelCase (frontend)
- camelCase (frontend) → snake_case (backend)
```

### 2.2 React Query Config

```typescript
const defaultOptions = {
  staleTime: 5 * 60 * 1000,       // 5 minutos
  gcTime: 10 * 60 * 1000,         // 10 minutos
  refetchOnWindowFocus: true,
  retry: 2,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000)
};
```

---

## 3. Endpoints por Dominio

### 3.1 Gamification - Ranks

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `/gamification/ranks/current` | GET | - | `RankData` |
| `/gamification/ranks/users/{userId}/rank-progress` | GET | - | `RankProgressData` |
| `/gamification/users/{userId}/ml-coins` | GET | - | `MLCoinsData` |

### 3.2 Gamification - Achievements

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `/gamification/users/{userId}/achievements` | GET | - | `AchievementData[]` |

### 3.3 Gamification - Missions

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `/gamification/missions/daily` | GET | - | `Mission[]` |
| `/gamification/missions/weekly` | GET | - | `Mission[]` |
| `/gamification/missions/special` | GET | - | `Mission[]` |
| `/gamification/missions/{id}/start` | POST | - | `{ success: boolean }` |
| `/gamification/missions/{id}/claim` | POST | - | `{ rewards: Rewards }` |

### 3.4 Gamification - Leaderboard

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `/gamification/leaderboard/global` | GET | `?period=daily\|weekly\|monthly\|all` | `LeaderboardEntry[]` |
| `/gamification/leaderboard/school` | GET | `?period=...` | `LeaderboardEntry[]` |
| `/gamification/leaderboard/classroom/{id}` | GET | `?period=...` | `LeaderboardEntry[]` |
| `/gamification/leaderboard/friends` | GET | `?period=...` | `LeaderboardEntry[]` |

### 3.5 Gamification - Power-ups

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `/gamification/inventory/powerups/{userId}` | GET | - | `PowerUp[]` |
| `/gamification/powerups/active` | GET | - | `ActivePowerUp[]` |
| `/gamification/comodines/use` | POST | `ComodinDTO` | `{ success: boolean }` |

### 3.6 Progress Tracking

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `/progress/users/{userId}/summary` | GET | - | `ProgressData` |
| `/progress/auto-save` | POST | `AutoSaveData` | `{ savedAt: Date }` |
| `/progress/auto-save/{exerciseId}` | GET | - | `AutoSaveData \| null` |
| `/progress/auto-save/{exerciseId}` | DELETE | - | `{ success: boolean }` |

### 3.7 Educational Content

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `/educational/users/{userId}/modules` | GET | `?classroomId=...` | `UserModule[]` |
| `/educational/users/{userId}/activities` | GET | `?limit=10` | `Activity[]` |
| `/educational/exercises/{id}` | GET | - | `ExerciseData` |
| `/educational/exercises/{id}/hints` | GET | - | `string[]` |
| `/educational/exercises/{id}/progress` | POST | `ProgressData` | `{ success }` |
| `/educational/exercises/{id}/submit` | POST | `SubmissionData` | `SubmissionResult` |

### 3.8 Social

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `/social/classroom-members/users/{userId}` | GET | - | `ClassroomMember[]` |
| `/social/friends/{userId}` | GET | - | `Friend[]` |
| `/social/friends/requests/{userId}` | GET | - | `FriendRequest[]` |
| `/social/friends/recommendations/{userId}` | GET | - | `Recommendation[]` |
| `/social/friends/request` | POST | `{ userId: string }` | `{ success }` |
| `/social/friends/request/{id}/accept` | PUT | - | `{ success }` |
| `/social/friends/request/{id}/decline` | DELETE | - | `{ success }` |
| `/social/friends/{userId}` | DELETE | - | `{ success }` |

### 3.9 Guilds

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `/social/guilds` | GET | - | `Guild[]` |
| `/social/guilds/user/{userId}` | GET | - | `Guild \| null` |
| `/social/guilds/{id}/members` | GET | - | `GuildMember[]` |
| `/social/guilds` | POST | `CreateGuildDTO` | `Guild` |
| `/social/guilds/{id}/join` | POST | - | `{ success }` |
| `/social/guilds/{id}/leave` | DELETE | - | `{ success }` |

### 3.10 Shop

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `/shop/categories` | GET | - | `Category[]` |
| `/shop/items` | GET | `?category=...&rarity=...` | `ShopItem[]` |
| `/shop/purchase` | POST | `PurchaseDTO` | `{ success, item }` |
| `/shop/purchases/{userId}` | GET | - | `Purchase[]` |

### 3.11 Notifications

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `/notifications` | GET | `?status=...&type=...&limit=50` | `Notification[]` |
| `/notifications/unread-count` | GET | - | `{ count: number }` |
| `/notifications/{id}/read` | PUT | - | `{ success }` |
| `/notifications/read-all` | PUT | - | `{ success }` |
| `/notifications/{id}` | DELETE | - | `{ success }` |
| `/notifications/preferences` | GET | - | `NotificationPreference[]` |
| `/notifications/preferences` | PUT | `PreferenceDTO` | `{ success }` |
| `/notifications/devices` | GET | - | `Device[]` |
| `/notifications/devices` | POST | `RegisterDeviceDTO` | `Device` |
| `/notifications/devices/{id}` | DELETE | - | `{ success }` |

### 3.12 Auth

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `/auth/reset-password/request` | POST | `{ email: string }` | `{ message }` |
| `/auth/reset-password` | POST | `{ token, new_password }` | `{ success }` |
| `/auth/reset-password/validate` | GET | `?token=...` | **NO EXISTE** |
| `/auth/2fa/verify` | POST | `{ code: string }` | **MOCK** |

### 3.13 Profile

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `profileAPI.updateProfile(userId, data)` | PUT | `ProfileDTO` | `User` |
| `profileAPI.uploadAvatar(userId, file)` | POST | `FormData` | `{ avatarUrl }` |
| `profileAPI.updatePassword(userId, data)` | PUT | `PasswordDTO` | `{ success }` |
| `profileAPI.updatePreferences(userId, data)` | PUT | `PreferencesDTO` | `{ success }` |

---

## 4. Tipos Principales

### 4.1 User & Auth

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: string;
}
```

### 4.2 Gamification

```typescript
interface RankData {
  currentRank: string;
  currentXP: number;
  nextRankXP: number;
  multiplier: number;
  rankIcon: string;
  progress: number;
}

interface MLCoinsData {
  balance: number;
  todayEarned: number;
  todaySpent: number;
  recentTransactions: Transaction[];
}

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  progress: number;
  required: number;
  reward: { coins: number; xp: number };
  expiresAt: string;
  completed: boolean;
  claimed: boolean;
}
```

### 4.3 Educational

```typescript
interface ExerciseData {
  id: string;
  module_id: string;
  title: string;
  type: string;
  description: string;
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
  points: number;
  estimatedTime: number;
  completed: boolean;
  mechanicData?: any;
  is_active?: boolean;
}

interface SubmissionResult {
  score: number;
  isPerfect: boolean;
  rewards: { xp: number; mlCoins: number; bonuses: string[] };
  achievements: Achievement[];
  rankUp?: RankUpInfo;
  feedback: { overall: string; answerReview: AnswerReview[] };
}
```

---

## 5. Códigos de Error

| Código | Descripción | Manejo Frontend |
|--------|-------------|-----------------|
| 400 | Bad Request | Mostrar validación |
| 401 | Unauthorized | Redirect a login |
| 403 | Forbidden | Mostrar acceso denegado |
| 404 | Not Found | Redirect o mensaje |
| 409 | Conflict | Mostrar conflicto específico |
| 422 | Validation Error | Mostrar errores de campo |
| 429 | Too Many Requests | Mostrar rate limit |
| 500 | Server Error | Retry con backoff |

---

## 6. Endpoints Faltantes/Mock

| Endpoint | Estado | Impacto |
|----------|--------|---------|
| `/auth/reset-password/validate` | NO EXISTE | Usuario puede ver form con token inválido |
| `/auth/2fa/verify` | MOCK | 2FA no funciona en producción |
| `/users/search?query=...` | NO EXISTE | No se puede buscar usuarios globalmente |

---

## 7. Referencias

- **Backend Inventory:** `orchestration/inventarios/BACKEND_INVENTORY.yml`
- **API Standards:** `docs/40-estandares/ESTANDAR-NOMENCLATURA-API.md`
- **Swagger:** `/api/docs` (backend)

---

*Generado: 2026-01-24*
*Sistema SIMCO v4.3.0*
