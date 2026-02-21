/**
 * useUserManagement Hook
 *
 * Comprehensive hook for user management operations.
 * Handles CRUD operations, bulk actions, filtering, and pagination.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching.
 *
 * Updated: 2025-11-19 - Integrated with adminAPI.ts (FE-059)
 * Updated: 2026-02-20 - Migrated to React Query
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import * as adminAPI from '@/services/api/adminAPI';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type {
  SystemUser,
  UserManagementFilters,
  PaginationParams,
  BulkActionResult,
} from '../types';

// ============================================================================
// Query Key Factories
// ============================================================================

const userManagementKeys = {
  all: ['admin', 'users'] as const,
  list: (filters: UserManagementFilters, pagination: PaginationParams) =>
    ['admin', 'users', 'list', { ...filters, ...pagination }] as const,
};

// ============================================================================
// Types (unchanged for backward compatibility)
// ============================================================================

export interface CreateUserParams {
  email: string;
  full_name: string;
  role: 'student' | 'admin_teacher';
  organization_id: string;
  classroom_id?: string;
  send_welcome_email?: boolean;
}

export interface CreatedUserResult {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
  organization_name: string;
  classroom_id?: string;
  classroom_name?: string;
  status: 'pending' | 'active';
  created_at: string;
  welcome_email_sent: boolean;
  temporary_password?: string;
}

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
  createUser: (data: CreateUserParams) => Promise<CreatedUserResult>;
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

// ============================================================================
// Hook
// ============================================================================

export function useUserManagement(): UseUserManagementResult {
  const queryClient = useQueryClient();

  // Client-side state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<UserManagementFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>(DEFAULT_PAGINATION);

  // ============================================================================
  // QUERY
  // ============================================================================

  const usersQuery = useQuery({
    queryKey: userManagementKeys.list(filters, pagination),
    queryFn: async () => {
      const userFilters: Record<string, unknown> = {
        ...pagination,
        role:
          Array.isArray(filters.role) && filters.role.length > 0 ? filters.role[0] : filters.role,
        status:
          Array.isArray(filters.status) && filters.status.length > 0
            ? filters.status[0]
            : filters.status,
        organizationId: filters.organizationId,
        search: filters.search,
      };

      const response = await adminAPI.getUsers(userFilters);

      // Convert User[] to SystemUser[]
      const systemUsers: SystemUser[] = response.items.map((user) => {
        const userRecord = user as unknown as Record<string, unknown>;
        const rawMetadata = userRecord.raw_user_meta_data as Record<string, unknown> | undefined;
        const legacyMetadata = userRecord.metadata as Record<string, unknown> | undefined;
        const metadata = rawMetadata || legacyMetadata || {};
        const fullName =
          (metadata.full_name as string) ||
          (metadata.display_name as string) ||
          user.name ||
          user.email?.split('@')[0] ||
          'Usuario';

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

      return {
        users: systemUsers,
        totalItems: response.pagination.totalItems,
        page: response.pagination.page,
      };
    },
    staleTime: STALE_TIMES.DYNAMIC,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const suspendMutation = useMutation({
    mutationFn: (userId: string) => adminAPI.suspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.all });
    },
  });

  const unsuspendMutation = useMutation({
    mutationFn: (userId: string) => adminAPI.unsuspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminAPI.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<SystemUser> }) => {
      const updatePayload: Record<string, unknown> = {};
      if (data.full_name) updatePayload.name = data.full_name;
      if (data.email) updatePayload.email = data.email;
      if (data.role) updatePayload.role = data.role;
      if (data.status) updatePayload.status = data.status;
      if (data.organizationId) updatePayload.organizationId = data.organizationId;
      await adminAPI.updateUser(userId, updatePayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.all });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateUserParams) => {
      const response = await apiClient.post<{ success: boolean; data: CreatedUserResult }>(
        '/admin/users',
        data,
      );
      return response.data.success ? response.data.data : (response.data as unknown as CreatedUserResult);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.all });
    },
  });

  // ============================================================================
  // DERIVED DATA
  // ============================================================================

  const users = usersQuery.data?.users ?? [];
  const totalUsers = usersQuery.data?.totalItems ?? 0;
  const totalPages = Math.ceil(totalUsers / pagination.pageSize);

  const loading =
    usersQuery.isLoading ||
    suspendMutation.isPending ||
    unsuspendMutation.isPending ||
    deleteMutation.isPending ||
    updateMutation.isPending ||
    createMutation.isPending;

  const error = usersQuery.error instanceof Error ? usersQuery.error.message : null;

  // ============================================================================
  // SELECTION MANAGEMENT (unchanged - client-side only)
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

  const fetchUsers = useCallback(
    async (params?: Partial<PaginationParams>): Promise<void> => {
      if (params) {
        setPagination((prev) => ({ ...prev, ...params }));
      }
      await usersQuery.refetch();
    },
    [usersQuery],
  );

  const suspendUser = useCallback(
    async (userId: string): Promise<void> => {
      await suspendMutation.mutateAsync(userId);
    },
    [suspendMutation],
  );

  const unsuspendUser = useCallback(
    async (userId: string): Promise<void> => {
      await unsuspendMutation.mutateAsync(userId);
    },
    [unsuspendMutation],
  );

  const deleteUser = useCallback(
    async (userId: string): Promise<void> => {
      await deleteMutation.mutateAsync(userId);
    },
    [deleteMutation],
  );

  const updateUser = useCallback(
    async (userId: string, data: Partial<SystemUser>): Promise<void> => {
      await updateMutation.mutateAsync({ userId, data });
    },
    [updateMutation],
  );

  const updateUserRole = useCallback(
    async (userId: string, role: string): Promise<void> => {
      const validRole = role as 'student' | 'admin_teacher' | 'super_admin';
      await updateMutation.mutateAsync({ userId, data: { role: validRole } as Partial<SystemUser> });
    },
    [updateMutation],
  );

  const resetPassword = useCallback(async (userId: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.admin.users.resetPassword(userId));
  }, []);

  const createUser = useCallback(
    async (data: CreateUserParams): Promise<CreatedUserResult> => {
      return createMutation.mutateAsync(data);
    },
    [createMutation],
  );

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  const bulkSuspend = useCallback(
    async (userIds: string[]): Promise<BulkActionResult> => {
      const response = await apiClient.post<{ success: boolean; data: BulkActionResult }>(
        '/admin/users/bulk/suspend',
        { userIds },
      );
      const result = response.data.success
        ? response.data.data
        : (response.data as unknown as BulkActionResult);
      await queryClient.invalidateQueries({ queryKey: userManagementKeys.all });
      return result;
    },
    [queryClient],
  );

  const bulkDelete = useCallback(
    async (userIds: string[]): Promise<BulkActionResult> => {
      const response = await apiClient.post<{ success: boolean; data: BulkActionResult }>(
        '/admin/users/bulk/delete',
        { userIds },
      );
      const result = response.data.success
        ? response.data.data
        : (response.data as unknown as BulkActionResult);
      await queryClient.invalidateQueries({ queryKey: userManagementKeys.all });
      return result;
    },
    [queryClient],
  );

  const bulkUpdateRole = useCallback(
    async (userIds: string[], role: string): Promise<BulkActionResult> => {
      const response = await apiClient.post<{ success: boolean; data: BulkActionResult }>(
        '/admin/users/bulk/update-role',
        { userIds, role },
      );
      const result = response.data.success
        ? response.data.data
        : (response.data as unknown as BulkActionResult);
      await queryClient.invalidateQueries({ queryKey: userManagementKeys.all });
      return result;
    },
    [queryClient],
  );

  // ============================================================================
  // FILTERING & PAGINATION
  // ============================================================================

  const setFilters = useCallback((newFilters: Partial<UserManagementFilters>): void => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback((): void => {
    setFiltersState({});
    setPagination(DEFAULT_PAGINATION);
  }, []);

  const goToPage = useCallback((page: number): void => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback((): void => {
    if (pagination.page < totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [totalPages, pagination.page]);

  const prevPage = useCallback((): void => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [pagination.page]);

  const setPageSize = useCallback((size: number): void => {
    setPagination((prev) => ({ ...prev, pageSize: size, page: 1 }));
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    users,
    selectedUsers,
    totalUsers,
    currentPage: pagination.page,
    totalPages,
    loading,
    error,
    filters,
    fetchUsers,
    selectUser,
    deselectUser,
    selectAllUsers,
    deselectAllUsers,
    toggleUserSelection,
    createUser,
    suspendUser,
    unsuspendUser,
    deleteUser,
    updateUser,
    updateUserRole,
    resetPassword,
    bulkSuspend,
    bulkDelete,
    bulkUpdateRole,
    setFilters,
    clearFilters,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
  };
}
