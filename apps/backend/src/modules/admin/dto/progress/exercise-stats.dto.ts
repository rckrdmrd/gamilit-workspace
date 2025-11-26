import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for exercise information
 */
export class ExerciseInfoDto {
  @ApiProperty({ description: 'Exercise ID' })
  id!: string;

  @ApiProperty({ description: 'Exercise title' })
  title!: string;

  @ApiProperty({ description: 'Exercise description', nullable: true })
  description!: string | null;

  @ApiProperty({ description: 'Exercise type' })
  exercise_type!: string;

  @ApiProperty({ description: 'Difficulty level' })
  difficulty!: string;

  @ApiProperty({ description: 'XP reward' })
  xp_reward!: number;

  @ApiProperty({ description: 'ML Coins reward' })
  ml_coins_reward!: number;

  @ApiProperty({ description: 'Parent module ID' })
  module_id!: string;

  @ApiProperty({ description: 'Parent module title' })
  module_title!: string;
}

/**
 * DTO for exercise submission statistics
 */
export class SubmissionStatsDto {
  @ApiProperty({ description: 'Total students who attempted this exercise' })
  total_students_attempted!: number;

  @ApiProperty({ description: 'Total number of submissions' })
  total_submissions!: number;

  @ApiProperty({ description: 'Students who completed successfully' })
  students_completed!: number;

  @ApiProperty({ description: 'Completion rate percentage' })
  completion_rate!: number;

  @ApiProperty({ description: 'Average score', nullable: true })
  avg_score!: number | null;

  @ApiProperty({ description: 'Maximum score achieved', nullable: true })
  max_score_achieved!: number | null;

  @ApiProperty({ description: 'Minimum score achieved', nullable: true })
  min_score_achieved!: number | null;

  @ApiProperty({ description: 'Average time in seconds', nullable: true })
  avg_time_seconds!: number | null;

  @ApiProperty({ description: 'Average number of attempts' })
  avg_attempts!: number;
}

/**
 * DTO for complete exercise statistics
 * Includes exercise information and submission statistics
 */
export class ExerciseStatsDto {
  @ApiProperty({
    description: 'Exercise information',
    type: ExerciseInfoDto,
  })
  exercise_info!: ExerciseInfoDto;

  @ApiProperty({
    description: 'Submission statistics',
    type: SubmissionStatsDto,
  })
  submission_stats!: SubmissionStatsDto;
}
