import { validateHypothesis } from '../../shared/aiService';
import type { HypothesisExercise, Hypothesis } from './construccionHipotesisTypes';
import { mockExercise } from './construccionHipotesisMockData';

export const fetchHypothesisExercise = async (id: string): Promise<HypothesisExercise> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockExercise;
};

export const validateHypothesisSubmission = async (hypothesis: Hypothesis) => {
  const variableNames = hypothesis.variables.map((v) => v.name);
  return validateHypothesis(hypothesis.statement, variableNames);
};
