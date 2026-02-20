/**
 * Achievements Store
 *
 * @description Zustand store for managing achievement state.
 * Data is fetched from real backend APIs via fetchAchievements.
 *
 * @updated 2025-12-29 - Removed mock data from initial state
 */

import { create } from 'zustand';
import type {
  Achievement,
  AchievementUnlockNotification,
  AchievementStats,
} from '../types/achievementsTypes';
// REC-008: Consolidated to use canonical gamificationApi instead of achievementsAPI.
// gamificationApi.getAllAchievements() + gamificationApi.getUserAchievements() are combined
// locally in fetchAchievements() to produce the enriched format the store needs.
import { gamificationApi } from '@/services/api/gamification/gamificationAPI';

// Empty stats for initial state
const emptyStats: AchievementStats = {
  totalAchievements: 0,
  unlockedAchievements: 0,
  progressAchievements: 0,
  masteryAchievements: 0,
  socialAchievements: 0,
  hiddenAchievements: 0,
  totalMlCoinsEarned: 0,
  totalXpEarned: 0,
};

interface AchievementsStore {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  recentUnlocks: AchievementUnlockNotification[];
  stats: AchievementStats;
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  unlockAchievement: (achievementId: string) => void;
  updateProgress: (achievementId: string, current: number) => void;
  dismissNotification: (achievementId: string) => void;
  filterByCategory: (category: string | null) => void;
  refreshAchievements: () => void;

  // API Sync
  fetchAchievements: (userId: string) => Promise<void>;
}

const calculateStats = (achievements: Achievement[]): AchievementStats => {
  const unlocked = achievements.filter((a) => a.isUnlocked);
  const progressAchievements = unlocked.filter((a) => a.category === 'progress');
  const masteryAchievements = unlocked.filter((a) => a.category === 'mastery');
  const socialAchievements = unlocked.filter((a) => a.category === 'social');
  const hiddenAchievements = unlocked.filter((a) => a.category === 'hidden');

  return {
    totalAchievements: achievements.length,
    unlockedAchievements: unlocked.length,
    progressAchievements: progressAchievements.length,
    masteryAchievements: masteryAchievements.length,
    socialAchievements: socialAchievements.length,
    hiddenAchievements: hiddenAchievements.length,
    totalMlCoinsEarned: unlocked.reduce((sum, a) => sum + a.mlCoinsReward, 0),
    totalXpEarned: unlocked.reduce((sum, a) => sum + a.xpReward, 0),
  };
};

export const useAchievementsStore = create<AchievementsStore>((set) => ({
  achievements: [], // Fetched from API via fetchAchievements
  unlockedAchievements: [],
  recentUnlocks: [],
  stats: emptyStats,
  selectedCategory: null,
  isLoading: false,
  error: null,

  unlockAchievement: (achievementId: string) => {
    set((state) => {
      const achievement = state.achievements.find((a) => a.id === achievementId);
      if (!achievement || achievement.isUnlocked) return state;

      const updatedAchievement: Achievement = {
        ...achievement,
        isUnlocked: true,
        unlockedAt: new Date(),
      };

      const updatedAchievements = state.achievements.map((a) =>
        a.id === achievementId ? updatedAchievement : a,
      );

      const notification: AchievementUnlockNotification = {
        achievement: updatedAchievement,
        timestamp: new Date(),
        showConfetti:
          updatedAchievement.rarity === 'epic' || updatedAchievement.rarity === 'legendary',
      };

      return {
        achievements: updatedAchievements,
        unlockedAchievements: updatedAchievements.filter((a) => a.isUnlocked),
        recentUnlocks: [notification, ...state.recentUnlocks],
        stats: calculateStats(updatedAchievements),
      };
    });
  },

  updateProgress: (achievementId: string, current: number) => {
    set((state) => {
      const updatedAchievements = state.achievements.map((a) => {
        if (a.id === achievementId && a.progress) {
          const newProgress = { ...a.progress, current };

          // Auto-unlock if progress complete
          if (newProgress.current >= newProgress.required && !a.isUnlocked) {
            return {
              ...a,
              progress: newProgress,
              isUnlocked: true,
              unlockedAt: new Date(),
            };
          }

          return { ...a, progress: newProgress };
        }
        return a;
      });

      return {
        achievements: updatedAchievements,
        unlockedAchievements: updatedAchievements.filter((a) => a.isUnlocked),
        stats: calculateStats(updatedAchievements),
      };
    });
  },

  dismissNotification: (achievementId: string) => {
    set((state) => ({
      recentUnlocks: state.recentUnlocks.filter((n) => n.achievement.id !== achievementId),
    }));
  },

  filterByCategory: (category: string | null) => {
    set({ selectedCategory: category });
  },

  refreshAchievements: () => {
    set((state) => ({
      stats: calculateStats(state.achievements),
    }));
  },

  /**
   * Fetch achievements from backend for specific user
   *
   * REC-008: Uses canonical gamificationApi (getAllAchievements + getUserAchievements)
   * and merges them locally, replacing the previous achievementsAPI dependency.
   *
   * @param userId - User ID to fetch achievements for
   */
  fetchAchievements: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // REC-008: Fetch all achievements and user progress via canonical gamificationApi
      const [allAchievements, userAchievements] = await Promise.all([
        gamificationApi.getAllAchievements(),
        gamificationApi.getUserAchievements(userId),
      ]);

      // Build a lookup map of user progress by achievementId
      const userProgressMap = new Map(
        userAchievements.map((ua) => [ua.achievementId, ua]),
      );

      // Merge achievement definitions (SSOT Achievement) with user progress (UserAchievement)
      // to produce the AchievementWithProgress view model used by this store
      const achievements: Achievement[] = allAchievements.map((ach) => {
        const userProgress = userProgressMap.get(ach.id);
        const isUnlocked = userProgress?.status === 'earned' || userProgress?.status === 'claimed';
        return {
          id: ach.id,
          title: ach.name,
          name: ach.name,
          description: ach.description,
          category: (ach.category ?? 'progress') as Achievement['category'],
          rarity: ach.rarity ?? 'common',
          icon: ach.icon,
          mlCoinsReward: ach.rewards?.mlCoins ?? 0,
          xpReward: ach.rewards?.xp ?? 0,
          isUnlocked,
          unlockedAt: userProgress?.earnedAt ? new Date(userProgress.earnedAt) : undefined,
          progress: userProgress
            ? { current: userProgress.progress ?? 0, required: 100 }
            : undefined,
          isHidden: ach.isHidden ?? false,
          rewardsClaimed: userProgress?.status === 'claimed',
        };
      });

      const stats = calculateStats(achievements);

      set({
        achievements,
        unlockedAchievements: achievements.filter((a) => a.isUnlocked),
        stats,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch achievements';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('Error fetching achievements:', error);
    }
  },
}));
