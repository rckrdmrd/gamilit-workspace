import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for error trends
 */
export class ErrorTrendsQueryDto {
  @ApiPropertyOptional({
    description: 'Number of hours to analyze',
    minimum: 1,
    maximum: 168,
    default: 24,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(168)
    hours?: number = 24;

  @ApiPropertyOptional({
    description: 'Time grouping interval',
    enum: ['hour', 'day'],
    default: 'hour',
  })
  @IsOptional()
  @IsString()
  @IsIn(['hour', 'day'])
    group_by?: string = 'hour';
}

/**
 * Single error trend data point
 */
export class ErrorTrendDataPoint {
  @ApiProperty({
    description: 'Time bucket timestamp',
    example: '2025-11-24T18:00:00Z',
  })
    time_bucket!: string;

  @ApiProperty({
    description: 'Total error count in this bucket',
    example: 5,
  })
    error_count!: number;

  @ApiProperty({
    description: 'Number of fatal errors',
    example: 1,
  })
    fatal_count!: number;

  @ApiProperty({
    description: 'Number of error-level errors',
    example: 4,
  })
    error_count_level!: number;

  @ApiProperty({
    description: 'Number of unique error sources',
    example: 3,
  })
    unique_sources!: number;
}

/**
 * Response DTO for error trends
 */
export class ErrorTrendsDto {
  @ApiProperty({
    description: 'Array of error trend data points',
    type: [ErrorTrendDataPoint],
  })
    trends!: ErrorTrendDataPoint[];

  @ApiProperty({
    description: 'Grouping interval used',
    enum: ['hour', 'day'],
    example: 'hour',
  })
    group_by!: string;

  @ApiProperty({
    description: 'Time period analyzed in hours',
    example: 24,
  })
    time_period_hours!: number;
}
