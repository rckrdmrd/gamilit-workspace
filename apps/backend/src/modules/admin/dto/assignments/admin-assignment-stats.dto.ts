import { ApiProperty } from '@nestjs/swagger';

/**
 * Admin Assignment Stats Response DTO
 *
 * @description Global statistics for assignments across the system
 */
export class AdminAssignmentStatsDto {
  @ApiProperty({
    description: 'Total number of assignments in the system',
    example: 250,
  })
    total_assignments!: number;

  @ApiProperty({
    description: 'Number of published assignments',
    example: 180,
  })
    published_assignments!: number;

  @ApiProperty({
    description: 'Number of draft assignments',
    example: 70,
  })
    draft_assignments!: number;

  @ApiProperty({
    description: 'Total number of submissions',
    example: 4500,
  })
    total_submissions!: number;

  @ApiProperty({
    description: 'Number of pending submissions',
    example: 150,
  })
    pending_submissions!: number;

  @ApiProperty({
    description: 'Number of graded submissions',
    example: 3800,
  })
    graded_submissions!: number;

  @ApiProperty({
    description: 'Number of late submissions',
    example: 250,
  })
    late_submissions!: number;

  @ApiProperty({
    description: 'Average submission score',
    example: 78.5,
  })
    average_score!: number;

  @ApiProperty({
    description: 'Statistics by assignment type',
    type: [Object],
    example: [
      { type: 'homework', count: 120, percentage: 48 },
      { type: 'quiz', count: 80, percentage: 32 },
      { type: 'exam', count: 30, percentage: 12 },
      { type: 'practice', count: 20, percentage: 8 },
    ],
  })
    by_type!: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;

  @ApiProperty({
    description: 'Most active teachers (top 5)',
    type: [Object],
    example: [
      {
        teacher_id: '123e4567-e89b-12d3-a456-426614174000',
        teacher_name: 'Prof. María García',
        assignments_count: 35,
      },
    ],
  })
    top_teachers!: Array<{
    teacher_id: string;
    teacher_name: string;
    assignments_count: number;
  }>;

  @ApiProperty({
    description: 'Recent activity (last 30 days)',
    type: Object,
    example: {
      new_assignments: 15,
      new_submissions: 450,
      graded_submissions: 380,
    },
  })
    recent_activity!: {
    new_assignments: number;
    new_submissions: number;
    graded_submissions: number;
  };
}
