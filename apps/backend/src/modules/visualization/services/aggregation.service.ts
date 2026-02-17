/**
 * Aggregation Service
 *
 * Provides data aggregation capabilities for visualization.
 * Supports various aggregation types and time-based grouping.
 *
 * @module visualization/services
 * @sprint 4 - EXT-005 Visualizations
 * @created 2026-02-03
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  AggregationType,
  TimeGranularity,
  AggregationDataPoint,
  ComparativeMetric,
} from '../interfaces';
import {
  AggregationQueryDto,
  AggregationResponseDto,
  KPIRequestDto,
  KPIResponseDto,
} from '../dto';

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  /**
   * Execute aggregation query
   */
  async aggregate(dto: AggregationQueryDto): Promise<AggregationResponseDto> {
    const startTime = Date.now();
    this.logger.log(`Executing aggregation: ${dto.aggregation} on ${dto.metric}`);

    // Build and execute query (simulated)
    const data = await this.executeAggregation(dto);

    const queryTime = Date.now() - startTime;

    return {
      data: data.map((d) => ({
        dimensions: d.dimensions,
        value: d.value,
        timeBucket: d.timeBucket,
      })),
      totalRecords: data.length,
      queryTime,
      cacheHit: false,
    };
  }

  /**
   * Get KPI value with comparison
   */
  async getKPI(dto: KPIRequestDto): Promise<KPIResponseDto> {
    this.logger.log(`Getting KPI: ${dto.metric} for ${dto.entityType}/${dto.entityId}`);

    // Simulate KPI calculation
    const currentValue = this.simulateKPIValue(dto.metric);
    const previousValue = dto.comparePrevious
      ? this.simulateKPIValue(dto.metric) * 0.9
      : undefined;

    const change =
      previousValue !== undefined ? currentValue - previousValue : undefined;
    const changePercent =
      previousValue !== undefined && previousValue !== 0
        ? (change! / previousValue) * 100
        : undefined;
    const trend =
      change !== undefined
        ? change > 0
          ? 'up'
          : change < 0
            ? 'down'
            : 'stable'
        : undefined;

    return {
      metric: dto.metric,
      currentValue,
      previousValue,
      change,
      changePercent:
        changePercent !== undefined
          ? Math.round(changePercent * 100) / 100
          : undefined,
      trend,
      unit: this.getMetricUnit(dto.metric),
      formattedValue: this.formatValue(currentValue, dto.metric),
    };
  }

  /**
   * Calculate comparative metrics between periods
   */
  async getComparativeMetrics(
    metric: string,
    currentPeriod: { start: Date; end: Date },
    previousPeriod: { start: Date; end: Date },
  ): Promise<ComparativeMetric> {
    const current = this.simulateKPIValue(metric);
    const previous = this.simulateKPIValue(metric) * (0.8 + Math.random() * 0.4);
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

    return {
      current,
      previous,
      change,
      changePercent,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    };
  }

  // ==================== Private Methods ====================

  private async executeAggregation(
    dto: AggregationQueryDto,
  ): Promise<AggregationDataPoint[]> {
    const limit = dto.limit || 100;
    const results: AggregationDataPoint[] = [];

    if (dto.timeGranularity) {
      // Time-series aggregation
      const buckets = this.generateTimeBuckets(dto.timeGranularity, limit);
      for (const bucket of buckets) {
        results.push({
          dimensions: dto.groupBy ? this.generateDimensions(dto.groupBy) : {},
          value: this.calculateAggregation(
            dto.aggregation,
            this.generateRandomValues(100),
          ),
          timeBucket: bucket,
        });
      }
    } else if (dto.groupBy && dto.groupBy.length > 0) {
      // Group by aggregation
      const groups = Math.min(limit, 20);
      for (let i = 0; i < groups; i++) {
        results.push({
          dimensions: this.generateDimensions(dto.groupBy, i),
          value: this.calculateAggregation(
            dto.aggregation,
            this.generateRandomValues(100),
          ),
        });
      }
    } else {
      // Simple aggregation
      results.push({
        dimensions: {},
        value: this.calculateAggregation(
          dto.aggregation,
          this.generateRandomValues(1000),
        ),
      });
    }

    return results;
  }

  private calculateAggregation(type: AggregationType, values: number[]): number {
    if (values.length === 0) return 0;

    switch (type) {
      case AggregationType.SUM:
        return values.reduce((a, b) => a + b, 0);
      case AggregationType.AVG:
        return values.reduce((a, b) => a + b, 0) / values.length;
      case AggregationType.COUNT:
        return values.length;
      case AggregationType.MIN:
        return Math.min(...values);
      case AggregationType.MAX:
        return Math.max(...values);
      case AggregationType.MEDIAN: {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;
      }
      case AggregationType.STDDEV: {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
        return Math.sqrt(
          squaredDiffs.reduce((a, b) => a + b, 0) / values.length,
        );
      }
      case AggregationType.VARIANCE: {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return (
          values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length
        );
      }
      default:
        return values.reduce((a, b) => a + b, 0);
    }
  }

  private generateTimeBuckets(granularity: TimeGranularity, count: number): Date[] {
    const buckets: Date[] = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      switch (granularity) {
        case TimeGranularity.HOUR:
          date.setHours(date.getHours() - i);
          break;
        case TimeGranularity.DAY:
          date.setDate(date.getDate() - i);
          break;
        case TimeGranularity.WEEK:
          date.setDate(date.getDate() - i * 7);
          break;
        case TimeGranularity.MONTH:
          date.setMonth(date.getMonth() - i);
          break;
        case TimeGranularity.QUARTER:
          date.setMonth(date.getMonth() - i * 3);
          break;
        case TimeGranularity.YEAR:
          date.setFullYear(date.getFullYear() - i);
          break;
      }
      buckets.push(date);
    }

    return buckets;
  }

  private generateDimensions(
    groupBy: string[],
    index?: number,
  ): Record<string, unknown> {
    const dimensions: Record<string, unknown> = {};
    groupBy.forEach((field) => {
      dimensions[field] =
        index !== undefined ? `${field}_${index}` : `${field}_value`;
    });
    return dimensions;
  }

  private generateRandomValues(count: number): number[] {
    return Array.from({ length: count }, () => Math.random() * 100);
  }

  private simulateKPIValue(metric: string): number {
    // Simulate realistic KPI values based on metric type
    const baseValues: Record<string, number> = {
      totalStudents: 250,
      activeUsers: 180,
      completionRate: 75,
      averageScore: 82,
      engagementRate: 68,
      retentionRate: 92,
      dailyActiveUsers: 145,
      weeklyActiveUsers: 220,
      totalExercises: 1250,
      pointsAwarded: 45000,
    };

    const base = baseValues[metric] || 50;
    const variance = base * 0.1;
    return Math.round((base + (Math.random() - 0.5) * variance) * 100) / 100;
  }

  private getMetricUnit(metric: string): string {
    const units: Record<string, string> = {
      totalStudents: 'students',
      activeUsers: 'users',
      completionRate: '%',
      averageScore: 'points',
      engagementRate: '%',
      retentionRate: '%',
      dailyActiveUsers: 'users',
      weeklyActiveUsers: 'users',
      totalExercises: 'exercises',
      pointsAwarded: 'points',
    };
    return units[metric] || 'units';
  }

  private formatValue(value: number, metric: string): string {
    const unit = this.getMetricUnit(metric);
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  }
}
