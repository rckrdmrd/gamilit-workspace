import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStats, MayaRankEntity } from '../entities';
import { MayaRank } from '@shared/constants/enums.constants';

/**
 * Rank Multiplier Service
 *
 * @description Calculates ML Coins multiplier based on user's Maya Rank.
 *              Higher ranks earn more coins as reward for progression.
 *              Implements US-GAM-011: ML Coins Multiplier by Rank
 *
 * @module gamification/services
 * @sprint Sprint 5 - US-GAM-011 ML Coins Multiplier
 * @version 1.0.0
 *
 * Multiplier Configuration (v1.0):
 * - Ajaw (Rank 1): 1.00x - Base multiplier for newcomers
 * - Nacom (Rank 2): 1.25x - First progression reward
 * - Ah K'in (Rank 3): 1.50x - Intermediate level bonus
 * - Halach Uinic (Rank 4): 1.75x - Advanced level reward
 * - K'uk'ulkan (Rank 5): 2.00x - Maximum multiplier for masters
 *
 * @example
 * ```typescript
 * // Get multiplier for a user
 * const multiplier = await this.rankMultiplierService.getMultiplier(userId);
 *
 * // Calculate coins with multiplier applied
 * const result = await this.rankMultiplierService.calculateCoinsWithMultiplier(userId, 100);
 * // result.finalCoins = 150 (if user is Ah K'in with 1.5x multiplier)
 * ```
 */

/**
 * ML Coins Multiplier configuration by rank order
 *
 * These values provide a meaningful progression reward:
 * - 1.00x baseline for beginners
 * - 2.00x maximum for highest rank (100% bonus)
 *
 * @note These multipliers are designed specifically for ML Coins rewards
 *       and may differ from XP multipliers stored in the database
 */
const ML_COINS_MULTIPLIERS: Record<number, number> = {
  1: 1.0,   // Ajaw - Newcomer (base)
  2: 1.25,  // Nacom - Warrior in training (+25%)
  3: 1.5,   // Ah K'in - Sun Priest (+50%)
  4: 1.75,  // Halach Uinic - True Leader (+75%)
  5: 2.0,   // K'uk'ulkan - Feathered Serpent (+100%)
};

/**
 * Display names for ranks in Spanish
 */
const RANK_DISPLAY_NAMES: Record<number, { name: string; description: string }> = {
  1: { name: 'Ajaw', description: 'Señor - Inicio del camino del conocimiento' },
  2: { name: 'Nacom', description: 'Capitán de Guerra - Guerrero en entrenamiento' },
  3: { name: "Ah K'in", description: 'Sacerdote del Sol - Guía del conocimiento' },
  4: { name: 'Halach Uinic', description: 'Hombre Verdadero - Líder de la comunidad' },
  5: { name: "K'uk'ulkan", description: 'Serpiente Emplumada - Maestro legendario' },
};

/**
 * Map from MayaRank enum to rank order number
 */
const RANK_ORDER_MAP: Record<MayaRank, number> = {
  [MayaRank.AJAW]: 1,
  [MayaRank.NACOM]: 2,
  [MayaRank.AH_KIN]: 3,
  [MayaRank.HALACH_UINIC]: 4,
  [MayaRank.KUKULKAN]: 5,
};

/**
 * Interface for multiplier calculation result
 */
export interface MultiplierInfo {
  /** User's current rank level (1-5) */
  rankLevel: number;
  /** Display name of the rank (e.g., "Ajaw") */
  rankName: string;
  /** Multiplier value (1.0 - 2.0) */
  multiplier: number;
  /** Original base coins amount */
  baseCoins: number;
  /** Final coins after multiplier applied */
  finalCoins: number;
  /** Bonus coins earned from multiplier */
  bonusCoins: number;
  /** Percentage bonus (e.g., 50 for 1.5x) */
  bonusPercentage: number;
}

/**
 * Interface for rank multiplier table entry
 */
export interface RankMultiplierTableEntry {
  /** Rank level (1-5) */
  level: number;
  /** Rank name for display */
  name: string;
  /** Rank description */
  description: string;
  /** Multiplier value */
  multiplier: number;
  /** Bonus percentage (0-100) */
  bonusPercentage: number;
}

/**
 * Interface for user's rank with multiplier info
 */
export interface UserRankMultiplierInfo {
  /** User ID */
  userId: string;
  /** Current rank level (1-5) */
  rankLevel: number;
  /** Display name of current rank */
  rankName: string;
  /** Current multiplier value */
  multiplier: number;
  /** Bonus percentage for current rank */
  bonusPercentage: number;
  /** XP required for next rank (0 if max rank) */
  xpToNextRank: number;
  /** Next rank's multiplier (null if max rank) */
  nextRankMultiplier: number | null;
  /** Next rank's bonus percentage (null if max rank) */
  nextRankBonusPercentage: number | null;
  /** Whether user is at max rank */
  isMaxRank: boolean;
}

@Injectable()
export class RankMultiplierService {
  private readonly logger = new Logger(RankMultiplierService.name);

  constructor(
    @InjectRepository(UserStats, 'gamification')
    private readonly userStatsRepo: Repository<UserStats>,
    @InjectRepository(MayaRankEntity, 'gamification')
    private readonly mayaRanksRepo: Repository<MayaRankEntity>,
  ) {}

  /**
   * Get the ML Coins multiplier for a user based on their current rank
   *
   * @param userId - The user's ID
   * @returns The multiplier value (1.0 - 2.0)
   *
   * @example
   * ```typescript
   * const multiplier = await rankMultiplierService.getMultiplier(userId);
   * const finalCoins = Math.floor(baseCoins * multiplier);
   * ```
   */
  async getMultiplier(userId: string): Promise<number> {
    const userStats = await this.userStatsRepo.findOne({
      where: { user_id: userId },
    });

    if (!userStats || !userStats.current_rank) {
      this.logger.debug(`User ${userId} has no rank, using default multiplier 1.0`);
      return ML_COINS_MULTIPLIERS[1];
    }

    const rankOrder = RANK_ORDER_MAP[userStats.current_rank as MayaRank];
    const multiplier = ML_COINS_MULTIPLIERS[rankOrder] || ML_COINS_MULTIPLIERS[1];

    this.logger.debug(
      `User ${userId} (${userStats.current_rank}): ML Coins multiplier = ${multiplier}x`
    );

    return multiplier;
  }

  /**
   * Calculate ML Coins with multiplier applied
   *
   * @param userId - The user's ID
   * @param baseCoins - Base amount of coins to award
   * @returns MultiplierInfo with detailed breakdown
   *
   * @example
   * ```typescript
   * const result = await rankMultiplierService.calculateCoinsWithMultiplier(userId, 100);
   * console.log(`${result.baseCoins} x ${result.multiplier} = ${result.finalCoins} (+${result.bonusCoins} bonus)`);
   * ```
   */
  async calculateCoinsWithMultiplier(
    userId: string,
    baseCoins: number,
  ): Promise<MultiplierInfo> {
    const userStats = await this.userStatsRepo.findOne({
      where: { user_id: userId },
    });

    const currentRank = userStats?.current_rank as MayaRank | undefined;
    const rankOrder = currentRank ? RANK_ORDER_MAP[currentRank] : 1;
    const multiplier = ML_COINS_MULTIPLIERS[rankOrder] || 1.0;
    const rankInfo = RANK_DISPLAY_NAMES[rankOrder] || RANK_DISPLAY_NAMES[1];

    const finalCoins = Math.floor(baseCoins * multiplier);
    const bonusCoins = finalCoins - baseCoins;
    const bonusPercentage = Math.round((multiplier - 1) * 100);

    this.logger.debug(
      `User ${userId} (${rankInfo.name}, Rank ${rankOrder}): ` +
      `${baseCoins} x ${multiplier} = ${finalCoins} ML Coins (+${bonusCoins} bonus, +${bonusPercentage}%)`
    );

    return {
      rankLevel: rankOrder,
      rankName: rankInfo.name,
      multiplier,
      baseCoins,
      finalCoins,
      bonusCoins,
      bonusPercentage,
    };
  }

  /**
   * Get the complete rank multiplier table for frontend display
   *
   * @returns Array of all ranks with their multipliers
   *
   * @example
   * ```typescript
   * const table = rankMultiplierService.getRankMultiplierTable();
   * // Returns:
   * // [
   * //   { level: 1, name: "Ajaw", multiplier: 1.0, bonusPercentage: 0 },
   * //   { level: 2, name: "Nacom", multiplier: 1.25, bonusPercentage: 25 },
   * //   ...
   * // ]
   * ```
   */
  getRankMultiplierTable(): RankMultiplierTableEntry[] {
    return Object.entries(ML_COINS_MULTIPLIERS)
      .map(([levelStr, multiplier]) => {
        const level = parseInt(levelStr, 10);
        const rankInfo = RANK_DISPLAY_NAMES[level];
        return {
          level,
          name: rankInfo?.name || `Rank ${level}`,
          description: rankInfo?.description || '',
          multiplier,
          bonusPercentage: Math.round((multiplier - 1) * 100),
        };
      })
      .sort((a, b) => a.level - b.level);
  }

  /**
   * Get user's current rank info with multiplier details
   *
   * @param userId - The user's ID
   * @returns UserRankMultiplierInfo with complete rank and multiplier data
   *
   * @example
   * ```typescript
   * const info = await rankMultiplierService.getUserRankWithMultiplier(userId);
   * console.log(`Current: ${info.rankName} (${info.multiplier}x)`);
   * if (!info.isMaxRank) {
   *   console.log(`Next rank multiplier: ${info.nextRankMultiplier}x`);
   * }
   * ```
   */
  async getUserRankWithMultiplier(userId: string): Promise<UserRankMultiplierInfo> {
    const userStats = await this.userStatsRepo.findOne({
      where: { user_id: userId },
    });

    const currentRank = userStats?.current_rank as MayaRank | undefined;
    const rankOrder = currentRank ? RANK_ORDER_MAP[currentRank] : 1;
    const multiplier = ML_COINS_MULTIPLIERS[rankOrder] || 1.0;
    const rankInfo = RANK_DISPLAY_NAMES[rankOrder] || RANK_DISPLAY_NAMES[1];
    const bonusPercentage = Math.round((multiplier - 1) * 100);

    // Get rank configuration from database for XP requirements
    const mayaRankEntity = currentRank
      ? await this.mayaRanksRepo.findOne({ where: { rank_name: currentRank } })
      : null;

    // Calculate XP to next rank
    const currentXp = Number(userStats?.total_xp || 0);
    const maxXpThreshold = mayaRankEntity?.max_xp_threshold
      ? Number(mayaRankEntity.max_xp_threshold)
      : null;

    const isMaxRank = rankOrder === 5 || maxXpThreshold === null;
    const xpToNextRank = isMaxRank
      ? 0
      : Math.max(0, (maxXpThreshold || 0) + 1 - currentXp);

    // Next rank info
    const nextRankOrder = rankOrder + 1;
    const nextRankMultiplier = isMaxRank ? null : (ML_COINS_MULTIPLIERS[nextRankOrder] || null);
    const nextRankBonusPercentage = nextRankMultiplier
      ? Math.round((nextRankMultiplier - 1) * 100)
      : null;

    return {
      userId,
      rankLevel: rankOrder,
      rankName: rankInfo.name,
      multiplier,
      bonusPercentage,
      xpToNextRank,
      nextRankMultiplier,
      nextRankBonusPercentage,
      isMaxRank,
    };
  }

  /**
   * Get multiplier for a specific rank (without user context)
   *
   * @param rank - The MayaRank enum value
   * @returns The multiplier value for that rank
   */
  getMultiplierForRank(rank: MayaRank): number {
    const rankOrder = RANK_ORDER_MAP[rank];
    return ML_COINS_MULTIPLIERS[rankOrder] || 1.0;
  }

  /**
   * Get the bonus percentage for a specific rank
   *
   * @param rank - The MayaRank enum value
   * @returns The bonus percentage (0-100)
   */
  getBonusPercentageForRank(rank: MayaRank): number {
    const multiplier = this.getMultiplierForRank(rank);
    return Math.round((multiplier - 1) * 100);
  }
}
