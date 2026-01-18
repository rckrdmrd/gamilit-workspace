import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * MultiplierSourceDto
 *
 * @description Representa una fuente individual de multiplicador
 */
export class MultiplierSourceDto {
  @ApiProperty({
    description: 'Tipo de multiplicador',
    enum: ['rank', 'prestige', 'streak', 'time', 'social', 'guild', 'achievement', 'event'],
    example: 'rank',
  })
  @Expose()
    type!: string;

  @ApiProperty({
    description: 'Nombre descriptivo del multiplicador',
    example: 'Multiplicador de Rango Nacom',
  })
  @Expose()
    name!: string;

  @ApiProperty({
    description: 'Valor del multiplicador (ej: 1.25 para 25% de bonus)',
    example: 1.25,
  })
  @Expose()
    value!: number;

  @ApiPropertyOptional({
    description: 'Fecha de expiracion para multiplicadores temporales',
    example: '2026-01-25T23:59:59Z',
  })
  @Expose()
    expires_at?: Date;

  @ApiProperty({
    description: 'Indica si es un multiplicador permanente',
    example: true,
  })
  @Expose()
    is_permanent!: boolean;

  @ApiPropertyOptional({
    description: 'Descripcion adicional del multiplicador',
    example: 'Bonus por alcanzar el rango Nacom',
  })
  @Expose()
    description?: string;

  @ApiPropertyOptional({
    description: 'Icono representativo',
    example: 'crown',
  })
  @Expose()
    icon?: string;
}

/**
 * MultiplierBreakdownResponseDto
 *
 * @description DTO que provee el desglose completo de multiplicadores del usuario.
 *              Incluye multiplicadores de rango, racha, eventos, y totales calculados.
 *
 * @task TASK-2026-01-17-002 - FASE 1
 * @see docs/api/GAMIFICATION-ENDPOINTS-GAP.md
 * @see docs/frontend/types/GAMIFICATION-TYPES.md (MultiplierBreakdown interface)
 */
export class MultiplierBreakdownResponseDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
    user_id!: string;

  @ApiProperty({
    description: 'Multiplicador base (siempre 1.0)',
    example: 1.0,
  })
  @Expose()
    base!: number;

  @ApiProperty({
    description: 'Multiplicador del rango actual',
    type: MultiplierSourceDto,
  })
  @Expose()
    rank!: MultiplierSourceDto;

  @ApiProperty({
    description: 'Array con todas las fuentes de multiplicador activas',
    type: [MultiplierSourceDto],
  })
  @Expose()
    sources!: MultiplierSourceDto[];

  @ApiProperty({
    description: 'Multiplicador total calculado (producto de todos los multiplicadores)',
    example: 1.35,
  })
  @Expose()
    total!: number;

  @ApiProperty({
    description: 'Indica si hay multiplicadores que expiran pronto (24h)',
    example: false,
  })
  @Expose()
    has_expiring_soon!: boolean;

  @ApiProperty({
    description: 'Lista de multiplicadores que expiran en las proximas 24h',
    type: [MultiplierSourceDto],
  })
  @Expose()
    expiring_soon!: MultiplierSourceDto[];
}

/**
 * Factory function to create MultiplierBreakdownResponseDto
 */
export function createMultiplierBreakdownResponse(
  userId: string,
  rankMultiplier: { name: string; value: number },
  streakBonus: number,
  currentStreak: number,
): MultiplierBreakdownResponseDto {
  const dto = new MultiplierBreakdownResponseDto();

  dto.user_id = userId;
  dto.base = 1.0;

  // Rank multiplier (always permanent)
  dto.rank = {
    type: 'rank',
    name: rankMultiplier.name,
    value: rankMultiplier.value,
    is_permanent: true,
    description: `Multiplicador base del rango ${rankMultiplier.name}`,
  };

  const sources: MultiplierSourceDto[] = [dto.rank];

  // Streak bonus (if any)
  if (streakBonus > 0) {
    sources.push({
      type: 'streak',
      name: `Racha de ${currentStreak} días`,
      value: 1 + streakBonus, // Convert bonus to multiplier
      is_permanent: false,
      description: `Bonus por ${currentStreak} días consecutivos de actividad`,
      icon: 'flame',
    });
  }

  dto.sources = sources;

  // Calculate total multiplier (product of all multiplier values)
  // For additive display, we sum the bonuses on top of base
  const rankBonus = rankMultiplier.value - 1; // e.g., 1.25 -> 0.25
  dto.total = Number((1 + rankBonus + streakBonus).toFixed(2));

  // Check for expiring multipliers (within 24h)
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  dto.expiring_soon = sources.filter(
    (s) => !s.is_permanent && s.expires_at && new Date(s.expires_at) <= in24h,
  );
  dto.has_expiring_soon = dto.expiring_soon.length > 0;

  return dto;
}
