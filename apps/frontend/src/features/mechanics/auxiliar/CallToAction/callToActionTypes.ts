import { BaseExercise, ExerciseProgressUpdate } from '@shared/components/mechanics/mechanicsTypes';

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
  topic: string; // Topic for campaigns (e.g., "Marie Curie legacy")
  availableCauses: string[];
  availableTags: string[];
  minGoal: number;
  maxGoal: number;
  goalStep: number;
  minCampaigns?: number; // Minimum campaigns required
}

export interface CallToActionProgressData {
  progress: ExerciseProgressUpdate;
  answers: { campaigns: Campaign[] };
}

export interface CallToActionExerciseProps {
  exercise: CallToActionData;
  onComplete?: () => void;
  onProgressUpdate?: (data: CallToActionProgressData) => void;
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}
