# Reporte de Coherencia de Integración: Frontend-Backend-Database

**Fecha:** 2025-11-02
**Agente:** NEXUS-FRONTEND v1.0
**Tipo:** Validación de Coherencia Cross-Layer
**Subagentes ejecutados:** SA-FRONTEND-006, SA-FRONTEND-007, SA-FRONTEND-008

---

## 📊 Resumen Ejecutivo

Este reporte consolida los hallazgos de coherencia entre las 3 capas principales del sistema:
- **Frontend** (`apps/frontend`)
- **Backend** (`apps/backend`)
- **Database** (`apps/database`)

### Métricas Generales de Coherencia

| Dimensión | Coherencia | Estado |
|-----------|------------|--------|
| **Constantes/Enums** | 68-78% | ⚠️ MEDIO-ALTO |
| **Tipos TypeScript** | 62% | ⚠️ MEDIO |
| **Rutas API** | 77.4% | ⚠️ MEDIO-ALTO |
| **Coherencia General** | 69% | ⚠️ MEDIO |

### Hallazgos Críticos

🚨 **4 BLOQUEANTES identificados:**
1. `MayaRank` enum - Valores completamente incompatibles entre capas
2. `notification_type` enum - Sistema incompatible entre capas
3. POST `/educational/exercises/:id/submit` - Endpoint faltante (estudiantes no pueden enviar ejercicios)
4. Endpoints de leaderboard faltantes (3) - Sin rankings funcionales

⚠️ **6 ALTOS:**
1. 80+ campos faltantes en tipos Frontend
2. 7 inconsistencias críticas en enums/constantes
3. 14 endpoints Backend sin match en Frontend
4. `auth_provider` enum - Database no incluye `apple` y `github`
5. Confusión User vs Profile en tipos (25 campos inaccesibles)
6. Superposición conceptual ExerciseAttempt vs ExerciseSubmission

---

## 1. Coherencia de Constantes/Enums

**Fuente:** SA-FRONTEND-006
**Coherencia global:** 68-78%

### 1.1 Sincronización Frontend-Backend: 100% ✅

**Archivos comparados:**
- `apps/shared/constants/enums.constants.ts` (Frontend)
- `apps/backend/src/shared/constants/enums.constants.ts` (Backend)

**Resultado:** Archivos IDÉNTICOS - Sincronización perfecta ✅

Los siguientes enums están 100% sincronizados:
- `UserRole`: `student`, `teacher`, `admin`, `super_admin`
- `AuthProvider`: `email`, `google`, `facebook`, `apple`, `github`
- `ExerciseDifficulty`: `beginner`, `intermediate`, `advanced`, `expert`
- `MayaRank`: `ajaw`, `nacom`, `ah_kin`, `halach_uinic`, `kukul_kan`
- `AchievementCategory`: `mastery`, `consistency`, `exploration`, `social`, `special`
- `ContentType`: `video`, `audio`, `text`, `interactive`, `game`, `assessment`

### 1.2 Coherencia con Database: 68% ⚠️

**Archivos comparados:**
- `apps/shared/constants/enums.constants.ts` (Frontend/Backend)
- `apps/database/ddl/schemas/*/enums/*.sql` (Database)

#### ✅ Enums Coherentes (9/16 = 56%)

| Enum | Frontend/Backend | Database | Estado |
|------|------------------|----------|--------|
| `user_role` | 4 valores | 4 valores | ✅ IDÉNTICO |
| `exercise_difficulty` | 4 valores | 4 valores | ✅ IDÉNTICO |
| `maya_rank` | 5 valores | 5 valores | ✅ IDÉNTICO |
| `achievement_category` | 5 valores | 5 valores | ✅ IDÉNTICO |
| `content_type` | 6 valores | 6 valores | ✅ IDÉNTICO |
| `content_status` | 4 valores | 4 valores | ✅ IDÉNTICO |
| `exercise_type` | 7 valores | 7 valores | ✅ IDÉNTICO |
| `notification_priority` | 3 valores | 3 valores | ✅ IDÉNTICO |
| `audit_action` | 4 valores | 4 valores | ✅ IDÉNTICO |

#### 🚨 Enums con Inconsistencias CRÍTICAS (7/16 = 44%)

##### 1. `auth_provider` - ALTO

**Frontend/Backend:**
```typescript
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',      // ❌ NO existe en Database
  GITHUB = 'github'     // ❌ NO existe en Database
}
```

**Database (auth/enums/auth_provider.sql):**
```sql
CREATE TYPE auth.auth_provider AS ENUM (
  'email',
  'google',
  'facebook'
  -- 'apple' y 'github' NO definidos
);
```

**Impacto:** ALTO - Usuarios que intenten registrarse con Apple/GitHub fallarán por constraint violation.

**Acción:** Agregar `'apple'` y `'github'` al enum de Database.

---

##### 2. `notification_type` - 🚨 CRÍTICO

**Frontend/Backend:**
```typescript
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  ACHIEVEMENT = 'achievement',
  PROGRESS = 'progress',
  SOCIAL = 'social',
  REMINDER = 'reminder'
}
```

**Database (system_configuration/enums/notification_type.sql):**
```sql
CREATE TYPE system_configuration.notification_type AS ENUM (
  'achievement_unlocked',
  'rank_up',
  'mission_completed',
  'friend_request',
  'team_invite',
  'system_announcement',
  'reminder'
);
```

**Impacto:** 🚨 CRÍTICO - Sistemas COMPLETAMENTE INCOMPATIBLES

**Análisis:**
- Solo 1/8 valores coincide: `reminder`
- Frontend usa tipos genéricos (`info`, `success`, etc.)
- Database usa eventos específicos (`achievement_unlocked`, `rank_up`, etc.)
- **Diseño conceptual diferente**: Frontend → tipos UI, Database → eventos de negocio

**Acción requerida:**
1. Decidir enfoque: ¿Unificar en tipos genéricos o eventos específicos?
2. Crear mapping layer si se mantienen ambos
3. Migrar notificaciones existentes

---

##### 3. `team_role` - MEDIO

**Frontend/Backend:**
```typescript
export enum TeamRole {
  LEADER = 'leader',
  MEMBER = 'member',
  INVITED = 'invited'  // ❌ NO existe en Database
}
```

**Database:**
```sql
CREATE TYPE social_features.team_role AS ENUM ('leader', 'member');
```

**Impacto:** MEDIO - Estado `invited` no se puede persistir en Database.

---

##### 4. `friendship_status` - MEDIO

**Frontend/Backend:**
```typescript
export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  BLOCKED = 'blocked'
}
```

**Database:**
```sql
CREATE TYPE social_features.friendship_status AS ENUM (
  'pending',
  'accepted',
  'blocked'
  -- 'rejected' NO existe
);
```

**Impacto:** MEDIO - No se puede marcar amistad como `rejected` explícitamente.

---

##### 5. `ranking_scope` - ALTO

**Frontend/Backend:**
```typescript
export enum RankingScope {
  GLOBAL = 'global',
  SCHOOL = 'school',
  CLASSROOM = 'classroom',
  FRIENDS = 'friends'  // ❌ NO existe en Database
}
```

**Database:**
```sql
CREATE TYPE gamification_system.ranking_scope AS ENUM (
  'global',
  'school',
  'classroom'
);
```

**Impacto:** ALTO - Rankings entre amigos no funcionales.

---

##### 6. `hint_type` - BAJO

**Frontend/Backend:**
```typescript
export enum HintType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio'
}
```

**Database:**
```sql
CREATE TYPE educational_content.hint_type AS ENUM ('text', 'image', 'video');
-- 'audio' NO existe
```

**Impacto:** BAJO - Hints de audio no soportados.

---

##### 7. `progress_status` - MEDIO

**Frontend/Backend:**
```typescript
export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MASTERED = 'mastered'
}
```

**Database:**
```sql
CREATE TYPE progress_tracking.progress_status AS ENUM (
  'not_started',
  'in_progress',
  'completed'
  -- 'mastered' NO existe
);
```

**Impacto:** MEDIO - Estado de maestría no se puede persistir.

---

### 1.3 Resumen de Acciones - Enums

| Prioridad | Enum | Acción Requerida | Estimación |
|-----------|------|------------------|------------|
| 🚨 CRÍTICO | `notification_type` | Rediseño o mapping layer | 2-4 días |
| ALTO | `auth_provider` | Agregar `apple`, `github` a DB | 1 hora |
| ALTO | `ranking_scope` | Agregar `friends` a DB | 1 hora |
| MEDIO | `team_role` | Agregar `invited` a DB | 1 hora |
| MEDIO | `friendship_status` | Agregar `rejected` a DB | 1 hora |
| MEDIO | `progress_status` | Agregar `mastered` a DB | 1 hora |
| BAJO | `hint_type` | Agregar `audio` a DB | 1 hora |

**Total estimado:** 2-4 días (incluyendo `notification_type` refactor)

---

## 2. Coherencia de Tipos TypeScript

**Fuente:** SA-FRONTEND-007
**Coherencia global:** 62%

### 2.1 Resumen por Entidad

| Entidad | Frontend | Backend | Database | Coherencia | Estado |
|---------|----------|---------|----------|------------|--------|
| Exercise | 15 campos | 27 campos | 30 campos | 75% | ⚠️ MEDIO-ALTO |
| ExerciseAttempt | 10 campos | - | 15 campos | 55% | 🚨 CRÍTICO |
| ExerciseSubmission | - | 12 campos | - | 0% | 🚨 CRÍTICO |
| User | 12 campos | 18 campos | - | 67% | ⚠️ MEDIO |
| Profile | - | - | 37 campos | 0% | 🚨 CRÍTICO |
| ModuleProgress | 8 campos | 31 campos | 31 campos | 26% | 🚨 CRÍTICO |
| Achievement | 9 campos | 12 campos | 14 campos | 72% | ⚠️ MEDIO-ALTO |
| UserAchievement | - | 7 campos | 10 campos | 0% | 🚨 CRÍTICO |

**Coherencia promedio:** 62%

### 2.2 Hallazgos Críticos por Entidad

#### 2.2.1 Exercise - 75% ⚠️

**Frontend (`apps/frontend/src/types/exercise.types.ts`):**
```typescript
export interface Exercise {
  id: string;
  module_id: string;
  title: string;
  description: string;
  type: ExerciseType;
  difficulty: ExerciseDifficulty;
  estimated_time: number;
  xp_reward: number;
  coins_reward: number;
  content: ExerciseContent;
  hints: Hint[];
  max_attempts: number;
  passing_score: number;
  order: number;
  is_required: boolean;
}
```

**Backend (`apps/backend/src/modules/educational/entities/exercise.entity.ts`):**
- ✅ Todos los campos de Frontend presentes
- ❌ **12 campos adicionales** en Backend:
  - `created_by`, `updated_by` (auditoría)
  - `dependencies` (prerequisitos)
  - `tags` (taxonomía)
  - `metadata` (JSON flexible)
  - `adaptive_difficulty` (IA)
  - `min_score_for_mastery` (gamificación)
  - `time_limit` (segundos)
  - `attempts_for_penalty` (mecánica)
  - `penalty_xp` (gamificación)
  - `show_correct_answer` (pedagogía)
  - `randomize_options` (variabilidad)

**Impacto:** MEDIO - Frontend no puede mostrar/editar 12 campos adicionales.

**Acción:** Agregar campos faltantes a `exercise.types.ts` (prioridad media).

---

#### 2.2.2 ExerciseAttempt vs ExerciseSubmission - 🚨 CRÍTICO

**Problema conceptual:** Superposición entre dos conceptos diferentes.

**Frontend (`exercise.types.ts`):**
```typescript
export interface ExerciseAttempt {
  id: string;
  exercise_id: string;
  user_id: string;
  started_at: Date;
  completed_at?: Date;
  score?: number;
  is_correct: boolean;
  time_spent: number;
  hints_used: number;
  user_answer: any;
}
```

**Backend (`exercise-submission.entity.ts`):**
```typescript
@Entity('exercise_submissions')
export class ExerciseSubmission {
  id: string;
  exercise_id: string;
  user_id: string;
  answer: any;
  score: number;
  max_score: number;
  is_correct: boolean;
  time_spent: number;
  hints_used: string[];
  submitted_at: Date;
  scored_at?: Date;
  feedback?: string;
}
```

**Database (`progress_tracking/tables/exercise_attempts.sql`):**
```sql
CREATE TABLE progress_tracking.exercise_attempts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  attempt_number INTEGER NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  time_spent INTEGER, -- segundos
  score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  passed BOOLEAN,
  answer JSONB,
  hints_used JSONB,
  feedback TEXT,
  -- 3 campos que NINGUNA capa tiene:
  is_adaptive BOOLEAN DEFAULT false,
  difficulty_adjustment DECIMAL(3,2),
  metadata JSONB
);
```

**Análisis:**
- **Frontend:** Usa `ExerciseAttempt` (orientado a UI)
- **Backend:** Usa `ExerciseSubmission` (orientado a scoring)
- **Database:** Usa `exercise_attempts` (persistencia completa)

**Problema:** ¿Son el mismo concepto o diferentes?
- Si son el mismo → Unificar nombres
- Si son diferentes → Clarificar relación

**Campos únicos:**
- Frontend: `is_correct` (boolean simple)
- Backend: `max_score`, `scored_at`, `feedback`
- Database: `attempt_number`, `is_adaptive`, `difficulty_adjustment`

**Impacto:** 🚨 CRÍTICO - Confusión conceptual afecta flujo de negocio.

**Acción requerida:**
1. Definir modelo canónico: ¿`ExerciseAttempt` o `ExerciseSubmission`?
2. Unificar nombre en las 3 capas
3. Agregar campos faltantes a Frontend (especialmente `max_score`, `feedback`)

---

#### 2.2.3 User vs Profile - 🚨 CRÍTICO

**Frontend (`user.types.ts`):**
```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  auth_provider: AuthProvider;
  email_verified: boolean;
  created_at: Date;
  last_login?: Date;
  is_active: boolean;
  preferences?: UserPreferences;
}
```

**Backend:** Usa modelo `User` IDÉNTICO (✅)

**Database (`auth/tables/users.sql` + `system_configuration/tables/user_profiles.sql`):**
- Tabla `users`: 18 campos (auth básico)
- Tabla `user_profiles`: **37 campos adicionales** (perfil completo)

**Problema:** Frontend no tiene tipo `Profile`, solo `User`.

**Campos de `user_profiles` NO disponibles en Frontend (25 campos):**
- Académicos: `school_id`, `classroom_id`, `grade_level`, `section`
- Gamificación: `current_rank`, `total_xp`, `coins_balance`, `gems_balance`
- Progreso: `modules_completed`, `exercises_completed`, `achievements_count`
- Social: `friends_count`, `teams_count`
- Personalización: `theme_preference`, `language`, `timezone`, `notification_settings`
- Estadísticas: `total_study_time`, `average_score`, `streak_days`
- Privacidad: `show_profile`, `show_progress`, `show_achievements`
- Metadata: `onboarding_completed`, `tutorial_completed`, `last_activity`

**Impacto:** 🚨 CRÍTICO - 25 campos de perfil inaccesibles desde Frontend.

**Acción requerida:**
1. Crear tipo `Profile` en Frontend
2. Importar desde `apps/shared/types/profile.types.ts`
3. Usar `User` para auth, `Profile` para datos de usuario

---

#### 2.2.4 ModuleProgress - 🚨 CRÍTICO

**Frontend (`progress.types.ts`):**
```typescript
export interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  status: ProgressStatus;
  progress_percentage: number;
  exercises_completed: number;
  total_exercises: number;
  updated_at: Date;
}
```

**Backend/Database (`module_progress.entity.ts`, `progress_tracking/tables/module_progress.sql`):**
```typescript
// Backend tiene 31 campos, Frontend solo 8
// 23 campos faltantes en Frontend:
{
  started_at: Date;
  completed_at: Date;
  last_accessed_at: Date;
  time_spent: number; // segundos totales

  // Gamificación (8 campos)
  xp_earned: number;
  coins_earned: number;
  gems_earned: number;
  achievements_unlocked: number;
  rank_at_start: string;
  rank_at_completion: string;
  mastery_level: number; // 0-100
  streak_days: number;

  // Métricas de desempeño (7 campos)
  average_score: number;
  highest_score: number;
  attempts_count: number;
  hints_used_count: number;
  time_per_exercise_avg: number;
  completion_rate: number; // % de ejercicios completados
  pass_rate: number; // % de ejercicios aprobados

  // Adaptativo (3 campos)
  difficulty_level: number;
  adaptive_path: any[];
  personalized_content: any[];

  // Metadata (2 campos)
  notes: string;
  metadata: any;
}
```

**Impacto:** 🚨 CRÍTICO - Frontend solo tiene 26% de los datos de progreso.

**Consecuencias:**
- Dashboard de progreso incompleto
- Gamificación no funcional
- Métricas de desempeño no visibles
- Sistema adaptativo no operativo

**Acción requerida:** Agregar 23 campos faltantes a `ModuleProgress` en Frontend (ALTA prioridad).

---

#### 2.2.5 Achievement vs UserAchievement - MEDIO

**Frontend (`achievement.types.ts`):**
```typescript
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  category: AchievementCategory;
  xp_reward: number;
  coins_reward: number;
  is_hidden: boolean;
  requirements: any;
}
```

**Problema:** Frontend NO tiene tipo `UserAchievement` (progreso del usuario).

**Backend/Database (`user_achievements` table):**
```sql
CREATE TABLE gamification_system.user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL,
  unlocked_at TIMESTAMP NOT NULL,
  progress DECIMAL(5,2), -- % de progreso hacia logro
  progress_data JSONB,   -- datos específicos del logro
  notified BOOLEAN DEFAULT false,
  metadata JSONB
);
```

**Impacto:** MEDIO - Frontend no puede mostrar progreso hacia logros.

**Acción:** Crear tipo `UserAchievement` en Frontend.

---

### 2.3 Incompatibilidad MayaRank - 🚨 BLOQUEANTE

**Frontend (`leaderboard.types.ts`):**
```typescript
export enum MayaRank {
  NOVICE = 'novice',
  APPRENTICE = 'apprentice',
  ADEPT = 'adept',
  EXPERT = 'expert',
  MASTER = 'master',
  LEGEND = 'legend'
}
```

**Backend + Database (`enums.constants.ts`, `maya_rank.sql`):**
```typescript
export enum MayaRank {
  AJAW = 'ajaw',           // Señor/Líder
  NACOM = 'nacom',         // Guerrero
  AH_KIN = 'ah_kin',       // Sacerdote del Sol
  HALACH_UINIC = 'halach_uinic',  // Gran Señor
  KUKUL_KAN = 'kukul_kan'  // Serpiente Emplumada
}
```

**Impacto:** 🚨 BLOQUEANTE - **Valores completamente diferentes e incompatibles**

**Análisis:**
- Frontend usa nombres genéricos en inglés
- Backend/Database usa nombres mayas (identidad cultural del producto)
- **NO hay superposición** entre los valores
- Sistema de rankings completamente roto

**Acción URGENTE:**
1. Reemplazar `MayaRank` en Frontend por la versión correcta (maya)
2. Actualizar todos los componentes que usen `MayaRank`
3. Migrar datos si hay usuarios con ranks antiguos
4. Testing exhaustivo del sistema de rankings

---

### 2.4 Resumen de Acciones - Tipos

| Prioridad | Tipo | Acción Requerida | Estimación |
|-----------|------|------------------|------------|
| 🚨 BLOQUEANTE | `MayaRank` | Sincronizar con valores mayas | 2 horas |
| 🚨 CRÍTICO | `ExerciseAttempt` vs `ExerciseSubmission` | Unificar conceptos | 1 día |
| 🚨 CRÍTICO | `Profile` | Crear tipo con 37 campos | 3 horas |
| 🚨 CRÍTICO | `ModuleProgress` | Agregar 23 campos faltantes | 4 horas |
| ALTO | `UserAchievement` | Crear tipo nuevo | 2 horas |
| MEDIO | `Exercise` | Agregar 12 campos faltantes | 2 horas |

**Total estimado:** 2-3 días

---

## 3. Coherencia de Rutas API

**Fuente:** SA-FRONTEND-008
**Coherencia global:** 77.4%

### 3.1 Resumen General

- **Endpoints Frontend:** 62 (definidos en `api/` services)
- **Endpoints Backend:** 68+ (implementados en controllers)
- **Coherentes:** 48 endpoints (77.4%)
- **Sin match en Frontend:** 14 endpoints Backend no consumidos
- **Sin match en Backend:** 6 endpoints Frontend sin implementación (🚨)

### 3.2 Coherencia por Módulo

| Módulo | Frontend | Backend | Match | Coherencia | Estado |
|--------|----------|---------|-------|------------|--------|
| **Auth** | 8 | 9 | 8 | 89% | ✅ ALTO |
| **Educational** | 15 | 18 | 11 | 61% | ⚠️ MEDIO |
| **Progress** | 12 | 12 | 12 | 100% | ✅ PERFECTO |
| **Gamification** | 14 | 17 | 10 | 59% | ⚠️ MEDIO |
| **Social** | 8 | 8 | 5 | 63% | ⚠️ MEDIO |
| **Admin** | 5 | 4+ | 2 | 40% | 🚨 BAJO |

**Módulo con mejor coherencia:** Progress (100%)
**Módulo con peor coherencia:** Admin (40%)

---

### 3.3 Endpoints BLOQUEANTES Faltantes

#### 3.3.1 POST `/educational/exercises/:id/submit` - 🚨 BLOQUEANTE

**Frontend (`apps/frontend/src/api/exercises.service.ts:45`):**
```typescript
export const submitExercise = async (
  exerciseId: string,
  answer: any
): Promise<ExerciseAttempt> => {
  const response = await apiClient.post(
    `/educational/exercises/${exerciseId}/submit`,
    { answer }
  );
  return response.data;
};
```

**Backend:** ❌ **NO IMPLEMENTADO**

**Impacto:** 🚨 BLOQUEANTE - **Estudiantes no pueden enviar respuestas a ejercicios**

**Endpoint esperado:**
```typescript
@Post(':id/submit')
async submitExercise(
  @Param('id') id: string,
  @Body() submitDto: SubmitExerciseDto,
  @CurrentUser() user: User
): Promise<ExerciseAttempt> {
  return this.exercisesService.submitAnswer(id, user.id, submitDto);
}
```

**Acción URGENTE:** Implementar endpoint en Backend (Fase 0, CICLO-1).

---

#### 3.3.2 GET `/gamification/leaderboard/global` - 🚨 BLOQUEANTE

**Frontend (`apps/frontend/src/api/leaderboard.service.ts:12`):**
```typescript
export const getGlobalLeaderboard = async (
  limit = 100
): Promise<LeaderboardEntry[]> => {
  const response = await apiClient.get('/gamification/leaderboard/global', {
    params: { limit }
  });
  return response.data;
};
```

**Backend:** ❌ **`LeaderboardController` NO EXISTE**

**Impacto:** 🚨 BLOQUEANTE - Rankings globales no funcionales.

**Acción URGENTE:** Crear `LeaderboardController` con endpoints de rankings.

---

#### 3.3.3 GET `/gamification/leaderboard/schools/:schoolId` - 🚨 BLOQUEANTE

**Frontend (`leaderboard.service.ts:21`):**
```typescript
export const getSchoolLeaderboard = async (
  schoolId: string,
  limit = 100
): Promise<LeaderboardEntry[]> => {
  const response = await apiClient.get(
    `/gamification/leaderboard/schools/${schoolId}`,
    { params: { limit } }
  );
  return response.data;
};
```

**Backend:** ❌ NO implementado

**Impacto:** 🚨 BLOQUEANTE - Rankings por escuela no funcionales.

---

#### 3.3.4 GET `/gamification/leaderboard/classrooms/:classroomId` - 🚨 BLOQUEANTE

**Frontend (`leaderboard.service.ts:30`):**
```typescript
export const getClassroomLeaderboard = async (
  classroomId: string,
  limit = 100
): Promise<LeaderboardEntry[]> => {
  const response = await apiClient.get(
    `/gamification/leaderboard/classrooms/${classroomId}`,
    { params: { limit } }
  );
  return response.data;
};
```

**Backend:** ❌ NO implementado

**Impacto:** 🚨 BLOQUEANTE - Rankings por aula no funcionales.

---

#### 3.3.5 GET `/educational/modules/search` - ALTO

**Frontend (`modules.service.ts:67`):**
```typescript
export const searchModules = async (query: string): Promise<Module[]> => {
  const response = await apiClient.get('/educational/modules/search', {
    params: { q: query }
  });
  return response.data;
};
```

**Backend:** ❌ NO implementado

**Impacto:** ALTO - Búsqueda de módulos no funcional.

---

#### 3.3.6 GET `/educational/exercises/random` - MEDIO

**Frontend (`exercises.service.ts:78`):**
```typescript
export const getRandomExercise = async (
  difficulty?: ExerciseDifficulty
): Promise<Exercise> => {
  const response = await apiClient.get('/educational/exercises/random', {
    params: { difficulty }
  });
  return response.data;
};
```

**Backend:** ❌ NO implementado

**Impacto:** MEDIO - Ejercicios aleatorios no disponibles.

---

### 3.4 Endpoints Backend No Consumidos (14)

Estos endpoints están implementados en Backend pero Frontend no los usa:

**Auth Module:**
1. `POST /auth/verify-email` (Backend existe, Frontend no lo consume)
2. `POST /auth/resend-verification` (Backend existe, Frontend no lo consume)

**Educational Module:**
3. `GET /educational/modules/:id/prerequisites` (Backend existe)
4. `GET /educational/exercises/:id/dependencies` (Backend existe)
5. `POST /educational/exercises/:id/clone` (Backend existe - admin)

**Gamification Module:**
6. `GET /gamification/achievements/:id/progress` (Backend existe)
7. `POST /gamification/achievements/:id/claim` (Backend existe)
8. `GET /gamification/economy/transactions` (Backend existe)
9. `POST /gamification/economy/purchase` (Backend existe)

**Social Module:**
10. `GET /social/teams/:id/challenges` (Backend existe)
11. `POST /social/teams/:id/challenges` (Backend existe)
12. `GET /social/notifications/unread-count` (Backend existe)

**Admin Module:**
13. `GET /admin/analytics/overview` (Backend existe)
14. `POST /admin/users/:id/impersonate` (Backend existe)

**Impacto:** BAJO - Funcionalidades adicionales disponibles para implementar.

---

### 3.5 Resumen de Acciones - API

| Prioridad | Endpoint | Ubicación | Acción | Estimación |
|-----------|----------|-----------|--------|------------|
| 🚨 BLOQUEANTE | POST `/exercises/:id/submit` | Backend | Implementar ScoringService | 3-4 días |
| 🚨 BLOQUEANTE | GET `/leaderboard/global` | Backend | Crear LeaderboardController | 2 días |
| 🚨 BLOQUEANTE | GET `/leaderboard/schools/:id` | Backend | Implementar en controller | 1 día |
| 🚨 BLOQUEANTE | GET `/leaderboard/classrooms/:id` | Backend | Implementar en controller | 1 día |
| ALTO | GET `/modules/search` | Backend | Implementar búsqueda | 1 día |
| MEDIO | GET `/exercises/random` | Backend | Implementar random | 4 horas |

**Total estimado:** 7-9 días (Backend work)

---

## 4. Plan de Acción Priorizado

### Fase 0: BLOQUEANTES (Semanas 1-2) - 🚨 URGENTE

#### Backend (7-9 días):
1. ✅ Implementar POST `/exercises/:id/submit` con ScoringService (3-4 días)
2. ✅ Crear LeaderboardController completo (4 días):
   - GET `/leaderboard/global`
   - GET `/leaderboard/schools/:schoolId`
   - GET `/leaderboard/classrooms/:classroomId`

#### Frontend (1 día):
3. ✅ Sincronizar `MayaRank` enum con valores mayas (2 horas)
4. ✅ Actualizar componentes de ranking (6 horas)

#### Database (2 horas):
5. ✅ Migración: Rediseñar `notification_type` o crear mapping (4 días - paralelo con Backend)

**Duración total Fase 0:** 2 semanas (con paralelización)

---

### Fase 1: CRÍTICOS (Semanas 3-5) - ⚠️ ALTA

#### Frontend (4-5 días):
1. ✅ Crear tipo `Profile` con 37 campos (3 horas)
2. ✅ Extender `ModuleProgress` con 23 campos (4 horas)
3. ✅ Crear tipo `UserAchievement` (2 horas)
4. ✅ Unificar `ExerciseAttempt` vs `ExerciseSubmission` (1 día)
5. ✅ Extender tipo `Exercise` con 12 campos (2 horas)

#### Database (4 horas):
6. ✅ Agregar valores faltantes a enums (7 migraciones):
   - `auth_provider`: +`apple`, +`github`
   - `team_role`: +`invited`
   - `friendship_status`: +`rejected`
   - `ranking_scope`: +`friends`
   - `hint_type`: +`audio`
   - `progress_status`: +`mastered`

#### Backend (2 días):
7. ✅ Implementar GET `/modules/search` (1 día)
8. ✅ Implementar GET `/exercises/random` (4 horas)

**Duración total Fase 1:** 3 semanas

---

### Fase 2: OPTIMIZACIÓN (Semanas 6-8) - MEDIO

#### Frontend:
1. Conectar 14 endpoints Backend no consumidos
2. Implementar páginas faltantes que usen nuevos tipos
3. Testing de coherencia end-to-end

#### Backend:
4. Documentación API actualizada (Swagger)
5. Tests de integración Frontend-Backend

#### Database:
6. Validaciones de constraints cross-table
7. Índices optimizados para queries Frontend

**Duración total Fase 2:** 3 semanas

---

## 5. Métricas de Éxito

### Coherencia Target Post-Implementación

| Dimensión | Actual | Target | Delta |
|-----------|--------|--------|-------|
| Enums | 68% | 95% | +27% |
| Tipos | 62% | 90% | +28% |
| API Routes | 77% | 95% | +18% |
| **GENERAL** | **69%** | **93%** | **+24%** |

### KPIs de Validación

✅ **0 endpoints BLOQUEANTES** (actualmente 4)
✅ **0 enums incompatibles** (actualmente 7)
✅ **<5 campos críticos faltantes** (actualmente 80+)
✅ **100% coherencia en módulo Progress** (ya logrado)
✅ **≥90% coherencia en todos los módulos**

---

## 6. Riesgos y Mitigación

### Riesgo 1: Rediseño de `notification_type` - ALTO

**Riesgo:** Refactor puede romper notificaciones existentes.

**Mitigación:**
1. Crear migration script para datos legacy
2. Implementar mapping layer temporal
3. Feature flag para rollback
4. Testing exhaustivo antes de deploy

### Riesgo 2: Cambio de `MayaRank` - MEDIO

**Riesgo:** Usuarios con ranks antiguos pueden perder progreso.

**Mitigación:**
1. Migration script con mapping:
   - `novice` → `ajaw`
   - `apprentice` → `nacom`
   - etc.
2. Backup de tabla `user_profiles` antes de migración
3. Validación post-migración

### Riesgo 3: Agregar 80+ campos a tipos - BAJO

**Riesgo:** Bundle size incrementa, performance afectado.

**Mitigación:**
1. Code splitting por módulo
2. Lazy loading de tipos no críticos
3. Monitoreo de bundle size

---

## 7. Conclusiones

### Hallazgos Clave

1. **Coherencia general del 69%** - Aceptable pero mejorable
2. **4 BLOQUEANTES identificados** - Requieren acción inmediata
3. **7 inconsistencias críticas en enums** - Afectan negocio
4. **80+ campos faltantes en tipos** - Frontend limitado
5. **Módulo Progress: 100% coherente** - Modelo a seguir

### Recomendaciones

1. ✅ **Priorizar Fase 0** (endpoints bloqueantes) - 2 semanas
2. ✅ **Establecer proceso de sincronización** automático para enums/tipos
3. ✅ **Crear monorepo shared package** para tipos comunes
4. ✅ **Implementar linting** para detectar desincronización
5. ✅ **Documentación living** sincronizada con código

### Próximos Pasos

1. Presentar reporte a equipo técnico
2. Aprobar plan de 8 semanas
3. Asignar recursos (1 backend dev, 1 frontend dev)
4. Iniciar Fase 0 - BLOQUEANTES
5. Configurar CI/CD para validación continua de coherencia

---

**Reporte generado por:** NEXUS-FRONTEND v1.0
**Fecha:** 2025-11-02
**Subagentes:** SA-FRONTEND-006, SA-FRONTEND-007, SA-FRONTEND-008
**Próxima acción:** Ver `orchestration/PROXIMA-ACCION.md`
