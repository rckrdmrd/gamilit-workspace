export interface InferenceNode {
  id: string;
  text: string;
  evidence: string[];
  confidence: number;
  position: { x: number; y: number };
}

export interface InferenceConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relationship: string;
}

export interface InferenceWheel {
  id: string;
  centralText: string;
  nodes: InferenceNode[];
  connections: InferenceConnection[];
}

export interface ExerciseProgressUpdate {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
}

// Exercise State for auto-save
export interface RuedaInferenciasState {
  nodes: InferenceNode[];
  connections: InferenceConnection[];
  score: number;
  timeSpent: number;
  hintsUsed: number;
}

// Exercise Actions Interface for Parent Control
export interface RuedaInferenciasActions {
  getState: () => RuedaInferenciasState;
  reset: () => void;
  validate: () => Promise<void>;
  addNode?: (node: InferenceNode) => void;
  addConnection?: (connection: InferenceConnection) => void;
}

// Standardized Exercise Props Interface (Module 1 Pattern)
export interface RuedaInferenciasExerciseProps {
  moduleId: number;
  lessonId: number;
  exerciseId: string;
  userId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: ExerciseProgressUpdate) => void;
  initialData?: Partial<RuedaInferenciasState>;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<RuedaInferenciasActions | undefined>;
}
