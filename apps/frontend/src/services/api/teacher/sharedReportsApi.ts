/**
 * Shared Reports API Service
 *
 * Provides methods to share reports between teachers, list shared reports,
 * mark reports as viewed, revoke access, and update permissions.
 *
 * All endpoints are prefixed with `/teacher/reports` and require
 * authentication with admin_teacher or super_admin role.
 *
 * @module services/api/teacher/sharedReportsApi
 */

import { apiClient } from '../apiClient';
import { handleAPIError } from '../apiErrorHandler';
import { API_ENDPOINTS } from '@/config/api.config';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Permission level for shared reports
 */
export type SharePermission = 'view' | 'download';

/**
 * DTO for sharing a report with another teacher
 */
export interface ShareReportDto {
  /** Report ID to share */
  reportId: string;
  /** Profile ID of the teacher to share with */
  sharedWithId: string;
  /** Permission level (default: 'view') */
  permission?: SharePermission;
  /** Optional message to include */
  message?: string;
  /** Number of days until the share expires (optional) */
  expiresInDays?: number;
}

/**
 * Response DTO for a shared report record
 *
 * Aligned with backend SharedReportResponseDto
 * @see apps/backend/src/modules/teacher/services/shared-reports.service.ts
 */
export interface SharedReportResponseDto {
  /** Share record ID (UUID) */
  id: string;
  /** Report ID */
  report_id: string;
  /** Report name */
  report_name: string;
  /** Report type (individual, classroom, progress, analytics) */
  report_type: string;
  /** Report format (pdf, excel, csv) */
  report_format: string;
  /** ID of the teacher who shared */
  shared_by_id: string;
  /** Display name of the teacher who shared (optional) */
  shared_by_name?: string;
  /** ID of the teacher the report was shared with */
  shared_with_id: string;
  /** Tenant ID */
  tenant_id: string;
  /** Permission level: 'view' or 'download' */
  permission: string;
  /** Optional message from sharer */
  message: string | null;
  /** Last access timestamp (ISO string or null) */
  accessed_at: string | null;
  /** Number of times the shared report was accessed */
  access_count: number;
  /** Expiration timestamp (ISO string or null) */
  expires_at: string | null;
  /** Whether the share has been revoked */
  is_revoked: boolean;
  /** Share creation timestamp (ISO string) */
  created_at: string;
}

/**
 * Response DTO for reports shared with the current teacher
 *
 * Extends SharedReportResponseDto with recipient-specific fields.
 * @see apps/backend/src/modules/teacher/services/shared-reports.service.ts
 */
export interface SharedWithMeResponseDto extends SharedReportResponseDto {
  /** Whether the recipient can download (based on permission + expiration) */
  can_download: boolean;
  /** Whether the share has expired */
  is_expired: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const SHARED = API_ENDPOINTS.teacher.reports.shared;

/**
 * Share a report with another teacher
 *
 * @param dto - Share report data
 * @returns The created shared report record
 *
 * @example
 * ```typescript
 * const share = await sharedReportsApi.shareReport({
 *   reportId: 'report-uuid',
 *   sharedWithId: 'teacher-uuid',
 *   permission: 'view',
 *   message: 'Check out this progress report',
 * });
 * ```
 */
export async function shareReport(dto: ShareReportDto): Promise<SharedReportResponseDto> {
  try {
    const { data } = await apiClient.post<SharedReportResponseDto>(SHARED.share, dto);
    return data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to share report');
  }
}

/**
 * Get reports shared by the current teacher
 *
 * @returns List of reports shared by me
 *
 * @example
 * ```typescript
 * const sharedByMe = await sharedReportsApi.getSharedByMe();
 * sharedByMe.forEach(share => {
 *   console.log(`${share.report_name} shared with ${share.shared_with_id}`);
 * });
 * ```
 */
export async function getSharedByMe(): Promise<SharedReportResponseDto[]> {
  try {
    const { data } = await apiClient.get<SharedReportResponseDto[]>(SHARED.byMe);
    return data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch shared-by-me reports');
  }
}

/**
 * Get reports shared with the current teacher
 *
 * @returns List of reports shared with me
 *
 * @example
 * ```typescript
 * const sharedWithMe = await sharedReportsApi.getSharedWithMe();
 * sharedWithMe.forEach(share => {
 *   console.log(`${share.report_name} from ${share.shared_by_id} — can download: ${share.can_download}`);
 * });
 * ```
 */
export async function getSharedWithMe(): Promise<SharedWithMeResponseDto[]> {
  try {
    const { data } = await apiClient.get<SharedWithMeResponseDto[]>(SHARED.withMe);
    return data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch shared-with-me reports');
  }
}

/**
 * Mark a shared report as viewed
 *
 * @param shareId - The share record ID
 * @returns Success message
 *
 * @example
 * ```typescript
 * await sharedReportsApi.markViewed('share-uuid');
 * ```
 */
export async function markViewed(shareId: string): Promise<{ message: string }> {
  try {
    const { data } = await apiClient.post<{ message: string }>(SHARED.view(shareId));
    return data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to mark shared report as viewed');
  }
}

/**
 * Revoke access to a shared report
 *
 * @param shareId - The share record ID
 * @returns Success message
 *
 * @example
 * ```typescript
 * await sharedReportsApi.revokeShare('share-uuid');
 * ```
 */
export async function revokeShare(shareId: string): Promise<{ message: string }> {
  try {
    const { data } = await apiClient.delete<{ message: string }>(SHARED.revoke(shareId));
    return data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to revoke shared report');
  }
}

/**
 * Update the permission level for a shared report
 *
 * @param shareId - The share record ID
 * @param permission - New permission level ('view' or 'download')
 * @returns The updated shared report record
 *
 * @example
 * ```typescript
 * const updated = await sharedReportsApi.updatePermission('share-uuid', 'download');
 * ```
 */
export async function updatePermission(
  shareId: string,
  permission: SharePermission,
): Promise<SharedReportResponseDto> {
  try {
    const { data } = await apiClient.put<SharedReportResponseDto>(
      SHARED.updatePermission(shareId),
      { permission },
    );
    return data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update share permission');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Shared Reports API namespace
 *
 * @usage
 * ```typescript
 * import { sharedReportsApi } from '@services/api/teacher/sharedReportsApi';
 *
 * const share = await sharedReportsApi.shareReport({ reportId, sharedWithId });
 * const byMe = await sharedReportsApi.getSharedByMe();
 * const withMe = await sharedReportsApi.getSharedWithMe();
 * await sharedReportsApi.markViewed(shareId);
 * await sharedReportsApi.revokeShare(shareId);
 * await sharedReportsApi.updatePermission(shareId, 'download');
 * ```
 */
export const sharedReportsApi = {
  shareReport,
  getSharedByMe,
  getSharedWithMe,
  markViewed,
  revokeShare,
  updatePermission,
};

export default sharedReportsApi;
