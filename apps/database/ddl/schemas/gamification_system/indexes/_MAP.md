# gamification_system - Indexes MAP

## Schema Overview
- **Schema**: `gamification_system`
- **Purpose**: Management of achievements, boosts, rewards, inventory, leaderboards, and gamification features
- **Created**: 2025-10-27
- **Last Updated**: 2025-11-02

## Indexes Directory Structure

```
gamification_system/
├── indexes/
│   ├── 01-idx_achievements_metadata_gin.sql
│   ├── 01-idx_achievement_categories_active.sql (NEW - 2025-11-02)
│   ├── 02-idx_active_boosts_user.sql
│   ├── 02-idx_inventory_transactions_user.sql (NEW - 2025-11-02)
│   └── _MAP.md (this file)
└── tables/
    ├── achievements.sql
    ├── active_boosts.sql
    ├── achievement_categories.sql
    ├── inventory_transactions.sql
    └── ...
```

## Indexes Implemented

### 1. idx_achievements_metadata_gin
- **Type**: GIN Index
- **Table**: `gamification_system.achievements`
- **Column**: `metadata` (JSONB)
- **Priority**: HIGH
- **Purpose**: Efficient search of achievement metadata attributes
- **Created**: 2025-10-27
- **Modified**: 2025-10-28 (Verified in 04-INDEXES.sql migration)
- **Use Cases**:
  - Find featured achievements: `WHERE metadata @> '{"featured": true}'`
  - Filter by metadata attributes: `WHERE metadata @> '{"category": "science"}'`
  - Search nested achievement properties

**Syntax Validation**: ✅ Valid GIN Index syntax (USING GIN on JSONB column)

**Note**: This index also appears in migration 04-INDEXES.sql. Both versions are identical, so IF NOT EXISTS prevents conflicts.

---

### 2. idx_achievement_categories_active
- **Type**: Partial B-tree Index
- **Table**: `gamification_system.achievement_categories`
- **Column**: `is_active` (BOOLEAN)
- **Predicate**: `WHERE is_active = true`
- **Priority**: HIGH
- **Purpose**: Fast retrieval of active achievement categories for UI and queries
- **Created**: 2025-11-02
- **Use Cases**:
  - Get all active categories: `WHERE is_active = true ORDER BY display_order`
  - Filter by category for active achievements
  - Count active categories
  - Category-based filtering in UI

**Syntax Validation**: ✅ Valid Partial Index syntax (B-tree with WHERE clause)

**Benefits**:
- Smaller index size (only includes active rows)
- Faster scans (fewer rows to traverse)
- Lower maintenance cost
- Most queries filter by is_active = true

---

### 3. idx_active_boosts_user
- **Type**: B-tree Index
- **Table**: `gamification_system.active_boosts`
- **Column**: `user_id`
- **Priority**: HIGH
- **Purpose**: Fast retrieval of all active boosts for a specific user
- **Created**: 2025-10-28
- **Use Cases**:
  - Get all boosts for user: `WHERE user_id = $1`
  - List user boosts ordered by expiration: `WHERE user_id = $1 ORDER BY expires_at DESC`
  - Count active boosts per user: `WHERE user_id = $1 AND is_active = true`

**Syntax Validation**: ✅ Valid B-tree Index syntax (single-column index)

---

### 4. idx_inventory_transactions_user
- **Type**: B-tree Index
- **Table**: `gamification_system.inventory_transactions`
- **Column**: `user_id` (UUID)
- **Priority**: HIGH
- **Purpose**: Fast retrieval of user inventory transaction history
- **Created**: 2025-11-02
- **Use Cases**:
  - Get transaction history: `WHERE user_id = $1 ORDER BY created_at DESC`
  - User purchase history: `WHERE user_id = $1 AND transaction_type = 'PURCHASE'`
  - Items gifted/received: `WHERE user_id = $1 AND transaction_type IN ('GIFT_SENT', 'GIFT_RECEIVED')`
  - User inventory balance calculation
  - Transaction statistics per user

**Syntax Validation**: ✅ Valid B-tree Index syntax (single-column index on UUID)

---

## Total Indexes in Schema
- **1 GIN Index** for JSONB metadata
- **2 B-tree Indexes** for user-based lookups
- **1 Partial B-tree Index** for active category filtering
- **4 Index files** (SQL)

## Performance Impact

### Achievement Metadata Query
- GIN index: Optimizes metadata search queries on achievements
- Expected improvement: 10-50x faster for JSONB containment checks

### Achievement Categories
- Partial index: Reduces index size, improves scan performance
- Expected improvement: 10-20x faster for active category queries

### User Boosts
- B-tree index: Enables instant user boost retrieval
- Expected improvement: 5-15x faster for single-user queries

### Inventory Transactions
- B-tree index: Fast user transaction history retrieval
- Expected improvement: 10-30x faster for user history queries
- Improves user inventory views and transaction auditing

## Dependencies
- PostgreSQL GIN index type (standard)
- PostgreSQL B-tree index type (standard)
- JSONB support for metadata column
- user_id column with UUID type
- is_active BOOLEAN column with default/check constraint

## Related Indexes (Not Implemented)
The full optimization suite includes:
- `idx_active_boosts_expires` - Detect expiring boosts
- `idx_active_boosts_type` - Filter by boost type
- `idx_active_boosts_user_type` - Composite for user + type queries
- `idx_active_boosts_active` - Cleanup of expired boosts
- `idx_achievement_categories_name` - Search by name
- `idx_achievement_categories_display_order` - Sorting
- `idx_inventory_transactions_user_item` - Composite user + item
- `idx_inventory_transactions_type` - Filter by transaction type
- `idx_inventory_transactions_created` - Time-based queries

## Notes
- All indexes use `IF NOT EXISTS` to prevent conflicts during migration
- Indexes are created without transaction wrapper for idempotency
- Comments are added to each index for documentation
- Additional partial and composite indexes can be added in future phases
- The idx_active_boosts_user is critical for real-time boost display
- The idx_achievement_categories_active is essential for category-based queries
- The idx_inventory_transactions_user is important for user history and audit trails

## Execution Order

When running these indexes:
1. Ensure tables exist before running index creation
2. Run in any order (IF NOT EXISTS handles dependencies):
   - `01-idx_achievements_metadata_gin.sql`
   - `01-idx_achievement_categories_active.sql`
   - `02-idx_active_boosts_user.sql`
   - `02-idx_inventory_transactions_user.sql`
3. Verify creation with:
   ```sql
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE schemaname = 'gamification_system'
   AND indexname LIKE 'idx_%'
   ORDER BY indexname;
   ```

## Monitoring & Maintenance

```sql
-- Check index usage statistics
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'gamification_system'
ORDER BY idx_scan DESC;

-- Check index size
SELECT indexname, pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE schemaname = 'gamification_system'
AND indexname LIKE 'idx_%'
ORDER BY indexname;

-- Reindex if fragmented
REINDEX INDEX CONCURRENTLY gamification_system.idx_inventory_transactions_user;
REINDEX INDEX CONCURRENTLY gamification_system.idx_achievement_categories_active;
```

---

**Implementado por**: SA-DB-023 - Implementador de Índices Auth Management y Gamification (resto)
**Fecha**: 2025-11-02
**Estado**: ✅ Completado
