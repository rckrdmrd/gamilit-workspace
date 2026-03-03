/**
 * useShopPurchase Hook
 *
 * React Query mutation for purchasing shop items.
 * Handles balance validation, API call, and cache invalidation.
 *
 * @module features/gamification/economy/hooks/useShopPurchase
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/AuthContext';
import { useCoins } from './useCoins';
import { useEconomyStore } from '../store/economyStore';
import { useInvalidateDashboard } from '@/shared/hooks/useInvalidateDashboard';
import { purchaseShopItem } from '../api/shopAPI';
import { shopKeys } from './useShopData';
import type { ShopItem } from '../types/economyTypes';

interface UseShopPurchaseReturn {
  purchase: (item: ShopItem) => Promise<void>;
  isPurchasing: boolean;
}

export function useShopPurchase(): UseShopPurchaseReturn {
  const { user } = useAuth();
  const { balance } = useCoins();
  const fetchBalance = useEconomyStore((state) => state.fetchBalance);
  const queryClient = useQueryClient();
  const { syncAndInvalidate } = useInvalidateDashboard();

  const mutation = useMutation({
    mutationFn: async (item: ShopItem) => {
      if (!user?.id) throw new Error('Not authenticated');

      if (balance.current < item.price) {
        throw new Error('Insufficient ML Coins! Complete more exercises to earn coins.');
      }

      return purchaseShopItem({
        user_id: user.id,
        item_id: item.id,
        quantity: 1,
      });
    },
    onSuccess: (response) => {
      // Invalidate shop queries to refresh ownership
      queryClient.invalidateQueries({ queryKey: shopKeys.all });
      // Instantly update balance from purchase response (visual feedback)
      queryClient.invalidateQueries({ queryKey: ['userGamification'] });
      useEconomyStore.getState().updateBalance({ current: response.new_balance });
      // Also fetch full balance (gets lifetime, spent totals)
      fetchBalance();
      syncAndInvalidate();

      toast.success(response.message, { duration: 4000 });
    },
    onError: (error: Error) => {
      const axiosErr = error as unknown as { response?: { data?: { error?: { message?: string; code?: string } } } };
      const code = axiosErr.response?.data?.error?.code;

      if (code === 'INSUFFICIENT_COINS') {
        toast.error('No tienes suficientes ML Coins para esta compra.');
      } else if (code === 'INSUFFICIENT_LEVEL') {
        toast.error('No cumples el nivel requerido para comprar este item.');
      } else if (code === 'INSUFFICIENT_RANK') {
        toast.error('No tienes el rango requerido para comprar este item.');
      } else if (code === 'ITEM_NOT_AVAILABLE') {
        toast.error('Este item no esta disponible actualmente.');
      } else if (code === 'INSUFFICIENT_STOCK') {
        toast.error('Item agotado.');
      } else if (code === 'MAX_PURCHASES_REACHED') {
        toast.error('Has alcanzado el limite de compras para este item.');
      } else if (code === 'CONSUMABLE_PURCHASE_CONFLICT') {
        toast.error('Error procesando la compra. Intenta de nuevo.');
      } else {
        toast.error(axiosErr.response?.data?.error?.message || 'Error al realizar la compra.');
      }
    },
  });

  return {
    purchase: async (item: ShopItem) => {
      await mutation.mutateAsync(item);
    },
    isPurchasing: mutation.isPending,
  };
}
