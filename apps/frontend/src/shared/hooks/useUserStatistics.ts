import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';

/**
 * User Statistics Interface
 *
 * @description Represents user statistics from the backend endpoint
 * @endpoint GET /api/users/statistics
 */
interface UserStatistics {
  total_xp: number;
  total_ml_coins: number;
  total_exercises: number;
  total_achievements: number;
  current_rank: string;
  modules_completed: number;
  login_streak: number;
  achievements_earned?: number;
}

/**
 * useUserStatistics Hook
 *
 * @description Fetches real-time user statistics using React Query.
 * Replaces hardcoded stats with actual data from gamification system.
 *
 * @param userId - User UUID (optional, defaults to current authenticated user)
 * @returns User statistics with loading and error states
 *
 * @endpoint GET /api/users/statistics
 *
 * @example
 * ```tsx
 * const { data: userStats, isLoading, error } = useUserStatistics(user?.id);
 *
 * if (isLoading) return <Loader2 className="w-8 h-8 animate-spin" />;
 * if (error) return <ErrorMessage error={error.message} />;
 *
 * const stats = [
 *   { label: 'ML Coins', value: userStats.total_ml_coins, icon: Coins },
 *   { label: 'Logros', value: `${userStats.achievements_earned}/${userStats.total_achievements}`, icon: Trophy },
 *   { label: 'Ejercicios', value: userStats.total_exercises, icon: Target },
 * ];
 * ```
 */
export function useUserStatistics(userId: string | undefined) {
  return useQuery<UserStatistics>({
    queryKey: ['userStatistics', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await apiClient.get('/users/statistics');
      return response.data;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - data considered fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time
    refetchOnWindowFocus: true, // Refetch when returning to window
    refetchOnMount: true, // Refetch when component mounts
    retry: 2, // Retry 2 times on error
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

export type { UserStatistics };
