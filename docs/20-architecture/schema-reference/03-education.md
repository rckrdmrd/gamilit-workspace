# Schema 3: education (13 tablas, 42 RLS policies)

> **Nota:** Este documento describe el modelo conceptual. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

### education.educational_modules
Los 5 modulos educativos del sistema.

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

### education.module_progress
Progreso del estudiante en cada modulo.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| module_id | UUID | NOT NULL | - | FK education.educational_modules |
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

### education.exercises
Catalogo de ejercicios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| module_id | UUID | NOT NULL | - | FK education.educational_modules |
| type | exercise_type | NOT NULL | - | Uno de 23 tipos |
| title | VARCHAR(200) | NOT NULL | - | Titulo del ejercicio |
| description | TEXT | NULL | NULL | Descripcion |
| instructions | TEXT | NOT NULL | - | Instrucciones |
| difficulty | difficulty_level | NOT NULL | 'medium' | Dificultad |
| content_id | UUID | NULL | NULL | FK education.contents |
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

### education.exercise_types
Definicion de los 23 tipos de ejercicio.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| type | exercise_type | NOT NULL | - | Tipo (ENUM) |
| name | VARCHAR(100) | NOT NULL | - | Nombre legible |
| module_id | UUID | NOT NULL | - | FK education.educational_modules |
| description | TEXT | NULL | NULL | Descripcion del tipo |
| evaluation_mode | exercise_evaluation_mode | NOT NULL | - | Modo de evaluacion |
| schema_definition | JSONB | NOT NULL | '{}' | Schema del exercise_data |
| ui_component | VARCHAR(100) | NOT NULL | - | Componente frontend |
| is_active | BOOLEAN | NOT NULL | true | Tipo activo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `ExerciseType`
**RLS:** NO (catalogo global, 23 registros)

---

### education.exercise_attempts
Intentos de ejercicio por estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| exercise_id | UUID | NOT NULL | - | FK education.exercises |
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

### education.exercise_results
Resultados evaluados de ejercicios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| attempt_id | UUID | NOT NULL | - | FK education.exercise_attempts |
| student_id | UUID | NOT NULL | - | FK auth.users |
| exercise_id | UUID | NOT NULL | - | FK education.exercises |
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

### education.exercise_feedback
Retroalimentacion generada por el evaluador.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| result_id | UUID | NOT NULL | - | FK education.exercise_results |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| feedback_text | TEXT | NOT NULL | - | Texto de retroalimentacion |
| suggestions | JSONB | NULL | '[]' | Sugerencias de mejora |
| correct_answers | JSONB | NULL | NULL | Respuestas correctas |
| hints | JSONB | NULL | '[]' | Pistas para proximos intentos |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `ExerciseFeedback`

---

### education.contents
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
| category_id | UUID | NULL | NULL | FK education.content_categories |
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

### education.content_versions
Versionado de contenido educativo.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| content_id | UUID | NOT NULL | - | FK education.contents |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| version_number | INTEGER | NOT NULL | 1 | Numero de version |
| body | TEXT | NOT NULL | - | Contenido de esta version |
| change_summary | VARCHAR(500) | NULL | NULL | Resumen del cambio |
| created_by | UUID | NOT NULL | - | FK auth.users |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `ContentVersion`

---

### education.content_categories
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

### education.content_tags
Tags para busqueda de contenido.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(50) | NOT NULL | - | Nombre del tag |
| slug | VARCHAR(50) | NOT NULL | - | Slug unico |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global)

---

### education.reading_assignments
Asignaciones de lectura a aulas/estudiantes.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| content_id | UUID | NOT NULL | - | FK education.contents |
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

### education.spaced_repetition
Motor de repeticion espaciada.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| exercise_id | UUID | NOT NULL | - | FK education.exercises |
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
