import { BaseExercise } from '@shared/components/mechanics/mechanicsTypes';

export interface CrucigramaCell {
  row: number;
  col: number;
  letter: string;
  isBlack: boolean;
  number?: number;
  numbers?: number[]; // Support multiple clue numbers in same cell
  userInput?: string;
}

export interface CrucigramaClue {
  id: string;
  number: number;
  direction: 'horizontal' | 'vertical';
  clue: string;
  answer: string;
  startRow: number;
  startCol: number;
}

export interface CrucigramaData extends BaseExercise {
  grid: CrucigramaCell[][];
  clues: CrucigramaClue[];
  rows: number;
  cols: number;
}

export interface CrucigramaProgress {
  exerciseId: string;
  grid: CrucigramaCell[][];
  completedClues: Set<string>;
  startTime: Date;
  hintsUsed: number;
}
