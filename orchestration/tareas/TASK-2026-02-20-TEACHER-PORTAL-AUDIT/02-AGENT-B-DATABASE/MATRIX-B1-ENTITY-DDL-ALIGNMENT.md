# MATRIX-B1: Entity-DDL Alignment

**Agent:** B (Database Coherence)
**Date:** 2026-02-20
**Scope:** Teacher portal entities (6 core + 1 cross-module) + cross-module entities used by teacher services

---

## 1. Core Teacher Entities (6 files, 8 classes)

| # | Entity Class | Entity File | DDL Table | DDL File | Schema | Columns Match | Relations Match | Status |
|---|-------------|-------------|-----------|----------|--------|---------------|-----------------|--------|
| 1 | `StudentInterventionAlert` | `teacher/entities/student-intervention-alert.entity.ts` | `student_intervention_alerts` | `progress_tracking/tables/19-student_intervention_alerts.sql` | `progress_tracking` | YES (17/17) | YES (3 ManyToOne) | OK |
| 2 | `Message` | `teacher/entities/message.entity.ts` | `messages` | `communication/tables/01-messages.sql` | `communication` | YES (28/28) | PARTIAL (self-ref only) | WARN |
| 3 | `MessageParticipant` | `teacher/entities/message.entity.ts` | `message_participants` | `communication/tables/02-message_participants.sql` | `communication` | YES (6/6) | YES (1 ManyToOne) | OK |
| 4 | `TeacherContent` | `teacher/entities/teacher-content.entity.ts` | `teacher_contents` | `educational_content/tables/25-teacher_content.sql` | `educational_content` | YES (39/39) | NO ManyToOne declared | WARN |
| 5 | `TeacherReport` | `teacher/entities/teacher-report.entity.ts` | `teacher_reports` | `social_features/tables/08-teacher_reports.sql` | `social_features` | YES (13/13) | YES (3 ManyToOne) | OK |
| 6 | `ScheduledReport` | `teacher/entities/scheduled-report.entity.ts` | `scheduled_reports` | `social_features/tables/08b-scheduled_reports.sql` | `social_features` | PARTIAL (see B2) | NO Relations | WARN |
| 7 | `SharedReport` | `teacher/entities/shared-report.entity.ts` | `shared_reports` | `social_features/tables/08c-shared_reports.sql` | `social_features` | PARTIAL (see B2) | PARTIAL (1 of 4 FKs) | WARN |
| 8 | `TeacherAlertConfiguration` | `progress/entities/teacher-alert-configuration.entity.ts` | `teacher_alert_configurations` | `progress_tracking/tables/20-teacher_alert_configurations.sql` | `progress_tracking` | YES (12/12) | NO ManyToOne declared | WARN |

## 2. Cross-Module Entities Used by Teacher Services

| Entity Class | Module | Datasource Registered | Used By Services |
|-------------|--------|----------------------|------------------|
| `Profile` | auth | `auth` | StudentRiskAlertService, AlertConfigService, TeacherContentService, StudentProgressService, BonusCoinsService, ExerciseResponsesService, ReportsService, AnalyticsService, TeacherDashboardService, ManualReviewService, TeacherMessagesService, TeacherClassroomsCrudService, StudentBlockingService |
| `User` | auth | `auth` | StudentProgressService, TeacherClassroomsCrudService |
| `Classroom` | social | `social` | StudentRiskAlertService, AlertConfigService, TeacherClassroomsCrudService, AnalyticsService, ReportsService, StudentProgressService, BonusCoinsService, TeacherDashboardService |
| `ClassroomMember` | social | `social` | StudentRiskAlertService, TeacherDashboardService, AnalyticsService, ReportsService, StudentProgressService, BonusCoinsService, TeacherClassroomsCrudService, StudentBlockingService, TeacherAssignmentsService |
| `TeacherClassroom` | social | `social` | TeacherClassroomsCrudService, StudentBlockingService |
| `AssignmentClassroom` | social | `social` | TeacherAssignmentsService |
| `ExerciseSubmission` | progress | `progress` | GradingService, AnalyticsService, ReportsService, StudentProgressService, TeacherDashboardService, TeacherClassroomsCrudService |
| `ExerciseAttempt` | progress | `progress` | ExerciseResponsesService |
| `ModuleProgress` | progress | `progress` | StudentProgressService, TeacherDashboardService, TeacherClassroomsCrudService |
| `ManualReview` | progress | `progress` | ManualReviewService |
| `MasteryTracking` | progress | `progress` | AnalyticsService |
| `SkillAssessment` | progress | `progress` | AnalyticsService |
| `TeacherAlertConfiguration` | progress | `progress` | AlertConfigService |
| `Module (Educational)` | educational | `educational` | StudentProgressService, TeacherClassroomsCrudService |
| `Exercise` | educational | `educational` | StudentProgressService, ManualReviewService, TeacherClassroomsCrudService |
| `ExerciseTypeRubric` | educational | `educational` | ManualReviewService |
| `Assignment` | assignments | `educational` | AnalyticsService, TeacherAssignmentsService |
| `AssignmentSubmission` | assignments | `educational` | AnalyticsService, TeacherAssignmentsService |
| `AssignmentExercise` | assignments | `educational` | TeacherAssignmentsService |
| `UserStats` | gamification | `gamification` | BonusCoinsService, AnalyticsService, StudentProgressService, TeacherClassroomsCrudService |
| `Achievement` | gamification | `gamification` | AnalyticsService |
| `UserAchievement` | gamification | `gamification` | AnalyticsService |

## 3. Summary

- **Total core entities audited:** 8 (across 7 files)
- **Total cross-module entities used:** 22
- **Full match (columns + relations):** 3 of 8 (StudentInterventionAlert, MessageParticipant, TeacherReport)
- **Partial match (columns OK, relations incomplete):** 3 of 8 (Message, TeacherContent, TeacherAlertConfiguration)
- **Column mismatches found:** 2 of 8 (ScheduledReport, SharedReport) -- see FINDINGS-B2
- **Datasource registrations:** All correct in teacher.module.ts

---

*Generated by Agent B - Database Coherence Audit*
