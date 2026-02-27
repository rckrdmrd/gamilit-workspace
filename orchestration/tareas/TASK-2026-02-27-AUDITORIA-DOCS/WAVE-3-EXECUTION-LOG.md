# Wave 3: SSOT Designation + Legacy Cleanup — Execution Log

**Date:** 2026-02-27
**Status:** COMPLETED
**Subagents:** 5 (parallel)
**Total Files Modified:** ~35
**Tasks:** 9 (3.1 through 3.9)

---

## Task 3.1: Designate Deployment SSOT — COMPLETED

| File | Action | Lines |
|------|--------|-------|
| `docs/00-overview/DEPLOYMENT.md` | Reduced from 509 to 36 lines (redirect to SSOTs) | -473 |
| `docs/50-guides/deployment/_INDEX.md` | Fixed broken links, added SSOT designation, marked 3 archived files | ~32 |

**SSOTs designated:**
- Architecture: `docs/20-architecture/AMBIENTES-DEV-PROD.md`
- Operational: `docs/50-guides/deployment/GUIA-VALIDACION-PRODUCCION.md`

---

## Task 3.2: Consolidate Testing Documentation — COMPLETED

| File | Action | Lines |
|------|--------|-------|
| `docs/00-overview/TESTING-STRATEGY.md` | Reduced from 259 to 42 lines (redirect to SSOTs) | -217 |
| `docs/50-guides/testing/_INDEX.md` | **NEW** — Created with 26 lines listing all guides + exercise-guides/ | +26 |

**SSOTs designated:**
- Policy: `docs/40-standards/ESTANDAR-TESTING.md`
- Implementation: `docs/50-guides/testing/`

**Net content reduction:** 690 duplicative lines replaced by 78 focused redirect lines.

---

## Task 3.3: Reduce ONBOARDING-AGENTES.md — COMPLETED

| File | Action | Lines |
|------|--------|-------|
| `docs/70-onboarding/ONBOARDING-AGENTES.md` | Reduced from 189 to 65 lines | -124 |

**Kept:** First-session checklist, tool verification, common pitfalls, key aliases (top 10), essential reading links.
**Removed:** All duplicated content from CLAUDE.md (>70% of original).

---

## Task 3.4: Consolidate 99-delivery Manual Pairs — COMPLETED

6 files received [SUPERSEDED] deprecation banners:

| File | Superseded By |
|------|--------------|
| `Manual_Portal_Maestros_ACTUALIZADO.md` | `MANUAL-USUARIO-PORTAL-MAESTROS.md` (v3.0.0) |
| `Manual_Portal_Administrador_ACTUALIZADO.md` | `MANUAL-USUARIO-PORTAL-ADMINISTRADOR.md` (v2.0.0) |
| `Manual_Portal_Student_v1.0.md` | `MANUAL-USUARIO-PORTAL-ESTUDIANTE.md` (v2.0.0) |
| `RESUMEN_MANUALES.md` | `RESUMEN-CONSOLIDADO-ENTREGA.md` |
| `RESUMEN_ACTUALIZACION.md` | `RESUMEN-CONSOLIDADO-ENTREGA.md` |
| `RESUMEN_CORRECCIONES_FINALES.md` | `RESUMEN-CONSOLIDADO-ENTREGA.md` |

1 file updated: `RESUMEN-CONSOLIDADO-ENTREGA.md` — noted 3 RESUMENs now marked SUPERSEDED.

---

## Task 3.5: Mark Legacy Schema-Reference Sections — COMPLETED

8 deprecation banners added across schema-reference files:

| File | Legacy Section | Notes |
|------|---------------|-------|
| `01-auth.md` | Before `auth.user_profiles` | After real `auth.users` entry |
| `03-education.md` | Before `educational_modules` | All conceptual tables |
| `04-gamification.md` | Before `xp_transactions` | 8 conceptual tables in "XP y Niveles" |
| `05-social.md` | Before `teams` section | Column descriptions use legacy refs |
| `09-notifications.md` | Before `notification_templates` | Pre-v2.0 conceptual model |
| `12-leaderboard.md` | Top of file | Entire file is conceptual |
| `15-settings.md` | Before `settings.*` entries | Schema should be `system_configuration` |
| `16-audit.md` | Before `audit.*` entries | Schema should be `audit_logging` |

---

## Task 3.6: Mark Ghost Table Entries — COMPLETED

34 ghost tables annotated with `[NO DDL — conceptual only]`:

| File | Ghost Tables | Count |
|------|-------------|-------|
| `01-auth.md` | user_profiles, user_preferences, sessions, refresh_tokens, oauth_connections, password_resets, login_attempts | 7 |
| `03-education.md` | educational_modules, module_progress, exercise_types, exercise_results, exercise_feedback, contents, content_versions, content_categories, reading_assignments, spaced_repetition | 10 |
| `04-gamification.md` | xp_transactions, levels, rank_definitions, student_gamification, gamification_config, xp_multipliers, daily_xp_limits, streak_records | 8 |
| `09-notifications.md` | push_subscriptions | 1 |
| `12-leaderboard.md` | leaderboard_entries, leaderboard_seasons, leaderboard_history, season_rewards | 4 |
| `16-audit.md` | audit_logs, data_changes, access_logs | 3 |
| `18-admin-dashboard.md` | materialized_views_config | 1 |
| **TOTAL** | | **34** |

**Correctly NOT annotated:** `teams`, `team_challenges` (have DDL), `notification_queue`, `notification_templates` (have DDL), `system_settings`/`feature_flags`/`gamification_params` (have DDL under `system_configuration` schema).

---

## Task 3.7: Fix ADR Issues — COMPLETED

| Sub-item | ADR | Change |
|----------|-----|--------|
| 3.7.1 | ADR-040 | H1: "ADR-0001" → "ADR-040" |
| 3.7.2 | ADR-041 | H1: "ADR-0002" → "ADR-041" |
| 3.7.3 | ADR-042 | H1: Added "ADR-042" prefix |
| 3.7.4 | ADR-043 | H1: "ADR-2026-01-07" → "ADR-043" |
| 3.7.5 | ADR-043 | Estado: "APROBADO" → "Aceptada" (ADR-017 and ADR-021 already consistent) |
| 3.7.6 | README.md | Added ADR-046 through ADR-050 to table |
| 3.7.7 | _MAP.md | Fixed Architecture count 9→11, added UX/Responsive category for ADR-050 |
| 3.7.8 | _INDEX.md | ADR-011 status: "Accepted" → "Amended" |
| 3.7.9 | ADR-046-050 | All 5 already had "Alternatives Considered" sections — no changes needed |

---

## Task 3.8: Update GLOSARIO.md — COMPLETED

| Addition | Description |
|----------|------------|
| Exercise count disambiguation | Table explaining 23/27/30/33 counts with SSOT note |
| Sinonimos Aceptados | 5 synonym pairs (Docente/Maestro, Estudiante/Alumno, etc.) |
| Submission definition | With reference to `assignment_submissions` table |
| Attempt definition | Individual attempt within a submission |
| Mecanica (Mechanic) definition | With disambiguation note vs "tipo de ejercicio" |
| exercise_type count | Updated from "23 tipos" to "33 valores en ENUM DDL" |
| exercise_mechanic count | Updated to "30 mecanicas frontend" |

**Version:** 2.0.0 → 2.1.0

---

## Task 3.9: Fix ENUM Values — COMPLETED

### 3.9.1: user_status ENUM
**DDL SSOT:** `active`, `inactive`, `suspended`, `banned`, `pending`

| File | Change |
|------|--------|
| `US-PM-006-bloquear-alumnos-maestro.md` | Fixed `pending_verification`→`pending`, `deactivated`→`inactive`, added missing values |

### 3.9.2: auth_provider ENUM
**DDL SSOT:** `local`, `google`, `facebook`, `apple`, `microsoft`, `github` (schema: `auth_management`, not `public`)

| File | Change |
|------|--------|
| `ET-AUTH-003-oauth.md` | 3x `public.auth_provider` → `auth_management.auth_provider` |
| `RF-AUTH-003-oauth.md` | 4x `public.auth_provider` → `auth_management.auth_provider` |

---

## Summary

| Task | Files Modified | Key Impact |
|------|---------------|------------|
| 3.1 Deployment SSOT | 2 | 473 duplicative lines removed, SSOTs designated |
| 3.2 Testing SSOT | 2 | 217 duplicative lines removed, new _INDEX.md |
| 3.3 Onboarding dedup | 1 | 124 duplicated lines removed (70% reduction) |
| 3.4 Delivery manuals | 7 | 6 superseded + 1 updated |
| 3.5 Legacy banners | 8 | 8 deprecated sections marked |
| 3.6 Ghost tables | 9 | 34 ghost tables annotated |
| 3.7 ADR fixes | 8 | 4 H1 titles, 1 state, README/INDEX/MAP updated |
| 3.8 GLOSARIO | 1 | 3 definitions, disambiguation table, synonyms |
| 3.9 ENUM fixes | 3 | user_status + auth_provider corrected |
| **TOTAL** | **~35** | |

**Build validation:** Documentation-only changes — no code modified.
