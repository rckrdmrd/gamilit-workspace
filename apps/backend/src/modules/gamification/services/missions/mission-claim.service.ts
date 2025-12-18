/**
 * MissionClaimService
 *
 * @description Service for claiming mission rewards.
 * Extracted from MissionsService (P0-006: God Class division).
 *
 * Responsibilities:
 * - Validate mission completion status
 * - Distribute ML Coins and XP rewards
 * - Update mission status to CLAIMED
 * - Generate claim receipts/history
 *
 * @see MissionsService - Orchestrates mission operations
 * @see MissionGeneratorService - Generates missions
 * @see MissionProgressService - Tracks progress
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Mission,
  MissionStatusEnum,
} from '../../entities/mission.entity';
import { MLCoinsService } from '../ml-coins.service';
import { UserStatsService } from '../user-stats.service';
import { RanksService } from '../ranks.service';
import { TransactionTypeEnum } from '@shared/constants/enums.constants';

/**
 * Claim result structure
 */
export interface MissionClaimResult {
  missionId: string;
  title: string;
  mlCoinsEarned: number;
  xpEarned: number;
  claimedAt: Date;
  rankUp?: {
    newRank: string;
    previousRank: string;
  };
}

/**
 * Mission statistics DTO
 */
export interface MissionStatsDto {
  totalCompleted: number;
  totalClaimed: number;
  totalExpired: number;
  totalActive: number;
  mlCoinsEarned: number;
  xpEarned: number;
  currentStreak: number;
  longestStreak: number;
}

@Injectable()
export class MissionClaimService {
  private readonly logger = new Logger(MissionClaimService.name);

  constructor(
    @InjectRepository(Mission, 'gamification')
    private readonly missionsRepo: Repository<Mission>,
    private readonly mlCoinsService: MLCoinsService,
    private readonly userStatsService: UserStatsService,
    private readonly ranksService: RanksService,
  ) {}

  /**
   * Claims rewards for a completed mission
   *
   * @param missionId - Mission ID
   * @param profileId - User's profile ID (for validation)
   * @returns MissionClaimResult with reward details
   */
  async claimMission(
    missionId: string,
    profileId: string,
  ): Promise<MissionClaimResult> {
    const mission = await this.missionsRepo.findOne({ where: { id: missionId } });

    if (!mission) {
      throw new NotFoundException(`Mission ${missionId} not found`);
    }

    // Validate ownership
    if (mission.user_id !== profileId) {
      throw new BadRequestException('You cannot claim rewards for another user\'s mission');
    }

    // Validate status
    if (mission.status !== MissionStatusEnum.COMPLETED) {
      if (mission.status === MissionStatusEnum.CLAIMED) {
        throw new BadRequestException('Rewards already claimed for this mission');
      }
      throw new BadRequestException(
        `Cannot claim rewards for mission with status: ${mission.status}`,
      );
    }

    // Distribute ML Coins
    const mlCoinsReward = mission.rewards?.ml_coins || 0;
    if (mlCoinsReward > 0) {
      try {
        await this.mlCoinsService.addCoins(
          profileId,
          mlCoinsReward,
          TransactionTypeEnum.EARNED_BONUS,
          `Mission completed: ${mission.title}`,
          mission.id,
          'mission',
        );
      } catch (error) {
        this.logger.error(
          `Failed to add ML Coins for mission ${missionId}: ${error}`,
        );
        throw new BadRequestException('Failed to distribute ML Coins reward');
      }
    }

    // Distribute XP
    const xpReward = mission.rewards?.xp || 0;
    const rankUp: MissionClaimResult['rankUp'] = undefined;

    if (xpReward > 0) {
      try {
        // addXp returns UserStats - rank promotion is handled by database trigger
        await this.userStatsService.addXp(profileId, xpReward);
        // Note: Rank promotion is automatic via trg_check_rank_promotion_on_xp_gain trigger
      } catch (error) {
        this.logger.error(
          `Failed to add XP for mission ${missionId}: ${error}`,
        );
        // Don't throw - XP is less critical than coins
      }
    }

    // Update mission status
    mission.status = MissionStatusEnum.CLAIMED;
    mission.claimed_at = new Date();
    await this.missionsRepo.save(mission);

    this.logger.log(
      `Mission ${missionId} claimed: ${mlCoinsReward} coins, ${xpReward} XP`,
    );

    return {
      missionId: mission.id,
      title: mission.title,
      mlCoinsEarned: mlCoinsReward,
      xpEarned: xpReward,
      claimedAt: mission.claimed_at,
      rankUp,
    };
  }

  /**
   * Claims all completed missions for a user
   *
   * @param profileId - User's profile ID
   * @returns Array of claim results
   */
  async claimAllCompleted(profileId: string): Promise<MissionClaimResult[]> {
    const completedMissions = await this.missionsRepo.find({
      where: {
        user_id: profileId,
        status: MissionStatusEnum.COMPLETED,
      },
    });

    const results: MissionClaimResult[] = [];

    for (const mission of completedMissions) {
      try {
        const result = await this.claimMission(mission.id, profileId);
        results.push(result);
      } catch (error) {
        this.logger.error(
          `Failed to claim mission ${mission.id}: ${error}`,
        );
        // Continue with other missions
      }
    }

    return results;
  }

  /**
   * Gets mission statistics for a user
   *
   * @param profileId - User's profile ID
   * @returns MissionStatsDto
   */
  async getMissionStats(profileId: string): Promise<MissionStatsDto> {
    const missions = await this.missionsRepo.find({
      where: { user_id: profileId },
    });

    const stats: MissionStatsDto = {
      totalCompleted: 0,
      totalClaimed: 0,
      totalExpired: 0,
      totalActive: 0,
      mlCoinsEarned: 0,
      xpEarned: 0,
      currentStreak: 0,
      longestStreak: 0,
    };

    for (const mission of missions) {
      switch (mission.status) {
        case MissionStatusEnum.COMPLETED:
          stats.totalCompleted++;
          break;
        case MissionStatusEnum.CLAIMED:
          stats.totalClaimed++;
          stats.mlCoinsEarned += mission.rewards?.ml_coins || 0;
          stats.xpEarned += mission.rewards?.xp || 0;
          break;
        case MissionStatusEnum.EXPIRED:
          stats.totalExpired++;
          break;
        case MissionStatusEnum.ACTIVE:
        case MissionStatusEnum.IN_PROGRESS:
          stats.totalActive++;
          break;
      }
    }

    // Calculate streak from claimed daily missions
    const dailyClaimedDates = missions
      .filter(
        (m) =>
          m.status === MissionStatusEnum.CLAIMED &&
          m.mission_type === 'daily' &&
          m.claimed_at,
      )
      .map((m) => m.claimed_at!.toDateString())
      .filter((v, i, a) => a.indexOf(v) === i) // Unique dates
      .sort();

    stats.currentStreak = this.calculateCurrentStreak(dailyClaimedDates);
    stats.longestStreak = this.calculateLongestStreak(dailyClaimedDates);

    return stats;
  }

  /**
   * Calculates current streak from dates
   *
   * @private
   */
  private calculateCurrentStreak(sortedDates: string[]): number {
    if (sortedDates.length === 0) return 0;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // Check if last activity was today or yesterday
    const lastDate = sortedDates[sortedDates.length - 1];
    if (lastDate !== today && lastDate !== yesterday) {
      return 0;
    }

    let streak = 1;
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const current = new Date(sortedDates[i + 1]);
      const previous = new Date(sortedDates[i]);
      const diffDays = Math.floor(
        (current.getTime() - previous.getTime()) / 86400000,
      );

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculates longest streak from dates
   *
   * @private
   */
  private calculateLongestStreak(sortedDates: string[]): number {
    if (sortedDates.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i]);
      const previous = new Date(sortedDates[i - 1]);
      const diffDays = Math.floor(
        (current.getTime() - previous.getTime()) / 86400000,
      );

      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }
}
