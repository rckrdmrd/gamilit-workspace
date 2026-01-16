import { useQuery } from '@tanstack/react-query';
import { gamificationApi, type UserGamificationSummary } from '@/lib/api/gamification.api';

/**
 * useUserGamification Hook
 *
 * @description Fetches real-time gamification data for a user using React Query.
 * Replaces mock data with actual API call to GET /api/v1/gamification/users/:userId/summary
 *
 * @param userId - User UUID
 * @returns User gamification state with loading and error states
 *
 * @endpoint GET /api/v1/gamification/users/:userId/summary
 *
 * @example
 * ```tsx
 * const { gamificationData, isLoading, error } = useUserGamification(user?.id);
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error.message} />;
 *
 * return (
 *   <GamifiedHeader
 *     level={gamificationData.level}
 *     xp={gamificationData.totalXP}
 *     coins={gamificationData.mlCoins}
 *     rank={gamificationData.rank}
 *   />
 * );
 * ```
 */
export interface UseUserGamificationReturn {
  gamificationData: UserGamificationSummary | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch user gamification data
 */
export function useUserGamification(
  userId: string | undefined
): UseUserGamificationReturn {
  const {
    data: gamificationData,
    isLoading,
    error,
  } = useQuery<UserGamificationSummary, Error>({
    queryKey: ['userGamification', userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return gamificationApi.getUserGamificationSummary(userId);
    },
    enabled: !!userId, // Solo ejecutar query si userId existe
    staleTime: 5 * 60 * 1000, // 5 minutos - datos considerados frescos
    gcTime: 10 * 60 * 1000, // 10 minutos - cache garbage collection
    refetchOnWindowFocus: true, // Refrescar al volver a la ventana
    refetchOnMount: true, // Refrescar al montar componente
    retry: 2, // Reintentar 2 veces en caso de error
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  return {
    gamificationData: gamificationData || null,
    isLoading,
    error: error as Error | null,
  };
}
