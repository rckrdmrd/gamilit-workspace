/**
 * ETL Controller
 *
 * @description REST API endpoints for ETL extraction management
 * @module etl/controllers
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 *
 * Endpoints:
 * - POST /etl/extract/trigger - Manual extraction trigger
 * - GET /etl/extract/status - Current extraction status
 * - GET /etl/extract/history - Extraction history
 * - GET /etl/extract/overview - System overview
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ExtractionCoordinatorService } from '../services/extraction-coordinator.service';
import { ExtractJob } from '../jobs/extract.job';
import {
  TriggerExtractionDto,
  ExtractionQueryDto,
  TriggerExtractionResponseDto,
  ExtractionOverviewDto,
  ExtractionHistoryResponseDto,
  ExtractionRunStatusDto,
  ExtractionMode,
} from '../dto';

/**
 * ETLController
 *
 * @description Controller for ETL extraction management API endpoints.
 * Provides endpoints for triggering extractions, checking status, and viewing history.
 */
@ApiTags('ETL - Extraction')
@Controller('etl/extract')
// @UseGuards(JwtAuthGuard, RolesGuard) // Uncomment when auth is configured
// @ApiBearerAuth()
export class EtlController {
  private readonly logger = new Logger(EtlController.name);

  constructor(
    private readonly extractionCoordinator: ExtractionCoordinatorService,
    private readonly extractJob: ExtractJob,
  ) {}

  /**
   * Manually trigger extraction
   *
   * @description Triggers an ETL extraction job with the specified configuration.
   * Can run all extractors or a specific one.
   *
   * @param dto - Extraction configuration
   * @returns Trigger response with job ID
   */
  @Post('trigger')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Trigger ETL extraction',
    description: 'Manually trigger an ETL extraction job. Supports full or incremental mode.',
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Extraction job started successfully',
    type: TriggerExtractionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Another extraction job is already running',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid extraction configuration',
  })
  async triggerExtraction(
    @Body() dto: TriggerExtractionDto,
  ): Promise<TriggerExtractionResponseDto> {
    this.logger.log(`Triggering extraction: ${dto.extractorType} (${dto.mode})`);

    try {
      const job = await this.extractJob.triggerManual(
        dto.extractorType,
        dto.mode ?? ExtractionMode.INCREMENTAL,
        {
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate: dto.endDate ? new Date(dto.endDate) : undefined,
          batchSize: dto.batchSize,
          tenantId: dto.tenantId,
        },
      );

      return {
        success: true,
        message: 'Extraction job started successfully',
        jobId: job.jobId,
        result: dto.async === false ? this.mapJobStatus(job) : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      if (message.includes('already running')) {
        return {
          success: false,
          message: `Cannot start extraction: ${message}`,
        };
      }

      throw error;
    }
  }

  /**
   * Get current extraction status
   *
   * @description Returns the status of the currently running extraction job, if any.
   */
  @Get('status')
  @ApiOperation({
    summary: 'Get current extraction status',
    description: 'Returns the status of the currently running extraction job, if any.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current extraction status',
    type: ExtractionRunStatusDto,
  })
  async getStatus(): Promise<ExtractionRunStatusDto | { status: 'idle'; message: string }> {
    const status = this.extractionCoordinator.getCurrentStatus();

    if (!status) {
      return {
        status: 'idle',
        message: 'No extraction job is currently running',
      };
    }

    return this.mapJobStatus(status);
  }

  /**
   * Get extraction history
   *
   * @description Returns paginated extraction history with optional filters.
   */
  @Get('history')
  @ApiOperation({
    summary: 'Get extraction history',
    description: 'Returns paginated list of past extraction runs with optional filters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Extraction history',
    type: ExtractionHistoryResponseDto,
  })
  async getHistory(
    @Query() query: ExtractionQueryDto,
  ): Promise<ExtractionHistoryResponseDto> {
    const result = await this.extractionCoordinator.getHistory({
      extractorName: query.extractorName,
      status: query.status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | undefined,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      limit: query.limit,
      offset: query.offset,
    });

    return {
      items: result.items.map((item) => ({
        id: item.id,
        extractorName: item.extractor_name,
        startedAt: item.started_at,
        completedAt: item.completed_at ?? undefined,
        rowsExtracted: item.rows_extracted,
        status: item.status,
        errorMessage: item.error_message ?? undefined,
        lastExtractedTimestamp: item.last_extracted_timestamp,
        durationMs: item.completed_at
          ? new Date(item.completed_at).getTime() - new Date(item.started_at).getTime()
          : 0,
      })),
      total: result.total,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
      hasMore: result.hasMore,
    };
  }

  /**
   * Get extraction overview
   *
   * @description Returns overall ETL extraction system status and statistics.
   */
  @Get('overview')
  @ApiOperation({
    summary: 'Get ETL extraction overview',
    description: 'Returns system status, extractor information, and statistics.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ETL extraction system overview',
    type: ExtractionOverviewDto,
  })
  async getOverview(): Promise<ExtractionOverviewDto> {
    const overview = await this.extractionCoordinator.getOverview();

    return {
      systemStatus: overview.systemStatus,
      extractors: overview.extractors.map((e) => ({
        name: e.name,
        sourceTables: e.sourceTables,
        lastExtractedAt: e.lastExtractedAt,
        lastRowCount: e.lastRowCount,
        status: e.status,
        enabled: e.enabled,
      })),
      currentJob: overview.currentJob
        ? this.mapJobStatus(overview.currentJob)
        : undefined,
      nextScheduledRun: overview.nextScheduledRun,
      schedule: overview.schedule,
      extractionsLast24h: overview.extractionsLast24h,
      recordsLast24h: overview.recordsLast24h,
      failuresLast24h: overview.failuresLast24h,
    };
  }

  /**
   * Get extraction job status
   *
   * @description Returns the scheduled job configuration and status.
   */
  @Get('job-status')
  @ApiOperation({
    summary: 'Get extraction job status',
    description: 'Returns information about the scheduled extraction job.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Extraction job status',
  })
  getJobStatus() {
    return this.extractJob.getJobStatus();
  }

  /**
   * Map internal job status to DTO
   */
  private mapJobStatus(status: {
    jobId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    extractors: string[];
    startedAt: Date;
    completedAt?: Date;
    progress: number;
    recordsExtracted: number;
    extractorProgress?: Record<string, {
      status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
      recordsExtracted: number;
      progress: number;
    }>;
    errorMessage?: string;
  }): ExtractionRunStatusDto {
    return {
      jobId: status.jobId,
      status: status.status,
      extractors: status.extractors,
      startedAt: status.startedAt,
      completedAt: status.completedAt,
      progress: status.progress,
      recordsExtracted: status.recordsExtracted,
      extractorProgress: status.extractorProgress,
      errorMessage: status.errorMessage,
    };
  }
}
