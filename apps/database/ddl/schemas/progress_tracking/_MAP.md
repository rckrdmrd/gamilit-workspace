# Schema: progress_tracking

Seguimiento de progreso: avance de módulos, intentos, métricas de engagement

## Estructura

- **tables/**: 15 archivos
- **enums/**: 2 archivos
- **functions/**: 9 archivos
- **triggers/**: 8 archivos
- **indexes/**: 2 archivos
- **views/**: 1 archivos
- **rls-policies/**: 2 archivos

**Total:** 39 objetos

## Contenido Detallado

### tables/ (15 archivos)

```
01-module_progress.sql
02-learning_sessions.sql
03-exercise_attempts.sql
04-exercise_submissions.sql
05-scheduled_missions.sql
engagement_metrics.sql
learning_paths.sql
mastery_tracking.sql
module_completion_tracking.sql
progress_snapshots.sql
skill_assessments.sql
teacher_notes.sql
user_learning_paths.sql
15-user_difficulty_progress.sql          # ✨ NUEVO 2025-11-11 (GAP-3)
16-user_current_level.sql                # ✨ NUEVO 2025-11-11 (GAP-3)
```

### enums/ (2 archivos)

```
attempt_result.sql
progress_status.sql
```

### functions/ (9 archivos)

```
01-calculate_module_progress.sql
03-get_user_progress.sql
05-get_classroom_analytics.sql
06-update_mission_progress.sql
07-update_exercise_submissions_updated_at.sql
check_difficulty_promotion_eligibility.sql   # ✨ NUEVO 2025-11-11 (GAP-3)
promote_user_difficulty_level.sql            # ✨ NUEVO 2025-11-11 (GAP-3)
update_difficulty_progress.sql               # ✨ NUEVO 2025-11-11 (GAP-3)
```

### triggers/ (8 archivos)

```
21-trg_update_user_stats_on_exercise.sql
22-exercise_submissions_updated_at.sql
22-trg_update_module_progress_on_exercise.sql   # ✨ NUEVO 2025-11-26
23-trg_module_progress_updated_at.sql
24-trg_update_missions_on_exercise.sql          # ✨ NUEVO 2025-11-26
25-trg_update_missions_on_submission.sql        # ✨ NUEVO 2025-11-26
26-trg_update_missions_on_streak.sql            # ✨ NUEVO 2025-11-26
27-trg_update_module_progress_on_submission.sql # ✨ NUEVO 2025-11-28 (Student Portal)
```

### indexes/ (2 archivos)

```
01-idx_module_progress_analytics_gin.sql
02-idx_scheduled_missions_mission.sql
```

### views/ (1 archivos)

```
user_progress_summary.sql
```

### rls-policies/ (2 archivos)

```
01-enable-rls.sql
02-progress-policies.sql
```

---

**Última actualización:** 2025-11-28 (Student Portal: +5 triggers misiones/progreso)
**Reorganización:** 2025-11-09

## Changelog

### 2025-11-28 - Student Portal Corrections
- ✨ **5 triggers nuevos**: Sistema de misiones y progreso de módulos
  - 22-trg_update_module_progress_on_exercise.sql (progreso en attempts)
  - 24-trg_update_missions_on_exercise.sql (misiones en attempts)
  - 25-trg_update_missions_on_submission.sql (misiones en submissions)
  - 26-trg_update_missions_on_streak.sql (rachas correctas)
  - 27-trg_update_module_progress_on_submission.sql (progreso en submissions calificadas)
- **Total objetos**: 34 → 39

### 2025-11-11 - GAP-3 Sistema de Progresión CEFR
- ✨ **2 tablas nuevas**: user_difficulty_progress (métricas CEFR), user_current_level (ZDP)
- ✨ **3 funciones nuevas**: check_difficulty_promotion_eligibility, promote_user_difficulty_level, update_difficulty_progress
- Sistema completo de promoción entre niveles CEFR (A1-Nativo)
- Zona de desarrollo próximo (ZDP) implementada
- **Total objetos**: 29 → 34

### 2025-11-09 - Reorganización DDL
- Reorganización completa de estructura de schemas
