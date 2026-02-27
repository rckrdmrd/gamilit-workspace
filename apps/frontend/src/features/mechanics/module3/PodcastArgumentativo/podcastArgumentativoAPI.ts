import { apiClient } from '@/services/api/apiClient';
import { FEATURE_FLAGS } from '@/config/api.config';

export const fetchPodcastExercise = async (_id: string) => {
  if (FEATURE_FLAGS.USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return (await import('./podcastArgumentativoMockData')).podcastExercise;
  }

  const { data } = await apiClient.get(`/educational/exercises/${_id}`);
  return data.data;
};
