import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for XP distribution data
 */
export class XpDistributionDto {
  @ApiProperty({
    description: 'XP range bucket',
    example: '101-500 XP',
  })
    xp_range!: string;

  @ApiProperty({
    description: 'Number of users in this XP range',
    example: 450,
  })
    users_count!: number;
}

/**
 * DTO for rank distribution data
 */
export class RankDistributionDto {
  @ApiProperty({
    description: 'Maya rank name',
    example: 'halach_uinik',
  })
    current_rank!: string;

  @ApiProperty({
    description: 'Number of users with this rank',
    example: 120,
  })
    users_count!: number;

  @ApiProperty({
    description: 'Average XP for users with this rank',
    example: 2850.5,
  })
    avg_xp!: number;

  @ApiProperty({
    description: 'Average exercises completed by users with this rank',
    example: 18.7,
  })
    avg_exercises!: number;
}

/**
 * DTO for level distribution data
 */
export class LevelDistributionDto {
  @ApiProperty({
    description: 'User level',
    example: 5,
  })
    current_level!: number;

  @ApiProperty({
    description: 'Number of users at this level',
    example: 230,
  })
    users_count!: number;
}

/**
 * DTO for complete gamification analytics response
 */
export class GamificationAnalyticsDto {
  @ApiProperty({
    description: 'Distribution of users across XP ranges',
    type: [XpDistributionDto],
  })
    xp_distribution!: XpDistributionDto[];

  @ApiProperty({
    description: 'Distribution of users across Maya ranks',
    type: [RankDistributionDto],
  })
    ranks_distribution!: RankDistributionDto[];

  @ApiProperty({
    description: 'Distribution of users across levels',
    type: [LevelDistributionDto],
  })
    levels_distribution!: LevelDistributionDto[];
}
