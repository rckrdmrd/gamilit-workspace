-- =====================================================
-- Index: idx_user_activity_user_id
-- Schema: audit_logging
-- Position: 246/268
-- Description: Index for optimized query performance
-- Created: 2025-11-02
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON audit_logging.user_activity(user_id);

COMMENT ON INDEX audit_logging.idx_user_activity_user_id IS 'Index for optimized query performance on audit_logging schema';

-- =====================================================
