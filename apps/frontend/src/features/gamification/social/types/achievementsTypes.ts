/**
 * Achievement Types
 * Defines all types for the achievement system
 *
 * NOTE: Backend uses different category names. Mapping:
 * - Frontend 'progress' -> Backend 'educational', 'progress'
 * - Frontend 'mastery' -> Backend 'mastery', 'skill'
 * - Frontend 'social' -> Backend 'social'
 * - Frontend 'hidden' -> Backend 'hidden', 'special'
 */

export type AchievementCategory = 'progress' | 'mastery' | 'social' | 'hidden';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementProgress {
  current: number;
  required: number;
}

export interface AchievementRequirements {
  prerequisiteAchievements?: string[];
  rank?: string;
  level?: number;
  exercisesCompleted?: number;
  perfectScores?: number;
  friendsCount?: number;
  guildMembership?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  mlCoinsReward: number;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: AchievementProgress;
  requirements?: AchievementRequirements;
  isHidden?: boolean;
}

export interface AchievementUnlockNotification {
  achievement: Achievement;
  timestamp: Date;
  showConfetti: boolean;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  progressAchievements: number;
  masteryAchievements: number;
  socialAchievements: number;
  hiddenAchievements: number;
  totalMlCoinsEarned: number;
  totalXpEarned: number;
}
