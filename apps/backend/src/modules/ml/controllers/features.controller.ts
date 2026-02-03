/**
 * Features Controller
 *
 * @description REST API controller for ML feature operations.
 * Provides endpoints for feature generation, retrieval, and cache management.
 *
 * Endpoints:
 * - GET /ml/features/:studentId - Get features for a student
 * - POST /ml/features/batch - Generate features for multiple students
 * - GET /ml/features/schema - Get feature schema documentation
 * - DELETE /ml/features/cache/:studentId - Invalidate cache for a student
 *
 * @module ML
 * @sprint 3.1 - Feature Engineering for ML Predictions
 * @created 2026-02-03
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { GamilityRoleEnum } from '@/shared/constants/enums.constants';
import { FeatureStoreService } from '../services/feature-store.service';
import { FeatureConfig, FeatureCategory } from '../interfaces';
import {
  GenerateFeaturesRequestDto,
  BatchFeaturesRequestDto,
  GetCachedFeaturesQueryDto,
  FeatureSchemaQueryDto,
  InvalidateCacheRequestDto,
} from '../dto/feature-request.dto';
import {
  FeatureSetResponseDto,
  BatchFeaturesResponseDto,
  FeatureSchemaResponseDto,
  CacheInvalidationResponseDto,
} from '../dto/feature-response.dto';

/**
 * Features Controller
 *
 * Handles all ML feature-related HTTP requests.
 */
@ApiTags('ML Features')
@ApiBearerAuth()
@Controller('ml/features')
@UseGuards(AuthGuard, RolesGuard)
export class FeaturesController {
  private readonly logger = new Logger(FeaturesController.name);

  constructor(private readonly featureStoreService: FeatureStoreService) {}

  /**
   * Get features for a specific student
   *
   * Generates or retrieves cached features for a student based on configuration.
   */
  @Get(':studentId')
  @Roles(GamilityRoleEnum.SUPER_ADMIN, GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({
    summary: 'Get features for a student',
    description:
      'Generate or retrieve cached ML features for a specific student. ' +
      'Features include student profile, engagement patterns, performance metrics, and temporal patterns.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID (profiles.id)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature set generated successfully',
    type: FeatureSetResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or teacher role' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getStudentFeatures(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query() query: GenerateFeaturesRequestDto,
  ): Promise<FeatureSetResponseDto> {
    this.logger.log(`Getting features for student: ${studentId}`);

    const config: FeatureConfig = {
      lookbackDays: query.lookbackDays || 30,
      includeCategories: (query.includeCategories as FeatureCategory[]) || ['all'],
      normalize: query.normalize !== false,
      computeImportance: query.computeImportance || false,
      dateRange: query.dateRange
        ? {
            start: new Date(query.dateRange.start),
            end: new Date(query.dateRange.end),
          }
        : undefined,
    };

    const featureSet = await this.featureStoreService.generateFeatures(studentId, config);

    return {
      studentId: featureSet.studentId,
      timestamp: featureSet.timestamp,
      features: featureSet.features.map((f) => ({
        name: f.name,
        value: f.value,
        type: f.type,
        normalized: f.normalized,
        importance: f.importance,
        description: f.description,
        unit: f.unit,
      })),
      metadata: {
        version: featureSet.metadata.version,
        generatedAt: featureSet.metadata.generatedAt,
        featureCount: featureSet.metadata.featureCount,
        numericFeatureCount: featureSet.metadata.numericFeatureCount,
        categoricalFeatureCount: featureSet.metadata.categoricalFeatureCount,
        booleanFeatureCount: featureSet.metadata.booleanFeatureCount,
        generationTimeMs: featureSet.metadata.generationTimeMs,
      },
      fromCache: false,
    };
  }

  /**
   * Generate features for multiple students in batch
   *
   * Useful for training data preparation.
   */
  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @Roles(GamilityRoleEnum.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Generate features for multiple students',
    description:
      'Batch feature generation for multiple students. ' +
      'Processes students in parallel with configurable concurrency. ' +
      'Returns both successful extractions and failures.',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch feature generation completed',
    type: BatchFeaturesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires super admin role' })
  async generateBatchFeatures(
    @Body() body: BatchFeaturesRequestDto,
  ): Promise<BatchFeaturesResponseDto> {
    this.logger.log(`Batch feature generation for ${body.studentIds.length} students`);

    const config: FeatureConfig = {
      lookbackDays: body.lookbackDays || 30,
      includeCategories: (body.includeCategories as FeatureCategory[]) || ['all'],
      normalize: body.normalize !== false,
      computeImportance: body.computeImportance || false,
      dateRange: body.dateRange
        ? {
            start: new Date(body.dateRange.start),
            end: new Date(body.dateRange.end),
          }
        : undefined,
    };

    const result = await this.featureStoreService.generateBatchFeatures(
      body.studentIds,
      config,
    );

    return {
      featureSets: result.featureSets.map((fs) => ({
        studentId: fs.studentId,
        timestamp: fs.timestamp,
        features: fs.features.map((f) => ({
          name: f.name,
          value: f.value,
          type: f.type,
          normalized: f.normalized,
          importance: f.importance,
          description: f.description,
          unit: f.unit,
        })),
        metadata: {
          version: fs.metadata.version,
          generatedAt: fs.metadata.generatedAt,
          featureCount: fs.metadata.featureCount,
          numericFeatureCount: fs.metadata.numericFeatureCount,
          categoricalFeatureCount: fs.metadata.categoricalFeatureCount,
          booleanFeatureCount: fs.metadata.booleanFeatureCount,
          generationTimeMs: fs.metadata.generationTimeMs,
        },
      })),
      failures: result.failures,
      stats: result.stats,
    };
  }

  /**
   * Get feature schema documentation
   *
   * Returns the complete schema of available features.
   */
  @Get('schema')
  @Roles(GamilityRoleEnum.SUPER_ADMIN, GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({
    summary: 'Get feature schema',
    description:
      'Returns the complete schema of available ML features including ' +
      'names, types, descriptions, value ranges, and data sources.',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature schema retrieved successfully',
    type: FeatureSchemaResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getFeatureSchema(
    @Query() query: FeatureSchemaQueryDto,
  ): FeatureSchemaResponseDto {
    this.logger.log(`Getting feature schema (category: ${query.category || 'all'})`);

    const schemas = this.featureStoreService.getFeatureSchema(
      query.category,
      query.includeExperimental,
    );

    // Count features by category
    const byCategory: Record<string, number> = {};
    for (const schema of schemas) {
      byCategory[schema.category] = (byCategory[schema.category] || 0) + 1;
    }

    return {
      version: this.featureStoreService.getFeatureVersion(),
      totalFeatures: schemas.length,
      features: schemas.map((s) => ({
        name: s.name,
        category: s.category,
        type: s.type,
        description: s.description,
        range: s.range,
        possibleValues: s.possibleValues,
        source: s.source,
        experimental: s.experimental,
      })),
      byCategory,
      lastUpdated: new Date(),
    };
  }

  /**
   * Invalidate cached features for a student
   *
   * Useful when student data changes and features need to be regenerated.
   */
  @Delete('cache/:studentId')
  @Roles(GamilityRoleEnum.SUPER_ADMIN, GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({
    summary: 'Invalidate feature cache for a student',
    description:
      'Removes all cached features for a specific student. ' +
      'Next feature request will trigger fresh extraction from the data warehouse.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID (profiles.id)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Cache invalidated successfully',
    type: CacheInvalidationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or teacher role' })
  async invalidateCache(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Body() body?: InvalidateCacheRequestDto,
  ): Promise<CacheInvalidationResponseDto> {
    this.logger.log(`Invalidating cache for student: ${studentId}`);

    if (body?.reason) {
      this.logger.log(`Reason: ${body.reason}`);
    }

    await this.featureStoreService.invalidateCache(studentId);

    return {
      success: true,
      message: `Cache invalidated for student ${studentId}`,
      invalidatedAt: new Date(),
    };
  }

  /**
   * Get cached features without regeneration
   *
   * Returns cached features if available, null otherwise.
   */
  @Get('cached/:studentId')
  @Roles(GamilityRoleEnum.SUPER_ADMIN, GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({
    summary: 'Get cached features only',
    description:
      'Returns cached features for a student if available. ' +
      'Does not trigger feature generation if cache is empty.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID (profiles.id)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Cached features retrieved or null if not cached',
    type: FeatureSetResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCachedFeatures(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query() query: GetCachedFeaturesQueryDto,
  ): Promise<FeatureSetResponseDto | null> {
    this.logger.log(`Getting cached features for student: ${studentId}`);

    const cached = await this.featureStoreService.getCachedFeaturesForStudent(studentId);

    if (!cached) {
      return null;
    }

    // Check max age if specified
    if (query.maxAge) {
      const ageSeconds = (Date.now() - cached.metadata.generatedAt.getTime()) / 1000;
      if (ageSeconds > query.maxAge) {
        return null;
      }
    }

    return {
      studentId: cached.studentId,
      timestamp: cached.timestamp,
      features: cached.features.map((f) => ({
        name: f.name,
        value: f.value,
        type: f.type,
        normalized: f.normalized,
        importance: f.importance,
        description: f.description,
        unit: f.unit,
      })),
      metadata: {
        version: cached.metadata.version,
        generatedAt: cached.metadata.generatedAt,
        featureCount: cached.metadata.featureCount,
        numericFeatureCount: cached.metadata.numericFeatureCount,
        categoricalFeatureCount: cached.metadata.categoricalFeatureCount,
        booleanFeatureCount: cached.metadata.booleanFeatureCount,
        generationTimeMs: cached.metadata.generationTimeMs,
      },
      fromCache: true,
    };
  }
}
