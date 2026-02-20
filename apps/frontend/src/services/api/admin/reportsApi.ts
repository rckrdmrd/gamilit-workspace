/**
 * Admin Reports API
 *
 * Functions for report generation, listing, downloading, and scheduling.
 * Split from adminAPI.ts monolith for modularity.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '../apiErrorHandler';
import type {
  Report,
  GenerateReportParams,
  ReportListFilters,
  PaginatedResponse,
} from '../adminTypes';

// ============================================================================
// REPORTS
// ============================================================================

/**
 * Generate report
 *
 * Status: Backend IMPLEMENTED (persisted to admin_dashboard.admin_reports)
 */
export async function generateReport(params: GenerateReportParams): Promise<Report> {
  try {
    const response = await apiClient.post<Report>(API_ENDPOINTS.admin.reports.generate, params);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to generate report');
  }
}

/**
 * Get list of reports
 *
 * Status: Backend IMPLEMENTED (persisted to admin_dashboard.admin_reports)
 */
export async function getReports(filters?: ReportListFilters): Promise<PaginatedResponse<Report>> {
  try {
    const response = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.admin.reports.list, {
      params: filters,
    });

    // Backend returns PaginatedReportsDto, transform to PaginatedResponse
    const backendData = response.data;
    const record = backendData as Record<string, unknown>;
    const items = Array.isArray(record.data) ? record.data : [];
    return {
      items: items as Report[],
      pagination: {
        page: typeof record.page === 'number' ? record.page : 1,
        totalPages: typeof record.total_pages === 'number' ? record.total_pages : 0,
        totalItems: typeof record.total === 'number' ? record.total : 0,
        limit: typeof record.limit === 'number' ? record.limit : 20,
      },
    };
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch reports');
  }
}

/**
 * Download report
 *
 * Status: Backend IMPLEMENTED (persisted to admin_dashboard.admin_reports)
 */
export async function downloadReport(reportId: string): Promise<Blob> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.reports.download(reportId), {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to download report ${reportId}`);
  }
}

/**
 * Delete report
 *
 * Status: Backend IMPLEMENTED (persisted to admin_dashboard.admin_reports)
 */
export async function deleteReport(reportId: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.admin.reports.delete(reportId));
  } catch (error) {
    throw handleAPIError(error, `Failed to delete report ${reportId}`);
  }
}

/**
 * Schedule report
 */
export async function scheduleReport(reportId: string, schedule: Record<string, unknown>): Promise<Report> {
  try {
    const response = await apiClient.post<Report>(
      API_ENDPOINTS.admin.reports.schedule(reportId),
      schedule,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to schedule report ${reportId}`);
  }
}

/**
 * Reports API namespace object
 */
export const reportsApi = {
  generateReport,
  getReports,
  downloadReport,
  deleteReport,
  scheduleReport,
};
