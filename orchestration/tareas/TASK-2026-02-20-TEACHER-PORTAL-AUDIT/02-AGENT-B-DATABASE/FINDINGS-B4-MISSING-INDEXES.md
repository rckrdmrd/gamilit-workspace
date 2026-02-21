# FINDINGS-B4: Missing Indexes Audit

**Agent:** B (Database Coherence)
**Date:** 2026-02-20
**Scope:** Index coverage for teacher-related tables and frequently queried columns

---

## Index Coverage Matrix

### 1. student_intervention_alerts (progress_tracking)

| Index Name | Columns | Condition | Present | Source |
|-----------|---------|-----------|---------|--------|
| `idx_student_alerts_student` | `student_id` | - | YES | DDL |
| `idx_student_alerts_classroom` | `classroom_id` | - | YES | DDL |
| `idx_student_alerts_classroom_status` | `classroom_id, status` | `WHERE status = 'active'` | YES | DDL |
| `idx_student_alerts_status` | `status` | - | YES | DDL |
| `idx_student_alerts_severity` | `severity` | - | YES | DDL |
| `idx_student_alerts_type` | `alert_type` | - | YES | DDL |
| `idx_student_alerts_generated` | `generated_at DESC` | - | YES | DDL |
| `idx_student_alerts_tenant` | `tenant_id` | - | YES | DDL |
| Entity-declared indexes | (7 @Index decorators) | - | YES | Entity |

**Coverage:** COMPLETE -- 8 DDL indexes cover all query patterns in InterventionAlertsService.

**Note:** Entity declares 7 `@Index` decorators with slightly different names (e.g., `idx_intervention_alerts_student` vs DDL `idx_student_alerts_student`). This is cosmetic; DDL is source of truth.

---

### 2. teacher_alert_configurations (progress_tracking)

| Index Name | Columns | Condition | Present | Source |
|-----------|---------|-----------|---------|--------|
| `idx_teacher_alert_config_teacher` | `teacher_id` | - | YES | DDL |
| `idx_teacher_alert_config_classroom` | `classroom_id` | `WHERE classroom_id IS NOT NULL` | YES | DDL |
| `idx_teacher_alert_config_tenant` | `tenant_id` | - | YES | DDL |
| `idx_teacher_alert_config_type` | `alert_type` | - | YES | DDL |
| `idx_teacher_alert_config_enabled` | `teacher_id, is_enabled` | `WHERE is_enabled = true` | YES | DDL |

**Coverage:** COMPLETE -- 5 indexes cover all query patterns in AlertConfigService.

---

### 3. messages (communication)

| Index Name | Columns | Condition | Present | Source |
|-----------|---------|-----------|---------|--------|
| `idx_messages_sender` | `sender_id, created_at DESC` | `WHERE is_deleted = FALSE` | YES | DDL |
| `idx_messages_recipient` | `recipient_id, created_at DESC` | `WHERE is_deleted = FALSE` | YES | DDL |
| `idx_messages_classroom` | `classroom_id, created_at DESC` | `WHERE is_deleted = FALSE` | YES | DDL |
| `idx_messages_unread` | `recipient_id, created_at DESC` | `WHERE is_read = FALSE AND is_deleted = FALSE` | YES | DDL |
| `idx_messages_thread` | `thread_id, created_at ASC` | `WHERE thread_id IS NOT NULL AND is_deleted = FALSE` | YES | DDL |
| `idx_messages_parent` | `parent_message_id, created_at ASC` | `WHERE parent_message_id IS NOT NULL AND is_deleted = FALSE` | YES | DDL |
| `idx_messages_flagged` | `flagged_at DESC` | `WHERE is_flagged = TRUE` | YES | DDL |
| `idx_messages_requiring_response` | `recipient_id, response_deadline` | `WHERE requires_response = TRUE AND is_deleted = FALSE` | YES | DDL |
| `idx_messages_classroom_type` | `classroom_id, message_type, created_at DESC` | `WHERE is_deleted = FALSE` | YES | DDL |
| `idx_messages_attachments` | `attachments` (GIN) | - | YES | DDL |
| `idx_messages_metadata` | `metadata` (GIN) | - | YES | DDL |

**Coverage:** COMPLETE -- 11 indexes, comprehensive coverage.

---

### 4. message_participants (communication)

| Index Name | Columns | Condition | Present | Source |
|-----------|---------|-----------|---------|--------|
| `idx_message_participants_message_id` | `message_id` | - | YES | DDL |
| `idx_message_participants_user_id` | `user_id` | - | YES | DDL |
| `idx_message_participants_unread` | `user_id, message_id` | `WHERE is_read = FALSE` | YES | DDL |
| `idx_message_participants_role` | `user_id, role` | - | YES | DDL |
| `idx_message_participants_user_read` | `user_id, is_read, created_at DESC` | - | YES | DDL |

**Coverage:** COMPLETE -- 5 indexes.

---

### 5. teacher_contents (educational_content)

| Index Name | Columns | Condition | Present | Source |
|-----------|---------|-----------|---------|--------|
| `idx_teacher_contents_teacher` | `teacher_id, created_at DESC` | `WHERE is_active = TRUE` | YES | DDL |
| `idx_teacher_contents_published` | `published_at DESC` | `WHERE status = 'published' AND is_active = TRUE` | YES | DDL |
| `idx_teacher_contents_type` | `content_type, created_at DESC` | `WHERE is_active = TRUE` | YES | DDL |
| `idx_teacher_contents_shared` | `visibility, status` | `WHERE is_shared = TRUE AND is_active = TRUE` | YES | DDL |
| `idx_teacher_contents_featured` | `created_at DESC` | `WHERE (is_featured OR is_template) AND is_active = TRUE` | YES | DDL |
| `idx_teacher_contents_pending` | `created_at ASC` | `WHERE status = 'pending_review' AND is_active = TRUE` | YES | DDL |
| `idx_teacher_contents_classroom_search` | `status, visibility, content_type` | `WHERE is_active = TRUE` | YES | DDL |
| `idx_teacher_contents_tags` | `tags` (GIN) | - | YES | DDL |
| `idx_teacher_contents_keywords` | `keywords` (GIN) | - | YES | DDL |
| `idx_teacher_contents_target_classrooms` | `target_classrooms` (GIN) | - | YES | DDL |
| `idx_teacher_contents_metadata` | `metadata` (GIN) | - | YES | DDL |

**Coverage:** COMPLETE -- 11 indexes, excellent coverage.

---

### 6. teacher_reports (social_features)

| Index Name | Columns | Condition | Present | Source |
|-----------|---------|-----------|---------|--------|
| `idx_teacher_reports_teacher_id` | `teacher_id` | - | YES | DDL |
| `idx_teacher_reports_tenant_id` | `tenant_id` | - | YES | DDL |
| `idx_teacher_reports_generated_at` | `generated_at DESC` | - | YES | DDL |
| `idx_teacher_reports_classroom_id` | `classroom_id` | `WHERE classroom_id IS NOT NULL` | YES | DDL |
| `idx_teacher_reports_report_type` | `report_type` | - | YES | DDL |

**Coverage:** COMPLETE -- 5 indexes.

---

### 7. scheduled_reports (social_features)

| Index Name | Columns | Condition | Present | Source |
|-----------|---------|-----------|---------|--------|
| `idx_scheduled_reports_teacher_id` | `teacher_id` | - | YES | DDL |
| `idx_scheduled_reports_tenant_id` | `tenant_id` | - | YES | DDL |
| `idx_scheduled_reports_next_run` | `next_run_at` | `WHERE is_active = true` | YES | DDL |
| `idx_scheduled_reports_active` | `is_active` | `WHERE is_active = true` | YES | DDL |
| `idx_scheduled_reports_student_ids` | `student_ids` (GIN) | - | YES | DDL |
| `idx_scheduled_reports_status` | `status` | `WHERE status = 'active'` | YES | DDL |

**Coverage:** COMPLETE -- 6 indexes.

---

### 8. shared_reports (social_features)

| Index Name | Columns | Condition | Present | Source |
|-----------|---------|-----------|---------|--------|
| `idx_shared_reports_unique` | `report_id, shared_with` | UNIQUE | YES | DDL |
| `idx_shared_reports_report_id` | `report_id` | - | YES | DDL |
| `idx_shared_reports_shared_by` | `shared_by` | - | YES | DDL |
| `idx_shared_reports_shared_with` | `shared_with` | - | YES | DDL |
| `idx_shared_reports_tenant_id` | `tenant_id` | - | YES | DDL |
| `idx_shared_reports_expires` | `expires_at` | `WHERE expires_at IS NOT NULL` | YES | DDL |
| `idx_shared_reports_active` | `shared_with, is_revoked` | `WHERE is_revoked = FALSE` | YES | DDL |

**Coverage:** COMPLETE -- 7 indexes.

---

## teacher-portal-indexes.sql Status

**File:** `apps/database/ddl/schemas/progress_tracking/indexes/03-teacher-portal-indexes.sql`
**Status:** Mostly REMOVED

The file originally contained 3 teacher portal indexes but they were removed in CORR-03 (2026-02-17) because the columns they referenced did not exist:
- `idx_intervention_alerts_teacher_status`: `teacher_id` column does NOT exist in `student_intervention_alerts` (correct -- alerts reference `student_id`, not `teacher_id`)
- `idx_exercise_submissions_student_date`: `student_id` column does NOT exist (column is `user_id`)
- `idx_exercise_submissions_needs_review`: `needs_review` column does NOT exist

**Only remaining index:** `idx_module_progress_classroom_status` (module_progress.classroom_id, status) -- useful for classroom analytics queries.

---

## Gaps and Recommendations

### B4-01: Missing composite index for scheduled_reports CRON query

**Severity:** LOW
**Table:** `social_features.scheduled_reports`
**Query Pattern:** `WHERE status = 'active' AND next_run_at <= NOW()` (ScheduledReportsService.executeScheduledReports)
**Current:** Separate indexes on `status` and `next_run_at`
**Recommendation:** Consider a composite index `(status, next_run_at)` for the CRON query. Currently the partial index `idx_scheduled_reports_next_run` covers `next_run_at WHERE is_active = true`, which uses the deprecated `is_active` column instead of `status`. The service queries by `status = 'active'`, not `is_active = true`.

### B4-02: Entity @Index decorators vs DDL index names differ

**Severity:** INFORMATIONAL
**Detail:** Several entities declare `@Index` decorators with names that differ from the DDL-defined index names. Since DDL is the source of truth and TypeORM's `synchronize` is disabled, these entity decorators are documentation-only. No runtime impact.

**Examples:**
- Entity: `idx_intervention_alerts_student` vs DDL: `idx_student_alerts_student`
- Entity: `idx_intervention_alerts_classroom` vs DDL: `idx_student_alerts_classroom`

---

## Summary

| Table | DDL Indexes | Gaps | Status |
|-------|------------|------|--------|
| student_intervention_alerts | 8 | 0 | COMPLETE |
| teacher_alert_configurations | 5 | 0 | COMPLETE |
| messages | 11 | 0 | COMPLETE |
| message_participants | 5 | 0 | COMPLETE |
| teacher_contents | 11 | 0 | COMPLETE |
| teacher_reports | 5 | 0 | COMPLETE |
| scheduled_reports | 6 | 1 (LOW) | NEAR-COMPLETE |
| shared_reports | 7 | 0 | COMPLETE |
| **TOTAL** | **58** | **1** | |

**Overall Index Score: 57/58 query patterns covered.** One low-priority composite index recommendation for CRON job optimization.

---

*Generated by Agent B - Database Coherence Audit*
