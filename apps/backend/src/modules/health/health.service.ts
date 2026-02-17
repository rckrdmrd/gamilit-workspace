import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { HealthCheckDto, HealthCheckDetailDto, HealthStatus } from './dto/health-check.dto';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  private readonly startTime: number;

  constructor(
    @InjectDataSource('auth') private readonly authDataSource: DataSource,
    @InjectDataSource('educational') private readonly educationalDataSource: DataSource,
    @InjectDataSource('gamification') private readonly gamificationDataSource: DataSource,
    @InjectDataSource('progress') private readonly progressDataSource: DataSource,
    @InjectDataSource('social') private readonly socialDataSource: DataSource,
    @InjectDataSource('content') private readonly contentDataSource: DataSource,
    @InjectDataSource('audit') private readonly auditDataSource: DataSource,
    @InjectDataSource('notifications') private readonly notificationsDataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.startTime = Date.now();
  }

  /**
   * Perform comprehensive health check
   */
  async checkHealth(): Promise<HealthCheckDto> {
    const checks: HealthCheckDto['checks'] = {};

    // Run health checks
    const [databaseCheck, tablesCheck, redisCheck] = await Promise.allSettled([
      this.checkDatabaseConnection(),
      this.checkCriticalTables(),
      this.checkRedis(),
    ]);

    // Process database check
    if (databaseCheck.status === 'fulfilled') {
      checks.database = databaseCheck.value;
    } else {
      checks.database = {
        status: HealthStatus.UNHEALTHY,
        responseTime: 0,
        message: `Database check failed: ${databaseCheck.reason?.message || 'Unknown error'}`,
      };
    }

    // Process tables check
    if (tablesCheck.status === 'fulfilled') {
      checks.tables = tablesCheck.value;
    } else {
      checks.tables = {
        status: HealthStatus.UNHEALTHY,
        responseTime: 0,
        message: `Tables check failed: ${tablesCheck.reason?.message || 'Unknown error'}`,
      };
    }

    // Process Redis check (degraded, not unhealthy — Redis is optional for basic operation)
    if (redisCheck.status === 'fulfilled') {
      checks.redis = redisCheck.value;
    } else {
      checks.redis = {
        status: HealthStatus.DEGRADED,
        responseTime: 0,
        message: `Redis check failed: ${redisCheck.reason?.message || 'Unknown error'}`,
      };
    }

    // Determine overall status
    const overallStatus = this.determineOverallStatus(checks);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      environment: this.getEnvironment(),
      checks,
      version: this.getVersion(),
    };
  }

  /**
   * Check database connectivity
   */
  async checkDatabaseConnection(): Promise<HealthCheckDetailDto> {
    const startTime = Date.now();

    try {
      // Test connection with a simple query
      await this.authDataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      return {
        status: HealthStatus.HEALTHY,
        responseTime,
        message: 'PostgreSQL connected',
        details: {
          driver: 'postgres',
          isConnected: this.authDataSource.isInitialized,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Database health check failed: ${errorMessage}`, errorStack);

      return {
        status: HealthStatus.UNHEALTHY,
        responseTime,
        message: `Database connection failed: ${errorMessage}`,
        details: {
          error: errorMessage,
        },
      };
    }
  }

  /**
   * Check if critical tables exist
   */
  async checkCriticalTables(): Promise<HealthCheckDetailDto> {
    const startTime = Date.now();

    try {
      // Critical tables to check across all schemas
      // NOTE: auth.users is the correct location (not auth_management.users)
      const criticalTables = [
        { schema: 'auth', table: 'users', connection: this.authDataSource },
        { schema: 'auth_management', table: 'profiles', connection: this.authDataSource },
        { schema: 'educational_content', table: 'modules', connection: this.educationalDataSource },
        { schema: 'educational_content', table: 'exercises', connection: this.educationalDataSource },
        { schema: 'gamification_system', table: 'achievements', connection: this.gamificationDataSource },
        { schema: 'progress_tracking', table: 'module_progress', connection: this.progressDataSource },
        { schema: 'social_features', table: 'friendships', connection: this.socialDataSource },
        { schema: 'audit_logging', table: 'audit_logs', connection: this.auditDataSource },
      ];

      const tableChecks = await Promise.all(
        criticalTables.map(async ({ schema, table, connection }) => {
          try {
            const result = await connection.query(
              `SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = $1
                AND table_name = $2
              )`,
              [schema, table],
            );
            return { schema, table, exists: result[0].exists };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.warn(`Failed to check table ${schema}.${table}: ${errorMessage}`);
            return { schema, table, exists: false, error: errorMessage };
          }
        }),
      );

      const missingTables = tableChecks.filter((check) => !check.exists);
      const responseTime = Date.now() - startTime;

      if (missingTables.length === 0) {
        return {
          status: HealthStatus.HEALTHY,
          responseTime,
          message: 'All critical tables exist',
          details: {
            totalChecked: criticalTables.length,
            allPresent: true,
          },
        };
      } else {
        return {
          status: HealthStatus.DEGRADED,
          responseTime,
          message: `${missingTables.length} critical table(s) missing`,
          details: {
            totalChecked: criticalTables.length,
            missingCount: missingTables.length,
            missing: missingTables.map((t) => `${t.schema}.${t.table}`),
          },
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Tables health check failed: ${errorMessage}`, errorStack);

      return {
        status: HealthStatus.UNHEALTHY,
        responseTime,
        message: `Tables check failed: ${errorMessage}`,
        details: {
          error: errorMessage,
        },
      };
    }
  }

  /**
   * Check Redis connectivity
   */
  async checkRedis(): Promise<HealthCheckDetailDto> {
    const redisEnabled = this.configService.get<boolean>('redis.enabled', true);

    if (!redisEnabled) {
      return {
        status: HealthStatus.HEALTHY,
        responseTime: 0,
        message: 'Redis disabled by configuration',
        details: { enabled: false },
      };
    }

    const startTime = Date.now();
    const redisUrl = this.configService.get<string>('redis.url')
      || process.env.REDIS_URL
      || 'redis://localhost:6379';
    const redisDb = this.configService.get<number>('redis.db')
      ?? parseInt(process.env.REDIS_SOCKET_DB || '0', 10);

    let client: ReturnType<typeof createClient> | null = null;

    try {
      client = createClient({
        url: redisUrl,
        database: redisDb,
        socket: {
          connectTimeout: 3000,
          reconnectStrategy: false,
        },
      });

      await client.connect();
      const pong = await client.ping();
      const responseTime = Date.now() - startTime;

      await client.quit();
      client = null;

      if (pong === 'PONG') {
        return {
          status: HealthStatus.HEALTHY,
          responseTime,
          message: 'Redis connected',
          details: {
            url: redisUrl.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'),
            db: redisDb,
          },
        };
      }

      return {
        status: HealthStatus.DEGRADED,
        responseTime,
        message: `Redis unexpected response: ${pong}`,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Redis health check failed: ${errorMessage}`);

      if (client) {
        try {
          client.removeAllListeners();
          if (client.isOpen) await client.quit();
        } catch { /* ignore cleanup errors */ }
        client = null;
      }

      return {
        status: HealthStatus.DEGRADED,
        responseTime,
        message: `Redis unavailable: ${errorMessage}`,
        details: {
          url: redisUrl.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'),
          impact: 'WebSocket horizontal scaling and message persistence disabled',
        },
      };
    }
  }

  /**
   * Get server uptime in seconds
   */
  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Get current environment
   */
  getEnvironment(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  /**
   * Get application version
   */
  getVersion(): string {
    return this.configService.get<string>('npm_package_version') || '1.0.0';
  }

  /**
   * Determine overall health status from individual checks
   */
  private determineOverallStatus(checks: HealthCheckDto['checks']): HealthStatus {
    const statuses = Object.values(checks)
      .filter((check): check is HealthCheckDetailDto => check !== undefined)
      .map((check) => check.status);

    if (statuses.some((status) => status === HealthStatus.UNHEALTHY)) {
      return HealthStatus.UNHEALTHY;
    }

    if (statuses.some((status) => status === HealthStatus.DEGRADED)) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }
}
