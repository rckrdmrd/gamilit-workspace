/**
 * Intervention Alerts API Client
 *
 * API client for the Teacher Intervention Alerts system.
 * Provides methods to fetch, acknowledge, resolve, and dismiss alerts.
 *
 * @module interventionAlertsApi
 */

import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * @synchronized-with backend/shared/types/intervention-alerts.types.ts
 * @last-sync 2025-11-24
 * @verified Frontend-Agent - Types are 100% aligned with backend
 */

export enum InterventionAlertType {
  NO_ACTIVITY = 'no_activity',
  LOW_SCORE = 'low_score',
  DECLINING_TREND = 'declining_trend',
  REPEATED_FAILURES = 'repeated_failures',
  EXCESSIVE_TIME = 'excessive_time',
  LOW_ENGAGEMENT = 'low_engagement',
}

export enum InterventionAlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum InterventionAlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export interface StudentInterventionAlert {
  id: string;
  student_id: string;
  student_name: string;
  classroom_id: string | null;
  classroom_name: string | null;
  alert_type: InterventionAlertType;
  severity: InterventionAlertSeverity;
  title: string;
  description: string | null;
  metrics: Record<string, unknown> | null;
  status: InterventionAlertStatus;
  generated_at: string;
  acknowledged_at: string | null;
  acknowledged_by_name: string | null;
  resolved_at: string | null;
  resolved_by_name: string | null;
  resolution_notes: string | null;
}

export interface InterventionAlertsListResponse {
  data: StudentInterventionAlert[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetAlertsParams {
  classroom_id?: string;
  alert_type?: InterventionAlertType;
  severity?: InterventionAlertSeverity;
  status?: InterventionAlertStatus;
  search?: string;
  limit?: number;
  offset?: number;
  include_dismissed?: boolean;
}

// ============================================================================
// DEPRECATED ALIASES (for backwards compatibility - remove after 2025-12-08)
// ============================================================================

/** @deprecated Use StudentInterventionAlert instead */
export type Alert = StudentInterventionAlert;

/** @deprecated Use InterventionAlertType instead */
export const AlertType = InterventionAlertType;
export type AlertType = InterventionAlertType;

/** @deprecated Use InterventionAlertSeverity instead */
export const AlertSeverity = InterventionAlertSeverity;
export type AlertSeverity = InterventionAlertSeverity;

/** @deprecated Use InterventionAlertStatus instead */
export const AlertStatus = InterventionAlertStatus;
export type AlertStatus = InterventionAlertStatus;

/** @deprecated Use InterventionAlertsListResponse instead */
export type AlertsListResponse = InterventionAlertsListResponse;

export interface ResolveAlertData {
  resolution_notes: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Intervention Alerts API Client
 *
 * Provides methods to interact with the teacher intervention alerts system:
 * - List alerts with filters and pagination
 * - Get alert details by ID
 * - Acknowledge alerts
 * - Resolve alerts with notes
 * - Dismiss alerts
 * - View student alert history
 * - Manually trigger alert generation
 */
export const interventionAlertsApi = {
  /**
   * Get list of intervention alerts
   *
   * @param params - Filter and pagination parameters
   * @returns Paginated list of alerts
   */
  getAlerts: async (params: GetAlertsParams = {}): Promise<InterventionAlertsListResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.teacher.alerts.list, { params });
    return response.data;
  },

  /**
   * Get a specific alert by ID
   *
   * @param alertId - Alert ID
   * @returns Alert details
   */
  getAlertById: async (alertId: string): Promise<StudentInterventionAlert> => {
    const response = await apiClient.get(API_ENDPOINTS.teacher.alerts.get(alertId));
    return response.data;
  },

  /**
   * Acknowledge an alert (marks it as acknowledged by the teacher)
   *
   * @param alertId - Alert ID to acknowledge
   * @returns Updated alert
   */
  acknowledgeAlert: async (alertId: string): Promise<StudentInterventionAlert> => {
    const response = await apiClient.patch(API_ENDPOINTS.teacher.alerts.acknowledge(alertId));
    return response.data;
  },

  /**
   * Resolve an alert with resolution notes
   *
   * @param alertId - Alert ID to resolve
   * @param data - Resolution data with notes
   * @returns Updated alert
   */
  resolveAlert: async (
    alertId: string,
    data: ResolveAlertData,
  ): Promise<StudentInterventionAlert> => {
    const response = await apiClient.patch(API_ENDPOINTS.teacher.alerts.resolve(alertId), data);
    return response.data;
  },

  /**
   * Dismiss an alert (marks it as dismissed, won't show in default list)
   *
   * @param alertId - Alert ID to dismiss
   * @returns Updated alert
   */
  dismissAlert: async (alertId: string): Promise<StudentInterventionAlert> => {
    const response = await apiClient.patch(API_ENDPOINTS.teacher.alerts.dismiss(alertId));
    return response.data;
  },

  /**
   * Get alert history for a specific student
   *
   * @param studentId - Student ID
   * @returns List of alerts for the student
   */
  getStudentAlertHistory: async (studentId: string): Promise<StudentInterventionAlert[]> => {
    const response = await apiClient.get(API_ENDPOINTS.teacher.alerts.studentHistory(studentId));
    return response.data;
  },

  /**
   * Manually trigger alert generation (runs the alert generation process)
   *
   * @returns Success message
   */
  generateAlerts: async (): Promise<{ message: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.teacher.alerts.generate);
    return response.data;
  },
};
