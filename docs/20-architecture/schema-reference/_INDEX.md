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

> **Complementario a:** [MODELO-DATOS.md](../MODELO-DATOS.md) (vision conceptual) y `orchestration/inventory/DATABASE_INVENTORY.yml` (inventario operativo).

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

| # | Schema | Tablas | RLS Policies | Archivo |
|---|--------|--------|--------------|---------|
| 1 | auth | 8 | 24 | [01-auth.md](01-auth.md) |
| 2 | tenants | 4 | 12 | [02-tenants.md](02-tenants.md) |
| 3 | education | 13 | 42 | [03-education.md](03-education.md) |
| 4 | gamification | 8 | 38 | [04-gamification.md](04-gamification.md) |
| 5 | social | 7 | 22 | [05-social.md](05-social.md) |
| 6 | classrooms | 7 | 28 | [06-classrooms.md](06-classrooms.md) |
| 7 | analytics | 5 | 18 | [07-analytics.md](07-analytics.md) |
| 8 | reports | 4 | 16 | [08-reports.md](08-reports.md) |
| 9 | notifications | 5 | 20 | [09-notifications.md](09-notifications.md) |
| 10 | store | 6 | 18 | [10-store.md](10-store.md) |
| 11 | missions | 6 | 16 | [11-missions.md](11-missions.md) |
| 12 | leaderboard | 4 | 12 | [12-leaderboard.md](12-leaderboard.md) |
| 13 | content | 3 | 8 | [13-content.md](13-content.md) |
| 14 | parents | 4 | 14 | [14-parents.md](14-parents.md) |
| 15 | settings | 3 | 6 | [15-settings.md](15-settings.md) |
| 16 | audit | 3 | 14 | [16-audit.md](16-audit.md) |
| 17-18 | placeholder | - | - | [17-18-placeholder.md](17-18-placeholder.md) |

## Utilidades

| Seccion | Archivo |
|---------|---------|
| Materialized Views, ENUMs, Indices, Trazabilidad | [99-utilities.md](99-utilities.md) |

---

*GAMILIT - Schema Reference Index*
*171 tablas | 18 schemas | 282 RLS policies | 36 ENUMs | PostgreSQL 16*
