import { IsOptional, IsUUID, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Admin Assignment Filters DTO
 *
 * @description Query parameters for filtering assignments in admin panel
 * @usage GET /admin/assignments?classroom_id=...&status=...
 */
export class AdminAssignmentFiltersDto {
  @ApiProperty({
    description: 'Filter by classroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
    classroom_id?: string;

  @ApiProperty({
    description: 'Filter by teacher ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
    teacher_id?: string;

  @ApiProperty({
    description: 'Filter by student ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
    student_id?: string;

  @ApiProperty({
    description: 'Filter by assignment status',
    enum: ['pending', 'submitted', 'graded', 'late'],
    example: 'submitted',
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'submitted', 'graded', 'late'])
    status?: string;

  @ApiProperty({
    description: 'Filter assignments from this date (ISO 8601)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
    date_from?: string;

  @ApiProperty({
    description: 'Filter assignments until this date (ISO 8601)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
    date_to?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
    page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
    limit?: number = 20;
}
