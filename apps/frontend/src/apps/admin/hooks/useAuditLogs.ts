/**
 * useAuditLogs Hook
 *
 * Custom hook for fetching and managing audit logs (authentication attempts).
 * Provides filtering, pagination, and data transformation.
 *
 * Created for: AdminMonitoringPage - Logs Tab Implementation
 */

import { useState, useEffect, useCallback } from 'react';
import { getAuditLogs } from '@/services/api/adminAPI';
import type { AuditLogEntry, AuditLogFilters, PaginatedResponse } from '@/services/api/adminTypes';

export interface UseAuditLogsParams {
  filters?: AuditLogFilters;
  page?: number;
  pageSize?: number;
  autoFetch?: boolean; // If true, fetch on mount
}

export interface UseAuditLogsResult {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setFilters: (filters: AuditLogFilters) => void;
  setPage: (page: number) => void;
}

/**
 * Hook for managing audit logs
 *
 * @example
 * ```tsx
 * const { logs, isLoading, error, setFilters, setPage } = useAuditLogs({
 *   page: 1,
 *   pageSize: 20,
 *   autoFetch: true
 * });
 * ```
 */
export function useAuditLogs(params?: UseAuditLogsParams): UseAuditLogsResult {
  const {
    filters: initialFilters = {},
    page: initialPage = 1,
    pageSize: initialPageSize = 20,
    autoFetch = true,
  } = params || {};

  // State
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    totalPages: 0,
    totalItems: 0,
    limit: initialPageSize,
  });
  const [filters, setFiltersState] = useState<AuditLogFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch audit logs from API
   */
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<AuditLogEntry> = await getAuditLogs({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      setLogs(response.items);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch audit logs';
      setError(errorMessage);
      console.error('[useAuditLogs] Error fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  /**
   * Update filters and reset to page 1
   */
  const setFilters = useCallback((newFilters: AuditLogFilters) => {
    setFiltersState(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Update current page
   */
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Manual refetch
   */
  const refetch = useCallback(async () => {
    await fetchLogs();
  }, [fetchLogs]);

  /**
   * Auto-fetch on mount and when dependencies change
   */
  useEffect(() => {
    if (autoFetch) {
      fetchLogs();
    }
  }, [fetchLogs, autoFetch]);

  return {
    logs,
    total: pagination.totalItems,
    page: pagination.page,
    totalPages: pagination.totalPages,
    pageSize: pagination.limit,
    isLoading,
    error,
    refetch,
    setFilters,
    setPage,
  };
}
