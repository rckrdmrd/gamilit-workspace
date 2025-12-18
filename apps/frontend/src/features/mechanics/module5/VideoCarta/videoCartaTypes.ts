/**
 * Video Carta Types
 * Video letter exercise for personal expression (Module 5 - Option C)
 */

export interface VideoSection {
  id: string;
  name: string;
  duration: number; // seconds
  prompt: string;
}

export interface SectionRecording {
  sectionId: string;
  blob: Blob | null;
  url: string | null;
  duration: number;
  completed: boolean;
}

export interface VideoCartaProgress {
  exerciseId: string;
  sectionRecordings: SectionRecording[];
  filter: string;
  hintsUsed: number;
  timeSpent: number;
  score: number;
  completed: boolean;
}

export interface VideoCartaState {
  filter: string;
  isRecording: boolean;
  isPaused: boolean;
  currentSectionIndex: number;
  sectionRecordings: SectionRecording[];
  videoBlob: Blob | null;
  videoUrl: string | null;
  duration: number;
  hintsUsed: number;
  timeSpent: number;
  score: number;
}

export interface VideoCartaActions {
  getState: () => VideoCartaState;
  reset: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  goToNextSection: () => void;
  goToPreviousSection: () => void;
  reRecordSection: () => void;
  setFilter: (filter: string) => void;
}

export interface ExerciseProgressUpdate {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
}

export interface ProgressData {
  progress: ExerciseProgressUpdate;
  answers: Record<string, unknown>;
}

/**
 * Exercise data from ExercisePage (passed via adapter)
 */
export interface ExerciseFromPage {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  mechanicData?: {
    content?: {
      sections?: VideoSection[];
      recipient?: VideoRecipient;
    };
    config?: VideoCartaConfig;
  };
  content?: {
    sections?: VideoSection[];
    recipient?: VideoRecipient;
  };
}

export interface VideoRecipient {
  name: string;
  description: string;
  imageUrl?: string;
}

export interface VideoCartaConfig {
  maxDuration: number;
  allowFilters: boolean;
  allowReRecording: boolean;
  requireAllSections: boolean;
}

export interface VideoFilter {
  id: string;
  name: string;
  cssFilter: string;
}

export interface VideoCartaExerciseProps {
  exerciseId?: string;
  exercise?: ExerciseFromPage;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (data: ProgressData) => void;
  initialData?: Partial<VideoCartaProgress>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<VideoCartaActions | undefined>;
}
