/**
 * useCreateUserFlow - Encapsulates the create-user modal workflow
 *
 * Manages organization fetching, modal open/close state, and the
 * create user submission with toast notifications.
 */

import { useState, useCallback, useEffect } from 'react';
import { getOrganizations } from '@/services/api/adminAPI';
import type { CreateUserFormData, CreatedUserResult } from '../components/users/CreateUserModal';
import type { CreateUserParams } from './useUserManagement';

interface CreateUserFlowDeps {
  createUser: (data: CreateUserParams) => Promise<CreatedUserResult>;
  showToast: (toast: { type: 'success' | 'error'; title: string; message: string }) => void;
}

export function useCreateUserFlow({ createUser, showToast }: CreateUserFlowDeps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);

  const fetchOrganizations = useCallback(async () => {
    setIsLoadingOrganizations(true);
    try {
      const response = await getOrganizations({ page: 1, limit: 100 });
      setOrganizations(response.items.map((org) => ({ id: org.id, name: org.name })));
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
      showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar las organizaciones' });
    } finally {
      setIsLoadingOrganizations(false);
    }
  }, [showToast]);

  // Fetch organizations on mount
  useEffect(() => { fetchOrganizations(); }, [fetchOrganizations]);

  const openCreateModal = useCallback(async () => {
    setIsCreateModalOpen(true);
    await fetchOrganizations();
  }, [fetchOrganizations]);

  const closeCreateModal = useCallback(() => setIsCreateModalOpen(false), []);

  const handleCreateUser = useCallback(async (data: CreateUserFormData): Promise<CreatedUserResult> => {
    try {
      const result = await createUser(data);
      showToast({ type: 'success', title: 'Usuario creado', message: `El usuario ${result.email} ha sido creado correctamente` });
      return result;
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'Error al crear usuario' });
      throw err;
    }
  }, [createUser, showToast]);

  return {
    isCreateModalOpen,
    organizations,
    isLoadingOrganizations,
    openCreateModal,
    closeCreateModal,
    handleCreateUser,
  };
}
