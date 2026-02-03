/**
 * Prediction Request DTOs
 *
 * DTOs for ML prediction requests with validation.
 * Used for both individual and batch predictions.
 *
 * @module ml/dto
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsArray,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Request DTO for individual dropout risk prediction
 */
export class PredictDropoutRiskRequestDto {
  @ApiProperty({
    description: 'Student ID for dropout risk prediction',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  studentId!: string;
}

/**
 * Request DTO for performance prediction
 */
export class PredictPerformanceRequestDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  studentId!: string;

  @ApiProperty({
    description: 'Exercise ID to predict performance on',
    example: '660e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  exerciseId!: string;
}

/**
 * Request DTO for difficulty recommendation
 */
export class RecommendDifficultyRequestDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  studentId!: string;

  @ApiProperty({
    description: 'Module ID to recommend difficulty for',
    example: '770e8400-e29b-41d4-a716-446655440003',
  })
  @IsUUID()
  moduleId!: string;
}

/**
 * Request DTO for engagement prediction
 */
export class PredictEngagementRequestDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  studentId!: string;
}

/**
 * Request DTO for batch dropout risk prediction
 */
export class BatchPredictDropoutRiskRequestDto {
  @ApiProperty({
    description: 'Array of student IDs for batch prediction',
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsUUID('4', { each: true })
  studentIds!: string[];
}

/**
 * Request DTO for classroom batch predictions
 */
export class BatchPredictClassroomRequestDto {
  @ApiProperty({
    description: 'Classroom ID for batch predictions of all students',
    example: '880e8400-e29b-41d4-a716-446655440004',
  })
  @IsUUID()
  classroomId!: string;

  @ApiPropertyOptional({
    description: 'Include only active students',
    default: true,
  })
  @IsOptional()
  activeOnly?: boolean = true;
}

/**
 * Request DTO for student insights
 */
export class StudentInsightsRequestDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({
    description: 'Include historical predictions',
    default: false,
  })
  @IsOptional()
  includeHistory?: boolean = false;
}

/**
 * Request DTO for classroom insights
 */
export class ClassroomInsightsRequestDto {
  @ApiProperty({
    description: 'Classroom ID',
    example: '880e8400-e29b-41d4-a716-446655440004',
  })
  @IsUUID()
  classroomId!: string;
}

/**
 * Query DTO for at-risk dashboard
 */
export class AtRiskDashboardQueryDto {
  @ApiPropertyOptional({
    description: 'Minimum risk level to include',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  })
  @IsOptional()
  @IsString()
  minRiskLevel?: 'low' | 'medium' | 'high' | 'critical' = 'medium';

  @ApiPropertyOptional({
    description: 'Filter by classroom ID',
    example: '880e8400-e29b-41d4-a716-446655440004',
  })
  @IsOptional()
  @IsUUID()
  classroomId?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results',
    default: 50,
  })
  @IsOptional()
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    default: 0,
  })
  @IsOptional()
  offset?: number = 0;
}
