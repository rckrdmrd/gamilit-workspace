import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for acknowledging an alert
 */
export class AcknowledgeAlertDto {
  @ApiPropertyOptional({ description: 'Note about the acknowledgment' })
  @IsOptional()
  @IsString()
    acknowledgment_note?: string;
}
