/**
 * Causa-Efecto Zod Schemas
 * Validation schemas for cause-effect drag & drop exercise
 * ⚠️ FE-059: correctCauseIds is NEVER sent by backend (sanitized for security)
 */

import { z } from 'zod';

/**
 * A cause schema (left column, fixed)
 */
export const causeSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
});

/**
 * A consequence schema (right column, draggable)
 * Note: correctCauseIds is never present (backend sanitizes it)
 */
export const consequenceSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  correctCauseIds: z.never().optional(),
});

/**
 * Configuration for the exercise schema
 */
export const causaEfectoConfigSchema = z.object({
  allowMultiple: z.boolean(),
  showFeedback: z.boolean(),
  dragAndDrop: z.boolean(),
});

/**
 * Content structure for the exercise schema
 */
export const causaEfectoContentSchema = z.object({
  causes: z.array(causeSchema).min(1),
  consequences: z.array(consequenceSchema).min(1),
});

/**
 * Complete exercise data structure schema
 */
export const causaEfectoExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('causa_efecto'),
  title: z.string().min(1),
  description: z.string().optional(),
  instructions: z.string().optional(),
  config: causaEfectoConfigSchema,
  content: causaEfectoContentSchema,
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

/**
 * User's matches schema (cause ID -> array of consequence IDs)
 */
export const causeMatchesSchema = z.record(z.string(), z.array(z.string()));

/**
 * Answers structure for CausaEfecto exercise schema
 */
export const causaEfectoAnswersSchema = z.object({
  matches: causeMatchesSchema,
});

/**
 * Exercise state schema (for auto-save)
 */
export const causaEfectoStateSchema = z.object({
  matches: causeMatchesSchema,
  score: z.number().min(0).max(100),
  timeSpent: z.number().min(0),
  hintsUsed: z.number().min(0),
  completed: z.boolean(),
});

/**
 * Type exports
 */
export type Cause = z.infer<typeof causeSchema>;
export type Consequence = z.infer<typeof consequenceSchema>;
export type CausaEfectoConfig = z.infer<typeof causaEfectoConfigSchema>;
export type CausaEfectoContent = z.infer<typeof causaEfectoContentSchema>;
export type CausaEfectoExercise = z.infer<typeof causaEfectoExerciseSchema>;
export type CauseMatches = z.infer<typeof causeMatchesSchema>;
export type CausaEfectoAnswers = z.infer<typeof causaEfectoAnswersSchema>;
export type CausaEfectoState = z.infer<typeof causaEfectoStateSchema>;
