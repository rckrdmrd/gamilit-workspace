# MATRIX-D1: Teacher Portal Seed Coverage

**Agent:** D (Seeds & Data Completeness)
**Date:** 2026-02-20
**Scope:** All teacher-related database tables and their seed coverage across dev/staging/prod

---

## Seed Coverage Matrix

| # | Schema | Table | DDL File | In Pipeline? | Has Dev Seed | Has Staging Seed | Has Prod Seed | Seed File(s) | Coverage Status |
|---|--------|-------|----------|-------------|-------------|-----------------|--------------|--------------|-----------------|
| 1 | `educational_content` | `teacher_contents` | `tables/25-teacher_content.sql` | NO | NO | NO | NO | -- | MISSING |
| 2 | `progress_tracking` | `student_intervention_alerts` | `tables/19-student_intervention_alerts.sql` | NO | NO | NO | NO | -- | MISSING |
| 3 | `progress_tracking` | `teacher_alert_configurations` | `tables/20-teacher_alert_configurations.sql` | NO | NO | NO | NO | -- | MISSING |
| 4 | `progress_tracking` | `teacher_interventions` | `tables/17-teacher_interventions.sql` | NO | NO | NO | NO | -- | MISSING |
| 5 | `social_features` | `teacher_reports` | `tables/08-teacher_reports.sql` | YES (`all\|core`) | YES | YES | YES | `social_features/05-teacher-reports.sql` | COVERED (all envs) |
| 6 | `social_features` | `scheduled_reports` | `tables/08b-scheduled_reports.sql` | NO | NO | NO | NO | -- | MISSING |
| 7 | `social_features` | `shared_reports` | `tables/08c-shared_reports.sql` | NO | NO | NO | NO | -- | MISSING |
| 8 | `progress_tracking` | `teacher_notes` | `tables/teacher_notes.sql` | NO | YES (not in pipeline) | NO | NO | `progress_tracking/08-teacher-notes.sql` (dev only, orphaned) | PARTIAL (dev only, NOT in pipeline) |
| 9 | `progress_tracking` | `manual_reviews` | `tables/06-manual_reviews.sql` | YES (`dev\|demo_exercises`) | YES | NO | NO | `progress_tracking/03-manual-reviews.sql` | PARTIAL (dev only) |
| 10 | `social_features` | `classrooms` | `tables/03-classrooms.sql` | YES (`all\|core`) | YES | YES | YES | `social_features/02-classrooms.sql` | COVERED (all envs) |
| 11 | `social_features` | `classroom_members` | `tables/04-classroom_members.sql` | YES (`all\|core`) | YES | YES | YES | `social_features/03-classroom-members.sql` | COVERED (all envs) |
| 12 | `social_features` | `teacher_classrooms` | `tables/teacher_classrooms.sql` | YES (bundled with classrooms) | YES | YES | YES | `social_features/02-classrooms.sql` (includes teacher_classrooms sync) | COVERED (all envs) |
| 13 | `educational_content` | `assignments` | `tables/05-assignments.sql` | YES (`all\|core`) | YES | YES | YES | `educational_content/05-assignments.sql` | COVERED (all envs) |
| 14 | `educational_content` | `assignment_students` | `tables/07-assignment_students.sql` | NO | NO | NO | NO | -- | MISSING |
| 15 | `educational_content` | `assignment_submissions` | `tables/08-assignment_submissions.sql` | NO | NO | NO | NO | -- | MISSING |
| 16 | `communication` | `messages` | `tables/01-messages.sql` | YES (`dev\|demo_data`) | YES | YES | YES | `communication/01-system-messages.sql` | COVERED (dev pipeline; staging/prod have files but not all in pipeline) |
| 17 | `communication` | `message_participants` | `tables/02-message_participants.sql` | YES (`dev\|demo_data`) | YES | YES | YES | `communication/02-message_participants.sql` | COVERED (dev pipeline) |
| 18 | `communication` | `conversations` | `tables/03-conversation_participants.sql` (includes conversations) | NO | NO | NO | NO | -- | MISSING |
| 19 | `communication` | `conversation_participants` | `tables/03-conversation_participants.sql` | NO | NO | NO | NO | -- | MISSING |
| 20 | `progress_tracking` | `exercise_attempts` | `tables/03-exercise_attempts.sql` | YES (`dev\|demo_exercises`) | YES | NO | NO | `progress_tracking/02-exercise-attempts.sql` | PARTIAL (dev only) |
| 21 | `progress_tracking` | `exercise_submissions` | `tables/04-exercise_submissions.sql` | YES (bundled with exercise-attempts) | YES (bundled) | NO | NO | `progress_tracking/02-exercise-attempts.sql` (covers both tables) | PARTIAL (dev only) |
| 22 | `progress_tracking` | `module_progress` | `tables/01-module_progress.sql` | YES (`all\|core`) | YES | YES | NO | `progress_tracking/01-module_progress.sql` | COVERED (dev+staging) |
| 23 | `educational_content` | `classroom_modules` | `tables/_cross_schema/23-classroom_modules.sql` | YES (`prod\|core`) | NO | NO | YES | `educational_content/14-classroom_modules.sql` | PARTIAL (prod only) |
| 24 | `educational_content` | `teacher_content` (view) | `tables/25-teacher_content.sql` (published_teacher_contents) | N/A (view) | N/A | N/A | N/A | N/A | N/A (derived) |
| 25 | `progress_tracking` | `learning_sessions` | `tables/02-learning_sessions.sql` | NO | NO | NO | NO | -- | MISSING (app-generated) |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total teacher-related tables identified | 23 (+2 views) |
| Tables with FULL seed coverage (all envs) | 7 |
| Tables with PARTIAL seed coverage | 6 |
| Tables with NO seed coverage | 10 |
| Seeds in pipeline | 10 of 16 existing seed files |
| Orphaned seeds (exist but NOT in pipeline) | 6 files |

---

## Pipeline Analysis

### Seeds IN the pipeline (init-database.sh)
1. `social_features/02-classrooms.sql` -- includes teacher_classrooms (all|core)
2. `social_features/03-classroom-members.sql` (all|core)
3. `social_features/05-teacher-reports.sql` (all|core)
4. `educational_content/05-assignments.sql` (all|core)
5. `educational_content/14-classroom_modules.sql` (prod|core)
6. `progress_tracking/01-module_progress.sql` (all|core)
7. `progress_tracking/02-exercise-attempts.sql` (dev|demo_exercises) -- includes exercise_submissions
8. `progress_tracking/03-manual-reviews.sql` (dev|demo_exercises)
9. `communication/01-system-messages.sql` (dev|demo_data)
10. `communication/02-message_participants.sql` (dev|demo_data)

### Seeds that EXIST but are NOT in pipeline (orphaned)
1. `dev/progress_tracking/04-learning-paths.sql`
2. `dev/progress_tracking/05-user-learning-paths.sql`
3. `dev/progress_tracking/06-user-difficulty-progress.sql`
4. `dev/progress_tracking/07-user-current-level.sql`
5. **`dev/progress_tracking/08-teacher-notes.sql`** -- teacher-specific, should be in pipeline
6. `dev/progress_tracking/09-skill-assessments.sql`
7. `dev/progress_tracking/10-mastery-tracking.sql`
8. `dev/progress_tracking/11-engagement-metrics.sql`
9. `dev/progress_tracking/12-progress-snapshots.sql`
10. `dev/progress_tracking/13-module-completion-tracking.sql`
11. `dev/progress_tracking/14-scheduled-missions.sql`

---

## Notes

- The `assignments` table uses `teacher_id` FK to `auth_management.profiles(id)` -- staging seed has quality issues (see FINDINGS-D3)
- `teacher_classrooms` is seeded as part of the `02-classrooms.sql` seed (bundled), not as a standalone seed
- `classroom_modules` seed only exists in prod; dev and staging lack this seed
- Progress tracking seeds (exercise_attempts, exercise_submissions, manual_reviews) are dev-only (`demo_exercises` category)
- Communication seeds are dev-only (`demo_data` category)
- Multiple progress_tracking seed files exist in dev but are not loaded by the pipeline
