/**
 * Exercises Feature Index
 *
 * Main entry point for the exercises feature
 * Exports all components, hooks, types, registry, and context
 */

// Components - Activity components removed (superseded by features/mechanics/)
export {
  ExerciseHeader,
  ExerciseFeedback,
} from './components';

// New components (Exercise System Restructuring)
export { ExerciseLayout } from './components/ExerciseLayout';
export { ExerciseLoader } from './components/ExerciseLoader';
export { ExerciseSidebar } from './components/ExerciseSidebar';
export { ConsumablesPanel } from './components/ConsumablesPanel';
export { ActionsPanel } from './components/ActionsPanel';
export { ExerciseLoadingSkeleton } from './components/ExerciseLoadingSkeleton';
export { ExerciseErrorState } from './components/ExerciseErrorState';
export { ExerciseCompletedState } from './components/ExerciseCompletedState';
export { MechanicCompatWrapper } from './components/MechanicCompatWrapper';

// Context
export { ExerciseProvider, useExerciseContext } from './context/ExerciseContext';

// Hooks - explicit exports to avoid duplicates
// NOTE: useExerciseSubmission moved to @/features/mechanics/shared/hooks/useExerciseSubmission
export { useExerciseTimer, useExerciseRewards } from './hooks';
export { useExerciseData } from './hooks/useExerciseData';
export { useExerciseComodines } from './hooks/useExerciseComodines';
export { useExerciseProgress } from './hooks/useExerciseProgress';

// Registry
export {
  registerExercise,
  getExerciseEntry,
  getAllRegisteredTypes,
  getAllRegisteredEntries,
  getExerciseMeta,
  isExerciseRegistered,
} from './registry/exercise-registry';

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

export type {
  ExerciseComodinesContext,
  ExerciseMechanicActions,
  ExerciseMechanicProps,
  ExerciseMechanicMeta,
  ExerciseRegistryEntry,
} from './types/exercise-mechanic.types';
