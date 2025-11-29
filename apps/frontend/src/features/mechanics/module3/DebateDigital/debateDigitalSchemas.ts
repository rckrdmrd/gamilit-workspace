import { z } from 'zod';

export const messageSchema = z.object({
  text: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje no puede exceder 1000 caracteres'),
});

export const debateMessageSchema = z.object({
  id: z.string(),
  sender: z.enum(['user', 'ai']),
  text: z.string(),
  timestamp: z.date(),
  argumentStrength: z.number().min(0).max(1).optional(),
});

export const debateAnswersSchema = z.object({
  position: z.enum(['a_favor', 'en_contra', 'neutral']),
  response: z.string().min(20),
  arguments: z.array(z.string()).optional(),
  messageCount: z.number().optional(),
});

export type MessageValidation = z.infer<typeof messageSchema>;
export type DebateMessage = z.infer<typeof debateMessageSchema>;
export type DebateAnswers = z.infer<typeof debateAnswersSchema>;
