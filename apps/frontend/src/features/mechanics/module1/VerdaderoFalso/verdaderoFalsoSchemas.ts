/**
 * Zod Schemas for Verdadero/Falso (True/False) Exercise
 * Module 1 - Exercise 2
 * Created: 2025-12-28 (P1-001)
 *
 * These schemas validate the exercise data structure and submission format.
 * Note: correctAnswer is never sent by backend (sanitized for security)
 */
import { z } from 'zod';

/**
 * Schema for a single statement in the exercise
 */
export const verdaderoFalsoStatementSchema = z.object({
  id: z.string().min(1, 'Statement ID is required'),
  statement: z.string().min(1, 'Statement text is required'),
  explanation: z.string().optional(),
  userAnswer: z.boolean().nullable().optional(),
});

/**
 * Schema for hint items
 */
export const hintSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  cost: z.number().min(0),
});

/**
 * Schema for the full exercise data received from backend
 */
export const verdaderoFalsoDataSchema = z.object({
  id: z.string().min(1, 'Exercise ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['facil', 'medio', 'dificil']),
  estimatedTime: z.number().positive('Estimated time must be positive'),
  topic: z.string().min(1, 'Topic is required'),
  hints: z.array(hintSchema).default([]),
  statements: z.array(verdaderoFalsoStatementSchema).min(1, 'At least one statement is required'),
  contextText: z.string().optional(),
});

/**
 * Schema for user answers submitted to backend
 */
export const verdaderoFalsoAnswersSchema = z.object({
  statements: z.record(z.string(), z.boolean()),
});

/**
 * Schema for the submission payload sent to backend
 */
export const verdaderoFalsoSubmissionSchema = z.object({
  exerciseId: z.string().min(1),
  answers: verdaderoFalsoAnswersSchema,
  timeSpent: z.number().optional(),
  hintsUsed: z.number().default(0),
  comodinesUsed: z.array(z.string()).optional(),
});

/**
 * Schema for the response from backend after submission
 */
export const verdaderoFalsoResultSchema = z.object({
  isCorrect: z.boolean(),
  score: z.number().min(0).max(100),
  feedback: z.string().optional(),
  rewards: z.object({
    xp: z.number().default(0),
    mlCoins: z.number().default(0),
  }).optional(),
  correctAnswers: z.record(z.string(), z.boolean()).optional(),
  explanations: z.record(z.string(), z.string()).optional(),
});

// Type exports inferred from schemas
export type VerdaderoFalsoStatement = z.infer<typeof verdaderoFalsoStatementSchema>;
export type VerdaderoFalsoData = z.infer<typeof verdaderoFalsoDataSchema>;
export type VerdaderoFalsoAnswers = z.infer<typeof verdaderoFalsoAnswersSchema>;
export type VerdaderoFalsoSubmission = z.infer<typeof verdaderoFalsoSubmissionSchema>;
export type VerdaderoFalsoResult = z.infer<typeof verdaderoFalsoResultSchema>;

/**
 * Validate exercise data from backend
 */
export function validateVerdaderoFalsoData(data: unknown): VerdaderoFalsoData {
  return verdaderoFalsoDataSchema.parse(data);
}

/**
 * Validate submission before sending to backend
 */
export function validateVerdaderoFalsoSubmission(data: unknown): VerdaderoFalsoSubmission {
  return verdaderoFalsoSubmissionSchema.parse(data);
}

/**
 * Safe parse with error handling
 */
export function safeParseVerdaderoFalsoData(data: unknown) {
  return verdaderoFalsoDataSchema.safeParse(data);
}
