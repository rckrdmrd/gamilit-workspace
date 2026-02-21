# FINDINGS-B3: RLS Policy Audit for Teacher-Related Tables

**Agent:** B (Database Coherence)
**Date:** 2026-02-20
**Scope:** Row Level Security policies on all teacher-related tables

---

## RLS Coverage Matrix

| # | Table | Schema | RLS Enabled | # Policies | Policy Names | Enforcement Level | Status |
|---|-------|--------|-------------|------------|--------------|-------------------|--------|
| 1 | `student_intervention_alerts` | progress_tracking | YES | 3 | `admin_view_tenant_alerts` (SELECT), `teacher_manage_classroom_alerts` (UPDATE), `teacher_view_classroom_alerts` (SELECT) | Teacher: classroom-scoped, Admin: tenant-scoped | OK |
| 2 | `teacher_alert_configurations` | progress_tracking | YES | 2 | `teacher_manage_own_config` (ALL), `admin_manage_tenant_config` (SELECT) | Teacher: own rows, Admin: tenant read | OK |
| 3 | `messages` | communication | YES + FORCE | 6 | `messages_select_own`, `messages_select_classroom`, `messages_select_admin`, `messages_insert_own`, `messages_update_own`, `messages_delete_own` | Full CRUD coverage | OK |
| 4 | `message_participants` | communication | YES | 3 | `message_participants_select_own`, `message_participants_update_own`, `message_participants_insert_system` | User: own records, System: insert | OK |
| 5 | `teacher_contents` | educational_content | YES | 10 | `teacher_content_view_own`, `_view_public`, `_view_school`, `_view_shared`, `_create_own`, `_update_own`, `_update_shared`, `_delete_own`, `_admin_manage_all`, `_student_view_classroom` | Comprehensive: owner/shared/admin/student | OK |
| 6 | `teacher_reports` | social_features | YES | 2 | `teacher_reports_teacher_policy` (SELECT), `teacher_reports_admin_policy` (SELECT) | SELECT only | WARN |
| 7 | `scheduled_reports` | social_features | YES | 2 | `scheduled_reports_teacher_policy` (ALL), `scheduled_reports_admin_policy` (ALL) | Full CRUD | OK |
| 8 | `shared_reports` | social_features | YES | 3 | `shared_reports_owner_policy` (ALL), `shared_reports_recipient_policy` (SELECT), `shared_reports_admin_policy` (ALL) | Owner/recipient/admin | OK |
| 9 | `classrooms` | social_features | YES | (separate audit) | - | - | N/A |
| 10 | `classroom_members` | social_features | YES | (separate audit) | - | - | N/A |
| 11 | `teacher_classrooms` | social_features | YES | (separate audit) | - | - | N/A |
| 12 | `assignments` | educational_content | YES | (separate audit) | - | - | N/A |
| 13 | `manual_reviews` | progress_tracking | YES | (separate audit) | - | - | N/A |
| 14 | `teacher_notes` | progress_tracking | YES | (separate audit) | - | - | N/A |

---

## Detailed Findings

### Finding B3-01: teacher_reports has SELECT-only RLS policies

**Table:** `social_features.teacher_reports`
**Severity:** MEDIUM
**Current State:** RLS is enabled with 2 policies, both for SELECT only.
**Detail:**
- `teacher_reports_teacher_policy`: Teachers can SELECT their own reports (teacher_id = current_user_id)
- `teacher_reports_admin_policy`: Admins can SELECT all reports in their tenant

**Gap:** No INSERT, UPDATE, or DELETE policies defined. The DDL comment says "INSERT/UPDATE/DELETE: Handled at application level."

**Risk:** If RLS is enforced (FORCE ROW LEVEL SECURITY), application-level INSERT/UPDATE/DELETE will fail unless:
1. The application uses `BYPASSRLS` (current setup: gamilit_user has BYPASSRLS=true), or
2. Permissive policies are added for these operations.

**Recommendation:** Since `gamilit_user` currently has `BYPASSRLS=true`, this is not a production blocker. However, if NOBYPASSRLS is ever enabled (as planned), INSERT/UPDATE/DELETE policies must be added first. Add:
- Teacher INSERT policy: `WITH CHECK (teacher_id = current_user_id)`
- Teacher UPDATE policy: `USING (teacher_id = current_user_id)`
- Teacher DELETE policy: `USING (teacher_id = current_user_id)`

### Finding B3-02: RLS function inconsistency across tables

**Severity:** LOW
**Detail:** Teacher-related tables use different RLS function patterns:

| Pattern | Tables Using It |
|---------|----------------|
| `gamilit.get_current_user_id()` | student_intervention_alerts, teacher_alert_configurations |
| `current_setting('app.current_user_id', true)::uuid` | teacher_reports, scheduled_reports, shared_reports, messages, message_participants |

**Risk:** If `gamilit.get_current_user_id()` reads from a different session variable than `current_setting('app.current_user_id')`, policies may return inconsistent results.

**Recommendation:** Verify that `gamilit.get_current_user_id()` internally calls `current_setting('app.current_user_id', true)::uuid`. If so, this is cosmetic. If not, standardize all teacher tables to use the same pattern.

### Finding B3-03: communication.messages has FORCE ROW LEVEL SECURITY

**Severity:** INFORMATIONAL
**Detail:** `communication.messages` is the only teacher-related table with `FORCE ROW LEVEL SECURITY` (in addition to `ENABLE ROW LEVEL SECURITY`). This means RLS is enforced even for table owners.

**Impact:** Even `gamilit_user` with BYPASSRLS must comply with policies on this table (FORCE overrides BYPASSRLS in some PostgreSQL configurations). This is intentional for sensitive messaging data but differs from other tables.

### Finding B3-04: scheduled_reports admin policy uses different tenant check

**Severity:** LOW
**Detail:** The `scheduled_reports_admin_policy` checks `app.current_user_role`, while the `teacher_reports_admin_policy` checks `auth_management.user_roles` table. Different approaches:
- `scheduled_reports`: `current_setting('app.current_user_role') IN ('admin', 'super_admin')`
- `teacher_reports`: `EXISTS (SELECT 1 FROM auth_management.user_roles ur WHERE ...)`

**Recommendation:** Standardize to one approach for consistency.

---

## Summary

| Status | Count | Description |
|--------|-------|-------------|
| **OK** | 7 | Tables with complete RLS coverage for teacher use cases |
| **WARN** | 1 | teacher_reports: SELECT-only policies (INSERT/UPDATE/DELETE at app level) |
| **LOW** | 2 | Function inconsistency, admin policy pattern inconsistency |
| **INFO** | 1 | messages has FORCE RLS (intentional) |

**Overall RLS Score: 8/8 teacher tables have RLS enabled.** Policy completeness is adequate for current BYPASSRLS configuration.

---

*Generated by Agent B - Database Coherence Audit*
