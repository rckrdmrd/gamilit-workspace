import { BaseExercise, ExerciseProgressUpdate } from '@shared/components/mechanics/mechanicsTypes';

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
}

/**
 * ⚠️ FE-059: correctOrder is NEVER sent by backend (sanitized for security)
 */
export interface TimelineData extends BaseExercise {
  events: TimelineEvent[];
  /**
   * @deprecated Backend sanitizes this field - never present. Validation is done server-side.
   */
  correctOrder?: never;
}

export interface DraggedEvent extends TimelineEvent {
  position: number;
}

export interface TimelineProgressData {
  progress: ExerciseProgressUpdate;
  answers: { events: string[] };
}

export interface TimelineExerciseProps {
  exercise: TimelineData;
  onComplete?: () => void;
  onProgressUpdate?: (data: TimelineProgressData) => void;
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
    specificActions?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'blue' | 'gold';
    }>;
  }>;
  comodinesContext?: import('@/features/exercises/types/exercise-mechanic.types').ExerciseComodinesContext;
}
