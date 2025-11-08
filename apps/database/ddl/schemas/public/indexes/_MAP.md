# public - Indexes MAP

## Schema Overview
- **Schema**: `public` (distributed across multiple physical schemas)
- **Purpose**: Comprehensive index coverage for all user-related tables and audit logging
- **Total Indexes**: 268
- **Last Updated**: 2025-11-02
- **Implementation Status**: Complete (SA-DB-014 through SA-DB-021)

## Index Distribution by Implementation Phase

### Phase 1-7: SA-DB-014 to SA-DB-020 (Indexes 1-238)
- Implemented in previous phases
- Covers: Initial infrastructure, authentication, gamification, content, progress, social, configuration, and audit logging

### Phase 8: SA-DB-021 (Indexes 239-268) - THIS IMPLEMENTATION
- Indexes 239-268: User-related indexes (30 total)
- Focus: User achievements, activity, ranks, roles, sessions, stats, and suspensions
- Status: **COMPLETE**

## Indexes Directory Structure

```
public/indexes/
├── 001-xxx.sql through 268-yyy.sql (268 index files)
├── _MAP.md (this file)
└── README.txt (summary)
```

## Last 30 Indexes Implemented (239-268)

### Category: User Achievements (4 indexes)
| # | Index Name | Table | Column(s) | Type | Purpose |
|---|---|---|---|---|---|
| 239 | idx_user_achievements_completed | gamification_system.user_achievements | user_id, is_completed | B-tree | Find completed achievements by user |
| 240 | idx_user_achievements_unclaimed | gamification_system.user_achievements | user_id (partial) | Partial B-tree | Find unclaimed rewards |
| 241 | idx_user_achievements_user_completed | gamification_system.user_achievements | user_id, is_completed, completed_at | Composite | Sort completed achievements by date |
| 242 | idx_user_achievements_user_id | gamification_system.user_achievements | user_id | B-tree | Fast achievement lookup by user |

### Category: User Activity (4 indexes)
| # | Index Name | Table | Column(s) | Type | Purpose |
|---|---|---|---|---|---|
| 243 | idx_user_activity_created_at | audit_logging.user_activity | created_at DESC | B-tree DESC | Timeline queries, recent activity |
| 244 | idx_user_activity_metadata | audit_logging.user_activity | metadata | GIN | JSONB metadata searches |
| 245 | idx_user_activity_type | audit_logging.user_activity | activity_type | B-tree | Filter by activity type |
| 246 | idx_user_activity_user_id | audit_logging.user_activity | user_id | B-tree | Activity lookup by user |

### Category: User Ranks (3 indexes)
| # | Index Name | Table | Column(s) | Type | Purpose |
|---|---|---|---|---|---|
| 247 | idx_user_ranks_current | gamification_system.user_ranks | current_rank | B-tree | Current rank lookups |
| 248 | idx_user_ranks_is_current | gamification_system.user_ranks | user_id, is_current (partial) | Composite Partial | Find current user rank only |
| 249 | idx_user_ranks_user_id | gamification_system.user_ranks | user_id | B-tree | Rank history by user |

### Category: User Roles (3 indexes)
| # | Index Name | Table | Column(s) | Type | Purpose |
|---|---|---|---|---|---|
| 250 | idx_user_roles_role | auth_management.user_roles | role | B-tree | Find users by role |
| 251 | idx_user_roles_tenant_id | auth_management.user_roles | tenant_id | B-tree | Tenant-scoped role queries |
| 252 | idx_user_roles_user_id | auth_management.user_roles | user_id | B-tree | Roles by user lookup |

### Category: User Sessions (8 indexes)
| # | Index Name | Table | Column(s) | Type | Purpose |
|---|---|---|---|---|---|
| 253 | idx_user_sessions_active | auth_management.user_sessions | is_active (partial) | Partial B-tree | Find active sessions only |
| 254 | idx_user_sessions_expires | auth_management.user_sessions | expires_at | B-tree | Session expiration queries |
| 255 | idx_user_sessions_refresh_token_hash | auth_management.user_sessions | refresh_token (partial) | Partial B-tree | Fast refresh token verification |
| 256 | idx_user_sessions_session_token_hash | auth_management.user_sessions | session_token (partial) | Partial B-tree | Fast session token validation |
| 257 | idx_user_sessions_token | auth_management.user_sessions | session_token | B-tree | Token-based session lookup |
| 258 | idx_user_sessions_user_id | auth_management.user_sessions | user_id | B-tree | All sessions for a user |

### Category: User Stats (6 indexes)
| # | Index Name | Table | Column(s) | Type | Purpose |
|---|---|---|---|---|---|
| 259 | idx_user_stats_global_rank | gamification_system.user_stats | global_rank_position (partial) | Partial B-tree | Top ranked users |
| 260 | idx_user_stats_level | gamification_system.user_stats | level | B-tree | Users by level |
| 261 | idx_user_stats_ml_coins | gamification_system.user_stats | ml_coins | B-tree | Users by coin balance |
| 262 | idx_user_stats_streak | gamification_system.user_stats | current_streak DESC | B-tree DESC | Top streaks |
| 263 | idx_user_stats_tenant_id | gamification_system.user_stats | tenant_id | B-tree | Tenant statistics |
| 264 | idx_user_stats_tenant_level | gamification_system.user_stats | tenant_id, level DESC | Composite | Leaderboard queries |
| 265 | idx_user_stats_user_id | gamification_system.user_stats | user_id | B-tree | User statistics lookup |

### Category: User Suspensions (3 indexes)
| # | Index Name | Table | Column(s) | Type | Purpose |
|---|---|---|---|---|---|
| 266 | idx_user_suspensions_suspended_by | auth_management.user_suspensions | suspended_by | B-tree | Suspensions by admin |
| 267 | idx_user_suspensions_until | auth_management.user_suspensions | suspension_until | B-tree | Active suspension queries |
| 268 | idx_user_suspensions_user_id | auth_management.user_suspensions | user_id | B-tree | User suspension history |

## Index Types Summary

### By Type (Last 30)
- **B-tree Indexes**: 22 (standard single-column indexes)
- **Composite Indexes**: 3 (multi-column: achievements_user_completed, ranks_is_current, stats_tenant_level)
- **Partial Indexes**: 4 (filtered: achievements_unclaimed, sessions_active, sessions_token_hash, stats_global_rank)
- **GIN Indexes**: 1 (metadata JSONB search)
- **DESC Indexes**: 2 (activity_created_at, stats_streak)

### Overall Statistics (All 268)
- **Total B-tree**: ~230
- **Composite Indexes**: ~15
- **Partial Indexes**: ~15
- **GIN/Full-text**: ~8

## Performance Impact

### Query Optimization
- **User Achievements**: Fast lookups by user, completion status, reward claims
- **User Activity**: Timeline queries, type filtering, metadata searches
- **User Ranks**: Current rank identification, rank history
- **User Roles**: Tenant-scoped role assignment, permission lookups
- **User Sessions**: Active session management, token validation
- **User Stats**: Leaderboard queries, level filtering, streak tracking
- **User Suspensions**: Active suspension queries, disciplinary history

### Index Maintenance
- Partial indexes reduce storage and update overhead
- Composite indexes optimize common multi-column queries
- DESC indexes support efficient reverse sorting
- GIN index for fast JSONB containment queries

## Dependencies

### Physical Schemas Required
- `auth_management`: user_roles, user_sessions, user_suspensions
- `audit_logging`: user_activity
- `gamification_system`: user_achievements, user_ranks, user_stats

### PostgreSQL Features
- CREATE INDEX IF NOT EXISTS (idempotency)
- Partial index WHERE clauses
- GIN index type for JSONB
- Composite indexes (multi-column)
- Descending order indexes

## Implementation Details

### File Naming Convention
- Format: `NNN-idx_name.sql` (e.g., 239-idx_user_achievements_completed.sql)
- Zero-padded position number (239-268)
- Matches index name for easy reference

### SQL Syntax
All indexes use:
```sql
CREATE INDEX [IF NOT EXISTS] index_name
ON schema.table_name [(column1, column2, ...)]
[USING gin|hash|...]
[WHERE condition]
[DESC];

COMMENT ON INDEX schema.index_name IS 'description';
```

### Safety Features
- `IF NOT EXISTS` clause prevents conflicts
- Comments document each index
- No transaction wrappers (idempotent execution)
- Safe for re-runs

## Related Documentation

### Previous Phases
- SA-DB-014: Initial 30 indexes
- SA-DB-015 through SA-DB-020: Indexes 31-238

### Associated Files
- Index definitions: `/apps/database/ddl/schemas/public/indexes/*.sql`
- Table definitions: `/apps/database/ddl/schemas/[schema]/tables/`
- Constraints: `/apps/database/ddl/schemas/[schema]/constraints/`

## Validation Checklist

✅ 30 index files created (239-268)
✅ All SQL syntax validated
✅ Index names match source definitions
✅ Schemas correctly mapped
✅ Comments added to each index
✅ Partial indexes optimized
✅ Composite indexes documented
✅ GIN indexes configured
✅ _MAP.md consolidation complete
✅ File naming convention consistent

## Notes

- Indexes are schema-specific (auth_management, audit_logging, gamification_system)
- The "public" schema here refers to the public/shared index naming space
- All indexes include performance documentation
- Partial indexes reduce write overhead on frequently updated tables
- Composite indexes support complex query patterns
- GIN index optimized for JSONB metadata searches

## Implementation Timeline

- **Phase 1-7**: Indexes 1-238 (previous SA-DB sessions)
- **Phase 8**: Indexes 239-268 (SA-DB-021, this implementation)
- **Completion**: 2025-11-02

---

*Generated by SA-DB-021: Implementador de Índices Public (Grupo 8/8)*
*Database Schema Implementation - Final 30 Indexes*
