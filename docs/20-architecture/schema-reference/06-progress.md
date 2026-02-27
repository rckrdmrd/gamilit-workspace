# Schema: progress_tracking (21 tablas)

> **Nota:** Este documento describe el modelo conceptual. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/progress_tracking/`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

## Progreso de Modulos y Ejercicios

### progress_tracking.module_progress
Progreso del estudiante por modulo - tracking completo de avance.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| module_id | UUID | NOT NULL | - | FK educational_content.modules |
| status | progress_status | NULL | 'not_started' | Estado: not_started, in_progress, completed, reviewed, mastered |
| progress_percentage | INTEGER | NULL | 0 | Porcentaje de progreso (0-100) |
| completed_exercises | INTEGER | NULL | 0 | Ejercicios completados |
| total_exercises | INTEGER | NULL | 0 | Ejercicios totales en modulo |
| submitted_exercises | INTEGER | NULL | 0 | Ejercicios enviados (pendientes o validados) - revision manual |
| graded_exercises | INTEGER | NULL | 0 | Ejercicios calificados por maestro (score >= 60) |
| submitted_progress_percentage | NUMERIC(5,2) | NULL | 0 | Progreso basado en envios |
| graded_progress_percentage | NUMERIC(5,2) | NULL | 0 | Progreso basado en calificaciones |
| skipped_exercises | INTEGER | NULL | 0 | Ejercicios saltados |
| total_score | INTEGER | NULL | 0 | Puntaje total acumulado |
| max_possible_score | INTEGER | NULL | NULL | Puntaje maximo posible |
| average_score | NUMERIC(5,2) | NULL | NULL | Puntaje promedio |
| best_score | INTEGER | NULL | NULL | Mejor puntaje |
| total_xp_earned | INTEGER | NULL | 0 | XP total ganado en modulo |
| total_ml_coins_earned | INTEGER | NULL | 0 | ML Coins ganados en modulo |
| time_spent | INTERVAL | NULL | '00:00:00' | Tiempo total dedicado |
| sessions_count | INTEGER | NULL | 0 | Cantidad de sesiones |
| attempts_count | INTEGER | NULL | 0 | Intentos totales |
| hints_used_total | INTEGER | NULL | 0 | Pistas usadas en total |
| comodines_used_total | INTEGER | NULL | 0 | Comodines usados |
| comodines_cost_total | INTEGER | NULL | 0 | Costo total de comodines |
| started_at | TIMESTAMPTZ | NULL | NULL | Fecha de inicio |
| completed_at | TIMESTAMPTZ | NULL | NULL | Fecha de completado |
| last_accessed_at | TIMESTAMPTZ | NULL | NULL | Ultimo acceso |
| deadline | TIMESTAMPTZ | NULL | NULL | Fecha limite |
| classroom_id | UUID | NULL | NULL | FK social_features.classrooms |
| assignment_id | UUID | NULL | NULL | Asignacion relacionada |
| allow_retry | BOOLEAN | NULL | true | Permitir reintentos |
| sequential_completion | BOOLEAN | NULL | false | Completado secuencial requerido |
| adaptive_difficulty | BOOLEAN | NULL | false | Dificultad adaptativa habilitada |
| learning_path | JSONB | NULL | '[]' | Ruta de aprendizaje |
| performance_analytics | JSONB | NULL | '{}' | Analiticas de rendimiento |
| student_notes | TEXT | NULL | NULL | Notas del estudiante |
| teacher_notes | TEXT | NULL | NULL | Notas del profesor |
| system_observations | JSONB | NULL | '{}' | Observaciones del sistema |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Unique:** (user_id, module_id)
**Check:** progress_percentage >= 0 AND progress_percentage <= 100
**Indices:** `idx_module_progress_user`, `idx_module_progress_module`, `idx_module_progress_status`, `idx_module_progress_classroom`, `idx_module_progress_completed` (parcial), `idx_module_progress_incomplete` (parcial), `idx_module_progress_user_status_updated`
**RLS:** insert_own, select_own, select_admin, select_teacher, update_own

---

### progress_tracking.exercise_attempts
Intentos de ejercicios con respuestas, puntajes y uso de comodines.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| exercise_id | UUID | NOT NULL | - | FK educational_content.exercises |
| attempt_number | INTEGER | NULL | 1 | Numero de intento |
| submitted_answers | JSONB | NOT NULL | - | Respuestas enviadas |
| is_correct | BOOLEAN | NULL | NULL | Respuesta correcta |
| score | INTEGER | NULL | NULL | Puntaje obtenido |
| time_spent_seconds | INTEGER | NULL | NULL | Tiempo invertido (segundos) |
| hints_used | INTEGER | NULL | 0 | Pistas usadas |
| comodines_used | JSONB | NULL | '[]' | Array de comodines usados: ["pistas", "vision_lectora"] |
| xp_earned | INTEGER | NULL | 0 | XP ganado |
| ml_coins_earned | INTEGER | NULL | 0 | ML Coins ganados |
| submitted_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de envio |
| metadata | JSONB | NULL | '{...}' | Browser, device_type, response_pattern |

**Check:** attempt_number > 0, score >= 0
**Indices:** `idx_exercise_attempts_user`, `idx_exercise_attempts_exercise`, `idx_exercise_attempts_submitted`, `idx_exercise_attempts_user_exercise`, `idx_exercise_attempts_user_exercise_date`
**RLS:** insert_own, select_own, select_admin, select_teacher
**Trigger:** trg_update_user_stats_on_exercise

---

### progress_tracking.exercise_submissions
Envios de ejercicios por estudiantes con ciclo de vida completo (draft -> submitted -> graded -> reviewed).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| exercise_id | UUID | NOT NULL | - | FK educational_content.exercises |
| answer_data | JSONB | NOT NULL | - | Respuesta del estudiante en JSON |
| is_correct | BOOLEAN | NULL | NULL | Respuesta correcta |
| score | INTEGER | NULL | 0 | Puntaje obtenido |
| max_score | INTEGER | NULL | 100 | Puntaje maximo |
| feedback | TEXT | NULL | NULL | Retroalimentacion |
| hint_used | BOOLEAN | NULL | false | Se uso pista |
| hints_count | INTEGER | NULL | 0 | Cantidad de pistas usadas |
| comodines_used | TEXT[] | NULL | NULL | Tipos de comodines usados |
| ml_coins_spent | INTEGER | NULL | 0 | ML Coins gastados |
| time_spent_seconds | INTEGER | NULL | NULL | Tiempo invertido (segundos) |
| attempt_number | INTEGER | NULL | 1 | Numero de intento |
| status | TEXT | NULL | 'submitted' | Estado: draft, submitted, graded, reviewed, pending_review |
| started_at | TIMESTAMPTZ | NULL | NULL | Inicio del ejercicio |
| submitted_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de envio |
| graded_at | TIMESTAMPTZ | NULL | NULL | Fecha de calificacion |
| created_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| xp_earned | INTEGER | NULL | 0 | XP ganado por completar |
| ml_coins_earned | INTEGER | NULL | 0 | ML Coins ganados |
| rewards_claimed | BOOLEAN | NULL | false | Si las recompensas ya fueron reclamadas |

**Check:** score >= 0 AND score <= max_score; status IN ('draft', 'submitted', 'graded', 'reviewed', 'pending_review')
**Indices:** `idx_exercise_submissions_user_id`, `idx_exercise_submissions_exercise_id`, `idx_exercise_submissions_status`, `idx_exercise_submissions_submitted_at`, `idx_exercise_submissions_user_exercise`
**RLS:** insert_own, select_own, select_admin, select_teacher, update_own

---

### progress_tracking.manual_reviews
Evaluaciones manuales de ejercicios creativos (Modulos 4 y 5) por docentes.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| submission_id | UUID | NOT NULL | - | FK progress_tracking.exercise_submissions (UNIQUE) |
| reviewer_id | UUID | NOT NULL | - | FK auth_management.profiles (ON DELETE RESTRICT) |
| rubric_scores | JSONB | NOT NULL | '{}' | Puntuaciones por criterio ej: {"creativity": 25, "accuracy": 30} |
| total_score | INTEGER | NULL | NULL | Puntuacion total (0-100) |
| general_feedback | TEXT | NULL | NULL | Comentarios generales del docente |
| detailed_feedback | JSONB | NULL | NULL | Feedback detallado por seccion/criterio |
| status | VARCHAR(20) | NULL | 'pending' | Estado: pending, in_progress, completed, returned |
| started_at | TIMESTAMPTZ | NULL | NULL | Fecha en que el docente inicio la revision |
| completed_at | TIMESTAMPTZ | NULL | NULL | Fecha en que se completo la evaluacion |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Unique:** (submission_id)
**Check:** total_score >= 0 AND total_score <= 100; status IN ('pending', 'in_progress', 'completed', 'returned')
**Indices:** `idx_manual_reviews_submission`, `idx_manual_reviews_reviewer`, `idx_manual_reviews_status`
**Trigger:** trg_manual_reviews_updated_at

---

## Sesiones y Engagement

### progress_tracking.learning_sessions
Sesiones de aprendizaje con tracking de tiempo y actividad.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| session_token | TEXT | NULL | NULL | Token unico de sesion |
| session_type | TEXT | NULL | 'learning' | Tipo: learning, practice, assessment, review |
| module_id | UUID | NULL | NULL | FK educational_content.modules |
| exercise_id | UUID | NULL | NULL | FK educational_content.exercises |
| classroom_id | UUID | NULL | NULL | Aula relacionada |
| started_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Inicio de sesion |
| ended_at | TIMESTAMPTZ | NULL | NULL | Fin de sesion |
| duration | INTERVAL | NULL | NULL | Duracion total |
| active_time | INTERVAL | NULL | NULL | Tiempo activo |
| idle_time | INTERVAL | NULL | NULL | Tiempo inactivo |
| exercises_attempted | INTEGER | NULL | 0 | Ejercicios intentados |
| exercises_completed | INTEGER | NULL | 0 | Ejercicios completados |
| content_viewed | INTEGER | NULL | 0 | Contenido visualizado |
| total_score | INTEGER | NULL | 0 | Puntaje total en sesion |
| total_xp_earned | INTEGER | NULL | 0 | XP ganado en sesion |
| total_ml_coins_earned | INTEGER | NULL | 0 | ML Coins ganados en sesion |
| clicks_count | INTEGER | NULL | 0 | Clics realizados |
| page_views | INTEGER | NULL | 0 | Paginas visitadas |
| resource_downloads | INTEGER | NULL | 0 | Descargas de recursos |
| device_info | JSONB | NULL | '{}' | Informacion del dispositivo |
| browser_info | JSONB | NULL | '{}' | Informacion del navegador |
| connection_quality | TEXT | NULL | NULL | Calidad de conexion |
| errors_encountered | INTEGER | NULL | 0 | Errores encontrados |
| is_active | BOOLEAN | NULL | true | Sesion activa |
| completion_status | TEXT | NULL | 'ongoing' | Estado: ongoing, completed, abandoned, timed_out |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Unique:** (session_token)
**Check:** completion_status IN ('ongoing', 'completed', 'abandoned', 'timed_out'); session_type IN ('learning', 'practice', 'assessment', 'review')
**Indices:** `idx_sessions_user`, `idx_sessions_module`, `idx_sessions_started`, `idx_sessions_active` (parcial)
**RLS:** insert_own, select_own, select_admin, select_teacher, update_own

---

### progress_tracking.engagement_metrics
Metricas diarias de engagement y actividad de usuarios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| metric_date | DATE | NOT NULL | CURRENT_DATE | Fecha de estas metricas |
| daily_active | BOOLEAN | NOT NULL | false | Si el usuario estuvo activo ese dia |
| sessions_count | INTEGER | NOT NULL | 0 | Sesiones de aprendizaje en esa fecha |
| total_time_seconds | INTEGER | NOT NULL | 0 | Tiempo total en plataforma (segundos) |
| exercises_attempted | INTEGER | NOT NULL | 0 | Ejercicios intentados |
| exercises_completed | INTEGER | NOT NULL | 0 | Ejercicios completados |
| modules_started | INTEGER | NOT NULL | 0 | Modulos iniciados |
| modules_completed | INTEGER | NOT NULL | 0 | Modulos completados |
| achievements_unlocked | INTEGER | NOT NULL | 0 | Logros desbloqueados |
| social_interactions | INTEGER | NOT NULL | 0 | Interacciones sociales |
| engagement_score | NUMERIC(5,2) | NULL | 0 | Puntaje de engagement calculado (0-100) |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Unique:** (user_id, metric_date)
**Indices:** `idx_engagement_metrics_user_id`, `idx_engagement_metrics_date`, `idx_engagement_metrics_user_date`, `idx_engagement_metrics_daily_active` (parcial), `idx_engagement_metrics_score`
**Trigger:** trg_engagement_metrics_updated_at

---

## Rutas de Aprendizaje

### progress_tracking.learning_paths
Rutas de aprendizaje predefinidas (secuencias de modulos).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| name | VARCHAR(255) | NOT NULL | - | Nombre de la ruta |
| description | TEXT | NULL | NULL | Descripcion |
| is_recommended | BOOLEAN | NOT NULL | false | Si es recomendada para nuevos usuarios |
| difficulty_level | VARCHAR(50) | NULL | NULL | Dificultad: facil, intermedio, dificil, experto |
| estimated_hours | INTEGER | NULL | NULL | Tiempo estimado de completado (horas) |
| is_active | BOOLEAN | NOT NULL | true | Si esta activa/disponible |
| created_by | UUID | NULL | NULL | FK auth_management.profiles |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Check:** difficulty_level IN ('facil', 'intermedio', 'dificil', 'experto')
**Indices:** `idx_learning_paths_is_active`, `idx_learning_paths_is_recommended`, `idx_learning_paths_difficulty`, `idx_learning_paths_created_by` (parcial)
**Trigger:** trg_learning_paths_updated_at

---

### progress_tracking.learning_path_modules
Tabla de union que define que modulos pertenecen a cada learning path y en que orden.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| learning_path_id | UUID | NOT NULL | - | FK progress_tracking.learning_paths |
| module_id | UUID | NOT NULL | - | FK educational_content.modules |
| sequence_order | INTEGER | NOT NULL | - | Posicion en la ruta (1-based) |
| is_optional | BOOLEAN | NOT NULL | false | Si el modulo es opcional |
| minimum_completion_percentage | INTEGER | NULL | 100 | Porcentaje minimo para avanzar (0-100) |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Unique:** (learning_path_id, module_id), (learning_path_id, sequence_order)
**Check:** sequence_order > 0; minimum_completion_percentage >= 0 AND <= 100
**Indices:** `idx_learning_path_modules_path_id`, `idx_learning_path_modules_module_id`, `idx_learning_path_modules_sequence`

---

### progress_tracking.user_learning_paths
Rutas de aprendizaje asignadas a usuarios con tracking de progreso.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| learning_path_id | UUID | NOT NULL | - | FK progress_tracking.learning_paths |
| enrolled_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | Fecha de inscripcion |
| started_at | TIMESTAMPTZ | NULL | NULL | Fecha de inicio |
| completed_at | TIMESTAMPTZ | NULL | NULL | Fecha de completado |
| completion_percentage | NUMERIC(5,2) | NOT NULL | 0 | Progreso general (0-100) |
| current_module_index | INTEGER | NULL | 0 | Indice del modulo actual en la secuencia |
| status | VARCHAR(50) | NOT NULL | 'enrolled' | Estado: enrolled, in_progress, completed, abandoned |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Unique:** (user_id, learning_path_id)
**Check:** completion_percentage >= 0 AND <= 100; status IN ('enrolled', 'in_progress', 'completed', 'abandoned')
**Indices:** `idx_user_learning_paths_user_id`, `idx_user_learning_paths_path_id`, `idx_user_learning_paths_status`, `idx_user_learning_paths_user_status`, `idx_user_learning_paths_enrolled_at`
**Trigger:** trg_user_learning_paths_updated_at

---

## Mastery y Habilidades

### progress_tracking.mastery_trackings
Seguimiento de dominio de temas/conceptos por usuario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| module_id | UUID | NOT NULL | - | FK educational_content.modules |
| topic | VARCHAR(200) | NOT NULL | - | Tema o concepto especifico (ej: "lectura literal", "inferencia") |
| mastery_level | NUMERIC(5,2) | NOT NULL | 0 | Porcentaje de dominio (0-100) |
| attempts_count | INTEGER | NOT NULL | 0 | Intentos totales en ejercicios del tema |
| correct_attempts | INTEGER | NOT NULL | 0 | Intentos correctos |
| last_attempt_at | TIMESTAMPTZ | NULL | NULL | Ultimo intento |
| mastered_at | TIMESTAMPTZ | NULL | NULL | Fecha en que se alcanzo mastery |
| status | VARCHAR(50) | NOT NULL | 'learning' | Estado: not_started, learning, practicing, mastered, needs_review |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Unique:** (user_id, module_id, topic)
**Check:** mastery_level >= 0 AND <= 100; status IN ('not_started', 'learning', 'practicing', 'mastered', 'needs_review')
**Indices:** `idx_mastery_trackings_user_id`, `idx_mastery_trackings_module_id`, `idx_mastery_trackings_status`, `idx_mastery_trackings_mastery_level`, `idx_mastery_trackings_user_module`, `idx_mastery_trackings_needs_review` (parcial)
**Trigger:** trg_mastery_trackings_updated_at

---

### progress_tracking.module_completion_trackings
Seguimiento detallado de completitud de modulos por usuario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| module_id | UUID | NOT NULL | - | FK educational_content.modules |
| completion_percentage | NUMERIC(5,2) | NOT NULL | 0 | Porcentaje de completado (0-100) |
| exercises_completed | INTEGER | NOT NULL | 0 | Ejercicios completados en modulo |
| exercises_total | INTEGER | NOT NULL | 0 | Total de ejercicios en modulo |
| time_spent_seconds | INTEGER | NOT NULL | 0 | Tiempo total en modulo (segundos) |
| started_at | TIMESTAMPTZ | NULL | NULL | Fecha de inicio |
| completed_at | TIMESTAMPTZ | NULL | NULL | Fecha de completado |
| last_activity_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | Ultima actividad |
| status | VARCHAR(50) | NOT NULL | 'not_started' | Estado: not_started, in_progress, completed, mastered |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Unique:** (user_id, module_id)
**Check:** completion_percentage >= 0 AND <= 100; status IN ('not_started', 'in_progress', 'completed', 'mastered')
**Indices:** `idx_module_completion_user_id`, `idx_module_completion_module_id`, `idx_module_completion_status`, `idx_module_completion_percentage`, `idx_module_completion_user_status`
**Trigger:** trg_module_completion_trackings_updated_at

---

### progress_tracking.skill_assessments
Evaluaciones de habilidades especificas de usuarios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| skill_name | VARCHAR(100) | NOT NULL | - | Nombre de la habilidad (ej: "lectura literal", "inferencia") |
| skill_category | VARCHAR(50) | NULL | NULL | Categoria (ej: "comprension_lectora", "matematicas") |
| assessment_score | NUMERIC(5,2) | NOT NULL | - | Puntaje numerico (0-100) |
| proficiency_level | VARCHAR(50) | NULL | NULL | Nivel: novice, beginner, intermediate, advanced, expert |
| assessed_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | Fecha de evaluacion |
| assessed_by_module_id | UUID | NULL | NULL | FK educational_content.modules |
| evidence | JSONB | NULL | NULL | Evidencia en JSONB |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Check:** assessment_score >= 0 AND <= 100; proficiency_level IN ('novice', 'beginner', 'intermediate', 'advanced', 'expert')
**Indices:** `idx_skill_assessments_user_id`, `idx_skill_assessments_skill`, `idx_skill_assessments_category` (parcial), `idx_skill_assessments_level`, `idx_skill_assessments_user_skill`
**Trigger:** trg_skill_assessments_updated_at

---

## Niveles y Dificultad

### progress_tracking.user_current_levels
Nivel actual del estudiante (denormalizado para performance). Incluye control de zona de desarrollo proximo y resultados de placement test.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| user_id | UUID | NOT NULL | - | PK, FK auth_management.profiles |
| current_level | difficulty_level | NOT NULL | 'beginner' | Nivel actual del estudiante |
| previous_level | difficulty_level | NULL | NULL | Nivel anterior |
| max_allowed_level | difficulty_level | NOT NULL | 'elementary' | Nivel maximo permitido segun zona de desarrollo proximo (ZDP) |
| placement_test_completed | BOOLEAN | NOT NULL | false | Si completo el placement test inicial |
| placement_test_score | NUMERIC(5,2) | NULL | NULL | Puntaje del placement test |
| placement_test_date | TIMESTAMPTZ | NULL | NULL | Fecha del placement test |
| level_changed_at | TIMESTAMPTZ | NULL | NULL | Fecha de cambio de nivel |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**PK:** user_id (single column, FK a auth_management.profiles)
**Indices:** `idx_user_current_levels_level`, `idx_user_current_levels_max_allowed`
**RLS:** select_own (auth.uid()), manage_system (ALL)
**Trigger:** trg_user_current_levels_updated_at

---

### progress_tracking.user_difficulty_progresses
Tracking del progreso de cada usuario por nivel de dificultad CEFR (A1-C2+). Incluye columnas generadas automaticamente.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| user_id | UUID | NOT NULL | - | PK (compuesto), FK auth_management.profiles |
| difficulty_level | difficulty_level | NOT NULL | - | PK (compuesto), nivel CEFR |
| exercises_attempted | INTEGER | NOT NULL | 0 | Ejercicios intentados |
| exercises_completed | INTEGER | NOT NULL | 0 | Ejercicios completados |
| exercises_correct_first_attempt | INTEGER | NOT NULL | 0 | Correctos al primer intento |
| success_rate | NUMERIC(5,2) | - | GENERATED | Tasa de exito calculada automaticamente (correct_first_attempt / attempted * 100) |
| total_time_spent_seconds | BIGINT | NOT NULL | 0 | Tiempo total en segundos |
| avg_time_per_exercise | NUMERIC(10,2) | - | GENERATED | Tiempo promedio por ejercicio (calculado) |
| is_ready_for_promotion | BOOLEAN | NOT NULL | false | Si cumple criterios para promocion al siguiente nivel |
| promoted_at | TIMESTAMPTZ | NULL | NULL | Fecha de promocion |
| first_attempt_at | TIMESTAMPTZ | NULL | NULL | Primer intento |
| last_attempt_at | TIMESTAMPTZ | NULL | NULL | Ultimo intento |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**PK:** (user_id, difficulty_level) compuesto
**Indices:** `idx_user_difficulty_progresses_user`, `idx_user_difficulty_progresses_level`, `idx_user_difficulty_progresses_success_rate`, `idx_user_difficulty_progresses_ready_promotion` (parcial)
**RLS:** select_own (auth.uid()), select_teacher
**Trigger:** trg_user_difficulty_progresses_updated_at

---

## Snapshots y Certificados

### progress_tracking.progress_snapshots
Snapshots historicos del progreso de usuarios (diario/semanal/mensual).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| snapshot_date | DATE | NOT NULL | CURRENT_DATE | Fecha del snapshot |
| snapshot_data | JSONB | NOT NULL | - | Datos detallados de progreso en el momento |
| total_modules_completed | INTEGER | NULL | 0 | Modulos completados al momento |
| total_exercises_completed | INTEGER | NULL | 0 | Ejercicios completados al momento |
| total_time_spent_seconds | INTEGER | NULL | 0 | Tiempo total en plataforma |
| total_xp | INTEGER | NULL | 0 | XP total acumulado |
| current_rank | VARCHAR(100) | NULL | NULL | Rango maya actual |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Unique:** (user_id, snapshot_date)
**Indices:** `idx_progress_snapshots_user_id`, `idx_progress_snapshots_date`, `idx_progress_snapshots_user_date`, `idx_progress_snapshots_data_gin` (GIN)

---

### progress_tracking.certificates
Certificados digitales emitidos a estudiantes por completar modulos, cursos o lograr hitos (EPIC 10.2).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| module_id | UUID | NULL | NULL | FK educational_content.modules |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| classroom_id | UUID | NULL | NULL | FK social_features.classrooms |
| certificate_type | certificate_type | NOT NULL | 'module_completion' | Tipo de certificado |
| title | VARCHAR(255) | NOT NULL | - | Titulo del certificado |
| description | TEXT | NULL | NULL | Descripcion |
| student_name | VARCHAR(255) | NOT NULL | - | Snapshot del nombre del estudiante al momento de emision |
| achievement_name | VARCHAR(255) | NOT NULL | - | Nombre del logro |
| verification_code | VARCHAR(50) | NOT NULL | - | Codigo unico verificacion QR (CERT-XXXX-XXXX-XXXX) |
| verification_url | TEXT | NULL | NULL | URL de verificacion |
| certificate_hash | VARCHAR(64) | NULL | NULL | Hash SHA-256 para verificar integridad |
| final_score | NUMERIC(5,2) | NULL | 0 | Puntaje final (0-100) |
| total_xp_earned | INTEGER | NULL | 0 | XP total ganado |
| total_ml_coins_earned | INTEGER | NULL | 0 | ML Coins ganados |
| time_spent | VARCHAR(50) | NULL | '00:00:00' | Tiempo invertido |
| exercises_completed | INTEGER | NULL | 0 | Ejercicios completados |
| status | certificate_status | NOT NULL | 'pending' | Estado del certificado |
| issued_at | TIMESTAMPTZ | NULL | NULL | Fecha de emision |
| expires_at | TIMESTAMPTZ | NULL | NULL | Fecha de expiracion |
| revoked_at | TIMESTAMPTZ | NULL | NULL | Fecha de revocacion |
| revocation_reason | TEXT | NULL | NULL | Razon de revocacion |
| pdf_url | TEXT | NULL | NULL | URL del PDF |
| pdf_path | TEXT | NULL | NULL | Ruta del PDF |
| pdf_size_bytes | INTEGER | NULL | NULL | Tamano del PDF en bytes |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Unique:** verification_code; (user_id, module_id) WHERE module_id IS NOT NULL AND status != 'revoked'
**Check:** final_score >= 0 AND <= 100; total_xp_earned >= 0; total_ml_coins_earned >= 0; exercises_completed >= 0
**Indices:** `idx_certificates_user_id`, `idx_certificates_module_id` (parcial), `idx_certificates_tenant_id` (parcial), `idx_certificates_classroom_id` (parcial), `idx_certificates_status`, `idx_certificates_issued_at` (parcial), `idx_certificates_type`, `idx_certificates_user_status`, `idx_certificates_user_module_unique` (UNIQUE parcial)

---

## Misiones Programadas

### progress_tracking.scheduled_missions
Misiones programadas para aulas especificas con fechas de inicio/fin y bonificaciones opcionales.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| mission_id | UUID | NOT NULL | - | ID de la mision programada |
| classroom_id | UUID | NOT NULL | - | FK social_features.classrooms |
| scheduled_by | UUID | NOT NULL | - | FK auth_management.profiles (ON DELETE RESTRICT) |
| starts_at | TIMESTAMPTZ | NOT NULL | - | Fecha y hora de inicio |
| ends_at | TIMESTAMPTZ | NOT NULL | - | Fecha y hora de finalizacion |
| is_active | BOOLEAN | NULL | true | Si la mision programada esta activa |
| bonus_xp | INTEGER | NULL | 0 | XP adicional al completar |
| bonus_coins | INTEGER | NULL | 0 | ML Coins adicionales al completar |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Check:** ends_at > starts_at; bonus_xp >= 0; bonus_coins >= 0
**Indices:** `idx_scheduled_missions_mission`, `idx_scheduled_missions_classroom`, `idx_scheduled_missions_scheduled_by`, `idx_scheduled_missions_dates` (parcial), `idx_scheduled_missions_active` (parcial), `idx_scheduled_missions_classroom_active` (parcial)
**RLS:** select_admin, select_teacher, insert_teacher, update_teacher

---

## Intervenciones y Alertas

### progress_tracking.student_intervention_alerts
Alertas de intervencion para identificar estudiantes en riesgo que requieren atencion del profesor.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| student_id | UUID | NOT NULL | - | FK auth_management.profiles |
| classroom_id | UUID | NULL | NULL | FK social_features.classrooms |
| alert_type | TEXT | NOT NULL | - | Tipo: no_activity, low_score, declining_trend, repeated_failures, excessive_time, low_engagement |
| severity | TEXT | NOT NULL | - | Severidad: low, medium, high, critical |
| title | TEXT | NOT NULL | - | Titulo de la alerta |
| description | TEXT | NULL | NULL | Descripcion |
| metrics | JSONB | NULL | NULL | Metricas asociadas ej: {"score": 45, "threshold": 60} |
| status | TEXT | NULL | 'active' | Estado: active, acknowledged, resolved, dismissed |
| generated_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | Fecha de generacion |
| acknowledged_at | TIMESTAMPTZ | NULL | NULL | Fecha de reconocimiento |
| acknowledged_by | UUID | NULL | NULL | FK auth_management.profiles |
| resolved_at | TIMESTAMPTZ | NULL | NULL | Fecha de resolucion |
| resolved_by | UUID | NULL | NULL | FK auth_management.profiles |
| resolution_notes | TEXT | NULL | NULL | Notas de resolucion |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Check:** alert_type IN (...6 tipos); severity IN ('low', 'medium', 'high', 'critical'); status IN ('active', 'acknowledged', 'resolved', 'dismissed')
**Indices:** `idx_student_alerts_student`, `idx_student_alerts_classroom`, `idx_student_alerts_status`, `idx_student_alerts_severity`, `idx_student_alerts_type`, `idx_student_alerts_tenant`, `idx_student_alerts_generated`, `idx_student_alerts_classroom_status` (parcial)
**RLS:** admin_view_tenant_alerts, teacher_view_classroom_alerts, teacher_manage_classroom_alerts
**Trigger:** trg_student_intervention_alerts_updated_at

---

### progress_tracking.teacher_alert_configurations
Configuraciones personalizadas de alertas por profesor. Permite definir umbrales y preferencias de notificacion.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| teacher_id | UUID | NOT NULL | - | FK auth_management.profiles |
| classroom_id | UUID | NULL | NULL | FK social_features.classrooms (NULL = config global del profesor) |
| alert_type | TEXT | NOT NULL | - | Tipo: no_activity, low_score, declining_trend, repeated_failures, excessive_time, low_engagement |
| is_enabled | BOOLEAN | NOT NULL | true | Si este tipo de alerta esta habilitado |
| threshold_value | NUMERIC(5,2) | NULL | NULL | Valor del umbral para disparar la alerta |
| threshold_unit | TEXT | NULL | NULL | Unidad: percentage, days, count, minutes |
| notify_email | BOOLEAN | NOT NULL | false | Notificar por email |
| notify_in_app | BOOLEAN | NOT NULL | true | Notificar en la aplicacion |
| cooldown_hours | INTEGER | NULL | 24 | Horas minimas entre alertas del mismo tipo para el mismo estudiante |
| custom_settings | JSONB | NULL | NULL | Configuraciones adicionales en JSON |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Unique:** (teacher_id, classroom_id, alert_type)
**Check:** alert_type IN (...6 tipos); threshold_unit IN ('percentage', 'days', 'count', 'minutes') OR NULL
**Indices:** `idx_teacher_alert_config_teacher`, `idx_teacher_alert_config_classroom` (parcial), `idx_teacher_alert_config_tenant`, `idx_teacher_alert_config_type`, `idx_teacher_alert_config_enabled` (parcial)
**RLS:** teacher_manage_own_config (ALL), admin_manage_tenant_config (SELECT)
**Trigger:** trg_teacher_alert_configurations_updated_at

---

### progress_tracking.teacher_interventions
Registro de acciones de intervencion de profesores para estudiantes en riesgo. Captura el historial completo incluyendo seguimientos e intervenciones multi-paso.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| alert_id | UUID | NULL | NULL | FK progress_tracking.student_intervention_alerts (opcional, puede ser standalone) |
| student_id | UUID | NOT NULL | - | FK auth_management.profiles |
| teacher_id | UUID | NOT NULL | - | FK auth_management.profiles |
| classroom_id | UUID | NULL | NULL | FK social_features.classrooms |
| intervention_type | TEXT | NOT NULL | - | Tipo: one_on_one_session, parent_contact, resource_assignment, peer_tutoring, accommodation, referral, behavior_plan, progress_check, encouragement, schedule_adjustment, other |
| title | TEXT | NOT NULL | - | Titulo de la intervencion |
| description | TEXT | NULL | NULL | Descripcion |
| action_taken | TEXT | NOT NULL | - | Accion tomada |
| outcome | TEXT | NULL | NULL | Resultado |
| scheduled_date | TIMESTAMPTZ | NULL | NULL | Fecha programada |
| completed_date | TIMESTAMPTZ | NULL | NULL | Fecha de completado |
| status | TEXT | NOT NULL | 'planned' | Estado: planned, in_progress, completed, cancelled, rescheduled |
| priority | TEXT | NOT NULL | 'medium' | Prioridad: low, medium, high, urgent |
| follow_up_required | BOOLEAN | NULL | false | Si requiere seguimiento |
| follow_up_date | TIMESTAMPTZ | NULL | NULL | Fecha de seguimiento |
| follow_up_notes | TEXT | NULL | NULL | Notas de seguimiento |
| parent_contacted | BOOLEAN | NULL | false | Si se contacto al padre |
| parent_contact_date | TIMESTAMPTZ | NULL | NULL | Fecha de contacto con padre |
| parent_contact_notes | TEXT | NULL | NULL | Notas del contacto con padre |
| effectiveness_rating | INTEGER | NULL | NULL | Calificacion de efectividad (1-5) |
| student_response | TEXT | NULL | NULL | Respuesta del estudiante |
| notes | TEXT | NULL | NULL | Notas generales |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants |
| created_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |

**Check:** intervention_type IN (...11 tipos); status IN ('planned', 'in_progress', 'completed', 'cancelled', 'rescheduled'); priority IN ('low', 'medium', 'high', 'urgent'); effectiveness_rating IS NULL OR (>= 1 AND <= 5)
**Indices:** `idx_teacher_interventions_alert`, `idx_teacher_interventions_student`, `idx_teacher_interventions_teacher`, `idx_teacher_interventions_classroom`, `idx_teacher_interventions_status`, `idx_teacher_interventions_type`, `idx_teacher_interventions_tenant`, `idx_teacher_interventions_scheduled` (parcial), `idx_teacher_interventions_follow_up` (parcial)
**RLS:** teacher_manage_own_interventions (ALL), teacher_view_classroom_interventions (SELECT), admin_view_tenant_interventions (SELECT)
**Trigger:** trg_teacher_interventions_updated_at

---

## Notas de Profesores

### progress_tracking.teacher_notes
Notas de profesores sobre estudiantes para seguimiento de progreso y observaciones.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| teacher_id | UUID | NOT NULL | - | FK auth_management.profiles (ON DELETE RESTRICT) |
| student_id | UUID | NOT NULL | - | FK auth_management.profiles |
| note | TEXT | NOT NULL | - | Contenido de la nota |
| is_private | BOOLEAN | NOT NULL | true | Si es privada (no visible a estudiante ni padres) |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Indices:** `idx_teacher_notes_teacher_id`, `idx_teacher_notes_student_id`, `idx_teacher_notes_created_at`, `idx_teacher_notes_teacher_student`

---

*GAMILIT - Schema Reference: progress_tracking*
*21 tablas | PostgreSQL 15*