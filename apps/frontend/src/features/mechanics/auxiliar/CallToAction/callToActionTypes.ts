import { BaseExercise } from '@shared/components/mechanics/mechanicsTypes';

export interface Campaign {
  id: string;
  title: string;
  cause: string;
  description: string;
  goal: number;
  signatures: number;
  tags: string[];
}

export interface CallToActionData extends BaseExercise {
  availableCauses: string[];
  availableTags: string[];
  minGoal: number;
  maxGoal: number;
  goalStep: number;
  minSignatures: number;
  maxSignatures: number;
}

export interface ExerciseProgressUpdate {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
}

// Exercise State for auto-save
export interface CallToActionState {
  campaigns: Campaign[];
  score: number;
  timeSpent: number;
  hintsUsed: number;
}

// Exercise Actions Interface for Parent Control
export interface CallToActionActions {
  getState: () => CallToActionState;
  reset: () => void;
  validate: () => Promise<void>;
  createCampaign?: (campaign: Omit<Campaign, 'id' | 'signatures'>) => void;
}

// Standardized Exercise Props Interface
export interface CallToActionExerciseProps {
  moduleId: number;
  lessonId: number;
  exerciseId: string;
  userId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: ExerciseProgressUpdate) => void;
  initialData?: Partial<CallToActionState>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<CallToActionActions | undefined>;
}
