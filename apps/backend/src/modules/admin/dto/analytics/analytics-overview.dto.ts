import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for analytics overview summary
 * Contains high-level metrics about users, activity, and engagement
 */
export class AnalyticsOverviewDto {
  @ApiProperty({
    description: 'Total number of users in the system',
    example: 1250,
  })
    total_users!: number;

  @ApiProperty({
    description: 'Total number of students',
    example: 1000,
  })
    total_students!: number;

  @ApiProperty({
    description: 'Total number of teachers',
    example: 50,
  })
    total_teachers!: number;

  @ApiProperty({
    description: 'Number of active users',
    example: 850,
  })
    active_users!: number;

  @ApiProperty({
    description: 'Average XP across all users',
    example: 1523.45,
  })
    avg_xp!: number;

  @ApiProperty({
    description: 'Average exercises completed per user',
    example: 12.8,
  })
    avg_exercises_completed!: number;

  @ApiProperty({
    description: 'Average engagement score (0-100)',
    example: 67.5,
  })
    avg_engagement_score!: number;

  @ApiProperty({
    description: 'Number of inactive users',
    example: 120,
  })
    inactive_users!: number;

  @ApiProperty({
    description: 'Number of beginner users',
    example: 450,
  })
    beginner_users!: number;

  @ApiProperty({
    description: 'Number of intermediate users',
    example: 380,
  })
    intermediate_users!: number;

  @ApiProperty({
    description: 'Number of advanced users',
    example: 300,
  })
    advanced_users!: number;
}
