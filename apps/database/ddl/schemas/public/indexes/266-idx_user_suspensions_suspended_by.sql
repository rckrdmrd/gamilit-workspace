-- =====================================================
-- Index: idx_user_suspensions_suspended_by
-- Schema: auth_management
-- Position: 266/268
-- Description: Index for optimized query performance
-- Created: 2025-11-02
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_suspensions_suspended_by ON auth_management.user_suspensions(suspended_by);

COMMENT ON INDEX auth_management.idx_user_suspensions_suspended_by IS 'Index for optimized query performance on auth_management schema';

-- =====================================================
