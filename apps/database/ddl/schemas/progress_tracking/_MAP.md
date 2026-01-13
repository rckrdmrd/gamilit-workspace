# Schema: progress_tracking

Seguimiento de progreso: avance de modulos, intentos, metricas de engagement.

## Estructura

- **tables/**: 19 archivos activos
- **enums/**: 4 archivos (attempt_result, attempt_status, certificate_enums, progress_status)
- **functions/**: 12 archivos
- **triggers/**: 14 archivos activos (incluye 00-batch_updated_at_triggers.sql consolidado)
- **triggers/_deprecated/**: 2 archivos (triggers updated_at individuales)
- **indexes/**: 3 archivos
- **views/**: 2 archivos
- **rls-policies/**: 2 archivos

**Total:** ~58 objetos DDL activos

## Tablas (19 archivos)

| # | Archivo | Tabla | Proposito |
|---|---------|-------|-----------|
| 01 | `01-module_progress.sql` | module_progress | Progreso por modulo (% completado, score promedio) |
| 02 | `02-learning_sessions.sql` | learning_sessions | Sesiones de aprendizaje |
| 03 | `03-exercise_attempts.sql` | exercise_attempts | Intentos de ejercicios autocorregibles |
| 04 | `04-exercise_submissions.sql` | exercise_submissions | Entregas para ejercicios con calificacion manual |
| 05 | `05-scheduled_missions.sql` | scheduled_missions | Misiones programadas |
| 06 | `06-manual_reviews.sql` | manual_reviews | Revisiones manuales por docentes (M3-M5) |
| 07 | `15-student_intervention_alerts.sql` | student_intervention_alerts | Alertas de intervencion para estudiantes |
| 08 | `15-user_difficulty_progress.sql` | user_difficulty_progress | Progreso en niveles CEFR |
| 09 | `16-user_current_level.sql` | user_current_level | Nivel actual y zona de desarrollo proximo |
| 10 | `17-teacher_interventions.sql` | teacher_interventions | Intervenciones de profesores |
| 11 | `18-certificates.sql` | certificates | Certificados de completitud |
| 12 | `engagement_metrics.sql` | engagement_metrics | Metricas de engagement |
| 13 | `learning_paths.sql` | learning_paths | Rutas de aprendizaje |
| 14 | `mastery_tracking.sql` | mastery_tracking | Seguimiento de dominio |
| 15 | `module_completion_tracking.sql` | module_completion_tracking | Tracking de completitud de modulos |
| 16 | `progress_snapshots.sql` | progress_snapshots | Snapshots de progreso |
| 17 | `skill_assessments.sql` | skill_assessments | Evaluaciones de habilidades |
| 18 | `teacher_notes.sql` | teacher_notes | Notas de profesores |
| 19 | `user_learning_paths.sql` | user_learning_paths | Rutas de aprendizaje por usuario |

## Sistema de Progresion CEFR

Niveles: beginner (A1) → native (C2+)

| Funcion | Proposito |
|---------|-----------|
| `check_difficulty_promotion_eligibility` | Verifica elegibilidad para promocion |
| `promote_user_difficulty_level` | Ejecuta promocion de nivel |
| `update_difficulty_progress` | Actualiza metricas de progreso |
| `create_manual_review_on_submission` | Crea ManualReview automatico para ejercicios manuales |

## Triggers de Actualizacion

| Trigger | Proposito |
|---------|-----------|
| `trg_update_user_stats_on_exercise` | Actualiza XP/ML al completar ejercicio |
| `trg_update_module_progress_on_exercise` | Actualiza progreso de modulo |
| `trg_update_missions_on_exercise` | Actualiza misiones al completar ejercicio |
| `trg_update_module_progress_on_submission` | Actualiza progreso tras calificacion manual |
| `trg_create_manual_review_on_submission` | Crea ManualReview al insertar submission con status=submitted |

## Vistas

| Vista | Proposito |
|-------|-----------|
| `teacher_pending_reviews` | Submissions pendientes de revision con prioridad y datos consolidados |
| `classroom_students_metrics` | Metricas de estudiantes por aula |

## Arquitectura Dual de Ejercicios

1. **exercise_attempts**: Ejercicios autocorregibles (M1-M2)
2. **exercise_submissions**: Ejercicios con calificacion manual (M3-M5)

Ambos actualizan `user_stats` y `module_progress` mediante triggers.

El trigger `trg_create_manual_review_on_submission` crea automaticamente el registro en `manual_reviews` cuando se inserta un submission para ejercicios con `requires_manual_grading=true`.

## Correcciones Aplicadas

| Archivo | Cambio | Fecha |
|---------|--------|-------|
| `functions/05-get_classroom_analytics.sql` | FK corregida: `auth.profiles` → `auth_management.profiles` | 2026-01-04 |
| `triggers/30-trg_update_missions_on_explore_modules.sql` | DB-166: Cambiado de `AFTER INSERT OR UPDATE` a `AFTER INSERT` | 2026-01-04 |

## Consolidacion de Triggers (2026-01-07)

Triggers de `updated_at` consolidados en `00-batch_updated_at_triggers.sql`:
- `module_progress_updated_at`
- `certificates_updated_at`

Archivos originales movidos a `triggers/_deprecated/`.

## Migracion de ENUMs (2026-01-07)

ENUMs migrados desde `00-prerequisites.sql` a archivos individuales en `enums/`:
- `attempt_status` - Estados de intento

---

**Ultima actualizacion:** 2026-01-13
**Cambios recientes:**
- AUDITORIA: Inventario de tablas actualizado de 17 a 19 (2026-01-13)
- CONSOLIDACION BD: Triggers updated_at consolidados (2026-01-07)
- CONSOLIDACION BD: ENUMs migrados a archivos individuales (2026-01-07)
