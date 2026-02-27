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

/**
 * Submit tribunal evaluations
 * @deprecated Use submitExercise from progressAPI instead
 * Real submission endpoint: POST /educational/exercises/:exerciseId/submit
 */
export const submitTribunalAnswers = async (
  _exerciseId: string,
  _userId: string,
  _answers: unknown
): Promise<{ success: boolean; score: number }> => {
  // This is deprecated - use submitExercise from progressAPI
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    success: true,
    score: 80
  };
};
