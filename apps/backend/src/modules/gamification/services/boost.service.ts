import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { ActiveBoost } from '../entities/active-boost.entity';

/**
 * BoostService
 *
 * @description Manages temporary boosts (XP, COINS) for users.
 * Handles activation, expiration, and multiplier queries.
 *
 * @see Entity: ActiveBoost
 * @see DDL: gamification_system.active_boosts
 */
@Injectable()
export class BoostService {
  private readonly logger = new Logger(BoostService.name);

  constructor(
    @InjectRepository(ActiveBoost, 'gamification')
    private readonly activeBoostRepository: Repository<ActiveBoost>,
  ) {}

  /**
   * Gets all active (non-expired) boosts for a user.
   * Automatically deactivates expired boosts before returning.
   *
   * @param userId - ID of the user
   * @returns Array of active boosts
   */
  async getActiveBoosts(userId: string): Promise<ActiveBoost[]> {
    // Deactivate expired boosts first
    await this.deactivateExpiredBoosts(userId);

    return this.activeBoostRepository.find({
      where: { user_id: userId, is_active: true },
      order: { activated_at: 'DESC' },
    });
  }

  /**
   * Gets the active multiplier for a specific boost type.
   * Returns 1.0 if no active boost exists.
   *
   * @param userId - ID of the user
   * @param boostType - Type of boost (XP or COINS)
   * @returns The active multiplier (1.0 if no boost)
   */
  async getActiveMultiplier(
    userId: string,
    boostType: 'XP' | 'COINS',
  ): Promise<number> {
    // Deactivate expired boosts first
    await this.deactivateExpiredBoosts(userId);

    const boost = await this.activeBoostRepository.findOne({
      where: { user_id: userId, boost_type: boostType, is_active: true },
      order: { multiplier: 'DESC' },
    });

    return boost ? Number(boost.multiplier) : 1.0;
  }

  /**
   * Activates a boost for a user, deactivating any existing boost of the same type.
   *
   * @param userId - ID of the user
   * @param boostType - Type of boost (XP or COINS)
   * @param multiplier - Multiplier value (e.g. 2.0 for double XP)
   * @param durationDays - Duration in days
   * @param source - Source identifier (e.g. 'ITEM:<purchaseId>')
   */
  async activateBoost(
    userId: string,
    boostType: 'XP' | 'COINS',
    multiplier: number,
    durationDays: number,
    source: string,
  ): Promise<ActiveBoost> {
    // Deactivate any existing boost of the same type for this user
    await this.activeBoostRepository.update(
      { user_id: userId, boost_type: boostType, is_active: true },
      { is_active: false },
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const boost = this.activeBoostRepository.create({
      user_id: userId,
      boost_type: boostType,
      multiplier,
      source,
      activated_at: now,
      expires_at: expiresAt,
      is_active: true,
    });

    return this.activeBoostRepository.save(boost);
  }

  /**
   * Deactivates expired boosts for a user.
   *
   * @param userId - ID of the user
   */
  private async deactivateExpiredBoosts(userId: string): Promise<void> {
    const result = await this.activeBoostRepository.update(
      {
        user_id: userId,
        is_active: true,
        expires_at: LessThanOrEqual(new Date()),
      },
      { is_active: false },
    );

    if (result.affected && result.affected > 0) {
      this.logger.log(
        `Deactivated ${result.affected} expired boost(s) for user ${userId}`,
      );
    }
  }
}
