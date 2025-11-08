-- =====================================================
-- Index: idx_user_suspensions_until
-- Schema: auth_management
-- Position: 267/268
-- Description: Index for optimized query performance
-- Created: 2025-11-02
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_suspensions_until ON auth_management.user_suspensions(suspension_until);

COMMENT ON INDEX auth_management.idx_user_suspensions_until IS 'Index for optimized query performance on auth_management schema';

-- =====================================================
