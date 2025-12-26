import { BaseExercise } from '@shared/components/mechanics/mechanicsTypes';

export interface AnimatedText {
  id: string;
  text: string;
  animation: string;
  duration: number;
  color: string;
  fontSize: number;
}

export interface AnimationConfig {
  id: string;
  name: string;
  variants: {
    hidden: Record<string, unknown>;
    visible: Record<string, unknown>;
  };
}

export interface TextoEnMovimientoData extends BaseExercise {
  animations: AnimationConfig[];
  availableColors: string[];
  minDuration: number;
  maxDuration: number;
  durationStep: number;
  minFontSize: number;
  maxFontSize: number;
  fontSizeStep: number;
  defaultText: string;
}

export interface ExerciseProgressUpdate {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
}

// Exercise State for auto-save
export interface TextoEnMovimientoState {
  texts: AnimatedText[];
  isPlaying: boolean;
  score: number;
  timeSpent: number;
  hintsUsed: number;
}

// Exercise Actions Interface for Parent Control
export interface TextoEnMovimientoActions {
  getState: () => TextoEnMovimientoState;
  reset: () => void;
  validate: () => Promise<void>;
  addText?: (text: AnimatedText) => void;
  removeText?: (textId: string) => void;
  togglePlay?: () => void;
}

// Standardized Exercise Props Interface
export interface TextoEnMovimientoExerciseProps {
  moduleId: number;
  lessonId: number;
  exerciseId: string;
  userId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: ExerciseProgressUpdate) => void;
  initialData?: Partial<TextoEnMovimientoState>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<TextoEnMovimientoActions | undefined>;
}
