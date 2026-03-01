---
title: "SA-2A: Seed Cleanup Correction Plan"
agent: "SA-2A"
task: "TASK-2026-02-28-SEED-CLEANUP"
date: "2026-02-28"
phase: "2"
status: "COMPLETE"
input_reports:
  - SA-1A-USER-GREP-INVENTORY.md
  - SA-1B-UUID-VALIDATION.md
  - SA-1C-ENV-DIFF.md
mode: "RESEARCH ONLY — no files modified"
---

# SA-2A: Seed Cleanup Correction Plan

**Agent:** SA-2A (Correction Plan Designer)
**Task:** TASK-2026-02-28-SEED-CLEANUP
**Date:** 2026-02-28
**Mode:** RESEARCH ONLY — correction plan written; no files modified

---

## EXECUTIVE SUMMARY

All three Phase 1 reports were reviewed. The seed data itself (INSERT/VALUES rows) is **fully correct** — 50 users, 50 profiles, valid UUIDs, no orphan references. All discrepancies are in **comment and metadata** layers only.

| Category | Count | Action |
|----------|-------|--------|
| CORREGIR (fix) | 9 items | Comment/header corrections in 2 seed files + 1 inventory file |
| DOCUMENTAR (document) | 3 items | Clarify existing correct data without changing it |
| IGNORAR (ignore) | 4 items | False positives or intentionally out-of-scope |

**Critical constraint:** Zero corrections touch INSERT/VALUES data lines. All corrections are to SQL comment lines or YAML metadata keys.

---

## SECTION 1: SUMMARY TABLE OF ALL CORRECTIONS

| ID | Classification | File | Line | Issue | Action |
|----|----------------|------|------|-------|--------|
| C-01 | CORREGIR | `apps/database/seeds/{env}/auth/02-production-users.sql` | 35 | INSERT comment says "45 usuarios" — actual is 50 | `(45 usuarios)` → `(50 usuarios)` |
| C-02 | CORREGIR | `apps/database/seeds/{env}/auth/02-production-users.sql` | 626 | Lote 3 section label says "6 usuarios" — actual is 7 | `(6 usuarios)` → `(7 usuarios)` |
| C-03 | CORREGIR | `orchestration/inventarios/SEEDS_INVENTORY.yml` | 150 | `registros_estimados: 45` for `02-production-users.sql` | `45` → `50` |
| C-04 | CORREGIR | `orchestration/inventarios/SEEDS_INVENTORY.yml` | 155 | Notas: "45 estudiantes reales" | `45` → `50` |
| C-05 | CORREGIR | `orchestration/inventarios/SEEDS_INVENTORY.yml` | 165 | Lote 3 `cantidad: 6` under `02-production-users.sql` lotes | `6` → `7` |
| C-06 | CORREGIR | `orchestration/inventarios/SEEDS_INVENTORY.yml` | 43–44 | `notas_actualizacion` says "44 usuarios de producción" / "44 perfiles corregidos" | `44` → `50` in both sub-lines |
| C-07 | CORREGIR | `orchestration/inventarios/SEEDS_INVENTORY.yml` | 230 | `registros_estimados: 45` for `06-profiles-production.sql` — file actually has 13 | `45` → `13` (this entry covers only Lote 1) |
| C-08 | CORREGIR | `orchestration/inventarios/SEEDS_INVENTORY.yml` | 235 | Notas: "45 perfiles de estudiantes de producción" under `06-profiles-production.sql` | `45` → `13` |
| C-09 | CORREGIR | `orchestration/inventarios/SEEDS_INVENTORY.yml` | 246 | Lote 3 `cantidad: 6` under `06-profiles-production.sql` lotes | `6` → `7` |
| D-01 | DOCUMENTAR | `apps/database/seeds/{env}/auth_management/07-profiles-production-additional.sql` | 26 | INSERT comment says "32 perfiles" — actual is 37 | Update comment to "37 perfiles" |
| D-02 | DOCUMENTAR | `orchestration/inventarios/SEEDS_INVENTORY.yml` | (missing) | `07-profiles-production-additional.sql` has NO entry in SEEDS_INVENTORY | Add inventory entry for this file |
| D-03 | DOCUMENTAR | `apps/database/seeds/{env}/auth_management/07-profiles-production-additional.sql` | 20, 737 | `adredsi26@gmail.com` is absent from seeds but not mentioned in exclusion notes | Add exclusion note for `adredsi26@gmail.com` alongside existing `rckrdmrd@gmail.com` note |
| I-01 | IGNORAR | `apps/frontend/e2e/automation-flow.spec.ts` | 33, 52 | Uses `rckrdmrd@gmail.com` for E2E test registration | Out of scope for seed cleanup — see Section 5 |
| I-02 | IGNORAR | `orchestration/tareas/TASK-2026-02-28-PROD-DB-AUDIT/SA-4A-SEED-DATA-ANALYSIS.md` | 60 | Stale claim that `rckrdmrd`/`adredsi26` are in `01-demo-users.sql` | Historical audit report — do not modify |
| I-03 | IGNORAR | `apps/database/seeds/{env}/auth_management/07-profiles-production-additional.sql` | 729 | Verification threshold `>= 35` is loose (correct is 37) | Acceptable loose threshold; tightening optional |
| I-04 | IGNORAR | backup files (`backups/`, `backup/`) | various | `rckrdmrd` and `adredsi26` appear in SQL backup dumps | Backup files are immutable history — no action needed |

---

## SECTION 2: DETAILED CORRECTION SPECIFICATIONS

### C-01 — `02-production-users.sql` INSERT comment (line 35)

**Applies to:** All three environment copies of this file (dev, prod, staging are identical).

**File paths:**
- `apps/database/seeds/dev/auth/02-production-users.sql`
- `apps/database/seeds/prod/auth/02-production-users.sql`
- `apps/database/seeds/staging/auth/02-production-users.sql`

**Line:** 35

**Old text (exact):**
```sql
-- INSERT: Production Registered Users (45 usuarios)
```

**New text (exact):**
```sql
-- INSERT: Production Registered Users (50 usuarios)
```

**Reason:** This INSERT block actually contains 50 rows (Lotes 1–5). The comment was not updated when Lote 5 (5 users) was added in v3.0 (2026-02-21). The file header at line 19 already correctly says "TOTAL: 50 usuarios estudiantes". This comment is the only inconsistency in the file itself.

**Data safety check:** This line is a SQL comment (`--` prefix). It is not part of any INSERT, VALUES, or executable SQL statement. Changing it has zero effect on database operations.

---

### C-02 — `02-production-users.sql` Lote 3 section label (line 626)

**Applies to:** All three environment copies of this file.

**File paths:**
- `apps/database/seeds/dev/auth/02-production-users.sql`
- `apps/database/seeds/prod/auth/02-production-users.sql`
- `apps/database/seeds/staging/auth/02-production-users.sql`

**Line:** 626

**Old text (exact):**
```sql
-- LOTE 3: USUARIOS 2025-11-25 (6 usuarios)
```

**New text (exact):**
```sql
-- LOTE 3: USUARIOS 2025-11-25 (7 usuarios)
```

**Reason:** Lote 3 contains users 37–43 = 7 users (confirmed by both SA-1A and SA-1B). The file header at line 15 and the CHANGELOG at line 956 already correctly say "7 usuarios" for Lote 3. Only this section-level label is stale. The discrepancy originated when `marianaxsotoxt22@gmail.com` (user 43) was added to the section without updating the parenthetical count.

**Data safety check:** This line is a SQL comment. Zero effect on database operations.

---

### C-03 — `SEEDS_INVENTORY.yml` `registros_estimados` for `02-production-users.sql` (line 150)

**File path:** `orchestration/inventarios/SEEDS_INVENTORY.yml`

**Line:** 150

**Old text (exact):**
```yaml
            registros_estimados: 45
```

**New text (exact):**
```yaml
            registros_estimados: 50
```

**Reason:** The `02-production-users.sql` file contains 50 INSERT rows. This field was set to 45 before Lote 5 was added and was never updated. The inventory is the SSOT for seed metadata and must be accurate.

---

### C-04 — `SEEDS_INVENTORY.yml` notas "45 estudiantes reales" (line 155)

**File path:** `orchestration/inventarios/SEEDS_INVENTORY.yml`

**Line:** 155

**Old text (exact):**
```yaml
              - 45 estudiantes reales de producción
```

**New text (exact):**
```yaml
              - 50 estudiantes reales de producción
```

**Reason:** The notes block for `02-production-users.sql` describes the file content. The actual count is 50. This note was not updated with Lote 5 addition.

---

### C-05 — `SEEDS_INVENTORY.yml` Lote 3 `cantidad: 6` under `02-production-users.sql` (line 165)

**File path:** `orchestration/inventarios/SEEDS_INVENTORY.yml`

**Line:** 165

**Context (surrounding lines for uniqueness):**
```yaml
            lotes:
              - fecha: 2025-11-18
                cantidad: 13
              - fecha: 2025-11-24
                cantidad: 23
              - fecha: 2025-11-25
                cantidad: 6       # ← THIS LINE (165)
              - fecha: 2025-12-08/17
                cantidad: 2
```

**Old text (exact):**
```yaml
              - fecha: 2025-11-25
                cantidad: 6
              - fecha: 2025-12-08/17
                cantidad: 2
            dependencias: []
```

**New text (exact):**
```yaml
              - fecha: 2025-11-25
                cantidad: 7
              - fecha: 2025-12-08/17
                cantidad: 2
            dependencias: []
```

**Reason:** Lote 3 has 7 users (users 37–43), not 6. Also note: the `lotes` block for `02-production-users.sql` in the inventory is missing the Lote 5 entry entirely (2026-02-20, cantidad: 5). That is addressed as a DOCUMENTAR item (D-02 context), but fixing the `cantidad: 6` alone is a CORREGIR because it is a factual error about existing data.

---

### C-06 — `SEEDS_INVENTORY.yml` `notas_actualizacion` stale "44" counts (lines 43–44)

**File path:** `orchestration/inventarios/SEEDS_INVENTORY.yml`

**Lines:** 43–44

**Old text (exact):**
```yaml
      - auth/02-production-users.sql: 44 usuarios de producción
      - auth_management/06-profiles-production.sql: 44 perfiles corregidos
```

**New text (exact):**
```yaml
      - auth/02-production-users.sql: 50 usuarios de producción
      - auth_management/06-profiles-production.sql: 50 perfiles corregidos (13 en 06 + 37 en 07)
```

**Reason:** The `notas_actualizacion` block is a historical log entry from 2025-12-18 when only 44 users existed. It was never updated to reflect the Lote 5 addition (v3.0, 2026-02-21) which brought the total to 50. Additionally, the note incorrectly implies that `06-profiles-production.sql` alone contains all production profiles — in reality profiles are split across `06` (13 profiles, Lote 1) and `07-profiles-production-additional.sql` (37 profiles, Lotes 2–5). The corrected note clarifies this.

---

### C-07 — `SEEDS_INVENTORY.yml` `registros_estimados: 45` for `06-profiles-production.sql` (line 230)

**File path:** `orchestration/inventarios/SEEDS_INVENTORY.yml`

**Line:** 230

**Old text (exact):**
```yaml
            registros_estimados: 45
```

**New text (exact):**
```yaml
            registros_estimados: 13
```

**Reason:** The actual `06-profiles-production.sql` file contains exactly 13 profile INSERT rows — one for each Lote 1 user. The count of 45 is a legacy value from when this file was supposed to contain all production profiles. After the Lote 2–5 additions, profiles were split across file `07-profiles-production-additional.sql`, but the inventory entry for file `06` was never corrected. The 13-record count is verified by SA-1B Section 3 (Profile Coverage Check).

---

### C-08 — `SEEDS_INVENTORY.yml` notas "45 perfiles" for `06-profiles-production.sql` (line 235)

**File path:** `orchestration/inventarios/SEEDS_INVENTORY.yml`

**Line:** 235

**Old text (exact):**
```yaml
              - 45 perfiles de estudiantes de producción
```

**New text (exact):**
```yaml
              - 13 perfiles de estudiantes de producción (Lote 1 únicamente)
```

**Reason:** Same root cause as C-07. This notes line describes the content of `06-profiles-production.sql` specifically, which contains 13 profiles (Lote 1 only). The clarification "(Lote 1 únicamente)" prevents future confusion with the 07 file.

---

### C-09 — `SEEDS_INVENTORY.yml` Lote 3 `cantidad: 6` under `06-profiles-production.sql` (line 246)

**File path:** `orchestration/inventarios/SEEDS_INVENTORY.yml`

**Line:** 246

**Context (surrounding lines for uniqueness):**
```yaml
            lotes:
              - fecha: 2025-11-18
                cantidad: 13
              - fecha: 2025-11-24
                cantidad: 23
              - fecha: 2025-11-25
                cantidad: 6       # ← THIS LINE (246)
              - fecha: 2025-12-08/17
                cantidad: 3
```

**Old text (exact):**
```yaml
              - fecha: 2025-11-25
                cantidad: 6
              - fecha: 2025-12-08/17
                cantidad: 3
            dependencias:
              - auth/02-production-users.sql
```

**New text (exact):**
```yaml
              - fecha: 2025-11-25
                cantidad: 7
              - fecha: 2025-12-08/17
                cantidad: 3
            dependencias:
              - auth/02-production-users.sql
```

**Reason:** Lote 3 has 7 users with profiles (profiles 24–30 in file 07, covering users 37–43 from Lote 3). The `cantidad: 6` value here is the same stale number as in C-05. Note: the lotes block in this `06-profiles-production.sql` entry is actually describing the wrong file — profiles for Lotes 2–4 are in file `07`, not `06`. However, correcting `cantidad: 6` → `7` is the minimal accurate fix in scope for this task. The broader structural issue (this lotes block belongs to a different file) is addressed in D-02.

---

## SECTION 3: DOCUMENTAR ITEMS

These items describe things that are **correct in the code** but where the documentation should be improved for clarity and future maintainability. They are not data integrity issues.

### D-01 — `07-profiles-production-additional.sql` INSERT comment says "32 perfiles" (line 26)

**Classification:** DOCUMENTAR (not CORREGIR because the data itself is correct)

**File paths (all 3 envs):**
- `apps/database/seeds/dev/auth_management/07-profiles-production-additional.sql`
- `apps/database/seeds/prod/auth_management/07-profiles-production-additional.sql`
- `apps/database/seeds/staging/auth_management/07-profiles-production-additional.sql`

**Line:** 26

**Current text:**
```sql
-- INSERT: Additional Production User Profiles (32 perfiles)
```

**Recommended text:**
```sql
-- INSERT: Additional Production User Profiles (37 perfiles)
```

**Reason:** The INSERT block in this file covers 37 profiles (Lotes 2–5: 23 + 7 + 2 + 5 = 37). "32 perfiles" was the count before Lote 5 (5 profiles) was added in v2.0 (2026-02-21). The file header at line 11 already correctly says "37 perfiles (32 originales + 5 Lote 5)". This INSERT label is the only remaining stale reference in the file.

**Executor note:** This is classified DOCUMENTAR rather than CORREGIR because the INSERT block itself is correct — only the comment label is outdated. However, it is still recommended to fix for consistency.

---

### D-02 — `SEEDS_INVENTORY.yml` missing entry for `07-profiles-production-additional.sql`

**Classification:** DOCUMENTAR (gap in inventory coverage — the file exists and is correct, but is not inventoried)

**File path:** `orchestration/inventarios/SEEDS_INVENTORY.yml`

**Issue:** The file `auth_management/07-profiles-production-additional.sql` (37 profiles, Lotes 2–5) has no entry in `SEEDS_INVENTORY.yml`. The inventory only has an entry for `06-profiles-production.sql`. This creates a structural gap: the inventory appears to account for all profiles under a single file when in reality they are split across two files.

**Recommended action:** Add a new YAML entry for `07-profiles-production-additional.sql` after the `06-profiles-production.sql` entry (around line 253 in the current file), containing:

```yaml
          - nombre: 07-profiles-production-additional.sql
            descripcion: Perfiles adicionales para usuarios Lotes 2-5 de producción
            tablas:
              - profiles
            registros_estimados: 37
            version: 2.0.0
            fecha_actualizacion: '2026-02-21'
            fuente: backup-prod (Lotes 2-5)
            notas: |
              - 37 perfiles de estudiantes de producción (Lotes 2-5)
              - Excluido: rckrdmrd@gmail.com (por solicitud explicita)
              - Excluido: adredsi26@gmail.com (cuenta runtime — nunca fue seed)
              - profiles.id = user_id para TODOS (consistente con 06)
              - tenant_id = GAMILIT Platform principal
            lotes:
              - fecha: 2025-11-24
                cantidad: 23
              - fecha: 2025-11-25
                cantidad: 7
              - fecha: 2025-12-08/17
                cantidad: 2
              - fecha: 2026-02-20
                cantidad: 5
            dependencias:
              - auth/02-production-users.sql
              - auth_management/06-profiles-production.sql
              - auth_management.tenants
            estado: activo
```

**Executor note:** This is a new YAML block insertion, not a line replacement. It should be inserted after the closing `estado: activo` line of the `06-profiles-production.sql` entry.

---

### D-03 — Standardize exclusion notes for `adredsi26@gmail.com` in `07-profiles-production-additional.sql`

**Classification:** DOCUMENTAR

**File paths (all 3 envs):**
- `apps/database/seeds/dev/auth_management/07-profiles-production-additional.sql`
- `apps/database/seeds/prod/auth_management/07-profiles-production-additional.sql`
- `apps/database/seeds/staging/auth_management/07-profiles-production-additional.sql`

**Issue:** `rckrdmrd@gmail.com` has an exclusion note in three places in this file (header line 20, footer line 737). However, `adredsi26@gmail.com` — a second account belonging to the same person (Adrian Flores Cortes) — has zero mentions anywhere in the seed files despite being a production user that was deliberately never seeded.

**Current state (header, line 20):**
```sql
-- EXCLUIDO: rckrdmrd@gmail.com (por solicitud explicita)
```

**Current state (footer, line 737):**
```sql
-- NOTA: rckrdmrd@gmail.com fue EXCLUIDO intencionalmente
```

**Recommended text for header (line 20):**
```sql
-- EXCLUIDO: rckrdmrd@gmail.com (por solicitud explicita, usuario dev del owner)
-- EXCLUIDO: adredsi26@gmail.com (cuenta runtime registrada 2026-02-21 — nunca fue seed)
```

**Recommended text for footer (line 737):**
```sql
-- NOTA: rckrdmrd@gmail.com fue EXCLUIDO intencionalmente (solicitud explicita)
-- NOTA: adredsi26@gmail.com fue EXCLUIDO intencionalmente (cuenta runtime, no seed)
```

**Reason:** `adredsi26@gmail.com` registered on 2026-02-21 at runtime. It has never been in any seed file and should not be. Documenting this explicitly prevents future auditors from wondering whether this user was "lost" from the seeds or was intentionally excluded. The parallel with `rckrdmrd` (same human, different email) makes documentation especially important.

---

## SECTION 4: IGNORAR ITEMS

### I-01 — E2E Test uses `rckrdmrd@gmail.com` as registration email

**File:** `apps/frontend/e2e/automation-flow.spec.ts` (lines 33, 52)

**Classification:** IGNORAR (out of scope for seed cleanup)

**Finding:** The E2E automation test registers `rckrdmrd@gmail.com` via the live API. This is not a seed file — it is a frontend test. If run against production, it would re-create this user account.

**Why IGNORAR:** This task is scoped to seed file comments and inventory metadata. The E2E test is a separate concern involving test infrastructure policies (which environment the E2E suite targets). No seed file is affected by this finding.

**Recommended future action (out of scope):** Create a dedicated test email (e.g., `e2e-test@gamilit.com`) and ensure the E2E suite's `baseURL` in playwright config cannot point to production. This should be tracked as a separate task in the QA domain.

---

### I-02 — SA-4A audit report incorrect claim about `01-demo-users.sql`

**File:** `orchestration/tareas/TASK-2026-02-28-PROD-DB-AUDIT/SA-4A-SEED-DATA-ANALYSIS.md` (line 60)

**Classification:** IGNORAR

**Finding:** The SA-4A report (from a previous audit session) states that `rckrdmrd` and `adredsi26` were in `01-demo-users.sql`. This is incorrect — the current v4.0 of that file contains only `@gamilit.com` system accounts.

**Why IGNORAR:** Completed audit reports are historical records. SA-4A was based on a pre-v3.0/v4.0 state of the seed files. The report itself contains a timestamp and version context. Modifying completed audit outputs would compromise their integrity as historical records. The correct current state is documented in SA-1A (this task's own report).

---

### I-03 — `07-profiles-production-additional.sql` verification threshold is loose

**File:** `apps/database/seeds/{env}/auth_management/07-profiles-production-additional.sql` (line 729)

**Classification:** IGNORAR

**Finding (from SA-1B):** The PL/pgSQL verification block at line 729 checks `IF additional_count >= 35` rather than the exact expected value of 37.

**Why IGNORAR:** A loose lower bound (`>= 35`) is a conservative safety check that will still catch catastrophic failures (e.g., if fewer than 35 profiles were created). Tightening to `= 37` would make the seed fragile against `ON CONFLICT DO NOTHING` scenarios where fewer rows are inserted because some already exist. This is a deliberate design choice. The SA-1B report classifies this as acceptable. No correction is warranted.

---

### I-04 — `rckrdmrd` and `adredsi26` in backup SQL files

**Files:** `apps/database/backups/` and `apps/database/backup/` (various files)

**Classification:** IGNORAR

**Finding:** Multiple backup SQL dump files contain INSERT rows for both `rckrdmrd@gmail.com` (UUID `2c9af9ac-...`) and `adredsi26@gmail.com` (UUID `a6230bab-...`). These are real production accounts captured at backup time.

**Why IGNORAR:** Backup files are immutable point-in-time snapshots of the production database. They should not be edited under any circumstances. The presence of these users in backups is correct — they were real users at the time of the backup. No cleanup action applies.

---

## SECTION 5: CROSS-ENVIRONMENT REPLICATION MATRIX

Files C-01 and C-02 affect `02-production-users.sql`, which is verified to be **bit-for-bit identical** across all three environments (SA-1C Section 2.1 and Section 5). Therefore any correction to this file **must be applied to all three environment copies simultaneously.**

Files D-01 and D-03 affect `07-profiles-production-additional.sql`, which is also **identical across all three environments** (SA-1C Section 4.3).

| Correction ID | Dev | Prod | Staging | SEEDS_INVENTORY |
|---------------|-----|------|---------|-----------------|
| C-01 | YES | YES | YES | — |
| C-02 | YES | YES | YES | — |
| C-03 | — | — | — | YES |
| C-04 | — | — | — | YES |
| C-05 | — | — | — | YES |
| C-06 | — | — | — | YES |
| C-07 | — | — | — | YES |
| C-08 | — | — | — | YES |
| C-09 | — | — | — | YES |
| D-01 | YES | YES | YES | — |
| D-02 | — | — | — | YES (insert) |
| D-03 | YES | YES | YES | — |

**Rule:** Any executor applying corrections to seed SQL files must modify all 3 environment copies in a single atomic operation to maintain the "IDENTICAL" guarantee established by SA-1C.

---

## SECTION 6: CONSTRAINTS AND SAFETY RULES FOR EXECUTOR

1. **NO CORRECTION TOUCHES INSERT/VALUES DATA LINES.** All 9 CORREGIR items and all 3 DOCUMENTAR items modify only SQL comment lines (`--` prefix) or YAML metadata keys. Verify that each edit target line begins with `--` (SQL) or is a YAML key/value — never a VALUES row.

2. **Three-way sync required:** Any edit to a seed `.sql` file must be replicated to all three environment directories simultaneously. The executor (SA-3A) must apply changes to dev, prod, and staging in one pass.

3. **Verification after correction:** After applying C-01 and C-02 to `02-production-users.sql`, run a diff against prod/staging copies to confirm they remain identical (i.e., the same changes were applied to all three).

4. **SEEDS_INVENTORY version bump:** After applying C-03 through C-09 and D-02, increment `seeds_inventory.version` from `3.3.0` to `3.4.0` and update `fecha` to `2026-02-28`.

5. **No new INSERT rows:** This task does not add any new users, profiles, or gamification records. The 50-user count is the correct final state.

---

## SECTION 7: LINE NUMBER QUICK REFERENCE FOR EXECUTOR

### `02-production-users.sql` (dev/prod/staging identical)

| Line | Content | Correction |
|------|---------|------------|
| 15 | `-- - Lote 3 (2025-11-25): 7 usuarios` | CORRECT — no change |
| 19 | `-- TOTAL: 50 usuarios estudiantes` | CORRECT — no change |
| 35 | `-- INSERT: Production Registered Users (45 usuarios)` | **C-01: `45` → `50`** |
| 626 | `-- LOTE 3: USUARIOS 2025-11-25 (6 usuarios)` | **C-02: `6` → `7`** |
| 943 | `-- Excluido: rckrdmrd@gmail.com (usuario dev)` | CORRECT — no change |
| 956 | `-- Lote 3: 7 usuarios (2025-11-25)` | CORRECT — no change |

### `07-profiles-production-additional.sql` (dev/prod/staging identical)

| Line | Content | Correction |
|------|---------|------------|
| 11 | `-- USUARIOS ADICIONALES: 37 perfiles (32 originales + 5 Lote 5)` | CORRECT — no change |
| 20 | `-- EXCLUIDO: rckrdmrd@gmail.com (por solicitud explicita)` | **D-03: Add adredsi26 note below** |
| 26 | `-- INSERT: Additional Production User Profiles (32 perfiles)` | **D-01: `32` → `37`** |
| 729 | `IF additional_count >= 35 THEN` | IGNORE (loose threshold is acceptable) |
| 737 | `-- NOTA: rckrdmrd@gmail.com fue EXCLUIDO intencionalmente` | **D-03: Add adredsi26 note below** |

### `SEEDS_INVENTORY.yml`

| Line | Content | Correction |
|------|---------|------------|
| 43 | `- auth/02-production-users.sql: 44 usuarios de producción` | **C-06: `44` → `50`** |
| 44 | `- auth_management\06-profiles-production.sql: 44 perfiles corregidos` | **C-06: `44` → `50` + clarify split** |
| 150 | `registros_estimados: 45` (under `02-production-users.sql`) | **C-03: `45` → `50`** |
| 155 | `- 45 estudiantes reales de producción` | **C-04: `45` → `50`** |
| 165 | `cantidad: 6` (Lote 3 under `02-production-users.sql`) | **C-05: `6` → `7`** |
| 230 | `registros_estimados: 45` (under `06-profiles-production.sql`) | **C-07: `45` → `13`** |
| 235 | `- 45 perfiles de estudiantes de producción` | **C-08: `45` → `13`** |
| 246 | `cantidad: 6` (Lote 3 under `06-profiles-production.sql`) | **C-09: `6` → `7`** |
| after 252 | *(missing)* | **D-02: Insert new entry for `07-profiles-production-additional.sql`** |

---

## SECTION 8: FINDINGS NOT REQUIRING CORRECTION (Verified Correct)

The following items were investigated and confirmed to require no correction:

| Item | Finding | Status |
|------|---------|--------|
| All 50 UUIDs in `02-production-users.sql` | Valid v4 format, no duplicates | PASS — no action |
| Profile coverage (50/50) | Every auth user has exactly 1 profile | PASS — no action |
| `profiles.id = profiles.user_id` for all 50 | Correct identity scheme throughout | PASS — no action |
| Tenant UUID `a0eebc99-...` for all 50 profiles | Consistent principal tenant assignment | PASS — no action |
| Gamification seeds cross-reference | All 7 production users referenced by email — dynamic lookup, no hardcoded UUIDs | PASS — no action |
| `rckrdmrd` in active seed files | Comment-only (3 files × 3 envs = 9 occurrences), zero INSERT/VALUES | PASS — no action |
| `adredsi26` in active seed files | Zero occurrences anywhere | PASS — no action |
| Dev/prod/staging identity for `02-production-users.sql` | Byte-for-byte identical (confirmed by diff) | PASS — no action |
| Dev/prod/staging identity for `07-profiles-production-additional.sql` | Byte-for-byte identical | PASS — no action |
| CHANGELOG in `02-production-users.sql` | v3.0 correctly says "50 usuarios de produccion" | PASS — no action |
| File header in `07-profiles-production-additional.sql` | Correctly says "37 perfiles (32 + 5 Lote 5)" | PASS — no action |

---

*Report generated by SA-2A — RESEARCH ONLY, no files modified*
*Input: SA-1A-USER-GREP-INVENTORY.md + SA-1B-UUID-VALIDATION.md + SA-1C-ENV-DIFF.md*
*Output: SA-2A-CORRECTION-PLAN.md (this file)*
*Next phase: SA-3A will apply all CORREGIR corrections using this plan as specification*
