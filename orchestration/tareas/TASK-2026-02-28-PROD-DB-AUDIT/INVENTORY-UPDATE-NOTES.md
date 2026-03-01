---
title: Inventory Update Notes — Production DB Audit
date: 2026-02-28
status: PENDING
phase: Analysis-Only (Remediation Pending)
---

# Inventory Update Notes: Production DB Audit (2026-02-28)

## Overview
This document catalogs inventory file updates discovered during the 7-phase production database audit (15 subagents). Updates are **PENDING** — apply only after remediation is confirmed on production server.

**Status:** ANALYSIS-ONLY. Do NOT update inventories yet.

---

## 1. MASTER_INVENTORY.yml — CORRECTIONS REQUIRED

### 1.1 Database Functions Count (CRITICAL)

**Current Value (WRONG):**
```yaml
database:
  functions: 158
```

**Correct Value:**
```yaml
database:
  functions: 185
```

**Reason:**
- DDL audit found 185 function files/definitions in `apps/database/ddl/functions/`
- Original count of 158 was incomplete; missing 27 utility functions, performance functions, and data warehouse functions
- Source: `SA-1B-DDL-CATALOG.md` (comprehensive scan of all .sql files)

**When to Update:** After confirming function definitions are loaded in production PostgreSQL database

---

### 1.2 RLS Policies (Force RLS) — MISSING ENTRIES

**Current Value (INCOMPLETE):**
```yaml
database:
  rls_policies:
    force_rls: 30
    total_rls: 251
```

**Correct Value:**
```yaml
database:
  rls_policies:
    force_rls: 38
    total_rls: 483
```

**Reason:**
- DDL defines 38 FORCE RLS policies; production only has 30 (8 missing)
- Total RLS policies in DDL: 483 (not 251) — includes standard + force + hybrid policies
- Missing 8 FORCE RLS policies are critical for data isolation:
  - 3 in auth schema (user_isolation, tenant_isolation, session_security)
  - 2 in gamification schema (achievement_isolation, mission_isolation)
  - 1 in educational schema (exercise_content_isolation)
  - 2 in progress schema (student_progress_isolation, submission_isolation)
- Source: `SA-1C-Drift-Report.md`, `SA-2C-RLS-Index-View-Diff.md`

**When to Update:** After FORCE RLS policies are applied to production database via remediation script

---

### 1.3 Triggers (DDL vs Production Mismatch)

**Current Value (INCOMPLETE):**
```yaml
database:
  triggers: 72
```

**Correction Notes:**
- Production has 72 active triggers (CORRECT for runtime)
- DDL defines 120 trigger statements (includes 48 unapplied `updated_at` auto-update triggers)
- Status: DO NOT change MASTER_INVENTORY value (72 is correct for runtime state)
- Note: 48 updated_at triggers are INTENTIONALLY NOT applied (design decision)
  - See: `SA-1B-DDL-Catalog.md`, section "Trigger Analysis: Updated_at Auto-Updates"
  - Rationale: Application maintains temporal columns explicitly; auto-triggers disabled to avoid conflicts

**Decision:** Keep triggers: 72 in MASTER_INVENTORY. Add note in comments.

---

### 1.4 Tables Count (False Positive Corrected)

**Current Value (CORRECT):**
```yaml
database:
  tables: 173
```

**Status:** CORRECT — no change needed
- Previous audit counted 174 (overcount error from SA-1B)
- Recount confirmed 173 tables in production and DDL
- The phantom "174th table" was a double-counted temp table
- Source: `SA-2A-Table-Diff.md` revalidation

---

### 1.5 ENUMs Count (Validation Passed)

**Current Value (CORRECT):**
```yaml
database:
  enums: 42
```

**Status:** CORRECT — no change needed
- Audit confirmed all 42 ENUMs present in DDL and production
- exercise_type enum = 33 values (NOT a false positive)
- Source: `SA-2B-Func-Trigger-Enum-Diff.md`

---

## 2. DATABASE_INVENTORY.yml — CORRECTIONS REQUIRED

### 2.1 Functions Detailed Breakdown

**Current Summary (WRONG):**
```yaml
functions:
  total: 158
  categories:
    - utility_functions: (N/A)
    - performance_functions: (N/A)
    - data_warehouse_functions: (N/A)
```

**Updated Breakdown (CORRECT):**
```yaml
functions:
  total: 185
  categories:
    utility_functions: 47
    performance_functions: 31
    data_warehouse_functions: 16
    temporal_functions: 22
    audit_functions: 19
    rls_helper_functions: 18
    data_integrity_functions: 12
```

**Rationale:**
- 27 previously uncounted functions across multiple categories
- Data warehouse functions (16) conditionally loaded via ENABLE_DATA_WAREHOUSE flag
- Source: `SA-1B-DDL-Catalog.md` detailed function inventory

**When to Update:** Immediately after DDL function count is reconciled

---

### 2.2 RLS Policies Detailed Breakdown

**Current Summary (WRONG):**
```yaml
rls_policies:
  total: 251
  force_rls: 30
```

**Updated Summary (CORRECT):**
```yaml
rls_policies:
  total: 483
  force_rls: 38
  missing_in_prod: 8
  by_schema:
    auth: 98 (9 force)
    gamification: 87 (7 force)
    educational: 74 (6 force)
    progress: 91 (8 force — 2 missing)
    notifications: 45 (3 force)
    (etc.)
```

**Remediation Steps:**
1. Apply missing 8 FORCE RLS policies to production
2. Verify all 483 RLS policies active with `SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'RLS'`
3. Test with multi-tenant isolation query
4. Update DATABASE_INVENTORY after confirmation

**When to Update:** After remediation script applies missing RLS policies

---

## 3. Version Increments Required

After applying corrections, increment inventory versions as follows:

### 3.1 MASTER_INVENTORY.yml
```yaml
version: 14.8.3 → 14.8.4
updated_at: 2026-02-28 (remediation date)
audit_references:
  - TASK-2026-02-28-PROD-DB-AUDIT
  - Functions: SA-1B-DDL-Catalog.md
  - RLS: SA-1C-Drift-Report.md, SA-2C-RLS-Index-View-Diff.md
```

### 3.2 DATABASE_INVENTORY.yml
```yaml
version: 9.2.0 → 9.2.1
updated_at: 2026-02-28 (remediation date)
audit_references:
  - TASK-2026-02-28-PROD-DB-AUDIT
```

---

## 4. Remediation Validation Checklist

Before updating inventories, confirm:

- [ ] **Functions (185):** Run SQL:
  ```sql
  SELECT COUNT(*) FROM information_schema.routines
  WHERE routine_schema NOT IN ('pg_catalog', 'information_schema');
  ```
  Expected: 185

- [ ] **RLS Policies (483):** Run SQL:
  ```sql
  SELECT COUNT(*) FROM pg_policies;
  ```
  Expected: 483

- [ ] **Force RLS (38):** Run SQL:
  ```sql
  SELECT COUNT(*) FROM pg_policies WHERE polpermissive = false;
  ```
  Expected: 38

- [ ] **Tables (173):** Run SQL:
  ```sql
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'information_schema_private');
  ```
  Expected: 173

- [ ] **PM2 Remediation:** Verify on production server:
  ```bash
  pm2 describe ecosystem.config.js | grep max_restarts
  ```
  Expected: max_restarts >= 20, restart_delay >= 5000ms

---

## 5. Remaining Known Gaps (Not Inventory-Related)

These issues were identified but are NOT corrected by inventory updates:

1. **PM2 Process Death (CRITICAL)** — See ROOT-CAUSE-SYNTHESIS.md
   - max_restarts limit exhaustion after 8-minute downtime
   - Fix: Update ecosystem.config.js max_restarts: 10 → 20, restart_delay: 100 → 5000ms

2. **Connection Pool Stale Connections (HIGH)** — See SA-1D-Config-Audit.md
   - PostgreSQL idle_in_transaction_session_timeout not set
   - Fix: Set idle_in_transaction_session_timeout = 5min in postgresql.conf

3. **Unmatched Indexes (MEDIUM)** — See SA-2C-RLS-Index-View-Diff.md
   - 12 DDL indexes missing in production
   - Fix: Apply pending CREATE INDEX statements

4. **ADR-051 Vision Lectora (Frontend)** — CSS scoped to .exercise-passage
   - No DB changes required; frontend-only implementation

---

## 6. Summary Table

| Inventory | Item | Current | Correct | Status | Dependency |
|-----------|------|---------|---------|--------|------------|
| MASTER_INVENTORY | functions | 158 | 185 | WRONG | DDL rebuild |
| MASTER_INVENTORY | rls_force | 30 | 38 | WRONG | RLS apply |
| MASTER_INVENTORY | rls_total | 251 | 483 | WRONG | RLS apply |
| DATABASE_INVENTORY | functions breakdown | N/A | 185 (7 categories) | MISSING | DDL rebuild |
| DATABASE_INVENTORY | rls breakdown | 251/30 | 483/38 | WRONG | RLS apply |
| — | tables | 173 | 173 | CORRECT | — |
| — | triggers | 72 | 72 | CORRECT | — |
| — | enums | 42 | 42 | CORRECT | — |

---

## 7. Related Audit Documents

- **Root Cause Analysis:** `ROOT-CAUSE-SYNTHESIS.md`
- **PM2 Fix Details:** `DEPLOYMENT-CHECKLIST.md`, `RECOMMENDED-FIXES.md`
- **Detailed Metrics:** `SA-1B-DDL-Catalog.md` (functions), `SA-2C-RLS-Index-View-Diff.md` (RLS)
- **Validation Results:** `SA-6A-Validation-Report.md`

---

**Last Updated:** 2026-02-28 (Analysis Phase)
**Status:** PENDING REMEDIATION
**Next Action:** Apply fixes to production, then update inventories (v14.8.4 + v9.2.1)
