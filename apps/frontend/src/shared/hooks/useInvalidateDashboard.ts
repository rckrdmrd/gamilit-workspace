/**
 * useInvalidateDashboard Hook
 *
 * @description Centralized hook to invalidate React Query cache after completing exercises.
 * Ensures dashboard and modules data stay in sync with backend state.
 *
 * @problem Exercises update Zustand stores but don't invalidate React Query cache,
 * causing stale data in useDashboardData and useUserModules.
 *
 * @solution This hook provides syncAndInvalidate() that:
 * 1. Updates Zustand stores (ranks, economy)
 * 2. Invalidates relevant React Query queries (dashboard, userModules)
 *
 * @usage
 * ```typescript
 * const { syncAndInvalidate } = useInvalidateDashboard();
 *
 * // After completing an exercise:
 * await syncAndInvalidate();
 * ```
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRanksStore } from '@/features/gamification/ranks/store/ranksStore';
import { useEconomyStore } from '@/features/gamification/economy/store/economyStore';

// ============================================================================
// Types
// ============================================================================

export interface UseInvalidateDashboardReturn {
  /**
   * Sync Zustand stores and invalidate React Query cache
   * Call this after completing exercises to refresh all dashboard data
   */
  syncAndInvalidate: () => Promise<void>;

  /**
   * Check if invalidation is in progress
   */
  isInvalidating: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook to synchronize Zustand stores and invalidate React Query cache
 *
 * @returns Object with syncAndInvalidate function
 */
export function useInvalidateDashboard(): UseInvalidateDashboardReturn {
  const queryClient = useQueryClient();
  // Using Zustand selectors to prevent unnecessary re-renders
  const fetchUserProgress = useRanksStore((state) => state.fetchUserProgress);
  const fetchBalance = useEconomyStore((state) => state.fetchBalance);
  const { user } = useAuth(); // useAuth now uses selectors internally

  const syncAndInvalidate = async () => {
    // 1. Update Zustand stores in parallel
    await Promise.all([
      fetchUserProgress(),
      fetchBalance(),
    ]);

    // 2. Invalidate React Query cache
    // Using invalidateQueries instead of refetchQueries so queries refresh
    // when user navigates back to dashboard (even if queries aren't active now)
    if (user?.id) {
      await Promise.all([
        // Invalidate dashboard queries (coins, rank, achievements, progress)
        queryClient.invalidateQueries({
          queryKey: ['dashboard', user.id],
        }),

        // Invalidate user modules queries (module list with progress)
        queryClient.invalidateQueries({
          queryKey: ['userModules', user.id],
        }),

        // Also invalidate the base keys to catch all related queries
        queryClient.invalidateQueries({
          queryKey: ['dashboard'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['userModules'],
        }),

        // Invalidate header gamification query (level, xp, ml, rank)
        queryClient.invalidateQueries({
          queryKey: ['userGamification', user.id],
        }),

        queryClient.invalidateQueries({
          queryKey: ['userGamification'],
        }),
      ]);
    }
  };

  return {
    syncAndInvalidate,
    isInvalidating: false, // Can be enhanced with loading state if needed
  };
}
