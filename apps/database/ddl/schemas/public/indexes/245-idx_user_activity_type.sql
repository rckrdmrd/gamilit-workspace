-- =====================================================
-- Index: idx_user_activity_type
-- Schema: audit_logging
-- Position: 245/268
-- Description: Index for optimized query performance
-- Created: 2025-11-02
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_activity_type ON audit_logging.user_activity(activity_type);

COMMENT ON INDEX audit_logging.idx_user_activity_type IS 'Index for optimized query performance on audit_logging schema';

-- =====================================================
