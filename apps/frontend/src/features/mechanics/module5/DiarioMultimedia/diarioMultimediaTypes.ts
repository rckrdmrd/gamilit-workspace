/**
 * Diario Multimedia Types
 * Multimedia diary exercise for self-reflection (Module 5 - Option A)
 */

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'audio' | 'video' | 'document';
}

export interface DiaryEntry {
  id: string;
  date: Date;
  title: string;
  content: string;
  media: UploadedFile[];
  isPrivate: boolean;
}

export interface DiarioMultimediaProgress {
  exerciseId: string;
  entries: DiaryEntry[];
  hintsUsed: number;
  timeSpent: number;
  score: number;
  completed: boolean;
}

export interface DiarioMultimediaState {
  entries: DiaryEntry[];
  currentTitle: string;
  currentContent: string;
  currentMedia: UploadedFile[];
  isPrivate: boolean;
  showPreview: boolean;
  hintsUsed: number;
  timeSpent: number;
  score: number;
}

export interface DiarioMultimediaActions {
  getState: () => DiarioMultimediaState;
  reset: () => void;
  addEntry: () => void;
  updateEntry: (entryId: string, updates: Partial<DiaryEntry>) => void;
  deleteEntry: (entryId: string) => void;
  addMedia: (file: UploadedFile) => void;
  removeMedia: (mediaId: string) => void;
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
      prompts?: string[];
      themes?: DiaryTheme[];
    };
    config?: DiarioMultimediaConfig;
  };
  content?: {
    prompts?: string[];
    themes?: DiaryTheme[];
  };
}

export interface DiaryTheme {
  id: string;
  name: string;
  description: string;
  suggestedPrompts: string[];
}

export interface DiarioMultimediaConfig {
  minEntries: number;
  maxEntries: number;
  minContentLength: number;
  allowMediaUpload: boolean;
  allowPrivateEntries: boolean;
}

export interface DiarioMultimediaExerciseProps {
  exerciseId?: string;
  exercise?: ExerciseFromPage;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (data: ProgressData) => void;
  initialData?: Partial<DiarioMultimediaProgress>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<DiarioMultimediaActions | undefined>;
}
