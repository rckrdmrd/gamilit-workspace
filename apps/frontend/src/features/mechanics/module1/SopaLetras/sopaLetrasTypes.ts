import { BaseExercise } from '@shared/components/mechanics/mechanicsTypes';

export interface WordPosition {
  word: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
  found: boolean;
}

export interface SopaLetrasData extends BaseExercise {
  grid: string[][];
  words: WordPosition[];
  rows: number;
  cols: number;
}

export interface SelectedCell {
  row: number;
  col: number;
}
