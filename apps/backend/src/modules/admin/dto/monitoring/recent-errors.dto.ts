import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for recent errors
 */
export class RecentErrorsQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of errors to return',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by log level',
    enum: ['error', 'fatal', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsString()
  @IsIn(['error', 'fatal', 'all'])
  level?: string = 'all';
}

/**
 * Single error entry
 */
export class RecentErrorDto {
  @ApiProperty({
    description: 'Error log ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Log level',
    enum: ['error', 'fatal'],
    example: 'error',
  })
  log_level!: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Database connection failed',
  })
  message!: string;

  @ApiProperty({
    description: 'Additional context as JSON',
    nullable: true,
    example: { stack: '...', code: 'ECONNREFUSED' },
  })
  context!: Record<string, any> | null;

  @ApiProperty({
    description: 'Source of the error',
    nullable: true,
    example: 'DatabaseService',
  })
  source!: string | null;

  @ApiProperty({
    description: 'Timestamp of the error',
    example: '2025-11-24T18:30:00Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'User ID associated with the error',
    nullable: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user_id!: string | null;

  @ApiProperty({
    description: 'User display name',
    nullable: true,
    example: 'John Doe',
  })
  user_name!: string | null;
}

/**
 * Response DTO for recent errors
 */
export class RecentErrorsDto {
  @ApiProperty({
    description: 'Array of recent errors',
    type: [RecentErrorDto],
  })
  errors!: RecentErrorDto[];

  @ApiProperty({
    description: 'Total count of errors returned',
    example: 20,
  })
  total_count!: number;
}
