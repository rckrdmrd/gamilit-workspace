import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for cohort retention data
 */
export class CohortRetentionDto {
  @ApiProperty({
    description: 'Cohort month (first day of month, ISO format)',
    example: '2025-01-01T00:00:00Z',
  })
    cohort_month!: string;

  @ApiProperty({
    description: 'Number of users who registered in this cohort',
    example: 150,
  })
    cohort_size!: number;

  @ApiProperty({
    description: 'Number of users who are still active',
    example: 125,
  })
    retained_users!: number;

  @ApiProperty({
    description: 'Retention rate as percentage',
    example: 83.33,
  })
    retention_rate!: number;
}

/**
 * DTO for complete retention analytics response
 */
export class RetentionAnalyticsDto {
  @ApiProperty({
    description: 'Retention metrics by monthly cohort (most recent first)',
    type: [CohortRetentionDto],
  })
    cohorts!: CohortRetentionDto[];
}
