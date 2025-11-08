import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api/apiClient';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Helper function to get rank icon
function getRankIcon(rank: string): string {
  const icons: Record<string, string> = {
    'Nacom': '🔍',
    'Ajaw': '🏹',
    "Ah K'in": '🗡️',
    'Halach Uinic': '⚔️',
    "K'uk'ulkan": '👑',
  };
  return icons[rank] || '🔍';
}

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

export function useDashboardData() {
  const { user, isAuthenticated } = useAuth();

  const [data, setData] = useState<DashboardData>({
    coins: null,
    rank: null,
    achievements: [],
    progress: null,
    recentAchievements: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    // Don't fetch if no user is authenticated
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      return;
    }

    const userId = user.id;
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      // Fetch all data in parallel
      const [coinsRes, rankRes, achievementsRes, progressRes] = await Promise.all([
        apiClient.get(`/gamification/coins/${userId}`),
        apiClient.get(`/gamification/ranks/user/${userId}`),
        apiClient.get(`/gamification/achievements/${userId}`),
        apiClient.get(`/educational/progress/user/${userId}`),
      ]);

      // Extract data from backend response structure { success: true, data: {...} }
      const achievementsData = achievementsRes.data.data;
      const recentUnlocked = achievementsData
        .filter((a: AchievementData) => a.unlocked && a.unlockedAt)
        .sort((a: AchievementData, b: AchievementData) =>
          new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
        )
        .slice(0, 5);

      // Transform rank data from API format to component format
      const rankApiData = rankRes.data.data;
      const transformedRankData: RankData | null = rankApiData ? {
        currentRank: rankApiData.currentRank?.rank || 'Nacom',
        currentXP: rankApiData.progress?.currentXP || 0,
        nextRankXP: rankApiData.nextRank?.xpRequired || (rankApiData.progress?.currentXP || 0) + 1000, // Fallback for max rank
        multiplier: rankApiData.currentRank?.multiplier || 1,
        rankIcon: getRankIcon(rankApiData.currentRank?.rank || 'Nacom'),
        progress: rankApiData.progress?.percentage || 0,
      } : null;

      setData({
        coins: coinsRes.data.data,
        rank: transformedRankData,
        achievements: achievementsData,
        progress: progressRes.data.data,
        recentAchievements: recentUnlocked,
      });

      // Clear error on success
      setError(null);
    } catch (err) {
      // Set proper error message without falling back to mock data
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos del dashboard';
      console.error('Error fetching dashboard data:', err);
      setError(errorMessage);

      // Keep existing data or set to null if first load
      if (!isRefresh) {
        setData({
          coins: null,
          rank: null,
          achievements: [],
          progress: null,
          recentAchievements: [],
        });
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refresh = useCallback(() => {
    return fetchDashboardData(true);
  }, [fetchDashboardData]);

  return {
    ...data,
    loading,
    error,
    isRefreshing,
    refresh,
  };
}
