/**
 * useAlerts Hook
 *
 * Custom hook para gestion de alertas del sistema en el portal de admin.
 * Proporciona funcionalidad completa de CRUD y gestion de alertas.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching.
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 * @updated 2026-02-20 - Migrated to React Query
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api/adminAPI';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type {
  Alert,
  AlertFilters,
  AlertsStats,
  PaginatedResponse,
} from '@/services/api/adminTypes';

// ============================================================================
// Query Key Factories
// ============================================================================

const alertsKeys = {
  all: ['admin', 'alerts'] as const,
  list: (filters: AlertFilters) => ['admin', 'alerts', 'list', filters] as const,
  stats: () => ['admin', 'alerts', 'stats'] as const,
};

// ============================================================================
// Return Interface (unchanged for backward compatibility)
// ============================================================================

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
 * Custom hook para gestion de alertas
 */
export function useAlerts(): UseAlertsReturn {
  const queryClient = useQueryClient();

  // Client-side state (selection, filters)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filters, setFiltersState] = useState<AlertFilters>({
    page: 1,
    limit: 20,
  });

  // ============================================================================
  // QUERIES
  // ============================================================================

  const alertsQuery = useQuery({
    queryKey: alertsKeys.list(filters),
    queryFn: async (): Promise<PaginatedResponse<Alert>> => {
      return adminAPI.alerts.list(filters);
    },
    staleTime: STALE_TIMES.REALTIME,
  });

  const statsQuery = useQuery({
    queryKey: alertsKeys.stats(),
    queryFn: async (): Promise<AlertsStats> => {
      return adminAPI.alerts.getStats();
    },
    staleTime: STALE_TIMES.DYNAMIC,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const acknowledgeMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      adminAPI.alerts.acknowledge(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.all });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      adminAPI.alerts.resolve(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.all });
    },
  });

  const suppressMutation = useMutation({
    mutationFn: (id: string) => adminAPI.alerts.suppress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.all });
    },
  });

  // ============================================================================
  // DERIVED DATA
  // ============================================================================

  const alerts = alertsQuery.data?.items ?? [];
  const pagination = alertsQuery.data?.pagination ?? {
    page: 1,
    totalPages: 0,
    totalItems: 0,
    limit: 20,
  };

  // ============================================================================
  // ACTION HANDLERS (backward-compatible interface)
  // ============================================================================

  const setFilters = useCallback((newFilters: AlertFilters) => {
    setFiltersState(newFilters);
  }, []);

  const fetchAlerts = useCallback(async () => {
    await alertsQuery.refetch();
  }, [alertsQuery]);

  const fetchStats = useCallback(async () => {
    await statsQuery.refetch();
  }, [statsQuery]);

  const refreshAlerts = useCallback(async () => {
    await Promise.all([alertsQuery.refetch(), statsQuery.refetch()]);
  }, [alertsQuery, statsQuery]);

  const acknowledgeAlert = useCallback(
    async (id: string, note?: string) => {
      await acknowledgeMutation.mutateAsync({ id, note });
    },
    [acknowledgeMutation],
  );

  const resolveAlert = useCallback(
    async (id: string, note: string) => {
      if (!note || note.trim().length < 10) {
        throw new Error('La nota de resolucion debe tener al menos 10 caracteres');
      }
      await resolveMutation.mutateAsync({ id, note });
    },
    [resolveMutation],
  );

  const suppressAlert = useCallback(
    async (id: string) => {
      await suppressMutation.mutateAsync(id);
    },
    [suppressMutation],
  );

  // ============================================================================
  // PAGINATION ACTIONS
  // ============================================================================

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      setFiltersState((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  }, [pagination]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      setFiltersState((prev) => ({ ...prev, page: Math.max((prev.page || 1) - 1, 1) }));
    }
  }, [pagination]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        setFiltersState((prev) => ({ ...prev, page }));
      }
    },
    [pagination],
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    alerts,
    stats: statsQuery.data ?? null,
    selectedAlert,

    // State
    isLoading: alertsQuery.isLoading || acknowledgeMutation.isPending || resolveMutation.isPending || suppressMutation.isPending,
    isLoadingStats: statsQuery.isLoading,
    error: alertsQuery.error instanceof Error ? alertsQuery.error.message : alertsQuery.error ? String(alertsQuery.error) : null,

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
