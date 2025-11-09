import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AuthAttempt } from '@modules/auth/entities/auth-attempt.entity';
import { User } from '@modules/auth/entities/user.entity';
import { Tenant } from '@modules/auth/entities/tenant.entity';
import { Module } from '@modules/educational/entities/module.entity';
import { Exercise } from '@modules/educational/entities/exercise.entity';
import {
  SystemHealthDto,
  DatabaseHealthDto,
  SystemMetricsDto,
  AuditLogQueryDto,
  PaginatedAuditLogDto,
  AuditLogDto,
  UpdateSystemConfigDto,
  SystemConfigDto,
  ToggleMaintenanceDto,
  MaintenanceStatusDto,
} from '../dto/system';

// In-memory system config (could be moved to database or Redis)
let systemConfig: SystemConfigDto = {
  maintenance_mode: false,
  maintenance_message: 'System under maintenance. We will be back soon.',
  allow_registrations: true,
  max_login_attempts: 5,
  lockout_duration_minutes: 30,
  session_timeout_minutes: 60,
  custom_settings: {},
  updated_at: new Date().toISOString(),
  updated_by: undefined,
};

@Injectable()
export class AdminSystemService {
  constructor(
    @InjectConnection('auth')
    private readonly authConnection: Connection,
    @InjectConnection('educational')
    private readonly educationalConnection: Connection,
    @InjectRepository(AuthAttempt, 'auth')
    private readonly authAttemptRepo: Repository<AuthAttempt>,
    @InjectRepository(User, 'auth')
    private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant, 'auth')
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Module, 'educational')
    private readonly moduleRepo: Repository<Module>,
    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepo: Repository<Exercise>,
  ) {}

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealthDto> {
    const startTime = Date.now();

    // Check database health
    const databaseHealth = await this.checkDatabaseHealth();

    // System info
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Calculate memory metrics
    const totalMemMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const usedMemMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memoryPercent = Math.round((usedMemMB / totalMemMB) * 100);

    // Estimate CPU usage (simple calculation)
    const cpuPercent = Math.min(
      Math.round((cpuUsage.user + cpuUsage.system) / 1000000),
      100,
    );

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (databaseHealth.status === 'down') {
      overallStatus = 'down';
    } else if (
      databaseHealth.status === 'degraded' ||
      memoryPercent > 90 ||
      cpuPercent > 90
    ) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      uptime_seconds: Math.round(uptime),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      node_version: process.version,
      environment: process.env.NODE_ENV || 'development',
      database: databaseHealth,
      memory: {
        used_mb: usedMemMB,
        total_mb: totalMemMB,
        usage_percent: memoryPercent,
      },
      cpu: {
        usage_percent: cpuPercent,
      },
    };
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<SystemMetricsDto> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Count total entities
    const totalUsers = await this.userRepo.count();
    const totalModules = await this.moduleRepo.count();
    const totalExercises = await this.exerciseRepo.count();
    const totalOrganizations = await this.tenantRepo.count();

    // Active users (last 24h) - users with auth attempts
    const activeUsers24h = await this.authAttemptRepo
      .createQueryBuilder('attempt')
      .select('COUNT(DISTINCT attempt.user_id)', 'count')
      .where('attempt.attempted_at > :date', { date: oneDayAgo })
      .andWhere('attempt.success = true')
      .andWhere('attempt.user_id IS NOT NULL')
      .getRawOne()
      .then((result) => parseInt(result?.count || '0', 10));

    // Auth attempts in last hour
    const requestsLastHour = await this.authAttemptRepo.count({
      where: {
        attempted_at: MoreThanOrEqual(oneHourAgo),
      },
    });

    // Failed attempts in last hour (for error rate)
    const failedLastHour = await this.authAttemptRepo.count({
      where: {
        attempted_at: MoreThanOrEqual(oneHourAgo),
        success: false,
      },
    });

    const errorRate =
      requestsLastHour > 0 ? failedLastHour / requestsLastHour : 0;

    // Exercises completed estimation (using auth attempts as proxy)
    const exercisesCompleted24h = await this.authAttemptRepo.count({
      where: {
        attempted_at: MoreThanOrEqual(oneDayAgo),
        success: true,
      },
    });

    // Top errors (last 24h)
    const topErrors = await this.authAttemptRepo
      .createQueryBuilder('attempt')
      .select('attempt.failure_reason', 'error')
      .addSelect('COUNT(*)', 'count')
      .where('attempt.attempted_at > :date', { date: oneDayAgo })
      .andWhere('attempt.success = false')
      .andWhere('attempt.failure_reason IS NOT NULL')
      .groupBy('attempt.failure_reason')
      .orderBy('COUNT(*)', 'DESC')
      .limit(5)
      .getRawMany()
      .then((results) =>
        results.map((r) => ({
          error: r.error,
          count: parseInt(r.count, 10),
        })),
      );

    return {
      timestamp: now.toISOString(),
      total_users: totalUsers,
      active_users_24h: activeUsers24h,
      total_modules: totalModules,
      total_exercises: totalExercises,
      total_organizations: totalOrganizations,
      exercises_completed_24h: Math.round(exercisesCompleted24h * 1.5), // Estimation
      avg_response_time_ms: 125, // TODO: Implement actual tracking
      requests_last_hour: requestsLastHour,
      error_rate_last_hour: parseFloat(errorRate.toFixed(4)),
      db_queries_last_hour: requestsLastHour * 3, // Estimation: ~3 queries per request
      top_errors: topErrors.length > 0 ? topErrors : undefined,
    };
  }

  /**
   * Get audit log with filters
   */
  async getAuditLog(query: AuditLogQueryDto): Promise<PaginatedAuditLogDto> {
    const {
      user_id,
      email,
      ip_address,
      success,
      start_date,
      end_date,
      page = 1,
      limit = 50,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.authAttemptRepo.createQueryBuilder('attempt');

    // Apply filters
    if (user_id) {
      queryBuilder.andWhere('attempt.user_id = :user_id', { user_id });
    }

    if (email) {
      queryBuilder.andWhere('attempt.email ILIKE :email', {
        email: `%${email}%`,
      });
    }

    if (ip_address) {
      queryBuilder.andWhere('attempt.ip_address = :ip_address', {
        ip_address,
      });
    }

    if (success !== undefined) {
      queryBuilder.andWhere('attempt.success = :success', { success });
    }

    if (start_date && end_date) {
      queryBuilder.andWhere('attempt.attempted_at BETWEEN :start AND :end', {
        start: new Date(start_date),
        end: new Date(end_date),
      });
    } else if (start_date) {
      queryBuilder.andWhere('attempt.attempted_at >= :start', {
        start: new Date(start_date),
      });
    } else if (end_date) {
      queryBuilder.andWhere('attempt.attempted_at <= :end', {
        end: new Date(end_date),
      });
    }

    // Pagination and ordering
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('attempt.attempted_at', 'DESC')
      .getManyAndCount();

    // Fix: AuthAttempt NO tiene user_id (tabla de auditoría independiente)
    const auditLogs: AuditLogDto[] = data.map((attempt) => ({
      id: attempt.id,
      // user_id no existe en auth_attempts - es tabla de auditoría independiente
      email: attempt.email,
      ip_address: attempt.ip_address,
      user_agent: attempt.user_agent,
      success: attempt.success,
      failure_reason: attempt.failure_reason,
      attempted_at: attempt.attempted_at,
    }));

    return {
      data: auditLogs,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Update system configuration
   */
  async updateSystemConfig(
    updateDto: UpdateSystemConfigDto,
    adminId: string,
  ): Promise<SystemConfigDto> {
    // Update in-memory config (in production, save to database or Redis)
    systemConfig = {
      ...systemConfig,
      ...updateDto,
      updated_at: new Date().toISOString(),
      updated_by: adminId,
    };

    return systemConfig;
  }

  /**
   * Get current system configuration
   */
  async getSystemConfig(): Promise<SystemConfigDto> {
    return systemConfig;
  }

  /**
   * Toggle maintenance mode
   */
  async toggleMaintenance(
    toggleDto: ToggleMaintenanceDto,
    adminId: string,
  ): Promise<MaintenanceStatusDto> {
    // Update maintenance mode
    systemConfig.maintenance_mode = toggleDto.enabled;

    // Update message if provided
    if (toggleDto.message) {
      systemConfig.maintenance_message = toggleDto.message;
    }

    // Update metadata
    systemConfig.updated_at = new Date().toISOString();
    systemConfig.updated_by = adminId;

    // Return status
    return {
      maintenance_mode: systemConfig.maintenance_mode,
      maintenance_message: systemConfig.maintenance_message || '',
      updated_at: systemConfig.updated_at,
      updated_by: systemConfig.updated_by || undefined,
    };
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private async checkDatabaseHealth(): Promise<DatabaseHealthDto> {
    try {
      const startTime = Date.now();

      // Try a simple query
      await this.authConnection.query('SELECT 1');

      const responseTime = Date.now() - startTime;

      // Get connection pool info (if available)
      const driver = this.authConnection.driver as any;
      const poolSize = driver?.master?.poolSize || undefined;
      const activeConnections = driver?.master?.activeCount || undefined;

      return {
        status: responseTime < 100 ? 'healthy' : 'degraded',
        response_time_ms: responseTime,
        pool_size: poolSize,
        active_connections: activeConnections,
      };
    } catch (error) {
      return {
        status: 'down',
        response_time_ms: -1,
      };
    }
  }
}
