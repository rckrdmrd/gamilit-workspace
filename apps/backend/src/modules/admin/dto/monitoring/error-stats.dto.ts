import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for error statistics
 */
export class ErrorStatsQueryDto {
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
}

/**
 * Response DTO for error statistics
 */
export class ErrorStatsDto {
  @ApiProperty({
    description: 'Total number of errors',
    example: 42,
  })
  total_errors!: number;

  @ApiProperty({
    description: 'Number of days with at least one error',
    example: 3,
  })
  days_with_errors!: number;

  @ApiProperty({
    description: 'Number of fatal errors',
    example: 2,
  })
  fatal_errors!: number;

  @ApiProperty({
    description: 'Number of error-level errors',
    example: 40,
  })
  error_level_errors!: number;

  @ApiProperty({
    description: 'Timestamp of first error',
    nullable: true,
    example: '2025-11-24T10:00:00Z',
  })
  first_error_at!: string | null;

  @ApiProperty({
    description: 'Timestamp of last error',
    nullable: true,
    example: '2025-11-24T18:30:00Z',
  })
  last_error_at!: string | null;

  @ApiProperty({
    description: 'Time period analyzed in hours',
    example: 24,
  })
  time_period_hours!: number;
}
