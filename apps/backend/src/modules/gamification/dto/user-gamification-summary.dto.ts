import { ApiProperty } from '@nestjs/swagger';

/**
 * UserGamificationSummaryDto
 *
 * @description DTO para resumen de gamificación del usuario (usado en portales Admin/Teacher)
 * Contiene información consolidada de nivel, XP, coins, rango y achievements
 *
 * @usage Frontend (Admin/Teacher portals): useUserGamification hook
 * @endpoint GET /api/v1/gamification/users/:userId/summary
 *
 * @see apps/frontend/src/shared/hooks/useUserGamification.ts
 */
export class UserGamificationSummaryDto {
  /**
   * User ID (UUID)
   */
  @ApiProperty({
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
    userId!: string;

  /**
   * Current user level
   */
  @ApiProperty({
    description: 'Current user level',
    example: 5,
    minimum: 1,
  })
    level!: number;

  /**
   * Total experience points accumulated
   */
  @ApiProperty({
    description: 'Total experience points',
    example: 2500,
    minimum: 0,
  })
    totalXP!: number;

  /**
   * Current ML Coins balance
   */
  @ApiProperty({
    description: 'Current ML Coins balance',
    example: 150,
    minimum: 0,
  })
    mlCoins!: number;

  /**
   * Current rank name (Maya rank system)
   */
  @ApiProperty({
    description: 'Current rank name',
    example: 'Nacom',
    enum: ['Ajaw', 'Nacom', "Ah K'in", 'Halach Uinic', "K'uk'ulkan"],
  })
    rank!: string;

  /**
   * Current rank color (hex code for UI)
   */
  @ApiProperty({
    description: 'Current rank color (hex)',
    example: '#4CAF50',
    required: false,
  })
    rankColor?: string;

  /**
   * Progress to next level (0-100%)
   */
  @ApiProperty({
    description: 'XP progress to next level (0-100%)',
    example: 60,
    minimum: 0,
    maximum: 100,
  })
    progressToNextLevel!: number;

  /**
   * XP needed to reach next level
   */
  @ApiProperty({
    description: 'XP needed for next level',
    example: 500,
    minimum: 0,
  })
    xpToNextLevel!: number;

  /**
   * Array of achievement IDs unlocked by the user
   */
  @ApiProperty({
    description: 'Array of achievement IDs unlocked',
    type: [String],
    example: ['achievement-1', 'achievement-2'],
  })
    achievements!: string[];

  /**
   * Total count of achievements unlocked
   */
  @ApiProperty({
    description: 'Total achievements unlocked',
    example: 12,
    minimum: 0,
  })
    totalAchievements!: number;
}
