# 03-DATABASE-VALIDATION.md

**Tarea:** TASK-2026-02-21-COMPLIANCE-AUDIT
**Fecha:** 2026-02-21
**Agente:** Claude Opus 4.6
**Objetivo:** Validar seeds + DDL alignment post UUID migration (131 placeholder UUIDs -> gen_random_uuid())

---

## 1. SQL Syntax Validation

### 1.1 Seed Files Validated

| # | File | gen_random_uuid() | DO Blocks | SELECT INTO | ON CONFLICT | Variable Types | Status |
|---|------|-------------------|-----------|-------------|-------------|----------------|--------|
| 1 | `dev/auth/01-demo-users.sql` | OK (6 calls: 3 id + 3 instance_id) | OK (1 verification block) | OK (4 INTO) | OK (email) | OK (INTEGER) | PASS |
| 2 | `dev/auth/01b-demo-students.sql` | OK (8 calls: 4 id + 4 instance_id) | OK (1 verification block) | OK (1 INTO) | OK (email) | OK (INTEGER) | PASS |
| 3 | `dev/auth_management/04-profiles-complete.sql` | OK (3 profile ids) | OK (4 DO blocks: 3 per-user + 1 verify) | OK (user_id, tenant_id lookups) | OK (user_id) | OK (UUID, INTEGER) | PASS |
| 4 | `staging/auth_management/03-profiles.sql` | OK (3 profile ids) | OK (4 DO blocks: 3 per-user + 1 verify) | OK (user_id, tenant_id lookups) | OK (user_id) | OK (UUID, INTEGER) | PASS |
| 5 | `staging/auth_management/04-user_roles.sql` | OK (8+ gen_random_uuid() for role ids) | OK (2 DO blocks: main + verify) | OK (tenant, profile lookups via JOIN) | OK (user_id, tenant_id, role) | OK (UUID) | PASS |
| 6 | `dev/_testing/CREAR-USUARIOS-TESTING.sql` | OK (15+ calls: users, profiles, stats, ranks) | OK (1 large DO block) | OK (tenant, user_id lookups) | OK (email, user_id) | OK (UUID, INTEGER) | PASS |
| 7 | `dev/_testing/01-test-exercises-validation.sql` | OK (16+ calls: 15 exercise ids + 1 module id) | OK (2 DO blocks: main + verify) | OK (teacher profile, module lookups) | OK (module_id, exercise_type, order_index) | OK (UUID) | PASS |
| 8 | `dev/admin_dashboard/02-admin_reports.sql` | OK (4 report ids) | OK (1 DO block with full logic) | OK (tenant, admin profile lookups) | OK (id) | OK (UUID) | PASS |
| 9 | `dev/admin_dashboard/01-bulk_operations.sql` | OK (10 calls: 3 op ids + 7 target ids) | OK (1 DO block) | OK (admin profile lookup) | N/A (no conflict clause on ops) | OK (UUID) | PASS |
| 10 | `dev/social_features/00-schools-default.sql` | OK (1 school id) | OK (2 DO blocks: main + verify) | OK (tenant lookup) | OK (code) | OK (UUID, RECORD) | PASS |
| 11 | `dev/social_features/02-classrooms.sql` | OK (3+ calls: classroom + teacher_classrooms) | OK (3 DO blocks) | OK (tenant, school, teacher lookups) | OK (code, teacher_id+classroom_id) | OK (UUID, BOOLEAN, RECORD, INTEGER) | PASS |
| 12 | `dev/auth/02-production-users.sql` | OK (45 instance_id calls via gen_random_uuid()) | OK (1 verification DO block) | OK (count queries) | OK (id) | OK (INTEGER) | PASS |

### 1.2 Syntax Checks Summary

- **gen_random_uuid() calls:** All use bare function call (no quotes), all in correct UUID column contexts. VALID.
- **DO blocks:** All have matching DECLARE/BEGIN/END structure. No nesting errors. VALID.
- **SELECT INTO:** All use correct schema-qualified `table.column` paths (e.g., `auth.users`, `auth_management.profiles`, `auth_management.tenants`). VALID.
- **ON CONFLICT clauses:** All reference actual unique constraints or primary keys. VALID.
- **Variable types:** All UUID variables declared as `UUID`, all count variables as `INTEGER`. VALID.
- **Dynamic lookups:** All use the correct pattern: `SELECT id INTO v_var FROM schema.table WHERE ...`. VALID.
- **Graceful skip pattern:** Files 3-11 all implement `IF v_var IS NULL THEN RAISE NOTICE ...; RETURN; END IF;`. VALID.
- **Email references:** All lookup emails match the expected users (`admin@gamilit.com`, `teacher@gamilit.com`, `student@gamilit.com`, `*@demo.glit.edu.mx`). VALID.

**Result: 12/12 files PASS**

---

## 2. DDL Table Validation

### 2.1 Table: `educational_content.resource_ratings` (DDL #28)

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| CREATE TABLE IF NOT EXISTS | Yes | Yes | PASS |
| Primary key | `id UUID DEFAULT gen_random_uuid()` | Correct | PASS |
| FK: resource_id -> teacher_contents(id) | ON DELETE CASCADE | Correct | PASS |
| FK: teacher_id -> auth_management.profiles(id) | ON DELETE CASCADE | Correct | PASS |
| CHECK: rating BETWEEN 1 AND 5 | SMALLINT, CHECK | Correct | PASS |
| UNIQUE(resource_id, teacher_id) | Yes | Yes | PASS |
| created_at TIMESTAMPTZ | DEFAULT NOW() | Correct | PASS |
| updated_at TIMESTAMPTZ | DEFAULT NOW() | Correct | PASS |
| Index: idx_resource_ratings_resource_id | Yes | Yes | PASS |
| Index: idx_resource_ratings_teacher_id | Yes | Yes | PASS |
| Table COMMENT | Yes | Yes | PASS |
| Column COMMENTs | 3 columns | 3 columns | PASS |
| **RLS enabled** | Expected | **NOT FOUND** | **FAIL** |
| **RLS policies** | Expected | **NOT FOUND** | **FAIL** |
| **updated_at trigger** | Expected | **NOT FOUND** | **FAIL** |

### 2.2 Table: `educational_content.resource_comments` (DDL #29)

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| CREATE TABLE IF NOT EXISTS | Yes | Yes | PASS |
| Primary key | `id UUID DEFAULT gen_random_uuid()` | Correct | PASS |
| FK: resource_id -> teacher_contents(id) | ON DELETE CASCADE | Correct | PASS |
| FK: author_id -> auth_management.profiles(id) | ON DELETE CASCADE | Correct | PASS |
| text TEXT NOT NULL | Yes | Yes | PASS |
| is_deleted BOOLEAN DEFAULT FALSE | Yes | Yes | PASS |
| created_at TIMESTAMPTZ | DEFAULT NOW() | Correct | PASS |
| updated_at TIMESTAMPTZ | DEFAULT NOW() | Correct | PASS |
| Index: idx_resource_comments_resource_id | Yes | Yes | PASS |
| Index: idx_resource_comments_author_id | Yes | Yes | PASS |
| Index: idx_resource_comments_created_at DESC | Yes | Yes | PASS |
| Table COMMENT | Yes | Yes | PASS |
| Column COMMENTs | 4 columns | 4 columns | PASS |
| **RLS enabled** | Expected | **NOT FOUND** | **FAIL** |
| **RLS policies** | Expected | **NOT FOUND** | **FAIL** |
| **updated_at trigger** | Expected | **NOT FOUND** | **FAIL** |

### 2.3 Table: `educational_content.resource_downloads` (DDL #30)

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| CREATE TABLE IF NOT EXISTS | Yes | Yes | PASS |
| Primary key | `id UUID DEFAULT gen_random_uuid()` | Correct | PASS |
| FK: resource_id -> teacher_contents(id) | ON DELETE CASCADE | Correct | PASS |
| FK: downloaded_by -> auth_management.profiles(id) | ON DELETE CASCADE | Correct | PASS |
| downloaded_at TIMESTAMPTZ | DEFAULT NOW() | Correct | PASS |
| Index: idx_resource_downloads_resource_id | Yes | Yes | PASS |
| Index: idx_resource_downloads_downloaded_by | Yes | Yes | PASS |
| Table COMMENT | Yes | Yes | PASS |
| Column COMMENTs | 3 columns | 3 columns | PASS |
| **RLS enabled** | Expected | **NOT FOUND** | **FAIL** |
| **RLS policies** | Expected | **NOT FOUND** | **FAIL** |
| updated_at trigger | N/A (no updated_at column) | N/A | N/A |

### 2.4 DDL Issues Found

**ISSUE-DDL-001: Missing RLS on 3 new tables**

The 3 new tables (`resource_ratings`, `resource_comments`, `resource_downloads`) lack:
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- RLS policy definitions

No RLS files were found at:
- `apps/database/ddl/schemas/educational_content/rls/*resource*` -- 0 files
- The general RLS directory `apps/database/ddl/schemas/educational_content/rls/` -- 0 files total

**Severity:** MEDIUM -- These tables contain user-specific data (teacher ratings, comments, downloads) and should be protected by RLS in a multi-tenant system.

**ISSUE-DDL-002: Missing updated_at triggers on resource_ratings and resource_comments**

Both tables have an `updated_at` column with `DEFAULT NOW()` but no trigger to auto-update it on `UPDATE`. The existing batch trigger file (`00-batch_updated_at_triggers.sql`) covers only 5 older tables and does not include the 3 new resource tables.

**Severity:** LOW -- TypeORM's `@UpdateDateColumn` handles this at the ORM level, but the DDL should still have the trigger for direct SQL updates.

---

## 3. Entity-DDL Alignment

### 3.1 ResourceRating (Entity vs DDL #28)

| DDL Column | DDL Type | Entity Column | Entity Type | Nullable | Default | Status |
|------------|----------|---------------|-------------|----------|---------|--------|
| id | UUID PK DEFAULT gen_random_uuid() | id | PrimaryGeneratedColumn('uuid') | NOT NULL | auto | PASS |
| resource_id | UUID NOT NULL FK | resource_id | Column uuid | NOT NULL | -- | PASS |
| teacher_id | UUID NOT NULL FK | teacher_id | Column uuid | NOT NULL | -- | PASS |
| rating | SMALLINT NOT NULL CHECK 1-5 | rating | Column smallint | NOT NULL | -- | PASS |
| created_at | TIMESTAMPTZ DEFAULT NOW() | created_at | CreateDateColumn timestamptz | -- | auto | PASS |
| updated_at | TIMESTAMPTZ DEFAULT NOW() | updated_at | UpdateDateColumn timestamptz | -- | auto | PASS |
| UNIQUE(resource_id, teacher_id) | Constraint | @Unique(['resource_id', 'teacher_id']) | Decorator | -- | -- | PASS |
| FK resource_id -> teacher_contents | ON DELETE CASCADE | @ManyToOne(() => TeacherContent, { onDelete: 'CASCADE' }) | Relation | -- | -- | PASS |
| FK teacher_id -> profiles | ON DELETE CASCADE | @ManyToOne(() => Profile, { onDelete: 'CASCADE' }) | Relation | -- | -- | PASS |
| Schema: educational_content | -- | schema: DB_SCHEMAS.EDUCATIONAL | -- | -- | -- | PASS |

**Result: 10/10 PASS -- Perfect alignment**

### 3.2 ResourceComment (Entity vs DDL #29)

| DDL Column | DDL Type | Entity Column | Entity Type | Nullable | Default | Status |
|------------|----------|---------------|-------------|----------|---------|--------|
| id | UUID PK DEFAULT gen_random_uuid() | id | PrimaryGeneratedColumn('uuid') | NOT NULL | auto | PASS |
| resource_id | UUID NOT NULL FK | resource_id | Column uuid | NOT NULL | -- | PASS |
| author_id | UUID NOT NULL FK | author_id | Column uuid | NOT NULL | -- | PASS |
| text | TEXT NOT NULL | text | Column text | NOT NULL | -- | PASS |
| is_deleted | BOOLEAN DEFAULT FALSE | is_deleted | Column boolean, default: false | -- | false | PASS |
| created_at | TIMESTAMPTZ DEFAULT NOW() | created_at | CreateDateColumn timestamptz | -- | auto | PASS |
| updated_at | TIMESTAMPTZ DEFAULT NOW() | updated_at | UpdateDateColumn timestamptz | -- | auto | PASS |
| FK resource_id -> teacher_contents | ON DELETE CASCADE | @ManyToOne(() => TeacherContent, { onDelete: 'CASCADE' }) | Relation | -- | -- | PASS |
| FK author_id -> profiles | ON DELETE CASCADE | @ManyToOne(() => Profile, { onDelete: 'CASCADE' }) | Relation | -- | -- | PASS |
| Schema: educational_content | -- | schema: DB_SCHEMAS.EDUCATIONAL | -- | -- | -- | PASS |

**Result: 10/10 PASS -- Perfect alignment**

### 3.3 ResourceDownload (Entity vs DDL #30)

| DDL Column | DDL Type | Entity Column | Entity Type | Nullable | Default | Status |
|------------|----------|---------------|-------------|----------|---------|--------|
| id | UUID PK DEFAULT gen_random_uuid() | id | PrimaryGeneratedColumn('uuid') | NOT NULL | auto | PASS |
| resource_id | UUID NOT NULL FK | resource_id | Column uuid | NOT NULL | -- | PASS |
| downloaded_by | UUID NOT NULL FK | downloaded_by | Column uuid | NOT NULL | -- | PASS |
| downloaded_at | TIMESTAMPTZ DEFAULT NOW() | downloaded_at | CreateDateColumn timestamptz | -- | auto | PASS |
| FK resource_id -> teacher_contents | ON DELETE CASCADE | @ManyToOne(() => TeacherContent, { onDelete: 'CASCADE' }) | Relation | -- | -- | PASS |
| FK downloaded_by -> profiles | ON DELETE CASCADE | @ManyToOne(() => Profile, { onDelete: 'CASCADE' }) | Relation | -- | -- | PASS |
| Schema: educational_content | -- | schema: DB_SCHEMAS.EDUCATIONAL | -- | -- | -- | PASS |

**Result: 7/7 PASS -- Perfect alignment**

**Note:** The entity does NOT have an `updated_at` column, which matches the DDL (resource_downloads has no `updated_at` column). CONSISTENT.

---

## 4. Pipeline Count

### 4.1 Seed Pipeline Entries in `init-database.sh`

Total entries in `seed_entries` array: **91**

Breakdown by phase:
| Phase | Description | Entries |
|-------|-------------|---------|
| 1 | Auth Base | 6 |
| 2 | Profiles | 9 |
| 2.1 | Notification Preferences | 2 |
| 3 | System Config & Notifications | 7 |
| 4 | Gamification Base | 4 |
| 5 | Gamification Advanced | 15 |
| 6 | Educational Content | 18 |
| 7 | Content Management | 6 |
| 8 | Social Features | 9 |
| 9 | Progress & Audit | 10 |
| 10 | Integrations | 1 |
| 11 | Admin Dashboard | 2 |
| 12 | Communication | 3 |
| **Total** | | **92** |

Breakdown by scope:
| Scope | Count |
|-------|-------|
| `all` (both dev and prod) | 62 |
| `dev` (dev-only) | 29 |
| `prod` (prod-only) | 1 |
| **Total** | **92** |

### 4.2 Comparison with Inventory

The `database-master.sh` help text states "88 archivos" but the actual `init-database.sh` pipeline contains **92** seed entries. The discrepancy is likely due to recent additions (TEACHER-PORTAL-AUDIT added 3 seeds, plus other incremental additions). The pipeline count of 92 is the SSOT.

### 4.3 Non-Pipeline Seed Files in dev/

Several files exist in `dev/` but are NOT in the pipeline:
- `dev/progress_tracking/06-user-difficulty-progress.sql` -- NOT IN PIPELINE
- `dev/progress_tracking/07-user-current-level.sql` -- NOT IN PIPELINE
- `dev/progress_tracking/09-skill-assessments.sql` -- NOT IN PIPELINE
- `dev/progress_tracking/10-mastery-tracking.sql` -- NOT IN PIPELINE
- `dev/progress_tracking/11-engagement-metrics.sql` -- NOT IN PIPELINE
- `dev/progress_tracking/12-progress-snapshots.sql` -- NOT IN PIPELINE
- `dev/progress_tracking/13-module-completion-tracking.sql` -- NOT IN PIPELINE
- `dev/notifications/02-notification_templates_i18n.sql` -- NOT IN PIPELINE
- `dev/00-dev-testing-student.sql` -- NOT IN PIPELINE
- `dev/educational_content/16-classroom_modules.sql` -- NOT IN PIPELINE (duplicate of `14-classroom_modules.sql`?)
- `dev/audit_logging/01-activity_log_sample.sql` -- NOT IN PIPELINE

**Note:** These are not bugs -- they are extra dev utility files that exist on disk but are not loaded by the pipeline. They may be loaded manually or are orphaned.

---

## 5. Cross-Environment Consistency

### 5.1 `|all|` Scoped Seeds: dev vs prod vs staging

The pipeline has **62** entries with scope `|all|`. For these, the init-database.sh resolves the file path based on `$SEEDS_DIR` which is set per environment (dev/prod/staging).

**Key `|all|` files verified to exist in all 3 environments:**

| Seed Path | dev | prod | staging |
|-----------|-----|------|---------|
| auth_management/01-tenants.sql | YES | YES | YES |
| auth_management/02-tenants-production.sql | YES | YES | -- |
| auth_management/02-auth_providers.sql | YES | YES | YES |
| auth/01-demo-users.sql | YES | YES | YES |
| auth/02-production-users.sql | YES | YES | YES |
| auth_management/04-profiles-complete.sql | YES | YES | YES |
| auth_management/06-profiles-production.sql | YES | YES | YES |
| auth_management/07-profiles-production-additional.sql | YES | YES | YES |
| auth_management/07-user_roles.sql | YES | YES | YES |
| notifications/02-notification_preferences_defaults.sql | YES | YES | YES |
| system_configuration/01-system_settings.sql | YES | YES | YES |
| system_configuration/01-feature_flags_seeds.sql | YES | YES | YES |
| system_configuration/02-gamification_parameters_seeds.sql | YES | YES | YES |
| system_configuration/03-notification_settings_global.sql | YES | YES | YES |
| system_configuration/04-rate_limits.sql | YES | YES | YES |
| notifications/01-notification_templates.sql | YES | YES | YES |
| gamification_system/01-achievement_categories.sql | YES | YES | YES |
| gamification_system/02-leaderboard_metadata.sql | YES | YES | YES |
| gamification_system/03-maya_ranks.sql | YES | YES | YES |
| gamification_system/04-achievements.sql | YES | YES | YES |
| gamification_system/05-user_stats.sql | YES | YES | YES |
| gamification_system/06-user_ranks.sql | YES | YES | YES |
| gamification_system/07-ml_coins_transactions.sql | YES | YES | YES |
| gamification_system/08-user_achievements.sql | YES | YES | YES |
| gamification_system/09-comodines_inventory.sql | YES | YES | YES |
| gamification_system/10-mission_templates.sql | YES | YES | YES |
| gamification_system/12-shop_categories.sql | YES | YES | YES |
| gamification_system/13-shop_items.sql | YES | YES | YES |
| gamification_system/14-achievements-m3-m5.sql | YES | YES | YES |
| gamification_system/15-comodin_usage_tracking.sql | YES | YES | YES |
| gamification_system/16-shop_items_expanded.sql | YES | YES | YES |
| gamification_system/17-shop_items_metadata_normalization.sql | YES | YES | YES |
| gamification_system/20-achievements-collection.sql | YES | YES | YES |
| educational_content/01-modules.sql | YES | YES | YES |
| educational_content/02-exercises-module1.sql | YES | YES | YES |
| educational_content/03-exercises-module2.sql | YES | YES | YES |
| educational_content/04-exercises-module3.sql | YES | YES | YES |
| educational_content/05-exercises-module4.sql | YES | YES | YES |
| educational_content/06-exercises-module5.sql | YES | YES | YES |
| educational_content/07-assessment-rubrics.sql | YES | YES | YES |
| educational_content/05-assignments.sql | YES | YES | YES |
| educational_content/08-difficulty_criteria.sql | YES | YES | YES |
| educational_content/09-exercise_mechanic_mapping.sql | YES | YES | YES |
| educational_content/10-exercise_validation_config.sql | YES | YES | YES |
| educational_content/11-exercise_validation_config_m4_m5.sql | YES | YES | YES |
| educational_content/11-module_dependencies.sql | YES | YES | YES |
| educational_content/12-taxonomies.sql | YES | YES | YES |
| educational_content/13-exercise_type_rubrics.sql | YES | YES | YES |
| educational_content/14-classroom_modules.sql | YES | YES | YES |
| content_management/01-default-templates.sql | YES | YES | YES |
| content_management/03-tags.sql | YES | YES | YES |
| content_management/04-moderation_rules.sql | YES | YES | YES |
| social_features/00-schools-default.sql | YES | YES | YES |
| social_features/01-schools.sql | YES | YES | YES |
| social_features/02-classrooms.sql | YES | YES | YES |
| social_features/03-classroom-members.sql | YES | YES | YES |
| social_features/04-teams.sql | YES | YES | YES |
| social_features/05-teacher-reports.sql | YES | YES | YES |
| auth_management/08-assign-admin-schools.sql | YES | YES | YES |
| progress_tracking/01-module_progress.sql | YES | YES | YES |
| audit_logging/01-default-config.sql | YES | YES | YES |
| lti_integration/01-lti_consumers.sql | YES | YES | YES |
| admin_dashboard/01-bulk_operations.sql | YES | YES | YES |
| admin_dashboard/02-admin_reports.sql | YES | YES | YES |

### 5.2 Missing in Staging (compared to prod)

Staging is missing some `|all|` seeds that exist in dev and prod:
- `auth_management/02-tenants-production.sql` -- MISSING in staging
- `content_management/02-marie_curie_content.sql` -- EXISTS (the `|prod|` scoped version)

**Severity:** LOW -- Staging does not use `init-database.sh` with the same pipeline; it has its own subset of seeds.

### 5.3 Extra Files in Prod (not in pipeline)

Prod has 2 files not in the pipeline:
- `prod/social_features/08-peer_challenges.sql` -- NOT IN PIPELINE
- `prod/social_features/10-team_challenges.sql` -- NOT IN PIPELINE

These are prod-only files that exist on disk but are not loaded by the seed pipeline. They appear to be aspirational/future features.

---

## 6. Issues Found

### Critical (0)

None.

### Medium (2)

| ID | Issue | Location | Description | Recommendation |
|----|-------|----------|-------------|----------------|
| ISSUE-DDL-001 | Missing RLS | `educational_content.resource_ratings`, `resource_comments`, `resource_downloads` | 3 new tables have NO `ALTER TABLE ENABLE ROW LEVEL SECURITY` and NO policy definitions. These tables contain teacher-specific data in a multi-tenant system. | Create RLS file at `ddl/schemas/educational_content/rls/07d-resource_tables.sql` with at least SELECT/INSERT/UPDATE/DELETE policies based on `teacher_id`/`author_id`/`downloaded_by` matching the current user's profile. |
| ISSUE-DDL-002 | Missing updated_at triggers | `educational_content.resource_ratings`, `resource_comments` | Both tables have `updated_at TIMESTAMPTZ DEFAULT NOW()` but no trigger to auto-update on UPDATE. The batch trigger file only covers 5 older tables. | Add 2 triggers to `00-batch_updated_at_triggers.sql` using `gamilit.update_updated_at_column()`. |

### Low (2)

| ID | Issue | Location | Description | Recommendation |
|----|-------|----------|-------------|----------------|
| ISSUE-PIPE-001 | Pipeline count mismatch | `database-master.sh` help text | Help says "88 archivos" but actual pipeline has 92 entries. | Update help text in `database-master.sh` (lines 126-127) to say "92 archivos". |
| ISSUE-PIPE-002 | Orphaned seed files | `dev/progress_tracking/06-12`, `dev/notifications/02-*_i18n`, etc. | ~11 seed files exist on disk but are NOT in the pipeline. They may be intentionally manual-only or orphaned. | Audit whether these should be in the pipeline or archived. |

### Informational (1)

| ID | Note | Description |
|----|------|-------------|
| INFO-001 | staging/auth_management/02-tenants-production.sql missing | Staging does not have this file, but it exists in dev and prod. Staging appears to use a reduced seed set. Not a bug if staging is not run via init-database.sh. |

---

## 7. Summary

| Category | Result |
|----------|--------|
| SQL Syntax Validation | **12/12 PASS** -- All seed files have valid PL/pgSQL syntax |
| gen_random_uuid() usage | **VALID** -- No quoted function calls, all in UUID contexts |
| Dynamic lookups | **VALID** -- All reference correct emails and table paths |
| DO block structure | **VALID** -- All DECLARE/BEGIN/END properly matched |
| ON CONFLICT clauses | **VALID** -- All reference actual constraints |
| DDL Table Structure | **3/3 PASS** (table structure) -- 2 MEDIUM issues (RLS, triggers) |
| Entity-DDL Alignment | **27/27 columns PASS** -- Perfect match across all 3 entities |
| Pipeline Count | **92 entries** (62 all + 29 dev + 1 prod) |
| Cross-Environment | **62/62 `all` seeds verified in dev** -- prod/staging have expected subsets |
| Total Issues | **0 Critical, 2 Medium, 2 Low, 1 Info** |

### Action Items

1. **[MEDIUM] Create RLS policies** for `resource_ratings`, `resource_comments`, `resource_downloads` (ISSUE-DDL-001)
2. **[MEDIUM] Add updated_at triggers** for `resource_ratings` and `resource_comments` to batch trigger file (ISSUE-DDL-002)
3. **[LOW] Update database-master.sh** help text: "88 archivos" -> "92 archivos" (ISSUE-PIPE-001)
4. **[LOW] Audit 11 orphaned seed files** in dev/ that are not in pipeline (ISSUE-PIPE-002)
