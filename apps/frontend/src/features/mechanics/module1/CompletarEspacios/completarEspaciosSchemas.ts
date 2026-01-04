/**
 * Zod Schemas for Completar Espacios (Fill in the Blanks) Exercise
 * Module 1 - Exercise 4
 * Created: 2025-12-28 (P1-002)
 *
 * These schemas validate the exercise data structure and submission format.
 * Note: correctAnswer and alternatives are never sent by backend (sanitized for security)
 */
import { z } from 'zod';

/**
 * Schema for a single blank space in the exercise
 */
export const blankSpaceSchema = z.object({
  id: z.string().min(1, 'Blank ID is required'),
  position: z.number().int().min(0, 'Position must be non-negative'),
  userAnswer: z.string().optional(),
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
export const completarEspaciosDataSchema = z.object({
  id: z.string().min(1, 'Exercise ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['facil', 'medio', 'dificil']),
  estimatedTime: z.number().positive('Estimated time must be positive'),
  topic: z.string().min(1, 'Topic is required'),
  hints: z.array(hintSchema).default([]),
  text: z.string().min(1, 'Exercise text is required'), // Text with placeholders
  blanks: z.array(blankSpaceSchema).min(1, 'At least one blank is required'),
  wordBank: z.array(z.string()).default([]), // Available words to fill blanks
  scenarioText: z.string().optional(),
});

/**
 * Schema for user answers submitted to backend
 * Maps blank ID to the user's answer
 */
export const completarEspaciosAnswersSchema = z.object({
  blanks: z.record(z.string(), z.string()),
});

/**
 * Schema for the submission payload sent to backend
 */
export const completarEspaciosSubmissionSchema = z.object({
  exerciseId: z.string().min(1),
  answers: completarEspaciosAnswersSchema,
  timeSpent: z.number().optional(),
  hintsUsed: z.number().default(0),
  comodinesUsed: z.array(z.string()).optional(),
});

/**
 * Schema for the response from backend after submission
 */
export const completarEspaciosResultSchema = z.object({
  isCorrect: z.boolean(),
  score: z.number().min(0).max(100),
  feedback: z.string().optional(),
  rewards: z.object({
    xp: z.number().default(0),
    mlCoins: z.number().default(0),
  }).optional(),
  correctAnswers: z.record(z.string(), z.string()).optional(),
  blankResults: z.array(z.object({
    id: z.string(),
    isCorrect: z.boolean(),
    correctAnswer: z.string().optional(),
  })).optional(),
});

// Type exports inferred from schemas
export type BlankSpace = z.infer<typeof blankSpaceSchema>;
export type CompletarEspaciosData = z.infer<typeof completarEspaciosDataSchema>;
export type CompletarEspaciosAnswers = z.infer<typeof completarEspaciosAnswersSchema>;
export type CompletarEspaciosSubmission = z.infer<typeof completarEspaciosSubmissionSchema>;
export type CompletarEspaciosResult = z.infer<typeof completarEspaciosResultSchema>;

/**
 * Validate exercise data from backend
 */
export function validateCompletarEspaciosData(data: unknown): CompletarEspaciosData {
  return completarEspaciosDataSchema.parse(data);
}

/**
 * Validate submission before sending to backend
 */
export function validateCompletarEspaciosSubmission(data: unknown): CompletarEspaciosSubmission {
  return completarEspaciosSubmissionSchema.parse(data);
}

/**
 * Safe parse with error handling
 */
export function safeParseCompletarEspaciosData(data: unknown) {
  return completarEspaciosDataSchema.safeParse(data);
}

/**
 * Extract blank IDs from text with placeholders
 * Placeholders format: ___1___, ___2___, etc. or {{blank_id}}
 */
export function extractBlankIds(text: string): string[] {
  const pattern = /(?:___(\d+)___|\{\{(\w+)\}\})/g;
  const ids: string[] = [];
  let match;

  while ((match = pattern.exec(text)) !== null) {
    ids.push(match[1] || match[2]);
  }

  return ids;
}
