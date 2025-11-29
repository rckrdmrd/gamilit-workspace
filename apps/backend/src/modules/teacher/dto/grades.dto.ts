/**
 * DTOs for Grades (Grade = Submission with score)
 *
 * Grades are a view/aggregation of submissions, not a separate entity.
 * These DTOs map ExerciseSubmission data to a "grade" format for teacher portal.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

/**
 * Response DTO for a single grade (submission with score)
 */
export class GradeResponseDto {
  @ApiProperty({ description: 'Grade ID (submission ID)' })
    id!: string;

  @ApiProperty({ description: 'Student ID' })
    student_id!: string;

  @ApiProperty({ description: 'Student name' })
    student_name!: string;

  @ApiProperty({ description: 'Exercise ID' })
    exercise_id!: string;

  @ApiProperty({ description: 'Exercise title' })
    exercise_title!: string;

  @ApiPropertyOptional({ description: 'Assignment ID' })
    assignment_id?: string;

  @ApiPropertyOptional({ description: 'Assignment title' })
    assignment_title?: string;

  @ApiProperty({ description: 'Score obtained' })
    score!: number;

  @ApiProperty({ description: 'Maximum possible score' })
    max_score!: number;

  @ApiPropertyOptional({ description: 'Teacher feedback' })
    feedback?: string;

  @ApiProperty({ description: 'Submission status' })
    status!: string;

  @ApiProperty({ description: 'Submission date' })
    submitted_at!: Date;

  @ApiPropertyOptional({ description: 'Grading date' })
    graded_at?: Date;

  @ApiPropertyOptional({ description: 'Graded by teacher ID' })
    graded_by?: string;
}

/**
 * Detailed grade response with full submission info
 */
export class GradeDetailResponseDto extends GradeResponseDto {
  @ApiProperty({ description: 'Student email' })
    student_email!: string;

  @ApiProperty({ description: 'Exercise type' })
    exercise_type!: string;

  @ApiProperty({ description: 'Answer data (JSON)' })
    answer_data!: Record<string, any>;

  @ApiProperty({ description: 'Indicates if answer is correct' })
    is_correct!: boolean;

  @ApiProperty({ description: 'Time spent in seconds' })
    time_spent_seconds!: number;

  @ApiProperty({ description: 'Attempt number' })
    attempt_number!: number;

  @ApiProperty({ description: 'Hint used flag' })
    hint_used!: boolean;

  @ApiProperty({ description: 'Hints count' })
    hints_count!: number;

  @ApiPropertyOptional({ description: 'Comodines used', type: [String] })
    comodines_used?: string[];

  @ApiProperty({ description: 'ML Coins spent' })
    ml_coins_spent!: number;

  @ApiProperty({ description: 'Created at timestamp' })
    created_at!: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
    updated_at!: Date;
}

/**
 * Query parameters for fetching grades
 */
export class GetGradesQueryDto {
  @ApiPropertyOptional({ description: 'Filter by assignment ID' })
  @IsUUID()
  @IsOptional()
    assignment_id?: string;

  @ApiPropertyOptional({ description: 'Filter by classroom ID' })
  @IsUUID()
  @IsOptional()
    classroom_id?: string;

  @ApiPropertyOptional({ description: 'Filter by student ID' })
  @IsUUID()
  @IsOptional()
    student_id?: string;

  @ApiPropertyOptional({ enum: ['pending', 'graded', 'needs_review'] })
  @IsEnum(['pending', 'graded', 'needs_review'])
  @IsOptional()
    status?: 'pending' | 'graded' | 'needs_review';

  @ApiPropertyOptional({ enum: ['date', 'score', 'time'] })
  @IsEnum(['date', 'score', 'time'])
  @IsOptional()
    sort_by?: 'date' | 'score' | 'time';

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
    page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
    limit?: number;
}
