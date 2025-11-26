/**
 * Exercises Feature Index
 *
 * Main entry point for the exercises feature
 * Exports all components, hooks, and types
 */

// Components - explicit exports to avoid duplicates
export {
  MultipleChoiceActivity,
  TrueFalseActivity,
  FillBlankActivity,
  DragDropActivity,
  OrderingActivity,
  MatchingActivity,
  ExerciseHeader,
  ExerciseFeedback,
} from './components';

// Hooks - explicit exports to avoid duplicates
export { useExerciseSubmission, useExerciseTimer, useExerciseRewards } from './hooks';

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
