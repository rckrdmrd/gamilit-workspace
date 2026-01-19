/**
 * Achievements API
 *
 * Dedicated API client for achievements system.
 * Provides type-safe methods for interacting with backend achievements endpoints.
 *
 * Backend Routes (all under /api/v1/gamification):
 * - GET  /achievements                                    - List all achievements
 * - GET  /achievements/:id                                - Get achievement by ID
 * - GET  /users/:userId/achievements                      - Get user's achievements with progress
 * - GET  /users/:userId/achievements/summary              - Get user achievement stats
 * - POST /users/:userId/achievements/:achievementId       - Grant/update achievement
 * - POST /users/:userId/achievements/:achievementId/claim - Claim rewards
 * - GET  /achievements/user/:userId/progress/:achievementId - Get specific progress
 * - POST /achievements/user/:userId/unlock/:achievementId - Manual unlock (admin)
 * - PATCH /achievements/:id                               - Toggle active status (admin)
 *
 * Rate Limiting: Maximum 5 achievements unlocked per minute per user (RF-GAM-001)
 *
 * @note 2026-01-18: Este archivo proporciona getUserAchievements que retorna
 * achievement + progress combinados (AchievementAPIResponse[]). gamificationApi
 * tiene un método similar pero retorna UserAchievement[] (solo progress).
 * El store necesita el formato enriquecido de este archivo.
 *
 * @fix CORR-P1-API-001 (2026-01-18): mapCategory() ahora preserva las 9 categorías
 * válidas del DDL v1.1 (progress, streak, completion, social, special, mastery,
 * exploration, collection, hidden) en lugar de colapsar a solo 4.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '@/services/api/apiErrorHandler';
import type { ApiResponse } from '@/services/api/apiTypes';
import type { Achievement } from '../types/achievementsTypes';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Backend Achievement Response
 * Note: Uses snake_case to match backend response (apiClient does NOT transform)
 */
export interface BackendAchievement {
  id: string;
  tenant_id?: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  difficulty_level?: string;
  ml_coins_reward: number;
  is_repeatable: boolean;
  is_secret?: boolean;
  is_active?: boolean;
  order_index?: number;
  points_value?: number;
  unlock_message?: string;
  instructions?: string;
  tips?: string[];
  conditions: {
    type: string;
    requirements: Record<string, unknown>;
  };
  rewards: {
    xp: number;
    ml_coins: number;
    badge?: string;
  };
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Backend User Achievement Response
 * Note: Uses snake_case to match backend response (apiClient does NOT transform)
 */
export interface BackendUserAchievement {
  id: string;
  achievement_id: string;
  user_id: string;
  progress: number;
  max_progress: number;
  is_completed: boolean;
  completion_percentage: string; // Backend returns as string
  completed_at?: string;
  started_at?: string;
  rewards_claimed: boolean;
  rewards_received?: {
    xp: number;
    ml_coins: number;
  };
  progress_data?: Record<string, unknown>;
  milestones_reached?: string[];
  notified?: boolean;
  viewed?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Combined Achievement with User Progress (API Response format)
 *
 * CORR-P0-002: Renombrado de AchievementWithProgress para evitar colisión
 * con achievementsTypes.ts que tiene una interfaz con el mismo nombre
 * pero estructura diferente (view model).
 *
 * Esta interfaz representa la respuesta de la API combinada.
 * Para el view model de componentes, usar AchievementWithProgress de achievementsTypes.ts
 */
export interface AchievementAPIResponse extends BackendAchievement {
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: {
    current: number;
    required: number;
  };
  completionPercentage?: number;
  rewardsClaimed?: boolean;
}

// ============================================================================
// API METHODS
// ============================================================================

/**
 * Get all available achievements
 *
 * @returns List of all achievements
 */
export const getAllAchievements = async (): Promise<BackendAchievement[]> => {
  try {
    const { data } = await apiClient.get<BackendAchievement[]>(
      API_ENDPOINTS.gamification.achievements,
    );

    return data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get user's achievements with progress
 *
 * @param userId - User ID
 * @returns List of user's achievements with unlock status and progress
 */
export const getUserAchievements = async (userId: string): Promise<AchievementAPIResponse[]> => {
  try {
    // Get all achievements
    const allAchievements = await getAllAchievements();

    // Get user's achievement progress
    const { data } = await apiClient.get<
      ApiResponse<{ achievements: BackendUserAchievement[]; total: number }>
    >(`/gamification/users/${userId}/achievements`);

    const userAchievements = data.data.achievements;

    // Merge achievements with user progress
    const achievementsWithProgress: AchievementAPIResponse[] = allAchievements.map(
      (achievement) => {
        const userProgress = userAchievements.find((ua) => ua.achievement_id === achievement.id);

        return {
          ...achievement,
          isUnlocked: userProgress?.is_completed || false,
          unlockedAt: userProgress?.completed_at ? new Date(userProgress.completed_at) : undefined,
          progress: userProgress
            ? {
                current: userProgress.progress,
                required: userProgress.max_progress,
              }
            : undefined,
          completionPercentage: userProgress?.completion_percentage
            ? parseFloat(userProgress.completion_percentage)
            : undefined,
          rewardsClaimed: userProgress?.rewards_claimed || false,
        };
      },
    );

    return achievementsWithProgress;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get single achievement by ID
 *
 * @param achievementId - Achievement ID
 * @returns Achievement data
 */
export const getAchievementById = async (achievementId: string): Promise<BackendAchievement> => {
  try {
    const { data } = await apiClient.get<ApiResponse<BackendAchievement>>(
      API_ENDPOINTS.gamification.achievement(achievementId),
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get achievement progress for specific user and achievement
 *
 * @param userId - User ID
 * @param achievementId - Achievement ID
 * @returns Achievement progress data
 */
export const getAchievementProgress = async (
  userId: string,
  achievementId: string,
): Promise<BackendUserAchievement> => {
  try {
    const { data } = await apiClient.get<ApiResponse<BackendUserAchievement>>(
      `/gamification/achievements/user/${userId}/progress/${achievementId}`,
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Update achievement progress
 *
 * Uses POST /users/:userId/achievements/:achievementId to update progress.
 * The backend grantAchievement method handles both creation and updates.
 *
 * @param userId - User ID
 * @param achievementId - Achievement ID
 * @param increment - Progress increment amount (added to current progress)
 * @returns Updated progress data
 */
export const updateAchievementProgress = async (
  userId: string,
  achievementId: string,
  increment: number,
): Promise<BackendUserAchievement> => {
  try {
    // First get current progress
    const currentProgress = await getAchievementProgress(userId, achievementId).catch(() => null);
    const newProgress = (currentProgress?.progress || 0) + increment;
    const maxProgress = currentProgress?.max_progress || 100;

    // Use grant endpoint to update progress
    const { data } = await apiClient.post<ApiResponse<BackendUserAchievement>>(
      `/gamification/users/${userId}/achievements/${achievementId}`,
      {
        user_id: userId,
        achievement_id: achievementId,
        progress: newProgress,
        max_progress: maxProgress,
        is_completed: newProgress >= maxProgress,
      },
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Manually unlock an achievement (admin only)
 *
 * @param userId - User ID
 * @param achievementId - Achievement ID
 * @returns Unlocked achievement
 */
export const unlockAchievement = async (
  userId: string,
  achievementId: string,
): Promise<BackendAchievement> => {
  try {
    const { data } = await apiClient.post<ApiResponse<BackendAchievement>>(
      `/gamification/achievements/user/${userId}/unlock/${achievementId}`,
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Check and unlock achievements based on user stats
 *
 * NOTE: Achievement detection is handled automatically by the backend
 * when exercises are completed (via ExerciseSubmissionService.detectAndGrantEarned).
 * This method is provided for manual/admin triggering if needed.
 *
 * The backend evaluates 16+ condition types including:
 * - exercise_completion, streak, module_completion, all_modules_completion
 * - perfect_score, skill_mastery, exploration, social, special
 * - module_first_exercise, exercise_score, exercise_repetition, etc.
 *
 * @param userId - User ID
 * @param _conditionType - Type of condition (unused - backend checks all)
 * @param _currentValue - Current value (unused - backend reads from UserStats)
 * @returns List of newly unlocked achievements
 * @deprecated Use automatic detection. This is a placeholder for future manual check endpoint.
 */
export const checkAchievements = async (
  userId: string,
  _conditionType: string,
  _currentValue: number,
): Promise<BackendAchievement[]> => {
  // Backend auto-detection handles this. Re-fetch user achievements to get latest.
  console.warn(
    '[achievementsAPI] checkAchievements: Achievement detection is automatic. ' +
    'Refreshing user achievements instead.'
  );

  try {
    // Refresh achievements to get any newly unlocked ones
    const achievements = await getUserAchievements(userId);
    // Return recently unlocked (completed in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentlyUnlocked = achievements.filter(
      (a) => a.isUnlocked && a.unlockedAt && a.unlockedAt > fiveMinutesAgo
    );

    return recentlyUnlocked as unknown as BackendAchievement[];
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Claim rewards for a completed achievement
 *
 * Marks the achievement rewards as claimed and credits ML Coins/XP to user.
 *
 * @param userId - User ID
 * @param achievementId - Achievement ID to claim rewards for
 * @returns Claim result with rewards credited
 *
 * @example
 * const result = await claimAchievementRewards('user-123', 'achievement-456');
 * console.log(`Received ${result.ml_coins_awarded} ML Coins!`);
 */
export const claimAchievementRewards = async (
  userId: string,
  achievementId: string,
): Promise<{
  success: boolean;
  achievement_id: string;
  rewards_claimed: boolean;
  ml_coins_awarded?: number;
  xp_awarded?: number;
}> => {
  try {
    const { data } = await apiClient.post<
      ApiResponse<{
        id: string;
        user_id: string;
        achievement_id: string;
        rewards_claimed: boolean;
        completed_at: string;
      }>
    >(`/gamification/users/${userId}/achievements/${achievementId}/claim`);

    // The backend returns the updated user_achievement record
    // We need to get the achievement details to know the rewards
    return {
      success: true,
      achievement_id: achievementId,
      rewards_claimed: data.data.rewards_claimed,
    };
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Valid achievement categories from DDL v1.1
 * @see gamification_system.achievement_category ENUM
 */
type ValidAchievementCategory =
  | 'progress'
  | 'streak'
  | 'completion'
  | 'social'
  | 'special'
  | 'mastery'
  | 'exploration'
  | 'collection'
  | 'hidden';

/**
 * Map backend category to frontend category
 *
 * CORR-P1-API-001: Corregido para retornar las 9 categorías válidas del DDL v1.1
 * en lugar de colapsar a solo 4 categorías.
 *
 * Categorías válidas (DDL achievement_category ENUM v1.1):
 * progress, streak, completion, social, special, mastery, exploration, collection, hidden
 *
 * @param backendCategory - Backend category name
 * @returns Frontend category type (preserva la categoría original)
 */
const mapCategory = (backendCategory: string): ValidAchievementCategory => {
  const normalized = backendCategory.toLowerCase();

  // Lista de categorías válidas del DDL v1.1
  const validCategories: ValidAchievementCategory[] = [
    'progress',
    'streak',
    'completion',
    'social',
    'special',
    'mastery',
    'exploration',
    'collection',
    'hidden',
  ];

  // Si la categoría es válida, retornarla directamente
  if (validCategories.includes(normalized as ValidAchievementCategory)) {
    return normalized as ValidAchievementCategory;
  }

  // Mapeo de categorías legacy/alternativas a categorías válidas
  const legacyMapping: Record<string, ValidAchievementCategory> = {
    educational: 'progress',  // Legacy: mapear a progress
    missions: 'progress',     // Legacy: mapear a progress
    skill: 'mastery',         // Legacy: mapear a mastery
  };

  return legacyMapping[normalized] ?? 'progress';
};

/**
 * Map backend achievement to frontend Achievement type
 *
 * CORR-P0-003: Usar ?? (nullish coalescing) en lugar de || para rewards
 * Esto permite que valores de 0 sean respetados (0 ML coins es válido)
 *
 * @param backendAchievement - Backend achievement data
 * @param userProgress - Optional user progress data
 * @returns Frontend Achievement object
 */
export const mapToFrontendAchievement = (
  backendAchievement: BackendAchievement,
  userProgress?: BackendUserAchievement,
): Achievement => {
  return {
    id: backendAchievement.id,
    title: backendAchievement.name,
    description: backendAchievement.description,
    category: mapCategory(backendAchievement.category),
    rarity: backendAchievement.rarity,
    icon: backendAchievement.icon,
    // CORR-P0-003: Usar ?? para respetar valores de 0 (0 ML coins es válido)
    mlCoinsReward: backendAchievement.rewards?.ml_coins ?? backendAchievement.ml_coins_reward ?? 0,
    xpReward: backendAchievement.rewards?.xp ?? backendAchievement.points_value ?? 0,
    isUnlocked: userProgress?.is_completed ?? false,
    unlockedAt: userProgress?.completed_at ? new Date(userProgress.completed_at) : undefined,
    progress: userProgress
      ? {
          current: userProgress.progress,
          required: userProgress.max_progress,
        }
      : undefined,
    requirements: backendAchievement.conditions?.requirements,
    isHidden:
      backendAchievement.is_secret ??
      (backendAchievement.category.toLowerCase() === 'hidden' ||
       backendAchievement.category.toLowerCase() === 'special'),
    rewardsClaimed: userProgress?.rewards_claimed ?? false,
  };
};

/**
 * Map array of backend achievements to frontend format
 *
 * @param backendAchievements - Array of backend achievements
 * @param userAchievements - Optional array of user progress data
 * @returns Array of frontend Achievement objects
 */
export const mapAchievementsToFrontend = (
  backendAchievements: BackendAchievement[],
  userAchievements?: BackendUserAchievement[],
): Achievement[] => {
  return backendAchievements.map((achievement) => {
    const userProgress = userAchievements?.find((ua) => ua.achievement_id === achievement.id);
    return mapToFrontendAchievement(achievement, userProgress);
  });
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getAllAchievements,
  getUserAchievements,
  getAchievementById,
  getAchievementProgress,
  updateAchievementProgress,
  unlockAchievement,
  checkAchievements,
  claimAchievementRewards,
  mapToFrontendAchievement,
  mapAchievementsToFrontend,
};
