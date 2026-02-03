/**
 * Dashboard Response DTOs
 *
 * DTOs for dashboard-related responses.
 * Used for returning dashboard data to clients.
 *
 * @module visualization/dto
 * @sprint 4 - EXT-005 Visualizations
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DashboardScope, WidgetType } from '../interfaces';

/**
 * Widget position response DTO
 */
export class WidgetPositionResponseDto {
  @ApiProperty({ description: 'X position in grid' })
  x!: number;

  @ApiProperty({ description: 'Y position in grid' })
  y!: number;

  @ApiProperty({ description: 'Widget width in grid units' })
  width!: number;

  @ApiProperty({ description: 'Widget height in grid units' })
  height!: number;
}

/**
 * Widget configuration response DTO
 */
export class WidgetConfigResponseDto {
  @ApiProperty({ description: 'Widget ID' })
  id!: string;

  @ApiProperty({ description: 'Widget type', enum: WidgetType })
  type!: WidgetType;

  @ApiProperty({ description: 'Widget title' })
  title!: string;

  @ApiProperty({ description: 'Widget position', type: WidgetPositionResponseDto })
  position!: WidgetPositionResponseDto;

  @ApiPropertyOptional({ description: 'Refresh interval in seconds' })
  refreshInterval?: number;
}

/**
 * Dashboard layout response DTO
 */
export class DashboardLayoutResponseDto {
  @ApiProperty({ description: 'Layout ID' })
  id!: string;

  @ApiProperty({ description: 'Layout name' })
  name!: string;

  @ApiProperty({ description: 'Dashboard scope', enum: DashboardScope })
  scope!: DashboardScope;

  @ApiProperty({ description: 'Number of columns' })
  columns!: number;

  @ApiProperty({ description: 'Row height in pixels' })
  rowHeight!: number;

  @ApiProperty({ description: 'Widgets configuration', type: [WidgetConfigResponseDto] })
  widgets!: WidgetConfigResponseDto[];

  @ApiProperty({ description: 'Is default dashboard' })
  isDefault!: boolean;

  @ApiProperty({ description: 'Is customizable' })
  isCustomizable!: boolean;
}

/**
 * Full dashboard response DTO
 */
export class DashboardResponseDto {
  @ApiProperty({ description: 'Dashboard ID' })
  id!: string;

  @ApiProperty({ description: 'Dashboard name' })
  name!: string;

  @ApiPropertyOptional({ description: 'Dashboard description' })
  description?: string;

  @ApiProperty({ description: 'Dashboard scope', enum: DashboardScope })
  scope!: DashboardScope;

  @ApiProperty({ description: 'Dashboard layout', type: DashboardLayoutResponseDto })
  layout!: DashboardLayoutResponseDto;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;
}

/**
 * Widget data response DTO
 */
export class WidgetDataResponseDto {
  @ApiProperty({ description: 'Widget ID' })
  widgetId!: string;

  @ApiProperty({ description: 'Widget data payload' })
  data!: unknown;

  @ApiProperty({ description: 'Data timestamp' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Whether data was served from cache' })
  cacheHit!: boolean;
}

/**
 * Dashboard snapshot response DTO with all widget data
 */
export class DashboardSnapshotResponseDto {
  @ApiProperty({ description: 'Dashboard ID' })
  dashboardId!: string;

  @ApiProperty({ description: 'Dashboard configuration', type: DashboardResponseDto })
  dashboard!: DashboardResponseDto;

  @ApiProperty({ description: 'Widget data array', type: [WidgetDataResponseDto] })
  widgetData!: WidgetDataResponseDto[];

  @ApiProperty({ description: 'Snapshot generation timestamp' })
  generatedAt!: Date;

  @ApiProperty({ description: 'Generation time in milliseconds' })
  generationTime!: number;
}

/**
 * Paginated dashboard list response DTO
 */
export class DashboardListResponseDto {
  @ApiProperty({ description: 'Dashboard items', type: [DashboardResponseDto] })
  items!: DashboardResponseDto[];

  @ApiProperty({ description: 'Total number of dashboards' })
  total!: number;

  @ApiProperty({ description: 'Current page number' })
  page!: number;

  @ApiProperty({ description: 'Items per page' })
  limit!: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages!: number;
}
