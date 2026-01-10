import { IsOptional, IsEnum, IsInt, Min, Max, IsString, MaxLength, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatusEnum } from '@shared/constants';

/**
 * FIX-2025-01-07 P0: Added validation constraints to prevent injection and DoS attacks
 */
export class ListContentDto {
  @ApiPropertyOptional({
    description: 'Filter by content type',
    enum: ['module', 'exercise', 'template'],
    example: 'module',
  })
  @IsOptional()
  @IsEnum(['module', 'exercise', 'template'])
    content_type?: 'module' | 'exercise' | 'template';

  @ApiPropertyOptional({
    description: 'Filter by content status',
    enum: ContentStatusEnum,
    example: ContentStatusEnum.UNDER_REVIEW,
  })
  @IsOptional()
  @IsEnum(ContentStatusEnum)
    status?: ContentStatusEnum;

  /**
   * FIX-2025-01-07 P0: Added @MaxLength to prevent injection attacks
   */
  @ApiPropertyOptional({
    description: 'Search by title or description',
    example: 'Marie Curie',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Search term cannot exceed 255 characters' })
    search?: string;

  /**
   * FIX-2025-01-07 P0: Added @IsUUID to validate UUID format
   */
  @ApiPropertyOptional({
    description: 'Filter by creator user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'created_by must be a valid UUID' })
    created_by?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
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
  @IsInt()
  @Min(1)
  @Max(100, { message: 'Limit cannot exceed 100 items per page' })
  @Type(() => Number)
    limit?: number;
}
