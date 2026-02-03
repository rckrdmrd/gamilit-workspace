/**
 * Report Interfaces
 *
 * @description Interfaces for report generation, templates, and job management.
 * Supports various report types for educational analytics and progress tracking.
 *
 * @module visualization/interfaces
 * @version 1.0.0
 * @since Sprint 4 - EXT-005 Visualizations
 */

import { DateRange } from './dashboard.interface';

/**
 * Report Formats
 * @description Available output formats for generated reports
 */
export enum ReportFormat {
  /** PDF document */
  PDF = 'pdf',

  /** Excel spreadsheet */
  EXCEL = 'excel',

  /** CSV file */
  CSV = 'csv',

  /** JSON data */
  JSON = 'json',

  /** HTML document */
  HTML = 'html',
}

/**
 * Report Types
 * @description Predefined report types in the system
 */
export enum ReportType {
  /** Individual student progress report */
  STUDENT_PROGRESS = 'student_progress',

  /** Class/cohort performance report */
  CLASS_PERFORMANCE = 'class_performance',

  /** Engagement analysis report */
  ENGAGEMENT_ANALYSIS = 'engagement_analysis',

  /** Gamification summary (points, badges, etc.) */
  GAMIFICATION_SUMMARY = 'gamification_summary',

  /** Teacher activity report */
  TEACHER_ACTIVITY = 'teacher_activity',

  /** Organization-wide metrics */
  ORGANIZATION_METRICS = 'organization_metrics',

  /** Attendance report */
  ATTENDANCE = 'attendance',

  /** Achievement/badge report */
  ACHIEVEMENT_REPORT = 'achievement_report',

  /** Comparative analysis report */
  COMPARISON = 'comparison',

  /** User-defined custom report */
  CUSTOM = 'custom',
}

/**
 * Report Status
 * @description Current state of a report generation job
 */
export enum ReportStatus {
  /** Job queued but not started */
  PENDING = 'pending',

  /** Report is being generated */
  GENERATING = 'generating',

  /** Report generated successfully */
  COMPLETED = 'completed',

  /** Report generation failed */
  FAILED = 'failed',

  /** Report file has expired */
  EXPIRED = 'expired',
}

/**
 * Report Section
 * @description A single section within a report template
 */
export interface ReportSection {
  /** Unique section identifier */
  id: string;

  /** Section title */
  title: string;

  /** Section content type */
  type: 'header' | 'text' | 'table' | 'chart' | 'kpi' | 'spacer' | 'pagebreak';

  /** Data source key for this section */
  dataSource?: string;

  /** Type-specific configuration */
  config?: Record<string, unknown>;

  /** Display order */
  order: number;
}

/**
 * Report Filter
 * @description User-configurable filter for report generation
 */
export interface ReportFilter {
  /** Field to filter */
  field: string;

  /** Display label */
  label: string;

  /** Filter input type */
  type: 'text' | 'number' | 'date' | 'daterange' | 'select' | 'multiselect' | 'boolean';

  /** Whether filter is required */
  required?: boolean;

  /** Default filter value */
  defaultValue?: unknown;

  /** Available options (for select types) */
  options?: { value: string; label: string }[];
}

/**
 * Report Template
 * @description Reusable template for generating reports
 */
export interface ReportTemplate {
  /** Unique template identifier */
  id: string;

  /** Template name */
  name: string;

  /** Report type */
  type: ReportType;

  /** Template description */
  description?: string;

  /** Formats this template supports */
  availableFormats: ReportFormat[];

  /** Report sections */
  sections: ReportSection[];

  /** Default filters for this template */
  defaultFilters?: ReportFilter[];

  /** Required permissions to use this template */
  permissions?: string[];
}

/**
 * Report Request
 * @description Request to generate a report
 */
export interface ReportRequest {
  /** Template to use */
  templateId: string;

  /** Desired output format */
  format: ReportFormat;

  /** Filter values */
  filters?: Record<string, unknown>;

  /** Date range for data */
  dateRange?: DateRange;

  /** Specific entity IDs to include */
  entityIds?: string[];

  /** Custom report title (overrides template) */
  title?: string;

  /** Whether to include charts in report */
  includeCharts?: boolean;

  /** Locale for formatting */
  locale?: string;

  /** Timezone for date display */
  timezone?: string;
}

/**
 * Report Job
 * @description A report generation job with status tracking
 */
export interface ReportJob {
  /** Unique job identifier */
  id: string;

  /** Original request */
  request: ReportRequest;

  /** Current job status */
  status: ReportStatus;

  /** Generation progress (0-100) */
  progress: number;

  /** Status message or error */
  message?: string;

  /** URL to download generated file */
  fileUrl?: string;

  /** Generated file size in bytes */
  fileSize?: number;

  /** When job was created */
  createdAt: Date;

  /** When job completed (success or failure) */
  completedAt?: Date;

  /** When generated file expires */
  expiresAt?: Date;

  /** User who requested the report */
  requestedBy: string;
}

/**
 * Report Result
 * @description Final result of a completed report job
 */
export interface ReportResult {
  /** Job identifier */
  jobId: string;

  /** Whether generation succeeded */
  success: boolean;

  /** URL to download file */
  fileUrl?: string;

  /** Generated file name */
  fileName?: string;

  /** File size in bytes */
  fileSize?: number;

  /** Output format */
  format: ReportFormat;

  /** Time taken to generate in milliseconds */
  generationTime: number;

  /** Error message if failed */
  error?: string;
}

// Re-export DateRange for convenience
export { DateRange };
