/**
 * useActivatePowerUp Hook
 *
 * React Query mutation for activating/using a power-up from inventory.
 * Handles the comodinType mapping (ARCH-015) and cache invalidation.
 *
 * @module features/gamification/social/hooks/useActivatePowerUp
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/AuthContext';
import { activatePowerUp } from '@/features/gamification/social/api/socialAPI';
import { inventoryKeys } from './useInventoryData';
import type { PowerUp } from '@/features/gamification/social/types/powerUpsTypes';

// ARCH-015: Map power-up IDs to backend comodin_type values
const COMODIN_TYPE_MAP: Record<string, string> = {
  pistas: 'pistas',
  hints: 'pistas',
  vision_lectora: 'vision_lectora',
  'reading-vision': 'vision_lectora',
  segunda_oportunidad: 'segunda_oportunidad',
  'second-chance': 'segunda_oportunidad',
};

interface UseActivatePowerUpReturn {
  activate: (powerUp: PowerUp) => Promise<void>;
  isActivating: boolean;
}

export function useActivatePowerUp(): UseActivatePowerUpReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (powerUp: PowerUp) => {
      if (!user?.id) throw new Error('Not authenticated');

      const comodinType = COMODIN_TYPE_MAP[powerUp.id] || powerUp.id;
      return activatePowerUp(user.id, comodinType);
    },
    onSuccess: (_result, powerUp) => {
      // Invalidate both inventory and active queries
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: inventoryKeys.items(user.id) });
      }
      queryClient.invalidateQueries({ queryKey: inventoryKeys.active() });

      toast.success(`${powerUp.name} activated!`, {
        icon: '\u26A1',
        duration: 4000,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate power-up. Please try again.');
    },
  });

  return {
    activate: async (powerUp: PowerUp) => {
      await mutation.mutateAsync(powerUp);
    },
    isActivating: mutation.isPending,
  };
}
