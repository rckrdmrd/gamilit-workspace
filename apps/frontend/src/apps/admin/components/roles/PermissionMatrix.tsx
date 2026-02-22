/**
 * PermissionMatrix Component
 *
 * Interactive matrix for managing permissions by module and action
 *
 * Features:
 * - Group permissions by module
 * - Toggle individual permissions with checkboxes
 * - Visual feedback for granted/denied permissions
 * - Module icons for better UX
 * - Action labels in Spanish
 *
 * Created: 2025-12-05 - US-ADMIN-P2-001
 */

import type { ReactElement } from 'react';
import type { Permission } from '@/services/api/adminTypes';

interface PermissionMatrixProps {
  permissions: Permission[];
  onTogglePermission: (module: string, action: string) => void;
  disabled?: boolean;
}

export function PermissionMatrix({
  permissions,
  onTogglePermission,
  disabled = false,
}: PermissionMatrixProps): ReactElement {

  // ============================================================================
  // HELPERS
  // ============================================================================

  const groupPermissionsByModule = (perms: Permission[]): Record<string, Permission[]> => {
    const grouped: Record<string, Permission[]> = {};

    if (!Array.isArray(perms)) {
      console.error('[PermissionMatrix] Invalid permissions array:', perms);
      return grouped;
    }

    perms.forEach((perm) => {
      if (!perm?.module || !perm?.action) {
        console.error('[PermissionMatrix] Invalid permission object:', perm);
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

  const getModuleName = (module: string): string => {
    const names: Record<string, string> = {
      users: 'Usuarios',
      content: 'Contenido',
      gamification: 'Gamificación',
      monitoring: 'Monitoreo',
      system: 'Sistema',
      organizations: 'Organizaciones',
      reports: 'Reportes',
      analytics: 'Analíticas',
      admin: 'Administración',
      roles: 'Roles',
    };
    return names[module] || module.charAt(0).toUpperCase() + module.slice(1);
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

  const groupedPermissions = groupPermissionsByModule(permissions);

  if (permissions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="text-4xl mb-3">🔐</div>
        <p className="text-sm">No hay permisos disponibles para este rol</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedPermissions).map(([module, perms]) => (
        <div key={module} className="space-y-3">
          {/* Module Header */}
          <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            <span className="mr-2 text-xl">{getModuleIcon(module)}</span>
            {getModuleName(module)}
          </h3>

          {/* Permissions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {perms.map((perm) => {
              if (!perm?.module || !perm?.action) {
                console.error('[PermissionMatrix] Invalid perm in render:', perm);
                return null;
              }

              const permId = `${perm.module}-${perm.action}`;

              return (
                <label
                  key={permId}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    perm.granted
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={perm.granted}
                    onChange={() => !disabled && onTogglePermission(perm.module, perm.action)}
                    disabled={disabled}
                    className="h-4 w-4 rounded text-green-600 focus:ring-green-500 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900 select-none">
                    {getActionLabel(perm.action)}
                  </span>

                  {/* Granted Indicator */}
                  {perm.granted && (
                    <svg className="ml-auto w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PermissionMatrix;
