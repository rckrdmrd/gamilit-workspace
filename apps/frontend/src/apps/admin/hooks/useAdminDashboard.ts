/**
 * useAdminDashboard Hook
 *
 * Comprehensive hook for managing admin dashboard data with real-time updates.
 * Handles system health, metrics, recent actions, alerts, and user activity.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching. Uses refetchInterval to replace manual setInterval.
 *
 * Updated: 2025-11-19 - Integrated with adminAPI.ts (FE-059)
 * Updated: 2026-02-20 - Migrated to React Query
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import * as adminAPI from '@/services/api/adminAPI';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type {
  SystemHealth as APISystemHealth,
  SystemMetrics as APISystemMetrics,
} from '@/services/api/adminTypes';
import type {
  SystemHealth,
  SystemMetrics,
  AdminAction,
  SystemAlert,
  UserActivityData,
} from '../types';

// ============================================================================
// Query Key Factories
// ============================================================================

const dashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  health: () => ['admin', 'dashboard', 'health'] as const,
  metrics: () => ['admin', 'dashboard', 'metrics'] as const,
  actions: () => ['admin', 'dashboard', 'actions'] as const,
  alerts: () => ['admin', 'dashboard', 'alerts'] as const,
  activity: () => ['admin', 'dashboard', 'activity'] as const,
};

// ============================================================================
// Types (unchanged for backward compatibility)
// ============================================================================

export interface UseAdminDashboardResult {
  // Data
  systemHealth: SystemHealth | null;
  metrics: SystemMetrics | null;
  recentActions: AdminAction[];
  alerts: SystemAlert[];
  userActivity: UserActivityData[];

  // State
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  refreshMetrics: () => Promise<void>;
  refreshHealth: () => Promise<void>;
  refreshActions: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  refreshAll: () => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;

  // Auto-refresh control
  pauseRefresh: () => void;
  resumeRefresh: () => void;
  isPaused: boolean;
}

interface RefreshIntervals {
  health: number;
  metrics: number;
  actions: number;
  alerts: number;
  activity: number;
}

const DEFAULT_INTERVALS: RefreshIntervals = {
  health: 30000,
  metrics: 60000,
  actions: 120000,
  alerts: 30000,
  activity: 300000,
};

// ============================================================================
// Transform Helpers
// ============================================================================

function transformSystemHealth(apiHealth: APISystemHealth): SystemHealth {
  const uptimeSeconds = apiHealth.uptime_seconds ?? 0;
  const uptimePercentage = Math.min((uptimeSeconds / 86400) * 100, 100);

  return {
    status: apiHealth.status === 'down' ? 'critical' : apiHealth.status,
    cpu: apiHealth.cpu?.usage_percent ?? 0,
    memory: apiHealth.memory?.usage_percent ?? 0,
    uptime: apiHealth.uptime_seconds ?? 0,
    activeUsers: 0,
    requestsPerMin: 0,
    errorRate: 0,
    database: apiHealth.database?.status ?? 'down',
    apiUptime: uptimePercentage,
    lastCheck: apiHealth.timestamp,
  };
}

function transformSystemMetrics(apiMetrics: APISystemMetrics): SystemMetrics {
  return {
    totalUsers: apiMetrics.total_users ?? 0,
    userGrowth: null,
    totalOrganizations: apiMetrics.total_organizations ?? 0,
    organizationGrowth: null,
    activeSessions: apiMetrics.active_users_24h ?? 0,
    flaggedContentCount: null,
    systemUptime: 0,
    storageUsed: null,
    storageTotal: null,
    avgResponseTime: apiMetrics.avg_response_time_ms ?? 0,
  };
}

// ============================================================================
// Hook
// ============================================================================

export function useAdminDashboard(
  customIntervals?: Partial<RefreshIntervals>,
): UseAdminDashboardResult {
  const intervals = { ...DEFAULT_INTERVALS, ...customIntervals };
  const queryClient = useQueryClient();

  const [isPaused, setIsPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const healthQuery = useQuery({
    queryKey: dashboardKeys.health(),
    queryFn: async () => {
      try {
        const apiData = await adminAPI.getSystemHealth();
        return transformSystemHealth(apiData);
      } catch (err) {
        console.error('Failed to fetch system health:', err);
        return {
          status: 'critical' as const,
          cpu: 0,
          memory: 0,
          uptime: 0,
          activeUsers: 0,
          requestsPerMin: 0,
          errorRate: 100,
          database: 'down' as const,
          apiUptime: 0,
          lastCheck: new Date().toISOString(),
        };
      }
    },
    staleTime: STALE_TIMES.REALTIME,
    refetchInterval: isPaused ? false : intervals.health,
  });

  const metricsQuery = useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: async () => {
      const apiData = await adminAPI.getSystemMetrics();
      return transformSystemMetrics(apiData);
    },
    staleTime: STALE_TIMES.REALTIME,
    refetchInterval: isPaused ? false : intervals.metrics,
  });

  const actionsQuery = useQuery({
    queryKey: dashboardKeys.actions(),
    queryFn: async () => {
      try {
        return await adminAPI.getRecentActions(10);
      } catch (err) {
        console.error('Failed to fetch recent actions:', err);
        return [] as AdminAction[];
      }
    },
    staleTime: STALE_TIMES.DYNAMIC,
    refetchInterval: isPaused ? false : intervals.actions,
  });

  const alertsQuery = useQuery({
    queryKey: dashboardKeys.alerts(),
    queryFn: async () => {
      try {
        const alerts = await adminAPI.getAlerts();
        const sortedAlerts = alerts.sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
          if (severityDiff !== 0) return severityDiff;
          return b.timestamp.getTime() - a.timestamp.getTime();
        });
        return sortedAlerts;
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
        return [] as SystemAlert[];
      }
    },
    staleTime: STALE_TIMES.REALTIME,
    refetchInterval: isPaused ? false : intervals.alerts,
  });

  const activityQuery = useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: async () => {
      try {
        return await adminAPI.getUserActivity({ groupBy: 'day' });
      } catch (err) {
        console.error('Failed to fetch user activity:', err);
        return [] as UserActivityData[];
      }
    },
    staleTime: STALE_TIMES.DYNAMIC,
    refetchInterval: isPaused ? false : intervals.activity,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const dismissMutation = useMutation({
    mutationFn: (alertId: string) =>
      apiClient.patch(API_ENDPOINTS.admin.alertActions.suppress(alertId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
    },
  });

  // ============================================================================
  // COMBINED STATE
  // ============================================================================

  const loading =
    healthQuery.isLoading &&
    metricsQuery.isLoading &&
    actionsQuery.isLoading &&
    alertsQuery.isLoading &&
    activityQuery.isLoading;

  const firstError =
    metricsQuery.error ?? actionsQuery.error ?? activityQuery.error;

  const error = firstError instanceof Error ? firstError.message : firstError ? String(firstError) : null;

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const refreshHealth = useCallback(async (): Promise<void> => {
    await healthQuery.refetch();
    setLastUpdated(new Date());
  }, [healthQuery]);

  const refreshMetrics = useCallback(async (): Promise<void> => {
    await metricsQuery.refetch();
    setLastUpdated(new Date());
  }, [metricsQuery]);

  const refreshActions = useCallback(async (): Promise<void> => {
    await actionsQuery.refetch();
    setLastUpdated(new Date());
  }, [actionsQuery]);

  const refreshAlerts = useCallback(async (): Promise<void> => {
    await alertsQuery.refetch();
    setLastUpdated(new Date());
  }, [alertsQuery]);

  const refreshActivity = useCallback(async (): Promise<void> => {
    await activityQuery.refetch();
    setLastUpdated(new Date());
  }, [activityQuery]);

  const refreshAll = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    setLastUpdated(new Date());
  }, [queryClient]);

  const dismissAlert = useCallback(
    async (alertId: string): Promise<void> => {
      await dismissMutation.mutateAsync(alertId);
    },
    [dismissMutation],
  );

  const pauseRefresh = useCallback((): void => {
    setIsPaused(true);
  }, []);

  const resumeRefresh = useCallback((): void => {
    setIsPaused(false);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    systemHealth: healthQuery.data ?? null,
    metrics: metricsQuery.data ?? null,
    recentActions: actionsQuery.data ?? [],
    alerts: alertsQuery.data ?? [],
    userActivity: activityQuery.data ?? [],
    loading,
    error,
    lastUpdated,
    refreshMetrics,
    refreshHealth,
    refreshActions,
    refreshAlerts,
    refreshActivity,
    refreshAll,
    dismissAlert,
    pauseRefresh,
    resumeRefresh,
    isPaused,
  };
}
