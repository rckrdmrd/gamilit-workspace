/**
 * Video Carta Zod Schemas
 * Validation schemas for video letter exercise
 */

import { z } from 'zod';

export const videoSectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  duration: z.number().min(5).max(300),
  prompt: z.string().min(1),
});

export const sectionRecordingSchema = z.object({
  sectionId: z.string(),
  blob: z.any().nullable(), // Blob type cannot be validated with Zod
  url: z.string().nullable(),
  duration: z.number().min(0),
  completed: z.boolean(),
});

export const videoCartaProgressSchema = z.object({
  exerciseId: z.string(),
  sectionRecordings: z.array(sectionRecordingSchema),
  filter: z.string(),
  hintsUsed: z.number().min(0),
  timeSpent: z.number().min(0),
  score: z.number().min(0).max(100),
  completed: z.boolean(),
});

export const videoCartaStateSchema = z.object({
  filter: z.string(),
  isRecording: z.boolean(),
  isPaused: z.boolean(),
  currentSectionIndex: z.number().min(0),
  sectionRecordings: z.array(sectionRecordingSchema),
  videoBlob: z.any().nullable(),
  videoUrl: z.string().nullable(),
  duration: z.number().min(0),
  hintsUsed: z.number().min(0),
  timeSpent: z.number().min(0),
  score: z.number().min(0).max(100),
});

export const videoRecipientSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  imageUrl: z.string().url().optional(),
});

export const videoCartaConfigSchema = z.object({
  maxDuration: z.number().min(30).max(600).default(180),
  allowFilters: z.boolean().default(true),
  allowReRecording: z.boolean().default(true),
  requireAllSections: z.boolean().default(true),
});

export const videoFilterSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  cssFilter: z.string(),
});

// Type exports from schemas
export type VideoSectionInput = z.infer<typeof videoSectionSchema>;
export type SectionRecordingInput = z.infer<typeof sectionRecordingSchema>;
export type VideoCartaProgressInput = z.infer<typeof videoCartaProgressSchema>;
export type VideoCartaStateInput = z.infer<typeof videoCartaStateSchema>;
