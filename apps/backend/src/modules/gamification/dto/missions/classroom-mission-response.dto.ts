import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * ClassroomMissionResponseDto
 *
 * @description DTO para la respuesta de una misión de aula
 *
 * Incluye toda la información de la misión asignada a un aula:
 * - ID, classroom_id, mission_template_id
 * - Información de asignación (assigned_by, assigned_at)
 * - Configuración (is_mandatory, bonus_xp, bonus_coins)
 * - Detalles de la misión (title, description, type, objectives, rewards)
 * - Metadata y fechas
 *
 * @usage GET /api/v1/gamification/classrooms/:classroomId/missions
 */
export class ClassroomMissionResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the classroom mission',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
    id!: string;

  @ApiProperty({
    description: 'Classroom ID',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
    classroom_id!: string;

  @ApiProperty({
    description: 'Mission template ID',
    example: 'daily_complete_exercises',
  })
    mission_template_id!: string;

  @ApiProperty({
    description: 'User ID who assigned the mission (teacher profile ID)',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
    assigned_by!: string;

  @ApiProperty({
    description: 'Date when the mission was assigned',
    example: '2025-11-26T10:00:00Z',
  })
    assigned_at!: Date;

  @ApiPropertyOptional({
    description: 'Due date for the mission',
    example: '2025-12-31T23:59:59Z',
    nullable: true,
  })
    due_date!: Date | null;

  @ApiProperty({
    description: 'Whether the mission is mandatory',
    example: false,
  })
    is_mandatory!: boolean;

  @ApiProperty({
    description: 'Bonus XP for this classroom',
    example: 10,
  })
    bonus_xp!: number;

  @ApiProperty({
    description: 'Bonus ML Coins for this classroom',
    example: 5,
  })
    bonus_coins!: number;

  @ApiProperty({
    description: 'Mission title',
    example: 'Complete 3 exercises',
  })
    title!: string;

  @ApiPropertyOptional({
    description: 'Mission description',
    example: 'Complete 3 exercises before the due date',
    nullable: true,
  })
    description!: string | null;

  @ApiProperty({
    description: 'Mission type',
    enum: ['daily', 'weekly', 'special'],
    example: 'daily',
  })
    mission_type!: string;

  @ApiProperty({
    description: 'Mission objectives',
    example: [
      {
        type: 'complete_exercises',
        target: 3,
        current: 0,
        description: 'Complete 3 exercises',
      },
    ],
  })
    objectives!: Array<{
    type: string;
    target: number;
    current?: number;
    description?: string;
  }>;

  @ApiProperty({
    description: 'Base rewards for the mission',
    example: {
      ml_coins: 25,
      xp: 50,
    },
  })
    base_rewards!: {
    ml_coins?: number;
    xp?: number;
  };

  @ApiProperty({
    description: 'Total rewards (base + bonus)',
    example: {
      ml_coins: 30,
      xp: 60,
    },
  })
    total_rewards!: {
    ml_coins: number;
    xp: number;
  };

  @ApiProperty({
    description: 'Whether the mission is active',
    example: true,
  })
    is_active!: boolean;

  @ApiProperty({
    description: 'Additional metadata',
    example: {
      custom_instructions: 'Complete before Friday',
    },
  })
    metadata!: Record<string, unknown>;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-11-26T10:00:00Z',
  })
    created_at!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-26T10:00:00Z',
  })
    updated_at!: Date;

  constructor(partial: Partial<ClassroomMissionResponseDto>) {
    Object.assign(this, partial);
  }

  /**
   * Factory method to create response DTO from entity
   * Calculates total_rewards from base_rewards + bonuses
   */
  static fromEntity(entity: any): ClassroomMissionResponseDto {
    const totalMlCoins = (entity.base_rewards?.ml_coins || 0) + (entity.bonus_coins || 0);
    const totalXp = (entity.base_rewards?.xp || 0) + (entity.bonus_xp || 0);

    return new ClassroomMissionResponseDto({
      id: entity.id,
      classroom_id: entity.classroom_id,
      mission_template_id: entity.mission_template_id,
      assigned_by: entity.assigned_by,
      assigned_at: entity.assigned_at,
      due_date: entity.due_date,
      is_mandatory: entity.is_mandatory,
      bonus_xp: entity.bonus_xp,
      bonus_coins: entity.bonus_coins,
      title: entity.title,
      description: entity.description,
      mission_type: entity.mission_type,
      objectives: entity.objectives,
      base_rewards: entity.base_rewards,
      total_rewards: {
        ml_coins: totalMlCoins,
        xp: totalXp,
      },
      is_active: entity.is_active,
      metadata: entity.metadata,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    });
  }
}
