import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for system-wide progress overview
 * Provides high-level statistics across all users and modules
 */
export class ProgressOverviewDto {
  @ApiProperty({
    description: 'Total number of users in the system',
    example: 150,
  })
    total_users!: number;

  @ApiProperty({
    description: 'Number of active users',
    example: 120,
  })
    active_users!: number;

  @ApiProperty({
    description: 'Total number of exercise submissions',
    example: 5234,
  })
    total_submissions!: number;

  @ApiProperty({
    description: 'Number of correct submissions',
    example: 4128,
  })
    correct_submissions!: number;

  @ApiProperty({
    description: 'Average score across all submissions',
    example: 78.5,
  })
    avg_score!: number;

  @ApiProperty({
    description: 'Number of completed modules',
    example: 342,
  })
    completed_modules!: number;

  @ApiProperty({
    description: 'Number of modules in progress',
    example: 187,
  })
    in_progress_modules!: number;

  @ApiProperty({
    description: 'Average progress percentage across all modules',
    example: 65.3,
  })
    avg_progress_percent!: number;

  @ApiProperty({
    description: 'Total time spent in hours',
    example: 1248.5,
  })
    total_time_spent_hours!: number;
}
