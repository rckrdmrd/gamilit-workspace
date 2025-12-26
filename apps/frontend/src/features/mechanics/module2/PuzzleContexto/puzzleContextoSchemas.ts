/**
 * Puzzle Contexto Zod Schemas
 * Validation schemas for context puzzle ordering exercise
 * ⚠️ FE-059: correctPosition and correctOrder are NEVER sent by backend (sanitized for security)
 */

import { z } from 'zod';

/**
 * Fragment schema
 * Note: correctPosition is never present (backend sanitizes it)
 */
export const fragmentSchema = z.object({
  id: z.string(),
  label: z.string(),
  text: z.string().min(1),
  correctPosition: z.never().optional(),
});

/**
 * Exercise data schema
 * Note: correctOrder is never present (backend sanitizes it)
 */
export const puzzleContextoExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('puzzle_contexto').optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().min(1),
  instructions: z.string().optional(),
  completeInference: z.string().min(1),
  fragments: z.array(fragmentSchema).min(2),
  correctOrder: z.never().optional(),
});

/**
 * Exercise progress update schema
 */
export const exerciseProgressUpdateSchema = z.object({
  currentStep: z.number().min(0),
  totalSteps: z.number().min(1),
  score: z.number().min(0).max(100),
  hintsUsed: z.number().min(0),
  timeSpent: z.number().min(0),
});

/**
 * Exercise state schema (for auto-save)
 */
export const puzzleContextoStateSchema = z.object({
  currentOrder: z.array(z.string()),
  isComplete: z.boolean(),
  score: z.number().min(0).max(100),
  timeSpent: z.number().min(0),
  hintsUsed: z.number().min(0),
});

/**
 * Answers structure schema
 */
export const puzzleContextoAnswersSchema = z.object({
  order: z.array(z.string()).min(1),
});

/**
 * Type exports
 */
export type Fragment = z.infer<typeof fragmentSchema>;
export type PuzzleContextoExercise = z.infer<typeof puzzleContextoExerciseSchema>;
export type ExerciseProgressUpdate = z.infer<typeof exerciseProgressUpdateSchema>;
export type PuzzleContextoState = z.infer<typeof puzzleContextoStateSchema>;
export type PuzzleContextoAnswers = z.infer<typeof puzzleContextoAnswersSchema>;
