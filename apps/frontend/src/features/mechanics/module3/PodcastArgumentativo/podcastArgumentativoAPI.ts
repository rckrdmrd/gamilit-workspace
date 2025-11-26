import { analyzeArgument } from '../../shared/aiService';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchPodcastExercise = async (_id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return (await import('./podcastArgumentativoMockData')).podcastExercise;
};
export const analyzeRecording = async (transcription: string) => analyzeArgument(transcription);
