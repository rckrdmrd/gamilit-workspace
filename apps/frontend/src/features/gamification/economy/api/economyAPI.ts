/**
 * Economy API Integration
 *
 * API client for ML Coins economy endpoints including balance management,
 * transactions, shop, purchases, and inventory.
 *
 * IMPORTANT: User ID Requirements
 * ================================
 * Some functions in this API require a userId parameter. This should be obtained
 * from the useAuth() hook in your component:
 *
 * @example
 * ```typescript
 * import { useAuth } from '@/shared/hooks/useAuth';
 * import { getBalance, earnCoins } from './economyAPI';
 *
 * function MyComponent() {
 *   const { user } = useAuth();
 *
 *   useEffect(() => {
 *     if (user?.id) {
 *       getBalance(user.id).then(balance => {
 *         // Handle balance
 *       });
 *     }
 *   }, [user]);
 * }
 * ```
 *
 * Functions that require userId:
 * - getBalance(userId)
 * - earnCoins(amount, source, description?, metadata?, userId)
 * - spendCoins(amount, itemName, itemId?, metadata?, userId)
 * - getTransactions(pagination?, filters?, userId)
 *
 * Functions that DON'T require userId (use JWT):
 * - getInventory() - uses current authenticated user
 * - purchaseItem() - uses current authenticated user
 * - getEconomyStats() - uses current authenticated user
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS, FEATURE_FLAGS } from '@/config/api.config';
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
// RESPONSE MAPPERS (snake_case -> camelCase)
// @task TASK-2026-01-17-002 - FASE 2
// ============================================================================

/**
 * Backend response type for Transaction (snake_case)
 */
interface BackendTransactionResponse {
  id: string;
  user_id: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  transaction_type: string;
  description: string | null;
  reason: string | null;
  reference_id: string | null;
  reference_type: string | null;
  multiplier: number;
  bonus_applied: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Backend response type for ShopItem (snake_case)
 */
interface BackendShopItemResponse {
  id: string;
  name: string;
  description?: string;
  icon: string;
  image_url?: string;
  category: string;
  rarity: string;
  tags: string[];
  price: number;
  discount_price?: number;
  is_available: boolean;
  stock?: number;
  is_consumable: boolean;
  max_per_user?: number;
  duration_days?: number;
  effect_data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  requirements?: {
    rank?: string;
    level?: number;
    achievement?: string;
  };
}

/**
 * Map backend transaction response to frontend Transaction
 * @task TASK-2026-01-17-002 - FASE 2
 */
const mapTransactionResponse = (response: BackendTransactionResponse): Transaction => ({
  id: response.id,
  type: response.transaction_type as Transaction['type'],
  amount: response.amount,
  source: response.reference_type || 'unknown',
  description: response.description || '',
  timestamp: new Date(response.created_at),
  balanceAfter: response.balance_after,
  metadata: response.metadata as Transaction['metadata'],
});

/**
 * Map backend shop item response to frontend ShopItem
 * @task TASK-2026-01-17-002 - FASE 2
 */
const mapShopItemResponse = (response: BackendShopItemResponse): ShopItem => ({
  id: response.id,
  name: response.name,
  description: response.description || '',
  category: response.category as ShopItem['category'],
  price: response.price,
  icon: response.icon,
  image: response.image_url,
  rarity: response.rarity as ShopItem['rarity'],
  tags: response.tags,
  isOwned: false, // Calculated separately
  isPurchasable: response.is_available && (response.stock === null || response.stock === undefined || response.stock > 0),
  requirements: response.requirements,
  stock: response.stock,
  available: response.is_available,
  metadata: response.metadata ? {
    effectDescription: response.effect_data?.description as string,
    duration: response.duration_days,
    stackable: response.metadata?.stackable as boolean,
    tradeable: response.metadata?.tradeable as boolean,
  } : undefined,
});

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
  source: EarningSource | string,
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
 * @param userId - User ID (REQUIRED - get from useAuth hook)
 * @returns Current balance information
 * @throws Error if userId is not provided
 *
 * @example
 * const { user } = useAuth();
 * const balance = await getBalance(user.id);
 */
export const getBalance = async (userId: string): Promise<MLCoinsBalance> => {
  try {
    if (!userId) {
      throw new Error('userId is required. Get it from useAuth() hook.');
    }

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      return await mockGetBalance();
    }

    const { data } = await apiClient.get<ApiResponse<MLCoinsBalance>>(
      API_ENDPOINTS.economy.balance(userId),
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
 * @param userId - User ID (REQUIRED - get from useAuth hook)
 * @param description - Optional description
 * @param metadata - Optional metadata
 * @returns Transaction record
 * @throws Error if userId is not provided
 *
 * @example
 * const { user } = useAuth();
 * const transaction = await earnCoins(50, 'exercise_completion', user.id, 'Completed exercise');
 */
export const earnCoins = async (
  amount: number,
  source: EarningSource | string,
  userId: string,
  description?: string,
  metadata?: Record<string, unknown>,
): Promise<Transaction> => {
  try {
    if (!userId) {
      throw new Error('userId is required. Get it from useAuth() hook.');
    }

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      return await mockEarnCoins(amount, source);
    }

    const { data } = await apiClient.post<ApiResponse<Transaction>>(
      `${API_ENDPOINTS.economy.balance(userId)}/earn`,
      {
        amount,
        source,
        description,
        metadata,
      },
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
 * @param userId - User ID (REQUIRED - get from useAuth hook)
 * @param itemId - Optional item ID
 * @param metadata - Optional metadata
 * @returns Transaction record
 * @throws Error if userId is not provided
 *
 * @example
 * const { user } = useAuth();
 * const transaction = await spendCoins(100, 'Detective Hat', user.id, 'hat-001');
 */
export const spendCoins = async (
  amount: number,
  itemName: string,
  userId: string,
  itemId?: string,
  metadata?: Record<string, unknown>,
): Promise<Transaction> => {
  try {
    if (!userId) {
      throw new Error('userId is required. Get it from useAuth() hook.');
    }

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
      `${API_ENDPOINTS.economy.balance(userId)}/spend`,
      {
        amount,
        itemName,
        itemId,
        metadata,
      },
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
 * @param userId - User ID (REQUIRED - get from useAuth hook)
 * @param pagination - Pagination parameters (optional)
 * @param filters - Transaction filters (optional)
 * @returns Paginated transaction list
 * @throws Error if userId is not provided
 *
 * @example
 * const { user } = useAuth();
 * const transactions = await getTransactions(user.id, { page: 1, limit: 20 });
 */
export const getTransactions = async (
  userId: string,
  pagination?: PaginationParams,
  filters?: TransactionFilters,
): Promise<PaginatedResponse<Transaction>> => {
  try {
    if (!userId) {
      throw new Error('userId is required. Get it from useAuth() hook.');
    }

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

    // TASK-2026-01-17-002: Map backend response to frontend types
    const { data } = await apiClient.get<{ data: BackendTransactionResponse[]; pagination: PaginatedResponse<unknown>['pagination'] }>(
      API_ENDPOINTS.economy.transactions(userId),
      {
        params: {
          ...pagination,
          ...filters,
        },
      },
    );

    return {
      data: data.data.map(mapTransactionResponse),
      pagination: data.pagination,
    };
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

    // TODO: Backend needs endpoint for single transaction by ID
    // For now, using transactions endpoint (may need adjustment)
    const { data } = await apiClient.get<ApiResponse<Transaction>>(
      `${API_ENDPOINTS.economy.transactions(transactionId)}`,
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
  pagination?: PaginationParams,
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

    // TASK-2026-01-17-002: Map backend response to frontend types
    const { data } = await apiClient.get<{ data: BackendShopItemResponse[]; pagination: PaginatedResponse<unknown>['pagination'] }>(
      API_ENDPOINTS.economy.shopItems,
      {
        params: {
          ...filters,
          sortBy,
          ...pagination,
        },
      },
    );

    return {
      data: data.data.map(mapShopItemResponse),
      pagination: data.pagination,
    };
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

    // TASK-2026-01-17-002: Map backend response to frontend types
    const { data } = await apiClient.get<BackendShopItemResponse>(
      API_ENDPOINTS.economy.shopItem(itemId),
    );

    return mapShopItemResponse(data);
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
  quantity: number = 1,
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
      },
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
      API_ENDPOINTS.economy.purchase,
      {
        items: items.map((item) => ({
          itemId: item.id,
          quantity: item.quantity,
        })),
      },
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
 * @param userId - User ID to get inventory for
 * @returns User inventory with owned items
 */
export const getInventory = async (userId: string): Promise<UserInventory> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        items: [],
        totalValue: 0,
        lastUpdated: new Date(),
      };
    }

    const response = await apiClient.get<ApiResponse<UserInventory>>(
      API_ENDPOINTS.economy.inventory(userId),
    );

    return response.data.data;
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

    await apiClient.delete(API_ENDPOINTS.economy.inventoryItem('current-user', itemId));
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

    const { data } = await apiClient.get<ApiResponse<EconomyStats>>('/gamification/economy/stats');

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
