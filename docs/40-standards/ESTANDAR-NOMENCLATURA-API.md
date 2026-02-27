---
titulo: Estandar de Nomenclatura API (snake_case/camelCase)
tipo: estandar-proyecto
version: 1.0.0
fecha_creacion: 2026-01-20
ultima_actualizacion: 2026-02-27
---

# ESTANDAR-NOMENCLATURA-API

## Metadata

| Campo | Valor |
|-------|-------|
| ID | STD-API-001 |
| Titulo | Estandar de Nomenclatura API (snake_case/camelCase) |
| Tipo | Estandar |
| Estado | Vigente |
| Fecha Creacion | 2026-01-20 |
| Autor | Arquitecto de Estandares |
| Relacionado | GAP-SP-004 |

## 1. Problema Identificado

### 1.1 Descripcion

Existe una inconsistencia sistematica en la nomenclatura de campos entre el backend (NestJS/PostgreSQL) y el frontend (React/TypeScript):

- **Backend:** Utiliza `snake_case` siguiendo la convencion de PostgreSQL y DTOs de NestJS
- **Frontend:** Espera `camelCase` siguiendo la convencion de TypeScript/JavaScript

Esta inconsistencia genera:
1. Transformaciones manuales dispersas en multiples archivos
2. Errores de runtime cuando se olvida transformar un campo
3. Complejidad en el mantenimiento del codigo
4. Confusiones sobre que convencion usar en cada capa

### 1.2 Ejemplos Concretos de Campos Afectados

| Backend (snake_case) | Frontend (camelCase) | Contexto |
|---------------------|---------------------|----------|
| `current_balance` | `currentBalance` | Economy/Wallet |
| `avatar_url` | `avatarUrl` | User Profile |
| `total_xp` | `totalXp` | Gamification |
| `ml_coins` | `mlCoins` | Economy |
| `display_name` | `displayName` | User |
| `first_name` | `firstName` | User |
| `last_name` | `lastName` | User |
| `grade_level` | `gradeLevel` | User |
| `updated_at` | `updatedAt` | Timestamps |
| `created_at` | `createdAt` | Timestamps |
| `completed_at` | `completedAt` | Progress |
| `is_completed` | `isCompleted` | Boolean flags |
| `is_secret` | `isSecret` / `isHidden` | Achievements |
| `rewards_claimed` | `rewardsClaimed` | Achievements |
| `user_id` | `userId` | References |
| `achievement_id` | `achievementId` | References |
| `balance_before` | `balanceBefore` | Transactions |
| `balance_after` | `balanceAfter` | Transactions |
| `transaction_type` | `transactionType` | Transactions |
| `reference_id` | `referenceId` | Transactions |
| `bonus_applied` | `bonusApplied` | Transactions |
| `image_url` | `image` | Shop Items |
| `is_available` | `available` | Shop Items |
| `discount_price` | `discountPrice` | Shop Items |
| `is_consumable` | `isConsumable` | Shop Items |
| `max_per_user` | `maxPerUser` | Shop Items |
| `duration_days` | `durationDays` | Shop Items |
| `effect_data` | `effectData` | Shop Items |
| `current_rank` | `currentRank` | Ranks |
| `next_rank` | `nextRank` | Ranks |
| `total_xp` | `totalXP` | Ranks |
| `current_xp` | `currentXP` | Ranks |
| `xp_to_next_level` | `xpToNextLevel` | Ranks |
| `ml_coins_earned` | `mlCoinsEarned` | Ranks |
| `rank_progress_percentage` | `rankProgressPercentage` | Ranks |
| `can_rank_up` | `canRankUp` | Ranks |
| `is_max_rank` | `isMaxRank` | Ranks |
| `prestige_level` | `prestigeLevel` | Ranks |
| `activity_streak` | `activityStreak` | Ranks |
| `last_activity_at` | `lastActivityDate` | Ranks |
| `last_rank_up` | `lastRankUp` | Ranks |
| `is_permanent` | `isPermanent` | Multipliers |
| `expires_at` | `expiresAt` | Multipliers |
| `has_expiring_soon` | `hasExpiringSoon` | Multipliers |
| `expiring_soon` | `expiringSoon` | Multipliers |
| `mission_type` | `type` | Missions |
| `template_id` | `templateId` | Missions |
| `bonus_multiplier` | `bonusMultiplier` | Missions |
| `last_sign_in_at` | `lastLogin` | Admin Users |
| `organization_id` | `organizationId` | Admin |
| `total_pages` | `totalPages` | Pagination |
| `friend_id` | `friendId` | Friendships |
| `joined_at` | `joinedAt` | Teams |
| `left_at` | `leftAt` | Teams |
| `team_id` | `teamId` | Teams |
| `team_code` | `teamCode` | Teams |
| `classroom_id` | `classroomId` | Teams |
| `color_primary` | `colorPrimary` | Teams |
| `color_secondary` | `colorSecondary` | Teams |
| `banner_url` | `bannerUrl` | Teams |
| `creator_id` | `creatorId` | Teams |
| `leader_id` | `leaderId` | Teams |
| `max_members` | `maxMembers` | Teams |
| `current_members_count` | `currentMembersCount` | Teams |
| `is_public` | `isPublic` | Teams |
| `allow_join_requests` | `allowJoinRequests` | Teams |
| `require_approval` | `requireApproval` | Teams |
| `total_ml_coins` | `totalMlCoins` | Teams |
| `modules_completed` | `modulesCompleted` | Teams |
| `achievements_earned` | `achievementsEarned` | Teams |
| `is_verified` | `isVerified` | Teams |
| `founded_at` | `foundedAt` | Teams |
| `activity_id` | `activityId` | Activities |
| `activity_type` | `activityType` | Activities |

### 1.3 Impacto en Mantenibilidad

- **Sin transformacion centralizada:** El codigo contiene transformaciones inline dispersas
- **Errores dificiles de detectar:** Propiedades `undefined` cuando falta mapeo
- **Duplicacion de logica:** Cada API/feature implementa su propio transformer
- **Inconsistencia en tipos:** Los tipos TypeScript no reflejan la realidad del backend

---

## 2. Estandar Definido

### 2.1 Regla Oficial

```
+------------------+                    +------------------+
|    BACKEND       |                    |    FRONTEND      |
|   (snake_case)   |  <-- HTTP API -->  |   (camelCase)    |
+------------------+                    +------------------+
        |                                       |
        v                                       v
   user_id                              userId
   total_xp                             totalXp
   created_at                           createdAt
```

**REGLA:**
- El **Backend retorna snake_case** (convencion PostgreSQL/Python)
- El **Frontend transforma a camelCase** (convencion JavaScript/TypeScript)
- Las **requests del Frontend al Backend** se transforman de camelCase a snake_case

### 2.2 Justificacion de la Decision

1. **Convencion de cada ecosistema:**
   - PostgreSQL: snake_case es el estandar de facto
   - TypeScript/JavaScript: camelCase es el estandar

2. **Mantenimiento del backend:**
   - Los DTOs de NestJS pueden mapear directamente a columnas de BD
   - No requiere configuracion adicional de class-transformer

3. **Experiencia del desarrollador frontend:**
   - El codigo TypeScript sigue convenciones idiomaticas
   - Los IDE autocompletan correctamente
   - Los tipos son predecibles

4. **Transformacion centralizada:**
   - Se puede automatizar en interceptores de Axios
   - Reduce errores humanos
   - Facilita debugging

### 2.3 Implementacion Actual

El proyecto utiliza un **enfoque hibrido**:

1. **Transformacion automatica en apiClient** (parcial):
   - Requests: camelCase -> snake_case (automatico via interceptor)
   - Responses: NO se transforma automaticamente (por decision arquitectonica)

2. **Transformers especificos por feature:**
   - Cada modulo/feature tiene sus propios transformers
   - Permite mapeos complejos (no solo renombrar campos)
   - Permite calcular campos derivados

---

## 3. Guia de Implementacion

### 3.1 Utilidad Central: transformKeys.ts

**Ubicacion:** `/apps/frontend/src/utils/transformKeys.ts`

```typescript
/**
 * Convert snake_case to camelCase (recursivo)
 *
 * @example
 * snakeToCamel({ user_id: '123', user_stats: { total_xp: 500 } })
 * // { userId: '123', userStats: { totalXp: 500 } }
 */
export function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = snakeToCamel(obj[key]);
      return acc;
    }, {} as Record<string, any>);
  }

  return obj;
}

/**
 * Convert camelCase to snake_case (recursivo)
 *
 * @example
 * camelToSnake({ userId: '123', userStats: { totalXp: 500 } })
 * // { user_id: '123', user_stats: { total_xp: 500 } }
 */
export function camelToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = camelToSnake(obj[key]);
      return acc;
    }, {} as Record<string, any>);
  }

  return obj;
}
```

### 3.2 Patron de Transformer por Feature

Para casos donde la transformacion NO es 1:1 (campos calculados, mapeos complejos):

**Estructura recomendada:**

```typescript
// /features/{feature}/utils/{feature}Transformer.ts

/**
 * Interface para la respuesta del backend (snake_case)
 */
export interface ApiFeatureResponse {
  id: string;
  user_id: string;
  feature_name: string;
  is_active: boolean;
  created_at: string;
  // ... mas campos
}

/**
 * Interface para el frontend (camelCase)
 */
export interface FeatureData {
  id: string;
  userId: string;
  featureName: string;
  isActive: boolean;
  createdAt: Date; // Note: transformado a Date object
  // ... mas campos
}

/**
 * Transforma respuesta del API al formato frontend
 */
export const transformFeature = (api: ApiFeatureResponse): FeatureData => ({
  id: api.id,
  userId: api.user_id,
  featureName: api.feature_name,
  isActive: api.is_active,
  createdAt: new Date(api.created_at), // Conversion de tipo
});

/**
 * Transforma array de respuestas
 */
export const transformFeatures = (apis: ApiFeatureResponse[]): FeatureData[] => {
  if (!Array.isArray(apis)) {
    console.warn('transformFeatures: Expected array');
    return [];
  }
  return apis.map(transformFeature);
};
```

### 3.3 Donde Ubicar Transformers

```
apps/frontend/src/
├── utils/
│   └── transformKeys.ts          # Utilidades genericas (snakeToCamel, camelToSnake)
│   └── index.ts                  # Re-exporta utilidades
│
├── features/
│   └── {feature}/
│       └── utils/
│           └── {feature}Transformer.ts  # Transformers especificos
│
├── services/api/
│   └── {domain}API.ts            # Transformers inline para APIs simples
│
└── shared/types/
    └── {domain}.types.ts         # Interfaces (tanto API como Frontend)
```

### 3.4 Ejemplo Completo: Achievement Transformer

```typescript
// /features/gamification/achievements/utils/achievementTransformer.ts

import type { UserAchievement, AchievementStatus } from '@/shared/types/achievement.types';

/**
 * Respuesta del backend (snake_case)
 */
export interface ApiUserAchievementResponse {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  is_completed?: boolean;
  completed_at?: string | null;
  rewards_claimed?: boolean;
}

/**
 * Calcula el status basado en campos del backend
 */
const calculateStatus = (
  isCompleted?: boolean,
  rewardsClaimed?: boolean,
  progress?: number
): AchievementStatus => {
  if (isCompleted && rewardsClaimed) return 'claimed';
  if (isCompleted) return 'earned';
  if (progress && progress > 0) return 'in_progress';
  return 'locked';
};

/**
 * Convierte fecha de forma segura
 */
const safeToISOString = (dateValue: string | null | undefined): string | undefined => {
  if (!dateValue) return undefined;
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString();
  } catch {
    return undefined;
  }
};

/**
 * Transforma UserAchievement del API al frontend
 */
export const transformUserAchievement = (api: ApiUserAchievementResponse): UserAchievement => {
  const status = calculateStatus(api.is_completed, api.rewards_claimed, api.progress);
  const earnedAt = safeToISOString(api.completed_at);

  return {
    id: api.id,
    userId: api.user_id,
    achievementId: api.achievement_id,
    progress: api.progress ?? 0,
    earnedAt,
    claimedAt: api.rewards_claimed ? earnedAt : undefined,
    status,
  };
};
```

---

## 4. Listado de Transformers Existentes

### 4.1 Utilidades Genericas

| Archivo | Funcion | Descripcion |
|---------|---------|-------------|
| `utils/transformKeys.ts` | `snakeToCamel()` | Convierte objeto snake_case a camelCase (recursivo) |
| `utils/transformKeys.ts` | `camelToSnake()` | Convierte objeto camelCase a snake_case (recursivo) |

### 4.2 Transformers por Feature

| Ubicacion | Funciones | Entidades |
|-----------|-----------|-----------|
| `features/gamification/achievements/utils/achievementTransformer.ts` | `transformUserAchievement`, `transformUserAchievements`, `transformAchievement`, `transformAchievements`, `safeToISOString` | UserAchievement, Achievement |
| `features/gamification/missions/utils/missionTransformer.ts` | `transformMission`, `transformMissions`, `mapApiStatusToFrontend`, `mapTemplateToCategory`, `getDifficultyFromTarget`, `getIconForCategory` | Mission |
| `features/gamification/economy/api/economyAPI.ts` | `mapTransactionResponse`, `mapShopItemResponse` | Transaction, ShopItem |
| `features/gamification/ranks/api/ranksAPI.ts` | `mapUserProgressResponse`, `mapMultiplierResponse`, `mapMultiplierSource` | UserRankProgress, MultiplierBreakdown, MultiplierSource |
| `services/api/profileAPI.ts` | `mapProfileUpdateResponse`, `mapPreferencesUpdateResponse`, `mapAvatarUploadResponse` | ProfileUpdate, PreferencesUpdate, AvatarUpload |
| `services/api/friendsAPI.ts` | `mapFriendshipDTO`, `mapActivityDTO` | Friendship, Activity |
| `services/api/teamsAPI.ts` | `mapTeamDTO`, `mapTeamMemberDTO` | Team, TeamMember |
| `services/api/adminAPI.ts` | `transformUser`, `safeToISOString` | User (admin), AuditLogEntry |
| `features/auth/api/authAPI.ts` | `mapBackendUserToFrontend`, `mapBackendAuthResponse` | User, AuthResponse |
| `services/api/gamification/gamificationAPI.ts` | Usa `transformUserAchievements`, `transformAchievements`, `transformAchievement` | Reutiliza transformers de achievements |

### 4.3 Transformacion en apiClient

| Archivo | Interceptor | Direccion |
|---------|-------------|-----------|
| `services/api/apiClient.ts` | Request Interceptor | camelCase -> snake_case (data y params) |
| `services/api/apiClient.ts` | Response Interceptor | Unwrap `{ success, data }` (NO transforma keys) |

### 4.4 Transformaciones Inline en APIs

Muchas APIs realizan transformaciones directamente en sus funciones:

- `adminAPI.ts`: `getMayaRanks()`, `getAuditLogs()`, `getUsers()`
- `economyAPI.ts`: `getTransactions()`, `getShopItems()`
- `ranksAPI.ts`: `getProgressionStats()`, `getMultipliers()`

---

## 5. Checklist para Nuevos Endpoints

### 5.1 Al Crear un Nuevo Endpoint Backend

- [ ] Usar snake_case para todos los campos del DTO
- [ ] Documentar campos en Swagger/OpenAPI
- [ ] Incluir tipos de fecha como ISO strings

### 5.2 Al Consumir un Nuevo Endpoint en Frontend

1. **Definir Interfaces:**
   - [ ] Crear interface `Api{Entity}Response` con campos snake_case
   - [ ] Crear interface `{Entity}` con campos camelCase
   - [ ] Ubicar en `shared/types/{domain}.types.ts`

2. **Crear Transformer:**
   - [ ] Decidir: transformer generico (`snakeToCamel`) vs especifico
   - [ ] Si hay campos calculados o conversiones de tipo: usar transformer especifico
   - [ ] Ubicar en `features/{feature}/utils/{feature}Transformer.ts`
   - [ ] Manejar valores null/undefined de forma segura
   - [ ] Convertir strings de fecha a Date objects si es necesario

3. **Implementar API Call:**
   - [ ] Tipar response con `Api{Entity}Response`
   - [ ] Aplicar transformer antes de retornar
   - [ ] Manejar errores con `handleAPIError()`

4. **Documentar:**
   - [ ] Agregar transformer a esta lista
   - [ ] Documentar mapeos no triviales en comentarios

### 5.3 Ejemplo de Checklist Aplicado

```typescript
// 1. Interfaces (shared/types/newFeature.types.ts)
export interface ApiNewFeatureResponse {
  id: string;
  feature_name: string;
  created_at: string;
  is_enabled: boolean;
}

export interface NewFeature {
  id: string;
  featureName: string;
  createdAt: Date;
  isEnabled: boolean;
}

// 2. Transformer (features/newFeature/utils/newFeatureTransformer.ts)
export const transformNewFeature = (api: ApiNewFeatureResponse): NewFeature => ({
  id: api.id,
  featureName: api.feature_name,
  createdAt: new Date(api.created_at),
  isEnabled: api.is_enabled,
});

// 3. API Call (features/newFeature/api/newFeatureAPI.ts)
export const getNewFeature = async (id: string): Promise<NewFeature> => {
  const { data } = await apiClient.get<ApiNewFeatureResponse>(`/new-feature/${id}`);
  return transformNewFeature(data);
};
```

---

## 6. Decisiones Arquitectonicas Relacionadas

### 6.1 Por que NO transformar automaticamente responses

La decision de NO aplicar `snakeToCamel` automaticamente en el interceptor de responses se tomo porque:

1. **Transformaciones complejas:** Muchos campos requieren mas que renombrar (calcular status, convertir a Date, etc.)
2. **Control granular:** Permite decidir que transformar y que no por endpoint
3. **Debugging:** Es mas facil debuggear cuando se ve la respuesta original del backend
4. **Compatibilidad:** Algunos tipos existentes usan snake_case (legacy)

### 6.2 Nota sobre tipos legacy

Algunos tipos del frontend aun usan snake_case por compatibilidad historica:
- `StudentMonitoring`
- `Classroom`
- Algunos tipos del Teacher Portal

Estos estan documentados en el comentario del `apiClient.ts` linea 110-113.

---

## 7. Referencias

- **GAP-SP-004:** Identificacion inicial del problema de nomenclatura
- **apiClient.ts:** Implementacion de interceptores
- **transformKeys.ts:** Utilidades de transformacion
- **ADR-XXX:** (pendiente) Decision de arquitectura sobre nomenclatura

---

## 8. Apendice: Backend DTOs vs Frontend Interfaces

### 8.1 Patron Consistente en APIs Sociales

Los archivos `friendsAPI.ts` y `teamsAPI.ts` demuestran el patron recomendado:

```typescript
// Backend DTO (snake_case) - interface interna
interface BackendFriendshipDTO {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

// Frontend Interface (camelCase) - interface exportada
export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Transformer function
function mapFriendshipDTO(dto: BackendFriendshipDTO): Friendship {
  return {
    id: dto.id,
    userId: dto.user_id,
    friendId: dto.friend_id,
    status: dto.status,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}
```

### 8.2 Convencion de Nombres para Transformers

| Patron | Uso |
|--------|-----|
| `map{Entity}DTO(dto)` | Transforma un DTO a interface frontend |
| `map{Entity}Response(response)` | Transforma respuesta de API |
| `transform{Entity}(api)` | Alternativa equivalente |
| `transform{Entities}(apis)` | Transforma array de entidades |

### 8.3 Archivos con Deprecation Aliases

Para mantener compatibilidad con codigo legacy, varios archivos exportan aliases deprecados:

- `friendsAPI.ts`: `FriendshipDTO` -> usar `Friendship`
- `friendsAPI.ts`: `ActivityDTO` -> usar `Activity`
- `teamsAPI.ts`: `TeamDTO` -> usar `Team`
- `teamsAPI.ts`: `TeamMemberDTO` -> usar `TeamMember`
- `profileAPI.ts`: `ProfileUpdateResponse` -> usar `ProfileUpdate`

---

*Documento generado: 2026-01-20*
*Ultima actualizacion: 2026-01-20 (ampliado con transformers de Social APIs)*
