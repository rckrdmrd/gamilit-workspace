import { useState, useEffect, useMemo } from 'react';
import { AdminPageShell } from '../components/shared/AdminPageShell';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeatureBadge, ConfirmDialog } from '@shared/components/common';
import { ToastContainer } from '@shared/components/base/Toast';
import { useUserManagement } from '../hooks/useUserManagement';
import { useUserActions } from '../hooks/useUserActions';
import { useCreateUserFlow } from '../hooks/useCreateUserFlow';
import { UsersStatsGrid } from '../components/users/UsersStatsGrid';
import { UsersTable } from '../components/users/UsersTable';
import { UsersSearchFilters } from '../components/users/UsersSearchFilters';
import { UserDetailModal } from '../components/users/UserDetailModal';
import { CreateUserModal } from '../components/users/CreateUserModal';
import { BulkActionsPanel } from '../components/users/BulkActionsPanel';
import type { SystemUser } from '../types';
import { Users } from 'lucide-react';

/**
 * AdminUsersPage - User management page for the admin portal
 *
 * Refactored: 2026-02-18 - Sprint 1 Admin Portal refactor
 * Extracted: UsersStatsGrid, UsersTable, UsersSearchFilters, UserBadges,
 *            useUserActions, useCreateUserFlow
 */
export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const mgmt = useUserManagement();
  const actions = useUserActions({
    suspendUser: mgmt.suspendUser, unsuspendUser: mgmt.unsuspendUser, deleteUser: mgmt.deleteUser,
    bulkSuspend: mgmt.bulkSuspend, bulkDelete: mgmt.bulkDelete, bulkUpdateRole: mgmt.bulkUpdateRole,
    fetchUsers: mgmt.fetchUsers, users: mgmt.users,
  });
  const create = useCreateUserFlow({ createUser: mgmt.createUser, showToast: actions.showToast });

  // Initial fetch
  useEffect(() => { mgmt.fetchUsers(); }, [mgmt.fetchUsers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  useEffect(() => {
    if (debouncedSearch !== undefined) mgmt.setFilters({ ...mgmt.filters, search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleUpdateUser = async (userId: string, data: Partial<SystemUser>) => {
    try {
      await mgmt.updateUser(userId, { full_name: data.full_name, email: data.email, role: data.role, status: data.status });
      actions.showToast({ type: 'success', title: 'Usuario actualizado', message: 'Los datos del usuario se han actualizado correctamente' });
      setIsEditModalOpen(false); setEditingUser(null);
      await mgmt.fetchUsers();
    } catch (err) {
      actions.showToast({ type: 'error', title: 'Error al actualizar', message: err instanceof Error ? err.message : 'No se pudo actualizar el usuario' });
      throw err;
    }
  };

  const allUsersSelected = useMemo(
    () => mgmt.users.length > 0 && mgmt.users.every((u) => mgmt.selectedUsers.includes(u.id)),
    [mgmt.users, mgmt.selectedUsers],
  );

  const stats = useMemo(() => ({
    total: mgmt.totalUsers,
    active: mgmt.users.filter((u) => u.status === 'active').length,
    inactive: mgmt.users.filter((u) => u.status === 'inactive').length,
    suspended: mgmt.users.filter((u) => u.status === 'suspended').length,
    students: mgmt.users.filter((u) => u.role === 'student').length,
    teachers: mgmt.users.filter((u) => u.role === 'admin_teacher').length,
    admins: mgmt.users.filter((u) => u.role === 'super_admin').length,
  }), [mgmt.users, mgmt.totalUsers]);

  return (
    <AdminPageShell>
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-detective-text">Gestion de Usuarios</h1>
            <FeatureBadge variant="under-construction" tooltip="CRUD completo de usuarios en desarrollo" size="sm" />
          </div>
          <p className="mt-1 text-detective-text-secondary">Administra usuarios, roles y permisos de la plataforma</p>
        </div>

        <UsersStatsGrid stats={stats} />

        <UsersSearchFilters
          searchTerm={searchTerm} onSearchChange={setSearchTerm} filters={mgmt.filters}
          onFiltersChange={mgmt.setFilters} onRefresh={() => mgmt.fetchUsers()} onCreateUser={create.openCreateModal}
          loading={mgmt.loading} organizations={create.organizations} isLoadingOrganizations={create.isLoadingOrganizations}
        />

        <div aria-live="polite">
          {mgmt.error && (
            <DetectiveCard>
              <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500" role="alert">
                <p className="font-semibold">Error al cargar usuarios:</p>
                <p>{mgmt.error}</p>
              </div>
            </DetectiveCard>
          )}
        </div>

        <UsersTable
          users={mgmt.users} loading={mgmt.loading} selectedUsers={mgmt.selectedUsers}
          allUsersSelected={allUsersSelected}
          onSelectAll={mgmt.selectAllUsers} onDeselectAll={mgmt.deselectAllUsers}
          onToggleSelection={mgmt.toggleUserSelection}
          onEdit={(usr) => { setEditingUser(usr); setIsEditModalOpen(true); }}
          onSuspend={actions.handleSuspendUser} onUnsuspend={actions.handleUnsuspendUser}
          onDelete={actions.handleDeleteUser}
          currentPage={mgmt.currentPage} totalPages={mgmt.totalPages} totalUsers={mgmt.totalUsers}
          onPrevPage={mgmt.prevPage} onNextPage={mgmt.nextPage}
        />
      </div>

      <UserDetailModal user={editingUser} isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingUser(null); }} onUpdate={handleUpdateUser} />
      <ToastContainer toasts={actions.toasts} position="top-right" />
      <ConfirmDialog isOpen={actions.confirmDialog.isOpen} onClose={actions.closeConfirmDialog}
        onConfirm={actions.confirmDialog.onConfirm} title={actions.confirmDialog.title}
        message={actions.confirmDialog.message} variant={actions.confirmDialog.variant} />
      <CreateUserModal isOpen={create.isCreateModalOpen} onClose={create.closeCreateModal}
        onSubmit={create.handleCreateUser} organizations={create.organizations}
        isLoadingOrganizations={create.isLoadingOrganizations} />
      <BulkActionsPanel selectedUsers={mgmt.selectedUsers} users={mgmt.users} onClearSelection={mgmt.deselectAllUsers}
        onBulkSuspend={actions.handleBulkSuspend} onBulkActivate={actions.handleBulkActivate}
        onBulkChangeRole={actions.handleBulkChangeRole} onBulkDelete={actions.handleBulkDelete}
        onExportCSV={actions.handleExportCSV} />
    </AdminPageShell>
  );
}
