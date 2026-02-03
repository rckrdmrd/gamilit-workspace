/**
 * Chart Controller
 *
 * REST API endpoints for chart generation and data retrieval.
 *
 * @module visualization/controllers
 * @sprint 4 - EXT-005 Visualizations
 */

import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ChartService } from '../services';
import {
  GenerateChartDto,
  GetStudentProgressChartDto,
  GetClassComparisonChartDto,
  GetEngagementHeatmapDto,
  ChartRenderResponseDto,
  StudentProgressChartResponseDto,
  ClassComparisonChartResponseDto,
  EngagementHeatmapResponseDto,
} from '../dto';

@ApiTags('Visualization - Charts')
@ApiBearerAuth()
@Controller('visualization/charts')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a chart' })
  @ApiResponse({
    status: 201,
    description: 'Chart generated successfully',
    type: ChartRenderResponseDto,
  })
  async generateChart(
    @Body() dto: GenerateChartDto,
  ): Promise<ChartRenderResponseDto> {
    return this.chartService.generateChart(dto);
  }

  @Get('student/:studentId/progress')
  @ApiOperation({ summary: 'Get student progress charts' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'Charts retrieved successfully',
    type: StudentProgressChartResponseDto,
  })
  async getStudentProgressChart(
    @Param('studentId') studentId: string,
    @Query() query: Omit<GetStudentProgressChartDto, 'studentId'>,
  ): Promise<StudentProgressChartResponseDto> {
    return this.chartService.getStudentProgressChart({ ...query, studentId });
  }

  @Get('classroom/:classroomId/comparison')
  @ApiOperation({ summary: 'Get class comparison chart' })
  @ApiParam({ name: 'classroomId', description: 'Classroom ID' })
  @ApiResponse({
    status: 200,
    description: 'Chart retrieved successfully',
    type: ClassComparisonChartResponseDto,
  })
  async getClassComparisonChart(
    @Param('classroomId') classroomId: string,
    @Query() query: Omit<GetClassComparisonChartDto, 'classroomId'>,
  ): Promise<ClassComparisonChartResponseDto> {
    return this.chartService.getClassComparisonChart({ ...query, classroomId });
  }

  @Get('engagement/heatmap')
  @ApiOperation({ summary: 'Get engagement heatmap' })
  @ApiResponse({
    status: 200,
    description: 'Heatmap retrieved successfully',
    type: EngagementHeatmapResponseDto,
  })
  async getEngagementHeatmap(
    @Query() dto: GetEngagementHeatmapDto,
  ): Promise<EngagementHeatmapResponseDto> {
    return this.chartService.getEngagementHeatmap(dto);
  }
}
