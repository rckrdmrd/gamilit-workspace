import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for alert statistics
 */
export class AlertsStatsDto {
  @ApiProperty({ description: 'Total number of alerts' })
  total_alerts!: number;

  @ApiProperty({ description: 'Number of open alerts' })
  open_alerts!: number;

  @ApiProperty({ description: 'Number of acknowledged alerts' })
  acknowledged_alerts!: number;

  @ApiProperty({ description: 'Number of resolved alerts' })
  resolved_alerts!: number;

  @ApiProperty({ description: 'Number of critical alerts' })
  critical_alerts!: number;

  @ApiProperty({ description: 'Number of high severity alerts' })
  high_alerts!: number;

  @ApiProperty({ description: 'Number of medium severity alerts' })
  medium_alerts!: number;

  @ApiProperty({ description: 'Number of low severity alerts' })
  low_alerts!: number;

  @ApiProperty({ description: 'Alerts in last 24 hours' })
  alerts_24h!: number;

  @ApiProperty({ description: 'Alerts in last 7 days' })
  alerts_7d!: number;

  @ApiProperty({ description: 'Average resolution time in hours' })
  avg_resolution_time_hours!: number;
}
