import { Expose } from 'class-transformer';
import {
  AchievementCategoryEnum,
  DifficultyLevelEnum,
} from '@shared/constants/enums.constants';

/**
 * AchievementResponseDto
 *
 * @description DTO de respuesta con información completa del logro.
 */
export class AchievementResponseDto {
  @Expose()
    id!: string;

  @Expose()
    tenant_id?: string;

  // =====================================================
  // BASIC INFORMATION
  // =====================================================

  @Expose()
    name!: string;

  @Expose()
    description?: string;

  @Expose()
    icon!: string;

  // =====================================================
  // CATEGORIZATION
  // =====================================================

  @Expose()
    category!: AchievementCategoryEnum;

  @Expose()
    rarity!: string;

  @Expose()
    difficulty_level!: DifficultyLevelEnum;

  // =====================================================
  // CONDITIONS & REWARDS
  // =====================================================

  @Expose()
    conditions!: Record<string, unknown>;

  /**
   * Canonical rewards object (REC-012).
   * Always contains: { xp: number, ml_coins: number, badge?: string }
   * Frontend consumers should use this as the primary source of reward values.
   */
  @Expose()
    rewards!: Record<string, unknown>;

  /**
   * @deprecated REC-012: Use rewards.ml_coins instead.
   * Kept for backwards compatibility — will be removed in a future version.
   */
  @Expose()
    ml_coins_reward!: number;

  // =====================================================
  // VISIBILITY & STATUS
  // =====================================================

  @Expose()
    is_secret!: boolean;

  @Expose()
    is_active!: boolean;

  @Expose()
    is_repeatable!: boolean;

  // =====================================================
  // ORDERING & POINTS
  // =====================================================

  @Expose()
    order_index!: number;

  /**
   * @deprecated REC-012: Use rewards.xp instead.
   * Kept for backwards compatibility — will be removed in a future version.
   */
  @Expose()
    points_value!: number;

  // =====================================================
  // MESSAGING & GUIDANCE
  // =====================================================

  @Expose()
    unlock_message?: string;

  @Expose()
    instructions?: string;

  @Expose()
    tips?: string[];

  // =====================================================
  // METADATA & AUDIT
  // =====================================================

  @Expose()
    metadata!: Record<string, unknown>;

  @Expose()
    created_by?: string;

  @Expose()
    created_at!: Date;

  @Expose()
    updated_at!: Date;
}
