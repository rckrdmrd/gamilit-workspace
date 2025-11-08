import { z } from 'zod';

export const contextPieceSchema = z.object({
  id: z.string(),
  content: z.string(),
  correctPosition: z.number(),
  category: z.enum(['historical', 'scientific', 'personal', 'social']),
});
