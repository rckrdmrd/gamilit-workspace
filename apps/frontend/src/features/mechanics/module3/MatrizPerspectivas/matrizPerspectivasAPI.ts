export const fetchMatrixExercise = async (_id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return (await import('./matrizPerspectivasMockData')).matrixExercise;
};
