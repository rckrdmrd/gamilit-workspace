/**
 * Report Service
 *
 * Manages report generation, scheduling, and export functionality.
 * Supports PDF, Excel, CSV, and other formats.
 *
 * @module visualization/services
 * @sprint 4 - EXT-005 Visualizations
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ReportFormat,
  ReportType,
  ReportStatus,
  ReportTemplate,
  ReportJob,
} from '../interfaces';
import {
  GenerateReportDto,
  GetReportStatusDto,
  ListReportTemplatesDto,
  ScheduleReportDto,
  ReportTemplateResponseDto,
  ReportTemplateListResponseDto,
  ReportJobResponseDto,
  ReportResultResponseDto,
  ScheduledReportResponseDto,
} from '../dto';

interface ScheduledReport {
  id: string;
  templateId: string;
  templateName: string;
  format: ReportFormat;
  schedule: string;
  filters?: Record<string, unknown>;
  recipients: string[];
  isActive: boolean;
  nextRunAt: Date;
  lastRunAt?: Date;
  createdBy: string;
}

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  // In-memory stores (in production, use database)
  private readonly templates: Map<string, ReportTemplate> = new Map();
  private readonly jobs: Map<string, ReportJob> = new Map();
  private readonly scheduledReports: Map<string, ScheduledReport> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Generate a report
   */
  async generateReport(
    dto: GenerateReportDto,
    userId: string,
  ): Promise<ReportJobResponseDto> {
    const template = this.templates.get(dto.templateId);
    if (!template) {
      throw new NotFoundException(`Template ${dto.templateId} not found`);
    }

    if (!template.availableFormats.includes(dto.format)) {
      throw new BadRequestException(
        `Format ${dto.format} not available for this template`,
      );
    }

    const jobId = this.generateId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const job: ReportJob = {
      id: jobId,
      request: {
        templateId: dto.templateId,
        format: dto.format,
        filters: dto.filters,
        dateRange: dto.dateRange
          ? {
              start: new Date(dto.dateRange.start),
              end: new Date(dto.dateRange.end),
            }
          : undefined,
        entityIds: dto.entityIds,
        title: dto.title,
        includeCharts: dto.includeCharts,
        locale: dto.locale || 'es-MX',
        timezone: dto.timezone || 'America/Mexico_City',
      },
      status: ReportStatus.PENDING,
      progress: 0,
      createdAt: now,
      expiresAt,
      requestedBy: userId,
    };

    this.jobs.set(jobId, job);

    // Start async generation
    this.processReportJob(jobId);

    return this.mapJobToResponse(job);
  }

  /**
   * Get report job status
   */
  async getReportStatus(dto: GetReportStatusDto): Promise<ReportJobResponseDto> {
    const job = this.jobs.get(dto.jobId);
    if (!job) {
      throw new NotFoundException(`Report job ${dto.jobId} not found`);
    }
    return this.mapJobToResponse(job);
  }

  /**
   * Download completed report
   */
  async downloadReport(jobId: string): Promise<ReportResultResponseDto> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Report job ${jobId} not found`);
    }

    if (job.status !== ReportStatus.COMPLETED) {
      throw new BadRequestException(
        `Report is not ready. Status: ${job.status}`,
      );
    }

    return {
      jobId: job.id,
      success: true,
      fileUrl: job.fileUrl,
      fileName: this.generateFileName(job),
      fileSize: job.fileSize,
      format: job.request.format,
      generationTime: job.completedAt
        ? job.completedAt.getTime() - job.createdAt.getTime()
        : 0,
    };
  }

  /**
   * List available report templates
   */
  async listTemplates(
    dto: ListReportTemplatesDto,
  ): Promise<ReportTemplateListResponseDto> {
    let templates = Array.from(this.templates.values());

    if (dto.type) {
      templates = templates.filter((t) => t.type === dto.type);
    }

    if (dto.search) {
      const searchLower = dto.search.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower),
      );
    }

    return {
      items: templates.map((t) => this.mapTemplateToResponse(t)),
      total: templates.length,
    };
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<ReportTemplateResponseDto> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new NotFoundException(`Template ${templateId} not found`);
    }
    return this.mapTemplateToResponse(template);
  }

  /**
   * Schedule a recurring report
   */
  async scheduleReport(
    dto: ScheduleReportDto,
    userId: string,
  ): Promise<ScheduledReportResponseDto> {
    const template = this.templates.get(dto.templateId);
    if (!template) {
      throw new NotFoundException(`Template ${dto.templateId} not found`);
    }

    const id = this.generateId();
    const nextRunAt = this.calculateNextRun(dto.schedule);

    const scheduled: ScheduledReport = {
      id,
      templateId: dto.templateId,
      templateName: template.name,
      format: dto.format,
      schedule: dto.schedule,
      filters: dto.filters,
      recipients: dto.recipients || [],
      isActive: dto.isActive !== false,
      nextRunAt,
      createdBy: userId,
    };

    this.scheduledReports.set(id, scheduled);
    this.logger.log(`Scheduled report ${id} for ${dto.schedule}`);

    return {
      id: scheduled.id,
      templateId: scheduled.templateId,
      templateName: scheduled.templateName,
      format: scheduled.format,
      schedule: scheduled.schedule,
      nextRunAt: scheduled.nextRunAt,
      lastRunAt: scheduled.lastRunAt,
      isActive: scheduled.isActive,
      recipients: scheduled.recipients,
    };
  }

  /**
   * List scheduled reports
   */
  async listScheduledReports(userId: string): Promise<ScheduledReportResponseDto[]> {
    const reports = Array.from(this.scheduledReports.values()).filter(
      (r) => r.createdBy === userId || r.recipients.includes(userId),
    );

    return reports.map((r) => ({
      id: r.id,
      templateId: r.templateId,
      templateName: r.templateName,
      format: r.format,
      schedule: r.schedule,
      nextRunAt: r.nextRunAt,
      lastRunAt: r.lastRunAt,
      isActive: r.isActive,
      recipients: r.recipients,
    }));
  }

  /**
   * Cancel scheduled report
   */
  async cancelScheduledReport(id: string): Promise<void> {
    if (!this.scheduledReports.has(id)) {
      throw new NotFoundException(`Scheduled report ${id} not found`);
    }
    this.scheduledReports.delete(id);
    this.logger.log(`Cancelled scheduled report ${id}`);
  }

  // ==================== Private Methods ====================

  private initializeDefaultTemplates(): void {
    const templates: ReportTemplate[] = [
      {
        id: 'student-progress-report',
        name: 'Student Progress Report',
        type: ReportType.STUDENT_PROGRESS,
        description:
          'Detailed report of student progress including scores, completion rates, and time spent',
        availableFormats: [
          ReportFormat.PDF,
          ReportFormat.EXCEL,
          ReportFormat.CSV,
        ],
        sections: [
          { id: 's1', title: 'Summary', type: 'header', order: 0 },
          {
            id: 's2',
            title: 'Progress Overview',
            type: 'kpi',
            dataSource: 'student.progress',
            order: 1,
          },
          {
            id: 's3',
            title: 'Progress Chart',
            type: 'chart',
            dataSource: 'student.progressChart',
            order: 2,
          },
          {
            id: 's4',
            title: 'Subject Breakdown',
            type: 'table',
            dataSource: 'student.subjects',
            order: 3,
          },
          {
            id: 's5',
            title: 'Recent Activity',
            type: 'table',
            dataSource: 'student.activity',
            order: 4,
          },
        ],
        defaultFilters: [
          {
            field: 'dateRange',
            label: 'Date Range',
            type: 'daterange',
            required: true,
          },
        ],
      },
      {
        id: 'class-performance-report',
        name: 'Class Performance Report',
        type: ReportType.CLASS_PERFORMANCE,
        description:
          'Overview of classroom performance metrics and student rankings',
        availableFormats: [ReportFormat.PDF, ReportFormat.EXCEL],
        sections: [
          { id: 's1', title: 'Class Overview', type: 'header', order: 0 },
          {
            id: 's2',
            title: 'Performance Metrics',
            type: 'kpi',
            dataSource: 'class.metrics',
            order: 1,
          },
          {
            id: 's3',
            title: 'Performance Distribution',
            type: 'chart',
            dataSource: 'class.distribution',
            order: 2,
          },
          {
            id: 's4',
            title: 'Student Rankings',
            type: 'table',
            dataSource: 'class.rankings',
            order: 3,
          },
          {
            id: 's5',
            title: 'At-Risk Students',
            type: 'table',
            dataSource: 'class.atRisk',
            order: 4,
          },
        ],
        defaultFilters: [
          {
            field: 'classroomId',
            label: 'Classroom',
            type: 'select',
            required: true,
          },
          {
            field: 'dateRange',
            label: 'Date Range',
            type: 'daterange',
            required: false,
          },
        ],
      },
      {
        id: 'engagement-analysis-report',
        name: 'Engagement Analysis Report',
        type: ReportType.ENGAGEMENT_ANALYSIS,
        description: 'Analysis of user engagement patterns and trends',
        availableFormats: [
          ReportFormat.PDF,
          ReportFormat.EXCEL,
          ReportFormat.JSON,
        ],
        sections: [
          { id: 's1', title: 'Engagement Summary', type: 'header', order: 0 },
          {
            id: 's2',
            title: 'Key Metrics',
            type: 'kpi',
            dataSource: 'engagement.kpis',
            order: 1,
          },
          {
            id: 's3',
            title: 'Engagement Heatmap',
            type: 'chart',
            dataSource: 'engagement.heatmap',
            order: 2,
          },
          {
            id: 's4',
            title: 'Trends',
            type: 'chart',
            dataSource: 'engagement.trends',
            order: 3,
          },
          {
            id: 's5',
            title: 'Session Details',
            type: 'table',
            dataSource: 'engagement.sessions',
            order: 4,
          },
        ],
        defaultFilters: [
          {
            field: 'entityType',
            label: 'Entity Type',
            type: 'select',
            options: [
              { value: 'student', label: 'Student' },
              { value: 'classroom', label: 'Classroom' },
              { value: 'organization', label: 'Organization' },
            ],
          },
          {
            field: 'dateRange',
            label: 'Date Range',
            type: 'daterange',
            required: true,
          },
        ],
      },
      {
        id: 'gamification-summary-report',
        name: 'Gamification Summary Report',
        type: ReportType.GAMIFICATION_SUMMARY,
        description:
          'Summary of gamification metrics including points, achievements, and leaderboards',
        availableFormats: [ReportFormat.PDF, ReportFormat.EXCEL],
        sections: [
          {
            id: 's1',
            title: 'Gamification Overview',
            type: 'header',
            order: 0,
          },
          {
            id: 's2',
            title: 'Points Summary',
            type: 'kpi',
            dataSource: 'gamification.points',
            order: 1,
          },
          {
            id: 's3',
            title: 'Achievement Distribution',
            type: 'chart',
            dataSource: 'gamification.achievements',
            order: 2,
          },
          {
            id: 's4',
            title: 'Leaderboard',
            type: 'table',
            dataSource: 'gamification.leaderboard',
            order: 3,
          },
          {
            id: 's5',
            title: 'Badges Earned',
            type: 'table',
            dataSource: 'gamification.badges',
            order: 4,
          },
        ],
        defaultFilters: [
          {
            field: 'dateRange',
            label: 'Date Range',
            type: 'daterange',
            required: true,
          },
        ],
      },
      {
        id: 'organization-metrics-report',
        name: 'Organization Metrics Report',
        type: ReportType.ORGANIZATION_METRICS,
        description: 'Comprehensive metrics for organization administrators',
        availableFormats: [
          ReportFormat.PDF,
          ReportFormat.EXCEL,
          ReportFormat.CSV,
        ],
        sections: [
          {
            id: 's1',
            title: 'Organization Overview',
            type: 'header',
            order: 0,
          },
          {
            id: 's2',
            title: 'User Statistics',
            type: 'kpi',
            dataSource: 'org.users',
            order: 1,
          },
          {
            id: 's3',
            title: 'Activity Trends',
            type: 'chart',
            dataSource: 'org.activity',
            order: 2,
          },
          {
            id: 's4',
            title: 'Classroom Comparison',
            type: 'chart',
            dataSource: 'org.classrooms',
            order: 3,
          },
          {
            id: 's5',
            title: 'Content Usage',
            type: 'table',
            dataSource: 'org.content',
            order: 4,
          },
          {
            id: 's6',
            title: 'Teacher Activity',
            type: 'table',
            dataSource: 'org.teachers',
            order: 5,
          },
        ],
        defaultFilters: [
          {
            field: 'dateRange',
            label: 'Date Range',
            type: 'daterange',
            required: true,
          },
        ],
        permissions: ['admin', 'org_admin'],
      },
    ];

    templates.forEach((t) => this.templates.set(t.id, t));
  }

  private async processReportJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      // Update status to generating
      job.status = ReportStatus.GENERATING;
      job.progress = 0;
      this.jobs.set(jobId, job);

      // Simulate report generation with progress updates
      const steps = 5;
      for (let i = 1; i <= steps; i++) {
        await this.delay(500); // Simulate processing time
        job.progress = Math.round((i / steps) * 100);
        this.jobs.set(jobId, job);
      }

      // Mark as completed
      job.status = ReportStatus.COMPLETED;
      job.progress = 100;
      job.completedAt = new Date();
      job.fileUrl = `/api/reports/download/${jobId}`;
      job.fileSize = Math.floor(Math.random() * 500000) + 50000; // 50KB - 550KB

      this.logger.log(`Report ${jobId} completed successfully`);
    } catch (error) {
      job.status = ReportStatus.FAILED;
      job.message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Report ${jobId} failed:`, error);
    }

    this.jobs.set(jobId, job);
  }

  private mapJobToResponse(job: ReportJob): ReportJobResponseDto {
    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      message: job.message,
      fileUrl: job.fileUrl,
      fileSize: job.fileSize,
      format: job.request.format,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      expiresAt: job.expiresAt,
    };
  }

  private mapTemplateToResponse(
    template: ReportTemplate,
  ): ReportTemplateResponseDto {
    return {
      id: template.id,
      name: template.name,
      type: template.type,
      description: template.description,
      availableFormats: template.availableFormats,
      sectionCount: template.sections.length,
      permissions: template.permissions || [],
    };
  }

  private generateFileName(job: ReportJob): string {
    const template = this.templates.get(job.request.templateId);
    const templateName =
      template?.name.toLowerCase().replace(/\s+/g, '-') || 'report';
    const date = job.createdAt.toISOString().split('T')[0];
    const extension = this.getFileExtension(job.request.format);
    return `${templateName}-${date}.${extension}`;
  }

  private getFileExtension(format: ReportFormat): string {
    const extensions: Record<ReportFormat, string> = {
      [ReportFormat.PDF]: 'pdf',
      [ReportFormat.EXCEL]: 'xlsx',
      [ReportFormat.CSV]: 'csv',
      [ReportFormat.JSON]: 'json',
      [ReportFormat.HTML]: 'html',
    };
    return extensions[format] || 'pdf';
  }

  private calculateNextRun(schedule: string): Date {
    // Simple cron-like calculation (in production, use a proper cron library)
    const now = new Date();
    now.setHours(now.getHours() + 1); // Default to 1 hour from now
    return now;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
