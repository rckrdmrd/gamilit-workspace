/**
 * ETL Specific Loaders - Barrel Export
 *
 * @description Exports all specific loader implementations
 * @module ETL/Loaders
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

// Fact Loaders
export {
  FactExerciseCompletionLoader,
  ExerciseCompletionFact,
} from './fact-exercise-completion.loader';

export {
  FactDailyProgressLoader,
  DailyProgressFact,
} from './fact-daily-progress.loader';

export {
  FactGamificationEventLoader,
  GamificationEventFact,
  GamificationFactEventType,
} from './fact-gamification-event.loader';

// Dimension Loaders
export {
  DimStudentLoader,
  StudentDimension,
} from './dim-student.loader';
