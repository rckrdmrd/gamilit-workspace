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
  purchaseQuantityMap: Map<string, number>,
): ShopItem[] {
  return items.map((item) => {
    // Consumable items are never "owned" — they can be re-purchased
    const isOwned = item.is_consumable ? false : ownedItemIds.has(item.id);
    const isAvailable = item.is_available !== false;
    const hasStock = item.stock === null || item.stock === undefined || item.stock > 0;
    const isPurchasable = isAvailable && hasStock && !isOwned;

    // Preserve all visual metadata from API (merged by backend's mergeVisualConfig)
    const rawMetadata = (item.metadata ?? {}) as Record<string, unknown>;

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
      ownedQuantity: item.is_consumable ? (purchaseQuantityMap.get(item.id) ?? 0) : undefined,
      isPurchasable,
      metadata: {
        ...rawMetadata,
        effectDescription:
          typeof item.effect_data?.description === 'string'
            ? item.effect_data.description
            : (rawMetadata.effectDescription as string | undefined),
        duration: item.duration_days,
        stackable: !item.is_consumable,
        tradeable: false,
      },
      requirements:
        item.required_level != null || item.required_rank != null
          ? { level: item.required_level ?? undefined, rank: item.required_rank ?? undefined }
          : undefined,
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
    const ownedIds = new Set<string>();
    const purchaseQuantityMap = new Map<string, number>();
    for (const p of purchases) {
      if (p.status !== 'completed') continue;
      ownedIds.add(p.item_id);
      purchaseQuantityMap.set(p.item_id, (purchaseQuantityMap.get(p.item_id) ?? 0) + (p.quantity ?? 1));
    }
    return transformApiItems(rawItems, ownedIds, purchaseQuantityMap);
  }, [rawItems, purchases]);

  return {
    shopItems,
    apiCategories,
    isLoading: isLoadingItems,
    error: itemsError,
  };
}
