/**
 * Comic Digital Types
 * Visual narrative exercise for storytelling (Module 5 - Option B)
 */

export interface SpeechBubble {
  id: string;
  text: string;
  x: number;
  y: number;
  type: 'speech' | 'thought' | 'caption';
}

export interface ComicPanel {
  id: string;
  layout: 'full' | 'half' | 'third';
  image?: string;
  text: string;
  speechBubbles: SpeechBubble[];
  background?: string;
}

export interface ComicDigitalProgress {
  exerciseId: string;
  title: string;
  panels: ComicPanel[];
  hintsUsed: number;
  timeSpent: number;
  score: number;
  completed: boolean;
}

export interface ComicDigitalState {
  title: string;
  panels: ComicPanel[];
  selectedPanel: string | null;
  hintsUsed: number;
  timeSpent: number;
  score: number;
}

export interface ComicDigitalActions {
  getState: () => ComicDigitalState;
  reset: () => void;
  addPanel: (layout: string) => void;
  removePanel: (panelId: string) => void;
  updatePanel: (panelId: string, updates: Partial<ComicPanel>) => void;
  addSpeechBubble: (panelId: string, type: SpeechBubble['type']) => void;
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
      suggestedScenes?: string[];
      templates?: ComicTemplate[];
    };
    config?: ComicDigitalConfig;
  };
  content?: {
    suggestedScenes?: string[];
    templates?: ComicTemplate[];
  };
}

export interface ComicTemplate {
  id: string;
  name: string;
  description: string;
  panelCount: number;
  layouts: string[];
}

export interface ComicDigitalConfig {
  minPanels: number;
  maxPanels: number;
  allowImageUpload: boolean;
  requireSpeechBubbles: boolean;
}

export interface ComicDigitalExerciseProps {
  exerciseId?: string;
  exercise?: ExerciseFromPage;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (data: ProgressData) => void;
  initialData?: Partial<ComicDigitalProgress>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<ComicDigitalActions | undefined>;
}

export interface LayoutOption {
  id: string;
  name: string;
  cols: number;
}

export interface BackgroundOption {
  id: string;
  name: string;
  color: string;
}
