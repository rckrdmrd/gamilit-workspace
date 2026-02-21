/**
 * Teacher Services Index
 */

export * from './student-blocking.service';
export * from './teacher-dashboard.service';
export * from './student-progress.service';
export * from './grading.service';
export * from './analytics.service';
export * from './student-risk-alert.service';
export * from './reports.service';
// TASK-2026-02-20-B5-1: Removed MLPredictorService (placeholder heuristic, never injected/used)
export * from './teacher-classrooms-crud.service';
export * from './intervention-alerts.service';
export * from './teacher-messages.service';
export * from './teacher-content.service';
export * from './bonus-coins.service';
export * from './exercise-responses.service';
export * from './storage.service';
export * from './teacher-reports.service';
export * from './manual-review.service';
// TASK-2026-01-18-015 Sprint 5: Scheduled and shared reports
export * from './scheduled-reports.service';
export * from './shared-reports.service';
// US-PM-007: Alert configuration service
export * from './alert-config.service';
// Teacher Assignments service
export * from './teacher-assignments.service';
// TASK-2026-01-18-009: Removed rubric-scoring.service.ts (orphan code - never injected/used)
// Rubrics now come from educational_content.exercise_type_rubrics via ManualReviewService
