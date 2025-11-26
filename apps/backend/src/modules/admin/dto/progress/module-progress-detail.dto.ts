import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for detailed module progress information
 */
export class ModuleProgressDetailDto {
  @ApiProperty({
    description: 'Module progress record ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Module ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  module_id!: string;

  @ApiProperty({
    description: 'Module title',
    example: 'Módulo 1: Suma y Resta',
  })
  module_title!: string;

  @ApiProperty({
    description: 'Progress status',
    example: 'in_progress',
    enum: ['not_started', 'in_progress', 'completed', 'reviewed', 'mastered'],
  })
  status!: string;

  @ApiProperty({
    description: 'Progress percentage',
    example: 75,
  })
  progress_percentage!: number;

  @ApiProperty({
    description: 'Number of completed exercises',
    example: 8,
  })
  completed_exercises!: number;

  @ApiProperty({
    description: 'Total number of exercises',
    example: 12,
  })
  total_exercises!: number;

  @ApiProperty({
    description: 'Average score',
    example: 85.5,
    nullable: true,
  })
  average_score!: number | null;

  @ApiProperty({
    description: 'Total XP earned in this module',
    example: 450,
  })
  total_xp_earned!: number;

  @ApiProperty({
    description: 'Time spent in minutes',
    example: 125,
  })
  time_spent_minutes!: number;

  @ApiProperty({
    description: 'Module started timestamp',
    example: '2025-11-20T08:00:00Z',
    nullable: true,
  })
  started_at!: string | null;

  @ApiProperty({
    description: 'Module completed timestamp',
    example: null,
    nullable: true,
  })
  completed_at!: string | null;

  @ApiProperty({
    description: 'Last accessed timestamp',
    example: '2025-11-24T10:30:00Z',
    nullable: true,
  })
  last_accessed_at!: string | null;

  @ApiProperty({
    description: 'Classroom ID if module is part of an assignment',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  classroom_id!: string | null;

  @ApiProperty({
    description: 'Classroom name if module is part of an assignment',
    example: 'Matemáticas 5to A',
    nullable: true,
  })
  classroom_name!: string | null;
}
