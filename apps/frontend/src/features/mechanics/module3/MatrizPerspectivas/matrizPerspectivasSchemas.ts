import { z } from 'zod';

export const perspectiveSchema = z.object({
  perspective: z.string().min(3),
  viewpoint: z.string().min(10),
  arguments: z.array(z.string()),
  counterarguments: z.array(z.string()),
  biases: z.array(z.string()),
  contextualFactors: z.array(z.string()),
});

export const matrizAnswersSchema = z.object({
  questions: z.object({
    q1: z.string().min(50, 'La respuesta debe tener al menos 50 caracteres'),
    q2: z.string().min(50, 'La respuesta debe tener al menos 50 caracteres'),
    q3: z.string().min(50, 'La respuesta debe tener al menos 50 caracteres'),
  }),
});

export const matrixExerciseSchema = z.object({
  id: z.string(),
  topic: z.string(),
  description: z.string(),
  perspectiveCount: z.number().min(2).max(5),
});

export type Perspective = z.infer<typeof perspectiveSchema>;
export type MatrizAnswers = z.infer<typeof matrizAnswersSchema>;
export type MatrixExercise = z.infer<typeof matrixExerciseSchema>;
