export interface DebateMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  argumentStrength?: number;
}

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
  messages: DebateMessage[];
  score: number;
  timeSpent: number;
  hintsUsed: number;
}

// Exercise Actions Interface for Parent Control
export interface DebateDigitalActions {
  getState: () => DebateDigitalState;
  reset: () => void;
  validate: () => Promise<void>;
  sendMessage?: (message: string) => Promise<void>;
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
  position: 'a_favor' | 'en_contra' | 'neutral';
  response: string; // Full debate conversation or final argument
  arguments?: string[]; // Array of user arguments
  messageCount?: number; // Number of messages exchanged
}
