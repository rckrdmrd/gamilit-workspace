/**
 * Rarity Colors Utility
 *
 * Shared rarity color mappings for shop and inventory items.
 * Replaces duplicated getRarityColor in ShopPage and InventoryPage.
 *
 * @module shared/utils/rarityColors
 */

import type { ItemRarity } from '@/features/gamification/economy/types/economyTypes';

const RARITY_GRADIENTS: Record<ItemRarity, string> = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const RARITY_BADGE_COLORS: Record<ItemRarity, string> = {
  common: 'bg-gray-400',
  rare: 'bg-blue-400',
  epic: 'bg-purple-400',
  legendary: 'bg-yellow-400',
};

const RARITY_LABELS: Record<ItemRarity, string> = {
  common: 'Comun',
  rare: 'Raro',
  epic: 'Epico',
  legendary: 'Legendario',
};

/**
 * Get gradient classes for a rarity level.
 */
export function getRarityGradient(rarity: ItemRarity): string {
  return RARITY_GRADIENTS[rarity] || RARITY_GRADIENTS.common;
}

/**
 * Get badge background class for a rarity level.
 */
export function getRarityBadgeClass(rarity: ItemRarity): string {
  return RARITY_BADGE_COLORS[rarity] || RARITY_BADGE_COLORS.common;
}

/**
 * Get display label for a rarity level.
 */
export function getRarityLabel(rarity: ItemRarity): string {
  return RARITY_LABELS[rarity] || RARITY_LABELS.common;
}
