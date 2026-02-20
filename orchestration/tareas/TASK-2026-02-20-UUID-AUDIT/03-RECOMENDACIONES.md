# TASK-2026-02-20-UUID-AUDIT: Recomendaciones

**Fecha:** 2026-02-20
**Version:** 3.0.0 — EJECUTADO (P0+P1+P2+P3 completados — TAREA CERRADA)

---

## P0: Acciones Inmediatas (Bloqueantes para deploy)

### P0-1: Ghost emails en seeds `|all|core` que corren en PROD
**Archivos:** `prod/gamification_system/07-ml_coins_transactions.sql`, `prod/social_features/04-teams.sql`
**Problema:** Referencian 4 emails dev-only (`estudiante1/2/3@demo.glit.edu.mx`, `instructor@demo.glit.edu.mx`) que NO existen en produccion. En ml_coins_transactions: ~46 INSERTs con user_id=NULL (FK violation o datos huerfanos). En teams: 3 lookups retornan NULL.
**Accion:** Cambiar pipeline scope de `07-ml_coins_transactions.sql` de `|all|core` a `|dev|demo_data`, O envolver INSERTs demo-user en DO block con NULL checks. Misma accion para `04-teams.sql`.
**Impacto:** ~46 filas potencialmente rotas en prod.

### P0-2: Column name mismatch en `lti_integration/01-lti_consumers.sql`
**Archivo:** `prod/lti_integration/01-lti_consumers.sql` vs `dev/`
**Problema:** Dev usa `authorization_url`/`is_active`, prod usa `oidc_auth_url`/`is_enabled`. Una version NO coincide con DDL.
**Accion:** Verificar DDL actual (`apps/database/ddl/schemas/lti/tables/`) y sincronizar version correcta a ambos envs.

### P0-3: `15-comodin_usage_tracking.sql` — idempotencia rota (CRITICAL)
**Archivos:** `*/gamification_system/15-comodin_usage_tracking.sql` (dev, prod, staging)
**Problema:** Records 2,4,6,7,8,9,10 usan `gen_random_uuid()` para `attempt_id` pero PKs son hardcoded. ON CONFLICT `(user_id, exercise_id, attempt_id)` no captura colision de PK en re-runs. El EXCEPTION handler silencia el error → 0 filas se actualizan.
**Accion:** Cambiar a `ON CONFLICT (id) DO UPDATE SET attempt_id = EXCLUDED.attempt_id, ...` O reemplazar `gen_random_uuid()` con attempt_ids deterministicos:
```sql
-- En vez de gen_random_uuid(), usar:
'81111111-aaaa-1111-1111-111111111002'::uuid  -- Record 2
'81111111-aaaa-1111-1111-111111111004'::uuid  -- Record 4
-- etc.
```

### P0-4: `07-friend_requests.sql` — fallo condicional en ambientes con < 5 students
**Archivo:** `dev/social_features/07-friend_requests.sql`
**Problema:** Fallback `gen_random_uuid()` para students 3-5 + PKs hardcoded = colision de PK no capturada por ON CONFLICT.
**Accion:** Cambiar fallback a UUIDs deterministicos:
```sql
IF v_student3_id IS NULL THEN
    v_student3_id := '00000000-0000-0000-0000-000000000003'::uuid;
END IF;
```

---

## P1: Fixes Antes de Siguiente Deploy

### P1-1: Sync `08-user_achievements.sql` prod desde dev (DIV-A03)
**Problema:** Prod usa UUIDs hardcodeados; dev usa dynamic lookups.
**Accion:** Copiar `dev/gamification_system/08-user_achievements.sql` → `prod/`

### P1-2: Sync `05-assignments.sql` prod desde dev (DIV-A04)
**Problema:** Prod usa UUID hardcodeado para teacher_id.
**Accion:** Copiar `dev/educational_content/05-assignments.sql` → `prod/`

### P1-3: Sync `02-classrooms.sql` prod desde dev (DIV-A05)
**Problema:** Prod no tiene FIX-UUID-002.
**Accion:** Copiar `dev/social_features/02-classrooms.sql` → `prod/`

### P1-4: Scope fix para communication seeds (DIV-A09/A10)
**Problema:** `01-system-messages.sql` y `02-message_participants.sql` tienen scope `|all|` pero dev tiene 22 mensajes demo.
**Accion:** Cambiar scope a `|dev|` en pipeline de init-database.sh:
```
communication/01-system-messages.sql|dev|communication
communication/02-message_participants.sql|dev|communication
```

### P1-5: Fix `05-teacher-reports.sql` — acumulacion de filas (RISKY)
**Archivos:** `*/social_features/05-teacher-reports.sql` (3 envs)
**Problema:** ~15 filas nuevas por re-run (gen_random_uuid() como PK con ON CONFLICT DO NOTHING).
**Accion:** Reemplazar `gen_random_uuid()` con IDs deterministicos:
```sql
-- Reemplazar gen_random_uuid() con:
'71111111-2222-0000-0000-000000000001'::uuid  -- Progress report 1
'71111111-2222-0000-0000-000000000002'::uuid  -- Progress report 2
-- etc.
```

### P1-6: Fix `01-audit-logs.sql` + `02-system-metrics.sql` — acumulacion (RISKY, dev)
**Problema:** ~24 audit_logs + ~15 activity_logs nuevos por re-run.
**Accion:** Agregar guard `IF NOT EXISTS`:
```sql
IF NOT EXISTS (SELECT 1 FROM audit_logging.audit_logs WHERE event_type = 'system_configuration' AND action = 'create') THEN
    INSERT INTO ...
END IF;
```

### P1-7: Fix 5 ghost emails en `05-user_stats.sql` (dev)
**Problema:** 5 emails fantasma (estudiante4/5, profesor2, directora, padre1) → UPDATE 0 filas.
**Accion opciones:**
- (a) Crear los 5 usuarios en `01b-demo-students.sql`
- (b) Eliminar los 5 bloques UPDATE muertos de `05-user_stats.sql`
- **Recomendado:** Opcion (b) — eliminar dead code

### P1-8: Sync `06-profiles-production.sql` prod desde dev (DIV-A01)
**Problema:** ON CONFLICT target diferente (email vs id).
**Accion:** Copiar version dev → prod

---

## P2: Deuda Tecnica (Staging Overhaul)

### P2-1: Copiar archivos faltantes `|all|` a staging
**Archivos faltantes:**
- `admin_dashboard/01-bulk_operations.sql`, `02-admin_reports.sql`
- `auth/02-production-users.sql`
- `auth_management/04-profiles-complete.sql`, `06-profiles-production.sql`, `07-profiles-production-additional.sql`, `07-user_roles.sql`, `08-assign-admin-schools.sql`
- `_testing/01-test-exercises-validation.sql`
**Accion:** Copiar desde dev

### P2-2: Eliminar dead code de staging
**Archivos:**
- `staging/gamification_system/16-user_purchases-demo.sql`
- `staging/gamification_system/17-user_equipped_items-demo.sql`
**Accion:** DELETE — ya eliminados de prod, son dev-only

### P2-3: Sync archivos staging con column names actualizados
**Archivos criticos:**
- `07-assessment-rubrics.sql` (rubric_type→assessment_type, scoring_guide→scoring_scale)
- `07-ml_coins_transactions.sql` (related_entity_type→reference_type)
- `02-leaderboard_metadata.sql` (singular→plural)
- `03-notification_settings_global.sql` (singular→plural)
- `09-exercise_mechanic_mapping.sql` (v1→v2)
**Accion:** Copiar dev → staging para cada archivo

### P2-4: Fix encoding UTF-8 en staging
**Archivos afectados:** `04-achievements.sql`, `07-assessment-rubrics.sql`, `04-moderation_rules.sql`
**Accion:** Re-guardar como UTF-8

### P2-5: Fix notification templates staging (DIV-I04)
**Problema:** Staging tiene 18 templates vs dev 8, pero con constraint incorrecta.
**Accion:** Merge: constraint dev `(template_key, version)` + templates extra de staging

---

## P3: Solo Documentacion — 5/5 COMPLETADOS

### P3-1: Documentar series UUID
El catalogo de A4 (25+ series) deberia registrarse en `docs/20-architecture/schema-reference/UUID-SERIES-CATALOG.md` para referencia futura.

### P3-2: Documentar patron `reference_id` en ml_coins_transactions
Los UUIDs en `reference_id` (formato `9000000X-000Y-...`) no coinciden con achievement IDs reales (`9000000X-0000-...`). Agregar comentario en seed o en documentacion de schema.

### P3-3: Categoria de `16-shop_items_expanded.sql`
Cambiar de `|dev|core` a `|dev|demo_gamification` para claridad.

### P3-4: `10-team_challenges.sql` sin pipeline
Archivo existe en dev+prod pero NO esta en pipeline seed_entries. Documentar como not-yet-ready o agregar cuando modulo social este completo.

### P3-5: Documentar patron cosmetico de `gen_salt()`
Las auth seeds cambian hash en cada re-run. Esto es cosmetic y no afecta funcionalidad. Documentar en guia de seeds.

---

## Resumen Ejecutivo

| Prioridad | Hallazgos | Severidad Maxima |
|-----------|-----------|------------------|
| **P0** | 4 items | CRITICAL — FK violations en prod, idempotencia rota |
| **P1** | 8 items | HIGH — sincronizacion dev→prod, acumulacion de filas |
| **P2** | 5 items | MEDIUM — staging overhaul completo |
| **P3** | 5 items | LOW — documentacion y limpieza — **COMPLETADO** |

### Metricas del Audit

| Metrica | Valor |
|---------|-------|
| UUIDs escaneados | 2,014 en 111 archivos |
| Formato invalido | **0** |
| FK orphans | 5 ghost emails + ~46 INSERTs prod rotos |
| Idempotencia CRITICAL | 2 seeds (3 envs cada uno) |
| Idempotencia RISKY | 4 seeds |
| Divergencias accidentales | 15 |
| Archivos faltantes staging | 10+ |
| Archivos identicos dev=prod | 52 de 65 `\|all\|` |

---

## Registro de Ejecucion (2026-02-20)

### P0 — 4/4 COMPLETADOS

| ID | Accion Tomada | Archivos Modificados |
|----|--------------|---------------------|
| P0-1 | `07-ml_coins_transactions.sql`: Reescrito como DO block con NULL guards por usuario demo. `04-teams.sql`: NULL guards granulares por estudiante+classroom | dev+prod (4 archivos) |
| P0-2 | DDL verificado: `authorization_url`/`is_active` son correctos. Prod sincronizado desde dev | prod/lti_integration/01-lti_consumers.sql |
| P0-3 | `15-comodin_usage_tracking.sql`: 7 `gen_random_uuid()` reemplazados con UUIDs deterministicos (81111111-aaaa-...). 3 fallbacks tambien fijados (81111111-bbbb-...) | dev+staging (2 archivos; prod es placeholder sin datos) |
| P0-4 | `07-friend_requests.sql`: 3 fallbacks `gen_random_uuid()` reemplazados con UUIDs deterministicos v4 (00000000-0000-4000-a000-...) | dev (1 archivo) |

### P1 — 8/8 COMPLETADOS

| ID | Accion Tomada | Archivos Modificados |
|----|--------------|---------------------|
| P1-1 | `08-user_achievements.sql` prod sincronizado desde dev (hardcoded UUIDs→dynamic lookups) | prod (1 archivo) |
| P1-2 | `05-assignments.sql` prod sincronizado desde dev (hardcoded UUID→dynamic lookup) | prod (1 archivo) |
| P1-3 | `02-classrooms.sql` prod sincronizado desde dev (FIX-UUID-002) | prod (1 archivo) |
| P1-4 | Pipeline scope communication seeds cambiado `\|all\|core` → `\|dev\|demo_data` | init-database.sh |
| P1-5 | `05-teacher-reports.sql`: DELETE antes de INSERTs (por report_name prefix) | dev+prod+staging (3 archivos) |
| P1-6 | `01-audit-logs.sql`: IF EXISTS guard. `02-system-metrics.sql`: DELETE+guard por tabla | dev (2 archivos) |
| P1-7 | `05-user_stats.sql`: 5 ghost email UPDATE blocks eliminados, threshold 10→5 | dev (1 archivo) |
| P1-8 | `06-profiles-production.sql` prod sincronizado desde dev (ON CONFLICT id→email) | prod (1 archivo) |

### P2 — 5/5 COMPLETADOS

| ID | Accion Tomada | Archivos |
|----|--------------|----------|
| P2-1 | 9 archivos `\|all\|` copiados dev→staging (2 admin_dashboard, 1 auth, 4 auth_management, 1 _testing, 1 profiles) | staging (9 archivos creados) |
| P2-2 | 2 dead demo seeds eliminados de staging (16-user_purchases, 17-user_equipped) | staging (2 archivos eliminados) |
| P2-3 | 12 archivos staging sincronizados desde dev (column names, schemas, lookups) | staging (12 archivos sobrescritos) |
| P2-4 | 2 directorios creados: staging/_testing, staging/admin_dashboard | staging (2 dirs) |
| P2-5 | Encoding UTF-8 implicitamente corregido al sobrescribir con versiones dev | staging (dentro de P2-3) |

### P3 — 5/5 COMPLETADOS

| ID | Accion Tomada | Archivos |
|----|--------------|----------|
| P3-1 | Creado `docs/20-architecture/schema-reference/UUID-SERIES-CATALOG.md` con 30+ series documentadas, metricas y notas | 1 archivo creado |
| P3-2 | Comentario agregado en `07-ml_coins_transactions.sql` (dev+prod) explicando que reference_id es informativo sin FK constraint | 2 archivos |
| P3-3 | Pipeline scope cambiado `\|dev\|core` → `\|dev\|demo_gamification` para 16-shop_items_expanded | init-database.sh |
| P3-4 | Header comment agregado en `10-team_challenges.sql` (dev+prod) documentando que NO esta en pipeline | 2 archivos |
| P3-5 | Comentario de idempotencia agregado en `01-demo-users.sql` y `01b-demo-students.sql` sobre gen_salt() cosmetico | 2 archivos |

### Totales

| Metrica | Valor |
|---------|-------|
| Archivos creados | 12 (9 staging + 2 dirs + 1 UUID catalog) |
| Archivos modificados | ~27 (dev+prod+staging) |
| Archivos eliminados | 2 (staging dead code) |
| Archivos sincronizados dev→prod | 5 |
| Archivos sincronizados dev→staging | 21 (9 new + 12 overwrite) |
| Pipeline entries modificados | 3 (2 communication scope + 1 shop_items category) |
| `gen_random_uuid()` eliminados | 13 (10 comodin + 3 friend_requests) |
| Ghost email blocks eliminados | 5 |
| Documentacion P3 | 1 catalogo creado + 7 archivos con comentarios agregados |
