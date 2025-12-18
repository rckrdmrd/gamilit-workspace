/**
 * MissionProgressService
 *
 * @description Service for tracking mission progress.
 * Extracted from MissionsService (P0-006: God Class division).
 *
 * Responsibilities:
 * - Track objective progress
 * - Update mission status (active -> in_progress -> completed)
 * - Calculate overall mission completion percentage
 * - Emit progress events for real-time updates
 *
 * @see MissionsService - Orchestrates mission operations
 * @see MissionGeneratorService - Generates missions
 * @see MissionClaimService - Handles reward claiming
 */
import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Mission,
  MissionStatusEnum,
  MissionObjective,
} from '../../entities/mission.entity';

/**
 * Progress update result
 */
export interface ProgressUpdateResult {
  missionId: string;
  previousProgress: number;
  newProgress: number;
  isCompleted: boolean;
  objectivesCompleted: number;
  totalObjectives: number;
}

/**
 * Activity types that can trigger mission progress
 */
export type MissionActivityType =
  | 'complete_exercise'
  | 'earn_xp'
  | 'use_comodin'
  | 'login_daily'
  | 'perfect_score'
  | 'exercise_marathon';

/**
 * Activity data for progress updates
 */
export interface ActivityData {
  type: MissionActivityType;
  value: number;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class MissionProgressService {
  private readonly logger = new Logger(MissionProgressService.name);

  constructor(
    @InjectRepository(Mission, 'gamification')
    private readonly missionsRepo: Repository<Mission>,
  ) {}

  /**
   * Updates mission progress based on user activity
   *
   * @param profileId - User's profile ID
   * @param activity - Activity data
   * @returns Array of progress update results
   */
  async updateProgress(
    profileId: string,
    activity: ActivityData,
  ): Promise<ProgressUpdateResult[]> {
    // Get all active/in_progress missions for user
    const missions = await this.missionsRepo.find({
      where: {
        user_id: profileId,
        status: In([MissionStatusEnum.ACTIVE, MissionStatusEnum.IN_PROGRESS]),
      },
    });

    const results: ProgressUpdateResult[] = [];

    for (const mission of missions) {
      // Check if any objective matches the activity type
      const matchingObjectives = mission.objectives.filter((obj) =>
        this.activityMatchesObjective(activity.type, obj.type),
      );

      if (matchingObjectives.length === 0) {
        continue;
      }

      const previousProgress = mission.progress;
      let hasChanges = false;

      // Update matching objectives
      for (const objective of matchingObjectives) {
        if (objective.current < objective.target) {
          objective.current = Math.min(
            objective.current + activity.value,
            objective.target,
          );
          hasChanges = true;
        }
      }

      if (!hasChanges) {
        continue;
      }

      // Recalculate overall progress
      const newProgress = this.calculateOverallProgress(mission.objectives);
      mission.progress = newProgress;

      // Update status
      if (newProgress >= 100) {
        mission.status = MissionStatusEnum.COMPLETED;
        mission.completed_at = new Date();
      } else if (mission.status === MissionStatusEnum.ACTIVE) {
        mission.status = MissionStatusEnum.IN_PROGRESS;
      }

      // Save changes
      await this.missionsRepo.save(mission);

      const objectivesCompleted = mission.objectives.filter(
        (obj) => obj.current >= obj.target,
      ).length;

      results.push({
        missionId: mission.id,
        previousProgress,
        newProgress,
        isCompleted: newProgress >= 100,
        objectivesCompleted,
        totalObjectives: mission.objectives.length,
      });

      this.logger.log(
        `Mission ${mission.id} progress: ${previousProgress}% -> ${newProgress}%`,
      );
    }

    return results;
  }

  /**
   * Gets current progress for a specific mission
   *
   * @param missionId - Mission ID
   * @returns Mission with current progress
   */
  async getMissionProgress(missionId: string): Promise<Mission> {
    const mission = await this.missionsRepo.findOne({ where: { id: missionId } });

    if (!mission) {
      throw new NotFoundException(`Mission ${missionId} not found`);
    }

    return mission;
  }

  /**
   * Gets all active missions with progress for a user
   *
   * @param profileId - User's profile ID
   * @returns Array of missions with progress
   */
  async getActiveMissionsWithProgress(profileId: string): Promise<Mission[]> {
    return this.missionsRepo.find({
      where: {
        user_id: profileId,
        status: In([MissionStatusEnum.ACTIVE, MissionStatusEnum.IN_PROGRESS]),
      },
      order: {
        end_date: 'ASC',
      },
    });
  }

  /**
   * Checks if an activity type matches an objective type
   *
   * @private
   */
  private activityMatchesObjective(
    activityType: MissionActivityType,
    objectiveType: string,
  ): boolean {
    const mappings: Record<MissionActivityType, string[]> = {
      complete_exercise: ['complete_exercises', 'exercise_count'],
      earn_xp: ['earn_xp', 'xp_total'],
      use_comodin: ['use_comodines', 'comodin_count'],
      login_daily: ['daily_login', 'login_streak'],
      perfect_score: ['perfect_scores', 'perfect_count'],
      exercise_marathon: ['exercise_marathon', 'marathon_count'],
    };

    const matchingTypes = mappings[activityType] || [];
    return matchingTypes.includes(objectiveType);
  }

  /**
   * Calculates overall progress percentage from objectives
   *
   * @private
   */
  private calculateOverallProgress(objectives: MissionObjective[]): number {
    if (objectives.length === 0) {
      return 0;
    }

    const totalProgress = objectives.reduce((sum, obj) => {
      const objectiveProgress = Math.min(
        (obj.current / obj.target) * 100,
        100,
      );
      return sum + objectiveProgress;
    }, 0);

    return Math.round(totalProgress / objectives.length);
  }

  /**
   * Manually sets objective progress (for admin/testing)
   *
   * @param missionId - Mission ID
   * @param objectiveIndex - Index of objective to update
   * @param newValue - New progress value
   * @returns Updated mission
   */
  async setObjectiveProgress(
    missionId: string,
    objectiveIndex: number,
    newValue: number,
  ): Promise<Mission> {
    const mission = await this.missionsRepo.findOne({ where: { id: missionId } });

    if (!mission) {
      throw new NotFoundException(`Mission ${missionId} not found`);
    }

    if (objectiveIndex < 0 || objectiveIndex >= mission.objectives.length) {
      throw new NotFoundException(`Objective index ${objectiveIndex} not found`);
    }

    mission.objectives[objectiveIndex].current = Math.min(
      newValue,
      mission.objectives[objectiveIndex].target,
    );

    // Recalculate progress
    mission.progress = this.calculateOverallProgress(mission.objectives);

    if (mission.progress >= 100) {
      mission.status = MissionStatusEnum.COMPLETED;
      mission.completed_at = new Date();
    } else if (mission.progress > 0) {
      mission.status = MissionStatusEnum.IN_PROGRESS;
    }

    return this.missionsRepo.save(mission);
  }
}
