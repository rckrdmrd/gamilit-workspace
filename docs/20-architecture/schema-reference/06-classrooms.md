# Schema 6: classrooms (7 tablas, 28 RLS policies)

> **Nota:** Este documento describe el modelo conceptual. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

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
