/**
 * useSystemLogs Hook
 *
 * Custom hook for fetching and managing system logs (application logs).
 * Different from useAuditLogs which handles authentication attempts.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching.
 *
 * Backend: GET /admin/system/logs
 * Created: 2026-01-25 - P1 Gap Integration
 * Updated: 2026-02-20 - Migrated to React Query
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSystemLogs } from '@/services/api/adminAPI';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type { LogEntry, LogFilters } from '@/services/api/adminTypes';

// ============================================================================
// Query Key Factories
// ============================================================================

const systemLogsKeys = {
  all: ['admin', 'system-logs'] as const,
  list: (filters: SystemLogFilters, page: number, limit: number) =>
    ['admin', 'system-logs', 'list', { ...filters, page, limit }] as const,
};

// ============================================================================
// Types (unchanged for backward compatibility)
// ============================================================================

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

// ============================================================================
// Hook
// ============================================================================

export function useSystemLogs(params?: UseSystemLogsParams): UseSystemLogsResult {
  const {
    filters: initialFilters = {},
    page: initialPage = 1,
    pageSize: initialPageSize = 50,
    autoFetch = true,
  } = params || {};

  // Client-side filter/pagination state
  const [filters, setFiltersState] = useState<SystemLogFilters>(initialFilters);
  const [page, setPageState] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);

  // ============================================================================
  // QUERY
  // ============================================================================

  const query = useQuery({
    queryKey: systemLogsKeys.list(filters, page, pageSize),
    queryFn: async () => {
      const apiFilters: LogFilters = {
        level: filters.level,
        date: filters.date,
        search: filters.search,
        page,
        limit: pageSize,
      };

      const response = await getSystemLogs(apiFilters);

      // Handle different response structures
      if (Array.isArray(response)) {
        return {
          items: response as LogEntry[],
          pagination: {
            page,
            limit: pageSize,
            totalItems: response.length,
            totalPages: 1,
          },
        };
      } else if ('items' in response && response.items) {
        return {
          items: response.items as LogEntry[],
          pagination: {
            page: response.pagination?.page || page,
            limit: response.pagination?.limit || pageSize,
            totalItems: response.pagination?.totalItems || 0,
            totalPages: response.pagination?.totalPages || 0,
          },
        };
      } else {
        console.warn('[useSystemLogs] Unknown response structure:', response);
        return {
          items: [] as LogEntry[],
          pagination: { page, limit: pageSize, totalItems: 0, totalPages: 0 },
        };
      }
    },
    enabled: autoFetch,
    staleTime: STALE_TIMES.DYNAMIC,
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const setFilters = useCallback((newFilters: SystemLogFilters) => {
    setFiltersState(newFilters);
    setPageState(1);
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  // ============================================================================
  // RETURN
  // ============================================================================

  const pagination = query.data?.pagination;

  return {
    logs: query.data?.items ?? [],
    total: pagination?.totalItems ?? 0,
    page: pagination?.page ?? page,
    totalPages: pagination?.totalPages ?? 0,
    pageSize: pagination?.limit ?? pageSize,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch,
    setFilters,
    setPage,
  };
}
