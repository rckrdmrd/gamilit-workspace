/**
 * Types for Causa-Efecto (Cause-Effect) Drag & Drop Exercise
 * Module 2 - Understanding causal relationships
 */

import {
  BaseExercise,
  OnProgressUpdateCallback,
} from '@shared/components/mechanics/mechanicsTypes';

/**
 * A cause (left column, fixed)
 */
export interface Cause {
  id: string;
  text: string;
}

/**
 * A consequence (right column, draggable)
 * ⚠️ FE-059: correctCauseIds is NEVER sent by backend (sanitized for security)
 */
export interface Consequence {
  id: string;
  text: string;
  /**
   * @deprecated Backend sanitizes this field - never present. Validation is done server-side.
   */
  correctCauseIds?: never;
}

/**
 * Configuration for the exercise
 */
export interface CausaEfectoConfig {
  allowMultiple: boolean; // Allow multiple consequences per cause
  showFeedback: boolean; // Show feedback after validation
  dragAndDrop: boolean; // Enable drag and drop
}

/**
 * Content structure for the exercise
 */
export interface CausaEfectoContent {
  causes: Cause[];
  consequences: Consequence[];
}

/**
 * Complete exercise data structure
 */
export interface CausaEfectoData extends BaseExercise {
  config: CausaEfectoConfig;
  content: CausaEfectoContent;
}

/**
 * Answers structure for CausaEfecto exercise
 */
export interface CausaEfectoAnswers {
  causes: CauseMatches;
}

/**
 * Props for the main exercise component
 */
export interface CausaEfectoExerciseProps {
  exercise: CausaEfectoData;
  onComplete?: (score: number, timeSpent: number) => void;
  onProgressUpdate?: OnProgressUpdateCallback<CausaEfectoAnswers>;
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}

/**
 * User's matches (cause ID -> array of consequence IDs)
 */
export type CauseMatches = Record<string, string[]>;
