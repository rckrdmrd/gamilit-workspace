import { z } from 'zod';

export const questionSchema = z.object({
  id: z.string(),
  time: z.number().min(0),
  question: z.string().min(1, 'La pregunta es requerida'),
  options: z.array(z.string()).min(2, 'Se requieren al menos 2 opciones'),
  correctAnswer: z.number().min(0)
});

export const comprensionAuditivaDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(['beginner', 'elementary', 'pre_intermediate', 'intermediate', 'upper_intermediate', 'advanced', 'proficient', 'native']),
  estimatedTime: z.number(),
  topic: z.string(),
  hints: z.array(z.object({ id: z.string(), text: z.string(), cost: z.number() })),
  audioUrl: z.string().url(),
  audioTitle: z.string(),
  audioDuration: z.number().min(0),
  questions: z.array(questionSchema)
});

export const comprensionAuditivaStateSchema = z.object({
  answers: z.record(z.string(), z.number()),
  currentTime: z.number(),
  showResults: z.boolean(),
  score: z.number(),
  timeSpent: z.number(),
  hintsUsed: z.number()
});
