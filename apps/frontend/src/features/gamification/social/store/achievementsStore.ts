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
// NOTA: Se mantiene achievementsAPI porque retorna AchievementAPIResponse[] (achievement + progress)
// gamificationApi.getUserAchievements retorna UserAchievement[] (solo progress) - formato incompatible
// TODO: Agregar método getUserAchievementsWithDetails a gamificationApi para poder consolidar
import { getUserAchievements } from '../api/achievementsAPI';

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
   * @param userId - User ID to fetch achievements for
   */
  fetchAchievements: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch user achievements with progress from backend
      const achievementsWithProgress = await getUserAchievements(userId);

      // Map backend response to frontend Achievement type
      // CORR-P2-001: Usar ?? (nullish coalescing) en lugar de || para respetar valores de 0
      const achievements: Achievement[] = achievementsWithProgress.map((ach) => ({
        id: ach.id,
        title: ach.name,
        description: ach.description,
        category: ach.category as Achievement['category'],
        rarity: ach.rarity,
        icon: ach.icon,
        // CORR-P2-001: ?? permite que 0 sea un valor válido (0 ML coins es válido)
        mlCoinsReward: ach.rewards?.ml_coins ?? ach.ml_coins_reward ?? 0,
        xpReward: ach.rewards?.xp ?? ach.points_value ?? 0,
        isUnlocked: ach.isUnlocked ?? false,
        unlockedAt: ach.unlockedAt,
        progress: ach.progress,
        requirements: ach.conditions?.requirements,
        isHidden: ach.is_secret ?? (ach.category === 'hidden' || ach.category === 'special'),
        rewardsClaimed: ach.rewardsClaimed ?? false,
      }));

      set({
        achievements,
        unlockedAchievements: achievements.filter((a) => a.isUnlocked),
        stats: calculateStats(achievements),
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
