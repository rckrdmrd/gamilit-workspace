/**
 * Aggregation DTOs
 *
 * DTOs for data aggregation queries and KPI requests.
 * Supports various aggregation types and time-based analysis.
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
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AggregationType, TimeGranularity } from '../interfaces';
import { DateRangeDto, GlobalFilterDto } from './dashboard-request.dto';

/**
 * Request DTO for aggregation queries
 */
export class AggregationQueryDto {
  @ApiProperty({ description: 'Metric to aggregate' })
  @IsString()
  metric!: string;

  @ApiProperty({ description: 'Aggregation type', enum: AggregationType })
  @IsEnum(AggregationType)
  aggregation!: AggregationType;

  @ApiPropertyOptional({ description: 'Group by fields' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @ApiPropertyOptional({ description: 'Time granularity', enum: TimeGranularity })
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
  @Type(() => GlobalFilterDto)
  filters?: GlobalFilterDto[];

  @ApiPropertyOptional({ description: 'Result limit', default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;

  @ApiPropertyOptional({ description: 'Percentile value (0-100) for PERCENTILE aggregation' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentileValue?: number;
}

/**
 * Aggregation result DTO
 */
export class AggregationResultDto {
  @ApiProperty({ description: 'Dimension values' })
  dimensions!: Record<string, unknown>;

  @ApiProperty({ description: 'Aggregated value' })
  value!: number;

  @ApiPropertyOptional({ description: 'Time bucket for time-series data' })
  timeBucket?: Date;
}

/**
 * Aggregation response DTO
 */
export class AggregationResponseDto {
  @ApiProperty({ description: 'Aggregation results', type: [AggregationResultDto] })
  data!: AggregationResultDto[];

  @ApiProperty({ description: 'Total records processed' })
  totalRecords!: number;

  @ApiProperty({ description: 'Query time in milliseconds' })
  queryTime!: number;

  @ApiProperty({ description: 'Whether data was served from cache' })
  cacheHit!: boolean;
}

/**
 * Request DTO for KPI data
 */
export class KPIRequestDto {
  @ApiProperty({ description: 'KPI metric name' })
  @IsString()
  metric!: string;

  @ApiPropertyOptional({
    description: 'Entity type',
    enum: ['student', 'classroom', 'teacher', 'organization'],
  })
  @IsOptional()
  @IsEnum(['student', 'classroom', 'teacher', 'organization'])
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Date range' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({ description: 'Compare with previous period' })
  @IsOptional()
  @IsBoolean()
  comparePrevious?: boolean;
}

/**
 * KPI response DTO
 */
export class KPIResponseDto {
  @ApiProperty({ description: 'Metric name' })
  metric!: string;

  @ApiProperty({ description: 'Current value' })
  currentValue!: number;

  @ApiPropertyOptional({ description: 'Previous period value' })
  previousValue?: number;

  @ApiPropertyOptional({ description: 'Absolute change' })
  change?: number;

  @ApiPropertyOptional({ description: 'Percentage change' })
  changePercent?: number;

  @ApiPropertyOptional({ description: 'Trend direction', enum: ['up', 'down', 'stable'] })
  trend?: 'up' | 'down' | 'stable';

  @ApiProperty({ description: 'Value unit' })
  unit!: string;

  @ApiProperty({ description: 'Formatted value for display' })
  formattedValue!: string;
}
