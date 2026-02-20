/**
 * Admin Content & Approvals API
 *
 * Functions for content moderation, media library, and approval history.
 * Split from adminAPI.ts monolith for modularity.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '../apiErrorHandler';
import type {
  PendingContent,
  ContentFilters,
  MediaFile,
  ApprovalHistory,
  PaginatedResponse,
} from '../adminTypes';

// ============================================================================
// CONTENT & APPROVALS
// ============================================================================

/**
 * Get pending content for moderation
 *
 * Status: Backend IMPLEMENTED
 *
 * NOTE: Backend returns { data, total, page, limit, total_pages }
 * but frontend expects { items, pagination: { page, totalPages, totalItems, limit } }
 * This function transforms the response to match frontend expectations.
 *
 * @see TAREA-3: Fix totalItems undefined error (2026-01-07)
 */
export async function getPendingContent(
  filters?: ContentFilters,
): Promise<PaginatedResponse<PendingContent>> {
  try {
    // Backend response structure
    const response = await apiClient.get<Record<string, unknown>>(
      API_ENDPOINTS.admin.content.pending,
      { params: filters },
    );

    const backendData = response.data;

    // Transform backend response to frontend PaginatedResponse format
    // Backend: { data: T[], total, page, limit, total_pages }
    // Frontend: { items: T[], pagination: { page, totalPages, totalItems, limit } }
    if (backendData && typeof backendData === 'object') {
      const record = backendData as Record<string, unknown>;

      if (record.items && record.pagination) {
        return backendData as unknown as PaginatedResponse<PendingContent>;
      }

      if (record.data !== undefined || Array.isArray(backendData)) {
        const itemsSource = record.data ?? (Array.isArray(backendData) ? backendData : []);
        const items = Array.isArray(itemsSource) ? itemsSource : [];
        const page = typeof record.page === 'number' ? record.page : 1;
        const total = typeof record.total === 'number' ? record.total : items.length;
        const limit = typeof record.limit === 'number' ? record.limit : 20;
        const totalPages =
          typeof record.total_pages === 'number'
            ? record.total_pages
            : limit > 0
              ? Math.ceil(total / limit)
              : 0;

        return {
          items,
          pagination: {
            page,
            totalPages,
            totalItems: total,
            limit,
          },
        };
      }
    }

    // Fallback for unexpected response structure
    return {
      items: [],
      pagination: { page: 1, totalPages: 0, totalItems: 0, limit: 20 },
    };
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch pending content');
  }
}

/**
 * Approve content
 *
 * Status: Backend IMPLEMENTED
 */
export async function approveContent(id: string): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.admin.content.approve(id));
  } catch (error) {
    throw handleAPIError(error, `Failed to approve content ${id}`);
  }
}

/**
 * Reject content
 *
 * Status: Backend IMPLEMENTED
 */
export async function rejectContent(id: string, reason?: string): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.admin.content.reject(id), { reason });
  } catch (error) {
    throw handleAPIError(error, `Failed to reject content ${id}`);
  }
}

/**
 * Get media library
 *
 * Status: Backend IMPLEMENTED
 */
export async function getMediaLibrary(filters?: Record<string, unknown>): Promise<PaginatedResponse<MediaFile>> {
  try {
    const response = await apiClient.get<PaginatedResponse<MediaFile>>(
      API_ENDPOINTS.admin.content.mediaLibrary,
      { params: filters },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch media library');
  }
}

/**
 * Delete media file
 *
 * Status: Backend IMPLEMENTED
 */
export async function deleteMediaFile(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.admin.content.deleteMedia(id));
  } catch (error) {
    throw handleAPIError(error, `Failed to delete media ${id}`);
  }
}

/**
 * Get approval history
 */
export async function getApprovalHistory(page = 1): Promise<PaginatedResponse<ApprovalHistory>> {
  try {
    const response = await apiClient.get<PaginatedResponse<ApprovalHistory>>(
      API_ENDPOINTS.admin.content.history,
      { params: { page } },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch approval history');
  }
}

/**
 * Content API namespace object
 */
export const contentApi = {
  getPendingContent,
  approveContent,
  rejectContent,
  getMediaLibrary,
  deleteMediaFile,
  getApprovalHistory,
};
