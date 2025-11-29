/**
 * useAlerts Hook
 *
 * Custom hook para gestión de alertas del sistema en el portal de admin.
 * Proporciona funcionalidad completa de CRUD y gestión de alertas.
 *
 * Features:
 * - Listado de alertas con filtros y paginación
 * - Estadísticas de alertas
 * - Acknowledge, Resolve, Suppress alertas
 * - Refresh automático y manual
 * - Manejo de estados de loading y error
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 */

import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/services/api/adminAPI';
import type {
  Alert,
  AlertFilters,
  AlertsStats,
  PaginatedResponse,
} from '@/services/api/adminTypes';

interface UseAlertsReturn {
  // Data
  alerts: Alert[];
  stats: AlertsStats | null;
  selectedAlert: Alert | null;

  // State
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;

  // Filters & Pagination
  filters: AlertFilters;
  setFilters: (filters: AlertFilters) => void;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };

  // Actions
  fetchAlerts: () => Promise<void>;
  fetchStats: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
  acknowledgeAlert: (id: string, note?: string) => Promise<void>;
  resolveAlert: (id: string, note: string) => Promise<void>;
  suppressAlert: (id: string) => Promise<void>;
  setSelectedAlert: (alert: Alert | null) => void;

  // Pagination actions
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

/**
 * Custom hook para gestión de alertas
 */
export function useAlerts(): UseAlertsReturn {
  // State
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertsStats | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [filters, setFilters] = useState<AlertFilters>({
    page: 1,
    limit: 20,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    totalItems: 0,
    limit: 20,
  });

  /**
   * Fetch alerts from API with current filters
   */
  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<Alert> = await adminAPI.alerts.list(filters);
      setAlerts(response.items);
      setPagination(response.pagination);
    } catch (err: unknown) {
      const errorMessage = err?.message || 'Error al cargar alertas';
      setError(errorMessage);
      console.error('[useAlerts] Error fetching alerts:', err);

      // Set empty state on error
      setAlerts([]);
      setPagination({
        page: 1,
        totalPages: 0,
        totalItems: 0,
        limit: 20,
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  /**
   * Fetch alert statistics
   */
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);

    try {
      const statsData = await adminAPI.alerts.getStats();
      setStats(statsData);
    } catch (err: unknown) {
      console.error('[useAlerts] Error fetching stats:', err);
      // Don't show error for stats - keep UI working
      setStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  /**
   * Refresh both alerts and stats
   */
  const refreshAlerts = useCallback(async () => {
    await Promise.all([fetchAlerts(), fetchStats()]);
  }, [fetchAlerts, fetchStats]);

  /**
   * Acknowledge an alert
   */
  const acknowledgeAlert = useCallback(
    async (id: string, note?: string) => {
      try {
        await adminAPI.alerts.acknowledge(id, note);

        // Update local state
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert.id === id
              ? { ...alert, status: 'acknowledged' as const, acknowledgment_note: note }
              : alert,
          ),
        );

        // Refresh stats
        await fetchStats();
      } catch (err: unknown) {
        const errorMessage = err?.message || 'Error al reconocer alerta';
        setError(errorMessage);
        throw err;
      }
    },
    [fetchStats],
  );

  /**
   * Resolve an alert
   */
  const resolveAlert = useCallback(
    async (id: string, note: string) => {
      if (!note || note.trim().length < 10) {
        throw new Error('La nota de resolución debe tener al menos 10 caracteres');
      }

      try {
        await adminAPI.alerts.resolve(id, note);

        // Update local state
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert.id === id
              ? { ...alert, status: 'resolved' as const, resolution_note: note }
              : alert,
          ),
        );

        // Refresh stats
        await fetchStats();
      } catch (err: unknown) {
        const errorMessage = err?.message || 'Error al resolver alerta';
        setError(errorMessage);
        throw err;
      }
    },
    [fetchStats],
  );

  /**
   * Suppress an alert
   */
  const suppressAlert = useCallback(
    async (id: string) => {
      try {
        await adminAPI.alerts.suppress(id);

        // Update local state
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert.id === id ? { ...alert, status: 'suppressed' as const } : alert,
          ),
        );

        // Refresh stats
        await fetchStats();
      } catch (err: unknown) {
        const errorMessage = err?.message || 'Error al suprimir alerta';
        setError(errorMessage);
        throw err;
      }
    },
    [fetchStats],
  );

  /**
   * Pagination actions
   */
  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  }, [pagination]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      setFilters((prev) => ({ ...prev, page: Math.max((prev.page || 1) - 1, 1) }));
    }
  }, [pagination]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        setFilters((prev) => ({ ...prev, page }));
      }
    },
    [pagination],
  );

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    // Data
    alerts,
    stats,
    selectedAlert,

    // State
    isLoading,
    isLoadingStats,
    error,

    // Filters & Pagination
    filters,
    setFilters,
    pagination,

    // Actions
    fetchAlerts,
    fetchStats,
    refreshAlerts,
    acknowledgeAlert,
    resolveAlert,
    suppressAlert,
    setSelectedAlert,

    // Pagination actions
    nextPage,
    prevPage,
    goToPage,
  };
}

export default useAlerts;
