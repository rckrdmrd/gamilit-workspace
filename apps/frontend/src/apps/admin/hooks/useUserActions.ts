/**
 * useUserActions - Centralized user action handlers with confirmation dialogs
 *
 * Extracts the repetitive confirm-dialog + try/catch/showToast patterns
 * from AdminUsersPage into a reusable hook. Covers:
 * - Single-user actions: suspend, unsuspend, delete (with confirmation dialog)
 * - Bulk actions: suspend, activate, change role, delete
 * - CSV export using the shared downloadCSV utility
 */

import { useState, useCallback } from 'react';
import { useToast, type ToastProps } from '@shared/components/base/Toast';
import { downloadCSV } from '@shared/utils/downloadCSV';
import type { SystemUser, BulkActionResult } from '../types';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  variant: 'danger' | 'warning' | 'info';
}

const CLOSED_DIALOG: ConfirmDialogState = {
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
  variant: 'info',
};

interface UserActionDeps {
  suspendUser: (userId: string) => Promise<void>;
  unsuspendUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  bulkSuspend: (userIds: string[]) => Promise<BulkActionResult>;
  bulkDelete: (userIds: string[]) => Promise<BulkActionResult>;
  bulkUpdateRole: (userIds: string[], role: string) => Promise<BulkActionResult>;
  fetchUsers: () => Promise<void>;
  users: SystemUser[];
}

export interface UseUserActionsResult {
  toasts: ToastProps[];
  showToast: ReturnType<typeof useToast>['showToast'];
  confirmDialog: ConfirmDialogState;
  closeConfirmDialog: () => void;
  handleSuspendUser: (userId: string, name: string) => void;
  handleUnsuspendUser: (userId: string, name: string) => void;
  handleDeleteUser: (userId: string, name: string) => void;
  handleBulkSuspend: (userIds: string[]) => Promise<void>;
  handleBulkActivate: (userIds: string[]) => Promise<void>;
  handleBulkChangeRole: (userIds: string[], role: string) => Promise<void>;
  handleBulkDelete: (userIds: string[]) => Promise<void>;
  handleExportCSV: (userIds: string[]) => void;
}

export function useUserActions(deps: UserActionDeps): UseUserActionsResult {
  const { toasts, showToast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(CLOSED_DIALOG);

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // -- Generic confirm-and-execute pattern for single-user actions --
  const confirmAction = useCallback(
    (
      title: string,
      message: string,
      variant: ConfirmDialogState['variant'],
      action: () => Promise<void>,
      successTitle: string,
      successMessage: string,
      errorTitle: string,
      errorMessage: string,
    ) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        variant,
        onConfirm: async () => {
          try {
            await action();
            showToast({ type: 'success', title: successTitle, message: successMessage });
            await deps.fetchUsers();
          } catch (_err) {
            showToast({ type: 'error', title: errorTitle, message: errorMessage });
          } finally {
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          }
        },
      });
    },
    [deps, showToast],
  );

  const handleSuspendUser = useCallback(
    (userId: string, name: string) => {
      confirmAction(
        'Suspender Usuario',
        `\u00bfEst\u00e1s seguro de suspender a ${name}?`,
        'warning',
        () => deps.suspendUser(userId),
        'Usuario suspendido',
        `El usuario ${name} ha sido suspendido correctamente`,
        'Error al suspender',
        'No se pudo suspender el usuario',
      );
    },
    [confirmAction, deps],
  );

  const handleUnsuspendUser = useCallback(
    (userId: string, name: string) => {
      confirmAction(
        'Reactivar Usuario',
        `\u00bfEst\u00e1s seguro de reactivar a ${name}?`,
        'info',
        () => deps.unsuspendUser(userId),
        'Usuario reactivado',
        `El usuario ${name} ha sido reactivado correctamente`,
        'Error al reactivar',
        'No se pudo reactivar el usuario',
      );
    },
    [confirmAction, deps],
  );

  const handleDeleteUser = useCallback(
    (userId: string, name: string) => {
      confirmAction(
        'Eliminar Usuario',
        `\u00bfELIMINAR usuario ${name}? Esta acci\u00f3n no se puede deshacer.`,
        'danger',
        () => deps.deleteUser(userId),
        'Usuario eliminado',
        `El usuario ${name} ha sido eliminado correctamente`,
        'Error al eliminar',
        'No se pudo eliminar el usuario',
      );
    },
    [confirmAction, deps],
  );

  // -- Bulk operations --
  const handleBulkSuspend = useCallback(
    async (userIds: string[]) => {
      try {
        const result = await deps.bulkSuspend(userIds);
        showToast({
          type: 'success',
          title: 'Usuarios suspendidos',
          message: `${result.successful} usuarios suspendidos correctamente`,
        });
        await deps.fetchUsers();
      } catch (_err) {
        showToast({ type: 'error', title: 'Error', message: 'No se pudieron suspender los usuarios' });
        throw _err;
      }
    },
    [deps, showToast],
  );

  const handleBulkActivate = useCallback(
    async (userIds: string[]) => {
      try {
        await Promise.all(userIds.map((id) => deps.unsuspendUser(id)));
        showToast({
          type: 'success',
          title: 'Usuarios activados',
          message: `${userIds.length} usuarios activados correctamente`,
        });
        await deps.fetchUsers();
      } catch (_err) {
        showToast({ type: 'error', title: 'Error', message: 'No se pudieron activar los usuarios' });
        throw _err;
      }
    },
    [deps, showToast],
  );

  const handleBulkChangeRole = useCallback(
    async (userIds: string[], role: string) => {
      try {
        const result = await deps.bulkUpdateRole(userIds, role);
        showToast({
          type: 'success',
          title: 'Roles actualizados',
          message: `${result.successful} usuarios actualizados correctamente`,
        });
        await deps.fetchUsers();
      } catch (_err) {
        showToast({ type: 'error', title: 'Error', message: 'No se pudieron actualizar los roles' });
        throw _err;
      }
    },
    [deps, showToast],
  );

  const handleBulkDelete = useCallback(
    async (userIds: string[]) => {
      try {
        const result = await deps.bulkDelete(userIds);
        showToast({
          type: 'success',
          title: 'Usuarios eliminados',
          message: `${result.successful} usuarios eliminados correctamente`,
        });
        await deps.fetchUsers();
      } catch (_err) {
        showToast({ type: 'error', title: 'Error', message: 'No se pudieron eliminar los usuarios' });
        throw _err;
      }
    },
    [deps, showToast],
  );

  // -- CSV export using shared utility --
  const handleExportCSV = useCallback(
    (userIds: string[]) => {
      const selectedUserObjects = deps.users.filter((u) => userIds.includes(u.id));
      if (selectedUserObjects.length === 0) return;

      const csvData = selectedUserObjects.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        role: u.role,
        status: u.status,
        organization: u.organizationName || 'N/A',
        lastLogin: u.lastLogin || 'Nunca',
      }));

      downloadCSV(
        csvData,
        {
          id: 'ID',
          full_name: 'Nombre',
          email: 'Email',
          role: 'Rol',
          status: 'Estado',
          organization: 'Organizacion',
          lastLogin: 'Ultimo Acceso',
        },
        'usuarios',
      );

      showToast({
        type: 'success',
        title: 'Exportacion completada',
        message: `${selectedUserObjects.length} usuarios exportados a CSV`,
      });
    },
    [deps.users, showToast],
  );

  return {
    toasts,
    showToast,
    confirmDialog,
    closeConfirmDialog,
    handleSuspendUser,
    handleUnsuspendUser,
    handleDeleteUser,
    handleBulkSuspend,
    handleBulkActivate,
    handleBulkChangeRole,
    handleBulkDelete,
    handleExportCSV,
  };
}
