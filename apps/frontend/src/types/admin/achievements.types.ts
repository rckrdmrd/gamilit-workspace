/**
 * Admin Achievements Types
 *
 * Type definitions for admin achievements management
 * Aligned with backend Achievement entity
 *
 * @module types/admin/achievements
 * @author Frontend-Agent
 * @date 2025-11-24
 *
 * @see SSOT: @shared/types/achievement.types.ts
 * P2-001: AdminAchievement es un tipo contextual para el portal admin.
 * Contiene campos adicionales del backend que no están en el SSOT público.
 */

import { AchievementCategoryEnum, DifficultyLevelEnum } from '@/shared/constants/enums.constants';

/**
 * AdminAchievement
 *
 * Represents a single achievement definition with all fields visible to admin.
 * This is a contextual type with additional backend fields not in the public SSOT.
 *
 * @see Backend: apps/backend/src/modules/gamification/entities/achievement.entity.ts
 * @see SSOT: @shared/types/achievement.types.ts (public Achievement type)
 */
export interface AdminAchievement {
  id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  icon: string;
  category: AchievementCategoryEnum;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  difficulty_level: DifficultyLevelEnum;
  conditions: Record<string, unknown>; // JSON - read-only in admin
  rewards: {
    xp: number;
    ml_coins: number;
    badge?: string | null;
  };
  ml_coins_reward: number; // Denormalized for quick queries
  is_secret: boolean;
  is_active: boolean;
  is_repeatable: boolean;
  order_index: number;
  points_value: number;
  unlock_message?: string;
  instructions?: string;
  tips?: string[];
  metadata: Record<string, unknown>;
  created_by?: string;
  created_at: Date | string;
  updated_at: Date | string;
}

/**
 * Query parameters for listing achievements
 */
export interface ListAchievementsQuery {
  category?: AchievementCategoryEnum;
  isActive?: boolean;
  search?: string;
  includeSecret?: boolean;
  page?: number;
  limit?: number;
}

/**
 * DTO for updating achievement (limited fields)
 *
 * @note Requirements/conditions are intentionally NOT editable per spec
 */
export interface UpdateAchievementDto {
  name?: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
  unlock_message?: string;
  instructions?: string;
}

/**
 * Achievement Category Summary
 *
 * Statistics for a specific achievement category
 */
export interface AchievementCategoryStats {
  category: AchievementCategoryEnum;
  total: number;
  active: number;
  inactive: number;
}

/**
 * Achievement Statistics (Admin Dashboard)
 */
export interface AchievementStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: AchievementCategoryStats[];
  byRarity: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}
