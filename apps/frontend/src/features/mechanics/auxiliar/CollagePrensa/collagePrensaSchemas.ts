import { z } from 'zod';

export const uploadedFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  type: z.string()
});

export const collageElementSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'text', 'headline']),
  content: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().min(1),
  height: z.number().min(1),
  rotation: z.number()
});

export const collagePrensaDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(['beginner', 'elementary', 'pre_intermediate', 'intermediate', 'upper_intermediate', 'advanced', 'proficient', 'native']),
  estimatedTime: z.number(),
  topic: z.string(),
  hints: z.array(z.object({ id: z.string(), text: z.string(), cost: z.number() })),
  newspaperTitle: z.string(),
  newspaperDate: z.string(),
  canvasAspectRatio: z.string(),
  minCanvasHeight: z.number(),
  defaultHeadlineText: z.string(),
  defaultBodyText: z.string(),
  defaultElementWidth: z.number(),
  defaultElementHeight: z.number()
});

export const collagePrensaStateSchema = z.object({
  elements: z.array(collageElementSchema),
  uploadedFiles: z.array(uploadedFileSchema),
  score: z.number(),
  timeSpent: z.number(),
  hintsUsed: z.number()
});
