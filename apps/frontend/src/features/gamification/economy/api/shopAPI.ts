/**
 * Shop API - Client for shop endpoints
 *
 * API client for the new unified shop system supporting all categories:
 * - cosmetics, profile, premium, consumable
 *
 * Integrates with backend endpoints created by Backend-Agent:
 * - GET /gamification/shop/categories - Get active categories
 * - GET /gamification/shop/items - Get items with filters
 * - GET /gamification/shop/items/:id - Get single item
 * - POST /gamification/shop/purchase - Purchase item
 * - GET /gamification/shop/purchases/:userId - Get user purchases
 * - GET /gamification/shop/owned/:userId/:itemId - Check ownership
 */

import { apiClient } from '@/services/api/apiClient';

// ============================================================================
// TYPES
// ============================================================================

export type ShopItemCategory = 'cosmetics' | 'profile' | 'premium' | 'consumable';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ShopCategory {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon: string;
  color: string;
  display_order: number;
  is_active: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description?: string;
  icon: string;
  image_url?: string;
  category: ShopItemCategory;
  rarity: ItemRarity;
  tags: string[];
  price: number;
  discount_price?: number;
  discount_ends_at?: string;
  is_available: boolean;
  stock?: number;
  max_per_user?: number;
  required_rank?: string;
  required_level?: number;
  is_consumable: boolean;
  duration_days?: number;
  effect_data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UserPurchase {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  price_paid: number;
  status: 'pending' | 'completed' | 'refunded' | 'expired';
  purchased_at: string;
  item?: ShopItem;
}

export interface PurchaseRequest {
  user_id: string;
  item_id: string;
  quantity?: number;
}

export interface PurchaseResponse {
  success: boolean;
  purchase_id: string;
  item: ShopItem;
  price_paid: number;
  new_balance: number;
  message: string;
}

export interface ShopFilters {
  category?: ShopItemCategory;
  rarity?: ItemRarity;
  available?: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all active shop categories
 *
 * @returns List of active shop categories
 *
 * @example
 * const categories = await getShopCategories();
 * // Returns: [{ id: '...', name: 'cosmetics', display_name: 'Cosmetics', ... }]
 */
export const getShopCategories = async (): Promise<ShopCategory[]> => {
  const { data } = await apiClient.get<ShopCategory[]>('/gamification/shop/categories');
  return data;
};

/**
 * Get shop items with optional filters
 *
 * @param filters - Optional filters for category, rarity, availability
 * @returns List of shop items matching filters
 *
 * @example
 * const items = await getShopItems({ category: 'cosmetics', rarity: 'rare' });
 * const allItems = await getShopItems();
 */
export const getShopItems = async (filters?: ShopFilters): Promise<ShopItem[]> => {
  const { data } = await apiClient.get<ShopItem[]>('/gamification/shop/items', {
    params: filters,
  });
  return data;
};

/**
 * Get single shop item by ID
 *
 * @param itemId - Shop item ID
 * @returns Shop item details
 *
 * @example
 * const item = await getShopItemById('item-123');
 */
export const getShopItemById = async (itemId: string): Promise<ShopItem> => {
  const { data } = await apiClient.get<ShopItem>(`/gamification/shop/items/${itemId}`);
  return data;
};

/**
 * Purchase an item from the shop
 *
 * Deducts ML Coins from user balance and adds item to inventory/purchases.
 *
 * @param request - Purchase request with user_id, item_id, quantity
 * @returns Purchase result with new balance and item details
 *
 * @example
 * const result = await purchaseShopItem({
 *   user_id: 'user-123',
 *   item_id: 'item-456',
 *   quantity: 1,
 * });
 * console.log(`New balance: ${result.new_balance}`);
 */
export const purchaseShopItem = async (request: PurchaseRequest): Promise<PurchaseResponse> => {
  const { data } = await apiClient.post<PurchaseResponse>('/gamification/shop/purchase', request);
  return data;
};

/**
 * Get user's purchase history
 *
 * @param userId - User ID
 * @returns List of user purchases
 *
 * @example
 * const purchases = await getUserPurchases('user-123');
 */
export const getUserPurchases = async (userId: string): Promise<UserPurchase[]> => {
  const { data } = await apiClient.get<UserPurchase[]>(`/gamification/shop/purchases/${userId}`);
  return data;
};

/**
 * Check if user owns a specific item
 *
 * @param userId - User ID
 * @param itemId - Item ID to check
 * @returns true if user owns the item, false otherwise
 *
 * @example
 * const owned = await checkItemOwnership('user-123', 'item-456');
 * if (owned) {
 *   console.log('User already owns this item');
 * }
 */
export const checkItemOwnership = async (userId: string, itemId: string): Promise<boolean> => {
  const { data } = await apiClient.get<{ owned: boolean }>(
    `/gamification/shop/owned/${userId}/${itemId}`,
  );
  return data.owned;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate effective price considering discounts
 *
 * @param item - Shop item
 * @returns Effective price (discount_price if active, otherwise regular price)
 */
export const getEffectivePrice = (item: ShopItem): number => {
  if (item.discount_price && item.discount_ends_at) {
    const discountEndDate = new Date(item.discount_ends_at);
    if (discountEndDate > new Date()) {
      return item.discount_price;
    }
  }
  return item.price;
};

/**
 * Check if item has active discount
 *
 * @param item - Shop item
 * @returns true if item has active discount
 */
export const hasActiveDiscount = (item: ShopItem): boolean => {
  if (!item.discount_price || !item.discount_ends_at) return false;
  const discountEndDate = new Date(item.discount_ends_at);
  return discountEndDate > new Date();
};

/**
 * Calculate discount percentage
 *
 * @param item - Shop item
 * @returns Discount percentage (0-100)
 */
export const getDiscountPercentage = (item: ShopItem): number => {
  if (!hasActiveDiscount(item) || !item.discount_price) return 0;
  return Math.round(((item.price - item.discount_price) / item.price) * 100);
};
