/**
 * Admin Organizations API
 *
 * Functions for organization (institution) management.
 * Split from adminAPI.ts monolith for modularity.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '../apiErrorHandler';
import type {
  Organization,
  OrganizationFilters,
  OrganizationUser,
  PaginatedResponse,
} from '../adminTypes';

// ============================================================================
// ORGANIZATIONS (INSTITUTIONS)
// ============================================================================

/**
 * Get list of organizations with filters
 *
 * Status: Backend IMPLEMENTED
 */
export async function getOrganizations(
  filters?: OrganizationFilters,
): Promise<PaginatedResponse<Organization>> {
  try {
    const response = await apiClient.get<PaginatedResponse<Organization>>(
      API_ENDPOINTS.admin.organizations.list,
      { params: filters },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch organizations');
  }
}

/**
 * Get organization details
 *
 * Status: Backend IMPLEMENTED
 */
export async function getOrganization(id: string): Promise<Organization> {
  try {
    const response = await apiClient.get<Organization>(API_ENDPOINTS.admin.organizations.get(id));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch organization ${id}`);
  }
}

/**
 * Create new organization
 *
 * Status: Backend IMPLEMENTED
 */
export async function createOrganization(data: Partial<Organization>): Promise<Organization> {
  try {
    const response = await apiClient.post<Organization>(
      API_ENDPOINTS.admin.organizations.create,
      data,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to create organization');
  }
}

/**
 * Update organization
 *
 * Status: Backend IMPLEMENTED
 */
export async function updateOrganization(
  id: string,
  updates: Partial<Organization>,
): Promise<Organization> {
  try {
    const response = await apiClient.put<Organization>(
      API_ENDPOINTS.admin.organizations.update(id),
      updates,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update organization ${id}`);
  }
}

/**
 * Delete organization
 *
 * Status: Backend IMPLEMENTED
 */
export async function deleteOrganization(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.admin.organizations.delete(id));
  } catch (error) {
    throw handleAPIError(error, `Failed to delete organization ${id}`);
  }
}

/**
 * Get organization users
 *
 * Status: Backend IMPLEMENTED
 */
export async function getOrganizationUsers(
  id: string,
  page = 1,
): Promise<PaginatedResponse<OrganizationUser>> {
  try {
    const response = await apiClient.get<PaginatedResponse<OrganizationUser>>(
      API_ENDPOINTS.admin.organizations.users(id),
      { params: { page } },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch users for organization ${id}`);
  }
}

/**
 * Update organization subscription
 *
 * Status: Backend IMPLEMENTED
 */
export async function updateOrganizationSubscription(
  id: string,
  subscription: Record<string, unknown>,
): Promise<Organization> {
  try {
    const response = await apiClient.patch<Organization>(
      API_ENDPOINTS.admin.organizations.updateSubscription(id),
      subscription,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update subscription for organization ${id}`);
  }
}

/**
 * Update organization features
 *
 * Status: Backend IMPLEMENTED
 */
export async function updateOrganizationFeatures(
  id: string,
  features: string[],
): Promise<Organization> {
  try {
    const response = await apiClient.patch<Organization>(
      API_ENDPOINTS.admin.organizations.updateFeatures(id),
      { features },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update features for organization ${id}`);
  }
}

/**
 * Get organization statistics
 * Returns detailed stats including member counts, storage, and activity
 *
 * Status: Backend IMPLEMENTED (admin-organizations.controller.ts:99)
 * Added: 2025-12-15 (MEDIO-001 fix)
 */
export interface OrganizationStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  averageProgress: number;
  storageUsed: string;
  lastActivity: string;
  trialEndsAt?: string;
}

export async function getOrganizationStats(id: string): Promise<OrganizationStats> {
  try {
    const response = await apiClient.get<OrganizationStats>(
      API_ENDPOINTS.admin.organizations.stats(id),
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch stats for organization ${id}`);
  }
}

/**
 * Organizations API namespace object
 */
export const organizationsApi = {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationUsers,
  updateOrganizationSubscription,
  updateOrganizationFeatures,
  getOrganizationStats,
};
