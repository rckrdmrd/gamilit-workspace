/**
 * useMonitoring Hook
 *
 * Custom hook para gestión de datos de monitoreo del sistema en el portal de admin.
 * Proporciona funcionalidad completa para métricas, errores y alertas.
 *
 * Features:
 * - Métricas del sistema en tiempo real (CPU, memoria, procesos)
 * - Estadísticas y tracking de errores
 * - Tendencias de errores con gráficos
 * - Refresh automático y manual
 * - Manejo de estados de loading y error
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 */

import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/services/api/adminAPI';
import type {
  ExtendedSystemMetrics,
  ErrorStats,
  RecentError,
  ErrorTrendDataPoint,
} from '@/services/api/adminTypes';

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
 * Custom hook para gestión de monitoreo del sistema
 */
export function useMonitoring(): UseMonitoringReturn {
  // State
  const [metrics, setMetrics] = useState<ExtendedSystemMetrics | null>(null);
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
  const [recentErrors, setRecentErrors] = useState<RecentError[]>([]);
  const [errorTrends, setErrorTrends] = useState<ErrorTrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current system metrics
   */
  const fetchMetrics = useCallback(async () => {
    try {
      const data = await adminAPI.monitoring.getExtendedMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error('[useMonitoring] Error fetching metrics:', err);
      // Don't block UI for metrics fetch errors
    }
  }, []);

  /**
   * Fetch error statistics
   */
  const fetchErrorStats = useCallback(async (hours: number = 24) => {
    try {
      const data = await adminAPI.monitoring.getErrorStats({ hours });
      setErrorStats(data);
    } catch (err: any) {
      console.error('[useMonitoring] Error fetching error stats:', err);
    }
  }, []);

  /**
   * Fetch recent errors list
   */
  const fetchRecentErrors = useCallback(async (limit: number = 20) => {
    try {
      const data = await adminAPI.monitoring.getRecentErrors({ limit, level: 'all' });
      setRecentErrors(data.errors || []);
    } catch (err: any) {
      console.error('[useMonitoring] Error fetching recent errors:', err);
      setRecentErrors([]);
    }
  }, []);

  /**
   * Fetch error trends for charts
   */
  const fetchErrorTrends = useCallback(async (hours: number = 24) => {
    try {
      const data = await adminAPI.monitoring.getErrorTrends({ hours, group_by: 'hour' });
      setErrorTrends(data.trends || []);
    } catch (err: any) {
      console.error('[useMonitoring] Error fetching error trends:', err);
      setErrorTrends([]);
    }
  }, []);

  /**
   * Refresh all monitoring data
   */
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchMetrics(),
        fetchErrorStats(24),
        fetchRecentErrors(20),
        fetchErrorTrends(24),
      ]);
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al cargar datos de monitoreo';
      setError(errorMessage);
      console.error('[useMonitoring] Error refreshing all:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMetrics, fetchErrorStats, fetchRecentErrors, fetchErrorTrends]);

  // Auto-fetch on mount
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    // Data
    metrics,
    errorStats,
    recentErrors,
    errorTrends,

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
