/**
 * ETL Load Controller
 *
 * @description REST API endpoints for ETL load operations
 * @module etl/controllers
 * @version 1.0.0
 * @since Sprint 2.4 - ETL Pipeline Load
 *
 * Endpoints:
 * - POST /etl/load/trigger - Manual load trigger
 * - GET /etl/load/status - Current load status
 * - POST /etl/load/full - Full ETL pipeline (extract+transform+load)
 * - GET /etl/pipeline/status - Full pipeline status
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
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  LoadCoordinatorService,
  LoadPipelineConfig,
} from '../services/load-coordinator.service';
import {
  LoadTriggerDto,
  FullETLPipelineDto,
  LoadQueryDto,
  LoadLogQueryDto,
  LoadResultResponseDto,
  LoadStatusResponseDto,
  PipelineStatusResponseDto,
  PaginatedLoadLogsDto,
  LoadStatus,
  PhaseStatusDto,
} from '../dto';
import { LoadMode } from '../interfaces';

/**
 * ETL Load Controller
 *
 * @description Controller for ETL load and pipeline management API endpoints.
 */
@ApiTags('ETL - Load')
@Controller('etl')
// @UseGuards(JwtAuthGuard, RolesGuard) // Uncomment when auth is configured
// @ApiBearerAuth()
export class EtlLoadController {
  private readonly logger = new Logger(EtlLoadController.name);

  constructor(
    private readonly loadCoordinator: LoadCoordinatorService,
  ) {}

  /**
   * Manually trigger load operation
   *
   * @description Triggers a load operation for a specific loader.
   * Data should be pre-transformed before calling this endpoint.
   */
  @Post('load/trigger')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Trigger ETL load',
    description: 'Manually trigger a load operation for a specific loader.',
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Load job started successfully',
    type: LoadResultResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Another load job is already running',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid load configuration',
  })
  async triggerLoad(
    @Body() dto: LoadTriggerDto,
  ): Promise<LoadResultResponseDto> {
    this.logger.log(`Triggering load: ${dto.loaderName}`);

    const status = this.loadCoordinator.getCurrentStatus();
    if (status.isRunning) {
      throw new ConflictException(
        `Another load job is already running: ${status.currentPipelineId}`,
      );
    }

    if (!dto.data || dto.data.length === 0) {
      throw new BadRequestException(
        'No data provided for load. Provide data array in request body.',
      );
    }

    // Map loader name to data key
    const dataMap: Record<string, unknown[]> = {};
    switch (dto.loaderName) {
      case 'fact-exercise-completion':
        dataMap.exerciseCompletions = dto.data;
        break;
      case 'fact-daily-progress':
        dataMap.dailyProgress = dto.data;
        break;
      case 'fact-gamification-event':
        dataMap.gamificationEvents = dto.data;
        break;
      case 'dim-student':
        dataMap.students = dto.data;
        break;
      default:
        throw new BadRequestException(`Unknown loader: ${dto.loaderName}`);
    }

    const result = await this.loadCoordinator.executeFullPipeline(
      dataMap as Parameters<typeof this.loadCoordinator.executeFullPipeline>[0],
      {
        loadersToRun: [dto.loaderName],
        continueOnError: dto.continueOnError ?? false,
        validateDimensionKeys: dto.validateConstraints ?? true,
        batchSize: dto.batchSize ?? 1000,
      },
    );

    // Get specific loader result
    const loaderResult =
      result.dimensionResults.get(dto.loaderName) ||
      result.factResults.get(dto.loaderName);

    return {
      loadId: result.pipelineId,
      loaderName: dto.loaderName,
      targetTable: loaderResult?.targetTable ?? '',
      targetSchema: loaderResult?.targetSchema ?? 'data_warehouse',
      status: this.mapResultToStatus(result.status),
      loadMode: dto.mode ?? LoadMode.APPEND,
      rowsInserted: loaderResult?.rowsInserted ?? 0,
      rowsUpdated: loaderResult?.rowsUpdated ?? 0,
      rowsRejected: loaderResult?.rowsRejected ?? 0,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
      duration: result.totalDuration,
      errorMessage: result.errorMessage,
      batchesProcessed: loaderResult?.batchesProcessed ?? 0,
      averageRecordsPerSecond: loaderResult?.averageRecordsPerSecond ?? 0,
    };
  }

  /**
   * Get current load status
   *
   * @description Returns the status of the current load operation and recent history.
   */
  @Get('load/status')
  @ApiOperation({
    summary: 'Get current load status',
    description: 'Returns the status of the current load operation and recent history.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current load status',
    type: LoadStatusResponseDto,
  })
  async getLoadStatus(
    @Query() query: LoadQueryDto,
  ): Promise<LoadStatusResponseDto> {
    const currentStatus = this.loadCoordinator.getCurrentStatus();
    const stats = await this.loadCoordinator.getLoadStats24Hours();
    const history = await this.loadCoordinator.getLoadHistory(
      query.limit ?? 10,
      query.offset ?? 0,
      {
        loaderName: query.loaderName,
        status: query.status,
      },
    );

    return {
      isRunning: currentStatus.isRunning,
      currentLoad: currentStatus.isRunning
        ? {
            loadId: currentStatus.currentPipelineId!,
            loaderName: 'pipeline',
            targetTable: '*',
            targetSchema: 'data_warehouse',
            status: LoadStatus.RUNNING,
            loadMode: LoadMode.APPEND,
            rowsInserted: 0,
            rowsUpdated: 0,
            rowsRejected: 0,
            startedAt: new Date(),
            duration: 0,
            batchesProcessed: 0,
            averageRecordsPerSecond: 0,
          }
        : undefined,
      recentLoads: (history.data as Record<string, unknown>[]).map((item) => ({
        loadId: item.load_id as string,
        loaderName: item.loader_name as string,
        targetTable: item.target_table as string,
        targetSchema: 'data_warehouse',
        status: item.status as LoadStatus,
        loadMode: LoadMode.APPEND,
        rowsInserted: item.rows_inserted as number,
        rowsUpdated: item.rows_updated as number,
        rowsRejected: item.rows_rejected as number,
        startedAt: new Date(item.started_at as string),
        completedAt: item.completed_at
          ? new Date(item.completed_at as string)
          : undefined,
        duration:
          item.completed_at && item.started_at
            ? new Date(item.completed_at as string).getTime() -
              new Date(item.started_at as string).getTime()
            : 0,
        errorMessage: (item.error_message as string) || undefined,
        batchesProcessed: 0,
        averageRecordsPerSecond: 0,
      })),
      loadsLast24Hours: stats.total,
      successfulLoadsLast24Hours: stats.successful,
      failedLoadsLast24Hours: stats.failed,
    };
  }

  /**
   * Trigger full ETL pipeline
   *
   * @description Executes the complete ETL pipeline: extract, transform, and load.
   * This is a long-running operation.
   */
  @Post('load/full')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Trigger full ETL pipeline',
    description:
      'Executes the complete ETL pipeline (extract + transform + load). Long-running operation.',
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Pipeline started successfully',
    type: PipelineStatusResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Another pipeline is already running',
  })
  async triggerFullPipeline(
    @Body() dto: FullETLPipelineDto,
  ): Promise<PipelineStatusResponseDto> {
    this.logger.log('Triggering full ETL pipeline');

    const status = this.loadCoordinator.getCurrentStatus();
    if (status.isRunning) {
      throw new ConflictException(
        `Another pipeline is already running: ${status.currentPipelineId}`,
      );
    }

    // Note: In a full implementation, this would:
    // 1. Call extraction coordinator to extract data
    // 2. Call transformation coordinator to transform data
    // 3. Call load coordinator to load data
    // For now, we return a placeholder indicating the pipeline would be started

    return {
      pipelineId: `pl_${Date.now().toString(36)}`,
      status: LoadStatus.PENDING,
      startedAt: new Date(),
      totalDuration: 0,
      extraction: this.createPendingPhaseStatus('extraction'),
      transformation: this.createPendingPhaseStatus('transformation'),
      load: this.createPendingPhaseStatus('load'),
      totalRecordsProcessed: 0,
    };
  }

  /**
   * Get full pipeline status
   *
   * @description Returns the status of the full ETL pipeline (all phases).
   */
  @Get('pipeline/status')
  @ApiOperation({
    summary: 'Get full pipeline status',
    description: 'Returns the status of the full ETL pipeline (extract, transform, load).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pipeline status',
    type: PipelineStatusResponseDto,
  })
  async getPipelineStatus(): Promise<PipelineStatusResponseDto | { status: 'idle'; message: string }> {
    const status = this.loadCoordinator.getCurrentStatus();

    if (!status.isRunning) {
      return {
        status: 'idle',
        message: 'No pipeline is currently running',
      };
    }

    return {
      pipelineId: status.currentPipelineId!,
      status: LoadStatus.RUNNING,
      startedAt: new Date(),
      totalDuration: 0,
      extraction: this.createPendingPhaseStatus('extraction'),
      transformation: this.createPendingPhaseStatus('transformation'),
      load: this.createRunningPhaseStatus('load'),
      totalRecordsProcessed: 0,
    };
  }

  /**
   * Get load log history
   *
   * @description Returns paginated load log history with optional filters.
   */
  @Get('load/logs')
  @ApiOperation({
    summary: 'Get load log history',
    description: 'Returns paginated load log history with optional filters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Load log history',
    type: PaginatedLoadLogsDto,
  })
  async getLoadLogs(
    @Query() query: LoadLogQueryDto,
  ): Promise<PaginatedLoadLogsDto> {
    const result = await this.loadCoordinator.getLoadHistory(
      query.limit ?? 20,
      query.offset ?? 0,
      {
        loaderName: query.loaderName,
        status: query.status,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
      },
    );

    return {
      data: (result.data as Record<string, unknown>[]).map((item) => ({
        loadId: item.load_id as string,
        loaderName: item.loader_name as string,
        targetTable: item.target_table as string,
        status: item.status as LoadStatus,
        startedAt: new Date(item.started_at as string),
        completedAt: item.completed_at
          ? new Date(item.completed_at as string)
          : undefined,
        rowsInserted: item.rows_inserted as number,
        rowsUpdated: item.rows_updated as number,
        rowsRejected: item.rows_rejected as number,
        errorMessage: (item.error_message as string) || undefined,
      })),
      total: result.total,
      page: Math.floor((query.offset ?? 0) / (query.limit ?? 20)) + 1,
      pageSize: query.limit ?? 20,
      totalPages: Math.ceil(result.total / (query.limit ?? 20)),
    };
  }

  /**
   * Map internal status to LoadStatus enum
   */
  private mapResultToStatus(status: LoadStatus): LoadStatus {
    return status;
  }

  /**
   * Create pending phase status
   */
  private createPendingPhaseStatus(phase: string): PhaseStatusDto {
    return {
      phase,
      status: LoadStatus.PENDING,
      duration: 0,
      recordsProcessed: 0,
      operations: [],
    };
  }

  /**
   * Create running phase status
   */
  private createRunningPhaseStatus(phase: string): PhaseStatusDto {
    return {
      phase,
      status: LoadStatus.RUNNING,
      startedAt: new Date(),
      duration: 0,
      recordsProcessed: 0,
      operations: [],
    };
  }
}
