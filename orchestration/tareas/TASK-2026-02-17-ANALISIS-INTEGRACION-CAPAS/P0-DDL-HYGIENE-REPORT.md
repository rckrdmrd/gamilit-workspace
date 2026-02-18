# P0-DDL-HYGIENE-REPORT

## DDL Hygiene Audit Report

**Project:** gamilit-workspace | **Date:** 2026-02-17 | **Status:** Analysis Complete

---

## 1. Numbering Collisions in social_features/tables/ (3 pairs)

| Collision | File A | File B | Resolution |
|-----------|--------|--------|------------|
| `11-` | `11-peer_challenges.sql` (EXT-009, Nov 2025) | `11-scheduled_reports.sql` (Sprint 5.1, Jan 2026) | Rename reports → `08b-scheduled_reports.sql` |
| `12-` | `12-challenge_participants.sql` (EXT-009) | `12-shared_reports.sql` (Sprint 5.3) | Rename reports → `08c-shared_reports.sql` |
| `27-` | `27-team_vs_team_challenges.sql` (GAP-SOC-002) | `27-user_reports.sql` (GAP-SOC-005) | Rename user_reports → `28-user_reports.sql` |

**Strategy:** Keep older tables at established numbers. Teacher reporting files (scheduled_reports, shared_reports) moved to group with `08-teacher_reports.sql`. Alphabetical sort preserves FK order: `08-` < `08b-` < `08c-`.

## 2. auth_management Roles Naming

| File | Creates Table | Issue |
|------|---------------|-------|
| `03b-roles.sql` | `auth_management.roles` (role catalog) | Correct naming |
| `04-roles.sql` | `auth_management.user_roles` (assignments) | **Misleading** — rename to `04-user_roles.sql` |

Note: `user_roles` uses `gamilit_role` ENUM directly, does NOT FK to `roles` table.

## 3. admin_dashboard Numbering Gap (07-09, missing 01-06)

**Root cause:** Tables were originally numbered as part of audit_logging sequence. `audit_logging` gap at position 07 confirms the split. Renumber to 01-03 for consistency.

## 4. Schema Prerequisites Validation

| Finding | Severity | Action |
|---------|----------|--------|
| `data_warehouse` not in 00-prerequisites.sql | LOW | Acceptable (self-contained 00-schema.sql with DROP CASCADE) |
| `storage` schema — no DDL directory | LOW | Placeholder schema, document or remove |
| Redundant CREATE SCHEMA in 3 per-schema files | LOW | Safe (IF NOT EXISTS), files add grants/comments |
| ENUMs dual-defined in prerequisites AND per-schema | MEDIUM | Complete REMOVIDO migration |
| ~40 unnumbered table files (24%) | INFO | FK-aware load order audit needed |

## 5. Applied Fixes

- [x] `11-scheduled_reports.sql` → `08b-scheduled_reports.sql`
- [x] `12-shared_reports.sql` → `08c-shared_reports.sql`
- [x] `27-user_reports.sql` → `28-user_reports.sql`
- [x] `04-roles.sql` → `04-user_roles.sql`
- [x] `07-bulk_operations.sql` → `01-bulk_operations.sql`
- [x] `08-admin_reports.sql` → `02-admin_reports.sql`
- [x] `09-metrics_history.sql` → `03-metrics_history.sql`
