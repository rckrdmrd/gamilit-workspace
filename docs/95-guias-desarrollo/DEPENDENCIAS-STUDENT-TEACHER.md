# Matriz de Dependencias: Student Portal ↔ Teacher Portal

**Fecha de creacion:** 2025-11-29
**Version:** 1.0.0
**Estado:** VIGENTE
**Complementa:** INTEGRACION-STUDENT-TEACHER.md

---

## 1. Proposito

Este documento detalla **TODAS las dependencias** entre objetos del Student Portal y Teacher Portal para:

1. Evaluar impacto antes de cualquier cambio
2. Identificar objetos que requieren sincronizacion
3. Prevenir errores por cambios no coordinados

---

## 2. Dependencias por Capa

### 2.1 Capa de Base de Datos

#### Tablas Principales y sus Dependientes

| Tabla Origen | Dependientes Directos | Dependientes Indirectos |
|--------------|----------------------|------------------------|
| `auth_management.profiles` | exercise_submissions.user_id, exercise_attempts.user_id, module_progress.user_id, user_stats.user_id, classroom_members.user_id | Todos los queries de Teacher |
| `educational_content.exercises` | exercise_submissions.exercise_id, exercise_attempts.exercise_id, assignment_exercises.exercise_id | module_progress (via triggers) |
| `educational_content.modules` | module_progress.module_id, exercises.module_id | Progreso del estudiante |
| `progress_tracking.exercise_submissions` | TRIGGER: update_module_progress, TRIGGER: update_user_stats, TRIGGER: check_failures | Teacher views, Alertas |
| `progress_tracking.module_progress` | Dashboard Teacher, Reportes | Ninguno |
| `gamification_system.user_stats` | Leaderboards, Dashboard Teacher | Rank progress, Achievements |
| `social_features.classrooms` | classroom_members, teacher_classrooms, assignments | Todos los datos filtrados por aula |
| `social_features.classroom_members` | Queries de Teacher (filtro por aula) | module_progress.classroom_id |

#### Triggers y sus Efectos

| Trigger | Tabla Monitoreada | Tablas Afectadas | Condicion de Disparo |
|---------|-------------------|------------------|---------------------|
| `trg_update_module_progress` | exercise_submissions | module_progress | AFTER INSERT |
| `trg_update_user_stats` | exercise_submissions | user_stats, ml_coins_transactions | AFTER INSERT WHEN score IS NOT NULL |
| `trg_check_student_failures` | exercise_submissions | student_intervention_alerts | AFTER INSERT WHEN score < 60 |
| `trg_update_missions_progress` | exercise_submissions | user_missions | AFTER INSERT |

### 2.2 Capa de Backend

#### Services y sus Dependencias

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXERCISE-SUBMISSION.SERVICE.TS                           │
│                    (Punto de entrada principal)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
           ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
           │ EntityManager │ │ExerciseAnswer │ │ModuleProgress │
           │  (TypeORM)    │ │  Validator    │ │   Service     │
           └───────────────┘ └───────────────┘ └───────────────┘
                    │               │               │
                    │               │               ├──► Actualiza module_progress
                    │               │               │
                    │               ▼               │
                    │      Valida estructura      │
                    │      de respuestas          │
                    │               │               │
                    ▼               │               │
           Guarda en BD ◄──────────┘               │
                    │                               │
                    ├── DISPARA TRIGGERS ──────────┘
                    │
                    ├──────────────────────────────────────────────┐
                    │                                              │
                    ▼                                              ▼
           ┌───────────────┐                              ┌───────────────┐
           │ UserStats     │                              │ MLCoins       │
           │   Service     │                              │   Service     │
           └───────────────┘                              └───────────────┘
                    │                                              │
                    ├──► Actualiza XP                              │
                    ├──► Verifica level up                         ├──► Agrega monedas
                    ├──► Verifica achievements                     ├──► Registra transaccion
                    └──► Verifica rank up                          │
                                                                   │
                                                                   ▼
                                                          ┌───────────────┐
                                                          │ Missions      │
                                                          │   Service     │
                                                          └───────────────┘
                                                                   │
                                                                   └──► Actualiza progreso mision
```

#### DTOs y sus Consumidores

| DTO | Definido en | Consumido por Student | Consumido por Teacher |
|-----|-------------|----------------------|----------------------|
| `CreateSubmissionDto` | progress/dto | ExercisePage.tsx | - |
| `SubmissionResponseDto` | progress/dto | ExercisePage.tsx | ExerciseResponsesPage.tsx |
| `ModuleProgressDto` | progress/dto | DashboardComplete.tsx | TeacherProgressPage.tsx |
| `UserStatsDto` | gamification/dto | ProfilePage.tsx | TeacherGamificationPage.tsx |
| `ExerciseResponseDto` | teacher/dto | - | ExerciseResponsesPage.tsx |

### 2.3 Capa de Frontend

#### Hooks y APIs que Comparten Datos

| API Service | Hooks Student | Hooks Teacher | Datos Compartidos |
|-------------|---------------|---------------|-------------------|
| `progressAPI` | useDashboardData, useUserModules | useStudentProgress | module_progress |
| `gamificationAPI` | useGamificationData | useStudentsEconomy, useAchievementsStats | user_stats, achievements |
| `submissionsAPI` | useExerciseState | useExerciseResponses | exercise_submissions |
| `missionsAPI` | useMissions | - (pendiente) | missions, user_missions |

---

## 3. Matriz de Impacto por Cambio

### 3.1 Si Modificas la Estructura de Respuestas (answer_data)

| Componente | Impacto | Accion Requerida |
|------------|---------|------------------|
| `CrucigramaExercise.tsx` (Student) | ORIGEN | Modificar estructura de respuestas |
| `exercise-answer.validator.ts` (Backend) | ALTO | Actualizar validador del tipo |
| `validate_and_audit()` (DB Function) | ALTO | Actualizar logica de comparacion |
| `SubmissionResponseDto` (Backend) | ALTO | Actualizar DTO de respuesta |
| `ExerciseResponsesPage.tsx` (Teacher) | ALTO | Actualizar renderizado de respuestas |
| `ResponseDetailModal.tsx` (Teacher) | ALTO | Actualizar visualizacion detallada |

### 3.2 Si Modificas el Schema de exercise_submissions

| Componente | Impacto | Accion Requerida |
|------------|---------|------------------|
| DDL en `apps/database/ddl/` | ORIGEN | Modificar schema |
| `exercise-submission.entity.ts` | CRITICO | Actualizar entity |
| `ExerciseSubmissionService` | CRITICO | Actualizar queries |
| Triggers en BD | CRITICO | Verificar que no se rompan |
| `SubmissionResponseDto` | ALTO | Actualizar DTO |
| Teacher hooks/pages | MEDIO | Puede requerir actualizacion |

### 3.3 Si Modificas los Triggers de BD

| Trigger | Si lo modificas, afecta a... |
|---------|------------------------------|
| `trg_update_module_progress` | Dashboard Teacher (stats incorrectas), Reportes de progreso |
| `trg_update_user_stats` | Gamification en Teacher, Leaderboards, Rankings |
| `trg_check_student_failures` | Alertas de intervencion (no se generan) |
| `trg_update_missions_progress` | Progreso de misiones (Teacher no ve misiones activas) |

### 3.4 Si Modificas el Calculo de Score

| Componente | Impacto | Consecuencia |
|------------|---------|--------------|
| `autoGrade()` en Service | ORIGEN | Nuevo calculo |
| `validate_and_audit()` en BD | POSIBLE | Si calculo es en BD |
| `exercise_submissions.score` | ALMACENADO | Scores nuevos diferentes |
| Teacher Dashboard stats | VISUALIZADO | Promedios cambian |
| Triggers de gamificacion | DEPENDIENTE | XP/Coins cambian |
| Alertas de bajo rendimiento | DEPENDIENTE | Umbrales afectados |

---

## 4. Dependencias Criticas por Funcionalidad

### 4.1 Flujo: Estudiante Envia Ejercicio

```
ORDEN DE DEPENDENCIAS (no alterar):

1. Student Frontend
   └── ExercisePage.tsx hace POST /submissions
         │
2. Backend Controller
   └── exercises.controller.ts recibe request
         │
3. Backend Service
   └── ExerciseSubmissionService.submitAndGrade()
         │
         ├── 3a. ExerciseAnswerValidator.validate()
         │       └── DEPENDE DE: estructura correcta de answer_data
         │
         ├── 3b. EntityManager.save(submission)
         │       └── DEPENDE DE: entity correcta, BD disponible
         │
         └── 3c. TRIGGERS SE DISPARAN AUTOMATICAMENTE
                 │
                 ├── trg_update_module_progress
                 │   └── DEPENDE DE: exercise.module_id existe
                 │   └── AFECTA A: module_progress (Teacher ve esto)
                 │
                 ├── trg_update_user_stats
                 │   └── DEPENDE DE: user_stats existe para user
                 │   └── AFECTA A: XP, ML Coins (Teacher ve esto)
                 │
                 └── trg_check_student_failures
                     └── DEPENDE DE: score < 60, classroom_members existe
                     └── AFECTA A: student_intervention_alerts (Teacher ve esto)
```

### 4.2 Flujo: Teacher Ve Respuestas

```
ORDEN DE DEPENDENCIAS:

1. Teacher Frontend
   └── TeacherExerciseResponsesPage.tsx
         │
2. Teacher Hook
   └── useExerciseResponses()
         │
         └── GET /teacher/exercise-responses
               │
3. Backend Controller
   └── teacher.controller.ts
         │
4. Backend Service
   └── ExerciseResponsesService.getResponses()
         │
         └── DEPENDE DE:
             ├── exercise_submissions (que Student genero)
             ├── exercises (para metadata del ejercicio)
             ├── profiles (para nombre del estudiante)
             └── classroom_members (para filtrar por aula del teacher)
```

---

## 5. Objetos que DEBEN Existir Antes de Desarrollo

### 5.1 Para Desarrollo en Student Portal

| Objeto | Ubicacion | Verificar que existe |
|--------|-----------|---------------------|
| Entity ExerciseSubmission | `backend/progress/entities/` | `exercise_id`, `user_id`, `answer_data`, `score` |
| Tabla exercise_submissions | `database/ddl/schemas/progress_tracking/` | Schema correcto |
| Trigger update_module_progress | BD | `SELECT * FROM pg_trigger WHERE tgname = 'trg_update_module_progress'` |
| Trigger update_user_stats | BD | `SELECT * FROM pg_trigger WHERE tgname = 'trg_update_user_stats'` |
| ExerciseAnswerValidator | `backend/progress/dto/answers/` | Validador del tipo de ejercicio |

### 5.2 Para Desarrollo en Teacher Portal

| Objeto | Ubicacion | Verificar que existe |
|--------|-----------|---------------------|
| Endpoint GET /teacher/exercise-responses | `backend/teacher/controllers/` | Implementado y funcional |
| ExerciseResponseDto | `backend/teacher/dto/` | Campos necesarios definidos |
| exercise_submissions poblada | BD | Hay datos de prueba |
| Relacion classroom_members | BD | Estudiantes asignados a aulas |
| Relacion teacher_classrooms | BD | Teacher asignado a aulas |

---

## 6. Comandos de Verificacion

### 6.1 Verificar Triggers Activos

```sql
-- Listar todos los triggers relacionados con submissions
SELECT
    t.tgname AS trigger_name,
    c.relname AS table_name,
    p.proname AS function_name,
    CASE t.tgenabled
        WHEN 'O' THEN 'ENABLED (origin)'
        WHEN 'D' THEN 'DISABLED'
        WHEN 'R' THEN 'ENABLED (replica)'
        WHEN 'A' THEN 'ENABLED (always)'
    END AS status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'exercise_submissions';
```

### 6.2 Verificar Dependencias de FK

```sql
-- Ver todas las foreign keys que apuntan a exercise_submissions
SELECT
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (ccu.table_name = 'exercise_submissions'
       OR tc.table_name = 'exercise_submissions');
```

### 6.3 Verificar que Teacher Puede Ver Datos

```sql
-- Verificar que hay datos para un teacher especifico
SELECT
    p.first_name || ' ' || p.last_name AS student_name,
    e.title AS exercise_title,
    es.score,
    es.submitted_at
FROM progress_tracking.exercise_submissions es
JOIN auth_management.profiles p ON p.id = es.user_id
JOIN educational_content.exercises e ON e.id = es.exercise_id
JOIN social_features.classroom_members cm ON cm.user_id = es.user_id
JOIN social_features.teacher_classrooms tc ON tc.classroom_id = cm.classroom_id
WHERE tc.teacher_id = '<TEACHER_PROFILE_ID>'
ORDER BY es.submitted_at DESC
LIMIT 10;
```

---

## 7. Checklist de Impacto

Antes de cualquier cambio, responde estas preguntas:

### 7.1 Checklist General

- [ ] ¿Este cambio afecta la estructura de `answer_data`?
  - Si: Actualizar validator, funcion BD, DTOs, componentes Teacher
- [ ] ¿Este cambio afecta el schema de alguna tabla de progress_tracking?
  - Si: Actualizar entity, DTOs, triggers, queries
- [ ] ¿Este cambio afecta triggers de BD?
  - Si: Probar flujo completo Student→Teacher
- [ ] ¿Este cambio afecta el calculo de score?
  - Si: Actualizar triggers de gamificacion, alertas

### 7.2 Checklist Especifico Student

- [ ] ¿Las respuestas se guardan con la estructura correcta?
- [ ] ¿El endpoint POST /submissions funciona?
- [ ] ¿Los triggers se disparan correctamente?
- [ ] ¿module_progress se actualiza?
- [ ] ¿user_stats se actualiza?

### 7.3 Checklist Especifico Teacher

- [ ] ¿El endpoint GET /exercise-responses devuelve datos?
- [ ] ¿Los datos incluyen el formato correcto de respuestas?
- [ ] ¿El filtro por classroom funciona?
- [ ] ¿Se puede calificar una submission?

---

**Documento creado por:** Architecture-Analyst
**Fecha:** 2025-11-29
**Estado:** VIGENTE
