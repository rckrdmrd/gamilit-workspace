# progress_tracking - Indexes MAP

## Schema Overview
- **Schema**: `progress_tracking`
- **Purpose**: Tracking user progress, modules, and scheduled missions
- **Created**: 2025-10-27

## Indexes Directory Structure

```
progress_tracking/
├── indexes/
│   ├── 01-idx_module_progress_analytics_gin.sql
│   ├── 02-idx_scheduled_missions_mission.sql
│   └── _MAP.md (this file)
└── tables/
    ├── module_progress.sql
    ├── scheduled_missions.sql
    └── ...
```

## Indexes Implemented

### 1. idx_module_progress_analytics_gin
- **Type**: GIN Index with jsonb_path_ops
- **Table**: `progress_tracking.module_progress`
- **Column**: `performance_analytics` (JSONB)
- **Priority**: HIGH
- **Purpose**: Efficient querying of performance analytics data stored as JSONB
- **Created**: 2025-10-27
- **Use Cases**:
  - Query by accuracy metric: `WHERE performance_analytics @> '{"accuracy": 90}'`
  - Filter by performance tags: `WHERE performance_analytics @> '{"status": "excellent"}'`
  - Search nested JSONB values

**Syntax Validation**: ✅ Valid GIN Index syntax with jsonb_path_ops (specialized for JSONB containment queries)

---

### 2. idx_scheduled_missions_mission
- **Type**: B-tree Index
- **Table**: `progress_tracking.scheduled_missions`
- **Column**: `mission_id`
- **Priority**: HIGH
- **Purpose**: Fast lookup of all scheduled instances of a specific mission
- **Created**: 2025-10-28
- **Use Cases**:
  - Find all schedules for a mission: `WHERE mission_id = $1`
  - Join operations on mission_id
  - Count scheduled instances: `WHERE mission_id = $1`

**Syntax Validation**: ✅ Valid B-tree Index syntax (standard single-column index)

---

## Total Indexes in Schema
- **1 GIN Index** for JSONB column with jsonb_path_ops
- **1 B-tree Index** for foreign key lookups
- **2 Index files** (SQL)

## Performance Impact
- GIN index: Optimizes JSONB containment queries (@> operator)
- B-tree index: Enables fast lookups on mission_id column
- Improves JOIN performance on scheduled_missions.mission_id

## Dependencies
- PostgreSQL GIN index type must be available
- jsonb_path_ops operator class for JSONB GIN index
- column types: JSONB, INTEGER (or similar for mission_id)

## Related Indexes (Not Implemented)
The full scheduled_missions index suite includes:
- `idx_scheduled_missions_classroom` - Filter by classroom
- `idx_scheduled_missions_scheduled_by` - Filter by scheduler
- `idx_scheduled_missions_dates` - Range queries on dates
- `idx_scheduled_missions_active` - Active missions with dates
- `idx_scheduled_missions_classroom_active` - Classroom-specific active missions

## Notes
- All indexes use `IF NOT EXISTS` to prevent conflicts during migration
- Indexes are created without transaction wrapper for idempotency
- Comments are added to each index for documentation
- Composite and partial indexes can be added in future phases
