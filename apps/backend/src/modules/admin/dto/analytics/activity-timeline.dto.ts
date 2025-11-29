import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for daily activity metrics
 */
export class DailyActivityDto {
  @ApiProperty({
    description: 'Activity date (ISO format)',
    example: '2025-11-24',
  })
    activity_date!: string;

  @ApiProperty({
    description: 'Number of unique active users on this date',
    example: 245,
  })
    unique_users!: number;

  @ApiProperty({
    description: 'Total number of activities recorded',
    example: 1230,
  })
    total_activities!: number;

  @ApiProperty({
    description: 'Number of exercises completed',
    example: 580,
  })
    exercises_completed!: number;

  @ApiProperty({
    description: 'Number of modules completed',
    example: 45,
  })
    modules_completed!: number;

  @ApiProperty({
    description: 'Number of login events',
    example: 320,
  })
    logins!: number;
}

/**
 * DTO for complete activity timeline response
 */
export class ActivityTimelineDto {
  @ApiProperty({
    description: 'Daily activity data ordered by date (most recent first)',
    type: [DailyActivityDto],
  })
    timeline!: DailyActivityDto[];
}
