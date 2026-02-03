/**
 * Aggregation Controller
 *
 * REST API endpoints for data aggregation and KPI retrieval.
 *
 * @module visualization/controllers
 * @sprint 4 - EXT-005 Visualizations
 */

import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AggregationService } from '../services';
import {
  AggregationQueryDto,
  AggregationResponseDto,
  KPIRequestDto,
  KPIResponseDto,
} from '../dto';

@ApiTags('Visualization - Aggregation')
@ApiBearerAuth()
@Controller('visualization/aggregation')
export class AggregationController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Post('query')
  @ApiOperation({ summary: 'Execute aggregation query' })
  @ApiResponse({
    status: 201,
    description: 'Aggregation executed successfully',
    type: AggregationResponseDto,
  })
  async executeQuery(
    @Body() dto: AggregationQueryDto,
  ): Promise<AggregationResponseDto> {
    return this.aggregationService.aggregate(dto);
  }

  @Get('kpi')
  @ApiOperation({ summary: 'Get KPI value' })
  @ApiResponse({
    status: 200,
    description: 'KPI retrieved successfully',
    type: KPIResponseDto,
  })
  async getKPI(@Query() dto: KPIRequestDto): Promise<KPIResponseDto> {
    return this.aggregationService.getKPI(dto);
  }
}
