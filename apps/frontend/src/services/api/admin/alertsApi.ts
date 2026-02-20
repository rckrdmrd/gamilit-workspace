/**
 * Admin Alerts API
 *
 * Functions for system alert management (list, create, acknowledge, resolve, suppress).
 * Split from adminAPI.ts monolith for modularity.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '../apiErrorHandler';
import type {
  Alert,
  AlertFilters,
  AlertsStats,
  PaginatedResponse,
} from '../adminTypes';

// ============================================================================
// ALERTS
// ============================================================================

/**
 * List alerts with filters
 *
 * Status: Backend IMPLEMENTED
 */
export async function listAlerts(filters?: AlertFilters): Promise<PaginatedResponse<Alert>> {
  try {
    const response = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.admin.alerts, { params: filters });

    const backendData = response.data;
    const record = backendData as Record<string, unknown>;
    const items = Array.isArray(record.data) ? record.data : [];

    return {
      items: items as Alert[],
      pagination: {
        page: typeof record.page === 'number' ? record.page : 1,
        totalPages: typeof record.total_pages === 'number' ? record.total_pages : 0,
        totalItems: typeof record.total === 'number' ? record.total : 0,
        limit: typeof record.limit === 'number' ? record.limit : 20,
      },
    };
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch alerts');
  }
}

/**
 * Get alert by ID
 *
 * Status: Backend IMPLEMENTED
 */
export async function getAlertById(id: string): Promise<Alert> {
  try {
    const response = await apiClient.get<Alert>(`${API_ENDPOINTS.admin.alerts}/${id}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch alert ${id}`);
  }
}

/**
 * Get alerts statistics
 *
 * Status: Backend IMPLEMENTED
 */
export async function getAlertsStats(): Promise<AlertsStats> {
  try {
    const response = await apiClient.get<AlertsStats>(
      `${API_ENDPOINTS.admin.alerts}/stats/summary`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch alerts stats');
  }
}

/**
 * Create manual alert
 *
 * Status: Backend IMPLEMENTED
 */
export async function createAlert(data: Partial<Alert>): Promise<Alert> {
  try {
    const response = await apiClient.post<Alert>(API_ENDPOINTS.admin.alerts, data);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to create alert');
  }
}

/**
 * Acknowledge alert
 *
 * Status: Backend IMPLEMENTED
 */
export async function acknowledgeAlert(id: string, note?: string): Promise<Alert> {
  try {
    const response = await apiClient.patch<Alert>(
      `${API_ENDPOINTS.admin.alerts}/${id}/acknowledge`,
      { acknowledgment_note: note },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to acknowledge alert ${id}`);
  }
}

/**
 * Resolve alert
 *
 * Status: Backend IMPLEMENTED
 */
export async function resolveAlert(id: string, note: string): Promise<Alert> {
  try {
    const response = await apiClient.patch<Alert>(`${API_ENDPOINTS.admin.alerts}/${id}/resolve`, {
      resolution_note: note,
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to resolve alert ${id}`);
  }
}

/**
 * Suppress alert
 *
 * Status: Backend IMPLEMENTED
 */
export async function suppressAlert(id: string): Promise<Alert> {
  try {
    const response = await apiClient.patch<Alert>(`${API_ENDPOINTS.admin.alerts}/${id}/suppress`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to suppress alert ${id}`);
  }
}

/**
 * Alerts API namespace object
 */
export const alertsApi = {
  listAlerts,
  getAlertById,
  getAlertsStats,
  createAlert,
  acknowledgeAlert,
  resolveAlert,
  suppressAlert,
};
