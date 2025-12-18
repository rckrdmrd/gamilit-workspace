/**
 * useDashboardData Hook
 *
 * @description Fetches dashboard data for the student portal using React Query.
 * Replaces useState + useEffect pattern with proper server state management.
 *
 * @endpoint Multiple endpoints fetched in parallel:
 *   - GET /api/v1/gamification/users/:userId/ml-coins
 *   - GET /api/v1/gamification/ranks/current
 *   - GET /api/v1/gamification/ranks/users/:userId/rank-progress
 *   - GET /api/v1/gamification/users/:userId/achievements
 *   - GET /api/v1/progress/users/:userId/summary
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { useAuth } from '@/features/auth/hooks/useAuth';

// ============================================================================
// Query Keys Factory
// ============================================================================

export const dashboardKeys = {
  all: ['dashboard'] as const,
  user: (userId: string) => [...dashboardKeys.all, userId] as const,
  coins: (userId: string) => [...dashboardKeys.user(userId), 'coins'] as const,
  rank: (userId: string) => [...dashboardKeys.user(userId), 'rank'] as const,
  achievements: (userId: string) => [...dashboardKeys.user(userId), 'achievements'] as const,
  progress: (userId: string) => [...dashboardKeys.user(userId), 'progress'] as const,
};

// ============================================================================
// Helper Functions
// ============================================================================

function getRankIcon(rank: string): string {
  const icons: Record<string, string> = {
    Nacom: '🔍',
    Ajaw: '🏹',
    "Ah K'in": '🗡️',
    'Halach Uinic': '⚔️',
    "K'uk'ulkan": '👑',
  };
  return icons[rank] || '🔍';
}

function getRankMultiplier(rank: string): number {
  const multipliers: Record<string, number> = {
    Ajaw: 1.0,
    Nacom: 1.2,
    "Ah K'in": 1.5,
    'Halach Uinic': 2.0,
    "K'uk'ulkan": 3.0,
  };
  return multipliers[rank] || 1.0;
}

// ============================================================================
// Types
// ============================================================================

export interface MLCoinsData {
  balance: number;
  todayEarned: number;
  todaySpent: number;
  recentTransactions: {
    id: string;
    type: 'earned' | 'spent';
    amount: number;
    description: string;
    timestamp: string;
  }[];
}

export interface RankData {
  currentRank: string;
  currentXP: number;
  nextRankXP: number;
  multiplier: number;
  rankIcon: string;
  progress: number;
}

export interface AchievementData {
  id: string;
  name: string;
  title?: string; // Alias for compatibility with Achievement type
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category?: string;
  icon: string;
  unlocked: boolean;
  isUnlocked?: boolean; // Alias for compatibility with Achievement type
  unlockedAt?: string;
  progress?: number;
  required?: number;
  // Reward fields (IMPL-005: added for dynamic rewards display)
  mlCoinsReward?: number;
  xpReward?: number;
  rewards?: {
    ml_coins?: number;
    xp?: number;
  };
}

export interface ProgressData {
  totalModules: number;
  completedModules: number;
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
}

interface DashboardData {
  coins: MLCoinsData | null;
  rank: RankData | null;
  achievements: AchievementData[];
  progress: ProgressData | null;
  recentAchievements: AchievementData[];
}

// ============================================================================
// Helper Functions for Data Transformation
// ============================================================================

function parseTimeToSeconds(timeStr: string): number {
  // Formato esperado: "HH:MM:SS"
  const parts = timeStr.split(':');
  if (parts.length !== 3) return 0;
  const [hours, minutes, seconds] = parts.map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// ============================================================================
// API Fetch Function
// ============================================================================

async function fetchDashboardData(userId: string): Promise<DashboardData> {
  console.log('🚀 [useDashboardData] Fetching dashboard data for userId:', userId);

  // Fetch all data in parallel
  const [coinsRes, rankCurrentRes, rankProgressRes, achievementsRes, progressRes] =
    await Promise.all([
      apiClient.get(`/gamification/users/${userId}/ml-coins`),
      apiClient.get(`/gamification/ranks/current`),
      apiClient.get(`/gamification/ranks/users/${userId}/rank-progress`),
      apiClient.get(`/gamification/users/${userId}/achievements`),
      apiClient.get(`/progress/users/${userId}/summary`),
    ]);

  console.log('✅ [useDashboardData] API calls completed successfully');

  // Process achievements data
  const achievementsData = achievementsRes.data?.data || achievementsRes.data || [];
  const recentUnlocked = Array.isArray(achievementsData)
    ? achievementsData
        .filter((a: AchievementData) => a.unlocked && a.unlockedAt)
        .sort(
          (a: AchievementData, b: AchievementData) =>
            new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime(),
        )
        .slice(0, 5)
    : [];

  // Transform rank data from API format to component format
  // NOTE: apiClient does NOT transform snake_case -> camelCase, we use snake_case
  const rankCurrent = rankCurrentRes.data;
  const rankProgress = rankProgressRes.data;

  console.log('🔍 [useDashboardData] rankCurrent:', rankCurrent);
  console.log('🔍 [useDashboardData] rankProgress:', rankProgress);

  // Backend returns snake_case: current_rank, xp_current, xp_required, progress_percentage
  const currentRankName =
    rankCurrent?.current_rank ||
    rankProgress?.current_rank ||
    rankCurrent?.currentRank ||
    rankProgress?.currentRank ||
    'Ajaw';

  const transformedRankData: RankData | null =
    rankCurrent || rankProgress
      ? {
          currentRank: currentRankName,
          currentXP: rankProgress?.xp_current || rankProgress?.xpCurrent || 0,
          nextRankXP:
            rankProgress?.xp_required ||
            rankProgress?.xpRequired ||
            (rankProgress?.xp_current || rankProgress?.xpCurrent || 0) + 1000,
          multiplier: getRankMultiplier(currentRankName),
          rankIcon: getRankIcon(currentRankName),
          progress: rankProgress?.progress_percentage || rankProgress?.progressPercentage || 0,
        }
      : null;

  // Process coins data (backend uses snake_case)
  const coinsData: MLCoinsData = {
    balance:
      coinsRes.data?.current_balance ||
      coinsRes.data?.currentBalance ||
      coinsRes.data?.ml_coins ||
      coinsRes.data?.mlCoins ||
      0,
    todayEarned:
      coinsRes.data?.earned_today ||
      coinsRes.data?.earnedToday ||
      coinsRes.data?.ml_coins_earned_today ||
      coinsRes.data?.mlCoinsEarnedToday ||
      0,
    todaySpent: coinsRes.data?.spent_today || coinsRes.data?.spentToday || 0,
    recentTransactions: [],
  };

  // Transform progress data (backend uses snake_case)
  const progressRaw = progressRes.data?.data || progressRes.data || null;
  const transformedProgress: ProgressData | null = progressRaw
    ? {
        totalModules: progressRaw.total_modules || progressRaw.totalModules || 0,
        completedModules: progressRaw.completed_modules || progressRaw.completedModules || 0,
        totalExercises: progressRaw.total_exercises || progressRaw.totalExercises || 0,
        completedExercises: progressRaw.completed_exercises || progressRaw.completedExercises || 0,
        averageScore: progressRaw.average_score || progressRaw.averageScore || 0,
        totalTimeSpent:
          typeof (progressRaw.total_time_spent || progressRaw.totalTimeSpent) === 'string'
            ? parseTimeToSeconds(progressRaw.total_time_spent || progressRaw.totalTimeSpent)
            : progressRaw.total_time_spent || progressRaw.totalTimeSpent || 0,
        currentStreak: progressRaw.current_streak || progressRaw.currentStreak || 0,
        longestStreak: progressRaw.longest_streak || progressRaw.longestStreak || 0,
      }
    : null;

  return {
    coins: coinsData,
    rank: transformedRankData,
    achievements: achievementsData,
    progress: transformedProgress,
    recentAchievements: recentUnlocked,
  };
}

// ============================================================================
// Hook
// ============================================================================

export function useDashboardData() {
  const { user, isAuthenticated } = useAuth();
  const _queryClient = useQueryClient();
  const userId = user?.id;

  const {
    data,
    isLoading: loading,
    error,
    isFetching: isRefreshing,
    refetch,
  } = useQuery<DashboardData, Error>({
    queryKey: dashboardKeys.user(userId || ''),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return fetchDashboardData(userId);
    },
    enabled: isAuthenticated && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Maintain backward compatibility with existing API
  const refresh = async () => {
    await refetch();
  };

  return {
    coins: data?.coins ?? null,
    rank: data?.rank ?? null,
    achievements: data?.achievements ?? [],
    progress: data?.progress ?? null,
    recentAchievements: data?.recentAchievements ?? [],
    loading,
    error: error?.message ?? null,
    isRefreshing: isRefreshing && !loading,
    refresh,
  };
}
