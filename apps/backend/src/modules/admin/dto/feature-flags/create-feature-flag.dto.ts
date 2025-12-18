import { IsString, IsBoolean, IsOptional, IsInt, Min, Max, IsArray, IsEnum, IsObject, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GamilityRoleEnum } from '@shared/constants';

/**
 * CreateFeatureFlagDto
 *
 * @description DTO para crear una nueva feature flag
 * @usedBy FeatureFlagsController.create()
 */
export class CreateFeatureFlagDto {
  @ApiProperty({
    description: 'Clave única de la feature flag (snake_case)',
    example: 'maya_ranks_system',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
    key!: string;

  @ApiProperty({
    description: 'Nombre descriptivo de la feature',
    example: 'Nuevo Sistema de Rankings Maya',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
    name!: string;

  @ApiProperty({
    description: 'Descripción de la funcionalidad',
    example: 'Sistema de gamificación basado en la cultura maya',
    required: false,
  })
  @IsString()
  @IsOptional()
    description?: string;

  @ApiProperty({
    description: 'Indica si la feature está habilitada',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
    isEnabled?: boolean;

  @ApiProperty({
    description: 'Porcentaje de rollout gradual (0-100)',
    example: 50,
    minimum: 0,
    maximum: 100,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
    rolloutPercentage?: number;

  @ApiProperty({
    description: 'Array de UUIDs de usuarios específicos con acceso',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
    targetUsers?: string[];

  @ApiProperty({
    description: 'Array de roles con acceso a la feature',
    example: ['super_admin', 'admin_teacher'],
    required: false,
    enum: GamilityRoleEnum,
    isArray: true,
  })
  @IsArray()
  @IsEnum(GamilityRoleEnum, { each: true })
  @IsOptional()
    targetRoles?: GamilityRoleEnum[];

  @ApiProperty({
    description: 'Condiciones personalizadas en formato JSON',
    example: { min_level: 5, schools: ['uuid1', 'uuid2'] },
    required: false,
  })
  @IsObject()
  @IsOptional()
    targetConditions?: Record<string, unknown>;

  @ApiProperty({
    description: 'Categoría de la feature flag',
    example: 'gamification',
    required: false,
  })
  @IsString()
  @IsOptional()
    category?: string;

  @ApiProperty({
    description: 'Metadatos adicionales en formato JSON',
    example: { ab_test_group: 'A', tracking_id: 'GA-123' },
    required: false,
  })
  @IsObject()
  @IsOptional()
    metadata?: Record<string, unknown>;
}
