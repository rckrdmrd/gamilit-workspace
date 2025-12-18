/**
 * Types Index
 *
 * Central exports for type definitions used across the application.
 *
 * @description
 * This file provides convenient imports for types used in components and pages.
 * For shared types across the entire app, see /shared/types/
 */

// User Statistics
export type { UserStats, StreakStats } from './userStats';

// Admin Types
export type {
  GamificationConfig,
  MayaRankConfig,
  XPRewardConfig,
  MLCoinsRewardConfig,
  StreakConfig,
  LevelConfig,
  UpdateGamificationConfigDto,
} from './admin/gamification.types';

export type {
  Achievement,
  AchievementCategory,
  AchievementType,
  AchievementTier,
  AchievementRequirement,
  CreateAchievementDto,
  UpdateAchievementDto,
} from './admin/achievements.types';

export type {
  ClassroomTeacher,
  CreateClassroomTeacherDto,
  UpdateClassroomTeacherDto,
  ClassroomTeacherFilters,
  PaginatedClassroomTeachers,
} from './admin/classroom-teacher.types';
