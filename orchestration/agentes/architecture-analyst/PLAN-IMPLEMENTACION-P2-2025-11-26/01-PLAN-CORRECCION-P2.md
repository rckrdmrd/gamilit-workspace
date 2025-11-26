# PLAN DE IMPLEMENTACIÓN - CORRECCIONES P2

**Fecha:** 2025-11-26
**Fase:** Planeación de Implementación
**Prioridad:** P2 (Medio)
**Estado:** APROBADO PARA EJECUCIÓN

---

## 1. RESUMEN EJECUTIVO

Este plan detalla las correcciones necesarias para los issues P2 identificados en la validación de integración DB→Backend→Frontend.

### Métricas de Impacto

| Issue | Archivos Afectados | Campos a Agregar | Prioridad |
|-------|-------------------|------------------|-----------|
| DeviceTypeEnum | 2 (BE + FE) | 1 valor | ALTA |
| User Type | 2-3 FE | 7-13 campos | MEDIA |
| Achievement Type | 2-3 FE | 9 campos | MEDIA |
| Classroom Type | 2-3 FE | 14 campos | MEDIA |
| ExerciseSubmission | 1-2 FE | 8+ campos + correcciones | ALTA |

---

## 2. CORRECCIÓN #1: DeviceTypeEnum

### 2.1 Problema
- Database permite: `desktop, mobile, tablet, unknown`
- Backend/Frontend solo tienen: `desktop, mobile, tablet`
- Falta: `UNKNOWN = 'unknown'`

### 2.2 Archivos a Modificar

**Backend:**
```
apps/backend/src/shared/constants/enums.constants.ts
Líneas: 89-93
```

**Frontend:**
```
apps/frontend/src/shared/constants/enums.constants.ts
Líneas: 89-93
```

### 2.3 Cambio Específico

```typescript
// ANTES
export enum DeviceTypeEnum {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
}

// DESPUÉS
export enum DeviceTypeEnum {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  UNKNOWN = 'unknown',  // v1.1: Alineado con DDL user_sessions (2025-11-26)
}
```

### 2.4 Validación
- Verificar que DTO `CreateUserSessionDto` ya acepta 'unknown' (CONFIRMADO)
- Verificar tests no fallen

---

## 3. CORRECCIÓN #2: ExerciseSubmission Type (CRÍTICO)

### 3.1 Problema
- Campo `submission_data` debe ser `answer_data`
- Campo fantasma `attempt_id` no existe en DB
- Faltan 8+ campos críticos

### 3.2 Archivo a Modificar

```
apps/frontend/src/shared/types/progress.types.ts
Líneas: 339-352
```

### 3.3 Cambio Específico

```typescript
// ANTES (INCORRECTO)
export interface ExerciseSubmission {
  id: string;
  attempt_id: string;  // ❌ NO EXISTE EN DB
  user_id: string;
  exercise_id: string;
  submission_data: Record<string, any>;  // ❌ NOMBRE INCORRECTO
  score: number;
  max_score: number;
  is_correct: boolean;
  feedback: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

// DESPUÉS (CORRECTO - Alineado con Backend Entity)
export interface ExerciseSubmission {
  id: string;
  user_id: string;
  exercise_id: string;
  answer_data: Record<string, any>;  // ✅ Nombre correcto
  is_correct: boolean | null;
  score: number;
  max_score: number;
  feedback: string | null;
  hint_used: boolean;                 // ✅ AGREGADO
  hints_count: number;                // ✅ AGREGADO
  comodines_used: string[] | null;    // ✅ AGREGADO
  ml_coins_spent: number;             // ✅ AGREGADO
  time_spent_seconds: number | null;  // ✅ AGREGADO
  attempt_number: number;             // ✅ AGREGADO
  status: 'draft' | 'submitted' | 'graded' | 'reviewed';  // ✅ AGREGADO
  started_at: string | null;          // ✅ AGREGADO
  submitted_at: string;
  graded_at: string | null;           // ✅ AGREGADO
  created_at: string;
  updated_at: string;
}
```

### 3.4 Archivos Dependientes a Revisar
- `apps/frontend/src/features/exercises/types/exercise.types.ts`
- `apps/frontend/src/features/progress/api/progressAPI.ts`
- Componentes que usan `submission_data`

---

## 4. CORRECCIÓN #3: Achievement Type (Unificación)

### 4.1 Problema
- 3 definiciones diferentes de Achievement en Frontend
- 9 campos faltantes en tipos públicos
- AdminAchievement está completo pero tipos públicos no

### 4.2 Archivos a Modificar

**Principal:**
```
apps/frontend/src/shared/types/achievement.types.ts
```

**Secundarios (deprecar o alinear):**
```
apps/frontend/src/features/gamification/social/types/achievementsTypes.ts
```

### 4.3 Cambio Específico

```typescript
// Agregar campos faltantes a Achievement interface:
export interface Achievement {
  // Campos existentes...
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';

  // CAMPOS A AGREGAR:
  tenant_id?: string;                    // ✅ AGREGAR
  difficulty_level?: DifficultyLevelEnum; // ✅ AGREGAR
  is_secret: boolean;                    // ✅ AGREGAR
  is_active: boolean;                    // ✅ AGREGAR
  is_repeatable: boolean;                // ✅ AGREGAR
  order_index: number;                   // ✅ AGREGAR
  points_value: number;                  // ✅ AGREGAR
  metadata?: Record<string, any>;        // ✅ AGREGAR
  created_by?: string;                   // ✅ AGREGAR

  // Campos de condiciones/rewards (ya existen parcialmente)
  conditions: Record<string, any>;
  rewards: AchievementReward;
  ml_coins_reward?: number;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}
```

---

## 5. CORRECCIÓN #4: Classroom Type (Unificación)

### 5.1 Problema
- 3+ definiciones parciales de Classroom
- 14 campos faltantes
- Inconsistencia snake_case vs camelCase

### 5.2 Archivo Principal

```
apps/frontend/src/shared/types/social.types.ts
Líneas: 103-113
```

### 5.3 Cambio Específico

```typescript
// Expandir Classroom interface con campos faltantes:
export interface Classroom {
  // Campos existentes
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  teacher_id: string;
  school_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // CAMPOS A AGREGAR (14):
  tenant_id: string;                     // ✅ AGREGAR
  grade_level: string | null;            // ✅ AGREGAR
  section: string | null;                // ✅ AGREGAR
  subject: string | null;                // ✅ AGREGAR
  academic_year: string | null;          // ✅ AGREGAR
  semester: string | null;               // ✅ AGREGAR
  co_teachers: string[] | null;          // ✅ AGREGAR
  capacity: number;                      // ✅ AGREGAR
  current_students_count: number;        // ✅ AGREGAR
  settings: ClassroomSettings | null;    // ✅ AGREGAR
  schedule: ClassroomSchedule[] | null;  // ✅ AGREGAR
  meeting_url: string | null;            // ✅ AGREGAR
  is_archived: boolean;                  // ✅ AGREGAR
  start_date: string | null;             // ✅ AGREGAR
  end_date: string | null;               // ✅ AGREGAR
  metadata: Record<string, any> | null;  // ✅ AGREGAR
}

// Tipos auxiliares a crear:
export interface ClassroomSettings {
  require_approval: boolean;
  visible_in_directory: boolean;
  allow_self_enrollment: boolean;
}

export interface ClassroomSchedule {
  day: string;
  start_time: string;
  end_time: string;
}
```

---

## 6. CORRECCIÓN #5: User Type (Expansión)

### 6.1 Problema
- 7-13 campos faltantes según contexto
- Fragmentación entre User y Profile types

### 6.2 Archivo Principal

```
apps/frontend/src/features/auth/types/auth.types.ts
```

### 6.3 Cambio Específico

```typescript
// Expandir User interface:
export interface User {
  // Campos existentes
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  fullName?: string;
  createdAt?: string;
  isActive?: boolean;
  tenantId?: string;
  schoolId?: string;
  emailVerified?: boolean;

  // CAMPOS A AGREGAR (7 críticos):
  avatar_url?: string;                   // ✅ AGREGAR
  status?: 'active' | 'inactive' | 'suspended';  // ✅ AGREGAR
  phone?: string;                        // ✅ AGREGAR
  is_super_admin?: boolean;              // ✅ AGREGAR
  banned_until?: string;                 // ✅ AGREGAR
  email_confirmed_at?: string;           // ✅ AGREGAR
  last_sign_in_at?: string;              // ✅ AGREGAR
}
```

---

## 7. ORDEN DE EJECUCIÓN

### Fase 1: Enums (Bajo riesgo)
1. DeviceTypeEnum en Backend
2. DeviceTypeEnum en Frontend

### Fase 2: Tipos Críticos (Medio riesgo)
3. ExerciseSubmission (CRÍTICO - rompe API)
4. Achievement Type

### Fase 3: Tipos Estructurales (Bajo-Medio riesgo)
5. Classroom Type
6. User Type

---

## 8. VALIDACIÓN POST-IMPLEMENTACIÓN

### Checklist
- [ ] `npx tsc --noEmit` sin errores en Backend
- [ ] `npm run type-check` sin errores en Frontend
- [ ] Tests unitarios pasan
- [ ] No hay imports rotos
- [ ] API calls funcionan correctamente

### Comando de Validación
```bash
# Backend
cd apps/backend && npx tsc --noEmit

# Frontend
cd apps/frontend && npm run type-check
```

---

## 9. ROLLBACK

En caso de problemas, los cambios son puramente en tipos TypeScript (no runtime). Se puede revertir con git:

```bash
git checkout HEAD -- apps/backend/src/shared/constants/enums.constants.ts
git checkout HEAD -- apps/frontend/src/shared/constants/enums.constants.ts
git checkout HEAD -- apps/frontend/src/shared/types/
```

---

**Plan creado por:** Architecture-Analyst
**Fecha:** 2025-11-26
**Estado:** LISTO PARA EJECUCIÓN
