# RLS Policies Migration Map: educational_content

**Migration Date:** 2025-11-02
**Migrated By:** SA-DB-041 (RLS Migration Subagent)
**Source:** `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/educational_content/rls-policies/`

## Summary

| Metric | Count |
|--------|-------|
| Total Policies | 6 |
| Tables with RLS | 2 |
| Files Migrated | 2 |
| Status | ✅ COMPLETED |

## Policies by Table

### 1. educational_content.modules
**Status:** ✅ Migrated
**Total Policies:** 3 (SELECT: 2, ALL: 1)

| Policy Name | Type | Purpose |
|-------------|------|---------|
| `modules_read_published` | SELECT | Students see only published modules |
| `modules_read_teacher` | SELECT | Teachers see all modules (including drafts) |
| `modules_manage_admin` | ALL | Admins fully manage modules |

**Security Strategy:**
- Students: Can only see published/active content
- Teachers: Can see all content (including drafts)
- Admins: Full management access

### 2. educational_content.exercises
**Status:** ✅ Migrated
**Total Policies:** 3 (SELECT: 2, ALL: 1)

| Policy Name | Type | Purpose |
|-------------|------|---------|
| `exercises_read_active` | SELECT | Students see only active exercises |
| `exercises_read_teacher` | SELECT | Teachers see all exercises |
| `exercises_manage_admin` | ALL | Admins fully manage exercises |

**Security Strategy:**
- Students: Can only see active exercises
- Teachers: Can see all exercises (including inactive)
- Admins: Full management access

## Migration Files

### Source → Destination

1. **Enable RLS**
   - Source: `01-enable-rls.sql`
   - Destination: `01-enable-rls.sql`
   - Status: ✅ Copied
   - Enabled Tables:
     - educational_content.modules
     - educational_content.exercises
     - educational_content.assessment_rubrics
     - educational_content.media_resources

2. **Policies**
   - Source: `02-modules-exercises-policies.sql`
   - Destination: `02-modules-exercises-policies.sql`
   - Status: ✅ Copied
   - Lines: 142
   - Contains: 6 policies

## Implementation Details

### Current app.current_user_id Pattern
All policies use the following pattern for user context:
```sql
current_setting('app.current_user_id', true)::uuid
```

### Role Check References
Policies check roles in `auth_management.user_roles` table:
- `super_admin`: Full system access
- `admin_teacher`: Teacher access with classroom oversight

### Classroom Access Patterns
Teacher policies reference `social_features.classroom_members` and `social_features.classrooms` for classroom-based access control.

## Validation Notes

### Tables Verified
- ✅ `educational_content.modules` - EXISTS
- ✅ `educational_content.exercises` - EXISTS
- ✅ `educational_content.assessment_rubrics` - EXISTS
- ✅ `educational_content.media_resources` - EXISTS

### SQL Syntax
- ✅ All DROP POLICY statements - Valid
- ✅ All CREATE POLICY statements - Valid
- ✅ All COMMENT statements - Valid

### Dependencies
- ✅ `auth_management.user_roles` - Referenced (exists)
- ✅ Role-based conditionals - Functional
- ✅ current_setting calls - Consistent

## Deployment Checklist

- [x] Files copied to destination
- [x] Directory structure created
- [x] SQL syntax validated
- [x] Table references verified
- [x] Policy documentation complete
- [ ] Execute in target database (manual step)

## Execution Order

Execute files in this order when deploying:
1. `01-enable-rls.sql` - Enable RLS on tables
2. `02-modules-exercises-policies.sql` - Create policies

## Related Documentation

- Educational content design: `schemas/educational_content/tables/`
- Role-based access patterns: See `auth_management/rls-policies/_MAP.md`
- Classroom relationships: See `social_features/rls-policies/_MAP.md`

---

**Migration Status: COMPLETE** ✅
**Next Step:** Deploy to target database
