/**
 * Chart Request DTOs
 *
 * DTOs for chart generation and visualization requests.
 * Supports various chart types and data aggregations.
 *
 * @module visualization/dto
 * @sprint 4 - EXT-005 Visualizations
 */

import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  ValidateNested,
  IsBoolean,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChartType, AggregationType, TimeGranularity } from '../interfaces';
import { DateRangeDto } from './dashboard-request.dto';

/**
 * Chart filter DTO for filtering chart data
 */
export class ChartFilterDto {
  @ApiProperty({ description: 'Filter field' })
  @IsString()
  field!: string;

  @ApiProperty({
    description: 'Filter operator',
    enum: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'between'],
  })
  @IsEnum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'between'])
  operator!: string;

  @ApiProperty({ description: 'Filter value' })
  value!: unknown;
}

/**
 * Request DTO for generating a chart
 */
export class GenerateChartDto {
  @ApiProperty({ description: 'Chart type', enum: ChartType })
  @IsEnum(ChartType)
  type!: ChartType;

  @ApiProperty({ description: 'Metric to visualize' })
  @IsString()
  metric!: string;

  @ApiPropertyOptional({ description: 'Aggregation type', enum: AggregationType })
  @IsOptional()
  @IsEnum(AggregationType)
  aggregation?: AggregationType;

  @ApiPropertyOptional({ description: 'Group by fields' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @ApiPropertyOptional({ description: 'Time granularity for time series', enum: TimeGranularity })
  @IsOptional()
  @IsEnum(TimeGranularity)
  timeGranularity?: TimeGranularity;

  @ApiPropertyOptional({ description: 'Date range' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({ description: 'Filters' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChartFilterDto)
  filters?: ChartFilterDto[];

  @ApiPropertyOptional({ description: 'Maximum data points', default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;

  @ApiPropertyOptional({ description: 'Chart title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Show legend' })
  @IsOptional()
  @IsBoolean()
  showLegend?: boolean;

  @ApiPropertyOptional({ description: 'Enable animations' })
  @IsOptional()
  @IsBoolean()
  animate?: boolean;
}

/**
 * Request DTO for getting student progress chart
 */
export class GetStudentProgressChartDto {
  @ApiProperty({ description: 'Student ID' })
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({ description: 'Subject filter' })
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional({ description: 'Date range' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;
}

/**
 * Request DTO for getting class comparison chart
 */
export class GetClassComparisonChartDto {
  @ApiProperty({ description: 'Classroom ID' })
  @IsUUID()
  classroomId!: string;

  @ApiProperty({
    description: 'Comparison metric',
    enum: ['progress', 'engagement', 'performance', 'participation'],
  })
  @IsEnum(['progress', 'engagement', 'performance', 'participation'])
  metric!: string;

  @ApiPropertyOptional({ description: 'Compare with classroom IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  compareWith?: string[];
}

/**
 * Request DTO for getting engagement heatmap
 */
export class GetEngagementHeatmapDto {
  @ApiPropertyOptional({
    description: 'Entity type',
    enum: ['student', 'classroom', 'subject'],
  })
  @IsOptional()
  @IsEnum(['student', 'classroom', 'subject'])
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID' })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Date range' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({ description: 'Granularity', enum: ['hour', 'day'] })
  @IsOptional()
  @IsEnum(['hour', 'day'])
  granularity?: string;
}
