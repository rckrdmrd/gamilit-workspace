/**
 * Prediccion Narrativa Zod Schemas
 * Validation schemas for narrative prediction exercise
 * ⚠️ FE-059: isCorrect is NEVER sent by backend (sanitized for security)
 */

import { z } from 'zod';

/**
 * Prediction option schema
 * Note: isCorrect is never present (backend sanitizes it)
 */
export const predictionOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  isCorrect: z.never().optional(),
  explanation: z.string().min(1),
});

/**
 * Scenario schema
 */
export const scenarioSchema = z.object({
  id: z.string(),
  context: z.string().min(1),
  beginning: z.string().min(1),
  question: z.string().min(1),
  predictions: z.array(predictionOptionSchema).min(2),
  contextualHint: z.string().optional(),
});

/**
 * Exercise data schema
 */
export const prediccionNarrativaExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('prediccion_narrativa').optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  scenarios: z.array(scenarioSchema).min(1),
});

/**
 * User answer for a scenario schema
 */
export const scenarioAnswerSchema = z.object({
  scenarioId: z.string(),
  selectedPredictionId: z.string().nullable(),
  isCorrect: z.boolean().nullable(),
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
export const prediccionNarrativaStateSchema = z.object({
  answers: z.array(scenarioAnswerSchema),
  score: z.number().min(0).max(100),
  timeSpent: z.number().min(0),
  hintsUsed: z.number().min(0),
  showResults: z.boolean(),
});

/**
 * Answers structure schema
 */
export const prediccionNarrativaAnswersSchema = z.object({
  scenarios: z.record(z.string(), z.string().nullable()),
});

/**
 * Type exports
 */
export type PredictionOption = z.infer<typeof predictionOptionSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
export type PrediccionNarrativaExercise = z.infer<typeof prediccionNarrativaExerciseSchema>;
export type ScenarioAnswer = z.infer<typeof scenarioAnswerSchema>;
export type ExerciseProgressUpdate = z.infer<typeof exerciseProgressUpdateSchema>;
export type PrediccionNarrativaState = z.infer<typeof prediccionNarrativaStateSchema>;
export type PrediccionNarrativaAnswers = z.infer<typeof prediccionNarrativaAnswersSchema>;
