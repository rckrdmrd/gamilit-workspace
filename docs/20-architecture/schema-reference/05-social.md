# Schema: social_features (30 tablas)

> **Nota:** Este documento describe el modelo conceptual basado en DDL. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/social_features/`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

## Instituciones y Aulas

### social_features.schools
Instituciones educativas - escuelas y colegios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants |
| name | TEXT | NOT NULL | - | Nombre de la escuela |
| code | TEXT | NULL | NULL | Codigo unico de la escuela |
| short_name | TEXT | NULL | NULL | Nombre corto |
| description | TEXT | NULL | NULL | Descripcion |
| address | TEXT | NULL | NULL | Direccion |
| city | TEXT | NULL | NULL | Ciudad |
| region | TEXT | NULL | NULL | Region/Estado |
| country | TEXT | NULL | 'Mexico' | Pais |
| postal_code | TEXT | NULL | NULL | Codigo postal |
| phone | TEXT | NULL | NULL | Telefono |
| email | TEXT | NULL | NULL | Email de contacto |
| website | TEXT | NULL | NULL | Sitio web |
| principal_id | UUID | NULL | NULL | FK auth_management.profiles (director) |
| administrative_contact_id | UUID | NULL | NULL | FK auth_management.profiles (contacto admin) |
| academic_year | TEXT | NULL | NULL | Ano academico |
| semester_system | BOOLEAN | NULL | true | Si usa sistema de semestres |
| grade_levels | TEXT[] | NULL | {'6','7','8'} | Niveles de grado |
| settings | JSONB | NULL | '{}' | Configuracion adicional |
| max_students | INTEGER | NULL | 1000 | Maximo de estudiantes |
| max_teachers | INTEGER | NULL | 100 | Maximo de profesores |
| current_students_count | INTEGER | NULL | 0 | Conteo actual de estudiantes |
| current_teachers_count | INTEGER | NULL | 0 | Conteo actual de profesores |
| is_active | BOOLEAN | NULL | true | Si esta activa |
| is_verified | BOOLEAN | NULL | false | Si esta verificada |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_schools_active`, `idx_schools_code`, `idx_schools_tenant`
**Constraint:** `code` UNIQUE

---

### social_features.classrooms
Aulas virtuales para organizar estudiantes por clase.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| school_id | UUID | NULL | NULL | FK social_features.schools |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants |
| name | TEXT | NOT NULL | - | Nombre del aula |
| code | TEXT | NULL | NULL | Codigo unico del aula |
| description | TEXT | NULL | NULL | Descripcion |
| grade_level | TEXT | NULL | NULL | Nivel de grado |
| section | TEXT | NULL | NULL | Seccion |
| subject | TEXT | NULL | NULL | Materia |
| academic_year | TEXT | NULL | NULL | Ano academico |
| semester | TEXT | NULL | NULL | Semestre |
| teacher_id | UUID | NOT NULL | - | FK auth_management.profiles (profesor principal) |
| co_teachers | UUID[] | NULL | NULL | Array de IDs de co-profesores |
| capacity | INTEGER | NULL | 40 | Capacidad maxima |
| current_students_count | INTEGER | NULL | 0 | Conteo actual de estudiantes |
| settings | JSONB | NULL | (ver DDL) | Configuracion (require_approval, visible_in_directory, etc.) |
| schedule | JSONB | NULL | '[]' | Horario |
| meeting_url | TEXT | NULL | NULL | URL de reunion virtual |
| is_active | BOOLEAN | NULL | true | Si esta activa |
| is_archived | BOOLEAN | NULL | false | Si esta archivada |
| is_deleted | BOOLEAN | NULL | false | Soft delete flag |
| start_date | DATE | NULL | NULL | Fecha de inicio |
| end_date | DATE | NULL | NULL | Fecha de fin |
| metadata | JSONB | NULL | '{}' | Metadatos |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_classrooms_active`, `idx_classrooms_not_deleted`, `idx_classrooms_code`, `idx_classrooms_school`, `idx_classrooms_teacher`
**Constraint:** `code` UNIQUE
**RLS:** Habilitado (teacher manage, admin/student/teacher select)

---

### social_features.classroom_members
Membresia de estudiantes en aulas.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| classroom_id | UUID | NOT NULL | - | FK social_features.classrooms |
| student_id | UUID | NOT NULL | - | FK auth_management.profiles |
| enrollment_date | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de inscripcion |
| enrollment_method | TEXT | NULL | 'teacher_invite' | Metodo: teacher_invite, self_enroll, admin_add, bulk_import |
| enrolled_by | UUID | NULL | NULL | FK auth_management.profiles (quien inscribio) |
| status | TEXT | NULL | 'active' | Estado: active, inactive, withdrawn, completed |
| withdrawal_date | TIMESTAMPTZ | NULL | NULL | Fecha de retiro |
| withdrawal_reason | TEXT | NULL | NULL | Razon de retiro |
| student_number | TEXT | NULL | NULL | Numero de estudiante |
| final_grade | NUMERIC(3,1) | NULL | NULL | Calificacion final |
| attendance_percentage | NUMERIC(5,2) | NULL | NULL | Porcentaje de asistencia |
| permissions | JSONB | NULL | '{}' | Permisos especificos |
| teacher_notes | TEXT | NULL | NULL | Notas del profesor |
| parent_contact_info | JSONB | NULL | '{}' | Contacto de padres |
| metadata | JSONB | NULL | '{}' | Metadatos |
| is_active | BOOLEAN | NULL | true | Si esta activo |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_classroom_members_active`, `idx_classroom_members_classroom`, `idx_classroom_members_classroom_status`, `idx_classroom_members_student`
**Constraint:** UNIQUE (classroom_id, student_id)
**RLS:** Habilitado (teacher manage, admin/own/teacher select)

---

### social_features.teacher_classrooms
Relacion entre profesores y aulas (un aula puede tener multiples profesores).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| teacher_id | UUID | NOT NULL | - | FK auth_management.profiles |
| classroom_id | UUID | NOT NULL | - | FK social_features.classrooms |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants |
| role | VARCHAR(50) | NOT NULL | 'teacher' | Rol: owner, teacher, assistant |
| assigned_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | Fecha de asignacion |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Indices:** `idx_teacher_classrooms_teacher_id`, `idx_teacher_classrooms_classroom_id`, `idx_teacher_classrooms_role`, `idx_teacher_classrooms_tenant_id`
**Constraint:** UNIQUE (teacher_id, classroom_id)

---

### social_features.assignment_classrooms
Relacion M2M - Asignaciones asignadas a aulas completas.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| assignment_id | UUID | NOT NULL | - | FK educational_content.assignments |
| classroom_id | UUID | NOT NULL | - | FK social_features.classrooms |
| assigned_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | Fecha de asignacion |

**Indices:** `idx_assignment_classrooms_assignment_id`, `idx_assignment_classrooms_classroom_id`
**Constraint:** UNIQUE (assignment_id, classroom_id)

---

## Equipos

> **[DEPRECATED]** This section describes an early conceptual model that was never implemented as described.
> The DDL-accurate documentation appears in the updated sections below.

### social_features.teams
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

### social_features.team_members
Miembros de cada equipo.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| team_id | UUID | NOT NULL | - | FK social_features.teams |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| role | VARCHAR(20) | NOT NULL | 'member' | Rol (leader, member) |
| joined_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de union |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `TeamMember`

---

### social_features.team_challenges
Retos entre equipos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| team_a_id | UUID | NOT NULL | - | FK social_features.teams |
| team_b_id | UUID | NOT NULL | - | FK social_features.teams |
| exercise_id | UUID | NULL | NULL | FK educational_content.exercises |
| status | VARCHAR(20) | NOT NULL | 'pending' | Estado |
| winner_team_id | UUID | NULL | NULL | FK social_features.teams (ganador) |
| team_a_score | NUMERIC(5,2) | NULL | NULL | Puntaje equipo A |
| team_b_score | NUMERIC(5,2) | NULL | NULL | Puntaje equipo B |
| started_at | TIMESTAMPTZ | NULL | NULL | Inicio |
| ended_at | TIMESTAMPTZ | NULL | NULL | Fin |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

## Equipos [DDL-ACCURATE]

### social_features.teams [DDL-ACCURATE]

**Descripcion:** Equipos colaborativos de estudiantes.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| classroom_id | UUID | NULL | NULL | FK social_features.classrooms ON DELETE CASCADE |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants ON DELETE CASCADE |
| name | TEXT | NOT NULL | - | Nombre del equipo |
| description | TEXT | NULL | NULL | Descripcion |
| motto | TEXT | NULL | NULL | Lema del equipo |
| color_primary | TEXT | NULL | '#3B82F6' | Color primario |
| color_secondary | TEXT | NULL | '#10B981' | Color secundario |
| avatar_url | TEXT | NULL | NULL | URL del avatar |
| banner_url | TEXT | NULL | NULL | URL del banner |
| badges | JSONB | NULL | '[]' | Badges del equipo |
| creator_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE SET NULL |
| leader_id | UUID | NULL | NULL | FK auth_management.profiles ON DELETE SET NULL |
| team_code | TEXT | NULL | NULL | Codigo unico del equipo |
| max_members | INTEGER | NULL | 5 | Maximo de miembros |
| current_members_count | INTEGER | NULL | 0 | Conteo actual de miembros |
| is_public | BOOLEAN | NULL | false | Visible publicamente |
| allow_join_requests | BOOLEAN | NULL | true | Permite solicitudes de union |
| require_approval | BOOLEAN | NULL | true | Requiere aprobacion |
| total_xp | INTEGER | NULL | 0 | XP total acumulado |
| total_ml_coins | INTEGER | NULL | 0 | ML Coins totales |
| modules_completed | INTEGER | NULL | 0 | Modulos completados |
| achievements_earned | INTEGER | NULL | 0 | Logros obtenidos |
| is_active | BOOLEAN | NULL | true | Equipo activo |
| is_verified | BOOLEAN | NULL | false | Equipo verificado |
| founded_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de fundacion |
| last_activity_at | TIMESTAMPTZ | NULL | NULL | Ultima actividad |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Constraints:**
- PK: `teams_pkey` (id)
- UNIQUE: `teams_team_code_key` (team_code)

**Foreign Keys:**
- classroom_id -> social_features.classrooms(id) ON DELETE CASCADE
- creator_id -> auth_management.profiles(id) ON DELETE SET NULL
- leader_id -> auth_management.profiles(id) ON DELETE SET NULL
- tenant_id -> auth_management.tenants(id) ON DELETE CASCADE

**Indices:** `idx_teams_active` (is_active, parcial: is_active = true), `idx_teams_classroom` (classroom_id), `idx_teams_classroom_active_xp` (classroom_id, is_active, total_xp DESC, parcial: is_active = true), `idx_teams_leader` (leader_id), `idx_teams_xp` (total_xp DESC)
**Trigger:** trg_teams_updated_at
**RLS:** habilitado
**Entity:** `apps/backend/src/modules/social/entities/team.entity.ts`

---

### social_features.team_members [DDL-ACCURATE]

**Descripcion:** Miembros de equipos colaborativos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| team_id | UUID | NOT NULL | - | FK social_features.teams ON DELETE CASCADE |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE |
| role | VARCHAR(20) | NOT NULL | 'member' | Rol: owner, admin, member |
| joined_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de union |
| left_at | TIMESTAMPTZ | NULL | NULL | Fecha de salida (NULL si activo) |

**Constraints:**
- PK: `team_members_pkey` (id)
- UNIQUE: `team_members_team_id_user_id_key` (team_id, user_id)
- CHECK: `team_members_role_check` role IN ('owner', 'admin', 'member')

**Foreign Keys:**
- team_id -> social_features.teams(id) ON DELETE CASCADE
- user_id -> auth_management.profiles(id) ON DELETE CASCADE

**Indices:** `idx_team_members_active` (team_id, user_id, parcial: left_at IS NULL), `idx_team_members_team_id` (team_id), `idx_team_members_user_id` (user_id)
**Entity:** `apps/backend/src/modules/social/entities/team-member.entity.ts`

---

### social_features.team_challenges [DDL-ACCURATE]

**Descripcion:** Desafios asignados a equipos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| team_id | UUID | NOT NULL | - | FK social_features.teams ON DELETE CASCADE |
| challenge_id | UUID | NOT NULL | - | ID del desafio asignado |
| status | VARCHAR(20) | NOT NULL | 'active' | Estado: active, in_progress, completed, failed, cancelled |
| started_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de inicio |
| completed_at | TIMESTAMPTZ | NULL | NULL | Fecha de completado |
| score | INTEGER | NULL | 0 | Puntaje obtenido |

**Constraints:**
- PK: `team_challenges_pkey` (id)
- UNIQUE: `team_challenges_team_id_challenge_id_key` (team_id, challenge_id)
- CHECK: `team_challenges_status_check` status IN ('active', 'in_progress', 'completed', 'failed', 'cancelled')

**Foreign Keys:**
- team_id -> social_features.teams(id) ON DELETE CASCADE

**Indices:** `idx_team_challenges_challenge_id` (challenge_id), `idx_team_challenges_status` (status), `idx_team_challenges_team_id` (team_id)
**Entity:** `apps/backend/src/modules/social/entities/team-challenge.entity.ts`

---

## Relaciones Sociales

### social_features.friendships
Relaciones de amistad ACEPTADAS entre usuarios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles (quien inicio) |
| friend_id | UUID | NOT NULL | - | FK auth_management.profiles (amigo) |
| status | VARCHAR(20) | NOT NULL | 'accepted' | Estado: pending, accepted, rejected, blocked |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_friendships_user_id`, `idx_friendships_friend_id`, `idx_friendships_status`
**Constraints:** UNIQUE (user_id, friend_id), CHECK user_id != friend_id

---

### social_features.friend_requests
Solicitudes de amistad entre usuarios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| requester_id | UUID | NOT NULL | - | FK auth_management.profiles (solicitante) |
| recipient_id | UUID | NOT NULL | - | FK auth_management.profiles (destinatario) |
| status | VARCHAR(20) | NOT NULL | 'pending' | Estado: pending, accepted, rejected, cancelled |
| message | TEXT | NULL | NULL | Mensaje opcional del solicitante |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| responded_at | TIMESTAMPTZ | NULL | NULL | Fecha de respuesta |

**Indices:** `idx_friend_requests_requester`, `idx_friend_requests_recipient`, `idx_friend_requests_status`, `idx_friend_requests_created_at`, `idx_friend_requests_recipient_status` (parcial, WHERE status = 'pending')
**Constraints:** UNIQUE (requester_id, recipient_id), CHECK requester_id != recipient_id

---

### social_features.user_follows
Sistema de seguimiento entre usuarios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| follower_id | UUID | NOT NULL | - | FK auth_management.profiles (quien sigue) |
| following_id | UUID | NOT NULL | - | FK auth_management.profiles (a quien sigue) |
| followed_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | Fecha de seguimiento |

**Indices:** `idx_user_follows_follower_id`, `idx_user_follows_following_id`, `idx_user_follows_followed_at`
**Constraints:** UNIQUE (follower_id, following_id), CHECK follower_id != following_id

---

### social_features.user_blocks
Bloqueos entre usuarios para seguridad social.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| blocker_id | UUID | NOT NULL | - | FK auth_management.profiles (quien bloquea) |
| blocked_id | UUID | NOT NULL | - | FK auth_management.profiles (bloqueado) |
| reason | VARCHAR(100) | NULL | NULL | Razon categorica (spam, harassment, inappropriate) |
| notes | TEXT | NULL | NULL | Notas adicionales privadas |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_user_blocks_blocker_id`, `idx_user_blocks_blocked_id`, `idx_user_blocks_bidirectional`
**Constraints:** UNIQUE (blocker_id, blocked_id), CHECK blocker_id != blocked_id

---

## Interacciones Sociales

### social_features.social_interactions
Registro de interacciones sociales entre usuarios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| target_user_id | UUID | NULL | NULL | FK auth_management.profiles (usuario objetivo) |
| interaction_type | VARCHAR(50) | NOT NULL | - | Tipo: like, comment, share, mention, badge_given, help_request, help_provided |
| content_type | VARCHAR(50) | NULL | NULL | Tipo de contenido (opcional) |
| content_id | UUID | NULL | NULL | ID del contenido (opcional) |
| interaction_data | JSONB | NULL | NULL | Datos adicionales de la interaccion |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Indices:** `idx_social_interactions_user_id`, `idx_social_interactions_target_user_id`, `idx_social_interactions_type`, `idx_social_interactions_content`, `idx_social_interactions_created_at`

---

### social_features.user_activities
Registro de actividades de usuarios para el Activity Feed.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| activity_id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| activity_type | VARCHAR(50) | NOT NULL | - | Tipo: achievement, level_up, streak, friend_request, exercise, challenge, guild, rankup |
| title | VARCHAR(255) | NOT NULL | - | Titulo/resumen de la actividad |
| description | TEXT | NULL | NULL | Descripcion detallada |
| metadata | JSONB | NULL | '{}' | Datos adicionales (achievementId, exerciseId, etc.) |
| is_public | BOOLEAN | NULL | true | Si es visible para amigos |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Indices:** `idx_user_activities_user_id`, `idx_user_activities_created_at`, `idx_user_activities_type`, `idx_user_activities_is_public`, `idx_user_activities_public_recent`

---

### social_features.discussion_threads
Hilos de discusion en aulas/grupos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| classroom_id | UUID | NULL | NULL | FK social_features.classrooms |
| team_id | UUID | NULL | NULL | FK social_features.teams |
| created_by | UUID | NOT NULL | - | FK auth_management.profiles |
| title | VARCHAR(255) | NOT NULL | - | Titulo del hilo |
| content | TEXT | NOT NULL | - | Contenido del hilo |
| is_pinned | BOOLEAN | NOT NULL | false | Si esta fijado al inicio |
| is_locked | BOOLEAN | NOT NULL | false | Si esta bloqueado para respuestas |
| replies_count | INTEGER | NOT NULL | 0 | Numero de respuestas |
| last_reply_at | TIMESTAMPTZ | NULL | NULL | Ultima respuesta |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Indices:** `idx_discussion_threads_classroom_id`, `idx_discussion_threads_team_id`, `idx_discussion_threads_created_by`, `idx_discussion_threads_is_pinned`, `idx_discussion_threads_last_reply`, `idx_discussion_threads_created_at`
**Constraint:** CHECK (classroom_id IS NOT NULL OR team_id IS NOT NULL)
**Trigger:** trg_discussion_threads_updated_at

---

## Reportes de Profesores

### social_features.teacher_reports
Metadatos de reportes generados por profesores.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| teacher_id | UUID | NOT NULL | - | FK auth_management.profiles |
| classroom_id | UUID | NULL | NULL | FK social_features.classrooms (NULL si es individual o general) |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants |
| report_name | VARCHAR(255) | NOT NULL | - | Nombre descriptivo del reporte |
| report_type | VARCHAR(50) | NOT NULL | - | Tipo: individual, classroom, progress, analytics |
| report_format | VARCHAR(10) | NOT NULL | - | Formato: pdf, excel, csv |
| student_count | INTEGER | NULL | 0 | Numero de estudiantes incluidos |
| period_start | DATE | NULL | NULL | Inicio del periodo reportado |
| period_end | DATE | NULL | NULL | Fin del periodo reportado |
| file_path | TEXT | NULL | NULL | Ruta del archivo generado |
| file_size_bytes | BIGINT | NULL | NULL | Tamano del archivo en bytes |
| generated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Timestamp de generacion |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_teacher_reports_teacher_id`, `idx_teacher_reports_tenant_id`, `idx_teacher_reports_generated_at`, `idx_teacher_reports_classroom_id`, `idx_teacher_reports_report_type`
**RLS:** Habilitado

---

### social_features.scheduled_reports
Configuracion de reportes programados para generacion automatica.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| teacher_id | UUID | NOT NULL | - | FK auth_management.profiles |
| classroom_id | UUID | NULL | NULL | FK social_features.classrooms |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants |
| report_name | VARCHAR(255) | NOT NULL | - | Nombre del reporte programado |
| report_type | VARCHAR(50) | NOT NULL | - | Tipo: individual, classroom, progress, analytics |
| report_format | VARCHAR(10) | NOT NULL | 'pdf' | Formato: pdf, excel, csv |
| template_id | VARCHAR(50) | NULL | NULL | ID de plantilla opcional |
| student_ids | UUID[] | NULL | NULL | Array de student IDs para filtrar (NULL = todos) |
| frequency | VARCHAR(20) | NOT NULL | - | Frecuencia: daily, weekly, monthly |
| day_of_week | INTEGER | NULL | NULL | Dia de la semana 0-6 (para weekly) |
| day_of_month | INTEGER | NULL | NULL | Dia del mes 1-28 (para monthly) |
| time_of_day | TIME | NOT NULL | '08:00:00' | DEPRECATED: usar preferred_hour |
| preferred_hour | INTEGER | NULL | NULL | Hora preferida 0-23 |
| timezone | VARCHAR(50) | NULL | 'America/Mexico_City' | Zona horaria |
| is_active | BOOLEAN | NULL | true | DEPRECATED: usar status |
| status | VARCHAR(20) | NULL | 'active' | Estado: active, paused, completed |
| last_run_at | TIMESTAMPTZ | NULL | NULL | Ultima ejecucion |
| next_run_at | TIMESTAMPTZ | NULL | NULL | Proxima ejecucion programada |
| last_error | TEXT | NULL | NULL | Ultimo error |
| run_count | INTEGER | NULL | 0 | Numero de ejecuciones |
| notify_email | BOOLEAN | NULL | false | Si enviar notificacion por email |
| email_recipients | TEXT[] | NULL | NULL | Lista de emails para notificacion |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_scheduled_reports_teacher_id`, `idx_scheduled_reports_tenant_id`, `idx_scheduled_reports_next_run`, `idx_scheduled_reports_active`, `idx_scheduled_reports_student_ids` (GIN), `idx_scheduled_reports_status`, `idx_scheduled_reports_cron_due`
**RLS:** Habilitado (teacher own, admin tenant)

---

### social_features.shared_reports
Registro de reportes compartidos entre profesores.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| report_id | UUID | NOT NULL | - | FK social_features.teacher_reports |
| shared_by | UUID | NOT NULL | - | FK auth_management.profiles (quien comparte) |
| shared_with | UUID | NOT NULL | - | FK auth_management.profiles (destinatario) |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants |
| permission_level | VARCHAR(20) | NULL | 'view' | Nivel: view, download, edit |
| is_revoked | BOOLEAN | NULL | FALSE | Si el acceso fue revocado |
| accessed_at | TIMESTAMPTZ | NULL | NULL | Ultimo acceso |
| access_count | INTEGER | NULL | 0 | Numero de accesos |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion del acceso (NULL = sin expiracion) |
| share_message | TEXT | NULL | NULL | Mensaje opcional del profesor |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_shared_reports_unique` (UNIQUE report_id, shared_with), `idx_shared_reports_report_id`, `idx_shared_reports_shared_by`, `idx_shared_reports_shared_with`, `idx_shared_reports_tenant_id`, `idx_shared_reports_expires`, `idx_shared_reports_active`
**Constraints:** CHECK shared_by != shared_with
**RLS:** Habilitado (owner, recipient con expiracion, admin)

---

## Peer Challenges

### social_features.peer_challenges
Desafios peer-to-peer entre estudiantes para competir en ejercicios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| challenge_type | TEXT | NOT NULL | - | Tipo: head_to_head, multiplayer, tournament, leaderboard |
| created_by | UUID | NOT NULL | - | FK auth_management.profiles |
| module_id | UUID | NULL | NULL | FK educational_content.modules |
| exercise_id | UUID | NULL | NULL | FK educational_content.exercises |
| title | TEXT | NOT NULL | - | Titulo del desafio |
| description | TEXT | NULL | NULL | Descripcion |
| difficulty_level | difficulty_level | NULL | NULL | Nivel de dificultad |
| max_participants | INTEGER | NULL | 2 | Maximo de participantes |
| min_participants | INTEGER | NULL | 2 | Minimo para iniciar |
| current_participants | INTEGER | NULL | 1 | Contador actual |
| start_time | TIMESTAMPTZ | NULL | NULL | Hora de inicio |
| end_time | TIMESTAMPTZ | NULL | NULL | Hora de fin |
| time_limit_minutes | INTEGER | NULL | NULL | Limite de tiempo por participante |
| status | TEXT | NULL | 'open' | Estado: open, full, in_progress, completed, cancelled, expired |
| rewards | JSONB | NULL | '{}' | Recompensas: {xp, ml_coins, achievement_id} |
| winner_bonus_multiplier | NUMERIC(3,2) | NULL | 1.5 | Bonus multiplicador para el ganador |
| allow_spectators | BOOLEAN | NULL | true | Si permite espectadores |
| is_public | BOOLEAN | NULL | true | Visible en lista publica |
| requires_approval | BOOLEAN | NULL | false | Requiere aprobacion del creador |
| custom_rules | JSONB | NULL | '{}' | Reglas personalizadas |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| started_at | TIMESTAMPTZ | NULL | NULL | Inicio real |
| completed_at | TIMESTAMPTZ | NULL | NULL | Finalizacion real |
| metadata | JSONB | NULL | '{}' | Metadatos |

**Indices:** `idx_peer_challenges_creator`, `idx_peer_challenges_module`, `idx_peer_challenges_exercise`, `idx_peer_challenges_status`, `idx_peer_challenges_type`, `idx_peer_challenges_open`, `idx_peer_challenges_timing`, `idx_peer_challenges_created_at`, `idx_peer_challenges_metadata` (GIN), `idx_peer_challenges_rewards` (GIN)
**Trigger:** trg_peer_challenges_updated_at

---

### social_features.challenge_participants
Participantes de peer challenges y su progreso individual.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| challenge_id | UUID | NOT NULL | - | FK social_features.peer_challenges |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| participation_status | TEXT | NULL | 'invited' | Estado: invited, accepted, in_progress, completed, forfeit, disqualified |
| score | NUMERIC(10,2) | NULL | 0 | Puntuacion obtenida |
| accuracy_percentage | NUMERIC(5,2) | NULL | NULL | Porcentaje de precision |
| completion_percentage | NUMERIC(5,2) | NULL | 0 | Porcentaje completado |
| exercises_completed | INTEGER | NULL | 0 | Ejercicios completados |
| started_at | TIMESTAMPTZ | NULL | NULL | Inicio del participante |
| completed_at | TIMESTAMPTZ | NULL | NULL | Finalizacion |
| time_spent_seconds | INTEGER | NULL | NULL | Tiempo total invertido |
| rank | INTEGER | NULL | NULL | Posicion final (1 = ganador) |
| is_winner | BOOLEAN | NULL | false | Si es el ganador |
| xp_earned | INTEGER | NULL | 0 | XP ganado |
| ml_coins_earned | INTEGER | NULL | 0 | ML Coins ganados |
| rewards_claimed | BOOLEAN | NULL | false | Si reclamo recompensas |
| attempt_id | UUID | NULL | NULL | Link a exercise_attempts |
| invited_at | TIMESTAMPTZ | NULL | NULL | Fecha de invitacion |
| accepted_at | TIMESTAMPTZ | NULL | NULL | Fecha de aceptacion |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| metadata | JSONB | NULL | '{}' | Metadatos |

**Indices:** `idx_challenge_participants_challenge`, `idx_challenge_participants_user`, `idx_challenge_participants_status`, `idx_challenge_participants_score`, `idx_challenge_participants_rank`, `idx_challenge_participants_winner`, `idx_challenge_participants_user_challenges`, `idx_challenge_participants_metadata` (GIN)
**Constraint:** UNIQUE (challenge_id, user_id)
**Trigger:** trg_challenge_participants_updated_at

---

### social_features.challenge_results
Resultados finales de peer challenges con rankings y distribucion de recompensas.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| challenge_id | UUID | NOT NULL | - | FK social_features.peer_challenges (UNIQUE) |
| winner_id | UUID | NULL | NULL | FK auth_management.profiles (ganador) |
| second_place_id | UUID | NULL | NULL | FK auth_management.profiles |
| third_place_id | UUID | NULL | NULL | FK auth_management.profiles |
| total_participants | INTEGER | NOT NULL | - | Total de participantes |
| participants_completed | INTEGER | NULL | NULL | Participantes que completaron |
| participants_forfeit | INTEGER | NULL | NULL | Participantes que se rindieron |
| winning_score | NUMERIC(10,2) | NULL | NULL | Puntaje ganador |
| average_score | NUMERIC(10,2) | NULL | NULL | Puntaje promedio |
| highest_accuracy | NUMERIC(5,2) | NULL | NULL | Precision mas alta (0-100) |
| average_completion_time_seconds | INTEGER | NULL | NULL | Tiempo promedio |
| fastest_completion_time_seconds | INTEGER | NULL | NULL | Tiempo mas rapido |
| total_xp_distributed | INTEGER | NULL | 0 | Total XP distribuido |
| total_ml_coins_distributed | INTEGER | NULL | 0 | Total ML Coins distribuidos |
| rewards_distributed | BOOLEAN | NULL | false | Si las recompensas fueron distribuidas |
| final_leaderboard | JSONB | NULL | '[]' | Leaderboard final: [{user_id, rank, score, time}] |
| statistics | JSONB | NULL | '{}' | Estadisticas detalladas |
| calculated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | Fecha de calculo |
| rewards_distributed_at | TIMESTAMPTZ | NULL | NULL | Fecha de distribucion de recompensas |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| metadata | JSONB | NULL | '{}' | Metadatos |

**Indices:** `idx_challenge_results_challenge`, `idx_challenge_results_winner`, `idx_challenge_results_second_place`, `idx_challenge_results_third_place`, `idx_challenge_results_calculated_at`, `idx_challenge_results_rewards_pending`, `idx_challenge_results_leaderboard` (GIN), `idx_challenge_results_statistics` (GIN)
**Constraints:** CHECK total_participants > 0, CHECK completed <= total, CHECK forfeit <= total, CHECK accuracy 0-100, CHECK xp >= 0, CHECK coins >= 0

---

### social_features.team_vs_team_challenges
Desafios entre equipos (guilds, classrooms, o grupos ad-hoc).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| title | VARCHAR(200) | NOT NULL | - | Titulo del desafio (min 3 caracteres) |
| description | TEXT | NULL | NULL | Descripcion detallada |
| challenge_type | VARCHAR(50) | NULL | 'team_vs_team' | Tipo: team_vs_team, guild_war, classroom_battle, tournament_match |
| team_a_type | VARCHAR(50) | NOT NULL | - | Tipo de equipo A: guild, classroom, team, custom |
| team_a_id | UUID | NULL | NULL | Referencia a guild/classroom/team |
| team_a_name | VARCHAR(100) | NULL | NULL | Nombre de equipo A |
| team_a_members | UUID[] | NOT NULL | - | Array de profile IDs del equipo A |
| team_a_captain_id | UUID | NOT NULL | - | FK auth_management.profiles (capitan A) |
| team_b_type | VARCHAR(50) | NULL | NULL | Tipo de equipo B |
| team_b_id | UUID | NULL | NULL | Referencia a guild/classroom/team |
| team_b_name | VARCHAR(100) | NULL | NULL | Nombre de equipo B |
| team_b_members | UUID[] | NULL | NULL | Array de profile IDs del equipo B |
| team_b_captain_id | UUID | NULL | NULL | FK auth_management.profiles (capitan B) |
| min_team_size | INTEGER | NULL | 2 | Minimo miembros (1-20) |
| max_team_size | INTEGER | NULL | 5 | Maximo miembros (1-20) |
| exercise_ids | UUID[] | NULL | NULL | Array de IDs de ejercicios |
| module_id | UUID | NULL | NULL | FK educational_content.modules |
| time_limit_minutes | INTEGER | NULL | NULL | Limite de tiempo |
| scoring_method | VARCHAR(50) | NULL | 'total_points' | Metodo: total_points, average, best_n, time_based, accuracy |
| best_n_count | INTEGER | NULL | 3 | Para scoring_method = best_n |
| rewards | JSONB | NULL | (ver DDL) | Configuracion de recompensas JSONB |
| status | VARCHAR(50) | NULL | 'pending' | Estado: pending, accepted, in_progress, completed, cancelled, expired, declined |
| winner_team | VARCHAR(10) | NULL | NULL | Ganador: a, b, draw |
| team_a_score | INTEGER | NULL | 0 | Puntaje equipo A |
| team_b_score | INTEGER | NULL | 0 | Puntaje equipo B |
| team_a_accuracy | NUMERIC(5,2) | NULL | NULL | Precision equipo A (0-100) |
| team_b_accuracy | NUMERIC(5,2) | NULL | NULL | Precision equipo B (0-100) |
| team_a_avg_time_seconds | INTEGER | NULL | NULL | Tiempo promedio equipo A |
| team_b_avg_time_seconds | INTEGER | NULL | NULL | Tiempo promedio equipo B |
| results_detail | JSONB | NULL | '{}' | Resultados detallados por miembro |
| created_by | UUID | NOT NULL | - | FK auth_management.profiles |
| invitation_expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion de invitacion |
| accepted_at | TIMESTAMPTZ | NULL | NULL | Fecha de aceptacion |
| starts_at | TIMESTAMPTZ | NULL | NULL | Inicio programado |
| ends_at | TIMESTAMPTZ | NULL | NULL | Fin programado |
| completed_at | TIMESTAMPTZ | NULL | NULL | Finalizacion real |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_team_vs_team_challenges_status`, `idx_team_vs_team_challenges_active`, `idx_team_vs_team_challenges_team_a_captain`, `idx_team_vs_team_challenges_team_b_captain`, `idx_team_vs_team_challenges_created_by`, `idx_team_vs_team_challenges_team_a_id`, `idx_team_vs_team_challenges_team_b_id`, `idx_team_vs_team_challenges_starts_at`, `idx_team_vs_team_challenges_invitation_expires`, `idx_team_vs_team_challenges_team_a_members` (GIN), `idx_team_vs_team_challenges_team_b_members` (GIN), `idx_team_vs_team_challenges_exercise_ids` (GIN), `idx_team_vs_team_challenges_completed_winner`
**Constraints:** CHECK min_team_size <= max_team_size, CHECK team_a_members no vacio, CHECK dates valid
**Trigger:** trg_team_vs_team_challenges_updated_at
**RLS:** Habilitado

---

### social_features.user_skill_ratings
Skill ratings ELO-based para usuarios en peer challenges (matchmaking).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles (1:1) |
| rating | INTEGER | NOT NULL | 1200 | Rating ELO actual |
| peak_rating | INTEGER | NOT NULL | 1200 | Maximo historico |
| lowest_rating | INTEGER | NOT NULL | 1200 | Minimo historico |
| games_played | INTEGER | NOT NULL | 0 | Total de partidas jugadas |
| wins | INTEGER | NOT NULL | 0 | Total de victorias |
| losses | INTEGER | NOT NULL | 0 | Total de derrotas |
| draws | INTEGER | NOT NULL | 0 | Total de empates |
| current_streak | INTEGER | NOT NULL | 0 | Racha actual (positivo = victorias, negativo = derrotas) |
| best_streak | INTEGER | NOT NULL | 0 | Mejor racha de victorias |
| rating_history | JSONB | NOT NULL | '[]' | Ultimos 10 cambios de rating |
| metadata | JSONB | NOT NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | - |

**Indices:** `idx_user_skill_ratings_user_id`, `idx_user_skill_ratings_rating`, `idx_user_skill_ratings_rating_range` (parcial, games >= 5), `idx_user_skill_ratings_games_played`, `idx_user_skill_ratings_active_players` (parcial, games >= 10), `idx_user_skill_ratings_metadata` (GIN), `idx_user_skill_ratings_history` (GIN)
**Constraints:** UNIQUE (user_id), CHECK rating >= 0, CHECK peak >= rating >= lowest, CHECK games/wins/losses/draws >= 0, CHECK wins + losses + draws <= games
**Trigger:** trg_user_skill_ratings_updated_at
**RLS:** Habilitado (own, public read, admin, system insert/update)

---

## Gremios (Guilds)

### social_features.guild_emblems
Catalogo de emblemas disponibles para gremios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | SERIAL | NOT NULL | (auto) | PK |
| name | VARCHAR(50) | NOT NULL | - | Nombre del emblema |
| image_url | VARCHAR(255) | NOT NULL | - | URL de la imagen |
| category | VARCHAR(30) | NULL | 'standard' | Categoria: standard, mythic, seasonal, achievement, premium |
| is_premium | BOOLEAN | NULL | false | Si requiere compra con ML Coins |
| required_level | INTEGER | NULL | 1 | Nivel minimo del gremio para desbloquear |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_guild_emblems_category`, `idx_guild_emblems_is_premium`, `idx_guild_emblems_required_level`
**Seed:** 20 emblemas predefinidos (standard, mythic, seasonal, achievement, premium)

---

### social_features.guilds
Gremios/Grupos colaborativos de estudiantes.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| name | VARCHAR(30) | NOT NULL | - | Nombre unico del gremio (3-30 caracteres) |
| description | TEXT | NULL | NULL | Descripcion del gremio |
| emblem_id | INTEGER | NULL | 1 | FK social_features.guild_emblems |
| leader_id | UUID | NOT NULL | - | FK auth_management.profiles (lider) |
| member_count | INTEGER | NULL | 1 | Contador de miembros (1-20) |
| level | INTEGER | NULL | 1 | Nivel del gremio (1-50) |
| total_xp | BIGINT | NULL | 0 | XP total acumulado |
| is_public | BOOLEAN | NULL | true | Si acepta solicitudes publicas |
| is_active | BOOLEAN | NULL | true | Si esta activo |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| last_activity_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Ultima actividad |

**Indices:** `idx_guilds_name`, `idx_guilds_leader_id`, `idx_guilds_is_public`, `idx_guilds_level`, `idx_guilds_last_activity`, `idx_guilds_total_xp`
**Constraints:** UNIQUE (name), CHECK name length 3-30, CHECK member_count 1-20, CHECK level 1-50
**Trigger:** trg_guilds_updated_at

---

### social_features.guild_members
Membresias de usuarios en gremios. Un usuario solo puede pertenecer a un gremio.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| guild_id | UUID | NOT NULL | - | FK social_features.guilds |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| role | VARCHAR(20) | NULL | 'member' | Rol: leader, officer, member |
| contribution_xp | BIGINT | NULL | 0 | XP aportado al gremio |
| missions_completed | INTEGER | NULL | 0 | Misiones de gremio completadas |
| joined_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de union |
| last_contribution_at | TIMESTAMPTZ | NULL | NULL | Ultima contribucion |

**Indices:** `idx_guild_members_guild_id`, `idx_guild_members_user_id`, `idx_guild_members_role`, `idx_guild_members_contribution`
**Constraints:** UNIQUE (user_id) -- un usuario solo puede estar en un gremio, UNIQUE (guild_id, user_id)
**Trigger:** trg_guild_members_count (actualiza member_count en guilds)

---

### social_features.guild_join_requests
Solicitudes de union a gremios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| guild_id | UUID | NOT NULL | - | FK social_features.guilds |
| requester_id | UUID | NOT NULL | - | FK auth_management.profiles |
| message | TEXT | NULL | NULL | Mensaje del solicitante |
| status | VARCHAR(20) | NULL | 'pending' | Estado: pending, accepted, rejected, cancelled |
| responded_by | UUID | NULL | NULL | FK auth_management.profiles (quien respondio) |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| responded_at | TIMESTAMPTZ | NULL | NULL | Fecha de respuesta |

**Indices:** `idx_guild_join_requests_guild_id`, `idx_guild_join_requests_requester_id`, `idx_guild_join_requests_status`, `idx_guild_join_requests_created_at`, `idx_guild_join_requests_unique_pending` (UNIQUE parcial: guild_id, requester_id WHERE status = 'pending')

---

### social_features.guild_missions
Misiones colaborativas para gremios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| guild_id | UUID | NOT NULL | - | FK social_features.guilds |
| title | VARCHAR(100) | NOT NULL | - | Titulo de la mision |
| description | TEXT | NULL | NULL | Descripcion detallada |
| mission_type | guild_mission_type | NOT NULL | - | Tipo: exercises_completed, total_score, streak_days, perfect_scores, subjects_completed, time_spent |
| target_value | INTEGER | NOT NULL | - | Valor objetivo (> 0) |
| current_value | INTEGER | NULL | 0 | Progreso actual (>= 0) |
| reward_xp | INTEGER | NULL | 100 | XP otorgado al gremio al completar |
| reward_coins | INTEGER | NULL | 50 | ML Coins bonus para cada miembro |
| difficulty | VARCHAR(20) | NULL | 'normal' | Dificultad: easy, normal, hard, epic |
| status | VARCHAR(20) | NULL | 'active' | Estado: active, completed, expired, cancelled |
| starts_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de inicio |
| expires_at | TIMESTAMPTZ | NULL | NULL | Fecha de expiracion (opcional) |
| completed_at | TIMESTAMPTZ | NULL | NULL | Fecha de completado |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_guild_missions_guild_id`, `idx_guild_missions_status`, `idx_guild_missions_expires_at`, `idx_guild_missions_mission_type`, `idx_guild_missions_difficulty`
**Constraint:** CHECK expires_at > starts_at

---

### social_features.guild_mission_contributions
Tracking de contribuciones individuales a misiones de gremio.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| mission_id | UUID | NOT NULL | - | FK social_features.guild_missions |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| contribution_value | INTEGER | NOT NULL | - | Valor de la contribucion (> 0) |
| contributed_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de contribucion |

**Indices:** `idx_guild_mission_contributions_mission`, `idx_guild_mission_contributions_user`, `idx_guild_mission_contributions_contributed_at`
**Constraint:** UNIQUE (mission_id, user_id, contributed_at)

---

## Moderacion

### social_features.user_reports
Reportes de usuarios para moderacion. Soporta reportes polimorficos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| reporter_id | UUID | NOT NULL | - | FK auth_management.profiles (quien reporta) |
| report_type | VARCHAR(50) | NOT NULL | - | Tipo: user, message, content, challenge, guild, team, classroom |
| reported_user_id | UUID | NULL | NULL | FK auth_management.profiles (obligatorio si report_type=user) |
| reported_entity_id | UUID | NULL | NULL | ID de entidad reportada |
| reported_entity_type | VARCHAR(50) | NULL | NULL | Nombre de tabla de la entidad |
| reason | VARCHAR(100) | NOT NULL | - | Razon: harassment, spam, inappropriate, cheating, hate_speech, impersonation, privacy_violation, other |
| description | TEXT | NULL | NULL | Descripcion detallada |
| evidence_urls | TEXT[] | NULL | NULL | Array de URLs de evidencia |
| status | VARCHAR(50) | NOT NULL | 'open' | Estado: open, under_review, resolved, dismissed, escalated |
| priority | VARCHAR(20) | NOT NULL | 'normal' | Prioridad: low, normal, high, urgent, critical |
| assigned_to | UUID | NULL | NULL | FK auth_management.profiles (moderador) |
| resolution | VARCHAR(100) | NULL | NULL | Resumen de resolucion |
| resolution_notes | TEXT | NULL | NULL | Notas detalladas (solo moderadores) |
| action_taken | VARCHAR(100) | NULL | NULL | Accion: warning_issued, content_removed, user_suspended, user_banned, none, education_provided, account_restricted |
| resolved_by | UUID | NULL | NULL | FK auth_management.profiles (moderador resolutor) |
| resolved_at | TIMESTAMPTZ | NULL | NULL | Timestamp de resolucion |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_user_reports_reporter_id`, `idx_user_reports_reported_user_id`, `idx_user_reports_status`, `idx_user_reports_priority`, `idx_user_reports_moderation_queue` (compuesto, parcial), `idx_user_reports_assigned_to`, `idx_user_reports_report_type`, `idx_user_reports_entity`, `idx_user_reports_reason`, `idx_user_reports_created_at`
**Constraints:** CHECK report_type=user requires reported_user_id, CHECK non-user reports require entity info, CHECK reporter != reported
