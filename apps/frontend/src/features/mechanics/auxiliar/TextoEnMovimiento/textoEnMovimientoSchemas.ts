import { z } from 'zod';

export const animatedTextSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'El texto es requerido'),
  animation: z.string(),
  duration: z.number().min(0.5).max(5),
  color: z.string(),
  fontSize: z.number().min(16).max(96)
});

export const animationConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  variants: z.object({
    hidden: z.record(z.string(), z.unknown()),
    visible: z.record(z.string(), z.unknown())
  })
});

export const textoEnMovimientoDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(['beginner', 'elementary', 'pre_intermediate', 'intermediate', 'upper_intermediate', 'advanced', 'proficient', 'native']),
  estimatedTime: z.number(),
  topic: z.string(),
  hints: z.array(z.object({ id: z.string(), text: z.string(), cost: z.number() })),
  availableAnimations: z.array(animationConfigSchema),
  availableColors: z.array(z.string()),
  minDuration: z.number(),
  maxDuration: z.number(),
  minFontSize: z.number(),
  maxFontSize: z.number()
});

export const textoEnMovimientoStateSchema = z.object({
  texts: z.array(animatedTextSchema),
  isPlaying: z.boolean(),
  score: z.number(),
  timeSpent: z.number(),
  hintsUsed: z.number()
});
