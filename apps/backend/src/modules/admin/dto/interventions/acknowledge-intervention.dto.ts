import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for acknowledging an intervention alert
 */
export class AcknowledgeInterventionDto {
  @ApiPropertyOptional({
    description: 'Optional note about the acknowledgment',
    example: 'Reviewing student progress and planning intervention',
  })
  @IsOptional()
  @IsString()
  acknowledgment_note?: string;
}
