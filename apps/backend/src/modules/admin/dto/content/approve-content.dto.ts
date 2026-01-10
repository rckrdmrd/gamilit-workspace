import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * FIX-2025-01-07 P0: Added @IsBoolean validation to publish_immediately
 */
export class ApproveContentDto {
  @ApiPropertyOptional({
    description: 'Optional notes or feedback from the admin upon approval',
    example: 'Excellent content, approved for publication',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
    approval_notes?: string;

  /**
   * FIX-2025-01-07 P0: Added @IsBoolean to ensure proper type validation
   */
  @ApiPropertyOptional({
    description: 'Whether to publish immediately after approval',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'publish_immediately must be a boolean value' })
    publish_immediately?: boolean;
}
