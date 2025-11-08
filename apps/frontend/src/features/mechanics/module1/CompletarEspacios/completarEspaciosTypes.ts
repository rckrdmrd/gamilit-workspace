/**
 * Types for Completar Espacios (Fill in the Blanks) Exercise
 * Module 1 - Exercise 4
 */

export interface BlankSpace {
  id: string;
  position: number;
  correctAnswer: string;
  userAnswer?: string;
  alternatives?: string[]; // Alternative correct answers
}

export interface CompletarEspaciosData {
  id: string;
  title: string;
  description: string;
  difficulty: 'facil' | 'medio' | 'dificil';
  estimatedTime: number;
  topic: string;
  hints: Array<{
    id: string;
    text: string;
    cost: number;
  }>;
  text: string; // Text with placeholders like "Marie nació en ___"
  blanks: BlankSpace[];
  wordBank: string[]; // Available words to fill blanks
  scenarioText?: string;
}

export interface CompletarEspaciosExerciseProps {
  exercise: CompletarEspaciosData;
  onComplete?: () => void;
  onProgressUpdate?: (progress: any) => void;
}
