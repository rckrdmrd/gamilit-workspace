import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for module information
 */
export class ModuleInfoDto {
  @ApiProperty({ description: 'Module ID' })
  id!: string;

  @ApiProperty({ description: 'Module title' })
  title!: string;

  @ApiProperty({ description: 'Module description', nullable: true })
  description!: string | null;

  @ApiProperty({ description: 'Difficulty level' })
  difficulty_level!: string;

  @ApiProperty({ description: 'Estimated duration in minutes', nullable: true })
  estimated_duration!: number | null;

  @ApiProperty({ description: 'Order number' })
  order_number!: number;

  @ApiProperty({ description: 'Total exercises in module' })
  total_exercises!: number;
}

/**
 * DTO for module progress statistics
 */
export class ProgressStatsDto {
  @ApiProperty({ description: 'Total students working on this module' })
  total_students!: number;

  @ApiProperty({ description: 'Students who have not started' })
  not_started_count!: number;

  @ApiProperty({ description: 'Students in progress' })
  in_progress_count!: number;

  @ApiProperty({ description: 'Students who completed' })
  completed_count!: number;

  @ApiProperty({ description: 'Average progress percentage' })
  avg_progress_percent!: number;

  @ApiProperty({ description: 'Average score', nullable: true })
  avg_score!: number | null;

  @ApiProperty({ description: 'Average time spent in minutes' })
  avg_time_spent_minutes!: number;

  @ApiProperty({ description: 'Total XP distributed' })
  total_xp_distributed!: number;
}

/**
 * DTO for complete module progress statistics
 * Includes module information and progress statistics
 */
export class ModuleProgressStatsDto {
  @ApiProperty({
    description: 'Module information',
    type: ModuleInfoDto,
  })
  module_info!: ModuleInfoDto;

  @ApiProperty({
    description: 'Progress statistics',
    type: ProgressStatsDto,
  })
  progress_stats!: ProgressStatsDto;
}
