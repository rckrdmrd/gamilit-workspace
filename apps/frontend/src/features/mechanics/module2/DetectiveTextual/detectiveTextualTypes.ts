/**
 * Detective Textual Types
 * Multiple choice exercise for textual inference (Module 2.1)
 */

export interface InferenceQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // índice 0-3
  explanation: string;
  inference_type: 'causa_efecto' | 'contexto_situacional' | 'motivacion';
}

export interface DetectiveTextualExercise {
  id: string;
  title: string;
  description: string;
  passage: string;
  questions: InferenceQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DetectiveTextualProgress {
  exerciseId: string;
  answers: Record<string, number>; // { "q1": 1, "q2": 2 }
  hintsUsed: number;
  timeSpent: number;
  score: number;
  completed: boolean;
}

export interface DetectiveTextualState {
  answers: Record<string, number>;
  hintsUsed: number;
  timeSpent: number;
  score: number;
  currentQuestionIndex: number;
}

export interface DetectiveTextualActions {
  getState: () => DetectiveTextualState;
  reset: () => void;
  validate: () => Promise<void>;
  selectAnswer?: (questionId: string, optionIndex: number) => void;
}

export interface ExerciseProgressUpdate {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
}

/**
 * Exercise data from ExercisePage (passed via adapter)
 * Contains the API response with mechanic-specific content
 */
export interface ExerciseFromPage {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  mechanicData?: {
    content?: {
      passage?: string;
      questions?: InferenceQuestion[];
    };
    config?: Record<string, unknown>;
  };
  // Alternate format from adapter (adaptToLecturaInferencialData)
  content?: {
    passage?: string;
    questions?: InferenceQuestion[];
  };
}

export interface DetectiveTextualExerciseProps {
  moduleId?: number;
  lessonId?: number;
  exerciseId?: string;
  userId?: string;
  /** Exercise data from ExercisePage - primary source of exercise content */
  exercise?: ExerciseFromPage;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (
    progress:
      | ExerciseProgressUpdate
      | {
          progress: Partial<ExerciseProgressUpdate>;
          answers: { questions: Record<string, string> };
        },
  ) => void;
  initialData?: Partial<DetectiveTextualProgress>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<DetectiveTextualActions | undefined>;
  comodinesContext?: import('@/features/exercises/types/exercise-mechanic.types').ExerciseComodinesContext;
}
