import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { GamificationConfigService } from '../services/gamification-config.service';
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
import { AuthRequest } from '@shared/types';

/**
 * AdminGamificationConfigController
 *
 * @description Controller para configuración de gamificación (admin)
 * @tags Admin - Gamification Config
 *
 * Endpoints (Settings - Bulk):
 * - GET /settings - Obtener configuración actual
 * - PUT /settings - Actualizar configuración
 * - POST /settings/preview - Previsualizar impacto
 * - POST /settings/restore-defaults - Restaurar valores por defecto
 * - POST /restore-defaults - Restaurar valores por defecto (ruta alternativa)
 *
 * Endpoints (US-AE-005 - Parameters):
 * - GET /parameters - Listar parámetros con filtro por categoría
 * - GET /parameters/:id - Obtener parámetro por ID
 * - PUT /parameters/:id - Actualizar parámetro por ID
 * - GET /maya-ranks - Obtener configuración de rangos Maya
 * - PUT /maya-ranks/:rankName - Actualizar umbral de rango Maya
 *
 * Guards:
 * - JwtAuthGuard: Usuario debe estar autenticado
 * - AdminGuard: Usuario debe ser admin
 *
 * @example
 * GET /api/admin/gamification/settings
 * PUT /api/admin/gamification/settings
 * POST /api/admin/gamification/settings/preview
 * POST /api/admin/gamification/settings/restore-defaults
 * POST /api/admin/gamification/restore-defaults
 * GET /api/admin/gamification/parameters?category=xp
 * GET /api/admin/gamification/parameters/:id
 * PUT /api/admin/gamification/parameters/:id
 * GET /api/admin/gamification/maya-ranks
 * PUT /api/admin/gamification/maya-ranks/:rankName
 */
@ApiTags('admin-public', 'Admin - Gamification Config')
@Controller('admin/gamification')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminGamificationConfigController {
  constructor(
    private readonly gamificationConfigService: GamificationConfigService,
  ) {}

  /**
   * Get current gamification settings
   *
   * @route GET /api/admin/gamification/settings
   * @returns Current gamification configuration with defaults and audit info
   *
   * @example Response:
   * {
   *   "xp": { "base_per_exercise": 10, "completion_multiplier": 1.5 },
   *   "ranks": { "novice": 0, "beginner": 100, ... },
   *   "coins": { "welcome_bonus": 500, ... },
   *   "achievements": { "criteria": [] },
   *   "defaults": { ... },
   *   "last_updated": "2025-11-11T20:00:00.000Z",
   *   "updated_by": "admin-uuid"
   * }
   */
  @Get('settings')
  @ApiOperation({
    summary: 'Get gamification settings',
    description:
      'Retrieve current gamification configuration including XP, ranks, coins, and achievements. ' +
      'Includes default values and audit information (last updated timestamp and admin ID).',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
    type: GamificationSettingsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  async getGamificationSettings(): Promise<GamificationSettingsResponseDto> {
    return this.gamificationConfigService.getGamificationSettings();
  }

  /**
   * Update gamification settings
   *
   * @route PUT /api/admin/gamification/settings
   * @param dto Settings to update (partial updates supported)
   * @param req Express request with authenticated user
   * @returns Updated configuration
   *
   * @example Request Body:
   * {
   *   "xp": {
   *     "base_per_exercise": 15,
   *     "completion_multiplier": 2.0
   *   },
   *   "ranks": {
   *     "novice": 0,
   *     "beginner": 150,
   *     "intermediate": 600,
   *     "advanced": 2000,
   *     "expert": 6000
   *   }
   * }
   */
  @Put('settings')
  @ApiOperation({
    summary: 'Update gamification settings',
    description:
      'Update gamification configuration. Supports partial updates - only provided fields will be updated. ' +
      'Validates that rank thresholds are in ascending order and multipliers are >= 1.0. ' +
      'System and readonly settings cannot be modified.',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
    type: GamificationSettingsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid settings (e.g., rank thresholds not in order, multiplier < 1)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Setting key does not exist',
  })
  async updateGamificationSettings(
    @Body() dto: UpdateGamificationSettingsDto,
      @Request() req: AuthRequest,
  ): Promise<GamificationSettingsResponseDto> {
    const adminId = req.user!.id;
    return this.gamificationConfigService.updateGamificationSettings(
      dto,
      adminId,
    );
  }

  /**
   * Preview impact of new settings
   *
   * @route POST /api/admin/gamification/settings/preview
   * @param dto Proposed settings with optional sample_size
   * @returns Estimated impact on users (rank changes, XP/coins delta)
   *
   * @example Request Body:
   * {
   *   "xp": { "base_per_exercise": 20 },
   *   "ranks": { "novice": 0, "beginner": 200, ... },
   *   "sample_size": 1000
   * }
   *
   * @example Response:
   * {
   *   "users_affected": 800,
   *   "rank_changes": { "promotions": 80, "demotions": 16 },
   *   "xp_impact": { "avg_xp_change": 20.5, "total_xp_change": 16400 },
   *   "coins_impact": { "avg_coins_change": 0, "total_coins_change": 0 },
   *   "preview_timestamp": "2025-11-11T20:00:00.000Z"
   * }
   */
  @Post('settings/preview')
  @ApiOperation({
    summary: 'Preview settings impact',
    description:
      'Preview estimated impact of new settings on users without saving changes. ' +
      'Returns metrics like affected users count, rank changes (promotions/demotions), ' +
      'and XP/coins impact (average and total deltas). ' +
      'Sample size can be specified (default: 1000, max: 10000) to control calculation scope.',
  })
  @ApiResponse({
    status: 200,
    description: 'Preview calculated successfully',
    type: PreviewImpactResultDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid settings or sample size out of range',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  async previewImpact(
    @Body() dto: PreviewImpactDto,
  ): Promise<PreviewImpactResultDto> {
    return this.gamificationConfigService.previewImpact(dto);
  }

  /**
   * Restore settings to defaults
   *
   * @route POST /api/admin/gamification/settings/restore-defaults
   * @param req Express request with authenticated user
   * @returns List of restored settings and audit info
   *
   * @example Response:
   * {
   *   "settings_restored": [
   *     "gamification.xp.base_per_exercise",
   *     "gamification.xp.completion_multiplier",
   *     "gamification.ranks.thresholds",
   *     "gamification.coins.welcome_bonus"
   *   ],
   *   "restored_at": "2025-11-11T20:00:00.000Z",
   *   "restored_by": "admin-uuid"
   * }
   */
  @Post('settings/restore-defaults')
  @ApiOperation({
    summary: 'Restore default settings',
    description:
      'Restore all gamification settings to their default values. ' +
      'Only non-system settings will be restored. ' +
      'This action cannot be undone - consider creating a backup before restoring. ' +
      'Returns the list of setting keys that were restored.',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings restored successfully',
    type: RestoreDefaultsResultDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  async restoreDefaults(
    @Request() req: AuthRequest,
  ): Promise<RestoreDefaultsResultDto> {
    const adminId = req.user!.id;
    return this.gamificationConfigService.restoreDefaults(adminId);
  }

  /**
   * Restore settings to defaults (alternative route)
   *
   * @route POST /api/admin/gamification/restore-defaults
   * @param req Express request with authenticated user
   * @returns List of restored settings and audit info
   *
   * @description Alternative endpoint for frontend compatibility.
   * Delegates to the same service method as /settings/restore-defaults.
   * This route exists for backward compatibility with frontend api.config.ts.
   */
  @Post('restore-defaults')
  @ApiOperation({
    summary: 'Restore default settings (alternative route)',
    description:
      'Restore all gamification settings to their default values. ' +
      'This is an alternative route for frontend compatibility. ' +
      'Only non-system settings will be restored. ' +
      'This action cannot be undone - consider creating a backup before restoring. ' +
      'Returns the list of setting keys that were restored.',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings restored successfully',
    type: RestoreDefaultsResultDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  async restoreDefaultsAlternative(
    @Request() req: AuthRequest,
  ): Promise<RestoreDefaultsResultDto> {
    const adminId = req.user!.id;
    return this.gamificationConfigService.restoreDefaults(adminId);
  }

  // =====================================================
  // US-AE-005: NEW PARAMETER-BASED ENDPOINTS
  // =====================================================

  /**
   * List all gamification parameters
   *
   * @route GET /api/admin/gamification/parameters
   * @param query Optional category filter
   * @returns List of parameters with metadata
   *
   * @example Query:
   * GET /api/admin/gamification/parameters?category=xp
   *
   * @example Response:
   * {
   *   "parameters": [
   *     {
   *       "id": "550e8400-e29b-41d4-a716-446655440000",
   *       "setting_key": "gamification.xp.base_per_exercise",
   *       "setting_value": "10",
   *       "value_type": "number",
   *       "min_value": 1,
   *       "max_value": 1000,
   *       ...
   *     }
   *   ],
   *   "total": 1,
   *   "filtered_by_category": "xp"
   * }
   */
  @Get('parameters')
  @ApiOperation({
    summary: 'List gamification parameters',
    description:
      'Retrieve all gamification parameters with optional category filter. ' +
      'Supports filtering by category (xp, ranks, coins, achievements). ' +
      'Returns detailed information including value constraints, metadata, and audit info.',
  })
  @ApiResponse({
    status: 200,
    description: 'Parameters retrieved successfully',
    type: ParametersListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  async listParameters(
    @Query() query: ListParametersQueryDto,
  ): Promise<ParametersListResponseDto> {
    return this.gamificationConfigService.listParameters(query);
  }

  /**
   * Get a single parameter by ID
   *
   * @route GET /api/admin/gamification/parameters/:id
   * @param id Parameter UUID
   * @returns Parameter details with all metadata
   *
   * @example Response:
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "setting_key": "gamification.xp.base_per_exercise",
   *   "setting_category": "gamification",
   *   "setting_subcategory": "xp",
   *   "setting_value": "10",
   *   "value_type": "number",
   *   "default_value": "10",
   *   "display_name": "Base XP per Exercise",
   *   "description": "Base XP awarded for completing an exercise",
   *   "min_value": 1,
   *   "max_value": 1000,
   *   "is_readonly": false,
   *   "is_system": false,
   *   "updated_at": "2025-11-23T10:30:00.000Z"
   * }
   */
  @Get('parameters/:id')
  @ApiOperation({
    summary: 'Get parameter by ID',
    description:
      'Retrieve detailed information about a single gamification parameter by its UUID. ' +
      'Includes all metadata, validation rules, constraints, and audit information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Parameter retrieved successfully',
    type: ParameterResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Parameter with given ID does not exist',
  })
  async getParameterById(
    @Param('id') id: string,
  ): Promise<ParameterResponseDto> {
    return this.gamificationConfigService.getParameterById(id);
  }

  /**
   * Update a parameter value by ID
   *
   * @route PUT /api/admin/gamification/parameters/:id
   * @param id Parameter UUID
   * @param dto New value
   * @param req Express request with authenticated user
   * @returns Update result with old/new values
   *
   * @example Request Body:
   * {
   *   "value": "15"
   * }
   *
   * @example Response:
   * {
   *   "message": "Parameter updated successfully",
   *   "parameter": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "setting_key": "gamification.xp.base_per_exercise",
   *     "old_value": "10",
   *     "new_value": "15",
   *     "updated_at": "2025-11-23T10:35:00.000Z",
   *     "updated_by": "admin-uuid"
   *   }
   * }
   */
  @Put('parameters/:id')
  @ApiOperation({
    summary: 'Update parameter value',
    description:
      'Update a single gamification parameter value by its UUID. ' +
      'The value is validated against parameter constraints (min/max, allowed values, type). ' +
      'System and readonly parameters cannot be modified. ' +
      'Change is logged in audit table with admin user ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Parameter updated successfully',
    type: UpdateParameterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid value (out of range, wrong type, or parameter is readonly/system)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Parameter with given ID does not exist',
  })
  async updateParameterById(
    @Param('id') id: string,
      @Body() dto: UpdateParameterDto,
      @Request() req: AuthRequest,
  ): Promise<UpdateParameterResponseDto> {
    const adminId = req.user!.id;
    return this.gamificationConfigService.updateParameterById(
      id,
      dto,
      adminId,
    );
  }

  /**
   * Get Maya ranks configuration
   *
   * @route GET /api/admin/gamification/maya-ranks
   * @returns List of ranks with thresholds and XP ranges
   *
   * @example Response:
   * {
   *   "ranks": [
   *     {
   *       "rank_name": "novice",
   *       "min_xp": 0,
   *       "max_xp": 99,
   *       "rank_order": 0
   *     },
   *     {
   *       "rank_name": "beginner",
   *       "min_xp": 100,
   *       "max_xp": 499,
   *       "rank_order": 1
   *     },
   *     ...
   *   ],
   *   "total": 5,
   *   "setting_key": "gamification.ranks.thresholds",
   *   "setting_id": "550e8400-e29b-41d4-a716-446655440000",
   *   "last_updated": "2025-11-23T10:00:00.000Z"
   * }
   */
  @Get('maya-ranks')
  @ApiOperation({
    summary: 'Get Maya ranks configuration',
    description:
      'Retrieve all Maya rank levels with their XP thresholds and ranges. ' +
      'Returns ranks in ascending order (novice, beginner, intermediate, advanced, expert). ' +
      'Each rank includes min_xp, max_xp (null for highest rank), and rank_order.',
  })
  @ApiResponse({
    status: 200,
    description: 'Maya ranks retrieved successfully',
    type: MayaRanksResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Ranks configuration not found',
  })
  async getMayaRanks(): Promise<MayaRanksResponseDto> {
    return this.gamificationConfigService.getMayaRanks();
  }

  /**
   * Update a Maya rank threshold
   *
   * @route PUT /api/admin/gamification/maya-ranks/:rankName
   * @param rankName Rank name (novice, beginner, intermediate, advanced, expert)
   * @param dto New threshold value
   * @param req Express request with authenticated user
   * @returns Update result with all updated ranks
   *
   * @example Request Body:
   * {
   *   "min_xp": 150
   * }
   *
   * @example Response:
   * {
   *   "message": "Maya rank threshold updated successfully",
   *   "rank": {
   *     "rank_name": "beginner",
   *     "old_threshold": 100,
   *     "new_threshold": 150,
   *     "updated_at": "2025-11-23T10:40:00.000Z"
   *   },
   *   "all_ranks": [
   *     { "rank_name": "novice", "min_xp": 0, "max_xp": 149, "rank_order": 0 },
   *     { "rank_name": "beginner", "min_xp": 150, "max_xp": 499, "rank_order": 1 },
   *     ...
   *   ]
   * }
   */
  @Put('maya-ranks/:rankName')
  @ApiOperation({
    summary: 'Update Maya rank threshold',
    description:
      'Update the minimum XP threshold for a specific Maya rank. ' +
      'Validates that updated thresholds maintain ascending order (no overlapping ranges). ' +
      'Returns all ranks with updated ranges to reflect the change. ' +
      'Change is logged with admin user ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rank threshold updated successfully',
    type: UpdateMayaRankResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid rank name, threshold value, or overlapping ranges detected',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Ranks configuration not found',
  })
  async updateMayaRank(
    @Param('rankName') rankName: string,
      @Body() dto: UpdateMayaRankDto,
      @Request() req: AuthRequest,
  ): Promise<UpdateMayaRankResponseDto> {
    const adminId = req.user!.id;
    return this.gamificationConfigService.updateMayaRank(
      rankName,
      dto,
      adminId,
    );
  }
}
