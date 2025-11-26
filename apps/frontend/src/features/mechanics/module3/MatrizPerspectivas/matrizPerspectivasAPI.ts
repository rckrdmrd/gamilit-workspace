import { generatePerspectives } from '../../shared/aiService';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchMatrixExercise = async (_id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return (await import('./matrizPerspectivasMockData')).matrixExercise;
};
export const getAIPerspectives = async (topic: string, count: number) =>
  generatePerspectives(topic, count);
