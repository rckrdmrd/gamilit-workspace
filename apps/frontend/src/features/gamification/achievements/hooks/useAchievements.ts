/**
 * useAchievements Hook
 *
 * React Query-based hook for fetching achievements data.
 * Replaces useState + useEffect pattern in AchievementsPage.
 *
 * @module features/gamification/achievements/hooks/useAchievements
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { gamificationApi } from '@/services/api/gamification/gamificationAPI';
import { useInvalidateDashboard } from '@/shared/hooks/useInvalidateDashboard';
import type {
  Achievement,
  UserAchievement,
  AchievementSummary,
  AchievementFilter,
} from '@/shared/types/achievement.types';

// ============================================================================
// Query Keys
// ============================================================================

export const achievementKeys = {
  all: ['achievements'] as const,
  list: () => [...achievementKeys.all, 'list'] as const,
  user: (userId: string) => [...achievementKeys.all, 'user', userId] as const,
  summary: (userId: string) => [...achievementKeys.all, 'summary', userId] as const,
};

// ============================================================================
// Types
// ============================================================================

interface CombinedAchievement {
  achievement: Achievement;
  userAchievement?: UserAchievement;
}

interface AchievementDisplaySummary {
  total: number;
  earned: number;
  claimed: number;
  inProgress: number;
  locked: number;
  completionPercentage: number;
  recentlyEarned: UserAchievement[];
}

interface UseAchievementsReturn {
  /** All achievements combined with user progress */
  combinedAchievements: CombinedAchievement[];
  /** Display summary stats */
  displaySummary: AchievementDisplaySummary;
  /** Loading state */
  isLoading: boolean;
  /** Error from achievements or user data fetching */
  error: string | null;
  /** Retry loading all data */
  retry: () => void;
  /** Claim an achievement's rewards */
  claimRewards: (achievementId: string) => Promise<void>;
  /** Whether a claim mutation is in progress */
  isClaiming: boolean;
}

// ============================================================================
// Helper: Compute summary from raw data
// ============================================================================

function computeSummary(
  apiSummary: AchievementSummary | null,
  allAchievements: Achievement[],
  userAchievements: UserAchievement[],
): AchievementDisplaySummary {
  if (apiSummary) {
    // Handle both snake_case API format and camelCase frontend format
    const raw = apiSummary as unknown as Record<string, unknown>;
    const total =
      (raw.total_available as number | undefined) ??
      apiSummary.total ??
      allAchievements.length;
    const earned =
      (raw.completed as number | undefined) ?? apiSummary.earned ?? 0;
    const unclaimedCount = (raw.unclaimed_rewards as number | undefined) ?? 0;
    const claimed = earned - unclaimedCount;
    const inProgress = userAchievements.filter((ua) => ua.status === 'in_progress').length;
    const locked = total - earned - inProgress;

    return {
      total,
      earned,
      claimed,
      inProgress,
      locked,
      completionPercentage:
        (raw.completion_percentage as number | undefined) ??
        (total > 0 ? (earned / total) * 100 : 0),
      recentlyEarned: apiSummary.recentlyEarned ?? [],
    };
  }

  // Compute from raw data
  const total = allAchievements.length;
  const earned = userAchievements.filter(
    (ua) => ua.status === 'earned' || ua.status === 'claimed',
  ).length;
  const claimed = userAchievements.filter((ua) => ua.status === 'claimed').length;
  const inProgress = userAchievements.filter((ua) => ua.status === 'in_progress').length;
  const locked = total - earned - inProgress;
  const completionPercentage = total > 0 ? (earned / total) * 100 : 0;
  const recentlyEarned = userAchievements
    .filter((ua) => ua.earnedAt)
    .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
    .slice(0, 3);

  return { total, earned, claimed, inProgress, locked, completionPercentage, recentlyEarned };
}

// ============================================================================
// Hook
// ============================================================================

export function useAchievements(): UseAchievementsReturn {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const { syncAndInvalidate } = useInvalidateDashboard();

  // Fetch all achievements
  const {
    data: allAchievements = [],
    isLoading: isLoadingAll,
    error: allError,
  } = useQuery({
    queryKey: achievementKeys.list(),
    queryFn: () => gamificationApi.getAllAchievements(),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user achievements
  const {
    data: userAchievements = [],
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: achievementKeys.user(userId || ''),
    queryFn: () => gamificationApi.getUserAchievements(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch achievement summary (optional, may not exist)
  const { data: apiSummary = null } = useQuery({
    queryKey: achievementKeys.summary(userId || ''),
    queryFn: () => gamificationApi.getAchievementSummary(userId!).catch(() => null),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Combine achievements with user progress
  const combinedAchievements = useMemo(() => {
    const userAchMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));
    return allAchievements.map((achievement) => ({
      achievement,
      userAchievement: userAchMap.get(achievement.id),
    }));
  }, [allAchievements, userAchievements]);

  // Compute display summary
  const displaySummary = useMemo(
    () => computeSummary(apiSummary, allAchievements, userAchievements),
    [apiSummary, allAchievements, userAchievements],
  );

  // Claim mutation
  const claimMutation = useMutation({
    mutationFn: (achievementId: string) =>
      gamificationApi.claimAchievement(userId!, achievementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.user(userId || '') });
      queryClient.invalidateQueries({ queryKey: achievementKeys.summary(userId || '') });
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      syncAndInvalidate();
    },
  });

  // Error message
  const error = allError
    ? 'Error al cargar logros. Por favor, intenta de nuevo.'
    : userError
      ? 'Error al cargar tu progreso de logros.'
      : null;

  // Retry function
  const retry = () => {
    queryClient.invalidateQueries({ queryKey: achievementKeys.all });
    if (userId) {
      queryClient.invalidateQueries({ queryKey: achievementKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: achievementKeys.summary(userId) });
    }
  };

  return {
    combinedAchievements,
    displaySummary,
    isLoading: isLoadingAll || isLoadingUser,
    error,
    retry,
    claimRewards: async (achievementId: string) => {
      await claimMutation.mutateAsync(achievementId);
    },
    isClaiming: claimMutation.isPending,
  };
}

// ============================================================================
// Filter/Sort Hook
// ============================================================================

interface UseAchievementFiltersReturn {
  earnedAchievements: CombinedAchievement[];
  pendingAchievements: CombinedAchievement[];
  hiddenAchievements: CombinedAchievement[];
}

export function useAchievementFilters(
  combinedAchievements: CombinedAchievement[],
  filter: AchievementFilter,
): UseAchievementFiltersReturn {
  return useMemo(() => {
    let filtered = combinedAchievements;

    // Filter by category
    if (filter.category && filter.category !== 'all') {
      filtered = filtered.filter((item) => item.achievement.category === filter.category);
    }

    // Filter by status
    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter((item) => {
        const status = item.userAchievement?.status || 'locked';
        return status === filter.status;
      });
    }

    // Filter by search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.achievement.name.toLowerCase().includes(query) ||
          item.achievement.description.toLowerCase().includes(query),
      );
    }

    // Sort
    if (filter.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        let compareResult = 0;

        switch (filter.sortBy) {
          case 'name':
            compareResult = a.achievement.name.localeCompare(b.achievement.name);
            break;
          case 'progress':
            compareResult =
              (a.userAchievement?.progress || 0) - (b.userAchievement?.progress || 0);
            break;
          case 'earnedDate': {
            const dateA = a.userAchievement?.earnedAt
              ? new Date(a.userAchievement.earnedAt).getTime()
              : 0;
            const dateB = b.userAchievement?.earnedAt
              ? new Date(b.userAchievement.earnedAt).getTime()
              : 0;
            compareResult = dateA - dateB;
            break;
          }
          case 'rarity': {
            const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
            const rarityA = rarityOrder[a.achievement.rarity || 'common'] || 0;
            const rarityB = rarityOrder[b.achievement.rarity || 'common'] || 0;
            compareResult = rarityA - rarityB;
            break;
          }
        }

        return filter.sortOrder === 'asc' ? compareResult : -compareResult;
      });
    }

    // Segregate into earned, pending, hidden
    const earned: CombinedAchievement[] = [];
    const pending: CombinedAchievement[] = [];
    const hidden: CombinedAchievement[] = [];

    filtered.forEach((item) => {
      const status = item.userAchievement?.status || 'locked';
      const isLocked = status === 'locked';
      const isEarned = status === 'earned' || status === 'claimed';

      if (item.achievement.isHidden && isLocked) {
        hidden.push(item);
      } else if (isEarned) {
        earned.push(item);
      } else {
        pending.push(item);
      }
    });

    // Sort earned by most recent first
    earned.sort((a, b) => {
      const dateA = a.userAchievement?.earnedAt
        ? new Date(a.userAchievement.earnedAt).getTime()
        : 0;
      const dateB = b.userAchievement?.earnedAt
        ? new Date(b.userAchievement.earnedAt).getTime()
        : 0;
      return dateB - dateA;
    });

    return {
      earnedAchievements: earned,
      pendingAchievements: pending,
      hiddenAchievements: hidden,
    };
  }, [combinedAchievements, filter]);
}
