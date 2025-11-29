import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * List Parameters Query DTO
 *
 * @description Query parameters for listing gamification parameters
 * @supports Filtering by category (xp, ranks, coins, achievements)
 */
export class ListParametersQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by parameter category',
    enum: ['xp', 'ranks', 'coins', 'achievements'],
    example: 'xp',
  })
  @IsOptional()
  @IsString()
    category?: 'xp' | 'ranks' | 'coins' | 'achievements';
}
