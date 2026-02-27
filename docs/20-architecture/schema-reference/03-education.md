# Schema 3: educational_content (24 tablas DDL)

> **DDL Path:** `apps/database/ddl/schemas/educational_content/`

> **Nota de nombres:** El schema fisico DDL es `educational_content`. Las secciones marcadas `[NO DDL -- conceptual only]` corresponden al modelo conceptual legacy nunca implementado. Las secciones marcadas `[DDL-ACCURATE]` reflejan exactamente el DDL en disco.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

## Secciones Conceptuales Legacy (DEPRECATED)

> **[DEPRECATED]** This section describes an early conceptual model that was never implemented as described.
> The DDL-accurate documentation appears in the sections below.

### educational_content.educational_modules [NO DDL -- conceptual only]
Los 5 modulos educativos del sistema. *(DDL real: `educational_content.modules` en `01-modules.sql`)*

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| number | INTEGER | NOT NULL | - | Numero de modulo (1-5) |
| name | VARCHAR(100) | NOT NULL | - | Nombre del modulo |
| type | educational_module_type | NOT NULL | - | literal, inferential, critical, digital, production |
| description | TEXT | NULL | NULL | Descripcion |
| icon_url | VARCHAR(500) | NULL | NULL | Icono del modulo |
| unlock_requirements | JSONB | NULL | '{}' | Requisitos para desbloquear |
| exercise_count | INTEGER | NOT NULL | 0 | Numero de ejercicios |
| is_active | BOOLEAN | NOT NULL | true | Modulo activo |
| sort_order | INTEGER | NOT NULL | 0 | Orden de presentacion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `EducationalModule`
**RLS:** NO (catalogo global)

---

### educational_content.module_progress [NO DDL -- conceptual only]
Progreso del estudiante en cada modulo.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| module_id | UUID | NOT NULL | - | FK educational_content.educational_modules |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| percentage | NUMERIC(5,2) | NOT NULL | 0.00 | Porcentaje completado |
| exercises_completed | INTEGER | NOT NULL | 0 | Ejercicios completados |
| exercises_total | INTEGER | NOT NULL | 0 | Total de ejercicios |
| average_score | NUMERIC(5,2) | NULL | NULL | Puntaje promedio |
| time_spent_minutes | INTEGER | NOT NULL | 0 | Tiempo invertido |
| is_unlocked | BOOLEAN | NOT NULL | false | Modulo desbloqueado |
| unlocked_at | TIMESTAMPTZ | NULL | NULL | Fecha de desbloqueo |
| completed_at | TIMESTAMPTZ | NULL | NULL | Fecha de completitud |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_module_progress_student_module` UNIQUE (student_id, module_id, tenant_id)
**Entity:** `ModuleProgress`

---

### educational_content.exercises [NO DDL -- conceptual only]
Catalogo de ejercicios. *(DDL real: `educational_content.exercises` en `02-exercises.sql` -- ver seccion DDL-ACCURATE abajo)*

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| module_id | UUID | NOT NULL | - | FK educational_content.educational_modules |
| type | exercise_type | NOT NULL | - | Uno de 23 tipos |
| title | VARCHAR(200) | NOT NULL | - | Titulo del ejercicio |
| description | TEXT | NULL | NULL | Descripcion |
| instructions | TEXT | NOT NULL | - | Instrucciones |
| difficulty | difficulty_level | NOT NULL | 'medium' | Dificultad |
| content_id | UUID | NULL | NULL | FK educational_content.contents |
| exercise_data | JSONB | NOT NULL | '{}' | Datos del ejercicio (tipo-especifico) |
| answer_key | JSONB | NULL | NULL | Respuesta correcta (para auto-eval) |
| evaluation_mode | exercise_evaluation_mode | NOT NULL | 'automatic' | Auto, semi-auto, manual |
| rubric | JSONB | NULL | NULL | Rubrica (para semi/manual) |
| xp_reward | INTEGER | NOT NULL | 10 | XP base por completar |
| ml_coins_reward | INTEGER | NOT NULL | 5 | ML Coins base |
| time_limit_seconds | INTEGER | NULL | NULL | Tiempo limite (0 = sin limite) |
| max_attempts | INTEGER | NOT NULL | 3 | Intentos maximos |
| is_active | BOOLEAN | NOT NULL | true | Ejercicio activo |
| sort_order | INTEGER | NOT NULL | 0 | Orden en el modulo |
| created_by | UUID | NULL | NULL | FK auth.users (creator) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| deleted_at | TIMESTAMPTZ | NULL | NULL | Soft delete |

**Indices:** `idx_exercises_module_type`, `idx_exercises_difficulty`, `idx_exercises_active`
**Entity:** `Exercise`

---

### educational_content.exercise_types [NO DDL -- conceptual only]
Definicion de los 23 tipos de ejercicio.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| type | exercise_type | NOT NULL | - | Tipo (ENUM) |
| name | VARCHAR(100) | NOT NULL | - | Nombre legible |
| module_id | UUID | NOT NULL | - | FK educational_content.educational_modules |
| description | TEXT | NULL | NULL | Descripcion del tipo |
| evaluation_mode | exercise_evaluation_mode | NOT NULL | - | Modo de evaluacion |
| schema_definition | JSONB | NOT NULL | '{}' | Schema del exercise_data |
| ui_component | VARCHAR(100) | NOT NULL | - | Componente frontend |
| is_active | BOOLEAN | NOT NULL | true | Tipo activo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `ExerciseType`
**RLS:** NO (catalogo global, 23 registros)

---

### educational_content.exercise_attempts [NO DDL -- conceptual only]
Intentos de ejercicio por estudiante. *(DDL real: `progress_tracking.exercise_attempts`)*

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| exercise_id | UUID | NOT NULL | - | FK educational_content.exercises |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| attempt_number | INTEGER | NOT NULL | 1 | Numero de intento |
| submission_data | JSONB | NOT NULL | '{}' | Respuesta del estudiante |
| started_at | TIMESTAMPTZ | NOT NULL | NOW() | Inicio del intento |
| submitted_at | TIMESTAMPTZ | NULL | NULL | Momento de envio |
| time_spent_seconds | INTEGER | NULL | NULL | Tiempo invertido |
| status | submission_status | NOT NULL | 'in_progress' | Estado del intento |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_attempts_student_exercise`, `idx_attempts_status`
**Entity:** `ExerciseAttempt`

---

### educational_content.exercise_results [NO DDL -- conceptual only]
Resultados evaluados de ejercicios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| attempt_id | UUID | NOT NULL | - | FK educational_content.exercise_attempts |
| student_id | UUID | NOT NULL | - | FK auth.users |
| exercise_id | UUID | NOT NULL | - | FK educational_content.exercises |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| raw_score | NUMERIC(5,2) | NOT NULL | 0 | Puntaje bruto (0-100) |
| time_bonus | NUMERIC(5,2) | NOT NULL | 0 | Bonus por tiempo |
| accuracy | NUMERIC(3,2) | NOT NULL | 0 | Precision (0.00-1.00) |
| final_score | NUMERIC(5,2) | NOT NULL | 0 | Puntaje final ajustado |
| quality | score_quality | NOT NULL | 'average' | Calidad (poor, average, good, excellent) |
| xp_awarded | INTEGER | NOT NULL | 0 | XP otorgado |
| ml_coins_awarded | INTEGER | NOT NULL | 0 | ML Coins otorgados |
| evaluation_details | JSONB | NULL | '{}' | Detalles de evaluacion |
| evaluated_by | UUID | NULL | NULL | FK auth.users (si manual) |
| evaluated_at | TIMESTAMPTZ | NULL | NULL | Fecha de evaluacion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `ExerciseResult`
**Trigger:** tr_exercise_completed (calcula XP, actualiza progreso, emite eventos)

---

### educational_content.exercise_feedback [NO DDL -- conceptual only]
Retroalimentacion generada por el evaluador.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| result_id | UUID | NOT NULL | - | FK educational_content.exercise_results |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| feedback_text | TEXT | NOT NULL | - | Texto de retroalimentacion |
| suggestions | JSONB | NULL | '[]' | Sugerencias de mejora |
| correct_answers | JSONB | NULL | NULL | Respuestas correctas |
| hints | JSONB | NULL | '[]' | Pistas para proximos intentos |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `ExerciseFeedback`

---

### educational_content.contents [NO DDL -- conceptual only]
Lecturas y material educativo.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| title | VARCHAR(300) | NOT NULL | - | Titulo |
| body | TEXT | NOT NULL | - | Contenido (HTML/Markdown) |
| summary | TEXT | NULL | NULL | Resumen |
| author | VARCHAR(200) | NULL | NULL | Autor original |
| source_url | VARCHAR(500) | NULL | NULL | Fuente original |
| category_id | UUID | NULL | NULL | FK educational_content.content_categories |
| difficulty | difficulty_level | NOT NULL | 'medium' | Dificultad |
| word_count | INTEGER | NOT NULL | 0 | Numero de palabras |
| reading_time_minutes | INTEGER | NOT NULL | 0 | Tiempo estimado |
| status | content_status | NOT NULL | 'draft' | Estado (draft, published, archived) |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_by | UUID | NOT NULL | - | FK auth.users |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| deleted_at | TIMESTAMPTZ | NULL | NULL | Soft delete |

**Entity:** `Content`

---

### educational_content.content_versions [NO DDL -- conceptual only]
Versionado de contenido educativo.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| content_id | UUID | NOT NULL | - | FK educational_content.contents |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| version_number | INTEGER | NOT NULL | 1 | Numero de version |
| body | TEXT | NOT NULL | - | Contenido de esta version |
| change_summary | VARCHAR(500) | NULL | NULL | Resumen del cambio |
| created_by | UUID | NOT NULL | - | FK auth.users |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `ContentVersion`

---

### educational_content.content_categories [NO DDL -- conceptual only]
Categorias de contenido educativo.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre de la categoria |
| slug | VARCHAR(100) | NOT NULL | - | Slug unico |
| description | TEXT | NULL | NULL | Descripcion |
| parent_id | UUID | NULL | NULL | FK self (jerarquia) |
| sort_order | INTEGER | NOT NULL | 0 | Orden |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global)

---

### educational_content.reading_assignments [NO DDL -- conceptual only]
Asignaciones de lectura a aulas/estudiantes.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| content_id | UUID | NOT NULL | - | FK educational_content.contents |
| classroom_id | UUID | NOT NULL | - | FK classrooms.classrooms |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| assigned_by | UUID | NOT NULL | - | FK auth.users (teacher) |
| due_date | TIMESTAMPTZ | NULL | NULL | Fecha limite |
| instructions | TEXT | NULL | NULL | Instrucciones adicionales |
| is_active | BOOLEAN | NOT NULL | true | Asignacion activa |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `ReadingAssignment`

---

### educational_content.spaced_repetition [NO DDL -- conceptual only]
Motor de repeticion espaciada.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| exercise_id | UUID | NOT NULL | - | FK educational_content.exercises |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| interval_days | INTEGER | NOT NULL | 1 | Intervalo actual (dias) |
| ease_factor | NUMERIC(4,2) | NOT NULL | 2.50 | Factor de facilidad |
| repetitions | INTEGER | NOT NULL | 0 | Repeticiones completadas |
| next_review_date | DATE | NOT NULL | - | Proxima revision |
| last_score | NUMERIC(5,2) | NULL | NULL | Ultimo puntaje |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_spaced_rep_student_next` (student_id, next_review_date)
**Entity:** `SpacedRepetition`

---

## Tablas DDL-Accurate: educational_content schema

Las siguientes secciones reflejan exactamente las 24 tablas DDL del schema `educational_content` en `apps/database/ddl/schemas/educational_content/tables/` (22 principales + 2 en `_cross_schema/`). Cada seccion esta marcada con `[DDL-ACCURATE]`.

---

### Tablas Core

### educational_content.modules [DDL-ACCURATE]
Modulos educativos de Marie Curie -- 5 niveles de comprension lectora. Cada modulo contiene materiales de lectura, contexto historico, conceptos cientificos y recursos multimedia. Soporta publicacion con flujo de revision (draft -> approved -> published), prerequisitos entre modulos, y recompensas de gamificacion (XP y ML Coins).

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/01-modules.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants(id) ON DELETE CASCADE |
| title | TEXT | NOT NULL | - | Titulo del modulo |
| subtitle | TEXT | NULL | NULL | Subtitulo opcional |
| description | TEXT | NULL | NULL | Descripcion del modulo |
| summary | TEXT | NULL | NULL | Resumen ejecutivo |
| content | JSONB | NULL | {...} | Contenido estructurado: marie_curie_story, reading_materials, historical_context, scientific_concepts, multimedia_resources |
| order_index | INTEGER | NOT NULL | - | Orden de presentacion |
| module_code | TEXT | NULL | NULL | Codigo unico del modulo |
| difficulty_level | educational_content.difficulty_level | NULL | 'beginner' | Nivel de dificultad |
| grade_levels | TEXT[] | NULL | ARRAY['6','7','8'] | Grados escolares objetivo |
| subjects | TEXT[] | NULL | ARRAY['Literatura','Ciencias'] | Materias asociadas |
| estimated_duration_minutes | INTEGER | NULL | 120 | Duracion estimada en minutos |
| estimated_sessions | INTEGER | NULL | 4 | Numero de sesiones estimadas |
| learning_objectives | TEXT[] | NULL | NULL | Objetivos de aprendizaje |
| competencies | TEXT[] | NULL | NULL | Competencias desarrolladas |
| skills_developed | TEXT[] | NULL | NULL | Habilidades desarrolladas |
| prerequisites | UUID[] | NULL | NULL | Array de UUIDs de modulos prerequisito (auto-referencia debil, sin FK) |
| prerequisite_skills | TEXT[] | NULL | NULL | Habilidades previas requeridas |
| maya_rank_required | gamification_system.maya_rank | NULL | NULL | Rango maya requerido para desbloquear |
| maya_rank_granted | gamification_system.maya_rank | NULL | NULL | Rango maya otorgado al completar |
| xp_reward | INTEGER | NULL | 100 | XP de recompensa (>= 0) |
| ml_coins_reward | INTEGER | NULL | 50 | ML Coins de recompensa (>= 0) |
| status | educational_content.module_status | NULL | 'draft' | Estado del modulo |
| is_published | BOOLEAN | NULL | false | Si el modulo esta publicado |
| is_featured | BOOLEAN | NULL | false | Si el modulo es destacado |
| is_free | BOOLEAN | NULL | true | Si el modulo es de acceso libre |
| is_demo_module | BOOLEAN | NULL | false | Si es modulo de demostracion |
| published_at | TIMESTAMPTZ | NULL | NULL | Fecha de publicacion |
| archived_at | TIMESTAMPTZ | NULL | NULL | Fecha de archivo |
| version | INTEGER | NULL | 1 | Numero de version |
| version_notes | TEXT | NULL | NULL | Notas de la version |
| created_by | UUID | NULL | NULL | FK auth_management.profiles(id) ON DELETE SET NULL |
| reviewed_by | UUID | NULL | NULL | FK auth_management.profiles(id) ON DELETE SET NULL |
| approved_by | UUID | NULL | NULL | FK auth_management.profiles(id) ON DELETE SET NULL |
| keywords | TEXT[] | NULL | NULL | Palabras clave |
| tags | TEXT[] | NULL | NULL | Etiquetas |
| thumbnail_url | TEXT | NULL | NULL | URL miniatura |
| cover_image_url | TEXT | NULL | NULL | URL imagen de portada |
| settings | JSONB | NULL | '{}' | Configuracion adicional |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| total_exercises | INTEGER | NULL | 0 | Total de ejercicios en el modulo |
| created_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** module_code
**Foreign Keys:**
- tenant_id -> auth_management.tenants(id) ON DELETE CASCADE
- created_by -> auth_management.profiles(id) ON DELETE SET NULL
- reviewed_by -> auth_management.profiles(id) ON DELETE SET NULL
- approved_by -> auth_management.profiles(id) ON DELETE SET NULL
- prerequisites[] -- referencia debil auto-referencial (sin FK constraint)
**Checks:** `modules_xp_reward_check` (xp_reward >= 0), `modules_ml_coins_reward_check` (ml_coins_reward >= 0)
**RLS:** `modules_all_admin` (admin full access), `modules_select_admin` (admin SELECT), `modules_select_published` (SELECT WHERE is_published = true AND status = 'published')
**Indices:** `idx_modules_active_published` (order_index, partial), `idx_modules_content_gin` (GIN), `idx_modules_difficulty`, `idx_modules_order`, `idx_modules_prerequisites_gin` (GIN), `idx_modules_published` (partial), `idx_modules_rango_required`, `idx_modules_search` (GIN tsvector), `idx_modules_status`, `idx_modules_status_published`, `idx_modules_tags_gin` (GIN), `idx_modules_tenant_id`, `idx_modules_created_by`, `idx_modules_reviewed_by`, `idx_modules_approved_by`
**Trigger:** `trg_modules_updated_at` (ver educational_content/triggers/14-trg_modules_updated_at.sql)
**Entity:** `Module` (`apps/backend/src/modules/educational/entities/module.entity.ts`)

---

### educational_content.exercises [DDL-ACCURATE]
Ejercicios con 27 mecanicas diferentes -- crucigramas, mapas conceptuales, debates, detective textual, etc. Implementa arquitectura dual: ejercicios autocorregibles (exercise_attempts) y ejercicios con revision manual del maestro (exercise_submissions). Soporta power-ups (comodines), sistema de pistas con costo en ML Coins, y contenido pedagogico expandido.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/02-exercises.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| module_id | UUID | NOT NULL | - | FK educational_content.modules(id) ON DELETE CASCADE (CRITICA) |
| title | TEXT | NOT NULL | - | Titulo del ejercicio |
| subtitle | TEXT | NULL | NULL | Subtitulo opcional |
| description | TEXT | NULL | NULL | Descripcion |
| instructions | TEXT | NULL | NULL | Instrucciones para el estudiante |
| exercise_type | educational_content.exercise_type | NOT NULL | - | Tipo de ejercicio (crucigrama, mapa_conceptual, etc.) |
| order_index | INTEGER | NOT NULL | - | Orden dentro del modulo |
| config | JSONB | NOT NULL | '{}' | Configuracion del ejercicio |
| content | JSONB | NOT NULL | {...} | Contenido: options, question, explanations, correct_answers |
| solution | JSONB | NULL | NULL | Solucion del ejercicio |
| rubric | JSONB | NULL | NULL | Rubrica de evaluacion inline |
| auto_gradable | BOOLEAN | NULL | true | Si puede ser autocorregido |
| requires_manual_grading | BOOLEAN | NULL | false | TRUE: usar exercise_submissions; FALSE: usar exercise_attempts |
| objective | TEXT | NULL | NULL | Objetivo pedagogico expandido (200-500 palabras) |
| how_to_solve | TEXT | NULL | NULL | Guia detallada de resolucion (300-800 palabras) |
| recommended_strategy | TEXT | NULL | NULL | Estrategias recomendadas (100-300 palabras) |
| pedagogical_notes | TEXT | NULL | NULL | Notas metodologicas para educadores (100-400 palabras) |
| difficulty_level | educational_content.difficulty_level | NULL | 'beginner' | Nivel de dificultad |
| max_points | INTEGER | NULL | 100 | Puntaje maximo (> 0) |
| passing_score | INTEGER | NULL | 70 | Puntaje de aprobacion (> 0, <= max_points) |
| estimated_time_minutes | INTEGER | NULL | 10 | Tiempo estimado en minutos (> 0) |
| time_limit_minutes | INTEGER | NULL | NULL | Limite de tiempo (NULL = sin limite, > 0 si se define) |
| max_attempts | INTEGER | NULL | 3 | Numero maximo de intentos (NULL = ilimitado, > 0 si se define) |
| allow_retry | BOOLEAN | NULL | true | Si permite reintentos |
| retry_delay_minutes | INTEGER | NULL | 0 | Minutos de espera entre reintentos |
| hints | TEXT[] | NULL | NULL | Array de pistas |
| enable_hints | BOOLEAN | NULL | true | Si las pistas estan habilitadas |
| hint_cost_ml_coins | INTEGER | NULL | 5 | Costo en ML Coins por pista |
| comodines_allowed | gamification_system.comodin_type[] | NULL | ARRAY['pistas','vision_lectora','segunda_oportunidad'] | Power-ups permitidos |
| comodines_config | JSONB | NULL | {...} | Configuracion de comodines (costo y habilitacion por tipo) |
| xp_reward | INTEGER | NULL | 20 | XP de recompensa (>= 0) |
| ml_coins_reward | INTEGER | NULL | 5 | ML Coins de recompensa (>= 0) |
| bonus_multiplier | NUMERIC(3,2) | NULL | 1.00 | Multiplicador de bonus |
| is_active | BOOLEAN | NULL | true | Si el ejercicio esta activo |
| is_optional | BOOLEAN | NULL | false | Si el ejercicio es opcional |
| is_bonus | BOOLEAN | NULL | false | Si es ejercicio de bonus |
| version | INTEGER | NULL | 1 | Numero de version |
| version_notes | TEXT | NULL | NULL | Notas de la version |
| created_by | UUID | NULL | NULL | FK auth_management.profiles(id) ON DELETE SET NULL |
| reviewed_by | UUID | NULL | NULL | FK auth_management.profiles(id) ON DELETE SET NULL |
| adaptive_difficulty | BOOLEAN | NULL | false | Si usa dificultad adaptativa |
| prerequisites | UUID[] | NULL | NULL | Array UUID de ejercicios prerequisito (auto-referencia debil, sin FK) |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** (module_id, exercise_type, order_index)
**Foreign Keys:**
- module_id -> educational_content.modules(id) ON DELETE CASCADE
- created_by -> auth_management.profiles(id) ON DELETE SET NULL
- reviewed_by -> auth_management.profiles(id) ON DELETE SET NULL
- prerequisites[] -- referencia debil auto-referencial (sin FK constraint)
**Checks:** `exercises_check` (passing_score > 0 AND passing_score <= max_points), `exercises_max_points_check` (max_points > 0), `exercises_xp_reward_check` (xp_reward >= 0), `exercises_ml_coins_reward_check` (ml_coins_reward >= 0), `exercises_estimated_time_check` (estimated_time_minutes > 0), `exercises_time_limit_check` (time_limit_minutes IS NULL OR > 0), `exercises_max_attempts_check` (max_attempts IS NULL OR > 0)
**RLS:** `exercises_all_admin` (admin full access), `exercises_select_admin` (admin SELECT), `exercises_select_active` (SELECT WHERE is_active = true)
**Indices:** `idx_exercises_active` (partial), `idx_exercises_active_gradable` (partial), `idx_exercises_config_gin` (GIN), `idx_exercises_content_gin` (GIN), `idx_exercises_difficulty`, `idx_exercises_module_id`, `idx_exercises_module_type_active`, `idx_exercises_order`, `idx_exercises_prerequisites` (GIN), `idx_exercises_search` (GIN tsvector), `idx_exercises_type`, `idx_exercises_requires_manual_grading` (partial)
**Trigger:** `trg_exercises_updated_at` (ver educational_content/triggers/12-trg_exercises_updated_at.sql)
**Entity:** `Exercise` (`apps/backend/src/modules/educational/entities/exercise.entity.ts`)

---

### educational_content.assessment_rubrics [DDL-ACCURATE]
Rubricas de evaluacion para ejercicios o modulos. Implementa relacion polimorfica exclusiva: cada rubrica se asocia SOLO a un ejercicio (exercise_id) O a un modulo (module_id), nunca a ambos ni a ninguno. Soporta tipos de evaluacion automatica, manual, hibrida y de pares. Controla el peso porcentual de cada rubrica y plantillas de retroalimentacion automatica.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/03-assessment_rubrics.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| exercise_id | UUID | NULL | NULL | FK educational_content.exercises(id) ON DELETE CASCADE -- parte de relacion polimorfica (XOR con module_id) |
| module_id | UUID | NULL | NULL | FK educational_content.modules(id) ON DELETE CASCADE -- parte de relacion polimorfica (XOR con exercise_id) |
| name | TEXT | NOT NULL | - | Nombre de la rubrica |
| description | TEXT | NULL | NULL | Descripcion de la rubrica |
| assessment_type | TEXT | NULL | NULL | Tipo: automatic, manual, hybrid, peer_review |
| criteria | JSONB | NULL | {...} | Criterios de evaluacion con niveles de logro y pesos |
| scoring_scale | JSONB | NULL | {"max":100,"min":0,"passing":70} | Escala de puntuacion |
| weight_percentage | NUMERIC(5,2) | NULL | 100.00 | Peso porcentual de la rubrica (0 < valor <= 100) |
| is_active | BOOLEAN | NULL | true | Si la rubrica esta activa |
| allow_resubmission | BOOLEAN | NULL | true | Si permite reentregas |
| feedback_template | TEXT | NULL | NULL | Plantilla de retroalimentacion |
| auto_feedback_enabled | BOOLEAN | NULL | true | Si la retroalimentacion automatica esta habilitada |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_by | UUID | NULL | NULL | FK auth_management.profiles(id) ON DELETE SET NULL |
| created_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Foreign Keys:**
- exercise_id -> educational_content.exercises(id) ON DELETE CASCADE
- module_id -> educational_content.modules(id) ON DELETE CASCADE
- created_by -> auth_management.profiles(id) ON DELETE SET NULL
**Checks:** `rubric_reference_check` (exercise_id XOR module_id -- exactamente uno NOT NULL), `assessment_rubrics_assessment_type_check` (assessment_type IN ('automatic','manual','hybrid','peer_review')), `assessment_rubrics_weight_percentage_check` (weight_percentage > 0 AND <= 100)
**RLS:** Habilitada (sin politicas explicitas en DDL -- hereda de schema)
**Indices:** `idx_rubrics_active` (partial), `idx_rubrics_exercise_id`, `idx_rubrics_module_id`, `idx_rubrics_created_by`
**Trigger:** `trg_assessment_rubrics_updated_at` (ver educational_content/triggers/11-trg_assessment_rubrics_updated_at.sql)
**Entity:** `AssessmentRubric` (`apps/backend/src/modules/educational/entities/assessment-rubric.entity.ts`)

---

### educational_content.media_resources [DDL-ACCURATE]
Repositorio de recursos multimedia (imagenes, videos, audio, documentos) para contenido educativo. Incluye metadatos de media, tracking de uso y control de licencias.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/04-media_resources.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants(id) ON DELETE CASCADE |
| title | TEXT | NOT NULL | - | Titulo del recurso |
| description | TEXT | NULL | NULL | Descripcion |
| alt_text | TEXT | NULL | NULL | Texto alternativo para accesibilidad |
| media_type | content_management.media_type | NOT NULL | - | Tipo: image, video, audio, document, interactive, animation |
| file_format | TEXT | NULL | NULL | Formato del archivo (ej: mp4, jpg, pdf) |
| file_size_bytes | BIGINT | NULL | NULL | Tamano en bytes (>= 0) |
| url | TEXT | NOT NULL | - | URL del recurso |
| thumbnail_url | TEXT | NULL | NULL | URL del thumbnail |
| cdn_url | TEXT | NULL | NULL | URL CDN del recurso |
| width | INTEGER | NULL | NULL | Ancho en pixeles |
| height | INTEGER | NULL | NULL | Alto en pixeles |
| duration_seconds | INTEGER | NULL | NULL | Duracion en segundos (audio/video) |
| resolution | TEXT | NULL | NULL | Resolucion (ej: 1920x1080) |
| category | TEXT | NULL | NULL | Categoria del recurso |
| tags | TEXT[] | NULL | NULL | Tags para busqueda |
| keywords | TEXT[] | NULL | NULL | Palabras clave |
| processing_status | content_management.processing_status | NULL | 'ready' | Estado de procesamiento |
| is_public | BOOLEAN | NULL | false | Si el recurso es publico |
| is_active | BOOLEAN | NULL | true | Si el recurso esta activo |
| used_in_modules | UUID[] | NULL | NULL | Referencias debiles a modulos (sin FK constraint) |
| used_in_exercises | UUID[] | NULL | NULL | Referencias debiles a ejercicios (sin FK constraint) |
| created_by | UUID | NULL | NULL | FK auth_management.profiles(id) ON DELETE SET NULL |
| copyright_info | TEXT | NULL | NULL | Informacion de copyright |
| license | TEXT | NULL | NULL | Tipo de licencia |
| attribution | TEXT | NULL | NULL | Atribucion requerida |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Foreign Keys:**
- tenant_id -> auth_management.tenants(id)
- created_by -> auth_management.profiles(id)
**Indices:** `idx_media_active`, `idx_media_category`, `idx_media_created_by`, `idx_media_exercises` (GIN), `idx_media_modules` (GIN), `idx_media_tenant_id`, `idx_media_type`
**RLS:** Habilitado
**Entity:** `MediaResource` (`apps/backend/src/modules/educational/entities/media-resource.entity.ts`)

---

### Tablas de Asignaciones

### educational_content.assignments [DDL-ACCURATE]
Tareas y asignaciones creadas por profesores. Soporta distintos tipos de asignacion (practica, quiz, examen, tarea). La relacion con el maestro usa ON DELETE RESTRICT para prevenir perdida de datos historicos al eliminar docentes.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/05-assignments.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| teacher_id | UUID | NOT NULL | - | FK auth_management.profiles(id) ON DELETE RESTRICT |
| title | VARCHAR(255) | NOT NULL | - | Titulo de la asignacion |
| description | TEXT | NULL | NULL | Descripcion detallada |
| assignment_type | VARCHAR(50) | NOT NULL | - | Tipo: practice, quiz, exam, homework |
| due_date | TIMESTAMPTZ | NULL | NULL | Fecha limite de entrega |
| total_points | INTEGER | NOT NULL | 100 | Puntaje maximo |
| is_published | BOOLEAN | NOT NULL | false | Si la asignacion es visible para estudiantes |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | - |

**Primary Key:** id
**Foreign Keys:**
- teacher_id -> auth_management.profiles(id) ON DELETE RESTRICT
**Checks:** `assignment_type IN ('practice', 'quiz', 'exam', 'homework')`
**Indices:** `idx_assignments_teacher_id`, `idx_assignments_is_published`, `idx_assignments_due_date` (partial WHERE due_date IS NOT NULL), `idx_assignments_type`
**Trigger:** `trg_assignments_updated_at` (gamilit.update_updated_at_column)
**Entity:** `Assignment` (`apps/backend/src/modules/assignments/entities/assignment.entity.ts`)

---

### educational_content.assignment_exercises [DDL-ACCURATE]
Relacion M2M entre asignaciones y ejercicios. Permite configurar el orden e importancia de cada ejercicio dentro de una asignacion especifica.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/06-assignment_exercises.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| assignment_id | UUID | NOT NULL | - | FK educational_content.assignments(id) ON DELETE CASCADE |
| exercise_id | UUID | NOT NULL | - | FK educational_content.exercises(id) ON DELETE CASCADE |
| order_index | INTEGER | NULL | NULL | Orden de presentacion del ejercicio en la asignacion |
| points_override | DECIMAL(5,2) | NULL | NULL | Puntos personalizados para este ejercicio en esta asignacion (sobreescribe el valor por defecto) |
| is_required | BOOLEAN | NULL | true | Si el ejercicio es obligatorio u opcional en la asignacion |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Primary Key:** id
**Foreign Keys:**
- assignment_id -> educational_content.assignments(id) ON DELETE CASCADE
- exercise_id -> educational_content.exercises(id) ON DELETE CASCADE
**Unique:** (assignment_id, exercise_id)
**Indices:** `idx_assignment_exercises_assignment_id`, `idx_assignment_exercises_exercise_id`, `idx_assignment_exercises_order`
**Entity:** `AssignmentExercise` (`apps/backend/src/modules/assignments/entities/assignment-exercise.entity.ts`)

---

### educational_content.assignment_students [DDL-ACCURATE]
Tabla de relacion M2M entre asignaciones y estudiantes. Consolida el seguimiento completo del ciclo de vida de una entrega: asignacion, progreso, envio, calificacion y devolucion. Incluye deteccion automatica de entregas tardias, calculo automatico de porcentaje y marcado para revision especial. Absorbe campos de grading que originalmente estaban en una tabla alter separada.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/07-assignment_students.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| assignment_id | UUID | NOT NULL | - | FK educational_content.assignments(id) ON DELETE CASCADE |
| student_id | UUID | NOT NULL | - | FK auth_management.profiles(id) ON DELETE CASCADE |
| assigned_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de asignacion |
| submitted_at | TIMESTAMPTZ | NULL | NULL | Fecha de entrega |
| submission_data | JSONB | NULL | '{}' | Datos de la entrega (respuestas, metadata de archivos) |
| submission_url | TEXT | NULL | NULL | URL de la entrega |
| submission_files | JSONB | NULL | '[]' | Archivos adjuntos de la entrega |
| score | DECIMAL(5,2) | NULL | NULL | Puntaje obtenido (0 a max_score) |
| max_score | DECIMAL(5,2) | NULL | NULL | Puntaje maximo posible |
| percentage | DECIMAL(5,2) | NULL | NULL | Porcentaje auto-calculado (score/max_score * 100) |
| feedback | TEXT | NULL | NULL | Retroalimentacion del maestro |
| graded_by | UUID | NULL | NULL | FK auth_management.profiles(id) ON DELETE SET NULL |
| graded_at | TIMESTAMPTZ | NULL | NULL | Fecha de calificacion (auto-set al cambiar status a 'graded') |
| status | VARCHAR(50) | NULL | 'assigned' | Estado: assigned, in_progress, submitted, graded, returned, late, excused |
| attempt_number | INTEGER | NULL | 1 | Numero de intento actual (>= 1) |
| max_attempts | INTEGER | NULL | 1 | Numero maximo de intentos |
| is_late | BOOLEAN | NULL | false | Si la entrega es tardia (auto-detectado) |
| late_penalty_applied | DECIMAL(5,2) | NULL | 0 | Penalizacion por entrega tardia |
| rubric_scores | JSONB | NULL | '{}' | Puntajes por criterio de rubrica |
| teacher_notes | TEXT | NULL | NULL | Notas internas del maestro |
| flagged_for_review | BOOLEAN | NULL | false | Si la entrega requiere atencion especial |
| flag_reason | TEXT | NULL | NULL | Razon del marcado para revision |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** (assignment_id, student_id)
**Foreign Keys:**
- assignment_id -> educational_content.assignments(id) ON DELETE CASCADE
- student_id -> auth_management.profiles(id) ON DELETE CASCADE
- graded_by -> auth_management.profiles(id) ON DELETE SET NULL
**Checks:** `assignment_students_score_valid` (score IS NULL OR score BETWEEN 0 AND max_score), `assignment_students_percentage_valid` (percentage IS NULL OR BETWEEN 0 AND 100), `assignment_students_attempt_positive` (attempt_number > 0 AND <= max_attempts), `assignment_students_status_valid` (status IN allowed values)
**Indices:** `idx_assignment_students_assignment_id`, `idx_assignment_students_student_id`, `idx_assignment_students_status`, `idx_assignment_students_submitted_ungraded` (partial WHERE status='submitted'), `idx_assignment_students_flagged` (partial WHERE flagged_for_review=TRUE), `idx_assignment_students_grading_queue` (partial WHERE status IN ('submitted','in_progress')), `idx_assignment_students_student_history` (DESC), `idx_assignment_students_graded_by` (partial WHERE status='graded')
**Trigger:** `trg_assignment_students_updated_at` -- auto-calcula percentage, auto-set graded_at, auto-detecta is_late comparando submitted_at con assignments.due_date
**Entity:** `AssignmentStudent` (`apps/backend/src/modules/assignments/entities/assignment-student.entity.ts`)

---

### educational_content.assignment_submissions [DDL-ACCURATE]
Registro de entregas de estudiantes para asignaciones. Tabla complementaria a assignment_students para el flujo de envio formal. La FK del calificador usa ON DELETE SET NULL para preservar el historial de calificaciones cuando un maestro es eliminado.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/08-assignment_submissions.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| assignment_id | UUID | NOT NULL | - | FK educational_content.assignments(id) ON DELETE CASCADE |
| student_id | UUID | NOT NULL | - | FK auth_management.profiles(id) ON DELETE CASCADE |
| submitted_at | TIMESTAMPTZ | NULL | NULL | Fecha y hora de entrega |
| status | VARCHAR(50) | NOT NULL | 'not_started' | Estado: not_started, in_progress, submitted, graded |
| score | NUMERIC(5,2) | NULL | NULL | Puntaje otorgado por el maestro (escala 0-100) |
| feedback | TEXT | NULL | NULL | Retroalimentacion del maestro |
| graded_at | TIMESTAMPTZ | NULL | NULL | Fecha de calificacion |
| graded_by | UUID | NULL | NULL | FK auth_management.profiles(id) ON DELETE SET NULL |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | - |

**Primary Key:** id
**Unique:** (assignment_id, student_id)
**Foreign Keys:**
- assignment_id -> educational_content.assignments(id) ON DELETE CASCADE
- student_id -> auth_management.profiles(id) ON DELETE CASCADE
- graded_by -> auth_management.profiles(id) ON DELETE SET NULL
**Checks:** `status IN ('not_started', 'in_progress', 'submitted', 'graded')`
**Indices:** `idx_assignment_submissions_assignment_id`, `idx_assignment_submissions_student_id`, `idx_assignment_submissions_status`, `idx_assignment_submissions_graded_by` (partial WHERE graded_by IS NOT NULL), `idx_assignment_submissions_submitted_at` (partial WHERE submitted_at IS NOT NULL)
**Trigger:** `trg_assignment_submissions_updated_at` (gamilit.update_updated_at_column)
**Entity:** `AssignmentSubmission` (`apps/backend/src/modules/assignments/entities/assignment-submission.entity.ts`)

---

### Tablas de Clasificacion y Taxonomia

### educational_content.difficulty_criteria [DDL-ACCURATE]
Criterios especificos para cada nivel de dificultad CEFR. Define rangos de vocabulario, complejidad de oraciones, recompensas base y requisitos de promocion.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/20-difficulty_criteria.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| level | educational_content.difficulty_level | NOT NULL | - | PK -- nivel de dificultad (ENUM) |
| vocab_range_min | INTEGER | NOT NULL | - | Minimo de palabras de vocabulario para este nivel |
| vocab_range_max | INTEGER | NULL | NULL | Maximo de palabras de vocabulario |
| sentence_length_min | INTEGER | NOT NULL | - | Longitud minima de oracion |
| sentence_length_max | INTEGER | NULL | NULL | Longitud maxima de oracion |
| time_multiplier | NUMERIC(3,2) | NOT NULL | 1.0 | Multiplicador de tiempo permitido |
| base_xp | INTEGER | NOT NULL | 10 | XP base por completar en este nivel |
| base_coins | INTEGER | NOT NULL | 5 | ML Coins base por completar en este nivel |
| promotion_success_rate | NUMERIC(5,2) | NOT NULL | 80.00 | Tasa de exito minima para promocion (%) |
| promotion_min_exercises | INTEGER | NOT NULL | 30 | Ejercicios minimos requeridos para promocion |
| promotion_time_threshold | NUMERIC(3,2) | NOT NULL | 1.50 | Umbral de tiempo para promocion |
| cefr_level | VARCHAR(5) | NOT NULL | - | Nivel CEFR equivalente (A1, A2, B1, B2, C1, C2) |
| description | TEXT | NOT NULL | - | Descripcion del nivel |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** level (difficulty_level ENUM)
**RLS:** NO (catalogo global, acceso de solo lectura a `authenticated`)
**Indices:** `idx_difficulty_criteria_cefr`
**Trigger:** `trg_difficulty_criteria_updated_at`
**Entity:** `DifficultyCriteria` (`apps/backend/src/modules/educational/entities/difficulty-criteria.entity.ts`)

---

### educational_content.exercise_mechanic_mappings [DDL-ACCURATE]
Mapeo N:M entre categorias pedagogicas universales (7 categorias, 31 subcategorias) e implementaciones especificas GAMILIT (33 exercise_types). Ver ADR-008 para contexto arquitectonico.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/21-exercise_mechanic_mapping.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| mechanic_category | VARCHAR(50) | NOT NULL | - | Categoria pedagogica principal (vocabulario, gramatica, lectura, escritura, audio, pronunciacion, cultura) |
| mechanic_subcategory | VARCHAR(50) | NULL | NULL | Subcategoria pedagogica generica (ej: multiple_choice, inference, free_writing) |
| exercise_type | educational_content.exercise_type | NOT NULL | - | Tipo de ejercicio GAMILIT (ENUM) |
| bloom_level | educational_content.bloom_level | NULL | NULL | Nivel en Taxonomia de Bloom (ENUM) |
| cefr_level | educational_content.difficulty_level[] | NULL | NULL | Niveles CEFR aplicables (array) |
| pedagogical_purpose | TEXT | NULL | NULL | Descripcion del proposito pedagogico del mapeo |
| learning_objectives | TEXT[] | NULL | NULL | Array de objetivos de aprendizaje |
| interaction_type | VARCHAR(50) | NULL | NULL | Tipo de interaccion del usuario (drag_drop, text_input, selection, audio_recording, drawing) |
| cognitive_load | VARCHAR(20) | NULL | NULL | Carga cognitiva: bajo, medio, alto |
| tags | TEXT[] | NULL | NULL | Tags adicionales para busqueda flexible |
| is_active | BOOLEAN | NOT NULL | true | Permite deshabilitar mappings obsoletos |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Primary Key:** id
**Unique:** (mechanic_subcategory, exercise_type)
**Indices:** `idx_mechanic_mapping_category`, `idx_mechanic_mapping_subcategory`, `idx_mechanic_mapping_exercise_type`, `idx_mechanic_mapping_bloom`, `idx_mechanic_mapping_tags_gin` (GIN)
**Trigger:** `trg_exercise_mechanic_mappings_updated_at`
**Entity:** `ExerciseMechanicMapping` (`apps/backend/src/modules/educational/entities/exercise-mechanic-mapping.entity.ts`)

---

### educational_content.taxonomies [DDL-ACCURATE]
Taxonomias educativas (Bloom, SOLO, Webb DOK, custom). Almacena la definicion completa de cada taxonomia con sus niveles jerarquicos.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/taxonomies.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre de la taxonomia (UNIQUE) |
| description | TEXT | NULL | NULL | Descripcion |
| taxonomy_type | VARCHAR(50) | NOT NULL | - | Tipo: bloom, solo, webb, custom |
| levels | JSONB | NOT NULL | - | Array de niveles con descripciones [{level, name, description}] |
| is_active | BOOLEAN | NOT NULL | true | Si la taxonomia esta activa |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Primary Key:** id
**Unique:** name
**Indices:** `idx_taxonomies_type`, `idx_taxonomies_is_active`, `idx_taxonomies_levels_gin` (GIN)
**Trigger:** `trg_taxonomies_updated_at`
**Datos iniciales:** Taxonomia de Bloom (6 niveles: Recordar, Comprender, Aplicar, Analizar, Evaluar, Crear)
**Entity:** `Taxonomy` (`apps/backend/src/modules/educational/entities/taxonomy.entity.ts`)

---

### Tablas de Validacion y Auditoria

### educational_content.exercise_validation_configs [DDL-ACCURATE]
Configuracion de validacion de respuestas por tipo de ejercicio. Define que funcion SQL usar y sus parametros para cada exercise_type.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/22-exercise_validation_config.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| exercise_type | educational_content.exercise_type | NOT NULL | - | Tipo de ejercicio (ENUM) -- UNIQUE |
| validation_function | TEXT | NOT NULL | - | Nombre de la funcion SQL de validacion |
| case_sensitive | BOOLEAN | NULL | false | Si la validacion distingue mayusculas/minusculas |
| allow_partial_credit | BOOLEAN | NULL | false | Si permite puntuacion parcial |
| fuzzy_matching_threshold | NUMERIC(3,2) | NULL | NULL | Umbral de similaridad para fuzzy matching (0.00-1.00) |
| normalize_text | BOOLEAN | NULL | true | Normalizar texto antes de comparar |
| special_rules | JSONB | NULL | '{}' | Reglas especificas del tipo en JSONB |
| default_max_points | INTEGER | NULL | 100 | Puntos maximos por defecto |
| default_passing_score | INTEGER | NULL | 70 | Puntaje minimo de aprobacion por defecto |
| description | TEXT | NULL | NULL | Descripcion de la configuracion |
| examples | JSONB | NULL | NULL | Ejemplos de validacion en JSONB |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** exercise_type
**Indices:** `idx_validation_config_type`, `idx_validation_config_function`
**Trigger:** `trg_exercise_validation_configs_updated_at`
**Entity:** `ExerciseValidationConfig` (`apps/backend/src/modules/educational/entities/exercise-validation-config.entity.ts`)

---

### educational_content.exercise_validation_audits [DDL-ACCURATE]
Auditoria completa de todas las validaciones de ejercicios. Almacena snapshots inmutables de respuesta, ejercicio y configuracion para trazabilidad y recalculo.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/26-exercise_validation_audit.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| exercise_id | UUID | NOT NULL | - | FK educational_content.exercises(id) ON DELETE RESTRICT |
| user_id | UUID | NOT NULL | - | Usuario que realizo el intento |
| attempt_number | INTEGER | NOT NULL | - | Numero de intento (>0) |
| submitted_answer | JSONB | NOT NULL | - | Snapshot INMUTABLE de la respuesta enviada |
| submitted_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | Momento de envio |
| exercise_snapshot | JSONB | NOT NULL | - | Snapshot del ejercicio al momento de validacion |
| validation_config_snapshot | JSONB | NOT NULL | - | Snapshot de la configuracion de validacion usada |
| is_correct | BOOLEAN | NOT NULL | - | Si la respuesta fue correcta |
| score | INTEGER | NOT NULL | - | Puntaje obtenido (0 a max_score) |
| max_score | INTEGER | NOT NULL | - | Puntaje maximo posible |
| feedback | TEXT | NULL | NULL | Retroalimentacion generada |
| validation_details | JSONB | NULL | NULL | Detalle de la validacion |
| validation_function_used | TEXT | NOT NULL | - | Nombre de la funcion SQL usada |
| validation_timestamp | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | Momento de la validacion |
| validation_duration_ms | INTEGER | NULL | NULL | Duracion de la validacion en ms |
| is_recalculated | BOOLEAN | NULL | false | Si es resultado de un recalculo |
| recalculated_at | TIMESTAMPTZ | NULL | NULL | Fecha de recalculo |
| recalculated_by | UUID | NULL | NULL | Usuario que ejecuto el recalculo |
| recalculation_reason | TEXT | NULL | NULL | Razon del recalculo |
| original_audit_id | UUID | NULL | NULL | FK self -- apunta al registro original si es recalculo |
| has_discrepancy | BOOLEAN | NULL | false | Si se detecto discrepancia entre validaciones |
| discrepancy_type | TEXT | NULL | NULL | Tipo de discrepancia detectada |
| discrepancy_notes | TEXT | NULL | NULL | Notas sobre la discrepancia |
| client_metadata | JSONB | NULL | '{}' | Metadata del cliente (ip, user_agent, session_id) |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Foreign Keys:**
- exercise_id -> educational_content.exercises(id) ON DELETE RESTRICT
- original_audit_id -> educational_content.exercise_validation_audits(id) ON DELETE SET NULL
**Indices:** `idx_validation_audit_exercise_user`, `idx_validation_audit_user_submitted`, `idx_validation_audit_recalculated`, `idx_validation_audit_discrepancy`, `idx_validation_audit_validation_function`, `idx_validation_audit_exercise_attempt`, `idx_validation_audit_validation_timestamp`, `idx_validation_audit_submitted_answer_gin` (GIN)
**Trigger:** `trg_validation_audit_updated_at`
**Nota:** Los registros de auditoria son inmutables -- no se otorga DELETE a ningun rol.
**Entity:** `ExerciseValidationAudit` (`apps/backend/src/modules/educational/entities/exercise-validation-audit.entity.ts`)

---

### educational_content.exercise_type_rubrics [DDL-ACCURATE]
Rubricas estandar por tipo de ejercicio (plantillas). Define criterios de evaluacion para exercise_types de los modulos M3, M4 y M5 que requieren calificacion manual.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/27-exercise_type_rubrics.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| exercise_type | VARCHAR(100) | NOT NULL | - | Tipo de ejercicio (debe coincidir con exercises.exercise_type) |
| rubric_name | VARCHAR(255) | NOT NULL | - | Nombre descriptivo de la rubrica |
| criteria | JSONB | NOT NULL | - | Array de criterios: [{id, name, description, weight, levels: [{score, label, description}]}] |
| total_weight | INTEGER | NULL | 100 | Suma total de weights (debe ser 100) |
| is_default | BOOLEAN | NULL | true | Si es la rubrica por defecto para este tipo |
| module_code | VARCHAR(50) | NULL | NULL | Codigo del modulo (MOD-03-CRITICA, MOD-04-DIGITAL, MOD-05-PRODUCCION) |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** (exercise_type)
**Indices:** `idx_exercise_type_rubrics_type`, `idx_exercise_type_rubrics_module`, `idx_exercise_type_rubrics_default`
**Constraint:** total_weight = 100
**Entity:** `ExerciseTypeRubric` (`apps/backend/src/modules/educational/entities/exercise-type-rubric.entity.ts`)

---

### Tablas de Contenido y Metadatos

### educational_content.content_approvals [DDL-ACCURATE]
Workflow de aprobacion de contenido educativo. Registra el ciclo de vida de revision y aprobacion para modulos, ejercicios, asignaciones y recursos.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/content_approvals.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| content_type | VARCHAR(50) | NOT NULL | - | Tipo: module, exercise, assignment, resource |
| content_id | UUID | NOT NULL | - | ID del item en su tabla respectiva |
| submitted_by | UUID | NOT NULL | - | FK auth_management.profiles(id) -- quien lo envia |
| submitted_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | Fecha de envio a revision |
| reviewed_by | UUID | NULL | NULL | FK auth_management.profiles(id) -- quien lo revisa |
| reviewed_at | TIMESTAMPTZ | NULL | NULL | Fecha de revision |
| status | VARCHAR(50) | NOT NULL | 'pending' | Estado: pending, approved, rejected, needs_revision |
| reviewer_notes | TEXT | NULL | NULL | Notas del revisor sobre la aprobacion/rechazo |
| revision_notes | TEXT | NULL | NULL | Notas del autor sobre revisiones realizadas |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Primary Key:** id
**Foreign Keys:**
- submitted_by -> auth_management.profiles(id)
- reviewed_by -> auth_management.profiles(id)
**Indices:** `idx_content_approvals_content`, `idx_content_approvals_status`, `idx_content_approvals_submitted_by`, `idx_content_approvals_reviewed_by`, `idx_content_approvals_pending`
**Trigger:** `trg_content_approvals_updated_at`
**Entity:** `ContentApproval` (`apps/backend/src/modules/educational/entities/content-approval.entity.ts`)

---

### educational_content.content_metadatas [DDL-ACCURATE]
Metadatos adicionales en formato clave-valor para cualquier item de contenido educativo. Permite extender atributos sin modificar el esquema base.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/content_metadata.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| content_type | VARCHAR(50) | NOT NULL | - | Tipo: module, exercise, assignment, resource |
| content_id | UUID | NOT NULL | - | ID del item en su tabla respectiva |
| metadata_key | VARCHAR(100) | NOT NULL | - | Clave de metadato (ej: difficulty_level, estimated_time, standards) |
| metadata_value | JSONB | NOT NULL | - | Valor flexible en JSONB |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Primary Key:** id
**Unique:** (content_type, content_id, metadata_key)
**Indices:** `idx_content_metadatas_content`, `idx_content_metadatas_key`, `idx_content_metadatas_value_gin` (GIN sobre metadata_value)
**Trigger:** `trg_content_metadatas_updated_at`
**Entity:** `ContentMetadata` (`apps/backend/src/modules/educational/entities/content-metadata.entity.ts`)

---

### educational_content.content_tags [DDL-ACCURATE]
Sistema de etiquetado de contenido educativo. Tabla de junction que asocia tags a cualquier tipo de item de contenido (modulo, ejercicio, asignacion, recurso).

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/content_tags.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| content_type | VARCHAR(50) | NOT NULL | - | Tipo: module, exercise, assignment, resource |
| content_id | UUID | NOT NULL | - | ID del item en su tabla respectiva |
| tag | VARCHAR(100) | NOT NULL | - | Texto del tag (ej: matematicas, lectura, avanzado) |
| tag_category | VARCHAR(50) | NULL | NULL | Categoria opcional del tag (ej: subject, difficulty, topic) |
| created_by | UUID | NULL | NULL | FK auth_management.profiles(id) |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Primary Key:** id
**Foreign Keys:**
- created_by -> auth_management.profiles(id)
**Unique:** (content_type, content_id, tag)
**Indices:** `idx_content_tags_content`, `idx_content_tags_tag`, `idx_content_tags_category`, `idx_content_tags_created_by`
**Entity:** `ContentTag` (`apps/backend/src/modules/educational/entities/content-tag.entity.ts`)

---

### educational_content.module_dependencies [DDL-ACCURATE]
Prerequisitos y dependencias entre modulos educativos. Define que modulos deben completarse (total o parcialmente) antes de acceder a otro.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/module_dependencies.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| module_id | UUID | NOT NULL | - | FK educational_content.modules(id) ON DELETE CASCADE -- modulo que tiene el prerequisito |
| prerequisite_module_id | UUID | NOT NULL | - | FK educational_content.modules(id) ON DELETE CASCADE -- modulo que debe completarse primero |
| dependency_type | VARCHAR(50) | NOT NULL | 'required' | Tipo: required, recommended, optional |
| minimum_completion_percentage | INTEGER | NULL | 100 | Porcentaje minimo de completitud requerido (0-100) |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Primary Key:** id
**Foreign Keys:**
- module_id -> educational_content.modules(id) ON DELETE CASCADE
- prerequisite_module_id -> educational_content.modules(id) ON DELETE CASCADE
**Unique:** (module_id, prerequisite_module_id)
**Constraint:** module_id != prerequisite_module_id
**Indices:** `idx_module_dependencies_module_id`, `idx_module_dependencies_prerequisite_id`, `idx_module_dependencies_type`
**Entity:** `ModuleDependencies` (`apps/backend/src/modules/educational/entities/module-dependencies.entity.ts`)

---

### Tablas de Contenido Docente

### educational_content.teacher_contents [DDL-ACCURATE]
Contenido educativo personalizado creado por docentes. Soporta multiples tipos (ejercicios, hojas de trabajo, lecturas, videos, quizzes, paquetes de recursos) con flujo de publicacion, comparticion y aprobacion.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/25-teacher_content.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| teacher_id | UUID | NOT NULL | - | FK auth_management.profiles(id) ON DELETE CASCADE -- propietario |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants(id) ON DELETE CASCADE |
| title | VARCHAR(255) | NOT NULL | - | Titulo del contenido |
| description | TEXT | NULL | NULL | Descripcion |
| content_type | VARCHAR(50) | NOT NULL | - | Tipo: custom_exercise, worksheet, reading_material, video_lesson, presentation, quiz, assignment, resource_pack, other |
| content_data | JSONB | NOT NULL | '{}' | Datos del contenido (estructura varia por content_type) |
| instructions | TEXT | NULL | NULL | Instrucciones |
| learning_objectives | JSONB | NULL | '[]' | Objetivos de aprendizaje |
| prerequisites | JSONB | NULL | '[]' | Prerequisitos de habilidades o contenido |
| subject_area | VARCHAR(100) | NULL | NULL | Area de materia |
| grade_level | VARCHAR(50) | NULL | NULL | Nivel de grado |
| difficulty_level | VARCHAR(20) | NULL | NULL | Dificultad: easy, medium, hard, expert |
| estimated_duration_minutes | INTEGER | NULL | NULL | Duracion estimada en minutos |
| media_resources | JSONB | NULL | '[]' | Array de UUIDs o embedded media |
| attachments | JSONB | NULL | '[]' | Archivos adjuntos adicionales |
| target_classrooms | JSONB | NULL | '[]' | Array de UUIDs de aulas destino |
| visibility | VARCHAR(50) | NULL | 'private' | Visibilidad: private, classroom, school, public |
| is_shared | BOOLEAN | NULL | false | Si esta compartido con otros docentes |
| shared_with_teachers | JSONB | NULL | '[]' | Array de UUIDs de docentes con acceso |
| allow_modifications | BOOLEAN | NULL | false | Si los docentes con acceso pueden modificarlo |
| status | VARCHAR(50) | NULL | 'draft' | Estado: draft, pending_review, approved, published, archived |
| published_at | TIMESTAMPTZ | NULL | NULL | Fecha de publicacion |
| published_version | INTEGER | NULL | 1 | Version publicada |
| requires_approval | BOOLEAN | NULL | false | Si requiere aprobacion para publicar |
| approved_by | UUID | NULL | NULL | FK auth_management.profiles(id) ON DELETE SET NULL |
| approved_at | TIMESTAMPTZ | NULL | NULL | Fecha de aprobacion |
| times_assigned | INTEGER | NULL | 0 | Veces asignado a aulas |
| times_completed | INTEGER | NULL | 0 | Veces completado por estudiantes |
| average_score | DECIMAL(5,2) | NULL | NULL | Puntaje promedio de estudiantes |
| average_duration_minutes | INTEGER | NULL | NULL | Duracion promedio de completitud |
| tags | JSONB | NULL | '[]' | Tags para busqueda |
| keywords | JSONB | NULL | '[]' | Palabras clave |
| points_value | INTEGER | NULL | 0 | Puntos de gamificacion |
| ml_coins_reward | INTEGER | NULL | 0 | ML Coins de recompensa |
| student_rating | DECIMAL(3,2) | NULL | NULL | Calificacion de estudiantes (0.00-5.00) |
| rating_count | INTEGER | NULL | 0 | Numero de calificaciones de estudiantes |
| teacher_rating | DECIMAL(3,2) | NULL | NULL | Calificacion de pares docentes |
| teacher_rating_count | INTEGER | NULL | 0 | Numero de calificaciones de docentes |
| license | VARCHAR(100) | NULL | NULL | Licencia: CC-BY, CC-BY-SA, proprietary, educational_use_only |
| attribution | TEXT | NULL | NULL | Atribucion requerida |
| based_on_content_id | UUID | NULL | NULL | FK self -- si es derivado de contenido de otro docente |
| version_number | INTEGER | NULL | 1 | Numero de version |
| is_latest_version | BOOLEAN | NULL | true | Si es la version mas reciente |
| previous_version_id | UUID | NULL | NULL | FK self -- version anterior |
| metadata | JSONB | NULL | '{}' | Campos adicionales personalizados |
| is_active | BOOLEAN | NULL | true | Si el contenido esta activo |
| is_featured | BOOLEAN | NULL | false | Si es contenido destacado |
| is_template | BOOLEAN | NULL | false | Si otros docentes pueden usarlo como plantilla |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| last_used_at | TIMESTAMPTZ | NULL | NULL | Ultima vez que fue utilizado |

**Primary Key:** id
**Foreign Keys:**
- teacher_id -> auth_management.profiles(id) ON DELETE CASCADE
- tenant_id -> auth_management.tenants(id) ON DELETE CASCADE
- approved_by -> auth_management.profiles(id) ON DELETE SET NULL
- based_on_content_id -> educational_content.teacher_contents(id) (self-ref)
- previous_version_id -> educational_content.teacher_contents(id) (self-ref)
**Indices:** `idx_teacher_contents_teacher`, `idx_teacher_contents_published`, `idx_teacher_contents_type`, `idx_teacher_contents_shared`, `idx_teacher_contents_featured`, `idx_teacher_contents_pending`, `idx_teacher_contents_classroom_search`, `idx_teacher_contents_tags` (GIN), `idx_teacher_contents_keywords` (GIN), `idx_teacher_contents_target_classrooms` (GIN), `idx_teacher_contents_metadata` (GIN)
**Trigger:** `trg_teacher_contents_updated_at` (auto-set published_at, update times_assigned)
**Entity:** `TeacherContent` -- soporta ResourceSharingPanel del Teacher Portal

---

### Tablas de Recursos (ResourceSharingPanel)

> **Nota (2026-02-21):** Estas 3 tablas soportan el feature ResourceSharingPanel del Teacher Portal, permitiendo a docentes calificar, comentar y trackear descargas de contenido educativo compartido.

### educational_content.resource_ratings [DDL-ACCURATE]
Calificaciones de maestros para recursos compartidos (teacher_contents). Cada maestro puede calificar un recurso una sola vez (restriccion UNIQUE). Las calificaciones son de 1 a 5 estrellas. Alimenta el campo teacher_rating de la tabla teacher_contents.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/28-resource_ratings.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| resource_id | UUID | NOT NULL | - | FK educational_content.teacher_contents(id) ON DELETE CASCADE |
| teacher_id | UUID | NOT NULL | - | FK auth_management.profiles(id) ON DELETE CASCADE |
| rating | SMALLINT | NOT NULL | - | Calificacion entre 1 y 5 |
| created_at | TIMESTAMPTZ | NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NULL | NOW() | - |

**Primary Key:** id
**Unique:** (resource_id, teacher_id)
**Foreign Keys:**
- resource_id -> educational_content.teacher_contents(id) ON DELETE CASCADE
- teacher_id -> auth_management.profiles(id) ON DELETE CASCADE
**Checks:** `rating BETWEEN 1 AND 5`
**Indices:** `idx_resource_ratings_resource_id`, `idx_resource_ratings_teacher_id`
**Entity:** `ResourceRating`

---

### educational_content.resource_comments [DDL-ACCURATE]
Comentarios de maestros sobre recursos compartidos (teacher_contents). Soporta borrado logico mediante el campo is_deleted para moderacion sin perder historial. Los comentarios son ordenables por fecha de creacion.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/29-resource_comments.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| resource_id | UUID | NOT NULL | - | FK educational_content.teacher_contents(id) ON DELETE CASCADE |
| author_id | UUID | NOT NULL | - | FK auth_management.profiles(id) ON DELETE CASCADE |
| text | TEXT | NOT NULL | - | Contenido del comentario |
| is_deleted | BOOLEAN | NULL | false | Borrado logico para moderacion |
| created_at | TIMESTAMPTZ | NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NULL | NOW() | - |

**Primary Key:** id
**Foreign Keys:**
- resource_id -> educational_content.teacher_contents(id) ON DELETE CASCADE
- author_id -> auth_management.profiles(id) ON DELETE CASCADE
**Indices:** `idx_resource_comments_resource_id`, `idx_resource_comments_author_id`, `idx_resource_comments_created_at` (DESC)
**Entity:** `ResourceComment`

---

### educational_content.resource_downloads [DDL-ACCURATE]
Registro de descargas de recursos compartidos (teacher_contents). Tabla de solo insercion (event-log inmutable) -- no tiene columna updated_at ni trigger. Permite rastrear quienes descargaron cada recurso y cuando. Alimenta el campo times_assigned de teacher_contents.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/30-resource_downloads.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| resource_id | UUID | NOT NULL | - | FK educational_content.teacher_contents(id) ON DELETE CASCADE |
| downloaded_by | UUID | NOT NULL | - | FK auth_management.profiles(id) ON DELETE CASCADE |
| downloaded_at | TIMESTAMPTZ | NULL | NOW() | Timestamp de la descarga |

**Primary Key:** id
**Foreign Keys:**
- resource_id -> educational_content.teacher_contents(id) ON DELETE CASCADE
- downloaded_by -> auth_management.profiles(id) ON DELETE CASCADE
**Indices:** `idx_resource_downloads_resource_id`, `idx_resource_downloads_downloaded_by`
**Nota:** Tabla INSERT-only (event-log inmutable). Sin columna updated_at. Sin trigger de updated_at.
**Entity:** `ResourceDownload`

---

### Tablas Cross-Schema

### educational_content.classroom_modules [DDL-ACCURATE]
Asignacion y configuracion de modulos educativos a aulas especificas. Permite personalizar configuracion de modulo por aula (intentos, puntaje de paso, prerequisitos).

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/_cross_schema/23-classroom_modules.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| classroom_id | UUID | NOT NULL | - | FK social_features.classrooms(id) ON DELETE CASCADE |
| module_id | UUID | NOT NULL | - | FK educational_content.modules(id) ON DELETE CASCADE |
| assigned_date | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de asignacion |
| assigned_by | UUID | NULL | NULL | FK auth_management.profiles(id) ON DELETE SET NULL |
| due_date | DATE | NULL | NULL | Fecha limite para completar el modulo |
| is_active | BOOLEAN | NOT NULL | true | Asignacion activa |
| display_order | INTEGER | NULL | 0 | Orden de presentacion en el aula |
| settings | JSONB | NULL | '{}' | Configuracion del modulo para el aula (retries, attempts, unlock_date, prerequisites, etc.) |
| custom_passing_score | INTEGER | NULL | NULL | Puntaje minimo de aprobacion personalizado para este aula (0-100) |
| time_limit_minutes | INTEGER | NULL | NULL | Limite de tiempo personalizado para el aula |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Primary Key:** id
**Foreign Keys:**
- classroom_id -> social_features.classrooms(id) ON DELETE CASCADE
- module_id -> educational_content.modules(id) ON DELETE CASCADE
- assigned_by -> auth_management.profiles(id) ON DELETE SET NULL
**Unique:** (classroom_id, module_id)
**Indices:** `idx_classroom_modules_classroom`, `idx_classroom_modules_module`, `idx_classroom_modules_classroom_order`, `idx_classroom_modules_due_date`, `idx_classroom_modules_assigned_by`
**RLS:** Habilitado (teacher access, student view, admin access)
**Trigger:** `trg_classroom_modules_updated_at`
**Entity:** `ClassroomModule` (`apps/backend/src/modules/educational/entities/classroom-module.entity.ts`)

---

### educational_content.media_attachments [DDL-ACCURATE]
Archivos multimedia adjuntos a ejercicios creativos de los Modulos 4 (Digital) y 5 (Produccion). Soporta imagenes, videos, audio y documentos subidos por estudiantes o docentes.

**Schema:** educational_content
**DDL:** `schemas/educational_content/tables/_cross_schema/09-media_attachments.sql`

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| submission_id | UUID | NULL | NULL | FK progress_tracking.exercise_submissions(id) ON DELETE CASCADE |
| exercise_id | UUID | NULL | NULL | FK educational_content.exercises(id) ON DELETE CASCADE |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles(id) ON DELETE CASCADE -- quien subio el archivo |
| file_name | VARCHAR(255) | NOT NULL | - | Nombre del archivo |
| file_path | TEXT | NOT NULL | - | Ruta relativa desde uploads/ en el servidor |
| file_type | VARCHAR(50) | NOT NULL | - | Tipo: image, video, audio, document |
| file_size | BIGINT | NOT NULL | - | Tamano del archivo en bytes |
| mime_type | VARCHAR(100) | NOT NULL | - | MIME type (ej: video/mp4, image/jpeg) |
| duration_seconds | INTEGER | NULL | NULL | Duracion en segundos (audio/video) |
| width | INTEGER | NULL | NULL | Ancho en pixeles (imagen/video) |
| height | INTEGER | NULL | NULL | Alto en pixeles (imagen/video) |
| thumbnail_path | TEXT | NULL | NULL | Ruta a thumbnail generado automaticamente |
| is_processed | BOOLEAN | NULL | false | Si el archivo fue procesado (thumbnail, transcodificacion) |
| processing_error | TEXT | NULL | NULL | Error de procesamiento si aplica |
| uploaded_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha y hora de subida |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Foreign Keys:**
- submission_id -> progress_tracking.exercise_submissions(id) ON DELETE CASCADE
- exercise_id -> educational_content.exercises(id) ON DELETE CASCADE
- user_id -> auth_management.profiles(id) ON DELETE CASCADE
**Indices:** `idx_media_attachments_submission`, `idx_media_attachments_exercise`, `idx_media_attachments_user`, `idx_media_attachments_type`
**Entity:** `MediaAttachment` (`apps/backend/src/modules/educational/entities/media-attachment.entity.ts`)
