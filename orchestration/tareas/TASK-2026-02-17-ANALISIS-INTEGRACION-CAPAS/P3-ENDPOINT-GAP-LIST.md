# P3 Controller-Endpoint Validation vs Flujos — Consolidated Gap List

**Date:** 2026-02-17 | **Flujos analyzed:** 51

## Summary

| Domain | Flujos | OK | Issues | Gap Rate |
|--------|--------|----|---------|---------|
| Auth+Shared | 6 | 5 | 1 | 17% |
| Student | 18 | 16 | 2 | 11% |
| Teacher | 9 | 7 | 2 | 22% |
| Admin | 11 | 8 | 3 | 27% |
| Parents | 7 | 5 | 2 | 29% |
| **TOTAL** | **51** | **41** | **10** | **20%** |

## Endpoint Gaps Identified

### GAP-01: FL-ADM-02 — `platform_settings.*` schema does NOT exist
- **Severity:** DOC_FIX
- **Issue:** Flujo references `platform_settings.*` in data layer, but no such schema exists. Real tables are in `system_configuration.*` managed by admin module
- **Fix:** Update FL-ADM-02 to reference `system_configuration.system_settings`, `system_configuration.feature_flags`, etc.

### GAP-02: FL-TCH-04 — `data_warehouse.*` has no backend endpoints
- **Severity:** ASPIRATIONAL
- **Issue:** Flujo references analytics/reports from data_warehouse, but ETL module is NOT imported. No controllers expose DW data.
- **Fix:** Mark as aspirational in flujo. Teacher analytics uses `admin-analytics.controller.ts` and `teacher.controller.ts` for available metrics.

### GAP-03: FL-ADM-11 — `data_warehouse.*` partially unavailable
- **Severity:** PARTIAL
- **Issue:** References `fact_daily_progress`, `fact_exercise_completions` — no direct backend exposure. However, `admin-reports.controller.ts` and `admin-progress.controller.ts` exist and serve report data from available schemas.
- **Fix:** Update flujo to clarify that DW-sourced reports are aspirational; current reports use progress_tracking directly.

### GAP-04: FL-PRN-03 — communication module has no controllers
- **Severity:** ARCH_GAP
- **Issue:** Notifications for parents reference `communication.*` but communication module is entity-only (no services, no controllers). Messages are consumed via TeacherModule's message service.
- **Fix:** Clarify in flujo that parent notifications use `notifications.*` schema, not `communication.*`.

### GAP-05: FL-SHR-03 — `/tenants/:id/branding` and `/tenants/:id/theme` endpoints
- **Severity:** MISSING_ENDPOINT
- **Issue:** White-label theming flujo. No dedicated branding/theme endpoints found. Tenant entity exists but lacks branding fields.
- **Fix:** Mark as aspirational/future feature in flujo.

### GAP-06: Dual friends controllers
- **Severity:** CODE_SMELL
- **Issue:** `friends.controller.ts` (@Controller('friends')) and `friendships.controller.ts` (@Controller(API_ROUTES.SOCIAL.BASE)) both exist
- **Impact:** Both registered in social.module.ts, both functional. `friends.controller.ts` handles friend requests/suggestions (Sprint 5), `friendships.controller.ts` handles core friendship CRUD (original). Not technically broken but confusing.
- **Fix (P6):** Document the dual-controller split or consolidate.

### GAP-07: FL-STU-14 — `social_features.leaderboard_entries` doesn't exist
- **Severity:** DOC_FIX
- **Issue:** Flujo references `leaderboard_entries` table but actual table is `gamification_system.leaderboard_metadatas`
- **Fix:** Update flujo reference.

### GAP-08: FL-ADM-06 — References `auth_management.login_attempts` (doesn't exist)
- **Severity:** DOC_FIX
- **Issue:** Real table is `auth_management.auth_attempts`
- **Fix:** Update flujo reference.

### GAP-09: FL-ADM-09 — References `admin_dashboard.system_alerts` and `admin_dashboard.performance_metrics`
- **Severity:** DOC_FIX
- **Issue:** These tables are in `audit_logging` schema, not `admin_dashboard`
- **Fix:** Update to `audit_logging.system_alerts`, `audit_logging.performance_metrics`

### GAP-10: FL-PRN-01..07 — Parent portal has 2 controllers but 7 flujos
- **Severity:** PARTIAL
- **Issue:** `parent-auth.controller.ts` (login/register) + `parent-portal.controller.ts` (dashboard/students/progress/notifications) cover 6 of 7 flujos. FL-PRN-03 (detailed notifications with communication) extends beyond current endpoints.
- **Fix:** Document coverage vs aspiration gap.

## Classification

| Category | Count | Action |
|----------|-------|--------|
| DOC_FIX (wrong table/schema reference in flujo) | 4 | Fix in P7 |
| ASPIRATIONAL (feature not yet built) | 2 | Mark in flujo |
| ARCH_GAP (structural code gap) | 1 | Document in P6 |
| CODE_SMELL (dual controllers) | 1 | Document in P6 |
| PARTIAL (backend exists but incomplete) | 1 | Track |
| MISSING_ENDPOINT (no backend support) | 1 | Track |
