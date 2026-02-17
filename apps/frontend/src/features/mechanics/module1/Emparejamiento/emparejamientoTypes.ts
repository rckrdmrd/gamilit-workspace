import { BaseExercise, ExerciseProgressUpdate } from '@shared/components/mechanics/mechanicsTypes';

export interface MatchingCard {
  id: string;
  content: string;
  matchId: string;
  type: 'question' | 'answer';
  isFlipped: boolean;
  isMatched: boolean;
}

export interface EmparejamientoData extends BaseExercise {
  cards: MatchingCard[];
}

export interface EmparejamientoProgressData {
  progress: ExerciseProgressUpdate;
  answers: { matches: Array<{ leftId: string; rightId: string }> };
}

export interface EmparejamientoExerciseProps {
  exercise: EmparejamientoData;
  onComplete?: () => void;
  onProgressUpdate?: (data: EmparejamientoProgressData) => void;
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}
