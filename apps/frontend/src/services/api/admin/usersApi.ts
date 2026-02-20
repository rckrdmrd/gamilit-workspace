/**
 * Admin Users API
 *
 * Functions for user management (CRUD, activation, suspension).
 * Split from adminAPI.ts monolith for modularity.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '../apiErrorHandler';
import type {
  User,
  UserFilters,
  UserDetails,
  PaginatedResponse,
} from '../adminTypes';

// ============================================================================
// USERS - Helper Functions
// ============================================================================

/**
 * Safely converts a date value to ISO string
 * Handles Date objects, strings, null, and undefined
 */
function safeToISOString(value: unknown): string | undefined {
  if (!value) return undefined;

  // If already a string, validate it's a proper date
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : value;
  }

  // If Date object, convert to ISO string
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  return undefined;
}

/**
 * Transforms backend user (snake_case) to frontend User type (camelCase)
 * CORR-003: Map last_sign_in_at -> lastLogin and other snake_case fields
 */
function normalizeUserRole(role: unknown): User['role'] {
  if (role === 'student' || role === 'admin_teacher' || role === 'super_admin') {
    return role;
  }
  if (role === 'teacher') {
    return 'admin_teacher';
  }
  return 'student';
}

function normalizeUserStatus(status: unknown): User['status'] {
  if (
    status === 'active' ||
    status === 'inactive' ||
    status === 'suspended' ||
    status === 'banned' ||
    status === 'pending'
  ) {
    return status;
  }
  return 'active';
}

function transformUser(backendUser: Record<string, unknown>): User {
  // Get last login from either last_sign_in_at (snake_case) or lastLogin (camelCase)
  const rawLastLogin = backendUser.last_sign_in_at ?? backendUser.lastLogin;

  const user: User = {
    id: backendUser.id as string,
    name:
      (backendUser.full_name as string) || (backendUser.display_name as string) || (backendUser.name as string) || (backendUser.email as string),
    email: backendUser.email as string,
    role: normalizeUserRole(backendUser.role),
    status: normalizeUserStatus(backendUser.status),
    organization: (backendUser.organization_name as string) || (backendUser.organization as string),
    organizationId: (backendUser.organization_id as string) || (backendUser.organizationId as string),
    joinDate: (backendUser.created_at as string) || (backendUser.join_date as string) || (backendUser.joinDate as string),
    // CORR-003: Map last_sign_in_at -> lastLogin with safe conversion
    lastLogin: safeToISOString(rawLastLogin),
  };

  if (backendUser.metadata) {
    user.metadata = backendUser.metadata as User['metadata'];
  }

  return user;
}

// ============================================================================
// USERS
// ============================================================================

/**
 * Get list of users with filters
 *
 * Status: Backend IMPLEMENTED
 * CORR-003: Added proper field transformation (last_sign_in_at -> lastLogin)
 */
export async function getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
  try {
    // FE-062: Transform pagination params to match backend ListUsersDto
    // Backend expects 'limit' not 'pageSize', and doesn't support sortBy/sortOrder yet
    let transformedFilters: Record<string, unknown> | undefined = undefined;
    if (filters) {
      const { pageSize, sortBy: _sortBy, sortOrder: _sortOrder, ...rest } = filters as UserFilters & { pageSize?: number; sortBy?: string; sortOrder?: string };
      transformedFilters = {
        ...rest,
        ...(pageSize && { limit: pageSize }), // Map pageSize -> limit
      };
    }

    // Backend returns different structure than expected
    // Need to check what actually comes back
    const response = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.admin.users.list, {
      params: transformedFilters,
    });

    const backendData = response.data;

    // FE-062: Handle different response structures from backend
    // Backend may return either a direct array or an object with data property
    let transformed: PaginatedResponse<User>;

    if (Array.isArray(backendData)) {
      // Backend returns array directly (no pagination info)
      // CORR-003: Apply transformUser to each user
      transformed = {
        items: backendData.map(transformUser),
        pagination: {
          page: 1,
          totalPages: 1,
          totalItems: backendData.length,
          limit: backendData.length,
        },
      };
    } else if (backendData && typeof backendData === 'object') {
      const record = backendData as Record<string, unknown>;
      // Backend returns object with data property
      // CORR-003: Apply transformUser to each user
      transformed = {
        items: (Array.isArray(record.data) ? record.data : []).map(
          (user) => transformUser(user as Record<string, unknown>),
        ),
        pagination: {
          page: typeof record.page === 'number' ? record.page : 1,
          totalPages: typeof record.total_pages === 'number' ? record.total_pages : 0,
          totalItems: typeof record.total === 'number' ? record.total : 0,
          limit: typeof record.limit === 'number' ? record.limit : 20,
        },
      };
    } else {
      // Fallback for unexpected response structure
      transformed = {
        items: [],
        pagination: { page: 1, totalPages: 0, totalItems: 0, limit: 20 },
      };
    }

    return transformed;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch users');
  }
}

/**
 * Get user details
 *
 * Status: Backend IMPLEMENTED
 */
export async function getUser(id: string): Promise<UserDetails> {
  try {
    const response = await apiClient.get<UserDetails>(API_ENDPOINTS.admin.users.get(id));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch user ${id}`);
  }
}

/**
 * Update user
 *
 * Status: Backend IMPLEMENTED
 */
export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  try {
    const response = await apiClient.put<User>(API_ENDPOINTS.admin.users.update(id), updates);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update user ${id}`);
  }
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.admin.users.delete(id));
  } catch (error) {
    throw handleAPIError(error, `Failed to delete user ${id}`);
  }
}

/**
 * Activate user
 */
export async function activateUser(id: string): Promise<User> {
  try {
    const response = await apiClient.post<User>(API_ENDPOINTS.admin.users.activate(id));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to activate user ${id}`);
  }
}

/**
 * Deactivate user
 */
export async function deactivateUser(id: string): Promise<User> {
  try {
    const response = await apiClient.post<User>(API_ENDPOINTS.admin.users.deactivate(id));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to deactivate user ${id}`);
  }
}

/**
 * Suspend user
 */
export async function suspendUser(id: string): Promise<User> {
  try {
    const response = await apiClient.post<User>(API_ENDPOINTS.admin.users.suspend(id));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to suspend user ${id}`);
  }
}

/**
 * Unsuspend user
 */
export async function unsuspendUser(id: string): Promise<User> {
  try {
    const response = await apiClient.post<User>(API_ENDPOINTS.admin.users.unsuspend(id));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to unsuspend user ${id}`);
  }
}

/**
 * Users API namespace object
 */
export const usersApi = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  suspendUser,
  unsuspendUser,
};
