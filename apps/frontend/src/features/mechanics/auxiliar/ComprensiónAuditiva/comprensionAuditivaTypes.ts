import { BaseExercise } from '@shared/components/mechanics/mechanicsTypes';

export interface Question {
  id: string;
  time: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface ComprensiónAuditivaData extends BaseExercise {
  audioUrl: string;
  audioTitle: string;
  audioDuration: number;
  questions: Question[];
}

export interface ExerciseProgressUpdate {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
}

// Exercise State for auto-save
export interface ComprensiónAuditivaState {
  answers: Record<string, number>;
  currentTime: number;
  showResults: boolean;
  score: number;
  timeSpent: number;
  hintsUsed: number;
}

// Exercise Actions Interface for Parent Control
export interface ComprensiónAuditivaActions {
  getState: () => ComprensiónAuditivaState;
  reset: () => void;
  validate: () => Promise<void>;
  submitAnswer?: (questionId: string, answerIndex: number) => void;
}

// Standardized Exercise Props Interface
export interface ComprensiónAuditivaExerciseProps {
  moduleId: number;
  lessonId: number;
  exerciseId: string;
  userId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: ExerciseProgressUpdate) => void;
  initialData?: Partial<ComprensiónAuditivaState>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<ComprensiónAuditivaActions | undefined>;
}
