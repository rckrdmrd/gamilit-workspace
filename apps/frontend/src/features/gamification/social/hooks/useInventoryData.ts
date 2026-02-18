/**
 * useInventoryData Hook
 *
 * React Query hook for fetching the user's full inventory:
 * cosmetic items (purchases), power-ups, and active power-ups.
 *
 * @module features/gamification/social/hooks/useInventoryData
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/providers/AuthContext';
import {
  getPowerUpInventory,
  getActivePowerUps,
} from '@/features/gamification/social/api/socialAPI';
import { getPurchasedItems } from '@/features/gamification/social/api/inventory.api';
import type { ShopItem } from '@/features/gamification/economy/types/economyTypes';
import type { PowerUp, PowerUpEffect, ActivePowerUp, PowerUpInventory } from '@/features/gamification/social/types/powerUpsTypes';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const inventoryKeys = {
  all: ['inventory'] as const,
  items: (userId: string) => [...inventoryKeys.all, 'items', userId] as const,
  active: () => [...inventoryKeys.all, 'active'] as const,
};

// ============================================================================
// TRANSFORMS
// ============================================================================

interface PurchaseRecord {
  item?: {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    category: string;
    rarity: string;
    is_available: boolean;
    is_consumable?: boolean;
    stock?: number;
    metadata?: Record<string, unknown>;
  };
}

interface OwnedPowerUp {
  id?: string;
  powerUpId?: string;
  name: string;
  description: string;
  type?: string;
  price?: number;
  icon?: string;
  effect: { type: string; value: number; description: string };
  duration?: number;
  quantity?: number;
  usageCount?: number;
}

function transformPowerUps(owned: OwnedPowerUp[]): PowerUp[] {
  return owned.map((item) => ({
    id: item.id || item.powerUpId || '',
    name: item.name,
    description: item.description,
    type: (item.type as PowerUp['type']) || 'core',
    price: item.price || 0,
    icon: item.icon || '\u26A1',
    effect: {
      type: item.effect.type as PowerUpEffect['type'],
      value: item.effect.value,
      description: item.effect.description,
    },
    duration: item.duration,
    status: 'available' as const,
    owned: true,
    quantity: item.quantity || 1,
    usageCount: item.usageCount || 0,
  }));
}

function transformCosmetics(purchases: PurchaseRecord[]): ShopItem[] {
  return purchases
    .filter((p) => p.item && !p.item.is_consumable)
    .map((p) => ({
      id: p.item!.id,
      name: p.item!.name,
      description: p.item!.description,
      price: p.item!.price,
      icon: p.item!.icon,
      category: p.item!.category as ShopItem['category'],
      rarity: p.item!.rarity as ShopItem['rarity'],
      is_available: p.item!.is_available,
      stock: p.item!.stock,
      metadata: p.item!.metadata,
    }));
}

// ============================================================================
// HOOK
// ============================================================================

interface UseInventoryDataReturn {
  cosmeticItems: ShopItem[];
  powerUps: PowerUp[];
  activePowerUps: ActivePowerUp[];
  allItems: (ShopItem | PowerUp)[];
  isLoading: boolean;
  isLoadingActive: boolean;
  error: Error | null;
  refetch: () => void;
  invalidateAll: () => void;
}

export function useInventoryData(): UseInventoryDataReturn {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  // Fetch inventory items (power-ups + cosmetics)
  const inventoryQuery = useQuery({
    queryKey: inventoryKeys.items(userId || ''),
    queryFn: async (): Promise<{ cosmetics: ShopItem[]; powerUps: PowerUp[] }> => {
      if (!userId) return { cosmetics: [], powerUps: [] };

      const [powerUpData, purchases] = await Promise.all([
        getPowerUpInventory(userId) as Promise<PowerUpInventory>,
        getPurchasedItems(userId) as Promise<PurchaseRecord[]>,
      ]);

      return {
        powerUps: transformPowerUps(powerUpData.owned || []),
        cosmetics: transformCosmetics(purchases || []),
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });

  // Fetch active power-ups (separate query, independent refresh)
  const activeQuery = useQuery({
    queryKey: inventoryKeys.active(),
    queryFn: async () => {
      const active = await getActivePowerUps();
      return active || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30s — active power-ups change more frequently
  });

  const cosmeticItems = inventoryQuery.data?.cosmetics ?? [];
  const powerUps = inventoryQuery.data?.powerUps ?? [];
  const activePowerUps = activeQuery.data ?? [];
  const allItems: (ShopItem | PowerUp)[] = [...cosmeticItems, ...powerUps];

  const invalidateAll = () => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items(userId) });
    }
    queryClient.invalidateQueries({ queryKey: inventoryKeys.active() });
  };

  return {
    cosmeticItems,
    powerUps,
    activePowerUps,
    allItems,
    isLoading: inventoryQuery.isLoading,
    isLoadingActive: activeQuery.isLoading,
    error: inventoryQuery.error,
    refetch: () => {
      inventoryQuery.refetch();
      activeQuery.refetch();
    },
    invalidateAll,
  };
}
