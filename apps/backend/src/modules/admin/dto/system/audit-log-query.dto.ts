import { IsOptional, IsString, IsBoolean, IsInt, Min, Max, IsDateString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 'abc123...',
  })
  @IsOptional()
  @IsString()
    user_id?: string;

  /**
   * FIX-2025-01-07 P0: Added @MaxLength to prevent DoS attacks
   */
  @ApiPropertyOptional({
    description: 'Filter by email',
    example: 'user@example.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
    email?: string;

  @ApiPropertyOptional({
    description: 'Filter by IP address',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
    ip_address?: string;

  @ApiPropertyOptional({
    description: 'Filter by success status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
    success?: boolean;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO 8601)',
    example: '2025-11-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
    start_date?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO 8601)',
    example: '2025-11-02T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
    end_date?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
    page?: number;

  /**
   * FIX-2025-01-07 P0: Added @Max to prevent resource exhaustion
   */
  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 50,
    default: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
    limit?: number;
}
