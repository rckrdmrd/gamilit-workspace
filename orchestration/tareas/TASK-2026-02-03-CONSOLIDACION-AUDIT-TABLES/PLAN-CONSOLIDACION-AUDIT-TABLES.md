# PLAN-CONSOLIDACION-AUDIT-TABLES.md

**Gap Reference:** OVR-001 (Critical Table Overlap)
**Created:** 2026-02-03
**Author:** @ARCHITECT_AGENT
**Status:** PLAN (No Execution Yet)

---

## Executive Summary

The `audit_logging` schema contains **4 tables with significant functional overlap**, storing similar activity/audit data with varying levels of detail. This results in:
- Data redundancy (same events recorded 3-4 times)
- Storage bloat
- Query confusion (which table to use?)
- Maintenance burden (4 cleanup functions instead of 1)

**Recommendation:** Consolidate into a **single unified table** with a **category/type discriminator** to maintain logical separation while eliminating physical duplication.

---

## 1. Current State Analysis

### 1.1 Table Inventory

| Table | Columns | Purpose | Created |
|-------|---------|---------|---------|
| `audit_logs` | 27 | Full audit trail for compliance | 2025-10-27 |
| `system_logs` | 23 | System/debugging logs | 2025-10-27 |
| `user_activity_logs` | 28 | User analytics/behavior | 2025-10-27 |
| `activity_log` | 10 | Admin dashboard activity | 2025-11-24 |

### 1.2 Detailed Column Analysis

#### Table: audit_logs (27 columns)
```sql
id, tenant_id, event_type, action, resource_type, resource_id,
actor_id, actor_type, actor_ip, actor_user_agent, target_id, target_type,
session_id, description, old_values, new_values, changes, severity, status,
error_code, error_message, stack_trace, request_id, correlation_id,
additional_data, tags, created_at
```

**Purpose:** Security/compliance audit trail with full change tracking.
**Key Features:** Change capture (old/new values), correlation tracking, severity levels.

#### Table: system_logs (23 columns)
```sql
id, tenant_id, log_level, logger_name, message, module_name,
function_name, line_number, file_path, request_id, session_id, user_id,
ip_address, exception_type, exception_message, stack_trace, execution_time_ms,
memory_usage_mb, cpu_usage_percent, environment, server_name, thread_id,
correlation_id, extra_data, created_at
```

**Purpose:** Technical debugging and error logging.
**Key Features:** Code location (file, line, function), performance metrics, exception details.

#### Table: user_activity_logs (28 columns)
```sql
id, user_id, tenant_id, activity_type, action_detail, page_url,
page_title, referrer_url, session_id, session_duration, element_id,
element_type, element_text, coordinates, module_id, exercise_id,
classroom_id, user_agent, ip_address, device_type, browser_name,
browser_version, screen_resolution, load_time_ms, interaction_time_ms,
metadata, created_at
```

**Purpose:** User behavior analytics and UX tracking.
**Key Features:** UI interaction (clicks, coordinates), page analytics, educational context.

#### Table: activity_log (10 columns)
```sql
id, user_id, action_type, entity_type, entity_id, description,
metadata, ip_address, user_agent, created_at, updated_at
```

**Purpose:** Simplified activity feed for admin dashboard.
**Key Features:** Minimal footprint, high read performance.

### 1.3 Column Overlap Matrix

| Column Concept | audit_logs | system_logs | user_activity_logs | activity_log |
|----------------|:----------:|:-----------:|:------------------:|:------------:|
| id (uuid PK) | X | X | X | X |
| tenant_id | X | X | X | - |
| user_id/actor_id | X | X | X | X |
| action/type | X | X | X | X |
| description/message | X | X | X | X |
| session_id | X | X | X | - |
| ip_address | X | X | X | X |
| user_agent | X | - | X | X |
| metadata/extra_data | X | X | X | X |
| created_at | X | X | X | X |
| request_id | X | X | - | - |
| correlation_id | X | X | - | - |
| stack_trace | X | X | - | - |
| severity/log_level | X | X | - | - |
| resource_id/entity_id | X | - | - | X |

**Overlap Analysis:**
- **10 columns** are conceptually duplicated across all 4 tables
- **5 columns** are shared between 3 tables
- **4 columns** are shared between 2 tables
- Only ~20 columns are truly unique to each table

### 1.4 Current Query Patterns (from Backend Analysis)

| Service | Table Used | Query Type |
|---------|------------|------------|
| AuditService | audit_logs | INSERT (high freq), SELECT with filters |
| RecentActivityService | activity_log | SELECT recent, COUNT |
| admin_dashboard.recent_activity (view) | user_activity_logs | SELECT with JOIN |
| cleanup_old_user_activity | user_activity_logs | DELETE old records |
| cleanup_old_system_logs | system_logs | DELETE old records |
| log_audit_event | system_logs | INSERT (function) |
| log_system_event | system_logs | INSERT (function) |

### 1.5 Problems Identified

1. **Data Duplication:** Login events recorded in audit_logs, activity_log, AND user_activity_logs
2. **Inconsistent Cleanup:** Different retention periods (90 days vs 180 days)
3. **Query Confusion:** Backend uses different tables for similar purposes
4. **Schema Drift:** activity_log created later with different column naming convention
5. **Function Mismatch:** log_audit_event inserts into system_logs (wrong table!)

---

## 2. Proposed Unified Schema

### 2.1 Design Principles

1. **Single Source of Truth:** One table for all activity/audit data
2. **Category Discriminator:** Use `log_category` to maintain logical separation
3. **Superset Columns:** Include all unique columns from all 4 tables
4. **Nullable by Design:** Optional columns for category-specific data
5. **Optimized Indexes:** Partitioned by date, indexed by category

### 2.2 unified_activity_log Table Definition

```sql
-- =====================================================
-- Table: audit_logging.unified_activity_log
-- Description: Consolidated activity/audit logging table
-- Consolidates: audit_logs, system_logs, user_activity_logs, activity_log
-- Gap Resolution: OVR-001
-- =====================================================

CREATE TABLE audit_logging.unified_activity_log (
    -- =====================================================
    -- CORE IDENTITY
    -- =====================================================
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    log_category text NOT NULL, -- 'audit', 'system', 'user_activity', 'dashboard'

    -- =====================================================
    -- TENANT & USER CONTEXT
    -- =====================================================
    tenant_id uuid,
    user_id uuid,
    actor_type text DEFAULT 'user', -- user, system, api, cron

    -- =====================================================
    -- ACTION/EVENT CLASSIFICATION
    -- =====================================================
    event_type text NOT NULL, -- e.g., 'user_login', 'page_view', 'ERROR'
    action text, -- create, read, update, delete, etc.
    severity text DEFAULT 'info', -- debug, info, warning, error, critical
    status text DEFAULT 'success', -- success, failure, partial

    -- =====================================================
    -- RESOURCE/ENTITY CONTEXT
    -- =====================================================
    resource_type text,
    resource_id uuid,
    entity_type varchar(50),
    entity_id uuid,

    -- =====================================================
    -- DESCRIPTIVE CONTENT
    -- =====================================================
    message text,
    description text,

    -- =====================================================
    -- CHANGE TRACKING (audit category)
    -- =====================================================
    old_values jsonb DEFAULT '{}'::jsonb,
    new_values jsonb DEFAULT '{}'::jsonb,
    changes jsonb DEFAULT '{}'::jsonb,

    -- =====================================================
    -- REQUEST/SESSION CONTEXT
    -- =====================================================
    session_id text,
    request_id text,
    correlation_id text,
    ip_address inet,
    user_agent text,

    -- =====================================================
    -- ERROR DETAILS (system category)
    -- =====================================================
    error_code text,
    error_message text,
    exception_type text,
    stack_trace text,

    -- =====================================================
    -- CODE LOCATION (system category)
    -- =====================================================
    module_name text,
    function_name text,
    file_path text,
    line_number integer,
    logger_name text,

    -- =====================================================
    -- PERFORMANCE METRICS (system category)
    -- =====================================================
    execution_time_ms integer,
    memory_usage_mb numeric(10,2),
    cpu_usage_percent numeric(5,2),
    load_time_ms integer,
    interaction_time_ms integer,

    -- =====================================================
    -- ENVIRONMENT CONTEXT (system category)
    -- =====================================================
    environment text DEFAULT 'production',
    server_name text,
    thread_id text,

    -- =====================================================
    -- UI INTERACTION (user_activity category)
    -- =====================================================
    page_url text,
    page_title text,
    referrer_url text,
    element_id text,
    element_type text,
    element_text text,
    coordinates point,

    -- =====================================================
    -- DEVICE INFO (user_activity category)
    -- =====================================================
    device_type text,
    browser_name text,
    browser_version text,
    screen_resolution text,

    -- =====================================================
    -- EDUCATIONAL CONTEXT (user_activity category)
    -- =====================================================
    module_id uuid,
    exercise_id uuid,
    classroom_id uuid,
    session_duration interval,

    -- =====================================================
    -- FLEXIBLE METADATA
    -- =====================================================
    metadata jsonb DEFAULT '{}'::jsonb,
    additional_data jsonb DEFAULT '{}'::jsonb,
    tags text[],

    -- =====================================================
    -- TIMESTAMPS
    -- =====================================================
    created_at timestamp with time zone DEFAULT gamilit.now_mexico() NOT NULL,
    updated_at timestamp with time zone DEFAULT gamilit.now_mexico(),

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT unified_activity_log_pkey PRIMARY KEY (id, created_at),
    CONSTRAINT unified_activity_log_category_check
        CHECK (log_category IN ('audit', 'system', 'user_activity', 'dashboard')),
    CONSTRAINT unified_activity_log_actor_type_check
        CHECK (actor_type IN ('user', 'system', 'api', 'cron')),
    CONSTRAINT unified_activity_log_severity_check
        CHECK (severity IN ('trace', 'debug', 'info', 'warning', 'error', 'critical', 'fatal')),
    CONSTRAINT unified_activity_log_status_check
        CHECK (status IN ('success', 'failure', 'partial')),
    CONSTRAINT unified_activity_log_environment_check
        CHECK (environment IN ('development', 'staging', 'production'))
) PARTITION BY RANGE (created_at);
```

### 2.3 Partitioning Strategy

```sql
-- Monthly partitions for optimal query performance and maintenance
CREATE TABLE audit_logging.unified_activity_log_2026_01
    PARTITION OF audit_logging.unified_activity_log
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE audit_logging.unified_activity_log_2026_02
    PARTITION OF audit_logging.unified_activity_log
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Add partitions as needed...

-- Partition for future data (catch-all)
CREATE TABLE audit_logging.unified_activity_log_future
    PARTITION OF audit_logging.unified_activity_log
    FOR VALUES FROM ('2026-03-01') TO ('2099-12-31');
```

### 2.4 Required Indexes

```sql
-- Primary access patterns
CREATE INDEX idx_unified_category ON audit_logging.unified_activity_log
    USING btree (log_category);

CREATE INDEX idx_unified_created ON audit_logging.unified_activity_log
    USING btree (created_at DESC);

CREATE INDEX idx_unified_user ON audit_logging.unified_activity_log
    USING btree (user_id) WHERE user_id IS NOT NULL;

CREATE INDEX idx_unified_tenant ON audit_logging.unified_activity_log
    USING btree (tenant_id) WHERE tenant_id IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX idx_unified_category_created ON audit_logging.unified_activity_log
    USING btree (log_category, created_at DESC);

CREATE INDEX idx_unified_user_created ON audit_logging.unified_activity_log
    USING btree (user_id, created_at DESC) WHERE user_id IS NOT NULL;

CREATE INDEX idx_unified_category_user ON audit_logging.unified_activity_log
    USING btree (log_category, user_id) WHERE user_id IS NOT NULL;

-- Severity-based filtering (for alerts/monitoring)
CREATE INDEX idx_unified_severity ON audit_logging.unified_activity_log
    USING btree (severity, created_at DESC)
    WHERE severity IN ('error', 'critical', 'fatal');

-- Correlation tracking
CREATE INDEX idx_unified_correlation ON audit_logging.unified_activity_log
    USING btree (correlation_id) WHERE correlation_id IS NOT NULL;

CREATE INDEX idx_unified_session ON audit_logging.unified_activity_log
    USING btree (session_id) WHERE session_id IS NOT NULL;

-- Event type queries
CREATE INDEX idx_unified_event_type ON audit_logging.unified_activity_log
    USING btree (event_type);

-- Resource queries (audit category)
CREATE INDEX idx_unified_resource ON audit_logging.unified_activity_log
    USING btree (resource_type, resource_id)
    WHERE log_category = 'audit' AND resource_id IS NOT NULL;

-- JSONB indexes for metadata queries
CREATE INDEX idx_unified_metadata ON audit_logging.unified_activity_log
    USING gin (metadata);

CREATE INDEX idx_unified_tags ON audit_logging.unified_activity_log
    USING gin (tags) WHERE tags IS NOT NULL;
```

---

## 3. Migration Plan

### 3.1 Phase 1: Create New Table (Week 1)

**Duration:** 1 day
**Risk:** Low (no impact on existing tables)

**Steps:**
1. Create `unified_activity_log` table with all partitions
2. Create all required indexes
3. Set up RLS policies
4. Grant appropriate permissions
5. Add table comments/documentation

**Validation:**
```sql
-- Verify table exists and structure is correct
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'audit_logging'
AND table_name = 'unified_activity_log'
ORDER BY ordinal_position;

-- Verify partitions
SELECT inhrelid::regclass AS partition_name
FROM pg_inherits
WHERE inhparent = 'audit_logging.unified_activity_log'::regclass;
```

### 3.2 Phase 2: Dual-Write Implementation (Week 1-2)

**Duration:** 5 days
**Risk:** Medium (requires backend changes)

**Backend Changes Required:**

1. **Create UnifiedActivityLogEntity** in backend
2. **Create UnifiedActivityLogService** with methods:
   - `logAuditEvent()` - writes to unified table with category='audit'
   - `logSystemEvent()` - writes to unified table with category='system'
   - `logUserActivity()` - writes to unified table with category='user_activity'
   - `logDashboardActivity()` - writes to unified table with category='dashboard'

3. **Modify existing services** to dual-write:
   - AuditService: Write to both audit_logs AND unified_activity_log
   - AdminDashboardService: Write to both activity_log AND unified_activity_log
   - System logging: Write to both system_logs AND unified_activity_log

**Example Dual-Write Pattern:**
```typescript
async logEvent(event: CreateAuditLogDto): Promise<void> {
  // Write to legacy table (existing behavior)
  await this.auditLogRepository.save(event);

  // Write to unified table (new)
  await this.unifiedLogService.logAuditEvent({
    ...event,
    logCategory: 'audit'
  });
}
```

**Validation:**
```sql
-- Compare counts between old and new tables
SELECT
    (SELECT COUNT(*) FROM audit_logging.audit_logs WHERE created_at > NOW() - INTERVAL '1 hour') as legacy_count,
    (SELECT COUNT(*) FROM audit_logging.unified_activity_log WHERE log_category = 'audit' AND created_at > NOW() - INTERVAL '1 hour') as unified_count;
```

### 3.3 Phase 3: Historical Data Migration (Week 2-3)

**Duration:** 3-5 days (depends on data volume)
**Risk:** Medium (resource-intensive)

**Migration Scripts:**

```sql
-- Migration: audit_logs -> unified_activity_log
INSERT INTO audit_logging.unified_activity_log (
    id, log_category, tenant_id, user_id, actor_type,
    event_type, action, severity, status,
    resource_type, resource_id, description,
    old_values, new_values, changes,
    session_id, request_id, correlation_id,
    ip_address, user_agent,
    error_code, error_message, stack_trace,
    additional_data, tags, created_at
)
SELECT
    id, 'audit', tenant_id, actor_id, actor_type,
    event_type, action, severity, status,
    resource_type, resource_id, description,
    old_values, new_values, changes,
    session_id, request_id, correlation_id,
    actor_ip, actor_user_agent,
    error_code, error_message, stack_trace,
    additional_data, tags, created_at
FROM audit_logging.audit_logs
WHERE id NOT IN (SELECT id FROM audit_logging.unified_activity_log WHERE log_category = 'audit')
ON CONFLICT (id, created_at) DO NOTHING;

-- Migration: system_logs -> unified_activity_log
INSERT INTO audit_logging.unified_activity_log (
    id, log_category, tenant_id, user_id,
    event_type, severity, message,
    session_id, request_id, correlation_id,
    ip_address,
    exception_type, error_message, stack_trace,
    module_name, function_name, file_path, line_number, logger_name,
    execution_time_ms, memory_usage_mb, cpu_usage_percent,
    environment, server_name, thread_id,
    additional_data, created_at
)
SELECT
    id, 'system', tenant_id, user_id,
    log_level, -- Maps to event_type
    CASE
        WHEN log_level IN ('ERROR', 'FATAL') THEN 'error'
        WHEN log_level = 'WARN' THEN 'warning'
        WHEN log_level = 'DEBUG' THEN 'debug'
        WHEN log_level = 'TRACE' THEN 'trace'
        ELSE 'info'
    END,
    message,
    session_id, request_id, correlation_id,
    ip_address,
    exception_type, exception_message, stack_trace,
    module_name, function_name, file_path, line_number, logger_name,
    execution_time_ms, memory_usage_mb, cpu_usage_percent,
    environment, server_name, thread_id,
    extra_data, created_at
FROM audit_logging.system_logs
WHERE id NOT IN (SELECT id FROM audit_logging.unified_activity_log WHERE log_category = 'system')
ON CONFLICT (id, created_at) DO NOTHING;

-- Migration: user_activity_logs -> unified_activity_log
INSERT INTO audit_logging.unified_activity_log (
    id, log_category, tenant_id, user_id,
    event_type, description,
    session_id, session_duration,
    ip_address, user_agent,
    page_url, page_title, referrer_url,
    element_id, element_type, element_text, coordinates,
    device_type, browser_name, browser_version, screen_resolution,
    load_time_ms, interaction_time_ms,
    module_id, exercise_id, classroom_id,
    metadata, created_at
)
SELECT
    id, 'user_activity', tenant_id, user_id,
    activity_type, action_detail,
    session_id, session_duration,
    ip_address, user_agent,
    page_url, page_title, referrer_url,
    element_id, element_type, element_text, coordinates,
    device_type, browser_name, browser_version, screen_resolution,
    load_time_ms, interaction_time_ms,
    module_id, exercise_id, classroom_id,
    metadata, created_at
FROM audit_logging.user_activity_logs
WHERE id NOT IN (SELECT id FROM audit_logging.unified_activity_log WHERE log_category = 'user_activity')
ON CONFLICT (id, created_at) DO NOTHING;

-- Migration: activity_log -> unified_activity_log
INSERT INTO audit_logging.unified_activity_log (
    id, log_category, user_id,
    event_type, entity_type, entity_id,
    description, metadata,
    ip_address, user_agent,
    created_at, updated_at
)
SELECT
    id, 'dashboard', user_id,
    action_type, entity_type, entity_id,
    description, metadata,
    ip_address, user_agent,
    created_at, updated_at
FROM audit_logging.activity_log
WHERE id NOT IN (SELECT id FROM audit_logging.unified_activity_log WHERE log_category = 'dashboard')
ON CONFLICT (id, created_at) DO NOTHING;
```

**Batch Migration Strategy** (for large datasets):
```sql
-- Process in batches of 10,000 records
DO $$
DECLARE
    batch_size INTEGER := 10000;
    last_id UUID;
    rows_migrated INTEGER;
BEGIN
    LOOP
        WITH batch AS (
            SELECT * FROM audit_logging.audit_logs
            WHERE id > COALESCE(last_id, '00000000-0000-0000-0000-000000000000'::uuid)
            ORDER BY id
            LIMIT batch_size
        )
        INSERT INTO audit_logging.unified_activity_log (...)
        SELECT ... FROM batch;

        GET DIAGNOSTICS rows_migrated = ROW_COUNT;

        IF rows_migrated = 0 THEN
            EXIT;
        END IF;

        SELECT MAX(id) INTO last_id FROM batch;
        COMMIT;

        RAISE NOTICE 'Migrated batch, last_id: %', last_id;
    END LOOP;
END $$;
```

### 3.4 Phase 4: Switch to Unified Table (Week 3-4)

**Duration:** 3 days
**Risk:** High (requires coordinated deployment)

**Steps:**

1. **Update backend services** to read from unified table only
2. **Remove dual-write code** (write only to unified table)
3. **Deploy backend changes**
4. **Verify all queries work correctly**

**Validation Queries:**
```sql
-- Dashboard recent activity (replacing view)
SELECT * FROM audit_logging.unified_activity_log
WHERE log_category IN ('user_activity', 'dashboard')
AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 100;

-- Audit log queries
SELECT * FROM audit_logging.unified_activity_log
WHERE log_category = 'audit'
AND resource_type = $1
ORDER BY created_at DESC;

-- System error monitoring
SELECT * FROM audit_logging.unified_activity_log
WHERE log_category = 'system'
AND severity IN ('error', 'critical', 'fatal')
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### 3.5 Phase 5: Deprecate Old Tables (Week 4+)

**Duration:** Ongoing (2-4 weeks observation)
**Risk:** Low (reversible)

**Steps:**

1. **Rename old tables** (soft deprecation):
   ```sql
   ALTER TABLE audit_logging.audit_logs RENAME TO _deprecated_audit_logs;
   ALTER TABLE audit_logging.system_logs RENAME TO _deprecated_system_logs;
   ALTER TABLE audit_logging.user_activity_logs RENAME TO _deprecated_user_activity_logs;
   ALTER TABLE audit_logging.activity_log RENAME TO _deprecated_activity_log;
   ```

2. **Monitor for errors** for 2 weeks
3. **If stable**, drop deprecated tables:
   ```sql
   DROP TABLE audit_logging._deprecated_audit_logs;
   DROP TABLE audit_logging._deprecated_system_logs;
   DROP TABLE audit_logging._deprecated_user_activity_logs;
   DROP TABLE audit_logging._deprecated_activity_log;
   ```

---

## 4. Backwards Compatibility

### 4.1 Compatibility Views

Create views that mimic old table structures:

```sql
-- View: audit_logs (backwards compatibility)
CREATE OR REPLACE VIEW audit_logging.audit_logs AS
SELECT
    id, tenant_id, event_type, action, resource_type, resource_id,
    user_id AS actor_id, actor_type, ip_address AS actor_ip,
    user_agent AS actor_user_agent, resource_id AS target_id,
    resource_type AS target_type, session_id, description,
    old_values, new_values, changes, severity, status,
    error_code, error_message, stack_trace,
    request_id, correlation_id, additional_data, tags, created_at
FROM audit_logging.unified_activity_log
WHERE log_category = 'audit';

-- View: system_logs (backwards compatibility)
CREATE OR REPLACE VIEW audit_logging.system_logs AS
SELECT
    id, tenant_id,
    CASE severity
        WHEN 'trace' THEN 'TRACE'
        WHEN 'debug' THEN 'DEBUG'
        WHEN 'info' THEN 'INFO'
        WHEN 'warning' THEN 'WARN'
        WHEN 'error' THEN 'ERROR'
        WHEN 'critical' THEN 'FATAL'
        WHEN 'fatal' THEN 'FATAL'
        ELSE 'INFO'
    END AS log_level,
    logger_name, message, module_name, function_name,
    line_number, file_path, request_id, session_id, user_id,
    ip_address, exception_type, error_message AS exception_message,
    stack_trace, execution_time_ms, memory_usage_mb, cpu_usage_percent,
    environment, server_name, thread_id, correlation_id,
    additional_data AS extra_data, created_at
FROM audit_logging.unified_activity_log
WHERE log_category = 'system';

-- View: user_activity_logs (backwards compatibility)
CREATE OR REPLACE VIEW audit_logging.user_activity_logs AS
SELECT
    id, user_id, tenant_id, event_type AS activity_type,
    description AS action_detail, page_url, page_title, referrer_url,
    session_id, session_duration, element_id, element_type, element_text,
    coordinates, module_id, exercise_id, classroom_id,
    user_agent, ip_address, device_type, browser_name, browser_version,
    screen_resolution, load_time_ms, interaction_time_ms, metadata, created_at
FROM audit_logging.unified_activity_log
WHERE log_category = 'user_activity';

-- View: activity_log (backwards compatibility)
CREATE OR REPLACE VIEW audit_logging.activity_log AS
SELECT
    id, user_id, event_type AS action_type, entity_type, entity_id,
    description, metadata, ip_address, user_agent,
    created_at, updated_at
FROM audit_logging.unified_activity_log
WHERE log_category = 'dashboard';
```

### 4.2 API Compatibility Layer (Backend)

Create adapter classes that maintain existing service interfaces:

```typescript
// Adapter for AuditService (maintains existing interface)
@Injectable()
export class AuditServiceAdapter {
  constructor(private readonly unifiedService: UnifiedActivityLogService) {}

  async logEvent(event: CreateAuditLogDto): Promise<void> {
    return this.unifiedService.log({
      ...event,
      logCategory: 'audit'
    });
  }

  async getAuditLogs(filters: AuditLogFilters): Promise<{ logs: AuditLog[]; total: number }> {
    const result = await this.unifiedService.query({
      ...filters,
      logCategory: 'audit'
    });
    // Transform to legacy format
    return this.transformToLegacyFormat(result);
  }
}
```

### 4.3 Updated admin_dashboard.recent_activity View

```sql
-- Updated to use unified table
CREATE OR REPLACE VIEW admin_dashboard.recent_activity AS
SELECT
  ual.id,
  ual.user_id,
  p.full_name AS user_name,
  p.avatar_url AS user_avatar,
  u.email,
  ual.event_type AS action_type,
  ual.description AS action_description,
  ual.created_at AS timestamp,
  ual.ip_address,
  ual.user_agent,
  ual.metadata AS details
FROM audit_logging.unified_activity_log ual
LEFT JOIN auth_management.profiles p ON ual.user_id = p.id
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE ual.log_category IN ('user_activity', 'dashboard')
  AND ual.created_at > NOW() - INTERVAL '30 days'
ORDER BY ual.created_at DESC
LIMIT 100;
```

---

## 5. Unified Cleanup Function

Replace 4 separate cleanup functions with one:

```sql
CREATE OR REPLACE FUNCTION audit_logging.cleanup_unified_logs(
    p_retention_days_audit INTEGER DEFAULT 365,
    p_retention_days_system INTEGER DEFAULT 90,
    p_retention_days_user_activity INTEGER DEFAULT 180,
    p_retention_days_dashboard INTEGER DEFAULT 90
)
RETURNS TABLE(
    category text,
    deleted_count INTEGER
) AS $$
DECLARE
    v_deleted_audit INTEGER := 0;
    v_deleted_system INTEGER := 0;
    v_deleted_user_activity INTEGER := 0;
    v_deleted_dashboard INTEGER := 0;
BEGIN
    -- Delete old audit logs
    DELETE FROM audit_logging.unified_activity_log
    WHERE log_category = 'audit'
      AND created_at < NOW() - (p_retention_days_audit || ' days')::INTERVAL;
    GET DIAGNOSTICS v_deleted_audit = ROW_COUNT;

    -- Delete old system logs
    DELETE FROM audit_logging.unified_activity_log
    WHERE log_category = 'system'
      AND created_at < NOW() - (p_retention_days_system || ' days')::INTERVAL;
    GET DIAGNOSTICS v_deleted_system = ROW_COUNT;

    -- Delete old user activity logs
    DELETE FROM audit_logging.unified_activity_log
    WHERE log_category = 'user_activity'
      AND created_at < NOW() - (p_retention_days_user_activity || ' days')::INTERVAL;
    GET DIAGNOSTICS v_deleted_user_activity = ROW_COUNT;

    -- Delete old dashboard logs
    DELETE FROM audit_logging.unified_activity_log
    WHERE log_category = 'dashboard'
      AND created_at < NOW() - (p_retention_days_dashboard || ' days')::INTERVAL;
    GET DIAGNOSTICS v_deleted_dashboard = ROW_COUNT;

    -- Return results
    RETURN QUERY
        SELECT 'audit'::text, v_deleted_audit
        UNION ALL
        SELECT 'system'::text, v_deleted_system
        UNION ALL
        SELECT 'user_activity'::text, v_deleted_user_activity
        UNION ALL
        SELECT 'dashboard'::text, v_deleted_dashboard;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Timeline & Risks

### 6.1 Timeline

| Phase | Duration | Week | Key Milestones |
|-------|----------|------|----------------|
| 1. Create Table | 1 day | Week 1 | Table + indexes + RLS |
| 2. Dual-Write | 5 days | Week 1-2 | Backend changes deployed |
| 3. Historical Migration | 3-5 days | Week 2-3 | All data migrated |
| 4. Switch to Unified | 3 days | Week 3-4 | Remove legacy writes |
| 5. Deprecation | 2-4 weeks | Week 4+ | Monitor, then drop |

**Total Estimated Duration:** 4-6 weeks

### 6.2 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loss during migration | Low | Critical | Batch migration with validation |
| Performance degradation | Medium | High | Index optimization, partitioning |
| Backend bugs from refactor | Medium | Medium | Dual-write phase, extensive testing |
| Query errors in views | Low | Medium | Compatibility views as fallback |
| Rollback needed | Low | Medium | Keep deprecated tables for 2 weeks |

### 6.3 Rollback Plan

If issues arise after Phase 4:

1. **Revert backend** to use legacy tables
2. **Keep writing to both** until stable
3. **Sync any missed data** from unified back to legacy:
   ```sql
   -- Example: Sync back audit logs
   INSERT INTO audit_logging.audit_logs (...)
   SELECT ... FROM audit_logging.unified_activity_log
   WHERE log_category = 'audit'
   AND created_at > 'rollback_timestamp'
   AND id NOT IN (SELECT id FROM audit_logging.audit_logs);
   ```

---

## 7. Success Metrics

### 7.1 Quantitative Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Tables | 4 | 1 | Schema inspection |
| Total columns | 88 | ~60 | Column count |
| Cleanup functions | 4 | 1 | Function count |
| Storage overhead | ~40% duplication | <5% | pg_total_relation_size |
| Query complexity | 4 different patterns | 1 unified | Code review |

### 7.2 Qualitative Metrics

- Clear ownership: One table to maintain
- Simplified queries: One source of truth
- Better analytics: Cross-category queries possible
- Easier debugging: Correlation across all log types

---

## 8. Appendix

### 8.1 Backend Entity Definition

```typescript
// unified-activity-log.entity.ts
@Entity({ schema: 'audit_logging', name: 'unified_activity_log' })
@Index(['logCategory'])
@Index(['createdAt'])
@Index(['userId'])
@Index(['logCategory', 'createdAt'])
export class UnifiedActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', name: 'log_category' })
  logCategory!: 'audit' | 'system' | 'user_activity' | 'dashboard';

  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
  tenantId?: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId?: string;

  @Column({ type: 'text', name: 'actor_type', default: 'user' })
  actorType!: string;

  @Column({ type: 'text', name: 'event_type' })
  eventType!: string;

  @Column({ type: 'text', nullable: true })
  action?: string;

  @Column({ type: 'text', default: 'info' })
  severity!: string;

  @Column({ type: 'text', default: 'success' })
  status!: string;

  // ... additional columns ...

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;
}
```

### 8.2 Files to Modify

**DDL Files (New):**
- `apps/database/ddl/schemas/audit_logging/tables/10-unified_activity_log.sql`
- `apps/database/ddl/schemas/audit_logging/functions/cleanup_unified_logs.sql`
- `apps/database/ddl/schemas/audit_logging/views/v_audit_logs.sql`
- `apps/database/ddl/schemas/audit_logging/views/v_system_logs.sql`
- `apps/database/ddl/schemas/audit_logging/views/v_user_activity_logs.sql`
- `apps/database/ddl/schemas/audit_logging/views/v_activity_log.sql`

**Backend Files (Modify):**
- `apps/backend/src/modules/audit/entities/unified-activity-log.entity.ts` (new)
- `apps/backend/src/modules/audit/services/unified-activity-log.service.ts` (new)
- `apps/backend/src/modules/audit/services/audit.service.ts` (modify)
- `apps/backend/src/modules/admin/services/activity/recent-activity.service.ts` (modify)
- `apps/backend/src/shared/constants/database.constants.ts` (add constant)

**Views to Update:**
- `apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql`

---

## 9. Approval Checklist

- [ ] Architecture review completed
- [ ] DBA review completed
- [ ] Backend team capacity confirmed
- [ ] Testing environment prepared
- [ ] Rollback plan documented
- [ ] Stakeholder sign-off obtained

---

**Document Status:** READY FOR REVIEW
**Next Step:** Schedule architecture review meeting
**Owner:** @ARCHITECT_AGENT
