# Schema 2: tenants (4 tablas, 12 RLS policies)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

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
