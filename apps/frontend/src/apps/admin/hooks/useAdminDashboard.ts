/**
 * useAdminDashboard Hook
 *
 * Comprehensive hook for managing admin dashboard data with real-time updates.
 * Handles system health, metrics, recent actions, alerts, and user activity.
 *
 * Features:
 * - Real-time data fetching with configurable intervals
 * - Auto-refresh control (pause/resume)
 * - Alert management (dismiss, view details)
 * - Error handling and loading states
 * - Optimistic updates for better UX
 *
 * Updated: 2025-11-19 - Integrated with adminAPI.ts (FE-059)
 * - Now uses adminAPI.getSystemHealth() and adminAPI.getSystemMetrics()
 * - Alerts, actions, and activity endpoints not yet implemented in backend
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import * as adminAPI from '@/services/api/adminAPI';
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

// LOW-001 FIX: Ajustados intervalos para reducir carga en servidor
const DEFAULT_INTERVALS: RefreshIntervals = {
  health: 30000, // 30 seconds (was 10s - too aggressive)
  metrics: 60000, // 60 seconds (was 30s)
  actions: 120000, // 2 minutes (was 60s)
  alerts: 30000, // 30 seconds (was 5s - too aggressive)
  activity: 300000, // 5 minutes (unchanged)
};

export function useAdminDashboard(
  customIntervals?: Partial<RefreshIntervals>,
): UseAdminDashboardResult {
  // Merge custom intervals with defaults
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const intervals = { ...DEFAULT_INTERVALS, ...customIntervals };

  // State management
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [recentActions, setRecentActions] = useState<AdminAction[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivityData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Refs for interval management
  const intervalsRef = useRef<{
    health?: NodeJS.Timeout;
    metrics?: NodeJS.Timeout;
    actions?: NodeJS.Timeout;
    alerts?: NodeJS.Timeout;
    activity?: NodeJS.Timeout;
  }>({});

  // ============================================================================
  // API CALLS
  // ============================================================================

  /**
   * Transform API SystemHealth to local SystemHealth format
   * @see SystemHealthDto in backend for the actual response structure
   * Updated: Fixed apiUptime conversion from seconds to percentage (P0)
   */
  const transformSystemHealth = (apiHealth: APISystemHealth): SystemHealth => {
    // Convert uptime_seconds to uptime percentage
    // Assuming 24h (86400 seconds) as 100% uptime baseline
    const uptimeSeconds = apiHealth.uptime_seconds ?? 0;
    const uptimePercentage = Math.min((uptimeSeconds / 86400) * 100, 100);

    return {
      status: apiHealth.status === 'down' ? 'critical' : apiHealth.status,
      cpu: apiHealth.cpu?.usage_percent ?? 0,
      memory: apiHealth.memory?.usage_percent ?? 0,
      uptime: apiHealth.uptime_seconds ?? 0,
      // FIX-2025-01-07: activeUsers is not in SystemHealth response.
      // Use metrics.activeSessions (from /admin/system/metrics) for active user count.
      activeUsers: 0,
      requestsPerMin: 0, // Not provided by current API
      errorRate: 0, // Not provided by current API
      database: apiHealth.database?.status ?? 'down',
      apiUptime: uptimePercentage, // Now properly converted to percentage
      lastCheck: apiHealth.timestamp,
    };
  };

  /**
   * Fetch system health status
   * Updated: Now uses adminAPI.getSystemHealth()
   */
  const fetchSystemHealth = useCallback(async (): Promise<void> => {
    try {
      const apiData = await adminAPI.getSystemHealth();
      const transformedData = transformSystemHealth(apiData);
      setSystemHealth(transformedData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch system health:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch system health');

      // Set fallback health data on error
      setSystemHealth({
        status: 'critical',
        cpu: 0,
        memory: 0,
        uptime: 0,
        activeUsers: 0,
        requestsPerMin: 0,
        errorRate: 100,
        database: 'down',
        apiUptime: 0,
        lastCheck: new Date().toISOString(),
      });
    }
  }, []);

  /**
   * Transform API SystemMetrics (snake_case from backend) to local SystemMetrics format
   * @see SystemMetricsDto in apps/backend/src/modules/admin/dto/system/system-metrics.dto.ts
   * Updated: Use null instead of 0 for unavailable data (P0)
   */
  const transformSystemMetrics = (apiMetrics: APISystemMetrics): SystemMetrics => {
    return {
      totalUsers: apiMetrics.total_users ?? 0,
      userGrowth: null, // Not provided by backend - use null to show N/A
      totalOrganizations: apiMetrics.total_organizations ?? 0,
      organizationGrowth: null, // Not provided by backend - use null to show N/A
      activeSessions: apiMetrics.active_users_24h ?? 0,
      flaggedContentCount: null, // Not provided by backend - use null to show N/A
      systemUptime: 0, // Use SystemHealth for uptime
      storageUsed: null, // Not provided by backend - use null to show N/A
      storageTotal: null, // Not provided by backend - use null to show N/A
      avgResponseTime: apiMetrics.avg_response_time_ms ?? 0,
    };
  };

  /**
   * Fetch system metrics
   * Updated: Now uses adminAPI.getSystemMetrics()
   */
  const fetchMetrics = useCallback(async (): Promise<void> => {
    try {
      const apiData = await adminAPI.getSystemMetrics();
      const transformedData = transformSystemMetrics(apiData);
      setMetrics(transformedData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    }
  }, []);

  /**
   * Fetch recent admin actions
   * Updated: Uses adminAPI.getRecentActions() (FE-062 / CORR-004)
   * Endpoint: GET /admin/dashboard/actions/recent
   * @see CORR-004 in orchestration/reportes/REPORTE-FINAL-CORRECCIONES-P0-COMPLETO-2025-11-24.md
   */
  const fetchRecentActions = useCallback(async (): Promise<void> => {
    try {
      const actions = await adminAPI.getRecentActions(10);
      setRecentActions(actions);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch recent actions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recent actions');
      setRecentActions([]);
    }
  }, []);

  /**
   * Fetch system alerts
   * Updated: Uses adminAPI.getAlerts() (FE-062 / CORR-004)
   * Endpoint: GET /admin/dashboard/alerts
   * @see CORR-004 in orchestration/reportes/REPORTE-FINAL-CORRECCIONES-P0-COMPLETO-2025-11-24.md
   */
  const fetchAlerts = useCallback(async (): Promise<void> => {
    try {
      const alerts = await adminAPI.getAlerts();

      // Sort by severity and timestamp
      const sortedAlerts = alerts.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

      setAlerts(sortedAlerts);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      setAlerts([]);
    }
  }, []);

  /**
   * Fetch user activity data
   * Updated: Uses adminAPI.getUserActivity() (FE-062 / CORR-004)
   * Endpoint: GET /admin/dashboard/analytics/user-activity
   * @see CORR-004 in orchestration/reportes/REPORTE-FINAL-CORRECCIONES-P0-COMPLETO-2025-11-24.md
   */
  const fetchUserActivity = useCallback(async (): Promise<void> => {
    try {
      const activityData = await adminAPI.getUserActivity({
        groupBy: 'day', // Default to daily
      });
      setUserActivity(activityData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user activity');
      setUserActivity([]);
    }
  }, []);

  // ============================================================================
  // PUBLIC ACTIONS
  // ============================================================================

  /**
   * Refresh system health
   */
  const refreshHealth = useCallback(async (): Promise<void> => {
    await fetchSystemHealth();
    setLastUpdated(new Date());
  }, [fetchSystemHealth]);

  /**
   * Refresh metrics
   */
  const refreshMetrics = useCallback(async (): Promise<void> => {
    await fetchMetrics();
    setLastUpdated(new Date());
  }, [fetchMetrics]);

  /**
   * Refresh recent actions
   */
  const refreshActions = useCallback(async (): Promise<void> => {
    await fetchRecentActions();
    setLastUpdated(new Date());
  }, [fetchRecentActions]);

  /**
   * Refresh alerts
   */
  const refreshAlerts = useCallback(async (): Promise<void> => {
    await fetchAlerts();
    setLastUpdated(new Date());
  }, [fetchAlerts]);

  /**
   * Refresh user activity
   */
  const refreshActivity = useCallback(async (): Promise<void> => {
    await fetchUserActivity();
    setLastUpdated(new Date());
  }, [fetchUserActivity]);

  /**
   * Refresh all data
   * Updated: Uses Promise.allSettled to prevent cascade failures (P0)
   */
  const refreshAll = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        fetchSystemHealth(),
        fetchMetrics(),
        fetchRecentActions(),
        fetchAlerts(),
        fetchUserActivity(),
      ]);

      // Process results - log failures but don't stop execution
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const apiNames = [
            'System Health',
            'Metrics',
            'Recent Actions',
            'Alerts',
            'User Activity',
          ];
          console.warn(`Failed to fetch ${apiNames[index]}:`, result.reason);
        }
      });

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to refresh all data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [fetchSystemHealth, fetchMetrics, fetchRecentActions, fetchAlerts, fetchUserActivity]);

  /**
   * Dismiss an alert
   */
  const dismissAlert = useCallback(async (alertId: string): Promise<void> => {
    try {
      // Optimistic update
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, dismissed: true, dismissedAt: new Date() } : alert,
        ),
      );

      await apiClient.post(API_ENDPOINTS.admin.alertActions.dismiss(alertId));

      // Remove dismissed alert after animation
      setTimeout(() => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      }, 300);
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
      // Revert optimistic update on error
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, dismissed: false, dismissedAt: undefined } : alert,
        ),
      );
      throw err;
    }
  }, []);

  // ============================================================================
  // AUTO-REFRESH MANAGEMENT
  // ============================================================================

  /**
   * Pause auto-refresh
   */
  const pauseRefresh = useCallback((): void => {
    setIsPaused(true);

    // Clear all intervals
    Object.values(intervalsRef.current).forEach((interval) => {
      if (interval) clearInterval(interval);
    });
    intervalsRef.current = {};
  }, []);

  /**
   * Resume auto-refresh
   */
  const resumeRefresh = useCallback((): void => {
    setIsPaused(false);
    // Intervals will be set up in useEffect
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Initial data fetch
   */
  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Set up auto-refresh intervals
   */
  useEffect(() => {
    if (isPaused) return;

    // Clear existing intervals
    Object.values(intervalsRef.current).forEach((interval) => {
      if (interval) clearInterval(interval);
    });

    // Set up new intervals
    intervalsRef.current.health = setInterval(fetchSystemHealth, intervals.health);
    intervalsRef.current.metrics = setInterval(fetchMetrics, intervals.metrics);
    intervalsRef.current.actions = setInterval(fetchRecentActions, intervals.actions);
    intervalsRef.current.alerts = setInterval(fetchAlerts, intervals.alerts);
    intervalsRef.current.activity = setInterval(fetchUserActivity, intervals.activity);

    // Cleanup on unmount
    return () => {
      Object.values(intervalsRef.current).forEach((interval) => {
        if (interval) clearInterval(interval);
      });
    };
  }, [
    isPaused,
    intervals,
    fetchSystemHealth,
    fetchMetrics,
    fetchRecentActions,
    fetchAlerts,
    fetchUserActivity,
  ]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    systemHealth,
    metrics,
    recentActions,
    alerts,
    userActivity,

    // State
    loading,
    error,
    lastUpdated,

    // Actions
    refreshMetrics,
    refreshHealth,
    refreshActions,
    refreshAlerts,
    refreshActivity,
    refreshAll,
    dismissAlert,

    // Auto-refresh control
    pauseRefresh,
    resumeRefresh,
    isPaused,
  };
}
