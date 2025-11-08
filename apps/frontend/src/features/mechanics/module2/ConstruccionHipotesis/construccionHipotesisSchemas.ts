import { z } from 'zod';

export const variableSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(['independent', 'dependent', 'controlled']),
  description: z.string(),
  unit: z.string().optional(),
});

export const hypothesisSchema = z.object({
  id: z.string(),
  statement: z.string().min(10, 'La hipótesis debe tener al menos 10 caracteres'),
  variables: z.array(variableSchema).min(2, 'Necesitas al menos 2 variables'),
  prediction: z.string().min(10),
  reasoning: z.string().min(20, 'Explica tu razonamiento con al menos 20 caracteres'),
});
