import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

/**
 * Update Maya Rank DTO
 *
 * @description DTO for updating a Maya rank threshold
 * @validation min_xp must be >= 0
 */
export class UpdateMayaRankDto {
  @ApiProperty({
    description: 'New minimum XP threshold for this rank',
    example: 150,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
    min_xp!: number;
}

/**
 * Maya Rank DTO (for response)
 */
class MayaRankDto {
  rank_name!: string;

  min_xp!: number;

  max_xp?: number | null;

  rank_order!: number;
}

/**
 * Update Maya Rank Response DTO
 *
 * @description Response after updating a Maya rank
 */
export class UpdateMayaRankResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Maya rank threshold updated successfully',
  })
    message!: string;

  @ApiProperty({
    description: 'Updated rank details',
  })
    rank!: {
    rank_name: string;
    old_threshold: number;
    new_threshold: number;
    updated_at: string;
  };

  @ApiProperty({
    description: 'All ranks after update (to show updated ranges)',
    type: [MayaRankDto],
  })
    all_ranks!: MayaRankDto[];
}
