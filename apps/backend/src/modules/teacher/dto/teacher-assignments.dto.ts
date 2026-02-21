/**
 * Teacher Assignments DTOs
 *
 * @description DTOs for teacher assignment management endpoints
 * @module modules/teacher/dto/teacher-assignments
 */

import { IsString, IsOptional, IsEnum, IsArray, IsUUID, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentType } from '@modules/assignments/enums/assignment.enums';

// ============================================================================
// QUERY DTOs
// ============================================================================

/**
 * Query DTO for listing assignments with filters
 */
export class AssignmentQueryDto {
  @ApiPropertyOptional({ description: 'Filter by classroom ID' })
  @IsOptional()
  @IsUUID()
  classroom_id?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ['draft', 'active', 'completed', 'expired'] })
  @IsOptional()
  @IsString()
  status?: 'draft' | 'active' | 'completed' | 'expired';

  @ApiPropertyOptional({ description: 'Filter by start date (ISO string)' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'Filter by end date (ISO string)' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

// ============================================================================
// CREATE / UPDATE DTOs
// ============================================================================

/**
 * DTO for creating a new assignment
 */
export class CreateAssignmentDto {
  @ApiProperty({ description: 'Assignment title' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Assignment description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Assignment type', enum: AssignmentType })
  @IsEnum(AssignmentType)
  type!: AssignmentType;

  @ApiPropertyOptional({ description: 'Due date (ISO string)' })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiProperty({ description: 'Classroom ID to assign to' })
  @IsUUID()
  classroom_id!: string;

  @ApiPropertyOptional({ description: 'Exercise IDs to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  exercise_ids?: string[];
}

/**
 * DTO for updating an existing assignment
 */
export class UpdateAssignmentDto {
  @ApiPropertyOptional({ description: 'Assignment title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Assignment description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Assignment type', enum: AssignmentType })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;

  @ApiPropertyOptional({ description: 'Due date (ISO string)' })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({ description: 'Exercise IDs to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  exercise_ids?: string[];
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

/**
 * Response DTO for a single assignment
 */
export class AssignmentResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional() description?: string | null;
  @ApiProperty() assignmentType!: string;
  @ApiProperty() totalPoints!: number;
  @ApiPropertyOptional() dueDate?: Date | null;
  @ApiProperty() isPublished!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiPropertyOptional() classroomId?: string;
  @ApiPropertyOptional() classroomName?: string;
  @ApiPropertyOptional() submissionCount?: number;
  @ApiPropertyOptional() totalStudents?: number;
}

/**
 * Response DTO for upcoming assignments
 */
export class UpcomingAssignmentResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional() dueDate!: string | null;
  @ApiProperty() daysRemaining!: number;
  @ApiProperty() totalStudents!: number;
  @ApiProperty() submittedCount!: number;
  @ApiPropertyOptional() classroomName?: string;
}
