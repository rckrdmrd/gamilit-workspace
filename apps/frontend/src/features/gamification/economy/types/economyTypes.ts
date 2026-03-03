/**
 * Economy System Types - ML Coins Virtual Economy
 *
 * This file defines all TypeScript interfaces for the GLIT Platform economy system,
 * including ML Coins, shop items, transactions, and economic metrics.
 */

/**
 * Shop Categories - 4 main categories for the virtual economy
 * NOTE: 'premium' is legacy for power-ups, 'consumable' is new unified category
 */
export type ShopCategory = 'cosmetics' | 'profile' | 'premium' | 'consumable';

/**
 * Item Rarity Levels - Affects pricing and visual appearance
 */
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Transaction Types - Sincronizado con Backend TransactionTypeEnum
 * @see backend/src/shared/constants/enums.constants.ts
 */
export enum TransactionTypeEnum {
  // ========== EARNED (Ingresos) ==========
  EARNED_EXERCISE = 'earned_exercise',
  EARNED_MODULE = 'earned_module',
  EARNED_ACHIEVEMENT = 'earned_achievement',
  EARNED_RANK = 'earned_rank',
  EARNED_STREAK = 'earned_streak',
  EARNED_DAILY = 'earned_daily',
  EARNED_BONUS = 'earned_bonus',

  // ========== SPENT (Gastos) ==========
  SPENT_POWERUP = 'spent_powerup',
  SPENT_HINT = 'spent_hint',
  SPENT_RETRY = 'spent_retry',

  // ========== ADMIN/SISTEMA ==========
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  REFUND = 'refund',
  BONUS = 'bonus',
  WELCOME_BONUS = 'welcome_bonus',
}

export type TransactionType = `${TransactionTypeEnum}`;

/**
 * Transaction Category - For high-level filtering/grouping
 */
export type TransactionCategory = 'earn' | 'spend' | 'other';

/**
 * Helper to catalyze transaction types
 */
export const getTransactionCategory = (type: TransactionType): TransactionCategory => {
  if (type.startsWith('earned_') || type === 'welcome_bonus' || type === 'refund' || type === 'bonus') return 'earn';
  if (type.startsWith('spent_')) return 'spend';
  return 'other'; // admin_adjustment could be either, but usually handled as specific administrative action
};

/**
 * Earning Sources - Where ML Coins can be earned from
 * @deprecated Use TransactionTypeEnum for precise source tracking
 */
export type EarningSource =
  | 'exercise_completion'
  | 'streak_bonus'
  | 'perfect_score'
  | 'achievement_unlock'
  | 'daily_login'
  | 'guild_challenge'
  | 'leaderboard_reward'
  | 'referral_bonus'
  | 'admin_grant';

/**
 * Maps TransactionTypeEnum values to legacy EarningSource values
 *
 * This mapper provides backwards compatibility for components that still use
 * the deprecated EarningSource type while the backend uses TransactionTypeEnum.
 *
 * @param transactionType - The TransactionTypeEnum value from backend
 * @returns The corresponding EarningSource value, or the original type if no mapping exists
 *
 * @example
 * ```typescript
 * const source = mapTransactionTypeToEarningSource('earned_exercise');
 * // Returns: 'exercise_completion'
 *
 * const source = mapTransactionTypeToEarningSource('earned_streak');
 * // Returns: 'streak_bonus'
 * ```
 *
 * @see DISCREPANCIAS-BE-FE-2026-01-18.md - Discrepancia 2
 */
export const mapTransactionTypeToEarningSource = (
  transactionType: TransactionType | string
): EarningSource | string => {
  const mapping: Record<string, EarningSource> = {
    // Earned types
    [TransactionTypeEnum.EARNED_EXERCISE]: 'exercise_completion',
    [TransactionTypeEnum.EARNED_STREAK]: 'streak_bonus',
    [TransactionTypeEnum.EARNED_ACHIEVEMENT]: 'achievement_unlock',
    [TransactionTypeEnum.EARNED_DAILY]: 'daily_login',
    [TransactionTypeEnum.EARNED_BONUS]: 'perfect_score', // Closest match for bonus
    [TransactionTypeEnum.EARNED_RANK]: 'leaderboard_reward', // Rank rewards often tied to leaderboard
    [TransactionTypeEnum.EARNED_MODULE]: 'exercise_completion', // Module completion similar to exercise

    // Admin/System types
    [TransactionTypeEnum.ADMIN_ADJUSTMENT]: 'admin_grant',
    [TransactionTypeEnum.BONUS]: 'referral_bonus', // Generic bonus
    [TransactionTypeEnum.WELCOME_BONUS]: 'referral_bonus', // Welcome bonus similar to referral
  };

  return mapping[transactionType] || transactionType;
};

/**
 * Maps legacy EarningSource values to TransactionTypeEnum
 *
 * Inverse of mapTransactionTypeToEarningSource for cases where frontend
 * needs to send data to backend.
 *
 * @param source - The EarningSource value
 * @returns The corresponding TransactionTypeEnum value
 */
export const mapEarningSourceToTransactionType = (
  source: EarningSource | string
): TransactionType => {
  const mapping: Record<string, TransactionType> = {
    exercise_completion: TransactionTypeEnum.EARNED_EXERCISE,
    streak_bonus: TransactionTypeEnum.EARNED_STREAK,
    perfect_score: TransactionTypeEnum.EARNED_BONUS,
    achievement_unlock: TransactionTypeEnum.EARNED_ACHIEVEMENT,
    daily_login: TransactionTypeEnum.EARNED_DAILY,
    guild_challenge: TransactionTypeEnum.EARNED_BONUS, // No direct match, use bonus
    leaderboard_reward: TransactionTypeEnum.EARNED_RANK,
    referral_bonus: TransactionTypeEnum.BONUS,
    admin_grant: TransactionTypeEnum.ADMIN_ADJUSTMENT,
  };

  return (mapping[source] || TransactionTypeEnum.EARNED_BONUS) as TransactionType;
};

/**
 * Active Boost - Temporary multiplier for XP or Coins
 */
export interface ActiveBoost {
  id: string;
  user_id: string;
  boost_type: 'XP' | 'COINS';
  multiplier: number;
  source: string | null;
  activated_at: string;
  expires_at: string;
  is_active: boolean;
}

/**
 * Economic Health Status - For monitoring system
 */
export type EconomicHealthStatus = 'healthy' | 'warning' | 'critical';

/**
 * ML Coins Balance Information
 */
export interface MLCoinsBalance {
  current: number;          // Current available balance
  lifetime: number;         // Total coins earned lifetime
  spent: number;            // Total coins spent
  pending: number;          // Coins pending from ongoing activities
}

/**
 * Transaction Record
 * Tracks all ML Coins movements (earnings and spending)
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;           // Positive for earn, negative for spend
  source: EarningSource | string;  // Source of earn or item purchased
  description: string;      // Human-readable description
  timestamp: Date;
  balanceAfter: number;     // Balance after this transaction
  metadata?: {
    itemId?: string;        // If purchased item
    exerciseId?: string;    // If from exercise
    achievementId?: string; // If from achievement
  };
}

/**
 * Shop Item Requirements
 * Optional requirements to unlock purchase
 */
export interface ShopItemRequirements {
  rank?: string;            // Minimum rank required (e.g., "Ajaw", "Halach Uinic")
  level?: number;           // Minimum level required
  achievement?: string;     // Specific achievement required
  guildMember?: boolean;    // Must be in a guild
}

/**
 * Shop Item Definition
 * Represents a purchasable item in the shop
 */
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: number;            // Price in ML Coins
  icon: string;             // Lucide icon name or emoji
  image?: string;           // Optional image URL
  rarity: ItemRarity;
  tags?: string[];           // For search and filtering
  isOwned?: boolean;         // Whether user owns this item
  ownedQuantity?: number;    // Quantity owned for consumable items
  isPurchasable?: boolean;   // Whether can be purchased (not sold out, etc.)
  requirements?: ShopItemRequirements;
  previewData?: unknown;    // Category-specific preview data
  metadata?: {
    effectDescription?: string;  // What this item does
    duration?: number;            // If temporary effect (days)
    stackable?: boolean;          // Can own multiple
    tradeable?: boolean;          // Can trade with others
    // Visual fields (from backend mergeVisualConfig)
    type?: string;           // 'avatar' | 'profile_frame' | 'profile_background' | 'title' | 'badge' | 'chat_effect' | 'sticker_pack'
    asset_url?: string;      // SVG/image path
    border_color?: string;   // CSS color for frames
    display_text?: string;   // Text for titles
    color?: string;          // CSS color for titles/effects
    css_class?: string;      // Tailwind class for advanced frames
    render_mode?: string;    // Rendering mode
    animated?: boolean;
    animation?: string;      // Animation name
    glow_color?: string;     // Glow effect color
  };
  stock?: number;        // Remaining stock (for limited items)
  available?: boolean;   // Whether item is currently available
}

/**
 * Earning Source Breakdown
 * For analytics dashboard showing where coins came from
 */
export interface EarningSourceData {
  source: string;
  amount: number;
  percentage: number;
  color: string;            // For chart visualization
  icon: string;             // Lucide icon name
}

/**
 * Spending Category Data
 * For analytics dashboard showing spending patterns
 */
export interface SpendingCategoryData {
  category: ShopCategory;
  amount: number;
  percentage: number;
  itemCount: number;        // Number of items purchased
  color: string;
}

/**
 * Economic Metrics
 * For admin dashboard to monitor economy health
 */
export interface EconomicMetrics {
  inflationRate: number;    // Monthly inflation rate (%)
  mlVelocity: number;       // Circulation speed (0.8-1.2 healthy)
  totalSupply: number;      // Total ML Coins in circulation
  totalDemand: number;      // Total ML Coins spent in period
  activeUsers: number;      // Users transacting in period
  averageBalance: number;   // Average user balance
  healthStatus: EconomicHealthStatus;
  lastUpdated: Date;
}

/**
 * Shopping Cart Item
 */
export interface CartItem extends ShopItem {
  quantity: number;         // For stackable items
  addedAt: Date;
}

/**
 * Purchase Result
 */
export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  newBalance?: number;
  itemsAcquired?: ShopItem[];
}

/**
 * User Inventory
 */
export interface UserInventory {
  items: ShopItem[];
  totalValue: number;       // Total ML Coins value
  lastUpdated: Date;
}

/**
 * Economic Intervention Trigger
 * Alerts for when economy needs adjustment
 */
export interface InterventionTrigger {
  id: string;
  type: 'inflation' | 'deflation' | 'low_velocity' | 'high_velocity' | 'supply_shock';
  severity: 'low' | 'medium' | 'high';
  message: string;
  triggeredAt: Date;
  metrics: Partial<EconomicMetrics>;
  suggestedActions: string[];
}

/**
 * Time-based Analytics Period
 */
export type AnalyticsPeriod = '24h' | '7d' | '30d' | '90d' | 'all';

/**
 * Transaction History Filter Options
 */
export interface TransactionFilters {
  type?: TransactionType;
  source?: EarningSource | string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Shop Filters
 */
export interface ShopFilters {
  category?: ShopCategory;
  rarity?: ItemRarity;
  priceMin?: number;
  priceMax?: number;
  owned?: boolean;
  available?: boolean;      // Can purchase
  searchQuery?: string;
  tags?: string[];
}

/**
 * Shop Sort Options
 */
export type ShopSortBy = 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rarity' | 'newest';

/**
 * Notification for economy events
 */
export interface EconomyNotification {
  id: string;
  type: 'purchase_success' | 'purchase_failed' | 'coins_earned' | 'achievement_reward';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

/**
 * Economy Statistics Summary
 */
export interface EconomyStats {
  totalEarned: number;
  totalSpent: number;
  currentBalance: number;
  netWorth: number;         // Balance + inventory value
  transactionCount: number;
  favoriteCategory: ShopCategory;
  biggestPurchase: {
    item: string;
    amount: number;
    date: Date;
  };
  topEarningSource: {
    source: string;
    amount: number;
    date: Date;
  };
}
