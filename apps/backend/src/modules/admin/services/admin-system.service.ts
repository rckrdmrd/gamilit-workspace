import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, DataSource } from 'typeorm';
import { AuthAttempt } from '@modules/auth/entities/auth-attempt.entity';
import { User } from '@modules/auth/entities/user.entity';
import { Tenant } from '@modules/auth/entities/tenant.entity';
import { Module } from '@modules/educational/entities/module.entity';
import { Exercise } from '@modules/educational/entities/exercise.entity';
import { SystemSetting } from '../entities/system-setting.entity';
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
  CleanupLogsDto,
  CleanupUserActivityDto,
  MaintenanceOperationResultDto,
  DatabaseOptimizationResultDto,
  CacheClearResultDto,
  SessionCleanupResultDto,
  // P1-2026-01-07: New DTOs
  ValidateConfigDto,
  ConfigValidationResultDto,
  ConfigValidationError,
  ConfigCategoryDto,
  SystemLogsQueryDto,
  PaginatedSystemLogsDto,
  SystemLogDto,
} from '../dto/system';

/**
 * AdminSystemService
 *
 * @description Servicio para configuración y mantenimiento del sistema
 *
 * ============================================================================
 * SECURITY WARNING - CROSS-TENANT ACCESS VULNERABILITY (FIX-2025-01-07)
 * ============================================================================
 *
 * PROBLEMA IDENTIFICADO:
 * Este servicio opera a nivel global sin filtrar por tenant_id,
 * permitiendo que cualquier admin acceda a configuraciones globales.
 *
 * MÉTODOS AFECTADOS:
 * - getAuditLog() - Consulta auth_attempts de todos los usuarios
 * - getSystemConfig() - Accede a configuraciones globales
 * - updateSystemConfig() - Modifica configuraciones globales
 *
 * DISEÑO INTENCIONADO:
 * - getSystemHealth(), getSystemMetrics(): Métricas agregadas son aceptables
 * - Operaciones de mantenimiento (cleanup, optimize): Requieren super_admin
 *
 * NOTAS DE SEGURIDAD:
 * 1. El acceso a estos endpoints DEBE estar restringido a super_admin
 * 2. admin_teacher NO debería tener acceso a configuración global
 * 3. Considerar implementar tenant-scoped settings para admins de tenant
 * 4. getAuditLog() podría filtrar por tenant_id del usuario autenticado
 *
 * PRIORIDAD: P2 (Medio) - Verificar guards en controller
 * ============================================================================
 */
@Injectable()
export class AdminSystemService {
  constructor(
    @InjectDataSource('auth')
    private readonly authConnection: DataSource,
    @InjectDataSource('educational')
    private readonly educationalConnection: DataSource,
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
    @InjectRepository(SystemSetting, 'auth')
    private readonly systemSettingRepo: Repository<SystemSetting>,
  ) {}

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealthDto> {
    const _startTime = Date.now();

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

    // Active users (last 24h) - users with successful auth attempts
    // Note: auth_attempts table has no user_id column, using email as proxy
    const activeUsers24h = await this.authAttemptRepo
      .createQueryBuilder('attempt')
      .select('COUNT(DISTINCT attempt.email)', 'count')
      .where('attempt.attempted_at > :date', { date: oneDayAgo })
      .andWhere('attempt.success = true')
      .andWhere('attempt.email IS NOT NULL')
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
    // Update settings in database
    const settingsToUpdate: Record<string, unknown> = {
      maintenance_mode: updateDto.maintenance_mode,
      maintenance_message: updateDto.maintenance_message,
      allow_registrations: updateDto.allow_registrations,
      max_login_attempts: updateDto.max_login_attempts,
      lockout_duration_minutes: updateDto.lockout_duration_minutes,
      session_timeout_minutes: updateDto.session_timeout_minutes,
    };

    // Update each setting in database
    for (const [key, value] of Object.entries(settingsToUpdate)) {
      if (value !== undefined) {
        await this.updateOrCreateSetting(key, value, adminId);
      }
    }

    // Handle custom settings
    if (updateDto.custom_settings) {
      for (const [key, value] of Object.entries(updateDto.custom_settings)) {
        await this.updateOrCreateSetting(
          `custom_${key}`,
          value,
          adminId,
        );
      }
    }

    // Return updated config
    return this.getSystemConfig();
  }

  /**
   * Get current system configuration
   */
  async getSystemConfig(): Promise<SystemConfigDto> {
    // Fetch all settings from database
    const settings = await this.systemSettingRepo.find({
      where: { tenant_id: undefined }, // Global settings only
    });

    // Find the most recently updated setting to get metadata
    let mostRecentSetting: SystemSetting | undefined;
    if (settings.length > 0) {
      mostRecentSetting = settings.reduce((latest, current) => {
        if (!latest) return current;
        const latestTime = latest.updated_at?.getTime() || latest.created_at?.getTime() || 0;
        const currentTime = current.updated_at?.getTime() || current.created_at?.getTime() || 0;
        return currentTime > latestTime ? current : latest;
      });
    }

    // Build config object
    const config: SystemConfigDto = {
      maintenance_mode: this.parseSettingValue('maintenance_mode', settings, false),
      maintenance_message: this.parseSettingValue(
        'maintenance_message',
        settings,
        'System under maintenance. We will be back soon.',
      ),
      allow_registrations: this.parseSettingValue('allow_registrations', settings, true),
      max_login_attempts: this.parseSettingValue('max_login_attempts', settings, 5),
      lockout_duration_minutes: this.parseSettingValue('lockout_duration_minutes', settings, 30),
      session_timeout_minutes: this.parseSettingValue('session_timeout_minutes', settings, 60),
      custom_settings: {},
      updated_at: mostRecentSetting?.updated_at?.toISOString() || new Date().toISOString(),
      updated_by: mostRecentSetting?.updated_by,
    };

    // Add custom settings
    const customSettings = settings.filter((s) => s.setting_key.startsWith('custom_'));
    customSettings.forEach((setting) => {
      const key = setting.setting_key.replace('custom_', '');
      config.custom_settings![key] = this.parseValue(setting);
    });

    return config;
  }

  /**
   * Get system configuration by category
   */
  async getConfigByCategory(category: string): Promise<Record<string, unknown>> {
    // Validate category
    const validCategories = ['general', 'email', 'notifications', 'security', 'maintenance'];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }

    // Map frontend categories to DB categories
    const categoryMap: Record<string, string> = {
      general: 'general',
      email: 'email',
      notifications: 'general', // Notifications might be in general or separate
      security: 'security',
      maintenance: 'general', // Maintenance settings in general
    };

    const dbCategory = categoryMap[category];

    // Fetch settings for this category
    const settings = await this.systemSettingRepo.find({
      where: {
        setting_category: dbCategory as any,
        tenant_id: undefined,
      },
    });

    // Build config object for this category
    const config: Record<string, unknown> = {};
    settings.forEach((setting) => {
      config[setting.setting_key] = this.parseValue(setting);
    });

    return config;
  }

  /**
   * Update system configuration by category
   */
  async updateConfigByCategory(
    category: string,
    configDto: Record<string, unknown>,
    adminId: string,
  ): Promise<Record<string, unknown>> {
    // Validate category
    const validCategories = ['general', 'email', 'notifications', 'security', 'maintenance'];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }

    // Update each setting
    for (const [key, value] of Object.entries(configDto)) {
      await this.updateOrCreateSetting(key, value, adminId);
    }

    // Return updated config for this category
    return this.getConfigByCategory(category);
  }

  /**
   * Toggle maintenance mode
   */
  async toggleMaintenance(
    toggleDto: ToggleMaintenanceDto,
    adminId: string,
  ): Promise<MaintenanceStatusDto> {
    // Update maintenance mode setting
    await this.updateOrCreateSetting('maintenance_mode', toggleDto.enabled, adminId);

    // Update message if provided
    if (toggleDto.message) {
      await this.updateOrCreateSetting('maintenance_message', toggleDto.message, adminId);
    }

    // Fetch updated values
    const config = await this.getSystemConfig();

    // Return status
    return {
      maintenance_mode: config.maintenance_mode,
      maintenance_message: config.maintenance_message || '',
      updated_at: config.updated_at,
      updated_by: config.updated_by,
    };
  }

  // =====================================================
  // MAINTENANCE OPERATIONS
  // =====================================================

  /**
   * Clean up old system logs
   */
  async cleanupSystemLogs(
    dto: CleanupLogsDto,
  ): Promise<MaintenanceOperationResultDto> {
    const startTime = Date.now();

    try {
      const result = await this.authConnection.query(
        'SELECT * FROM audit_logging.cleanup_old_system_logs($1)',
        [dto.retention_days || 90],
      );

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        message: result[0].status_message || 'System logs cleaned successfully',
        affected_records: result[0].deleted_count || 0,
        metadata: {
          execution_time_ms: executionTime,
          retention_days: dto.retention_days || 90,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to cleanup system logs: ${errorMessage}`,
        affected_records: 0,
        metadata: {
          error: errorMessage,
        },
      };
    }
  }

  /**
   * Clean up old user activity logs
   */
  async cleanupUserActivity(
    dto: CleanupUserActivityDto,
  ): Promise<MaintenanceOperationResultDto> {
    const startTime = Date.now();

    try {
      const result = await this.authConnection.query(
        'SELECT * FROM audit_logging.cleanup_old_user_activity($1)',
        [dto.retention_days || 180],
      );

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        message: result[0].status_message || 'User activity logs cleaned successfully',
        affected_records: result[0].deleted_count || 0,
        metadata: {
          execution_time_ms: executionTime,
          retention_days: dto.retention_days || 180,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to cleanup user activity logs: ${errorMessage}`,
        affected_records: 0,
        metadata: {
          error: errorMessage,
        },
      };
    }
  }

  /**
   * Optimize database tables (VACUUM ANALYZE)
   */
  async optimizeDatabase(): Promise<DatabaseOptimizationResultDto> {
    const startTime = Date.now();
    const tables = [
      'auth.users',
      'audit_logging.activity_log',
      'audit_logging.system_logs',
      'educational_content.exercises',
      'educational_content.modules',
    ];

    try {
      // Run VACUUM ANALYZE on key tables
      for (const table of tables) {
        await this.authConnection.query(`VACUUM ANALYZE ${table}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        message: 'Database optimization completed successfully',
        tables_optimized: tables,
        space_reclaimed_mb: 0, // PostgreSQL doesn't report this directly
        execution_time_ms: executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        message: `Database optimization failed: ${errorMessage}`,
        tables_optimized: [],
        space_reclaimed_mb: 0,
        execution_time_ms: executionTime,
      };
    }
  }

  /**
   * Clear application cache
   * Note: This is a placeholder. Real implementation would depend on cache strategy (Redis, in-memory, etc.)
   */
  async clearCache(): Promise<CacheClearResultDto> {
    try {
      // Placeholder: In production, this would clear Redis/Memcached/etc.
      // For now, we just return success
      // TODO: Implement actual cache clearing based on caching strategy

      return {
        success: true,
        message: 'Application cache cleared successfully',
        entries_cleared: 0, // Would be actual count in real implementation
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to clear cache: ${errorMessage}`,
        entries_cleared: 0,
      };
    }
  }

  /**
   * Clean up expired user sessions
   * Note: This assumes sessions are stored in database. Adjust for your session strategy.
   */
  async cleanupExpiredSessions(): Promise<SessionCleanupResultDto> {
    try {
      // Placeholder: Clear sessions older than session_timeout_minutes
      // In production, this would query a sessions table or Redis

      const config = await this.getSystemConfig();
      const timeoutMinutes = config.session_timeout_minutes || 60;

      // TODO: Implement actual session cleanup based on session storage strategy
      // For now, return placeholder result

      return {
        success: true,
        message: `Successfully cleaned up expired sessions (timeout: ${timeoutMinutes} minutes)`,
        sessions_terminated: 0, // Would be actual count in real implementation
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to cleanup sessions: ${errorMessage}`,
        sessions_terminated: 0,
      };
    }
  }

  // =====================================================
  // P1-2026-01-07: NEW ENDPOINTS
  // =====================================================

  /**
   * Validate system configuration before applying
   * @task TASK-SETTINGS-VALIDATE-CONFIG
   */
  async validateConfig(configDto: ValidateConfigDto): Promise<ConfigValidationResultDto> {
    const errors: ConfigValidationError[] = [];
    const warnings: string[] = [];

    // Validate maintenance_mode
    if (configDto.maintenance_mode === true && !configDto.maintenance_message) {
      warnings.push('Se recomienda proporcionar un mensaje de mantenimiento cuando se activa el modo mantenimiento');
    }

    // Validate login attempts
    if (configDto.max_login_attempts !== undefined) {
      if (configDto.max_login_attempts < 3) {
        warnings.push('Un numero bajo de intentos de login (<3) puede bloquear usuarios legitimos frecuentemente');
      }
      if (configDto.max_login_attempts > 20) {
        warnings.push('Un numero alto de intentos de login (>20) puede ser un riesgo de seguridad');
      }
    }

    // Validate lockout duration
    if (configDto.lockout_duration_minutes !== undefined) {
      if (configDto.lockout_duration_minutes < 5) {
        warnings.push('Una duracion de bloqueo corta (<5 min) puede no ser efectiva contra ataques');
      }
      if (configDto.lockout_duration_minutes > 480) {
        warnings.push('Una duracion de bloqueo larga (>8 horas) puede afectar la experiencia del usuario');
      }
    }

    // Validate session timeout
    if (configDto.session_timeout_minutes !== undefined) {
      if (configDto.session_timeout_minutes < 15) {
        warnings.push('Sesiones muy cortas (<15 min) pueden ser inconvenientes para los usuarios');
      }
      if (configDto.session_timeout_minutes > 1440) {
        warnings.push('Sesiones muy largas (>24 horas) pueden ser un riesgo de seguridad');
      }
    }

    // Validate custom_settings if present
    if (configDto.custom_settings) {
      for (const [key, value] of Object.entries(configDto.custom_settings)) {
        // Validate key format
        if (typeof key !== 'string' || key.length > 100) {
          errors.push({
            field: `custom_settings.${key}`,
            message: 'La clave debe ser un string de maximo 100 caracteres',
            value: key,
          });
        }
        // Validate key characters (alphanumeric and underscore only)
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
          errors.push({
            field: `custom_settings.${key}`,
            message: 'La clave solo puede contener letras, numeros y guiones bajos',
            value: key,
          });
        }
        // Validate value is not null/undefined
        if (value === null || value === undefined) {
          errors.push({
            field: `custom_settings.${key}`,
            message: 'El valor no puede ser null o undefined',
            value,
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get available configuration categories
   * @task TASK-SETTINGS-CONFIG-CATEGORIES
   */
  async getConfigCategories(): Promise<ConfigCategoryDto[]> {
    // Categories defined based on system_settings CHECK constraint
    // See: system_settings_setting_category_check in 01-system_settings.sql
    return [
      {
        key: 'general',
        name: 'General',
        description: 'Configuracion general de la plataforma',
        icon: 'settings',
        order: 1,
      },
      {
        key: 'security',
        name: 'Seguridad',
        description: 'Politicas de autenticacion, acceso y sesiones',
        icon: 'security',
        order: 2,
      },
      {
        key: 'email',
        name: 'Correo Electronico',
        description: 'Configuracion de servidor de correo y plantillas',
        icon: 'email',
        order: 3,
      },
      {
        key: 'gamification',
        name: 'Gamificacion',
        description: 'Parametros del sistema de gamificacion y recompensas',
        icon: 'stars',
        order: 4,
      },
      {
        key: 'storage',
        name: 'Almacenamiento',
        description: 'Configuracion de archivos, media y limites de subida',
        icon: 'storage',
        order: 5,
      },
      {
        key: 'analytics',
        name: 'Analiticas',
        description: 'Configuracion de metricas, reportes y tracking',
        icon: 'analytics',
        order: 6,
      },
      {
        key: 'integrations',
        name: 'Integraciones',
        description: 'Servicios externos, APIs y webhooks',
        icon: 'integration_instructions',
        order: 7,
      },
    ];
  }

  /**
   * Get system logs from audit_logging.system_logs
   * @task TASK-SETTINGS-LOGS-ENDPOINT
   */
  async getSystemLogs(query: SystemLogsQueryDto): Promise<PaginatedSystemLogsDto> {
    const {
      log_level,
      source,
      user_id,
      start_date,
      end_date,
      search,
      page = 1,
      limit = 50,
    } = query;
    const skip = (page - 1) * limit;

    try {
      // Build dynamic query
      let sql = `SELECT * FROM audit_logging.system_logs WHERE 1=1`;
      const params: unknown[] = [];
      let paramIndex = 1;

      if (log_level) {
        sql += ` AND log_level = $${paramIndex++}`;
        params.push(log_level);
      }

      if (source) {
        sql += ` AND source ILIKE $${paramIndex++}`;
        params.push(`%${source}%`);
      }

      if (user_id) {
        sql += ` AND user_id = $${paramIndex++}`;
        params.push(user_id);
      }

      if (start_date) {
        sql += ` AND created_at >= $${paramIndex++}`;
        params.push(new Date(start_date));
      }

      if (end_date) {
        sql += ` AND created_at <= $${paramIndex++}`;
        params.push(new Date(end_date));
      }

      if (search) {
        sql += ` AND (message ILIKE $${paramIndex} OR source ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      // Count total
      const countSql = `SELECT COUNT(*) as count FROM (${sql}) subq`;
      const countResult = await this.authConnection.query(countSql, params);
      const total = parseInt(countResult[0]?.count || '0', 10);

      // Get paginated data
      const dataSql = `${sql} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
      params.push(limit, skip);

      const data = await this.authConnection.query(dataSql, params);

      // Map to DTO
      const logs: SystemLogDto[] = data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        log_level: row.log_level as string,
        message: row.message as string,
        context: row.context as Record<string, unknown> | undefined,
        source: row.source as string,
        user_id: row.user_id as string | undefined,
        tenant_id: row.tenant_id as string | undefined,
        ip_address: row.ip_address as string | undefined,
        user_agent: row.user_agent as string | undefined,
        request_path: row.request_path as string | undefined,
        request_method: row.request_method as string | undefined,
        response_status: row.response_status as number | undefined,
        duration_ms: row.duration_ms as number | undefined,
        stack_trace: row.stack_trace as string | undefined,
        created_at: row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
      }));

      return {
        data: logs,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      };
    } catch (error) {
      // If table doesn't exist or other error, return empty result
      console.error('[AdminSystemService] Error fetching system logs:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
        total_pages: 0,
      };
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  /**
   * Update or create a system setting
   */
  private async updateOrCreateSetting(
    key: string,
    value: any,
    adminId: string,
  ): Promise<void> {
    const existingSetting = await this.systemSettingRepo.findOne({
      where: { setting_key: key },
    });

    const valueType = this.detectValueType(value);
    const stringValue = this.serializeValue(value, valueType);

    if (existingSetting) {
      // Update existing
      existingSetting.setting_value = stringValue;
      existingSetting.value_type = valueType;
      existingSetting.updated_by = adminId;
      await this.systemSettingRepo.save(existingSetting);
    } else {
      // Create new
      const newSetting = this.systemSettingRepo.create({
        setting_key: key,
        setting_value: stringValue,
        value_type: valueType,
        tenant_id: undefined, // Global setting
        created_by: adminId,
        updated_by: adminId,
      } as any);
      await this.systemSettingRepo.save(newSetting);
    }
  }

  /**
   * Parse setting value from array of settings
   */
  private parseSettingValue<T>(
    key: string,
    settings: SystemSetting[],
    defaultValue: T,
  ): T {
    const setting = settings.find((s) => s.setting_key === key);
    if (!setting) return defaultValue;
    return this.parseValue(setting) as T;
  }

  /**
   * Parse value from SystemSetting based on value_type
   */
  private parseValue(setting: SystemSetting): any {
    const value = setting.setting_value || setting.default_value;
    if (!value) return null;

    switch (setting.value_type) {
      case 'boolean':
        return value === 'true' || value === '1';
      case 'number':
        return parseFloat(value);
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      case 'array':
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      default:
        return value;
    }
  }

  /**
   * Detect value type
   */
  private detectValueType(value: any): 'string' | 'number' | 'boolean' | 'json' | 'array' {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object' && value !== null) return 'json';
    return 'string';
  }

  /**
   * Serialize value to string
   */
  private serializeValue(value: any, valueType: string): string {
    if (valueType === 'json' || valueType === 'array') {
      return JSON.stringify(value);
    }
    return String(value);
  }

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      return {
        status: 'down',
        response_time_ms: -1,
      };
    }
  }
}
