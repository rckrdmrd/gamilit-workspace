/**
 * Student Portal Types Barrel
 *
 * Centralized exports for all student portal type definitions.
 * Import from '@/apps/student/types' for student-specific types.
 *
 * For shared types (User, Exercise, Achievement, etc.), use:
 *   import type { ... } from '@/shared/types/...'
 *
 * @module apps/student/types
 */

// =====================================================
// GAMIFICATION TYPES (student-specific shapes)
// =====================================================

export type {
  LeaderboardEntry,
  LeaderboardPosition,
  Mission,
  StreakData,
} from './gamificationTypes';

// =====================================================
// COMPONENT-LEVEL TYPES (re-exported for convenience)
// =====================================================

// Achievement page types (extends shared BaseAchievement)
export type {
  Achievement as StudentAchievement,
  FilterStatus as AchievementFilterStatus,
  SortOption as AchievementSortOption,
  AchievementFiltersState,
  AchievementStatisticsData,
  CategoryConfig,
  RarityConfig,
  AchievementStatistics,
  AchievementFilters,
} from '../components/achievements/types';

// Profile component types
export type {
  ProfileStat,
  RankHistoryEntry,
} from '../components/profile/types';
