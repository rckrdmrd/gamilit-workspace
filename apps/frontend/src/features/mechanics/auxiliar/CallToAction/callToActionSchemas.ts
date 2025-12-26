import { z } from 'zod';

export const campaignSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'El título es requerido'),
  cause: z.string().min(1, 'La causa es requerida'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  goal: z.number().min(50).max(1000),
  signatures: z.number().min(0),
  tags: z.array(z.string())
});

export const callToActionDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(['beginner', 'elementary', 'pre_intermediate', 'intermediate', 'upper_intermediate', 'advanced', 'proficient', 'native']),
  estimatedTime: z.number(),
  topic: z.string(),
  hints: z.array(z.object({ id: z.string(), text: z.string(), cost: z.number() })),
  availableCauses: z.array(z.string()),
  availableTags: z.array(z.string()),
  minGoal: z.number(),
  maxGoal: z.number(),
  goalStep: z.number(),
  minSignatures: z.number(),
  maxSignatures: z.number()
});

export const callToActionStateSchema = z.object({
  campaigns: z.array(campaignSchema),
  score: z.number(),
  timeSpent: z.number(),
  hintsUsed: z.number()
});
