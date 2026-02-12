# Schema 14: parents (4 tablas, 14 RLS policies)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

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
