/**
 * Chart Service
 *
 * Generates chart configurations and data for various visualization types.
 * Supports line, bar, pie, radar, scatter, heatmap and other chart types.
 *
 * @module visualization/services
 * @sprint 4 - EXT-005 Visualizations
 * @created 2026-02-03
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  ChartType,
  ChartConfig,
  ChartData,
  ChartDataset,
  ChartOptions,
  TimeGranularity,
} from '../interfaces';
import {
  GenerateChartDto,
  GetStudentProgressChartDto,
  GetClassComparisonChartDto,
  GetEngagementHeatmapDto,
  ChartRenderResponseDto,
  StudentProgressChartResponseDto,
  ClassComparisonChartResponseDto,
  EngagementHeatmapResponseDto,
  ChartConfigResponseDto,
} from '../dto';

/**
 * Chart color configuration
 */
interface ChartColors {
  primary: string[];
  secondary: string[];
  gradients: {
    blue: string[];
    purple: string[];
    green: string[];
  };
}

@Injectable()
export class ChartService {
  private readonly logger = new Logger(ChartService.name);

  // Color palette for charts
  private readonly colors: ChartColors = {
    primary: ['#4F46E5', '#7C3AED', '#2563EB', '#0891B2', '#059669'],
    secondary: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'],
    gradients: {
      blue: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.2)'],
      purple: ['rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.2)'],
      green: ['rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.2)'],
    },
  };

  /**
   * Generate a chart based on configuration
   */
  async generateChart(dto: GenerateChartDto): Promise<ChartRenderResponseDto> {
    const startTime = Date.now();
    this.logger.log(`Generating ${dto.type} chart for metric: ${dto.metric}`);

    // Generate chart data based on type and metric
    const data = await this.buildChartData(dto);
    const options = this.buildChartOptions(dto);

    const config: ChartConfig = {
      id: this.generateChartId(),
      type: dto.type,
      data,
      options,
      title: dto.title,
    };

    const renderTime = Date.now() - startTime;

    return {
      chartId: config.id,
      config: {
        id: config.id,
        type: config.type,
        data: {
          labels: config.data.labels,
          datasets: config.data.datasets.map((ds) => ({
            label: ds.label,
            data: ds.data as number[],
            backgroundColor: ds.backgroundColor,
            borderColor: ds.borderColor,
          })),
        },
        options: config.options as Record<string, unknown>,
        title: config.title,
      },
      renderTime,
      cacheHit: false,
    };
  }

  /**
   * Get student progress chart
   */
  async getStudentProgressChart(
    dto: GetStudentProgressChartDto,
  ): Promise<StudentProgressChartResponseDto> {
    this.logger.log(`Generating progress charts for student: ${dto.studentId}`);

    // Generate mock data for demonstration
    const progressOverTime = await this.generateProgressLineChart(dto);
    const subjectBreakdown = await this.generateSubjectPieChart(dto);
    const scoreDistribution = await this.generateScoreBarChart(dto);

    return {
      studentId: dto.studentId,
      studentName: 'Student Name', // In production, fetch from database
      charts: [progressOverTime, subjectBreakdown, scoreDistribution],
      summary: {
        overallProgress: 75,
        totalExercises: 120,
        completedExercises: 90,
        averageScore: 82.5,
      },
    };
  }

  /**
   * Get class comparison chart
   */
  async getClassComparisonChart(
    dto: GetClassComparisonChartDto,
  ): Promise<ClassComparisonChartResponseDto> {
    this.logger.log(`Generating comparison chart for classroom: ${dto.classroomId}`);

    const classroomIds = [dto.classroomId, ...(dto.compareWith || [])];
    const labels = classroomIds.map((_, i) => `Class ${i + 1}`);
    const values = classroomIds.map(() => Math.floor(Math.random() * 40) + 60);

    const chartConfig: ChartConfigResponseDto = {
      id: this.generateChartId(),
      type: ChartType.BAR,
      data: {
        labels,
        datasets: [
          {
            label: dto.metric.charAt(0).toUpperCase() + dto.metric.slice(1),
            data: values,
            backgroundColor: this.colors.primary,
            borderColor: this.colors.primary,
          },
        ],
      },
      title: `Class ${dto.metric} Comparison`,
    };

    const rankings = classroomIds
      .map((id, i) => ({
        rank: i + 1,
        classroomId: id,
        classroomName: labels[i],
        value: values[i],
      }))
      .sort((a, b) => b.value - a.value)
      .map((r, i) => ({ ...r, rank: i + 1 }));

    return {
      classroomId: dto.classroomId,
      classroomName: 'Classroom Name',
      chart: chartConfig,
      rankings,
    };
  }

  /**
   * Get engagement heatmap
   */
  async getEngagementHeatmap(
    dto: GetEngagementHeatmapDto,
  ): Promise<EngagementHeatmapResponseDto> {
    this.logger.log(
      `Generating engagement heatmap for entity: ${dto.entityType}/${dto.entityId}`,
    );

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    // Generate heatmap data
    const heatmapData = days.flatMap((day, dayIndex) =>
      hours.map((hour, hourIndex) => ({
        x: hour,
        y: day,
        v: Math.floor(Math.random() * 100),
      })),
    );

    // Find peak engagement
    const maxEngagement = Math.max(...heatmapData.map((d) => d.v));
    const peakData = heatmapData.find((d) => d.v === maxEngagement) || heatmapData[0];

    const chartConfig: ChartConfigResponseDto = {
      id: this.generateChartId(),
      type: ChartType.HEATMAP,
      data: {
        datasets: [
          {
            label: 'Engagement',
            data: heatmapData,
            backgroundColor: this.generateHeatmapColors(heatmapData.map((d) => d.v)),
          },
        ],
      },
      title: 'Engagement Heatmap',
    };

    return {
      chart: chartConfig,
      summary: {
        peakHour: parseInt(peakData.x.split(':')[0]),
        peakDay: peakData.y,
        averageEngagement: Math.round(
          heatmapData.reduce((sum, d) => sum + d.v, 0) / heatmapData.length,
        ),
        totalSessions: heatmapData.reduce((sum, d) => sum + d.v, 0),
      },
    };
  }

  // ==================== Private Methods ====================

  private async buildChartData(dto: GenerateChartDto): Promise<ChartData> {
    const limit = dto.limit || 100;

    // Generate sample data based on chart type
    switch (dto.type) {
      case ChartType.LINE:
        return this.generateLineChartData(dto, limit);
      case ChartType.BAR:
        return this.generateBarChartData(dto, limit);
      case ChartType.PIE:
      case ChartType.DOUGHNUT:
        return this.generatePieChartData(dto, limit);
      case ChartType.RADAR:
        return this.generateRadarChartData(dto);
      case ChartType.SCATTER:
        return this.generateScatterChartData(dto, limit);
      default:
        return this.generateLineChartData(dto, limit);
    }
  }

  private generateLineChartData(dto: GenerateChartDto, limit: number): ChartData {
    const labels = this.generateTimeLabels(
      dto.timeGranularity || TimeGranularity.DAY,
      limit,
    );
    const data = this.generateRandomSeries(limit, 50, 100);

    return {
      labels,
      datasets: [
        {
          label: dto.metric,
          data,
          borderColor: this.colors.primary[0],
          backgroundColor: this.colors.gradients.blue[1],
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }

  private generateBarChartData(dto: GenerateChartDto, limit: number): ChartData {
    const labels = dto.groupBy
      ? dto.groupBy.slice(0, Math.min(limit, 10))
      : this.generateCategoryLabels(Math.min(limit, 10));
    const data = this.generateRandomSeries(labels.length, 20, 100);

    return {
      labels,
      datasets: [
        {
          label: dto.metric,
          data,
          backgroundColor: this.colors.primary.slice(0, labels.length),
          borderColor: this.colors.primary.slice(0, labels.length),
        },
      ],
    };
  }

  private generatePieChartData(dto: GenerateChartDto, limit: number): ChartData {
    const count = Math.min(limit, 6);
    const labels = this.generateCategoryLabels(count);
    const data = this.generateRandomSeries(count, 10, 100);

    return {
      labels,
      datasets: [
        {
          label: dto.metric,
          data,
          backgroundColor: this.colors.primary.slice(0, count),
          borderColor: '#fff',
        },
      ],
    };
  }

  private generateRadarChartData(dto: GenerateChartDto): ChartData {
    const labels = ['Math', 'Science', 'Reading', 'Writing', 'History', 'Art'];
    const data = this.generateRandomSeries(labels.length, 40, 100);

    return {
      labels,
      datasets: [
        {
          label: dto.metric,
          data,
          backgroundColor: this.colors.gradients.purple[1],
          borderColor: this.colors.primary[1],
          fill: true,
        },
      ],
    };
  }

  private generateScatterChartData(dto: GenerateChartDto, limit: number): ChartData {
    const data = Array.from({ length: limit }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));

    return {
      datasets: [
        {
          label: dto.metric,
          data: data as unknown as number[],
          backgroundColor: this.colors.primary[0],
        },
      ],
    };
  }

  private async generateProgressLineChart(
    dto: GetStudentProgressChartDto,
  ): Promise<ChartConfigResponseDto> {
    const labels = this.generateTimeLabels(TimeGranularity.WEEK, 12);
    const data = this.generateTrendingSeries(12, 30, 90);

    return {
      id: this.generateChartId(),
      type: ChartType.LINE,
      data: {
        labels,
        datasets: [
          {
            label: 'Progress %',
            data,
            borderColor: this.colors.primary[0],
            backgroundColor: this.colors.gradients.blue[1],
          },
        ],
      },
      title: 'Progress Over Time',
    };
  }

  private async generateSubjectPieChart(
    dto: GetStudentProgressChartDto,
  ): Promise<ChartConfigResponseDto> {
    const labels = ['Mathematics', 'Science', 'Language', 'History', 'Others'];
    const data = [25, 20, 30, 15, 10];

    return {
      id: this.generateChartId(),
      type: ChartType.DOUGHNUT,
      data: {
        labels,
        datasets: [
          {
            label: 'Time Spent',
            data,
            backgroundColor: this.colors.primary,
          },
        ],
      },
      title: 'Time by Subject',
    };
  }

  private async generateScoreBarChart(
    dto: GetStudentProgressChartDto,
  ): Promise<ChartConfigResponseDto> {
    const labels = ['0-20', '21-40', '41-60', '61-80', '81-100'];
    const data = [5, 10, 25, 35, 25];

    return {
      id: this.generateChartId(),
      type: ChartType.BAR,
      data: {
        labels,
        datasets: [
          {
            label: 'Score Distribution',
            data,
            backgroundColor: this.colors.secondary,
          },
        ],
      },
      title: 'Score Distribution',
    };
  }

  private buildChartOptions(dto: GenerateChartDto): ChartOptions {
    const baseOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      animation: dto.animate !== false,
      plugins: {
        legend: {
          display: dto.showLegend !== false,
          position: 'top',
        },
        title: {
          display: !!dto.title,
          text: dto.title,
        },
      },
    };

    // Add scale options for certain chart types
    if ([ChartType.LINE, ChartType.BAR, ChartType.SCATTER].includes(dto.type)) {
      baseOptions.scales = {
        y: { beginAtZero: true },
      };
    }

    return baseOptions;
  }

  private getDefaultBarOptions(): ChartOptions {
    return {
      responsive: true,
      plugins: {
        legend: { display: true, position: 'top' },
      },
      scales: {
        y: { beginAtZero: true },
      },
    };
  }

  private getHeatmapOptions(): ChartOptions {
    return {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
    };
  }

  private generateHeatmapColors(values: number[]): string[] {
    const max = Math.max(...values);
    return values.map((v) => {
      const intensity = v / max;
      return `rgba(79, 70, 229, ${intensity})`;
    });
  }

  private generateTimeLabels(granularity: TimeGranularity, count: number): string[] {
    const labels: string[] = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      switch (granularity) {
        case TimeGranularity.HOUR:
          date.setHours(date.getHours() - i);
          labels.push(
            date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          );
          break;
        case TimeGranularity.DAY:
          date.setDate(date.getDate() - i);
          labels.push(
            date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
          );
          break;
        case TimeGranularity.WEEK:
          date.setDate(date.getDate() - i * 7);
          labels.push(`Week ${Math.ceil(date.getDate() / 7)}`);
          break;
        case TimeGranularity.MONTH:
          date.setMonth(date.getMonth() - i);
          labels.push(
            date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
          );
          break;
        default:
          date.setDate(date.getDate() - i);
          labels.push(
            date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
          );
      }
    }

    return labels;
  }

  private generateCategoryLabels(count: number): string[] {
    const categories = [
      'Category A',
      'Category B',
      'Category C',
      'Category D',
      'Category E',
      'Category F',
      'Category G',
      'Category H',
      'Category I',
      'Category J',
    ];
    return categories.slice(0, count);
  }

  private generateRandomSeries(count: number, min: number, max: number): number[] {
    return Array.from(
      { length: count },
      () => Math.floor(Math.random() * (max - min + 1)) + min,
    );
  }

  private generateTrendingSeries(
    count: number,
    startMin: number,
    endMax: number,
  ): number[] {
    const step = (endMax - startMin) / count;
    return Array.from({ length: count }, (_, i) => {
      const base = startMin + step * i;
      const variance = (Math.random() - 0.5) * 10;
      return Math.min(endMax, Math.max(startMin, Math.round(base + variance)));
    });
  }

  private generateChartId(): string {
    return `chart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
