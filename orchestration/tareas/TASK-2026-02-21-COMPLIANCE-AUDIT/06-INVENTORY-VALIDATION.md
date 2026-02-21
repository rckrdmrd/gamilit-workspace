# SSOT Inventory Validation Report

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6 (Automated)
**Scope:** MASTER_INVENTORY.yml v13.0.0, FRONTEND_INVENTORY.yml v12.0.0, BACKEND_INVENTORY.yml v5.0.0, DATABASE_INVENTORY.yml v9.0.0
**Method:** Glob + Grep against real files in the codebase. All counts verified programmatically.

---

## 1. MASTER_INVENTORY.yml (v13.0.0)

### 1.1 Database Metrics

| Metric | YAML Value | Actual Count | Method | Status |
|--------|-----------|-------------|--------|--------|
| Schemas | 18 | 18 | Glob: `ddl/schemas/*/` directories | **PASS** |
| Tables | 172 | 168 | `^CREATE TABLE` (non-commented) across 166 files: 166 single-table + 2 multi-table files (guild_missions=2, conversation_participants=2) | **MISMATCH (-4)** |
| Views | 22 | 18 | `^CREATE VIEW` in schemas/*/views/*.sql (18 files, 18 views). No MV in views dirs | **MISMATCH (-4)** |
| Materialized Views | 7 | 7 | `CREATE MATERIALIZED VIEW` across 5 files (admin_dashboard/01-materialized_views.sql=3, 4 gamification MVs=4) | **PASS** |
| Functions (DDL) | 183 | 158 (functions/ only) / 202 (all DDL) | `CREATE FUNCTION` in functions/ dirs = 158 across 116 files. Adding triggers/(6), tables/(34), views/(1), MVs/(1), _cross_schema/(1), 00-prerequisites(1) = 202 total. YAML claims 183 matching neither methodology | **MISMATCH** |
| Triggers | 67 | 68 | `CREATE TRIGGER` across 37 trigger files. batch_updated_at files have multiple per file | **MISMATCH (+1)** |
| RLS Policies (DDL) | 234 | 251 | `CREATE POLICY` in schemas/*/rls-policies/*.sql (251) + 2 in notifications/tables/07-rate_limit_logs.sql = 253 total in schema dirs. Global files (07/07b/07c/07d) add 232 more but are likely pipeline duplicates | **MISMATCH (+17 to +19)** |
| ENUMs | 42 | 62 | 22 in 00-prerequisites.sql + 38 in schemas/*/enums/*.sql + 2 in table files (guild_missions, etl_load_log) | **MISMATCH (+20)** |
| Seeds | 92 | 116 | .sql files in seeds/dev/ excluding _testing (118 total - 2 _backlog = 116), or 122 including everything. The YAML says "92 pipeline entries" which counts pipeline lines, not files | **NEEDS CLARIFICATION** |

**Notes on Tables (172 vs 168):**
- 166 table SQL files exist
- 2 files have 2 tables each: `24-guild_missions.sql` (guild_missions + guild_mission_contributions), `03-conversation_participants.sql` (conversations + conversation_participants)
- That gives 168 actual `^CREATE TABLE` statements (not 171 as YAML comment claims)
- YAML claims "171 SQL files + 2 multi-table - 1 MV file" = 172, but there are only 166 files, and there are no MV files in the tables directory
- The 3 resource tables are already counted in the 166 files (28-resource_ratings, 29-resource_comments, 30-resource_downloads)

**Notes on Views (22 vs 18):**
- Only 18 CREATE VIEW statements exist in 18 view files across all schemas
- The YAML claims 22 views. Possible that 4 views are counted from somewhere else (perhaps the 3 admin_dashboard MVs are being miscounted as views, or there are views defined outside the views/ directories)

**Notes on Functions (183 vs 158 or 202):**
- 158 CREATE FUNCTION statements in schemas/*/functions/*.sql (116 files)
- Additional functions exist outside functions/ dirs:
  - +6 in triggers/ (trigger functions defined inline)
  - +34 in tables/ (inline helper functions in communication, system_configuration, data_warehouse, etc.)
  - +1 in views/ (teacher_pending_reviews.sql)
  - +1 in materialized-views/ (01-materialized_views.sql)
  - +1 in _cross_schema/ (23-classroom_modules.sql)
  - +1 in 00-prerequisites.sql
- **Total across all DDL: 202 CREATE FUNCTION statements in 141 files**
- The YAML claims 183, which matches neither 158 (functions/ only) nor 202 (all DDL)
- The discrepancy suggests the count methodology is undefined or was computed differently
- **Recommendation: Standardize to count only functions/ directories (158) OR all DDL (202), not an intermediate value**

**Notes on ENUMs (42 vs 62):**
- The YAML says 42, but grep finds 62 CREATE TYPE AS ENUM statements
- The 22 in 00-prerequisites.sql may overlap with the 38 in enum files (IF/NOT EXISTS guards mean they're the same types defined twice)
- If we count only unique types (deduplicating prerequisites vs enum files), the actual unique count may be ~40-42
- This needs manual verification of overlap between 00-prerequisites.sql and the individual enum files

**Notes on RLS Policies (234 vs 251):**
- Schema-level rls-policies directories alone contain 251 CREATE POLICY statements
- Additionally, 2 policies are in a table file (rate_limit_logs)
- The global files (07/07b/07c/07d) contain 232 more CREATE POLICY statements but these are loaded in a separate pipeline step and may overlap with schema-level files
- The YAML claim of 234 is lower than the 251 found in schema dirs, suggesting the count was taken before recent additions

### 1.2 Backend Metrics

| Metric | YAML Value | Actual Count | Method | Status |
|--------|-----------|-------------|--------|--------|
| Modules | 23 | 22 dirs | `find modules/ -mindepth 1 -maxdepth 1 -type d`. YAML notes "22 directorios + mail (transitivo)" which matches | **PASS** (with caveat) |
| Entities (files) | 156 | 156 | `find *.entity.ts` in modules/ | **PASS** |
| DTOs | 400 | 401 | `find *.dto.ts` in modules/ | **MISMATCH (+1)** |
| Services | 173 | 172 | `find *.service.ts` in modules/ | **MISMATCH (-1)** |
| Controllers | 108 | 108 | `find *.controller.ts` in modules/ | **PASS** |

**Notes on Services (173 vs 172):**
- The YAML says 173 but actual file count is 172
- One service may have been deleted or renamed since the last inventory update

**Notes on DTOs (400 vs 401):**
- The YAML says 400 (or "~400") but actual file count is 401
- One DTO file may have been added after the inventory was written

### 1.3 Frontend Metrics

| Metric | YAML Value | Actual Count | Method | Status |
|--------|-----------|-------------|--------|--------|
| Components (.tsx) | 590 | 590 | `find *.tsx` excl tests/stories/examples/_testing | **PASS** |
| Hooks (use*.ts) | 127 | 127 | `find use*.ts` excl tests/user*.ts | **PASS** |
| Pages | 70 | 62 | `find *Page.tsx` in apps/*/pages/ | **MISMATCH (-8)** |
| Stores (Zustand) | 13 | 13 | `find *[Ss]tore.ts` | **PASS** |
| API Service Files | 67 | 55 | Total .ts in services/api/ excl tests = 55 (or 52 excl index.ts files) | **MISMATCH (-12 to -15)** |
| Routes | 73 | -- | Not verified (requires parsing App.tsx) | **SKIP** |

**Notes on Pages (70 vs 62):**
- Only 62 files match `*Page.tsx` in `apps/*/pages/` directories
- The YAML counts 70 "active pages" which likely includes non-Page-suffixed files in pages directories (e.g., DashboardComplete, DeviceManagementSection, settings/ subdirs) and possibly sub-pages
- Total .tsx files in pages directories (all portals, excl tests): 72
- The gap: the YAML methodology likely counts certain pages that don't have "Page" in their name (e.g., `DashboardComplete.tsx`, `DeviceManagementSection.tsx`, or settings subsections)

**Notes on API Service Files (67 vs 55):**
- 55 total .ts files in services/api/ excluding tests
- 52 excluding index.ts barrel files (3 index.ts: root, admin, teacher)
- The YAML claims 67 = "45 services/api (excl infra/index) + 19 features + 2 shared + 1 NotificationService(deprecated)"
- The YAML methodology counts files OUTSIDE services/api/ (features/ API files + shared/ API files + deprecated NotificationService)
- Counting only services/api/ files: 55 total, or 49 excluding infrastructure (3 index.ts, apiClient.ts, apiErrorHandler.ts, apiInterceptors.ts, apiTypes.ts, adminTypes.ts, axios.instance.ts, schemas/adminSchemas.ts = 10 infra files) = 45 API service files
- The 45 matches the YAML sub-count, but total 67 includes non-services/api paths

---

## 2. FRONTEND_INVENTORY.yml (v12.0.0)

| Metric | YAML Value | Actual Count | Status |
|--------|-----------|-------------|--------|
| componentes_tsx | 590 | 590 | **PASS** |
| hooks | 127 | 127 | **PASS** |
| paginas | 70 | 62 (*Page.tsx) / 72 (all in pages/) | **MISMATCH** (see above) |
| stores_zustand | 13 | 13 | **PASS** |
| api_service_files | 67 | 55 (services/api only) | **MISMATCH** (methodology issue) |
| type_definition_files | 49 | -- | Not verified | **SKIP** |
| routes | 73 | -- | Not verified | **SKIP** |
| contexts_providers | 4 | -- | Not verified | **SKIP** |

### Portal Sub-Counts (from FRONTEND_INVENTORY)

| Portal | Metric | YAML | Actual | Status |
|--------|--------|------|--------|--------|
| Student | paginas | 20 | 18 *Page.tsx | **MISMATCH** (YAML includes non-Page files like DashboardComplete, DeviceManagementSection) |
| Teacher | paginas | 19 | 19 *Page.tsx | **PASS** |
| Admin | paginas | 19 | 18 *Page.tsx | **MISMATCH (-1)** |
| Parent | paginas | -- | 4 *Page.tsx | -- |
| Teacher | hooks | 25 | -- | Not verified at portal level |
| Admin | hooks | 31 | -- | Not verified at portal level |

---

## 3. BACKEND_INVENTORY.yml (v5.0.0)

| Metric | YAML Value | Actual Count | Status |
|--------|-----------|-------------|--------|
| modulos | 23 | 22 + mail (transitivo) | **PASS** |
| entities | 156 (files) / 159 (@Entity) | 156 files | **PASS** (file count) |
| dtos | 400 | 401 | **MISMATCH (+1)** |
| services | 173 | 172 | **MISMATCH (-1)** |
| controllers | 108 | 108 | **PASS** |
| endpoints | 912 | -- | Not verified (requires parsing decorators) | **SKIP** |
| tests_files | 61 | -- | Not verified | **SKIP** |

---

## 4. DATABASE_INVENTORY.yml (v9.0.0)

| Metric | YAML Value | Actual Count | Status |
|--------|-----------|-------------|--------|
| tablas | 172 | 168 | **MISMATCH (-4)** |
| views | 22 | 18 | **MISMATCH (-4)** |
| materialized_views | 7 | 7 | **PASS** |
| funciones | 183 | 158 | **MISMATCH (-25)** |
| triggers | 67 | 68 | **MISMATCH (+1)** |
| rls_policies | 234 | 251 (schema dirs only) | **MISMATCH (+17)** |
| enums | 42 | 62 (with possible overlaps from 00-prerequisites) | **NEEDS CLARIFICATION** |

---

## 5. Summary of Discrepancies

### Critical (>10% variance)
| Metric | YAML | Actual | Delta | Severity |
|--------|------|--------|-------|----------|
| Functions (DDL) | 183 | 158 or 202 | -25 or +19 (methodology undefined) | **HIGH** |
| ENUMs | 42 | 62 | +20 (+48%) | **HIGH** (likely dedup issue) |
| RLS Policies (DDL) | 234 | 251 | +17 (+7%) | **MEDIUM** |

### Minor (<10% variance)
| Metric | YAML | Actual | Delta | Severity |
|--------|------|--------|-------|----------|
| Tables | 172 | 168 | -4 (-2%) | **MEDIUM** |
| Views | 22 | 18 | -4 (-18%) | **MEDIUM** |
| Triggers | 67 | 68 | +1 (+1%) | **LOW** |
| Services | 173 | 172 | -1 (-1%) | **LOW** |
| DTOs | 400 | 401 | +1 (+0.3%) | **LOW** |

### Methodology Differences (not real mismatches)
| Metric | YAML | Actual | Explanation |
|--------|------|--------|-------------|
| Pages | 70 | 62 (strict) / 72 (all .tsx in pages/) | YAML counts non-Page-suffixed files as pages |
| API Service Files | 67 | 55 (services/api/) / 45 (excl infra) | YAML aggregates across multiple directories |
| Seeds | 92 | 116 files | YAML counts pipeline entries, not physical files |

### Exact Matches (PASS)
- Schemas: 18
- Materialized Views: 7
- Entities: 156 files
- Controllers: 108
- Components (.tsx): 590
- Hooks: 127
- Stores (Zustand): 13

---

## 6. Corrections Needed

### Priority 1 (Database Inventory)

1. **Tables: 172 -> 168**
   - 166 SQL files in tables/ directories
   - 2 multi-table files: guild_missions (2 tables), conversation_participants (2 tables)
   - = 168 actual CREATE TABLE statements
   - The YAML comment "171 SQL files + 2 multi-table - 1 MV file" is incorrect: there are 166 files, not 171, and no MV files in tables/ dirs
   - Files: `MASTER_INVENTORY.yml:30`, `DATABASE_INVENTORY.yml:17`

2. **Views: 22 -> 18**
   - Only 18 CREATE VIEW statements across 18 view files
   - The extra 4 may have been MVs incorrectly counted as views, or views that were later removed
   - Files: `MASTER_INVENTORY.yml:31`, `DATABASE_INVENTORY.yml:18`

3. **Functions: 183 -> 158 (functions/ only) or 202 (all DDL)**
   - 158 CREATE FUNCTION in functions/ directories (116 files)
   - 202 CREATE FUNCTION across ALL DDL files (141 files), including 34 in tables/, 6 in triggers/, 1 in views/, 1 in MVs/, 1 in _cross_schema/, 1 in 00-prerequisites.sql
   - YAML claims 183 which matches neither methodology
   - **Recommendation:** Update to 158 (functions/ dirs only) and add a note "~44 additional inline functions exist in table/trigger/view files"
   - Files: `MASTER_INVENTORY.yml:33`, `DATABASE_INVENTORY.yml:20`

4. **ENUMs: 42 -> needs dedup analysis**
   - 62 total CREATE TYPE AS ENUM statements found
   - 22 in 00-prerequisites.sql + 38 in enum files + 2 in table files
   - If 00-prerequisites definitions overlap with enum files (using IF NOT EXISTS), then unique count may be ~40-42
   - Requires manual deduplication check
   - Files: `MASTER_INVENTORY.yml:37`, `DATABASE_INVENTORY.yml:24`

5. **RLS Policies: 234 -> 251**
   - 251 CREATE POLICY in schema rls-policies directories + 2 in rate_limit_logs table file = 253
   - The YAML says 234 which is significantly lower; 17-19 policies have been added since last count
   - Files: `MASTER_INVENTORY.yml:35`, `DATABASE_INVENTORY.yml:22`

6. **Triggers: 67 -> 68**
   - 68 CREATE TRIGGER statements found across 37 trigger files
   - Minor discrepancy of 1
   - Files: `MASTER_INVENTORY.yml:34`, `DATABASE_INVENTORY.yml:21`

### Priority 2 (Backend Inventory)

7. **Services: 173 -> 172**
   - 1 service file appears to have been removed or is missing
   - Files: `MASTER_INVENTORY.yml:49`, `BACKEND_INVENTORY.yml:20`

8. **DTOs: 400 -> 401**
   - 1 additional DTO file exists
   - Files: `MASTER_INVENTORY.yml:48`, `BACKEND_INVENTORY.yml:19`

### Priority 3 (Methodology Clarification)

9. **Pages count methodology**: Document that "70 pages" includes non-Page-suffixed .tsx files in pages directories (e.g., DashboardComplete.tsx, DeviceManagementSection.tsx, settings subsections)

10. **API Service Files methodology**: The count of 67 aggregates from multiple source directories (services/api/ + features/ + shared/ + deprecated). This should be documented more explicitly.

11. **Seeds count**: Clarify that "92 pipeline entries" means lines in the init-database.sh pipeline, not the 116 physical .sql files in seeds/dev/ (excl _testing and _backlog).

---

## 7. Verification Methodology

All counts were obtained using:
- **Glob**: `apps/database/ddl/schemas/*/tables/*.sql` (and equivalent for views, functions, triggers, rls-policies, enums)
- **Grep**: `^CREATE TABLE`, `^CREATE VIEW`, `CREATE (OR REPLACE )?FUNCTION`, `CREATE TRIGGER`, `CREATE POLICY`, `CREATE TYPE .+ AS ENUM`
- **Bash find + wc**: For backend .entity.ts, .service.ts, .controller.ts, .dto.ts; frontend .tsx, use*.ts, *Page.tsx, *Store.ts
- All searches run against the working tree on disk, not git HEAD

**Key distinction**: File counts vs statement counts. A single .sql file may contain multiple CREATE statements (multi-table files, batch trigger files, etc.). The YAML inventories inconsistently use one or the other.

---

*Generated 2026-02-21 by SSOT Inventory Validation task*
