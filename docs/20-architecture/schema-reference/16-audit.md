# Schema 16: audit (3 tablas, 14 RLS policies)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

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
