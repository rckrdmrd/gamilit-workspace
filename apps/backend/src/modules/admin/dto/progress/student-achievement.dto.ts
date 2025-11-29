import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for individual student achievement
 */
export class StudentAchievementDto {
  @ApiProperty({ description: 'User achievement record ID' })
    id!: string;

  @ApiProperty({ description: 'Achievement ID' })
    achievement_id!: string;

  @ApiProperty({ description: 'Achievement name' })
    name!: string;

  @ApiProperty({ description: 'Achievement description' })
    description!: string;

  @ApiProperty({ description: 'Achievement category' })
    category!: string;

  @ApiProperty({
    description: 'Achievement tier',
    enum: ['bronze', 'silver', 'gold', 'platinum'],
  })
    tier!: string;

  @ApiProperty({ description: 'XP reward for this achievement' })
    xp_reward!: number;

  @ApiProperty({ description: 'ML Coins reward for this achievement' })
    ml_coins_reward!: number;

  @ApiProperty({ description: 'Icon URL', nullable: true })
    icon_url!: string | null;

  @ApiProperty({ description: 'Date when achievement was unlocked' })
    unlocked_at!: Date;

  @ApiProperty({ description: 'Current progress value', nullable: true })
    progress_current!: number | null;

  @ApiProperty({ description: 'Required progress value', nullable: true })
    progress_required!: number | null;
}

/**
 * DTO for student achievements response
 * Includes list of achievements and summary statistics by category and tier
 */
export class StudentAchievementsResponseDto {
  @ApiProperty({ description: 'Student user ID' })
    student_id!: string;

  @ApiProperty({ description: 'Total number of achievements earned' })
    total_achievements!: number;

  @ApiProperty({
    description: 'List of student achievements',
    type: [StudentAchievementDto],
  })
    achievements!: StudentAchievementDto[];

  @ApiProperty({
    description: 'Achievement count by category',
    example: { exploration: 5, mastery: 3, collaboration: 2 },
  })
    by_category!: Record<string, number>;

  @ApiProperty({
    description: 'Achievement count by tier',
    example: { bronze: 4, silver: 3, gold: 2, platinum: 1 },
  })
    by_tier!: Record<string, number>;
}
