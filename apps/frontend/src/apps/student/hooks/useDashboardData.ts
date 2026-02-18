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

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MAYA_RANKS, type MayaRank } from '@/shared/constants/ranks.constants';

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
  return MAYA_RANKS[rank as MayaRank]?.icon || '🌱';
}

/**
 * Multiplicadores de ML Coins por rango Maya
 * SINCRONIZADO con backend rank-multiplier.service.ts (ML Coins multipliers)
 * NOTA: Estos NO son los xp_multiplier de la DB (1.0-1.25), sino los multiplicadores
 * de ML Coins del backend (1.0-2.0). Ver ranks.constants.ts para xpMultiplier.
 */
function getRankMultiplier(rank: string): number {
  const multipliers: Record<string, number> = {
    Ajaw: 1.0,
    Nacom: 1.25,           // FIX 2026-01-04: era 1.2
    "Ah K'in": 1.5,
    'Halach Uinic': 1.75,  // FIX 2026-01-04: era 2.0
    "K'uk'ulkan": 2.0,     // FIX 2026-01-04: era 3.0
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
  rank: RankData; // FIX 2026-01-04: Siempre tiene valor (con fallbacks)
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
  // FIX 2026-01-04: Usar Promise.allSettled para que un endpoint fallido no rompa todo
  // Antes: Promise.all fallaba TODO si un endpoint retornaba 404
  const results = await Promise.allSettled([
    apiClient.get(`/gamification/users/${userId}/ml-coins`),
    apiClient.get(`/gamification/ranks/current`),
    apiClient.get(`/gamification/ranks/users/${userId}/rank-progress`),
    apiClient.get(`/gamification/users/${userId}/achievements`),
    apiClient.get(`/progress/users/${userId}/summary`),
  ]);

  // Extraer resultados con fallbacks para endpoints que fallaron
  const coinsRes = results[0].status === 'fulfilled' ? results[0].value : null;
  const rankCurrentRes = results[1].status === 'fulfilled' ? results[1].value : null;
  const rankProgressRes = results[2].status === 'fulfilled' ? results[2].value : null;
  const achievementsRes = results[3].status === 'fulfilled' ? results[3].value : null;
  const progressRes = results[4].status === 'fulfilled' ? results[4].value : null;

  // Log de errores para debugging (sin romper flujo)
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const endpoints = ['ml-coins', 'ranks/current', 'rank-progress', 'achievements', 'progress'];
      console.warn(`⚠️ [useDashboardData] Endpoint ${endpoints[index]} failed:`, result.reason);
    }
  });

  // Process achievements data (con fallback si endpoint fallo)
  // FIX: CORR-005 - Handle new response structure { data: { achievements, total } }
  // and transform backend fields (snake_case) to frontend fields (camelCase)
  const achievementsRaw = achievementsRes?.data?.data || achievementsRes?.data || {};
  let achievementsRawArray: Record<string, unknown>[] = [];
  if (Array.isArray(achievementsRaw)) {
    achievementsRawArray = achievementsRaw;
  } else if (achievementsRaw?.achievements && Array.isArray(achievementsRaw.achievements)) {
    achievementsRawArray = achievementsRaw.achievements;
  } else if (achievementsRaw?.data?.achievements && Array.isArray(achievementsRaw.data.achievements)) {
    achievementsRawArray = achievementsRaw.data.achievements;
  }

  // Transform backend fields to frontend AchievementData format
  // Backend: is_completed, completed_at, achievement_id, etc.
  // Frontend: unlocked, unlockedAt, id, etc.
  // FIX: CORR-ACH-001 - Priorizar datos del achievement embebido (relacion)
  const achievementsData: AchievementData[] = achievementsRawArray.map((raw: Record<string, unknown>) => {
    // Extraer achievement embebido (si existe) - el backend envia la relacion
    const ach = (raw.achievement || {}) as Record<string, unknown>;
    const achRewards = (ach.rewards || {}) as Record<string, unknown>;

    return {
      // ID: Priorizar achievement_id para user_achievements
      id: (raw.achievement_id || raw.achievementId || raw.id || ach.id) as string,

      // Nombre y descripcion del achievement embebido
      name: ((ach.name || raw.name || 'Achievement') as string),
      title: ((ach.name || raw.name || 'Achievement') as string),
      description: ((ach.description || raw.description || '') as string),

      // Rarity y category del achievement
      rarity: ((ach.rarity || raw.rarity || 'common') as AchievementData['rarity']),
      category: ((ach.category || raw.category || 'progress') as string),

      // Icon del achievement
      icon: ((ach.icon || raw.icon || 'trophy') as string),

      // Estado de completado (de user_achievement)
      unlocked: ((raw.is_completed ?? raw.isCompleted ?? raw.unlocked ?? false) as boolean),
      isUnlocked: ((raw.is_completed ?? raw.isCompleted ?? raw.unlocked ?? false) as boolean),
      unlockedAt: (raw.completed_at || raw.completedAt || raw.unlockedAt) as string | undefined,

      // Progreso (de user_achievement)
      progress: (raw.progress ?? 0) as number,
      required: ((raw.max_progress || raw.maxProgress || ach.max_progress || 100) as number),

      // Rewards: Priorizar achievement embebido, usar ?? para respetar 0
      mlCoinsReward: ((ach.ml_coins_reward ?? achRewards.ml_coins ?? raw.ml_coins_reward ?? 0) as number),
      xpReward: ((ach.points_value ?? achRewards.xp ?? raw.xp_reward ?? 0) as number),
      rewards: (ach.rewards || raw.rewards) as AchievementData['rewards'],
    };
  });

  const recentUnlocked = achievementsData
    .filter((a: AchievementData) => a.unlocked && a.unlockedAt)
    .sort(
      (a: AchievementData, b: AchievementData) =>
        new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime(),
    )
    .slice(0, 5);

  // Transform rank data from API format to component format
  // FIX 2026-01-04: Manejar respuestas null de endpoints fallidos
  const rankCurrent = rankCurrentRes?.data || null;
  const rankProgress = rankProgressRes?.data || null;

  // Backend returns snake_case: current_rank, xp_current, xp_required, progress_percentage
  // FIX 2026-01-04: Fallback a 'Ajaw' si no hay datos de rango
  const currentRankName =
    rankCurrent?.current_rank ||
    rankProgress?.current_rank ||
    rankCurrent?.currentRank ||
    rankProgress?.currentRank ||
    'Ajaw';

  // FIX 2026-01-04: Siempre retornar datos de rango (con fallbacks)
  // Antes: retornaba null si no habia datos, causando errores en widgets
  const transformedRankData: RankData = {
    currentRank: currentRankName,
    currentXP: rankProgress?.xp_current || rankProgress?.xpCurrent || 0,
    nextRankXP:
      rankProgress?.xp_required ||
      rankProgress?.xpRequired ||
      500, // XP para siguiente rango (Nacom) por defecto
    multiplier: getRankMultiplier(currentRankName),
    rankIcon: getRankIcon(currentRankName),
    progress: rankProgress?.progress_percentage || rankProgress?.progressPercentage || 0,
  };

  // Process coins data (backend uses snake_case)
  // FIX 2026-01-04: Manejar coinsRes null si endpoint fallo
  const coinsData: MLCoinsData = {
    balance:
      coinsRes?.data?.current_balance ||
      coinsRes?.data?.currentBalance ||
      coinsRes?.data?.ml_coins ||
      coinsRes?.data?.mlCoins ||
      0,
    todayEarned:
      coinsRes?.data?.earned_today ||
      coinsRes?.data?.earnedToday ||
      coinsRes?.data?.ml_coins_earned_today ||
      coinsRes?.data?.mlCoinsEarnedToday ||
      0,
    todaySpent: coinsRes?.data?.spent_today || coinsRes?.data?.spentToday || 0,
    recentTransactions: [],
  };

  // Transform progress data (backend uses snake_case)
  // FIX 2026-01-04: Manejar progressRes null si endpoint fallo
  const progressRaw = progressRes?.data?.data || progressRes?.data || null;
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

  // FIX 2026-01-04: Fallback para rank cuando query no ha cargado aun
  const defaultRankData: RankData = {
    currentRank: 'Ajaw',
    currentXP: 0,
    nextRankXP: 500,
    multiplier: 1.0,
    rankIcon: '🌱',
    progress: 0,
  };

  return {
    coins: data?.coins ?? null,
    rank: data?.rank ?? defaultRankData, // FIX 2026-01-04: Siempre retorna datos de rango
    achievements: data?.achievements ?? [],
    progress: data?.progress ?? null,
    recentAchievements: data?.recentAchievements ?? [],
    loading,
    error: error?.message ?? null,
    isRefreshing: isRefreshing && !loading,
    refresh,
  };
}
