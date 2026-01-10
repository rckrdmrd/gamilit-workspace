import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, ValidateIf } from 'class-validator';

/**
 * Valid gamification parameter categories
 * FIX-2025-01-07 P0: Defined as enum for runtime validation
 */
export enum GamificationCategoryEnum {
  XP = 'xp',
  RANKS = 'ranks',
  COINS = 'coins',
  ACHIEVEMENTS = 'achievements',
}

/**
 * List Parameters Query DTO
 *
 * @description Query parameters for listing gamification parameters
 * @supports Filtering by category (xp, ranks, coins, achievements)
 * FIX-2025-01-07 P0: Added @IsEnum for runtime validation
 */
export class ListParametersQueryDto {
  /**
   * FIX-2025-01-07 P0: Added @IsEnum to validate category at runtime
   */
  @ApiPropertyOptional({
    description: 'Filter by parameter category',
    enum: GamificationCategoryEnum,
    example: 'xp',
  })
  @IsOptional()
  @ValidateIf((o) => o.category !== undefined && o.category !== '')
  @IsEnum(GamificationCategoryEnum, {
    message: 'Category must be one of: xp, ranks, coins, achievements',
  })
    category?: GamificationCategoryEnum;
}
