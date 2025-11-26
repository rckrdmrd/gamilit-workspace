import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for recent exercise submissions
 * Includes comprehensive gamification data, feedback, and grading information
 */
export class RecentSubmissionDto {
  @ApiProperty({
    description: 'Submission ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Exercise ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  exercise_id!: string;

  @ApiProperty({
    description: 'Exercise title',
    example: 'Suma de números de dos dígitos',
  })
  exercise_title!: string;

  @ApiProperty({
    description: 'Exercise type',
    example: 'multiple_choice',
  })
  exercise_type!: string;

  // =====================================================
  // SCORING & CORRECTNESS
  // =====================================================

  @ApiProperty({
    description: 'Score achieved',
    example: 85,
  })
  score!: number;

  @ApiProperty({
    description: 'Maximum possible score',
    example: 100,
  })
  max_score!: number;

  @ApiProperty({
    description: 'Whether the submission was correct',
    example: true,
  })
  is_correct!: boolean;

  // =====================================================
  // GAMIFICATION REWARDS
  // =====================================================

  @ApiProperty({
    description: 'XP points earned for this submission (from exercise_attempts)',
    example: 50,
  })
  xp_earned!: number;

  @ApiProperty({
    description: 'ML Coins earned for this submission (from exercise_attempts)',
    example: 10,
  })
  ml_coins_earned!: number;

  @ApiProperty({
    description: 'ML Coins spent on comodines for this submission',
    example: 5,
  })
  ml_coins_spent!: number;

  // =====================================================
  // FEEDBACK & GRADING
  // =====================================================

  @ApiPropertyOptional({
    description: 'Feedback from the system or teacher',
    example: 'Excelente trabajo! Solo revisa el paso 3.',
    nullable: true,
  })
  feedback?: string | null;

  @ApiProperty({
    description: 'Grading status of the submission',
    example: 'auto_graded',
    enum: ['pending', 'auto_graded', 'manually_graded'],
  })
  grading_status!: string;

  @ApiPropertyOptional({
    description: 'ID of the teacher who graded (if manually graded)',
    example: '987e6543-e21b-43d2-c654-426614174999',
    nullable: true,
  })
  graded_by?: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp when the submission was graded',
    example: '2025-11-24T10:35:00Z',
    nullable: true,
  })
  graded_at?: string | null;

  // =====================================================
  // COMODINES & HINTS
  // =====================================================

  @ApiProperty({
    description: 'Array of comodin IDs/types used (pistas, vision_lectora, segunda_oportunidad)',
    example: ['pistas', 'vision_lectora'],
    type: [String],
  })
  comodines_used!: string[];

  @ApiProperty({
    description: 'Number of hints used during this submission',
    example: 2,
  })
  hints_used!: number;

  // =====================================================
  // TIME & ATTEMPT TRACKING
  // =====================================================

  @ApiPropertyOptional({
    description: 'Time spent in seconds',
    example: 120,
    nullable: true,
  })
  time_spent_seconds?: number | null;

  @ApiProperty({
    description: 'Attempt number',
    example: 1,
  })
  attempt_number!: number;

  // =====================================================
  // STATUS & TIMESTAMPS
  // =====================================================

  @ApiProperty({
    description: 'Submission status (draft, submitted, graded, reviewed)',
    example: 'graded',
  })
  status!: string;

  @ApiProperty({
    description: 'Submission timestamp',
    example: '2025-11-24T10:30:00Z',
  })
  submitted_at!: string;
}
