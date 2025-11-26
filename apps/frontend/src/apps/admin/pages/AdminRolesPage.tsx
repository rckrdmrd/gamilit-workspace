/**
 * AdminRolesPage - Roles & Permissions Management
 *
 * Comprehensive page for managing system roles and their permissions.
 *
 * Features:
 * - List all roles with user counts
 * - View and edit role permissions
 * - System roles (cannot be deleted)
 * - Permission management by module (users, content, gamification, monitoring, system)
 * - Real-time updates via backend API
 *
 * Backend Integration:
 * - GET /admin/roles - List roles
 * - GET /admin/roles/permissions - Available permissions
 * - GET /admin/roles/:id/permissions - Role permissions
 * - PUT /admin/roles/:id/permissions - Update permissions
 *
 * Status: ✅ MVP - Backend Integrated (2025-11-24)
 *
 * P2 Corrections Applied (2025-11-26):
 * - ✅ Added null checks in useEffect for rolePermissions.permissions with Array.isArray validation
 * - ✅ Added null checks in render for rolePermissions.role.roleName and description
 * - ✅ Added empty state handling when no permissions available
 * - ✅ Added defensive validation for role.roleId in map function
 * - ✅ Added fallbacks for role.roleName, role.description, and role.userCount
 * - ✅ Added input validation in togglePermission function
 * - ✅ Added defensive validation in groupPermissionsByModule helper
 * - ✅ Added permission object validation in permissions render map
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { useRoles } from '../hooks/useRoles';
import { useRolePermissions } from '../hooks/useRolePermissions';
import { Card } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';
import type { Permission } from '@/services/api/adminTypes';

export default function AdminRolesPage() {
  const { user, logout } = useAuth();

  // Hooks
  const { roles, loading: rolesLoading, error: rolesError, refetch } = useRoles();
  const {
    rolePermissions,
    loading: permissionsLoading,
    error: permissionsError,
    fetchRolePermissions,
    updatePermissions,
    reset: resetPermissions,
  } = useRolePermissions();

  // Local state
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<Permission[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Gamification data for header
  const gamificationData = {
    userId: user?.id || 'mock-admin-id',
    level: 20,
    totalXP: 5000,
    mlCoins: 2500,
    rank: 'Super Admin',
    achievements: ['admin_master', 'permission_guardian'],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // ============================================================================
  // ROLE SELECTION
  // ============================================================================

  const handleSelectRole = async (roleId: string) => {
    setSelectedRoleId(roleId);
    setSuccessMessage(null);
    await fetchRolePermissions(roleId);
  };

  // When rolePermissions loads, copy to editing state
  useEffect(() => {
    if (rolePermissions?.permissions && Array.isArray(rolePermissions.permissions)) {
      setEditingPermissions([...rolePermissions.permissions]);
    } else {
      setEditingPermissions([]);
    }
  }, [rolePermissions]);

  // ============================================================================
  // PERMISSION MANAGEMENT
  // ============================================================================

  const togglePermission = (module: string, action: string) => {
    // Defensive: Validate inputs
    if (!module || !action) {
      console.error('[AdminRolesPage] Invalid permission toggle:', { module, action });
      return;
    }

    setEditingPermissions((prev) =>
      prev.map((perm) =>
        perm.module === module && perm.action === action
          ? { ...perm, granted: !perm.granted }
          : perm,
      ),
    );
  };

  const handleSavePermissions = async () => {
    if (!rolePermissions || !selectedRoleId) return;

    setIsSaving(true);
    setSuccessMessage(null);

    try {
      await updatePermissions(selectedRoleId, editingPermissions);
      setSuccessMessage('Permisos actualizados exitosamente');

      // Refetch roles to update user counts if needed
      await refetch();
    } catch (error) {
      console.error('Failed to save permissions:', error);
      // Error is already set in hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setSelectedRoleId(null);
    resetPermissions();
    setEditingPermissions([]);
    setSuccessMessage(null);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const groupPermissionsByModule = (permissions: Permission[]) => {
    const grouped: Record<string, Permission[]> = {};

    // Defensive: Validate input
    if (!Array.isArray(permissions)) {
      console.error('[AdminRolesPage] Invalid permissions array:', permissions);
      return grouped;
    }

    permissions.forEach((perm) => {
      // Defensive: Validate permission object structure
      if (!perm?.module || !perm?.action) {
        console.error('[AdminRolesPage] Invalid permission object:', perm);
        return;
      }

      if (!grouped[perm.module]) {
        grouped[perm.module] = [];
      }
      grouped[perm.module].push(perm);
    });
    return grouped;
  };

  const getModuleIcon = (module: string): string => {
    const icons: Record<string, string> = {
      users: '👥',
      content: '📚',
      gamification: '🎮',
      monitoring: '📊',
      system: '⚙️',
      organizations: '🏢',
      reports: '📄',
      analytics: '📈',
      admin: '🔧',
      roles: '🎭',
    };
    return icons[module] || '📋';
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      view: 'Ver',
      create: 'Crear',
      edit: 'Editar',
      delete: 'Eliminar',
      manage: 'Administrar',
      export: 'Exportar',
    };
    return labels[action] || action;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={gamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles y Permisos</h1>
            <p className="mt-1 text-gray-600">
              Gestiona los roles del sistema y sus permisos granulares
            </p>
          </div>
          <Button onClick={() => refetch()} disabled={rolesLoading} variant="secondary">
            🔄 Actualizar
          </Button>
        </div>

        {/* Error Messages */}
        {rolesError && (
          <Card className="border-red-200 bg-red-50">
            <div className="text-red-800">
              <strong>Error:</strong> {rolesError}
            </div>
          </Card>
        )}

        {permissionsError && (
          <Card className="border-red-200 bg-red-50">
            <div className="text-red-800">
              <strong>Error:</strong> {permissionsError}
            </div>
          </Card>
        )}

        {/* Success Message */}
        {successMessage && (
          <Card className="border-green-200 bg-green-50">
            <div className="text-green-800">
              <strong>✓ Éxito:</strong> {successMessage}
            </div>
          </Card>
        )}

        {/* Loading State */}
        {rolesLoading && !roles.length && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
            <span className="ml-3 text-gray-600">Cargando roles...</span>
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        {!rolesLoading && roles.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - Roles List */}
            <div className="lg:col-span-1">
              <Card>
                <div className="border-b border-gray-200 p-4">
                  <h2 className="text-xl font-semibold text-gray-900">Roles del Sistema</h2>
                  <p className="mt-1 text-sm text-gray-600">{roles.length} roles totales</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {roles.map((role) => {
                    // Defensive: Ensure roleId exists (from adminTypes.Role interface)
                    if (!role.roleId) {
                      console.error('[AdminRolesPage] Role missing roleId:', role);
                      return null;
                    }

                    return (
                      <button
                        key={role.roleId}
                        onClick={() => handleSelectRole(role.roleId)}
                        className={`w-full p-4 text-left transition-colors hover:bg-gray-50 ${
                          selectedRoleId === role.roleId
                            ? 'border-l-4 border-blue-500 bg-blue-50'
                            : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {role.roleName || 'Sin nombre'}
                              {role.isSystem && (
                                <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                                  Sistema
                                </span>
                              )}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                              {role.description || 'Sin descripción'}
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                              👥 {role.userCount ?? 0} usuario{role.userCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          {selectedRoleId === role.roleId && (
                            <span className="text-blue-500">▶</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Right Column - Permissions Editor */}
            <div className="lg:col-span-2">
              {!selectedRoleId && (
                <Card>
                  <div className="p-12 text-center text-gray-500">
                    <div className="mb-4 text-6xl">🔐</div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-700">Selecciona un rol</h3>
                    <p>Elige un rol de la lista para ver y editar sus permisos</p>
                  </div>
                </Card>
              )}

              {selectedRoleId && permissionsLoading && (
                <Card>
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                    <span className="ml-3 text-gray-600">Cargando permisos...</span>
                  </div>
                </Card>
              )}

              {selectedRoleId && rolePermissions && !permissionsLoading && (
                <Card>
                  <div className="border-b border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Permisos: {rolePermissions?.role?.roleName || 'Rol'}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                          {rolePermissions?.role?.description || 'Sin descripción'}
                        </p>
                      </div>
                      <Button onClick={handleCancelEdit} variant="secondary" size="sm">
                        ✕ Cerrar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6 p-6">
                    {/* Permissions by Module */}
                    {editingPermissions.length > 0 ? (
                      Object.entries(groupPermissionsByModule(editingPermissions)).map(
                        ([module, perms]) => (
                          <div key={module} className="space-y-3">
                            <h3 className="flex items-center text-lg font-semibold text-gray-800">
                              <span className="mr-2">{getModuleIcon(module)}</span>
                              {module.charAt(0).toUpperCase() + module.slice(1)}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                              {perms.map((perm) => {
                                // Defensive: Validate permission object
                                if (!perm?.module || !perm?.action) {
                                  console.error('[AdminRolesPage] Invalid perm in render:', perm);
                                  return null;
                                }

                                return (
                                  <label
                                    key={`${perm.module}-${perm.action}`}
                                    className={`flex cursor-pointer items-center rounded-lg border p-3 transition-colors ${
                                      perm.granted
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={perm.granted}
                                      onChange={() => togglePermission(perm.module, perm.action)}
                                      className="h-4 w-4 rounded text-green-600 focus:ring-green-500"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-900">
                                      {getActionLabel(perm.action)}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ),
                      )
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p>No hay permisos disponibles para este rol</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4">
                      <Button onClick={handleCancelEdit} variant="secondary" disabled={isSaving}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSavePermissions} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                            Guardando...
                          </>
                        ) : (
                          '💾 Guardar Permisos'
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!rolesLoading && roles.length === 0 && !rolesError && (
          <Card>
            <div className="p-12 text-center text-gray-500">
              <div className="mb-4 text-6xl">🔐</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-700">No hay roles disponibles</h3>
              <p>No se encontraron roles en el sistema</p>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
