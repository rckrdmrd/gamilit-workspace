import { z } from 'zod';

export const predictionSchema = z.object({
  userPrediction: z.string().min(50, 'La predicción debe tener al menos 50 caracteres'),
});
