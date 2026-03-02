/**
 * RoleEditor Component
 *
 * Modal for viewing and editing role permissions
 *
 * Features:
 * - Modal overlay with animations
 * - Permission matrix integration
 * - Save/Cancel actions
 * - Loading states
 * - Success/Error feedback
 *
 * Created: 2025-12-05 - US-ADMIN-P2-001
 */

import type { ReactElement } from 'react';
import { Lock } from 'lucide-react';
import type { RolePermissions, Permission } from '@/services/api/adminTypes';
import { Button } from '@shared/components/Button';
import { LoadingSpinner } from '@shared/components/loading';
import { Modal } from '@shared/components/common/Modal';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import { PermissionMatrix } from './PermissionMatrix';

interface RoleEditorProps {
  isOpen: boolean;
  rolePermissions: RolePermissions | null;
  editingPermissions: Permission[];
  loading: boolean;
  saving: boolean;
  onTogglePermission: (module: string, action: string) => void;
  onSave: () => Promise<void>;
  onClose: () => void;
}

export function RoleEditor({
  isOpen,
  rolePermissions,
  editingPermissions,
  loading,
  saving,
  onTogglePermission,
  onSave,
  onClose,
}: RoleEditorProps): ReactElement | null {

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      animated
      size="4xl"
      showCloseButton={false}
      overlayClassName="bg-black/60 backdrop-blur-sm p-4"
      className="max-h-[90vh] overflow-hidden rounded-lg bg-detective-dark shadow-2xl"
      contentClassName="custom"
    >
      {/* Header */}
      <div className="border-b border-detective-border bg-gradient-to-r from-detective-orange to-detective-orange-dark px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              {loading ? 'Cargando...' : `Permisos: ${rolePermissions?.role?.roleName || 'Rol'}`}
            </h2>
            {!loading && rolePermissions?.role?.description && (
              <p className="mt-1 text-sm text-white/80">
                {rolePermissions.role.description}
              </p>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={saving}
            className="ml-3 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-white hover:text-white/80 transition-colors disabled:opacity-50"
            aria-label="Cerrar editor"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
            <span className="ml-3 text-detective-text-secondary">Cargando permisos...</span>
          </div>
        )}

        {/* Permission Matrix */}
        {!loading && rolePermissions && (
          <PermissionMatrix
            permissions={editingPermissions}
            onTogglePermission={onTogglePermission}
            disabled={saving}
          />
        )}

        {/* Empty State */}
        {!loading && !rolePermissions && (
          <EmptyState
            icon={Lock}
            title="No hay datos disponibles"
            description="No se pudieron cargar los permisos del rol"
          />
        )}
      </div>

      {/* Footer - Action Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-detective-border bg-detective-bg-secondary px-6 py-4">
        <Button
          onClick={onClose}
          variant="secondary"
          disabled={saving}
        >
          Cancelar
        </Button>

        <Button
          onClick={onSave}
          variant="primary"
          disabled={loading || saving || !rolePermissions}
          loading={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Permisos'}
        </Button>
      </div>
    </Modal>
  );
}

export default RoleEditor;
