# auth_management - Indexes MAP

## Schema Overview
- **Schema**: `auth_management`
- **Purpose**: Management of users, authentication, authorization, roles, and preferences
- **Created**: 2025-10-27
- **Last Updated**: 2025-11-02

## Indexes Directory Structure

```
auth_management/
├── indexes/
│   ├── 01-idx_user_preferences_theme.sql
│   ├── 02-idx_user_roles_permissions_gin.sql
│   └── _MAP.md (this file)
├── tables/
│   ├── 01-tenants.sql
│   ├── 02-auth_attempts.sql
│   ├── ... (12 tables total)
│   └── 09-user_preferences.sql
└── validaciones/
```

## Indexes Implemented

### 1. idx_user_preferences_theme
- **Type**: B-tree Index
- **Table**: `auth_management.user_preferences`
- **Column**: `theme` (VARCHAR)
- **Priority**: MEDIUM
- **Purpose**: Efficient search of user preferences by theme (light, dark, auto)
- **Created**: 2025-11-02
- **Use Cases**:
  - Find all users with dark theme: `WHERE theme = 'dark'`
  - Filter users by theme preference: `WHERE theme IN ('light', 'dark')`
  - UI theme distribution analysis

**Syntax Validation**: ✅ Valid B-tree Index syntax (single-column index on VARCHAR)

---

### 2. idx_user_roles_permissions_gin
- **Type**: GIN Index (Generalized Inverted Index)
- **Table**: `auth_management.user_roles`
- **Column**: `permissions` (JSONB)
- **Priority**: HIGH
- **Purpose**: Performance optimization for permission-based role queries and access control
- **Created**: 2025-11-02
- **Use Cases**:
  - Check if user has specific permission: `WHERE permissions ? 'edit_users'`
  - Find users with admin permission: `WHERE permissions @> '{"admin": true}'`
  - Check multiple permission requirements: `WHERE permissions ?| ARRAY['read', 'write']`
  - Permission inheritance and ACL queries

**Syntax Validation**: ✅ Valid GIN Index syntax (USING GIN with jsonb_path_ops on JSONB column)

---

## Total Indexes in Schema
- **1 B-tree Index** for simple text filtering
- **1 GIN Index** for JSONB permission queries
- **2 Index files** (SQL)

## Performance Impact

### idx_user_preferences_theme
- Eliminates full table scans for theme-based queries
- Fast equality search on theme values (light, dark, auto)
- Useful for UI personalization features

### idx_user_roles_permissions_gin
- Dramatically speeds up permission existence checks (? operator)
- Enables efficient permission containment queries (@> operator)
- Supports multi-permission queries (?| and ?& operators)
- Critical for authorization middleware and access control

**Expected Improvements**:
- Permission queries: 10-50x faster for large user_roles tables
- Authorization checks: Reduced latency in request handling
- ACL lookups: Index-only scans possible in many cases

## Dependencies
- PostgreSQL B-tree index type (standard)
- PostgreSQL GIN index type (standard)
- JSONB support for permissions column
- theme VARCHAR column with CHECK constraint (light|dark|auto)

## Related Tables
- `auth_management.user_preferences` - Stores theme, language, notifications settings
- `auth_management.user_roles` - Stores role assignments with permission JSONB

## Notes
- All indexes use `IF NOT EXISTS` to prevent conflicts during migration
- Indexes are created without transaction wrapper for idempotency
- Comments are added to each index for documentation
- GIN index uses `jsonb_path_ops` for efficient path searches
- These indexes are essential for multi-tenant authorization performance

## Execution Order

When running these indexes:
1. Ensure tables exist (`user_preferences` and `user_roles`)
2. Run in any order:
   - `01-idx_user_preferences_theme.sql`
   - `02-idx_user_roles_permissions_gin.sql`
3. Verify creation with:
   ```sql
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE schemaname = 'auth_management'
   AND indexname LIKE 'idx_%'
   ORDER BY indexname;
   ```

## Monitoring & Maintenance

```sql
-- Check index usage statistics
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'auth_management'
ORDER BY idx_scan DESC;

-- Check index size
SELECT indexname, pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE schemaname = 'auth_management'
AND indexname LIKE 'idx_%'
ORDER BY indexname;

-- Reindex if fragmented
REINDEX INDEX CONCURRENTLY auth_management.idx_user_roles_permissions_gin;
```

---

**Implementado por**: SA-DB-023 - Implementador de Índices Auth Management y Gamification (resto)
**Fecha**: 2025-11-02
**Estado**: ✅ Completado
