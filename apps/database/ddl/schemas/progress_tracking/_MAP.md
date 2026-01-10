# Schema: progress_tracking

Seguimiento de progreso: avance de modulos, intentos, metricas de engagement.

## Estructura

- **tables/**: 17 archivos
- **enums/**: 4 archivos (attempt_result, attempt_status, certificate_enums, progress_status)
- **functions/**: 12 archivos
- **triggers/**: 14 archivos activos (incluye 00-batch_updated_at_triggers.sql consolidado)
- **triggers/_deprecated/**: 2 archivos (triggers updated_at individuales)
- **indexes/**: 3 archivos
- **views/**: 2 archivos
- **rls-policies/**: 2 archivos

**Total:** 56 objetos DDL

## Tablas Principales

| Tabla | Proposito |
|-------|-----------|
| `module_progress` | Progreso por modulo (% completado, score promedio) |
| `learning_sessions` | Sesiones de aprendizaje |
| `exercise_attempts` | Intentos de ejercicios autocorregibles |
| `exercise_submissions` | Entregas para ejercicios con calificacion manual |
| `manual_reviews` | Revisiones manuales por docentes (M3-M5) |
| `scheduled_missions` | Misiones programadas |
| `engagement_metrics` | Metricas de engagement |
| `user_difficulty_progress` | Progreso en niveles CEFR |
| `user_current_level` | Nivel actual y zona de desarrollo proximo |

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

**Ultima actualizacion:** 2026-01-07
**Cambios recientes:**
- CONSOLIDACION BD: Triggers updated_at consolidados (2026-01-07)
- CONSOLIDACION BD: ENUMs migrados a archivos individuales (2026-01-07)
