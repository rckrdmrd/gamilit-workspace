/**
 * ExerciseRewardsService
 *
 * @description Service for distributing rewards after exercise completion.
 * Extracted from ExerciseSubmissionService (P0-006: God Class division).
 *
 * Responsibilities:
 * - XP distribution via UserStatsService
 * - ML Coins distribution via MLCoinsService
 * - Mission progress updates
 * - Rank advancement checks
 * - Perfect score bonuses
 *
 * @see ExerciseSubmissionService - Orchestrates validation + grading + rewards
 * @see MLCoinsService - Handles ML Coin transactions
 * @see UserStatsService - Handles XP and stats updates
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseSubmission } from '../../entities';
import { Profile } from '@/modules/auth/entities';
import { Exercise } from '@/modules/educational/entities';
import { UserStatsService } from '@/modules/gamification/services/user-stats.service';
import { MLCoinsService } from '@/modules/gamification/services/ml-coins.service';
import { MissionsService } from '@/modules/gamification/services/missions.service';
import { TransactionTypeEnum } from '@shared/constants/enums.constants';
import { MissionTypeEnum } from '@/modules/gamification/entities/mission.entity';

/**
 * Reward claim result
 */
export interface RewardClaimResult {
  xpEarned: number;
  mlCoinsEarned: number;
  bonusMultiplier: number;
  perfectScoreBonus: boolean;
  rankUp?: {
    newRank: string;
    previousRank: string;
  };
  missionsProgressed: string[];
}

/**
 * Reward calculation input
 */
export interface RewardCalculationInput {
  score: number;
  maxScore: number;
  hintUsed: boolean;
  hintsCount: number;
  comodinesUsed: string[];
  mlCoinsSpent: number;
  attemptNumber: number;
  exerciseType: string;
  difficulty?: string;
}

/**
 * Base rewards configuration
 */
const BASE_REWARDS = {
  xpPerCorrectAnswer: 10,
  mlCoinsPerExercise: 5,
  perfectScoreBonusMultiplier: 1.5,
  noHintBonusMultiplier: 1.2,
  firstAttemptBonusMultiplier: 1.1,
  difficultyMultipliers: {
    easy: 1.0,
    medium: 1.25,
    hard: 1.5,
    expert: 2.0,
  },
};

@Injectable()
export class ExerciseRewardsService {
  private readonly logger = new Logger(ExerciseRewardsService.name);

  constructor(
    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly submissionRepo: Repository<ExerciseSubmission>,
    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepo: Repository<Exercise>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
    private readonly userStatsService: UserStatsService,
    private readonly mlCoinsService: MLCoinsService,
    private readonly missionsService: MissionsService,
  ) {}

  /**
   * Claims rewards for a completed exercise submission
   *
   * @param submissionId - Submission ID
   * @returns RewardClaimResult with all rewards distributed
   */
  async claimRewards(submissionId: string): Promise<RewardClaimResult> {
    const submission = await this.submissionRepo.findOne({ where: { id: submissionId } });

    if (!submission) {
      throw new NotFoundException(`Submission ${submissionId} not found`);
    }

    // Check if rewards already claimed (using metadata since entity doesn't have rewards_claimed)
    const submissionAny = submission as any;
    if (submissionAny.rewards_claimed) {
      throw new BadRequestException('Rewards already claimed for this submission');
    }

    if (!submission.is_correct || submission.status !== 'graded') {
      throw new BadRequestException(
        'Cannot claim rewards for incorrect or ungraded submission',
      );
    }

    const exercise = await this.exerciseRepo.findOne({
      where: { id: submission.exercise_id },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise ${submission.exercise_id} not found`);
    }

    // Calculate rewards
    const calculationInput: RewardCalculationInput = {
      score: submission.score,
      maxScore: submission.max_score,
      hintUsed: submission.hint_used || false,
      hintsCount: submission.hints_count || 0,
      comodinesUsed: submission.comodines_used || [],
      mlCoinsSpent: submission.ml_coins_spent || 0,
      attemptNumber: submission.attempt_number || 1,
      exerciseType: exercise.exercise_type,
      difficulty: exercise.difficulty_level,
    };

    const rewards = this.calculateRewards(calculationInput);

    // Distribute XP
    const rankUp: RewardClaimResult['rankUp'] = undefined;
    try {
      // addXp returns UserStats - rank promotion handled by DB trigger
      await this.userStatsService.addXp(
        submission.user_id,
        rewards.xpEarned,
      );
    } catch (error) {
      this.logger.error(
        `Failed to add XP: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Distribute ML Coins
    try {
      await this.mlCoinsService.addCoins(
        submission.user_id,
        rewards.mlCoinsEarned,
        TransactionTypeEnum.EARNED_EXERCISE,
        `Exercise completion: ${exercise.title}`,
        submission.id,
        'exercise_submission',
      );
    } catch (error) {
      this.logger.error(
        `Failed to add ML Coins: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Update mission progress
    const missionsProgressed: string[] = [];
    try {
      const progressedMissions = await this.updateMissionProgress(
        submission.user_id,
        exercise,
        rewards,
      );
      missionsProgressed.push(...progressedMissions);
    } catch (error) {
      this.logger.error(
        `Failed to update missions: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Mark rewards as claimed (using any since entity may not have these properties)
    (submission as any).rewards_claimed = true;
    (submission as any).xp_earned = rewards.xpEarned;
    (submission as any).ml_coins_earned = rewards.mlCoinsEarned;
    await this.submissionRepo.save(submission);

    this.logger.log(
      `Rewards claimed for submission ${submissionId}: ` +
      `XP=${rewards.xpEarned}, Coins=${rewards.mlCoinsEarned}, ` +
      `Bonus=${rewards.bonusMultiplier}x`,
    );

    return {
      ...rewards,
      rankUp,
      missionsProgressed,
    };
  }

  /**
   * Calculates rewards based on exercise performance
   *
   * @param input - Reward calculation input
   * @returns Calculated rewards
   */
  calculateRewards(input: RewardCalculationInput): Omit<RewardClaimResult, 'rankUp' | 'missionsProgressed'> {
    const percentage = (input.score / input.maxScore) * 100;
    const isPerfect = input.score === input.maxScore && !input.hintUsed;

    // Base rewards
    let xpEarned = Math.round((percentage / 100) * BASE_REWARDS.xpPerCorrectAnswer * 10);
    let mlCoinsEarned = BASE_REWARDS.mlCoinsPerExercise;
    let bonusMultiplier = 1.0;

    // Difficulty multiplier
    const difficultyKey = (input.difficulty || 'medium') as keyof typeof BASE_REWARDS.difficultyMultipliers;
    const difficultyMultiplier = BASE_REWARDS.difficultyMultipliers[difficultyKey] || 1.0;
    bonusMultiplier *= difficultyMultiplier;

    // Perfect score bonus
    if (isPerfect) {
      bonusMultiplier *= BASE_REWARDS.perfectScoreBonusMultiplier;
      mlCoinsEarned += 3; // Extra coins for perfect
    }

    // No hint bonus
    if (!input.hintUsed && input.hintsCount === 0) {
      bonusMultiplier *= BASE_REWARDS.noHintBonusMultiplier;
    }

    // First attempt bonus
    if (input.attemptNumber === 1) {
      bonusMultiplier *= BASE_REWARDS.firstAttemptBonusMultiplier;
    }

    // Apply multiplier to XP
    xpEarned = Math.round(xpEarned * bonusMultiplier);

    // Scale ML coins with difficulty
    mlCoinsEarned = Math.round(mlCoinsEarned * difficultyMultiplier);

    // Subtract spent coins (net gain)
    const netMlCoins = Math.max(0, mlCoinsEarned - input.mlCoinsSpent);

    return {
      xpEarned,
      mlCoinsEarned: netMlCoins,
      bonusMultiplier: Math.round(bonusMultiplier * 100) / 100,
      perfectScoreBonus: isPerfect,
    };
  }

  /**
   * Updates mission progress after exercise completion
   *
   * @private
   */
  private async updateMissionProgress(
    userId: string,
    exercise: Exercise,
    rewards: Omit<RewardClaimResult, 'rankUp' | 'missionsProgressed'>,
  ): Promise<string[]> {
    const progressedMissions: string[] = [];

    try {
      // Update daily missions
      const dailyMissions = await this.missionsService.findByTypeAndUser(
        userId,
        MissionTypeEnum.DAILY,
      );

      for (const mission of dailyMissions) {
        // Check if mission objective matches this activity
        for (const objective of mission.objectives) {
          if (
            objective.type === 'complete_exercises' ||
            objective.type === 'earn_xp'
          ) {
            // Mission progress is handled by MissionsService
            progressedMissions.push(mission.id);
          }
        }
      }

      // Update weekly missions similarly
      const weeklyMissions = await this.missionsService.findByTypeAndUser(
        userId,
        MissionTypeEnum.WEEKLY,
      );

      for (const mission of weeklyMissions) {
        for (const objective of mission.objectives) {
          if (
            objective.type === 'complete_exercises' ||
            objective.type === 'exercise_marathon'
          ) {
            progressedMissions.push(mission.id);
          }
        }
      }
    } catch (error) {
      this.logger.warn(
        `Could not update mission progress: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return [...new Set(progressedMissions)]; // Deduplicate
  }

  /**
   * Gets reward preview without claiming
   *
   * @param submissionId - Submission ID
   * @returns Preview of potential rewards
   */
  async getRewardPreview(
    submissionId: string,
  ): Promise<Omit<RewardClaimResult, 'rankUp' | 'missionsProgressed'>> {
    const submission = await this.submissionRepo.findOne({ where: { id: submissionId } });

    if (!submission) {
      throw new NotFoundException(`Submission ${submissionId} not found`);
    }

    const exercise = await this.exerciseRepo.findOne({
      where: { id: submission.exercise_id },
    });

    const calculationInput: RewardCalculationInput = {
      score: submission.score,
      maxScore: submission.max_score,
      hintUsed: submission.hint_used || false,
      hintsCount: submission.hints_count || 0,
      comodinesUsed: submission.comodines_used || [],
      mlCoinsSpent: submission.ml_coins_spent || 0,
      attemptNumber: submission.attempt_number || 1,
      exerciseType: exercise?.exercise_type || 'unknown',
      difficulty: exercise?.difficulty_level,
    };

    return this.calculateRewards(calculationInput);
  }
}
