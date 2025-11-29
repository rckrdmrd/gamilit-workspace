import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for metrics history
 */
export class MetricsHistoryQueryDto {
  @ApiPropertyOptional({
    description: 'Number of hours of history to retrieve',
    minimum: 1,
    maximum: 168,
    default: 24,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(168) // max 7 days
    hours?: number = 24;
}

/**
 * Single metric data point
 */
export class MetricDataPoint {
  @ApiProperty({ description: 'Timestamp of the data point' })
    timestamp!: string;

  @ApiProperty({ description: 'Memory usage percentage' })
    memory_usage_percent!: number;

  @ApiProperty({ description: 'CPU usage percentage' })
    cpu_usage_percent!: number;

  @ApiProperty({ description: 'Number of active requests' })
    active_requests!: number;
}

/**
 * Response DTO for metrics history
 */
export class MetricsHistoryDto {
  @ApiProperty({
    description: 'Whether historical tracking is enabled',
    example: false,
  })
    historical_tracking_enabled!: boolean;

  @ApiProperty({
    description: 'Array of metric data points',
    type: [MetricDataPoint],
  })
    data_points!: MetricDataPoint[];

  @ApiPropertyOptional({
    description: 'Additional notes about the data',
  })
    note?: string;
}
