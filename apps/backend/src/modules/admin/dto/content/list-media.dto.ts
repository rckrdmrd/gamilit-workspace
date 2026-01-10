import { IsOptional, IsEnum, IsInt, Min, Max, IsString, MaxLength, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MediaTypeEnum } from '@shared/constants/enums.constants';

/**
 * FIX-2025-01-07 P0: Added validation constraints to prevent injection and DoS attacks
 */
export class ListMediaDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
    page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
    limit?: number;

  /**
   * FIX-2025-01-07 P0: Added @MaxLength to prevent injection attacks
   */
  @ApiPropertyOptional({
    description: 'Search term to filter files by filename or description',
    example: 'marie-curie',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Search term cannot exceed 255 characters' })
    search?: string;

  @ApiPropertyOptional({
    description: 'Filter by media type',
    enum: MediaTypeEnum,
    example: MediaTypeEnum.IMAGE,
  })
  @IsOptional()
  @IsEnum(MediaTypeEnum)
    media_type?: MediaTypeEnum;

  /**
   * FIX-2025-01-07 P0: Added @MaxLength to prevent resource exhaustion
   */
  @ApiPropertyOptional({
    description: 'Filter by category',
    example: 'exercise',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Category cannot exceed 100 characters' })
    category?: string;

  /**
   * FIX-2025-01-07 P0: Added @IsUUID to validate UUID format
   */
  @ApiPropertyOptional({
    description: 'Filter by uploader ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'uploaded_by must be a valid UUID' })
    uploaded_by?: string;
}
