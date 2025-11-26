import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for individual top user data
 */
export class TopUserDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  user_id!: string;

  @ApiProperty({
    description: 'User display name',
    example: 'Juan Pérez',
  })
  display_name!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'juan.perez@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User role',
    example: 'student',
  })
  role!: string;

  @ApiProperty({
    description: 'Total XP accumulated',
    example: 5280,
  })
  total_xp!: number;

  @ApiProperty({
    description: 'Total exercises completed',
    example: 42,
  })
  exercises_completed!: number;

  @ApiProperty({
    description: 'Current streak in days',
    example: 15,
  })
  current_streak!: number;

  @ApiProperty({
    description: 'Current Maya rank',
    example: 'halach_uinik',
  })
  current_rank!: string;

  @ApiProperty({
    description: 'Current level',
    example: 8,
  })
  current_level!: number;

  @ApiProperty({
    description: 'Engagement score (0-100)',
    example: 85.5,
  })
  engagement_score!: number;
}

/**
 * DTO for complete top users response
 */
export class TopUsersDto {
  @ApiProperty({
    description: 'Metric used for ranking',
    example: 'xp',
  })
  metric!: string;

  @ApiProperty({
    description: 'List of top users ordered by the specified metric',
    type: [TopUserDto],
  })
  users!: TopUserDto[];
}
