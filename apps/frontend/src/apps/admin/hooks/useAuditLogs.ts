/**
 * useAuditLogs Hook
 *
 * Custom hook for fetching and managing audit logs (authentication attempts).
 * Provides filtering, pagination, and data transformation.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching.
 *
 * Created for: AdminMonitoringPage - Logs Tab Implementation
 * Updated: 2026-02-20 - Migrated to React Query
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/services/api/adminAPI';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type { AuditLogEntry, AuditLogFilters, PaginatedResponse } from '@/services/api/adminTypes';

// ============================================================================
// Query Key Factories
// ============================================================================

const auditLogsKeys = {
  all: ['admin', 'audit-logs'] as const,
  list: (filters: AuditLogFilters, page: number, limit: number) =>
    ['admin', 'audit-logs', 'list', { ...filters, page, limit }] as const,
};

// ============================================================================
// Types (unchanged for backward compatibility)
// ============================================================================

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
 */
export function useAuditLogs(params?: UseAuditLogsParams): UseAuditLogsResult {
  const {
    filters: initialFilters = {},
    page: initialPage = 1,
    pageSize: initialPageSize = 20,
    autoFetch = true,
  } = params || {};

  // Client-side filter/pagination state
  const [filters, setFiltersState] = useState<AuditLogFilters>(initialFilters);
  const [page, setPageState] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);

  // ============================================================================
  // QUERY
  // ============================================================================

  const query = useQuery({
    queryKey: auditLogsKeys.list(filters, page, pageSize),
    queryFn: async (): Promise<PaginatedResponse<AuditLogEntry>> => {
      return getAuditLogs({
        ...filters,
        page,
        limit: pageSize,
      });
    },
    enabled: autoFetch,
    staleTime: STALE_TIMES.DYNAMIC,
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const setFilters = useCallback((newFilters: AuditLogFilters) => {
    setFiltersState(newFilters);
    setPageState(1); // Reset to page 1 when filters change
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
