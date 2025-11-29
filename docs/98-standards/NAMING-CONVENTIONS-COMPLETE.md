# ESTÁNDARES DE NOMENCLATURA COMPLETOS - GAMILIT

**Versión:** 1.0.0
**Fecha:** 2025-11-29
**Fuente:** Consolidado desde orchestration/directivas/ESTANDARES-NOMENCLATURA.md
**Audiencia:** Todos los agentes y desarrolladores (Database, Backend, Frontend)

---

## PROPÓSITO

Este documento establece las **convenciones de nomenclatura obligatorias** para todos los elementos del proyecto:

- Archivos y carpetas
- Objetos de base de datos
- Código Backend (TypeScript/NestJS)
- Código Frontend (React/React Native)
- Constantes y configuraciones

**Objetivo:** Mantener consistencia, legibilidad y predictibilidad en todo el codebase.

---

## PRINCIPIOS GENERALES

### 1. Consistencia Absoluta

```markdown
✅ Usar SIEMPRE la misma convención para elementos del mismo tipo
❌ NO mezclar convenciones (ej: user_name y userName en mismo contexto)
```

### 2. Claridad sobre Brevedad

```markdown
✅ `projectDevelopmentPhase` (claro)
❌ `pdp` (ambiguo)

✅ `calculateMonthlyBudget()` (claro)
❌ `calcMoBud()` (ambiguo)
```

### 3. Predictibilidad

```markdown
Si existe `ProjectEntity`, entonces:
- Service: `ProjectService` (NO `ProjectsService`, `ProjService`)
- Controller: `ProjectController` (NO `ProjectsController`)
- DTO Create: `CreateProjectDto` (NO `ProjectCreateDto`, `NewProjectDto`)
- DTO Update: `UpdateProjectDto`
```

### 4. Evitar Ambigüedad

```markdown
❌ `data` (¿qué data?)
✅ `projectData`, `userData`, `contractData`

❌ `temp` (¿temporal de qué?)
✅ `tempFileName`, `tempContract`

❌ `result` (¿resultado de qué?)
✅ `calculationResult`, `queryResult`, `validationResult`
```

---

## 1. BASE DE DATOS (PostgreSQL)

### 1.1. Schemas

**Convención:** `snake_case` + sufijo descriptivo

```sql
-- ✅ CORRECTO
auth_management
gamification_system
educational_content
progress_tracking
social_features

-- ❌ INCORRECTO
Auth              -- Pascal case
auth_mgmt         -- Abreviatura no estándar
authentication    -- Sin sufijo descriptivo
```

**Schemas de GAMILIT:**

| Schema | Propósito |
|--------|-----------|
| `auth_management` | Autenticación, usuarios y tenants |
| `educational_content` | Módulos, ejercicios, media |
| `gamification_system` | Achievements, rangos, ML coins, comodines |
| `progress_tracking` | Intentos, submissions, progreso de módulos |
| `social_features` | Escuelas, aulas, equipos, amistades |
| `notifications` | Notificaciones multi-canal |
| `content_management` | Templates, media, contenido |
| `audit_logging` | Logs y auditoría del sistema |

### 1.2. Tablas

**Convención:** `snake_case`, plural para colecciones

```sql
-- ✅ CORRECTO
users
projects
exercise_attempts
module_progress
maya_ranks

-- ❌ INCORRECTO
Users              -- Pascal case
user               -- Singular (excepción: tablas de configuración)
projectDevelopments -- Camel case
```

**Reglas:**
1. **Plural para entidades:** `users`, `exercises`, `achievements`
2. **Singular para configuración:** `system_configuration`
3. **Tablas M:N:** `{tabla1}_{tabla2}` (ambas en plural)

### 1.3. Columnas

**Convención:** `snake_case`

```sql
-- ✅ CORRECTO
id
user_id
created_at
full_name
is_active
total_amount

-- ❌ INCORRECTO
Id                  -- Pascal case
userId              -- Camel case
createdAt           -- Camel case
```

**Patrones Estándar:**

```sql
-- Primary Key
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Foreign Keys
{tabla_singular}_id UUID NOT NULL
-- Ejemplos: user_id, project_id, created_by_id

-- Timestamps
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
deleted_at TIMESTAMPTZ  -- Para soft delete

-- Booleanos (prefijo is_, has_, can_)
is_active BOOLEAN NOT NULL DEFAULT true
has_access BOOLEAN NOT NULL DEFAULT false
can_edit BOOLEAN NOT NULL DEFAULT false

-- Estados (sufijo _status)
exercise_status VARCHAR(20) NOT NULL
submission_status VARCHAR(20) NOT NULL
```

### 1.4. Índices

**Convención:** `idx_{tabla}_{columna(s)}`

```sql
-- ✅ CORRECTO - Índice simple
CREATE INDEX idx_users_email ON auth_management.users(email);
CREATE INDEX idx_exercises_module_id ON educational_content.exercises(module_id);

-- ✅ CORRECTO - Índice compuesto
CREATE INDEX idx_attempts_user_exercise
    ON progress_tracking.exercise_attempts(user_id, exercise_id);

-- ✅ CORRECTO - Índice parcial
CREATE INDEX idx_users_active_email
    ON auth_management.users(email) WHERE is_active = true;

-- ❌ INCORRECTO
users_email_idx         -- Orden incorrecto
ix_users_email          -- Prefijo no estándar
idx_email               -- Falta nombre tabla
```

### 1.5. Constraints

#### Foreign Keys

**Convención:** `fk_{tabla_origen}_to_{tabla_destino}`

```sql
-- ✅ CORRECTO
CONSTRAINT fk_exercises_to_modules
    FOREIGN KEY (module_id)
    REFERENCES educational_content.modules(id)
    ON DELETE CASCADE

-- ✅ Con sufijo descriptivo
CONSTRAINT fk_exercises_to_users_creator
    FOREIGN KEY (created_by_id)
    REFERENCES auth_management.users(id)
```

#### Check Constraints

**Convención:** `chk_{tabla}_{columna}`

```sql
-- ✅ CORRECTO
CONSTRAINT chk_exercises_difficulty
    CHECK (difficulty IN ('easy', 'medium', 'hard'))

CONSTRAINT chk_user_stats_xp_range
    CHECK (total_xp >= 0)
```

#### Unique Constraints

**Convención:** `uq_{tabla}_{columna(s)}`

```sql
-- ✅ CORRECTO
CONSTRAINT uq_users_email UNIQUE (email)
CONSTRAINT uq_exercises_module_order UNIQUE (module_id, display_order)
```

### 1.6. Functions y Triggers

```sql
-- Functions: verbo + sustantivo
CREATE FUNCTION calculate_user_xp(user_id UUID) ...
CREATE FUNCTION award_achievement(user_id UUID, achievement_id UUID) ...
CREATE FUNCTION update_module_progress(user_id UUID, module_id UUID) ...

-- Views: prefijo v_ o vw_
CREATE VIEW gamification_system.v_leaderboard_global AS ...
CREATE VIEW progress_tracking.v_student_progress AS ...

-- Triggers: trg_{tabla}_{evento}_{acción}
CREATE TRIGGER trg_users_before_update_timestamp ...
CREATE TRIGGER trg_attempts_after_insert_update_stats ...
```

---

## 2. BACKEND (NestJS + TypeScript + TypeORM)

### 2.1. Entities

**Convención:** `PascalCase` + sufijo `.entity.ts`

```typescript
// ✅ CORRECTO
export class UserEntity { ... }
export class ExerciseEntity { ... }
export class ModuleProgressEntity { ... }

// ❌ INCORRECTO
export class User { ... }              // Sin contexto
export class userEntity { ... }        // Camel case
export class Users { ... }             // Plural
```

**Archivo:** `{nombre}.entity.ts` (singular, kebab-case)

```
user.entity.ts                    // ✅
exercise-attempt.entity.ts        // ✅
module-progress.entity.ts         // ✅
```

### 2.2. Properties

**Convención:** `camelCase`

```typescript
export class ExerciseEntity {
    id: string;
    moduleId: string;              // Mapea a module_id en DB
    exerciseType: string;          // Mapea a exercise_type
    createdAt: Date;               // Mapea a created_at
    isActive: boolean;
}
```

### 2.3. Services

**Convención:** `PascalCase` + sufijo `Service`

```typescript
// ✅ CORRECTO
export class ExerciseService { ... }
export class UserStatsService { ... }
export class ModuleProgressService { ... }

// ❌ INCORRECTO
export class ExercisesService { ... }    // Plural
export class exerciseService { ... }     // Camel case
```

**Archivo:** `{nombre}.service.ts`

**Métodos:**

```typescript
export class ExerciseService {
    // Queries
    async findAll(): Promise<ExerciseEntity[]> { ... }
    async findById(id: string): Promise<ExerciseEntity> { ... }
    async findByModule(moduleId: string): Promise<ExerciseEntity[]> { ... }

    // Mutations
    async create(dto: CreateExerciseDto): Promise<ExerciseEntity> { ... }
    async update(id: string, dto: UpdateExerciseDto): Promise<ExerciseEntity> { ... }
    async delete(id: string): Promise<void> { ... }

    // Business logic
    async submitAnswer(userId: string, exerciseId: string, answer: any) { ... }
    async calculateScore(attemptId: string): Promise<number> { ... }
}
```

### 2.4. Controllers

**Convención:** `PascalCase` + sufijo `Controller`

```typescript
// ✅ CORRECTO
@Controller('exercises')
export class ExerciseController { ... }

@Controller('modules')
export class ModuleController { ... }
```

**Archivo:** `{nombre}.controller.ts`

### 2.5. DTOs

**Convención:** `PascalCase` + prefijo de acción + sufijo `Dto`

```typescript
// ✅ CORRECTO
export class CreateExerciseDto { ... }
export class UpdateExerciseDto { ... }
export class ExerciseResponseDto { ... }
export class SubmitAnswerDto { ... }

// ❌ INCORRECTO
export class ExerciseDto { ... }            // Sin prefijo
export class ExerciseCreateDto { ... }      // Orden incorrecto
export class NewExercise { ... }            // Sin sufijo Dto
```

**Archivo:** `{accion}-{nombre}.dto.ts`

```
create-exercise.dto.ts              // ✅
update-exercise.dto.ts              // ✅
exercise-response.dto.ts            // ✅
submit-answer.dto.ts                // ✅
```

### 2.6. Enums

**Convención:** `PascalCase`, valores `UPPER_SNAKE_CASE`

```typescript
// ✅ CORRECTO
export enum ExerciseStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived'
}

export enum MayaRank {
    NOVATO = 'novato',
    APRENDIZ = 'aprendiz',
    EXPERTO = 'experto',
    MAESTRO = 'maestro',
    SABIO = 'sabio',
    GUARDIAN = 'guardian',
    LEYENDA = 'leyenda'
}

export enum ComodinType {
    HINT = 'hint',
    TIME_FREEZE = 'time_freeze',
    RETRY = 'retry',
    SKIP = 'skip'
}
```

### 2.7. Constantes

**Convención:** `UPPER_SNAKE_CASE`

```typescript
// ✅ CORRECTO
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const MAX_EXERCISE_ATTEMPTS = 3;
export const DEFAULT_PAGE_SIZE = 20;
export const XP_MULTIPLIER_BASE = 1.0;
```

---

## 3. FRONTEND (React + TypeScript)

### 3.1. Componentes

**Convención:** `PascalCase`, sin sufijo

```typescript
// ✅ CORRECTO
export const ExerciseCard = () => { ... };
export const LeaderboardEntry = () => { ... };
export const MayaRankBadge = () => { ... };

// ❌ INCORRECTO
export const exerciseCard = () => { ... };     // Camel case
export const ExerciseCardComponent = () => { ... }; // Sufijo redundante
```

**Archivo:** `{NombreComponente}.tsx` (PascalCase)

```
ExerciseCard.tsx                    // ✅
LeaderboardEntry.tsx                // ✅
MayaRankBadge.tsx                   // ✅
```

### 3.2. Páginas

**Convención:** `PascalCase` + sufijo `Page`

```typescript
// ✅ CORRECTO
export const ExercisesPage = () => { ... };
export const LeaderboardPage = () => { ... };
export const DashboardPage = () => { ... };
```

**Archivo:** `{NombrePage}.tsx`

### 3.3. Hooks Personalizados

**Convención:** `camelCase` + prefijo `use`

```typescript
// ✅ CORRECTO
export const useExercises = () => { ... };
export const useUserStats = () => { ... };
export const useLeaderboard = () => { ... };

// ❌ INCORRECTO
export const exercises = () => { ... };        // Sin prefijo
export const UseExercises = () => { ... };     // Pascal case
```

**Archivo:** `{hookName}.ts`

```
useExercises.ts                     // ✅
useUserStats.ts                     // ✅
useModuleProgress.ts                // ✅
```

### 3.4. Stores (Zustand)

**Convención:** `camelCase` + sufijo `Store`

```typescript
// ✅ CORRECTO
export const useExerciseStore = create(() => { ... });
export const useAuthStore = create(() => { ... });
export const useGamificationStore = create(() => { ... });
```

**Archivo:** `{nombre}Store.ts`

### 3.5. Services (API)

**Convención:** `camelCase` + sufijo `Service`

```typescript
// ✅ CORRECTO
export const exerciseService = { ... };
export const authService = { ... };
export const gamificationService = { ... };
```

**Archivo:** `{nombre}Service.ts`

### 3.6. Types

**Convención:** `PascalCase`, sin prefijo `I`

```typescript
// ✅ CORRECTO
export interface Exercise { ... }
export interface UserStats { ... }
export interface MayaRankInfo { ... }
export type ExerciseType = 'crucigrama' | 'detective_textual' | ...;

// ❌ INCORRECTO
export interface IExercise { ... }          // Prefijo I (evitar)
export interface exercise { ... }           // Camel case
```

### 3.7. CSS Classes

**Convención:** `kebab-case` (BEM opcional)

```css
/* ✅ CORRECTO */
.exercise-card { ... }
.leaderboard-entry { ... }
.maya-rank-badge { ... }

/* ✅ CORRECTO - BEM */
.exercise-card { ... }
.exercise-card__header { ... }
.exercise-card__body { ... }
.exercise-card--active { ... }

/* ❌ INCORRECTO */
.ExerciseCard { ... }            /* Pascal case */
.exercise_card { ... }           /* Snake case */
```

---

## 4. ARCHIVOS Y CARPETAS

### 4.1. Carpetas

**Convención:** `kebab-case` (lowercase con guiones)

```
apps/
  database/
    ddl/
      schemas/
        gamification-system/
        educational-content/
  backend/
    src/
      modules/
        exercises/
        gamification/
  frontend/
    web/
      src/
        features/
          student-portal/
        components/
```

### 4.2. Archivos Database (SQL)

**Convención:** `{NN}-{nombre}.sql`

```
01-users.sql
02-roles.sql
10-exercises.sql
11-exercise-attempts.sql
```

### 4.3. Archivos Backend

**Convención:** `{nombre}.{tipo}.ts`

```
exercise.entity.ts
exercise.service.ts
exercise.controller.ts
create-exercise.dto.ts
exercise-status.enum.ts
```

### 4.4. Archivos Frontend

**Por tipo:**

```
# Componentes/Páginas (PascalCase)
ExerciseCard.tsx
ExercisesPage.tsx

# Hooks/Services/Stores (camelCase)
useExercises.ts
exerciseService.ts
exerciseStore.ts

# Types/Utils (kebab-case)
exercise.types.ts
date-utils.ts
```

---

## 5. QUICK REFERENCE

### Resumen por Capa

| Capa | Archivos | Clases/Objetos | Variables | Constantes |
|------|----------|----------------|-----------|------------|
| **Database** | `kebab-case.sql` | `snake_case` | N/A | N/A |
| **Backend** | `kebab-case.{tipo}.ts` | `PascalCase` + sufijo | `camelCase` | `UPPER_SNAKE_CASE` |
| **Frontend** | Componentes: `PascalCase.tsx`, Otros: `camelCase.ts` | `PascalCase` | `camelCase` | `UPPER_SNAKE_CASE` |
| **Docs** | `UPPER-CASE.md` o `kebab-case.md` | N/A | N/A | N/A |

### Sufijos Comunes

| Tipo | Backend | Frontend |
|------|---------|----------|
| Entity | `ExerciseEntity` | N/A |
| Service | `ExerciseService` | `exerciseService` |
| Controller | `ExerciseController` | N/A |
| DTO | `CreateExerciseDto` | N/A |
| Componente | N/A | `ExerciseCard` |
| Página | N/A | `ExercisesPage` |
| Hook | N/A | `useExercises` |
| Store | N/A | `useExerciseStore` |

### Prefijos Comunes

| Contexto | Prefijo | Ejemplo |
|----------|---------|---------|
| Índice DB | `idx_` | `idx_exercises_module_id` |
| Foreign Key | `fk_` | `fk_exercises_to_modules` |
| Check Constraint | `chk_` | `chk_exercises_difficulty` |
| Unique Constraint | `uq_` | `uq_users_email` |
| View | `v_` o `vw_` | `v_leaderboard_global` |
| Trigger | `trg_` | `trg_attempts_after_insert` |
| Boolean | `is_`, `has_`, `can_` | `isActive`, `hasAchievement` |
| Hook | `use` | `useExercises` |

---

## 6. VALIDACIÓN

### Checklist de Auto-Validación

**Antes de crear cualquier archivo/objeto:**

- [ ] ¿Usé la convención correcta para la capa (DB/Backend/Frontend)?
- [ ] ¿El nombre es claro y no ambiguo?
- [ ] ¿Sigue el patrón establecido para su tipo?
- [ ] ¿Es consistente con otros elementos similares?
- [ ] ¿Usé el sufijo/prefijo correcto?
- [ ] ¿El caso (camel/Pascal/snake/kebab) es correcto?
- [ ] ¿El nombre del archivo coincide con el contenido?

---

## APLICACIÓN OBLIGATORIA

```markdown
⚠️ TODOS los agentes y desarrolladores DEBEN:

1. ✅ CONSULTAR este documento ANTES de crear cualquier archivo/objeto
2. ✅ VALIDAR nombres contra este estándar ANTES de commitear
3. ✅ RECHAZAR PRs si nombres no cumplen estándar
4. ✅ CORREGIR nombres si se detectan violaciones

❌ PROHIBIDO:
- Asumir convenciones sin consultar
- Mezclar convenciones de diferentes lenguajes
- Usar abreviaturas no estándar
- Ignorar este documento "para ir más rápido"
```

---

**Última actualización:** 2025-11-29
**Fuente original:** orchestration/directivas/ESTANDARES-NOMENCLATURA.md
**Mantenido por:** Architecture-Analyst
