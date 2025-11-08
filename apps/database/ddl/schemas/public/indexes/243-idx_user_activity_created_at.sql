-- =====================================================
-- Index: idx_user_activity_created_at
-- Schema: audit_logging
-- Position: 243/268
-- Description: Index for optimized query performance
-- Created: 2025-11-02
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON audit_logging.user_activity(created_at DESC);

COMMENT ON INDEX audit_logging.idx_user_activity_created_at IS 'Index for optimized query performance on audit_logging schema';

-- =====================================================
