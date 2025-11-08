export interface Story {
  id: string;
  title: string;
  beginning: string;
  context: string;
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
}

export interface Prediction {
  id: string;
  storyId: string;
  userPrediction: string;
  aiContinuation: string | null;
  accuracy: number;
  feedback: string;
}

export interface NarrativeProgress {
  storyId: string;
  predictions: Prediction[];
  score: number;
}

export interface ExerciseProgressUpdate {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
}

// Exercise State for auto-save
export interface PrediccionNarrativaState {
  userPrediction: string;
  predictions: Prediction[];
  score: number;
  timeSpent: number;
  hintsUsed: number;
}

// Exercise Actions Interface for Parent Control
export interface PrediccionNarrativaActions {
  getState: () => PrediccionNarrativaState;
  reset: () => void;
  validate: () => Promise<void>;
  submitPrediction?: (prediction: string) => Promise<void>;
}

// Standardized Exercise Props Interface (Module 1 Pattern)
export interface PrediccionNarrativaExerciseProps {
  moduleId: number;
  lessonId: number;
  exerciseId: string;
  userId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: ExerciseProgressUpdate) => void;
  initialData?: Partial<PrediccionNarrativaState>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<PrediccionNarrativaActions | undefined>;
}
