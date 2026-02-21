/**
 * useBatchEquipment Hook
 *
 * Fetches equipped cosmetic items for multiple users in a single query.
 * Used by LeaderboardPage, FriendsPage, etc. to render cosmetic avatars
 * without N+1 API calls.
 *
 * @see inventory.api.ts getEquippedItemsBatch
 * @see CosmeticAvatar component
 */

import { useQuery } from '@tanstack/react-query';
import { getEquippedItemsBatch } from '../api/inventory.api';
import type { EquippedItemsBatchMap } from '../types/inventory.types';

export const batchEquipmentKeys = {
  all: ['batch-equipment'] as const,
  batch: (userIds: string[]) => [...batchEquipmentKeys.all, userIds.sort().join(',')] as const,
};

/**
 * Fetch equipped items for a list of user IDs.
 * Returns a map of userId -> { categoryName: itemData }.
 *
 * @param userIds - Array of user UUIDs to fetch equipped items for
 * @param enabled - Optional flag to disable the query (default: true when userIds is non-empty)
 */
export const useBatchEquipment = (
  userIds: string[],
  enabled?: boolean,
): { equippedMap: EquippedItemsBatchMap; isLoading: boolean } => {
  const filteredIds = userIds.filter(Boolean);
  const shouldFetch = enabled !== undefined ? enabled : filteredIds.length > 0;

  const query = useQuery<EquippedItemsBatchMap>({
    queryKey: batchEquipmentKeys.batch(filteredIds),
    queryFn: () => getEquippedItemsBatch(filteredIds),
    enabled: shouldFetch && filteredIds.length > 0,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    equippedMap: query.data ?? {},
    isLoading: query.isLoading,
  };
};
