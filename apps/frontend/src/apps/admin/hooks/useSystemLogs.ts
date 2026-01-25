/**
 * useSystemLogs Hook
 *
 * Custom hook for fetching and managing system logs (application logs).
 * Different from useAuditLogs which handles authentication attempts.
 *
 * Features:
 * - Fetch system logs with filtering
 * - Pagination support
 * - Log level filtering (debug, info, warn, error)
 * - Date range filtering
 * - Search in message
 *
 * Backend: GET /admin/system/logs
 * Created: 2026-01-25 - P1 Gap Integration
 */

import { useState, useEffect, useCallback } from 'react';
import { getSystemLogs } from '@/services/api/adminAPI';
import type { LogEntry, LogFilters } from '@/services/api/adminTypes';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface SystemLogFilters {
  level?: LogLevel;
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UseSystemLogsParams {
  filters?: SystemLogFilters;
  page?: number;
  pageSize?: number;
  autoFetch?: boolean;
}

export interface UseSystemLogsResult {
  logs: LogEntry[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setFilters: (filters: SystemLogFilters) => void;
  setPage: (page: number) => void;
}

/**
 * Hook for managing system logs
 *
 * @example
 * ```tsx
 * const { logs, isLoading, error, setFilters, setPage } = useSystemLogs({
 *   page: 1,
 *   pageSize: 50,
 *   autoFetch: true
 * });
 *
 * // Filter by log level
 * setFilters({ level: 'error' });
 *
 * // Search in logs
 * setFilters({ search: 'database connection' });
 * ```
 */
export function useSystemLogs(params?: UseSystemLogsParams): UseSystemLogsResult {
  const {
    filters: initialFilters = {},
    page: initialPage = 1,
    pageSize: initialPageSize = 50,
    autoFetch = true,
  } = params || {};

  // State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    totalPages: 0,
    totalItems: 0,
    limit: initialPageSize,
  });
  const [filters, setFiltersState] = useState<SystemLogFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Transform frontend filters to backend LogFilters format
   */
  const transformFilters = useCallback((f: SystemLogFilters): LogFilters => {
    return {
      level: f.level,
      date: f.date,
      search: f.search,
      page: pagination.page,
      limit: pagination.limit,
    };
  }, [pagination.page, pagination.limit]);

  /**
   * Fetch system logs from API
   * Backend: GET /admin/system/logs
   */
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiFilters = transformFilters(filters);
      const response = await getSystemLogs(apiFilters);

      // Handle different response structures
      if (Array.isArray(response)) {
        // Direct array response
        setLogs(response);
        setPagination(prev => ({
          ...prev,
          totalItems: response.length,
          totalPages: 1,
        }));
      } else if ('items' in response && response.items) {
        // PaginatedResponse with items
        setLogs(response.items);
        if (response.pagination) {
          setPagination({
            page: response.pagination.page || pagination.page,
            limit: response.pagination.limit || pagination.limit,
            totalItems: response.pagination.totalItems || 0,
            totalPages: response.pagination.totalPages || 0,
          });
        }
      } else {
        // Unknown structure - try to extract data
        console.warn('[useSystemLogs] Unknown response structure:', response);
        setLogs([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch system logs';
      setError(errorMessage);
      console.error('[useSystemLogs] Error fetching logs:', err);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, transformFilters, pagination.page, pagination.limit]);

  /**
   * Update filters and reset to page 1
   */
  const setFilters = useCallback((newFilters: SystemLogFilters) => {
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
