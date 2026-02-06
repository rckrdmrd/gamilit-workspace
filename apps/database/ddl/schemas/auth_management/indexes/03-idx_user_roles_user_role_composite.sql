-- =====================================================
-- Composite Index: idx_user_roles_user_role_composite
-- Table: auth_management.user_roles
-- Columns: (user_id, role)
-- Description: Composite index for efficient role lookups by user
-- Type: B-Tree (default, optimal for equality checks)
-- Priority: HIGH - Performance optimization for role check queries
-- Created: 2026-02-03
-- Gap Reference: GAP-AUTH-001 (Performance)
-- =====================================================

SET search_path TO auth_management, public;

-- =====================================================
-- Index Definition
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_role_composite
    ON auth_management.user_roles(user_id, role);

COMMENT ON INDEX auth_management.idx_user_roles_user_role_composite IS
'Composite index for efficient role lookups. Optimizes queries with pattern: WHERE user_id = X AND role = Y. Covers common authorization checks without requiring full scan of 3-column unique index.';

-- =====================================================
-- Performance Improvement
-- =====================================================

/*
This index addresses GAP-AUTH-001 (Performance) by optimizing the most common
authorization query pattern.

BEFORE (using single-column indexes or 3-column unique index):
- Single idx_user_roles_user_id: Good for user lookups, but requires additional
  filtering for role checks
- Unique constraint index (user_id, tenant_id, role): 3 columns, less efficient
  when tenant_id is not in the WHERE clause

AFTER (with this composite index):
- Direct two-column lookup for user+role queries
- Optimal for queries like:
    SELECT * FROM auth_management.user_roles
    WHERE user_id = '...' AND role = 'admin_teacher';

Query patterns optimized:
1. Check if user has specific role:
   SELECT EXISTS(
       SELECT 1 FROM auth_management.user_roles
       WHERE user_id = $1 AND role = $2 AND is_active = true
   );

2. Get user's role assignment:
   SELECT * FROM auth_management.user_roles
   WHERE user_id = $1 AND role = $2;

3. Verify role membership:
   SELECT is_active, permissions FROM auth_management.user_roles
   WHERE user_id = $1 AND role = $2;

Index column order rationale:
- user_id first: Higher cardinality (many unique users)
- role second: Lower cardinality (few role types)
- This order maximizes index selectivity for most queries
*/

-- =====================================================
-- Index Statistics & Maintenance
-- =====================================================

/*
-- Monitor index usage:
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE indexname = 'idx_user_roles_user_role_composite'
ORDER BY idx_scan DESC;

-- Check index size:
SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE indexname = 'idx_user_roles_user_role_composite';

-- Verify index is being used (run EXPLAIN on your queries):
EXPLAIN ANALYZE
SELECT * FROM auth_management.user_roles
WHERE user_id = 'some-uuid' AND role = 'admin_teacher';

-- Reindex if needed (for fragmentation):
REINDEX INDEX CONCURRENTLY auth_management.idx_user_roles_user_role_composite;

-- Update statistics after bulk operations:
ANALYZE auth_management.user_roles;
*/
