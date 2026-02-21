# FINDINGS-D2: Missing Seeds Analysis

**Agent:** D (Seeds & Data Completeness)
**Date:** 2026-02-20
**Scope:** Teacher-related tables without seed coverage

---

## Missing Seeds Summary

| # | Table | Priority | Reason | App-Generated? |
|---|-------|----------|--------|----------------|
| 1 | `educational_content.teacher_contents` | HIGH | Teacher portal content management needs demo data | No |
| 2 | `progress_tracking.student_intervention_alerts` | HIGH | Teacher monitoring page needs demo alerts | Partially (CRON can generate) |
| 3 | `progress_tracking.teacher_alert_configurations` | MEDIUM | Default alert configs needed for teacher onboarding | No |
| 4 | `progress_tracking.teacher_interventions` | LOW | Created by teachers in response to alerts | Yes (user action) |
| 5 | `social_features.scheduled_reports` | MEDIUM | Teacher reports scheduling page needs demo data | No |
| 6 | `social_features.shared_reports` | LOW | Created when teacher shares a report | Yes (user action) |
| 7 | `educational_content.assignment_students` | HIGH | Assignment detail page needs student-assignment mappings | Partially (created on assignment) |
| 8 | `educational_content.assignment_submissions` | MEDIUM | Grading queue page needs submissions to grade | Partially (student action) |
| 9 | `communication.conversations` | MEDIUM | Conversation-based messaging needs demo data | Partially (created on first message) |
| 10 | `communication.conversation_participants` | MEDIUM | Linked to conversations | Partially (auto-created) |
| 11 | `progress_tracking.learning_sessions` | LOW | App-generated on student login/activity | Yes (auto-generated) |

---

## Detailed Analysis

### 1. educational_content.teacher_contents -- PRIORITY: HIGH

**Schema:** `educational_content`
**DDL:** `apps/database/ddl/schemas/educational_content/tables/25-teacher_content.sql`
**Current Seeds:** None in any environment

**Why seeds are needed:**
- The TeacherContentManagement page (`TeacherContentManagement.tsx`) displays a list of teacher-created content items
- Without demo data, the content management page shows empty state on first load
- Testing content visibility, sharing, and approval workflows requires pre-existing records
- Content types include: `custom_exercise`, `worksheet`, `reading_material`, `video_lesson`, `presentation`, `quiz`, `assignment`, `resource_pack`

**Suggested seed content:**
- 5-8 teacher_contents records:
  - 2 published items (visibility: 'classroom')
  - 2 draft items
  - 1 pending_review item
  - 1 shared template (is_template: true, is_shared: true)
  - 1 archived item
- Use dynamic profile lookup for `teacher_id` and dynamic tenant lookup for `tenant_id`
- Include varied content_types and difficulty_levels
- Reference the DEFAULT classroom in `target_classrooms`

**Recommended scope:** `dev|demo_data` (not needed in prod)

---

### 2. progress_tracking.student_intervention_alerts -- PRIORITY: HIGH

**Schema:** `progress_tracking`
**DDL:** `apps/database/ddl/schemas/progress_tracking/tables/19-student_intervention_alerts.sql`
**Current Seeds:** None in any environment

**Why seeds are needed:**
- The TeacherMonitoring page displays active intervention alerts for students
- Without demo alerts, the monitoring page is empty and untestable
- Alert types: `no_activity`, `low_score`, `declining_trend`, `repeated_failures`, `excessive_time`, `low_engagement`
- Severity levels: `low`, `medium`, `high`, `critical`

**App-generated?** Partially. A CRON job or analytics pipeline could generate these, but no such job currently exists in the codebase. The alerts are expected to come from the backend analytics service.

**Suggested seed content:**
- 8-12 alerts across different types and severities:
  - 3 `active` alerts (varying severity)
  - 2 `acknowledged` alerts (teacher has seen them)
  - 2 `resolved` alerts (with resolution notes)
  - 1 `dismissed` alert
- Link to demo students and the DEFAULT classroom
- Include realistic `metrics` JSON (e.g., `{"score": 45, "threshold": 60}`)
- Use dynamic profile lookup for student_id, acknowledged_by, resolved_by

**Recommended scope:** `dev|demo_data`

---

### 3. progress_tracking.teacher_alert_configurations -- PRIORITY: MEDIUM

**Schema:** `progress_tracking`
**DDL:** `apps/database/ddl/schemas/progress_tracking/tables/20-teacher_alert_configurations.sql`
**Current Seeds:** None in any environment

**Why seeds are needed:**
- The TeacherSettings page includes alert configuration UI
- Default configurations help teachers see what's available before customizing
- Without defaults, teachers must configure everything from scratch

**Suggested seed content:**
- 6 default configurations (one per alert_type) for the demo teacher:
  - `no_activity`: threshold 7 days, enabled, notify_in_app
  - `low_score`: threshold 50%, enabled, notify_in_app + email
  - `declining_trend`: threshold 15%, enabled, notify_in_app
  - `repeated_failures`: threshold 3 attempts, enabled, notify_in_app
  - `excessive_time`: threshold 60 minutes, enabled, notify_in_app
  - `low_engagement`: threshold 30%, disabled by default
- Use dynamic lookup for teacher_id and tenant_id
- Set `classroom_id = NULL` for global defaults

**Recommended scope:** `all|core` (default configs should exist in all environments)

---

### 4. progress_tracking.teacher_interventions -- PRIORITY: LOW

**Schema:** `progress_tracking`
**DDL:** `apps/database/ddl/schemas/progress_tracking/tables/17-teacher_interventions.sql`
**Current Seeds:** None in any environment

**Why seeds are needed (limited):**
- Data is generated by teacher actions (responding to alerts)
- However, having a few demo interventions would help test the intervention history view

**App-generated?** Yes, created by teachers through the UI when responding to student alerts.

**Suggested seed content (if created):**
- 3-5 intervention records:
  - 1 `completed` intervention with effectiveness_rating
  - 1 `in_progress` intervention
  - 1 `planned` intervention with follow_up_required
- Depends on student_intervention_alerts seed existing first (FK on alert_id)
- Use dynamic lookups for all UUID references

**Recommended scope:** `dev|demo_data` (only if intervention alerts seed is also created)

---

### 5. social_features.scheduled_reports -- PRIORITY: MEDIUM

**Schema:** `social_features`
**DDL:** `apps/database/ddl/schemas/social_features/tables/08b-scheduled_reports.sql`
**Current Seeds:** None in any environment

**Why seeds are needed:**
- The ScheduledReportsTab component (`ScheduledReportsTab.tsx`) in TeacherReports page displays scheduled report configurations
- Without demo data, the tab shows empty state
- Important for testing the scheduling workflow (daily/weekly/monthly)

**Suggested seed content:**
- 3-4 scheduled report configurations:
  - 1 `active` weekly report (frequency: 'weekly', day_of_week: 1)
  - 1 `active` monthly report (frequency: 'monthly', day_of_month: 1)
  - 1 `paused` daily report
  - 1 `active` with email notifications enabled
- Link to teacher_reports for report_type consistency
- Use dynamic lookups for teacher_id, classroom_id, tenant_id
- Set realistic `next_run_at` timestamps

**Recommended scope:** `dev|demo_data`

---

### 6. social_features.shared_reports -- PRIORITY: LOW

**Schema:** `social_features`
**DDL:** `apps/database/ddl/schemas/social_features/tables/08c-shared_reports.sql`
**Current Seeds:** None in any environment

**Why seeds are needed (limited):**
- The SharedReportsTab component shows reports shared between teachers
- Data is generated when a teacher shares a report with another teacher
- Limited testing value since it requires two teacher profiles

**App-generated?** Yes, created by teacher action through the UI.

**Suggested seed content (if created):**
- 2-3 shared report records:
  - 1 with `permission_level: 'view'`, accessed once
  - 1 with `permission_level: 'download'`, not yet accessed
  - 1 revoked share (`is_revoked: true`)
- Depends on teacher_reports seed existing first (FK on report_id)
- Requires two teacher profiles (shared_by != shared_with)

**Recommended scope:** `dev|demo_data`

---

### 7. educational_content.assignment_students -- PRIORITY: HIGH

**Schema:** `educational_content`
**DDL:** `apps/database/ddl/schemas/educational_content/tables/07-assignment_students.sql`
**Current Seeds:** None in any environment

**Why seeds are needed:**
- The AssignmentDetailPage in the teacher portal shows which students are assigned and their submission status
- Without this data, assignments appear to have no students
- Critical for testing the grading queue, submission tracking, and progress views
- The assignments seed (05-assignments.sql) creates assignments but does NOT create student associations

**App-generated?** Partially. When a teacher creates an assignment and assigns it to a classroom, the backend should create assignment_students records. But the seed-created assignments have no student links.

**Suggested seed content:**
- Link the 9 demo assignments to 3-4 demo students:
  - Mix of statuses: `assigned`, `in_progress`, `submitted`, `graded`
  - Include some with scores and feedback (graded by teacher)
  - Include 1-2 late submissions (`is_late: true`)
  - Include 1 flagged for review
- Use dynamic lookups for student_id (profiles), assignment_id, graded_by
- ON CONFLICT (assignment_id, student_id) DO NOTHING

**Recommended scope:** `dev|demo_exercises`

---

### 8. educational_content.assignment_submissions -- PRIORITY: MEDIUM

**Schema:** `educational_content`
**DDL:** `apps/database/ddl/schemas/educational_content/tables/08-assignment_submissions.sql`
**Current Seeds:** None in any environment

**Why seeds are needed:**
- While `assignment_students` handles the newer grading model, `assignment_submissions` is the legacy submission table
- Some backend code may still reference this table
- Needed for testing the teacher grading workflow

**App-generated?** Yes, created when students submit assignments.

**Suggested seed content:**
- 5-8 submissions linked to demo assignments and students:
  - 2 `submitted` (waiting for grading)
  - 2 `graded` (with scores and feedback)
  - 1 `in_progress`
- Use dynamic lookups for student_id, graded_by

**Recommended scope:** `dev|demo_exercises`

---

### 9-10. communication.conversations + conversation_participants -- PRIORITY: MEDIUM

**Schema:** `communication`
**DDL:** `apps/database/ddl/schemas/communication/tables/03-conversation_participants.sql` (creates both tables)
**Current Seeds:** None in any environment

**Why seeds are needed:**
- The communication system has evolved from simple messages to conversation-based model
- The `conversations` and `conversation_participants` tables support group chats
- The existing messages seed creates messages directly without conversations

**App-generated?** Partially. Conversations are created by the backend when users start new message threads.

**Suggested seed content:**
- 2-3 conversations:
  - 1 `direct` conversation (teacher-student)
  - 1 `classroom` conversation (linked to DEFAULT classroom)
  - 1 `group` conversation (teacher + 2 students)
- Each with corresponding conversation_participants records
- Link to existing message seed data if possible

**Recommended scope:** `dev|demo_data`

---

### 11. progress_tracking.learning_sessions -- PRIORITY: LOW

**Schema:** `progress_tracking`
**DDL:** `apps/database/ddl/schemas/progress_tracking/tables/02-learning_sessions.sql`
**Current Seeds:** None in any environment

**Why seeds are needed (limited):**
- Entirely app-generated (created when students start sessions)
- Teacher portal reads this data for analytics but does not require pre-seeded data
- The analytics page can show "no data" gracefully

**App-generated?** Yes, completely auto-generated on student activity.

**Recommended:** Not needed as a seed.

---

## Priority Summary

### HIGH Priority (should be created)
1. **teacher_contents** -- Teacher content management page has no demo data
2. **student_intervention_alerts** -- Teacher monitoring page has no demo alerts
3. **assignment_students** -- Assignments have no student links for grading queue

### MEDIUM Priority (nice to have)
4. **teacher_alert_configurations** -- Default alert configs for teacher onboarding
5. **scheduled_reports** -- Scheduled reports tab has no demo data
6. **assignment_submissions** -- Legacy submission table for grading
7. **conversations + conversation_participants** -- Group messaging system

### LOW Priority (app-generated or limited value)
8. **teacher_interventions** -- Created by teacher action
9. **shared_reports** -- Created by teacher sharing
10. **learning_sessions** -- Entirely auto-generated

---

## Pipeline Gaps

Beyond missing seeds, the following existing seed files are NOT included in the `init-database.sh` pipeline and therefore never execute:

| File | Should be in pipeline? |
|------|----------------------|
| `progress_tracking/08-teacher-notes.sql` | **YES** -- Teacher notes are teacher-specific demo data |
| `progress_tracking/04-learning-paths.sql` | Maybe -- depends on learning paths feature status |
| `progress_tracking/05-user-learning-paths.sql` | Maybe |
| `progress_tracking/06-user-difficulty-progress.sql` | Maybe |
| `progress_tracking/07-user-current-level.sql` | Maybe |
| `progress_tracking/09-skill-assessments.sql` | Maybe |
| `progress_tracking/10-mastery-tracking.sql` | Maybe |
| `progress_tracking/11-engagement-metrics.sql` | Maybe |
| `progress_tracking/12-progress-snapshots.sql` | Maybe |
| `progress_tracking/13-module-completion-tracking.sql` | Maybe |
| `progress_tracking/14-scheduled-missions.sql` | Maybe |

**Recommendation:** At minimum, `08-teacher-notes.sql` should be added to the pipeline as `progress_tracking/08-teacher-notes.sql|dev|demo_data` in FASE 9 after `03-manual-reviews.sql`.
