/**
 * useRoles Hook
 *
 * Comprehensive hook for managing roles and permissions in the admin portal.
 *
 * Features:
 * - List all roles with user counts
 * - Get available permissions (system-wide)
 * - Get permissions for specific role
 * - Update role permissions
 * - Error handling and loading states
 *
 * Created: 2025-11-24 - AdminRolesPage Backend Integration
 * - Consumes adminAPI.getRoles(), getAvailablePermissions()
 * - Integrates with backend endpoints GET /admin/roles, GET /admin/roles/permissions
 */

import { useState, useEffect, useCallback } from 'react';
import * as adminAPI from '@/services/api/adminAPI';
import type { Role, AvailablePermission } from '@/services/api/adminTypes';

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

/**
 * Hook for managing roles in the admin portal
 *
 * @returns {UseRolesResult} Roles data, loading state, and operations
 *
 * @example
 * ```tsx
 * const { roles, loading, error, refetch } = useRoles();
 *
 * useEffect(() => {
 *   // Data is fetched automatically on mount
 * }, []);
 *
 * return (
 *   <div>
 *     {loading && <Spinner />}
 *     {error && <ErrorMessage>{error}</ErrorMessage>}
 *     {roles.map(role => <RoleCard key={role.roleId} role={role} />)}
 *   </div>
 * );
 * ```
 */
export function useRoles(): UseRolesResult {
  // State management
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // TRANSFORMATION HELPERS
  // ============================================================================

  /**
   * Transform backend role format to frontend Role type
   * Backend returns: id, name, users_count, created_at, updated_at
   * Frontend expects: roleId, roleName, userCount, createdAt, updatedAt
   */
  const transformRole = useCallback((backendRole: any): Role => {
    // System roles that cannot be deleted
    const systemRoles = ['super_admin', 'admin_teacher', 'student'];

    return {
      roleId: backendRole.id || backendRole.roleId,
      roleName: backendRole.name || backendRole.roleName,
      description: backendRole.description || '',
      userCount: backendRole.users_count ?? backendRole.userCount ?? 0,
      isSystem:
        backendRole.is_system ??
        backendRole.isSystem ??
        systemRoles.includes(backendRole.name || backendRole.roleName),
      createdAt: backendRole.created_at || backendRole.createdAt,
      updatedAt: backendRole.updated_at || backendRole.updatedAt,
    };
  }, []);

  // ============================================================================
  // API CALLS - READ OPERATIONS
  // ============================================================================

  /**
   * Fetch all roles with their user counts
   * Backend: GET /admin/roles
   *
   * Backend Response:
   * ```json
   * [{
   *   "id": "uuid",
   *   "name": "super_admin",
   *   "description": "Super Administrator",
   *   "users_count": 2,
   *   "is_active": true,
   *   "created_at": "2025-11-26T00:00:00Z",
   *   "updated_at": "2025-11-26T00:00:00Z"
   * }]
   * ```
   */
  const fetchRoles = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const rolesData = await adminAPI.getRoles();

      // Defensive: Validate response exists
      if (!rolesData) {
        console.error('[useRoles] No data received from server');
        setError('No se recibieron datos del servidor');
        setRoles([]);
        setTotal(0);
        return;
      }

      // Defensive: Validate response structure
      if (!Array.isArray(rolesData)) {
        console.error('[useRoles] Invalid roles response structure:', rolesData);
        setError('Estructura de respuesta inválida del servidor');
        setRoles([]);
        setTotal(0);
        return;
      }

      // Transform backend roles to frontend format
      const transformedRoles = rolesData.map(transformRole);

      console.log('[useRoles] Transformed roles:', transformedRoles);
      setRoles(transformedRoles);
      setTotal(transformedRoles.length);
    } catch (err) {
      console.error('[useRoles] Failed to fetch roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
      setRoles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [transformRole]);

  /**
   * Fetch all available permissions in the system
   * Backend: GET /admin/roles/permissions
   *
   * Response example:
   * ```json
   * [{
   *   "module": "users",
   *   "action": "view",
   *   "description": "View user details"
   * }]
   * ```
   */
  const fetchAvailablePermissions = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const permissionsData = await adminAPI.getAvailablePermissions();

      // Defensive: Validate response structure
      if (!Array.isArray(permissionsData)) {
        console.error('[useRoles] Invalid permissions response structure:', permissionsData);
        setError('Estructura de respuesta inválida para permisos');
        setAvailablePermissions([]);
        return;
      }

      setAvailablePermissions(permissionsData);
    } catch (err) {
      console.error('[useRoles] Failed to fetch available permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch available permissions');
      setAvailablePermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refetch both roles and available permissions
   * Useful for refreshing data after updates
   */
  const refetch = useCallback(async (): Promise<void> => {
    await Promise.all([fetchRoles(), fetchAvailablePermissions()]);
  }, [fetchRoles, fetchAvailablePermissions]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Initial data fetch on mount
   * Fetches both roles and available permissions
   */
  useEffect(() => {
    refetch();
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    roles,
    availablePermissions,
    total,

    // State
    loading,
    error,

    // Operations
    fetchRoles,
    fetchAvailablePermissions,
    refetch,
  };
}
