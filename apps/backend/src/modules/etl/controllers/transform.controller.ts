/**
 * Transform Controller
 *
 * @description REST API endpoints for ETL transformation operations.
 * Provides manual triggers, status monitoring, and validation reports.
 *
 * @module etl/controllers
 * @version 1.0.0
 * @since Sprint 2.3 - ETL Pipeline Transformation
 *
 * Endpoints:
 * - POST /etl/transform/trigger - Manual transformation trigger
 * - GET /etl/transform/status - Current transformation status
 * - GET /etl/validation/report - Data quality validation report
 * - POST /etl/cache/clear - Clear dimension caches
 * - GET /etl/cache/stats - Cache statistics
 * - GET /etl/transform/health - ETL transformation health check
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { TransformationCoordinatorService } from '../services/transformation-coordinator.service';
import {
  TriggerTransformationDto,
  ValidationReportQueryDto,
  TransformerType,
} from '../dto/transformation-config.dto';
import {
  TransformationTriggerResponseDto,
  TransformationStatusResponseDto,
  ValidationReportResponseDto,
  TransformationStatusEnum,
} from '../dto/transformation-status.dto';

/**
 * TransformController
 *
 * @description Controller for ETL transformation API endpoints.
 * Provides endpoints for triggering transformations, checking status,
 * and viewing validation reports.
 */
@ApiTags('ETL - Transform')
@Controller('etl/transform')
export class TransformController {
  private readonly logger = new Logger(TransformController.name);

  constructor(
    private readonly transformationCoordinator: TransformationCoordinatorService,
  ) {}

  /**
   * POST /etl/transform/trigger
   * Manually trigger a transformation pipeline
   */
  @Post('trigger')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Trigger transformation pipeline',
    description:
      'Manually triggers the ETL transformation pipeline for a specific transformer type. ' +
      'Returns immediately with a batch ID for tracking.',
  })
  @ApiBody({ type: TriggerTransformationDto })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Transformation triggered successfully',
    type: TransformationTriggerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Transformation already in progress',
  })
  async triggerTransformation(
    @Body() request: TriggerTransformationDto,
  ): Promise<TransformationTriggerResponseDto> {
    this.logger.log(`Triggering transformation: ${request.transformerType}`);

    const result = await this.transformationCoordinator.triggerTransformation(request);

    return {
      batchId: result.batchId,
      status: result.status,
      message: result.message,
      estimatedRecords: 0,
      triggeredAt: new Date(),
    };
  }

  /**
   * GET /etl/transform/status
   * Get current transformation status
   */
  @Get('status')
  @ApiOperation({
    summary: 'Get transformation status',
    description:
      'Returns the current status of the transformation pipeline, ' +
      'including progress by transformer and overall metrics.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current transformation status',
    type: TransformationStatusResponseDto,
  })
  getTransformationStatus(): TransformationStatusResponseDto {
    return this.transformationCoordinator.getStatus();
  }

  /**
   * GET /etl/transform/health
   * ETL transformation system health check
   */
  @Get('health')
  @ApiOperation({
    summary: 'Transformation health check',
    description: 'Returns the health status of the ETL transformation system.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transformation system is healthy',
  })
  healthCheck(): {
    status: string;
    timestamp: Date;
    transformationStatus: TransformationStatusEnum;
    cacheStats: Record<string, { size: number; hitRate: number }>;
  } {
    const status = this.transformationCoordinator.getStatus();
    return {
      status: 'healthy',
      timestamp: new Date(),
      transformationStatus: status.overallStatus,
      cacheStats: this.transformationCoordinator.getCacheStats(),
    };
  }
}

/**
 * ValidationController
 *
 * @description Controller for ETL validation API endpoints.
 */
@ApiTags('ETL - Validation')
@Controller('etl/validation')
export class ValidationController {
  private readonly logger = new Logger(ValidationController.name);

  constructor(
    private readonly transformationCoordinator: TransformationCoordinatorService,
  ) {}

  /**
   * GET /etl/validation/report
   * Get data quality validation report
   */
  @Get('report')
  @ApiOperation({
    summary: 'Get validation report',
    description:
      'Returns a detailed data quality validation report for the specified ' +
      'transformer or batch. Includes issue counts, field statistics, and recommendations.',
  })
  @ApiQuery({
    name: 'transformerType',
    required: false,
    enum: TransformerType,
    description: 'Filter by transformer type',
  })
  @ApiQuery({
    name: 'batchId',
    required: false,
    description: 'Filter by batch ID',
  })
  @ApiQuery({
    name: 'includeDetails',
    required: false,
    type: Boolean,
    description: 'Include detailed issues in response',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validation report',
    type: ValidationReportResponseDto,
  })
  getValidationReport(
    @Query() query: ValidationReportQueryDto,
  ): ValidationReportResponseDto {
    return this.transformationCoordinator.getValidationReport(
      query.transformerType,
      query.batchId,
      query.includeDetails || false,
    );
  }
}

/**
 * CacheController
 *
 * @description Controller for ETL cache management API endpoints.
 */
@ApiTags('ETL - Cache')
@Controller('etl/cache')
export class CacheController {
  private readonly logger = new Logger(CacheController.name);

  constructor(
    private readonly transformationCoordinator: TransformationCoordinatorService,
  ) {}

  /**
   * POST /etl/cache/clear
   * Clear dimension lookup caches
   */
  @Post('clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear dimension caches',
    description:
      'Clears all in-memory dimension lookup caches. ' +
      'Use when dimension data has been updated in the warehouse.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Caches cleared successfully',
  })
  clearCaches(): { message: string; clearedAt: Date } {
    this.logger.log('Clearing dimension caches');
    this.transformationCoordinator.clearCaches();
    return {
      message: 'All dimension caches cleared',
      clearedAt: new Date(),
    };
  }

  /**
   * GET /etl/cache/stats
   * Get cache statistics
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get cache statistics',
    description: 'Returns statistics for all dimension lookup caches.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cache statistics',
  })
  getCacheStats(): Record<string, { size: number; hitRate: number }> {
    return this.transformationCoordinator.getCacheStats();
  }
}
