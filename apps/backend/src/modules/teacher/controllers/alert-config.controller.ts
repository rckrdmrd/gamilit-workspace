/**
 * AlertConfigController
 *
 * @description REST API controller for teacher alert configuration management.
 * Allows teachers to customize their alert preferences and thresholds.
 *
 * Endpoints:
 * - GET    /teacher/alert-config           - List configurations
 * - GET    /teacher/alert-config/defaults  - Get default values
 * - GET    /teacher/alert-config/:id       - Get single configuration
 * - POST   /teacher/alert-config           - Create configuration
 * - POST   /teacher/alert-config/initialize - Initialize defaults
 * - PUT    /teacher/alert-config/:id       - Update configuration
 * - DELETE /teacher/alert-config/:id       - Delete configuration
 *
 * @module teacher/controllers
 * @since US-PM-007
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { TeacherGuard } from '../guards/teacher.guard';
import { AlertConfigService } from '../services/alert-config.service';
import {
  CreateAlertConfigDto,
  UpdateAlertConfigDto,
  GetAlertConfigQueryDto,
  AlertConfigResponseDto,
  AlertConfigDefaultsDto,
  AlertConfigListResponseDto,
} from '../dto/alert-config.dto';

/**
 * Interface for JWT payload
 */
interface JwtPayload {
  sub: string;
  tenant_id: string;
  role: string;
}

@ApiTags('Teacher - Alert Configuration')
@ApiBearerAuth()
@Controller('teacher/alert-config')
@UseGuards(JwtAuthGuard, TeacherGuard)
export class AlertConfigController {
  constructor(private readonly alertConfigService: AlertConfigService) {}

  /**
   * GET /teacher/alert-config
   * List all alert configurations for the authenticated teacher
   */
  @Get()
  @ApiOperation({
    summary: 'List alert configurations',
    description: 'Get all alert configurations for the authenticated teacher. Optionally filter by classroom or alert type.',
  })
  @ApiQuery({ name: 'classroom_id', required: false, description: 'Filter by classroom' })
  @ApiQuery({ name: 'alert_type', required: false, description: 'Filter by alert type' })
  @ApiQuery({ name: 'is_enabled', required: false, description: 'Filter by enabled status' })
  @ApiResponse({
    status: 200,
    description: 'List of alert configurations',
    type: AlertConfigListResponseDto,
  })
  async getConfigurations(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetAlertConfigQueryDto,
  ): Promise<AlertConfigListResponseDto> {
    return this.alertConfigService.getConfigurations(user.sub, query);
  }

  /**
   * GET /teacher/alert-config/defaults
   * Get default configuration values for each alert type
   */
  @Get('defaults')
  @ApiOperation({
    summary: 'Get default configurations',
    description: 'Get default threshold values and settings for each alert type.',
  })
  @ApiResponse({
    status: 200,
    description: 'Default configuration values',
    type: [AlertConfigDefaultsDto],
  })
  getDefaults(): AlertConfigDefaultsDto[] {
    return this.alertConfigService.getDefaultConfigurations();
  }

  /**
   * GET /teacher/alert-config/:id
   * Get a single configuration by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get configuration by ID',
    description: 'Get a specific alert configuration.',
  })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  @ApiResponse({
    status: 200,
    description: 'Configuration details',
    type: AlertConfigResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  async getConfiguration(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AlertConfigResponseDto> {
    return this.alertConfigService.getConfiguration(user.sub, id);
  }

  /**
   * POST /teacher/alert-config
   * Create a new alert configuration
   */
  @Post()
  @ApiOperation({
    summary: 'Create configuration',
    description: 'Create a new alert configuration. Use classroom_id for classroom-specific settings, or omit for global settings.',
  })
  @ApiResponse({
    status: 201,
    description: 'Configuration created',
    type: AlertConfigResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Configuration already exists' })
  async createConfiguration(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAlertConfigDto,
  ): Promise<AlertConfigResponseDto> {
    return this.alertConfigService.createConfiguration(user.sub, user.tenant_id, dto);
  }

  /**
   * POST /teacher/alert-config/initialize
   * Initialize default configurations for the teacher
   */
  @Post('initialize')
  @ApiOperation({
    summary: 'Initialize default configurations',
    description: 'Create all alert type configurations with default values if they do not exist.',
  })
  @ApiQuery({ name: 'classroom_id', required: false, description: 'Initialize for specific classroom' })
  @ApiResponse({
    status: 201,
    description: 'Configurations initialized',
    type: [AlertConfigResponseDto],
  })
  async initializeDefaults(
    @CurrentUser() user: JwtPayload,
    @Query('classroom_id') classroomId?: string,
  ): Promise<AlertConfigResponseDto[]> {
    return this.alertConfigService.initializeDefaults(
      user.sub,
      user.tenant_id,
      classroomId,
    );
  }

  /**
   * PUT /teacher/alert-config/:id
   * Update an existing configuration
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update configuration',
    description: 'Update an existing alert configuration.',
  })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated',
    type: AlertConfigResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  async updateConfiguration(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAlertConfigDto,
  ): Promise<AlertConfigResponseDto> {
    return this.alertConfigService.updateConfiguration(user.sub, id, dto);
  }

  /**
   * DELETE /teacher/alert-config/:id
   * Delete a configuration
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete configuration',
    description: 'Delete an alert configuration.',
  })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  @ApiResponse({ status: 204, description: 'Configuration deleted' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  async deleteConfiguration(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.alertConfigService.deleteConfiguration(user.sub, id);
  }
}
