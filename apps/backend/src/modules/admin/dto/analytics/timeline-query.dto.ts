import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query DTO for activity timeline parameters
 */
export class TimelineQueryDto {
  @ApiPropertyOptional({
    description: 'Number of days to include in timeline (1-90)',
    example: 30,
    default: 30,
    minimum: 1,
    maximum: 90,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days?: number = 30;
}
