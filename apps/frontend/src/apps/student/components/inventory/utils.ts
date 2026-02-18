/**
 * Inventory utility functions.
 *
 * @module apps/student/components/inventory/utils
 */

import type { ShopItem } from '@/features/gamification/economy/types/economyTypes';
import type { PowerUp } from '@/features/gamification/social/types/powerUpsTypes';

/**
 * Type guard: checks if an inventory item is a PowerUp (vs ShopItem).
 */
export function isPowerUp(item: ShopItem | PowerUp): item is PowerUp {
  return 'type' in item && 'effect' in item && !('category' in item);
}

/**
 * Format seconds into a human-readable time string.
 */
export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
