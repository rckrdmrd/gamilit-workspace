import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Maya Rank DTO
 *
 * GAP-FE-004: Updated to include complete rank metadata matching frontend expectations
 * Frontend expects 13 fields: id, name, level, minXp, maxXp, multiplierXp, multiplierMlCoins,
 * bonusMlCoins, color, icon, description, perks, isActive, order
 *
 * @description Individual Maya rank configuration with full metadata
 */
export class MayaRankDto {
  @ApiProperty({
    description: 'Unique identifier for this rank',
    example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  })
    id!: string;

  @ApiProperty({
    description: 'Display name of the rank',
    example: 'Novato',
    enum: ['Novato', 'Guerrero', 'Sabio', 'Líder', 'Maestro'],
  })
    name!: string;

  @ApiProperty({
    description: 'Numeric level of the rank (1-5)',
    example: 1,
  })
    level!: number;

  @ApiProperty({
    description: 'Minimum XP required for this rank',
    example: 0,
  })
    minXp!: number;

  @ApiPropertyOptional({
    description: 'Maximum XP for this rank (null for highest rank)',
    example: 99,
  })
    maxXp?: number | null;

  @ApiProperty({
    description: 'XP multiplier for users at this rank',
    example: 1.0,
  })
    multiplierXp!: number;

  @ApiProperty({
    description: 'ML Coins multiplier for users at this rank',
    example: 1.0,
  })
    multiplierMlCoins!: number;

  @ApiProperty({
    description: 'Bonus ML Coins awarded upon reaching this rank',
    example: 0,
  })
    bonusMlCoins!: number;

  @ApiProperty({
    description: 'Hexadecimal color code for UI display',
    example: '#6B7280',
  })
    color!: string;

  @ApiPropertyOptional({
    description: 'URL or path to rank icon/badge image',
    example: '/assets/ranks/novice.png',
  })
    icon?: string;

  @ApiProperty({
    description: 'Description of the rank and its significance',
    example: 'Rank inicial para nuevos usuarios',
  })
    description!: string;

  @ApiProperty({
    description: 'Array of perks/benefits unlocked at this rank',
    type: [String],
    example: ['Acceso a ejercicios básicos', 'Perfil personalizable'],
  })
    perks!: string[];

  @ApiProperty({
    description: 'Whether this rank is currently active in the system',
    example: true,
  })
    isActive!: boolean;

  @ApiProperty({
    description: 'Display order for UI sorting (1-based)',
    example: 1,
  })
    order!: number;
}

/**
 * Maya Ranks Response DTO
 *
 * @description Response format for Maya ranks configuration
 */
export class MayaRanksResponseDto {
  @ApiProperty({
    description: 'List of Maya ranks with thresholds',
    type: [MayaRankDto],
  })
    ranks!: MayaRankDto[];

  @ApiProperty({
    description: 'Total number of ranks',
    example: 5,
  })
    total!: number;

  @ApiProperty({
    description: 'Source setting key',
    example: 'gamification.ranks.thresholds',
  })
    setting_key!: string;

  @ApiProperty({
    description: 'Setting ID for updates',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
    setting_id!: string;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2025-11-23T10:30:00.000Z',
  })
    last_updated!: string;

  @ApiPropertyOptional({
    description: 'Admin who last updated',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
    updated_by?: string;
}
