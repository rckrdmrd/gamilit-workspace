/**
 * useSystemMonitoring Hook
 *
 * Specialized hook for real-time system monitoring.
 * Focuses on health checks, performance metrics, and alert management.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching. Uses refetchInterval to replace manual setInterval.
 *
 * Updated: 2026-02-20 - Migrated to React Query
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type { SystemHealth, SystemAlert } from '../types';

// ============================================================================
// Query Key Factories
// ============================================================================

const monitoringKeys = {
  all: ['admin', 'system-monitoring'] as const,
  health: () => ['admin', 'system-monitoring', 'health'] as const,
  alerts: () => ['admin', 'system-monitoring', 'alerts'] as const,
};

// ============================================================================
// Types (unchanged for backward compatibility)
// ============================================================================

export interface UseSystemMonitoringResult {
  // Health data
  health: SystemHealth | null;
  healthHistory: HealthSnapshot[];

  // Alerts
  activeAlerts: SystemAlert[];
  alertCount: number;
  criticalAlertCount: number;

  // State
  loading: boolean;
  error: string | null;
  isMonitoring: boolean;

  // Actions
  startMonitoring: () => void;
  stopMonitoring: () => void;
  refreshHealth: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  clearAllAlerts: () => Promise<void>;
}

interface HealthSnapshot {
  timestamp: Date;
  cpu: number;
  memory: number;
  errorRate: number;
  requestsPerMin: number;
  status: 'healthy' | 'degraded' | 'critical';
}

const HEALTH_CHECK_INTERVAL = 10000; // 10 seconds
const ALERT_CHECK_INTERVAL = 5000; // 5 seconds
const MAX_HISTORY_LENGTH = 60;

// ============================================================================
// Hook
// ============================================================================

export function useSystemMonitoring(): UseSystemMonitoringResult {
  const queryClient = useQueryClient();

  const [healthHistory, setHealthHistory] = useState<HealthSnapshot[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true); // auto-start

  // ============================================================================
  // QUERIES
  // ============================================================================

  const healthQuery = useQuery({
    queryKey: monitoringKeys.health(),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: SystemHealth }>(
        '/admin/health',
      );
      const data = response.data.success
        ? response.data.data
        : (response.data as unknown as SystemHealth);

      // Add to history
      const snapshot: HealthSnapshot = {
        timestamp: new Date(),
        cpu: data.cpu,
        memory: data.memory,
        errorRate: data.errorRate,
        requestsPerMin: data.requestsPerMin,
        status: data.status,
      };

      setHealthHistory((prev) => {
        const updated = [...prev, snapshot];
        return updated.slice(-MAX_HISTORY_LENGTH);
      });

      return data;
    },
    staleTime: STALE_TIMES.REALTIME,
    refetchInterval: isMonitoring ? HEALTH_CHECK_INTERVAL : false,
  });

  const alertsQuery = useQuery({
    queryKey: monitoringKeys.alerts(),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: SystemAlert[] }>(
        API_ENDPOINTS.admin.alerts,
        { params: { dismissed: false, limit: 50 } },
      );
      const data = response.data.success
        ? response.data.data
        : (response.data as unknown as SystemAlert[]);

      const alerts = data
        .map((alert) => ({
          ...alert,
          timestamp: new Date(alert.timestamp),
        }))
        .sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
          return severityDiff !== 0 ? severityDiff : b.timestamp.getTime() - a.timestamp.getTime();
        });

      return alerts;
    },
    staleTime: STALE_TIMES.REALTIME,
    refetchInterval: isMonitoring ? ALERT_CHECK_INTERVAL : false,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) =>
      apiClient.patch(API_ENDPOINTS.admin.alertActions.suppress(alertId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.alerts() });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async (alerts: SystemAlert[]) => {
      await Promise.all(
        alerts.map((alert) =>
          apiClient.patch(API_ENDPOINTS.admin.alertActions.suppress(alert.id)),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.alerts() });
    },
  });

  // ============================================================================
  // DERIVED DATA
  // ============================================================================

  const activeAlerts = alertsQuery.data ?? [];
  const alertCount = activeAlerts.length;
  const criticalAlertCount = activeAlerts.filter((a) => a.severity === 'high').length;

  const loading = healthQuery.isLoading && alertsQuery.isLoading;
  const firstError = healthQuery.error ?? alertsQuery.error;
  const error = firstError instanceof Error ? firstError.message : firstError ? String(firstError) : null;

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const startMonitoring = useCallback((): void => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback((): void => {
    setIsMonitoring(false);
  }, []);

  const refreshHealth = useCallback(async (): Promise<void> => {
    await Promise.all([healthQuery.refetch(), alertsQuery.refetch()]);
  }, [healthQuery, alertsQuery]);

  const acknowledgeAlert = useCallback(
    async (alertId: string): Promise<void> => {
      await acknowledgeMutation.mutateAsync(alertId);
    },
    [acknowledgeMutation],
  );

  const clearAllAlerts = useCallback(async (): Promise<void> => {
    await clearAllMutation.mutateAsync(activeAlerts);
  }, [clearAllMutation, activeAlerts]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    health: healthQuery.data ?? null,
    healthHistory,
    activeAlerts,
    alertCount,
    criticalAlertCount,
    loading,
    error,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    refreshHealth,
    acknowledgeAlert,
    clearAllAlerts,
  };
}
