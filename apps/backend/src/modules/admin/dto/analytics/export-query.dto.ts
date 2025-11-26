import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional } from 'class-validator';

/**
 * Query DTO for exporting analytics data
 */
export class ExportQueryDto {
  @ApiProperty({
    description: 'Type of analytics data to export',
    example: 'overview',
    enum: ['overview', 'users', 'engagement', 'gamification'],
  })
  @IsString()
  @IsIn(['overview', 'users', 'engagement', 'gamification'])
  type!: string;

  @ApiPropertyOptional({
    description: 'Export format',
    example: 'csv',
    default: 'csv',
  })
  @IsOptional()
  @IsString()
  format?: string = 'csv';
}
