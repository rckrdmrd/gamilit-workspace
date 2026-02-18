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
      // Refresh balance
      fetchBalance();
      syncAndInvalidate();

      toast.success(response.message, { duration: 4000 });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Purchase failed. Please try again.');
    },
  });

  return {
    purchase: async (item: ShopItem) => {
      await mutation.mutateAsync(item);
    },
    isPurchasing: mutation.isPending,
  };
}
