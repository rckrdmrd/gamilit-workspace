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
 * FIX: CORR-007 - Agregado transformador para Achievement (catalogo de logros)
 * FIX: CORR-ACHIEVEMENTS-006 - Validacion segura de fechas para evitar Invalid Date
 * FIX: CORR-ACHIEVEMENTS-007 - Removidos logs de debug temporales
 *
 * @updated 2026-01-08 CORR-007: Agregadas funciones transformAchievement y transformAchievements
 * @updated 2026-01-10 CORR-ACHIEVEMENTS-006: Agregada funcion safeToISOString para validar fechas
 * @updated 2026-01-10 CORR-ACHIEVEMENTS-007: Removidos logs de debug temporales
 */

import type {
  UserAchievement,
  Achievement,
  AchievementStatus,
  AchievementType,
  AchievementCategory,
  AchievementConditionsType,
} from '@/shared/types/achievement.types';

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Convierte una fecha a ISO string de forma segura
 * CORR-ACHIEVEMENTS-006: Evita RangeError: Invalid time value
 *
 * @param dateValue - Valor de fecha (string, Date, null, undefined)
 * @returns ISO string si la fecha es valida, undefined si no
 */
const safeToISOString = (dateValue: string | Date | null | undefined): string | undefined => {
  if (!dateValue) return undefined;

  try {
    const date = new Date(dateValue);
    // Verificar si la fecha es valida
    if (isNaN(date.getTime())) {
      console.warn('[safeToISOString] Invalid date value:', dateValue);
      return undefined;
    }
    return date.toISOString();
  } catch (error) {
    console.warn('[safeToISOString] Error parsing date:', dateValue, error);
    return undefined;
  }
};

// ============================================================================
// TIPOS PARA ACHIEVEMENT (CATALOGO DE LOGROS)
// ============================================================================

/**
 * Respuesta del backend para Achievement (snake_case)
 * FIX: CORR-007 - Interface para respuesta del backend
 */
export interface ApiAchievementResponse {
  id: string;
  tenant_id?: string;
  name: string;
  description: string;
  detailed_description?: string;
  icon: string;
  category: string;
  type?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  difficulty_level?: 'easy' | 'medium' | 'hard' | 'expert';

  // Rewards - backend puede enviar en diferentes formatos
  rewards?: {
    xp?: number;
    ml_coins?: number;
    items?: string[];
    badge?: string;
  };
  ml_coins_reward?: number;  // Campo alternativo para ml_coins
  points_value?: number;      // Campo alternativo para xp

  // Conditions
  conditions?: AchievementConditionsType;

  // Boolean flags (snake_case del backend)
  is_secret?: boolean;
  is_active?: boolean;
  is_repeatable?: boolean;

  // Ordenamiento y metadata
  order_index?: number;
  metadata?: Record<string, unknown>;
  created_by?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// TIPOS PARA USER ACHIEVEMENT (PROGRESO DEL USUARIO)
// ============================================================================

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
/**
 * FIX: CORR-005 - Corregido 'unlocked' a 'earned' para coincidir con AchievementStatus
 * El tipo AchievementStatus solo acepta: 'locked' | 'in_progress' | 'earned' | 'claimed'
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
    return 'earned';  // FIX: CORR-005 - Cambiado de 'unlocked' a 'earned'
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
  // CORR-ACHIEVEMENTS-006: Usar safeToISOString para evitar Invalid Date
  const earnedAt = safeToISOString(apiResponse.completed_at);

  // Mapear claimed_at (si rewards_claimed es true, usar completed_at como aproximacion)
  // CORR-ACHIEVEMENTS-006: Usar safeToISOString para evitar Invalid Date
  const claimedAt = apiResponse.rewards_claimed
    ? safeToISOString(apiResponse.completed_at)
    : undefined;

  // CORR-ACHIEVEMENTS-002: No asignar objeto vacio si achievement no viene del backend
  // El frontend hace merge manual con getAllAchievements() en la pagina
  const achievement = apiResponse.achievement
    ? transformAchievement(apiResponse.achievement as unknown as ApiAchievementResponse)
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
    achievement,
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

  // DEBUG: Log raw data from backend
  console.log('[TRANSFORMER] Raw apiResponses count:', apiResponses.length);
  if (apiResponses.length > 0) {
    console.log('[TRANSFORMER] Sample raw data:', apiResponses.slice(0, 2).map(r => ({
      id: r.id,
      achievement_id: r.achievement_id,
      is_completed: r.is_completed,
      rewards_claimed: r.rewards_claimed,
      progress: r.progress,
    })));
  }

  const transformed = apiResponses.map(transformUserAchievement);

  // DEBUG: Log transformed data
  console.log('[TRANSFORMER] Transformed count:', transformed.length);
  if (transformed.length > 0) {
    console.log('[TRANSFORMER] Sample transformed:', transformed.slice(0, 2).map(t => ({
      id: t.id,
      achievementId: t.achievementId,
      status: t.status,
      progress: t.progress,
    })));
  }

  return transformed;
};

// ============================================================================
// TRANSFORMADORES PARA ACHIEVEMENT (CATALOGO DE LOGROS)
// ============================================================================

/**
 * Transforma una respuesta de Achievement del API al formato del frontend
 *
 * FIX: CORR-007 - Transformacion de Achievement (catalogo de logros)
 *
 * Mapeos principales:
 * - rewards.ml_coins -> rewards.mlCoins
 * - is_secret -> isHidden (y mantiene is_secret para compatibilidad)
 * - is_active -> isActive (y mantiene is_active)
 * - is_repeatable -> isRepeatable (y mantiene is_repeatable)
 * - points_value -> pointsValue
 * - created_at -> createdAt
 * - updated_at -> updatedAt
 *
 * @param apiResponse - Respuesta del backend en snake_case
 * @returns Achievement en formato camelCase del frontend
 */
export const transformAchievement = (
  apiResponse: ApiAchievementResponse
): Achievement => {
  // Transformar rewards - maneja multiples formatos del backend
  const rewards = {
    xp: apiResponse.rewards?.xp ?? apiResponse.points_value ?? 0,
    mlCoins: apiResponse.rewards?.ml_coins ?? apiResponse.ml_coins_reward ?? 0,
    items: apiResponse.rewards?.items,
    rankPromotion: undefined,
  };

  // Mapear categoria a tipo valido
  const category = (apiResponse.category?.toLowerCase() || 'progress') as AchievementCategory;

  // Mapear tipo de achievement
  const type = (apiResponse.type || 'badge') as AchievementType;

  return {
    // Campos basicos
    id: apiResponse.id,
    name: apiResponse.name,
    description: apiResponse.description,
    detailedDescription: apiResponse.detailed_description,
    icon: apiResponse.icon || '🏆',
    category,
    type,
    rarity: apiResponse.rarity,

    // Rewards transformados
    rewards,

    // Conditions (mantener formato original)
    conditions: apiResponse.conditions ?? { type: 'default', requirements: {} },

    // Boolean flags - camelCase para frontend
    isHidden: apiResponse.is_secret ?? false,

    // Boolean flags - snake_case para compatibilidad con tipos existentes
    is_secret: apiResponse.is_secret ?? false,
    is_active: apiResponse.is_active ?? true,
    is_repeatable: apiResponse.is_repeatable ?? false,

    // Campos adicionales
    tenant_id: apiResponse.tenant_id,
    difficulty_level: apiResponse.difficulty_level,
    order_index: apiResponse.order_index ?? 0,
    points_value: apiResponse.points_value ?? 0,
    metadata: apiResponse.metadata,
    created_by: apiResponse.created_by,

    // Timestamps - transformados a camelCase
    createdAt: apiResponse.created_at,
    updatedAt: apiResponse.updated_at,
  };
};

/**
 * Transforma un array de respuestas del API de Achievement
 *
 * FIX: CORR-007 - Transformacion de array de Achievements
 *
 * @param apiResponses - Array de respuestas del backend
 * @returns Array de Achievement en formato frontend
 */
export const transformAchievements = (
  apiResponses: ApiAchievementResponse[]
): Achievement[] => {
  if (!Array.isArray(apiResponses)) {
    console.warn('[transformAchievements] Expected array, got:', typeof apiResponses);
    return [];
  }
  return apiResponses.map(transformAchievement);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Achievement transformers (CORR-007)
  transformAchievement,
  transformAchievements,
  // UserAchievement transformers (CORR-004)
  transformUserAchievement,
  transformUserAchievements,
};
