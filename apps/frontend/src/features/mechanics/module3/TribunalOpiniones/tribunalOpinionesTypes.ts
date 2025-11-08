export interface Opinion {
  id: string;
  author: string;
  stance: 'a_favor' | 'en_contra' | 'neutral';
  text: string;
  arguments: string[];
  evidence: string[];
}

export interface TribunalExercise {
  id: string;
  topic: string;
  question: string;
  opinions: Opinion[];
}

export interface ExerciseProgressUpdate {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
}

// Exercise State for auto-save
export interface TribunalOpinionesState {
  evaluatedOpinions: { opinionId: string; evaluation: any }[];
  verdict: string;
  score: number;
  timeSpent: number;
  hintsUsed: number;
}

// Exercise Actions Interface for Parent Control
export interface TribunalOpinionesActions {
  getState: () => TribunalOpinionesState;
  reset: () => void;
  validate: () => Promise<void>;
  evaluateOpinion?: (opinionId: string, evaluation: any) => void;
}

// Standardized Exercise Props Interface (Module 1 Pattern)
export interface TribunalOpinionesExerciseProps {
  moduleId: number;
  lessonId: number;
  exerciseId: string;
  userId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: ExerciseProgressUpdate) => void;
  initialData?: Partial<TribunalOpinionesState>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<TribunalOpinionesActions | undefined>;
}
