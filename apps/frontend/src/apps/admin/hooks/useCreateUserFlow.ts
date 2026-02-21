/**
 * useCreateUserFlow - Encapsulates the create-user modal workflow
 *
 * Manages organization fetching, modal open/close state, and the
 * create user submission with toast notifications.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching of organizations.
 *
 * Updated: 2026-02-20 - Migrated to React Query
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrganizations } from '@/services/api/adminAPI';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type { CreateUserFormData, CreatedUserResult } from '../components/users/CreateUserModal';
import type { CreateUserParams } from './useUserManagement';

// ============================================================================
// Query Key Factories
// ============================================================================

const createUserFlowKeys = {
  organizations: () => ['admin', 'create-user-flow', 'organizations'] as const,
};

// ============================================================================
// Types
// ============================================================================

interface CreateUserFlowDeps {
  createUser: (data: CreateUserParams) => Promise<CreatedUserResult>;
  showToast: (toast: { type: 'success' | 'error'; title: string; message: string }) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useCreateUserFlow({ createUser, showToast }: CreateUserFlowDeps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ============================================================================
  // QUERY
  // ============================================================================

  const organizationsQuery = useQuery({
    queryKey: createUserFlowKeys.organizations(),
    queryFn: async () => {
      const response = await getOrganizations({ page: 1, limit: 100 });
      return response.items.map((org) => ({ id: org.id, name: org.name }));
    },
    staleTime: STALE_TIMES.SEMI_STATIC,
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const openCreateModal = useCallback(async () => {
    setIsCreateModalOpen(true);
    // Refresh organizations when modal opens
    await organizationsQuery.refetch();
  }, [organizationsQuery]);

  const closeCreateModal = useCallback(() => setIsCreateModalOpen(false), []);

  const handleCreateUser = useCallback(
    async (data: CreateUserFormData): Promise<CreatedUserResult> => {
      try {
        const result = await createUser(data);
        showToast({
          type: 'success',
          title: 'Usuario creado',
          message: `El usuario ${result.email} ha sido creado correctamente`,
        });
        return result;
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Error',
          message: err instanceof Error ? err.message : 'Error al crear usuario',
        });
        throw err;
      }
    },
    [createUser, showToast],
  );

  // ============================================================================
  // RETURN (unchanged interface)
  // ============================================================================

  return {
    isCreateModalOpen,
    organizations: organizationsQuery.data ?? [],
    isLoadingOrganizations: organizationsQuery.isLoading || organizationsQuery.isFetching,
    openCreateModal,
    closeCreateModal,
    handleCreateUser,
  };
}
