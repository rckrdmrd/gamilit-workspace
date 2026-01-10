/**
 * System Logs DTOs
 *
 * DTOs for querying and displaying system logs from audit_logging.system_logs
 *
 * @author Claude Code Agent
 * @date 2026-01-07
 * @task TASK-SETTINGS-LOGS-ENDPOINT
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for system logs
 */
export class SystemLogsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by log level',
    enum: ['debug', 'info', 'warn', 'error', 'fatal'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['debug', 'info', 'warn', 'error', 'fatal'])
  log_level?: 'debug' | 'info' | 'warn' | 'error' | 'fatal';

  @ApiPropertyOptional({
    description: 'Filter by source module/component',
    example: 'AuthService',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO 8601)',
    example: '2026-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO 8601)',
    example: '2026-01-07T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Search term for message or source',
    example: 'error',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

/**
 * Single system log entry
 */
export class SystemLogDto {
  @ApiProperty({ description: 'Log entry ID' })
  id: string;

  @ApiProperty({
    description: 'Log level',
    enum: ['debug', 'info', 'warn', 'error', 'fatal'],
  })
  log_level: string;

  @ApiProperty({ description: 'Log message' })
  message: string;

  @ApiPropertyOptional({
    description: 'Additional context data',
  })
  context?: Record<string, unknown>;

  @ApiProperty({ description: 'Source module/component' })
  source: string;

  @ApiPropertyOptional({ description: 'User ID associated with the log' })
  user_id?: string;

  @ApiPropertyOptional({ description: 'Tenant ID associated with the log' })
  tenant_id?: string;

  @ApiPropertyOptional({ description: 'IP address of the request' })
  ip_address?: string;

  @ApiPropertyOptional({ description: 'User agent string' })
  user_agent?: string;

  @ApiPropertyOptional({ description: 'Request path' })
  request_path?: string;

  @ApiPropertyOptional({ description: 'HTTP method' })
  request_method?: string;

  @ApiPropertyOptional({ description: 'HTTP response status code' })
  response_status?: number;

  @ApiPropertyOptional({ description: 'Request duration in milliseconds' })
  duration_ms?: number;

  @ApiPropertyOptional({ description: 'Stack trace for errors' })
  stack_trace?: string;

  @ApiProperty({ description: 'Timestamp of the log entry' })
  created_at: string;
}

/**
 * Paginated system logs response
 */
export class PaginatedSystemLogsDto {
  @ApiProperty({
    description: 'List of log entries',
    type: [SystemLogDto],
  })
  data: SystemLogDto[];

  @ApiProperty({ description: 'Total number of entries' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  total_pages: number;
}
