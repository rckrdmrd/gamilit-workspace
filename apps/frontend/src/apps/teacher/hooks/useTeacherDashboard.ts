/**
 * useTeacherDashboard Hook
 *
 * Custom React hook to fetch and manage teacher dashboard data including
 * statistics, recent activities, alerts, top performers, and module progress.
 *
 * Migrated from useState+useEffect to React Query (TanStack Query v5)
 * for automatic caching, deduplication, and background refetching.
 * Uses separate queries per data type to enable individual refresh.
 *
 * Backward-compatible: return interface unchanged for 1 consumer (TeacherDashboard.tsx).
 *
 * @module apps/teacher/hooks/useTeacherDashboard
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '@services/api/teacher';
import type { Activity } from '@services/api/teacher';
import type {
  TeacherDashboardStats,
  InterventionAlert,
  StudentPerformance,
  ModuleProgress,
} from '../types';

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

/**
 * Query key factory for teacher dashboard queries.
 * Exported for external invalidation from other hooks or components.
 */
export const dashboardKeys = {
  all: ['teacher-dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  activities: () => [...dashboardKeys.all, 'activities'] as const,
  alerts: () => [...dashboardKeys.all, 'alerts'] as const,
  performers: () => [...dashboardKeys.all, 'performers'] as const,
  progress: () => [...dashboardKeys.all, 'progress'] as const,
};

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useTeacherDashboard hook
 */
export interface UseTeacherDashboardReturn {
  // Data
  stats: TeacherDashboardStats | null;
  activities: Activity[];
  alerts: InterventionAlert[];
  topPerformers: StudentPerformance[];
  moduleProgress: ModuleProgress[];

  // State
  loading: boolean;
  error: Error | null;

  // Actions
  refresh: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshActivities: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to manage teacher dashboard data
 *
 * Fetches all dashboard data on component mount and provides methods
 * to refresh individual sections or all data at once.
 *
 * @returns {UseTeacherDashboardReturn} Dashboard data, loading state, error, and refresh methods
 *
 * @example
 * ```tsx
 * function TeacherDashboard() {
 *   const {
 *     stats,
 *     activities,
 *     alerts,
 *     topPerformers,
 *     moduleProgress,
 *     loading,
 *     error,
 *     refresh,
 *     refreshStats,
 *   } = useTeacherDashboard();
 *
 *   if (loading && !stats) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   if (error) {
 *     return <ErrorMessage error={error} onRetry={refresh} />;
 *   }
 *
 *   return (
 *     <div>
 *       <DashboardStats stats={stats!} onRefresh={refreshStats} />
 *       <RecentActivities activities={activities} />
 *       <AlertsPanel alerts={alerts} />
 *       <TopPerformers students={topPerformers} />
 *       <ModuleProgress modules={moduleProgress} />
 *       <RefreshButton onClick={refresh} loading={loading} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useTeacherDashboard(): UseTeacherDashboardReturn {
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERIES — one per data type for independent refresh
  // ============================================================================

  const statsQuery = useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => teacherApi.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const activitiesQuery = useQuery({
    queryKey: dashboardKeys.activities(),
    queryFn: () => teacherApi.getRecentActivities(10),
    staleTime: 2 * 60 * 1000,
  });

  const alertsQuery = useQuery({
    queryKey: dashboardKeys.alerts(),
    queryFn: () => teacherApi.getStudentAlerts(),
    staleTime: 2 * 60 * 1000,
  });

  const performersQuery = useQuery({
    queryKey: dashboardKeys.performers(),
    queryFn: () => teacherApi.getTopPerformers(5),
    staleTime: 2 * 60 * 1000,
  });

  const progressQuery = useQuery({
    queryKey: dashboardKeys.progress(),
    queryFn: () => teacherApi.getModuleProgressSummary(),
    staleTime: 2 * 60 * 1000,
  });

  // ============================================================================
  // COMBINED STATE — backward-compatible loading/error
  // ============================================================================

  const loading =
    statsQuery.isLoading ||
    activitiesQuery.isLoading ||
    alertsQuery.isLoading ||
    performersQuery.isLoading ||
    progressQuery.isLoading;

  const error =
    statsQuery.error ||
    activitiesQuery.error ||
    alertsQuery.error ||
    performersQuery.error ||
    progressQuery.error ||
    null;

  // ============================================================================
  // ACTIONS — individual and global refresh
  // ============================================================================

  /**
   * Refresh only dashboard statistics
   */
  const refreshStats = useCallback(async () => {
    await statsQuery.refetch();
  }, [statsQuery]);

  /**
   * Refresh only recent activities
   */
  const refreshActivities = useCallback(async () => {
    await activitiesQuery.refetch();
  }, [activitiesQuery]);

  /**
   * Refresh only student alerts
   */
  const refreshAlerts = useCallback(async () => {
    await alertsQuery.refetch();
  }, [alertsQuery]);

  /**
   * Refresh all dashboard data by invalidating every dashboard query.
   * React Query will refetch all active queries automatically.
   */
  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  }, [queryClient]);

  // ============================================================================
  // RETURN — exact same interface as before
  // ============================================================================

  return {
    // Data
    stats: statsQuery.data ?? null,
    activities: activitiesQuery.data ?? [],
    alerts: alertsQuery.data ?? [],
    topPerformers: performersQuery.data ?? [],
    moduleProgress: progressQuery.data ?? [],

    // State
    loading,
    error,

    // Actions
    refresh,
    refreshStats,
    refreshActivities,
    refreshAlerts,
  };
}
