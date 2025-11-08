# RLS Policies Map - social_features Schema

**Generated:** 2025-11-02 by SA-DB-040
**Total Policies:** 28
**Tables Protected:** 6

## Overview

This document maps all Row Level Security (RLS) policies for the `social_features` schema. These policies enforce fine-grained access control for social collaboration features including schools, classrooms, friendships, and team-based activities.

---

## Policy Summary

| Type | Count | Purpose |
|------|-------|---------|
| SELECT | 17 | Read access control |
| INSERT | 3 | Creation authorization |
| UPDATE | 3 | Modification control |
| DELETE | 1 | Deletion control |
| ALL | 4 | Full lifecycle control |
| **TOTAL** | **28** | |

---

## Tables with RLS Policies

### 1. schools
**File:** `02-schools-policies.sql`
**Policies:** 3 (SELECT: 1, INSERT: 1, UPDATE: 1)

| Policy Name | Type | Description |
|------------|------|-------------|
| schools_read_tenant | SELECT | Users can only see schools in their own tenant (multi-tenant critical) |
| schools_insert_admin | INSERT | Only super_admins can create schools in their tenant |
| schools_update_admin | UPDATE | Only super_admins can update schools in their tenant |

**Security Strategy:** Strict multi-tenant isolation at school level + admin-only management

**Critical:** This is a key table for tenant isolation. All users must have tenant context set.

---

### 2. classrooms
**File:** `03-classrooms-policies.sql`
**Policies:** 5 (SELECT: 3, INSERT: 1, UPDATE: 1)

| Policy Name | Type | Description |
|------------|------|-------------|
| classrooms_read_student | SELECT | Students can only see classrooms they are enrolled in |
| classrooms_read_teacher | SELECT | Teachers can see their own classrooms |
| classrooms_read_admin | SELECT | Admins can see all classrooms |
| classrooms_insert_teacher | INSERT | Teachers can create classrooms assigned to themselves |
| classrooms_update_teacher | UPDATE | Teachers can update their own classrooms |

**Security Strategy:** Role-based visibility (student/teacher/admin) + teacher self-service management

---

### 3. classroom_members
**File:** `04-classroom-members-policies.sql`
**Policies:** 3 (SELECT: 2, ALL: 1)

| Policy Name | Type | Description |
|------------|------|-------------|
| classroom_members_read_student | SELECT | Students can see classmates in their own classrooms |
| classroom_members_read_teacher | SELECT | Teachers can see all members of their classrooms |
| classroom_members_manage_teacher | ALL | Teachers can fully manage membership of their classrooms |

**Security Strategy:** Limited student visibility (classmates only) + teacher full management

---

### 4. friendships
**File:** `05-friendships-policies.sql`
**Policies:** 3 (SELECT: 1, INSERT: 1, DELETE: 1)

| Policy Name | Type | Description |
|------------|------|-------------|
| friendships_read_own | SELECT | Users can see friendships where they are user or friend |
| friendships_insert_own | INSERT | Users can only create friendship requests from themselves |
| friendships_delete_own | DELETE | Users can delete friendships they are part of |

**Security Strategy:** Self-managed friendships with bidirectional visibility

---

### 5. teams
**File:** `02-policies.sql` and `06-teams-policies.sql`
**Policies:** 5 (SELECT: 2, INSERT: 0, UPDATE: 1, ALL: 2)

| Policy Name | Type | Description |
|------------|------|-------------|
| teams_manage_admin | ALL | Admins can fully manage all teams |
| teams_select_admin | SELECT | Admins can see all teams |
| teams_select_member | SELECT | Active members can see their own team information |
| teams_update_member | UPDATE | Team leaders can update team information |

**Security Strategy:** Member-based visibility + leader control + admin oversight

---

### 6. team_members & team_challenges
**File:** `06-teams-policies.sql`
**Policies:** 2 (SELECT: 2)

| Policy Name | Table | Type | Description |
|------------|-------|------|-------------|
| team_members_read_own | team_members | SELECT | Users can see all members of teams they belong to |
| team_challenges_read_members | team_challenges | SELECT | Users can see challenges for teams they are members of |

**Security Strategy:** Member-only visibility for team data

---

## Policy Distribution by Type

### SELECT Policies (17 total)
- **Visibility Control:** Read-only access to specific data subsets
- **Location:** Spread across all 6 tables
- **Users Affected:** All roles use SELECT for different data slices

### INSERT Policies (3 total)
- **schools**: 1 (admin-only)
- **classrooms**: 1 (teacher-only)
- **friendships**: 1 (user self-service)

### UPDATE Policies (3 total)
- **schools**: 1 (admin-only)
- **classrooms**: 1 (teacher-only)
- **teams**: 1 (leader-only)

### DELETE Policies (1 total)
- **friendships**: 1 (user self-service)

### ALL Policies (4 total)
- **schools**: Via 02-policies.sql
- **classrooms**: Via 02-policies.sql
- **classroom_members**: Via 02-policies.sql
- **teams**: Via 02-policies.sql

---

## Cross-Schema Dependencies

### social_features <- gamification_system
The following tables in `gamification_system` reference this schema:

- `gamification_system.ml_coins_transactions`: Joins with `classroom_members` and `classrooms`
- `gamification_system.user_achievements`: Joins with `friendships` and `classroom_members`
- `gamification_system.user_stats`: Joins with `friendships` and `classroom_members`

### Required Tables from auth_management
- `user_roles`: For role-based access control (roles: super_admin, admin_teacher)

### Custom Functions Used
- `current_setting('app.current_user_id')`: User context from application
- `current_setting('app.current_tenant_id')`: Tenant context for schools
- `auth_management.user_roles`: View for role checking
- `gamilit.get_current_user_id()`: Legacy function alternative (also used)
- `gamilit.is_admin()`: Legacy admin check function

---

## RLS Enabled Tables

The following 7 tables have RLS enabled (from `01-enable-rls.sql`):
1. schools
2. classrooms
3. classroom_members
4. friendships
5. teams
6. team_members
7. team_challenges

**Note:** Only 6 of these tables have explicit policies defined; verify if team_members and team_challenges need additional policies.

---

## Role-Based Access Matrix

| Role | schools | classrooms | classroom_members | friendships | teams |
|------|---------|-----------|-------------------|-------------|-------|
| User (Student) | X | View own | View classmates | Manage own | View own teams |
| Teacher | X | Manage own | Manage own | Manage own | Limited |
| Admin | Manage all | View all | View all | Manage own | Manage all |

Legend: X = No access, View = Read-only, Manage = Full CRUD

---

## Implementation Notes

### DROP/CREATE Pattern
All policies use the DROP POLICY IF EXISTS / CREATE POLICY pattern for safe reapplication.

### Syntax Validation
All 28 policies follow valid PostgreSQL RLS syntax:
- Proper ON clause for table targeting
- Valid FOR clauses (SELECT, INSERT, UPDATE, DELETE, ALL)
- Correct TO clause (all use 'public')
- USING and WITH CHECK conditions for authorization logic

### Multi-Tenant Architecture
**Critical**: The `schools` table is the entry point for tenant isolation. All related tables must inherit this isolation through foreign keys and RLS conditions.

### Security Considerations

1. **Tenant Isolation**: Schools policy ensures users only see their tenant's schools
2. **Classroom Privacy**: Students see only classrooms they belong to
3. **Friendship Self-Service**: Users manage their own relationships
4. **Teacher Authority**: Teachers have full control over their classrooms
5. **Team Membership**: Access based on active membership

---

## Related Files

- `01-enable-rls.sql`: Enables RLS on 7 tables
- `02-policies.sql`: 12 policies for classroom_members, classrooms, teams
- `02-schools-policies.sql`: 3 policies for schools (tenant isolation)
- `03-classrooms-policies.sql`: 5 policies for classrooms
- `03-grants.sql`: GRANT statements for table permissions
- `04-classroom-members-policies.sql`: 3 policies for classroom_members
- `05-friendships-policies.sql`: 3 policies for friendships
- `06-teams-policies.sql`: 2 policies for team_members and team_challenges

---

## Testing Checklist

- [ ] Verify all 28 policies create successfully
- [ ] Test tenant isolation with multiple schools/tenants
- [ ] Test student visibility (only own classrooms)
- [ ] Test teacher management (only own classrooms)
- [ ] Test admin visibility (all data)
- [ ] Test friendship bidirectionality
- [ ] Test team member visibility
- [ ] Verify team leader can update teams
- [ ] Verify no cross-tenant data leakage
- [ ] Test with students in multiple classrooms
- [ ] Test with teachers managing multiple classrooms

---

## Troubleshooting

### Common Issues

1. **"permission denied for table"**: Ensure GRANT statements in `03-grants.sql` are executed
2. **"missing app settings"**: Application must set `app.current_user_id` and `app.current_tenant_id` context
3. **"ambiguous function call"**: Some policies use `gamilit.is_admin()` - ensure this function exists, or migrate to `auth_management.user_roles` checks
4. **"relation does not exist"**: Verify all referenced tables exist:
   - auth_management.user_roles
   - social_features.classrooms
   - social_features.classroom_members
   - social_features.friendships
   - social_features.team_members

### Function Migration Note
Some policies use legacy gamilit functions. The authoritative version should use:
- `current_setting('app.current_user_id')::uuid` instead of `gamilit.get_current_user_id()`
- `EXISTS(SELECT 1 FROM auth_management.user_roles WHERE ...)` instead of `gamilit.is_admin()`

---

## Maintenance

- Review policies quarterly for performance
- Monitor for missing indexes on columns used in USING clauses
- Keep application context-setting synchronized with policies
- Validate role definitions match application logic
- Test new features don't break existing policy assumptions

---

## Version History

- **2025-11-02**: Initial map generation by SA-DB-040
  - 28 policies across 6 tables
  - Full cross-schema dependency documentation
  - Tenant isolation strategy documented

