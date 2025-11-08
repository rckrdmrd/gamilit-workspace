/**
 * Economy API Integration
 *
 * API client for ML Coins economy endpoints including balance management,
 * transactions, shop, purchases, and inventory.
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS, FEATURE_FLAGS } from '@/services/api/apiConfig';
import { handleAPIError } from '@/services/api/apiErrorHandler';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/services/api/apiTypes';
import type {
  MLCoinsBalance,
  Transaction,
  TransactionFilters,
  ShopItem,
  ShopFilters,
  ShopSortBy,
  CartItem,
  PurchaseResult,
  UserInventory,
  EconomyStats,
  EarningSource,
} from '../types/economyTypes';

// ============================================================================
// MOCK DATA (for development)
// ============================================================================

/**
 * Mock get balance
 */
const mockGetBalance = async (): Promise<MLCoinsBalance> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    current: 250,
    lifetime: 1000,
    spent: 750,
    pending: 0,
  };
};

/**
 * Mock earn coins
 */
const mockEarnCoins = async (
  amount: number,
  source: EarningSource | string
): Promise<Transaction> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const newBalance = 250 + amount;

  return {
    id: crypto.randomUUID(),
    type: 'earn',
    amount,
    source,
    description: `Earned ${amount} ML from ${source}`,
    timestamp: new Date(),
    balanceAfter: newBalance,
  };
};

// ============================================================================
// BALANCE & COINS API FUNCTIONS
// ============================================================================

/**
 * Get ML Coins balance
 *
 * @returns Current balance information
 */
export const getBalance = async (): Promise<MLCoinsBalance> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      return await mockGetBalance();
    }

    const { data } = await apiClient.get<ApiResponse<MLCoinsBalance>>(
      API_ENDPOINTS.economy.balance
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Earn ML Coins
 *
 * @param amount - Amount to earn
 * @param source - Source of earnings
 * @param description - Optional description
 * @param metadata - Optional metadata
 * @returns Transaction record
 */
export const earnCoins = async (
  amount: number,
  source: EarningSource | string,
  description?: string,
  metadata?: Record<string, unknown>
): Promise<Transaction> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      return await mockEarnCoins(amount, source);
    }

    const { data } = await apiClient.post<ApiResponse<Transaction>>(
      API_ENDPOINTS.economy.earn,
      {
        amount,
        source,
        description,
        metadata,
      }
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Spend ML Coins
 *
 * @param amount - Amount to spend
 * @param itemName - Name of item/service
 * @param itemId - Optional item ID
 * @param metadata - Optional metadata
 * @returns Transaction record
 */
export const spendCoins = async (
  amount: number,
  itemName: string,
  itemId?: string,
  metadata?: Record<string, unknown>
): Promise<Transaction> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newBalance = 250 - amount;

      return {
        id: crypto.randomUUID(),
        type: 'spend',
        amount: -amount,
        source: 'shop',
        description: `Purchased ${itemName}`,
        timestamp: new Date(),
        balanceAfter: newBalance,
        metadata: itemId ? { itemId } : undefined,
      };
    }

    const { data } = await apiClient.post<ApiResponse<Transaction>>(
      API_ENDPOINTS.economy.spend,
      {
        amount,
        itemName,
        itemId,
        metadata,
      }
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// TRANSACTION HISTORY API FUNCTIONS
// ============================================================================

/**
 * Get transaction history
 *
 * @param pagination - Pagination parameters
 * @param filters - Transaction filters
 * @returns Paginated transaction list
 */
export const getTransactions = async (
  pagination?: PaginationParams,
  filters?: TransactionFilters
): Promise<PaginatedResponse<Transaction>> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      };
    }

    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>(
      API_ENDPOINTS.economy.transactions,
      {
        params: {
          ...pagination,
          ...filters,
        },
      }
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get single transaction by ID
 *
 * @param transactionId - Transaction ID
 * @returns Transaction record
 */
export const getTransaction = async (transactionId: string): Promise<Transaction> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        id: transactionId,
        type: 'earn',
        amount: 20,
        source: 'exercise_completion',
        description: 'Completed Detective Textual',
        timestamp: new Date(),
        balanceAfter: 270,
      };
    }

    const { data } = await apiClient.get<ApiResponse<Transaction>>(
      API_ENDPOINTS.economy.transaction(transactionId)
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// SHOP API FUNCTIONS
// ============================================================================

/**
 * Get shop items
 *
 * @param filters - Shop filters
 * @param sortBy - Sort option
 * @param pagination - Pagination parameters
 * @returns Paginated shop items
 */
export const getShopItems = async (
  filters?: ShopFilters,
  sortBy?: ShopSortBy,
  pagination?: PaginationParams
): Promise<PaginatedResponse<ShopItem>> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      };
    }

    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ShopItem>>>(
      API_ENDPOINTS.economy.shopItems,
      {
        params: {
          ...filters,
          sortBy,
          ...pagination,
        },
      }
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get single shop item by ID
 *
 * @param itemId - Item ID
 * @returns Shop item
 */
export const getShopItem = async (itemId: string): Promise<ShopItem> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        id: itemId,
        name: 'Detective Hat',
        description: 'Classic detective hat for your avatar',
        category: 'cosmetics',
        price: 100,
        icon: '🎩',
        rarity: 'rare',
        tags: ['avatar', 'hat', 'detective'],
        isOwned: false,
        isPurchasable: true,
      };
    }

    const { data } = await apiClient.get<ApiResponse<ShopItem>>(
      API_ENDPOINTS.economy.shopItem(itemId)
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// PURCHASE API FUNCTIONS
// ============================================================================

/**
 * Purchase single item
 *
 * @param itemId - Item ID to purchase
 * @param quantity - Quantity (for stackable items)
 * @returns Purchase result
 */
export const purchaseItem = async (
  itemId: string,
  quantity: number = 1
): Promise<PurchaseResult> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        transactionId: crypto.randomUUID(),
        newBalance: 150,
        itemsAcquired: [],
      };
    }

    const { data } = await apiClient.post<ApiResponse<PurchaseResult>>(
      API_ENDPOINTS.economy.purchase,
      {
        itemId,
        quantity,
      }
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Purchase multiple items from cart
 *
 * @param items - Cart items to purchase
 * @returns Purchase result
 */
export const purchaseCart = async (items: CartItem[]): Promise<PurchaseResult> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const totalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return {
        success: true,
        transactionId: crypto.randomUUID(),
        newBalance: 250 - totalCost,
        itemsAcquired: items,
      };
    }

    const { data } = await apiClient.post<ApiResponse<PurchaseResult>>(
      API_ENDPOINTS.economy.purchaseCart,
      {
        items: items.map((item) => ({
          itemId: item.id,
          quantity: item.quantity,
        })),
      }
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// INVENTORY API FUNCTIONS
// ============================================================================

/**
 * Get user inventory
 *
 * @returns User inventory with owned items
 */
export const getInventory = async (): Promise<UserInventory> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        items: [],
        totalValue: 0,
        lastUpdated: new Date(),
      };
    }

    const { data } = await apiClient.get<ApiResponse<UserInventory>>(
      API_ENDPOINTS.economy.inventory
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Remove item from inventory
 *
 * @param itemId - Item ID to remove
 * @returns Success status
 */
export const removeFromInventory = async (itemId: string): Promise<void> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    await apiClient.delete(API_ENDPOINTS.economy.inventoryItem(itemId));
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// STATISTICS API FUNCTIONS
// ============================================================================

/**
 * Get economy statistics
 *
 * @returns Economy statistics summary
 */
export const getEconomyStats = async (): Promise<EconomyStats> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        totalEarned: 1000,
        totalSpent: 750,
        currentBalance: 250,
        netWorth: 250,
        transactionCount: 45,
        favoriteCategory: 'cosmetics',
        biggestPurchase: {
          item: 'Premium Theme Pack',
          amount: 200,
          date: new Date(),
        },
        topEarningSource: {
          source: 'exercise_completion',
          amount: 600,
        },
      };
    }

    const { data } = await apiClient.get<ApiResponse<EconomyStats>>(
      '/gamification/economy/stats'
    );

    return data.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getBalance,
  earnCoins,
  spendCoins,
  getTransactions,
  getTransaction,
  getShopItems,
  getShopItem,
  purchaseItem,
  purchaseCart,
  getInventory,
  removeFromInventory,
  getEconomyStats,
};
