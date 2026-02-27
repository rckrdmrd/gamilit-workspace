import { apiClient } from '@/services/api/apiClient';
import { FEATURE_FLAGS } from '@/config/api.config';

export const fetchSources = async (exerciseId?: string) => {
  if (FEATURE_FLAGS.USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return (await import('./analisisFuentesMockData')).mockSources;
  }

  const id = exerciseId ?? 'default';
  const { data } = await apiClient.get(`/educational/exercises/${id}`);
  return data.data;
};
