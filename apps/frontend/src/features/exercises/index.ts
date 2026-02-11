/**
 * Exercises Feature Index
 *
 * Main entry point for the exercises feature
 * Exports all components, hooks, and types
 */

// Components - Activity components removed (superseded by features/mechanics/)
export {
  ExerciseHeader,
  ExerciseFeedback,
} from './components';

// Hooks - explicit exports to avoid duplicates
// NOTE: useExerciseSubmission moved to @/features/mechanics/shared/hooks/useExerciseSubmission
export { useExerciseTimer, useExerciseRewards } from './hooks';

// Types - explicit exports to avoid duplicates
export type {
  Exercise,
  ExerciseContent,
  ExerciseHint,
  ExerciseSubmission,
  ExerciseSubmissionResult,
  ExerciseComponentProps,
  ExerciseTimer,
  MultipleChoiceOption,
} from './types';
