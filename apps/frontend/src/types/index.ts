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
  GamificationParameter,
  GamificationStats,
  UpdateParameterDto,
  BulkUpdateParametersDto,
  UpdateMayaRankDto,
  PreviewImpactDto,
  ImpactPreview,
  ListParametersQuery,
  MayaRankConfig,
} from './admin/gamification.types';

export type {
  AdminAchievement,
  ListAchievementsQuery,
  AchievementCategoryStats,
  AchievementStats,
  UpdateAchievementDto,
} from './admin/achievements.types';

export type {
  ClassroomTeacherAssignment,
  AssignTeacherToClassroomDto,
  AssignClassroomsToTeacherDto,
  BulkAssignDto,
  ClassroomWithTeachers,
  TeacherWithClassrooms,
} from './admin/classroom-teacher.types';
