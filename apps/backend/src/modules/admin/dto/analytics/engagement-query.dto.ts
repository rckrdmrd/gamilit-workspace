import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

/**
 * Query DTO for filtering engagement analytics
 */
export class EngagementQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by user role (e.g., "student", "admin_teacher")',
    example: 'student',
  })
  @IsOptional()
  @IsString()
    role?: string;

  @ApiPropertyOptional({
    description: 'Filter users registered from this date (ISO format)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
    date_from?: string;
}
