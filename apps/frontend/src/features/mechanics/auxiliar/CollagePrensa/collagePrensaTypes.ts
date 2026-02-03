import { BaseExercise, ExerciseProgressUpdate } from '@shared/components/mechanics/mechanicsTypes';

export interface CollageElement {
  id: string;
  type: 'image' | 'text' | 'headline';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface CollagePrensaData extends BaseExercise {
  newspaperTitle: string;
  newspaperDate: string;
  topic: string; // Topic for the collage (e.g., "Marie Curie")
  minElements?: number; // Minimum elements required
  suggestedHeadlines?: string[];
  suggestedTexts?: string[];
}

export interface CollagePrensaProgressData {
  progress: ExerciseProgressUpdate;
  answers: { elements: CollageElement[] };
}

export interface CollagePrensaExerciseProps {
  exercise: CollagePrensaData;
  onComplete?: () => void;
  onProgressUpdate?: (data: CollagePrensaProgressData) => void;
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}
