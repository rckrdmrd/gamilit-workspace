# Schema Reference - GAMILIT

**Version:** 2.2.0
**Fecha:** 2026-02-21
**Database:** gamilit_platform
**Engine:** PostgreSQL 15
**ORM:** TypeORM 0.3.x

---

## Resumen

| Metrica | Valor |
|---------|-------|
| Schemas | 18 (16 activos + 2 placeholder) |
| Tablas | 172 |
| Views | 22 |
| Materialized Views | 7 |
| Functions | 183 |
| Triggers | 67 |
| RLS Policies | 234 |
| Foreign Keys | 299 |
| ENUMs | 42 |

> **Complementario a:** [MODELO-DATOS.md](../MODELO-DATOS.md) (vision conceptual) y `orchestration/inventarios/DATABASE_INVENTORY.yml` (inventario operativo).
>
> **IMPORTANTE:** Este documento usa **nombres conceptuales** para los schemas (auth, tenants, education, etc.) como abstraccion de dominio. Los schemas fisicos en DDL tienen nombres diferentes. Ver seccion [Mapeo Schema Fisico vs Conceptual](#mapeo-schema-fisico-vs-conceptual) mas abajo.

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

## Schemas

| # | Schema Conceptual | Schema Fisico DDL | Tablas | Archivo |
|---|-------------------|-------------------|--------|---------|
| 1 | auth | `auth` + `auth_management` | 1+17 | [01-auth.md](01-auth.md) |
| 2 | tenants | `auth_management` (parcial) | - | [02-tenants.md](02-tenants.md) |
| 3 | education | `educational_content` + `progress_tracking` | 24+21 | [03-education.md](03-education.md) |
| 4 | gamification | `gamification_system` (parcial) | 22 | [04-gamification.md](04-gamification.md) |
| 5 | social | `social_features` (parcial) | 30 | [05-social.md](05-social.md) |
| 6 | classrooms | `social_features` (parcial) | - | [06-classrooms.md](06-classrooms.md) |
| 7 | analytics | `data_warehouse` + `admin_dashboard` | 16+4 | [07-analytics.md](07-analytics.md) |
| 8 | reports | `social_features` (parcial) | 3 | [08-reports.md](08-reports.md) |
| 9 | notifications | `notifications` | 7 | [09-notifications.md](09-notifications.md) |
| 10 | store | `gamification_system` (parcial) | - | [10-store.md](10-store.md) |
| 11 | missions | `gamification_system` (parcial) | 3 | [11-missions.md](11-missions.md) |
| 12 | leaderboard | `gamification_system` (parcial) | - | [12-leaderboard.md](12-leaderboard.md) |
| 13 | content | `content_management` | 10 | [13-content.md](13-content.md) |
| 14 | parents | `auth_management` (parcial) | - | [14-parents.md](14-parents.md) |
| 15 | settings | `system_configuration` | 9 | [15-settings.md](15-settings.md) |
| 16 | audit | `audit_logging` | 7 | [16-audit.md](16-audit.md) |
| 17 | data_warehouse | `data_warehouse` | 16 | [17-data-warehouse.md](17-data-warehouse.md) |
| 18 | admin_dashboard | `admin_dashboard` | 4+7v | [18-admin-dashboard.md](18-admin-dashboard.md) |
| 19 | communication | `communication` | 4 | [19-communication.md](19-communication.md) |
| 20 | gamilit (utility) | `gamilit` | 0+37f | [20-gamilit-utility.md](20-gamilit-utility.md) |
| - | placeholder/vacios | `public`, `storage`, `optimization` | - | [17-18-placeholder.md](17-18-placeholder.md) |

## Utilidades

| Seccion | Archivo |
|---------|---------|
| Materialized Views, ENUMs, Indices, Trazabilidad | [99-utilities.md](99-utilities.md) |
| Catalogo de series UUID por schema | [UUID-SERIES-CATALOG.md](UUID-SERIES-CATALOG.md) |

---

## Mapeo Schema Fisico vs Conceptual

Los archivos de schema-reference usan **nombres conceptuales** (dominio de negocio). La implementacion fisica (DDL en `apps/database/ddl/schemas/`) usa nombres diferentes. Esta tabla documenta la correspondencia:

| Schema Conceptual (Docs) | Schema Fisico (DDL) | Tablas | Tipo Mapeo | Notas |
|--------------------------|---------------------|--------|------------|-------|
| auth (01-auth.md) | `auth` + `auth_management` | 1 + 17 | SPLIT | auth = users base; auth_management = perfiles, roles, tenants, RBAC |
| tenants (02-tenants.md) | `auth_management` (parcial) | - | MERGED | Contenido incluido en auth_management |
| education (03-education.md) | `educational_content` + `progress_tracking` | 24 + 21 | SPLIT | Contenido educativo (+3 resource tables 2026-02-21) + seguimiento de progreso |
| gamification (04-gamification.md) | `gamification_system` (parcial) | 22 | PARTIAL | XP, rangos, achievements, equipamiento |
| social (05-social.md) | `social_features` (parcial) | 30 | PARTIAL | Amistades, interacciones |
| classrooms (06-classrooms.md) | `social_features` (parcial) | - | MERGED | Escuelas, aulas, equipos dentro de social_features |
| analytics (07-analytics.md) | `data_warehouse` + `admin_dashboard` | 16 + 4 | SPLIT | Star schema + dashboard admin |
| reports (08-reports.md) | `social_features` (parcial) | 3 | PARTIAL | teacher_reports, scheduled_reports, shared_reports |
| notifications (09-notifications.md) | `notifications` | 7 | ~1:1 | |
| store (10-store.md) | `gamification_system` (parcial) | - | MERGED | Tienda virtual dentro de gamification_system |
| missions (11-missions.md) | `gamification_system` (parcial) | 3 | MERGED | Misiones (missions, mission_templates, classroom_missions) — v2.0.0 reescrito REC |
| leaderboard (12-leaderboard.md) | `gamification_system` (parcial) | - | MERGED | Leaderboards dentro de gamification_system |
| content (13-content.md) | `content_management` | 10 | ~1:1 | |
| parents (14-parents.md) | `auth_management` (parcial) | - | MERGED | Cuentas padres dentro de auth_management |
| settings (15-settings.md) | `system_configuration` | 9 | ~1:1 | |
| audit (16-audit.md) | `audit_logging` | 7 | ~1:1 | |

### Schemas Fisicos sin Archivo de Referencia Dedicado

| Schema Fisico (DDL) | Tablas | Funciones | Views | Tipo | Notas |
|---------------------|--------|-----------|-------|------|-------|
| `communication` | 4 | - | - | domain | Mensajeria interna (conversations, messages) |
| `data_warehouse` | 16 | - | 3 | analytics | Star schema: 8 dims + 4 facts + 2 ML + 2 ETL |
| `admin_dashboard` | 4 | - | 7+3mv | support | Dashboard admin, bulk ops, reportes |
| `gamilit` | 0 | 37 | 1 | utility | Funciones compartidas: now_mexico(), RLS helpers, triggers |
| `lti_integration` | 3 | - | - | integration | LTI 1.3: consumers, sessions, grade passback |
| `optimization` | 0 | - | - | performance | Indexes de rendimiento |

> **Referencia DDL:** `apps/database/ddl/schemas/{nombre_fisico}/`
> **Constantes Backend:** `apps/backend/src/shared/constants/database.constants.ts` (DB_SCHEMAS, DB_TABLES)
> **Inventario Completo:** `orchestration/inventarios/DATABASE_INVENTORY.yml` (v8.0.0)

---

*GAMILIT - Schema Reference Index v2.2.0*
*172 tablas | 18 schemas | 237 RLS policies (DDL) | 42 ENUMs | PostgreSQL 15*
