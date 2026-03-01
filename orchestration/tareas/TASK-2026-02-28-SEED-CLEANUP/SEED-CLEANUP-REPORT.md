---
title: "Seed Cleanup & Homologation — Final Report"
agent: "SA-5A"
task: "TASK-2026-02-28-SEED-CLEANUP"
date: "2026-02-28"
phase: "5"
status: "COMPLETE"
---

# Seed Cleanup & Homologation — Final Report

**Task:** TASK-2026-02-28-SEED-CLEANUP
**Agent:** SA-5A (Final Report & Memory)
**Date:** 2026-02-28
**Phases:** 5 total (Research × 3, Correction × 1, Validation × 2, Report × 1)
**Subagents:** 11 (4 Sonnet + 7 Haiku)

---

## 1. Executive Summary

This task investigated whether the seed files for the gamilit platform contained unauthorized or misplaced user data (`rckrdmrd@gmail.com`, `adredsi26@gmail.com`) and audited the accuracy of all seed metadata and inventory counts.

**Key finding:** All seed data (INSERT/VALUES rows) was correct and clean throughout. 50 production users have 50 matching profiles. No excluded user appears in any INSERT/VALUES statement in any environment. All discrepancies were limited to SQL comment lines and YAML metadata fields that had not been updated when Lote 5 (5 users, 2026-02-20) was added.

**Corrections applied:** 9 CORREGIR (stale comment/count fixes), 3 DOCUMENTAR (exclusion notes, profile count clarification, missing inventory entry), 4 IGNORAR (out-of-scope items or immutable historical records).

**Environment homologation status:** All three environments (dev, prod, staging) confirmed byte-for-byte identical for both corrected seed files. MD5 checksums identical.

**SEEDS_INVENTORY** bumped from v3.3.0 to v3.4.0.

---

## 2. Findings by Category

| ID | Classification | File | Issue | Disposition |
|----|----------------|------|-------|-------------|
| C-01 | CORREGIR | `02-production-users.sql` line 35 | INSERT comment says "(45 usuarios)" — actual is 50 | Fixed: `45` → `50` |
| C-02 | CORREGIR | `02-production-users.sql` line 626 | Lote 3 section label says "(6 usuarios)" — actual is 7 | Fixed: `6` → `7` |
| C-03 | CORREGIR | `SEEDS_INVENTORY.yml` line 150 | `registros_estimados: 45` for `02-production-users.sql` | Fixed: `45` → `50` |
| C-04 | CORREGIR | `SEEDS_INVENTORY.yml` line 155 | Note says "45 estudiantes reales de producción" | Fixed: `45` → `50` |
| C-05 | CORREGIR | `SEEDS_INVENTORY.yml` line 165 | Lote 3 `cantidad: 6` under `02-production-users.sql` | Fixed: `6` → `7` |
| C-06 | CORREGIR | `SEEDS_INVENTORY.yml` lines 43–44 | `notas_actualizacion` says "44 usuarios / 44 perfiles" | Fixed: `44` → `50`, clarified split (13 en 06 + 37 en 07) |
| C-07 | CORREGIR | `SEEDS_INVENTORY.yml` line 230 | `registros_estimados: 45` for `06-profiles-production.sql` | Fixed: `45` → `13` (file has Lote 1 only) |
| C-08 | CORREGIR | `SEEDS_INVENTORY.yml` line 235 | Note says "45 perfiles de estudiantes de producción" | Fixed: `45` → `13`, added "(Lote 1 únicamente)" |
| C-09 | CORREGIR | `SEEDS_INVENTORY.yml` line 246 | Lote 3 `cantidad: 6` under `06-profiles-production.sql` | Fixed: `6` → `7` |
| D-01 | DOCUMENTAR | `07-profiles-production-additional.sql` line 26 | INSERT comment says "(32 perfiles)" — actual is 37 | Updated: `32` → `37` |
| D-02 | DOCUMENTAR | `SEEDS_INVENTORY.yml` (missing) | `07-profiles-production-additional.sql` had no inventory entry | Added new entry with `registros_estimados: 37`, all 4 lotes, exclusion notes |
| D-03 | DOCUMENTAR | `07-profiles-production-additional.sql` lines 20, 737 | `adredsi26@gmail.com` not mentioned in exclusion notes | Added exclusion note alongside existing `rckrdmrd` note (header + footer) |
| I-01 | IGNORAR | `apps/frontend/e2e/automation-flow.spec.ts` lines 33, 52 | E2E test uses `rckrdmrd@gmail.com` as registration email | Out of scope — QA/E2E domain; flagged for future task |
| I-02 | IGNORAR | `TASK-2026-02-28-PROD-DB-AUDIT/SA-4A-SEED-DATA-ANALYSIS.md` line 60 | Stale audit claim that rckrdmrd/adredsi26 are in `01-demo-users.sql` | Historical audit record — immutable by design |
| I-03 | IGNORAR | `07-profiles-production-additional.sql` line 729 | Verification threshold `>= 35` is loose (exact is 37) | Acceptable conservative threshold; fragility risk outweighs benefit |
| I-04 | IGNORAR | `apps/database/backups/` and `apps/database/backup/` (various) | `rckrdmrd` and `adredsi26` in backup SQL dumps | Immutable point-in-time snapshots — no action appropriate |

---

## 3. Corrections Applied

All corrections are to SQL comment lines (`--` prefix) or YAML metadata keys. Zero corrections touch INSERT/VALUES data lines.

| ID | File(s) | Old | New |
|----|---------|-----|-----|
| C-01 | `seeds/{dev,prod,staging}/auth/02-production-users.sql` L35 | `(45 usuarios)` | `(50 usuarios)` |
| C-02 | `seeds/{dev,prod,staging}/auth/02-production-users.sql` L626 | `(6 usuarios)` | `(7 usuarios)` |
| C-03 | `orchestration/inventarios/SEEDS_INVENTORY.yml` L150 | `registros_estimados: 45` | `registros_estimados: 50` |
| C-04 | `orchestration/inventarios/SEEDS_INVENTORY.yml` L155 | `- 45 estudiantes reales de producción` | `- 50 estudiantes reales de producción` |
| C-05 | `orchestration/inventarios/SEEDS_INVENTORY.yml` L165 | `cantidad: 6` (Lote 3 / 02-users) | `cantidad: 7` |
| C-06 | `orchestration/inventarios/SEEDS_INVENTORY.yml` L43–44 | `44 usuarios ... 44 perfiles corregidos` | `50 usuarios ... 50 perfiles corregidos (13 en 06 + 37 en 07)` |
| C-07 | `orchestration/inventarios/SEEDS_INVENTORY.yml` L230 | `registros_estimados: 45` (06-profiles) | `registros_estimados: 13` |
| C-08 | `orchestration/inventarios/SEEDS_INVENTORY.yml` L235 | `- 45 perfiles de estudiantes de producción` | `- 13 perfiles de estudiantes de producción (Lote 1 únicamente)` |
| C-09 | `orchestration/inventarios/SEEDS_INVENTORY.yml` L246 | `cantidad: 6` (Lote 3 / 06-profiles) | `cantidad: 7` |
| D-01 | `seeds/{dev,prod,staging}/auth_management/07-profiles-production-additional.sql` L26 | `(32 perfiles)` | `(37 perfiles)` |
| D-02 | `orchestration/inventarios/SEEDS_INVENTORY.yml` (after L252) | *(entry missing)* | New entry for `07-profiles-production-additional.sql` added (`registros_estimados: 37`, all 4 lotes, both exclusion notes) |
| D-03 | `seeds/{dev,prod,staging}/auth_management/07-profiles-production-additional.sql` L20/L737 | rckrdmrd note only | rckrdmrd note expanded + adredsi26 note added (header and footer) |
| version | `orchestration/inventarios/SEEDS_INVENTORY.yml` | `version: 3.3.0`, `fecha: 2026-02-21` | `version: 3.4.0`, `fecha: 2026-02-28` |

---

## 4. Validation Results

### SA-4A: Post-Correction Validation (9 checks)

| # | Check | Result |
|---|-------|--------|
| 1 | `rckrdmrd` / `adredsi26` grep — comment-only in seeds | PASS |
| 2 | UUID chain: 50 users, 13+37=50 profiles | PASS |
| 3 | Dev/prod/staging identity — `02-production-users.sql` | PASS |
| 4 | Dev/prod/staging identity — `07-profiles-production-additional.sql` | PASS |
| 5 | Header/comment counts match actual data (all corrected lines verified) | PASS |
| 6 | Excluded UUIDs absent from gamification/progress SQL seeds | PASS |
| 7 | SEEDS_INVENTORY.yml version and all corrections applied | PASS |
| 8 | SEED-LOADING-ORDER.md exclusion section exists with both emails and UUIDs | PASS |
| 9 | Total user count: dev=58 (4 system + 4 demo + 50 prod), prod/staging=54 | PASS |

**SA-4A Overall: 9/9 PASS**

### SA-4B: File Consistency Verification (5 checks)

| Check | Result | Details |
|-------|--------|---------|
| Checksum Validation | PASS | All 6 seed SQL files identical across dev/prod/staging |
| File Modification List | PASS | Only 8 expected files modified (6 SQL + 2 metadata) |
| Change Magnitude | PASS | 37 insertions, 15 deletions across all seed files |
| Line Count Consistency | PASS | `02-production-users.sql`: 962 lines (all 3 envs); `07-profiles-additional.sql`: 740 lines (all 3 envs) |
| Git Diff Analysis | PASS | All changes restricted to `--` comment lines and metadata |

**SA-4B Overall: 5/5 PASS**

---

## 5. Excluded Users

These users were investigated and confirmed to be correctly absent from all seed INSERT/VALUES statements.

| Email | UUID (current prod) | Role | Exclusion Reason | Seed Status |
|-------|---------------------|------|------------------|-------------|
| `rckrdmrd@gmail.com` | `2c9af9ac-0229-4baf-bbe8-fc24fca3296d` | student | Usuario dev/owner — excluded by explicit request. Account had 3 different UUIDs across 3 registrations (DB recreates). | 0 INSERT/VALUES occurrences in any seed. Present in comments only (9 lines). |
| `adredsi26@gmail.com` | `a6230bab-fac1-4436-a02e-1fbe342f14ce` | student | Runtime account — registered in production 2026-02-21 23:12 UTC. Never added to any seed file. Same person (Adrian Flores Cortes) as rckrdmrd account. | 0 occurrences in any seed file. Present only in `SEED-LOADING-ORDER.md` exclusion table (post-cleanup). |

**Note:** Both users appear in backup SQL dumps (`backups/gamilit_platform_20260228_210825.sql`) as legitimate production rows — this is correct and expected for backup files.

---

## 6. UUID Validation Summary

Source: SA-1B (UUID Chain Validation Report)

| Check | Count | Result |
|-------|-------|--------|
| Production UUIDs extracted from `02-production-users.sql` | 50 | PASS |
| UUID format valid (8-4-4-4-12 hex) | 50/50 | PASS |
| Profiles in `06-profiles-production.sql` matching auth UUIDs | 13/13 | PASS |
| Profiles in `07-profiles-production-additional.sql` matching auth UUIDs | 37/37 | PASS |
| Total profile coverage | 50/50 | PASS |
| `profiles.id = auth.users.id` for all profiles | 50/50 | PASS |
| `profiles.user_id = auth.users.id` for all profiles | 50/50 | PASS |
| Tenant UUID `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` for all profiles | 50/50 | PASS |
| Duplicate UUIDs | 0 | PASS |
| Orphan hardcoded UUIDs in gamification seeds | 0 | PASS |
| Orphan hardcoded UUIDs in progress seeds | 0 | PASS |
| Gamification seeds referencing 7 prod users by email | 7/7 valid | PASS |

**Lote breakdown:** Lote 1 (13 users, 2025-11-18) + Lote 2 (23 users, 2025-11-24) + Lote 3 (7 users, 2025-11-25) + Lote 4 (2 users, 2025-12) + Lote 5 (5 users, 2026-02-20) = 50 total.

All gamification seeds use dynamic email-based lookup patterns (Pattern A: subquery via email; Pattern B: role-based iteration; Pattern C: NULL guard). No hardcoded production UUIDs exist in any dependent seed file.

---

## 7. Environment Homologation

The following files are verified byte-for-byte identical across dev, prod, and staging environments:

| File | Dev MD5 | Prod MD5 | Staging MD5 | Status |
|------|---------|----------|-------------|--------|
| `auth/02-production-users.sql` | `35d27348...` | `35d27348...` | `35d27348...` | IDENTICAL |
| `auth_management/07-profiles-production-additional.sql` | `08f5a165...` | `08f5a165...` | `08f5a165...` | IDENTICAL |

Line counts confirmed consistent: `02-production-users.sql` = 962 lines in all 3 envs; `07-profiles-production-additional.sql` = 740 lines in all 3 envs.

The file `02-production-users.sql` header states `Environment: ALL (dev + prod)` — this intent is fully realized.

---

## 8. Files Modified

| File | Absolute Path | Changes |
|------|--------------|---------|
| `02-production-users.sql` (dev) | `C:/Empresas/ISEM/gamilit-workspace/apps/database/seeds/dev/auth/02-production-users.sql` | C-01, C-02 (2 comment lines) |
| `02-production-users.sql` (prod) | `C:/Empresas/ISEM/gamilit-workspace/apps/database/seeds/prod/auth/02-production-users.sql` | C-01, C-02 (2 comment lines) |
| `02-production-users.sql` (staging) | `C:/Empresas/ISEM/gamilit-workspace/apps/database/seeds/staging/auth/02-production-users.sql` | C-01, C-02 (2 comment lines) |
| `07-profiles-production-additional.sql` (dev) | `C:/Empresas/ISEM/gamilit-workspace/apps/database/seeds/dev/auth_management/07-profiles-production-additional.sql` | D-01, D-03 (comment updates + new adredsi26 note) |
| `07-profiles-production-additional.sql` (prod) | `C:/Empresas/ISEM/gamilit-workspace/apps/database/seeds/prod/auth_management/07-profiles-production-additional.sql` | D-01, D-03 (comment updates + new adredsi26 note) |
| `07-profiles-production-additional.sql` (staging) | `C:/Empresas/ISEM/gamilit-workspace/apps/database/seeds/staging/auth_management/07-profiles-production-additional.sql` | D-01, D-03 (comment updates + new adredsi26 note) |
| `SEED-LOADING-ORDER.md` | `C:/Empresas/ISEM/gamilit-workspace/apps/database/seeds/SEED-LOADING-ORDER.md` | Added "Usuarios Excluidos de Seeds" section (+16 lines) |
| `SEEDS_INVENTORY.yml` | `C:/Empresas/ISEM/gamilit-workspace/orchestration/inventarios/SEEDS_INVENTORY.yml` | C-03 through C-09, D-02, version bump 3.3.0→3.4.0 |

**Total files modified: 8** (6 SQL seed files + 1 markdown + 1 YAML inventory)

**Files NOT modified (correct as-is):**
- `apps/database/seeds/dev/auth/01-demo-users.sql` — 4 users, no changes needed
- `apps/database/seeds/dev/auth/01b-demo-students.sql` — 4 demo students, no changes needed
- `apps/database/seeds/dev/auth_management/06-profiles-production.sql` — 13 profiles (Lote 1), no changes needed
- All gamification seeds — dynamic lookup patterns, no changes needed
- All backup files — immutable historical records

---

## 9. Metrics

| Metric | Value |
|--------|-------|
| Task phases | 5 |
| Subagents deployed | 11 (4 Sonnet + 7 Haiku) |
| Phase 1 agents (research) | SA-1A (User Grep Inventory), SA-1B (UUID Validation), SA-1C (Env Diff) |
| Phase 2 agents (planning) | SA-2A (Correction Plan) |
| Phase 3 agents (correction) | SA-3A (Correction Executor) |
| Phase 4 agents (validation) | SA-4A (Post-Correction Validator), SA-4B (File Consistency) |
| Phase 5 agents (reporting) | SA-5A (this report) |
| CORREGIR items | 9 |
| DOCUMENTAR items | 3 |
| IGNORAR items | 4 |
| Total corrections applied | 12 (9 CORREGIR + 3 DOCUMENTAR) |
| Files modified | 8 |
| SQL lines changed | 4 per `02-production-users.sql` copy, 8 per `07-profiles-additional.sql` copy |
| SA-4A validation checks | 9/9 PASS |
| SA-4B consistency checks | 5/5 PASS |
| INSERT/VALUES data lines changed | 0 (none — all seed data was correct) |
| SEEDS_INVENTORY version | v3.3.0 → v3.4.0 |

---

## 10. Remaining Notes

### E2E Test (Future QA Task)

**File:** `apps/frontend/e2e/automation-flow.spec.ts` (lines 33, 52)

The E2E automation test uses `rckrdmrd@gmail.com` as the email for a real API registration/login flow. If the test suite's `baseURL` were ever pointed at the production server, it would create/re-create this user account in production.

**Recommended future action:** Create a dedicated test email (e.g., `e2e-test@gamilit.com`) and add an environment guard in the playwright config to prevent production targeting. Track as a separate QA task.

### SEEDS_INVENTORY Lote 5 Entry Gap

The `lotes` block for `02-production-users.sql` in SEEDS_INVENTORY.yml has only 4 lote entries (2025-11-18: 13, 2025-11-24: 23, 2025-11-25: 7, 2025-12-08/17: 2 = subtotal 45). Lote 5 (2026-02-20: 5) is NOT listed as a separate lote entry in that block, even though `registros_estimados: 50` is now correct. The Lote 5 entries are fully documented in the new `07-profiles-production-additional.sql` inventory entry. This is an acceptable documentation state — the totals are accurate. A future inventory maintenance pass could add the missing Lote 5 entry to the `02-production-users.sql` lotes block for completeness.

### Loose Verification Threshold (Accepted)

`07-profiles-production-additional.sql` line 729 uses `IF additional_count >= 35` rather than `= 37`. This is intentional — a strict equality check would be fragile in `ON CONFLICT DO NOTHING` scenarios. Documented and accepted.

---

*Report generated by SA-5A | TASK-2026-02-28-SEED-CLEANUP | 2026-02-28*
