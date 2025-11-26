import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for memory metrics
 */
export class MemoryMetricsDto {
  @ApiProperty({ description: 'Total system memory in MB' })
  total_mb!: number;

  @ApiProperty({ description: 'Used system memory in MB' })
  used_mb!: number;

  @ApiProperty({ description: 'Free system memory in MB' })
  free_mb!: number;

  @ApiProperty({ description: 'Memory usage percentage' })
  usage_percent!: number;

  @ApiProperty({ description: 'Heap memory used in MB' })
  heap_used_mb!: number;

  @ApiProperty({ description: 'Total heap memory in MB' })
  heap_total_mb!: number;
}

/**
 * DTO for CPU metrics
 */
export class CpuMetricsDto {
  @ApiProperty({ description: 'User CPU time in milliseconds' })
  user_ms!: number;

  @ApiProperty({ description: 'System CPU time in milliseconds' })
  system_ms!: number;

  @ApiProperty({ description: 'Load average [1min, 5min, 15min]', type: [Number] })
  load_average!: number[];

  @ApiProperty({ description: 'Number of CPU cores' })
  cores!: number;
}

/**
 * DTO for system information
 */
export class SystemInfoDto {
  @ApiProperty({ description: 'Operating system platform' })
  platform!: string;

  @ApiProperty({ description: 'System architecture' })
  arch!: string;

  @ApiProperty({ description: 'System hostname' })
  hostname!: string;

  @ApiProperty({ description: 'System uptime in seconds' })
  uptime_seconds!: number;

  @ApiProperty({ description: 'Node.js version' })
  node_version!: string;
}

/**
 * DTO for process information
 */
export class ProcessInfoDto {
  @ApiProperty({ description: 'Process ID' })
  pid!: number;

  @ApiProperty({ description: 'Process uptime in seconds' })
  uptime_seconds!: number;

  @ApiProperty({ description: 'Number of active handles' })
  active_handles!: number;

  @ApiProperty({ description: 'Number of active requests' })
  active_requests!: number;
}

/**
 * DTO for complete system metrics
 */
export class SystemMetricsDto {
  @ApiProperty({ description: 'Timestamp of metrics collection' })
  timestamp!: string;

  @ApiProperty({ description: 'Memory metrics', type: MemoryMetricsDto })
  memory!: MemoryMetricsDto;

  @ApiProperty({ description: 'CPU metrics', type: CpuMetricsDto })
  cpu!: CpuMetricsDto;

  @ApiProperty({ description: 'System information', type: SystemInfoDto })
  system!: SystemInfoDto;

  @ApiProperty({ description: 'Process information', type: ProcessInfoDto })
  process!: ProcessInfoDto;
}
