/**
 * Exercise Types
 *
 * ISSUE: #4 (P0) - Exercise Interfaces
 * FECHA: 2025-11-04
 * SPRINT: Sprint 1
 *
 * Type definitions for exercise components and interactions
 */

/**
 * Exercise difficulty levels
 */
export type ExerciseDifficulty = 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';

/**
 * Exercise types/mechanics
 */
export type ExerciseType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'drag_drop'
  | 'ordering'
  | 'matching';

/**
 * Exercise submission status
 */
export type SubmissionStatus = 'pending' | 'correct' | 'incorrect' | 'partial';

/**
 * Base exercise interface
 */
export interface Exercise {
  id: string;
  type: ExerciseType;
  title: string;
  description?: string;
  instructions: string;
  difficulty: ExerciseDifficulty;
  xp_reward: number;
  ml_coins_reward: number;
  time_limit_seconds?: number;
  max_attempts?: number;
  hints: ExerciseHint[];
  content: ExerciseContent;
}

/**
 * Exercise hint with cost
 */
export interface ExerciseHint {
  id: string;
  text: string;
  ml_coins_cost: number;
  order: number;
}

/**
 * Exercise content (varies by type)
 */
export interface ExerciseContent {
  question: string;
  options?: MultipleChoiceOption[]; // For multiple_choice
  correct_answer?: string | string[]; // For true_false, fill_blank
  explanation?: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'audio';
}

/**
 * Multiple choice option
 */
export interface MultipleChoiceOption {
  id: string;
  label: string; // A, B, C, D
  text: string;
  is_correct: boolean;
}

/**
 * Exercise submission request
 */
export interface ExerciseSubmission {
  exercise_id: string;
  user_id: string;
  answer: string | string[];
  time_spent_seconds: number;
  hints_used: string[];
  attempt_number: number;
}

/**
 * Exercise submission response
 */
export interface ExerciseSubmissionResult {
  id: string;
  exercise_id: string;
  user_id: string;
  status: SubmissionStatus;
  is_correct: boolean;
  score_percentage: number;
  xp_earned: number;
  ml_coins_earned: number;
  ml_coins_spent: number;
  feedback: string;
  correct_answer?: string | string[];
  explanation?: string;
  attempt_number: number;
  time_spent_seconds: number;
  submitted_at: Date;
}

/**
 * Exercise attempt history
 */
export interface ExerciseAttempt {
  id: string;
  exercise_id: string;
  attempt_number: number;
  answer: string | string[];
  is_correct: boolean;
  score_percentage: number;
  xp_earned: number;
  ml_coins_earned: number;
  time_spent_seconds: number;
  submitted_at: Date;
}

/**
 * Exercise timer state
 */
export interface ExerciseTimer {
  startTime: number;
  elapsedSeconds: number;
  isRunning: boolean;
  timeLimit?: number;
}

/**
 * Exercise interaction state
 */
export interface ExerciseState {
  currentAnswer: string | string[] | null;
  selectedOptions: string[];
  hintsUsed: string[];
  attemptNumber: number;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  result: ExerciseSubmissionResult | null;
  timer: ExerciseTimer;
  mlCoinsSpent: number;
}

/**
 * Exercise component props
 */
export interface ExerciseComponentProps {
  exercise: Exercise;
  userId: string;
  onComplete: (result: ExerciseSubmissionResult) => void;
  onCancel?: () => void;
  showTimer?: boolean;
  allowHints?: boolean;
}

/**
 * Exercise feedback type
 */
export interface ExerciseFeedback {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  xpEarned?: number;
  mlCoinsEarned?: number;
  showConfetti?: boolean;
}
