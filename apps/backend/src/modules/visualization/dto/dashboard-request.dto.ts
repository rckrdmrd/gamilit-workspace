/**
 * Dashboard Request DTOs
 *
 * DTOs for dashboard-related requests with validation.
 * Used for getting, creating, and updating dashboards.
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
  IsDateString,
  IsBoolean,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DashboardScope } from '../interfaces';

/**
 * Date range filter DTO
 */
export class DateRangeDto {
  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  start!: string;

  @ApiProperty({ description: 'End date' })
  @IsDateString()
  end!: string;

  @ApiPropertyOptional({ description: 'Preset option' })
  @IsOptional()
  @IsString()
  preset?: string;
}

/**
 * Global filter DTO for dashboard filtering
 */
export class GlobalFilterDto {
  @ApiProperty({ description: 'Filter field' })
  @IsString()
  field!: string;

  @ApiProperty({ description: 'Filter value' })
  value!: unknown;
}

/**
 * Request DTO for getting a dashboard with optional filters
 */
export class GetDashboardDto {
  @ApiProperty({ description: 'Dashboard ID' })
  @IsUUID()
  dashboardId!: string;

  @ApiPropertyOptional({ description: 'Date range filter' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({ description: 'Global filters' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GlobalFilterDto)
  filters?: GlobalFilterDto[];

  @ApiPropertyOptional({ description: 'Include widget data' })
  @IsOptional()
  @IsBoolean()
  includeData?: boolean;
}

/**
 * Request DTO for getting widget data
 */
export class GetWidgetDataDto {
  @ApiProperty({ description: 'Widget ID' })
  @IsUUID()
  widgetId!: string;

  @ApiPropertyOptional({ description: 'Date range filter' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({ description: 'Additional filters' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GlobalFilterDto)
  filters?: GlobalFilterDto[];

  @ApiPropertyOptional({ description: 'Force refresh (ignore cache)' })
  @IsOptional()
  @IsBoolean()
  forceRefresh?: boolean;
}

/**
 * Query DTO for listing dashboards with pagination
 */
export class ListDashboardsDto {
  @ApiPropertyOptional({ description: 'Dashboard scope' })
  @IsOptional()
  @IsEnum(DashboardScope)
  scope?: DashboardScope;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * Request DTO for creating a new dashboard
 */
export class CreateDashboardDto {
  @ApiProperty({ description: 'Dashboard name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Dashboard description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Dashboard scope' })
  @IsEnum(DashboardScope)
  scope!: DashboardScope;

  @ApiPropertyOptional({ description: 'Based on template ID' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Number of columns', default: 12 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  columns?: number;
}

/**
 * Request DTO for updating an existing dashboard
 */
export class UpdateDashboardDto {
  @ApiPropertyOptional({ description: 'Dashboard name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Dashboard description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Refresh interval in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(10)
  refreshInterval?: number;
}
