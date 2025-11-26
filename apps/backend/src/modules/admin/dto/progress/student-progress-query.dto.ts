import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

/**
 * Query parameters for student progress endpoint
 */
export class StudentProgressQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by classroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  classroom_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by module ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  module_id?: string;
}
