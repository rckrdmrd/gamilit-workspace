import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MissionTemplateTypeEnum,
  MissionTemplateDifficultyEnum,
} from '../../entities/mission-template.entity';

/**
 * Mission Template Response DTO
 *
 * @description DTO para respuesta de template de misión
 * @usage Retornado en endpoints de consulta
 */
export class MissionTemplateDto {
  @ApiProperty({
    description: 'Template ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
    id!: string;

  @ApiProperty({
    description: 'Template display name',
    example: 'Completar ejercicios diarios',
  })
    name!: string;

  @ApiProperty({
    description: 'Template description',
    example: 'Completa 3 ejercicios para ganar recompensas',
  })
    description!: string;

  @ApiProperty({
    description: 'Mission type',
    enum: MissionTemplateTypeEnum,
    example: MissionTemplateTypeEnum.DAILY,
  })
    type!: MissionTemplateTypeEnum;

  @ApiPropertyOptional({
    description: 'Mission category',
    example: 'exercise',
  })
    category!: string | null;

  @ApiProperty({
    description: 'Type of objective to track',
    example: 'complete_exercises',
  })
    target_type!: string;

  @ApiProperty({
    description: 'Required value to complete',
    example: 3,
  })
    target_value!: number;

  @ApiProperty({
    description: 'XP reward',
    example: 50,
  })
    xp_reward!: number;

  @ApiProperty({
    description: 'ML Coins reward',
    example: 25,
  })
    ml_coins_reward!: number;

  @ApiPropertyOptional({
    description: 'Badge ID',
    example: null,
  })
    badge_id!: string | null;

  @ApiProperty({
    description: 'Difficulty level',
    enum: MissionTemplateDifficultyEnum,
    example: MissionTemplateDifficultyEnum.NORMAL,
  })
    difficulty!: MissionTemplateDifficultyEnum;

  @ApiProperty({
    description: 'Is template active',
    example: true,
  })
    is_active!: boolean;

  @ApiProperty({
    description: 'Selection priority',
    example: 10,
  })
    priority!: number;

  @ApiProperty({
    description: 'Minimum user level',
    example: 1,
  })
    min_level!: number;

  @ApiPropertyOptional({
    description: 'Maximum user level',
    example: 10,
  })
    max_level!: number | null;

  @ApiPropertyOptional({
    description: 'Required module ID',
    example: null,
  })
    required_module!: number | null;

  @ApiPropertyOptional({
    description: 'Icon identifier',
    example: 'trophy',
  })
    icon!: string | null;

  @ApiPropertyOptional({
    description: 'Color code',
    example: '#FF6B00',
  })
    color!: string | null;

  @ApiProperty({
    description: 'Additional metadata',
    example: { tags: ['beginner', 'daily'] },
  })
    metadata!: Record<string, unknown>;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-11-02T10:00:00Z',
  })
    created_at!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-02T10:00:00Z',
  })
    updated_at!: Date;

  @ApiPropertyOptional({
    description: 'Creator user ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
    created_by!: string | null;
}
