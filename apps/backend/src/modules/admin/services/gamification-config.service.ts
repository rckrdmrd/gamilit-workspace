import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../entities/system-setting.entity';
import {
  UpdateGamificationSettingsDto,
  GamificationSettingsResponseDto,
  PreviewImpactDto,
  PreviewImpactResultDto,
  RestoreDefaultsResultDto,
  ListParametersQueryDto,
  ParametersListResponseDto,
  ParameterResponseDto,
  UpdateParameterDto,
  UpdateParameterResponseDto,
  MayaRanksResponseDto,
  UpdateMayaRankDto,
  UpdateMayaRankResponseDto,
} from '../dto/gamification-config';

// Default gamification configuration (Level 1 - hardcoded)
const DEFAULT_GAMIFICATION_CONFIG = {
  xp: {
    base_per_exercise: 10,
    completion_multiplier: 1.5,
    perfect_score_bonus: 2.0,
  },
  ranks: {
    thresholds: {
      novice: 0,
      beginner: 100,
      intermediate: 500,
      advanced: 1500,
      expert: 5000,
    },
  },
  coins: {
    welcome_bonus: 500,
    daily_login_reward: 50,
    exercise_completion_reward: 100,
  },
  achievements: {
    criteria: [],
  },
};

/**
 * GamificationConfigService
 *
 * @description Service for managing gamification configuration
 * @module admin
 *
 * Features:
 * - Get/Update gamification settings (XP, ranks, coins, achievements)
 * - Preview impact of configuration changes
 * - Restore to default values
 * - Auto-create default settings on first access
 *
 * Settings are stored in system_configuration.system_settings table
 * with category='gamification'
 */
@Injectable()
export class GamificationConfigService {
  private readonly logger = new Logger(GamificationConfigService.name);

  constructor(
    @InjectRepository(SystemSetting, 'auth')
    private readonly systemSettingRepo: Repository<SystemSetting>,
  ) {}

  /**
   * Get current gamification settings
   *
   * @returns Current configuration with defaults and audit info
   */
  async getGamificationSettings(): Promise<GamificationSettingsResponseDto> {
    // Ensure defaults exist in DB
    await this.ensureDefaultSettings();

    // Fetch all gamification settings
    const settings = await this.systemSettingRepo.find({
      where: { setting_category: 'gamification' },
    });

    // Parse settings into structured response
    const config = this.parseSettings(settings);

    // Get defaults from DB
    const defaults = this.parseDefaults(settings);

    // Get last updated info
    const lastUpdated = settings.reduce((latest, s) => {
      return s.updated_at > latest ? s.updated_at : latest;
    }, new Date(0));

    const updatedBy = settings.find(
      (s) => s.updated_at.getTime() === lastUpdated.getTime(),
    )?.updated_by;

    return {
      xp: config.xp || DEFAULT_GAMIFICATION_CONFIG.xp,
      ranks: config.ranks || DEFAULT_GAMIFICATION_CONFIG.ranks,
      coins: config.coins || DEFAULT_GAMIFICATION_CONFIG.coins,
      achievements:
        config.achievements || DEFAULT_GAMIFICATION_CONFIG.achievements,
      defaults: defaults,
      last_updated: lastUpdated.toISOString(),
      updated_by: updatedBy,
    };
  }

  /**
   * Update gamification settings
   *
   * @param dto Settings to update (partial updates supported)
   * @param adminId Admin user ID performing the update
   * @returns Updated configuration
   * @throws BadRequestException if validation fails
   */
  async updateGamificationSettings(
    dto: UpdateGamificationSettingsDto,
    adminId: string,
  ): Promise<GamificationSettingsResponseDto> {
    // Validate settings
    this.validateSettings(dto);

    // Update each category
    if (dto.xp) {
      await this.updateXpSettings(dto.xp, adminId);
    }

    if (dto.ranks) {
      await this.updateRankSettings(dto.ranks, adminId);
    }

    if (dto.coins) {
      await this.updateCoinsSettings(dto.coins, adminId);
    }

    if (dto.achievements) {
      await this.updateAchievementSettings(dto.achievements, adminId);
    }

    this.logger.log(`Gamification settings updated by admin ${adminId}`);

    // Return updated settings
    return await this.getGamificationSettings();
  }

  /**
   * Preview impact of new settings (without saving)
   *
   * @param dto Proposed settings
   * @returns Estimated impact metrics
   */
  async previewImpact(
    dto: PreviewImpactDto,
  ): Promise<PreviewImpactResultDto> {
    const sampleSize = Math.min(dto.sample_size || 1000, 10000);

    // TODO: Query real user data for accurate preview
    // For MVP, return mock estimates based on sample size
    const usersAffected = Math.floor(sampleSize * 0.8); // 80% of sample affected

    const promotions = dto.ranks
      ? Math.floor(usersAffected * 0.1)
      : 0; // 10% promoted
    const demotions = dto.ranks
      ? Math.floor(usersAffected * 0.02)
      : 0; // 2% demoted

    const avgXpChange = dto.xp
      ? (dto.xp.base_per_exercise - DEFAULT_GAMIFICATION_CONFIG.xp.base_per_exercise) *
        (dto.xp.completion_multiplier || 1)
      : 0;

    const avgCoinsChange = dto.coins
      ? (dto.coins.welcome_bonus || 0) -
        DEFAULT_GAMIFICATION_CONFIG.coins.welcome_bonus
      : 0;

    this.logger.log(
      `Preview calculated for ${usersAffected} users (sample: ${sampleSize})`,
    );

    return {
      users_affected: usersAffected,
      rank_changes: {
        promotions,
        demotions,
      },
      xp_impact: {
        avg_xp_change: parseFloat(avgXpChange.toFixed(2)),
        total_xp_change: parseFloat((avgXpChange * usersAffected).toFixed(2)),
      },
      coins_impact: {
        avg_coins_change: avgCoinsChange,
        total_coins_change: avgCoinsChange * usersAffected,
      },
      preview_timestamp: new Date().toISOString(),
    };
  }

  /**
   * Restore all gamification settings to defaults
   *
   * @param adminId Admin user ID performing the restore
   * @returns List of restored settings
   */
  async restoreDefaults(adminId: string): Promise<RestoreDefaultsResultDto> {
    const settings = await this.systemSettingRepo.find({
      where: { setting_category: 'gamification' },
    });

    const restoredKeys: string[] = [];

    for (const setting of settings) {
      if (setting.default_value && !setting.is_system) {
        setting.setting_value = setting.default_value;
        setting.updated_by = adminId;
        await this.systemSettingRepo.save(setting);
        restoredKeys.push(setting.setting_key);
      }
    }

    this.logger.log(
      `Restored ${restoredKeys.length} settings to defaults by admin ${adminId}`,
    );

    return {
      settings_restored: restoredKeys,
      restored_at: new Date().toISOString(),
      restored_by: adminId,
    };
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  /**
   * Ensure default settings exist in database
   * Creates them if they don't exist
   * @private
   */
  private async ensureDefaultSettings(): Promise<void> {
    const existingCount = await this.systemSettingRepo.count({
      where: { setting_category: 'gamification' },
    });

    if (existingCount === 0) {
      this.logger.log('Creating default gamification settings...');
      await this.createDefaultSettings();
    }
  }

  /**
   * Create default settings in database
   * @private
   */
  private async createDefaultSettings(): Promise<void> {
    const settings: Partial<SystemSetting>[] = [
      // XP Settings
      {
        setting_key: 'gamification.xp.base_per_exercise',
        setting_category: 'gamification',
        setting_subcategory: 'xp',
        setting_value: String(DEFAULT_GAMIFICATION_CONFIG.xp.base_per_exercise),
        value_type: 'number',
        default_value: String(
          DEFAULT_GAMIFICATION_CONFIG.xp.base_per_exercise,
        ),
        display_name: 'Base XP per Exercise',
        description: 'Base XP awarded for completing an exercise',
        min_value: 1,
        max_value: 1000,
        is_public: false,
        is_readonly: false,
        is_system: false,
      },
      {
        setting_key: 'gamification.xp.completion_multiplier',
        setting_category: 'gamification',
        setting_subcategory: 'xp',
        setting_value: String(
          DEFAULT_GAMIFICATION_CONFIG.xp.completion_multiplier,
        ),
        value_type: 'number',
        default_value: String(
          DEFAULT_GAMIFICATION_CONFIG.xp.completion_multiplier,
        ),
        display_name: 'Completion Multiplier',
        description: 'XP multiplier for exercise completion',
        min_value: 1,
        max_value: 5,
        is_public: false,
        is_readonly: false,
        is_system: false,
      },
      {
        setting_key: 'gamification.xp.perfect_score_bonus',
        setting_category: 'gamification',
        setting_subcategory: 'xp',
        setting_value: String(
          DEFAULT_GAMIFICATION_CONFIG.xp.perfect_score_bonus,
        ),
        value_type: 'number',
        default_value: String(
          DEFAULT_GAMIFICATION_CONFIG.xp.perfect_score_bonus,
        ),
        display_name: 'Perfect Score Bonus',
        description: 'Additional XP multiplier for perfect score',
        min_value: 1,
        max_value: 5,
        is_public: false,
        is_readonly: false,
        is_system: false,
      },
      // Rank Settings
      {
        setting_key: 'gamification.ranks.thresholds',
        setting_category: 'gamification',
        setting_subcategory: 'ranks',
        setting_value: JSON.stringify(
          DEFAULT_GAMIFICATION_CONFIG.ranks.thresholds,
        ),
        value_type: 'json',
        default_value: JSON.stringify(
          DEFAULT_GAMIFICATION_CONFIG.ranks.thresholds,
        ),
        display_name: 'Rank Thresholds',
        description: 'XP thresholds for each rank level',
        is_public: false,
        is_readonly: false,
        is_system: false,
      },
      // Coins Settings
      {
        setting_key: 'gamification.coins.welcome_bonus',
        setting_category: 'gamification',
        setting_subcategory: 'coins',
        setting_value: String(
          DEFAULT_GAMIFICATION_CONFIG.coins.welcome_bonus,
        ),
        value_type: 'number',
        default_value: String(
          DEFAULT_GAMIFICATION_CONFIG.coins.welcome_bonus,
        ),
        display_name: 'Welcome Bonus',
        description: 'ML Coins awarded to new users',
        min_value: 0,
        max_value: 10000,
        is_public: false,
        is_readonly: false,
        is_system: false,
      },
      {
        setting_key: 'gamification.coins.daily_login_reward',
        setting_category: 'gamification',
        setting_subcategory: 'coins',
        setting_value: String(
          DEFAULT_GAMIFICATION_CONFIG.coins.daily_login_reward,
        ),
        value_type: 'number',
        default_value: String(
          DEFAULT_GAMIFICATION_CONFIG.coins.daily_login_reward,
        ),
        display_name: 'Daily Login Reward',
        description: 'ML Coins awarded for daily login',
        min_value: 0,
        max_value: 1000,
        is_public: false,
        is_readonly: false,
        is_system: false,
      },
      {
        setting_key: 'gamification.coins.exercise_completion_reward',
        setting_category: 'gamification',
        setting_subcategory: 'coins',
        setting_value: String(
          DEFAULT_GAMIFICATION_CONFIG.coins.exercise_completion_reward,
        ),
        value_type: 'number',
        default_value: String(
          DEFAULT_GAMIFICATION_CONFIG.coins.exercise_completion_reward,
        ),
        display_name: 'Exercise Completion Reward',
        description: 'ML Coins awarded per exercise completion',
        min_value: 0,
        max_value: 1000,
        is_public: false,
        is_readonly: false,
        is_system: false,
      },
      // Achievement Settings
      {
        setting_key: 'gamification.achievements.criteria',
        setting_category: 'gamification',
        setting_subcategory: 'achievements',
        setting_value: JSON.stringify(
          DEFAULT_GAMIFICATION_CONFIG.achievements.criteria,
        ),
        value_type: 'json',
        default_value: JSON.stringify(
          DEFAULT_GAMIFICATION_CONFIG.achievements.criteria,
        ),
        display_name: 'Achievement Criteria',
        description: 'Criteria for unlocking achievements',
        is_public: false,
        is_readonly: false,
        is_system: false,
      },
    ];

    await this.systemSettingRepo.save(settings);
    this.logger.log(`Created ${settings.length} default gamification settings`);
  }

  /**
   * Parse settings array into structured config
   * @private
   */
  private parseSettings(settings: SystemSetting[]): Record<string, any> {
    const config: Record<string, any> = {
      xp: {},
      ranks: {},
      coins: {},
      achievements: {},
    };

    for (const setting of settings) {
      const parts = setting.setting_key.split('.');
      const category = parts[1]; // gamification.{category}.{key}
      const key = parts[2];

      let value: any = setting.setting_value;

      // Parse value based on type
      if (setting.value_type === 'number') {
        value = parseFloat(value);
      } else if (setting.value_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (error) {
          this.logger.warn(`Failed to parse JSON for ${setting.setting_key}`);
          value = {};
        }
      } else if (setting.value_type === 'boolean') {
        value = value === 'true';
      }

      // Assign to config structure
      if (category === 'xp' || category === 'coins') {
        config[category][key] = value;
      } else if (category === 'ranks' && key === 'thresholds') {
        config.ranks = value;
      } else if (category === 'achievements' && key === 'criteria') {
        config.achievements = value;
      }
    }

    return config;
  }

  /**
   * Parse default values from settings
   * @private
   */
  private parseDefaults(settings: SystemSetting[]): Record<string, any> {
    const defaults: Record<string, any> = {};

    for (const setting of settings) {
      if (setting.default_value) {
        let value: any = setting.default_value;

        // Parse value based on type
        if (setting.value_type === 'number') {
          value = parseFloat(value);
        } else if (setting.value_type === 'json') {
          try {
            value = JSON.parse(value);
          } catch (error) {
            this.logger.warn(
              `Failed to parse default JSON for ${setting.setting_key}`,
            );
            value = {};
          }
        } else if (setting.value_type === 'boolean') {
          value = value === 'true';
        }

        defaults[setting.setting_key] = value;
      }
    }

    return defaults;
  }

  /**
   * Validate settings before saving
   * @private
   * @throws BadRequestException if validation fails
   */
  private validateSettings(dto: UpdateGamificationSettingsDto): void {
    // Validate rank thresholds are in ascending order
    if (dto.ranks) {
      const thresholds = [
        dto.ranks.novice,
        dto.ranks.beginner,
        dto.ranks.intermediate,
        dto.ranks.advanced,
        dto.ranks.expert,
      ];

      for (let i = 1; i < thresholds.length; i++) {
        if (thresholds[i] <= thresholds[i - 1]) {
          throw new BadRequestException(
            `Rank thresholds must be in ascending order. ` +
              `Found ${thresholds[i - 1]} >= ${thresholds[i]}`,
          );
        }
      }
    }

    // Validate multipliers >= 1.0
    if (dto.xp?.completion_multiplier && dto.xp.completion_multiplier < 1) {
      throw new BadRequestException('Completion multiplier must be >= 1.0');
    }

    if (dto.xp?.perfect_score_bonus && dto.xp.perfect_score_bonus < 1) {
      throw new BadRequestException('Perfect score bonus must be >= 1.0');
    }
  }

  /**
   * Update XP settings
   * @private
   */
  private async updateXpSettings(
    xp: Record<string, any>,
    adminId: string,
  ): Promise<void> {
    for (const [key, value] of Object.entries(xp)) {
      const settingKey = `gamification.xp.${key}`;
      await this.updateSetting(settingKey, String(value), adminId);
    }
  }

  /**
   * Update rank settings
   * @private
   */
  private async updateRankSettings(
    ranks: Record<string, any>,
    adminId: string,
  ): Promise<void> {
    const settingKey = 'gamification.ranks.thresholds';
    await this.updateSetting(settingKey, JSON.stringify(ranks), adminId);
  }

  /**
   * Update coins settings
   * @private
   */
  private async updateCoinsSettings(
    coins: Record<string, any>,
    adminId: string,
  ): Promise<void> {
    for (const [key, value] of Object.entries(coins)) {
      const settingKey = `gamification.coins.${key}`;
      await this.updateSetting(settingKey, String(value), adminId);
    }
  }

  /**
   * Update achievement settings
   * @private
   */
  private async updateAchievementSettings(
    achievements: Record<string, any>,
    adminId: string,
  ): Promise<void> {
    const settingKey = 'gamification.achievements.criteria';
    await this.updateSetting(settingKey, JSON.stringify(achievements), adminId);
  }

  /**
   * Generic method to update a single setting
   * @private
   * @throws NotFoundException if setting doesn't exist
   * @throws BadRequestException if setting is readonly or system
   */
  private async updateSetting(
    key: string,
    value: string,
    adminId: string,
  ): Promise<void> {
    const setting = await this.systemSettingRepo.findOne({
      where: { setting_key: key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting ${key} not found`);
    }

    if (setting.is_system || setting.is_readonly) {
      throw new BadRequestException(
        `Setting ${key} is ${setting.is_system ? 'system' : 'readonly'} and cannot be modified`,
      );
    }

    setting.setting_value = value;
    setting.updated_by = adminId;
    await this.systemSettingRepo.save(setting);

    this.logger.debug(`Updated setting ${key} = ${value} by admin ${adminId}`);
  }

  // =====================================================
  // US-AE-005: NEW METHODS FOR PARAMETER-BASED ENDPOINTS
  // =====================================================

  /**
   * List all gamification parameters with optional category filter
   *
   * @param query Query with optional category filter
   * @returns List of parameters matching the filter
   */
  async listParameters(
    query: ListParametersQueryDto,
  ): Promise<ParametersListResponseDto> {
    // Ensure defaults exist
    await this.ensureDefaultSettings();

    // Build where clause
    const where: any = { setting_category: 'gamification' };
    if (query.category) {
      where.setting_subcategory = query.category;
    }

    // Fetch parameters
    const parameters = await this.systemSettingRepo.find({ where });

    // Map to response format
    const parameterDtos: ParameterResponseDto[] = parameters.map((param) =>
      this.mapToParameterResponse(param),
    );

    this.logger.log(
      `Listed ${parameterDtos.length} parameters${query.category ? ` (category: ${query.category})` : ''}`,
    );

    return {
      parameters: parameterDtos,
      total: parameterDtos.length,
      filtered_by_category: query.category,
    };
  }

  /**
   * Get a single parameter by ID
   *
   * @param id Parameter UUID
   * @returns Parameter details
   * @throws NotFoundException if parameter doesn't exist
   */
  async getParameterById(id: string): Promise<ParameterResponseDto> {
    const parameter = await this.systemSettingRepo.findOne({
      where: { id, setting_category: 'gamification' },
    });

    if (!parameter) {
      throw new NotFoundException(`Parameter with ID ${id} not found`);
    }

    this.logger.debug(`Retrieved parameter ${parameter.setting_key} (${id})`);

    return this.mapToParameterResponse(parameter);
  }

  /**
   * Update a single parameter by ID
   *
   * @param id Parameter UUID
   * @param dto New value
   * @param adminId Admin user ID
   * @returns Update result with old and new values
   * @throws NotFoundException if parameter doesn't exist
   * @throws BadRequestException if validation fails
   */
  async updateParameterById(
    id: string,
    dto: UpdateParameterDto,
    adminId: string,
  ): Promise<UpdateParameterResponseDto> {
    // Fetch parameter
    const parameter = await this.systemSettingRepo.findOne({
      where: { id, setting_category: 'gamification' },
    });

    if (!parameter) {
      throw new NotFoundException(`Parameter with ID ${id} not found`);
    }

    // Check if readonly or system
    if (parameter.is_system || parameter.is_readonly) {
      throw new BadRequestException(
        `Parameter ${parameter.setting_key} is ${parameter.is_system ? 'system' : 'readonly'} and cannot be modified`,
      );
    }

    // Validate value
    this.validateParameterValue(parameter, dto.value);

    // Store old value
    const oldValue = parameter.setting_value;

    // Update value
    parameter.setting_value = dto.value;
    parameter.updated_by = adminId;
    await this.systemSettingRepo.save(parameter);

    this.logger.log(
      `Parameter ${parameter.setting_key} updated from "${oldValue}" to "${dto.value}" by admin ${adminId}`,
    );

    return {
      message: 'Parameter updated successfully',
      parameter: {
        id: parameter.id,
        setting_key: parameter.setting_key,
        old_value: oldValue,
        new_value: dto.value,
        updated_at: parameter.updated_at.toISOString(),
        updated_by: adminId,
      },
    };
  }

  /**
   * Get Maya ranks configuration
   *
   * GAP-FE-004: Updated to query maya_ranks table directly instead of system_settings.
   * Returns complete rank metadata including multipliers, colors, icons, perks, etc.
   *
   * @returns Maya ranks with complete metadata (13 fields per rank)
   */
  async getMayaRanks(): Promise<MayaRanksResponseDto> {
    try {
      // Query ranks directly from gamification_system.maya_ranks table
      // Use raw query to access cross-schema table
      const ranks = await this.systemSettingRepo.query(`
        SELECT
          id,
          display_name as name,
          rank_order as level,
          min_xp_required as "minXp",
          max_xp_threshold as "maxXp",
          xp_multiplier as "multiplierXp",
          COALESCE(xp_multiplier, 1.0) as "multiplierMlCoins",
          ml_coins_bonus as "bonusMlCoins",
          COALESCE(color, '#6B7280') as color,
          icon,
          description,
          COALESCE(perks, '[]'::jsonb) as perks,
          is_active as "isActive",
          rank_order as "order"
        FROM gamification_system.maya_ranks
        WHERE is_active = true
        ORDER BY rank_order ASC
      `);

      // Parse perks JSONB to array
      const ranksWithParsedPerks = ranks.map((rank: any) => ({
        id: rank.id,
        name: rank.name,
        level: rank.level,
        minXp: parseInt(rank.minXp || '0', 10),
        maxXp: rank.maxXp ? parseInt(rank.maxXp, 10) : null,
        multiplierXp: parseFloat(rank.multiplierXp || '1.0'),
        multiplierMlCoins: parseFloat(rank.multiplierMlCoins || '1.0'),
        bonusMlCoins: parseInt(rank.bonusMlCoins || '0', 10),
        color: rank.color,
        icon: rank.icon,
        description: rank.description || `Rank nivel ${rank.level}`,
        perks: Array.isArray(rank.perks) ? rank.perks : (typeof rank.perks === 'string' ? JSON.parse(rank.perks) : []),
        isActive: rank.isActive,
        order: rank.order,
      }));

      this.logger.log(`Retrieved ${ranksWithParsedPerks.length} Maya ranks from database`);

      // Get last updated info from system_settings (fallback for metadata)
      const ranksSetting = await this.systemSettingRepo.findOne({
        where: { setting_key: 'gamification.ranks.thresholds' },
      });

      return {
        ranks: ranksWithParsedPerks,
        total: ranksWithParsedPerks.length,
        setting_key: ranksSetting?.setting_key || 'gamification.ranks.thresholds',
        setting_id: ranksSetting?.id || '',
        last_updated: ranksSetting?.updated_at?.toISOString() || new Date().toISOString(),
        updated_by: ranksSetting?.updated_by,
      };
    } catch (error) {
      this.logger.error('Error fetching Maya ranks from database', error);
      throw new NotFoundException('Failed to load Maya ranks configuration. Verify gamification_system.maya_ranks table exists.');
    }
  }

  /**
   * Update a Maya rank threshold by rank name
   *
   * @param rankName Rank name (novice, beginner, etc.)
   * @param dto New threshold
   * @param adminId Admin user ID
   * @returns Update result with all ranks
   * @throws NotFoundException if ranks setting doesn't exist
   * @throws BadRequestException if validation fails (overlapping ranges)
   */
  async updateMayaRank(
    rankName: string,
    dto: UpdateMayaRankDto,
    adminId: string,
  ): Promise<UpdateMayaRankResponseDto> {
    // Validate rank name
    const validRanks = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];
    if (!validRanks.includes(rankName)) {
      throw new BadRequestException(
        `Invalid rank name. Must be one of: ${validRanks.join(', ')}`,
      );
    }

    // Fetch ranks setting
    const ranksSetting = await this.systemSettingRepo.findOne({
      where: { setting_key: 'gamification.ranks.thresholds' },
    });

    if (!ranksSetting) {
      throw new NotFoundException('Maya ranks configuration not found');
    }

    // Check if readonly or system
    if (ranksSetting.is_system || ranksSetting.is_readonly) {
      throw new BadRequestException(
        'Ranks configuration is readonly and cannot be modified',
      );
    }

    // Parse current thresholds
    let thresholds: Record<string, number>;
    try {
      thresholds = JSON.parse(ranksSetting.setting_value);
    } catch (error) {
      this.logger.error('Failed to parse ranks thresholds', error);
      throw new BadRequestException('Invalid ranks configuration');
    }

    const oldThreshold = thresholds[rankName];

    // Update threshold
    thresholds[rankName] = dto.min_xp;

    // Validate no overlapping ranges (thresholds must be in ascending order)
    const orderedThresholds = validRanks.map((name) => thresholds[name]);
    for (let i = 1; i < orderedThresholds.length; i++) {
      if (orderedThresholds[i] <= orderedThresholds[i - 1]) {
        throw new BadRequestException(
          `Invalid threshold. Rank thresholds must be in ascending order. ` +
            `${validRanks[i - 1]}: ${orderedThresholds[i - 1]}, ${validRanks[i]}: ${orderedThresholds[i]}`,
        );
      }
    }

    // Save updated thresholds
    ranksSetting.setting_value = JSON.stringify(thresholds);
    ranksSetting.updated_by = adminId;
    await this.systemSettingRepo.save(ranksSetting);

    // Build all ranks for response
    const ranks = validRanks.map((name, index) => {
      const minXp = thresholds[name];
      const nextRankMinXp =
        index < validRanks.length - 1 ? thresholds[validRanks[index + 1]] : null;

      return {
        rank_name: name,
        min_xp: minXp,
        max_xp: nextRankMinXp !== null ? nextRankMinXp - 1 : null,
        rank_order: index,
      };
    });

    this.logger.log(
      `Maya rank "${rankName}" updated from ${oldThreshold} to ${dto.min_xp} by admin ${adminId}`,
    );

    return {
      message: 'Maya rank threshold updated successfully',
      rank: {
        rank_name: rankName,
        old_threshold: oldThreshold,
        new_threshold: dto.min_xp,
        updated_at: ranksSetting.updated_at.toISOString(),
      },
      all_ranks: ranks,
    };
  }

  /**
   * Map SystemSetting entity to ParameterResponseDto
   * @private
   */
  private mapToParameterResponse(
    setting: SystemSetting,
  ): ParameterResponseDto {
    return {
      id: setting.id,
      setting_key: setting.setting_key,
      setting_category: setting.setting_category || 'gamification',
      setting_subcategory: setting.setting_subcategory,
      setting_value: setting.setting_value,
      value_type: setting.value_type,
      default_value: setting.default_value,
      display_name: setting.display_name,
      description: setting.description,
      help_text: setting.help_text,
      is_public: setting.is_public,
      is_readonly: setting.is_readonly,
      is_system: setting.is_system,
      min_value: setting.min_value,
      max_value: setting.max_value,
      allowed_values: setting.allowed_values,
      validation_rules: setting.validation_rules,
      metadata: setting.metadata,
      created_at: setting.created_at.toISOString(),
      updated_at: setting.updated_at.toISOString(),
      created_by: setting.created_by,
      updated_by: setting.updated_by,
    };
  }

  /**
   * Validate parameter value against constraints
   * @private
   * @throws BadRequestException if validation fails
   */
  private validateParameterValue(
    parameter: SystemSetting,
    value: string,
  ): void {
    // Validate numeric values
    if (parameter.value_type === 'number') {
      const numValue = parseFloat(value);

      if (isNaN(numValue)) {
        throw new BadRequestException(
          `Invalid value for ${parameter.setting_key}. Expected a number.`,
        );
      }

      // Check min/max constraints
      if (parameter.min_value !== null && parameter.min_value !== undefined && numValue < parameter.min_value) {
        throw new BadRequestException(
          `Value ${numValue} is below minimum allowed value ${parameter.min_value} for ${parameter.setting_key}`,
        );
      }

      if (parameter.max_value !== null && parameter.max_value !== undefined && numValue > parameter.max_value) {
        throw new BadRequestException(
          `Value ${numValue} exceeds maximum allowed value ${parameter.max_value} for ${parameter.setting_key}`,
        );
      }
    }

    // Validate boolean values
    if (parameter.value_type === 'boolean') {
      if (value !== 'true' && value !== 'false') {
        throw new BadRequestException(
          `Invalid value for ${parameter.setting_key}. Expected "true" or "false".`,
        );
      }
    }

    // Validate JSON values
    if (parameter.value_type === 'json') {
      try {
        JSON.parse(value);
      } catch (error) {
        throw new BadRequestException(
          `Invalid JSON value for ${parameter.setting_key}`,
        );
      }
    }

    // Check allowed values
    if (
      parameter.allowed_values &&
      parameter.allowed_values.length > 0 &&
      !parameter.allowed_values.includes(value)
    ) {
      throw new BadRequestException(
        `Value "${value}" is not allowed for ${parameter.setting_key}. ` +
          `Allowed values: ${parameter.allowed_values.join(', ')}`,
      );
    }
  }
}
