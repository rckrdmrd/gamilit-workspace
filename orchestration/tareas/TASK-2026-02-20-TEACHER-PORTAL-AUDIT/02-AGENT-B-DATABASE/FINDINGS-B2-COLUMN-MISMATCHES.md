# FINDINGS-B2: Column Mismatches

**Agent:** B (Database Coherence)
**Date:** 2026-02-20
**Scope:** Column-by-column comparison between TypeORM entities and DDL definitions

---

## Critical Mismatches

### 1. ScheduledReport Entity vs DDL `social_features.scheduled_reports`

#### 1a. `frequency` column -- TypeORM ENUM vs DDL VARCHAR

| Aspect | Entity | DDL |
|--------|--------|-----|
| **Column** | `frequency` | `frequency` |
| **Entity Type** | `type: 'enum', enum: ScheduleFrequency` | `VARCHAR(20) NOT NULL CHECK (...)` |
| **Impact** | HIGH -- TypeORM generates `CREATE TYPE` for enum, DDL uses VARCHAR with CHECK constraint |

**Issue:** The entity declares `frequency` as a TypeORM enum (`type: 'enum'`), which causes TypeORM to attempt creating a PostgreSQL ENUM type. The DDL defines this as `VARCHAR(20)` with a CHECK constraint. This mismatch can cause runtime errors if TypeORM's schema sync is enabled, or unexpected type casting behavior.

**Recommendation:** Change entity to `type: 'varchar', length: 20` and keep the TypeScript enum purely for type safety.

#### 1b. `status` column -- TypeORM ENUM vs DDL VARCHAR

| Aspect | Entity | DDL |
|--------|--------|-----|
| **Column** | `status` | `status` |
| **Entity Type** | `type: 'enum', enum: ScheduleStatus` | `VARCHAR(20) DEFAULT 'active' CHECK (...)` |
| **Impact** | HIGH -- Same issue as frequency |

**Recommendation:** Change entity to `type: 'varchar', length: 20`.

#### 1c. `report_type` column -- length mismatch

| Aspect | Entity | DDL |
|--------|--------|-----|
| **Column** | `report_type` | `report_type` |
| **Entity Type** | `length: 50` (no explicit type specified, defaults to varchar) | `VARCHAR(50) NOT NULL CHECK (...)` |
| **Impact** | LOW -- functionally compatible |

#### 1d. Missing `tenant_id` FK relation

| Aspect | Entity | DDL |
|--------|--------|-----|
| **Column** | `tenantId` (column defined, no @ManyToOne) | `fk_scheduled_reports_tenant` FK to `auth_management.tenants(id)` |
| **Impact** | LOW -- column exists, FK just not modeled as relation |

---

### 2. SharedReport Entity vs DDL `social_features.shared_reports`

#### 2a. `permission_level` column -- TypeORM ENUM vs DDL VARCHAR

| Aspect | Entity | DDL |
|--------|--------|-----|
| **Column** | `permission_level` | `permission_level` |
| **Entity Type** | `type: 'enum', enum: SharePermission` | `VARCHAR(20) DEFAULT 'view' CHECK (...)` |
| **Impact** | HIGH -- Same TypeORM enum vs DDL VARCHAR mismatch |

**Recommendation:** Change entity to `type: 'varchar', length: 20`.

#### 2b. `permission_level` enum values mismatch

| Aspect | Entity | DDL |
|--------|--------|-----|
| **Entity Values** | `'view', 'download'` | `'view', 'download', 'edit'` |
| **Impact** | MEDIUM -- DDL allows 'edit' but entity TypeScript enum does not define it |

**Recommendation:** Add `EDIT = 'edit'` to the `SharePermission` enum in the entity.

#### 2c. Missing FK relations (3 of 4)

| FK in DDL | Entity Relation | Status |
|-----------|----------------|--------|
| `fk_shared_reports_report` (report_id -> teacher_reports.id) | `@ManyToOne(() => TeacherReport)` | OK |
| `fk_shared_reports_shared_by` (shared_by -> profiles.id) | NOT DECLARED | MISSING |
| `fk_shared_reports_shared_with` (shared_with -> profiles.id) | NOT DECLARED | MISSING |
| `fk_shared_reports_tenant` (tenant_id -> tenants.id) | NOT DECLARED | MISSING |

**Impact:** LOW -- columns exist in entity; FK relations just not modeled. Service does not need join navigation for these.

#### 2d. Missing `updated_at` column

| Aspect | Entity | DDL |
|--------|--------|-----|
| **Column** | NOT PRESENT | NOT PRESENT |
| **Impact** | NONE -- both consistently lack updated_at (only created_at) |

---

### 3. Message Entity vs DDL `communication.messages` -- Minor Observations

#### 3a. Missing `tenant_id` column

| Aspect | Entity | DDL |
|--------|--------|-----|
| **Column** | NOT PRESENT | NOT PRESENT |
| **Impact** | INFORMATIONAL -- messages table does not have tenant_id; tenant isolation relies on classroom_id reference chain |

**Observation:** Unlike other teacher tables, `communication.messages` has no `tenant_id` column. Multi-tenant isolation depends on the `classroom_id` FK chain (classroom -> tenant). This is consistent between entity and DDL, but differs from the pattern used by other teacher tables.

#### 3b. Missing FK relations for profile references

| DDL FK | Entity Relation | Status |
|--------|----------------|--------|
| `sender_id -> profiles(id)` | NO @ManyToOne | Entity has column only |
| `recipient_id -> profiles(id)` | NO @ManyToOne | Entity has column only |
| `deleted_by -> profiles(id)` | NO @ManyToOne | Entity has column only |
| `flagged_by -> profiles(id)` | NO @ManyToOne | Entity has column only |

**Impact:** LOW -- messages are queried by ID lookups; profile data loaded via separate queries (documented as "virtual fields" in entity).

---

### 4. TeacherContent Entity vs DDL `educational_content.teacher_contents`

#### 4a. Missing FK relations (4 FKs in DDL, 0 @ManyToOne in entity)

| DDL FK | Entity Relation | Status |
|--------|----------------|--------|
| `teacher_id -> profiles(id)` | NO @ManyToOne | MISSING |
| `tenant_id -> tenants(id)` | NO @ManyToOne | MISSING |
| `approved_by -> profiles(id)` | NO @ManyToOne | MISSING |
| `based_on_content_id -> teacher_contents(id)` (self-ref) | NO @ManyToOne | MISSING |
| `previous_version_id -> teacher_contents(id)` (self-ref) | NO @ManyToOne | MISSING |

**Impact:** LOW -- columns exist; TeacherContentService does not use relation navigation, loads related data via separate queries.

---

### 5. TeacherAlertConfiguration Entity vs DDL `progress_tracking.teacher_alert_configurations`

#### 5a. Missing FK relations (3 FKs in DDL, 0 @ManyToOne in entity)

| DDL FK | Entity Relation | Status |
|--------|----------------|--------|
| `teacher_id -> profiles(id)` | NO @ManyToOne | MISSING (documented: "cross-schema FKs not defined in TypeORM") |
| `classroom_id -> classrooms(id)` | NO @ManyToOne | MISSING |
| `tenant_id -> tenants(id)` | NO @ManyToOne | MISSING |

**Impact:** LOW -- AlertConfigService loads classrooms via separate repository calls. Entity comment explicitly notes cross-schema FKs are intentionally not declared.

---

## Summary Statistics

| Severity | Count | Description |
|----------|-------|-------------|
| **HIGH** | 3 | TypeORM enum vs DDL VARCHAR mismatches (ScheduledReport.frequency, ScheduledReport.status, SharedReport.permission_level) |
| **MEDIUM** | 1 | SharedReport permission_level missing 'edit' value |
| **LOW** | 5 | Missing @ManyToOne relations for DDL FKs (entity has columns, just no TypeORM relation navigation) |
| **INFORMATIONAL** | 1 | Message table lacks tenant_id (by design) |

---

*Generated by Agent B - Database Coherence Audit*
