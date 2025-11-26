import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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
 * Service for monitoring system metrics and error tracking
 */
@Injectable()
export class AdminMonitoringService {
  private readonly logger = new Logger(AdminMonitoringService.name);

  constructor(
    @InjectDataSource('auth')
    private readonly dataSource: DataSource,
  ) {}

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
   * Note: Historical tracking is not currently enabled, returns current metrics only
   */
  async getMetricsHistory(query: MetricsHistoryQueryDto): Promise<MetricsHistoryDto> {
    try {
      const hours = query.hours || 24;

      // Get current metrics as a single data point
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
        note: `Historical metrics tracking is not currently enabled. Showing current metrics only. To enable historical tracking, implement a metrics collection service that periodically stores metrics data. Requested period: ${hours} hours.`,
      };
    } catch (error) {
      this.logger.error('Error getting metrics history', error);
      throw error;
    }
  }

  /**
   * Get error statistics for the specified time period
   * FIX: Updated column names (created_at instead of timestamp) and uppercase log levels
   */
  async getErrorStats(query: ErrorStatsQueryDto): Promise<ErrorStatsDto> {
    try {
      const hours = query.hours || 24;

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
          AND created_at >= NOW() - INTERVAL '${hours} hours'
        `,
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
   */
  async getRecentErrors(query: RecentErrorsQueryDto): Promise<RecentErrorsDto> {
    try {
      const limit = query.limit || 20;
      const level = query.level || 'all';

      let whereClause = `sl.log_level IN ('ERROR', 'FATAL')`;
      if (level !== 'all') {
        // Convert to uppercase for comparison
        const upperLevel = level.toUpperCase();
        whereClause = `sl.log_level = '${upperLevel}'`;
      }

      const result = await this.dataSource.query(
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
        WHERE ${whereClause}
        ORDER BY sl.created_at DESC
        LIMIT ${limit}
        `,
      );

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
   */
  async getErrorTrends(query: ErrorTrendsQueryDto): Promise<ErrorTrendsDto> {
    try {
      const hours = query.hours || 24;
      const groupBy = query.group_by || 'hour';

      const result = await this.dataSource.query(
        `
        SELECT
          DATE_TRUNC('${groupBy}', created_at) as time_bucket,
          COUNT(*)::int as error_count,
          COUNT(CASE WHEN log_level = 'FATAL' THEN 1 END)::int as fatal_count,
          COUNT(CASE WHEN log_level = 'ERROR' THEN 1 END)::int as error_count_level,
          COUNT(DISTINCT module_name)::int as unique_sources
        FROM audit_logging.system_logs
        WHERE log_level IN ('ERROR', 'FATAL')
          AND created_at >= NOW() - INTERVAL '${hours} hours'
        GROUP BY time_bucket
        ORDER BY time_bucket DESC
        `,
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
