/**
 * Lectura Inferencial Zod Schemas
 * Validation schemas for inferential reading comprehension exercise
 */

import { z } from 'zod';

/**
 * Types of inferences students can make
 */
export const inferenceTypeSchema = z.enum([
  'causa_efecto',
  'contexto_situacional',
  'motivacion',
  'prediccion',
  'conclusion',
  'interpretacion',
]);

/**
 * Individual multiple choice question schema
 */
export const inferenceQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  options: z.array(z.string()).min(2),
  correctAnswer: z.number().min(0),
  explanation: z.string().min(1),
  inference_type: inferenceTypeSchema,
});

/**
 * Student's answer to a question schema
 */
export const questionAnswerSchema = z.object({
  questionId: z.string(),
  selectedOption: z.number().min(0),
  isCorrect: z.boolean(),
  timeSpent: z.number().min(0),
});

/**
 * Configuration for the exercise schema
 */
export const lecturaInferencialConfigSchema = z.object({
  timePerQuestion: z.number().min(0).optional(),
  allowReview: z.boolean().optional(),
  showExplanations: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
});

/**
 * Content structure for the exercise schema
 */
export const lecturaInferencialContentSchema = z.object({
  passage: z.string().min(1),
  questions: z.array(inferenceQuestionSchema).min(1),
});

/**
 * Complete exercise data structure schema
 */
export const lecturaInferencialExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('lectura_inferencial'),
  title: z.string().min(1),
  description: z.string().optional(),
  instructions: z.string().optional(),
  config: lecturaInferencialConfigSchema,
  content: lecturaInferencialContentSchema,
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

/**
 * Exercise progress/state schema
 */
export const lecturaInferencialProgressSchema = z.object({
  answers: z.array(questionAnswerSchema),
  currentQuestionIndex: z.number().min(0),
  timeSpent: z.number().min(0),
  score: z.number().min(0).max(100),
  hintsUsed: z.number().min(0),
  completed: z.boolean(),
});

/**
 * Answers structure for LecturaInferencial exercise schema
 */
export const lecturaInferencialAnswersSchema = z.object({
  questions: z.record(z.string(), z.number().min(0)),
});

/**
 * Type exports
 */
export type InferenceType = z.infer<typeof inferenceTypeSchema>;
export type InferenceQuestion = z.infer<typeof inferenceQuestionSchema>;
export type QuestionAnswer = z.infer<typeof questionAnswerSchema>;
export type LecturaInferencialConfig = z.infer<typeof lecturaInferencialConfigSchema>;
export type LecturaInferencialContent = z.infer<typeof lecturaInferencialContentSchema>;
export type LecturaInferencialExercise = z.infer<typeof lecturaInferencialExerciseSchema>;
export type LecturaInferencialProgress = z.infer<typeof lecturaInferencialProgressSchema>;
export type LecturaInferencialAnswers = z.infer<typeof lecturaInferencialAnswersSchema>;
