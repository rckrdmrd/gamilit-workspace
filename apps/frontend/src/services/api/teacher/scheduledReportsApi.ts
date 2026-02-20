/**
 * Scheduled Reports API Service
 *
 * Provides methods to create, list, update, pause, resume, and delete
 * scheduled reports for the teacher portal.
 *
 * All endpoints are prefixed with `/teacher/reports/scheduled` and require
 * authentication with admin_teacher or super_admin role.
 *
 * @module services/api/teacher/scheduledReportsApi
 */

import { apiClient } from '../apiClient';
import { handleAPIError } from '../apiErrorHandler';
import { API_ENDPOINTS } from '@/config/api.config';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Frequency options for scheduled reports
 */
export type ScheduledReportFrequency = 'daily' | 'weekly' | 'monthly';

/**
 * Status of a scheduled report
 */
export type ScheduledReportStatus = 'active' | 'paused' | 'completed';

/**
 * Response DTO for a scheduled report (snake_case from backend)
 *
 * @see apps/backend/src/modules/teacher/dto/scheduled-report.dto.ts
 */
export interface ScheduledReportResponse {
  id: string;
  report_name: string;
  report_type: string;
  report_format: string;
  classroom_id: string | null;
  frequency: ScheduledReportFrequency;
  day_of_week: number | null;
  day_of_month: number | null;
  preferred_hour: number | null;
  status: ScheduledReportStatus;
  last_run_at: string | null;
  next_run_at: string | null;
  run_count: number;
  notify_email: boolean;
  email_recipients: string[] | null;
  created_at: string;
}

/**
 * DTO for creating a new scheduled report
 */
export interface CreateScheduledReportDto {
  reportName: string;
  reportType: string;
  reportFormat: string;
  classroomId?: string;
  studentIds?: string[];
  frequency: ScheduledReportFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  preferredHour?: number;
  notifyEmail?: boolean;
  emailRecipients?: string[];
}

/**
 * DTO for updating an existing scheduled report
 */
export interface UpdateScheduledReportDto {
  reportName?: string;
  frequency?: ScheduledReportFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  preferredHour?: number;
  status?: ScheduledReportStatus;
  notifyEmail?: boolean;
  emailRecipients?: string[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const SCHEDULED = API_ENDPOINTS.teacher.reports.scheduled;

/**
 * Get all scheduled reports for the authenticated teacher
 *
 * @returns Promise<ScheduledReportResponse[]> - List of scheduled reports
 */
export async function getScheduledReports(): Promise<ScheduledReportResponse[]> {
  try {
    const { data } = await apiClient.get<ScheduledReportResponse[]>(SCHEDULED.list);
    return data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch scheduled reports');
  }
}

/**
 * Create a new scheduled report
 *
 * @param dto - Scheduled report creation data
 * @returns Promise<ScheduledReportResponse> - Created scheduled report
 */
export async function createScheduledReport(
  dto: CreateScheduledReportDto,
): Promise<ScheduledReportResponse> {
  try {
    const { data } = await apiClient.post<ScheduledReportResponse>(SCHEDULED.create, dto);
    return data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to create scheduled report');
  }
}

/**
 * Get a single scheduled report by ID
 *
 * @param id - Scheduled report ID (UUID)
 * @returns Promise<ScheduledReportResponse> - Scheduled report details
 */
export async function getScheduledReportById(
  id: string,
): Promise<ScheduledReportResponse> {
  try {
    const { data } = await apiClient.get<ScheduledReportResponse>(SCHEDULED.get(id));
    return data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch scheduled report');
  }
}

/**
 * Update a scheduled report
 *
 * @param id - Scheduled report ID (UUID)
 * @param dto - Fields to update
 * @returns Promise<ScheduledReportResponse> - Updated scheduled report
 */
export async function updateScheduledReport(
  id: string,
  dto: UpdateScheduledReportDto,
): Promise<ScheduledReportResponse> {
  try {
    const { data } = await apiClient.put<ScheduledReportResponse>(SCHEDULED.update(id), dto);
    return data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update scheduled report');
  }
}

/**
 * Delete a scheduled report
 *
 * @param id - Scheduled report ID (UUID)
 * @returns Promise<{ message: string }> - Confirmation message
 */
export async function deleteScheduledReport(
  id: string,
): Promise<{ message: string }> {
  try {
    const { data } = await apiClient.delete<{ message: string }>(SCHEDULED.delete(id));
    return data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to delete scheduled report');
  }
}

/**
 * Pause a scheduled report
 *
 * @param id - Scheduled report ID (UUID)
 * @returns Promise<ScheduledReportResponse> - Updated scheduled report with status 'paused'
 */
export async function pauseScheduledReport(
  id: string,
): Promise<ScheduledReportResponse> {
  try {
    const { data } = await apiClient.post<ScheduledReportResponse>(SCHEDULED.pause(id));
    return data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to pause scheduled report');
  }
}

/**
 * Resume a paused scheduled report
 *
 * @param id - Scheduled report ID (UUID)
 * @returns Promise<ScheduledReportResponse> - Updated scheduled report with status 'active'
 */
export async function resumeScheduledReport(
  id: string,
): Promise<ScheduledReportResponse> {
  try {
    const { data } = await apiClient.post<ScheduledReportResponse>(SCHEDULED.resume(id));
    return data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to resume scheduled report');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Scheduled Reports API namespace
 *
 * @usage
 * ```typescript
 * import { scheduledReportsApi } from '@services/api/teacher/scheduledReportsApi';
 *
 * const reports = await scheduledReportsApi.getScheduledReports();
 * const created = await scheduledReportsApi.createScheduledReport({ ... });
 * await scheduledReportsApi.pauseScheduledReport('uuid');
 * ```
 */
export const scheduledReportsApi = {
  getScheduledReports,
  createScheduledReport,
  getScheduledReportById,
  updateScheduledReport,
  deleteScheduledReport,
  pauseScheduledReport,
  resumeScheduledReport,
};

export default scheduledReportsApi;
