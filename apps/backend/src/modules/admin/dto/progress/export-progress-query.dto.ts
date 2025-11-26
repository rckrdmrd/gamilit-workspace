import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, IsUUID } from 'class-validator';

/**
 * Query parameters for progress data export endpoint
 */
export class ExportProgressQueryDto {
  @ApiProperty({
    description: 'Type of data to export',
    enum: ['students', 'classrooms', 'modules'],
    example: 'students',
  })
  @IsString()
  @IsIn(['students', 'classrooms', 'modules'])
  type!: string;

  @ApiPropertyOptional({
    description: 'Filter by classroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  classroom_id?: string;

  @ApiPropertyOptional({
    description: 'Export format',
    enum: ['csv'],
    example: 'csv',
    default: 'csv',
  })
  @IsOptional()
  @IsString()
  format?: string = 'csv';
}
