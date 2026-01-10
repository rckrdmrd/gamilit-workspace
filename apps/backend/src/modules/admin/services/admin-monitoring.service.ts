import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import * as os from 'os';
import {
  SystemMetricsDto,
  MetricsHistoryDto,
  MetricsHistoryQueryDto,
  MetricDataPoint,
  ErrorStatsDto,
  ErrorStatsQueryDto,
  RecentErrorsDto,
  RecentErrorsQueryDto,
  RecentErrorDto,
  ErrorTrendsDto,
  ErrorTrendsQueryDto,
  ErrorTrendDataPoint,
} from '../dto/monitoring';

/**
 * AdminMonitoringService
 *
 * @description Service for monitoring system metrics and error tracking
 *
 * ============================================================================
 * SECURITY WARNING - CROSS-TENANT ACCESS VULNERABILITY (FIX-2025-01-07)
 * ============================================================================
 *
 * PROBLEMA IDENTIFICADO:
 * Este servicio consulta logs del sistema SIN filtrar por tenant_id,
 * permitiendo que cualquier admin vea logs de TODAS las organizaciones.
 *
 * MÉTODOS AFECTADOS:
 * - getErrorStats() - Consulta logs de todos los tenants
 * - getRecentErrors() - Consulta logs de todos los tenants
 * - getErrorTrends() - Consulta logs de todos los tenants
 *
 * IMPACTO:
 * - Un admin_teacher podría ver errores/logs de otras organizaciones
 * - Exposición de información sensible de otros tenants
 * - Violación del aislamiento multi-tenant
 *
 * SOLUCIÓN RECOMENDADA:
 * 1. Agregar tenantId a todas las consultas de logs
 * 2. Filtrar: WHERE tenant_id = :tenantId (si el log tiene tenant_id)
 * 3. Excepto para super_admin que puede operar cross-tenant por diseño
 *
 * PRIORIDAD: P1 (Alto) - Requiere implementación antes de producción
 * ============================================================================
 *
 * SQL INJECTION FIXES (FIX-2025-01-07) - ALL FIXED:
 * - getErrorStats(): Fixed INTERVAL interpolation with make_interval() [DONE]
 * - getRecentErrors(): Fixed whereClause and LIMIT interpolation with params [DONE]
 * - getErrorTrends(): Fixed DATE_TRUNC whitelist + INTERVAL with make_interval() [DONE]
 * ============================================================================
 *
 * METRICS HISTORY PERSISTENCE (TASK-MONITORING-HISTORY-PERSISTENCE 2026-01-07):
 * - Cron job cada 5 minutos para recolectar metricas del sistema
 * - Almacenamiento en admin_dashboard.metrics_history
 * - Consulta de historial real en getMetricsHistory()
 * ============================================================================
 */
@Injectable()
export class AdminMonitoringService implements OnModuleInit {
  private readonly logger = new Logger(AdminMonitoringService.name);
  private metricsHistoryEnabled = true; // Feature flag for metrics collection

  constructor(
    @InjectDataSource('auth')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Initialize service and verify metrics_history table exists
   */
  async onModuleInit(): Promise<void> {
    try {
      // Verify table exists
      await this.dataSource.query(`
        SELECT 1 FROM admin_dashboard.metrics_history LIMIT 1
      `);
      this.logger.log('Metrics history table verified - collection enabled');
    } catch {
      this.logger.warn(
        'Metrics history table not found - collection disabled. ' +
        'Run DDL script: apps/database/ddl/schemas/admin_dashboard/tables/09-metrics_history.sql'
      );
      this.metricsHistoryEnabled = false;
    }
  }

  /**
   * Cron job: Collect system metrics every 5 minutes
   * Stores metrics in admin_dashboard.metrics_history for historical analysis
   *
   * @task TASK-MONITORING-HISTORY-PERSISTENCE
   * @schedule Every 5 minutes
   */
  @Cron('*/5 * * * *', {
    name: 'collectSystemMetrics',
  })
  async collectAndStoreMetrics(): Promise<void> {
    if (!this.metricsHistoryEnabled) {
      return;
    }

    try {
      const metrics = await this.getSystemMetrics();
      const loadAvg = metrics.cpu.load_average;

      await this.dataSource.query(
        `
        INSERT INTO admin_dashboard.metrics_history (
          recorded_at,
          memory_total_mb,
          memory_used_mb,
          memory_free_mb,
          memory_usage_percent,
          heap_used_mb,
          heap_total_mb,
          cpu_user_ms,
          cpu_system_ms,
          cpu_usage_percent,
          cpu_cores,
          load_average_1m,
          load_average_5m,
          load_average_15m,
          process_uptime_seconds,
          active_handles,
          active_requests,
          system_uptime_seconds,
          node_version,
          platform,
          hostname
        ) VALUES (
          NOW(),
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13,
          $14, $15, $16,
          $17, $18, $19, $20
        )
        ON CONFLICT (recorded_at) DO NOTHING
        `,
        [
          metrics.memory.total_mb,
          metrics.memory.used_mb,
          metrics.memory.free_mb,
          metrics.memory.usage_percent,
          metrics.memory.heap_used_mb,
          metrics.memory.heap_total_mb,
          metrics.cpu.user_ms,
          metrics.cpu.system_ms,
          this.calculateCpuPercentage(
            metrics.cpu.user_ms + metrics.cpu.system_ms,
            metrics.process.uptime_seconds * 1000,
            metrics.cpu.cores,
          ),
          metrics.cpu.cores,
          loadAvg[0] ?? null,
          loadAvg[1] ?? null,
          loadAvg[2] ?? null,
          metrics.process.uptime_seconds,
          metrics.process.active_handles,
          metrics.process.active_requests,
          metrics.system.uptime_seconds,
          metrics.system.node_version,
          metrics.system.platform,
          metrics.system.hostname,
        ],
      );

      this.logger.debug('System metrics collected and stored');
    } catch (error) {
      this.logger.error('Error collecting system metrics', error);
    }
  }

  /**
   * Get current system metrics in real-time
   * Gathers metrics from Node.js process and OS modules
   */
  async getSystemMetrics(): Promise<SystemMetricsDto> {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      return {
        timestamp: new Date().toISOString(),
        memory: {
          total_mb: Math.round((totalMem / 1024 / 1024) * 100) / 100,
          used_mb: Math.round((usedMem / 1024 / 1024) * 100) / 100,
          free_mb: Math.round((freeMem / 1024 / 1024) * 100) / 100,
          usage_percent: Math.round((usedMem / totalMem) * 10000) / 100,
          heap_used_mb: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
          heap_total_mb: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
        },
        cpu: {
          user_ms: Math.round((cpuUsage.user / 1000) * 100) / 100,
          system_ms: Math.round((cpuUsage.system / 1000) * 100) / 100,
          load_average: os.loadavg().map((load) => Math.round(load * 100) / 100),
          cores: os.cpus().length,
        },
        system: {
          platform: os.platform(),
          arch: os.arch(),
          hostname: os.hostname(),
          uptime_seconds: Math.round(os.uptime()),
          node_version: process.version,
        },
        process: {
          pid: process.pid,
          uptime_seconds: Math.round(process.uptime()),
          active_handles: this.getActiveHandles(),
          active_requests: this.getActiveRequests(),
        },
      };
    } catch (error) {
      this.logger.error('Error gathering system metrics', error);
      throw error;
    }
  }

  /**
   * Get metrics history for the last N hours
   * Queries actual historical data from admin_dashboard.metrics_history
   *
   * @task TASK-MONITORING-HISTORY-PERSISTENCE
   * @updated 2026-01-07 - Now queries real historical data
   */
  async getMetricsHistory(query: MetricsHistoryQueryDto): Promise<MetricsHistoryDto> {
    try {
      const hours = query.hours || 24;
      const safeHours = Math.max(1, Math.min(Math.floor(hours), 168)); // Max 7 days

      // If historical tracking is disabled, return current metrics only
      if (!this.metricsHistoryEnabled) {
        const currentMetrics = await this.getSystemMetrics();
        const dataPoint: MetricDataPoint = {
          timestamp: currentMetrics.timestamp,
          memory_usage_percent: currentMetrics.memory.usage_percent,
          cpu_usage_percent: this.calculateCpuPercentage(
            currentMetrics.cpu.user_ms + currentMetrics.cpu.system_ms,
            currentMetrics.process.uptime_seconds * 1000,
            currentMetrics.cpu.cores,
          ),
          active_requests: currentMetrics.process.active_requests,
        };

        return {
          historical_tracking_enabled: false,
          data_points: [dataPoint],
          note: `Historical metrics table not available. Showing current metrics only. Run DDL: apps/database/ddl/schemas/admin_dashboard/tables/09-metrics_history.sql`,
        };
      }

      // Query historical data from metrics_history table
      const result = await this.dataSource.query(
        `
        SELECT
          recorded_at,
          memory_usage_percent,
          cpu_usage_percent,
          active_requests
        FROM admin_dashboard.metrics_history
        WHERE recorded_at >= NOW() - make_interval(hours => $1)
        ORDER BY recorded_at ASC
        `,
        [safeHours],
      );

      // If no historical data, add current metrics as fallback
      if (result.length === 0) {
        const currentMetrics = await this.getSystemMetrics();
        const dataPoint: MetricDataPoint = {
          timestamp: currentMetrics.timestamp,
          memory_usage_percent: currentMetrics.memory.usage_percent,
          cpu_usage_percent: this.calculateCpuPercentage(
            currentMetrics.cpu.user_ms + currentMetrics.cpu.system_ms,
            currentMetrics.process.uptime_seconds * 1000,
            currentMetrics.cpu.cores,
          ),
          active_requests: currentMetrics.process.active_requests,
        };

        return {
          historical_tracking_enabled: true,
          data_points: [dataPoint],
          note: `No historical data available for the last ${hours} hours. Metrics collection started - data will accumulate over time.`,
        };
      }

      // Map database results to MetricDataPoint
      const dataPoints: MetricDataPoint[] = result.map((row: any) => ({
        timestamp: new Date(row.recorded_at).toISOString(),
        memory_usage_percent: parseFloat(row.memory_usage_percent) || 0,
        cpu_usage_percent: parseFloat(row.cpu_usage_percent) || 0,
        active_requests: parseInt(row.active_requests) || 0,
      }));

      return {
        historical_tracking_enabled: true,
        data_points: dataPoints,
      };
    } catch (error) {
      this.logger.error('Error getting metrics history', error);
      throw error;
    }
  }

  /**
   * Get error statistics for the specified time period
   * FIX: Updated column names (created_at instead of timestamp) and uppercase log levels
   * FIX-2025-01-07 P0: Fixed SQL injection by using parameterized query with make_interval()
   */
  async getErrorStats(query: ErrorStatsQueryDto): Promise<ErrorStatsDto> {
    try {
      const hours = query.hours || 24;
      // FIX-2025-01-07 P0: Validate and sanitize hours parameter
      const safeHours = Math.max(1, Math.min(Math.floor(hours), 168)); // Max 7 days

      // FIX-2025-01-07 P0: Use parameterized query with make_interval()
      const result = await this.dataSource.query(
        `
        SELECT
          COUNT(*)::int as total_errors,
          COUNT(DISTINCT DATE(created_at))::int as days_with_errors,
          COUNT(CASE WHEN log_level = 'FATAL' THEN 1 END)::int as fatal_errors,
          COUNT(CASE WHEN log_level = 'ERROR' THEN 1 END)::int as error_level_errors,
          MIN(created_at) as first_error_at,
          MAX(created_at) as last_error_at
        FROM audit_logging.system_logs
        WHERE log_level IN ('ERROR', 'FATAL')
          AND created_at >= NOW() - make_interval(hours => $1)
        `,
        [safeHours],
      );

      const row = result[0];

      return {
        total_errors: parseInt(row.total_errors) || 0,
        days_with_errors: parseInt(row.days_with_errors) || 0,
        fatal_errors: parseInt(row.fatal_errors) || 0,
        error_level_errors: parseInt(row.error_level_errors) || 0,
        first_error_at: row.first_error_at ? new Date(row.first_error_at).toISOString() : null,
        last_error_at: row.last_error_at ? new Date(row.last_error_at).toISOString() : null,
        time_period_hours: hours,
      };
    } catch (error) {
      this.logger.error('Error getting error statistics', error);
      throw error;
    }
  }

  /**
   * Get recent errors with details
   * FIX: Updated column names and uppercase log levels
   * FIX-2025-01-07 P0: Fixed SQL injection by using parameterized queries
   */
  async getRecentErrors(query: RecentErrorsQueryDto): Promise<RecentErrorsDto> {
    try {
      const limit = query.limit || 20;
      const level = query.level || 'all';

      // FIX-2025-01-07 P0: Validate and sanitize limit parameter
      const safeLimit = Math.max(1, Math.min(Math.floor(limit), 100)); // Max 100

      // FIX-2025-01-07 P0: Validate level against whitelist instead of string interpolation
      const validLevels = ['error', 'fatal', 'all'];
      const safeLevel = validLevels.includes(level.toLowerCase()) ? level.toLowerCase() : 'all';

      // FIX-2025-01-07 P0: Use parameterized query with conditional logic
      let result;
      if (safeLevel === 'all') {
        result = await this.dataSource.query(
          `
          SELECT
            sl.id,
            sl.log_level,
            sl.message,
            sl.extra_data as context,
            sl.module_name as source,
            sl.created_at as timestamp,
            sl.user_id,
            p.display_name as user_name
          FROM audit_logging.system_logs sl
          LEFT JOIN auth_management.profiles p ON sl.user_id = p.id
          WHERE sl.log_level IN ('ERROR', 'FATAL')
          ORDER BY sl.created_at DESC
          LIMIT $1
          `,
          [safeLimit],
        );
      } else {
        result = await this.dataSource.query(
          `
          SELECT
            sl.id,
            sl.log_level,
            sl.message,
            sl.extra_data as context,
            sl.module_name as source,
            sl.created_at as timestamp,
            sl.user_id,
            p.display_name as user_name
          FROM audit_logging.system_logs sl
          LEFT JOIN auth_management.profiles p ON sl.user_id = p.id
          WHERE sl.log_level = $1
          ORDER BY sl.created_at DESC
          LIMIT $2
          `,
          [safeLevel.toUpperCase(), safeLimit],
        );
      }

      const errors: RecentErrorDto[] = result.map((row: any) => ({
        id: row.id,
        log_level: row.log_level,
        message: row.message,
        context: row.context,
        source: row.source,
        timestamp: new Date(row.timestamp).toISOString(),
        user_id: row.user_id,
        user_name: row.user_name,
      }));

      return {
        errors,
        total_count: errors.length,
      };
    } catch (error) {
      this.logger.error('Error getting recent errors', error);
      throw error;
    }
  }

  /**
   * Get error trends over time with time bucketing
   * FIX: Updated column names and uppercase log levels
   * FIX-2025-01-07 P0: Fixed SQL injection by using whitelist validation and parameterized query
   */
  async getErrorTrends(query: ErrorTrendsQueryDto): Promise<ErrorTrendsDto> {
    try {
      const hours = query.hours || 24;
      const groupBy = query.group_by || 'hour';

      // FIX-2025-01-07 P0: Validate and sanitize hours parameter
      const safeHours = Math.max(1, Math.min(Math.floor(hours), 168)); // Max 7 days

      // FIX-2025-01-07 P0: Whitelist validation for groupBy to prevent SQL injection
      const validGroupBy = ['hour', 'day', 'week', 'month'] as const;
      const safeGroupBy = validGroupBy.includes(groupBy as typeof validGroupBy[number])
        ? groupBy
        : 'hour';

      // FIX-2025-01-07 P0: Use parameterized query with make_interval()
      // Note: DATE_TRUNC requires a literal string for the precision argument,
      // so we use validated whitelist approach (safeGroupBy is guaranteed to be one of 4 values)
      const result = await this.dataSource.query(
        `
        SELECT
          DATE_TRUNC('${safeGroupBy}', created_at) as time_bucket,
          COUNT(*)::int as error_count,
          COUNT(CASE WHEN log_level = 'FATAL' THEN 1 END)::int as fatal_count,
          COUNT(CASE WHEN log_level = 'ERROR' THEN 1 END)::int as error_count_level,
          COUNT(DISTINCT module_name)::int as unique_sources
        FROM audit_logging.system_logs
        WHERE log_level IN ('ERROR', 'FATAL')
          AND created_at >= NOW() - make_interval(hours => $1)
        GROUP BY time_bucket
        ORDER BY time_bucket DESC
        `,
        [safeHours],
      );

      const trends: ErrorTrendDataPoint[] = result.map((row: any) => ({
        time_bucket: new Date(row.time_bucket).toISOString(),
        error_count: parseInt(row.error_count) || 0,
        fatal_count: parseInt(row.fatal_count) || 0,
        error_count_level: parseInt(row.error_count_level) || 0,
        unique_sources: parseInt(row.unique_sources) || 0,
      }));

      return {
        trends,
        group_by: groupBy,
        time_period_hours: hours,
      };
    } catch (error) {
      this.logger.error('Error getting error trends', error);
      throw error;
    }
  }

  /**
   * Helper to get active handles count
   * @private
   */
  private getActiveHandles(): number {
    try {
      const processAny = process as any;
      if (typeof processAny._getActiveHandles === 'function') {
        return processAny._getActiveHandles()?.length || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Helper to get active requests count
   * @private
   */
  private getActiveRequests(): number {
    try {
      const processAny = process as any;
      if (typeof processAny._getActiveRequests === 'function') {
        return processAny._getActiveRequests()?.length || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Calculate CPU usage percentage
   * @private
   */
  private calculateCpuPercentage(cpuTimeMs: number, uptimeMs: number, cores: number): number {
    if (uptimeMs === 0) return 0;
    // CPU time used / (uptime * cores) * 100
    const percentage = (cpuTimeMs / (uptimeMs * cores)) * 100;
    return Math.round(percentage * 100) / 100;
  }
}
