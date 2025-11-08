# RLS Policies Map - gamification_system Schema

**Generated:** 2025-11-02 by SA-DB-040
**Total Policies:** 35
**Tables Protected:** 9

## Overview

This document maps all Row Level Security (RLS) policies for the `gamification_system` schema. These policies enforce fine-grained access control for gamification features including achievements, ML coins, user statistics, rankings, missions, and notifications.

---

## Policy Summary

| Type | Count | Purpose |
|------|-------|---------|
| SELECT | 23 | Read access control |
| INSERT | 3 | Creation authorization |
| UPDATE | 5 | Modification control |
| DELETE | 0 | Deletion control (none) |
| ALL | 4 | Full lifecycle control |
| **TOTAL** | **35** | |

---

## Tables with RLS Policies

### 1. ml_coins_transactions
**File:** `02-ml-coins-policies.sql`
**Policies:** 4 (SELECT: 3, INSERT: 1)

| Policy Name | Type | Description |
|------------|------|-------------|
| ml_coins_read_own | SELECT | Users can see their own transactions |
| ml_coins_read_teacher | SELECT | Teachers can monitor transactions of their students |
| ml_coins_read_admin | SELECT | Admins can see all transactions |
| ml_coins_insert_system | INSERT | Only admins can create transactions (via SECURITY DEFINER) |

**Security Strategy:** Role-based read access (self-service, teacher oversight, admin monitoring) + system-controlled creation

---

### 2. achievements
**File:** `03-achievements-policies.sql`
**Policies:** 2 (SELECT: 1, ALL: 1)

| Policy Name | Type | Description |
|------------|------|-------------|
| achievements_read_public | SELECT | All users can see active, non-secret achievements |
| achievements_manage_admin | ALL | Admins can fully manage all achievements |

**Security Strategy:** Public catalog for active achievements + admin-only management

---

### 3. user_achievements
**File:** `03-achievements-policies.sql`
**Policies:** 3 (SELECT: 3)

| Policy Name | Type | Description |
|------------|------|-------------|
| user_achievements_read_own | SELECT | Users can see their unlocked achievements |
| user_achievements_read_friends | SELECT | Users can see achievements of accepted friends |
| user_achievements_read_teacher | SELECT | Teachers can monitor achievements of their students |

**Security Strategy:** Progressive visibility (self, friends, teacher oversight)

---

### 4. comodines_inventory
**File:** `05-inventory-missions-policies.sql`
**Policies:** 3 (SELECT: 1, UPDATE: 1, INSERT: 1)

| Policy Name | Type | Description |
|------------|------|-------------|
| comodines_read_own | SELECT | Users can see their own power-up inventory |
| comodines_update_own | UPDATE | Users can update their inventory to use/consume power-ups |
| comodines_insert_system | INSERT | System can grant power-ups to users (via SECURITY DEFINER) |

**Security Strategy:** Private self-service inventory management + system-controlled rewards

---

### 5. user_stats
**File:** `04-user-stats-policies.sql`
**Policies:** 4 (SELECT: 3, UPDATE: 1)

| Policy Name | Type | Description |
|------------|------|-------------|
| user_stats_read_own | SELECT | Users can see their own statistics |
| user_stats_read_friends | SELECT | Users can see stats of accepted friends (social comparison) |
| user_stats_read_teacher | SELECT | Teachers can see student statistics |
| user_stats_update_system | UPDATE | Only admins can update statistics (via SECURITY DEFINER) |

**Security Strategy:** Progressive visibility + system-controlled updates

---

### 6. user_ranks
**File:** `04-user-stats-policies.sql`
**Policies:** 2 (SELECT: 1, UPDATE: 1)

| Policy Name | Type | Description |
|------------|------|-------------|
| user_ranks_read_all | SELECT | Public leaderboards visible to all users |
| user_ranks_update_system | UPDATE | Only admins can update ranking positions (automated) |

**Security Strategy:** Public rankings + system-controlled updates

---

### 7. missions
**File:** `05-inventory-missions-policies.sql`
**Policies:** 2 (SELECT: 1, ALL: 1)

| Policy Name | Type | Description |
|------------|------|-------------|
| missions_read_own | SELECT | Users can see their active and in-progress missions |
| missions_manage_admin | ALL | Admins can create, update, and delete missions |

**Security Strategy:** User-specific mission visibility + admin-only management

---

### 8. notifications
**File:** `06-notifications-leaderboard-policies.sql`
**Policies:** 3 (SELECT: 1, UPDATE: 1, INSERT: 1)

| Policy Name | Type | Description |
|------------|------|-------------|
| notifications_read_own | SELECT | Users can see only their own notifications |
| notifications_update_own | UPDATE | Users can mark their own notifications as read |
| notifications_insert_system | INSERT | Only system can create notifications (via SECURITY DEFINER) |

**Security Strategy:** Private notifications + system-controlled creation

---

### 9. leaderboard_metadata
**File:** `06-notifications-leaderboard-policies.sql`
**Policies:** 2 (SELECT: 1, ALL: 1)

| Policy Name | Type | Description |
|------------|------|-------------|
| leaderboard_metadata_read_all | SELECT | All users can see leaderboard configuration |
| leaderboard_metadata_manage_admin | ALL | Admins can configure leaderboard settings |

**Security Strategy:** Public configuration + admin-only management

---

## Cross-Schema Dependencies

### gamification_system -> social_features
The following policies reference tables in the `social_features` schema:

- `ml_coins_transactions`: References `social_features.classroom_members` and `social_features.classrooms`
- `user_achievements`: References `social_features.friendships` and `social_features.classroom_members`
- `user_stats`: References `social_features.friendships` and `social_features.classroom_members`

### Required Tables from auth_management
- `user_roles`: For role-based access control (roles: super_admin, admin_teacher)

### Custom Functions Used
- `current_setting('app.current_user_id')`: User context from application
- `current_setting('app.current_tenant_id')`: Tenant context (if applicable)
- `auth_management.user_roles`: View for role checking

---

## RLS Enabled Tables

The following 9 tables have RLS enabled (from `01-enable-rls.sql`):
1. ml_coins_transactions
2. achievements
3. user_achievements
4. comodines_inventory
5. user_stats
6. user_ranks
7. missions
8. notifications
9. leaderboard_metadata

---

## Implementation Notes

### DROP/CREATE Pattern
All policies use the DROP POLICY IF EXISTS / CREATE POLICY pattern to allow for safe reapplication and updates.

### Syntax Validation
All 35 policies follow valid PostgreSQL RLS syntax:
- Proper ON clause for table targeting
- Valid FOR clauses (SELECT, INSERT, UPDATE, ALL)
- Correct TO clause (all use 'public')
- USING and WITH CHECK conditions for authorization logic

### Security Considerations

1. **Admin Access**: Uses `super_admin` role check via `auth_management.user_roles`
2. **Teacher Oversight**: Teachers access student data through classroom relationships
3. **Friend Visibility**: Based on `social_features.friendships` relationships
4. **System Updates**: INSERT/UPDATE operations restricted to admins for data integrity
5. **Public Data**: Achievements and leaderboards visible to all when appropriate

---

## Related Files

- `01-enable-rls.sql`: Enables RLS on all 9 tables
- `02-ml-coins-policies.sql`: 4 policies for transactions
- `02-policies.sql`: Baseline policies (10 policies) for achievements, ml_coins, user_achievements, user_stats
- `03-achievements-policies.sql`: 5 policies for achievements and user_achievements
- `03-grants.sql`: GRANT statements for table permissions
- `04-user-stats-policies.sql`: 6 policies for user_stats and user_ranks
- `05-inventory-missions-policies.sql`: 5 policies for comodines_inventory and missions
- `06-notifications-leaderboard-policies.sql`: 5 policies for notifications and leaderboard_metadata

---

## Testing Checklist

- [ ] Verify all 35 policies create successfully
- [ ] Test user self-service access (read own data)
- [ ] Test friend visibility (read friend data when accepted)
- [ ] Test teacher oversight (read student data from their classrooms)
- [ ] Test admin access (read all data regardless)
- [ ] Verify write restrictions (only admins can insert/update)
- [ ] Verify public visibility for leaderboards
- [ ] Test with non-existent or invalid tenant_id values
- [ ] Verify no data leakage between users/classrooms/schools

---

## Troubleshooting

### Common Issues

1. **"permission denied for table"**: Ensure GRANT statements in `03-grants.sql` are executed
2. **"missing app settings"**: Application must set `app.current_user_id` context
3. **"cross-schema reference fails"**: Ensure `social_features.friendships`, `social_features.classroom_members`, and `social_features.classrooms` tables exist
4. **"role not found"**: Ensure `auth_management.user_roles` view exists with proper schema

---

## Maintenance

- Review policies monthly for security updates
- Monitor for performance issues with complex USING conditions
- Keep role definitions in sync with application authorization logic
- Validate tenant isolation on schema updates

