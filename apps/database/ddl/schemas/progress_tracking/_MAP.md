# Schema: progress_tracking

Seguimiento de progreso: avance de módulos, intentos, métricas de engagement

## Estructura

- **tables/**: 13 archivos
- **enums/**: 2 archivos
- **functions/**: 6 archivos
- **triggers/**: 3 archivos
- **indexes/**: 2 archivos
- **views/**: 1 archivos
- **rls-policies/**: 2 archivos

**Total:** 29 objetos

## Contenido Detallado

### tables/ (13 archivos)

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
```

### enums/ (2 archivos)

```
attempt_result.sql
progress_status.sql
```

### functions/ (6 archivos)

```
01-calculate_module_progress.sql
03-get_user_progress.sql
05-get_classroom_analytics.sql
06-update_mission_progress.sql
07-update_exercise_submissions_updated_at.sql
```

### triggers/ (3 archivos)

```
21-trg_update_user_stats_on_exercise.sql
22-exercise_submissions_updated_at.sql
23-trg_module_progress_updated_at.sql
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

**Última actualización:** 2025-11-09
**Reorganización:** 2025-11-09
