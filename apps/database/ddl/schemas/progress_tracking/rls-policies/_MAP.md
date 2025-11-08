# RLS Policies Migration Map: progress_tracking

**Migration Date:** 2025-11-02
**Migrated By:** SA-DB-041 (RLS Migration Subagent)
**Source:** `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/rls-policies/`

## Summary

| Metric | Count |
|--------|-------|
| Total Policies | 14 |
| Tables with RLS | 4 |
| Files Migrated | 2 |
| Status | ✅ COMPLETED |

## Policies by Table

### 1. progress_tracking.module_progress
**Status:** ✅ Migrated
**Total Policies:** 4 (SELECT: 2, UPDATE: 1, INSERT: 1)

| Policy Name | Type | Purpose |
|-------------|------|---------|
| `module_progress_read_own` | SELECT | Students see their own progress |
| `module_progress_read_teacher` | SELECT | Teachers see student progress in classrooms |
| `module_progress_update_own` | UPDATE | Students update their own progress |
| `module_progress_insert_system` | INSERT | System and admins create progress records |

### 2. progress_tracking.exercise_attempts
**Status:** ✅ Migrated
**Total Policies:** 3 (SELECT: 2, INSERT: 1)

| Policy Name | Type | Purpose |
|-------------|------|---------|
| `exercise_attempts_read_own` | SELECT | Students see their own attempts |
| `exercise_attempts_read_teacher` | SELECT | Teachers see student attempts in classrooms |
| `exercise_attempts_insert_own` | INSERT | Students create their own attempts |

### 3. progress_tracking.exercise_submissions
**Status:** ✅ Migrated
**Total Policies:** 4 (SELECT: 2, INSERT: 1, UPDATE: 1)

| Policy Name | Type | Purpose |
|-------------|------|---------|
| `exercise_submissions_read_own` | SELECT | Students see their own submissions |
| `exercise_submissions_read_teacher` | SELECT | Teachers see student submissions in classrooms |
| `exercise_submissions_insert_own` | INSERT | Students submit their solutions |
| `exercise_submissions_update_teacher` | UPDATE | Teachers grade and provide feedback |

### 4. progress_tracking.learning_sessions
**Status:** ✅ Migrated (Existing)
**Total Policies:** 3 (Not updated in this migration)

## Migration Files

### Source → Destination

1. **Enable RLS**
   - Source: `01-enable-rls.sql`
   - Destination: `01-enable-rls.sql`
   - Status: ✅ Copied
   - Enabled Tables:
     - progress_tracking.module_progress
     - progress_tracking.exercise_attempts
     - progress_tracking.exercise_submissions
     - progress_tracking.learning_sessions

2. **Progress Policies**
   - Source: `02-progress-policies.sql`
   - Destination: `02-progress-policies.sql`
   - Status: ✅ Copied
   - Lines: 242
   - Contains: 14 policies (3 tables updated, 1 table existing)

## Implementation Details

### Current app.current_user_id Pattern
All policies use the following pattern for user context:
```sql
current_setting('app.current_user_id', true)::uuid
```

### Role Check References
Policies check roles in `auth_management.user_roles` table:
- `admin_teacher`: Teacher access with classroom oversight

### Classroom Access Patterns
Teacher policies reference `social_features.classroom_members` and `social_features.classrooms`:
```sql
AND user_id IN (
    SELECT cm.student_id
    FROM social_features.classroom_members cm
    JOIN social_features.classrooms c ON c.id = cm.classroom_id
    WHERE c.teacher_id = current_setting('app.current_user_id', true)::uuid
)
```

## Security Strategy

| User Role | Visibility | Allowed Operations |
|-----------|------------|-------------------|
| Student | Own progress only | Read own, Update own, Insert own |
| Teacher | Students in classrooms | Read student progress, Update submissions |
| Admin | All progress | Full access (via role checks) |

## Validation Notes

### Tables Verified
- ✅ `progress_tracking.module_progress` - EXISTS
- ✅ `progress_tracking.exercise_attempts` - EXISTS
- ✅ `progress_tracking.exercise_submissions` - EXISTS
- ✅ `progress_tracking.learning_sessions` - EXISTS

### SQL Syntax
- ✅ All DROP POLICY statements - Valid
- ✅ All CREATE POLICY statements - Valid
- ✅ All COMMENT statements - Valid

### Dependencies
- ✅ `auth_management.user_roles` - Referenced (exists)
- ✅ `social_features.classroom_members` - Referenced (exists)
- ✅ `social_features.classrooms` - Referenced (exists)
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
2. `02-progress-policies.sql` - Create policies (11 new policies)

## Related Documentation

- Progress tracking design: `schemas/progress_tracking/tables/`
- Role-based access patterns: See `auth_management/rls-policies/_MAP.md`
- Classroom relationships: See `social_features/rls-policies/_MAP.md`

---

**Migration Status: COMPLETE** ✅
**Next Step:** Deploy to target database
