import { ApiProperty } from '@nestjs/swagger';

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

export interface HealthCheckDetailDto {
  status: HealthStatus;
  responseTime: number;
  message: string;
  details?: Record<string, any>;
}

export interface HealthCheckDto {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  environment: string;
  checks: {
    database?: HealthCheckDetailDto;
    tables?: HealthCheckDetailDto;
    [key: string]: HealthCheckDetailDto | undefined;
  };
  version: string;
}

// Swagger schema definitions (used by controller for documentation)
export class HealthCheckDetailSchema {
  @ApiProperty({
    description: 'Health status of the check',
    enum: HealthStatus,
    example: HealthStatus.HEALTHY,
  })
    status!: HealthStatus;

  @ApiProperty({
    description: 'Response time in milliseconds',
    example: 15,
  })
    responseTime!: number;

  @ApiProperty({
    description: 'Descriptive message about the check',
    example: 'PostgreSQL connected',
  })
    message!: string;

  @ApiProperty({
    description: 'Additional details about the check',
    required: false,
    example: { tables: 122 },
  })
    details?: Record<string, any>;
}

export class HealthCheckSchema {
  @ApiProperty({
    description: 'Overall health status',
    enum: HealthStatus,
    example: HealthStatus.HEALTHY,
  })
    status!: HealthStatus;

  @ApiProperty({
    description: 'Current server timestamp',
    example: '2025-11-23T19:00:00.000Z',
  })
    timestamp!: string;

  @ApiProperty({
    description: 'Server uptime in seconds',
    example: 3600,
  })
    uptime!: number;

  @ApiProperty({
    description: 'Environment (dev, staging, production)',
    example: 'production',
  })
    environment!: string;

  @ApiProperty({
    description: 'Individual health checks',
    example: {
      database: {
        status: 'healthy',
        responseTime: 15,
        message: 'PostgreSQL connected',
      },
      tables: {
        status: 'healthy',
        count: 122,
        message: 'All critical tables exist',
      },
    },
  })
    checks!: Record<string, any>;

  @ApiProperty({
    description: 'Application version',
    example: '1.0.0',
  })
    version!: string;
}
