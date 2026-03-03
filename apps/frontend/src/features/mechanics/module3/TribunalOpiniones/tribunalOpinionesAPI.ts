import { apiClient } from '@/services/api/apiClient';
import { FEATURE_FLAGS } from '@/config/api.config';
import type { TribunalOpinionesData } from './tribunalOpinionesTypes';
import { mockTribunalData } from './tribunalOpinionesMockData';

/**
 * Fetch Tribunal de Opiniones exercise data
 */
export const fetchTribunal = async (_exerciseId: string): Promise<TribunalOpinionesData> => {
  if (FEATURE_FLAGS.USE_MOCK_DATA) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTribunalData;
  }

  const { data } = await apiClient.get<{ data: TribunalOpinionesData }>(
    `/educational/exercises/${_exerciseId}`
  );
  return data.data;
};

