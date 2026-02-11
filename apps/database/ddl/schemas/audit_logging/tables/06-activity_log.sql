-- =====================================================
-- Table: audit_logging.activity_logs
-- Description: Activity log for admin dashboard monitoring
-- Created: 2025-11-24
-- Gap: GAP-DB-001 (CRITICAL)
-- =====================================================
--
-- 📚 Documentación:
-- Requerimiento: orchestration/reportes/REPORTE-COHERENCIA-DATABASE-BACKEND-2025-11-24.md
-- Backend: apps/backend/src/modules/admin/services/admin-dashboard.service.ts
-- Epic: FE-051 Admin Portal Dashboard
--
-- =====================================================
-- DEPENDENCIAS:
-- - auth_management.profiles (user_id FK) - Corregido 2025-11-26
-- - gamilit.now_mexico() function
-- - gamilit.update_updated_at_column() function
-- =====================================================

SET search_path TO audit_logging, public;

DROP TABLE IF EXISTS audit_logging.activity_logs CASCADE;

CREATE TABLE audit_logging.activity_logs (
    -- =====================================================
    -- PRIMARY KEY
    -- =====================================================
    id uuid DEFAULT gen_random_uuid() NOT NULL,

    -- =====================================================
    -- FOREIGN KEYS
    -- =====================================================
    user_id uuid NOT NULL,

    -- =====================================================
    -- ACTIVITY FIELDS
    -- =====================================================
    action_type varchar(100) NOT NULL,
    entity_type varchar(50),
    entity_id uuid,
    description text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,

    -- =====================================================
    -- REQUEST CONTEXT
    -- =====================================================
    ip_address inet,
    user_agent text,

    -- =====================================================
    -- TIMESTAMPS
    -- =====================================================
    created_at timestamp with time zone DEFAULT gamilit.now_mexico() NOT NULL,
    updated_at timestamp with time zone DEFAULT gamilit.now_mexico() NOT NULL,

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT activity_logs_pkey PRIMARY KEY (id),

    -- Foreign Keys (FK corregida: auth.users -> auth_management.profiles - 2025-11-26)
    CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES auth_management.profiles(id) ON DELETE CASCADE
);

-- =====================================================
-- INDEXES
-- =====================================================

-- User lookup (most common query)
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id
    ON audit_logging.activity_logs USING btree (user_id);

-- Time-based queries (dashboard recent activity)
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at
    ON audit_logging.activity_logs USING btree (created_at DESC);

-- Action type filtering
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type
    ON audit_logging.activity_logs USING btree (action_type);

-- Composite index for active users queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created
    ON audit_logging.activity_logs USING btree (user_id, created_at DESC);

-- Metadata search (GIN index for JSONB queries)
CREATE INDEX IF NOT EXISTS idx_activity_logs_metadata
    ON audit_logging.activity_logs USING gin (metadata);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER trg_activity_logs_updated_at
    BEFORE UPDATE ON audit_logging.activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE audit_logging.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activity
CREATE POLICY activity_logs_select_own
    ON audit_logging.activity_logs
    FOR SELECT
    USING (user_id = gamilit.get_current_user_id());

-- Policy: Admins can view all activity
CREATE POLICY activity_logs_select_admin
    ON audit_logging.activity_logs
    FOR SELECT
    USING (gamilit.is_admin());

-- Policy: System can insert activity (for triggers/functions)
CREATE POLICY activity_logs_insert_system
    ON audit_logging.activity_logs
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- GRANTS
-- =====================================================

GRANT ALL ON TABLE audit_logging.activity_logs TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE audit_logging.activity_logs IS
    'Activity log for admin dashboard monitoring and audit trail. Tracks user actions across the system.';

COMMENT ON COLUMN audit_logging.activity_logs.user_id IS
    'User who performed the action';

COMMENT ON COLUMN audit_logging.activity_logs.action_type IS
    'Type of action performed (e.g., login, exercise_complete, module_start, etc.)';

COMMENT ON COLUMN audit_logging.activity_logs.entity_type IS
    'Type of entity the action was performed on (e.g., user, exercise, module, etc.)';

COMMENT ON COLUMN audit_logging.activity_logs.entity_id IS
    'ID of the entity the action was performed on';

COMMENT ON COLUMN audit_logging.activity_logs.description IS
    'Human-readable description of the action';

COMMENT ON COLUMN audit_logging.activity_logs.metadata IS
    'Additional context about the action (JSONB)';

COMMENT ON COLUMN audit_logging.activity_logs.ip_address IS
    'IP address from which the action originated';

COMMENT ON COLUMN audit_logging.activity_logs.user_agent IS
    'User agent string from the request';

-- =====================================================
-- BACKEND USAGE
-- =====================================================

-- This table is used by:
-- 1. apps/backend/src/modules/admin/services/admin-dashboard.service.ts
--    - getRecentActivity() - Line 122
--    - getActiveUsers24h() - Line 475-477
--    - getExercisesCompleted24h() - Line 494-498
--    - getAlerts() - Line 673-674 (low engagement alert)
--
-- 2. apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql
--    - View depends on this table
--
-- Query Examples:
--
-- -- Get recent activity (last 100 actions)
-- SELECT * FROM audit_logging.activity_logs
-- ORDER BY created_at DESC
-- LIMIT 100;
--
-- -- Count active users in last 24h
-- SELECT COUNT(DISTINCT user_id) as active_users
-- FROM audit_logging.activity_logs
-- WHERE created_at >= NOW() - INTERVAL '24 hours';
--
-- -- Get exercises completed in last 24h
-- SELECT COUNT(*) as exercises_completed
-- FROM audit_logging.activity_logs
-- WHERE action_type LIKE '%exercise%'
--   AND created_at >= NOW() - INTERVAL '24 hours';
--
-- =====================================================
-- MIGRATION NOTES
-- =====================================================

-- Gap Resolved: GAP-DB-001 (CRITICAL)
-- Date: 2025-11-24
-- Issue: Backend used audit_logging.activity_logs but table didn't exist
-- Solution: Created table with structure compatible with backend queries
--
-- IMPORTANT:
-- - This table is the source for admin_dashboard.recent_activity view
-- - Make sure to populate initial data with migration/seed if needed
-- - Consider retention policy (auto-delete old records after N days)
--
-- Related Migration:
-- - apps/database/scripts/migrations/DB-XXX-create-activity-log.sql
-- - apps/database/seeds/dev/audit_logging/01-activity_logs_sample.sql
--
-- =====================================================
