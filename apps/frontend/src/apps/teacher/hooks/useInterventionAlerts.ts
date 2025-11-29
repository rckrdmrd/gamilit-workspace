/**
 * useInterventionAlerts Hook
 *
 * Custom React hook for managing intervention alerts in the Teacher portal.
 * Provides state management, filtering, pagination, and actions for alerts.
 *
 * @module useInterventionAlerts
 */

import { useState, useEffect, useCallback } from 'react';
import {
  interventionAlertsApi,
  StudentInterventionAlert,
  InterventionAlertsListResponse,
  GetAlertsParams,
  InterventionAlertSeverity,
  InterventionAlertStatus,
  InterventionAlertType,
  ResolveAlertData,
} from '../../../services/api/teacher/interventionAlertsApi';

// ============================================================================
// TYPES
// ============================================================================

export interface AlertFilters {
  classroom_id?: string;
  alert_type?: InterventionAlertType;
  severity?: InterventionAlertSeverity;
  status?: InterventionAlertStatus;
  search?: string;
}

export interface UseInterventionAlertsReturn {
  alerts: StudentInterventionAlert[];
  total: number;
  loading: boolean;
  error: Error | null;
  filters: AlertFilters;
  pagination: { limit: number; offset: number };
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string, notes: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  updateFilters: (newFilters: Partial<AlertFilters>) => void;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for managing intervention alerts
 *
 * Features:
 * - Fetches and displays alerts with pagination
 * - Supports filtering by classroom, type, severity, status, and search
 * - Provides actions: acknowledge, resolve, dismiss
 * - Automatic refresh on filter/pagination changes
 * - Optimistic UI updates for better UX
 *
 * @param initialFilters - Initial filter values
 * @returns Alert state and action methods
 *
 * @example
 * ```tsx
 * const {
 *   alerts,
 *   loading,
 *   acknowledgeAlert,
 *   updateFilters
 * } = useInterventionAlerts({ classroom_id: '123' });
 * ```
 */
export const useInterventionAlerts = (
  initialFilters: AlertFilters = {},
): UseInterventionAlertsReturn => {
  const [alerts, setAlerts] = useState<StudentInterventionAlert[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<AlertFilters>(initialFilters);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0 });

  /**
   * Fetch alerts from API with current filters and pagination
   */
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: GetAlertsParams = {
        ...filters,
        ...pagination,
        include_dismissed: false,
      };
      const response: InterventionAlertsListResponse =
        await interventionAlertsApi.getAlerts(params);
      setAlerts(response.data);
      setTotal(response.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(err.message || 'Error al cargar alertas'));
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  // Fetch alerts when filters or pagination change
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  /**
   * Acknowledge an alert
   * Updates local state optimistically for better UX
   *
   * @param alertId - ID of alert to acknowledge
   */
  const acknowledgeAlert = async (alertId: string): Promise<void> => {
    try {
      await interventionAlertsApi.acknowledgeAlert(alertId);
      // Optimistic update: Update alert in local state
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? {
                ...alert,
                status: InterventionAlertStatus.ACKNOWLEDGED,
                acknowledged_at: new Date().toISOString(),
              }
            : alert,
        ),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(err.message || 'Error al reconocer alerta'));
      throw err;
    }
  };

  /**
   * Resolve an alert with resolution notes
   * Updates local state optimistically
   *
   * @param alertId - ID of alert to resolve
   * @param notes - Resolution notes describing actions taken
   */
  const resolveAlert = async (alertId: string, notes: string): Promise<void> => {
    try {
      const data: ResolveAlertData = { resolution_notes: notes };
      await interventionAlertsApi.resolveAlert(alertId, data);
      // Optimistic update: Mark as resolved
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? {
                ...alert,
                status: InterventionAlertStatus.RESOLVED,
                resolved_at: new Date().toISOString(),
                resolution_notes: notes,
              }
            : alert,
        ),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(err.message || 'Error al resolver alerta'));
      throw err;
    }
  };

  /**
   * Dismiss an alert
   * Removes from local state (since dismissed alerts are not fetched by default)
   *
   * @param alertId - ID of alert to dismiss
   */
  const dismissAlert = async (alertId: string): Promise<void> => {
    try {
      await interventionAlertsApi.dismissAlert(alertId);
      // Remove from local state (dismissed alerts are filtered out)
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      setTotal((prev) => prev - 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(err.message || 'Error al descartar alerta'));
      throw err;
    }
  };

  /**
   * Update filters and reset pagination
   *
   * @param newFilters - Partial filter object to merge with current filters
   */
  const updateFilters = (newFilters: Partial<AlertFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination({ limit: 20, offset: 0 }); // Reset to first page
  };

  /**
   * Navigate to next page
   */
  const nextPage = () => {
    setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }));
  };

  /**
   * Navigate to previous page
   */
  const prevPage = () => {
    setPagination((prev) => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }));
  };

  /**
   * Manually refresh alerts (re-fetch with current filters/pagination)
   */
  const refresh = () => {
    fetchAlerts();
  };

  return {
    alerts,
    total,
    loading,
    error,
    filters,
    pagination,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    updateFilters,
    nextPage,
    prevPage,
    refresh,
  };
};
