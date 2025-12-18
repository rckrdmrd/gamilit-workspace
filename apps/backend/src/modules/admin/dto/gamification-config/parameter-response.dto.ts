import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Parameter Response DTO
 *
 * @description Response format for a single gamification parameter
 * @includes All settings details from SystemSetting entity
 */
export class ParameterResponseDto {
  @ApiProperty({
    description: 'Parameter unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
    id!: string;

  @ApiProperty({
    description: 'Parameter key (unique identifier in dot notation)',
    example: 'gamification.xp.base_per_exercise',
  })
    setting_key!: string;

  @ApiProperty({
    description: 'Parameter category',
    enum: ['gamification'],
    example: 'gamification',
  })
    setting_category!: string;

  @ApiPropertyOptional({
    description: 'Parameter subcategory for organization',
    example: 'xp',
  })
    setting_subcategory?: string;

  @ApiProperty({
    description: 'Current value of the parameter (as string)',
    example: '10',
  })
    setting_value!: string;

  @ApiProperty({
    description: 'Value type (string, number, boolean, json, array)',
    enum: ['string', 'number', 'boolean', 'json', 'array'],
    example: 'number',
  })
    value_type!: string;

  @ApiPropertyOptional({
    description: 'Default value for the parameter',
    example: '10',
  })
    default_value?: string;

  @ApiPropertyOptional({
    description: 'Human-readable display name',
    example: 'Base XP per Exercise',
  })
    display_name?: string;

  @ApiPropertyOptional({
    description: 'Parameter description',
    example: 'Base XP awarded for completing an exercise',
  })
    description?: string;

  @ApiPropertyOptional({
    description: 'Help text for administrators',
    example: 'This value affects the base XP calculation for all exercises',
  })
    help_text?: string;

  @ApiProperty({
    description: 'Whether the parameter is public (visible to users)',
    example: false,
  })
    is_public!: boolean;

  @ApiProperty({
    description: 'Whether the parameter is read-only',
    example: false,
  })
    is_readonly!: boolean;

  @ApiProperty({
    description: 'Whether the parameter is a system setting (cannot be modified)',
    example: false,
  })
    is_system!: boolean;

  @ApiPropertyOptional({
    description: 'Minimum allowed value (for numeric parameters)',
    example: 1,
  })
    min_value?: number;

  @ApiPropertyOptional({
    description: 'Maximum allowed value (for numeric parameters)',
    example: 1000,
  })
    max_value?: number;

  @ApiPropertyOptional({
    description: 'Allowed values (for enum-like parameters)',
    example: ['low', 'medium', 'high'],
  })
    allowed_values?: string[];

  @ApiPropertyOptional({
    description: 'Validation rules in JSON format',
    example: { regex: '^[0-9]+$' },
  })
    validation_rules?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { unit: 'points', category_order: 1 },
  })
    metadata?: Record<string, unknown>;

  @ApiProperty({
    description: 'Timestamp when parameter was created',
    example: '2025-11-11T20:00:00.000Z',
  })
    created_at!: string;

  @ApiProperty({
    description: 'Timestamp when parameter was last updated',
    example: '2025-11-23T10:30:00.000Z',
  })
    updated_at!: string;

  @ApiPropertyOptional({
    description: 'UUID of admin who created the parameter',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
    created_by?: string;

  @ApiPropertyOptional({
    description: 'UUID of admin who last updated the parameter',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
    updated_by?: string;
}

/**
 * Parameters List Response DTO
 *
 * @description Response format for listing multiple parameters
 */
export class ParametersListResponseDto {
  @ApiProperty({
    description: 'List of gamification parameters',
    type: [ParameterResponseDto],
  })
    parameters!: ParameterResponseDto[];

  @ApiProperty({
    description: 'Total count of parameters',
    example: 15,
  })
    total!: number;

  @ApiPropertyOptional({
    description: 'Applied category filter',
    example: 'xp',
  })
    filtered_by_category?: string;
}
