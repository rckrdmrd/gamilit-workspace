/**
 * Assignment Enums
 *
 * Extracted from assignment.entity.ts to avoid architecture violations
 * (DTOs should not import from entity files).
 */

export enum AssignmentType {
  PRACTICE = 'practice',
  QUIZ = 'quiz',
  EXAM = 'exam',
  HOMEWORK = 'homework',
}
