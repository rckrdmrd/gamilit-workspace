/**
 * useProfileData Hook
 *
 * Aggregates profile-related data from multiple Zustand stores
 * (auth, ranks, economy, achievements) and triggers data fetching.
 *
 * Extracted from EnhancedProfilePage to follow Thin Shell pattern.
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRanksStore } from '@/features/gamification/ranks/store/ranksStore';
import { useEconomyStore } from '@/features/gamification/economy/store/economyStore';
import { useAchievementsStore } from '@/features/gamification/social/store/achievementsStore';

export function useProfileData() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const userProgress = useRanksStore((state) => state.userProgress);
  const fetchUserProgress = useRanksStore((state) => state.fetchUserProgress);
  const balance = useEconomyStore((state) => state.balance);
  const fetchBalance = useEconomyStore((state) => state.fetchBalance);
  const achievements = useAchievementsStore((state) => state.achievements);
  const achievementStats = useAchievementsStore((state) => state.stats);
  const fetchAchievements = useAchievementsStore((state) => state.fetchAchievements);

  useEffect(() => {
    if (user?.id) {
      fetchUserProgress();
      fetchBalance();
      fetchAchievements(user.id);
    }
  }, [user?.id, fetchUserProgress, fetchBalance, fetchAchievements]);

  return {
    user,
    logout,
    userProgress,
    balance,
    achievements,
    achievementStats,
  };
}
