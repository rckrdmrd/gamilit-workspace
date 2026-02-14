import { Controller, Get, HttpStatus, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService } from './health.service';
import { MetricsService } from './metrics.service';
import { HealthCheckSchema, HealthStatus } from './dto/health-check.dto';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Health')
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description:
      'Returns comprehensive health status of the application including database connectivity, ' +
      'critical tables validation, environment info, uptime, and version. ' +
      'This endpoint is public and does not require authentication. ' +
      'It can be used by load balancers, monitoring services, and uptime checkers.',
  })
  @ApiResponse({
    status: 200,
    description: 'All health checks passed - system is healthy',
    type: HealthCheckSchema,
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2025-11-23T19:00:00.000Z',
        uptime: 3600,
        environment: 'production',
        checks: {
          database: {
            status: 'healthy',
            responseTime: 15,
            message: 'PostgreSQL connected',
            details: {
              driver: 'postgres',
              isConnected: true,
            },
          },
          tables: {
            status: 'healthy',
            responseTime: 42,
            message: 'All critical tables exist',
            details: {
              totalChecked: 9,
              allPresent: true,
            },
          },
        },
        version: '1.0.0',
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'One or more health checks failed - system is unhealthy or degraded',
    type: HealthCheckSchema,
    schema: {
      example: {
        status: 'unhealthy',
        timestamp: '2025-11-23T19:00:00.000Z',
        uptime: 3600,
        environment: 'production',
        checks: {
          database: {
            status: 'unhealthy',
            responseTime: 5000,
            message: 'Database connection failed: Connection timeout',
            details: {
              error: 'Connection timeout',
            },
          },
          tables: {
            status: 'degraded',
            responseTime: 85,
            message: '2 critical table(s) missing',
            details: {
              totalChecked: 9,
              missingCount: 2,
              missing: ['auth_management.users', 'educational_content.modules'],
            },
          },
        },
        version: '1.0.0',
      },
    },
  })
  async check(@Res() res: Response): Promise<Response> {
    const health = await this.healthService.checkHealth();

    // Return 503 if unhealthy or degraded
    const statusCode =
      health.status === HealthStatus.HEALTHY ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json(health);
  }

  /**
   * Liveness probe — is the process alive?
   * Used by Kubernetes/Docker HEALTHCHECK. Only checks if the process responds.
   */
  @Get('live')
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Returns 200 if the process is alive. Does not check dependencies.',
  })
  @ApiResponse({ status: 200, description: 'Process is alive' })
  async live(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness probe — is the service ready to accept traffic?
   * Checks database and Redis connectivity.
   */
  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Returns 200 if all dependencies (DB, Redis) are healthy. Returns 503 if not ready.',
  })
  @ApiResponse({ status: 200, description: 'Service is ready to accept traffic' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async ready(@Res() res: Response): Promise<Response> {
    const health = await this.healthService.checkHealth();

    const statusCode =
      health.status === HealthStatus.HEALTHY ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json({
      status: health.status,
      timestamp: new Date().toISOString(),
      checks: {
        database: health.checks.database?.status || 'unknown',
        redis: health.checks.redis?.status || 'unknown',
      },
    });
  }

  /**
   * Prometheus metrics endpoint
   */
  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({
    summary: 'Prometheus metrics',
    description: 'Returns application metrics in Prometheus text format for scraping.',
  })
  @ApiResponse({ status: 200, description: 'Prometheus metrics in text format' })
  async metrics(): Promise<string> {
    return this.metricsService.getPrometheusMetrics();
  }
}
