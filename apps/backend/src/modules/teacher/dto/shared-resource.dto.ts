/**
 * Shared Resource DTOs
 *
 * @description DTOs for browsing shared educational resources, ratings, comments, and downloads
 * @module modules/teacher/dto/shared-resource
 */

import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
  Max,
  Length,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================================================
// QUERY DTOs
// ============================================================================

/**
 * DTO for searching shared resources
 */
export class SearchSharedResourcesDto {
  @ApiPropertyOptional({
    description: 'Resource type filter',
    example: 'exercise',
    enum: ['exercise', 'strategy', 'media', 'evaluation'],
  })
  @IsString()
  @IsOptional()
    type?: string;

  @ApiPropertyOptional({
    description: 'Category filter',
    example: 'Pedagogia',
  })
  @IsString()
  @IsOptional()
    category?: string;

  @ApiPropertyOptional({
    description: 'Search term (matches title, description, tags)',
    example: 'gamificacion',
  })
  @IsString()
  @IsOptional()
    search?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
    page?: number = 1;

  @ApiPropertyOptional({
    description: 'Results per page',
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(50)
  @Type(() => Number)
    limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'rating',
    enum: ['created_at', 'rating', 'downloads', 'title'],
  })
  @IsString()
  @IsOptional()
  @IsEnum(['created_at', 'rating', 'downloads', 'title'])
    sort_by?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  @IsEnum(['asc', 'desc'])
    sort_order?: 'asc' | 'desc' = 'desc';
}

// ============================================================================
// MUTATION DTOs
// ============================================================================

/**
 * DTO for rating a resource
 */
export class ResourceRatingDto {
  @ApiProperty({
    description: 'Rating value between 1 and 5',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
    rating!: number;
}

/**
 * DTO for adding a comment to a resource
 */
export class AddCommentDto {
  @ApiProperty({
    description: 'Comment text',
    example: 'Excelente recurso, lo implemente en mi clase',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 2000)
    text!: string;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

/**
 * Comment response DTO
 */
export class ResourceCommentResponseDto {
  @ApiProperty({ description: 'Comment ID' })
    id!: string;

  @ApiProperty({ description: 'Author profile ID' })
    author_id!: string;

  @ApiProperty({ description: 'Author display name' })
    author_name!: string;

  @ApiProperty({ description: 'Comment text' })
    text!: string;

  @ApiProperty({ description: 'Comment creation date' })
    created_at!: Date;
}

/**
 * Shared resource response DTO (matches frontend SharedResource interface)
 */
export class SharedResourceResponseDto {
  @ApiProperty({ description: 'Resource ID' })
    id!: string;

  @ApiProperty({ description: 'Resource title' })
    title!: string;

  @ApiProperty({ description: 'Resource description' })
    description!: string;

  @ApiProperty({
    description: 'Resource type',
    enum: ['exercise', 'strategy', 'media', 'evaluation'],
  })
    type!: string;

  @ApiProperty({ description: 'Resource category' })
    category!: string;

  @ApiProperty({ description: 'Author profile ID' })
    author_id!: string;

  @ApiProperty({ description: 'Author display name' })
    author_name!: string;

  @ApiProperty({ description: 'Date shared/published' })
    shared_at!: string;

  @ApiProperty({ description: 'Average rating (1-5)' })
    rating!: number;

  @ApiProperty({ description: 'Number of ratings' })
    ratings_count!: number;

  @ApiProperty({ description: 'Number of downloads' })
    downloads!: number;

  @ApiProperty({ description: 'Number of comments' })
    comments_count!: number;

  @ApiPropertyOptional({
    description: 'Resource tags',
    type: [String],
  })
    tags!: string[];

  @ApiPropertyOptional({ description: 'User current rating (if rated)' })
    user_rating?: number;
}

/**
 * Paginated shared resources response
 */
export class PaginatedSharedResourcesResponseDto {
  @ApiProperty({
    description: 'List of shared resources',
    type: [SharedResourceResponseDto],
  })
    data!: SharedResourceResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
  })
    pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Paginated comments response
 */
export class PaginatedCommentsResponseDto {
  @ApiProperty({
    description: 'List of comments',
    type: [ResourceCommentResponseDto],
  })
    data!: ResourceCommentResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
  })
    pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
