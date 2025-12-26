import { BaseExercise } from '@shared/components/mechanics/mechanicsTypes';

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
}

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
  canvasAspectRatio: string;
  minCanvasHeight: number;
  defaultHeadlineText: string;
  defaultBodyText: string;
  defaultElementWidth: number;
  defaultElementHeight: number;
}

export interface ExerciseProgressUpdate {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
}

// Exercise State for auto-save
export interface CollagePrensaState {
  elements: CollageElement[];
  uploadedFiles: UploadedFile[];
  score: number;
  timeSpent: number;
  hintsUsed: number;
}

// Exercise Actions Interface for Parent Control
export interface CollagePrensaActions {
  getState: () => CollagePrensaState;
  reset: () => void;
  validate: () => Promise<void>;
  addElement?: (element: CollageElement) => void;
  removeElement?: (elementId: string) => void;
}

// Standardized Exercise Props Interface
export interface CollagePrensaExerciseProps {
  moduleId: number;
  lessonId: number;
  exerciseId: string;
  userId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: ExerciseProgressUpdate) => void;
  initialData?: Partial<CollagePrensaState>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<CollagePrensaActions | undefined>;
}
