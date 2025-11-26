# REPORTE FASE 1: Análisis de Integración Student-Teacher Portal

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Task ID:** ARCH-INT-003

---

## RESUMEN EJECUTIVO

Se analizó la integración entre el portal de Students y el portal de Teacher, identificando **11 gaps críticos** que afectan la funcionalidad del Teacher Portal.

### Métricas de Análisis

| Categoría | Cantidad |
|-----------|----------|
| Endpoints analizados | 25+ |
| Tablas compartidas | 13 |
| Gaps bloqueadores | 5 |
| Gaps degradados | 4 |
| Gaps cosméticos | 2 |

---

## 1. FLUJO DE DATOS STUDENT → TEACHER

### Datos que Genera el Estudiante

| Tabla | Registros/año | Campos Clave |
|-------|---------------|--------------|
| `progress_tracking.module_progress` | ~4/estudiante | progress_percentage, average_score, total_xp |
| `progress_tracking.exercise_attempts` | ~200/estudiante | score, time_spent, hints_used |
| `progress_tracking.exercise_submissions` | Variable | status, feedback, graded_at |
| `progress_tracking.learning_sessions` | ~100/estudiante | duration, active_time, exercises_completed |
| `gamification_system.user_stats` | 1 (actualizado) | total_xp, current_rank, ml_coins, streaks |
| `gamification_system.user_ranks` | ~5/estudiante | current_rank, rank_progress |
| `gamification_system.user_achievements` | ~20/estudiante | achievement_id, is_completed |

### Datos que Consume el Teacher

1. **TeacherClasses:** enrollment, progress básico ✅
2. **TeacherProgressPage:** métricas de progreso ⚠️ Parcial
3. **TeacherGamification:** stats de gamificación ❌ Mock Total
4. **TeacherAlertsPage:** alertas de intervención ✅
5. **TeacherReportsPage:** datos agregados ⚠️ Parcial

---

## 2. GAPS CRÍTICOS IDENTIFICADOS

### TIER 1: BLOQUEADORES (5)

#### GAP-ST-001: Query con Campo Inexistente (score_percentage)

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Línea:** 851-858

```typescript
// ❌ INCORRECTO - Campo NO existe
.addSelect('AVG(mp.score_percentage)', 'avg_score')

// ✅ CORRECTO
.addSelect('AVG(mp.average_score)', 'avg_score')
```

**Impacto:** Listado de estudiantes retorna NULL para scores

---

#### GAP-ST-002: StudentInClassroomDto Incompleto

**Archivos:**
- Backend: `apps/backend/src/modules/teacher/dto/classroom-response.dto.ts` (línea 197)
- Frontend: `apps/frontend/src/apps/teacher/types/index.ts`

**Campos faltantes en Backend:**
- `current_module: string | null`
- `current_exercise: string | null`
- `time_spent_minutes: number`
- `exercises_completed: number`
- `exercises_total: number`

**Impacto:** Dashboard del teacher incompleto, undefined errors

---

#### GAP-ST-003: Sin Cálculo de current_module y current_exercise

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Línea:** 958-981

**Problema:** `mapToStudentInClassroomDto()` no computa en qué módulo/ejercicio está el estudiante.

**Solución:** Agregar JOINs con `module_progress` y `exercise_submissions` para obtener último módulo activo.

---

#### GAP-ST-004: Falta time_spent_minutes en Agregación

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Línea:** 844-870

**Problema:** `getStudentsProgress()` no retorna tiempo gastado.

**Datos existentes:** `ModuleProgress.time_spent` (interval) existe pero no se calcula.

---

#### GAP-ST-005: Endpoint /teacher/analytics/economy NO EXISTE

**Archivo esperado:** `apps/backend/src/modules/teacher/controllers/teacher-analytics.controller.ts`

**Frontend espera:**
```typescript
{
  total_circulation: number,
  average_balance: number,
  distribution: { range: string, count: number }[]
}
```

**Impacto:** TeacherGamification muestra datos inventados (50000, 42.5%)

---

### TIER 2: DEGRADADOS (4)

#### GAP-ST-006: N+1 Queries para Profiles y Users

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Línea:** 300-308

```typescript
// ❌ N+1 Queries
const profiles = await this.profileRepo.find({ where: { user_id: In(studentIds) } });
const users = await this.userRepo.find({ where: { id: In(studentIds) } });
```

**Solución:** Optimizar con QueryBuilder JOINs

---

#### GAP-ST-007: Sin Relaciones TypeORM Definidas

**Entidades afectadas:**
- `ClassroomMember` ↔ `Profile` (falta @ManyToOne)
- `ModuleProgress` ↔ `Module` (falta @ManyToOne)
- `ExerciseSubmission` ↔ `Exercise` (falta @ManyToOne)

**Impacto:** No se pueden hacer eager loads eficientes

---

#### GAP-ST-008: Datos Gamificación Incompletos en Classroom Stats

**Campos faltantes en StudentInClassroomDto:**
- `total_ml_coins`
- `current_rank` (Maya Ranks)
- `achievements_count`
- `streak_current`

---

#### GAP-ST-009: Classroom Stats Retorna Campos Incompletos

**Archivo:** `apps/backend/src/modules/teacher/dto/classroom-response.dto.ts`

**DTO define pero service no retorna:**
- `engagement_rate?: number`
- `total_exercises?: number`

---

### TIER 3: COSMÉTICOS (2)

#### GAP-ST-010: Inconsistencia Nomenclatura id vs user_id

- Frontend: `interface StudentMonitoring { id: string; }`
- Backend: `class StudentInClassroomDto { user_id!: string; }`

---

#### GAP-ST-011: Concatenación first_name/last_name vs full_name

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Línea:** 964

Si profile es null, retorna "Unknown Student".

---

## 3. GAPS DE BASE DE DATOS

### Foreign Keys Inconsistentes (CRÍTICO)

| Tabla | Campo | FK Actual | FK Correcto |
|-------|-------|-----------|-------------|
| `user_stats` | user_id | `auth.users` | `auth_management.profiles` |
| `user_ranks` | user_id | `auth.users` | `auth_management.profiles` |
| `student_intervention_alerts` | student_id | `auth.users` | `auth_management.profiles` |
| `student_intervention_alerts` | acknowledged_by | `auth.users` | `auth_management.profiles` |
| `teacher_classrooms` | teacher_id | `auth.users` | `auth_management.profiles` |

### Índices Faltantes para Teacher Portal

| Tabla | Índice Faltante | Caso de Uso |
|-------|-----------------|-------------|
| `module_progress` | `(classroom_id, status)` | Módulos incompletos por aula |
| `module_progress` | `(deadline, status)` | Tareas vencidas |
| `exercise_submissions` | `(status, submitted_at)` | Pendientes de calificación |
| `learning_sessions` | `(classroom_id)` | Sessions por aula |
| `user_stats` | `(tenant_id, global_rank_position)` | Leaderboards |

### Constraint Faltante

```sql
-- module_progress.classroom_id NO tiene FK constraint
ALTER TABLE progress_tracking.module_progress
ADD CONSTRAINT module_progress_classroom_id_fkey
FOREIGN KEY (classroom_id) REFERENCES social_features.classrooms(id);
```

---

## 4. COBERTURA ACTUAL VS ESPERADA

| Métrica | Actual | Target | Gap |
|---------|--------|--------|-----|
| Páginas Funcionales | 2/5 (40%) | 5/5 (100%) | -60% |
| Endpoints Reales | 15/25 (60%) | 25/25 (100%) | -40% |
| Datos En Tiempo Real | 60% | 95% | -35% |
| Sin Datos Mock | 40% | 100% | -60% |

---

## 5. ARCHIVOS CLAVE IDENTIFICADOS

### Backend - Teacher Module

```
apps/backend/src/modules/teacher/
├── services/
│   ├── teacher-classrooms-crud.service.ts  # GAP-ST-001, GAP-ST-003, GAP-ST-004, GAP-ST-006
│   ├── student-progress.service.ts         # GAP-ST-005
│   └── grading.service.ts
├── dto/
│   ├── classroom-response.dto.ts           # GAP-ST-002, GAP-ST-008, GAP-ST-009
│   └── classroom.dto.ts
└── controllers/
    └── teacher-classrooms.controller.ts
```

### Frontend - Teacher Module

```
apps/frontend/src/apps/teacher/
├── pages/
│   ├── TeacherProgressPage.tsx             # GAP-ST-002 impacto
│   └── TeacherGamification.tsx             # GAP-ST-005 impacto
├── types/
│   └── index.ts                            # GAP-ST-010
└── hooks/
    └── useClassroomData.ts
```

### Base de Datos

```
apps/database/ddl/schemas/
├── progress_tracking/
│   ├── tables/01-module_progress.sql       # Índices faltantes
│   ├── tables/03-exercise_attempts.sql
│   └── tables/04-exercise_submissions.sql  # Falta graded_by
├── gamification_system/
│   ├── tables/01-user_stats.sql            # FK inconsistente
│   └── tables/02-user_ranks.sql            # FK inconsistente
└── social_features/
    └── tables/teacher_classrooms.sql       # FK inconsistente
```

---

## 6. PRÓXIMOS PASOS

Proceder a FASE 2: Planeación de correcciones con agentes especializados.

**Priorización:**
1. P0: Corregir query score_percentage (GAP-ST-001)
2. P0: Completar StudentInClassroomDto (GAP-ST-002)
3. P0: Crear endpoint /teacher/analytics/economy (GAP-ST-005)
4. P1: Agregar índices faltantes
5. P2: Optimizar N+1 queries

---

**Analista:** Architecture-Analyst
**Estado:** FASE 1 COMPLETADA
