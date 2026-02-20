/**
 * Admin Monitoring API
 *
 * Functions for system health, metrics, logs, audit logs, and maintenance mode.
 * Split from adminAPI.ts monolith for modularity.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '../apiErrorHandler';
import type {
  SystemHealth,
  SystemMetrics,
  LogEntry,
  LogFilters,
  MaintenanceMode,
  AuditLogEntry,
  AuditLogFilters,
  PaginatedResponse,
  ExtendedSystemMetrics,
  MetricsHistoryDataPoint,
  ErrorStats,
  RecentError,
  ErrorTrendDataPoint,
} from '../adminTypes';

// ============================================================================
// MONITORING
// ============================================================================

/**
 * Get system health
 *
 * Status: Backend IMPLEMENTED
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await apiClient.get<SystemHealth>(API_ENDPOINTS.admin.system.health);

    // Note: apiClient interceptor already unwraps { success, data } to just data
    // So response.data IS the SystemHealth object directly
    if (!response.data) {
      throw new Error('Backend returned no health data');
    }

    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch system health');
  }
}

/**
 * Get system metrics
 *
 * Status: Backend IMPLEMENTED
 */
export async function getSystemMetrics(): Promise<SystemMetrics> {
  try {
    const response = await apiClient.get<SystemMetrics>(API_ENDPOINTS.admin.system.metrics);

    // Note: apiClient interceptor already unwraps { success, data } to just data
    if (!response.data) {
      throw new Error('Backend returned no metrics data');
    }

    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch system metrics');
  }
}

/**
 * Get system logs
 */
export async function getSystemLogs(filters?: LogFilters): Promise<PaginatedResponse<LogEntry>> {
  try {
    const response = await apiClient.get<PaginatedResponse<LogEntry>>(
      API_ENDPOINTS.admin.system.logs,
      { params: filters },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch system logs');
  }
}

/**
 * Get audit logs (authentication attempts)
 *
 * Status: Backend IMPLEMENTED
 * Endpoint: GET /admin/system/audit-log
 */
export async function getAuditLogs(
  filters?: AuditLogFilters,
): Promise<PaginatedResponse<AuditLogEntry>> {
  try {
    // Transform frontend filters to backend params
    const params: Record<string, unknown> = {};
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.userId) params.user_id = filters.userId;
    if (filters?.email) params.email = filters.email;
    if (filters?.ipAddress) params.ip_address = filters.ipAddress;
    if (filters?.success !== undefined) params.success = filters.success;
    if (filters?.startDate) params.start_date = filters.startDate;
    if (filters?.endDate) params.end_date = filters.endDate;

    const response = await apiClient.get<Record<string, unknown>>(
      `${API_ENDPOINTS.admin.system.logs.replace('/logs', '/audit-log')}`,
      { params },
    );

    const backendData = response.data;
    const record = backendData as Record<string, unknown>;
    const rawLogs = Array.isArray(record.data) ? record.data : [];

    const logs = rawLogs.map((log) => {
      const logRecord = log as Record<string, unknown>;
      return {
        id: String(logRecord.id ?? ''),
        userId: (logRecord.user_id as string) ?? null,
        email: String(logRecord.email ?? ''),
        ipAddress: (logRecord.ip_address as string) ?? null,
        userAgent: (logRecord.user_agent as string) ?? null,
        success: Boolean(logRecord.success),
        failureReason: (logRecord.failure_reason as string) ?? null,
        attemptedAt: String(logRecord.attempted_at ?? ''),
      };
    });

    return {
      items: logs,
      pagination: {
        page: typeof record.page === 'number' ? record.page : 1,
        totalPages: typeof record.total_pages === 'number' ? record.total_pages : 0,
        totalItems: typeof record.total === 'number' ? record.total : 0,
        limit: typeof record.limit === 'number' ? record.limit : 50,
      },
    };
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch audit logs');
  }
}

/**
 * Toggle maintenance mode
 *
 * Status: Backend PARTIAL (needs completion - P1)
 */
export async function toggleMaintenanceMode(
  enabled: boolean,
  message?: string,
): Promise<MaintenanceMode> {
  try {
    const response = await apiClient.post<MaintenanceMode>(API_ENDPOINTS.admin.system.maintenance, {
      enabled,
      message,
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to toggle maintenance mode');
  }
}

/**
 * Get extended system metrics for real-time monitoring
 */
export async function getExtendedMetrics(): Promise<ExtendedSystemMetrics> {
  try {
    const response = await apiClient.get<ExtendedSystemMetrics>(
      API_ENDPOINTS.admin.monitoring.metrics,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch extended metrics');
  }
}

/**
 * Get metrics history data points
 */
export async function getMetricsHistory(params?: { hours?: number }): Promise<MetricsHistoryDataPoint[]> {
  try {
    const response = await apiClient.get<MetricsHistoryDataPoint[]>(
      API_ENDPOINTS.admin.monitoring.metricsHistory,
      { params },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch metrics history');
  }
}

/**
 * Get error statistics
 */
export async function getErrorStats(params?: { hours?: number }): Promise<ErrorStats> {
  try {
    const response = await apiClient.get<ErrorStats>(
      API_ENDPOINTS.admin.monitoring.errorStats,
      { params },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch error stats');
  }
}

/**
 * Get recent errors
 */
export async function getRecentErrors(params?: { limit?: number; level?: string }): Promise<{ errors: RecentError[] }> {
  try {
    const response = await apiClient.get<{ errors: RecentError[] }>(
      API_ENDPOINTS.admin.monitoring.recentErrors,
      { params },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch recent errors');
  }
}

/**
 * Get error trends
 */
export async function getErrorTrends(params?: { hours?: number; group_by?: string }): Promise<{
  trends: ErrorTrendDataPoint[];
}> {
  try {
    const response = await apiClient.get<{
      trends: ErrorTrendDataPoint[];
    }>(API_ENDPOINTS.admin.monitoring.errorTrends, { params });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch error trends');
  }
}

/**
 * Monitoring API namespace object
 */
export const monitoringApi = {
  getSystemHealth,
  getSystemMetrics,
  getSystemLogs,
  getAuditLogs,
  toggleMaintenanceMode,
  getExtendedMetrics,
  getMetricsHistory,
  getErrorStats,
  getRecentErrors,
  getErrorTrends,
};
