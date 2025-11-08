import { validateContextAssembly } from '../../shared/aiService';
import type { PuzzleExercise, ContextPiece } from './puzzleContextoTypes';
import { mockPuzzle } from './puzzleContextoMockData';

export const fetchPuzzleExercise = async (id: string): Promise<PuzzleExercise> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ...mockPuzzle, pieces: mockPuzzle.pieces.sort(() => Math.random() - 0.5) };
};

export const validateAssembly = async (pieces: { id: string; content: string }[]) => {
  return validateContextAssembly(pieces);
};
