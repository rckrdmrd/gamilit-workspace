// Legacy types - kept for backward compatibility but no longer used by DebateDigitalExercise
// The exercise was converted from AI chat to structured essay format

/** @deprecated No longer used - exercise uses structured essay sections */
export interface DebateMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

/** @deprecated No longer used - exercise uses structured essay sections */
export interface DebateSession {
  id: string;
  topic: string;
  messages: DebateMessage[];
  userScore: number;
}

export interface ExerciseProgressUpdate {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
}

// Exercise State for auto-save
export interface DebateDigitalState {
  essaySections: {
    thesis: string;
    arguments_for: string;
    counterarguments: string;
    conclusion: string;
  };
  userPosition: 'a_favor' | 'en_contra' | null;
}

// Exercise Actions Interface for Parent Control
export interface DebateDigitalActions {
  getState: () => DebateDigitalState;
  reset: () => void;
  validate: () => Promise<void>;
}

// Standardized Exercise Props Interface (Module 1 Pattern)
export interface DebateDigitalExerciseProps {
  moduleId: number;
  lessonId: number;
  exerciseId: string;
  userId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: ExerciseProgressUpdate) => void;
  initialData?: Partial<DebateDigitalState>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<DebateDigitalActions | undefined>;
}

// Answers format for backend submission
export interface DebateDigitalAnswers {
  position: 'a_favor' | 'en_contra';
  response: string; // Concatenated essay sections
  arguments?: string[]; // Array of essay section contents [thesis, arguments_for, counterarguments, conclusion]
  messageCount?: number; // Always 4 (one per section)
}
