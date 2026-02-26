/**
 * MissionGeneratorService
 *
 * @description Service for generating daily/weekly missions.
 * Extracted from MissionsService (P0-006: God Class division).
 *
 * Responsibilities:
 * - Generate daily missions (3 per day)
 * - Generate weekly missions (2 per week)
 * - Template selection based on user level
 * - Mission scheduling and expiration
 *
 * @see MissionsService - Orchestrates mission operations
 * @see MissionProgressService - Handles progress tracking
 * @see MissionClaimService - Handles reward claiming
 */
import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Mission,
  MissionTypeEnum,
  MissionStatusEnum,
  MissionObjective,
  MissionRewards,
} from '../../entities/mission.entity';
import { MissionTemplate, MissionTemplateTypeEnum } from '../../entities/mission-template.entity';
import { MissionTemplatesService } from '../mission-templates.service';

/**
 * Generated missions result
 */
export interface GeneratedMissionsResult {
  missions: Mission[];
  expiredCount: number;
}

@Injectable()
export class MissionGeneratorService {
  private readonly logger = new Logger(MissionGeneratorService.name);

  constructor(
    @InjectRepository(Mission, 'gamification')
    private readonly missionsRepo: Repository<Mission>,
    private readonly templatesService: MissionTemplatesService,
  ) {}

  /**
   * Generates 3 daily missions for a user
   *
   * @param profileId - profiles.id (NOT auth.users.id!)
   * @param userLevel - User's current level (for template filtering)
   * @returns Array of 3 generated daily missions
   */
  async generateDailyMissions(
    profileId: string,
    userLevel: number = 1,
  ): Promise<Mission[]> {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Expire old daily missions first
    await this.expireMissions(profileId, MissionTypeEnum.DAILY);

    // Get available templates for user's level
    const templates = await this.templatesService.getActiveByType(
      'daily' as MissionTemplateTypeEnum,
      userLevel,
    );

    if (templates.length === 0) {
      this.logger.warn(`No daily templates available for level ${userLevel}`);
      return [];
    }

    // Select 3 random templates weighted by priority
    const selectedTemplates = this.selectWeightedRandom(templates, 3);

    // Create missions from templates
    const missions: Mission[] = [];
    for (const template of selectedTemplates) {
      const mission = await this.createMissionFromTemplate(
        profileId,
        template,
        endOfDay,
      );
      missions.push(mission);
    }

    this.logger.log(
      `Generated ${missions.length} daily missions for profile ${profileId}`,
    );

    return missions;
  }

  /**
   * Generates 2 weekly missions for a user
   *
   * @param profileId - profiles.id (NOT auth.users.id!)
   * @param userLevel - User's current level (for template filtering)
   * @returns Array of 2 generated weekly missions
   */
  async generateWeeklyMissions(
    profileId: string,
    userLevel: number = 1,
  ): Promise<Mission[]> {
    const now = new Date();
    const endOfWeek = this.getEndOfWeek(now);

    // Expire old weekly missions first
    await this.expireMissions(profileId, MissionTypeEnum.WEEKLY);

    // Get available weekly templates
    const templates = await this.templatesService.getActiveByType(
      'weekly' as MissionTemplateTypeEnum,
      userLevel,
    );

    if (templates.length === 0) {
      this.logger.warn(`No weekly templates available for level ${userLevel}`);
      return [];
    }

    // Select 2 random templates
    const selectedTemplates = this.selectWeightedRandom(templates, 2);

    // Create missions from templates
    const missions: Mission[] = [];
    for (const template of selectedTemplates) {
      const mission = await this.createMissionFromTemplate(
        profileId,
        template,
        endOfWeek,
      );
      missions.push(mission);
    }

    this.logger.log(
      `Generated ${missions.length} weekly missions for profile ${profileId}`,
    );

    return missions;
  }

  /**
   * Creates a mission entity from a template
   *
   * @param profileId - User's profile ID
   * @param template - Mission template
   * @param endDate - Mission expiration date
   * @returns Created mission
   */
  async createMissionFromTemplate(
    profileId: string,
    template: MissionTemplate,
    endDate: Date,
  ): Promise<Mission> {
    const mission = this.missionsRepo.create({
      user_id: profileId,
      template_id: template.id,
      title: template.name,
      description: template.description,
      mission_type: template.type as unknown as MissionTypeEnum,
      objectives: [
        {
          type: template.target_type,
          target: template.target_value,
          current: 0,
          description: template.description,
        },
      ] as MissionObjective[],
      rewards: {
        ml_coins: template.ml_coins_reward,
        xp: template.xp_reward,
      } as MissionRewards,
      status: MissionStatusEnum.IN_PROGRESS,
      progress: 0,
      start_date: new Date(),
      end_date: endDate,
    });

    return this.missionsRepo.save(mission);
  }

  /**
   * Expires missions that are past their end_date
   *
   * @param profileId - User's profile ID
   * @param type - Mission type to expire
   * @returns Number of expired missions
   */
  async expireMissions(
    profileId: string,
    type?: MissionTypeEnum,
  ): Promise<number> {
    const now = new Date();

    const queryBuilder = this.missionsRepo
      .createQueryBuilder()
      .update(Mission)
      .set({ status: MissionStatusEnum.EXPIRED })
      .where('user_id = :profileId', { profileId })
      .andWhere('end_date < :now', { now })
      .andWhere('status IN (:...statuses)', {
        statuses: [MissionStatusEnum.ACTIVE, MissionStatusEnum.IN_PROGRESS],
      });

    if (type) {
      queryBuilder.andWhere('mission_type = :type', { type });
    }

    const result = await queryBuilder.execute();
    const expiredCount = result.affected || 0;

    if (expiredCount > 0) {
      this.logger.log(`Expired ${expiredCount} missions for profile ${profileId}`);
    }

    return expiredCount;
  }

  /**
   * Selects random templates weighted by priority
   *
   * @private
   */
  private selectWeightedRandom(
    templates: MissionTemplate[],
    count: number,
  ): MissionTemplate[] {
    if (templates.length <= count) {
      return templates;
    }

    // Simple weighted selection by priority
    const weighted = templates.flatMap((t) =>
      Array(t.priority || 1).fill(t),
    );

    const selected: MissionTemplate[] = [];
    const usedIds = new Set<string>();

    while (selected.length < count && weighted.length > 0) {
      const randomIndex = Math.floor(Math.random() * weighted.length);
      const template = weighted[randomIndex];

      if (!usedIds.has(template.id)) {
        selected.push(template);
        usedIds.add(template.id);
      }

      // Remove all instances of selected template
      weighted.splice(randomIndex, 1);
    }

    return selected;
  }

  /**
   * Gets end of current week (Sunday 23:59:59)
   *
   * @private
   */
  private getEndOfWeek(date: Date): Date {
    const endOfWeek = new Date(date);
    const dayOfWeek = endOfWeek.getDay();
    const daysUntilSunday = 7 - dayOfWeek;
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  }
}
