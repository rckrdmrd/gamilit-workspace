/**
 * useRolePermissions Hook
 *
 * Hook for managing permissions of a specific role.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching.
 *
 * Created: 2025-11-24 - AdminRolesPage Backend Integration
 * Updated: 2026-02-20 - Migrated to React Query
 */
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminAPI from '@/services/api/adminAPI';
import type { RolePermissions, Permission, Role } from '@/services/api/adminTypes';

// ============================================================================
// TRANSFORMERS - Backend <-> Frontend
// ============================================================================

function transformPermissionsFromBackend(backendPerms: Record<string, boolean>): Permission[] {
  const permissions: Permission[] = [];

  Object.entries(backendPerms).forEach(([key, granted]) => {
    const match = key.match(/^(?:can_)?(\w+)_(\w+)$/);

    if (match) {
      const [, action, module] = match;

      const validActions: Permission['action'][] = [
        'view', 'create', 'edit', 'delete', 'manage', 'export',
      ];
      const validModules: Permission['module'][] = [
        'users', 'content', 'gamification', 'monitoring', 'system',
        'organizations', 'reports', 'analytics', 'admin', 'roles',
      ];

      if (
        validActions.includes(action as Permission['action']) &&
        validModules.includes(module as Permission['module'])
      ) {
        permissions.push({
          module: module as Permission['module'],
          action: action as Permission['action'],
          granted,
        });
      }
    }
  });

  return permissions;
}

interface BackendRolePermissionsResponse {
  role_id?: string;
  role_name?: string;
  description?: string;
  user_count?: number;
  is_system?: boolean;
  updated_at?: string;
  permissions?: Record<string, boolean>;
}

function transformBackendResponse(backendData: unknown): RolePermissions | null {
  const data = backendData as BackendRolePermissionsResponse | null | undefined;
  const backendPerms = data?.permissions;

  if (!data || !backendPerms || typeof backendPerms !== 'object') {
    return null;
  }

  const transformedPermissions = transformPermissionsFromBackend(backendPerms);

  return {
    role: {
      roleId: data.role_id,
      roleName: data.role_name,
      description: data.description || '',
      userCount: data.user_count || 0,
      isSystem: data.is_system || false,
      updatedAt: data.updated_at,
    } as Role,
    permissions: transformedPermissions,
  };
}

// ============================================================================
// Query Key Factories
// ============================================================================

const rolePermissionsKeys = {
  all: ['admin', 'role-permissions'] as const,
  detail: (roleId: string) => ['admin', 'role-permissions', roleId] as const,
};

// ============================================================================
// Types (unchanged for backward compatibility)
// ============================================================================

export interface UseRolePermissionsResult {
  // Data
  rolePermissions: RolePermissions | null;

  // State
  loading: boolean;
  error: string | null;

  // Operations
  fetchRolePermissions: (roleId: string) => Promise<void>;
  updatePermissions: (roleId: string, permissions: Permission[]) => Promise<void>;
  reset: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useRolePermissions(): UseRolePermissionsResult {
  const queryClient = useQueryClient();

  // We need to track the current roleId for the query
  // Using a manual approach since roleId is dynamic (set by fetchRolePermissions)
  const activeRoleQuery = useQuery({
    queryKey: rolePermissionsKeys.detail('__none__'),
    queryFn: async () => null as RolePermissions | null,
    enabled: false, // disabled by default
  });

  const updateMutation = useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: Permission[] }) => {
      const backendData = await adminAPI.updateRolePermissions(roleId, permissions);
      return { backendData, roleId };
    },
    onSuccess: ({ backendData, roleId }) => {
      const frontendData = transformBackendResponse(backendData);
      if (frontendData) {
        queryClient.setQueryData(rolePermissionsKeys.detail(roleId), frontendData);
      }
    },
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const fetchRolePermissions = useCallback(
    async (roleId: string): Promise<void> => {
      if (!roleId) {
        return;
      }

      const backendData = await adminAPI.getRolePermissions(roleId);
      const frontendData = transformBackendResponse(backendData);

      if (frontendData) {
        queryClient.setQueryData(rolePermissionsKeys.detail(roleId), frontendData);
      }
    },
    [queryClient],
  );

  const updatePermissions = useCallback(
    async (roleId: string, permissions: Permission[]): Promise<void> => {
      if (!roleId) {
        throw new Error('roleId es requerido para actualizar permisos');
      }

      if (!Array.isArray(permissions)) {
        throw new Error('permissions debe ser un array');
      }

      await updateMutation.mutateAsync({ roleId, permissions });
    },
    [updateMutation],
  );

  const reset = useCallback((): void => {
    queryClient.removeQueries({ queryKey: rolePermissionsKeys.all });
  }, [queryClient]);

  // Get the most recent role permissions from cache
  // We look for any cached data under rolePermissionsKeys
  const cachedKeys = queryClient.getQueriesData<RolePermissions>({
    queryKey: rolePermissionsKeys.all,
  });
  const latestPermissions = cachedKeys.length > 0 ? cachedKeys[cachedKeys.length - 1][1] : null;

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    rolePermissions: latestPermissions ?? null,

    // State
    loading: activeRoleQuery.isLoading || updateMutation.isPending,
    error: updateMutation.error instanceof Error ? updateMutation.error.message : null,

    // Operations
    fetchRolePermissions,
    updatePermissions,
    reset,
  };
}
