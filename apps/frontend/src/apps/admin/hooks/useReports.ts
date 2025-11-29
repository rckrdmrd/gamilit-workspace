/**
 * useReports Hook
 *
 * Custom hook for managing admin reports with auto-refresh capabilities
 * Integrates with backend Reports API (in-memory storage)
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 * @updated Complete rewrite with auto-refresh and proper typing
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { adminAPI } from '@/services/api/adminAPI';
import type {
  Report,
  ReportListFilters,
  GenerateReportParams,
  PaginatedResponse,
} from '@/services/api/adminTypes';

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
 *
 * Features:
 * - Automatic refresh when pending/generating reports exist
 * - Manual refresh capability
 * - Download reports as files
 * - Delete reports
 * - Filtering and pagination
 */
export function useReports(options: UseReportsOptions = {}): UseReportsReturn {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    initialFilters = { page: 1, limit: 20 },
  } = options;

  // State
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<Report>['pagination'] | null>(
    null,
  );
  const [filters, setFilters] = useState<ReportListFilters>(initialFilters);

  // Refs for auto-refresh management
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Check if there are reports in pending/generating state
   */
  const hasPendingReports = reports.some(
    (report) => report.status === 'pending' || report.status === 'generating',
  );

  /**
   * Fetch reports from API
   */
  const fetchReports = useCallback(async (fetchFilters: ReportListFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminAPI.reports.list(fetchFilters);

      if (isMountedRef.current) {
        setReports(response.items);
        setPagination(response.pagination);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch reports');
        console.error('[useReports] Error fetching reports:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Refresh reports manually
   */
  const refreshReports = useCallback(async () => {
    await fetchReports(filters);
  }, [filters, fetchReports]);

  /**
   * Generate a new report
   */
  const generateReport = useCallback(
    async (params: GenerateReportParams): Promise<Report> => {
      try {
        setError(null);
        const report = await adminAPI.reports.generate(params);

        // Refresh list to include new report
        await fetchReports(filters);

        return report;
      } catch (err: unknown) {
        const errorMessage = err.message || 'Failed to generate report';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [filters, fetchReports],
  );

  /**
   * Download a report
   */
  const downloadReport = useCallback(
    async (reportId: string, filename?: string): Promise<void> => {
      try {
        setError(null);

        // Find report to get metadata
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

        // Generate filename if not provided
        const defaultFilename = `report-${report.type}-${new Date().toISOString().split('T')[0]}.${report.format}`;
        link.download = filename || defaultFilename;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err: unknown) {
        const errorMessage = err.message || 'Failed to download report';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [reports],
  );

  /**
   * Delete a report
   */
  const deleteReport = useCallback(
    async (reportId: string): Promise<void> => {
      try {
        setError(null);
        await adminAPI.reports.delete(reportId);

        // Refresh list after deletion
        await fetchReports(filters);
      } catch (err: unknown) {
        const errorMessage = err.message || 'Failed to delete report';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [filters, fetchReports],
  );

  /**
   * Initial fetch and filter changes
   */
  useEffect(() => {
    fetchReports(filters);
  }, [filters, fetchReports]);

  /**
   * Auto-refresh for pending/generating reports
   */
  useEffect(() => {
    if (!autoRefresh || !hasPendingReports) {
      // Clear existing timer
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      return;
    }

    // Set up refresh timer
    refreshTimerRef.current = setInterval(() => {
      fetchReports(filters);
    }, refreshInterval);

    // Cleanup
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [autoRefresh, hasPendingReports, refreshInterval, filters, fetchReports]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  return {
    // Data
    reports,
    isLoading,
    error,
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
