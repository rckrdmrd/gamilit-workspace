# TASK-2026-02-20-UUID-AUDIT: Discrepancias Cross-Ambiente

**Fecha:** 2026-02-20
**Version:** 1.0.0
**Scope:** Comparacion de seeds entre dev, prod y staging

---

## 1. Inventario por Ambiente

| Directorio | Dev | Prod | Staging | Notas |
|------------|-----|------|---------|-------|
| `_testing/` | 4 | 3 | 0 | Staging sin directorio |
| `admin_dashboard/` | 2 | 2 | 0 | Staging sin directorio (pipeline `\|all\|`) |
| `audit_logging/` | 4 | 1 | 1 | Dev tiene extras demo |
| `auth/` | 3 | 2 | 1 | Staging sin `02-production-users.sql` |
| `auth_management/` | 13 | 8 | 4 | Staging severamente reducido |
| `communication/` | 2 | 2 | 2 | Contenido diverge significativamente |
| `content_management/` | 5 | 5 | 4 | |
| `educational_content/` | 15 | 16 | 12 | Prod tiene `14-classroom_modules.sql` (prod-only) |
| `gamification_system/` | 19 | 15 | 16 | Staging tiene 2 demos obsoletos |
| `lti_integration/` | 3 | 1 | 1 | |
| `notifications/` | 6 | 2 | 2 | |
| `progress_tracking/` | 14 | 1 | 1 | |
| `social_features/` | 10 | 9 | 7 | |
| `system_configuration/` | 6 | 5 | 5 | |
| Root `00-dev-testing-student.sql` | 1 | 0 | 0 | Dev-only |

**Pipeline:** 91 entradas totales — 65 `|all|`, 20 `|dev|`, 2 `|prod|`

---

## 2. Divergencias Accidentales (DEBEN sincronizarse)

### DIV-A01: `auth_management/06-profiles-production.sql`
- **Dev linea 520:** `ON CONFLICT (email) DO UPDATE SET`
- **Prod linea 520:** `ON CONFLICT (id) DO UPDATE SET`
- **Severidad:** MEDIUM
- **Accion:** Sync prod desde dev (email es el constraint correcto para matching)

### DIV-A02: `notifications/02-notification_preferences_defaults.sql`
- **Dev:** Comment explicando que COMMENT ON TABLE se omite (restriccion de ownership)
- **Prod/Staging:** Intenta `COMMENT ON TABLE` que falla como gamilit_user
- **Severidad:** LOW
- **Accion:** Sync prod y staging desde dev

### DIV-A03: `gamification_system/08-user_achievements.sql`
- **Dev v2.0.0:** Dynamic profile lookups (`SELECT p.id FROM auth.users u JOIN ...`)
- **Prod v1.0.0:** UUIDs hardcodeados (`2f5a9846-...`, `00c742d9-...`)
- **Severidad:** HIGH — hardcoded UUIDs fallan en cualquier ambiente con diferentes UUIDs
- **Accion:** Sync prod desde dev

### DIV-A04: `educational_content/05-assignments.sql`
- **Dev:** Dynamic profile lookup para teacher_id
- **Prod:** UUID hardcodeado (`bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`)
- **Severidad:** MEDIUM
- **Accion:** Sync prod desde dev

### DIV-A05: `social_features/02-classrooms.sql`
- **Dev (2026-01-18):** UUID v4 valid fallback, conflict on `(teacher_id, classroom_id)`
- **Prod (2026-01-08):** UUID fallback viejo, conflict on `(id)`
- **Severidad:** MEDIUM — FIX-UUID-002 no sincronizado
- **Accion:** Sync prod desde dev

### DIV-A06: `lti_integration/01-lti_consumers.sql`
- **Dev:** `authorization_url`, `is_active`, conflict on `(platform_id, client_id, deployment_id)`
- **Prod:** `oidc_auth_url`, `is_enabled`, conflict on `(platform_id, client_id)`, tiene `metadata`
- **Severidad:** HIGH — nombres de columna diferentes
- **Accion:** Verificar contra DDL y sincronizar version correcta

### DIV-A07: `gamification_system/04-achievements.sql`
- **Dev:** Explicit casts `category = 'progress'::gamification_system.achievement_category`
- **Prod:** Sin casts `category = 'progress'`
- **Severidad:** LOW — 14 lineas diferentes
- **Accion:** Sync prod desde dev (casts explicitos son mas robustos)

### DIV-A08: `gamification_system/10-mission_templates.sql`
- **Dev:** `IF v_count < 12` (espera 12 templates)
- **Prod/Staging:** `IF v_count < 10` (espera 10 templates)
- **Severidad:** LOW — threshold de verificacion no sincronizado
- **Accion:** Sync prod/staging desde dev

### DIV-A09: `communication/01-system-messages.sql` — SCOPE MISMATCH
- **Dev:** 22 mensajes, ~530 lineas (conversaciones demo expandidas)
- **Prod/Staging:** 1 mensaje (welcome announcement), ~100 lineas
- **Pipeline scope:** `|all|` — **INCORRECTO** para contenido demo
- **Severidad:** HIGH
- **Accion:** Cambiar pipeline scope a `|dev|` O crear version prod apropiada

### DIV-A10: `communication/02-message_participants.sql` — SCOPE MISMATCH
- Mismo problema que DIV-A09. Dev expandido vs prod/staging minimo.
- **Severidad:** HIGH
- **Accion:** Misma que DIV-A09

### DIV-A11: `gamification_system/07-ml_coins_transactions.sql`
- **Dev v2.0.0:** Dynamic profile lookups, `reference_type`/`reference_id`
- **Staging v1.0.0:** UUIDs hardcodeados, `related_entity_type`/`related_entity_id` (columnas viejas)
- **Severidad:** HIGH — nombres de columna diferentes
- **Accion:** Sync staging desde dev

### DIV-A12: `gamification_system/02-leaderboard_metadata.sql`
- **Dev:** `leaderboard_metadatas` (plural)
- **Staging:** `leaderboard_metadata` (singular)
- **Severidad:** MEDIUM — mismatch de tabla
- **Accion:** Verificar DDL y sincronizar

### DIV-A13: `educational_content/07-assessment-rubrics.sql`
- **Dev v1.1:** `module_id` dynamic lookup, `assessment_type`, `scoring_scale`, DO block
- **Staging v1.0:** Sin `module_id`, `rubric_type`, `scoring_guide`+`max_score`+`pass_threshold`
- **Severidad:** HIGH — schema DDL diferente
- **Accion:** Sync staging desde dev (dev tiene columnas correctas)

### DIV-A14: `educational_content/09-exercise_mechanic_mapping.sql`
- **Dev:** 1347 lineas, v2 con GAP-002 expansion
- **Staging:** 1083 lineas, v1
- **Severidad:** MEDIUM
- **Accion:** Sync staging desde dev

### DIV-A15: `system_configuration/03-notification_settings_global.sql`
- **Dev:** `notification_settings_globals` (plural)
- **Staging:** `notification_settings_global` (singular)
- **Severidad:** MEDIUM — mismatch de nombre tabla
- **Accion:** Verificar DDL y sincronizar

---

## 3. Divergencias Intencionales (OK, documentadas)

### DIV-I01: `gamification_system/05-user_stats.sql`
- Dev: 884 lineas (incluye FASE 0.5 + demo UPDATEs expandidos)
- Prod/Staging: 474 lineas (solo FASE 0.1)
- **Status:** CORRECTO — prod no necesita demo data extra

### DIV-I02: `educational_content/06-exercises-module5.sql`
- Dev incluye columnas pedagogicas (DB-125): `objective`, `how_to_solve`, etc.
- Prod NO incluye estas columnas
- **Status:** VERIFICAR — si columnas existen en DDL, sync es necesario

### DIV-I03: `content_management/02-marie_curie_content.sql`
- Dev: tabla singular `marie_curie_content`
- Prod: tabla plural `marie_curie_contents`
- Pipeline: scopes diferentes (`|dev|` vs `|prod|`)
- **Status:** VERIFICAR nombre correcto en DDL

### DIV-I04: `notifications/01-notification_templates.sql`
- Dev: 8 templates, `ON CONFLICT (template_key, version)`
- Staging: 18 templates, `ON CONFLICT (template_key)` (constraint incorrecta)
- **Status:** MERGE necesario — constraint dev + templates extra staging

---

## 4. Dead Code

| ID | Archivo | Ubicacion | Pipeline | Accion |
|----|---------|-----------|----------|--------|
| D01 | `16-shop_items_expanded.sql` | dev only | `\|dev\|core` | OK — categoria deberia ser `demo_gamification` |
| D02 | `16-user_purchases-demo.sql` + `17-user_equipped_items-demo.sql` | staging | Eliminados de prod, aun en staging | **ELIMINAR** de staging |
| D03 | `10-team_challenges.sql` | dev + prod | No en pipeline | Documentar como not-yet-ready o agregar |
| D04 | `14-classroom_modules.sql` | prod only | `\|prod\|core` | OK — considerar crear version dev para testing |

---

## 5. Archivos Faltantes

| ID | Archivo/Directorio | Faltante en | Pipeline | Severidad | Accion |
|----|--------------------|-------------|----------|-----------|--------|
| M01 | `_testing/` dir completo | Staging | N/A | LOW | Copiar `01-test-exercises-validation.sql` |
| M02 | `admin_dashboard/` dir completo | Staging | `\|all\|` | HIGH | Pipeline espera estos archivos |
| M03 | 9 archivos `auth_management/` | Staging | Varios `\|all\|` | HIGH | Copiar desde dev |
| M04 | `auth/02-production-users.sql` | Staging | `\|all\|core` | HIGH | Copiar desde dev |

---

## 6. Archivos Identicos (Verificados dev=prod, sin accion)

**52 de 65 entradas `|all|` son identicas** entre dev y prod. Archivos verificados:

- `auth/01-demo-users.sql`, `auth/02-production-users.sql`
- `auth_management/01-tenants.sql`, `02-tenants-production.sql`, `02-auth_providers.sql`, `04-profiles-complete.sql`, `07-profiles-production-additional.sql`, `07-user_roles.sql`, `08-assign-admin-schools.sql`
- `system_configuration/01-system_settings.sql`, `01-feature_flags_seeds.sql`, `02-gamification_parameters_seeds.sql`, `04-rate_limits.sql`
- `notifications/01-notification_templates.sql`
- `gamification_system/01-achievement_categories.sql`, `02-leaderboard_metadata.sql`, `03-maya_ranks.sql`, `04-achievements.sql` (excepto casts), `06-user_ranks.sql`, `07-ml_coins_transactions.sql`, `09-comodines_inventory.sql`, `12-shop_categories.sql`, `13-shop_items.sql`, `14-achievements-m3-m5.sql`, `15-comodin_usage_tracking.sql`, `17-shop_items_metadata_normalization.sql`, `20-achievements-collection.sql`
- `educational_content/01-modules.sql` a `04-exercises-module3.sql`, `07-assessment-rubrics.sql` a `13-exercise_type_rubrics.sql`
- `content_management/01-default-templates.sql`, `03-tags.sql`, `04-moderation_rules.sql`
- `social_features/00-schools-default.sql`, `01-schools.sql`, `02-classrooms.sql` (excepto DIV-A05), `03-classroom-members.sql`, `04-teams.sql`, `05-teacher-reports.sql`, `08-peer_challenges.sql`
- `progress_tracking/01-module_progress.sql`
- `audit_logging/01-default-config.sql`
- `admin_dashboard/01-bulk_operations.sql`, `02-admin_reports.sql`

---

## 7. Problemas de Encoding (Staging)

Multiples archivos staging muestran corrupcion UTF-8 donde caracteres acentuados aparecen como replacement characters:
- `04-achievements.sql`: `produccion` → `producci\xa2n`
- `07-assessment-rubrics.sql`: Todos los acentos corruptos
- `04-moderation_rules.sql`: Acentos corruptos

**Causa probable:** Archivos guardados como Latin-1/Windows-1252 en vez de UTF-8.

---

## 8. Evaluacion General de Staging

**Staging esta severamente desactualizado.** Aparenta ser una copia de una version temprana sin sincronizacion sistematica:
- 16+ archivos con nombres de columna antiguos que no coinciden con DDL actual
- 6+ archivos `|all|` faltantes que el pipeline espera
- 2 archivos demo eliminados de prod aun presentes
- Sin directorios `_testing/` o `admin_dashboard/`
- Problemas de encoding UTF-8 en multiples archivos
