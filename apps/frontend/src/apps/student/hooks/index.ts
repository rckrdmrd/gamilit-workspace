// Custom hooks barrel export
export { useSwipeGesture, useSwipeableElement } from './useSwipeGesture';
export {
  useResponsiveLayout,
  useMediaQuery,
  useKeyboardShortcuts,
  type Breakpoint,
  type Orientation,
} from './useResponsiveLayout';
export {
  useDashboardData,
  dashboardKeys,
  type MLCoinsData,
  type RankData,
  type AchievementData,
  type ProgressData,
} from './useDashboardData';
export { useExerciseState } from './useExerciseState';
export type { Exercise, ExerciseAttempt, ExerciseState } from './useExerciseState';
export { useExerciseAutoSave } from './useExerciseAutoSave';
export type {
  UseExerciseAutoSaveOptions,
  AutoSaveState,
  UseExerciseAutoSaveReturn,
} from './useExerciseAutoSave';
export { useUserClassroom } from './useUserClassroom';
export { useUserModules, userModulesKeys, type UserModuleData } from './useUserModules';
export { useStudentPageSetup } from './useStudentPageSetup';
