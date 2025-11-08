import { ApiProperty } from '@nestjs/swagger';
import { OrganizationDto } from './organization.dto';

export class PaginatedOrganizationsDto {
  @ApiProperty({
    description: 'Array of organizations',
    type: [OrganizationDto],
  })
  data!: OrganizationDto[];

  @ApiProperty({
    description: 'Total number of organizations',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
  total_pages!: number;
}
