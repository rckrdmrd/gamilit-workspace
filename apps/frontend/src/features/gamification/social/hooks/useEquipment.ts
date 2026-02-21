/**
 * useEquipment Hook - Equipment Management (React Query)
 *
 * Custom hook for managing cosmetic item equipment using react-query.
 * Replaces the legacy useInventory hook (useState/useEffect pattern).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  getEquippedItems,
  equipItem,
  unequipItem,
} from '../api/inventory.api';
import { EquippedItem, EquipItemPayload } from '../types/inventory.types';
import { useAuth } from '@/app/providers/AuthContext';
import { extractApiErrorMessage } from '@shared/utils/error.util';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const equipmentKeys = {
  all: ['equipment'] as const,
  equipped: (userId: string) => [...equipmentKeys.all, 'equipped', userId] as const,
};

// ============================================================================
// HOOK
// ============================================================================

export const useEquipment = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  // --- Query: fetch equipped items ---
  const equippedQuery = useQuery<EquippedItem[]>({
    queryKey: equipmentKeys.equipped(user?.id || ''),
    queryFn: () => getEquippedItems(),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // --- Mutation: equip item ---
  const equipMutation = useMutation({
    mutationFn: (payload: EquipItemPayload) => equipItem(payload),
    onSuccess: async () => {
      toast.success('Item equipado correctamente');
      // Invalidate equipped items cache
      if (user?.id) {
        await queryClient.invalidateQueries({
          queryKey: equipmentKeys.equipped(user.id),
        });
      }
      // Refresh global user profile (avatar changes)
      if (refreshUser) {
        await refreshUser();
      }
    },
    onError: (error: Error) => {
      console.error('Error equipping item:', error);
      toast.error(extractApiErrorMessage(error, 'Error al equipar item'));
    },
  });

  // --- Mutation: unequip item ---
  const unequipMutation = useMutation({
    mutationFn: (payload: EquipItemPayload) => unequipItem(payload),
    onSuccess: async () => {
      toast.success('Item desequipado');
      if (user?.id) {
        await queryClient.invalidateQueries({
          queryKey: equipmentKeys.equipped(user.id),
        });
      }
      if (refreshUser) {
        await refreshUser();
      }
    },
    onError: (error: Error) => {
      console.error('Error unequipping item:', error);
      toast.error(extractApiErrorMessage(error, 'Error al desequipar item'));
    },
  });

  // --- Helper: check if specific item is equipped ---
  const isEquipped = (itemId: string): boolean => {
    return (equippedQuery.data ?? []).some((equipped) => equipped.item_id === itemId);
  };

  // Return shape matches the legacy useInventory hook for backwards compatibility
  return {
    equippedItems: equippedQuery.data ?? [],
    isLoading: equippedQuery.isLoading,
    isActionLoading: equipMutation.isPending || unequipMutation.isPending,
    equipItem: equipMutation.mutateAsync,
    unequipItem: unequipMutation.mutateAsync,
    isEquipped,
    refresh: equippedQuery.refetch,
  };
};

// Re-export centralized visual extraction hook
export { useEquippedVisuals } from './useEquippedVisuals';
export type { EquippedVisuals } from './useEquippedVisuals';
