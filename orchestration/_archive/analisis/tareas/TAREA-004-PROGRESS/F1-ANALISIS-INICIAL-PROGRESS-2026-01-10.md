# F1: ANALISIS INICIAL - TAREA-004 PROGRESS_TRACKING

## Metadata

| Campo | Valor |
|-------|-------|
| **Tarea** | TAREA-004 |
| **Modulo** | progress_tracking |
| **Fecha** | 2026-01-10 |
| **Estado** | COMPLETADO |
| **Agente** | @PERFIL_ORQUESTADOR |

---

## 1. OBJETIVO

Realizar analisis inicial del modulo de seguimiento de progreso para identificar alcance, archivos y dependencias antes del analisis detallado (F2).

---

## 2. RESUMEN EJECUTIVO

### 2.1 Metricas por Capa

| Capa | Objetos | Estado |
|------|---------|--------|
| **Base de Datos** | 19 tablas, 5 enums, 11 funciones, 13 triggers, 1 view | Produccion |
| **Backend** | 15 entities, 11 services, 6 controllers, 41+ DTOs | Produccion |
| **Frontend** | React Query hooks, 2 APIs, 20+ types | Produccion |

### 2.2 Subsistemas de Progress Tracking

| Subsistema | Tablas | Descripcion |
|------------|--------|-------------|
| **Module Progress** | 2 | Progreso por modulo, tracking completo de avance |
| **Exercise Tracking** | 3 | Intentos, submissions, calificaciones |
| **Learning Sessions** | 1 | Sesiones de aprendizaje con duracion |
| **Teacher Portal** | 4 | Revisiones manuales, notas, intervenciones, alertas |
| **Certificates** | 1 | Certificados de completacion |
| **Learning Paths** | 2 | Rutas personalizadas de aprendizaje |
| **Analytics** | 4 | Mastery, skills, engagement, snapshots |
| **Difficulty Progression** | 2 | Progreso por nivel de dificultad |

---

## 3. CAPA 1: BASE DE DATOS (Schema progress_tracking)

### 3.1 Tablas (19 Activas)

| # | Tabla | Columnas | Proposito |
|---|-------|----------|-----------|
| 1 | module_progress | 37 | Progreso de usuario por modulo (XP, ML Coins, scores, tiempo) |
| 2 | module_completion_tracking | - | Tracking de completacion de modulos |
| 3 | exercise_attempts | 14 | Intentos de ejercicios con respuestas y puntajes |
| 4 | exercise_submissions | 20+ | Envios formales de ejercicios (draft, submitted, graded) |
| 5 | learning_sessions | 9 | Sesiones de aprendizaje con duracion |
| 6 | scheduled_missions | - | Misiones programadas para usuarios |
| 7 | manual_reviews | 10+ | Revisiones manuales de ejercicios por maestros |
| 8 | teacher_notes | 7 | Notas de profesores sobre estudiantes |
| 9 | teacher_interventions | - | Intervenciones pedagogicas |
| 10 | student_intervention_alerts | - | Alertas de intervencion requerida |
| 11 | certificates | 15+ | Certificados de completacion de modulos |
| 12 | learning_paths | 10+ | Rutas de aprendizaje predefinidas |
| 13 | user_learning_paths | 8+ | Progreso de usuario en rutas |
| 14 | skill_assessments | 10+ | Evaluaciones de habilidades |
| 15 | mastery_tracking | 10+ | Tracking de dominio por tema |
| 16 | engagement_metrics | 10+ | Metricas de engagement del usuario |
| 17 | progress_snapshots | 10+ | Snapshots periodicos de progreso |
| 18 | user_difficulty_progress | 8+ | Progreso por nivel de dificultad CEFR |
| 19 | user_current_level | 6+ | Nivel actual del usuario |

### 3.2 Enums (5)

| Enum | Valores | Uso |
|------|---------|-----|
| progress_status | not_started, in_progress, completed, needs_review, mastered, abandoned | Estados de progreso |
| attempt_result | correct, incorrect, partial | Resultado de intento |
| attempt_status | in_progress, completed, abandoned | Estado de intento |
| certificate_type | module, course, path | Tipo de certificado |
| certificate_status | pending, issued, revoked | Estado de certificado |

### 3.3 Funciones (11 Activas)

**Progreso de Modulo:**
- calculate_module_progress - Calcula porcentaje de progreso
- get_user_progress - Obtiene progreso completo de usuario

**Analytics:**
- get_classroom_analytics - Analiticas por aula
- enhanced_analytics_functions - Funciones avanzadas de analytics

**Misiones:**
- update_mission_progress - Actualiza progreso de misiones

**Dificultad:**
- update_difficulty_progress - Actualiza progreso por nivel
- promote_user_difficulty_level - Promocion automatica de nivel
- check_difficulty_promotion_eligibility - Verifica elegibilidad

**Alertas:**
- generate_student_alerts - Genera alertas de intervencion
- create_manual_review_on_submission - Crea revision manual automatica

### 3.4 Triggers (13 Activos)

| Trigger | Tabla | Accion |
|---------|-------|--------|
| trg_update_user_stats_on_exercise | exercise_attempts | Actualiza stats en gamification |
| trg_update_module_progress_on_exercise | exercise_attempts | Actualiza progreso de modulo |
| trg_update_user_stats_on_submission | exercise_submissions | Actualiza stats al enviar |
| trg_update_module_progress_on_submission | exercise_submissions | Actualiza progreso al enviar |
| trg_create_manual_review | exercise_submissions | Crea revision manual |
| trg_create_manual_review_on_update | exercise_submissions | Crea revision al actualizar |
| trg_update_missions_on_submission | exercise_submissions | Actualiza misiones |
| trg_update_missions_on_streak | - | Actualiza misiones de streak |
| trg_update_missions_on_exercise | exercise_attempts | Actualiza misiones |
| trg_update_missions_on_perfect_scores | - | Misiones de puntaje perfecto |
| trg_update_missions_on_complete_modules | module_progress | Misiones de modulos completos |
| trg_update_missions_on_explore_modules | - | Misiones de exploracion |
| batch_updated_at_triggers | Multiple | Triggers de updated_at |

### 3.5 Views (1)

| Vista | Proposito |
|-------|-----------|
| user_progress_summary | Resumen de progreso de usuario |
| teacher_pending_reviews | Revisiones pendientes para maestros |

### 3.6 Dependencias Externas

| Schema Externo | Referencias |
|----------------|-------------|
| auth_management.profiles | FKs user_id en todas las tablas |
| educational_content.modules | FK module_id |
| educational_content.exercises | FK exercise_id |
| gamification_system.user_stats | Cross-schema triggers |
| gamification_system.missions | Cross-schema triggers |
| social_features.classrooms | FK classroom_id |

---

## 4. CAPA 2: BACKEND

### 4.1 Entities (15)

| Entity | Tabla DDL | Campos Clave |
|--------|-----------|--------------|
| ModuleProgress | module_progress | status, progress_percentage, completed_exercises, total_xp_earned |
| ExerciseAttempt | exercise_attempts | attempt_number, score, comodines_used, xp_earned |
| ExerciseSubmission | exercise_submissions | answer_data, status, score, graded_at |
| LearningSession | learning_sessions | session_start, session_end, duration |
| ManualReview | manual_reviews | teacher_id, score, feedback, reviewed_at |
| TeacherNote | teacher_notes | note_type, content, priority |
| TeacherIntervention | teacher_interventions | intervention_type, status, outcome |
| Certificate | certificates | certificate_type, status, issued_at, pdf_url |
| LearningPath | learning_paths | title, modules_sequence, estimated_duration |
| UserLearningPath | user_learning_paths | current_position, started_at, completed_at |
| SkillAssessment | skill_assessments | skill_id, score, level |
| MasteryTracking | mastery_tracking | topic_id, mastery_level, last_practiced_at |
| EngagementMetrics | engagement_metrics | sessions_count, avg_session_duration, streak_days |
| ProgressSnapshot | progress_snapshots | snapshot_date, metrics_json |
| ScheduledMission | scheduled_missions | mission_template_id, scheduled_for, completed_at |

### 4.2 Services (11)

| Service | Metodos Clave |
|---------|---------------|
| ModuleProgressService | findByUserAndModule, updateProgress, calculateCompletion |
| ExerciseAttemptService | create, findByUser, getBestAttempt |
| ExerciseSubmissionService | submit, grade, getByUser |
| LearningSessionService | start, end, getDuration |
| ManualReviewService | create, grade, getPendingReviews |
| TeacherNotesService | create, findByStudent |
| CertificateService | issue, verify, download |
| LearningPathService | getPath, enrollUser, updateProgress |
| AnalyticsService | getStudentAnalytics, getClassroomAnalytics |
| DifficultyProgressService | getProgress, promoteLevel |
| ProgressSnapshotService | createSnapshot, getHistory |

### 4.3 Controllers (6)

| Controller | Base Path |
|------------|-----------|
| ModuleProgressController | /api/v1/progress/modules |
| ExerciseSubmissionController | /api/v1/progress/submissions |
| LearningSessionController | /api/v1/progress/sessions |
| ManualReviewController | /api/v1/progress/reviews |
| CertificateController | /api/v1/progress/certificates |
| AnalyticsController | /api/v1/progress/analytics |

### 4.4 DTOs (41+)

**ModuleProgress:** Create, Update, Response, Summary, Detail
**ExerciseAttempt:** Create, Response, Stats
**ExerciseSubmission:** Submit, Grade, Response, Status
**ManualReview:** Create, Grade, Response, Pending
**Certificate:** Issue, Response, Verify
**LearningPath:** Create, Enroll, Response, Progress
**Analytics:** StudentAnalytics, ClassroomAnalytics, TimeRange

---

## 5. CAPA 3: FRONTEND

### 5.1 State Management

**Patron:** React Query (TanStack Query) - Server state caching

| Hook Category | Hooks |
|---------------|-------|
| Dashboard | useDashboardData, useUserModules |
| Progress | useModuleProgress, useSubmitProgress |
| Submissions | useSubmitExercise, useExerciseAttempts |
| Analytics | useProgressStats, useStudyStreak |

### 5.2 Types (20+)

| Archivo | Types Definidos |
|---------|-----------------|
| progress.types.ts | ProgressStatus, ModuleProgress, ProgressSummary, LearningSession, ExerciseAttempt, ExerciseSubmission, SubmissionStats |
| progressTypes.ts | SubmitExerciseRequest/Response, SubmissionRewards, UserProgressOverview, ModuleProgressSummary, ActivityType, PowerupType |

### 5.3 APIs (2)

| API | Funciones Clave |
|-----|-----------------|
| progress.api.ts | getModuleProgress, submitExercise, getProgressSummary |
| progressAPI.ts | submitExercise, getUserProgress, getAttempts, getDashboard |

### 5.4 Enums Frontend

**ProgressStatus (6 valores):**
- NOT_STARTED, IN_PROGRESS, COMPLETED, NEEDS_REVIEW, MASTERED, ABANDONED

**PowerupType (3 valores):**
- PISTAS, VISION_LECTORA, SEGUNDA_OPORTUNIDAD

**ActivityType (4 valores):**
- EXERCISE_COMPLETED, ACHIEVEMENT_UNLOCKED, RANK_ADVANCED, MODULE_COMPLETED

---

## 6. MATRIZ DE DEPENDENCIAS

```
+-----------------------------------------------------------------------+
|                 DEPENDENCIAS PROGRESS_TRACKING                         |
+-----------------------------------------------------------------------+
|                                                                        |
|   TABLAS INTERNAS:                                                     |
|   module_progress ──┬─> exercise_submissions (via user_id, module_id)  |
|                     ├─> exercise_attempts (via user_id)                |
|                     └─> learning_sessions (via user_id)                |
|                                                                        |
|   exercise_submissions ──> manual_reviews (1:N)                        |
|   learning_paths ──> user_learning_paths (1:N)                         |
|                                                                        |
|   CROSS-SCHEMA TRIGGERS:                                               |
|   exercise_attempts ──> gamification_system.user_stats (XP, coins)     |
|   exercise_submissions ──> gamification_system.missions (progress)     |
|   module_progress ──> gamification_system.missions (completion)        |
|                                                                        |
|   DEPENDENCIAS EXTERNAS:                                               |
|   auth_management.profiles <── FKs user_id (todas las tablas)         |
|   educational_content.modules <── FK module_id                         |
|   educational_content.exercises <── FK exercise_id                     |
|   social_features.classrooms <── FK classroom_id                       |
|                                                                        |
+-----------------------------------------------------------------------+
```

---

## 7. PUNTOS DE INTEGRACION CRITICOS

| Integracion | Capas | Estado | Riesgo |
|-------------|-------|--------|--------|
| DDL → Entity (19 tablas vs 15 entities) | DB → Backend | Por validar | MEDIO |
| Entity → DTO (15 entities vs 41+ DTOs) | Backend | Por validar | BAJO |
| DTO → Type (41+ DTOs vs 20+ types) | Backend → Frontend | Por validar | ALTO |
| ProgressStatus enum (6 valores) | Todas | Por validar | ALTO |
| Submission status (5 valores) | Todas | Por validar | MEDIO |
| PowerupType vs ComodinType | Frontend vs Backend | Por validar | MEDIO |

---

## 8. INCONSISTENCIAS PRELIMINARES

### 8.1 Potenciales Brechas

| # | Capa | Descripcion | Severidad |
|---|------|-------------|-----------|
| 1 | Backend | Faltan entities para 4 tablas (module_completion, alerts, interventions) | MEDIA |
| 2 | Frontend | Duplicacion de tipos entre progress.types.ts y progressTypes.ts | MEDIA |
| 3 | Frontend | PowerupType vs ComodinType naming inconsistency | BAJA |
| 4 | All | ProgressStatus 'needs_review' vs 'reviewed' naming | MEDIA |

### 8.2 Notas de Arquitectura

- **React Query**: Frontend usa React Query en lugar de Zustand para server state
- **Cross-schema triggers**: Integracion fuerte con gamification_system
- **Teacher Portal**: Subsistema completo para maestros (reviews, notes, interventions)
- **M3-M5 Feature**: submitted vs graded progress tracking implementado

---

## 9. CRITERIOS DE EXITO PARA F2

- [ ] Validacion 19 tablas DDL vs 15 entities
- [ ] Alineacion ProgressStatus enum (DDL vs Backend vs Frontend)
- [ ] Verificacion submission status flow
- [ ] Mapeo DTOs (41+) vs Frontend Types (20+)
- [ ] Validacion PowerupType vs ComodinType
- [ ] Cross-schema trigger validation

---

## 10. PROXIMOS PASOS

1. **F2**: Analisis detallado campo por campo
2. **F3**: Plan de correcciones priorizadas
3. **F4**: Validacion del plan
4. **F5**: Refinamiento
5. **F6**: Ejecucion
6. **F7**: Validacion final

---

## 11. ARCHIVOS RELACIONADOS

### Base de Datos
- `/apps/database/ddl/schemas/progress_tracking/` (50+ archivos DDL)

### Backend
- `/apps/backend/src/modules/progress/`

### Frontend
- `/apps/frontend/src/features/progress/`
- `/apps/frontend/src/shared/types/progress.types.ts`
- `/apps/frontend/src/lib/api/progress.api.ts`

---

**Documento generado por:** @PERFIL_ORQUESTADOR
**Fecha:** 2026-01-10
**Version:** 1.0.0
**Siguiente fase:** F2 - Analisis Detallado
