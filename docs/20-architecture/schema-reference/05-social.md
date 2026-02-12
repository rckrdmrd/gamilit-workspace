# Schema 5: social (7 tablas, 22 RLS policies)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

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
