# Schema 15: settings (3 tablas, 6 RLS policies)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

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
