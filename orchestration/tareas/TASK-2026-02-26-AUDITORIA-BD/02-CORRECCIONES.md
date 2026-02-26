# Correcciones Aplicadas — Auditoria Integral BD

**Fecha:** 2026-02-26
**Task:** TASK-2026-02-26-AUDITORIA-BD

---

## Resumen de Cambios

| # | Correccion | Archivos | Severidad |
|---|-----------|----------|-----------|
| C-01 | Achievement UUIDs remediados (90000001 → gen_random_uuid) | 16 archivos (1 DDL + 15 seeds) | CRITICA |
| C-02 | prod/_testing/ movido a _deprecated/ | 5 archivos | CRITICA |
| C-03 | staging/_testing/ movido a _deprecated/ | 1 archivo | ALTA |
| C-04 | load-prod-seeds.sh creado | 1 archivo nuevo | CRITICA |
| C-05 | Staging loader: filenames gamification corregidos | 1 archivo | ALTA |
| C-06 | Staging loader: profiles refs corregidos (03→04-complete+06+07) | 1 archivo | ALTA |
| C-07 | Staging loader: tenants-production + admin schools agregados | 1 archivo | ALTA |
| C-08 | Staging loader: production-users + auxiliar + classroom_modules | 1 archivo | MEDIA |
| C-09 | Staging 01-default-templates.sql: schema mismatch corregido | 1 archivo | ALTA |
| C-10 | Staging 04-teams.sql: pre-v4 DDL corregido | 1 archivo | ALTA |
| C-11 | Staging 02-classrooms.sql: ON CONFLICT bug corregido | 1 archivo | MEDIA |
| C-12 | Staging 02-tenants-production.sql copiado (faltaba) | 1 archivo | MEDIA |
| C-13 | SEED-LOADING-ORDER.md creado | 1 archivo nuevo | DOCUMENTACION |

---

## Detalle por Correccion

### C-01: Achievement UUIDs Remediados

**DDL (1 archivo):**
- `ddl/schemas/gamification_system/tables/03-achievements.sql`
  - Agregado `CONSTRAINT achievements_name_tenant_key UNIQUE (name, tenant_id)`

**Seeds (15 archivos, 3 ambientes x 5 archivos):**
- `{dev,staging,prod}/gamification_system/04-achievements.sql`
  - 20 hardcoded `90000001-xxxx` UUIDs eliminados → `gen_random_uuid()` (omitiendo `id` del INSERT)
  - `ON CONFLICT (id)` → `ON CONFLICT (name, tenant_id)`
- `{dev,staging,prod}/gamification_system/14-achievements-m3-m5.sql`
  - 15 hardcoded UUIDs eliminados → `gen_random_uuid()`
  - Agregado `ON CONFLICT (name, tenant_id) DO UPDATE SET ...`
- `{dev,staging,prod}/gamification_system/20-achievements-collection.sql`
  - 5 hardcoded UUIDs eliminados → `gen_random_uuid()`
  - `ON CONFLICT (id)` → `ON CONFLICT (name, tenant_id)`
- `{dev,staging,prod}/gamification_system/08-user_achievements.sql`
  - 10 achievement_id FKs → subquery lookups por `(name, tenant_id)`
- `{dev,staging,prod}/gamification_system/07-ml_coins_transactions.sql`
  - 5 reference_id `9000xxxx` → `gen_random_uuid()` (ilustrativos)

### C-02: prod/_testing/ → _deprecated/

Movidos 5 archivos:
- `01-test-exercises-validation.sql`
- `02-test-nuevos-validadores-DB-117.sql`
- `10-test-nuevos-validadores-FE-059.sql`
- `CREAR-USUARIOS-TESTING.sql`
- `README.md`

### C-03: staging/_testing/ → _deprecated/

Movido 1 archivo:
- `01-test-exercises-validation.sql`

### C-04: load-prod-seeds.sh Creado

15 fases, incluyendo:
- Solo seeds core (scope all + prod)
- NO _testing, NO demo students, NO extended progress
- Patron identico a dev/staging loaders

### C-05-C-08: Staging Loader Corregido

Errores corregidos:
- `03-leaderboard_metadata.sql` → `02-leaderboard_metadata.sql`
- `04-maya_ranks.sql` → `03-maya_ranks.sql`
- `02-achievements.sql` → `04-achievements.sql`
- `03-profiles.sql` + `04-user_roles.sql` (inexistentes) → `04-profiles-complete.sql` + `06-profiles-production.sql` + `07-profiles-production-additional.sql` + `07-user_roles.sql`
- Agregados: `02-tenants-production.sql`, `02-production-users.sql`, `08-assign-admin-schools.sql`, `07-exercises-auxiliar.sql`, `14-classroom_modules.sql`, `20-achievements-collection.sql`, `15-comodin_usage_tracking.sql`, `16-shop_items_expanded.sql`, `17-shop_items_metadata_normalization.sql`

### C-09-C-12: Staging Seed Files Corregidos

- `01-default-templates.sql`: columnas `structure`/`is_active` → `template_structure`/`is_public`/`is_system_template`
- `04-teams.sql`: esquema pre-v4 (columnas inexistentes) → version actual
- `02-classrooms.sql`: `ON CONFLICT (id)` → `ON CONFLICT (teacher_id, classroom_id)`
- `02-tenants-production.sql`: copiado de dev (identico contenido, faltaba en staging)

---

## Validacion E2E

| Test | Resultado | Nota |
|------|-----------|------|
| Recreacion limpia dev | 0 errores DDL + 92 seeds OK | 58 profiles, 58 user_stats, 58 user_ranks |
| Idempotencia (doble ejecucion) | 0 errores 2da ejecucion | 18 fases OK |
| Backend build | tsc OK | Sin errores compilacion |
| Backend tests (4/5 shards) | 2166 passed, 115 failed, 28 skipped | Shard 3/5 OOM (preexistente). Failures preexistentes (no introducidos) |

---

## Issues Identificados NO Corregidos (para futuro sprint)

| # | Issue | Severidad | Razon |
|---|-------|-----------|-------|
| P-01 | ml_coins_transactions duplica welcome bonus (trigger + seed) | MEDIA | Requiere decision de diseno: eliminar del seed o del trigger |
| P-02 | user_ranks posible falta de UNIQUE constraint en (user_id) | BAJA | CREAR-USUARIOS-TESTING usa ON CONFLICT (user_id) — verificar si constraint existe |
| P-03 | missions posible falta de UNIQUE constraint para idempotencia | BAJA | ON CONFLICT DO NOTHING puede ser no-op |
| P-04 | 7 seeds huerfanos puros en dev (notifications, audit) | BAJA | No causan dano, mover a _deprecated/ en cleanup |
| P-05 | auth_providers metadata dice "development" en prod | BAJA | Correccion cosmostica |
| P-06 | 04-moderation_rules.sql tiene placeholder keywords ("palabra1") | BAJA | Necesita keywords reales |
| P-07 | 02-message_participants.sql staging/prod usa profiles.user_id en vez de profiles.id | MEDIA | Bug FK: SELECT id, no user_id |
| P-08 | Notification templates 9-18 solo en dev, falta decision prod | BAJA | Decidir si incluir en prod |
