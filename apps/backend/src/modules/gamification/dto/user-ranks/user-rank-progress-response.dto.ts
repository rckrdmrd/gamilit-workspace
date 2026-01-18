import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MayaRank } from '@shared/constants/enums.constants';

/**
 * UserRankProgressResponseDto
 *
 * @description DTO compuesto que provee toda la informacion de progreso
 * de rango que el frontend necesita. Combina datos de UserStats + UserRank
 * + campos calculados.
 *
 * @task TASK-2026-01-17-002 - FASE 1
 * @see docs/api/GAMIFICATION-ENDPOINTS-GAP.md
 * @see docs/frontend/types/GAMIFICATION-TYPES.md (UserRankProgress interface)
 */
export class UserRankProgressResponseDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
    user_id!: string;

  // =====================================================
  // RANK INFORMATION (from UserStats)
  // =====================================================

  @ApiProperty({
    description: 'Rango maya actual',
    enum: MayaRank,
    example: MayaRank.NACOM,
  })
  @Expose()
    current_rank!: MayaRank;

  @ApiPropertyOptional({
    description: 'Siguiente rango (null si es rango maximo)',
    enum: MayaRank,
    example: MayaRank.AH_KIN,
  })
  @Expose()
    next_rank!: MayaRank | null;

  // =====================================================
  // LEVEL & XP (from UserStats)
  // =====================================================

  @ApiProperty({
    description: 'Nivel actual del usuario',
    example: 5,
  })
  @Expose()
    level!: number;

  @ApiProperty({
    description: 'XP total acumulado',
    example: 2500,
  })
  @Expose()
    total_xp!: number;

  @ApiProperty({
    description: 'XP dentro del nivel actual (calculado: total_xp % xp_per_level)',
    example: 50,
  })
  @Expose()
    current_xp!: number;

  @ApiProperty({
    description: 'XP necesario para subir al siguiente nivel',
    example: 100,
  })
  @Expose()
    xp_to_next_level!: number;

  // =====================================================
  // ML COINS
  // =====================================================

  @ApiProperty({
    description: 'Total de ML Coins ganados historicamente',
    example: 1500,
  })
  @Expose()
    ml_coins_earned!: number;

  // =====================================================
  // RANK PROGRESS (calculated)
  // =====================================================

  @ApiProperty({
    description: 'Porcentaje de progreso hacia el siguiente rango (0-100)',
    example: 45.5,
  })
  @Expose()
    rank_progress_percentage!: number;

  @ApiProperty({
    description: 'XP requerido para el siguiente rango',
    example: 1000,
  })
  @Expose()
    xp_required_for_next_rank!: number;

  @ApiProperty({
    description: 'XP restante para el siguiente rango',
    example: 250,
  })
  @Expose()
    xp_remaining_for_next_rank!: number;

  @ApiProperty({
    description: 'Indica si el usuario puede subir de rango',
    example: false,
  })
  @Expose()
    can_rank_up!: boolean;

  @ApiProperty({
    description: 'Indica si es el rango maximo',
    example: false,
  })
  @Expose()
    is_max_rank!: boolean;

  // =====================================================
  // PRESTIGE SYSTEM (placeholder for future)
  // =====================================================

  @ApiProperty({
    description: 'Nivel de prestigio (0 = sin prestigio)',
    example: 0,
  })
  @Expose()
    prestige_level!: number;

  @ApiProperty({
    description: 'Indica si puede prestigiar (requiere rango maximo)',
    example: false,
  })
  @Expose()
    can_prestige!: boolean;

  // =====================================================
  // MULTIPLIER (calculated from rank + bonuses)
  // =====================================================

  @ApiProperty({
    description: 'Multiplicador actual total',
    example: 1.25,
  })
  @Expose()
    multiplier!: number;

  // =====================================================
  // ACTIVITY & STREAKS
  // =====================================================

  @ApiProperty({
    description: 'Racha de actividad actual en dias',
    example: 7,
  })
  @Expose()
    activity_streak!: number;

  @ApiPropertyOptional({
    description: 'Fecha de la ultima actividad',
    example: '2026-01-18T10:30:00Z',
  })
  @Expose()
    last_activity_at!: Date | null;

  @ApiPropertyOptional({
    description: 'Fecha del ultimo ascenso de rango',
    example: '2026-01-15T14:00:00Z',
  })
  @Expose()
    last_rank_up!: Date | null;

  // =====================================================
  // BONUS INFO
  // =====================================================

  @ApiProperty({
    description: 'Bonus de ML Coins al promocionar al siguiente rango',
    example: 250,
  })
  @Expose()
    ml_coins_bonus_on_promotion!: number;
}

/**
 * Factory function to create UserRankProgressResponseDto from service data
 */
export function createUserRankProgressResponse(
  data: {
    userId: string;
    currentRank: MayaRank;
    nextRank: MayaRank | null;
    level: number;
    totalXp: number;
    xpToNextLevel: number;
    mlCoinsEarned: number;
    rankProgressPercentage: number;
    xpRequiredForNextRank: number;
    xpRemainingForNextRank: number;
    canRankUp: boolean;
    isMaxRank: boolean;
    activityStreak: number;
    lastActivityAt: Date | null;
    lastRankUp: Date | null;
    mlCoinsBonusOnPromotion: number;
    multiplier?: number;
  },
): UserRankProgressResponseDto {
  const dto = new UserRankProgressResponseDto();

  dto.user_id = data.userId;
  dto.current_rank = data.currentRank;
  dto.next_rank = data.nextRank;
  dto.level = data.level;
  dto.total_xp = data.totalXp;
  dto.current_xp = data.totalXp % (data.xpToNextLevel || 100); // XP within current level
  dto.xp_to_next_level = data.xpToNextLevel;
  dto.ml_coins_earned = data.mlCoinsEarned;
  dto.rank_progress_percentage = data.rankProgressPercentage;
  dto.xp_required_for_next_rank = data.xpRequiredForNextRank;
  dto.xp_remaining_for_next_rank = data.xpRemainingForNextRank;
  dto.can_rank_up = data.canRankUp;
  dto.is_max_rank = data.isMaxRank;
  dto.prestige_level = 0; // Not implemented yet
  dto.can_prestige = data.isMaxRank; // Can only prestige at max rank
  dto.multiplier = data.multiplier ?? calculateBaseMultiplier(data.currentRank);
  dto.activity_streak = data.activityStreak;
  dto.last_activity_at = data.lastActivityAt;
  dto.last_rank_up = data.lastRankUp;
  dto.ml_coins_bonus_on_promotion = data.mlCoinsBonusOnPromotion;

  return dto;
}

/**
 * Calculate base multiplier from rank
 */
function calculateBaseMultiplier(rank: MayaRank): number {
  const multipliers: Record<MayaRank, number> = {
    [MayaRank.AJAW]: 1.0,
    [MayaRank.NACOM]: 1.1,
    [MayaRank.AH_KIN]: 1.25,
    [MayaRank.HALACH_UINIC]: 1.5,
    [MayaRank.KUKULKAN]: 2.0,
  };
  return multipliers[rank] ?? 1.0;
}
