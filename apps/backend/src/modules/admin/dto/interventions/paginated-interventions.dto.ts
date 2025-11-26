import { ApiProperty } from '@nestjs/swagger';
import { InterventionAlertDto } from './intervention-alert.dto';

/**
 * DTO for paginated intervention alerts response
 */
export class PaginatedInterventionsDto {
  @ApiProperty({
    description: 'Array of intervention alerts',
    type: [InterventionAlertDto],
  })
  data!: InterventionAlertDto[];

  @ApiProperty({
    description: 'Total number of alerts matching filters',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
  total_pages!: number;
}
