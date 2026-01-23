import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { FeatureFlagsService } from '../services/feature-flags.service';
import {
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  FeatureFlagQueryDto,
  CheckFeatureFlagDto,
  FeatureFlagCheckResultDto
} from '../dto/feature-flags';
import { FeatureFlag } from '../entities/feature-flag.entity';
import { AuthRequest } from '@shared/types';

/**
 * FeatureFlagsController
 *
 * @description Controlador para gestión de feature flags desde el Admin Portal
 * @route /admin/feature-flags
 * @guards JwtAuthGuard, AdminGuard (solo super_admin)
 */
@ApiTags('admin-public', 'Admin - Feature Flags')
@Controller('admin/feature-flags')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  /**
   * Obtener todas las feature flags
   */
  @Get()
  @ApiOperation({
    summary: 'Get all feature flags',
    description: 'Retrieve all feature flags with optional filtering by status and category',
  })
  @ApiResponse({
    status: 200,
    description: 'List of feature flags retrieved successfully',
    type: [FeatureFlag],
  })
  async findAll(@Query() query: FeatureFlagQueryDto): Promise<FeatureFlag[]> {
    return this.featureFlagsService.findAll(query);
  }

  /**
   * Obtener una feature flag por su key
   */
  @Get(':key')
  @ApiOperation({
    summary: 'Get a feature flag by key',
    description: 'Retrieve a specific feature flag by its unique key',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature flag retrieved successfully',
    type: FeatureFlag,
  })
  @ApiResponse({
    status: 404,
    description: 'Feature flag not found',
  })
  async findOne(@Param('key') key: string): Promise<FeatureFlag> {
    return this.featureFlagsService.findOne(key);
  }

  /**
   * Verificar si una feature está habilitada
   */
  @Post(':key/check')
  @ApiOperation({
    summary: 'Check if a feature is enabled',
    description: 'Verify if a feature is enabled for a specific user or context',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature flag check completed',
    type: FeatureFlagCheckResultDto,
  })
  async checkFeature(
    @Param('key') key: string,
    @Body() dto: CheckFeatureFlagDto,
  ): Promise<FeatureFlagCheckResultDto> {
    return this.featureFlagsService.isEnabled(key, dto.userId);
  }

  /**
   * Crear una nueva feature flag
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new feature flag',
    description: 'Create a new feature flag with rollout configuration',
  })
  @ApiResponse({
    status: 201,
    description: 'Feature flag created successfully',
    type: FeatureFlag,
  })
  @ApiResponse({
    status: 409,
    description: 'Feature flag with this key already exists',
  })
  async create(
    @Body() dto: CreateFeatureFlagDto,
    @Request() req: AuthRequest,
  ): Promise<FeatureFlag> {
    const adminId = req.user?.id || req.user?.sub;
    return this.featureFlagsService.create(dto, adminId);
  }

  /**
   * Actualizar una feature flag existente
   */
  @Put(':key')
  @ApiOperation({
    summary: 'Update a feature flag',
    description: 'Update an existing feature flag configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature flag updated successfully',
    type: FeatureFlag,
  })
  @ApiResponse({
    status: 404,
    description: 'Feature flag not found',
  })
  async update(
    @Param('key') key: string,
    @Body() dto: UpdateFeatureFlagDto,
    @Request() req: AuthRequest,
  ): Promise<FeatureFlag> {
    const adminId = req.user?.id || req.user?.sub;
    return this.featureFlagsService.update(key, dto, adminId);
  }

  /**
   * Habilitar una feature flag
   */
  @Post(':key/enable')
  @ApiOperation({
    summary: 'Enable a feature flag',
    description: 'Enable a feature flag globally',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature flag enabled successfully',
    type: FeatureFlag,
  })
  async enable(
    @Param('key') key: string,
    @Request() req: AuthRequest,
  ): Promise<FeatureFlag> {
    const adminId = req.user?.id || req.user?.sub;
    return this.featureFlagsService.enable(key, adminId);
  }

  /**
   * Deshabilitar una feature flag
   */
  @Post(':key/disable')
  @ApiOperation({
    summary: 'Disable a feature flag',
    description: 'Disable a feature flag globally',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature flag disabled successfully',
    type: FeatureFlag,
  })
  async disable(
    @Param('key') key: string,
    @Request() req: AuthRequest,
  ): Promise<FeatureFlag> {
    const adminId = req.user?.id || req.user?.sub;
    return this.featureFlagsService.disable(key, adminId);
  }

  /**
   * Actualizar rollout percentage
   */
  @Put(':key/rollout')
  @ApiOperation({
    summary: 'Update rollout percentage',
    description: 'Update the rollout percentage for gradual feature deployment',
  })
  @ApiResponse({
    status: 200,
    description: 'Rollout percentage updated successfully',
    type: FeatureFlag,
  })
  async updateRollout(
    @Param('key') key: string,
    @Body('percentage') percentage: number,
    @Request() req: AuthRequest,
  ): Promise<FeatureFlag> {
    const adminId = req.user?.id || req.user?.sub;
    return this.featureFlagsService.updateRollout(key, percentage, adminId);
  }

  /**
   * Eliminar una feature flag
   */
  @Delete(':key')
  @ApiOperation({
    summary: 'Delete a feature flag',
    description: 'Remove a feature flag from the system',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature flag deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Feature flag not found',
  })
  async remove(@Param('key') key: string): Promise<void> {
    return this.featureFlagsService.remove(key);
  }
}
