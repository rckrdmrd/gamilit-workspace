-- =====================================================
-- Table: gamification_system.comodin_uses
-- Description: Audit trail of comodin consumption history
-- Purpose: Immutable log for tracking each comodin use with full context
--
-- Gap Reference: GAP-GAM-001 (Audit Trail)
-- Created: 2026-02-03
--
-- NOTE: tenant_id omitted intentionally - GAMILIT is a standalone
-- EdTech platform, not multi-tenant. User-based RLS is used instead.
--
-- Related Tables:
--   - comodines_inventory: Current balance per user
--   - comodin_usage_tracking: Per-attempt limits tracking
--   - comodin_usage_log: Detailed usage log (unique per attempt)
--
-- This table differs from comodin_usage_log by:
--   - No UNIQUE constraint (allows multiple records per attempt)
--   - Focused on consumption audit (immutable)
--   - Designed for analytics and compliance
--
-- PARTITIONING NOTE: For high-volume production, consider
-- partitioning by consumed_at using RANGE partitioning:
-- PARTITION BY RANGE (consumed_at);
-- =====================================================

SET search_path TO gamification_system, public;

-- Drop if exists (development only)
DROP TABLE IF EXISTS gamification_system.comodin_uses CASCADE;

CREATE TABLE gamification_system.comodin_uses (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User Reference (required)
    user_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,

    -- Comodin Type
    comodin_type gamification_system.comodin_type NOT NULL,

    -- Context References (optional - not all uses are exercise-related)
    exercise_id UUID REFERENCES educational_content.exercises(id) ON DELETE SET NULL,
    attempt_id UUID REFERENCES progress_tracking.exercise_attempts(id) ON DELETE SET NULL,

    -- Effect Details
    effect_applied VARCHAR(100),
    value_provided JSONB,

    -- Timestamps (immutable audit log - NO updated_at)
    consumed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE gamification_system.comodin_uses OWNER TO gamilit_user;

-- =====================================================
-- TABLE COMMENTS
-- =====================================================

COMMENT ON TABLE gamification_system.comodin_uses IS
    'Immutable audit trail of comodin consumption. Used for analytics, compliance, and debugging.';

COMMENT ON COLUMN gamification_system.comodin_uses.id IS
    'Unique identifier for each consumption record';

COMMENT ON COLUMN gamification_system.comodin_uses.user_id IS
    'User who consumed the comodin';

COMMENT ON COLUMN gamification_system.comodin_uses.comodin_type IS
    'Type of comodin used: pistas, vision_lectora, segunda_oportunidad';

COMMENT ON COLUMN gamification_system.comodin_uses.exercise_id IS
    'Exercise where comodin was used (NULL for non-exercise uses)';

COMMENT ON COLUMN gamification_system.comodin_uses.attempt_id IS
    'Specific attempt where comodin was used (NULL for non-exercise uses)';

COMMENT ON COLUMN gamification_system.comodin_uses.effect_applied IS
    'Description of effect applied (e.g., revealed_hint_1, highlight_paragraph)';

COMMENT ON COLUMN gamification_system.comodin_uses.value_provided IS
    'JSONB with the actual value provided to user (hint text, highlighted sections, etc.)';

COMMENT ON COLUMN gamification_system.comodin_uses.consumed_at IS
    'Timestamp when comodin was consumed (primary audit timestamp)';

COMMENT ON COLUMN gamification_system.comodin_uses.created_at IS
    'Record creation timestamp (should match consumed_at)';

-- =====================================================
-- INDEXES
-- =====================================================

-- Primary lookup: user's comodin usage history
CREATE INDEX idx_comodin_uses_user_id
    ON gamification_system.comodin_uses(user_id);

-- Filter by comodin type (analytics)
CREATE INDEX idx_comodin_uses_comodin_type
    ON gamification_system.comodin_uses(comodin_type);

-- Lookup by exercise (analytics per exercise)
CREATE INDEX idx_comodin_uses_exercise_id
    ON gamification_system.comodin_uses(exercise_id)
    WHERE exercise_id IS NOT NULL;

-- Time-based queries (audit, analytics, cleanup)
CREATE INDEX idx_comodin_uses_consumed_at
    ON gamification_system.comodin_uses(consumed_at DESC);

-- Composite: user + type + time (common analytics pattern)
CREATE INDEX idx_comodin_uses_user_type_time
    ON gamification_system.comodin_uses(user_id, comodin_type, consumed_at DESC);

-- Composite: user + exercise (per-exercise audit)
CREATE INDEX idx_comodin_uses_user_exercise
    ON gamification_system.comodin_uses(user_id, exercise_id)
    WHERE exercise_id IS NOT NULL;

-- GIN index for JSONB value_provided (if querying by effect details)
CREATE INDEX idx_comodin_uses_value_provided_gin
    ON gamification_system.comodin_uses USING GIN(value_provided);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE gamification_system.comodin_uses ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner
ALTER TABLE gamification_system.comodin_uses FORCE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS comodin_uses_select_own ON gamification_system.comodin_uses;
DROP POLICY IF EXISTS comodin_uses_select_admin ON gamification_system.comodin_uses;
DROP POLICY IF EXISTS comodin_uses_insert_system ON gamification_system.comodin_uses;

-- Policy: comodin_uses_select_own
-- Users can view their own consumption history
CREATE POLICY comodin_uses_select_own
    ON gamification_system.comodin_uses
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (user_id = gamilit.get_current_user_id());

COMMENT ON POLICY comodin_uses_select_own ON gamification_system.comodin_uses IS
    'Users can view their own comodin consumption history';

-- Policy: comodin_uses_select_admin
-- Admins can view all consumption records
CREATE POLICY comodin_uses_select_admin
    ON gamification_system.comodin_uses
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (gamilit.is_admin());

COMMENT ON POLICY comodin_uses_select_admin ON gamification_system.comodin_uses IS
    'Administrators can view all comodin consumption records for audit purposes';

-- Policy: comodin_uses_insert_system
-- Only system (via SECURITY DEFINER functions) can insert
-- This ensures audit integrity - records can only be created by consume_comodin()
CREATE POLICY comodin_uses_insert_system
    ON gamification_system.comodin_uses
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        -- Allow system functions (running as gamilit_user)
        -- OR admins for manual corrections
        gamilit.is_admin()
    );

COMMENT ON POLICY comodin_uses_insert_system ON gamification_system.comodin_uses IS
    'Only system functions and admins can insert audit records (ensures integrity)';

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant all to application user
GRANT ALL ON TABLE gamification_system.comodin_uses TO gamilit_user;

-- Grant SELECT to authenticated users (RLS will filter)
GRANT SELECT ON TABLE gamification_system.comodin_uses TO authenticated;

-- =====================================================
-- NOTES FOR FUTURE PARTITIONING
-- =====================================================
--
-- For production with high volume (>1M records/year), consider:
--
-- 1. Convert to partitioned table:
--    CREATE TABLE gamification_system.comodin_uses (...)
--    PARTITION BY RANGE (consumed_at);
--
-- 2. Create monthly partitions:
--    CREATE TABLE comodin_uses_2026_01
--    PARTITION OF gamification_system.comodin_uses
--    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
--
-- 3. Add automated partition creation via pg_partman or cron job
--
-- 4. Archive old partitions to cold storage after 2 years
--
-- =====================================================
