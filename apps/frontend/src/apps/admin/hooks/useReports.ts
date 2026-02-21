/**
 * useReports Hook
 *
 * Custom hook for managing admin reports with auto-refresh capabilities.
 * Integrates with backend Reports API (persisted to admin_dashboard.admin_reports).
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching.
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 * @updated 2026-02-20 - Migrated to React Query
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api/adminAPI';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type {
  Report,
  ReportListFilters,
  GenerateReportParams,
  PaginatedResponse,
} from '@/services/api/adminTypes';

// ============================================================================
// Query Key Factories
// ============================================================================

const reportsKeys = {
  all: ['admin', 'reports'] as const,
  list: (filters: ReportListFilters) => ['admin', 'reports', 'list', filters] as const,
};

// ============================================================================
// Types (unchanged for backward compatibility)
// ============================================================================

interface UseReportsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialFilters?: ReportListFilters;
}

interface UseReportsReturn {
  // Data
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Report>['pagination'] | null;

  // Actions
  generateReport: (params: GenerateReportParams) => Promise<Report>;
  refreshReports: () => Promise<void>;
  downloadReport: (reportId: string, filename?: string) => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
  setFilters: (filters: ReportListFilters) => void;

  // Status
  hasPendingReports: boolean;
}

/**
 * Hook for managing admin reports
 */
export function useReports(options: UseReportsOptions = {}): UseReportsReturn {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    initialFilters = { page: 1, limit: 20 },
  } = options;

  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ReportListFilters>(initialFilters);

  // ============================================================================
  // QUERY
  // ============================================================================

  const reportsQuery = useQuery({
    queryKey: reportsKeys.list(filters),
    queryFn: () => adminAPI.reports.list(filters),
    staleTime: STALE_TIMES.DYNAMIC,
    // Auto-refresh when pending reports exist
    refetchInterval: (query) => {
      if (!autoRefresh) return false;
      const data = query.state.data;
      const hasPending = data?.items?.some(
        (report: Report) => report.status === 'pending' || report.status === 'generating',
      );
      return hasPending ? refreshInterval : false;
    },
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const generateMutation = useMutation({
    mutationFn: (params: GenerateReportParams) => adminAPI.reports.generate(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reportId: string) => adminAPI.reports.delete(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.all });
    },
  });

  // ============================================================================
  // DERIVED DATA
  // ============================================================================

  const reports = reportsQuery.data?.items ?? [];
  const pagination = reportsQuery.data?.pagination ?? null;
  const hasPendingReports = reports.some(
    (report) => report.status === 'pending' || report.status === 'generating',
  );

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const refreshReports = useCallback(async () => {
    await reportsQuery.refetch();
  }, [reportsQuery]);

  const generateReport = useCallback(
    async (params: GenerateReportParams): Promise<Report> => {
      return generateMutation.mutateAsync(params);
    },
    [generateMutation],
  );

  const downloadReport = useCallback(
    async (reportId: string, filename?: string): Promise<void> => {
      const report = reports.find((r) => r.id === reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      if (report.status !== 'completed') {
        throw new Error('Report is not ready for download');
      }

      // Download blob
      const blob = await adminAPI.reports.download(reportId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const defaultFilename = `report-${report.type}-${new Date().toISOString().split('T')[0]}.${report.format}`;
      link.download = filename || defaultFilename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    [reports],
  );

  const deleteReport = useCallback(
    async (reportId: string): Promise<void> => {
      await deleteMutation.mutateAsync(reportId);
    },
    [deleteMutation],
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    reports,
    isLoading: reportsQuery.isLoading || generateMutation.isPending || deleteMutation.isPending,
    error: reportsQuery.error instanceof Error ? reportsQuery.error.message : reportsQuery.error ? String(reportsQuery.error) : null,
    pagination,

    // Actions
    generateReport,
    refreshReports,
    downloadReport,
    deleteReport,
    setFilters,

    // Status
    hasPendingReports,
  };
}
