import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

/**
 * Query parameters for module progress statistics endpoint
 */
export class ModuleProgressQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by classroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  classroom_id?: string;
}
