/**
 * Chart Response DTOs
 *
 * DTOs for chart generation responses.
 * Contains chart configurations and rendered data.
 *
 * @module visualization/dto
 * @sprint 4 - EXT-005 Visualizations
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChartType } from '../interfaces';

/**
 * Chart dataset response DTO
 */
export class ChartDatasetResponseDto {
  @ApiProperty({ description: 'Dataset label' })
  label!: string;

  @ApiProperty({ description: 'Dataset values' })
  data!: number[] | object[];

  @ApiPropertyOptional({ description: 'Background color(s)' })
  backgroundColor?: string | string[];

  @ApiPropertyOptional({ description: 'Border color(s)' })
  borderColor?: string | string[];
}

/**
 * Chart data response DTO
 */
export class ChartDataResponseDto {
  @ApiPropertyOptional({ description: 'Chart labels' })
  labels?: string[];

  @ApiProperty({ description: 'Chart datasets', type: [ChartDatasetResponseDto] })
  datasets!: ChartDatasetResponseDto[];
}

/**
 * Chart configuration response DTO
 */
export class ChartConfigResponseDto {
  @ApiProperty({ description: 'Chart ID' })
  id!: string;

  @ApiProperty({ description: 'Chart type', enum: ChartType })
  type!: ChartType;

  @ApiProperty({ description: 'Chart data', type: ChartDataResponseDto })
  data!: ChartDataResponseDto;

  @ApiPropertyOptional({ description: 'Chart options' })
  options?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Chart title' })
  title?: string;
}

/**
 * Chart render response DTO
 */
export class ChartRenderResponseDto {
  @ApiProperty({ description: 'Chart ID' })
  chartId!: string;

  @ApiProperty({ description: 'Chart configuration', type: ChartConfigResponseDto })
  config!: ChartConfigResponseDto;

  @ApiPropertyOptional({ description: 'Static image URL' })
  imageUrl?: string;

  @ApiProperty({ description: 'Render time in milliseconds' })
  renderTime!: number;

  @ApiProperty({ description: 'Whether data was served from cache' })
  cacheHit!: boolean;
}

/**
 * Progress summary DTO
 */
export class ProgressSummaryDto {
  @ApiProperty({ description: 'Overall progress percentage', example: 75.5 })
  overallProgress!: number;

  @ApiProperty({ description: 'Total number of exercises', example: 100 })
  totalExercises!: number;

  @ApiProperty({ description: 'Number of completed exercises', example: 75 })
  completedExercises!: number;

  @ApiProperty({ description: 'Average score', example: 85.2 })
  averageScore!: number;
}

/**
 * Student progress chart response DTO
 */
export class StudentProgressChartResponseDto {
  @ApiProperty({ description: 'Student ID' })
  studentId!: string;

  @ApiProperty({ description: 'Student name' })
  studentName!: string;

  @ApiProperty({ description: 'Progress charts', type: [ChartConfigResponseDto] })
  charts!: ChartConfigResponseDto[];

  @ApiProperty({ description: 'Progress summary', type: ProgressSummaryDto })
  summary!: ProgressSummaryDto;
}

/**
 * Ranking entry DTO
 */
export class RankingEntryDto {
  @ApiProperty({ description: 'Rank position', example: 1 })
  rank!: number;

  @ApiProperty({ description: 'Classroom ID', example: 'uuid' })
  classroomId!: string;

  @ApiProperty({ description: 'Classroom name', example: 'Class A' })
  classroomName!: string;

  @ApiProperty({ description: 'Metric value', example: 95 })
  value!: number;
}

/**
 * Class comparison chart response DTO
 */
export class ClassComparisonChartResponseDto {
  @ApiProperty({ description: 'Classroom ID' })
  classroomId!: string;

  @ApiProperty({ description: 'Classroom name' })
  classroomName!: string;

  @ApiProperty({ description: 'Comparison chart', type: ChartConfigResponseDto })
  chart!: ChartConfigResponseDto;

  @ApiProperty({ description: 'Rankings', type: [RankingEntryDto] })
  rankings!: RankingEntryDto[];
}

/**
 * Engagement summary DTO
 */
export class EngagementSummaryDto {
  @ApiProperty({ description: 'Peak hour of engagement (0-23)', example: 14 })
  peakHour!: number;

  @ApiProperty({ description: 'Peak day of engagement', example: 'Wednesday' })
  peakDay!: string;

  @ApiProperty({ description: 'Average engagement percentage', example: 72.5 })
  averageEngagement!: number;

  @ApiProperty({ description: 'Total number of sessions', example: 1250 })
  totalSessions!: number;
}

/**
 * Engagement heatmap response DTO
 */
export class EngagementHeatmapResponseDto {
  @ApiProperty({ description: 'Heatmap chart', type: ChartConfigResponseDto })
  chart!: ChartConfigResponseDto;

  @ApiProperty({ description: 'Engagement summary', type: EngagementSummaryDto })
  summary!: EngagementSummaryDto;
}
