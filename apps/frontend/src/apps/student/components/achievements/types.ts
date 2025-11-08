/**
 * Achievement Page Types
 * Extended types for the comprehensive achievements page
 */

import type { Achievement as BaseAchievement, AchievementCategory, AchievementRarity } from '@/features/gamification/social/types/achievementsTypes';

// Extended Achievement interface with additional fields
export interface Achievement extends BaseAchievement {
  requirements: string[];
  shareUrl?: string;
}

// Filter types
export type FilterStatus = 'all' | 'unlocked' | 'locked' | 'in_progress';
export type SortOption = 'recent' | 'alphabetical' | 'rarity' | 'progress';

export interface AchievementFilters {
  category: AchievementCategory | 'all';
  rarity: AchievementRarity | 'all';
  status: FilterStatus;
  searchQuery: string;
  sortBy: SortOption;
}

// Statistics interface
export interface AchievementStatistics {
  total: number;
  unlocked: number;
  locked: number;
  inProgress: number;
  completionRate: number;
  pointsEarned: number;
  mlCoinsEarned: number;
  byRarity: Record<AchievementRarity, number>;
  byCategory: Record<AchievementCategory, number>;
  recentUnlocks: Achievement[];
  rarestUnlocked: Achievement[];
}

// Category configuration
export interface CategoryConfig {
  value: AchievementCategory | 'all';
  label: string;
  icon: string;
  color: string;
  gradient: string;
}

// Rarity configuration
export interface RarityConfig {
  value: AchievementRarity | 'all';
  label: string;
  color: string;
  borderColor: string;
  glowColor: string;
  gradient: string;
}
