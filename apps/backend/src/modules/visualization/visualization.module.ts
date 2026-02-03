/**
 * Visualization Module
 *
 * @description Visualization module for GAMILIT platform.
 * Provides dashboards, charts, reports, and data aggregation.
 *
 * Features:
 * - Dashboards (Sprint 4.1)
 *   - Configurable layouts
 *   - Multiple widget types
 *   - Scope-based templates (Student, Teacher, Admin)
 *
 * - Charts (Sprint 4.2)
 *   - Line, Bar, Pie, Radar, Scatter, Heatmap
 *   - Time-series support
 *   - Customizable options
 *
 * - Reports (Sprint 4.3)
 *   - PDF, Excel, CSV export
 *   - Template-based generation
 *   - Scheduled reports
 *
 * - Aggregation (Sprint 4.4)
 *   - Multiple aggregation types
 *   - Time granularity support
 *   - KPI calculations
 *
 * @module visualization
 * @sprint 4 - EXT-005 Visualizations
 * @created 2026-02-03
 */

import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

// Controllers
import {
  DashboardController,
  ChartController,
  ReportController,
  AggregationController,
} from './controllers';

// Services
import {
  DashboardService,
  ChartService,
  ReportService,
  AggregationService,
} from './services';

@Module({
  imports: [
    // Cache module for dashboards and charts
    CacheModule.register({
      ttl: 60000, // Default 60 seconds
      max: 500,
    }),
  ],
  controllers: [
    // Dashboard Controller
    DashboardController,

    // Chart Controller
    ChartController,

    // Report Controller
    ReportController,

    // Aggregation Controller
    AggregationController,
  ],
  providers: [
    // Dashboard Service
    DashboardService,

    // Chart Service
    ChartService,

    // Report Service
    ReportService,

    // Aggregation Service
    AggregationService,
  ],
  exports: [
    // Export services for use by other modules
    DashboardService,
    ChartService,
    ReportService,
    AggregationService,
  ],
})
export class VisualizationModule {}
