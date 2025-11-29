import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for engagement metrics by user segment
 */
export class EngagementBySegmentDto {
  @ApiProperty({
    description: 'User segment classification',
    example: 'intermediate',
    enum: ['inactive', 'beginner', 'intermediate', 'advanced'],
  })
    user_segment!: string;

  @ApiProperty({
    description: 'Number of users in this segment',
    example: 380,
  })
    users_count!: number;

  @ApiProperty({
    description: 'Average engagement score for this segment (0-100)',
    example: 72.5,
  })
    avg_engagement_score!: number;

  @ApiProperty({
    description: 'Average exercises completed in this segment',
    example: 15.3,
  })
    avg_exercises_completed!: number;

  @ApiProperty({
    description: 'Average current streak in days',
    example: 5.8,
  })
    avg_streak!: number;

  @ApiProperty({
    description: 'Users active in the last 7 days',
    example: 320,
  })
    active_last_7d!: number;

  @ApiProperty({
    description: 'Users active in the last 30 days',
    example: 360,
  })
    active_last_30d!: number;
}

/**
 * DTO for complete engagement analytics response
 */
export class EngagementAnalyticsDto {
  @ApiProperty({
    description: 'Engagement metrics grouped by user segment',
    type: [EngagementBySegmentDto],
  })
    by_segment!: EngagementBySegmentDto[];
}
