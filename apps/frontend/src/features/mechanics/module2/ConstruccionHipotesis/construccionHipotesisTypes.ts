export interface Variable {
  id: string;
  name: string;
  type: 'independent' | 'dependent' | 'controlled';
  description: string;
  unit?: string;
}

export interface Hypothesis {
  id: string;
  statement: string;
  variables: Variable[];
  prediction: string;
  reasoning: string;
}

export interface HypothesisExercise {
  id: string;
  title: string;
  context: string;
  scientificQuestion: string;
  availableVariables: Variable[];
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
}

export interface HypothesisProgress {
  exerciseId: string;
  hypothesis: Hypothesis | null;
  validationResult: any | null;
  score: number;
  attempts: number;
}

export interface ExerciseProgressUpdate {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
}

// Exercise State for auto-save
export interface ConstruccionHipotesisState {
  hypothesis: Hypothesis | null;
  validationResult: any | null;
  score: number;
  timeSpent: number;
  hintsUsed: number;
  attempts: number;
}

// Exercise Actions Interface for Parent Control
export interface ConstruccionHipotesisActions {
  getState: () => ConstruccionHipotesisState;
  reset: () => void;
  validate: () => Promise<void>;
  updateHypothesis?: (hypothesis: Hypothesis) => void;
}

// Standardized Exercise Props Interface (Module 1 Pattern)
export interface ConstruccionHipotesisExerciseProps {
  moduleId: number;
  lessonId: number;
  exerciseId: string;
  userId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: ExerciseProgressUpdate) => void;
  initialData?: Partial<ConstruccionHipotesisState>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<ConstruccionHipotesisActions | undefined>;
}
