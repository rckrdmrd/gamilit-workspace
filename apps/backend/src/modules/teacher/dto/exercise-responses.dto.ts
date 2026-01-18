/**
 * DTOs for Exercise Responses
 *
 * @description DTOs for querying and viewing student exercise attempts
 */

import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Sort fields for attempts
 */
export enum AttemptSortField {
  SUBMITTED_AT = 'submitted_at',
  SCORE = 'score',
  TIME = 'time',
}

/**
 * Sort order
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Query DTO for filtering exercise attempts
 */
export class GetAttemptsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
    page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
    limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by student ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
    student_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by exercise ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
    exercise_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by module ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
    module_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by classroom ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
    classroom_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
    from_date?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
    to_date?: string;

  @ApiPropertyOptional({
    description: 'Filter by correctness',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
    is_correct?: boolean;

  @ApiPropertyOptional({
    description: 'Search by student name or email (case-insensitive partial match)',
    example: 'juan',
  })
  @IsString()
  @IsOptional()
    student_search?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: AttemptSortField,
    default: AttemptSortField.SUBMITTED_AT,
  })
  @IsEnum(AttemptSortField)
  @IsOptional()
    sort_by?: AttemptSortField = AttemptSortField.SUBMITTED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
    sort_order?: SortOrder = SortOrder.DESC;
}

/**
 * Response DTO for exercise attempt
 */
export class AttemptResponseDto {
  @ApiProperty({
    description: 'Attempt ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    id!: string;

  @ApiProperty({
    description: 'Student ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    student_id!: string;

  @ApiProperty({
    description: 'Student full name',
    example: 'Juan Pérez',
  })
    student_name!: string;

  @ApiProperty({
    description: 'Exercise ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    exercise_id!: string;

  @ApiProperty({
    description: 'Exercise title',
    example: 'Comprensión Lectora - Texto Narrativo',
  })
    exercise_title!: string;

  @ApiProperty({
    description: 'Module name',
    example: 'Módulo 1: Lectura Literal',
  })
    module_name!: string;

  @ApiProperty({
    description: 'Attempt number (1, 2, 3, ...)',
    example: 1,
  })
    attempt_number!: number;

  @ApiProperty({
    description: 'Submitted answers (JSONB)',
    example: { answers: ['A', 'B', 'C'] },
  })
    submitted_answers!: Record<string, unknown>;

  @ApiProperty({
    description: 'Is the answer correct?',
    example: true,
  })
    is_correct!: boolean;

  @ApiProperty({
    description: 'Score obtained',
    example: 85,
  })
    score!: number;

  @ApiProperty({
    description: 'Time spent in seconds',
    example: 120,
  })
    time_spent_seconds!: number;

  @ApiProperty({
    description: 'Number of hints used',
    example: 2,
  })
    hints_used!: number;

  @ApiProperty({
    description: 'Comodines used',
    example: ['pistas', 'vision_lectora'],
    type: [String],
  })
    comodines_used!: string[];

  @ApiProperty({
    description: 'XP earned in this attempt',
    example: 50,
  })
    xp_earned!: number;

  @ApiProperty({
    description: 'ML Coins earned in this attempt',
    example: 10,
  })
    ml_coins_earned!: number;

  @ApiProperty({
    description: 'Submission timestamp (ISO 8601)',
    example: '2024-11-24T10:30:00Z',
  })
    submitted_at!: string;

  @ApiProperty({
    description: 'Indicates if the exercise requires manual review by teacher',
    example: false,
  })
    requires_manual_review!: boolean;

  @ApiProperty({
    description: 'Exercise type (mechanic)',
    example: 'lectura_inferencial',
  })
    exercise_type!: string;
}

/**
 * Detailed response DTO for a single attempt (includes exercise details)
 * Inherits exercise_type and requires_manual_review from AttemptResponseDto
 */
export class AttemptDetailDto extends AttemptResponseDto {
  @ApiProperty({
    description: 'Correct answer (from exercise)',
    example: { correct_answers: ['A', 'C', 'D'] },
  })
    correct_answer!: Record<string, unknown>;

  @ApiProperty({
    description: 'Maximum score for this exercise',
    example: 100,
  })
    max_score!: number;
}

/**
 * Aggregated stats for attempts list
 * P2-03: Stats calculated on server side
 */
export class AttemptsStatsDto {
  @ApiProperty({
    description: 'Total number of attempts',
    example: 150,
  })
    total_attempts!: number;

  @ApiProperty({
    description: 'Number of correct attempts',
    example: 120,
  })
    correct_count!: number;

  @ApiProperty({
    description: 'Number of incorrect attempts',
    example: 30,
  })
    incorrect_count!: number;

  @ApiProperty({
    description: 'Average score percentage (0-100)',
    example: 78,
  })
    average_score!: number;

  @ApiProperty({
    description: 'Success rate percentage (0-100)',
    example: 80,
  })
    success_rate!: number;
}

/**
 * Paginated list response DTO
 */
export class AttemptsListResponseDto {
  @ApiProperty({
    description: 'List of attempts',
    type: [AttemptResponseDto],
  })
    data!: AttemptResponseDto[];

  @ApiProperty({
    description: 'Total number of attempts',
    example: 150,
  })
    total!: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
    page!: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
  })
    limit!: number;

  @ApiProperty({
    description: 'Total pages',
    example: 8,
  })
    total_pages!: number;

  @ApiProperty({
    description: 'Aggregated statistics for the filtered attempts',
    type: AttemptsStatsDto,
    required: false,
  })
    stats?: AttemptsStatsDto;
}
