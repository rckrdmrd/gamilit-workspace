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
 *
 * US-ADMIN-P2-001 Refactor (2025-12-05):
 * - ✅ Modularized into components: RolesTable, PermissionMatrix, RoleEditor
 * - ✅ Improved code organization and maintainability
 * - ✅ Better separation of concerns
 */

import { useState, useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';
import { AdminPageShell } from '../components/shared';
import { useRoles } from '../hooks/useRoles';
import { useRolePermissions } from '../hooks/useRolePermissions';
import { Card } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { LoadingSpinner } from '@shared/components/loading';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import { RolesTable, RoleEditor, RoleActionsMenu } from '../components/roles';
import type { Permission } from '@/services/api/adminTypes';

export default function AdminRolesPage() {
  // Local state
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Hooks
  const { roles, loading: rolesLoading, error: rolesError, refetch } = useRoles();
  const {
    rolePermissions,
    loading: permissionsLoading,
    error: permissionsError,
    fetchRolePermissions,
    updatePermissions,
    reset: resetPermissions,
  } = useRolePermissions(selectedRoleId);
  const [editingPermissions, setEditingPermissions] = useState<Permission[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get the currently selected role object
  const selectedRole = selectedRoleId
    ? roles.find((role) => role.roleId === selectedRoleId) || null
    : null;

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
  // RENDER
  // ============================================================================

  return (
    <AdminPageShell>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-detective-text">Roles y Permisos</h1>
            <p className="mt-1 text-detective-text-secondary">
              Gestiona los roles del sistema y sus permisos granulares
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RoleActionsMenu
              selectedRole={selectedRole}
              onEditPermissions={() => {
                if (selectedRoleId) {
                  fetchRolePermissions(selectedRoleId);
                }
              }}
              onRefresh={refetch}
            />
            <Button onClick={() => refetch()} disabled={rolesLoading} variant="secondary">
              Actualizar
            </Button>
          </div>
        </div>

        {/* Error Messages */}
        {rolesError && (
          <Card className="border-red-200 bg-red-50">
            <div className="text-red-800" role="alert">
              <strong>Error:</strong> {rolesError}
            </div>
          </Card>
        )}

        {permissionsError && (
          <Card className="border-red-200 bg-red-50">
            <div className="text-red-800" role="alert">
              <strong>Error:</strong> {permissionsError}
            </div>
          </Card>
        )}

        {/* Success Message */}
        {successMessage && (
          <Card className="border-green-200 bg-green-50">
            <div className="text-green-800" aria-live="polite">
              <strong>Exito:</strong> {successMessage}
            </div>
          </Card>
        )}

        {/* Loading State */}
        {rolesLoading && !roles.length && (
          <div className="flex items-center justify-center py-12" aria-live="polite">
            <LoadingSpinner />
            <span className="ml-3 text-detective-text-secondary">Cargando roles...</span>
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        {!rolesLoading && roles.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - Roles List */}
            <div className="lg:col-span-1" role="region" aria-label="Lista de roles">
              <Card>
                <div className="border-b border-detective-border p-4">
                  <h2 className="text-xl font-semibold text-detective-text">Roles del Sistema</h2>
                  <p className="mt-1 text-sm text-detective-text-secondary">{roles.length} roles totales</p>
                </div>
                <div className="p-4">
                  <RolesTable
                    roles={roles}
                    selectedRoleId={selectedRoleId}
                    onSelectRole={handleSelectRole}
                    loading={false}
                  />
                </div>
              </Card>
            </div>

            {/* Right Column - Empty State */}
            <div className="lg:col-span-2" role="region" aria-label="Detalles del rol seleccionado">
              {!selectedRoleId && (
                <Card>
                  <EmptyState
                    icon={Shield}
                    title="Selecciona un rol"
                    description="Elige un rol de la lista para ver y editar sus permisos"
                  />
                </Card>
              )}

              {selectedRoleId && permissionsLoading && (
                <Card>
                  <div className="flex items-center justify-center py-12" aria-live="polite">
                    <LoadingSpinner />
                    <span className="ml-3 text-detective-text-secondary">Cargando permisos...</span>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Role Editor Modal */}
        <RoleEditor
          isOpen={!!selectedRoleId && !permissionsLoading}
          rolePermissions={rolePermissions}
          editingPermissions={editingPermissions}
          loading={permissionsLoading}
          saving={isSaving}
          onTogglePermission={togglePermission}
          onSave={handleSavePermissions}
          onClose={handleCancelEdit}
        />

        {/* Empty State */}
        {!rolesLoading && roles.length === 0 && !rolesError && (
          <Card>
            <EmptyState
              icon={Lock}
              title="No hay roles disponibles"
              description="No se encontraron roles en el sistema"
            />
          </Card>
        )}
      </div>
    </AdminPageShell>
  );
}
