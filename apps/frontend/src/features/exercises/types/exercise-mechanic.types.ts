/**
 * Exercise Mechanic Types
 *
 * Standard contract that ALL mechanic components must implement.
 * Extends existing types from mechanicsTypes.ts.
 *
 * @version 1.0.0
 * @since Phase 1 - Exercise System Restructuring
 */

import type { ExerciseProgressUpdate, GenericProgressData } from '@shared/components/mechanics/mechanicsTypes';
import type { ComodinType } from './exercise.types';

// Re-export for convenience
export type { ExerciseProgressUpdate, GenericProgressData };

/**
 * Comodines context passed to mechanic components.
 * Allows mechanics to react to active power-up effects.
 */
export interface ExerciseComodinesContext {
  /** Number of hints revealed by comodín (0-3) */
  hintsRevealed: number;
  /** Whether "visión lectora" is active (highlights key words) */
  visionActive: boolean;
  /** Whether the student has a second chance on wrong answers */
  hasSecondChance: boolean;
  /** Extra time in seconds granted by comodín */
  timeExtension: number;
  /** Whether score multiplier is active */
  multiplierActive: boolean;
}

/**
 * Actions that a mechanic component exposes to the sidebar/parent.
 * Used via actionsRef to allow external buttons to trigger mechanic behavior.
 */
export interface ExerciseMechanicActions {
  handleReset?: () => void;
  handleCheck?: () => void;
  specificActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'blue' | 'gold';
  }>;
}

/**
 * Standard props that EVERY mechanic component receives.
 *
 * TData = the adapted exercise data type (e.g., CrucigramaData)
 * TAnswers = the user answers shape (defaults to Record<string, unknown>)
 *
 * The compat wrapper maps these to the legacy prop signatures
 * so existing mechanics work without modification.
 */
export interface ExerciseMechanicProps<
  TData = Record<string, unknown>,
  TAnswers = Record<string, unknown>,
> {
  /** Adapted exercise data (output of the adapter function) */
  exercise: TData;
  /** Exercise UUID */
  exerciseId: string;
  /** Called when the mechanic considers itself "complete" (before submission) */
  onComplete?: () => void;
  /**
   * Progress update callback.
   * Mechanics should call this whenever answers or progress change.
   * Supports both the new GenericProgressData format and legacy Partial<ExerciseProgressUpdate>.
   */
  onProgressUpdate?: (data: GenericProgressData<TAnswers> | Partial<ExerciseProgressUpdate>) => void;
  /** Ref for exposing mechanic actions to parent (sidebar buttons) */
  actionsRef?: React.MutableRefObject<ExerciseMechanicActions>;
  /** Initial data for recovery (auto-save) */
  initialData?: TAnswers | null;
  /** Active comodines context — mechanics can react to these effects */
  comodinesContext?: ExerciseComodinesContext;
}

/**
 * Registry entry metadata for a mechanic.
 */
export interface ExerciseMechanicMeta {
  /** Human-readable name shown in UI */
  displayName: string;
  /** Module number (1-5) or 0 for auxiliar */
  module: number;
  /** Pedagogical category */
  category: 'literal' | 'inferencial' | 'critica' | 'digital' | 'creativa' | 'auxiliar';
  /** Optional Lucide icon name */
  icon?: string;
}

/**
 * A single entry in the Exercise Registry.
 */
export interface ExerciseRegistryEntry {
  /** Lazy loader for the mechanic component */
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  /** Adapter function that transforms raw API data to the mechanic's expected format */
  adapter: (exercise: any) => any;
  /** Metadata about the mechanic */
  meta: ExerciseMechanicMeta;
  /** Which comodin types this mechanic supports (null = all) */
  supportedComodines?: ComodinType[] | null;
}
