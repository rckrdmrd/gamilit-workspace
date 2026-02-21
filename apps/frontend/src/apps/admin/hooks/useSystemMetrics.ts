/**
 * useSystemMetrics & useHealthStatus Hooks
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching with refetchInterval replacing setInterval.
 *
 * Updated: 2026-02-20 - Migrated to React Query
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { STALE_TIMES } from '@/shared/constants/queryKeys';

export interface SystemMetrics {
  apiResponseTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  databaseQueriesPerSec: number;
  activeUsersCount: number;
  requestsPerMin: number;
  errorRate: number;
  cpuUsage?: number;
  memoryUsage?: number;
  timestamp: string;
}

export interface MetricsHistory {
  timestamp: string;
  value: number;
}

// ============================================================================
// Query Key Factories
// ============================================================================

const systemMetricsKeys = {
  metrics: () => ['admin', 'system-metrics'] as const,
  health: () => ['admin', 'health-status'] as const,
};

// ============================================================================
// useSystemMetrics
// ============================================================================

export function useSystemMetrics(refreshInterval = 30000) {
  const metricsQuery = useQuery({
    queryKey: systemMetricsKeys.metrics(),
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.admin.metrics);
      const data = response.data.success ? response.data.data : response.data;
      return data as SystemMetrics;
    },
    staleTime: STALE_TIMES.REALTIME,
    refetchInterval: refreshInterval,
  });

  // Note: History tracking was moved out since React Query manages refetching.
  // Consumers that need history should maintain their own buffer from the data stream.
  // For backward compatibility, we return an empty history object.
  const history: Record<string, MetricsHistory[]> = {
    apiResponseTime: [],
    errorRate: [],
    activeUsers: [],
    requestsPerMin: [],
  };

  return {
    metrics: metricsQuery.data ?? null,
    history,
    loading: metricsQuery.isLoading,
    error: metricsQuery.error instanceof Error ? metricsQuery.error.message : metricsQuery.error ? String(metricsQuery.error) : null,
    refresh: async () => { await metricsQuery.refetch(); },
  };
}

// ============================================================================
// useHealthStatus
// ============================================================================

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  database?: { status: string; latency_ms?: number };
  api?: { status: string; response_time_ms?: number };
  uptime_seconds?: number;
  timestamp?: string;
}

export function useHealthStatus() {
  const healthQuery = useQuery({
    queryKey: systemMetricsKeys.health(),
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.health.ready);
      const data = response.data.success ? response.data.data : response.data;
      return data as HealthStatus;
    },
    staleTime: STALE_TIMES.REALTIME,
    refetchInterval: 60000, // Check every minute
  });

  return {
    health: healthQuery.data ?? null,
    loading: healthQuery.isLoading,
  };
}
