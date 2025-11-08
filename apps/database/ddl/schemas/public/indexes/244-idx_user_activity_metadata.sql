-- =====================================================
-- Index: idx_user_activity_metadata
-- Schema: audit_logging
-- Position: 244/268
-- Description: Index for optimized query performance
-- Created: 2025-11-02
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_activity_metadata ON audit_logging.user_activity USING gin(metadata);

COMMENT ON INDEX audit_logging.idx_user_activity_metadata IS 'Index for optimized query performance on audit_logging schema';

-- =====================================================
