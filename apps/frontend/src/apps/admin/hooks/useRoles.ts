/**
 * useRoles Hook
 *
 * Comprehensive hook for managing roles and permissions in the admin portal.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching.
 *
 * Created: 2025-11-24 - AdminRolesPage Backend Integration
 * Updated: 2026-02-20 - Migrated to React Query
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminAPI from '@/services/api/adminAPI';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type { Role, AvailablePermission } from '@/services/api/adminTypes';

// ============================================================================
// Query Key Factories
// ============================================================================

const rolesKeys = {
  all: ['admin', 'roles'] as const,
  list: () => ['admin', 'roles', 'list'] as const,
  availablePermissions: () => ['admin', 'roles', 'available-permissions'] as const,
};

// ============================================================================
// Types (unchanged for backward compatibility)
// ============================================================================

export interface UseRolesResult {
  // Data
  roles: Role[];
  availablePermissions: AvailablePermission[];
  total: number;

  // State
  loading: boolean;
  error: string | null;

  // Operations
  fetchRoles: () => Promise<void>;
  fetchAvailablePermissions: () => Promise<void>;
  refetch: () => Promise<void>;
}

// ============================================================================
// Helpers
// ============================================================================

function transformRole(backendRole: Record<string, unknown>): Role {
  const systemRoles = ['super_admin', 'admin_teacher', 'student'];
  const roleName = (backendRole.name as string) || (backendRole.roleName as string) || '';

  return {
    roleId: (backendRole.id as string) || (backendRole.roleId as string) || '',
    roleName,
    description: (backendRole.description as string) || '',
    userCount: (backendRole.users_count as number) ?? (backendRole.userCount as number) ?? 0,
    isSystem:
      (backendRole.is_system as boolean) ??
      (backendRole.isSystem as boolean) ??
      systemRoles.includes(roleName),
    createdAt: (backendRole.created_at as string) || (backendRole.createdAt as string),
    updatedAt: (backendRole.updated_at as string) || (backendRole.updatedAt as string),
  };
}

// ============================================================================
// Hook
// ============================================================================

export function useRoles(): UseRolesResult {
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERIES
  // ============================================================================

  const rolesQuery = useQuery({
    queryKey: rolesKeys.list(),
    queryFn: async () => {
      const rolesData = await adminAPI.getRoles();

      if (!rolesData) {
        console.error('[useRoles] No data received from server');
        return [] as Role[];
      }

      if (!Array.isArray(rolesData)) {
        console.error('[useRoles] Invalid roles response structure:', rolesData);
        return [] as Role[];
      }

      const transformedRoles = rolesData.map((role) =>
        transformRole(role as unknown as Record<string, unknown>),
      );

      return transformedRoles;
    },
    staleTime: STALE_TIMES.SEMI_STATIC,
  });

  const permissionsQuery = useQuery({
    queryKey: rolesKeys.availablePermissions(),
    queryFn: async () => {
      const permissionsData = await adminAPI.getAvailablePermissions();

      if (!Array.isArray(permissionsData)) {
        console.error('[useRoles] Invalid permissions response structure:', permissionsData);
        return [] as AvailablePermission[];
      }

      return permissionsData;
    },
    staleTime: STALE_TIMES.SEMI_STATIC,
  });

  // ============================================================================
  // COMBINED STATE
  // ============================================================================

  const roles = rolesQuery.data ?? [];
  const availablePermissions = permissionsQuery.data ?? [];
  const loading = rolesQuery.isLoading || permissionsQuery.isLoading;

  const firstError = rolesQuery.error ?? permissionsQuery.error;
  const error = firstError instanceof Error ? firstError.message : firstError ? String(firstError) : null;

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const fetchRoles = useCallback(async (): Promise<void> => {
    await rolesQuery.refetch();
  }, [rolesQuery]);

  const fetchAvailablePermissions = useCallback(async (): Promise<void> => {
    await permissionsQuery.refetch();
  }, [permissionsQuery]);

  const refetch = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: rolesKeys.all });
  }, [queryClient]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    roles,
    availablePermissions,
    total: roles.length,
    loading,
    error,
    fetchRoles,
    fetchAvailablePermissions,
    refetch,
  };
}
