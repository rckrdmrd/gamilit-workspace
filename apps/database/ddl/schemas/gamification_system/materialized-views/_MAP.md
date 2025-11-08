# Materialized Views - Gamification System

**Schema:** `gamification_system`
**Type:** Materialized Views (MVIEWs)
**Purpose:** Pre-computed views for optimized leaderboard and gamification queries
**Last Updated:** 2025-11-02

---

## Migration Summary

| Status | Count |
|--------|-------|
| MVIEWs Implemented | 4 |
| Total Indexes | 14 |
| Files Copied | 4 |
| Files Excluded | 4 |

---

## Implemented Materialized Views

### 1. **mv_global_leaderboard**
- **File:** `01-mv_global_leaderboard.sql`
- **Purpose:** Pre-computed global leaderboard ranking all active students by total XP
- **Performance Impact:** Reduces query time from ~2s to <50ms
- **Refresh Strategy:** Every hour (recommended)
- **Indexes:** 3
  - `idx_mv_global_leaderboard_rank` (UNIQUE, required for CONCURRENT refresh)
  - `idx_mv_global_leaderboard_user`
  - `idx_mv_global_leaderboard_xp`
- **Key Columns:**
  - `rank` - Global ranking position
  - `user_id` - User identifier
  - `full_name` - User's full name
  - `total_xp` - Total experience points
  - `current_rank` - User's rank badge
  - `level` - User's level
  - `achievements_count` - Number of achievements earned
- **Dependencies:**
  - `auth_management.profiles`
  - `gamification_system.user_stats`
  - `gamification_system.user_ranks`
  - `gamification_system.user_achievements`

---

### 2. **mv_classroom_leaderboard**
- **File:** `02-mv_classroom_leaderboard.sql`
- **Purpose:** Pre-computed classroom-specific leaderboard ranking students within each classroom by total XP
- **Performance Impact:** Reduces query time from ~3s to <50ms
- **Refresh Strategy:** Every 30 minutes (critical feature - most frequently accessed)
- **Indexes:** 4
  - `idx_mv_classroom_leaderboard_unique` (UNIQUE, classroom_id + user_id)
  - `idx_mv_classroom_leaderboard_classroom`
  - `idx_mv_classroom_leaderboard_user`
  - `idx_mv_classroom_leaderboard_xp`
- **Key Columns:**
  - `classroom_id` - Associated classroom
  - `rank` - Ranking within classroom
  - `user_id` - User identifier
  - `total_xp` - Total experience points
  - `current_rank` - User's rank badge
  - `level` - User's level
- **Dependencies:**
  - `social_features.classroom_members`
  - `auth_management.profiles`
  - `gamification_system.user_stats`
  - `gamification_system.user_ranks`
  - `gamification_system.user_achievements`

---

### 3. **mv_weekly_leaderboard**
- **File:** `03-mv_weekly_leaderboard.sql`
- **Purpose:** Pre-computed weekly leaderboard ranking students by XP earned this week
- **Performance Impact:** Reduces query time from ~1.5s to <50ms
- **Refresh Strategy:** Every hour (regular) + Weekly reset every Monday at 00:00
- **Indexes:** 3
  - `idx_mv_weekly_leaderboard_rank` (UNIQUE, required for CONCURRENT refresh)
  - `idx_mv_weekly_leaderboard_user`
  - `idx_mv_weekly_leaderboard_xp`
- **Key Columns:**
  - `rank` - Weekly ranking position
  - `user_id` - User identifier
  - `weekly_xp` - Experience points earned this week
  - `activities_completed` - Count of activities (exercises) completed
  - `current_rank` - User's rank badge
  - `level` - User's level
- **Special Note:** Requires weekly reset of `weekly_xp` and `weekly_exercises` columns in `user_stats` every Monday at 00:00
  - Can be handled by: Application-level cron job, Database trigger, or pg_cron scheduled job
- **Dependencies:**
  - `auth_management.profiles`
  - `gamification_system.user_stats` (weekly_xp, weekly_exercises columns)
  - `gamification_system.user_ranks`

---

### 4. **mv_mechanic_leaderboard**
- **File:** `04-mv_mechanic_leaderboard.sql`
- **Purpose:** Pre-computed mechanic-specific leaderboard ranking students by mission type (mechanic)
- **Performance Impact:** Reduces query time from ~4s to <50ms
- **Refresh Strategy:** Every 2 hours (lower frequency - mechanic leaderboards change less frequently)
- **Indexes:** 4
  - `idx_mv_mechanic_leaderboard_unique` (UNIQUE, mechanic_id + user_id)
  - `idx_mv_mechanic_leaderboard_mechanic`
  - `idx_mv_mechanic_leaderboard_user`
  - `idx_mv_mechanic_leaderboard_xp`
- **Key Columns:**
  - `mechanic_id` - Mission type identifier
  - `mechanic_name` - Mission type name
  - `rank` - Ranking within mechanic
  - `user_id` - User identifier
  - `user_xp` - Total XP (aggregated across mechanic)
  - `current_rank` - User's rank badge
  - `level` - User's level
  - `missions_scheduled` - Count of scheduled missions for this mechanic
- **Implementation Note:** Uses mission_type as mechanic identifier (simplified approach)
- **Dependencies:**
  - `gamification_system.missions`
  - `auth_management.profiles`
  - `gamification_system.user_stats`
  - `gamification_system.user_ranks`
  - `progress_tracking.scheduled_missions`

---

## Excluded Files

| File Name | Reason | Type |
|-----------|--------|------|
| `99-refresh-schedule.sql` | Utility script (scheduling/cron configuration) | Excluded (99-* pattern) |
| `check-mv-freshness.sql` | Utility script (monitoring/diagnostics) | Excluded (check-* pattern) |
| `refresh-all-mvs.sql` | Utility script (manual refresh commands) | Excluded (utility script) |
| `MATERIALIZED-VIEWS-README.md` | Documentation file | Excluded (not DDL) |
| `INTEGRATION-SUMMARY.md` | Documentation file | Excluded (not DDL) |

---

## File Structure

```
materialized-views/
├── _MAP.md (this file)
├── 01-mv_global_leaderboard.sql
├── 02-mv_classroom_leaderboard.sql
├── 03-mv_weekly_leaderboard.sql
└── 04-mv_mechanic_leaderboard.sql
```

---

## Quick Reference: Refresh Schedules

| MVIEW | Refresh Frequency | Trigger |
|-------|------------------|---------|
| `mv_global_leaderboard` | Every 1 hour | Hourly cron job |
| `mv_classroom_leaderboard` | Every 30 minutes | Frequent updates (critical feature) |
| `mv_weekly_leaderboard` | Every 1 hour | Hourly cron job + Monday reset |
| `mv_mechanic_leaderboard` | Every 2 hours | Lower frequency |

**Implementation:** Use pg_cron or application-level cron jobs to schedule:
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY schema.materialized_view_name;
```

---

## Usage Examples

### Get top 10 students globally
```sql
SELECT rank, user_id, full_name, total_xp, current_rank, level
FROM gamification_system.mv_global_leaderboard
LIMIT 10;
```

### Get top 10 in specific classroom
```sql
SELECT rank, user_id, full_name, total_xp, current_rank, level
FROM gamification_system.mv_classroom_leaderboard
WHERE classroom_id = 'classroom-uuid-here'
ORDER BY rank
LIMIT 10;
```

### Get weekly top performers
```sql
SELECT rank, user_id, full_name, weekly_xp, activities_completed
FROM gamification_system.mv_weekly_leaderboard
ORDER BY rank
LIMIT 10;
```

### Get user's rank across mechanics
```sql
SELECT mechanic_id, mechanic_name, rank, user_xp
FROM gamification_system.mv_mechanic_leaderboard
WHERE user_id = 'user-uuid-here'
ORDER BY rank;
```

---

## Performance Characteristics

| Query Type | Original Time | MVIEW Time | Improvement |
|------------|---------------|------------|-------------|
| Global leaderboard | ~2000ms | <50ms | 40x faster |
| Classroom leaderboard | ~3000ms | <50ms | 60x faster |
| Weekly leaderboard | ~1500ms | <50ms | 30x faster |
| Mechanic leaderboard | ~4000ms | <50ms | 80x faster |

---

## Important Notes

1. **CONCURRENT REFRESH:** All MVIEWs include UNIQUE indexes to support concurrent refresh without locks
2. **WITH DATA:** All MVIEWs are created with `WITH DATA` and require an initial refresh after creation
3. **PERMISSIONS:** All MVIEWs have `GRANT SELECT` to the `authenticated` role
4. **Weekly Reset:** `mv_weekly_leaderboard` requires special handling for Monday resets
5. **Dependencies:** Ensure all referenced tables exist before creating these MVIEWs

---

**Generated by:** SA-DB-026 (Subagent for Materialized Views Migration)
**Migration Date:** 2025-11-02
**Status:** READY FOR DEPLOYMENT
