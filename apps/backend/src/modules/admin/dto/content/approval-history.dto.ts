import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max, MaxLength, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for approval history item
 */
export class ApprovalHistoryItemDto {
  @ApiProperty({
    description: 'Unique identifier of the approval record',
    example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  })
    id!: string;

  @ApiProperty({
    description: 'Type of content (module, exercise, assignment, resource)',
    example: 'exercise',
  })
    content_type!: string;

  @ApiProperty({
    description: 'ID of the content being approved',
    example: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  })
    content_id!: string;

  @ApiProperty({
    description: 'Title of the content (from joined table)',
    example: 'Introduction to Mathematics',
    nullable: true,
  })
    content_title?: string;

  @ApiProperty({
    description: 'ID of user who submitted the content',
    example: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  })
    submitted_by!: string;

  @ApiProperty({
    description: 'Email of submitter',
    example: 'teacher@example.com',
    nullable: true,
  })
    submitter_email?: string;

  @ApiProperty({
    description: 'Name of submitter',
    example: 'Maria Garcia',
    nullable: true,
  })
    submitter_name?: string;

  @ApiProperty({
    description: 'When the content was submitted for approval',
    example: '2025-11-15T10:30:00Z',
  })
    submitted_at!: string;

  @ApiProperty({
    description: 'ID of user who reviewed the content',
    example: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    nullable: true,
  })
    reviewed_by?: string;

  @ApiProperty({
    description: 'Email of reviewer',
    example: 'admin@example.com',
    nullable: true,
  })
    reviewer_email?: string;

  @ApiProperty({
    description: 'Name of reviewer',
    example: 'Admin User',
    nullable: true,
  })
    reviewer_name?: string;

  @ApiProperty({
    description: 'When the content was reviewed',
    example: '2025-11-16T14:20:00Z',
    nullable: true,
  })
    reviewed_at?: string;

  @ApiProperty({
    description: 'Current approval status',
    example: 'approved',
    enum: ['pending', 'approved', 'rejected', 'needs_revision'],
  })
    status!: string;

  @ApiProperty({
    description: 'Notes from the reviewer',
    example: 'Content looks good, approved for publication',
    nullable: true,
  })
    reviewer_notes?: string;

  @ApiProperty({
    description: 'Revision notes from submitter',
    example: 'Updated based on previous feedback',
    nullable: true,
  })
    revision_notes?: string;

  @ApiProperty({
    description: 'When the approval record was created',
    example: '2025-11-15T10:30:00Z',
  })
    created_at!: string;

  @ApiProperty({
    description: 'When the approval record was last updated',
    example: '2025-11-16T14:20:00Z',
  })
    updated_at!: string;
}

/**
 * DTO for querying approval history
 * FIX-2025-01-07 P0: Added validation constraints to prevent injection and DoS attacks
 */
export class ListApprovalHistoryDto {
  @ApiPropertyOptional({
    description: 'Filter by content type',
    example: 'exercise',
    enum: ['module', 'exercise', 'assignment', 'resource'],
  })
  @IsOptional()
  @IsEnum(['module', 'exercise', 'assignment', 'resource'])
    content_type?: string;

  /**
   * FIX-2025-01-07 P0: Added @IsUUID to validate UUID format
   */
  @ApiPropertyOptional({
    description: 'Filter by specific content ID',
    example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  })
  @IsOptional()
  @IsUUID('4', { message: 'content_id must be a valid UUID' })
    content_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by approval status',
    example: 'approved',
    enum: ['pending', 'approved', 'rejected', 'needs_revision'],
  })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'needs_revision'])
    status?: string;

  /**
   * FIX-2025-01-07 P0: Added @IsUUID to validate UUID format
   */
  @ApiPropertyOptional({
    description: 'Filter by submitter user ID',
    example: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  })
  @IsOptional()
  @IsUUID('4', { message: 'submitted_by must be a valid UUID' })
    submitted_by?: string;

  /**
   * FIX-2025-01-07 P0: Added @IsUUID to validate UUID format
   */
  @ApiPropertyOptional({
    description: 'Filter by reviewer user ID',
    example: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  })
  @IsOptional()
  @IsUUID('4', { message: 'reviewed_by must be a valid UUID' })
    reviewed_by?: string;

  /**
   * FIX-2025-01-07 P0: Added @MaxLength to prevent injection attacks
   */
  @ApiPropertyOptional({
    description: 'Search in content title, reviewer notes, revision notes',
    example: 'mathematics',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Search term cannot exceed 500 characters' })
    search?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
    page?: number;

  /**
   * FIX-2025-01-07 P0: Added @Max to prevent resource exhaustion DoS
   */
  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100, { message: 'Limit cannot exceed 100 items per page' })
    limit?: number;
}

/**
 * DTO for paginated approval history response
 */
export class PaginatedApprovalHistoryDto {
  @ApiProperty({
    description: 'Array of approval history items',
    type: [ApprovalHistoryItemDto],
  })
    data!: ApprovalHistoryItemDto[];

  @ApiProperty({
    description: 'Total number of approval records',
    example: 150,
  })
    total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
    page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
    limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
    total_pages!: number;
}
