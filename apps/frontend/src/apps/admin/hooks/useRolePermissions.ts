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
 * Updated: 2026-02-21 - Fix #36: Replaced __none__ antipattern with dynamic roleId param
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
// Types
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

export function useRolePermissions(roleId?: string | null): UseRolePermissionsResult {
  const queryClient = useQueryClient();

  const roleQuery = useQuery({
    queryKey: rolePermissionsKeys.detail(roleId || ''),
    queryFn: async () => {
      const backendData = await adminAPI.getRolePermissions(roleId!);
      return transformBackendResponse(backendData);
    },
    enabled: !!roleId,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ roleId: rid, permissions }: { roleId: string; permissions: Permission[] }) => {
      const backendData = await adminAPI.updateRolePermissions(rid, permissions);
      return { backendData, roleId: rid };
    },
    onSuccess: ({ backendData, roleId: rid }) => {
      const frontendData = transformBackendResponse(backendData);
      if (frontendData) {
        queryClient.setQueryData(rolePermissionsKeys.detail(rid), frontendData);
      }
    },
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const fetchRolePermissions = useCallback(
    async (rid: string): Promise<void> => {
      if (!rid) return;
      await queryClient.fetchQuery({
        queryKey: rolePermissionsKeys.detail(rid),
        queryFn: async () => {
          const backendData = await adminAPI.getRolePermissions(rid);
          return transformBackendResponse(backendData);
        },
      });
    },
    [queryClient],
  );

  const updatePermissions = useCallback(
    async (rid: string, permissions: Permission[]): Promise<void> => {
      if (!rid) {
        throw new Error('roleId es requerido para actualizar permisos');
      }

      if (!Array.isArray(permissions)) {
        throw new Error('permissions debe ser un array');
      }

      await updateMutation.mutateAsync({ roleId: rid, permissions });
    },
    [updateMutation],
  );

  const reset = useCallback((): void => {
    queryClient.removeQueries({ queryKey: rolePermissionsKeys.all });
  }, [queryClient]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    rolePermissions: roleQuery.data ?? null,

    // State
    loading: roleQuery.isLoading || updateMutation.isPending,
    error: roleQuery.error instanceof Error
      ? roleQuery.error.message
      : updateMutation.error instanceof Error
        ? updateMutation.error.message
        : null,

    // Operations
    fetchRolePermissions,
    updatePermissions,
    reset,
  };
}
