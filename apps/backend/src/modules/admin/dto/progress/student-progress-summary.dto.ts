import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for student progress summary within a classroom
 */
export class StudentProgressSummaryDto {
  @ApiProperty({
    description: 'Student user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user_id!: string;

  @ApiProperty({
    description: 'Student display name',
    example: 'Juan Pérez',
  })
  display_name!: string;

  @ApiProperty({
    description: 'Student email',
    example: 'juan.perez@ejemplo.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Student level',
    example: 5,
  })
  level!: number;

  @ApiProperty({
    description: 'Total XP earned',
    example: 1250,
  })
  total_xp!: number;

  @ApiProperty({
    description: 'Number of exercises completed',
    example: 45,
  })
  exercises_completed!: number;

  @ApiProperty({
    description: 'Number of modules completed',
    example: 3,
  })
  modules_completed!: number;

  @ApiProperty({
    description: 'Current streak in days',
    example: 7,
  })
  streak_days!: number;

  @ApiProperty({
    description: 'Last activity timestamp',
    example: '2025-11-24T10:30:00Z',
    nullable: true,
  })
  last_activity_at!: string | null;

  @ApiProperty({
    description: 'Average module progress percentage',
    example: 68.5,
  })
  avg_module_progress!: number;

  @ApiProperty({
    description: 'Number of modules completed in this classroom',
    example: 2,
  })
  modules_completed_count!: number;

  @ApiProperty({
    description: 'Total number of submissions',
    example: 52,
  })
  total_submissions!: number;

  @ApiProperty({
    description: 'Number of correct submissions',
    example: 43,
  })
  correct_submissions!: number;

  @ApiProperty({
    description: 'Average score across submissions',
    example: 82.5,
    nullable: true,
  })
  avg_score!: number | null;
}
