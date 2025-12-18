import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsObject,
  Min,
    MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MissionTemplateTypeEnum,
  MissionTemplateDifficultyEnum,
} from '../../entities/mission-template.entity';

/**
 * Create Mission Template DTO
 *
 * @description DTO para crear un nuevo template de misión
 * @usage Usado por admins para crear templates configurables
 *
 * Validaciones críticas:
 * - target_value > 0
 * - xp_reward >= 0
 * - ml_coins_reward >= 0
 * - min_level >= 1
 * - max_level >= min_level (si está definido)
 */
export class CreateMissionTemplateDto {
  @ApiProperty({
    description: 'Template display name',
    example: 'Completar ejercicios diarios',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
    name!: string;

  @ApiProperty({
    description: 'Template description',
    example: 'Completa 3 ejercicios para ganar recompensas',
  })
  @IsString()
  @MinLength(10)
    description!: string;

  @ApiProperty({
    description: 'Mission type',
    enum: MissionTemplateTypeEnum,
    example: MissionTemplateTypeEnum.DAILY,
  })
  @IsEnum(MissionTemplateTypeEnum)
    type!: MissionTemplateTypeEnum;

  @ApiPropertyOptional({
    description: 'Mission category for grouping',
    example: 'exercise',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
    category?: string;

  @ApiProperty({
    description: 'Type of objective to track',
    example: 'complete_exercises',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
    target_type!: string;

  @ApiProperty({
    description: 'Required value to complete the objective',
    example: 3,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
    target_value!: number;

  @ApiPropertyOptional({
    description: 'XP reward for completing mission',
    example: 50,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
    xp_reward?: number;

  @ApiPropertyOptional({
    description: 'ML Coins reward for completing mission',
    example: 25,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
    ml_coins_reward?: number;

  @ApiPropertyOptional({
    description: 'Badge ID to award on completion',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
    badge_id?: string;

  @ApiPropertyOptional({
    description: 'Mission difficulty level',
    enum: MissionTemplateDifficultyEnum,
    example: MissionTemplateDifficultyEnum.NORMAL,
    default: MissionTemplateDifficultyEnum.NORMAL,
  })
  @IsOptional()
  @IsEnum(MissionTemplateDifficultyEnum)
    difficulty?: MissionTemplateDifficultyEnum;

  @ApiPropertyOptional({
    description: 'Whether template is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
    is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Priority for selection (higher = more likely)',
    example: 10,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
    priority?: number;

  @ApiPropertyOptional({
    description: 'Minimum user level required',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
    min_level?: number;

  @ApiPropertyOptional({
    description: 'Maximum user level allowed',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
    max_level?: number;

  @ApiPropertyOptional({
    description: 'Required module ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
    required_module?: number;

  @ApiPropertyOptional({
    description: 'Icon identifier',
    example: 'trophy',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
    icon?: string;

  @ApiPropertyOptional({
    description: 'Color code',
    example: '#FF6B00',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
    color?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata in JSON format',
    example: { tags: ['beginner', 'daily'], duration: 'short' },
  })
  @IsOptional()
  @IsObject()
    metadata?: Record<string, unknown>;
}
