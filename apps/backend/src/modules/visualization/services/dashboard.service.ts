/**
 * Dashboard Service
 *
 * Manages dashboard configurations, layouts, and widget orchestration.
 * Provides APIs for creating, reading, updating dashboards and fetching widget data.
 *
 * @module visualization/services
 * @sprint 4 - EXT-005 Visualizations
 * @created 2026-02-03
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  DashboardConfig,
  DashboardLayout,
  DashboardScope,
  WidgetConfig,
  WidgetData,
  WidgetType,
  DateRange,
} from '../interfaces';
import {
  GetDashboardDto,
  GetWidgetDataDto,
  ListDashboardsDto,
  CreateDashboardDto,
  UpdateDashboardDto,
  DashboardResponseDto,
  DashboardSnapshotResponseDto,
  DashboardListResponseDto,
  WidgetDataResponseDto,
} from '../dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  // In-memory store for dashboards (in production, use TypeORM repository)
  private readonly dashboards: Map<string, DashboardConfig> = new Map();
  private readonly widgetDataCache: Map<string, WidgetData> = new Map();

  constructor() {
    // Initialize with default dashboards
    this.initializeDefaultDashboards();
  }

  /**
   * Get dashboard by ID with optional data
   */
  async getDashboard(dto: GetDashboardDto): Promise<DashboardSnapshotResponseDto> {
    const startTime = Date.now();
    this.logger.log(`Getting dashboard: ${dto.dashboardId}`);

    const dashboard = this.dashboards.get(dto.dashboardId);
    if (!dashboard) {
      throw new NotFoundException(`Dashboard ${dto.dashboardId} not found`);
    }

    // Apply filters if provided
    const effectiveDateRange = dto.dateRange
      ? { start: new Date(dto.dateRange.start), end: new Date(dto.dateRange.end) }
      : this.getDefaultDateRange();

    // Fetch widget data if requested
    let widgetData: WidgetDataResponseDto[] = [];
    if (dto.includeData) {
      widgetData = await this.fetchAllWidgetData(
        dashboard,
        effectiveDateRange,
        dto.filters,
      );
    }

    const generationTime = Date.now() - startTime;

    return {
      dashboardId: dashboard.id,
      dashboard: this.mapToResponseDto(dashboard),
      widgetData,
      generatedAt: new Date(),
      generationTime,
    };
  }

  /**
   * Get widget data
   */
  async getWidgetData(dto: GetWidgetDataDto): Promise<WidgetDataResponseDto> {
    this.logger.log(`Getting widget data: ${dto.widgetId}`);

    // Check cache first
    const cacheKey = this.getCacheKey(dto);
    if (!dto.forceRefresh && this.widgetDataCache.has(cacheKey)) {
      const cached = this.widgetDataCache.get(cacheKey)!;
      return {
        widgetId: dto.widgetId,
        data: cached.data,
        updatedAt: cached.updatedAt,
        cacheHit: true,
      };
    }

    // Generate widget data based on widget type
    const data = await this.generateWidgetData(dto);
    const updatedAt = new Date();

    // Cache the result
    this.widgetDataCache.set(cacheKey, {
      widgetId: dto.widgetId,
      data,
      updatedAt,
      cacheHit: false,
    });

    return {
      widgetId: dto.widgetId,
      data,
      updatedAt,
      cacheHit: false,
    };
  }

  /**
   * List dashboards with filters and pagination
   */
  async listDashboards(dto: ListDashboardsDto): Promise<DashboardListResponseDto> {
    let dashboards = Array.from(this.dashboards.values());

    // Filter by scope
    if (dto.scope) {
      dashboards = dashboards.filter((d) => d.scope === dto.scope);
    }

    // Search by name
    if (dto.search) {
      const searchLower = dto.search.toLowerCase();
      dashboards = dashboards.filter(
        (d) =>
          d.name.toLowerCase().includes(searchLower) ||
          d.description?.toLowerCase().includes(searchLower),
      );
    }

    // Pagination
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const total = dashboards.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedDashboards = dashboards.slice(startIndex, startIndex + limit);

    return {
      items: paginatedDashboards.map((d) => this.mapToResponseDto(d)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Create new dashboard
   */
  async createDashboard(
    dto: CreateDashboardDto,
    userId: string,
  ): Promise<DashboardResponseDto> {
    const id = this.generateId();
    const now = new Date();

    const layout: DashboardLayout = {
      id: this.generateId(),
      name: dto.name,
      scope: dto.scope,
      columns: dto.columns || 12,
      rowHeight: 60,
      widgets: dto.templateId ? this.getTemplateWidgets(dto.templateId) : [],
      isDefault: false,
      isCustomizable: true,
    };

    const dashboard: DashboardConfig = {
      id,
      name: dto.name,
      description: dto.description,
      scope: dto.scope,
      layout,
      createdAt: now,
      updatedAt: now,
    };

    this.dashboards.set(id, dashboard);
    this.logger.log(`Created dashboard: ${id} by user ${userId}`);

    return this.mapToResponseDto(dashboard);
  }

  /**
   * Update existing dashboard
   */
  async updateDashboard(
    id: string,
    dto: UpdateDashboardDto,
  ): Promise<DashboardResponseDto> {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) {
      throw new NotFoundException(`Dashboard ${id} not found`);
    }

    if (dto.name) dashboard.name = dto.name;
    if (dto.description !== undefined) dashboard.description = dto.description;
    if (dto.refreshInterval) dashboard.refreshInterval = dto.refreshInterval;
    dashboard.updatedAt = new Date();

    this.dashboards.set(id, dashboard);
    this.logger.log(`Updated dashboard: ${id}`);

    return this.mapToResponseDto(dashboard);
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(id: string): Promise<void> {
    if (!this.dashboards.has(id)) {
      throw new NotFoundException(`Dashboard ${id} not found`);
    }
    this.dashboards.delete(id);
    this.logger.log(`Deleted dashboard: ${id}`);
  }

  /**
   * Get available dashboard templates
   */
  async getTemplates(scope?: DashboardScope): Promise<DashboardLayout[]> {
    const templates = this.getDefaultTemplates();
    if (scope) {
      return templates.filter((t) => t.scope === scope);
    }
    return templates;
  }

  // ==================== Private Methods ====================

  private initializeDefaultDashboards(): void {
    const templates = this.getDefaultTemplates();
    templates.forEach((template) => {
      const id = this.generateId();
      const now = new Date();
      this.dashboards.set(id, {
        id,
        name: template.name,
        description: `Default ${template.scope} dashboard`,
        scope: template.scope,
        layout: template,
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  private getDefaultTemplates(): DashboardLayout[] {
    return [
      this.createStudentDashboardTemplate(),
      this.createTeacherDashboardTemplate(),
      this.createAdminDashboardTemplate(),
    ];
  }

  private createStudentDashboardTemplate(): DashboardLayout {
    return {
      id: 'template-student-default',
      name: 'Student Dashboard',
      scope: DashboardScope.STUDENT,
      columns: 12,
      rowHeight: 60,
      widgets: [
        {
          id: 'w1',
          type: WidgetType.KPI,
          title: 'Overall Progress',
          position: { x: 0, y: 0, width: 3, height: 2 },
          dataSource: { type: 'api', endpoint: '/api/students/me/progress' },
        },
        {
          id: 'w2',
          type: WidgetType.KPI,
          title: 'Points Earned',
          position: { x: 3, y: 0, width: 3, height: 2 },
          dataSource: { type: 'api', endpoint: '/api/gamification/me/points' },
        },
        {
          id: 'w3',
          type: WidgetType.KPI,
          title: 'Current Streak',
          position: { x: 6, y: 0, width: 3, height: 2 },
          dataSource: { type: 'api', endpoint: '/api/gamification/me/streak' },
        },
        {
          id: 'w4',
          type: WidgetType.KPI,
          title: 'Rank',
          position: { x: 9, y: 0, width: 3, height: 2 },
          dataSource: { type: 'api', endpoint: '/api/gamification/me/rank' },
        },
        {
          id: 'w5',
          type: WidgetType.CHART,
          title: 'Progress Over Time',
          position: { x: 0, y: 2, width: 8, height: 4 },
          dataSource: { type: 'api', endpoint: '/api/charts/student/progress' },
          settings: { chartType: 'line' },
        },
        {
          id: 'w6',
          type: WidgetType.LEADERBOARD,
          title: 'Class Leaderboard',
          position: { x: 8, y: 2, width: 4, height: 4 },
          dataSource: { type: 'api', endpoint: '/api/gamification/leaderboard' },
        },
        {
          id: 'w7',
          type: WidgetType.LIST,
          title: 'Pending Assignments',
          position: { x: 0, y: 6, width: 6, height: 3 },
          dataSource: { type: 'api', endpoint: '/api/assignments/pending' },
        },
        {
          id: 'w8',
          type: WidgetType.PROGRESS,
          title: 'Subject Progress',
          position: { x: 6, y: 6, width: 6, height: 3 },
          dataSource: { type: 'api', endpoint: '/api/students/me/subjects' },
        },
      ],
      isDefault: true,
      isCustomizable: true,
    };
  }

  private createTeacherDashboardTemplate(): DashboardLayout {
    return {
      id: 'template-teacher-default',
      name: 'Teacher Dashboard',
      scope: DashboardScope.TEACHER,
      columns: 12,
      rowHeight: 60,
      widgets: [
        {
          id: 'w1',
          type: WidgetType.KPI,
          title: 'Total Students',
          position: { x: 0, y: 0, width: 3, height: 2 },
          dataSource: { type: 'api', endpoint: '/api/teacher/stats/students' },
        },
        {
          id: 'w2',
          type: WidgetType.KPI,
          title: 'Avg Completion Rate',
          position: { x: 3, y: 0, width: 3, height: 2 },
          dataSource: { type: 'api', endpoint: '/api/teacher/stats/completion' },
        },
        {
          id: 'w3',
          type: WidgetType.KPI,
          title: 'Active Assignments',
          position: { x: 6, y: 0, width: 3, height: 2 },
          dataSource: { type: 'api', endpoint: '/api/teacher/stats/assignments' },
        },
        {
          id: 'w4',
          type: WidgetType.KPI,
          title: 'At-Risk Students',
          position: { x: 9, y: 0, width: 3, height: 2 },
          dataSource: { type: 'api', endpoint: '/api/teacher/stats/at-risk' },
        },
        {
          id: 'w5',
          type: WidgetType.CHART,
          title: 'Class Performance',
          position: { x: 0, y: 2, width: 6, height: 4 },
          dataSource: { type: 'api', endpoint: '/api/charts/teacher/performance' },
          settings: { chartType: 'bar' },
        },
        {
          id: 'w6',
          type: WidgetType.CHART,
          title: 'Engagement Heatmap',
          position: { x: 6, y: 2, width: 6, height: 4 },
          dataSource: { type: 'api', endpoint: '/api/charts/teacher/engagement' },
          settings: { chartType: 'heatmap' },
        },
        {
          id: 'w7',
          type: WidgetType.TABLE,
          title: 'Student Progress',
          position: { x: 0, y: 6, width: 12, height: 4 },
          dataSource: { type: 'api', endpoint: '/api/teacher/students/progress' },
        },
      ],
      isDefault: true,
      isCustomizable: true,
    };
  }

  private createAdminDashboardTemplate(): DashboardLayout {
    return {
      id: 'template-admin-default',
      name: 'Admin Dashboard',
      scope: DashboardScope.ADMIN,
      columns: 12,
      rowHeight: 60,
      widgets: [
        {
          id: 'w1',
          type: WidgetType.KPI,
          title: 'Total Users',
          position: { x: 0, y: 0, width: 3, height: 2 },
          dataSource: { type: 'api', endpoint: '/api/admin/stats/users' },
        },
        {
          id: 'w2',
          type: WidgetType.KPI,
          title: 'Active Today',
          position: { x: 3, y: 0, width: 3, height: 2 },
          dataSource: { type: 'api', endpoint: '/api/admin/stats/active' },
        },
        {
          id: 'w3',
          type: WidgetType.KPI,
          title: 'Completion Rate',
          position: { x: 6, y: 0, width: 3, height: 2 },
          dataSource: { type: 'api', endpoint: '/api/admin/stats/completion' },
        },
        {
          id: 'w4',
          type: WidgetType.KPI,
          title: 'System Health',
          position: { x: 9, y: 0, width: 3, height: 2 },
          dataSource: { type: 'api', endpoint: '/api/admin/stats/health' },
        },
        {
          id: 'w5',
          type: WidgetType.CHART,
          title: 'Daily Active Users',
          position: { x: 0, y: 2, width: 8, height: 4 },
          dataSource: { type: 'api', endpoint: '/api/charts/admin/dau' },
          settings: { chartType: 'line' },
        },
        {
          id: 'w6',
          type: WidgetType.CHART,
          title: 'User Distribution',
          position: { x: 8, y: 2, width: 4, height: 4 },
          dataSource: { type: 'api', endpoint: '/api/charts/admin/users' },
          settings: { chartType: 'pie' },
        },
        {
          id: 'w7',
          type: WidgetType.ALERT,
          title: 'System Alerts',
          position: { x: 0, y: 6, width: 6, height: 3 },
          dataSource: { type: 'api', endpoint: '/api/admin/alerts' },
        },
        {
          id: 'w8',
          type: WidgetType.TABLE,
          title: 'Recent Activity',
          position: { x: 6, y: 6, width: 6, height: 3 },
          dataSource: { type: 'api', endpoint: '/api/admin/activity' },
        },
      ],
      isDefault: true,
      isCustomizable: true,
    };
  }

  private getTemplateWidgets(templateId: string): WidgetConfig[] {
    const templates = this.getDefaultTemplates();
    const template = templates.find((t) => t.id === templateId);
    return template?.widgets || [];
  }

  private async fetchAllWidgetData(
    dashboard: DashboardConfig,
    dateRange: DateRange,
    filters?: { field: string; value: unknown }[],
  ): Promise<WidgetDataResponseDto[]> {
    const results: WidgetDataResponseDto[] = [];

    for (const widget of dashboard.layout.widgets) {
      try {
        const data = await this.getWidgetData({
          widgetId: widget.id,
          dateRange: {
            start: dateRange.start.toISOString(),
            end: dateRange.end.toISOString(),
          },
          filters,
        });
        results.push(data);
      } catch (error) {
        this.logger.error(`Failed to fetch data for widget ${widget.id}:`, error);
        results.push({
          widgetId: widget.id,
          data: null,
          updatedAt: new Date(),
          cacheHit: false,
        });
      }
    }

    return results;
  }

  private async generateWidgetData(dto: GetWidgetDataDto): Promise<unknown> {
    // Simulate data generation based on widget ID
    // In production, this would query actual data sources
    return {
      value: Math.floor(Math.random() * 100),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      change: (Math.random() * 20 - 10).toFixed(2),
    };
  }

  private getCacheKey(dto: GetWidgetDataDto): string {
    return `${dto.widgetId}:${JSON.stringify(dto.dateRange)}:${JSON.stringify(dto.filters)}`;
  }

  private getDefaultDateRange(): DateRange {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end, preset: 'last30days' };
  }

  private mapToResponseDto(config: DashboardConfig): DashboardResponseDto {
    return {
      id: config.id,
      name: config.name,
      description: config.description,
      scope: config.scope,
      layout: {
        id: config.layout.id,
        name: config.layout.name,
        scope: config.layout.scope,
        columns: config.layout.columns,
        rowHeight: config.layout.rowHeight,
        widgets: config.layout.widgets.map((w) => ({
          id: w.id,
          type: w.type,
          title: w.title,
          position: w.position,
          refreshInterval: w.refreshInterval,
        })),
        isDefault: config.layout.isDefault || false,
        isCustomizable: config.layout.isCustomizable !== false,
      },
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
