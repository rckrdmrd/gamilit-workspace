---
titulo: Schema - data_warehouse
tipo: arquitectura
subtipo: schema-reference
schema: data_warehouse
ultima_actualizacion: 2026-02-27
---

# Schema: data_warehouse (16 tablas)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT
> **Schema fisico DDL:** `data_warehouse`
> **Tipo:** analytics (star schema dimensional model)
> **DDL Path:** `apps/database/ddl/schemas/data_warehouse/`
> **Constante Backend:** `DB_SCHEMAS.DATA_WAREHOUSE`

---

## Descripcion

Star schema dimensional model para analytics avanzado y reportes historicos. Incluye 8 tablas de dimension, 4 tablas de hechos, 2 tablas de ML y 2 tablas de ETL metadata.

**Nota:** Este schema es placeholder (no cargado por defecto en recreacion de BD). Las tablas existen en DDL pero se cargan bajo demanda. Sin entities backend — se accede via SQL raw y materialized views. Sin RLS general (excepto `ml_prediction_logs`); el acceso es controlado a nivel de servicio (solo admin/analytics).

---

## Tablas de Dimension (8)

### data_warehouse.dim_dates

Dimension de fecha conformada para analytics basados en tiempo. Pre-poblada con 10 anos de fechas del calendario. SCD Type: N/A (dimension estatica).

**Grain:** Una fila por dia del calendario.
**Source:** Pre-poblada (no ETL desde fuente operacional).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| date_key | INTEGER | NOT NULL | - | PK — clave sustituta en formato YYYYMMDD (ej. 20260203) |
| full_date | DATE | NOT NULL | - | Valor real de la fecha |
| day_of_week | INTEGER | NOT NULL | - | Dia de la semana 1=Lunes a 7=Domingo (ISO) |
| day_of_week_name | TEXT | NOT NULL | - | Nombre del dia en espanol: 'Lunes', 'Martes', etc. |
| day_of_week_abbrev | TEXT | NOT NULL | - | Abreviacion del dia: 'Lun', 'Mar', etc. |
| day_of_month | INTEGER | NOT NULL | - | Dia del mes (1-31) |
| day_of_year | INTEGER | NOT NULL | - | Dia del ano (1-366) |
| week_of_year | INTEGER | NOT NULL | - | Semana del ano ISO (1-53) |
| week_of_month | INTEGER | NOT NULL | - | Semana del mes (1-5) |
| month | INTEGER | NOT NULL | - | Mes (1-12) |
| month_name | TEXT | NOT NULL | - | Nombre del mes en espanol: 'Enero', 'Febrero', etc. |
| month_abbrev | TEXT | NOT NULL | - | Abreviacion del mes: 'Ene', 'Feb', etc. |
| quarter | INTEGER | NOT NULL | - | Trimestre (1-4) |
| quarter_name | TEXT | NOT NULL | - | Nombre del trimestre: 'Q1', 'Q2', 'Q3', 'Q4' |
| year | INTEGER | NOT NULL | - | Ano (ej. 2026) |
| year_month | TEXT | NOT NULL | - | Ano-mes en formato '2026-02' |
| year_quarter | TEXT | NOT NULL | - | Ano-trimestre en formato '2026-Q1' |
| is_weekend | BOOLEAN | NOT NULL | FALSE | TRUE si es sabado o domingo |
| is_holiday | BOOLEAN | NOT NULL | FALSE | TRUE si es dia festivo |
| holiday_name | TEXT | NULL | - | Nombre del festivo si aplica |
| school_year | TEXT | NOT NULL | - | Ano escolar en formato '2025-2026' |
| semester | INTEGER | NULL | - | Semestre escolar (1 o 2) |
| semester_name | TEXT | NULL | - | Nombre del semestre: 'Primer Semestre', 'Segundo Semestre' |
| bimester | INTEGER | NULL | - | Bimestre del sistema educativo mexicano (1-5) |
| trimester | INTEGER | NULL | - | Trimestre escolar (1-3) |
| is_school_day | BOOLEAN | NULL | TRUE | TRUE si es dia lectivo |
| is_vacation | BOOLEAN | NULL | FALSE | TRUE si es periodo vacacional |
| vacation_period | TEXT | NULL | - | Nombre del periodo vacacional: 'Navidad', 'Semana Santa', 'Verano' |
| fiscal_year | INTEGER | NULL | - | Ano fiscal (opcional) |
| fiscal_quarter | INTEGER | NULL | - | Trimestre fiscal (opcional) |
| fiscal_month | INTEGER | NULL | - | Mes fiscal (opcional) |

**Unique:** `full_date`
**Check:** `day_of_week` BETWEEN 1 AND 7, `day_of_month` BETWEEN 1 AND 31, `month` BETWEEN 1 AND 12, `quarter` BETWEEN 1 AND 4, `semester` BETWEEN 1 AND 2 (o NULL)
**Indices:** `idx_dim_dates_full_date`, `idx_dim_dates_year_month`, `idx_dim_dates_school_year`, `idx_dim_dates_is_weekend` (parcial), `idx_dim_dates_is_holiday` (parcial)

---

### data_warehouse.dim_times

Dimension de hora del dia conformada para analytics intra-dia. Pre-poblada con 1440 filas (una por minuto). SCD Type: N/A (dimension estatica).

**Grain:** Una fila por minuto del dia (1440 filas totales).
**Source:** Pre-poblada (estatica).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| time_key | INTEGER | NOT NULL | - | PK — clave sustituta en formato HHMM (ej. 1430 = 14:30) |
| full_time | TIME | NOT NULL | - | Valor real de la hora |
| hour_24 | INTEGER | NOT NULL | - | Hora en formato 24h (0-23) |
| hour_12 | INTEGER | NOT NULL | - | Hora en formato 12h (1-12) |
| am_pm | TEXT | NOT NULL | - | 'AM' o 'PM' |
| minute | INTEGER | NOT NULL | - | Minuto (0-59) |
| period | TEXT | NOT NULL | - | Periodo del dia: 'morning', 'afternoon', 'evening', 'night' |
| period_spanish | TEXT | NOT NULL | - | Periodo en espanol: 'manana', 'tarde', 'noche', 'madrugada' |
| hour_bucket | TEXT | NOT NULL | - | Agrupacion por hora: '00:00-00:59', '01:00-01:59', etc. |
| half_hour_bucket | TEXT | NOT NULL | - | Agrupacion por media hora: '00:00-00:29', '00:30-00:59', etc. |
| quarter_hour_bucket | TEXT | NOT NULL | - | Agrupacion por cuarto de hora: '00:00-00:14', '00:15-00:29', etc. |
| is_school_hours | BOOLEAN | NULL | FALSE | TRUE para horario escolar (7:00-15:00) |
| is_homework_hours | BOOLEAN | NULL | FALSE | TRUE para horario de tareas (15:00-21:00) |
| school_period | TEXT | NULL | - | Clasificacion educativa: 'before_school', 'school_hours', 'after_school', 'evening', 'night' |

**Unique:** `full_time`
**Check:** `hour_24` BETWEEN 0 AND 23, `hour_12` BETWEEN 1 AND 12, `minute` BETWEEN 0 AND 59, `am_pm` IN ('AM','PM'), `period` IN ('morning','afternoon','evening','night')
**Indices:** `idx_dim_times_hour`, `idx_dim_times_period`, `idx_dim_times_school_hours` (parcial)

---

### data_warehouse.dim_students

Dimension de estudiantes con SCD Type 2 para seguimiento historico de cambios de atributos. SCD Type: 2 (historia con fechas de vigencia).

**Grain:** Una fila por version de estudiante (un estudiante puede tener multiples filas si sus atributos cambian).
**Source:** `auth_management.profiles`, `gamification_system.user_stats`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| student_key | BIGSERIAL | NOT NULL | - | PK — clave sustituta, unica por version |
| student_id | UUID | NOT NULL | - | Clave natural desde `auth_management.profiles.id` |
| display_name | TEXT | NULL | - | Nombre para mostrar |
| full_name | TEXT | NULL | - | Nombre completo |
| first_name | TEXT | NULL | - | Nombre(s) |
| last_name | TEXT | NULL | - | Apellido(s) |
| email | TEXT | NOT NULL | - | Correo electronico |
| avatar_url | TEXT | NULL | - | URL del avatar |
| grade_level | TEXT | NULL | - | Nivel de grado: '6', '7', '8', etc. |
| school_id | UUID | NULL | - | ID de la escuela |
| school_name | TEXT | NULL | - | Nombre de la escuela (desnormalizado) |
| current_rank | TEXT | NULL | - | Rango Maya en este version |
| current_level | INTEGER | NULL | - | Nivel en este version |
| total_xp | INTEGER | NULL | - | XP acumulado en este version |
| ml_coins_balance | INTEGER | NULL | - | Saldo de ML Coins en este version |
| status | TEXT | NOT NULL | 'active' | Estado: 'active', 'inactive', 'suspended', 'pending' |
| role | TEXT | NOT NULL | 'student' | Rol: 'student', 'admin_teacher', 'super_admin', 'parent' |
| registration_date | DATE | NOT NULL | - | Fecha de registro |
| first_activity_date | DATE | NULL | - | Fecha de primera actividad |
| last_activity_date | DATE | NULL | - | Fecha de ultima actividad |
| effective_date | DATE | NOT NULL | - | Fecha en que esta version entro en vigor (SCD2) |
| expiration_date | DATE | NULL | - | Fecha en que esta version expiro (NULL = version actual) (SCD2) |
| is_current | BOOLEAN | NOT NULL | TRUE | TRUE para la version activa actual |
| version_number | INTEGER | NOT NULL | 1 | Numero de version del registro |
| source_updated_at | TIMESTAMPTZ | NULL | - | Fecha de actualizacion en sistema origen |
| etl_loaded_at | TIMESTAMPTZ | NULL | NOW() | Timestamp de carga ETL |
| etl_batch_id | TEXT | NULL | - | ID del batch ETL |

**Check:** `status` IN ('active','inactive','suspended','pending'), `role` IN ('student','admin_teacher','super_admin','parent'), `expiration_date >= effective_date` (o NULL)
**Indices:** `idx_dim_students_student_id`, `idx_dim_students_student_id_current` (parcial `is_current=TRUE`), `idx_dim_students_is_current` (parcial), `idx_dim_students_effective_dates`, `idx_dim_students_email`, `idx_dim_students_grade_level`, `idx_dim_students_school` (parcial), `idx_dim_students_rank`, `idx_dim_students_status`

**Nota SCD2:** Para consultar la version actual usar `WHERE is_current = TRUE`. Para consulta point-in-time: `WHERE effective_date <= :fecha AND (expiration_date > :fecha OR expiration_date IS NULL)`.

---

### data_warehouse.dim_teachers

Dimension de docentes para analytics de maestros y aulas. SCD Type: 1 (sobreescritura en cambios).

**Grain:** Una fila por docente.
**Source:** `auth_management.profiles` (WHERE role = 'admin_teacher')

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| teacher_key | BIGSERIAL | NOT NULL | - | PK — clave sustituta para joins con tablas de hechos |
| teacher_id | UUID | NOT NULL | - | Clave natural desde `auth_management.profiles.id` |
| display_name | TEXT | NULL | - | Nombre para mostrar |
| full_name | TEXT | NULL | - | Nombre completo |
| first_name | TEXT | NULL | - | Nombre(s) |
| last_name | TEXT | NULL | - | Apellido(s) |
| email | TEXT | NOT NULL | - | Correo electronico |
| avatar_url | TEXT | NULL | - | URL del avatar |
| phone | TEXT | NULL | - | Numero de telefono |
| school_id | UUID | NULL | - | ID de la escuela |
| school_name | TEXT | NULL | - | Nombre de la escuela (desnormalizado) |
| institution_type | TEXT | NULL | - | Tipo de institucion: 'public', 'private', 'charter' |
| subjects_taught | TEXT[] | NULL | - | Materias impartidas: ['Literatura', 'Ciencias'] |
| grade_levels_taught | TEXT[] | NULL | - | Grados impartidos: ['6', '7', '8'] |
| specializations | TEXT[] | NULL | - | Especializaciones del docente |
| total_classrooms | INTEGER | NULL | 0 | Total de aulas creadas (historico) |
| total_students | INTEGER | NULL | 0 | Total de estudiantes asignados |
| active_classrooms | INTEGER | NULL | 0 | Aulas actualmente activas |
| status | TEXT | NOT NULL | 'active' | Estado: 'active', 'inactive', 'suspended', 'pending' |
| role | TEXT | NOT NULL | 'admin_teacher' | Rol del usuario |
| registration_date | DATE | NOT NULL | - | Fecha de registro |
| first_classroom_date | DATE | NULL | - | Fecha de creacion del primer aula |
| last_activity_date | DATE | NULL | - | Fecha de ultima actividad |
| source_updated_at | TIMESTAMPTZ | NULL | - | Fecha de actualizacion en sistema origen |
| etl_loaded_at | TIMESTAMPTZ | NULL | NOW() | Timestamp de carga ETL |
| etl_batch_id | TEXT | NULL | - | ID del batch ETL |

**Unique:** `teacher_id`
**Check:** `status` IN ('active','inactive','suspended','pending')
**Indices:** `idx_dim_teachers_teacher_id`, `idx_dim_teachers_email`, `idx_dim_teachers_school` (parcial), `idx_dim_teachers_status`, `idx_dim_teachers_active` (parcial), `idx_dim_teachers_subjects` (GIN), `idx_dim_teachers_grades` (GIN)

---

### data_warehouse.dim_exercises

Dimension de ejercicios educativos para analytics de contenido. Incluye informacion del modulo desnormalizada para rendimiento. SCD Type: 1 (sobreescritura en cambios).

**Grain:** Una fila por ejercicio.
**Source:** `educational_content.exercises`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| exercise_key | BIGSERIAL | NOT NULL | - | PK — clave sustituta para joins con tablas de hechos |
| exercise_id | UUID | NOT NULL | - | Clave natural desde `educational_content.exercises.id` |
| title | TEXT | NOT NULL | - | Titulo del ejercicio |
| subtitle | TEXT | NULL | - | Subtitulo |
| description | TEXT | NULL | - | Descripcion |
| instructions | TEXT | NULL | - | Instrucciones para el estudiante |
| exercise_type | TEXT | NOT NULL | - | Tipo de mecanica: crucigrama, mapa_conceptual, detective_textual, etc. |
| exercise_type_category | TEXT | NULL | - | Categoria pedagogica: comprehension, analysis, creative |
| order_index | INTEGER | NULL | - | Orden dentro del modulo |
| module_key | BIGINT | NULL | - | FK a `dim_modules.module_key` (desnormalizado) |
| module_id | UUID | NULL | - | FK en sistema origen |
| module_name | TEXT | NULL | - | Nombre del modulo (desnormalizado para rendimiento) |
| module_order | INTEGER | NULL | - | Orden del modulo |
| difficulty_level | TEXT | NULL | 'beginner' | Dificultad: 'beginner', 'intermediate', 'advanced', 'expert' |
| max_points | INTEGER | NULL | 100 | Puntos maximos posibles |
| passing_score | INTEGER | NULL | 70 | Puntuacion minima para pasar |
| estimated_time_minutes | INTEGER | NULL | 10 | Tiempo estimado en minutos |
| time_limit_minutes | INTEGER | NULL | - | Limite de tiempo en minutos (NULL = sin limite) |
| max_attempts | INTEGER | NULL | 3 | Numero maximo de intentos |
| xp_reward | INTEGER | NULL | 20 | XP otorgado al completar |
| ml_coins_reward | INTEGER | NULL | 5 | ML Coins otorgados al completar |
| bonus_multiplier | NUMERIC(3,2) | NULL | 1.00 | Multiplicador de bonificacion |
| is_active | BOOLEAN | NULL | TRUE | Si el ejercicio esta activo |
| is_optional | BOOLEAN | NULL | FALSE | Si el ejercicio es opcional |
| is_bonus | BOOLEAN | NULL | FALSE | Si es ejercicio de bonificacion |
| auto_gradable | BOOLEAN | NULL | TRUE | Si puede ser calificado automaticamente |
| requires_manual_grading | BOOLEAN | NULL | FALSE | TRUE si requiere revision del maestro |
| allow_retry | BOOLEAN | NULL | TRUE | Si permite reintentos |
| enable_hints | BOOLEAN | NULL | TRUE | Si las pistas estan habilitadas |
| adaptive_difficulty | BOOLEAN | NULL | FALSE | Si usa dificultad adaptativa |
| objective | TEXT | NULL | - | Objetivo pedagogico |
| how_to_solve | TEXT | NULL | - | Guia de resolucion |
| recommended_strategy | TEXT | NULL | - | Estrategia recomendada |
| bloom_taxonomy_level | TEXT | NULL | - | Nivel taxonomia de Bloom: remember, understand, apply, analyze, evaluate, create |
| cognitive_level | TEXT | NULL | - | Nivel cognitivo |
| comodines_allowed | TEXT[] | NULL | - | Comodines permitidos: ['pistas', 'vision_lectora', 'segunda_oportunidad'] |
| hint_cost_ml_coins | INTEGER | NULL | 5 | Costo en ML Coins de cada pista |
| created_date | DATE | NULL | - | Fecha de creacion |
| created_by_id | UUID | NULL | - | UUID del creador |
| version | INTEGER | NULL | 1 | Version del ejercicio |
| source_updated_at | TIMESTAMPTZ | NULL | - | Fecha de actualizacion en sistema origen |
| etl_loaded_at | TIMESTAMPTZ | NULL | NOW() | Timestamp de carga ETL |
| etl_batch_id | TEXT | NULL | - | ID del batch ETL |

**Unique:** `exercise_id`
**Check:** `difficulty_level` IN ('beginner','intermediate','advanced','expert'), `max_points > 0`, `passing_score > 0 AND passing_score <= max_points`
**Indices:** `idx_dim_exercises_exercise_id`, `idx_dim_exercises_module_key`, `idx_dim_exercises_type`, `idx_dim_exercises_difficulty`, `idx_dim_exercises_active` (parcial), `idx_dim_exercises_module_order`

---

### data_warehouse.dim_modules

Dimension de modulos educativos para analytics de contenido. SCD Type: 1 (sobreescritura en cambios).

**Grain:** Una fila por modulo.
**Source:** `educational_content.modules`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| module_key | BIGSERIAL | NOT NULL | - | PK — clave sustituta para joins con tablas de hechos |
| module_id | UUID | NOT NULL | - | Clave natural desde `educational_content.modules.id` |
| title | TEXT | NOT NULL | - | Titulo del modulo |
| subtitle | TEXT | NULL | - | Subtitulo |
| description | TEXT | NULL | - | Descripcion |
| summary | TEXT | NULL | - | Resumen |
| module_code | TEXT | NULL | - | Codigo interno del modulo |
| order_index | INTEGER | NOT NULL | - | Orden de presentacion |
| difficulty_level | TEXT | NULL | 'beginner' | Dificultad: 'beginner', 'intermediate', 'advanced', 'expert' |
| grade_levels | TEXT[] | NULL | - | Niveles de grado aplicables: ['6', '7', '8'] |
| subjects | TEXT[] | NULL | - | Materias: ['Literatura', 'Ciencias'] |
| total_exercises | INTEGER | NULL | 0 | Total de ejercicios en el modulo |
| total_levels | INTEGER | NULL | 0 | Total de niveles |
| estimated_duration_minutes | INTEGER | NULL | 120 | Duracion estimada en minutos |
| estimated_sessions | INTEGER | NULL | 4 | Sesiones estimadas para completar |
| learning_objectives | TEXT[] | NULL | - | Objetivos de aprendizaje |
| competencies | TEXT[] | NULL | - | Competencias que desarrolla |
| skills_developed | TEXT[] | NULL | - | Habilidades desarrolladas |
| maya_rank_required | TEXT | NULL | - | Rango Maya necesario para acceder |
| maya_rank_granted | TEXT | NULL | - | Rango Maya otorgado al completar |
| xp_reward | INTEGER | NULL | 100 | XP otorgado al completar |
| ml_coins_reward | INTEGER | NULL | 50 | ML Coins otorgados al completar |
| status | TEXT | NULL | 'draft' | Estado: 'draft', 'review', 'approved', 'published', 'archived' |
| is_published | BOOLEAN | NULL | FALSE | Si esta publicado |
| is_featured | BOOLEAN | NULL | FALSE | Si es modulo destacado |
| is_free | BOOLEAN | NULL | TRUE | Si es de acceso gratuito |
| is_demo_module | BOOLEAN | NULL | FALSE | Si es modulo de demostracion |
| thumbnail_url | TEXT | NULL | - | URL de la miniatura |
| cover_image_url | TEXT | NULL | - | URL de la imagen de portada |
| created_date | DATE | NULL | - | Fecha de creacion |
| published_date | DATE | NULL | - | Fecha de publicacion |
| created_by_id | UUID | NULL | - | UUID del creador |
| reviewed_by_id | UUID | NULL | - | UUID del revisor |
| approved_by_id | UUID | NULL | - | UUID del aprobador |
| version | INTEGER | NULL | 1 | Version del modulo |
| source_updated_at | TIMESTAMPTZ | NULL | - | Fecha de actualizacion en sistema origen |
| etl_loaded_at | TIMESTAMPTZ | NULL | NOW() | Timestamp de carga ETL |
| etl_batch_id | TEXT | NULL | - | ID del batch ETL |

**Unique:** `module_id`
**Check:** `difficulty_level` IN ('beginner','intermediate','advanced','expert'), `status` IN ('draft','review','approved','published','archived')
**Indices:** `idx_dim_modules_module_id`, `idx_dim_modules_order`, `idx_dim_modules_difficulty`, `idx_dim_modules_published` (parcial), `idx_dim_modules_status`, `idx_dim_modules_rank_required`, `idx_dim_modules_grade_levels` (GIN)

---

### data_warehouse.dim_achievements

Dimension de logros del sistema de gamificacion. SCD Type: 1 (sobreescritura en cambios).

**Grain:** Una fila por definicion de logro.
**Source:** `gamification_system.achievements`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| achievement_key | BIGSERIAL | NOT NULL | - | PK — clave sustituta para joins con tablas de hechos |
| achievement_id | UUID | NOT NULL | - | Clave natural desde `gamification_system.achievements.id` |
| name | TEXT | NOT NULL | - | Nombre del logro |
| description | TEXT | NULL | - | Descripcion del logro |
| icon | TEXT | NULL | 'trophy' | Icono representativo |
| unlock_message | TEXT | NULL | - | Mensaje al desbloquear |
| instructions | TEXT | NULL | - | Instrucciones para obtenerlo |
| tips | TEXT[] | NULL | - | Consejos para obtenerlo |
| category | TEXT | NOT NULL | - | Categoria: 'progress', 'streak', 'completion', 'social', 'special', 'mastery', 'exploration' |
| category_display | TEXT | NULL | - | Nombre localizado de la categoria |
| rarity | TEXT | NULL | 'common' | Rareza: 'common', 'rare', 'epic', 'legendary' |
| difficulty_level | TEXT | NULL | 'beginner' | Nivel de dificultad para obtenerlo |
| points_required | INTEGER | NULL | 0 | Puntos necesarios para desbloquear |
| points_value | INTEGER | NULL | 0 | Puntos que otorga el logro |
| conditions | JSONB | NULL | - | Condiciones de desbloqueo |
| xp_reward | INTEGER | NULL | 100 | XP otorgado al desbloquear |
| ml_coins_reward | INTEGER | NULL | 50 | ML Coins otorgados al desbloquear |
| badge_name | TEXT | NULL | - | Nombre del badge asociado |
| badge_url | TEXT | NULL | - | URL de la imagen del badge |
| is_secret | BOOLEAN | NULL | FALSE | TRUE si el logro esta oculto hasta ser desbloqueado |
| is_active | BOOLEAN | NULL | TRUE | Si el logro esta activo |
| is_repeatable | BOOLEAN | NULL | FALSE | Si puede obtenerse multiples veces |
| order_index | INTEGER | NULL | 0 | Orden de presentacion |
| created_date | DATE | NULL | - | Fecha de creacion |
| created_by_id | UUID | NULL | - | UUID del creador |
| source_updated_at | TIMESTAMPTZ | NULL | - | Fecha de actualizacion en sistema origen |
| etl_loaded_at | TIMESTAMPTZ | NULL | NOW() | Timestamp de carga ETL |
| etl_batch_id | TEXT | NULL | - | ID del batch ETL |

**Unique:** `achievement_id`
**Check:** `category` IN ('progress','streak','completion','social','special','mastery','exploration'), `rarity` IN ('common','rare','epic','legendary')
**Indices:** `idx_dim_achievements_achievement_id`, `idx_dim_achievements_category`, `idx_dim_achievements_rarity`, `idx_dim_achievements_active` (parcial), `idx_dim_achievements_secret` (parcial), `idx_dim_achievements_order`

---

### data_warehouse.dim_event_types

Dimension de tipos de evento para clasificacion de eventos de gamificacion. Tabla de referencia pre-poblada con los eventos estandar del sistema. SCD Type: 1 (sobreescritura en cambios).

**Grain:** Una fila por tipo de evento.
**Source:** Definicion del sistema (pre-poblada con seed data).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| event_type_key | SERIAL | NOT NULL | - | PK — clave sustituta para joins con tablas de hechos |
| event_type_code | TEXT | NOT NULL | - | Codigo unico del tipo de evento (ej. 'ACHIEVEMENT_UNLOCKED') |
| event_type_name | TEXT | NOT NULL | - | Nombre para mostrar en ingles (ej. 'Achievement Unlocked') |
| event_type_name_es | TEXT | NULL | - | Nombre en espanol (ej. 'Logro Desbloqueado') |
| description | TEXT | NULL | - | Descripcion del evento |
| category | TEXT | NOT NULL | - | Categoria principal: achievement, exercise, module, rank, level, streak, coins, comodin, social, login |
| subcategory | TEXT | NULL | - | Sub-categoria del evento |
| affects_xp | BOOLEAN | NULL | FALSE | TRUE si este tipo de evento modifica el XP |
| affects_coins | BOOLEAN | NULL | FALSE | TRUE si este tipo de evento modifica ML Coins |
| affects_rank | BOOLEAN | NULL | FALSE | TRUE si este tipo de evento afecta el rango |
| affects_level | BOOLEAN | NULL | FALSE | TRUE si este tipo de evento afecta el nivel |
| affects_streak | BOOLEAN | NULL | FALSE | TRUE si este tipo de evento afecta la racha |
| xp_direction | TEXT | NULL | - | Direccion del cambio de XP: 'increase', 'decrease', 'none' |
| coins_direction | TEXT | NULL | - | Direccion del cambio de coins: 'increase', 'decrease', 'none' |
| is_active | BOOLEAN | NULL | TRUE | Si este tipo de evento esta activo |
| is_trackable | BOOLEAN | NULL | TRUE | Si este evento es rastreable en analytics |
| requires_notification | BOOLEAN | NULL | FALSE | Si genera notificacion al estudiante |
| display_priority | INTEGER | NULL | 0 | Prioridad de visualizacion |
| etl_loaded_at | TIMESTAMPTZ | NULL | NOW() | Timestamp de carga ETL |

**Unique:** `event_type_code`
**Check:** `xp_direction` IN ('increase','decrease','none') o NULL, `coins_direction` IN ('increase','decrease','none') o NULL
**Indices:** `idx_dim_event_types_code`, `idx_dim_event_types_category`, `idx_dim_event_types_active` (parcial)

**Seed data:** 22 tipos de evento pre-cargados cubriendo logros, ejercicios, modulos, rangos, niveles, rachas, monedas, comodines, desafios sociales y login diario.

---

## Tablas de Hechos (4)

### data_warehouse.fact_exercise_completions

Tabla de hechos principal para analytics de completacion de ejercicios. Transaction grain — registra cada intento individual. Es la tabla de hechos mas granular del modelo.

**Grain:** Una fila por intento o envio de ejercicio.
**Sources:** `progress_tracking.exercise_attempts` (calificados automaticamente), `progress_tracking.exercise_submissions` (calificacion manual)

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| completion_key | BIGSERIAL | NOT NULL | - | PK — clave sustituta del registro |
| date_key | INTEGER | NOT NULL | - | FK a `dim_dates.date_key` |
| time_key | INTEGER | NOT NULL | - | FK a `dim_times.time_key` |
| student_key | BIGINT | NOT NULL | - | FK a `dim_students.student_key` |
| exercise_key | BIGINT | NOT NULL | - | FK a `dim_exercises.exercise_key` |
| module_key | BIGINT | NOT NULL | - | FK a `dim_modules.module_key` |
| teacher_key | BIGINT | NULL | - | FK a `dim_teachers.teacher_key` (NULL si sin maestro asignado) |
| source_attempt_id | UUID | NULL | - | ID del registro en tabla origen para drill-through |
| source_table | TEXT | NOT NULL | - | Tabla origen: 'exercise_attempts' o 'exercise_submissions' |
| classroom_id | UUID | NULL | - | FK a `social_features.classrooms.id` (dimension degenerada) |
| assignment_id | UUID | NULL | - | FK a `educational_content.assignments.id` (dimension degenerada) |
| score | INTEGER | NULL | 0 | Puntos obtenidos (0 a max_score) |
| max_score | INTEGER | NULL | 100 | Puntos maximos posibles |
| score_percentage | NUMERIC(5,2) | NULL | - | Porcentaje calculado: (score/max_score)*100 |
| passing_score | INTEGER | NULL | - | Puntuacion minima para aprobar |
| time_spent_seconds | INTEGER | NULL | 0 | Tiempo invertido en segundos |
| estimated_time_seconds | INTEGER | NULL | - | Tiempo estimado segun configuracion del ejercicio |
| time_efficiency_ratio | NUMERIC(5,2) | NULL | - | Ratio tiempo_estimado/tiempo_real (mayor = mas rapido) |
| attempt_number | INTEGER | NULL | 1 | Numero de intento (empieza en 1) |
| max_attempts_allowed | INTEGER | NULL | - | Maximo de intentos permitidos |
| xp_earned | INTEGER | NULL | 0 | XP ganado en este intento |
| ml_coins_earned | INTEGER | NULL | 0 | ML Coins ganados en este intento |
| bonus_multiplier | NUMERIC(3,2) | NULL | 1.00 | Multiplicador de bonificacion aplicado |
| hints_used | INTEGER | NULL | 0 | Cantidad de pistas usadas |
| comodines_used_count | INTEGER | NULL | 0 | Cantidad de comodines usados |
| ml_coins_spent | INTEGER | NULL | 0 | ML Coins gastados en pistas/comodines |
| is_first_attempt | BOOLEAN | NULL | TRUE | TRUE si es el primer intento para este estudiante-ejercicio |
| is_passed | BOOLEAN | NULL | FALSE | TRUE si score >= passing_score |
| is_perfect | BOOLEAN | NULL | FALSE | TRUE si score = max_score (100%) |
| is_correct | BOOLEAN | NULL | - | Para ejercicios de respuesta binaria |
| is_graded | BOOLEAN | NULL | FALSE | TRUE si fue calificado manualmente |
| requires_manual_grading | BOOLEAN | NULL | FALSE | TRUE si requiere revision del maestro |
| status | TEXT | NULL | - | Estado: 'submitted', 'graded', 'reviewed' |
| submitted_at | TIMESTAMPTZ | NULL | - | Timestamp de envio |
| graded_at | TIMESTAMPTZ | NULL | - | Timestamp de calificacion |
| graded_by_id | UUID | NULL | - | UUID del maestro que califico |
| etl_loaded_at | TIMESTAMPTZ | NULL | NOW() | Timestamp de carga ETL |
| etl_batch_id | TEXT | NULL | - | ID del batch ETL |
| source_updated_at | TIMESTAMPTZ | NULL | - | Fecha de actualizacion en sistema origen |

**Unique:** `(source_table, source_attempt_id)`
**Check:** `score >= 0 AND score <= max_score`, `attempt_number > 0`, `source_table` IN ('exercise_attempts','exercise_submissions')
**FK:** `date_key -> dim_dates`, `time_key -> dim_times`, `student_key -> dim_students`, `exercise_key -> dim_exercises`, `module_key -> dim_modules`, `teacher_key -> dim_teachers`
**Indices:** `idx_fact_completion_date`, `idx_fact_completion_student`, `idx_fact_completion_exercise`, `idx_fact_completion_module`, `idx_fact_completion_teacher` (parcial), `idx_fact_completion_date_student`, `idx_fact_completion_student_exercise`, `idx_fact_completion_date_range`, `idx_fact_completion_classroom` (parcial), `idx_fact_completion_assignment` (parcial), `idx_fact_completion_passed` (parcial), `idx_fact_completion_perfect` (parcial), `idx_fact_completion_etl_batch`, `idx_fact_completion_source`

---

### data_warehouse.fact_daily_progress

Tabla de hechos de progreso diario agregado. Periodic snapshot grain — una fila por estudiante por modulo por dia, con medidas acumuladas (running totals).

**Grain:** Una fila por estudiante por modulo por dia (`date_key + student_key + module_key`).
**Sources:** Agregado desde `progress_tracking.*`, `gamification_system.*`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| progress_key | BIGSERIAL | NOT NULL | - | PK — clave sustituta del registro |
| date_key | INTEGER | NOT NULL | - | FK a `dim_dates.date_key` |
| student_key | BIGINT | NOT NULL | - | FK a `dim_students.student_key` |
| module_key | BIGINT | NOT NULL | - | FK a `dim_modules.module_key` |
| classroom_id | UUID | NULL | - | FK a `social_features.classrooms.id` (dimension degenerada) |
| school_id | UUID | NULL | - | FK a `social_features.schools.id` (dimension degenerada) |
| exercises_completed | INTEGER | NULL | 0 | Ejercicios completados en el dia |
| exercises_attempted | INTEGER | NULL | 0 | Ejercicios intentados en el dia |
| exercises_passed | INTEGER | NULL | 0 | Ejercicios aprobados en el dia |
| exercises_failed | INTEGER | NULL | 0 | Ejercicios fallidos en el dia |
| perfect_scores_count | INTEGER | NULL | 0 | Puntajes perfectos en el dia |
| total_score | INTEGER | NULL | 0 | Puntaje total del dia |
| max_possible_score | INTEGER | NULL | 0 | Puntaje maximo posible en el dia |
| average_score | NUMERIC(5,2) | NULL | - | Promedio de puntaje del dia |
| min_score | INTEGER | NULL | - | Puntaje minimo del dia |
| max_score | INTEGER | NULL | - | Puntaje maximo del dia |
| total_time_spent_seconds | INTEGER | NULL | 0 | Tiempo total dedicado en segundos |
| average_time_per_exercise_seconds | INTEGER | NULL | - | Tiempo promedio por ejercicio |
| sessions_count | INTEGER | NULL | 0 | Numero de sesiones en el dia |
| xp_earned | INTEGER | NULL | 0 | XP ganado en el dia |
| ml_coins_earned | INTEGER | NULL | 0 | ML Coins ganados en el dia |
| ml_coins_spent | INTEGER | NULL | 0 | ML Coins gastados en el dia |
| achievements_unlocked | INTEGER | NULL | 0 | Logros desbloqueados en el dia |
| progress_percentage | NUMERIC(5,2) | NULL | 0 | Porcentaje de progreso del modulo en este dia |
| progress_delta | NUMERIC(5,2) | NULL | 0 | Cambio en progreso respecto al dia anterior |
| streak_days | INTEGER | NULL | 0 | Dias de racha activa en este dia |
| login_count | INTEGER | NULL | 0 | Cantidad de logins en el dia |
| is_active_day | BOOLEAN | NULL | FALSE | TRUE si el estudiante tuvo alguna actividad en el dia |
| hints_used | INTEGER | NULL | 0 | Pistas usadas en el dia |
| comodines_used | INTEGER | NULL | 0 | Comodines usados en el dia |
| cumulative_exercises_completed | INTEGER | NULL | 0 | Total acumulado de ejercicios completados hasta este dia |
| cumulative_xp | INTEGER | NULL | 0 | XP acumulado total hasta este dia |
| cumulative_ml_coins | INTEGER | NULL | 0 | ML Coins netos acumulados hasta este dia |
| cumulative_time_spent_seconds | INTEGER | NULL | 0 | Tiempo total acumulado en segundos hasta este dia |
| snapshot_timestamp | TIMESTAMPTZ | NULL | NOW() | Timestamp de generacion del snapshot |
| etl_loaded_at | TIMESTAMPTZ | NULL | NOW() | Timestamp de carga ETL |
| etl_batch_id | TEXT | NULL | - | ID del batch ETL |

**Unique:** `(date_key, student_key, module_key)`
**Check:** `progress_percentage >= 0 AND progress_percentage <= 100`, `exercises_completed >= 0 AND exercises_attempted >= exercises_completed`
**FK:** `date_key -> dim_dates`, `student_key -> dim_students`, `module_key -> dim_modules`
**Indices:** `idx_fact_progress_date`, `idx_fact_progress_student`, `idx_fact_progress_module`, `idx_fact_progress_date_student`, `idx_fact_progress_student_module`, `idx_fact_progress_date_range`, `idx_fact_progress_classroom` (parcial), `idx_fact_progress_school` (parcial), `idx_fact_progress_active` (parcial), `idx_fact_progress_streak`, `idx_fact_progress_etl_batch`

---

### data_warehouse.fact_gamification_events

Tabla de hechos de eventos de gamificacion. Transaction grain — registra cada evento individual (logros, rangos, recompensas, transacciones de monedas).

**Grain:** Una fila por evento de gamificacion.
**Sources:** `gamification_system.user_achievements`, `gamification_system.ml_coins_transactions`, cambios en `gamification_system.user_stats`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| event_key | BIGSERIAL | NOT NULL | - | PK — clave sustituta del registro |
| date_key | INTEGER | NOT NULL | - | FK a `dim_dates.date_key` |
| time_key | INTEGER | NOT NULL | - | FK a `dim_times.time_key` |
| student_key | BIGINT | NOT NULL | - | FK a `dim_students.student_key` |
| event_type_key | INTEGER | NOT NULL | - | FK a `dim_event_types.event_type_key` |
| achievement_key | BIGINT | NULL | - | FK a `dim_achievements.achievement_key` (solo eventos de logro) |
| exercise_key | BIGINT | NULL | - | FK a `dim_exercises.exercise_key` (solo eventos relacionados a ejercicios) |
| module_key | BIGINT | NULL | - | FK a `dim_modules.module_key` (solo eventos relacionados a modulos) |
| source_event_id | UUID | NULL | - | ID del registro en tabla origen para drill-through |
| source_table | TEXT | NULL | - | Nombre de la tabla origen |
| rank_from | TEXT | NULL | - | Rango Maya anterior (para eventos de cambio de rango) |
| rank_to | TEXT | NULL | - | Rango Maya nuevo (para eventos de cambio de rango) |
| level_from | INTEGER | NULL | - | Nivel anterior (para eventos de subida de nivel) |
| level_to | INTEGER | NULL | - | Nivel nuevo (para eventos de subida de nivel) |
| challenge_id | UUID | NULL | - | ID del desafio (para eventos sociales de desafio) |
| challenge_opponent_id | UUID | NULL | - | ID del oponente en el desafio |
| xp_change | INTEGER | NULL | 0 | Delta de XP (positivo = ganado, negativo = perdido) |
| ml_coins_change | INTEGER | NULL | 0 | Delta de ML Coins (positivo = ganado, negativo = gastado) |
| points_change | INTEGER | NULL | 0 | Delta de puntos de logros |
| streak_days | INTEGER | NULL | - | Dias de racha en el momento del evento |
| current_xp | INTEGER | NULL | - | XP total despues de este evento |
| current_ml_coins | INTEGER | NULL | - | Saldo de ML Coins despues de este evento |
| current_level | INTEGER | NULL | - | Nivel despues de este evento |
| achievement_name | TEXT | NULL | - | Nombre del logro (desnormalizado para eventos de logro) |
| achievement_category | TEXT | NULL | - | Categoria del logro (desnormalizado) |
| achievement_rarity | TEXT | NULL | - | Rareza del logro (desnormalizado) |
| event_description | TEXT | NULL | - | Descripcion del evento |
| trigger_source | TEXT | NULL | - | Fuente que disparo el evento (exercise, daily_login, etc.) |
| related_entity_id | UUID | NULL | - | ID de la entidad relacionada |
| related_entity_type | TEXT | NULL | - | Tipo de la entidad relacionada |
| event_timestamp | TIMESTAMPTZ | NOT NULL | - | Timestamp exacto del evento |
| etl_loaded_at | TIMESTAMPTZ | NULL | NOW() | Timestamp de carga ETL |
| etl_batch_id | TEXT | NULL | - | ID del batch ETL |

**Unique:** `(source_table, source_event_id)`
**FK:** `date_key -> dim_dates`, `time_key -> dim_times`, `student_key -> dim_students`, `event_type_key -> dim_event_types`, `achievement_key -> dim_achievements`, `exercise_key -> dim_exercises`, `module_key -> dim_modules`
**Indices:** `idx_fact_gam_event_date`, `idx_fact_gam_event_student`, `idx_fact_gam_event_type`, `idx_fact_gam_event_achievement` (parcial), `idx_fact_gam_event_exercise` (parcial), `idx_fact_gam_event_module` (parcial), `idx_fact_gam_event_date_student`, `idx_fact_gam_event_student_type`, `idx_fact_gam_event_date_range`, `idx_fact_gam_event_timestamp`, `idx_fact_gam_event_rank_changes` (parcial), `idx_fact_gam_event_xp_positive` (parcial), `idx_fact_gam_event_coins_positive` (parcial), `idx_fact_gam_event_etl_batch`, `idx_fact_gam_event_source`

---

### data_warehouse.fact_teacher_metrics

Tabla de hechos de metricas de docentes y aulas. Periodic snapshot grain — una fila por maestro por aula por dia, con metricas agregadas de rendimiento de clase.

**Grain:** Una fila por maestro por aula por dia (`date_key + teacher_key + classroom_id`).
**Sources:** Agregado desde `social_features.classrooms`, `social_features.classroom_members`, datos de progreso de estudiantes

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| metric_key | BIGSERIAL | NOT NULL | - | PK — clave sustituta del registro |
| date_key | INTEGER | NOT NULL | - | FK a `dim_dates.date_key` |
| teacher_key | BIGINT | NOT NULL | - | FK a `dim_teachers.teacher_key` |
| classroom_id | UUID | NOT NULL | - | ID del aula (dimension degenerada) |
| classroom_name | TEXT | NULL | - | Nombre del aula (desnormalizado para reportes) |
| school_id | UUID | NULL | - | ID de la escuela |
| grade_level | TEXT | NULL | - | Grado del aula |
| subject | TEXT | NULL | - | Materia del aula |
| academic_year | TEXT | NULL | - | Ano academico (ej. '2025-2026') |
| total_students | INTEGER | NULL | 0 | Total de estudiantes en el aula |
| active_students | INTEGER | NULL | 0 | Estudiantes con actividad en este dia |
| inactive_students | INTEGER | NULL | 0 | Estudiantes sin actividad reciente |
| new_students_enrolled | INTEGER | NULL | 0 | Nuevos estudiantes inscritos en el dia |
| students_dropped | INTEGER | NULL | 0 | Estudiantes que abandonaron en el dia |
| assignments_created | INTEGER | NULL | 0 | Asignaciones creadas en el dia |
| assignments_active | INTEGER | NULL | 0 | Asignaciones actualmente activas |
| assignments_due_today | INTEGER | NULL | 0 | Asignaciones con entrega hoy |
| assignments_overdue | INTEGER | NULL | 0 | Asignaciones vencidas |
| submissions_received | INTEGER | NULL | 0 | Entregas recibidas en el dia |
| submissions_graded | INTEGER | NULL | 0 | Entregas calificadas en el dia |
| submissions_pending_review | INTEGER | NULL | 0 | Entregas pendientes de calificacion |
| avg_grading_time_hours | NUMERIC(5,2) | NULL | - | Tiempo promedio de calificacion en horas |
| avg_class_score | NUMERIC(5,2) | NULL | - | Promedio de puntaje del grupo |
| median_class_score | NUMERIC(5,2) | NULL | - | Mediana de puntaje del grupo |
| min_class_score | INTEGER | NULL | - | Puntaje minimo del grupo |
| max_class_score | INTEGER | NULL | - | Puntaje maximo del grupo |
| score_std_deviation | NUMERIC(5,2) | NULL | - | Desviacion estandar del puntaje del grupo |
| completion_rate | NUMERIC(5,2) | NULL | - | Porcentaje de ejercicios asignados completados |
| pass_rate | NUMERIC(5,2) | NULL | - | Porcentaje de ejercicios completados aprobados |
| perfect_score_rate | NUMERIC(5,2) | NULL | - | Porcentaje de ejercicios con puntaje perfecto |
| total_exercises_assigned | INTEGER | NULL | 0 | Total de ejercicios asignados |
| total_exercises_completed | INTEGER | NULL | 0 | Total de ejercicios completados |
| total_time_spent_seconds | INTEGER | NULL | 0 | Tiempo total dedicado por el grupo |
| avg_time_per_student_seconds | INTEGER | NULL | - | Tiempo promedio por estudiante |
| total_xp_earned_class | INTEGER | NULL | 0 | XP total ganado por el grupo |
| avg_xp_per_student | INTEGER | NULL | - | XP promedio por estudiante |
| achievements_unlocked_class | INTEGER | NULL | 0 | Logros desbloqueados por el grupo |
| avg_streak_days | NUMERIC(5,2) | NULL | - | Promedio de dias de racha del grupo |
| students_struggling | INTEGER | NULL | 0 | Estudiantes con promedio por debajo de 60% — posible intervencion |
| students_excelling | INTEGER | NULL | 0 | Estudiantes con promedio por encima de 90% |
| students_no_activity_7days | INTEGER | NULL | 0 | Estudiantes sin actividad en los ultimos 7 dias |
| interventions_needed | INTEGER | NULL | 0 | Estudiantes que requieren intervencion |
| snapshot_timestamp | TIMESTAMPTZ | NULL | NOW() | Timestamp de generacion del snapshot |
| etl_loaded_at | TIMESTAMPTZ | NULL | NOW() | Timestamp de carga ETL |
| etl_batch_id | TEXT | NULL | - | ID del batch ETL |

**Unique:** `(date_key, teacher_key, classroom_id)`
**Check:** `completion_rate` BETWEEN 0 AND 100 (o NULL), `pass_rate` BETWEEN 0 AND 100 (o NULL)
**FK:** `date_key -> dim_dates`, `teacher_key -> dim_teachers`
**Indices:** `idx_fact_teacher_date`, `idx_fact_teacher_teacher`, `idx_fact_teacher_date_teacher`, `idx_fact_teacher_classroom`, `idx_fact_teacher_school` (parcial), `idx_fact_teacher_date_range`, `idx_fact_teacher_grade`, `idx_fact_teacher_subject`, `idx_fact_teacher_avg_score`, `idx_fact_teacher_completion`, `idx_fact_teacher_struggling` (parcial), `idx_fact_teacher_inactive` (parcial), `idx_fact_teacher_etl_batch`

---

## Tablas de ML (2)

### data_warehouse.ml_model_weights

Almacena los pesos y metadatos de los modelos de machine learning para prediccion. Permite versionado de modelos y activacion/desactivacion de versiones sin eliminar el historial.

**Grain:** Una fila por version de modelo por feature.
**Source:** Pipeline de entrenamiento de ML.
**Modelos soportados:** `dropout_risk`, `performance_predictor`, `difficulty_recommender`, `engagement_predictor`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | BIGSERIAL | NOT NULL | - | PK |
| model_id | TEXT | NOT NULL | - | Identificador del modelo: dropout_risk, performance_predictor, difficulty_recommender, engagement_predictor |
| version | TEXT | NOT NULL | - | Version semantica del modelo (ej. '1.0.0') |
| feature_name | TEXT | NOT NULL | - | Nombre del feature al que aplica este peso |
| weight | DOUBLE PRECISION | NOT NULL | - | Coeficiente de peso para combinacion lineal |
| bias | DOUBLE PRECISION | NOT NULL | 0 | Termino de sesgo/intercepto (mismo valor para todos los features de la version) |
| algorithm | TEXT | NOT NULL | 'logistic_regression' | Algoritmo: 'logistic_regression', 'linear_regression', 'random_forest', 'gradient_boosting' |
| model_type | TEXT | NOT NULL | 'classification' | Tipo de modelo: 'classification' o 'regression' |
| trained_at | TIMESTAMPTZ | NOT NULL | - | Timestamp de entrenamiento del modelo |
| training_samples | INTEGER | NOT NULL | 0 | Numero de muestras de entrenamiento |
| validation_samples | INTEGER | NOT NULL | 0 | Numero de muestras de validacion |
| metrics_json | JSONB | NOT NULL | '{}' | Metricas de rendimiento: {accuracy, precision, recall, f1Score, rmse, mae, auc} |
| is_active | BOOLEAN | NOT NULL | FALSE | TRUE si esta version es el modelo activo en produccion |
| description | TEXT | NULL | - | Descripcion de la version del modelo |
| created_by | TEXT | NULL | 'system' | Identificador del creador |
| created_at | TIMESTAMPTZ | NULL | NOW() | Timestamp de creacion del registro |
| updated_at | TIMESTAMPTZ | NULL | NOW() | Timestamp de ultima actualizacion |

**Unique:** `(model_id, version, feature_name)`
**Check:** `model_type` IN ('classification','regression'), `algorithm` IN ('logistic_regression','linear_regression','random_forest','gradient_boosting')
**Indices:** `idx_ml_model_weights_model_id`, `idx_ml_model_weights_version`, `idx_ml_model_weights_active` (parcial `is_active=TRUE`), `idx_ml_model_weights_feature`, `idx_ml_model_weights_metrics` (GIN sobre `metrics_json`)
**Trigger:** `trg_ml_model_weights_updated_at` — actualiza `updated_at` automaticamente
**Funciones:** `get_active_model_weights(model_id)` — retorna pesos activos; `set_active_model_version(model_id, version)` — activa una version

---

### data_warehouse.ml_prediction_logs

Registro de auditoria de todas las predicciones generadas por los modelos ML. Sirve como trail de auditoria, fuente de datos para reentrenamiento y monitor de rendimiento (latencia, cache hits, precision real vs predicha).

**Grain:** Una fila por prediccion generada.
**Source:** Llamadas a los endpoints ML del backend.
**RLS:** Habilitado — admins ven todos los logs; estudiantes ven solo los propios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| prediction_id | UUID | NOT NULL | gen_random_uuid() | PK |
| model_type | VARCHAR(50) | NOT NULL | - | Tipo de modelo: 'dropout_risk', 'performance', 'difficulty', 'engagement' |
| model_version | VARCHAR(20) | NOT NULL | - | Version del modelo usado |
| student_id | UUID | NOT NULL | - | ID del estudiante desde `auth_management.profiles` |
| classroom_id | UUID | NULL | - | Contexto de aula (opcional) |
| tenant_id | UUID | NULL | - | Tenant del estudiante (opcional) |
| input_features_json | JSONB | NOT NULL | - | Features de entrada usados para la prediccion |
| output_json | JSONB | NOT NULL | - | Salida de la prediccion (incluye riskLevel, probability, predictedScore, etc.) |
| confidence | DECIMAL(5,4) | NULL | - | Confianza del modelo en la prediccion (0-1) |
| risk_level | VARCHAR(20) | NULL | - | Nivel de riesgo extraido de output_json (para dropout_risk) |
| predicted_score | DECIMAL(5,2) | NULL | - | Puntaje predicho extraido de output_json (para performance) |
| latency_ms | INTEGER | NOT NULL | - | Tiempo de ejecucion de la prediccion en milisegundos |
| cached | BOOLEAN | NOT NULL | FALSE | TRUE si el resultado fue servido desde cache |
| actual_outcome_json | JSONB | NULL | - | Resultado real (llenado posteriormente para validacion) |
| prediction_accurate | BOOLEAN | NULL | - | TRUE si la prediccion coincidio con el resultado real |
| validated_at | TIMESTAMPTZ | NULL | - | Timestamp de validacion (NULL si aun no validada) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Timestamp de creacion |
| created_by | UUID | NULL | - | UUID del usuario/sistema que solicito la prediccion |

**Check:** `model_type` IN ('dropout_risk','performance','difficulty','engagement'), `confidence` BETWEEN 0 AND 1
**Indices:** `idx_ml_prediction_logs_student_id`, `idx_ml_prediction_logs_model_type`, `idx_ml_prediction_logs_created_at`, `idx_ml_prediction_logs_model_student` (compuesto), `idx_ml_prediction_logs_unvalidated` (parcial `validated_at IS NULL`), `idx_ml_prediction_logs_tenant_id` (parcial), `idx_ml_prediction_logs_output_gin` (GIN sobre `output_json`)
**RLS Policies:** `ml_prediction_logs_admin_policy` (admin/super_admin ven todo), `ml_prediction_logs_own_policy` (estudiante ve solo los propios)
**Funciones:** `log_ml_prediction(...)` — inserta un log; `validate_prediction(prediction_id, actual_outcome, accurate)` — valida resultado
**Vistas:** `v_ml_model_performance` (metricas diarias por modelo), `v_ml_at_risk_students` (ultima prediccion dropout_risk por estudiante, ultimas 24h)

---

## Tablas de ETL (2)

### data_warehouse.etl_extraction_logs

Registra operaciones de extraccion ETL desde fuentes operacionales. Sirve como marker de CDC (Change Data Capture) para extracciones incrementales y como monitor de salud del pipeline de extraccion.

**Grain:** Una fila por ejecucion de extractor.
**Source:** Pipeline ETL (backend `apps/backend/src/modules/etl/`)

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| extraction_id | UUID | NOT NULL | gen_random_uuid() | PK — identificador unico de la ejecucion |
| extractor_name | VARCHAR(100) | NOT NULL | - | Nombre del extractor (ej. 'exercise-completion-extractor', 'student-extractor') |
| started_at | TIMESTAMPTZ | NOT NULL | NOW() | Timestamp de inicio de la extraccion |
| completed_at | TIMESTAMPTZ | NULL | - | Timestamp de finalizacion (NULL si aun en progreso) |
| rows_extracted | INTEGER | NOT NULL | 0 | Numero de filas extraidas en esta ejecucion |
| status | VARCHAR(20) | NOT NULL | 'running' | Estado: 'pending', 'running', 'completed', 'failed', 'cancelled' |
| error_message | TEXT | NULL | - | Mensaje de error si la extraccion fallo |
| last_extracted_timestamp | TIMESTAMPTZ | NOT NULL | NOW() | Timestamp del ultimo registro extraido — marker CDC para extracciones incrementales |
| metadata | JSONB | NOT NULL | '{}' | Metadatos adicionales (batch info, tablas origen, etc.) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Timestamp de creacion del registro |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | Timestamp de ultima actualizacion |

**Check:** `status` IN ('pending','running','completed','failed','cancelled')
**Indices:** `idx_etl_extraction_logs_extractor_name`, `idx_etl_extraction_logs_status`, `idx_etl_extraction_logs_started_at`, `idx_etl_extraction_logs_completed` (parcial `status='completed'`), `idx_etl_extraction_logs_latest` (compuesto por `extractor_name, last_extracted_timestamp DESC`)
**Trigger:** `trg_etl_extraction_logs_updated_at` — actualiza `updated_at` automaticamente

---

### data_warehouse.etl_load_logs

Registra operaciones de carga ETL hacia las tablas del data warehouse. Permite monitoreo del pipeline de carga, debugging de fallos y tracking de counts por tabla destino.

**Grain:** Una fila por ejecucion de loader hacia una tabla destino.
**Source:** Pipeline ETL (backend `apps/backend/src/modules/etl/`)
**Enum:** `data_warehouse.etl_load_status` ('pending','running','completed','failed','partially_completed')

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| load_id | UUID | NOT NULL | gen_random_uuid() | PK — identificador unico de la operacion de carga |
| loader_name | VARCHAR(100) | NOT NULL | - | Nombre del loader (ej. 'fact-exercise-completion', 'dim-student') |
| target_table | VARCHAR(200) | NOT NULL | - | Tabla destino incluyendo schema (ej. 'data_warehouse.fact_exercise_completions') |
| started_at | TIMESTAMPTZ | NOT NULL | NOW() | Timestamp de inicio de la carga |
| completed_at | TIMESTAMPTZ | NULL | - | Timestamp de finalizacion (NULL si aun en progreso) |
| rows_inserted | INTEGER | NOT NULL | 0 | Filas insertadas exitosamente |
| rows_updated | INTEGER | NOT NULL | 0 | Filas actualizadas (para operaciones upsert) |
| rows_rejected | INTEGER | NOT NULL | 0 | Filas rechazadas por errores de validacion o constraint |
| status | etl_load_status | NOT NULL | 'pending' | Estado de la carga (ENUM) |
| error_message | TEXT | NULL | - | Mensaje de error si la carga fallo |
| batch_size | INTEGER | NULL | - | Tamano del batch de carga |
| load_mode | VARCHAR(50) | NULL | - | Modo de carga (ej. 'full', 'incremental', 'upsert') |
| configuration | JSONB | NULL | '{}' | Configuracion adicional de la carga |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Timestamp de creacion del registro |

**Indices:** `idx_etl_load_logs_loader_name`, `idx_etl_load_logs_status`, `idx_etl_load_logs_started_at`, `idx_etl_load_logs_loader_status_time` (compuesto)

---

## Notas Generales

- **Sin entities backend:** Intencional. El data warehouse se accede via SQL raw y materialized views. Los modulos `etl`, `ml` y `visualization` en backend no estan importados en `app.module.ts` (requieren datasource `data_warehouse` no configurado).
- **Sin RLS general:** El acceso es controlado a nivel de servicio (solo admin/analytics). Excepcion: `ml_prediction_logs` tiene RLS habilitado.
- **ETL:** Carga batch diaria, agregando desde tablas transaccionales operacionales.
- **Esquema placeholder:** Este schema no se carga por defecto durante la recreacion de BD. Se activa bajo demanda.

---

*GAMILIT - Schema Reference: data_warehouse*
