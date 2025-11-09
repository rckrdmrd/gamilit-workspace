/**
 * Mechanics Types
 * Shared types for exercise mechanics and feedback
 *
 * TODO: This is a stub file created to unblock TypeScript compilation
 * Full implementation needed in Phase 2
 */

export interface ExerciseFeedback {
  isCorrect: boolean;
  message: string;
  explanation?: string;
  points?: number;
}

export interface ExerciseAttempt {
  attemptNumber: number;
  isCorrect: boolean;
  timeSpent: number;
  feedback: ExerciseFeedback;
}

export interface ExerciseResult {
  exerciseId: string;
  score: number;
  maxScore: number;
  attempts: ExerciseAttempt[];
  completedAt?: string;
}

export interface MechanicsProps {
  exerciseId: string;
  moduleId: string;
  onComplete?: (result: ExerciseResult) => void;
  onProgress?: (progress: number) => void;
}

export interface MechanicsState {
  currentAttempt: number;
  maxAttempts: number;
  timeStarted: number;
  hintsUsed: number;
  maxHints: number;
}

// Difficulty levels in Spanish (GAMILIT standard)
export type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'experto';

// English aliases for compatibility
export type DifficultyLevelEN = 'easy' | 'medium' | 'hard' | 'expert';

export type ExerciseType =
  | 'multiple-choice'
  | 'fill-blanks'
  | 'matching'
  | 'ordering'
  | 'crossword'
  | 'timeline'
  | 'collage'
  | 'classification';

// Base exercise type
export interface BaseExercise {
  id: string;
  type: ExerciseType;
  title: string;
  instructions?: string;
  maxAttempts?: number;
  timeLimit?: number;
  difficulty?: DifficultyLevel;
}

// Feedback data type (alias)
export type FeedbackData = ExerciseFeedback;

// Utility functions (stubs)
export const calculateScore = (correct: number, total: number): number => {
  return Math.round((correct / total) * 100);
};

export const saveProgress = async (
  exerciseId: string,
  progress: number
): Promise<void> => {
  // TODO: Implement progress saving
  console.log('Saving progress:', exerciseId, progress);
};
