/**
 * Comic Digital Zod Schemas
 * Validation schemas for visual narrative comic exercise
 */

import { z } from 'zod';

export const speechBubbleSchema = z.object({
  id: z.string(),
  text: z.string(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  type: z.enum(['speech', 'thought', 'caption']),
});

export const comicPanelSchema = z.object({
  id: z.string(),
  layout: z.enum(['full', 'half', 'third']),
  image: z.string().optional(),
  text: z.string(),
  speechBubbles: z.array(speechBubbleSchema),
  background: z.string().optional(),
});

export const comicDigitalProgressSchema = z.object({
  exerciseId: z.string(),
  title: z.string().min(1),
  panels: z.array(comicPanelSchema).min(1),
  hintsUsed: z.number().min(0),
  timeSpent: z.number().min(0),
  score: z.number().min(0).max(100),
  completed: z.boolean(),
});

export const comicDigitalStateSchema = z.object({
  title: z.string().min(1),
  panels: z.array(comicPanelSchema),
  selectedPanel: z.string().nullable(),
  hintsUsed: z.number().min(0),
  timeSpent: z.number().min(0),
  score: z.number().min(0).max(100),
});

export const comicTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  panelCount: z.number().min(1).max(12),
  layouts: z.array(z.string()),
});

export const comicDigitalConfigSchema = z.object({
  minPanels: z.number().min(1).default(6),
  maxPanels: z.number().max(12).default(12),
  allowImageUpload: z.boolean().default(true),
  requireSpeechBubbles: z.boolean().default(false),
});

// Type exports from schemas
export type SpeechBubbleInput = z.infer<typeof speechBubbleSchema>;
export type ComicPanelInput = z.infer<typeof comicPanelSchema>;
export type ComicDigitalProgressInput = z.infer<typeof comicDigitalProgressSchema>;
export type ComicDigitalStateInput = z.infer<typeof comicDigitalStateSchema>;
