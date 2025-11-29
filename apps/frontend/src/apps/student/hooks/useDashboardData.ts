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
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  required?: number;
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
  const rankCurrent = rankCurrentRes.data;
  const rankProgress = rankProgressRes.data;

  const currentRankName = rankCurrent?.current_rank || rankProgress?.current_rank || 'Ajaw';
  const transformedRankData: RankData | null =
    rankCurrent && rankProgress
      ? {
          currentRank: currentRankName,
          currentXP: rankProgress.xp_current || 0,
          nextRankXP: rankProgress.xp_required || (rankProgress.xp_current || 0) + 1000,
          multiplier: getRankMultiplier(currentRankName),
          rankIcon: getRankIcon(currentRankName),
          progress: rankProgress.progress_percentage || 0,
        }
      : null;

  // Process coins data
  const coinsData: MLCoinsData = {
    balance: coinsRes.data?.current_balance || 0,
    todayEarned: coinsRes.data?.earned_today || 0,
    todaySpent: 0,
    recentTransactions: [],
  };

  // Transform progress data from snake_case to camelCase
  const progressRaw = progressRes.data?.data || progressRes.data || null;
  const transformedProgress: ProgressData | null = progressRaw
    ? {
        totalModules: progressRaw.total_modules || 0,
        completedModules: progressRaw.completed_modules || 0,
        totalExercises: progressRaw.total_exercises || 0,
        completedExercises: progressRaw.completed_exercises || 0,
        averageScore: progressRaw.average_score || 0,
        totalTimeSpent:
          typeof progressRaw.total_time_spent === 'string'
            ? parseTimeToSeconds(progressRaw.total_time_spent)
            : progressRaw.total_time_spent || 0,
        currentStreak: progressRaw.current_streak || 0,
        longestStreak: progressRaw.longest_streak || 0,
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
