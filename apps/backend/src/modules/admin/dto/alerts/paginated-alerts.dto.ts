import { ApiProperty } from '@nestjs/swagger';
import { AlertResponseDto } from './alert-response.dto';

/**
 * DTO for paginated alerts response
 */
export class PaginatedAlertsDto {
  @ApiProperty({ type: [AlertResponseDto], description: 'Array of alerts' })
  data!: AlertResponseDto[];

  @ApiProperty({ description: 'Total number of alerts' })
  total!: number;

  @ApiProperty({ description: 'Current page' })
  page!: number;

  @ApiProperty({ description: 'Items per page' })
  limit!: number;

  @ApiProperty({ description: 'Total number of pages' })
  total_pages!: number;
}
