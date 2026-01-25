/**
 * RoleActionsMenu Component
 *
 * Provides action buttons for role management.
 * Currently only permission editing is functional.
 * Create and Delete require backend endpoints (not yet implemented).
 *
 * Status:
 * - Edit Permissions: FUNCTIONAL
 * - Create Role: PENDING BACKEND (POST /admin/roles)
 * - Delete Role: PENDING BACKEND (DELETE /admin/roles/:id)
 *
 * Created: 2026-01-25 - TASK-2026-01-25-001 (GAP-005.3)
 */

import React, { useState } from 'react';
import { Plus, Trash2, Edit, Info } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { Role } from '@/services/api/adminTypes';

export interface RoleActionsMenuProps {
  selectedRole: Role | null;
  onEditPermissions: () => void;
  onRefresh: () => void;
}

export const RoleActionsMenu: React.FC<RoleActionsMenuProps> = ({
  selectedRole,
  onEditPermissions,
  onRefresh,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const isSystemRole = selectedRole?.isSystem ?? false;

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Create Role - Pending Backend */}
        <DetectiveButton
          variant="secondary"
          disabled
          title="Crear Rol - Requiere endpoint backend (POST /admin/roles)"
          className="opacity-50"
        >
          <Plus className="mr-1 h-4 w-4" />
          Crear Rol
          <span className="ml-2 rounded bg-yellow-500/20 px-1.5 py-0.5 text-xs text-yellow-500">
            Proximamente
          </span>
        </DetectiveButton>

        {/* Edit Permissions - Functional */}
        <DetectiveButton
          variant="primary"
          onClick={onEditPermissions}
          disabled={!selectedRole}
        >
          <Edit className="mr-1 h-4 w-4" />
          Editar Permisos
        </DetectiveButton>

        {/* Delete Role - Pending Backend */}
        <DetectiveButton
          variant="secondary"
          disabled
          title={
            isSystemRole
              ? 'Los roles del sistema no pueden eliminarse'
              : 'Eliminar Rol - Requiere endpoint backend (DELETE /admin/roles/:id)'
          }
          className="opacity-50"
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Eliminar
          <span className="ml-2 rounded bg-yellow-500/20 px-1.5 py-0.5 text-xs text-yellow-500">
            Proximamente
          </span>
        </DetectiveButton>

        {/* Info Toggle */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-detective-orange/20 hover:text-detective-orange"
          title="Ver informacion sobre funcionalidades pendientes"
        >
          <Info className="h-5 w-5" />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-yellow-500">
            <Info className="h-4 w-4" />
            Funcionalidades Pendientes de Backend
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">*</span>
              <span>
                <strong>Crear Rol:</strong> Requiere endpoint{' '}
                <code className="rounded bg-detective-bg-secondary px-1">POST /admin/roles</code>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">*</span>
              <span>
                <strong>Editar Nombre/Descripcion:</strong> Requiere endpoint{' '}
                <code className="rounded bg-detective-bg-secondary px-1">PUT /admin/roles/:id</code>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">*</span>
              <span>
                <strong>Eliminar Rol:</strong> Requiere endpoint{' '}
                <code className="rounded bg-detective-bg-secondary px-1">DELETE /admin/roles/:id</code>
              </span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            La edicion de permisos (PUT /admin/roles/:id/permissions) ya esta funcional.
          </p>
        </div>
      )}
    </div>
  );
};

RoleActionsMenu.displayName = 'RoleActionsMenu';
