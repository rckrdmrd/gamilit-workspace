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
    metadata: Record<string, any>;
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

export interface EquippedItemsMap {
  [categoryName: string]: {
    itemId: string;
    name: string;
    assetUrl?: string;
    type?: string;
    data?: any;
  };
}
