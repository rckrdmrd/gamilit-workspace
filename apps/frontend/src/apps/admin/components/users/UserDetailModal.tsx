/**
 * GLIT Platform V2 - User Detail Modal Component
 *
 * Detailed user profile editing and management modal with 3 tabs:
 * - Profile: Editable user information
 * - Activity: User activity timeline
 * - Permissions: Role-based permissions display
 *
 * Features:
 * - Framer Motion animations
 * - Inline editing in Profile tab
 * - Activity timeline visualization
 * - Full TypeScript support
 * - Integration with useUserManagement hook
 */

import { useState, useEffect, type ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Activity, Shield, Edit2, Save, XCircle } from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';
import type { SystemUser } from '../../types';
import { ActivityTimeline, type ActivityLog } from '../../../../shared/components/timeline';
import { getDetectiveRoleName, getDetectiveRoleBadge } from '@shared/utils/detectiveRoles';

// ============================================================================
// TYPES
// ============================================================================

interface UserDetailModalProps {
  user: SystemUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (userId: string, userData: Partial<UserFormData>) => Promise<void>;
}

interface UserFormData {
  full_name: string;
  email: string;
  role: SystemUser['role'];
  status: SystemUser['status'];
  organizationName?: string;
  phone?: string;
  department?: string;
  position?: string;
}

type TabType = 'profile' | 'activity' | 'permissions';

// ============================================================================
// COMPONENT
// ============================================================================

export function UserDetailModal({
  user,
  isOpen,
  onClose,
  onUpdate,
}: UserDetailModalProps): ReactElement | null {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserFormData>({
    full_name: '',
    email: '',
    role: 'student',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  // MOCK-DATA: Requires backend endpoint
  // Mock activity logs - In production, fetch from API
  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Inicio de sesión',
      resource: 'Autenticación',
      success: true,
      timestamp: new Date().toISOString(),
      details: 'Acceso desde dispositivo móvil',
    },
    {
      id: '2',
      action: 'Actualización de perfil',
      resource: 'Usuario',
      success: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      details: 'Cambio de información personal',
    },
    {
      id: '3',
      action: 'Intento de acceso fallido',
      resource: 'Autenticación',
      success: false,
      error: 'Contraseña incorrecta',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);

  // Initialize edit data when user changes
  useEffect(() => {
    if (user) {
      setEditData({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role,
        status: user.status,
        organizationName: user.organizationName || '',
      });
    }
  }, [user]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('profile');
      setIsEditing(false);
    }
  }, [isOpen]);

  // Note: ESC key, scroll lock, and focus trap are handled by Modal component

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSave = async (): Promise<void> => {
    if (!user || !onUpdate) return;

    try {
      setSaving(true);
      await onUpdate(user.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
      // Error handling would show toast notification in production
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (): void => {
    if (user) {
      setEditData({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role,
        status: user.status,
        organizationName: user.organizationName || '',
      });
    }
    setIsEditing(false);
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Fecha no válida';
    }
  };

  const getRoleDisplayName = (role: SystemUser['role']): string => {
    return getDetectiveRoleName(role);
  };

  const getStatusColor = (status: SystemUser['status']): string => {
    return status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
  };

  const getRoleBadgeColor = (role: SystemUser['role']): string => {
    const colors: Record<SystemUser['role'], string> = {
      super_admin: 'bg-purple-500/20 text-purple-400',
      admin_teacher: 'bg-detective-orange/20 text-detective-orange',
      student: 'bg-blue-500/20 text-blue-400',
    };
    return colors[role] || 'bg-detective-card text-detective-text-secondary';
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // ============================================================================
  // TABS CONFIGURATION
  // ============================================================================

  const tabs = [
    { id: 'profile' as const, name: 'Perfil', icon: User },
    { id: 'activity' as const, name: 'Actividad', icon: Activity },
    { id: 'permissions' as const, name: 'Permisos', icon: Shield },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      animated
      size="4xl"
      showCloseButton={false}
      overlayClassName="bg-black/60 backdrop-blur-sm p-4"
      className="max-h-[90vh] overflow-hidden rounded-lg bg-detective-dark shadow-xl border border-detective-border"
      contentClassName="custom"
    >
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-detective-orange to-detective-gold px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {/* Avatar */}
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                      <span className="text-lg font-bold text-white">
                        {getInitials(user.full_name)}
                      </span>
                    </div>

                    {/* User Info */}
                    <div>
                      <h2 id="user-detail-modal-title" className="text-xl font-bold text-white">{user.full_name}</h2>
                      <p className="text-sm text-white/80">
                        {getRoleDisplayName(user.role)} • {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Close Button */}
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(user.status)}`}
                    >
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                    <button
                      onClick={onClose}
                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-white transition-colors hover:text-white/70"
                      aria-label="Cerrar modal"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="border-b border-detective-border">
                <nav className="-mb-px flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                          isActive
                            ? 'border-detective-orange text-detective-orange'
                            : 'border-transparent text-detective-text-secondary hover:border-detective-border hover:text-detective-text'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-detective-text">
                            Información del Usuario
                          </h3>
                          {onUpdate && (
                            <button
                              onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
                              className={`flex items-center space-x-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                                isEditing
                                  ? 'bg-detective-bg-secondary text-detective-text border border-detective-border hover:bg-detective-border'
                                  : 'bg-detective-orange text-white hover:bg-detective-orange/80'
                              }`}
                            >
                              {isEditing ? (
                                <>
                                  <XCircle className="h-4 w-4" />
                                  <span>Cancelar</span>
                                </>
                              ) : (
                                <>
                                  <Edit2 className="h-4 w-4" />
                                  <span>Editar</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          // EDIT MODE
                          <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              {/* Full Name */}
                              <div>
                                <label className="mb-2 block text-sm font-medium text-detective-text">
                                  Nombre Completo
                                </label>
                                <input
                                  type="text"
                                  value={editData.full_name}
                                  onChange={(e) =>
                                    setEditData({ ...editData, full_name: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-detective-border bg-detective-card px-3 py-2 text-detective-text transition-colors focus:border-detective-orange focus:ring-2 focus:ring-detective-orange"
                                />
                              </div>

                              {/* Email */}
                              <div>
                                <label className="mb-2 block text-sm font-medium text-detective-text">
                                  Correo Electrónico
                                </label>
                                <input
                                  type="email"
                                  value={editData.email}
                                  onChange={(e) =>
                                    setEditData({ ...editData, email: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-detective-border bg-detective-card px-3 py-2 text-detective-text transition-colors focus:border-detective-orange focus:ring-2 focus:ring-detective-orange"
                                />
                              </div>

                              {/* Role */}
                              <div>
                                <label className="mb-2 block text-sm font-medium text-detective-text">
                                  Rango Detective
                                </label>
                                <select
                                  value={editData.role}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      role: e.target.value as SystemUser['role'],
                                    })
                                  }
                                  className="w-full rounded-lg border border-detective-border bg-detective-card px-3 py-2 text-detective-text transition-colors focus:border-detective-orange focus:ring-2 focus:ring-detective-orange"
                                >
                                  <option value="student">
                                    {getDetectiveRoleBadge('student')}{' '}
                                    {getDetectiveRoleName('student')}
                                  </option>
                                  <option value="admin_teacher">
                                    {getDetectiveRoleBadge('admin_teacher')}{' '}
                                    {getDetectiveRoleName('admin_teacher')}
                                  </option>
                                  <option value="super_admin">
                                    {getDetectiveRoleBadge('super_admin')}{' '}
                                    {getDetectiveRoleName('super_admin')}
                                  </option>
                                </select>
                              </div>

                              {/* Status */}
                              <div>
                                <label className="mb-2 block text-sm font-medium text-detective-text">
                                  Estado
                                </label>
                                <select
                                  value={editData.status}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      status: e.target.value as SystemUser['status'],
                                    })
                                  }
                                  className="w-full rounded-lg border border-detective-border bg-detective-card px-3 py-2 text-detective-text transition-colors focus:border-detective-orange focus:ring-2 focus:ring-detective-orange"
                                >
                                  <option value="active">Activo</option>
                                  <option value="inactive">Inactivo</option>
                                </select>
                              </div>

                              {/* Organization */}
                              <div>
                                <label className="mb-2 block text-sm font-medium text-detective-text">
                                  Organización
                                </label>
                                <input
                                  type="text"
                                  value={editData.organizationName || ''}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      organizationName: e.target.value,
                                    })
                                  }
                                  className="w-full rounded-lg border border-detective-border bg-detective-card px-3 py-2 text-detective-text transition-colors focus:border-detective-orange focus:ring-2 focus:ring-detective-orange"
                                  placeholder="Nombre de la organización"
                                />
                              </div>

                              {/* Phone */}
                              <div>
                                <label className="mb-2 block text-sm font-medium text-detective-text">
                                  Teléfono
                                </label>
                                <input
                                  type="tel"
                                  value={editData.phone || ''}
                                  onChange={(e) =>
                                    setEditData({ ...editData, phone: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-detective-border bg-detective-card px-3 py-2 text-detective-text transition-colors focus:border-detective-orange focus:ring-2 focus:ring-detective-orange"
                                  placeholder="+52 123 456 7890"
                                />
                              </div>

                              {/* Department */}
                              <div>
                                <label className="mb-2 block text-sm font-medium text-detective-text">
                                  Departamento
                                </label>
                                <input
                                  type="text"
                                  value={editData.department || ''}
                                  onChange={(e) =>
                                    setEditData({ ...editData, department: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-detective-border bg-detective-card px-3 py-2 text-detective-text transition-colors focus:border-detective-orange focus:ring-2 focus:ring-detective-orange"
                                  placeholder="Tecnología, Marketing, etc."
                                />
                              </div>

                              {/* Position */}
                              <div>
                                <label className="mb-2 block text-sm font-medium text-detective-text">
                                  Cargo
                                </label>
                                <input
                                  type="text"
                                  value={editData.position || ''}
                                  onChange={(e) =>
                                    setEditData({ ...editData, position: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-detective-border bg-detective-card px-3 py-2 text-detective-text transition-colors focus:border-detective-orange focus:ring-2 focus:ring-detective-orange"
                                  placeholder="Director, Analista, etc."
                                />
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 border-t border-detective-border pt-4">
                              <button
                                type="button"
                                onClick={handleCancel}
                                className="rounded-lg bg-detective-bg-secondary px-4 py-3 font-medium text-detective-text border border-detective-border transition-colors hover:bg-detective-border"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center space-x-2 rounded-lg bg-detective-orange px-4 py-3 font-medium text-white transition-colors hover:bg-detective-orange/80 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Save className="h-4 w-4" />
                                <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                              </button>
                            </div>
                          </form>
                        ) : (
                          // VIEW MODE
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                              <div>
                                <dt className="text-sm font-medium text-detective-text-secondary">
                                  Nombre Completo
                                </dt>
                                <dd className="mt-1 text-sm text-detective-text">{user.full_name}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-detective-text-secondary">
                                  Correo Electrónico
                                </dt>
                                <dd className="mt-1 text-sm text-detective-text">{user.email}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-detective-text-secondary">Organización</dt>
                                <dd className="mt-1 text-sm text-detective-text">
                                  {user.organizationName || '-'}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-detective-text-secondary">ID de Usuario</dt>
                                <dd className="mt-1 font-mono text-sm text-detective-text">{user.id}</dd>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <dt className="text-sm font-medium text-detective-text-secondary">
                                  Rango Detective
                                </dt>
                                <dd className="mt-1">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                                  >
                                    {getDetectiveRoleBadge(user.role)}{' '}
                                    {getRoleDisplayName(user.role)}
                                  </span>
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-detective-text-secondary">Estado</dt>
                                <dd className="mt-1">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(user.status)}`}
                                  >
                                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                                  </span>
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-detective-text-secondary">
                                  Fecha de Registro
                                </dt>
                                <dd className="mt-1 text-sm text-detective-text">
                                  {formatDate(user.createdAt)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-detective-text-secondary">Último Acceso</dt>
                                <dd className="mt-1 text-sm text-detective-text">
                                  {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                                </dd>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ACTIVITY TAB */}
                    {activeTab === 'activity' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium text-detective-text">
                          Actividad Reciente del Usuario
                        </h3>

                        <ActivityTimeline
                          activities={activityLogs}
                          loading={false}
                          emptyMessage="No hay actividad registrada para este usuario"
                        />
                      </div>
                    )}

                    {/* PERMISSIONS TAB */}
                    {activeTab === 'permissions' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium text-detective-text">Permisos del Usuario</h3>

                        {/* Development Notice */}
                        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg
                                className="h-5 w-5 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-400">
                                Sistema de Permisos en Desarrollo
                              </h3>
                              <div className="mt-2 text-sm text-yellow-400/80">
                                <p>
                                  La gestión granular de permisos será implementada en la siguiente
                                  fase del proyecto.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Current Role Permissions */}
                        <div className="rounded-lg bg-detective-card p-6">
                          <h4 className="mb-4 font-medium text-detective-text">
                            Permisos Básicos por Rol
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-detective-text">Rango Detective Actual:</span>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                              >
                                {getDetectiveRoleBadge(user.role)} {getRoleDisplayName(user.role)}
                              </span>
                            </div>
                            <div className="border-t border-detective-border pt-3 text-sm text-detective-text-secondary">
                              Los permisos se asignan automáticamente según el rango detective del
                              usuario en el sistema. Los rangos con más privilegios heredan los
                              permisos de los rangos inferiores.
                            </div>
                          </div>
                        </div>

                        {/* Role Hierarchy Info */}
                        <div className="rounded-lg border border-detective-border bg-detective-card p-6">
                          <h4 className="mb-4 font-medium text-detective-text">
                            Jerarquía de Rangos Detectivescos
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                                <span className="text-xs font-bold text-purple-400">1</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-detective-text">
                                  {getDetectiveRoleBadge('super_admin')}{' '}
                                  {getDetectiveRoleName('super_admin')}
                                </p>
                                <p className="text-xs text-detective-text-secondary">Acceso completo al sistema</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-detective-orange/20">
                                <span className="text-xs font-bold text-detective-orange">2</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-detective-text">
                                  {getDetectiveRoleBadge('admin_teacher')}{' '}
                                  {getDetectiveRoleName('admin_teacher')}
                                </p>
                                <p className="text-xs text-detective-text-secondary">
                                  Gestión de contenido y usuarios
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                                <span className="text-xs font-bold text-blue-400">3</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-detective-text">
                                  {getDetectiveRoleBadge('student')}{' '}
                                  {getDetectiveRoleName('student')}
                                </p>
                                <p className="text-xs text-detective-text-secondary">
                                  Acceso a contenido educativo
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
    </Modal>
  );
}

export default UserDetailModal;
