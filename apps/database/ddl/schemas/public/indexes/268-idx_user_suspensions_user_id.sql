-- =====================================================
-- Index: idx_user_suspensions_user_id
-- Schema: auth_management
-- Position: 268/268
-- Description: Index for optimized query performance
-- Created: 2025-11-02
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_suspensions_user_id ON auth_management.user_suspensions(user_id);

COMMENT ON INDEX auth_management.idx_user_suspensions_user_id IS 'Index for optimized query performance on auth_management schema';

-- =====================================================
