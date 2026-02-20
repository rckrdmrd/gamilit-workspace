/**
 * Admin Roles & Permissions API
 *
 * Functions for role management and permission configuration.
 * Split from adminAPI.ts monolith for modularity.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '../apiErrorHandler';
import type {
  Role,
  RolePermissions,
  Permission,
  AvailablePermission,
} from '../adminTypes';

// ============================================================================
// ROLES & PERMISSIONS
// ============================================================================

/**
 * Get list of roles
 */
export async function getRoles(): Promise<Role[]> {
  try {
    const response = await apiClient.get<Role[]>(API_ENDPOINTS.admin.roles.list);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch roles');
  }
}

/**
 * Get role with permissions
 */
export async function getRolePermissions(roleId: string): Promise<RolePermissions> {
  try {
    const response = await apiClient.get<RolePermissions>(
      API_ENDPOINTS.admin.roles.permissions(roleId),
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch permissions for role ${roleId}`);
  }
}

/**
 * Transform frontend Permission[] to backend Record<string, boolean>
 * @internal
 */
function transformPermissionsToBackend(permissions: Permission[]): Record<string, boolean> {
  const backendPerms: Record<string, boolean> = {};
  permissions.forEach((perm) => {
    const key = `can_${perm.action}_${perm.module}`;
    backendPerms[key] = perm.granted;
  });
  return backendPerms;
}

/**
 * Update role permissions
 *
 * NOTE: Backend expects permissions as Record<string, boolean>, not Permission[]
 * This function transforms frontend Permission[] to backend format before sending
 */
export async function updateRolePermissions(
  roleId: string,
  permissions: Permission[],
): Promise<RolePermissions> {
  try {
    // Transform frontend Permission[] to backend Record<string, boolean>
    const backendPermissions = transformPermissionsToBackend(permissions);

    const response = await apiClient.put<RolePermissions>(
      API_ENDPOINTS.admin.roles.updatePermissions(roleId),
      { permissions: backendPermissions },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update permissions for role ${roleId}`);
  }
}

/**
 * Get all available permissions
 */
export async function getAvailablePermissions(): Promise<AvailablePermission[]> {
  try {
    const response = await apiClient.get<AvailablePermission[]>(
      API_ENDPOINTS.admin.roles.availablePermissions,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch available permissions');
  }
}

/**
 * Roles API namespace object
 */
export const rolesApi = {
  getRoles,
  getRolePermissions,
  updateRolePermissions,
  getAvailablePermissions,
};
