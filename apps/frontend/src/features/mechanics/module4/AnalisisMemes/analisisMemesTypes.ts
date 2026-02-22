import { BaseExercise } from '@shared/components/mechanics/mechanicsTypes';

/** User annotation placed on a meme image */
export interface MemeAnnotation {
  id: string;
  x: number;
  y: number;
  text: string;
  category: 'texto' | 'contexto' | 'humor' | 'critica';
}

/** Individual meme item with metadata and analysis info */
export interface MemeItem {
  id: string;
  imageUrl: string;
  format: string;
  topText?: string;
  bottomText?: string;
  analysis?: {
    mainMessage: string;
    humorType: string;
    culturalReference: string;
    historicalAccuracy: string;
    implication: string;
  };
}

/** Exercise data for Análisis de Memes (Module 4) */
export interface AnalisisMemesData extends BaseExercise {
  memeUrl: string;
  memeTitle: string;
  expectedAnnotations: MemeAnnotation[];
  memes?: MemeItem[];
  analysisQuestions?: string[];
}

/** Progress data sent to parent via onProgressUpdate */
export interface AnalisisMemesProgressData {
  progress: {
    currentStep: number;
    totalSteps: number;
    score: number;
    hintsUsed: number;
    timeSpent: number;
  };
  answers: Record<string, unknown>;
}

/** Serializable exercise state for auto-save and restore */
export interface AnalisisMemesExerciseState {
  annotations: MemeAnnotation[];
}

/** Full exercise state including score and time (for parent control) */
export interface AnalisisMemesState {
  annotations: MemeAnnotation[];
  score: number;
  timeSpent: number;
  hintsUsed: number;
}

/** Actions interface exposed via ref for parent control */
export interface AnalisisMemesActions {
  getState: () => AnalisisMemesState;
  reset: () => void;
  validate: () => Promise<void>;
  addAnnotation?: (annotation: MemeAnnotation) => void;
}
