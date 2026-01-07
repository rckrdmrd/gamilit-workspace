import { ApiProperty } from '@nestjs/swagger';

/**
 * Exercise status within a module
 */
export type ExerciseCompletionStatus = 'completed' | 'in_progress' | 'pending' | 'skipped';

/**
 * Individual exercise status within a module breakdown
 *
 * @description Represents the completion status of a single exercise
 * for a specific user within a module context.
 *
 * @see EPIC 10.3 - Module Progress Tracking
 */
export class ExerciseStatusDto {
  @ApiProperty({
    description: 'Exercise ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  exercise_id!: string;

  @ApiProperty({
    description: 'Exercise title',
    example: 'Comprensión Literal - Ejercicio 1',
  })
  title!: string;

  @ApiProperty({
    description: 'Exercise order within module',
    example: 1,
  })
  order_index!: number;

  @ApiProperty({
    description: 'Exercise type',
    example: 'multiple_choice',
  })
  exercise_type!: string;

  @ApiProperty({
    description: 'Difficulty level',
    enum: ['easy', 'medium', 'hard', 'expert'],
    example: 'medium',
  })
  difficulty!: string;

  @ApiProperty({
    description: 'Completion status',
    enum: ['completed', 'in_progress', 'pending', 'skipped'],
    example: 'completed',
  })
  status!: ExerciseCompletionStatus;

  @ApiProperty({
    description: 'Score obtained (0-100), null if not completed',
    example: 85,
    nullable: true,
  })
  score?: number | null;

  @ApiProperty({
    description: 'Maximum score possible',
    example: 100,
  })
  max_score!: number;

  @ApiProperty({
    description: 'Whether the answer was correct',
    example: true,
    nullable: true,
  })
  is_correct?: boolean | null;

  @ApiProperty({
    description: 'XP reward for this exercise',
    example: 50,
  })
  xp_reward!: number;

  @ApiProperty({
    description: 'ML Coins reward for this exercise',
    example: 25,
  })
  ml_coins_reward!: number;

  @ApiProperty({
    description: 'Estimated time to complete in minutes',
    example: 10,
  })
  estimated_minutes!: number;

  @ApiProperty({
    description: 'Completion timestamp if completed',
    example: '2025-01-15T10:30:00Z',
    nullable: true,
  })
  completed_at?: string | null;

  @ApiProperty({
    description: 'Number of attempts made',
    example: 2,
  })
  attempts_count!: number;
}

/**
 * Module Exercise Breakdown Response DTO
 *
 * @description Provides detailed breakdown of all exercises within a module
 * with their completion status, scores, and time estimates.
 *
 * @see EPIC 10.3 - Module Progress Tracking
 */
export class ModuleExerciseBreakdownDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  user_id!: string;

  @ApiProperty({
    description: 'Module ID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  module_id!: string;

  @ApiProperty({
    description: 'Module title',
    example: 'Comprensión Literal - Nivel 1',
  })
  module_title!: string;

  @ApiProperty({
    description: 'Total number of exercises in module',
    example: 10,
  })
  total_exercises!: number;

  @ApiProperty({
    description: 'Number of completed exercises',
    example: 5,
  })
  completed_exercises!: number;

  @ApiProperty({
    description: 'Number of exercises in progress',
    example: 1,
  })
  in_progress_exercises!: number;

  @ApiProperty({
    description: 'Number of pending exercises',
    example: 4,
  })
  pending_exercises!: number;

  @ApiProperty({
    description: 'Number of skipped exercises',
    example: 0,
  })
  skipped_exercises!: number;

  @ApiProperty({
    description: 'Overall progress percentage (0-100)',
    example: 50,
  })
  progress_percentage!: number;

  @ApiProperty({
    description: 'Average score across completed exercises',
    example: 85.5,
  })
  average_score!: number;

  @ApiProperty({
    description: 'Total XP earned from this module',
    example: 250,
  })
  total_xp_earned!: number;

  @ApiProperty({
    description: 'Total ML Coins earned from this module',
    example: 125,
  })
  total_ml_coins_earned!: number;

  @ApiProperty({
    description: 'Estimated minutes to complete remaining exercises',
    example: 45,
  })
  estimated_remaining_minutes!: number;

  @ApiProperty({
    description: 'Time spent so far in this module (HH:MM:SS format)',
    example: '01:30:00',
  })
  time_spent!: string;

  @ApiProperty({
    description: 'List of all exercises with their status',
    type: [ExerciseStatusDto],
  })
  exercises!: ExerciseStatusDto[];

  @ApiProperty({
    description: 'Next recommended exercise to complete',
    nullable: true,
  })
  next_exercise?: ExerciseStatusDto | null;
}
