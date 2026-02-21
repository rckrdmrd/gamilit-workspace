/**
 * useAnalytics Hook
 *
 * Custom hook for managing analytics data in the Admin Portal.
 * Provides state management and data fetching for all analytics endpoints.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching.
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 * @updated 2026-02-20 - Migrated to React Query
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api/adminAPI';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type {
  AnalyticsOverview,
  EngagementAnalytics,
  GamificationAnalytics,
  RetentionAnalytics,
  DailyActivity,
  TopUser,
} from '@/services/api/adminTypes';

// ============================================================================
// Query Key Factories
// ============================================================================

const analyticsKeys = {
  all: ['admin', 'analytics'] as const,
  overview: () => ['admin', 'analytics', 'overview'] as const,
  engagement: () => ['admin', 'analytics', 'engagement'] as const,
  gamification: () => ['admin', 'analytics', 'gamification'] as const,
  activityTimeline: () => ['admin', 'analytics', 'activity-timeline'] as const,
  topUsers: () => ['admin', 'analytics', 'top-users'] as const,
  retention: () => ['admin', 'analytics', 'retention'] as const,
};

// ============================================================================
// Return Interface (unchanged for backward compatibility)
// ============================================================================

interface UseAnalyticsReturn {
  // Data
  overview: AnalyticsOverview | null;
  engagement: EngagementAnalytics | null;
  gamification: GamificationAnalytics | null;
  activityTimeline: DailyActivity[];
  topUsers: TopUser[];
  retention: RetentionAnalytics | null;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  exportToCSV: () => Promise<void>;
}

/**
 * useAnalytics Hook
 *
 * Fetches and manages all analytics data for the admin dashboard.
 */
export function useAnalytics(): UseAnalyticsReturn {
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERIES (parallel, independent)
  // ============================================================================

  const overviewQuery = useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: () => adminAPI.analytics.getOverview(),
    staleTime: STALE_TIMES.DYNAMIC,
  });

  const engagementQuery = useQuery({
    queryKey: analyticsKeys.engagement(),
    queryFn: () => adminAPI.analytics.getEngagement({}),
    staleTime: STALE_TIMES.DYNAMIC,
  });

  const gamificationQuery = useQuery({
    queryKey: analyticsKeys.gamification(),
    queryFn: () => adminAPI.analytics.getGamification(),
    staleTime: STALE_TIMES.DYNAMIC,
  });

  const activityTimelineQuery = useQuery({
    queryKey: analyticsKeys.activityTimeline(),
    queryFn: async () => {
      const response = await adminAPI.analytics.getActivityTimeline({ days: 30 });
      return (response.timeline || []) as DailyActivity[];
    },
    staleTime: STALE_TIMES.DYNAMIC,
  });

  const topUsersQuery = useQuery({
    queryKey: analyticsKeys.topUsers(),
    queryFn: async () => {
      const response = await adminAPI.analytics.getTopUsers({
        metric: 'xp',
        limit: 10,
      });
      return (response.users || []) as TopUser[];
    },
    staleTime: STALE_TIMES.DYNAMIC,
  });

  const retentionQuery = useQuery({
    queryKey: analyticsKeys.retention(),
    queryFn: () => adminAPI.analytics.getRetention(),
    staleTime: STALE_TIMES.DYNAMIC,
  });

  // ============================================================================
  // COMBINED STATE
  // ============================================================================

  const isLoading =
    overviewQuery.isLoading ||
    engagementQuery.isLoading ||
    gamificationQuery.isLoading ||
    activityTimelineQuery.isLoading ||
    topUsersQuery.isLoading ||
    retentionQuery.isLoading;

  // Aggregate first error found
  const firstError =
    overviewQuery.error ??
    engagementQuery.error ??
    gamificationQuery.error ??
    activityTimelineQuery.error ??
    topUsersQuery.error ??
    retentionQuery.error;

  const error = firstError instanceof Error ? firstError.message : firstError ? String(firstError) : null;

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
  }, [queryClient]);

  /**
   * Export analytics to CSV
   */
  const exportToCSV = useCallback(async () => {
    try {
      const response = await adminAPI.analytics.exportCSV({
        type: 'overview',
        format: 'csv',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-overview-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error('Error exporting CSV:', err);
      throw err;
    }
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    overview: overviewQuery.data ?? null,
    engagement: engagementQuery.data ?? null,
    gamification: gamificationQuery.data ?? null,
    activityTimeline: activityTimelineQuery.data ?? [],
    topUsers: topUsersQuery.data ?? [],
    retention: retentionQuery.data ?? null,
    isLoading,
    error,
    refresh,
    exportToCSV,
  };
}
