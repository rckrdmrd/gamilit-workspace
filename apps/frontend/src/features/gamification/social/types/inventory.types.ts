/**
 * Tipos para el sistema de Inventario y Skins
 */

export interface EquippedItem {
  id: string; // UUID de user_equipped_item
  user_id: string;
  category_id: string;
  item_id: string;
  equipped_at: string;
  item: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: string; // 'common' | 'rare' | 'epic' | 'legendary'
    metadata: Record<string, unknown>;
    effect_data?: Record<string, unknown>;
  };
  category: {
    id: string;
    name: string; // 'avatar', 'frame', 'background'
    display_name: string;
  };
}

export interface EquipItemPayload {
  itemId: string;
}

/** Batch response: userId -> categoryName -> item data */
export type EquippedItemsBatchMap = Record<
  string,
  Record<string, { itemId: string; name: string; assetUrl?: string; type?: string; data: Record<string, unknown> }>
>;

export interface EquippedItemsMap {
  [categoryName: string]: {
    itemId: string;
    name: string;
    assetUrl?: string;
    type?: string;
    data?: Record<string, unknown>;
  };
}
