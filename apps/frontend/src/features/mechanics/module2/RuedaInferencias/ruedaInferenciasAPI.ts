import { apiClient } from '@/services/api/apiClient';
import { FEATURE_FLAGS } from '@/config/api.config';
import { generateInferenceSuggestions } from '../../shared/aiService';

export const fetchInferenceWheel = async (exerciseId?: string) => {
  if (FEATURE_FLAGS.USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return (await import('./ruedaInferenciasMockData')).mockInferenceWheel;
  }

  const id = exerciseId ?? 'default';
  const { data } = await apiClient.get(`/educational/exercises/${id}`);
  return data.data;
};

export const getAISuggestions = async (evidence: string[]) => {
  return generateInferenceSuggestions(evidence);
};
