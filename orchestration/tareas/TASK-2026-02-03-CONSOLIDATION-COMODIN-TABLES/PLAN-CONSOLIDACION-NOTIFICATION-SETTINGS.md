# PLAN-CONSOLIDACION-NOTIFICATION-SETTINGS.md

**Gap Reference:** OVR-002 (Table Overlap)
**Status:** DRAFT - Pending Approval
**Created:** 2026-02-03
**Author:** @ARCHITECT_AGENT
**Project:** GAMILIT

---

## 1. Executive Summary

Three tables across two schemas serve similar notification settings purposes, creating confusion, maintenance overhead, and potential data inconsistency. This plan proposes consolidating them into a single, unified design.

### Tables Affected

| Table | Schema | Purpose | Design Pattern |
|-------|--------|---------|----------------|
| `notification_settings` | `system_configuration` | Per-user settings by type+channel | **Normalized** (1 row per type+channel) |
| `notification_settings_global` | `system_configuration` | System-wide defaults | **Normalized** (1 row per type+channel) |
| `notification_preferences` | `notifications` | User preferences | **Denormalized** (1 row per type, boolean columns for channels) |

---

## 2. Current State Analysis

### 2.1 Table: `system_configuration.notification_settings`

**Location:** `apps/database/ddl/schemas/system_configuration/tables/03-notification_settings.sql`

**Structure:**
```sql
CREATE TABLE system_configuration.notification_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid,                          -- Multi-tenant support
    user_id uuid NOT NULL,                   -- FK to auth_management.profiles
    notification_type text NOT NULL,         -- e.g., 'achievement_earned'
    channel text NOT NULL,                   -- 'email', 'sms', 'push', 'in_app', 'webhook'
    is_enabled boolean DEFAULT true,
    frequency text DEFAULT 'immediate',      -- 'immediate', 'daily', 'weekly', 'never'
    quiet_hours_start time,
    quiet_hours_end time,
    max_per_day integer DEFAULT 999,         -- Rate limiting
    template_id uuid,                        -- Custom template
    retry_policy jsonb DEFAULT '{}',         -- Retry configuration
    delivery_settings jsonb DEFAULT '{}',    -- Channel-specific settings
    metadata jsonb DEFAULT '{}',
    created_by uuid,
    updated_by uuid,
    created_at timestamptz,
    updated_at timestamptz,

    UNIQUE(user_id, notification_type, channel)
);
```

**Strengths:**
- Fully normalized (flexible for any channel)
- Supports 5 channels including `webhook`
- Rich feature set (rate limiting, retry policies, custom templates)
- Multi-tenant aware
- Full audit trail (created_by, updated_by)
- RLS policies implemented

**Weaknesses:**
- Multiple rows per user per notification type (one per channel)
- More complex queries to get all channels for a user/type
- No global defaults reference

---

### 2.2 Table: `system_configuration.notification_settings_global`

**Location:** `apps/database/ddl/schemas/system_configuration/tables/05-notification_settings_global.sql`

**Structure:**
```sql
CREATE TABLE system_configuration.notification_settings_global (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type text NOT NULL,
    channel text NOT NULL,                   -- 'email', 'sms', 'push', 'in_app' (no webhook)
    is_enabled boolean NOT NULL DEFAULT true,
    priority text,                           -- 'urgent', 'high', 'normal', 'low'
    template_id uuid,
    throttle_minutes integer DEFAULT 0,      -- Throttling
    batch_enabled boolean DEFAULT false,     -- Batching support
    batch_window_minutes integer,
    settings jsonb DEFAULT '{}',
    created_at timestamptz,
    updated_at timestamptz,

    UNIQUE(notification_type, channel)
);
```

**Strengths:**
- Clean design for system defaults
- Priority levels
- Throttling and batching support
- No user_id (truly global)

**Weaknesses:**
- Duplicates channel/type pattern from notification_settings
- Missing webhook channel
- No tenant_id (not multi-tenant aware)

---

### 2.3 Table: `notifications.notification_preferences`

**Location:** `apps/database/ddl/schemas/notifications/tables/02-notification_preferences.sql`

**Structure:**
```sql
CREATE TABLE notifications.notification_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,                   -- FK to auth_management.profiles
    notification_type varchar(50) NOT NULL,
    in_app_enabled boolean DEFAULT true,     -- Denormalized channel flags
    email_enabled boolean DEFAULT true,
    push_enabled boolean DEFAULT true,
    email_frequency varchar(20) DEFAULT 'immediate',
    quiet_hours_start time,
    quiet_hours_end time,
    timezone varchar(50) DEFAULT 'America/Mexico_City',
    created_at timestamp,
    updated_at timestamp,

    UNIQUE(user_id, notification_type)
);
```

**Strengths:**
- Simple, compact design (1 row per user/type)
- Easy to query all channels at once
- Includes timezone (user-specific)
- Currently used by backend controller (`/notifications/preferences`)

**Weaknesses:**
- Denormalized (adding channel requires schema change)
- Only 3 channels (missing sms, webhook)
- No tenant_id
- No audit trail (created_by, updated_by)
- No rate limiting
- No retry policies
- Different schema from global settings

---

## 3. Comparative Analysis

### 3.1 Feature Matrix

| Feature | `notification_settings` | `notification_settings_global` | `notification_preferences` |
|---------|-------------------------|-------------------------------|---------------------------|
| **Scope** | Per-user | System-wide | Per-user |
| **Design** | Normalized | Normalized | Denormalized |
| **Channels** | 5 (email, sms, push, in_app, webhook) | 4 (no webhook) | 3 (in_app, email, push) |
| **Multi-tenant** | Yes | No | No |
| **Frequency** | Yes | No | Yes (email only) |
| **Quiet Hours** | Yes | No | Yes |
| **Timezone** | No | No | Yes |
| **Rate Limiting** | Yes (max_per_day) | No | No |
| **Throttling** | No | Yes | No |
| **Batching** | No | Yes | No |
| **Priority** | No | Yes | No |
| **Templates** | Yes | Yes | No |
| **Retry Policy** | Yes | No | No |
| **Audit Trail** | Yes | No | No |
| **RLS Policies** | Yes | Not implemented | No |

### 3.2 Backend Entity Coverage

| Entity | Module | Status |
|--------|--------|--------|
| `NotificationSettings` | `admin` | Exists |
| `NotificationSettingsGlobal` | `admin` | Exists |
| `NotificationPreference` | `notifications` | Exists, ACTIVELY USED by API |

### 3.3 API Usage

**Active Endpoint:** `GET/PATCH /notifications/preferences`
- Controller: `notification-preferences.controller.ts`
- Service: `notification-preference.service.ts`
- Uses: `notifications.notification_preferences` table

**Admin Endpoints:** TBD (likely for `notification_settings` and `notification_settings_global`)

---

## 4. Proposed Unified Schema

### 4.1 Design Decision: Hybrid Approach

**Recommendation:** Keep **TWO** tables with clear separation of concerns:

1. **`notifications.user_notification_settings`** - User-level preferences (replaces both `notification_settings` and `notification_preferences`)
2. **`system_configuration.notification_settings_global`** - System defaults (retain with enhancements)

**Rationale:**
- Global defaults belong in `system_configuration` (admin-managed)
- User preferences belong in `notifications` (user-managed, same schema as notifications table)
- Normalized design for flexibility (5+ channels)
- Avoid denormalized boolean columns that limit extensibility

### 4.2 New Table: `notifications.user_notification_settings`

```sql
-- =====================================================
-- Table: notifications.user_notification_settings
-- Description: Unified user notification settings
-- Version: 2.0 (Consolidation of 2 tables)
-- Created: 2026-02-XX
-- =====================================================

CREATE TABLE notifications.user_notification_settings (
    -- Identity
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES auth_management.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,

    -- Notification type + channel (normalized)
    notification_type text NOT NULL,
    channel text NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app', 'webhook')),

    -- Control
    is_enabled boolean NOT NULL DEFAULT true,

    -- Delivery configuration
    frequency text NOT NULL DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily', 'weekly', 'never')),

    -- Quiet hours
    quiet_hours_start time,
    quiet_hours_end time,
    timezone varchar(50) DEFAULT 'America/Mexico_City',

    -- Rate limiting (inherits from global if null)
    max_per_day integer CHECK (max_per_day IS NULL OR max_per_day > 0),

    -- Templates (inherits from global if null)
    template_id uuid,

    -- Channel-specific settings (email format, push options, etc.)
    delivery_settings jsonb DEFAULT '{}',

    -- Metadata
    metadata jsonb DEFAULT '{}',

    -- Audit
    created_by uuid REFERENCES auth_management.profiles(id),
    updated_by uuid REFERENCES auth_management.profiles(id),
    created_at timestamptz NOT NULL DEFAULT gamilit.now_mexico(),
    updated_at timestamptz NOT NULL DEFAULT gamilit.now_mexico(),

    -- Constraints
    UNIQUE(tenant_id, user_id, notification_type, channel)
);

-- Indexes
CREATE INDEX idx_user_notif_settings_user ON notifications.user_notification_settings(user_id);
CREATE INDEX idx_user_notif_settings_tenant ON notifications.user_notification_settings(tenant_id);
CREATE INDEX idx_user_notif_settings_type ON notifications.user_notification_settings(notification_type);
CREATE INDEX idx_user_notif_settings_channel ON notifications.user_notification_settings(channel);
CREATE INDEX idx_user_notif_settings_enabled ON notifications.user_notification_settings(is_enabled) WHERE is_enabled = true;

-- Trigger
CREATE TRIGGER trg_user_notification_settings_updated_at
    BEFORE UPDATE ON notifications.user_notification_settings
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

-- RLS
ALTER TABLE notifications.user_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_notif_settings_own_select ON notifications.user_notification_settings
    FOR SELECT USING (user_id = gamilit.get_current_user_id());

CREATE POLICY user_notif_settings_own_update ON notifications.user_notification_settings
    FOR UPDATE USING (user_id = gamilit.get_current_user_id());

CREATE POLICY user_notif_settings_admin_all ON notifications.user_notification_settings
    FOR ALL USING (gamilit.is_admin());
```

### 4.3 Enhanced: `system_configuration.notification_settings_global`

**Keep existing table** with these enhancements:

```sql
-- Add missing columns
ALTER TABLE system_configuration.notification_settings_global
    ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES auth_management.tenants(id),
    ADD COLUMN IF NOT EXISTS max_per_day integer DEFAULT 100 CHECK (max_per_day > 0),
    ADD COLUMN IF NOT EXISTS retry_policy jsonb DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth_management.profiles(id),
    ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth_management.profiles(id);

-- Update channel constraint to include webhook
ALTER TABLE system_configuration.notification_settings_global
    DROP CONSTRAINT IF EXISTS notification_settings_global_channel_check,
    ADD CONSTRAINT notification_settings_global_channel_check
        CHECK (channel IN ('email', 'sms', 'push', 'in_app', 'webhook'));

-- Add RLS
ALTER TABLE system_configuration.notification_settings_global ENABLE ROW LEVEL SECURITY;

CREATE POLICY notif_settings_global_admin_all ON system_configuration.notification_settings_global
    FOR ALL USING (gamilit.is_admin());
```

---

## 5. Migration Plan

### Phase 1: Create New Unified Table (Non-Breaking)

**Duration:** 1-2 hours
**Risk:** LOW (no existing data affected)

**Steps:**
1. Create `notifications.user_notification_settings` table
2. Create function `notifications.get_user_settings(p_user_id, p_notification_type)` that:
   - Returns user settings if exists
   - Falls back to global defaults
   - Merges with defaults for missing channels
3. Create function `notifications.upsert_user_settings(...)` for atomic updates
4. Add indexes and RLS policies
5. Validate DDL in WSL

### Phase 2: Data Migration (Non-Breaking)

**Duration:** 1 hour
**Risk:** LOW (copy only, no deletes)

**Steps:**
1. Migrate data from `system_configuration.notification_settings`:
```sql
INSERT INTO notifications.user_notification_settings (
    tenant_id, user_id, notification_type, channel, is_enabled,
    frequency, quiet_hours_start, quiet_hours_end, max_per_day,
    template_id, delivery_settings, metadata,
    created_by, updated_by, created_at, updated_at
)
SELECT
    tenant_id, user_id, notification_type, channel, is_enabled,
    frequency, quiet_hours_start, quiet_hours_end, max_per_day,
    template_id, delivery_settings, metadata,
    created_by, updated_by, created_at, updated_at
FROM system_configuration.notification_settings
ON CONFLICT (tenant_id, user_id, notification_type, channel) DO NOTHING;
```

2. Migrate data from `notifications.notification_preferences` (denormalized to normalized):
```sql
-- For each denormalized row, create 3 normalized rows
WITH preferences AS (
    SELECT user_id, notification_type, in_app_enabled, email_enabled, push_enabled,
           email_frequency, quiet_hours_start, quiet_hours_end, timezone, created_at, updated_at
    FROM notifications.notification_preferences
)
INSERT INTO notifications.user_notification_settings (
    user_id, notification_type, channel, is_enabled, frequency,
    quiet_hours_start, quiet_hours_end, timezone, created_at, updated_at
)
SELECT user_id, notification_type, 'in_app', in_app_enabled, 'immediate',
       quiet_hours_start, quiet_hours_end, timezone, created_at, updated_at
FROM preferences
UNION ALL
SELECT user_id, notification_type, 'email', email_enabled, email_frequency,
       quiet_hours_start, quiet_hours_end, timezone, created_at, updated_at
FROM preferences
UNION ALL
SELECT user_id, notification_type, 'push', push_enabled, 'immediate',
       quiet_hours_start, quiet_hours_end, timezone, created_at, updated_at
FROM preferences
ON CONFLICT (tenant_id, user_id, notification_type, channel) DO NOTHING;
```

3. Verify row counts and data integrity

### Phase 3: Backend Code Updates (Breaking for Internal APIs)

**Duration:** 4-6 hours
**Risk:** MEDIUM (API changes required)

**Backend Changes:**

1. **Create new entity:** `UserNotificationSettings`
   - Location: `modules/notifications/entities/user-notification-settings.entity.ts`

2. **Update service:** `NotificationPreferenceService`
   - Replace queries to `notification_preferences` with `user_notification_settings`
   - Add helper methods for denormalized view (backwards compatibility)

3. **Create new service:** `NotificationSettingsService`
   - Consolidate admin-level settings management
   - Merge with global defaults logic

4. **Update controller:** `NotificationPreferencesController`
   - Keep same API contract (GET/PATCH `/notifications/preferences`)
   - Transform normalized data to denormalized response for backwards compatibility

5. **Create compatibility view (optional):**
```sql
CREATE VIEW notifications.v_notification_preferences AS
SELECT
    user_id,
    notification_type,
    MAX(CASE WHEN channel = 'in_app' THEN is_enabled END) as in_app_enabled,
    MAX(CASE WHEN channel = 'email' THEN is_enabled END) as email_enabled,
    MAX(CASE WHEN channel = 'push' THEN is_enabled END) as push_enabled,
    MAX(CASE WHEN channel = 'email' THEN frequency END) as email_frequency,
    MAX(quiet_hours_start) as quiet_hours_start,
    MAX(quiet_hours_end) as quiet_hours_end,
    MAX(timezone) as timezone
FROM notifications.user_notification_settings
GROUP BY user_id, notification_type;
```

### Phase 4: Deprecate Old Tables (Breaking)

**Duration:** 1 hour (execution), 1 sprint (deprecation notice)
**Risk:** HIGH (requires coordinated rollout)

**Steps:**
1. Add deprecation notice to old entities (1 sprint warning)
2. Remove foreign key references
3. Rename old tables with `_deprecated` suffix
4. After 2 sprints: DROP deprecated tables
5. Remove old entities from codebase

**Tables to Deprecate:**
- `system_configuration.notification_settings` -> `system_configuration.notification_settings_deprecated`
- `notifications.notification_preferences` -> `notifications.notification_preferences_deprecated`

---

## 6. API Impact

### 6.1 Public API Endpoints

| Endpoint | Current Behavior | After Migration | Breaking? |
|----------|-----------------|-----------------|-----------|
| `GET /notifications/preferences` | Returns denormalized preferences | Same response format (transformation layer) | NO |
| `PATCH /notifications/preferences/:type` | Updates denormalized | Updates normalized (internal) | NO |
| `PATCH /notifications/preferences` | Batch update | Same behavior | NO |

### 6.2 Internal API Changes

| Component | Change Required |
|-----------|----------------|
| `NotificationPreference` entity | DEPRECATED - use `UserNotificationSettings` |
| `NotificationSettings` entity | DEPRECATED - use `UserNotificationSettings` |
| `NotificationSettingsGlobal` entity | ENHANCED - add new columns |
| `NotificationPreferenceService` | REFACTOR - use new entity, maintain response contract |
| `send_notification()` SQL function | UPDATE - query new table |
| `get_user_preferences()` SQL function | UPDATE - query new table |

### 6.3 Backwards Compatibility Strategy

1. **Response Transformation:** Service layer transforms normalized data to denormalized response
2. **Request Handling:** Accept both formats (denormalized in, normalized storage)
3. **Grace Period:** Keep deprecated tables readable for 2 sprints
4. **Feature Flags:** Enable gradual rollout with `FEATURE_NEW_NOTIFICATION_SETTINGS`

---

## 7. Timeline & Milestones

| Phase | Duration | Milestone | Dependencies |
|-------|----------|-----------|--------------|
| Phase 1 | 2 hours | New table created and validated | None |
| Phase 2 | 1 hour | Data migrated | Phase 1 |
| Phase 3 | 6 hours | Backend updated | Phase 2 |
| Phase 4 | 2 sprints | Old tables dropped | Phase 3 + grace period |

**Total Active Work:** ~9 hours
**Total Calendar Time:** 2-3 sprints (with deprecation grace period)

---

## 8. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss during migration | LOW | HIGH | Copy-only migration, keep originals |
| API breaking changes | MEDIUM | HIGH | Transformation layer, backwards compat |
| Performance degradation | LOW | MEDIUM | Add indexes before migration |
| Incomplete migration | LOW | MEDIUM | Validation queries, row count checks |
| Service disruption | LOW | HIGH | Feature flag for gradual rollout |

---

## 9. Success Criteria

- [ ] Single source of truth for user notification settings
- [ ] All 5 channels supported (email, sms, push, in_app, webhook)
- [ ] Multi-tenant support
- [ ] API backwards compatible (no frontend changes required)
- [ ] RLS policies enforced
- [ ] Audit trail maintained
- [ ] No data loss during migration
- [ ] Build passes (backend, frontend)
- [ ] All existing tests pass

---

## 10. Next Steps

1. **REVIEW:** Technical lead approval of this plan
2. **APPROVAL:** Architecture decision record (ADR)
3. **EXECUTE Phase 1:** Create DDL (separate task)
4. **EXECUTE Phase 2:** Data migration (separate task)
5. **EXECUTE Phase 3:** Backend updates (separate task)
6. **DEPRECATE Phase 4:** After grace period

---

## Appendix A: File Locations

### Current DDL Files
- `apps/database/ddl/schemas/system_configuration/tables/03-notification_settings.sql`
- `apps/database/ddl/schemas/system_configuration/tables/05-notification_settings_global.sql`
- `apps/database/ddl/schemas/notifications/tables/02-notification_preferences.sql`

### Current Backend Entities
- `apps/backend/src/modules/admin/entities/notification-settings.entity.ts`
- `apps/backend/src/modules/admin/entities/notification-settings-global.entity.ts`
- `apps/backend/src/modules/notifications/entities/multichannel/notification-preference.entity.ts`

### Current Controllers
- `apps/backend/src/modules/notifications/controllers/notification-preferences.controller.ts`

### Current Functions
- `apps/database/ddl/schemas/notifications/functions/02-get_user_preferences.sql`

---

## Appendix B: Verification Queries

```sql
-- Count rows in each table
SELECT 'notification_settings' as table_name, COUNT(*) FROM system_configuration.notification_settings
UNION ALL
SELECT 'notification_settings_global', COUNT(*) FROM system_configuration.notification_settings_global
UNION ALL
SELECT 'notification_preferences', COUNT(*) FROM notifications.notification_preferences;

-- Check for overlapping user settings
SELECT user_id, notification_type, COUNT(DISTINCT source) as source_count
FROM (
    SELECT user_id, notification_type, 'system_configuration' as source
    FROM system_configuration.notification_settings
    UNION ALL
    SELECT user_id, notification_type, 'notifications' as source
    FROM notifications.notification_preferences
) combined
GROUP BY user_id, notification_type
HAVING COUNT(DISTINCT source) > 1;
```

---

*Document created by @ARCHITECT_AGENT as part of OVR-002 Gap Resolution*
*DO NOT EXECUTE MIGRATIONS - Plan review required first*
