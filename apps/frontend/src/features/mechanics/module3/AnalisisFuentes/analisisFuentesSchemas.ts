import { z } from 'zod';

export const sourceSchema = z.object({
  id: z.string(),
  url: z.string().url('URL inválida'),
  title: z.string().min(1),
  type: z.enum(['academic', 'news', 'blog', 'wiki', 'official']),
  excerpt: z.string().optional(),
  description: z.string().optional(),
});

export const sourceCredibilitySchema = z.object({
  credibilityScore: z.number().min(0).max(1),
  biasLevel: z.enum(['low', 'medium', 'high']),
  factualReporting: z.enum(['very-high', 'high', 'mostly-factual', 'mixed', 'low']),
  warnings: z.array(z.string()),
  strengths: z.array(z.string()),
});

export const analisisFuentesAnswersSchema = z.object({
  ranking: z.array(z.string()).min(1),
  startedAt: z.string().datetime().optional(),
});

export type Source = z.infer<typeof sourceSchema>;
export type SourceCredibility = z.infer<typeof sourceCredibilitySchema>;
export type AnalisisFuentesAnswers = z.infer<typeof analisisFuentesAnswersSchema>;
