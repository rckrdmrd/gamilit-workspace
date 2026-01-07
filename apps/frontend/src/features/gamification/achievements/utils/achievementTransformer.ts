/**
 * Achievement Transformer
 *
 * Transforma respuestas del backend (snake_case) al formato
 * esperado por el frontend (camelCase)
 *
 * @module achievementTransformer
 * @see missionTransformer.ts - Patron de referencia
 *
 * FIX: CORR-004 - Mapeo de tipos incompatible entre backend y frontend
 */

import type {
  UserAchievement,
  Achievement,
  AchievementStatus,
} from '@/shared/types/achievement.types';

/**
 * Respuesta del backend para UserAchievement (snake_case)
 */
export interface ApiUserAchievementResponse {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  max_progress?: number;
  is_completed?: boolean;
  completion_percentage?: number;
  completed_at?: string | null;
  notified?: boolean;
  viewed?: boolean;
  rewards_claimed?: boolean;
  progress_data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  started_at?: string;
  created_at?: string;
  achievement?: Achievement;
}

/**
 * Calcula el status del achievement basado en campos del backend
 *
 * @param isCompleted - Si el achievement fue completado
 * @param rewardsClaimed - Si las recompensas fueron reclamadas
 * @param progress - Progreso actual (0-100)
 * @returns Estado del achievement
 */
const calculateStatus = (
  isCompleted?: boolean,
  rewardsClaimed?: boolean,
  progress?: number
): AchievementStatus => {
  if (isCompleted && rewardsClaimed) {
    return 'claimed';
  }
  if (isCompleted) {
    return 'unlocked';
  }
  if (progress && progress > 0) {
    return 'in_progress';
  }
  return 'locked';
};

/**
 * Transforma una respuesta de UserAchievement del API al formato del frontend
 *
 * Mapeos:
 * - user_id -> userId
 * - achievement_id -> achievementId
 * - completed_at -> earnedAt
 * - rewards_claimed + completed_at -> claimedAt
 * - is_completed + rewards_claimed -> status (calculado)
 *
 * @param apiResponse - Respuesta del backend en snake_case
 * @returns UserAchievement en formato camelCase del frontend
 */
export const transformUserAchievement = (
  apiResponse: ApiUserAchievementResponse
): UserAchievement => {
  // Calcular status basado en campos del backend
  const status = calculateStatus(
    apiResponse.is_completed,
    apiResponse.rewards_claimed,
    apiResponse.progress
  );

  // Mapear earned_at desde completed_at
  const earnedAt = apiResponse.completed_at
    ? new Date(apiResponse.completed_at).toISOString()
    : undefined;

  // Mapear claimed_at (si rewards_claimed es true, usar completed_at como aproximacion)
  const claimedAt =
    apiResponse.rewards_claimed && apiResponse.completed_at
      ? new Date(apiResponse.completed_at).toISOString()
      : undefined;

  return {
    id: apiResponse.id,
    userId: apiResponse.user_id,
    achievementId: apiResponse.achievement_id,
    progress: apiResponse.progress ?? 0,
    earnedAt,
    claimedAt,
    unlockedAt: earnedAt, // Alias para compatibilidad
    status,
    achievement: apiResponse.achievement ?? ({} as Achievement),
  };
};

/**
 * Transforma un array de respuestas del API
 *
 * @param apiResponses - Array de respuestas del backend
 * @returns Array de UserAchievement en formato frontend
 */
export const transformUserAchievements = (
  apiResponses: ApiUserAchievementResponse[]
): UserAchievement[] => {
  if (!Array.isArray(apiResponses)) {
    console.warn('transformUserAchievements: Expected array, got:', typeof apiResponses);
    return [];
  }
  return apiResponses.map(transformUserAchievement);
};

export default {
  transformUserAchievement,
  transformUserAchievements,
};
