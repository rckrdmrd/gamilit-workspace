import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
} from 'class-validator';

/**
 * ContentType enum for deep linking
 */
export enum DeepLinkContentType {
  LTIRESOURCELINK = 'ltiResourceLink',
  LINK = 'link',
  FILE = 'file',
  IMAGE = 'image',
  HTML = 'html',
}

/**
 * ContentFiltersDto
 *
 * @description Filters for retrieving available content for deep linking.
 */
export class ContentFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by module ID',
    example: 'module-uuid-123',
  })
  @IsUUID()
  @IsOptional()
  moduleId?: string;

  @ApiPropertyOptional({
    description: 'Filter by topic ID',
    example: 'topic-uuid-456',
  })
  @IsUUID()
  @IsOptional()
  topicId?: string;

  @ApiPropertyOptional({
    description: 'Filter by content type',
    example: 'exercise',
  })
  @IsString()
  @IsOptional()
  contentType?: string;

  @ApiPropertyOptional({
    description: 'Filter by difficulty level',
    example: 'intermediate',
  })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({
    description: 'Search query for content title',
    example: 'fractions',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Tenant ID for multi-tenancy',
  })
  @IsUUID()
  @IsOptional()
  tenantId?: string;
}

/**
 * ContentItemDto
 *
 * @description A single content item available for deep linking.
 */
export class ContentItemDto {
  @ApiProperty({
    description: 'Unique identifier for the content',
    example: 'exercise-uuid-789',
  })
  id!: string;

  @ApiProperty({
    description: 'Type of content',
    enum: ['module', 'topic', 'exercise', 'lesson', 'quiz'],
    example: 'exercise',
  })
  type!: string;

  @ApiProperty({
    description: 'Title of the content',
    example: 'Adding Fractions Exercise',
  })
  title!: string;

  @ApiPropertyOptional({
    description: 'Description of the content',
    example: 'Practice adding fractions with like denominators',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'URL to thumbnail image',
    example: 'https://cdn.gamilit.com/thumbnails/fractions.png',
  })
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Difficulty level',
    example: 'intermediate',
  })
  difficulty?: string;

  @ApiPropertyOptional({
    description: 'Estimated duration in minutes',
    example: 15,
  })
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Maximum points available',
    example: 100,
  })
  maxPoints?: number;

  @ApiPropertyOptional({
    description: 'Whether this content supports grade passback',
    example: true,
  })
  supportsGradePassback?: boolean;

  @ApiProperty({
    description: 'Launch URL for this content',
    example: 'https://gamilit.com/lti/launch/exercise/uuid-789',
  })
  launchUrl!: string;

  @ApiPropertyOptional({
    description: 'Custom parameters for this content',
  })
  customParameters?: Record<string, string>;
}

/**
 * DeepLinkSelectionDto
 *
 * @description DTO for selecting content items to be linked.
 */
export class DeepLinkSelectionDto {
  @ApiProperty({
    description: 'LTI session ID',
    example: 'session-uuid-123',
  })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({
    description: 'Array of content item IDs to link',
    example: ['exercise-uuid-789', 'quiz-uuid-456'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  contentIds!: string[];

  @ApiPropertyOptional({
    description: 'Custom titles for the items (keyed by content ID)',
    example: { 'exercise-uuid-789': 'Week 1: Fractions Practice' },
  })
  @IsOptional()
  customTitles?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Custom parameters for the items',
  })
  @IsOptional()
  customParameters?: Record<string, Record<string, string>>;
}

/**
 * LtiResourceLinkItemDto
 *
 * @description LTI Resource Link item for deep linking response.
 */
export class LtiResourceLinkItemDto {
  @ApiProperty({
    description: 'Type of content item',
    example: 'ltiResourceLink',
  })
  type!: string;

  @ApiProperty({
    description: 'Title of the resource',
    example: 'Adding Fractions Exercise',
  })
  title!: string;

  @ApiPropertyOptional({
    description: 'Text/description of the resource',
  })
  text?: string;

  @ApiProperty({
    description: 'Launch URL for the resource',
    example: 'https://gamilit.com/lti/launch/exercise/uuid-789',
  })
  url!: string;

  @ApiPropertyOptional({
    description: 'Thumbnail icon',
  })
  icon?: {
    url: string;
    width?: number;
    height?: number;
  };

  @ApiPropertyOptional({
    description: 'Thumbnail image',
  })
  thumbnail?: {
    url: string;
    width?: number;
    height?: number;
  };

  @ApiPropertyOptional({
    description: 'Custom parameters',
  })
  custom?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Line item for grade passback',
  })
  lineItem?: {
    label: string;
    scoreMaximum: number;
    tag?: string;
    resourceId?: string;
  };

  @ApiPropertyOptional({
    description: 'Iframe settings',
  })
  iframe?: {
    width?: number;
    height?: number;
  };

  @ApiPropertyOptional({
    description: 'Window settings for new window launch',
  })
  window?: {
    targetName?: string;
    width?: number;
    height?: number;
    windowFeatures?: string;
  };
}
