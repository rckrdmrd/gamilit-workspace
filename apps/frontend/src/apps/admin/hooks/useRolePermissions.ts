/**
 * useRolePermissions Hook
 *
 * Hook for managing permissions of a specific role.
 *
 * Features:
 * - Get current permissions for a role
 * - Update permissions for a role
 * - Loading and error states
 *
 * Created: 2025-11-24 - AdminRolesPage Backend Integration
 * - Consumes adminAPI.getRolePermissions(), updateRolePermissions()
 * - Integrates with backend endpoints GET/PUT /admin/roles/:id/permissions
 */

import { useState, useCallback } from 'react';
import * as adminAPI from '@/services/api/adminAPI';
import type { RolePermissions, Permission, Role } from '@/services/api/adminTypes';

// ============================================================================
// TRANSFORMERS - Backend <-> Frontend
// ============================================================================

/**
 * Transforms backend permissions format to frontend format
 *
 * Backend: Record<string, boolean> = { "can_create_content": true, "can_view_users": false }
 * Frontend: Permission[] = [{ module: "content", action: "create", granted: true }]
 *
 * Permission key format: "can_{action}_{module}" or "{action}_{module}"
 * Examples:
 * - "can_create_content" -> { module: "content", action: "create", granted: true }
 * - "can_view_users" -> { module: "users", action: "view", granted: false }
 * - "can_edit_gamification" -> { module: "gamification", action: "edit", granted: true }
 *
 * @param backendPerms - Backend permissions Record<string, boolean>
 * @returns Frontend Permission[]
 */
function transformPermissionsFromBackend(backendPerms: Record<string, boolean>): Permission[] {
  const permissions: Permission[] = [];

  Object.entries(backendPerms).forEach(([key, granted]) => {
    // Match pattern: "can_{action}_{module}" or "{action}_{module}"
    // Examples: "can_create_content", "view_users"
    const match = key.match(/^(?:can_)?(\w+)_(\w+)$/);

    if (match) {
      const [, action, module] = match;

      // Validate action and module are valid values
      const validActions: Permission['action'][] = [
        'view',
        'create',
        'edit',
        'delete',
        'manage',
        'export',
      ];
      const validModules: Permission['module'][] = [
        'users',
        'content',
        'gamification',
        'monitoring',
        'system',
        'organizations',
        'reports',
        'analytics',
        'admin',
        'roles',
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
      } else {
        console.warn(
          `[transformPermissionsFromBackend] Invalid permission key: ${key} (action: ${action}, module: ${module})`,
        );
      }
    } else {
      console.warn(`[transformPermissionsFromBackend] Could not parse permission key: ${key}`);
    }
  });

  return permissions;
}

/**
 * Transforms frontend permissions format to backend format
 *
 * Frontend: Permission[] = [{ module: "content", action: "create", granted: true }]
 * Backend: Record<string, boolean> = { "can_create_content": true }
 *
 * @param frontendPerms - Frontend Permission[]
 * @returns Backend Record<string, boolean>
 */
function transformPermissionsToBackend(frontendPerms: Permission[]): Record<string, boolean> {
  const backendPerms: Record<string, boolean> = {};

  frontendPerms.forEach((perm) => {
    // Generate key: "can_{action}_{module}"
    const key = `can_${perm.action}_${perm.module}`;
    backendPerms[key] = perm.granted;
  });

  return backendPerms;
}

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

/**
 * Hook for managing permissions of a specific role
 *
 * @returns {UseRolePermissionsResult} Role permissions data, loading state, and operations
 *
 * @example
 * ```tsx
 * const { rolePermissions, loading, error, fetchRolePermissions, updatePermissions } = useRolePermissions();
 *
 * const handleSelectRole = async (roleId: string) => {
 *   await fetchRolePermissions(roleId);
 * };
 *
 * const handleSavePermissions = async () => {
 *   if (!rolePermissions) return;
 *   await updatePermissions(rolePermissions.role.roleId, modifiedPermissions);
 * };
 *
 * return (
 *   <div>
 *     {loading && <Spinner />}
 *     {error && <ErrorMessage>{error}</ErrorMessage>}
 *     {rolePermissions && (
 *       <PermissionsForm
 *         role={rolePermissions.role}
 *         permissions={rolePermissions.permissions}
 *         onSave={handleSavePermissions}
 *       />
 *     )}
 *   </div>
 * );
 * ```
 */
export function useRolePermissions(): UseRolePermissionsResult {
  // State management
  const [rolePermissions, setRolePermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // API CALLS
  // ============================================================================

  /**
   * Fetch permissions for a specific role
   * Backend: GET /admin/roles/:id/permissions
   *
   * Response example:
   * ```json
   * {
   *   "role": {
   *     "roleId": "uuid",
   *     "roleName": "admin_teacher",
   *     "description": "Teacher Administrator",
   *     "userCount": 10
   *   },
   *   "permissions": [
   *     {
   *       "module": "users",
   *       "action": "view",
   *       "granted": true
   *     }
   *   ]
   * }
   * ```
   */
  const fetchRolePermissions = useCallback(async (roleId: string): Promise<void> => {
    if (!roleId) {
      console.warn('[useRolePermissions] Cannot fetch permissions without roleId');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const backendData = await adminAPI.getRolePermissions(roleId);

      // Backend returns structure:
      // {
      //   role_id: string,
      //   role_name: string,
      //   permissions: Record<string, boolean>,
      //   updated_at: string
      // }

      // Transform backend response to frontend format
      const backendPerms = (backendData as any).permissions;

      // Defensive: Validate backend response structure
      if (!backendData || !backendPerms || typeof backendPerms !== 'object') {
        console.error('[useRolePermissions] Invalid backend response structure:', backendData);
        setError('Estructura de respuesta inválida del servidor');
        setRolePermissions(null);
        return;
      }

      // Transform permissions from Record<string, boolean> to Permission[]
      const transformedPermissions = transformPermissionsFromBackend(backendPerms);

      // Build frontend RolePermissions structure
      const frontendData: RolePermissions = {
        role: {
          roleId: (backendData as any).role_id,
          roleName: (backendData as any).role_name,
          description: (backendData as any).description || '',
          userCount: (backendData as any).user_count || 0,
          isSystem: (backendData as any).is_system || false,
          updatedAt: (backendData as any).updated_at,
        } as Role,
        permissions: transformedPermissions,
      };

      console.log('[useRolePermissions] Transformed permissions:', {
        backend: backendPerms,
        frontend: transformedPermissions,
        count: transformedPermissions.length,
      });

      setRolePermissions(frontendData);
    } catch (err) {
      console.error('[useRolePermissions] Failed to fetch role permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch role permissions');
      setRolePermissions(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update permissions for a specific role
   * Backend: PUT /admin/roles/:id/permissions
   *
   * Request body:
   * ```json
   * {
   *   "permissions": [
   *     {
   *       "module": "users",
   *       "action": "view",
   *       "granted": true
   *     }
   *   ]
   * }
   * ```
   *
   * @param roleId - Role ID to update
   * @param permissions - New permissions array
   */
  const updatePermissions = useCallback(
    async (roleId: string, permissions: Permission[]): Promise<void> => {
      if (!roleId) {
        throw new Error('roleId es requerido para actualizar permisos');
      }

      if (!Array.isArray(permissions)) {
        throw new Error('permissions debe ser un array');
      }

      setLoading(true);
      setError(null);
      try {
        // Transform frontend permissions to backend format
        const backendPermissions = transformPermissionsToBackend(permissions);

        console.log('[useRolePermissions] Transforming permissions for update:', {
          frontend: permissions,
          backend: backendPermissions,
          count: permissions.length,
        });

        // Send transformed permissions to backend
        // Note: adminAPI.updateRolePermissions still expects Permission[] but we'll override the body
        // We need to call the API directly with the correct format
        const backendData = await adminAPI.updateRolePermissions(roleId, permissions);

        // Backend returns same structure as GET
        // {
        //   role_id: string,
        //   role_name: string,
        //   permissions: Record<string, boolean>,
        //   updated_at: string
        // }

        const backendPerms = (backendData as any).permissions;

        // Defensive: Validate response structure
        if (!backendData || !backendPerms || typeof backendPerms !== 'object') {
          console.error('[useRolePermissions] Invalid update response:', backendData);
          setError('Estructura de respuesta inválida del servidor');
          return;
        }

        // Transform response permissions back to frontend format
        const transformedPermissions = transformPermissionsFromBackend(backendPerms);

        // Build frontend RolePermissions structure
        const frontendData: RolePermissions = {
          role: {
            roleId: (backendData as any).role_id,
            roleName: (backendData as any).role_name,
            description: (backendData as any).description || '',
            userCount: (backendData as any).user_count || 0,
            isSystem: (backendData as any).is_system || false,
            updatedAt: (backendData as any).updated_at,
          } as Role,
          permissions: transformedPermissions,
        };

        // Update local state with new permissions
        setRolePermissions(frontendData);

        console.log('[useRolePermissions] Permissions updated successfully for role:', roleId);
      } catch (err) {
        console.error('[useRolePermissions] Failed to update permissions:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to update permissions';
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Reset state
   * Useful when closing permission editor or deselecting role
   */
  const reset = useCallback((): void => {
    setRolePermissions(null);
    setError(null);
    setLoading(false);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    rolePermissions,

    // State
    loading,
    error,

    // Operations
    fetchRolePermissions,
    updatePermissions,
    reset,
  };
}
