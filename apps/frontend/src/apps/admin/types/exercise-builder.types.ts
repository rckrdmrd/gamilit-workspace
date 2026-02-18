export interface ExerciseFormData {
  title: string;
  description: string;
  instructions: string;
  moduleId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number;
  howToSolve: string;
  recommendedStrategy: string;
  pedagogicalNotes: string;
  exerciseType: string;
  typeConfig: Record<string, unknown>;
  xpReward: number;
  mlCoinsReward: number;
  hintsAllowed: number;
}
