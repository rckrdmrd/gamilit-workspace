/**
 * Gamification Test Mock Helpers
 *
 * Centralized mock data generators for gamification tests.
 * All data is in snake_case format to simulate actual backend responses.
 *
 * @task TASK-2026-01-17-002 - FASE 3
 * @description These helpers ensure test mocks match the actual backend DTO structures.
 */

import { vi } from 'vitest';

// ============================================================================
// BACKEND RESPONSE TYPES (snake_case - matching actual backend DTOs)
// ============================================================================

/**
 * Backend UserRankProgress response (from UserRankProgressResponseDto)
 */
export interface MockBackendUserProgress {
  user_id: string;
  current_rank: string;
  next_rank: string | null;
  level: number;
  total_xp: number;
  current_xp: number;
  xp_to_next_level: number;
  ml_coins_earned: number;
  rank_progress_percentage: number;
  xp_required_for_next_rank: number;
  xp_remaining_for_next_rank: number;
  can_rank_up: boolean;
  is_max_rank: boolean;
  prestige_level: number;
  can_prestige: boolean;
  multiplier: number;
  activity_streak: number;
  last_activity_at: string | null;
  last_rank_up: string | null;
  ml_coins_bonus_on_promotion: number;
}

/**
 * Backend MultiplierSource (from MultiplierSourceDto)
 */
export interface MockBackendMultiplierSource {
  type: string;
  name: string;
  value: number;
  expires_at?: string;
  is_permanent: boolean;
  description?: string;
  icon?: string;
}

/**
 * Backend MultiplierBreakdown response (from MultiplierBreakdownResponseDto)
 */
export interface MockBackendMultiplierBreakdown {
  user_id: string;
  base: number;
  rank: MockBackendMultiplierSource;
  sources: MockBackendMultiplierSource[];
  total: number;
  has_expiring_soon: boolean;
  expiring_soon: MockBackendMultiplierSource[];
}

/**
 * Backend Transaction response (from TransactionResponseDto)
 */
export interface MockBackendTransaction {
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
 * Backend ShopItem response (from ShopItemResponseDto)
 */
export interface MockBackendShopItem {
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
 * Backend UserStats response (from UserStatsResponseDto)
 */
export interface MockBackendUserStats {
  id: string;
  user_id: string;
  level: number;
  total_xp: number;
  xp_to_next_level: number;
  current_rank: string;
  rank_progress: number;
  ml_coins: number;
  ml_coins_earned_total: number;
  ml_coins_spent_total: number;
  current_streak: number;
  max_streak: number;
  exercises_completed: number;
  modules_completed: number;
  achievements_earned: number;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

/**
 * Default test user ID
 */
export const TEST_USER_ID = 'test-user-id';

/**
 * Create mock backend user progress response
 */
export function createMockUserProgress(
  overrides: Partial<MockBackendUserProgress> = {},
): MockBackendUserProgress {
  return {
    user_id: TEST_USER_ID,
    current_rank: 'Nacom',
    next_rank: "Ah K'in",
    level: 5,
    total_xp: 750,
    current_xp: 50,
    xp_to_next_level: 100,
    ml_coins_earned: 500,
    rank_progress_percentage: 50,
    xp_required_for_next_rank: 1000,
    xp_remaining_for_next_rank: 250,
    can_rank_up: false,
    is_max_rank: false,
    prestige_level: 0,
    can_prestige: false,
    multiplier: 1.1,
    activity_streak: 3,
    last_activity_at: new Date().toISOString(),
    last_rank_up: new Date('2026-01-15').toISOString(),
    ml_coins_bonus_on_promotion: 250,
    ...overrides,
  };
}

/**
 * Create mock backend multiplier breakdown response
 */
export function createMockMultiplierBreakdown(
  overrides: Partial<MockBackendMultiplierBreakdown> = {},
): MockBackendMultiplierBreakdown {
  return {
    user_id: TEST_USER_ID,
    base: 1.0,
    rank: {
      type: 'rank',
      name: 'Nacom',
      value: 1.1,
      is_permanent: true,
      description: 'Multiplicador base del rango Nacom',
    },
    sources: [
      {
        type: 'rank',
        name: 'Nacom',
        value: 1.1,
        is_permanent: true,
        description: 'Multiplicador base del rango Nacom',
      },
    ],
    total: 1.1,
    has_expiring_soon: false,
    expiring_soon: [],
    ...overrides,
  };
}

/**
 * Create mock backend transaction response
 */
export function createMockTransaction(
  overrides: Partial<MockBackendTransaction> = {},
): MockBackendTransaction {
  return {
    id: `txn-${Date.now()}`,
    user_id: TEST_USER_ID,
    amount: 50,
    balance_before: 450,
    balance_after: 500,
    transaction_type: 'earned_exercise',
    description: 'Completed exercise',
    reason: null,
    reference_id: 'exercise-123',
    reference_type: 'exercise_completion',
    multiplier: 1.0,
    bonus_applied: false,
    metadata: {},
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock backend shop item response
 */
export function createMockShopItem(
  overrides: Partial<MockBackendShopItem> = {},
): MockBackendShopItem {
  return {
    id: `item-${Date.now()}`,
    name: 'Detective Hat',
    description: 'A classic detective hat for your avatar',
    icon: 'hat',
    image_url: 'https://example.com/hat.png',
    category: 'cosmetics',
    rarity: 'rare',
    tags: ['avatar', 'hat', 'detective'],
    price: 100,
    is_available: true,
    stock: 50,
    is_consumable: false,
    requirements: {
      level: 5,
    },
    ...overrides,
  };
}

/**
 * Create mock backend user stats response
 */
export function createMockUserStats(
  overrides: Partial<MockBackendUserStats> = {},
): MockBackendUserStats {
  return {
    id: `stats-${Date.now()}`,
    user_id: TEST_USER_ID,
    level: 5,
    total_xp: 750,
    xp_to_next_level: 100,
    current_rank: 'Nacom',
    rank_progress: 50,
    ml_coins: 500,
    ml_coins_earned_total: 1000,
    ml_coins_spent_total: 500,
    current_streak: 3,
    max_streak: 10,
    exercises_completed: 25,
    modules_completed: 2,
    achievements_earned: 5,
    last_activity_at: new Date().toISOString(),
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================================================
// API CLIENT MOCK HELPERS
// ============================================================================

/**
 * Create a mock apiClient with pre-configured responses
 */
export function createMockApiClient(options: {
  userProgress?: Partial<MockBackendUserProgress>;
  multipliers?: Partial<MockBackendMultiplierBreakdown>;
  userStats?: Partial<MockBackendUserStats>;
  transactions?: MockBackendTransaction[];
  shopItems?: MockBackendShopItem[];
} = {}) {
  const userProgress = createMockUserProgress(options.userProgress);
  const multipliers = createMockMultiplierBreakdown(options.multipliers);
  const userStats = createMockUserStats(options.userStats);

  return {
    get: vi.fn().mockImplementation((url: string) => {
      // User progress endpoint
      if (url.includes('/progress')) {
        return Promise.resolve({ data: userProgress });
      }
      // Multipliers endpoint
      if (url.includes('/multipliers')) {
        return Promise.resolve({ data: multipliers });
      }
      // User stats endpoint
      if (url.includes('/stats')) {
        return Promise.resolve({ data: userStats });
      }
      // Transactions endpoint
      if (url.includes('/transactions')) {
        return Promise.resolve({
          data: options.transactions || [createMockTransaction()],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasMore: false },
        });
      }
      // Shop items endpoint
      if (url.includes('/shop/items')) {
        return Promise.resolve({
          data: options.shopItems || [createMockShopItem()],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasMore: false },
        });
      }
      // Default
      return Promise.resolve({ data: {} });
    }),
    patch: vi.fn().mockImplementation((url: string, data: Record<string, unknown>) => {
      // Stats update with XP increment
      if (url.includes('/stats') && data.total_xp_increment) {
        const increment = Number(data.total_xp_increment) || 0;
        const newXp = userStats.total_xp + increment;
        const newLevel = Math.floor(newXp / 100) + 1;
        const leveledUp = newLevel > userStats.level;

        return Promise.resolve({
          data: {
            ...userStats,
            total_xp: newXp,
            level: newLevel,
            leveled_up: leveledUp,
            ranked_up: false,
          },
        });
      }
      // Stats update with ML coins increment
      if (url.includes('/stats') && data.ml_coins_increment) {
        const increment = Number(data.ml_coins_increment) || 0;
        return Promise.resolve({
          data: {
            ...userStats,
            ml_coins: userStats.ml_coins + increment,
            ml_coins_earned_total: userStats.ml_coins_earned_total + increment,
          },
        });
      }
      // Stats update with ML coins decrement
      if (url.includes('/stats') && data.ml_coins_decrement) {
        const decrement = Number(data.ml_coins_decrement) || 0;
        return Promise.resolve({
          data: {
            ...userStats,
            ml_coins: userStats.ml_coins - decrement,
            ml_coins_spent_total: userStats.ml_coins_spent_total + decrement,
          },
        });
      }
      // Default stats update
      return Promise.resolve({ data: { ...userStats, ...data } });
    }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  };
}

// ============================================================================
// AUTH STORE MOCK
// ============================================================================

/**
 * Create mock auth store
 */
export function createMockAuthStore(userId: string = TEST_USER_ID) {
  return {
    useAuthStore: {
      getState: () => ({
        user: {
          id: userId,
          email: 'test@example.com',
          fullName: 'Test User',
        },
        isAuthenticated: true,
        token: 'test-token',
      }),
    },
  };
}

// ============================================================================
// VITEST MOCK SETUP HELPERS
// ============================================================================

/**
 * Setup all common gamification mocks
 * Call this in beforeEach or at the top of test files
 */
export function setupGamificationMocks(options: {
  userProgress?: Partial<MockBackendUserProgress>;
  multipliers?: Partial<MockBackendMultiplierBreakdown>;
  userStats?: Partial<MockBackendUserStats>;
  userId?: string;
} = {}) {
  const apiClient = createMockApiClient(options);
  const authStore = createMockAuthStore(options.userId);

  return {
    apiClient,
    authStore,
    // Helper to update mock responses mid-test
    updateUserProgress: (updates: Partial<MockBackendUserProgress>) => {
      const newProgress = createMockUserProgress(updates);
      apiClient.get.mockImplementation((url: string) => {
        if (url.includes('/progress')) {
          return Promise.resolve({ data: newProgress });
        }
        return Promise.resolve({ data: {} });
      });
    },
    updateUserStats: (updates: Partial<MockBackendUserStats>) => {
      const newStats = createMockUserStats(updates);
      apiClient.get.mockImplementation((url: string) => {
        if (url.includes('/stats')) {
          return Promise.resolve({ data: newStats });
        }
        return Promise.resolve({ data: {} });
      });
    },
  };
}

// ============================================================================
// PRESET MOCK SCENARIOS
// ============================================================================

/**
 * Mock for new user (level 1, no progress)
 */
export const MOCK_NEW_USER_PROGRESS = createMockUserProgress({
  level: 1,
  total_xp: 0,
  current_xp: 0,
  current_rank: 'Ajaw',
  next_rank: 'Nacom',
  can_rank_up: false,
  prestige_level: 0,
  multiplier: 1.0,
  activity_streak: 0,
});

/**
 * Mock for user ready to rank up
 */
export const MOCK_READY_TO_RANK_UP = createMockUserProgress({
  level: 10,
  total_xp: 999,
  current_xp: 99,
  xp_remaining_for_next_rank: 1,
  can_rank_up: true,
  current_rank: 'Nacom',
  next_rank: "Ah K'in",
});

/**
 * Mock for max rank user
 */
export const MOCK_MAX_RANK_USER = createMockUserProgress({
  level: 50,
  total_xp: 5000,
  current_rank: "K'uk'ulkan",
  next_rank: null,
  is_max_rank: true,
  can_rank_up: false,
  can_prestige: true,
  multiplier: 2.0,
});

/**
 * Mock for user with active streak
 */
export const MOCK_STREAK_USER = createMockUserProgress({
  activity_streak: 7,
  multiplier: 1.17, // 1.1 (rank) + 0.07 (7 days * 0.01)
});
