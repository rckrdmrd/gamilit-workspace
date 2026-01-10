/**
 * Config Category DTO
 *
 * DTO for configuration categories.
 *
 * @author Claude Code Agent
 * @date 2026-01-07
 * @task TASK-SETTINGS-CONFIG-CATEGORIES
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Configuration category metadata
 */
export class ConfigCategoryDto {
  @ApiProperty({
    description: 'Unique key for the category',
    example: 'general',
  })
  key: string;

  @ApiProperty({
    description: 'Display name for the category',
    example: 'General',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the category',
    example: 'General platform configuration settings',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Icon name for UI display',
    example: 'settings',
  })
  icon?: string;

  @ApiProperty({
    description: 'Display order (lower = first)',
    example: 1,
  })
  order: number;
}
