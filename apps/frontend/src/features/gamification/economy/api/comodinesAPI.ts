/**
 * Comodines (Power-ups) API
 *
 * API client for power-up management (backend integration)
 */

import { apiClient } from '@/services/api/apiClient';

// ============================================================================
// TYPES
// ============================================================================

export type ComodinType = 'pistas' | 'vision_lectora' | 'segunda_oportunidad';

export interface ComodinInventoryItem {
  type: ComodinType;
  available: number;
  purchased_total: number;
  used_total: number;
  cost: number;
}

export interface ComodinInventory {
  id: string;
  user_id: string;
  pistas: ComodinInventoryItem;
  vision_lectora: ComodinInventoryItem;
  segunda_oportunidad: ComodinInventoryItem;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PurchaseComodinRequest {
  user_id: string;
  comodin_type: ComodinType;
  quantity: number;
}

export interface UseComodinRequest {
  user_id: string;
  comodin_type: ComodinType;
  quantity: 1; // Always 1 per backend rules
  exercise_id?: string;
  context?: string;
}

export interface UseComodinResponse {
  success: boolean;
  used: {
    comodin_type: ComodinType;
    quantity: number;
    exercise_id: string | null;
  };
  remaining_quantity: number;
}

export interface ComodinTransaction {
  id: string;
  user_id: string;
  item_id: string;
  transaction_type: 'PURCHASE' | 'USE';
  quantity: number;
  metadata: {
    comodin_type?: ComodinType;
    ml_coins_spent?: number;
    cost_per_unit?: number;
    exercise_id?: string;
    context?: string;
    used_at?: string;
  };
  created_at: string;
}

export interface ComodinStats {
  user_id: string;
  total_purchased: number;
  total_used: number;
  total_ml_coins_spent: number;
  by_type: {
    [key in ComodinType]: {
      purchased: number;
      used: number;
      available: number;
      ml_coins_spent: number;
    };
  };
  usage_rate: number;
  most_used: ComodinType | null;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Purchase comodines with ML Coins
 */
export const purchaseComodin = async (
  request: PurchaseComodinRequest,
): Promise<ComodinInventory> => {
  const { data } = await apiClient.post<ComodinInventory>(
    '/gamification/comodines/purchase',
    request,
  );
  return data;
};

/**
 * Use a comodin in an exercise
 */
export const useComodin = async (request: UseComodinRequest): Promise<UseComodinResponse> => {
  const { data } = await apiClient.post<UseComodinResponse>('/gamification/comodines/use', request);
  return data;
};

/**
 * Get user's comodin inventory
 */
export const getComodinInventory = async (userId: string): Promise<ComodinInventory> => {
  const { data } = await apiClient.get<ComodinInventory>(
    `/gamification/users/${userId}/comodines/inventory`,
  );
  return data;
};

/**
 * Get comodin transaction history
 */
export const getComodinHistory = async (
  userId: string,
  limit: number = 50,
): Promise<ComodinTransaction[]> => {
  const { data } = await apiClient.get<ComodinTransaction[]>(
    `/gamification/users/${userId}/comodines/history`,
    {
      params: { limit },
    },
  );
  return data;
};

/**
 * Get comodin usage statistics
 */
export const getComodinStats = async (userId: string): Promise<ComodinStats> => {
  const { data } = await apiClient.get<ComodinStats>(
    `/gamification/users/${userId}/comodines/stats`,
  );
  return data;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get quantity of specific comodin type from inventory
 */
export const getComodinQuantity = (inventory: ComodinInventory, type: ComodinType): number => {
  return inventory[type]?.available || 0;
};

/**
 * Check if user can afford a comodin purchase
 */
export const canAffordComodin = (
  mlCoinsBalance: number,
  comodinType: ComodinType,
  quantity: number,
  inventory?: ComodinInventory,
): boolean => {
  if (!inventory) return false;
  const cost = inventory[comodinType]?.cost || 0;
  return mlCoinsBalance >= cost * quantity;
};

/**
 * Get total value of inventory in ML Coins
 */
export const getInventoryValue = (inventory: ComodinInventory): number => {
  const types: ComodinType[] = ['pistas', 'vision_lectora', 'segunda_oportunidad'];
  return types.reduce((total, type) => {
    const item = inventory[type];
    return total + item.available * item.cost;
  }, 0);
};
