/**
 * Diario Multimedia Zod Schemas
 * Validation schemas for multimedia diary exercise
 */

import { z } from 'zod';

export const uploadedFileSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  url: z.string().url(),
  type: z.enum(['image', 'audio', 'video', 'document']),
});

export const diaryEntrySchema = z.object({
  id: z.string(),
  date: z.date(),
  title: z.string().min(1).max(100),
  content: z.string().min(50),
  media: z.array(uploadedFileSchema),
  isPrivate: z.boolean(),
});

export const diarioMultimediaProgressSchema = z.object({
  exerciseId: z.string(),
  entries: z.array(diaryEntrySchema).min(1),
  hintsUsed: z.number().min(0),
  timeSpent: z.number().min(0),
  score: z.number().min(0).max(100),
  completed: z.boolean(),
});

export const diarioMultimediaStateSchema = z.object({
  entries: z.array(diaryEntrySchema),
  currentTitle: z.string(),
  currentContent: z.string(),
  currentMedia: z.array(uploadedFileSchema),
  isPrivate: z.boolean(),
  showPreview: z.boolean(),
  hintsUsed: z.number().min(0),
  timeSpent: z.number().min(0),
  score: z.number().min(0).max(100),
});

export const diaryThemeSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  suggestedPrompts: z.array(z.string()),
});

export const diarioMultimediaConfigSchema = z.object({
  minEntries: z.number().min(1).default(5),
  maxEntries: z.number().max(20).default(10),
  minContentLength: z.number().min(50).default(150),
  allowMediaUpload: z.boolean().default(true),
  allowPrivateEntries: z.boolean().default(true),
});

// Type exports from schemas
export type UploadedFileInput = z.infer<typeof uploadedFileSchema>;
export type DiaryEntryInput = z.infer<typeof diaryEntrySchema>;
export type DiarioMultimediaProgressInput = z.infer<typeof diarioMultimediaProgressSchema>;
export type DiarioMultimediaStateInput = z.infer<typeof diarioMultimediaStateSchema>;
