export interface ContextPiece {
  id: string;
  content: string;
  correctPosition: number;
  category: 'historical' | 'scientific' | 'personal' | 'social';
}

export interface PuzzleExercise {
  id: string;
  title: string;
  description: string;
  pieces: ContextPiece[];
  correctOrder?: string[];
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
}

export interface ExerciseProgressUpdate {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
}

// Exercise State for auto-save
export interface PuzzleContextoState {
  currentOrder: string[];
  isComplete: boolean;
  score: number;
  timeSpent: number;
  hintsUsed: number;
}

// Exercise Actions Interface for Parent Control
export interface PuzzleContextoActions {
  getState: () => PuzzleContextoState;
  reset: () => void;
  validate: () => Promise<void>;
  movePiece?: (pieceId: string, newPosition: number) => void;
}

// Standardized Exercise Props Interface (Module 1 Pattern)
export interface PuzzleContextoExerciseProps {
  moduleId: number;
  lessonId: number;
  exerciseId: string;
  userId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: ExerciseProgressUpdate) => void;
  initialData?: Partial<PuzzleContextoState>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<PuzzleContextoActions | undefined>;
}
