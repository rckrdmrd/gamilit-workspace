/**
 * Detective Textual Zod Schemas
 * Validation schemas for multiple choice inference exercise
 */

import { z } from 'zod';

export const inferenceQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().min(0).max(3),
  explanation: z.string().min(1),
  inference_type: z.enum(['causa_efecto', 'contexto_situacional', 'motivacion']),
});

export const detectiveTextualExerciseSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  passage: z.string().min(1),
  questions: z.array(inferenceQuestionSchema),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export const detectiveTextualProgressSchema = z.object({
  exerciseId: z.string(),
  answers: z.record(z.string(), z.number().min(0).max(3)),
  hintsUsed: z.number().min(0),
  timeSpent: z.number().min(0),
  score: z.number().min(0).max(100),
  completed: z.boolean(),
});

export const detectiveTextualStateSchema = z.object({
  answers: z.record(z.string(), z.number().min(0).max(3)),
  hintsUsed: z.number().min(0),
  timeSpent: z.number().min(0),
  score: z.number().min(0).max(100),
  currentQuestionIndex: z.number().min(0),
});
