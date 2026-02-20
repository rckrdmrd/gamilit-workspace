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

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RolePermissions, Permission } from '@/services/api/adminTypes';
import { Button } from '@shared/components/Button';
import { LoadingSpinner } from '@shared/components/loading';
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
}: RoleEditorProps): React.ReactElement | null {

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4 backdrop-blur-sm"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">
                      {loading ? 'Cargando...' : `Permisos: ${rolePermissions?.role?.roleName || 'Rol'}`}
                    </h2>
                    {!loading && rolePermissions?.role?.description && (
                      <p className="mt-1 text-sm text-blue-100">
                        {rolePermissions.role.description}
                      </p>
                    )}
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    disabled={saving}
                    className="ml-3 text-white hover:text-blue-100 transition-colors disabled:opacity-50"
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
                    <span className="ml-3 text-gray-600">Cargando permisos...</span>
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
                  <div className="p-12 text-center text-gray-500">
                    <div className="mb-4 text-6xl">🔐</div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-700">No hay datos disponibles</h3>
                    <p>No se pudieron cargar los permisos del rol</p>
                  </div>
                )}
              </div>

              {/* Footer - Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
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
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default RoleEditor;
