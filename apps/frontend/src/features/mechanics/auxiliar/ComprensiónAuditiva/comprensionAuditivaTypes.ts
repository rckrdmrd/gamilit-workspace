import { BaseExercise, ExerciseProgressUpdate } from '@shared/components/mechanics/mechanicsTypes';

export interface AudioQuestion {
  id: string;
  time: number; // Time in audio when question unlocks (seconds)
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface ComprensiónAuditivaData extends BaseExercise {
  audioUrl: string;
  audioTitle: string;
  audioDuration: number;
  questions: AudioQuestion[];
  maxReplays?: number; // Optional: max replays without penalty
  transcriptAvailable?: boolean; // Optional: if transcript can be shown
}

export interface ComprensiónAuditivaProgressData {
  progress: ExerciseProgressUpdate;
  answers: { responses: Record<string, number> };
}

export interface ComprensiónAuditivaExerciseProps {
  exercise: ComprensiónAuditivaData;
  onComplete?: () => void;
  onProgressUpdate?: (data: ComprensiónAuditivaProgressData) => void;
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}
