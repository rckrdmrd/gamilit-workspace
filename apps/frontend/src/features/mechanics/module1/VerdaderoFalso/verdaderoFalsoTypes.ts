/**
 * Types for Verdadero/Falso (True/False) Exercise
 * Module 1 - Exercise 2
 * ⚠️ FE-059: correctAnswer is NEVER sent by backend (sanitized for security)
 */
import type { ExerciseProgressUpdate } from '@shared/components/mechanics/mechanicsTypes';

export interface VerdaderoFalsoStatement {
  id: string;
  statement: string;
  /**
   * @deprecated Backend sanitizes this field - never present. Validation is done server-side.
   */
  correctAnswer?: never;
  explanation?: string;
  userAnswer?: boolean | null;
}

export interface VerdaderoFalsoData {
  id: string;
  title: string;
  description: string;
  difficulty: 'facil' | 'medio' | 'dificil';
  estimatedTime: number;
  topic: string;
  hints: Array<{
    id: string;
    text: string;
    cost: number;
  }>;
  statements: VerdaderoFalsoStatement[];
  contextText?: string;
}

export interface VerdaderoFalsoProgressData {
  progress: ExerciseProgressUpdate;
  answers: { statements: Record<string, boolean> };
}

export interface VerdaderoFalsoExerciseProps {
  exercise: VerdaderoFalsoData;
  onComplete?: () => void;
  onProgressUpdate?: (data: VerdaderoFalsoProgressData) => void;
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
  comodinesContext?: import('@/features/exercises/types/exercise-mechanic.types').ExerciseComodinesContext;
}
