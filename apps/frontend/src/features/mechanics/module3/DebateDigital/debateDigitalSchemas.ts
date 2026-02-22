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

// Legacy schemas kept for backward compatibility
/** @deprecated No longer used - exercise uses structured essay sections */
export const messageSchema = z.object({
  text: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje no puede exceder 1000 caracteres'),
});

/** @deprecated No longer used - exercise uses structured essay sections */
export const debateMessageSchema = z.object({
  id: z.string(),
  sender: z.enum(['user', 'ai']),
  text: z.string(),
  timestamp: z.date(),
});

export type EssaySectionValidation = z.infer<typeof essaySectionSchema>;
export type MessageValidation = z.infer<typeof messageSchema>;
export type DebateMessage = z.infer<typeof debateMessageSchema>;
export type DebateAnswers = z.infer<typeof debateAnswersSchema>;
