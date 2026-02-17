import { BaseExercise, ExerciseProgressUpdate } from '@shared/components/mechanics/mechanicsTypes';
import type { Variants } from 'framer-motion';

export interface AnimatedText {
  id: string;
  text: string;
  animation: string;
  duration: number;
  color: string;
  fontSize: number;
}

export interface AnimationConfig {
  id: string;
  name: string;
  variants: Variants;
}

export interface TextoEnMovimientoData extends BaseExercise {
  topic: string; // Topic for animations (e.g., "Marie Curie")
  minTexts?: number; // Minimum texts required
  availableAnimations: AnimationConfig[];
  availableColors: string[];
  minDuration: number;
  maxDuration: number;
  minFontSize: number;
  maxFontSize: number;
}

export interface TextoEnMovimientoProgressData {
  progress: ExerciseProgressUpdate;
  answers: { texts: AnimatedText[] };
}

export interface TextoEnMovimientoExerciseProps {
  exercise: TextoEnMovimientoData;
  onComplete?: () => void;
  onProgressUpdate?: (data: TextoEnMovimientoProgressData) => void;
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}
