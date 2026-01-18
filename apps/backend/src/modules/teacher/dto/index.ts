/**
 * Teacher Module DTOs
 */

export * from './create-exercise.dto';
export * from './grading.dto';
export * from './grades.dto';
export * from './analytics.dto';
export * from './teacher-notes.dto';
export * from './reports.dto';
export * from './classroom.dto';
export * from './classroom-response.dto';
export * from './classroom-progress.dto';
export * from './teacher-messages.dto';
export * from './teacher-content.dto';
export * from './grant-bonus.dto';
export * from './exercise-responses.dto';
// Note: GetStudentProgressQueryDto may exist in analytics.dto
// Export response DTOs from student-progress.dto for frontend alignment (TASK-2026-01-18-005)
export {
  StudentProgressResponseDto,
  StudentStatsResponseDto,
  ModuleProgressDto,
} from './student-progress.dto';
