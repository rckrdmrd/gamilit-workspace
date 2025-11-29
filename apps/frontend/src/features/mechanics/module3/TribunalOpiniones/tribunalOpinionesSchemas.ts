import { z } from 'zod';

export const statementClassificationSchema = z.enum(['hecho', 'opinion', 'interpretacion']);

export const statementVerdictSchema = z.enum([
  'bien_fundamentada',
  'parcialmente_fundamentada',
  'sin_fundamento',
]);

export const statementEvaluationSchema = z.object({
  statementId: z.string().min(1),
  classification: statementClassificationSchema,
  verdict: statementVerdictSchema,
  justification: z.string().max(300).optional(),
});

export const tribunalAnswersSchema = z.object({
  evaluations: z.array(statementEvaluationSchema).min(1),
});

export type StatementClassification = z.infer<typeof statementClassificationSchema>;
export type StatementVerdict = z.infer<typeof statementVerdictSchema>;
export type StatementEvaluation = z.infer<typeof statementEvaluationSchema>;
export type TribunalAnswers = z.infer<typeof tribunalAnswersSchema>;
