/**
 * Mechanics Components
 * Barrel export for exercise mechanics components
 */

export { FeedbackModal } from './FeedbackModal';
export type { FeedbackModalProps } from './FeedbackModal';

export { ScoreDisplay } from './ScoreDisplay';
export type { ScoreDisplayProps } from './ScoreDisplay';

export { TimerWidget } from './TimerWidget';
export type { TimerWidgetProps } from './TimerWidget';

export { ProgressTracker } from './ProgressTracker';
export type { ProgressTrackerProps } from './ProgressTracker';

export { HintSystem } from './HintSystem';
export type { HintSystemProps } from './HintSystem';

export { ExerciseGradientHeader } from './ExerciseGradientHeader';

export { default as ExerciseContentRenderer } from './ExerciseContentRenderer';

// NOTE: SubmitExerciseButton removed (2026-01-27) - ghost export, file never existed
// Functionality covered by DetectiveButton component

export * from './mechanicsTypes';
