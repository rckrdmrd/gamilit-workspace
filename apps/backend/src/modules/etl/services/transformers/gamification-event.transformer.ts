/**
 * Gamification Event Transformer
 *
 * @description Transforms OLTP gamification events to DW fact table format.
 * Handles ML Coins transactions, achievements, rank changes, and other
 * gamification-related events.
 *
 * @module etl/services/transformers
 * @since 2026-02-03
 */

import { Injectable } from '@nestjs/common';
import {
  TransformerBaseService,
  PreValidationResult,
  validResult,
  invalidResult,
} from './transformer-base.service';
import {
  ValidationResult,
  ValidationSeverity,
} from '../../interfaces/validation-result.interface';
import { DataQualityValidator } from '../validators/data-quality.validator';
import { DimensionLookupService } from '../dimension-lookup.service';
import { TransformerConfig } from '../../interfaces';

/**
 * Event Type Categories
 */
export enum GamEventCategory {
  COINS_EARNED = 'coins_earned',
  COINS_SPENT = 'coins_spent',
  XP_EARNED = 'xp_earned',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  RANK_CHANGE = 'rank_change',
  LEVEL_UP = 'level_up',
  STREAK_UPDATE = 'streak_update',
  PURCHASE = 'purchase',
  REWARD_CLAIMED = 'reward_claimed',
  MISSION_COMPLETED = 'mission_completed',
  COMODIN_USED = 'comodin_used',
}

/**
 * Source: OLTP ML Coins Transaction
 */
export interface GamificationEventSource {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description?: string;
  reference_type?: string;
  reference_id?: string;
  created_at: Date;
  metadata?: Record<string, unknown>;
  // Additional fields from other sources
  achievement_id?: string;
  rank_from?: string;
  rank_to?: string;
  level_from?: number;
  level_to?: number;
  xp_earned?: number;
}

/**
 * Target: DW Fact Gamification Event Record
 */
export interface FactGamificationEvent {
  /** Surrogate key */
  event_key: number;
  /** FK to dim_date */
  date_key: number;
  /** FK to dim_time */
  time_key: number;
  /** FK to dim_student */
  student_key: number;
  /** FK to dim_achievement (nullable) */
  achievement_key: number | null;
  /** FK to dim_rank (nullable) */
  rank_key: number | null;
  /** Natural key for reference */
  event_id: string;
  /** Categorized event type */
  event_type: GamEventCategory;
  /** Original transaction type */
  original_type: string;
  /** Event description */
  description: string;
  /** Points/coins earned (positive) */
  points_earned: number;
  /** Points/coins spent (positive) */
  points_spent: number;
  /** Net change (can be negative) */
  net_change: number;
  /** Balance after transaction */
  balance_after: number;
  /** XP earned in this event */
  xp_earned: number;
  /** Reference type (exercise, mission, shop, etc.) */
  reference_type: string | null;
  /** Reference ID */
  reference_id: string | null;
  /** Event timestamp in UTC */
  event_timestamp_utc: Date;
  /** ETL batch ID */
  etl_batch_id: string;
  /** ETL load timestamp */
  etl_loaded_at: Date;
}

/**
 * Transaction type to event type mapping
 */
const TRANSACTION_TYPE_MAP: Record<string, GamEventCategory> = {
  earn: GamEventCategory.COINS_EARNED,
  exercise_completion: GamEventCategory.COINS_EARNED,
  mission_reward: GamEventCategory.COINS_EARNED,
  achievement_reward: GamEventCategory.REWARD_CLAIMED,
  daily_bonus: GamEventCategory.COINS_EARNED,
  spend: GamEventCategory.COINS_SPENT,
  purchase: GamEventCategory.PURCHASE,
  shop_purchase: GamEventCategory.PURCHASE,
  comodin_purchase: GamEventCategory.COMODIN_USED,
  hint_purchase: GamEventCategory.COMODIN_USED,
  refund: GamEventCategory.COINS_EARNED,
  admin_adjustment: GamEventCategory.COINS_EARNED,
};

/**
 * GamificationEventTransformer
 * @description Transforms gamification events for fact table loading
 */
@Injectable()
export class GamificationEventTransformer extends TransformerBaseService<
  GamificationEventSource,
  FactGamificationEvent
> {
  private eventKeyCounter = 300000;
  private currentBatchId = '';

  constructor(
    private readonly validator: DataQualityValidator,
    private readonly dimensionLookup: DimensionLookupService,
    config?: Partial<TransformerConfig>,
  ) {
    super('GamificationEventTransformer', config);
  }

  /**
   * Validate source data before transformation
   */
  validate(data: GamificationEventSource[]): ValidationResult {
    return this.validator.validate(data, {
      rules: [
        // Required fields
        DataQualityValidator.requiredRule('id'),
        DataQualityValidator.requiredRule('user_id'),
        DataQualityValidator.requiredRule('transaction_type'),
        DataQualityValidator.requiredRule('amount'),
        DataQualityValidator.requiredRule('created_at'),

        // UUID validations
        DataQualityValidator.uuidRule('id'),
        DataQualityValidator.uuidRule('user_id'),

        // Type validations
        DataQualityValidator.typeRule('amount', 'number'),
        DataQualityValidator.typeRule('balance_after', 'number', ValidationSeverity.WARNING),

        // Range validations (amount can be negative for some transaction types)
        DataQualityValidator.rangeRule('balance_after', 0, undefined, ValidationSeverity.WARNING),
      ],
      duplicateKeyFields: ['id'],
      failFast: false,
      maxErrors: 2000,
      referenceTables: {
        user_id: 'auth_management.profiles',
        achievement_id: 'gamification_system.achievements',
      },
    });
  }

  /**
   * Validate a single record before transformation
   */
  protected validateRecord(record: GamificationEventSource): PreValidationResult {
    if (!record.id) {
      return invalidResult('Missing event ID', 'MISSING_ID', 'id');
    }

    if (!record.user_id) {
      return invalidResult('Missing user ID', 'MISSING_USER_ID', 'user_id');
    }

    if (!record.transaction_type) {
      return invalidResult(
        'Missing transaction type',
        'MISSING_TRANSACTION_TYPE',
        'transaction_type',
      );
    }

    if (record.amount === null || record.amount === undefined) {
      return invalidResult('Missing amount', 'MISSING_AMOUNT', 'amount');
    }

    if (!record.created_at) {
      return invalidResult('Missing created_at timestamp', 'MISSING_TIMESTAMP', 'created_at');
    }

    return validResult();
  }

  /**
   * Transform a single gamification event record
   */
  protected async transformRecord(
    record: GamificationEventSource,
  ): Promise<FactGamificationEvent | null> {
    // Convert created_at to UTC
    const eventTimestampUtc = this.toUTC(record.created_at);
    if (!eventTimestampUtc) {
      this.logger.warn(`Invalid created_at date for event ${record.id}`);
      return null;
    }

    // Get dimension keys
    const dateKey = this.getDateKey(eventTimestampUtc);
    const timeKey = this.getTimeKey(eventTimestampUtc);
    const studentKey = await this.dimensionLookup.getOrCreateStudentKey(record.user_id);

    // Get optional dimension keys
    let achievementKey: number | null = null;
    if (record.achievement_id) {
      achievementKey = await this.dimensionLookup.getAchievementKey(record.achievement_id);
    }

    let rankKey: number | null = null;
    if (record.rank_to) {
      rankKey = await this.dimensionLookup.getRankKey(record.rank_to);
    }

    // Categorize event type
    const eventType = this.categorizeEventType(record);

    // Calculate net changes
    const { pointsEarned, pointsSpent, netChange } = this.calculateNetChanges(record);

    // Generate surrogate key
    const eventKey = this.eventKeyCounter++;

    return {
      event_key: eventKey,
      date_key: dateKey,
      time_key: timeKey,
      student_key: studentKey,
      achievement_key: achievementKey,
      rank_key: rankKey,
      event_id: record.id,
      event_type: eventType,
      original_type: record.transaction_type,
      description: record.description || this.generateDescription(record, eventType),
      points_earned: pointsEarned,
      points_spent: pointsSpent,
      net_change: netChange,
      balance_after: this.withDefault(record.balance_after, 0),
      xp_earned: this.withDefault(record.xp_earned, 0),
      reference_type: record.reference_type || null,
      reference_id: record.reference_id || null,
      event_timestamp_utc: eventTimestampUtc,
      etl_batch_id: this.currentBatchId,
      etl_loaded_at: new Date(),
    };
  }

  /**
   * Categorize event type from transaction type
   */
  private categorizeEventType(record: GamificationEventSource): GamEventCategory {
    const normalizedType = record.transaction_type.toLowerCase().replace(/[-\s]/g, '_');

    // Check direct mapping
    if (TRANSACTION_TYPE_MAP[normalizedType]) {
      return TRANSACTION_TYPE_MAP[normalizedType];
    }

    // Check for patterns
    if (normalizedType.includes('earn') || record.amount > 0) {
      return GamEventCategory.COINS_EARNED;
    }

    if (normalizedType.includes('spend') || normalizedType.includes('purchase')) {
      return GamEventCategory.COINS_SPENT;
    }

    if (normalizedType.includes('achievement')) {
      return GamEventCategory.ACHIEVEMENT_UNLOCKED;
    }

    if (normalizedType.includes('rank')) {
      return GamEventCategory.RANK_CHANGE;
    }

    if (normalizedType.includes('level')) {
      return GamEventCategory.LEVEL_UP;
    }

    if (normalizedType.includes('streak')) {
      return GamEventCategory.STREAK_UPDATE;
    }

    if (normalizedType.includes('mission')) {
      return GamEventCategory.MISSION_COMPLETED;
    }

    // Default based on amount sign
    return record.amount >= 0
      ? GamEventCategory.COINS_EARNED
      : GamEventCategory.COINS_SPENT;
  }

  /**
   * Calculate net changes from transaction
   */
  private calculateNetChanges(record: GamificationEventSource): {
    pointsEarned: number;
    pointsSpent: number;
    netChange: number;
  } {
    const amount = record.amount;

    if (amount >= 0) {
      return {
        pointsEarned: amount,
        pointsSpent: 0,
        netChange: amount,
      };
    } else {
      return {
        pointsEarned: 0,
        pointsSpent: Math.abs(amount),
        netChange: amount,
      };
    }
  }

  /**
   * Generate description from event data
   */
  private generateDescription(
    record: GamificationEventSource,
    eventType: GamEventCategory,
  ): string {
    switch (eventType) {
      case GamEventCategory.COINS_EARNED:
        return `Earned ${record.amount} ML Coins`;
      case GamEventCategory.COINS_SPENT:
        return `Spent ${Math.abs(record.amount)} ML Coins`;
      case GamEventCategory.XP_EARNED:
        return `Earned ${record.xp_earned || record.amount} XP`;
      case GamEventCategory.ACHIEVEMENT_UNLOCKED:
        return `Unlocked achievement${record.achievement_id ? ` (${record.achievement_id})` : ''}`;
      case GamEventCategory.RANK_CHANGE:
        return `Rank changed${record.rank_from ? ` from ${record.rank_from}` : ''}${record.rank_to ? ` to ${record.rank_to}` : ''}`;
      case GamEventCategory.LEVEL_UP:
        return `Level up${record.level_to ? ` to level ${record.level_to}` : ''}`;
      case GamEventCategory.STREAK_UPDATE:
        return 'Streak updated';
      case GamEventCategory.PURCHASE:
        return `Purchase: ${record.reference_type || 'item'}`;
      case GamEventCategory.REWARD_CLAIMED:
        return 'Reward claimed';
      case GamEventCategory.MISSION_COMPLETED:
        return 'Mission completed';
      case GamEventCategory.COMODIN_USED:
        return 'Comodin used';
      default:
        return record.transaction_type;
    }
  }

  /**
   * Override transform to set batch ID
   */
  async transform(
    data: GamificationEventSource[],
    batchId: string,
  ): Promise<import('../../interfaces').TransformationResult<FactGamificationEvent>> {
    this.currentBatchId = batchId;
    return super.transform(data, batchId);
  }
}
