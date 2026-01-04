/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useUserManagement Hook
 *
 * Comprehensive hook for user management operations.
 * Handles CRUD operations, bulk actions, filtering, and pagination.
 *
 * Updated: 2025-11-19 - Integrated with adminAPI.ts (FE-059)
 */

import { useState, useCallback } from 'react';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import * as adminAPI from '@/services/api/adminAPI';
import type {
  SystemUser,
  UserManagementFilters,
  PaginationParams,
  BulkActionResult,
} from '../types';

export interface UseUserManagementResult {
  // Data
  users: SystemUser[];
  selectedUsers: string[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;

  // State
  loading: boolean;
  error: string | null;
  filters: UserManagementFilters;

  // Actions
  fetchUsers: (params?: Partial<PaginationParams>) => Promise<void>;
  selectUser: (userId: string) => void;
  deselectUser: (userId: string) => void;
  selectAllUsers: () => void;
  deselectAllUsers: () => void;
  toggleUserSelection: (userId: string) => void;

  // User operations
  suspendUser: (userId: string, reason?: string) => Promise<void>;
  unsuspendUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUser: (userId: string, data: Partial<SystemUser>) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  resetPassword: (userId: string) => Promise<void>;

  // Bulk operations
  bulkSuspend: (userIds: string[]) => Promise<BulkActionResult>;
  bulkDelete: (userIds: string[]) => Promise<BulkActionResult>;
  bulkUpdateRole: (userIds: string[], role: string) => Promise<BulkActionResult>;

  // Filtering
  setFilters: (filters: Partial<UserManagementFilters>) => void;
  clearFilters: () => void;

  // Pagination
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  pageSize: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function useUserManagement(): UseUserManagementResult {
  // State
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<UserManagementFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>(DEFAULT_PAGINATION);

  // ============================================================================
  // API CALLS
  // ============================================================================

  /**
   * Fetch users with filters and pagination
   * Updated: Now uses adminAPI.getUsers() instead of direct apiClient call
   * Fixed: Uses items/pagination structure from PaginatedResponse
   * Fixed FE-062: Removed pagination from deps to prevent infinite loop
   * Fixed: Convert User type to SystemUser type
   */
  const fetchUsers = useCallback(
    async (params?: Partial<PaginationParams>): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        // FE-062: Use DEFAULT_PAGINATION as base instead of state to prevent circular dependency
        // Convert filters to UserFilters format (handle array role/status)
        // TODO: Backend only supports a single value for role/status. For multiple values, backend needs updating
        const userFilters: any = {
          ...DEFAULT_PAGINATION,
          ...params,
          role:
            Array.isArray(filters.role) && filters.role.length > 0 ? filters.role[0] : filters.role,
          status:
            Array.isArray(filters.status) && filters.status.length > 0
              ? filters.status[0]
              : filters.status,
          organizationId: filters.organizationId,
          search: filters.search,
        };

        // Use adminAPI instead of direct apiClient call
        const response = await adminAPI.getUsers(userFilters);

        // Convert User[] to SystemUser[] by mapping fields
        const systemUsers: SystemUser[] = response.items.map((user) => {
          // CRIT-001 FIX: Extract name from metadata - backend stores in raw_user_meta_data
          // Priority order: raw_user_meta_data.full_name > metadata.full_name > user.name > email fallback
          const userRecord = user as unknown as Record<string, unknown>;
          const rawMetadata = userRecord.raw_user_meta_data as Record<string, unknown> | undefined;
          const legacyMetadata = userRecord.metadata as Record<string, unknown> | undefined;
          const metadata = rawMetadata || legacyMetadata || {};
          const fullName = (
            (metadata.full_name as string) ||
            (metadata.display_name as string) ||
            user.name ||
            user.email?.split('@')[0] ||
            'Usuario'
          );

          return {
            id: user.id,
            full_name: fullName,
            email: user.email,
            role: user.role,
            status: user.status,
            organizationId: user.organizationId,
            organizationName: user.organization,
            lastLogin: user.lastLogin || null,
            createdAt: user.joinDate,
          };
        });

        setUsers(systemUsers);
        setTotalUsers(response.pagination.totalItems);
        setPagination((prev) => ({
          ...prev,
          ...params,
          page: response.pagination.page,
        }));
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  // ============================================================================
  // SELECTION MANAGEMENT
  // ============================================================================

  const selectUser = useCallback((userId: string): void => {
    setSelectedUsers((prev) => [...new Set([...prev, userId])]);
  }, []);

  const deselectUser = useCallback((userId: string): void => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  }, []);

  const selectAllUsers = useCallback((): void => {
    setSelectedUsers(users.map((u) => u.id));
  }, [users]);

  const deselectAllUsers = useCallback((): void => {
    setSelectedUsers([]);
  }, []);

  const toggleUserSelection = useCallback((userId: string): void => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }, []);

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  /**
   * Suspend a user
   * Updated: Now uses adminAPI.suspendUser()
   */
  const suspendUser = useCallback(
    async (userId: string): Promise<void> => {
      try {
        // Optimistic update
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, status: 'inactive' as const } : user,
          ),
        );

        await adminAPI.suspendUser(userId);
      } catch (err) {
        console.error('Failed to suspend user:', err);
        // Revert on error
        await fetchUsers();
        throw err;
      }
    },
    [fetchUsers],
  );

  /**
   * Unsuspend a user
   * Updated: Now uses adminAPI.unsuspendUser()
   */
  const unsuspendUser = useCallback(
    async (userId: string): Promise<void> => {
      try {
        // Optimistic update
        setUsers((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, status: 'active' as const } : user)),
        );

        await adminAPI.unsuspendUser(userId);
      } catch (err) {
        console.error('Failed to unsuspend user:', err);
        // Revert on error
        await fetchUsers();
        throw err;
      }
    },
    [fetchUsers],
  );

  /**
   * Delete a user
   * Updated: Now uses adminAPI.deleteUser()
   */
  const deleteUser = useCallback(
    async (userId: string): Promise<void> => {
      try {
        // Optimistic update
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        setTotalUsers((prev) => prev - 1);

        await adminAPI.deleteUser(userId);
      } catch (err) {
        console.error('Failed to delete user:', err);
        // Revert on error
        await fetchUsers();
        throw err;
      }
    },
    [fetchUsers],
  );

  /**
   * Update user data (full update)
   * Updated: Now uses adminAPI.updateUser()
   */
  const updateUser = useCallback(
    async (userId: string, data: Partial<SystemUser>): Promise<void> => {
      try {
        // Optimistic update
        setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...data } : user)));

        // Transform SystemUser fields to User fields for API
        const updatePayload: any = {};
        if (data.full_name) updatePayload.name = data.full_name;
        if (data.email) updatePayload.email = data.email;
        if (data.role) updatePayload.role = data.role;
        if (data.status) updatePayload.status = data.status;
        if (data.organizationId) updatePayload.organizationId = data.organizationId;

        await adminAPI.updateUser(userId, updatePayload);
      } catch (err) {
        console.error('Failed to update user:', err);
        // Revert on error
        await fetchUsers();
        throw err;
      }
    },
    [fetchUsers],
  );

  /**
   * Update user role
   * Updated: Now uses adminAPI.updateUser()
   */
  const updateUserRole = useCallback(
    async (userId: string, role: string): Promise<void> => {
      try {
        // Validate role type
        const validRole = role as 'student' | 'admin_teacher' | 'super_admin';

        // Optimistic update
        setUsers((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, role: validRole } : user)),
        );

        await adminAPI.updateUser(userId, { role: validRole });
      } catch (err) {
        console.error('Failed to update user role:', err);
        // Revert on error
        await fetchUsers();
        throw err;
      }
    },
    [fetchUsers],
  );

  /**
   * Reset user password
   */
  const resetPassword = useCallback(async (userId: string): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.admin.users.resetPassword(userId));
    } catch (err) {
      console.error('Failed to reset password:', err);
      throw err;
    }
  }, []);

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk suspend users
   */
  const bulkSuspend = useCallback(
    async (userIds: string[]): Promise<BulkActionResult> => {
      try {
        const response = await apiClient.post<{ success: boolean; data: BulkActionResult }>(
          '/admin/users/bulk/suspend',
          { userIds },
        );

        const result = response.data.success
          ? response.data.data
          : (response.data as unknown as BulkActionResult);

        // Refresh user list
        await fetchUsers();

        return result;
      } catch (err) {
        console.error('Failed to bulk suspend users:', err);
        throw err;
      }
    },
    [fetchUsers],
  );

  /**
   * Bulk delete users
   */
  const bulkDelete = useCallback(
    async (userIds: string[]): Promise<BulkActionResult> => {
      try {
        const response = await apiClient.post<{ success: boolean; data: BulkActionResult }>(
          '/admin/users/bulk/delete',
          { userIds },
        );

        const result = response.data.success
          ? response.data.data
          : (response.data as unknown as BulkActionResult);

        // Refresh user list
        await fetchUsers();

        return result;
      } catch (err) {
        console.error('Failed to bulk delete users:', err);
        throw err;
      }
    },
    [fetchUsers],
  );

  /**
   * Bulk update user roles
   */
  const bulkUpdateRole = useCallback(
    async (userIds: string[], role: string): Promise<BulkActionResult> => {
      try {
        const response = await apiClient.post<{ success: boolean; data: BulkActionResult }>(
          '/admin/users/bulk/update-role',
          { userIds, role },
        );

        const result = response.data.success
          ? response.data.data
          : (response.data as unknown as BulkActionResult);

        // Refresh user list
        await fetchUsers();

        return result;
      } catch (err) {
        console.error('Failed to bulk update roles:', err);
        throw err;
      }
    },
    [fetchUsers],
  );

  // ============================================================================
  // FILTERING
  // ============================================================================

  const setFilters = useCallback((newFilters: Partial<UserManagementFilters>): void => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback((): void => {
    setFiltersState({});
    setPagination(DEFAULT_PAGINATION);
  }, []);

  // ============================================================================
  // PAGINATION
  // ============================================================================

  const goToPage = useCallback((page: number): void => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback((): void => {
    const totalPages = Math.ceil(totalUsers / pagination.pageSize);
    if (pagination.page < totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [totalUsers, pagination.pageSize, pagination.page]);

  const prevPage = useCallback((): void => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [pagination.page]);

  const setPageSize = useCallback((size: number): void => {
    setPagination((prev) => ({ ...prev, pageSize: size, page: 1 }));
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalPages = Math.ceil(totalUsers / pagination.pageSize);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    users,
    selectedUsers,
    totalUsers,
    currentPage: pagination.page,
    totalPages,

    // State
    loading,
    error,
    filters,

    // Actions
    fetchUsers,
    selectUser,
    deselectUser,
    selectAllUsers,
    deselectAllUsers,
    toggleUserSelection,

    // User operations
    suspendUser,
    unsuspendUser,
    deleteUser,
    updateUser,
    updateUserRole,
    resetPassword,

    // Bulk operations
    bulkSuspend,
    bulkDelete,
    bulkUpdateRole,

    // Filtering
    setFilters,
    clearFilters,

    // Pagination
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
  };
}
