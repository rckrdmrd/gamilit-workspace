import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum } from 'class-validator';

/**
 * Enum for grouping time periods
 */
export enum GroupByEnum {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

/**
 * DTO for querying user activity analytics
 */
export class UserActivityQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for the analytics period (ISO 8601)',
    example: '2025-11-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
    startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for the analytics period (ISO 8601)',
    example: '2025-11-30T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
    endDate?: string;

  @ApiPropertyOptional({
    description: 'How to group the activity data',
    example: 'day',
    enum: GroupByEnum,
    default: GroupByEnum.DAY,
  })
  @IsOptional()
  @IsEnum(GroupByEnum)
    groupBy?: GroupByEnum = GroupByEnum.DAY;
}

/**
 * DTO for a single user activity data point
 * Used in tableData for detailed metrics display
 *
 * GAP-FE-002: Added to provide detailed data for frontend tables
 */
export class UserActivityDataPointDto {
  @ApiProperty({
    description: 'Date for this data point',
    example: '2025-11-01',
  })
    date!: string;

  @ApiProperty({
    description: 'Number of active users on this date',
    example: 45,
  })
    activeUsers!: number;

  @ApiProperty({
    description: 'Number of new user registrations on this date',
    example: 5,
  })
    newRegistrations!: number;

  @ApiProperty({
    description: 'Total number of sessions on this date',
    example: 120,
  })
    totalSessions!: number;

  @ApiProperty({
    description: 'Average session duration in minutes',
    example: 24.5,
  })
    avgSessionDuration!: number;
}

/**
 * DTO for user activity analytics response
 * Provides data for charts showing user activity over time
 *
 * GAP-FE-002: Updated to include both chart data (labels/data) and detailed table data
 */
export class UserActivityDto {
  @ApiProperty({
    description: 'Array of formatted date labels for chart x-axis',
    example: ['2025-11-01', '2025-11-02', '2025-11-03'],
    type: [String],
  })
    labels!: string[];

  @ApiProperty({
    description: 'Array of active user counts corresponding to each label',
    example: [45, 52, 48],
    type: [Number],
  })
    data!: number[];

  @ApiProperty({
    description: 'Detailed activity data for table display',
    type: [UserActivityDataPointDto],
  })
    tableData!: UserActivityDataPointDto[];
}
