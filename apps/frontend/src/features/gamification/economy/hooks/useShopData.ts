/**
 * useShopData Hook
 *
 * React Query hook for fetching shop items, categories, and user purchases.
 * Replaces useState + useEffect data fetching in ShopPage.
 *
 * @module features/gamification/economy/hooks/useShopData
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import {
  getShopCategories,
  getShopItems,
  getUserPurchases,
  type ShopCategory as ApiShopCategory,
  type ShopItemCategory,
  type ShopItem as ApiShopItem,
} from '../api/shopAPI';
import type { ShopItem, ShopCategory, ItemRarity } from '../types/economyTypes';

// ============================================================================
// Query Keys
// ============================================================================

export const shopKeys = {
  all: ['shop'] as const,
  categories: () => [...shopKeys.all, 'categories'] as const,
  items: (category?: string) => [...shopKeys.all, 'items', category ?? 'all'] as const,
  purchases: (userId: string) => [...shopKeys.all, 'purchases', userId] as const,
};

// ============================================================================
// Transform
// ============================================================================

function transformApiItems(
  items: ApiShopItem[],
  ownedItemIds: Set<string>,
): ShopItem[] {
  return items.map((item) => {
    const isOwned = ownedItemIds.has(item.id);
    const isAvailable = item.is_available !== false;
    const hasStock = item.stock === null || item.stock === undefined || item.stock > 0;
    const isPurchasable = isAvailable && hasStock && !isOwned;

    return {
      id: item.id,
      name: item.name,
      description: item.description || '',
      category: item.category as ShopCategory,
      price: item.discount_price || item.price,
      icon: item.icon,
      rarity: item.rarity as ItemRarity,
      tags: item.tags || [],
      isOwned,
      isPurchasable,
      metadata: {
        effectDescription:
          typeof item.effect_data?.description === 'string'
            ? item.effect_data.description
            : undefined,
        duration: item.duration_days,
        stackable: !item.is_consumable,
        tradeable: false,
      },
    };
  });
}

// ============================================================================
// Hook
// ============================================================================

interface UseShopDataReturn {
  shopItems: ShopItem[];
  apiCategories: ApiShopCategory[];
  isLoading: boolean;
  error: Error | null;
}

export function useShopData(selectedCategory: ShopCategory | 'all'): UseShopDataReturn {
  const { user } = useAuth();
  const userId = user?.id;

  // Fetch categories
  const { data: apiCategories = [] } = useQuery({
    queryKey: shopKeys.categories(),
    queryFn: getShopCategories,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch items (re-fetches when category changes)
  const categoryFilter =
    selectedCategory !== 'all' ? { category: selectedCategory as ShopItemCategory } : undefined;

  const {
    data: rawItems = [],
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery({
    queryKey: shopKeys.items(selectedCategory),
    queryFn: () => getShopItems(categoryFilter),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch user purchases for ownership check
  const { data: purchases = [] } = useQuery({
    queryKey: shopKeys.purchases(userId || ''),
    queryFn: () => getUserPurchases(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  // Transform items with ownership info
  const shopItems = useMemo(() => {
    const ownedIds = new Set(
      purchases.filter((p) => p.status === 'completed').map((p) => p.item_id),
    );
    return transformApiItems(rawItems, ownedIds);
  }, [rawItems, purchases]);

  return {
    shopItems,
    apiCategories,
    isLoading: isLoadingItems,
    error: itemsError,
  };
}
