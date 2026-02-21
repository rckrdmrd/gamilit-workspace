/**
 * useMonitoring Hook
 *
 * Custom hook para gestion de datos de monitoreo del sistema en el portal de admin.
 * Proporciona funcionalidad completa para metricas, errores y alertas.
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
  ExtendedSystemMetrics,
  ErrorStats,
  RecentError,
  ErrorTrendDataPoint,
} from '@/services/api/adminTypes';

// ============================================================================
// Query Key Factories
// ============================================================================

const monitoringKeys = {
  all: ['admin', 'monitoring'] as const,
  metrics: () => ['admin', 'monitoring', 'metrics'] as const,
  errorStats: (hours: number) => ['admin', 'monitoring', 'error-stats', hours] as const,
  recentErrors: (limit: number) => ['admin', 'monitoring', 'recent-errors', limit] as const,
  errorTrends: (hours: number) => ['admin', 'monitoring', 'error-trends', hours] as const,
};

// ============================================================================
// Return Interface (unchanged for backward compatibility)
// ============================================================================

interface UseMonitoringReturn {
  // Data
  metrics: ExtendedSystemMetrics | null;
  errorStats: ErrorStats | null;
  recentErrors: RecentError[];
  errorTrends: ErrorTrendDataPoint[];

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMetrics: () => Promise<void>;
  fetchErrorStats: (hours?: number) => Promise<void>;
  fetchRecentErrors: (limit?: number) => Promise<void>;
  fetchErrorTrends: (hours?: number) => Promise<void>;
  refreshAll: () => Promise<void>;
}

/**
 * Custom hook para gestion de monitoreo del sistema
 */
export function useMonitoring(): UseMonitoringReturn {
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERIES
  // ============================================================================

  const metricsQuery = useQuery({
    queryKey: monitoringKeys.metrics(),
    queryFn: () => adminAPI.monitoring.getExtendedMetrics(),
    staleTime: STALE_TIMES.REALTIME,
  });

  const errorStatsQuery = useQuery({
    queryKey: monitoringKeys.errorStats(24),
    queryFn: () => adminAPI.monitoring.getErrorStats({ hours: 24 }),
    staleTime: STALE_TIMES.DYNAMIC,
  });

  const recentErrorsQuery = useQuery({
    queryKey: monitoringKeys.recentErrors(20),
    queryFn: async () => {
      const data = await adminAPI.monitoring.getRecentErrors({ limit: 20, level: 'all' });
      return (data.errors || []) as RecentError[];
    },
    staleTime: STALE_TIMES.DYNAMIC,
  });

  const errorTrendsQuery = useQuery({
    queryKey: monitoringKeys.errorTrends(24),
    queryFn: async () => {
      const data = await adminAPI.monitoring.getErrorTrends({ hours: 24, group_by: 'hour' });
      return (data.trends || []) as ErrorTrendDataPoint[];
    },
    staleTime: STALE_TIMES.DYNAMIC,
  });

  // ============================================================================
  // COMBINED STATE
  // ============================================================================

  const isLoading =
    metricsQuery.isLoading ||
    errorStatsQuery.isLoading ||
    recentErrorsQuery.isLoading ||
    errorTrendsQuery.isLoading;

  const firstError =
    metricsQuery.error ??
    errorStatsQuery.error ??
    recentErrorsQuery.error ??
    errorTrendsQuery.error;

  const error = firstError instanceof Error ? firstError.message : firstError ? String(firstError) : null;

  // ============================================================================
  // ACTIONS (backward-compatible interface)
  // ============================================================================

  const fetchMetrics = useCallback(async () => {
    await metricsQuery.refetch();
  }, [metricsQuery]);

  const fetchErrorStats = useCallback(async (_hours: number = 24) => {
    await errorStatsQuery.refetch();
  }, [errorStatsQuery]);

  const fetchRecentErrors = useCallback(async (_limit: number = 20) => {
    await recentErrorsQuery.refetch();
  }, [recentErrorsQuery]);

  const fetchErrorTrends = useCallback(async (_hours: number = 24) => {
    await errorTrendsQuery.refetch();
  }, [errorTrendsQuery]);

  const refreshAll = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: monitoringKeys.all });
  }, [queryClient]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    metrics: metricsQuery.data ?? null,
    errorStats: errorStatsQuery.data ?? null,
    recentErrors: recentErrorsQuery.data ?? [],
    errorTrends: errorTrendsQuery.data ?? [],

    // State
    isLoading,
    error,

    // Actions
    fetchMetrics,
    fetchErrorStats,
    fetchRecentErrors,
    fetchErrorTrends,
    refreshAll,
  };
}

export default useMonitoring;
