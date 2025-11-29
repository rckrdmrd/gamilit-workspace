import { IsUUID, IsString, IsOptional, IsBoolean, IsInt, Min, IsDateString, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for objective structure in mission assignment
 */
class MissionObjectiveDto {
  @ApiProperty({
    description: 'Type of objective',
    example: 'complete_exercises',
  })
  @IsString()
    type!: string;

  @ApiProperty({
    description: 'Target value for the objective',
    example: 3,
  })
  @IsInt()
  @Min(1)
    target!: number;

  @ApiPropertyOptional({
    description: 'Description of the objective',
    example: 'Complete 3 exercises',
  })
  @IsString()
  @IsOptional()
    description?: string;
}

/**
 * DTO for rewards structure in mission assignment
 */
class MissionRewardsDto {
  @ApiPropertyOptional({
    description: 'ML Coins reward',
    example: 25,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
    ml_coins?: number;

  @ApiPropertyOptional({
    description: 'XP reward',
    example: 50,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
    xp?: number;
}

/**
 * AssignClassroomMissionDto
 *
 * @description DTO para asignar una misión a un aula
 *
 * Validaciones:
 * - mission_template_id: ID del template de la misión (requerido)
 * - title: Título de la misión (requerido)
 * - mission_type: Tipo de misión (requerido)
 * - objectives: Array de objetivos (requerido)
 * - base_rewards: Recompensas base (requerido)
 * - bonus_xp: XP adicional (opcional, >= 0)
 * - bonus_coins: ML Coins adicionales (opcional, >= 0)
 * - due_date: Fecha de vencimiento (opcional)
 * - is_mandatory: Si la misión es obligatoria (opcional, default: false)
 * - metadata: Configuración adicional (opcional)
 *
 * @usage POST /api/v1/gamification/classrooms/:classroomId/missions
 */
export class AssignClassroomMissionDto {
  @ApiProperty({
    description: 'Mission template ID to assign',
    example: 'daily_complete_exercises',
  })
  @IsString()
    mission_template_id!: string;

  @ApiProperty({
    description: 'Title of the mission',
    example: 'Complete 3 exercises',
  })
  @IsString()
    title!: string;

  @ApiPropertyOptional({
    description: 'Description of the mission',
    example: 'Complete 3 exercises before the due date',
  })
  @IsString()
  @IsOptional()
    description?: string;

  @ApiProperty({
    description: 'Type of mission',
    enum: ['daily', 'weekly', 'special'],
    example: 'daily',
  })
  @IsString()
    mission_type!: 'daily' | 'weekly' | 'special';

  @ApiProperty({
    description: 'Array of mission objectives',
    type: [MissionObjectiveDto],
    example: [
      {
        type: 'complete_exercises',
        target: 3,
        description: 'Complete 3 exercises',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MissionObjectiveDto)
    objectives!: MissionObjectiveDto[];

  @ApiProperty({
    description: 'Base rewards for the mission',
    type: MissionRewardsDto,
    example: {
      ml_coins: 25,
      xp: 50,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MissionRewardsDto)
    base_rewards!: MissionRewardsDto;

  @ApiPropertyOptional({
    description: 'Bonus XP for this classroom (on top of base rewards)',
    example: 10,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
    bonus_xp?: number;

  @ApiPropertyOptional({
    description: 'Bonus ML Coins for this classroom (on top of base rewards)',
    example: 5,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
    bonus_coins?: number;

  @ApiPropertyOptional({
    description: 'Due date for the mission (ISO 8601 format)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
    due_date?: string;

  @ApiPropertyOptional({
    description: 'Whether the mission is mandatory for students',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
    is_mandatory?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata for the mission',
    example: {
      custom_instructions: 'Complete before Friday',
      difficulty_override: 'hard',
    },
  })
  @IsObject()
  @IsOptional()
    metadata?: Record<string, any>;
}
