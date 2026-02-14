# Schema: data_warehouse (16 tablas, 3 views)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT
> **Schema fisico DDL:** `data_warehouse`
> **Tipo:** analytics
> **DDL Path:** `apps/database/ddl/schemas/data_warehouse/`
> **Constante Backend:** `DB_SCHEMAS.DATA_WAREHOUSE`

---

## Descripcion

Star schema dimensional model para analytics avanzado y reportes historicos. Incluye 8 tablas de dimension, 4 tablas de hechos, 2 tablas de ML, y 2 tablas de ETL metadata.

**Nota:** Este schema es placeholder (no cargado por defecto en recreacion de BD). Las tablas existen en DDL pero se cargan bajo demanda.

---

## Tablas de Dimension (8)

### data_warehouse.dim_dates
Dimension de fecha para analytics basados en tiempo.

| Aspecto | Valor |
|---------|-------|
| Grain | Una fila por dia del calendario |
| PK | date_key (INTEGER, formato YYYYMMDD) |
| Columnas clave | full_date, day_of_week, month, quarter, year, school_year, semester, bimester |
| Flags | is_weekend, is_holiday, is_school_day, is_vacation |
| Pre-populada | Si (rango de 10 anos) |

### data_warehouse.dim_times
Dimension de hora del dia.

### data_warehouse.dim_students
Dimension de estudiantes (SCD Type 2).

### data_warehouse.dim_exercises
Dimension de ejercicios educativos.

### data_warehouse.dim_modules
Dimension de modulos educativos.

### data_warehouse.dim_teachers
Dimension de docentes.

### data_warehouse.dim_achievements
Dimension de logros del sistema de gamificacion.

### data_warehouse.dim_event_types
Dimension de tipos de eventos del sistema.

---

## Tablas de Hechos (4)

### data_warehouse.fact_exercise_completions
Completaciones de ejercicios (grain: 1 fila por intento completado).

### data_warehouse.fact_daily_progress
Progreso diario agregado (grain: 1 fila por estudiante por modulo por dia).

| Aspecto | Valor |
|---------|-------|
| Grain | student_key + module_key + date_key |
| Medidas ejercicios | exercises_completed, exercises_attempted, exercises_passed, perfect_scores_count |
| Medidas puntaje | total_score, average_score, min_score, max_score |
| Medidas tiempo | total_time_spent_seconds, sessions_count |
| Medidas gamificacion | xp_earned, ml_coins_earned, ml_coins_spent, achievements_unlocked |
| Medidas progreso | progress_percentage, progress_delta, streak_days |
| Acumulados | cumulative_exercises_completed, cumulative_xp, cumulative_ml_coins |

### data_warehouse.fact_gamification_events
Eventos de gamificacion (XP, logros, misiones).

### data_warehouse.fact_teacher_metrics
Metricas de actividad docente.

---

## Tablas de ML (2)

### data_warehouse.ml_model_weights
Pesos de modelos de machine learning para prediccion.

### data_warehouse.ml_prediction_logs
Logs de predicciones generadas por modelos ML.

---

## Tablas ETL (2)

### data_warehouse.etl_extraction_logs
Registro de extracciones ETL desde fuentes operacionales.

### data_warehouse.etl_load_logs
Registro de cargas ETL al data warehouse.

---

## Notas

- **Sin entities backend:** Intencional. El data warehouse se accede via SQL raw y materialized views.
- **Sin RLS:** El acceso es controlado a nivel de servicio (solo admin/analytics).
- **ETL:** Carga batch diaria, agregando desde tablas transaccionales operacionales.

---

*GAMILIT - Schema Reference: data_warehouse*
