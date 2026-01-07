import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FeatureBadge, ConfirmDialog } from '@shared/components/common';
import { useUserManagement } from '../hooks/useUserManagement';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { UserDetailModal } from '../components/users/UserDetailModal';
import { CreateUserModal } from '../components/users/CreateUserModal';
import type { CreateUserFormData, CreatedUserResult } from '../components/users/CreateUserModal';
import { ToastContainer, useToast } from '@shared/components/base/Toast';
import { getOrganizations } from '@/services/api/adminAPI';
import type { SystemUser } from '../types';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Shield,
  RefreshCw,
} from 'lucide-react';

/**
 * AdminUsersPage - Gestión de usuarios de la plataforma
 * Updated: 2025-11-19 - Integrated with useUserManagement hook (FE-059)
 * Updated: 2025-11-24 - Added UserEditModal integration (FE-P1-010)
 */
export default function AdminUsersPage() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'info',
  });

  // Use useUserManagement hook for data management
  const {
    users,
    totalUsers,
    loading,
    error,
    filters,
    fetchUsers,
    createUser,
    suspendUser,
    unsuspendUser,
    deleteUser,
    updateUser,
    setFilters,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
  } = useUserManagement();

  // Toast notifications
  const { toasts, showToast } = useToast();

  // Use useUserGamification hook (currently with mock data until backend endpoint is ready)
  const { gamificationData } = useUserGamification(user?.id);

  // Fallback gamification data in case hook fails or user is not loaded
  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: 1,
    totalXP: 0,
    mlCoins: 0,
    rank: 'Novato',
    achievements: [],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Fetch organizations when create modal opens
  const fetchOrganizations = useCallback(async () => {
    setIsLoadingOrganizations(true);
    try {
      const response = await getOrganizations({ page: 1, limit: 100 });
      setOrganizations(response.items.map((org) => ({ id: org.id, name: org.name })));
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar las organizaciones',
      });
    } finally {
      setIsLoadingOrganizations(false);
    }
  }, [showToast]);

  // Handle open create modal
  const handleOpenCreateModal = useCallback(async () => {
    setIsCreateModalOpen(true);
    await fetchOrganizations();
  }, [fetchOrganizations]);

  // Handle create user submission
  const handleCreateUser = useCallback(
    async (data: CreateUserFormData): Promise<CreatedUserResult> => {
      try {
        const result = await createUser({
          email: data.email,
          full_name: data.full_name,
          role: data.role,
          organization_id: data.organization_id,
          classroom_id: data.classroom_id,
          send_welcome_email: data.send_welcome_email,
        });

        showToast({
          type: 'success',
          title: 'Usuario creado',
          message: `El usuario ${result.email} ha sido creado correctamente`,
        });

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
        showToast({
          type: 'error',
          title: 'Error',
          message: errorMessage,
        });
        throw err;
      }
    },
    [createUser, showToast],
  );

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      setFilters({ ...filters, search: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Handle user actions
  const handleEditUser = (usr: SystemUser) => {
    setEditingUser(usr);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      // Convert UserFormData to SystemUser format
      const updateData: Partial<SystemUser> = {
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        status: data.status,
      };

      await updateUser(userId, updateData);
      showToast({
        type: 'success',
        title: 'Usuario actualizado',
        message: 'Los datos del usuario se han actualizado correctamente',
      });
      handleCloseEditModal();
      await fetchUsers(); // Refresh list
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error al actualizar',
        message: err instanceof Error ? err.message : 'No se pudo actualizar el usuario',
      });
      throw err;
    }
  };

  const handleSuspendUser = async (userId: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Suspender Usuario',
      message: `¿Estás seguro de suspender a ${name}?`,
      onConfirm: async () => {
        try {
          await suspendUser(userId);
          showToast({
            type: 'success',
            title: 'Usuario suspendido',
            message: `El usuario ${name} ha sido suspendido correctamente`,
          });
          await fetchUsers(); // Refresh list
        } catch (err) {
          showToast({
            type: 'error',
            title: 'Error al suspender',
            message: 'No se pudo suspender el usuario',
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
      variant: 'warning',
    });
  };

  const handleUnsuspendUser = async (userId: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reactivar Usuario',
      message: `¿Estás seguro de reactivar a ${name}?`,
      onConfirm: async () => {
        try {
          await unsuspendUser(userId);
          showToast({
            type: 'success',
            title: 'Usuario reactivado',
            message: `El usuario ${name} ha sido reactivado correctamente`,
          });
          await fetchUsers(); // Refresh list
        } catch (err) {
          showToast({
            type: 'error',
            title: 'Error al reactivar',
            message: 'No se pudo reactivar el usuario',
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
      variant: 'info',
    });
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Usuario',
      message: `¿ELIMINAR usuario ${name}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await deleteUser(userId);
          showToast({
            type: 'success',
            title: 'Usuario eliminado',
            message: `El usuario ${name} ha sido eliminado correctamente`,
          });
          await fetchUsers(); // Refresh list
        } catch (err) {
          showToast({
            type: 'error',
            title: 'Error al eliminar',
            message: 'No se pudo eliminar el usuario',
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
      variant: 'danger',
    });
  };

  // Calculate stats from real data (memoized)
  const stats = useMemo(
    () => ({
      total: totalUsers,
      active: users.filter((u) => u.status === 'active').length,
      inactive: users.filter((u) => u.status === 'inactive').length,
      suspended: users.filter((u) => u.status === 'suspended').length,
      students: users.filter((u) => u.role === 'student').length,
      teachers: users.filter((u) => u.role === 'admin_teacher').length,
      admins: users.filter((u) => u.role === 'super_admin').length,
    }),
    [users, totalUsers],
  );

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      student: 'bg-blue-100 text-blue-700',
      admin_teacher: 'bg-purple-100 text-purple-700',
      super_admin: 'bg-red-100 text-red-700',
    };

    const roleLabels: Record<string, string> = {
      student: 'Estudiante',
      admin_teacher: 'Profesor',
      super_admin: 'Super Admin',
    };

    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${roleColors[role] || 'bg-gray-100 text-gray-700'}`}
      >
        {roleLabels[role] || role}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> =
      {
        active: { label: 'Activo', color: 'text-green-600', icon: CheckCircle },
        inactive: { label: 'Inactivo', color: 'text-gray-600', icon: XCircle },
        suspended: { label: 'Suspendido', color: 'text-red-600', icon: XCircle },
        banned: { label: 'Baneado', color: 'text-red-700', icon: XCircle },
        pending: { label: 'Pendiente', color: 'text-yellow-600', icon: XCircle },
      };
    const config = statusConfig[status] || {
      label: status,
      color: 'text-gray-600',
      icon: XCircle,
    };
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm">{config.label}</span>
      </span>
    );
  };

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={displayGamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-detective-text">Gestión de Usuarios</h1>
            <FeatureBadge
              variant="under-construction"
              tooltip="CRUD completo de usuarios en desarrollo"
              size="sm"
            />
          </div>
          <p className="mt-1 text-detective-text-secondary">
            Administra usuarios, roles y permisos de la plataforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <p className="mb-1 text-sm text-detective-text-secondary">Total</p>
              <p className="text-2xl font-bold text-detective-text">{stats.total}</p>
            </div>
          </DetectiveCard>
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <p className="mb-1 text-sm text-detective-text-secondary">Activos</p>
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            </div>
          </DetectiveCard>
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <p className="mb-1 text-sm text-detective-text-secondary">Inactivos</p>
              <p className="text-2xl font-bold text-red-500">{stats.inactive}</p>
            </div>
          </DetectiveCard>
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <p className="mb-1 text-sm text-detective-text-secondary">Estudiantes</p>
              <p className="text-2xl font-bold text-blue-500">{stats.students}</p>
            </div>
          </DetectiveCard>
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <p className="mb-1 text-sm text-detective-text-secondary">Profesores</p>
              <p className="text-2xl font-bold text-purple-500">{stats.teachers}</p>
            </div>
          </DetectiveCard>
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <p className="mb-1 text-sm text-detective-text-secondary">Admins</p>
              <p className="text-2xl font-bold text-red-500">{stats.admins}</p>
            </div>
          </DetectiveCard>
        </div>

        {/* Filters and Search */}
        <DetectiveCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-detective-text">Búsqueda y Filtros</h3>
              <FeatureBadge
                variant="coming-soon"
                tooltip="Filtros avanzados por institución, fecha de registro y más"
                size="sm"
              />
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-detective-bg-secondary py-2 pl-10 pr-4 text-detective-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-detective-orange"
                />
              </div>

              {/* Filter by Role */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filters.role?.[0] || 'all'}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      role: e.target.value === 'all' ? undefined : [e.target.value],
                    })
                  }
                  className="rounded-lg border border-gray-600 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
                >
                  <option value="all">Todos los roles</option>
                  <option value="student">Estudiantes</option>
                  <option value="admin_teacher">Profesores</option>
                  <option value="super_admin">Super Admins</option>
                </select>
              </div>

              {/* Filter by Status */}
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-400" />
                <select
                  value={filters.status?.[0] || 'all'}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: e.target.value === 'all' ? undefined : [e.target.value],
                    })
                  }
                  className="rounded-lg border border-gray-600 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>

              {/* Refresh Button */}
              <DetectiveButton variant="secondary" onClick={() => fetchUsers()} disabled={loading}>
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </DetectiveButton>

              {/* Add User Button - US-AE-010 */}
              <DetectiveButton variant="primary" onClick={handleOpenCreateModal}>
                <UserPlus className="h-5 w-5" />
                Nuevo Usuario
              </DetectiveButton>
            </div>
          </div>
        </DetectiveCard>

        {/* Error Message */}
        {error && (
          <DetectiveCard>
            <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500">
              <p className="font-semibold">Error al cargar usuarios:</p>
              <p>{error}</p>
            </div>
          </DetectiveCard>
        )}

        {/* Users Table */}
        <DetectiveCard>
          {loading && users.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
              <p className="mt-4 text-detective-text-secondary">Cargando usuarios...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                        Rol
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                        Institución
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                        Último acceso
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((usr) => (
                      <tr
                        key={usr.id}
                        className="border-b border-gray-700 transition-colors hover:bg-detective-bg-secondary"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-detective-text">
                          {usr.full_name}
                        </td>
                        <td className="flex items-center gap-2 px-4 py-3 text-sm text-detective-text-secondary">
                          <Mail className="h-4 w-4" />
                          {usr.email}
                        </td>
                        <td className="px-4 py-3 text-sm">{getRoleBadge(usr.role)}</td>
                        <td className="px-4 py-3 text-sm">{getStatusBadge(usr.status)}</td>
                        <td className="px-4 py-3 text-sm text-detective-text-secondary">
                          {usr.organizationName || usr.organizationId || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-detective-text-secondary">
                          {(() => {
                            if (!usr.lastLogin || usr.lastLogin === '') return 'Nunca';
                            const date = new Date(usr.lastLogin);
                            return isNaN(date.getTime())
                              ? 'Nunca'
                              : date.toLocaleDateString('es-ES');
                          })()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded p-1 text-blue-400 hover:bg-detective-bg hover:text-blue-300"
                              onClick={() => handleEditUser(usr)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {usr.status === 'active' ? (
                              <button
                                className="rounded p-1 text-red-400 hover:bg-detective-bg hover:text-red-300"
                                onClick={() => handleSuspendUser(usr.id, usr.full_name)}
                                title="Suspender"
                                disabled={loading}
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                className="rounded p-1 text-green-400 hover:bg-detective-bg hover:text-green-300"
                                onClick={() => handleUnsuspendUser(usr.id, usr.full_name)}
                                title="Reactivar"
                                disabled={loading}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              className="rounded p-1 text-red-400 hover:bg-detective-bg hover:text-red-300"
                              onClick={() => handleDeleteUser(usr.id, usr.full_name)}
                              title="Eliminar"
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && !loading && (
                  <div className="py-8 text-center text-detective-text-secondary">
                    No se encontraron usuarios que coincidan con los filtros
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-4">
                  <div className="text-sm text-detective-text-secondary">
                    Página {currentPage} de {totalPages} ({totalUsers} usuarios totales)
                  </div>
                  <div className="flex gap-2">
                    <DetectiveButton
                      variant="secondary"
                      onClick={prevPage}
                      disabled={currentPage === 1 || loading}
                    >
                      Anterior
                    </DetectiveButton>
                    <DetectiveButton
                      variant="secondary"
                      onClick={nextPage}
                      disabled={currentPage === totalPages || loading}
                    >
                      Siguiente
                    </DetectiveButton>
                  </div>
                </div>
              )}
            </>
          )}
        </DetectiveCard>
      </div>

      {/* User Edit Modal */}
      <UserDetailModal
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdate={handleUpdateUser}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} position="top-right" />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />

      {/* Create User Modal - US-AE-010 */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        organizations={organizations}
        isLoadingOrganizations={isLoadingOrganizations}
      />
    </AdminLayout>
  );
}
