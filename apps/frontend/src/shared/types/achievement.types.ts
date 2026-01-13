/**
 * Achievement Types
 *
 * Type definitions for achievements and user achievement progress.
 * Used throughout the application for gamification features.
 */

/**
 * Achievement Categories
 * Different categories help organize achievements into meaningful groups
 *
 * Changed from enum to type union for better compatibility with string literals
 */
export type AchievementCategory =
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
 * Achievement Category Enum (Legacy)
 * @deprecated Use AchievementCategory string union instead for better type inference
 *
 * CORR-P1-008: Agregado HIDDEN para alinear con DDL y Backend
 */
export const AchievementCategoryEnum = {
  PROGRESS: 'progress' as const,
  STREAK: 'streak' as const,
  COMPLETION: 'completion' as const,
  SOCIAL: 'social' as const,
  SPECIAL: 'special' as const,
  MASTERY: 'mastery' as const,
  EXPLORATION: 'exploration' as const,
  COLLECTION: 'collection' as const,
  HIDDEN: 'hidden' as const, // CORR-P1-008: Agregado para alinear con Backend/DDL
} as const;

/**
 * Achievement Types
 * Determines how the achievement is displayed and rewarded
 */
export enum AchievementType {
  BADGE = 'badge',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
  RANK_PROMOTION = 'rank_promotion',
}

/**
 * Achievement Status
 * Current state of achievement for a user
 *
 * Changed from enum to type union for better compatibility with string literals
 */
export type AchievementStatus = 'locked' | 'in_progress' | 'earned' | 'claimed';

/**
 * Achievement Status Enum (Legacy)
 * @deprecated Use AchievementStatus string union instead for better type inference
 */
export const AchievementStatusEnum = {
  LOCKED: 'locked' as const,
  IN_PROGRESS: 'in_progress' as const,
  EARNED: 'earned' as const,
  CLAIMED: 'claimed' as const,
} as const;

/**
 * Achievement Condition (Frontend format)
 * Defines what needs to be accomplished to unlock an achievement
 */
export interface AchievementCondition {
  type: string;
  target: number;
  current?: number;
  description: string;
}

/**
 * Achievement Conditions (Backend format)
 * CORR-P0-004: Backend envía conditions como objeto JSONB, no array
 *
 * Estructura del backend:
 * { type: string, requirements: Record<string, unknown> }
 */
export interface AchievementConditions {
  type: string;
  requirements: Record<string, unknown>;
}

/**
 * Type union para manejar ambos formatos de conditions
 * CORR-P0-004: Alineación con estructura de Backend
 */
export type AchievementConditionsType = AchievementConditions | AchievementCondition[];

/**
 * Achievement Rewards
 * What the user receives upon earning/claiming the achievement
 */
export interface AchievementReward {
  xp: number;
  mlCoins: number;
  items?: string[];
  rankPromotion?: string;
}

/**
 * Achievement Interface
 * Complete achievement definition with all properties
 * UPDATED 2025-11-26: Campos adicionales alineados con Backend
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  icon: string;
  category: AchievementCategory;
  type: AchievementType;
  // CORR-P0-004: Acepta ambos formatos (array frontend / objeto backend)
  conditions: AchievementConditionsType;
  rewards: AchievementReward;
  isHidden: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt?: string;
  updatedAt?: string;

  // Configuration fields (aligned with Backend/Database schema)
  tenant_id?: string; // Multi-tenancy support
  difficulty_level?: 'easy' | 'medium' | 'hard' | 'expert'; // Achievement difficulty
  is_secret: boolean; // Whether achievement is secret/hidden
  is_active: boolean; // Whether achievement is currently active
  is_repeatable: boolean; // Whether achievement can be earned multiple times
  order_index: number; // Display order in lists
  points_value: number; // Point value for this achievement
  metadata?: Record<string, unknown>; // Additional flexible metadata
  created_by?: string; // User ID who created the achievement
}

/**
 * User Achievement Interface
 * Tracks a user's progress and status for a specific achievement
 *
 * CORR-ACHIEVEMENTS-001: `achievement` es opcional porque el backend
 * puede no retornar el achievement embebido (depende de si se usa relations).
 * La pagina AchievementsPage.tsx hace merge manual con getAllAchievements().
 */
export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number; // 0-100 percentage
  earnedAt?: string; // ISO date string when earned
  claimedAt?: string; // ISO date string when rewards claimed
  unlockedAt?: string; // ISO date string when unlocked (canonical field name)
  achievement?: Achievement; // Optional - may not be included in API response
  status: AchievementStatus;
}

/**
 * Achievement Filter Interface
 * Used for filtering achievements in the UI
 */
export interface AchievementFilter {
  category?: AchievementCategory | 'all';
  status?: AchievementStatus | 'all';
  sortBy?: 'name' | 'progress' | 'earnedDate' | 'rarity';
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
}

/**
 * Achievement Summary
 * Overview stats for user's achievement progress
 */
export interface AchievementSummary {
  total: number;
  earned: number;
  claimed: number;
  inProgress: number;
  locked: number;
  completionPercentage: number;
  recentlyEarned: UserAchievement[];
}

/**
 * Category-specific color mappings for UI
 */
export const ACHIEVEMENT_CATEGORY_COLORS: Record<AchievementCategory, string> = {
  progress: 'blue',
  streak: 'orange',
  completion: 'green',
  social: 'purple',
  special: 'pink',
  mastery: 'yellow',
  exploration: 'cyan',
  collection: 'teal',
  hidden: 'gray',
};

/**
 * Category display names (Spanish)
 */
export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  progress: 'Progreso',
  streak: 'Rachas',
  completion: 'Completado',
  social: 'Social',
  special: 'Especial',
  mastery: 'Maestría',
  exploration: 'Exploración',
  collection: 'Colección',
  hidden: 'Oculto',
};

/**
 * Rarity color mappings for UI
 */
export const ACHIEVEMENT_RARITY_COLORS = {
  common: 'gray',
  rare: 'blue',
  epic: 'purple',
  legendary: 'yellow',
} as const;
