import { z } from 'zod';

export const essaySectionSchema = z.object({
  thesis: z
    .string()
    .min(50, 'La tesis debe tener al menos 50 caracteres')
    .max(500, 'La tesis no puede exceder 500 caracteres'),
  arguments_for: z
    .string()
    .min(100, 'Los argumentos deben tener al menos 100 caracteres')
    .max(1000, 'Los argumentos no pueden exceder 1000 caracteres'),
  counterarguments: z
    .string()
    .min(80, 'Los contraargumentos deben tener al menos 80 caracteres')
    .max(800, 'Los contraargumentos no pueden exceder 800 caracteres'),
  conclusion: z
    .string()
    .min(80, 'La conclusion debe tener al menos 80 caracteres')
    .max(800, 'La conclusion no puede exceder 800 caracteres'),
});

export const debateAnswersSchema = z.object({
  position: z.enum(['a_favor', 'en_contra']),
  response: z.string().min(20),
  arguments: z.array(z.string()).optional(),
  messageCount: z.number().optional(),
});

export type EssaySectionValidation = z.infer<typeof essaySectionSchema>;
export type DebateAnswers = z.infer<typeof debateAnswersSchema>;
