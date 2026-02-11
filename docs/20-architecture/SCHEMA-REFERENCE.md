# Schema Reference - GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-02-07
**Database:** gamilit_platform
**Engine:** PostgreSQL 16
**ORM:** TypeORM 0.3.x

---

## Resumen

| Metrica | Valor |
|---------|-------|
| Schemas | 18 (16 activos + 2 placeholder) |
| Tablas | 171 |
| Views | 13 |
| Materialized Views | 7 |
| Functions | 128 |
| Triggers | 49 |
| RLS Policies | 282 |
| Foreign Keys | 299 |
| ENUMs | 36 |

> **Complementario a:** [MODELO-DATOS.md](MODELO-DATOS.md) (vision conceptual) y `orchestration/inventory/DATABASE_INVENTORY.yml` (inventario operativo).

---

## Convenciones

### Columnas Comunes (BaseEntity)
Todas las tablas incluyen las siguientes columnas base (excepto tablas de catalogo/lookup):

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | Primary key |
| tenant_id | UUID | NOT NULL | - | FK a tenants.tenants (si aplica RLS) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de creacion |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | Ultima modificacion (trigger tr_updated_at) |
| deleted_at | TIMESTAMPTZ | NULL | NULL | Soft delete (trigger tr_soft_delete) |

### Nomenclatura
- Tablas: `snake_case` plural (e.g., `users`, `xp_transactions`)
- Columnas: `snake_case` (e.g., `tenant_id`, `created_at`)
- ENUMs: `snake_case` (e.g., `user_role`, `difficulty_level`)
- Foreign keys: `fk_{tabla_origen}_{tabla_destino}`
- Indices: `idx_{tabla}_{columnas}`
- Policies RLS: `{tabla}_{operacion}_policy` o `tenant_isolation_{operacion}`

### Tipos JSONB
Columnas marcadas con tipo JSONB almacenan datos flexibles segun el tipo de registro (e.g., submission_data en exercise_attempts varia segun exercise_type).

---

## Schema 1: auth (8 tablas, 24 RLS policies)

### auth.users
Usuarios del sistema en todos los roles.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| email | VARCHAR(255) | NOT NULL | - | Email unico por tenant |
| password_hash | VARCHAR(255) | NOT NULL | - | bcrypt hash |
| first_name | VARCHAR(100) | NOT NULL | - | Nombre |
| last_name | VARCHAR(100) | NOT NULL | - | Apellido |
| role | user_role | NOT NULL | 'student' | Rol principal |
| is_active | BOOLEAN | NOT NULL | true | Cuenta activa |
| email_verified | BOOLEAN | NOT NULL | false | Email verificado |
| avatar_url | VARCHAR(500) | NULL | NULL | URL de avatar |
| last_login_at | TIMESTAMPTZ | NULL | NULL | Ultimo login |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| deleted_at | TIMESTAMPTZ | NULL | NULL | Soft delete |

**Indices:** `idx_users_email_tenant` UNIQUE (email, tenant_id), `idx_users_role`, `idx_users_active`
**Entity:** `User`
**RLS:** 4 policies (SELECT, INSERT, UPDATE, DELETE por tenant_id)

---

### auth.user_profiles
Perfiles extendidos segun rol.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| display_name | VARCHAR(100) | NULL | NULL | Nombre de display |
| bio | TEXT | NULL | NULL | Biografia |
| grade_level | INTEGER | NULL | NULL | Grado escolar (estudiantes) |
| school_id | VARCHAR(50) | NULL | NULL | Matricula escolar |
| phone | VARCHAR(20) | NULL | NULL | Telefono |
| profile_data | JSONB | NULL | '{}' | Datos adicionales por rol |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `UserProfile`

---

### auth.user_preferences
Preferencias de usuario (idioma, notificaciones, accesibilidad).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| language | VARCHAR(5) | NOT NULL | 'es' | Idioma preferido |
| font_size | VARCHAR(10) | NOT NULL | 'medium' | Tamano de fuente |
| high_contrast | BOOLEAN | NOT NULL | false | Modo alto contraste |
| text_to_speech | BOOLEAN | NOT NULL | false | Texto a voz activo |
| notification_email | BOOLEAN | NOT NULL | true | Notificaciones email |
| notification_push | BOOLEAN | NOT NULL | true | Notificaciones push |
| notification_sms | BOOLEAN | NOT NULL | false | Notificaciones SMS |
| preferences_data | JSONB | NULL | '{}' | Preferencias adicionales |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `UserPreference`

---

### auth.sessions
Sesiones activas del usuario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| token_hash | VARCHAR(255) | NOT NULL | - | Hash del access token |
| ip_address | INET | NULL | NULL | IP de conexion |
| user_agent | TEXT | NULL | NULL | User agent |
| device_info | JSONB | NULL | '{}' | Info del dispositivo |
| expires_at | TIMESTAMPTZ | NOT NULL | - | Expiracion |
| is_active | BOOLEAN | NOT NULL | true | Sesion activa |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `Session`

---

### auth.refresh_tokens
Tokens de refresco para renovar access tokens.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| token_hash | VARCHAR(255) | NOT NULL | - | Hash del refresh token |
| expires_at | TIMESTAMPTZ | NOT NULL | - | Expiracion (7 dias default) |
| is_revoked | BOOLEAN | NOT NULL | false | Token revocado |
| revoked_at | TIMESTAMPTZ | NULL | NULL | Fecha de revocacion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `RefreshToken`

---

### auth.oauth_connections
Conexiones con proveedores OAuth externos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| provider | VARCHAR(50) | NOT NULL | - | Proveedor (google, etc.) |
| provider_user_id | VARCHAR(255) | NOT NULL | - | ID en el proveedor |
| access_token | TEXT | NULL | NULL | Token de acceso (encriptado) |
| refresh_token | TEXT | NULL | NULL | Refresh token (encriptado) |
| token_expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion del token |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `OAuthConnection`

---

### auth.password_resets
Solicitudes de reseteo de contrasena.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| token_hash | VARCHAR(255) | NOT NULL | - | Hash del token de reset |
| expires_at | TIMESTAMPTZ | NOT NULL | - | Expiracion (1 hora) |
| used_at | TIMESTAMPTZ | NULL | NULL | Fecha de uso |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### auth.login_attempts
Registro de intentos de login para seguridad.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| email | VARCHAR(255) | NOT NULL | - | Email intentado |
| tenant_id | UUID | NULL | NULL | Tenant (si identificable) |
| ip_address | INET | NOT NULL | - | IP de origen |
| success | BOOLEAN | NOT NULL | - | Intento exitoso |
| failure_reason | VARCHAR(100) | NULL | NULL | Razon de fallo |
| user_agent | TEXT | NULL | NULL | User agent |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

## Schema 2: tenants (4 tablas, 12 RLS policies)

### tenants.tenants
Registro de escuelas/instituciones (tenants).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(200) | NOT NULL | - | Nombre de la escuela |
| slug | VARCHAR(100) | NOT NULL | - | Slug unico |
| domain | VARCHAR(255) | NULL | NULL | Dominio personalizado |
| logo_url | VARCHAR(500) | NULL | NULL | Logo de la escuela |
| is_active | BOOLEAN | NOT NULL | true | Tenant activo |
| plan | subscription_plan | NOT NULL | 'free' | Plan de suscripcion |
| max_students | INTEGER | NOT NULL | 100 | Limite de estudiantes |
| metadata | JSONB | NULL | '{}' | Datos adicionales |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| deleted_at | TIMESTAMPTZ | NULL | NULL | Soft delete |

**Indices:** `idx_tenants_slug` UNIQUE, `idx_tenants_domain` UNIQUE
**Entity:** `Tenant`
**RLS:** NO (tabla global consultada por RLS context)

---

### tenants.tenant_settings
Configuracion especifica por tenant.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| gamification_enabled | BOOLEAN | NOT NULL | true | Gamificacion activa |
| leaderboard_enabled | BOOLEAN | NOT NULL | true | Leaderboards activos |
| store_enabled | BOOLEAN | NOT NULL | true | Tienda activa |
| missions_enabled | BOOLEAN | NOT NULL | true | Misiones activas |
| social_enabled | BOOLEAN | NOT NULL | false | Social activo |
| parent_portal_enabled | BOOLEAN | NOT NULL | true | Portal padres activo |
| custom_branding | JSONB | NULL | '{}' | Branding personalizado |
| settings_data | JSONB | NULL | '{}' | Configuracion adicional |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `TenantSettings`

---

### tenants.tenant_subscriptions
Planes y suscripciones de tenants.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| plan | subscription_plan | NOT NULL | - | Plan actual |
| starts_at | TIMESTAMPTZ | NOT NULL | NOW() | Inicio de suscripcion |
| ends_at | TIMESTAMPTZ | NULL | NULL | Fin (null = indefinido) |
| is_active | BOOLEAN | NOT NULL | true | Suscripcion activa |
| payment_data | JSONB | NULL | '{}' | Datos de pago |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `TenantSubscription`

---

### tenants.tenant_members
Relacion usuario-tenant (permite multi-tenant por usuario).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| user_id | UUID | NOT NULL | - | FK auth.users |
| role | user_role | NOT NULL | - | Rol en este tenant |
| is_primary | BOOLEAN | NOT NULL | true | Tenant principal |
| joined_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de union |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_tenant_members_unique` UNIQUE (tenant_id, user_id)
**Entity:** `TenantMember`

---

## Schema 3: education (13 tablas, 42 RLS policies)

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

---

## Schema 4: gamification (8 tablas, 38 RLS policies)

### gamification.xp_transactions
Historial de transacciones XP (append-only, inmutable).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| amount | INTEGER | NOT NULL | - | Cantidad de XP (positivo) |
| source | xp_source_type | NOT NULL | - | Fuente (exercise, mission, achievement, bonus, streak) |
| source_id | UUID | NULL | NULL | ID del recurso fuente |
| multiplier | NUMERIC(3,1) | NOT NULL | 1.0 | Multiplicador aplicado |
| base_amount | INTEGER | NOT NULL | - | Monto antes de multiplicador |
| description | VARCHAR(200) | NULL | NULL | Descripcion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_xp_student_date` (student_id, created_at), `idx_xp_source`
**Entity:** `XpTransaction`
**Trigger:** tr_xp_transaction_created (actualiza student_gamification, check level/rank)

---

### gamification.levels
Definicion de niveles del sistema.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| number | INTEGER | NOT NULL | - | Numero de nivel |
| name | VARCHAR(100) | NOT NULL | - | Nombre del nivel |
| xp_required | INTEGER | NOT NULL | - | XP minimo para alcanzar |
| rank_type | rank_type | NOT NULL | - | Rango maya asociado |
| icon_url | VARCHAR(500) | NULL | NULL | Icono del nivel |
| benefits | JSONB | NULL | '{}' | Beneficios desbloqueados |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global)
**Entity:** `Level`

---

### gamification.rank_definitions
Definicion de los 5 rangos maya.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| type | rank_type | NOT NULL | - | ahkin, nacom, batab, halach_uinik, ajaw |
| name | VARCHAR(50) | NOT NULL | - | Nombre completo |
| display_name | VARCHAR(100) | NOT NULL | - | Nombre para mostrar |
| description | TEXT | NULL | NULL | Descripcion del rango |
| min_xp | INTEGER | NOT NULL | - | XP minimo |
| max_xp | INTEGER | NULL | NULL | XP maximo (null para ultimo) |
| icon_url | VARCHAR(500) | NOT NULL | - | Icono del rango |
| frame_url | VARCHAR(500) | NULL | NULL | Marco de avatar |
| benefits | JSONB | NULL | '{}' | Beneficios del rango |
| sort_order | INTEGER | NOT NULL | - | Orden jerarquico |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global, 5 registros)
**Entity:** `RankDefinition`

---

### gamification.student_gamification
Estado actual de gamificacion por estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| total_xp | INTEGER | NOT NULL | 0 | XP total acumulado |
| current_level | INTEGER | NOT NULL | 1 | Nivel actual |
| current_rank | rank_type | NOT NULL | 'ahkin' | Rango maya actual |
| ml_coins_balance | INTEGER | NOT NULL | 0 | Saldo ML Coins |
| total_ml_coins_earned | INTEGER | NOT NULL | 0 | Total ML Coins ganados |
| total_ml_coins_spent | INTEGER | NOT NULL | 0 | Total ML Coins gastados |
| achievements_count | INTEGER | NOT NULL | 0 | Logros desbloqueados |
| exercises_completed | INTEGER | NOT NULL | 0 | Ejercicios completados |
| current_streak | INTEGER | NOT NULL | 0 | Racha actual (dias) |
| longest_streak | INTEGER | NOT NULL | 0 | Racha mas larga |
| last_activity_at | TIMESTAMPTZ | NULL | NULL | Ultima actividad |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_student_gam_unique` UNIQUE (student_id, tenant_id), `idx_student_gam_rank`, `idx_student_gam_xp`
**Entity:** `StudentGamification`

---

### gamification.gamification_config
Parametros configurables de gamificacion por tenant.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| xp_base_exercise | INTEGER | NOT NULL | 10 | XP base por ejercicio |
| xp_multiplier_easy | NUMERIC(3,1) | NOT NULL | 1.0 | Multiplicador facil |
| xp_multiplier_medium | NUMERIC(3,1) | NOT NULL | 1.5 | Multiplicador medio |
| xp_multiplier_hard | NUMERIC(3,1) | NOT NULL | 2.0 | Multiplicador dificil |
| xp_multiplier_expert | NUMERIC(3,1) | NOT NULL | 3.0 | Multiplicador experto |
| streak_bonus_multiplier | NUMERIC(3,2) | NOT NULL | 0.10 | Bonus por racha (+10% por dia) |
| streak_bonus_max | NUMERIC(3,1) | NOT NULL | 2.0 | Maximo bonus de racha |
| daily_xp_limit | INTEGER | NOT NULL | 500 | Limite diario XP |
| ml_coins_per_exercise | INTEGER | NOT NULL | 5 | ML Coins base por ejercicio |
| config_data | JSONB | NULL | '{}' | Configuracion adicional |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `GamificationConfig`

---

### gamification.xp_multipliers
Multiplicadores activos por estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| multiplier_type | VARCHAR(50) | NOT NULL | - | Tipo de multiplicador |
| value | NUMERIC(3,1) | NOT NULL | - | Valor del multiplicador |
| source | VARCHAR(100) | NOT NULL | - | Origen (item, event, streak) |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion |
| is_active | BOOLEAN | NOT NULL | true | Activo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### gamification.daily_xp_limits
Control anti-abuse de XP diario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| date | DATE | NOT NULL | CURRENT_DATE | Fecha |
| xp_earned | INTEGER | NOT NULL | 0 | XP ganado hoy |
| limit_reached | BOOLEAN | NOT NULL | false | Limite alcanzado |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_daily_xp_student_date` UNIQUE (student_id, date, tenant_id)

---

### gamification.streak_records
Registro de rachas de dias consecutivos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| streak_start | DATE | NOT NULL | - | Inicio de la racha |
| streak_end | DATE | NULL | NULL | Fin de la racha (null = activa) |
| days_count | INTEGER | NOT NULL | 1 | Dias consecutivos |
| status | streak_status | NOT NULL | 'active' | Estado (active, broken, completed) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `StreakRecord`

---

## Schema 5: social (7 tablas, 22 RLS policies)

### social.teams
Equipos de estudiantes.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| classroom_id | UUID | NOT NULL | - | FK classrooms.classrooms |
| name | VARCHAR(100) | NOT NULL | - | Nombre del equipo |
| description | TEXT | NULL | NULL | Descripcion |
| avatar_url | VARCHAR(500) | NULL | NULL | Avatar del equipo |
| max_members | INTEGER | NOT NULL | 5 | Maximo de miembros |
| status | team_status | NOT NULL | 'active' | Estado |
| created_by | UUID | NOT NULL | - | FK auth.users |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `Team`

---

### social.team_members
Miembros de cada equipo.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| team_id | UUID | NOT NULL | - | FK social.teams |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| role | VARCHAR(20) | NOT NULL | 'member' | Rol (leader, member) |
| joined_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de union |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `TeamMember`

---

### social.social_interactions
Reacciones y likes entre usuarios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| target_type | VARCHAR(50) | NOT NULL | - | Tipo de objetivo (achievement, post, etc.) |
| target_id | UUID | NOT NULL | - | ID del objetivo |
| interaction_type | interaction_type | NOT NULL | - | like, reaction, comment, share |
| data | JSONB | NULL | '{}' | Datos adicionales |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### social.social_feed
Feed de actividad social del aula.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| classroom_id | UUID | NOT NULL | - | FK classrooms.classrooms |
| user_id | UUID | NOT NULL | - | FK auth.users |
| event_type | VARCHAR(50) | NOT NULL | - | Tipo de evento |
| title | VARCHAR(200) | NOT NULL | - | Titulo |
| description | TEXT | NULL | NULL | Descripcion |
| metadata | JSONB | NULL | '{}' | Datos adicionales |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### social.team_challenges
Retos entre equipos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| team_a_id | UUID | NOT NULL | - | FK social.teams |
| team_b_id | UUID | NOT NULL | - | FK social.teams |
| exercise_id | UUID | NULL | NULL | FK education.exercises |
| status | VARCHAR(20) | NOT NULL | 'pending' | Estado |
| winner_team_id | UUID | NULL | NULL | FK social.teams (ganador) |
| team_a_score | NUMERIC(5,2) | NULL | NULL | Puntaje equipo A |
| team_b_score | NUMERIC(5,2) | NULL | NULL | Puntaje equipo B |
| started_at | TIMESTAMPTZ | NULL | NULL | Inicio |
| ended_at | TIMESTAMPTZ | NULL | NULL | Fin |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### social.forum_posts
Posts de foro por aula.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| classroom_id | UUID | NOT NULL | - | FK classrooms.classrooms |
| author_id | UUID | NOT NULL | - | FK auth.users |
| title | VARCHAR(200) | NOT NULL | - | Titulo |
| body | TEXT | NOT NULL | - | Contenido |
| is_pinned | BOOLEAN | NOT NULL | false | Fijado |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| deleted_at | TIMESTAMPTZ | NULL | NULL | Soft delete |

---

### social.forum_replies
Respuestas a posts de foro.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| post_id | UUID | NOT NULL | - | FK social.forum_posts |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| author_id | UUID | NOT NULL | - | FK auth.users |
| body | TEXT | NOT NULL | - | Contenido |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| deleted_at | TIMESTAMPTZ | NULL | NULL | Soft delete |

---

## Schema 6: classrooms (7 tablas, 28 RLS policies)

### classrooms.classrooms
Aulas registradas en el sistema.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| name | VARCHAR(100) | NOT NULL | - | Nombre del aula |
| code | VARCHAR(20) | NOT NULL | - | Codigo unico del aula |
| grade_level | INTEGER | NOT NULL | - | Grado escolar |
| section | VARCHAR(10) | NULL | NULL | Seccion (A, B, C) |
| academic_year | VARCHAR(10) | NOT NULL | - | Ciclo escolar |
| status | classroom_status | NOT NULL | 'active' | Estado |
| max_students | INTEGER | NOT NULL | 40 | Maximo estudiantes |
| settings | JSONB | NULL | '{}' | Configuracion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| deleted_at | TIMESTAMPTZ | NULL | NULL | Soft delete |

**Indices:** `idx_classrooms_code_tenant` UNIQUE (code, tenant_id)
**Entity:** `Classroom`

---

### classrooms.classroom_students
Relacion estudiante-aula.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| classroom_id | UUID | NOT NULL | - | FK classrooms.classrooms |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| enrolled_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de inscripcion |
| is_active | BOOLEAN | NOT NULL | true | Inscripcion activa |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_cls_student_unique` UNIQUE (classroom_id, student_id)

---

### classrooms.classroom_teachers
Relacion maestro-aula.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| classroom_id | UUID | NOT NULL | - | FK classrooms.classrooms |
| teacher_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| is_primary | BOOLEAN | NOT NULL | true | Maestro titular |
| assigned_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de asignacion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### classrooms.classroom_config
Configuracion especifica por aula.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| classroom_id | UUID | NOT NULL | - | FK classrooms.classrooms |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| gamification_enabled | BOOLEAN | NOT NULL | true | Gamificacion activa en aula |
| leaderboard_visible | BOOLEAN | NOT NULL | true | Leaderboard visible |
| exercise_time_limits | BOOLEAN | NOT NULL | true | Limites de tiempo activos |
| config_data | JSONB | NULL | '{}' | Configuracion adicional |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### classrooms.assignments
Asignaciones de ejercicios a aulas.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| classroom_id | UUID | NOT NULL | - | FK classrooms.classrooms |
| exercise_id | UUID | NOT NULL | - | FK education.exercises |
| assigned_by | UUID | NOT NULL | - | FK auth.users (teacher) |
| title | VARCHAR(200) | NOT NULL | - | Titulo de la asignacion |
| instructions | TEXT | NULL | NULL | Instrucciones adicionales |
| due_date | TIMESTAMPTZ | NULL | NULL | Fecha limite |
| status | assignment_status | NOT NULL | 'active' | Estado |
| max_attempts | INTEGER | NOT NULL | 3 | Intentos permitidos |
| is_graded | BOOLEAN | NOT NULL | true | Cuenta para calificacion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `Assignment`

---

### classrooms.assignment_submissions
Entregas de asignaciones.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| assignment_id | UUID | NOT NULL | - | FK classrooms.assignments |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| attempt_id | UUID | NULL | NULL | FK education.exercise_attempts |
| status | submission_status | NOT NULL | 'pending' | Estado |
| submitted_at | TIMESTAMPTZ | NULL | NULL | Fecha de entrega |
| score | NUMERIC(5,2) | NULL | NULL | Puntaje |
| feedback | TEXT | NULL | NULL | Retroalimentacion del maestro |
| reviewed_by | UUID | NULL | NULL | FK auth.users (reviewer) |
| reviewed_at | TIMESTAMPTZ | NULL | NULL | Fecha de revision |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `AssignmentSubmission`

---

### classrooms.school_periods
Ciclos escolares.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| name | VARCHAR(100) | NOT NULL | - | Nombre del periodo |
| starts_at | DATE | NOT NULL | - | Inicio |
| ends_at | DATE | NOT NULL | - | Fin |
| is_current | BOOLEAN | NOT NULL | false | Periodo actual |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

## Schema 7: analytics (5 tablas, 18 RLS policies)

### analytics.analytics_events
Eventos de tracking (event sourcing).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| user_id | UUID | NOT NULL | - | FK auth.users |
| event_type | VARCHAR(50) | NOT NULL | - | Tipo de evento |
| event_data | JSONB | NOT NULL | '{}' | Datos del evento |
| session_id | UUID | NULL | NULL | ID de sesion |
| ip_address | INET | NULL | NULL | IP |
| user_agent | VARCHAR(500) | NULL | NULL | User agent |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_analytics_events_type_date`, `idx_analytics_events_user`

---

### analytics.analytics_daily
Resumen diario por estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| date | DATE | NOT NULL | - | Fecha |
| exercises_completed | INTEGER | NOT NULL | 0 | Ejercicios completados |
| xp_earned | INTEGER | NOT NULL | 0 | XP ganado |
| time_spent_minutes | INTEGER | NOT NULL | 0 | Tiempo en plataforma |
| average_score | NUMERIC(5,2) | NULL | NULL | Puntaje promedio |
| sessions_count | INTEGER | NOT NULL | 0 | Numero de sesiones |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_analytics_daily_student_date` UNIQUE (student_id, date, tenant_id)

---

### analytics.analytics_weekly
Resumen semanal (agregado de daily).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| week_start | DATE | NOT NULL | - | Inicio de semana |
| week_end | DATE | NOT NULL | - | Fin de semana |
| exercises_completed | INTEGER | NOT NULL | 0 | Total ejercicios |
| xp_earned | INTEGER | NOT NULL | 0 | Total XP |
| time_spent_minutes | INTEGER | NOT NULL | 0 | Total tiempo |
| average_score | NUMERIC(5,2) | NULL | NULL | Promedio semanal |
| active_days | INTEGER | NOT NULL | 0 | Dias activos |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### analytics.analytics_monthly
Resumen mensual.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| month | DATE | NOT NULL | - | Primer dia del mes |
| exercises_completed | INTEGER | NOT NULL | 0 | Total ejercicios |
| xp_earned | INTEGER | NOT NULL | 0 | Total XP |
| time_spent_minutes | INTEGER | NOT NULL | 0 | Total tiempo |
| average_score | NUMERIC(5,2) | NULL | NULL | Promedio mensual |
| active_days | INTEGER | NOT NULL | 0 | Dias activos |
| modules_progress | JSONB | NULL | '{}' | Progreso por modulo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### analytics.engagement_metrics
Metricas agregadas de engagement (DAU, WAU, MAU).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| date | DATE | NOT NULL | - | Fecha |
| dau | INTEGER | NOT NULL | 0 | Daily Active Users |
| wau | INTEGER | NOT NULL | 0 | Weekly Active Users |
| mau | INTEGER | NOT NULL | 0 | Monthly Active Users |
| avg_session_minutes | NUMERIC(5,1) | NOT NULL | 0 | Sesion promedio |
| retention_d1 | NUMERIC(5,2) | NULL | NULL | Retention dia 1 |
| retention_d7 | NUMERIC(5,2) | NULL | NULL | Retention dia 7 |
| retention_d30 | NUMERIC(5,2) | NULL | NULL | Retention dia 30 |
| metrics_data | JSONB | NULL | '{}' | Metricas adicionales |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

## Schema 8: reports (4 tablas, 16 RLS policies)

### reports.report_templates
Templates predefinidos de reportes.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| name | VARCHAR(100) | NOT NULL | - | Nombre del template |
| type | VARCHAR(50) | NOT NULL | - | Tipo (student, classroom, school) |
| description | TEXT | NULL | NULL | Descripcion |
| template_data | JSONB | NOT NULL | '{}' | Definicion del template |
| format | report_format | NOT NULL | 'pdf' | Formato por defecto |
| is_active | BOOLEAN | NOT NULL | true | Template activo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### reports.report_instances
Instancias generadas de reportes.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| template_id | UUID | NOT NULL | - | FK reports.report_templates |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| generated_by | UUID | NOT NULL | - | FK auth.users |
| parameters | JSONB | NOT NULL | '{}' | Parametros usados |
| status | report_status | NOT NULL | 'pending' | Estado |
| result_data | JSONB | NULL | NULL | Datos del resultado |
| file_url | VARCHAR(500) | NULL | NULL | URL del archivo generado |
| error_message | TEXT | NULL | NULL | Error si fallo |
| started_at | TIMESTAMPTZ | NULL | NULL | Inicio de generacion |
| completed_at | TIMESTAMPTZ | NULL | NULL | Fin de generacion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### reports.report_schedules
Reportes programados automaticos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| template_id | UUID | NOT NULL | - | FK reports.report_templates |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| created_by | UUID | NOT NULL | - | FK auth.users |
| cron_expression | VARCHAR(50) | NOT NULL | - | Expresion cron |
| parameters | JSONB | NOT NULL | '{}' | Parametros del reporte |
| recipients | JSONB | NOT NULL | '[]' | Destinatarios (email) |
| is_active | BOOLEAN | NOT NULL | true | Schedule activo |
| last_run_at | TIMESTAMPTZ | NULL | NULL | Ultima ejecucion |
| next_run_at | TIMESTAMPTZ | NULL | NULL | Proxima ejecucion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### reports.report_exports
Archivos exportados de reportes.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| instance_id | UUID | NOT NULL | - | FK reports.report_instances |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| format | report_format | NOT NULL | - | Formato (pdf, excel, csv) |
| file_path | VARCHAR(500) | NOT NULL | - | Ruta del archivo |
| file_size_bytes | INTEGER | NOT NULL | 0 | Tamano en bytes |
| download_count | INTEGER | NOT NULL | 0 | Descargas |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion del archivo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

## Schema 9: notifications (5 tablas, 20 RLS policies)

### notifications.notification_templates
Templates de notificacion por evento.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| event_type | VARCHAR(50) | NOT NULL | - | Tipo de evento |
| channel | notification_channel | NOT NULL | - | Canal (in_app, email, push, sms) |
| subject_template | VARCHAR(200) | NOT NULL | - | Template del asunto |
| body_template | TEXT | NOT NULL | - | Template del cuerpo |
| is_active | BOOLEAN | NOT NULL | true | Template activo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### notifications.notification_queue
Cola de envio de notificaciones.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| user_id | UUID | NOT NULL | - | FK auth.users (destinatario) |
| channel | notification_channel | NOT NULL | - | Canal de envio |
| priority | notification_priority | NOT NULL | 'medium' | Prioridad |
| subject | VARCHAR(200) | NOT NULL | - | Asunto |
| body | TEXT | NOT NULL | - | Cuerpo |
| status | notification_status | NOT NULL | 'pending' | Estado |
| metadata | JSONB | NULL | '{}' | Metadatos |
| scheduled_at | TIMESTAMPTZ | NULL | NULL | Envio programado |
| sent_at | TIMESTAMPTZ | NULL | NULL | Fecha de envio |
| read_at | TIMESTAMPTZ | NULL | NULL | Fecha de lectura (in_app) |
| error_message | TEXT | NULL | NULL | Error si fallo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### notifications.notification_logs
Historial de envios completados.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| notification_id | UUID | NOT NULL | - | FK notifications.notification_queue |
| channel | notification_channel | NOT NULL | - | Canal usado |
| status | VARCHAR(20) | NOT NULL | - | sent, delivered, failed, bounced |
| provider_response | JSONB | NULL | '{}' | Respuesta del proveedor |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### notifications.notification_preferences
Preferencias de notificacion por usuario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| event_type | VARCHAR(50) | NOT NULL | - | Tipo de evento |
| in_app | BOOLEAN | NOT NULL | true | Recibir in-app |
| email | BOOLEAN | NOT NULL | true | Recibir email |
| push | BOOLEAN | NOT NULL | false | Recibir push |
| sms | BOOLEAN | NOT NULL | false | Recibir SMS |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### notifications.push_subscriptions
Suscripciones a push notifications.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| endpoint | TEXT | NOT NULL | - | Push endpoint |
| keys | JSONB | NOT NULL | '{}' | Push keys (p256dh, auth) |
| device_info | JSONB | NULL | '{}' | Info del dispositivo |
| is_active | BOOLEAN | NOT NULL | true | Suscripcion activa |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

## Schema 10: store (6 tablas, 18 RLS policies)

### store.store_items
Catalogo de items de la tienda virtual.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre del item |
| description | TEXT | NULL | NULL | Descripcion |
| type | store_item_type | NOT NULL | - | avatar, frame, background, powerup, effect, title |
| category_id | UUID | NULL | NULL | FK store.store_categories |
| price_ml_coins | INTEGER | NOT NULL | - | Precio en ML Coins |
| icon_url | VARCHAR(500) | NOT NULL | - | Icono |
| preview_url | VARCHAR(500) | NULL | NULL | Preview del item |
| duration_type | item_duration_type | NOT NULL | 'permanent' | permanent, temporary, single_use |
| duration_hours | INTEGER | NULL | NULL | Duracion (si temporary) |
| effect_data | JSONB | NULL | '{}' | Efecto del item |
| rank_required | rank_type | NULL | NULL | Rango minimo requerido |
| is_active | BOOLEAN | NOT NULL | true | Item activo |
| is_featured | BOOLEAN | NOT NULL | false | Item destacado |
| sort_order | INTEGER | NOT NULL | 0 | Orden |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `StoreItem`
**RLS:** NO (catalogo global)

---

### store.store_categories
Categorias de items.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(50) | NOT NULL | - | Nombre |
| slug | VARCHAR(50) | NOT NULL | - | Slug unico |
| icon_url | VARCHAR(500) | NULL | NULL | Icono |
| sort_order | INTEGER | NOT NULL | 0 | Orden |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global)

---

### store.store_purchases
Historial de compras.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| item_id | UUID | NOT NULL | - | FK store.store_items |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| price_paid | INTEGER | NOT NULL | - | ML Coins pagados |
| purchased_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de compra |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `StorePurchase`

---

### store.student_inventory
Items en posesion del estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| item_id | UUID | NOT NULL | - | FK store.store_items |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| is_equipped | BOOLEAN | NOT NULL | false | Item equipado |
| uses_remaining | INTEGER | NULL | NULL | Usos restantes (single_use) |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion (temporary) |
| acquired_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de adquisicion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `StudentInventory`

---

### store.ml_coin_transactions
Transacciones de ML Coins (append-only).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| amount | INTEGER | NOT NULL | - | Monto (positivo = earned, negativo = spent) |
| source | VARCHAR(50) | NOT NULL | - | Fuente (exercise, mission, purchase, admin) |
| source_id | UUID | NULL | NULL | ID del recurso fuente |
| description | VARCHAR(200) | NULL | NULL | Descripcion |
| balance_after | INTEGER | NOT NULL | - | Saldo despues de transaccion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `MlCoinTransaction`

---

### store.ml_coin_balances
Saldo actual de ML Coins por estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| balance | INTEGER | NOT NULL | 0 | Saldo actual |
| total_earned | INTEGER | NOT NULL | 0 | Total ganado |
| total_spent | INTEGER | NOT NULL | 0 | Total gastado |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_ml_balance_student_tenant` UNIQUE (student_id, tenant_id)

---

## Schema 11: missions (6 tablas, 16 RLS policies)

### missions.mission_definitions
Catalogo de misiones.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| type | mission_type | NOT NULL | - | daily, weekly, quest |
| name | VARCHAR(100) | NOT NULL | - | Nombre |
| description | TEXT | NOT NULL | - | Descripcion |
| icon_url | VARCHAR(500) | NULL | NULL | Icono |
| objective | JSONB | NOT NULL | '{}' | Objetivo (tipo, cantidad, condiciones) |
| xp_reward | INTEGER | NOT NULL | 0 | XP recompensa |
| ml_coins_reward | INTEGER | NOT NULL | 0 | ML Coins recompensa |
| bonus_rewards | JSONB | NULL | '{}' | Recompensas adicionales |
| difficulty | difficulty_level | NOT NULL | 'medium' | Dificultad |
| is_active | BOOLEAN | NOT NULL | true | Mision activa |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global)
**Entity:** `MissionDefinition`

---

### missions.mission_daily_rotation
Rotacion diaria de misiones.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| date | DATE | NOT NULL | - | Fecha |
| mission_ids | UUID[] | NOT NULL | - | IDs de misiones activas |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (global)

---

### missions.mission_weekly_rotation
Rotacion semanal de misiones.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| week_start | DATE | NOT NULL | - | Inicio de semana |
| mission_ids | UUID[] | NOT NULL | - | IDs de misiones activas |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (global)

---

### missions.mission_progress
Progreso de cada estudiante en misiones.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| mission_id | UUID | NOT NULL | - | FK missions.mission_definitions |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| progress | NUMERIC(5,2) | NOT NULL | 0 | Progreso (0-100%) |
| current_count | INTEGER | NOT NULL | 0 | Conteo actual |
| target_count | INTEGER | NOT NULL | - | Conteo objetivo |
| status | mission_status | NOT NULL | 'active' | Estado |
| started_at | TIMESTAMPTZ | NOT NULL | NOW() | Inicio |
| completed_at | TIMESTAMPTZ | NULL | NULL | Completado |
| claimed_at | TIMESTAMPTZ | NULL | NULL | Recompensa reclamada |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `MissionProgress`

---

### missions.quest_chains
Cadenas de quests especiales.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre de la cadena |
| description | TEXT | NULL | NULL | Descripcion |
| mission_ids | UUID[] | NOT NULL | - | Misiones en orden |
| total_xp_reward | INTEGER | NOT NULL | 0 | XP total al completar cadena |
| bonus_item_id | UUID | NULL | NULL | FK store.store_items (bonus) |
| is_active | BOOLEAN | NOT NULL | true | Quest activa |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global)

---

### missions.quest_progress
Progreso en cadenas de quests.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| quest_chain_id | UUID | NOT NULL | - | FK missions.quest_chains |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| current_step | INTEGER | NOT NULL | 0 | Paso actual |
| total_steps | INTEGER | NOT NULL | - | Total de pasos |
| status | quest_status | NOT NULL | 'in_progress' | Estado |
| started_at | TIMESTAMPTZ | NOT NULL | NOW() | Inicio |
| completed_at | TIMESTAMPTZ | NULL | NULL | Completado |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

## Schema 12: leaderboard (4 tablas, 12 RLS policies)

### leaderboard.leaderboard_entries
Entradas de ranking por estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| classroom_id | UUID | NULL | NULL | FK classrooms.classrooms |
| season_id | UUID | NULL | NULL | FK leaderboard.leaderboard_seasons |
| scope | VARCHAR(20) | NOT NULL | - | classroom, school, global |
| total_xp | INTEGER | NOT NULL | 0 | XP total en el scope |
| rank_position | INTEGER | NULL | NULL | Posicion actual |
| previous_position | INTEGER | NULL | NULL | Posicion anterior |
| exercises_completed | INTEGER | NOT NULL | 0 | Ejercicios completados |
| average_score | NUMERIC(5,2) | NULL | NULL | Puntaje promedio |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `LeaderboardEntry`

---

### leaderboard.leaderboard_seasons
Temporadas de leaderboard.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre de temporada |
| number | INTEGER | NOT NULL | - | Numero de temporada |
| starts_at | TIMESTAMPTZ | NOT NULL | - | Inicio |
| ends_at | TIMESTAMPTZ | NOT NULL | - | Fin |
| status | season_status | NOT NULL | 'upcoming' | upcoming, active, ended |
| rewards | JSONB | NULL | '{}' | Recompensas por posicion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (global)
**Entity:** `LeaderboardSeason`

---

### leaderboard.leaderboard_history
Historial de posiciones por snapshot.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| season_id | UUID | NOT NULL | - | FK leaderboard.leaderboard_seasons |
| scope | VARCHAR(20) | NOT NULL | - | classroom, school, global |
| position | INTEGER | NOT NULL | - | Posicion en ese momento |
| xp_total | INTEGER | NOT NULL | - | XP al momento |
| snapshot_date | TIMESTAMPTZ | NOT NULL | - | Fecha del snapshot |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### leaderboard.season_rewards
Recompensas distribuidas al final de temporada.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| season_id | UUID | NOT NULL | - | FK leaderboard.leaderboard_seasons |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| position | INTEGER | NOT NULL | - | Posicion final |
| scope | VARCHAR(20) | NOT NULL | - | Scope del leaderboard |
| xp_reward | INTEGER | NOT NULL | 0 | XP recompensa |
| ml_coins_reward | INTEGER | NOT NULL | 0 | ML Coins recompensa |
| item_id | UUID | NULL | NULL | FK store.store_items |
| claimed | BOOLEAN | NOT NULL | false | Reclamado |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

## Schema 13: content (3 tablas, 8 RLS policies)

### content.media_files
Archivos multimedia (imagenes, audio, video).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| file_name | VARCHAR(255) | NOT NULL | - | Nombre del archivo |
| file_path | VARCHAR(500) | NOT NULL | - | Ruta de almacenamiento |
| mime_type | VARCHAR(100) | NOT NULL | - | Tipo MIME |
| media_type | media_type | NOT NULL | - | image, audio, video, document |
| file_size_bytes | INTEGER | NOT NULL | 0 | Tamano |
| uploaded_by | UUID | NOT NULL | - | FK auth.users |
| metadata | JSONB | NULL | '{}' | Metadatos (dimensions, duration, etc.) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### content.media_categories
Categorias de archivos multimedia.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre |
| slug | VARCHAR(100) | NOT NULL | - | Slug |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global)

---

### content.content_libraries
Bibliotecas de contenido por tenant.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| name | VARCHAR(100) | NOT NULL | - | Nombre de la biblioteca |
| description | TEXT | NULL | NULL | Descripcion |
| is_public | BOOLEAN | NOT NULL | false | Accesible entre tenants |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

## Schema 14: parents (4 tablas, 14 RLS policies)

### parents.parent_profiles
Perfiles de padres/tutores.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| relationship | VARCHAR(50) | NOT NULL | 'parent' | Relacion (parent, tutor, guardian) |
| phone | VARCHAR(20) | NULL | NULL | Telefono |
| notification_preferences | JSONB | NULL | '{}' | Preferencias |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `ParentProfile`

---

### parents.parent_student_links
Vinculaciones padre-estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| parent_id | UUID | NOT NULL | - | FK auth.users |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| status | link_status | NOT NULL | 'active' | Estado |
| linked_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de vinculacion |
| linked_via | VARCHAR(50) | NOT NULL | 'code' | Metodo (code, admin) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_parent_student_unique` UNIQUE (parent_id, student_id, tenant_id)
**Entity:** `ParentStudentLink`

---

### parents.parent_notifications
Notificaciones especificas para padres.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| parent_id | UUID | NOT NULL | - | FK auth.users |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| event_type | VARCHAR(50) | NOT NULL | - | Tipo de evento |
| title | VARCHAR(200) | NOT NULL | - | Titulo |
| message | TEXT | NOT NULL | - | Mensaje |
| is_read | BOOLEAN | NOT NULL | false | Leida |
| read_at | TIMESTAMPTZ | NULL | NULL | Fecha de lectura |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### parents.link_codes
Codigos de vinculacion padre-estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| code | VARCHAR(10) | NOT NULL | - | Codigo alfanumerico |
| generated_by | UUID | NOT NULL | - | FK auth.users (teacher) |
| expires_at | TIMESTAMPTZ | NOT NULL | - | Expiracion (72 horas) |
| used | BOOLEAN | NOT NULL | false | Codigo usado |
| used_by | UUID | NULL | NULL | FK auth.users (padre que uso) |
| used_at | TIMESTAMPTZ | NULL | NULL | Fecha de uso |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_link_codes_code` UNIQUE (code)

---

## Schema 15: settings (3 tablas, 6 RLS policies)

### settings.system_settings
Configuracion global del sistema.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| key | VARCHAR(100) | NOT NULL | - | Clave de configuracion |
| value | JSONB | NOT NULL | '{}' | Valor |
| description | TEXT | NULL | NULL | Descripcion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_system_settings_key` UNIQUE (key)
**RLS:** NO (solo super_admin)

---

### settings.feature_flags
Feature flags por tenant.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| flag_name | VARCHAR(100) | NOT NULL | - | Nombre del flag |
| flag_type | feature_flag_type | NOT NULL | 'boolean' | Tipo |
| value | JSONB | NOT NULL | 'true' | Valor |
| description | TEXT | NULL | NULL | Descripcion |
| is_active | BOOLEAN | NOT NULL | true | Flag activo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_feature_flags_tenant_name` UNIQUE (tenant_id, flag_name)
**Entity:** `FeatureFlag`

---

### settings.gamification_params
Parametros ajustables de gamificacion (nivel sistema).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| param_key | VARCHAR(100) | NOT NULL | - | Clave del parametro |
| param_value | JSONB | NOT NULL | '{}' | Valor |
| category | VARCHAR(50) | NOT NULL | - | Categoria (xp, ranking, store, missions) |
| description | TEXT | NULL | NULL | Descripcion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

## Schema 16: audit (3 tablas, 14 RLS policies)

### audit.audit_logs
Registro de acciones criticas del sistema.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| user_id | UUID | NOT NULL | - | FK auth.users |
| action | audit_action | NOT NULL | - | create, update, delete, login, logout |
| entity_type | VARCHAR(100) | NOT NULL | - | Tipo de entidad |
| entity_id | UUID | NULL | NULL | ID de la entidad |
| old_values | JSONB | NULL | NULL | Valores anteriores |
| new_values | JSONB | NULL | NULL | Valores nuevos |
| ip_address | INET | NULL | NULL | IP |
| user_agent | TEXT | NULL | NULL | User agent |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_audit_entity`, `idx_audit_user_date`

---

### audit.data_changes
Historial detallado de cambios en datos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| table_name | VARCHAR(100) | NOT NULL | - | Tabla afectada |
| record_id | UUID | NOT NULL | - | ID del registro |
| operation | VARCHAR(10) | NOT NULL | - | INSERT, UPDATE, DELETE |
| changed_by | UUID | NULL | NULL | FK auth.users |
| old_data | JSONB | NULL | NULL | Datos anteriores |
| new_data | JSONB | NULL | NULL | Datos nuevos |
| changed_columns | TEXT[] | NULL | NULL | Columnas modificadas |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### audit.access_logs
Registro de acceso al sistema.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NULL | NULL | FK tenants.tenants |
| user_id | UUID | NULL | NULL | FK auth.users |
| endpoint | VARCHAR(500) | NOT NULL | - | Endpoint accedido |
| method | VARCHAR(10) | NOT NULL | - | HTTP method |
| status_code | INTEGER | NOT NULL | - | Codigo de respuesta |
| response_time_ms | INTEGER | NOT NULL | - | Tiempo de respuesta |
| ip_address | INET | NOT NULL | - | IP |
| user_agent | TEXT | NULL | NULL | User agent |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

## Schemas 17-18: Placeholder

### integrations (reservado)
Reservado para integraciones con sistemas externos (LMS, SIS, Google Classroom).

### billing (reservado)
Reservado para sistema de facturacion si se comercializa la plataforma.

---

## Materialized Views (7)

### leaderboard.classroom_rankings
```sql
CREATE MATERIALIZED VIEW leaderboard.classroom_rankings AS
SELECT
  le.student_id, le.classroom_id, le.tenant_id,
  le.total_xp, le.exercises_completed, le.average_score,
  ROW_NUMBER() OVER (PARTITION BY le.classroom_id ORDER BY le.total_xp DESC) AS position,
  u.first_name, u.last_name, u.avatar_url,
  sg.current_rank, sg.current_level
FROM leaderboard.leaderboard_entries le
JOIN auth.users u ON le.student_id = u.id
JOIN gamification.student_gamification sg ON le.student_id = sg.student_id
WHERE le.scope = 'classroom';
-- REFRESH: CONCURRENTLY cada 5 min
```

### leaderboard.school_rankings
Rankings por escuela (REFRESH: 15 min).

### analytics.student_daily_stats
Estadisticas diarias pre-calculadas (REFRESH: 1 hora).

### analytics.module_completion_rates
Tasa de completitud por modulo educativo (REFRESH: 1 hora).

### analytics.engagement_dashboard
Metricas de engagement consolidadas (REFRESH: 30 min).

### analytics.teacher_classroom_overview
Vista general para dashboard de maestro (REFRESH: 15 min).

### leaderboard.global_leaderboard
Ranking global entre todas las escuelas (REFRESH: 15 min).

---

## ENUMs (36)

| # | ENUM | Valores |
|---|------|---------|
| 1 | user_role | student, teacher, admin, parent, super_admin |
| 2 | educational_module_type | literal, inferential, critical, digital, production |
| 3 | exercise_type | crossword, timeline, fill_blanks, true_false, word_search, detective, hypothesis, prediction, context_puzzle, inference_wheel, opinion_court, digital_debate, source_analysis, argumentative_podcast, perspectives_matrix, fake_news_verifier, interactive_infographic, tiktok_quiz, hypertextual_navigation, meme_analysis, multimedia_diary, digital_comic, video_letter |
| 4 | difficulty_level | easy, medium, hard, expert |
| 5 | rank_type | ahkin, nacom, batab, halach_uinik, ajaw |
| 6 | xp_source_type | exercise, mission, achievement, bonus, streak |
| 7 | achievement_category | academic, consistency, social, exploration, secret |
| 8 | achievement_rarity | common, uncommon, rare, epic, legendary |
| 9 | store_item_type | avatar, frame, background, powerup, effect, title |
| 10 | item_duration_type | permanent, temporary, single_use |
| 11 | notification_channel | in_app, email, push, sms |
| 12 | notification_priority | low, medium, high, urgent |
| 13 | notification_status | pending, queued, sent, delivered, failed, read |
| 14 | mission_type | daily, weekly, quest |
| 15 | mission_status | active, completed, expired |
| 16 | quest_status | in_progress, completed, abandoned |
| 17 | interaction_type | like, reaction, comment, share |
| 18 | report_format | pdf, excel, csv |
| 19 | report_status | pending, generating, completed, failed |
| 20 | audit_action | create, update, delete, login, logout |
| 21 | content_status | draft, published, archived |
| 22 | assignment_status | active, completed, cancelled, expired |
| 23 | submission_status | pending, in_progress, submitted, evaluated, returned |
| 24 | review_status | pending, approved, rejected, revision_requested |
| 25 | season_status | upcoming, active, ended |
| 26 | team_status | active, inactive, disbanded |
| 27 | link_status | pending, active, revoked |
| 28 | subscription_plan | free, basic, premium, enterprise |
| 29 | feature_flag_type | boolean, percentage, user_list |
| 30 | exercise_evaluation_mode | automatic, semi_automatic, manual |
| 31 | score_quality | poor, average, good, excellent |
| 32 | streak_status | active, broken, completed |
| 33 | powerup_type | xp_boost, time_extension, hint, shield |
| 34 | powerup_status | available, active, used, expired |
| 35 | media_type | image, audio, video, document |
| 36 | classroom_status | active, inactive, archived |

---

## Indices de Referencia Rapida

### Indices Unicos Criticos
| Tabla | Columnas | Proposito |
|-------|----------|-----------|
| auth.users | (email, tenant_id) | Email unico por tenant |
| tenants.tenants | (slug) | Slug unico global |
| tenants.tenant_members | (tenant_id, user_id) | Un registro por usuario-tenant |
| education.module_progress | (student_id, module_id, tenant_id) | Un progreso por modulo |
| gamification.student_gamification | (student_id, tenant_id) | Un registro por estudiante |
| gamification.daily_xp_limits | (student_id, date, tenant_id) | Un limite por dia |
| analytics.analytics_daily | (student_id, date, tenant_id) | Un resumen por dia |
| store.ml_coin_balances | (student_id, tenant_id) | Un saldo por estudiante |
| parents.parent_student_links | (parent_id, student_id, tenant_id) | Una vinculacion |
| settings.feature_flags | (tenant_id, flag_name) | Un flag por nombre-tenant |
| classrooms.classrooms | (code, tenant_id) | Codigo unico por tenant |
| parents.link_codes | (code) | Codigo unico global |

### Indices de Performance
| Tabla | Columnas | Proposito |
|-------|----------|-----------|
| gamification.xp_transactions | (student_id, created_at) | Historial XP |
| education.exercise_attempts | (student_id, exercise_id) | Busqueda de intentos |
| analytics.analytics_events | (event_type, created_at) | Busqueda por tipo |
| leaderboard.leaderboard_entries | (tenant_id, scope, total_xp) | Rankings |

---

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Modelo conceptual | [MODELO-DATOS.md](MODELO-DATOS.md) |
| Inventario BD | orchestration/inventory/DATABASE_INVENTORY.yml |
| ADR Multi-tenancy | [ADR-003-RLS-MULTITENANCY.md](../90-adr/ADR-003-RLS-MULTITENANCY.md) |
| ADR Exercise Engine | [ADR-004-MODULAR-EXERCISE-ENGINE.md](../90-adr/ADR-004-MODULAR-EXERCISE-ENGINE.md) |
| User Stories | docs/10-requirements/user-stories/ |

---

*GAMILIT - Schema Reference*
*171 tablas | 18 schemas | 282 RLS policies | 36 ENUMs | PostgreSQL 16*
