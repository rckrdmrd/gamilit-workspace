import { z } from 'zod';

export const recordingSchema = z.object({
  duration: z
    .number()
    .min(30, 'La grabación debe durar al menos 30 segundos')
    .max(300, 'La grabación no puede durar más de 5 minutos'),
});

export const podcastAnswersSchema = z.object({
  script: z.string().min(50, 'El script debe tener al menos 50 caracteres'),
  audioDuration: z.number().min(30).max(300),
});

export type RecordingValidation = z.infer<typeof recordingSchema>;
export type PodcastAnswersValidation = z.infer<typeof podcastAnswersSchema>;
