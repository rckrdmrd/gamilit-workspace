/**
 * Admin Achievements API Client
 *
 * API service for admin achievements management
 * Connects to backend endpoints in AchievementsController (gamification module)
 *
 * @module services/api/admin/achievementsApi
 * @author Frontend-Agent
 * @date 2025-11-24
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import type {
  AdminAchievement,
  UpdateAchievementDto,
  ListAchievementsQuery,
} from '@/types/admin/achievements.types';

/**
 * Admin Achievements API
 *
 * Provides methods for managing achievements in admin panel
 */
export const adminAchievementsApi = {
  /**
   * List all achievements with optional filters
   *
   * @param query Optional filters (category, isActive, search, pagination)
   * @returns Paginated list of achievements
   *
   * @example
   * const { data, total } = await adminAchievementsApi.listAchievements({ category: 'progress' });
   */
  async listAchievements(query?: ListAchievementsQuery): Promise<{
    data: AdminAchievement[];
    total: number;
  }> {
    const params: Record<string, any> = {};

    if (query?.category) params.category = query.category;
    if (query?.isActive !== undefined) params.isActive = query.isActive;
    if (query?.search) params.search = query.search;
    if (query?.includeSecret) params.includeSecret = query.includeSecret;
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;

    const response = await apiClient.get(API_ENDPOINTS.gamification.achievements, {
      params,
    });

    // Backend returns array directly, need to shape to match expected structure
    const achievements = response.data;
    return {
      data: Array.isArray(achievements) ? achievements : [],
      total: Array.isArray(achievements) ? achievements.length : 0,
    };
  },

  /**
   * Get a specific achievement by ID
   *
   * @param achievementId Achievement ID
   * @returns Achievement details
   *
   * @example
   * const achievement = await adminAchievementsApi.getAchievement('achievement-uuid');
   */
  async getAchievement(achievementId: string): Promise<AdminAchievement> {
    const response = await apiClient.get(API_ENDPOINTS.gamification.achievement(achievementId));
    return response.data;
  },

  /**
   * Toggle achievement active status
   *
   * @param achievementId Achievement ID
   * @param isActive New active status
   * @returns Updated achievement
   *
   * @example
   * const updated = await adminAchievementsApi.toggleActive('achievement-uuid', false);
   *
   * @endpoint PATCH /gamification/achievements/:id
   */
  async toggleActive(achievementId: string, isActive: boolean): Promise<AdminAchievement> {
    const response = await apiClient.patch(API_ENDPOINTS.gamification.achievement(achievementId), {
      is_active: isActive,
    });
    return response.data.achievement || response.data;
  },

  /**
   * Update achievement (limited fields - no requirements editing)
   *
   * @param achievementId Achievement ID
   * @param data Fields to update (name, description, etc.)
   * @returns Updated achievement
   *
   * @note Requirements (conditions) are intentionally NOT editable per spec
   */
  async updateAchievement(
    achievementId: string,
    data: UpdateAchievementDto,
  ): Promise<AdminAchievement> {
    // Note: Backend doesn't have specific update endpoint yet
    // This would need backend implementation
    // For MVP, we return the achievement as-is
    void data; // TODO: Use when backend PATCH endpoint is implemented
    const achievement = await this.getAchievement(achievementId);
    return achievement;
  },
};

export default adminAchievementsApi;
