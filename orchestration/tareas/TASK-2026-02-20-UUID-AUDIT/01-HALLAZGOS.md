# TASK-2026-02-20-UUID-AUDIT: Hallazgos

**Fecha:** 2026-02-20
**Version:** 1.0.0
**Tipo:** Auditoria integral de UUIDs y homologacion Dev/Prod
**Scope:** Todos los seeds en `apps/database/seeds/{dev,prod,staging}/`

---

## Seccion A: Catalogo de Formato UUID (Agent A)

### A1: Extraccion Completa

| Metrica | Valor |
|---------|-------|
| Archivos escaneados | 173 SQL seeds |
| Archivos con UUIDs | 111 |
| Ocurrencias totales | 2,014 |
| UUIDs unicos | ~210 |

### A2: Validacion de Formato

**Regex:** `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}` (case-insensitive)

**RESULTADO: 0 violaciones de formato.** Todos los 2,014 UUID literals pasan validacion PostgreSQL. No se encontraron UUIDs malformados (longitud incorrecta, caracteres invalidos, hyphens faltantes).

### A3: Clasificacion

| Categoria | Cantidad | Descripcion |
|-----------|----------|-------------|
| RFC 4122 v4 compliant | ~47 | Production users + tenant + classrooms |
| Structured-intentional | ~163 | Prefijos legibles para debugging (9000xxxx, 8000xxxx, etc.) |
| Malformados | **0** | Ninguno encontrado |

**Nota:** Los UUIDs estructurados intencionalmente (como `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`) NO son RFC 4122 v4 pero son validos en PostgreSQL. Esto es correcto por diseno.

### A4: Catalogo de Series UUID

| Prefijo | Dominio | Cantidad | Ejemplo |
|---------|---------|----------|---------|
| `00000000-*` | Nil/tenants testing | 4 | `00000000-0000-0000-0000-000000000001` |
| `aaaa..`/`bbbb..`/`cccc..` | Core test users (admin/teacher/student) | 6 | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` |
| `dddd..`/`eeee..`/`ffff..` | Demo students | 3 | `dddddddd-dddd-dddd-dddd-dddddddddddd` |
| `11111111-2222-*` | Instructor demo | 1 | `11111111-2222-3333-4444-555555555555` |
| `1000000x-*` | Role assignments | 8 | `10000001-0000-0000-0000-000000000001` |
| `10000000/20000000/30000000` | LTI consumers | 3 | `10000000-0000-0000-0000-000000000001` |
| `2000000x-*` | Mission templates | 13 | `20000001-0000-0000-0000-000000000001` |
| `21111111-*` | LTI sessions | 5 | `21111111-1111-1111-1111-111111111001` |
| `30000001-*` | Module dependencies | 6 | `30000001-0000-0000-0000-000000000001` |
| `31111111-*` | LTI grade passback | 6 | `31111111-1111-1111-1111-111111111001` |
| `40000001-*` | Taxonomies | 4 | `40000001-0000-0000-0000-000000000001` |
| `50000001-*` | Marie Curie content | 6 | `50000001-0000-0000-0000-000000000001` |
| `61111111-*` | Peer challenges | 10 | `61111111-1111-1111-1111-111111111001` |
| `71111111-*` | Team challenges | 10 | `71111111-1111-1111-1111-111111111001` |
| `8000000x-*` | Shop items + rubrics | ~40 | `80000001-0001-0000-0000-000000000001` |
| `80000006-*` | Shop items expanded | 11 | `80000006-0001-0000-0000-000000000001` |
| `81111111-*` | Comodin usage tracking | 10 | `81111111-1111-1111-1111-111111111001` |
| `9000000x-*` | Achievements | ~40 | `90000001-0000-0000-0000-000000000001` |
| `91111111-*` | Notification logs | 13 | `91111111-1111-1111-1111-111111111001` |
| `99999999-*` | System school | 1 | `99999999-9999-9999-9999-999999999999` |
| `a0eebc99-*` | Primary tenant (RFC v4) | 1 | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` |
| `a0000000-*`/`b0000000-*` | Bulk operations | 10 | `a0000000-0000-0000-0000-000000000001` |
| `a0000001-*` | Auth attempts | 8 | `a0000001-0000-0000-0000-000000000001` |
| `a1111111-*` | Notification queue | 8 | `a1111111-1111-1111-1111-111111111001` |
| `a1b2c3d4-*` | Content templates | 3 | `a1b2c3d4-0001-0000-0000-000000000001` |
| `a5500001-*` | Assignments | 9 | `a5500001-0000-0000-0000-000000000001` |
| `c0000001-*` | Communication messages | ~29 | `c0000001-0000-0000-0001-000000000001` |
| `d000000x-*` | ML Coins transactions | ~60 | `d0000001-0001-0000-0000-000000000001` |
| `e000000x-*` | User achievements | ~20 | `e0000001-0001-0000-0000-000000000001` |
| `e0000000-*` | Admin reports | 4 | `e0000000-0000-0000-0000-000000000001` |
| `18100000-*` | User purchases | 2 | `18100000-0000-0000-0000-000000000001` |
| `19100000-*` | User equipped items | 2 | `19100000-0000-0000-0000-000000000001` |
| Production UUIDs (RFC v4) | Real users | 45 | `b017b792-b327-40dd-aefb-a80312776952` |

### A5: Uso de `gen_random_uuid()` y Riesgo de Idempotencia

**Total:** ~85 llamadas en 16 archivos unicos.

| Riesgo | Archivos | Descripcion |
|--------|----------|-------------|
| **HIGH** | 8 | `gen_random_uuid()` como PK sin `ON CONFLICT` — duplicados en re-run |
| **MEDIUM** | 7 | `gen_random_uuid()` en audit/system tables |
| **LOW** | 3 | Con `ON CONFLICT` o solo como fallback |

Archivos HIGH risk:
1. `*/social_features/05-teacher-reports.sql` (3 envs) — ~15 filas nuevas por re-run
2. `dev/audit_logging/01-audit-logs.sql` — ~24 filas nuevas por re-run
3. `dev/audit_logging/02-system-metrics.sql` — ~15 filas nuevas por re-run
4. `*/notifications/02-notification_preferences_defaults.sql` (3 envs) — PK random
5. `dev/progress_tracking/03-manual-reviews.sql` — 3 inserts con PK random
6. `dev/00-dev-testing-student.sql` — exercise_attempt PK random
7. `dev/audit_logging/03-pending_user_initialization.sql` — 5 inserts PK random

### A6: Validacion de Formato PostgreSQL

**RESULTADO: 0 fallos.** Cada UUID literal cumple el formato 8-4-4-4-12 hexadecimal valido para PostgreSQL.

---

## Seccion B: Integridad de Cadena FK (Agent C)

### B1: Registro Canonico de Usuarios

**Total usuarios canonicos: 52** (3 core + 4 dev-only + 45 production)

**Core Testing (all envs):**

| Email | auth.users UUID | profiles.id |
|-------|-----------------|-------------|
| admin@gamilit.com | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa |
| teacher@gamilit.com | bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb | bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb |
| student@gamilit.com | cccccccc-cccc-cccc-cccc-cccccccccccc | cccccccc-cccc-cccc-cccc-cccccccccccc |

**Demo Students (dev only):**

| Email | auth.users UUID | profiles.id |
|-------|-----------------|-------------|
| estudiante1@demo.glit.edu.mx | dddddddd-dddd-dddd-dddd-dddddddddddd | dddddddd-dddd-dddd-dddd-dddddddddddd |
| estudiante2@demo.glit.edu.mx | eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee | eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee |
| estudiante3@demo.glit.edu.mx | ffffffff-ffff-ffff-ffff-ffffffffffff | ffffffff-ffff-ffff-ffff-ffffffffffff |
| instructor@demo.glit.edu.mx | 11111111-2222-3333-4444-555555555555 | 11111111-2222-3333-4444-555555555555 |

**Production (all envs): 45 users** via `02-production-users.sql` + `06-profiles-production.sql` + `07-profiles-production-additional.sql`.

**Patron:** `profiles.id = auth.users.id` para TODOS los usuarios (identidad unificada).

### B2: Registros de Entidades

| Entidad | Total | Archivo(s) Fuente | Tenant |
|---------|-------|-------------------|--------|
| Achievements | 40 | 04-achievements (20), 14-achievements-m3-m5 (15), 20-achievements-collection (5) | VALID |
| Shop Items | 20+ | 13-shop_items, 16-shop_items_expanded (dev) | VALID |
| Mission Templates | 13 | 10-mission_templates (5 daily, 6 weekly, 2 special) | VALID |
| Tenants | 1 | 01-tenants (a0eebc99-...) | N/A |
| Schools | 1 | 00-schools-default (99999999-...) | VALID |

### B3: Resultados de Validacion FK

| Clasificacion | Cantidad | Severidad |
|---------------|----------|-----------|
| **VALID** | 30+ refs | OK |
| **DYNAMIC-SAFE** | 25+ refs | OK — degradacion graceful |
| **NO-FK** | 5 refs | Baja — UUIDs informativos en `reference_id` de ml_coins_transactions |
| **ORPHAN/FRAGILE** | 5 refs | Media — dead code en 05-user_stats.sql |

**Hallazgos especificos:**

1. **5 Phantom Users en `05-user_stats.sql`** (dev only, lineas 508/552/640/720/760): estudiante4@, estudiante5@, profesor2@, directora@, padre1@ — UPDATE silencioso de 0 filas.

2. **`reference_id` en ml_coins_transactions** (lineas 80/137/213/484/660): UUIDs como `90000001-0001-...` parecen achievement IDs pero usan formato diferente al real (`90000001-0000-...`). Sin FK constraint — solo semanticamente confuso.

3. **Hardcoded UUID en prod/staging `08-user_achievements.sql`** (lineas 235-241): `cccccccc-...` en vez de dynamic lookup. Actualmente VALID pero inconsistente con patron del proyecto.

4. **Todas las demas cadenas FK validan correctamente:**
   - achievement_id → achievements: 10/10 VALID
   - shop_item refs → shop_items: 4/4 VALID
   - tenant_id → tenants: 100% VALID
   - mission_template → templates: DYNAMIC-SAFE
   - user_id → profiles: 47/52 VALID + DYNAMIC-SAFE (5 orphans)

---

## Seccion C: Referencias Fantasma (Agent D)

### C1: Registro Canonico de Emails

**52 emails totales** (3 core + 4 dev-only + 45 production). Ver seccion B1 para lista completa.

### C2: Ghost Emails

#### Ghosts en Dev (5 emails que NUNCA existen en NINGUN ambiente)

| # | Ghost Email | Archivo | Linea | Clasificacion | Impacto |
|---|-------------|---------|-------|---------------|---------|
| G1 | `estudiante4@demo.glit.edu.mx` | `dev/gamification_system/05-user_stats.sql` | 508 | **NO-OP BENIGNO** | UPDATE 0 filas |
| G2 | `estudiante5@demo.glit.edu.mx` | `dev/gamification_system/05-user_stats.sql` | 552 | **NO-OP BENIGNO** | UPDATE 0 filas |
| G3 | `profesor2@demo.glit.edu.mx` | `dev/gamification_system/05-user_stats.sql` | 640 | **NO-OP BENIGNO** | UPDATE 0 filas |
| G4 | `directora@demo.glit.edu.mx` | `dev/gamification_system/05-user_stats.sql` | 720 | **NO-OP BENIGNO** | UPDATE 0 filas |
| G5 | `padre1@demo.glit.edu.mx` | `dev/gamification_system/05-user_stats.sql` | 760 | **NO-OP BENIGNO** | UPDATE 0 filas |

#### Ghosts en Produccion (emails dev-only en seeds `|all|core`)

| # | Ghost Email(s) | Archivo (prod/) | Lineas | Clasificacion | Impacto |
|---|----------------|-----------------|--------|---------------|---------|
| PG1 | `estudiante1@demo.glit.edu.mx` | `gamification_system/05-user_stats.sql` | 444 | **NO-OP BENIGNO** | UPDATE 0 filas en prod |
| PG2 | `estudiante1@demo` (x28 INSERTs) | `gamification_system/07-ml_coins_transactions.sql` | 38-437 | **FK VIOLATION o NULL** | Subselect retorna NULL; ~28 filas con user_id=NULL o ERROR |
| PG3 | `estudiante2@demo` (x6 INSERTs) | `gamification_system/07-ml_coins_transactions.sql` | 461-556 | **FK VIOLATION o NULL** | ~6 filas afectadas |
| PG4 | `estudiante3@demo` (x8 INSERTs) | `gamification_system/07-ml_coins_transactions.sql` | 580-713 | **FK VIOLATION o NULL** | ~8 filas afectadas |
| PG5 | `instructor@demo` (x4 INSERTs) | `gamification_system/07-ml_coins_transactions.sql` | 764-767 | **FK VIOLATION o NULL** | ~4 filas afectadas |
| PG6 | `estudiante1/2/3@demo` | `social_features/04-teams.sql` | 66,71,76 | **SILENCIOSAMENTE INCORRECTO** | SELECTs retornan NULL profile IDs |

**Impacto total en PROD: ~46 INSERTs potencialmente rotos en ml_coins_transactions + 3 team member lookups NULL + 1 UPDATE 0 filas.**

### C3: Ghost UUIDs

**No se encontraron UUIDs fantasma en clausulas WHERE.** Todos los UUIDs hardcodeados son: (a) PKs siendo creados, (b) campos de metadata/log, o (c) dentro de statements no-op que nunca ejecutan.

---

## Seccion D: Analisis de Idempotencia (Agent E)

### D1: Catalogo de Funciones No-Deterministicas

| Funcion | Ocurrencias | Archivos | Impacto Principal |
|---------|-------------|----------|-------------------|
| `gen_random_uuid()` | ~85 | 16 unicos | PKs sin ON CONFLICT = duplicados |
| `crypt()/gen_salt()` | ~20 | 7 unicos | Cosmetico — hash diferente, misma password |
| `NOW()/CURRENT_TIMESTAMP` | ~400+ | Casi todos | Cosmetico — timestamps cambian |
| `random()` | ~30 | 6 unicos | Cosmetico — datos demo variables |

### D2: Clasificacion de Idempotencia

| Clasificacion | Cantidad Seeds | Seeds |
|---------------|----------------|-------|
| **CRITICAL** | 2 | `15-comodin_usage_tracking.sql` (3 envs), `07-friend_requests.sql` (condicional) |
| **RISKY** | 4 | `05-teacher-reports.sql` (3 envs), `01-audit-logs.sql`, `02-system-metrics.sql` |
| **COSMETIC** | 7+ | Auth seeds con `gen_salt()`, todos con `NOW()` en ON CONFLICT |
| **SAFE** | 10+ | Seeds con ON CONFLICT natural key o WHERE NOT EXISTS |

### D3: Deep-Dive en Casos Criticos

#### D3.1: `15-comodin_usage_tracking.sql` — CRITICAL

**Mecanismo:** ON CONFLICT target es `(user_id, exercise_id, attempt_id)`. Records 2,4,6,7,8,9,10 usan `gen_random_uuid()` para `attempt_id`. Pero el `id` (PK) es hardcoded (`81111111-...-001` a `010`).

**En segundo run:**
1. `attempt_id` es nuevo (random) → ON CONFLICT NO dispara
2. PostgreSQL intenta INSERT con PK `81111111-...-001` que YA existe
3. ON CONFLICT `(user_id, exercise_id, attempt_id)` NO captura violacion de PK
4. ERROR: `duplicate key value violates unique constraint "comodin_usage_trackings_pkey"`
5. EXCEPTION handler captura el error → NOTICE + 0 filas actualizadas

**Resultado:** En re-runs, el seed completo falla silenciosamente. Ningun record se actualiza aunque los datos necesiten refresh.

**Fix propuesto:** Cambiar ON CONFLICT a `(id)` o reemplazar `gen_random_uuid()` con attempt_ids deterministicos.

#### D3.2: `05-teacher-reports.sql` — RISKY (3 envs)

**Mecanismo:** 4 INSERTs usan `gen_random_uuid()` para PK `id`. `ON CONFLICT DO NOTHING` sin target especifico. Como el PK es siempre nuevo, el conflicto nunca se detecta.

**Resultado:** ~15 filas nuevas por re-run en dev, prod Y staging.

**Fix propuesto:** Usar IDs deterministicos o `DELETE FROM ... WHERE` antes de INSERTs.

#### D3.3: `01-audit-logs.sql` + `02-system-metrics.sql` — RISKY (dev)

**Mecanismo:** PKs auto-generados con `ON CONFLICT DO NOTHING` que nunca dispara.

**Resultado:** ~24 audit_logs + ~15 activity_logs nuevos por re-run.

**Fix propuesto:** Guard con `IF NOT EXISTS` o patron DELETE + INSERT.

#### D3.4: `07-friend_requests.sql` — CRITICAL (condicional)

**Mecanismo:** Cuando < 5 students existen, fallback usa `gen_random_uuid()` para requester/recipient_id. PKs hardcoded (`511...001-006`) colisionan en segundo run pero ON CONFLICT `(requester_id, recipient_id)` no captura la violacion de PK.

**Resultado:** En ambientes con < 5 students, el seed falla silenciosamente en re-runs.

**Fix propuesto:** Cambiar fallback a UUIDs deterministicos.
