---
title: "TASK-2026-02-28-SEED-CLEANUP"
date: 2026-02-28
status: "IN PROGRESS"
phase: "SA-1C COMPLETE"
---

# Seed Files Cleanup Task

**Objective:** Audit and document seed file consistency across development, production, and staging environments.

**Task ID:** TASK-2026-02-28-SEED-CLEANUP
**Created:** 2026-02-28
**Status:** Phase SA-1C (Environment Differential Analysis) COMPLETE

---

## Task Summary

This task involves comparing 276 SQL seed files across 3 environments (dev, prod, staging) to identify:
1. Environment-exclusive files (intentional vs. unintended)
2. Content divergence in shared files
3. Dead code and cleanup candidates
4. Configuration consistency issues

## Phases

| Phase | Subagent | Task | Status |
|-------|----------|------|--------|
| **SA-1A** | TBD | Backup Catalog | NOT STARTED |
| **SA-1B** | TBD | DDL Catalog | NOT STARTED |
| **SA-1C** | Claude Haiku 4.5 | Environment Differential (dev/prod/staging) | ✅ COMPLETE |
| **SA-1D** | TBD | Configuration Audit | NOT STARTED |
| **SA-1E** | TBD | Validation Report & Recommendations | NOT STARTED |

---

## Current Phase: SA-1C — Environment Differential Analysis

**Agent:** Claude Haiku 4.5
**Date:** 2026-02-28
**Mode:** ANALYSIS-ONLY (RESEARCH, NO EDITS)

### Deliverable: SA-1C-ENV-DIFF.md

**Location:** `/c/Empresas/ISEM/gamilit-workspace/orchestration/tareas/TASK-2026-02-28-SEED-CLEANUP/SA-1C-ENV-DIFF.md`

**Contents:**
- Complete file inventory across all 3 environments (276 files analyzed)
- Classification of intentional vs. unintended differences
- Detailed comparison of critical production seeds
- Deprecated/dead code identification (11 orphaned files)
- Cleanup recommendations with impact assessment

### Key Findings

| Metric | Count |
|--------|-------|
| Total seed files | 276 |
| Core identical files | ~95 |
| Dev-only files (intentional) | 30 |
| Deprecated/orphaned files | 11 |
| Production user accounts | 50 total (13+37 split profiles) |
| Exercise seed files | 19 |

### Main Observations

1. **95 core seeds are IDENTICAL** across dev/prod/staging (as designed)
2. **30 dev-only seeds are INTENTIONAL** per SEED-LOADING-ORDER.md specification
   - Extended demo data for testing
   - Demo conversations and audit logs
   - Extended progress tracking for development
3. **11 deprecated files in `_deprecated/` subdirs** are never loaded (SAFE TO DELETE)
4. **No critical errors detected** — FK chains intact, trigger overlap handled correctly
5. **Profile ID unification fix verified** in all 3 envs (v2.0, applied 2026-02-21)

### Cleanup Opportunities

| Priority | Action | Files | Impact |
|----------|--------|-------|--------|
| P1 | Delete `_deprecated/orphaned/*.sql` (dev) | 6 | Zero |
| P1 | Delete `_deprecated/_testing/*.sql` (prod) | 4 | Zero |
| P1 | Delete `_deprecated/_testing/*.sql` (staging) | 1 | Zero |
| P2 | Audit `dev/_testing/*.sql` (4 active files) | 4 | Verify if still needed |
| P3 | Document env-specific seed tagging convention | — | Process improvement |

---

## Next Steps

1. **SA-1D (Config Audit):** Review system configuration seeds for database parameter consistency
2. **SA-1E (Validation Report):** Generate final validation metrics and deployment checklist
3. **Cleanup Execution:** Schedule deletion of dead code files (separate task)

---

## Related Documents

- **SEED-LOADING-ORDER.md:** `apps/database/seeds/SEED-LOADING-ORDER.md` — Design specification for seed distribution
- **Load Scripts:**
  - `apps/database/scripts/load-dev-seeds.sh`
  - `apps/database/scripts/load-prod-seeds.sh`
  - `apps/database/scripts/load-staging-seeds.sh`
  - `apps/database/scripts/init-database.sh`

## File Locations

- **Dev seeds:** `apps/database/seeds/dev/` (125 files)
- **Prod seeds:** `apps/database/seeds/prod/` (78 files)
- **Staging seeds:** `apps/database/seeds/staging/` (73 files)

---

**Phase Completion Date:** 2026-02-28
**Next Phase Date:** TBD (awaiting SA-1D schedule)
