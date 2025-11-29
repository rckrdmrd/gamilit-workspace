import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query DTO for fetching top users by metric
 */
export class TopUsersQueryDto {
  @ApiProperty({
    description: 'Metric to rank users by',
    example: 'xp',
    enum: ['xp', 'exercises', 'streak'],
  })
  @IsString()
  @IsIn(['xp', 'exercises', 'streak'])
    metric!: string;

  @ApiPropertyOptional({
    description: 'Filter by user role (e.g., "student", "admin_teacher")',
    example: 'student',
  })
  @IsOptional()
  @IsString()
    role?: string;

  @ApiPropertyOptional({
    description: 'Number of top users to return (1-100)',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
    limit?: number = 10;
}
