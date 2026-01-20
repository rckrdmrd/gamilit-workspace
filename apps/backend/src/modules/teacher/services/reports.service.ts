/**
 * Reports Service
 *
 * Generates PDF and Excel reports with student insights.
 * Persists generated reports to local filesystem and database.
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import * as ExcelJS from 'exceljs';
import puppeteer from 'puppeteer';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { Classroom } from '@/modules/social/entities/classroom.entity';
import { ClassroomMember } from '@/modules/social/entities/classroom-member.entity';
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';
import { AnalyticsService } from './analytics.service';
import { StorageService } from './storage.service';
import { TeacherReportsService } from './teacher-reports.service';
import { StudentInsightsResponseDto, ReportFormat } from '../dto/analytics.dto';
import { GenerateReportDto, ReportType, GeneratedReportMetadataDto } from '../dto/reports.dto';
import { TeacherReportTypeEnum, TeacherReportFormatEnum } from '@shared/constants/enums.constants';
import { v4 as uuidv4 } from 'uuid';

/**
 * Maps API ReportType to database TeacherReportTypeEnum
 * FIX-2026-01-19: Mapping between API types and DB CHECK constraint values
 */
function mapReportTypeToEntity(type: ReportType): TeacherReportTypeEnum {
  const mapping: Record<ReportType, TeacherReportTypeEnum> = {
    [ReportType.USERS]: TeacherReportTypeEnum.INDIVIDUAL,
    [ReportType.PROGRESS]: TeacherReportTypeEnum.PROGRESS,
    [ReportType.GAMIFICATION]: TeacherReportTypeEnum.ANALYTICS,
    [ReportType.SYSTEM]: TeacherReportTypeEnum.ANALYTICS,
    [ReportType.STUDENT_INSIGHTS]: TeacherReportTypeEnum.INDIVIDUAL,
    [ReportType.CLASSROOM_SUMMARY]: TeacherReportTypeEnum.CLASSROOM,
    [ReportType.RISK_ANALYSIS]: TeacherReportTypeEnum.ANALYTICS,
  };
  return mapping[type] ?? TeacherReportTypeEnum.INDIVIDUAL;
}

/**
 * Maps API ReportFormat to database TeacherReportFormatEnum
 * FIX-2026-01-19: Mapping between API formats and DB CHECK constraint values
 */
function mapReportFormatToEntity(format: ReportFormat): TeacherReportFormatEnum {
  const mapping: Record<ReportFormat, TeacherReportFormatEnum> = {
    [ReportFormat.PDF]: TeacherReportFormatEnum.PDF,
    [ReportFormat.EXCEL]: TeacherReportFormatEnum.EXCEL,
    [ReportFormat.CSV]: TeacherReportFormatEnum.CSV,
  };
  return mapping[format] ?? TeacherReportFormatEnum.PDF;
}

interface ReportData {
  metadata: {
    report_id: string;
    type: ReportType;
    format: ReportFormat;
    generated_at: Date;
    generated_by: string;
    start_date?: string;
    end_date?: string;
  };
  insights_summary: {
    total_students: number;
    high_risk: number;
    medium_risk: number;
    low_risk: number;
    avg_overall_score: number;
    avg_completion_rate: number;
    avg_dropout_risk: number;
  };
  student_insights: Array<StudentInsightsResponseDto & { student_name: string; student_id: string }>;
}

/**
 * Service for generating reports with student insights
 */
@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Profile, 'auth')
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Classroom, 'social')
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(ClassroomMember, 'social')
    private readonly classroomMemberRepository: Repository<ClassroomMember>,
    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly submissionRepository: Repository<ExerciseSubmission>,
    private readonly analyticsService: AnalyticsService,
    private readonly storageService: StorageService,
    private readonly teacherReportsService: TeacherReportsService,
  ) { }

  /**
   * Generate report based on request DTO
   * Now persists the report to filesystem and database
   */
  async generateReport(
    dto: GenerateReportDto,
    userId: string,
    tenantId: string,
  ): Promise<{ buffer: Buffer; metadata: GeneratedReportMetadataDto; reportId: string }> {
    // ISS-BE-001: Enabled after installing exceljs and uuid dependencies (2026-01-04)
    this.logger.log(`Generating ${dto.format} report of type ${dto.type} for user ${userId}`);

    // Gather report data
    const reportData = await this.gatherReportData(dto, userId);

    // Generate report based on format
    let buffer: Buffer;
    let fileExtension: string;

    switch (dto.format) {
      case ReportFormat.PDF:
        buffer = await this.generatePDFReport(reportData);
        fileExtension = 'pdf';
        break;
      case ReportFormat.CSV:
        buffer = await this.generateCSVReport(reportData);
        fileExtension = 'csv';
        break;
      case ReportFormat.EXCEL:
      default:
        buffer = await this.generateExcelReport(reportData);
        fileExtension = 'xlsx';
        break;
    }

    // Generate report name
    const reportName = this.generateReportName(dto.type, dto.format);

    // Persist file to storage
    const saveResult = await this.storageService.saveFile(
      buffer,
      `${reportName}.${fileExtension}`,
      userId, // Use teacherId as subdirectory
    );

    // Persist metadata to database
    // FIX-2026-01-19: Use mapping functions for type-safe enum conversion
    const savedReport = await this.teacherReportsService.createReport({
      teacherId: userId,
      tenantId: tenantId,
      reportName: reportName,
      reportType: mapReportTypeToEntity(dto.type),
      reportFormat: mapReportFormatToEntity(dto.format),
      classroomId: dto.classroom_id,
      studentCount: reportData.student_insights.length,
      periodStart: dto.start_date,
      periodEnd: dto.end_date,
      filePath: saveResult.filePath,
      fileSizeBytes: saveResult.fileSizeBytes,
    });

    // Create metadata response
    const metadata: GeneratedReportMetadataDto = {
      report_id: savedReport.id,
      type: reportData.metadata.type,
      format: reportData.metadata.format,
      generated_at: savedReport.generatedAt,
      generated_by: userId,
      student_count: reportData.student_insights.length,
      file_size: saveResult.fileSizeBytes,
    };

    this.logger.log(
      `Report generated and persisted successfully: ${savedReport.id} (${saveResult.fileSizeBytes} bytes, ${metadata.student_count} students)`,
    );

    return { buffer, metadata, reportId: savedReport.id };
  }

  /**
   * Generate a descriptive report name
   */
  private generateReportName(type: ReportType, _format: ReportFormat): string {
    const typeLabels: Record<ReportType, string> = {
      [ReportType.USERS]: 'Reporte-Usuarios',
      [ReportType.PROGRESS]: 'Reporte-Progreso',
      [ReportType.GAMIFICATION]: 'Reporte-Gamificacion',
      [ReportType.SYSTEM]: 'Reporte-Sistema',
      [ReportType.STUDENT_INSIGHTS]: 'Reporte-Insights',
      [ReportType.CLASSROOM_SUMMARY]: 'Reporte-Clase',
      [ReportType.RISK_ANALYSIS]: 'Reporte-Riesgo',
    };

    const dateStr = new Date().toISOString().split('T')[0];
    return `${typeLabels[type] || 'Reporte'}-${dateStr}`;
  }

  /**
   * Gather all data needed for the report
   * TASK-2026-01-18-015: Added temporal filtering support
   */
  private async gatherReportData(dto: GenerateReportDto, userId: string): Promise<ReportData> {
    // ISS-BE-001: Enabled after installing exceljs and uuid dependencies (2026-01-04)
    // Get list of students to include
    let studentIds: string[];

    if (dto.student_ids && dto.student_ids.length > 0) {
      // Use provided student IDs
      studentIds = dto.student_ids;
    } else if (dto.classroom_id) {
      // Get students from classroom
      const members = await this.classroomMemberRepository.find({
        where: { classroom_id: dto.classroom_id, is_active: true },
      });
      studentIds = members.map(m => m.student_id);
    } else {
      // Get all students from teacher's classrooms
      const classrooms = await this.classroomRepository.find({
        where: { teacher_id: userId },
      });
      const classroomIds = classrooms.map(c => c.id);

      const members = await this.classroomMemberRepository.find({
        where: { is_active: true },
      });

      studentIds = members
        .filter(m => classroomIds.includes(m.classroom_id))
        .map(m => m.student_id);
    }

    if (studentIds.length === 0) {
      throw new NotFoundException('No students found for report generation');
    }

    // TASK-2026-01-18-015: Filter students by activity within date range
    let filteredStudentIds = studentIds;
    if (dto.start_date || dto.end_date) {
      this.logger.log(`Applying temporal filter: ${dto.start_date} to ${dto.end_date}`);
      const studentsWithActivity = await this.getStudentsWithActivityInPeriod(
        studentIds,
        dto.start_date,
        dto.end_date,
      );
      filteredStudentIds = studentsWithActivity;
      this.logger.log(`Filtered from ${studentIds.length} to ${filteredStudentIds.length} students with activity in period`);
    }

    if (filteredStudentIds.length === 0) {
      throw new NotFoundException('No students with activity found in the specified period');
    }

    // Get insights for all students
    const insightsPromises = filteredStudentIds.map(async id => {
      try {
        const insights = await this.analyticsService.getStudentInsights(id);
        const student = await this.profileRepository.findOne({ where: { id } });

        return {
          ...insights,
          student_id: id,
          student_name: student?.full_name || student?.display_name || 'Unknown',
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(`Failed to get insights for student ${id}: ${errorMessage}`);
        return null;
      }
    });

    const allInsights = (await Promise.all(insightsPromises)).filter(i => i !== null) as Array<
    StudentInsightsResponseDto & { student_name: string; student_id: string }
    >;

    // Calculate summary statistics
    const highRisk = allInsights.filter(i => i.risk_level === 'high').length;
    const mediumRisk = allInsights.filter(i => i.risk_level === 'medium').length;
    const lowRisk = allInsights.filter(i => i.risk_level === 'low').length;

    const avgOverallScore =
      allInsights.reduce((sum, i) => sum + i.overall_score, 0) / allInsights.length;

    const avgCompletionRate =
      allInsights.reduce((sum, i) => sum + (i.modules_completed / i.modules_total) * 100, 0) /
      allInsights.length;

    const avgDropoutRisk =
      allInsights.reduce((sum, i) => sum + i.predictions.dropout_risk, 0) / allInsights.length;

    // Build report data
    const reportData: ReportData = {
      metadata: {
        report_id: uuidv4(),
        type: dto.type,
        format: dto.format,
        generated_at: new Date(),
        generated_by: userId,
        start_date: dto.start_date,
        end_date: dto.end_date,
      },
      insights_summary: {
        total_students: allInsights.length,
        high_risk: highRisk,
        medium_risk: mediumRisk,
        low_risk: lowRisk,
        avg_overall_score: Math.round(avgOverallScore),
        avg_completion_rate: Math.round(avgCompletionRate),
        avg_dropout_risk: Math.round(avgDropoutRisk * 100),
      },
      student_insights: allInsights.sort((a, b) => {
        // Sort by risk level (high first), then by score (lowest first)
        const riskOrder = { high: 0, medium: 1, low: 2 };
        if (riskOrder[a.risk_level] !== riskOrder[b.risk_level]) {
          return riskOrder[a.risk_level] - riskOrder[b.risk_level];
        }
        return a.overall_score - b.overall_score;
      }),
    };

    return reportData;
  }

  /**
   * Get students who had activity (submissions) within the specified date range
   * TASK-2026-01-18-015: Implements temporal filtering for reports
   *
   * @param studentIds - List of student IDs to check
   * @param startDate - Optional start date (inclusive)
   * @param endDate - Optional end date (inclusive)
   * @returns Array of student IDs who had activity in the period
   */
  private async getStudentsWithActivityInPeriod(
    studentIds: string[],
    startDate?: string,
    endDate?: string,
  ): Promise<string[]> {
    if (studentIds.length === 0) {
      return [];
    }

    // Build query with date filters
    const queryBuilder = this.submissionRepository
      .createQueryBuilder('submission')
      .select('DISTINCT submission.user_id', 'user_id')
      .where('submission.user_id IN (:...studentIds)', { studentIds });

    // Apply date filters
    if (startDate && endDate) {
      queryBuilder.andWhere('submission.submitted_at BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate + 'T23:59:59.999Z'), // Include full end day
      });
    } else if (startDate) {
      queryBuilder.andWhere('submission.submitted_at >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      queryBuilder.andWhere('submission.submitted_at <= :endDate', {
        endDate: new Date(endDate + 'T23:59:59.999Z'),
      });
    }

    const results = await queryBuilder.getRawMany();
    const studentsWithActivity = results.map(r => r.user_id);

    this.logger.debug(
      `Found ${studentsWithActivity.length} students with activity between ${startDate || 'beginning'} and ${endDate || 'now'}`,
    );

    return studentsWithActivity;
  }

  /**
   * Generate PDF report using Puppeteer
   * P0-04: Implemented 2025-12-23
   */
  private async generatePDFReport(reportData: ReportData): Promise<Buffer> {
    this.logger.log('Generating PDF report with Puppeteer...');

    // Generate HTML for the report
    const html = this.generateReportHTML(reportData);

    let browser;
    try {
      // Launch Puppeteer with production-safe settings
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();

      // Set content and wait for styles to load
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF with A4 format
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="font-size: 10px; color: #6b7280; width: 100%; text-align: center; padding: 10px;">
            Página <span class="pageNumber"></span> de <span class="totalPages"></span>
          </div>
        `,
      });

      this.logger.log(`PDF generated successfully: ${pdfBuffer.length} bytes`);
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate PDF with Puppeteer', error);
      // Fallback to HTML if Puppeteer fails
      this.logger.warn('Falling back to HTML output');
      return Buffer.from(html, 'utf-8');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate HTML for PDF report
   */
  private generateReportHTML(reportData: ReportData): string {
    const { metadata, insights_summary, student_insights } = reportData;

    const highRiskStudents = student_insights.filter(i => i.risk_level === 'high');
    const mediumRiskStudents = student_insights.filter(i => i.risk_level === 'medium');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte de Análisis Estudiantil</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1e40af;
      margin: 0;
      font-size: 28px;
    }
    .header .meta {
      color: #6b7280;
      margin-top: 10px;
      font-size: 14px;
    }
    .summary {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .summary h2 {
      margin-top: 0;
      color: #1e40af;
      font-size: 20px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    .summary-card {
      background: white;
      padding: 15px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .summary-card .label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: bold;
      margin-top: 5px;
    }
    .summary-card.high-risk .value { color: #dc2626; }
    .summary-card.medium-risk .value { color: #f59e0b; }
    .summary-card.low-risk .value { color: #10b981; }
    .section {
      margin-bottom: 40px;
    }
    .section h2 {
      color: #1e40af;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
      font-size: 20px;
    }
    .section.alert h2 {
      color: #dc2626;
      border-bottom-color: #dc2626;
    }
    .student-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .student-card.high-risk {
      border-left: 5px solid #dc2626;
      background: #fef2f2;
    }
    .student-card.medium-risk {
      border-left: 5px solid #f59e0b;
      background: #fffbeb;
    }
    .student-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 15px 0;
    }
    .metric {
      font-size: 14px;
    }
    .metric .label {
      color: #6b7280;
      font-size: 12px;
    }
    .metric .value {
      font-weight: bold;
      font-size: 16px;
    }
    .recommendations {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
    }
    .recommendations h4 {
      margin: 0 0 10px 0;
      color: #1e40af;
      font-size: 14px;
    }
    .recommendations ul {
      margin: 0;
      padding-left: 20px;
    }
    .recommendations li {
      margin-bottom: 5px;
      font-size: 13px;
    }
    /* TASK-2026-01-18-015 Sprint 2: Competencies section styles */
    .competencies {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
    }
    .competencies h4 {
      margin: 0 0 10px 0;
      color: #1e40af;
      font-size: 14px;
    }
    .competencies-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .competency-item {
      background: #f9fafb;
      padding: 8px;
      border-radius: 4px;
      text-align: center;
      font-size: 11px;
    }
    .competency-item .name {
      font-weight: bold;
      color: #374151;
      margin-bottom: 4px;
    }
    .competency-item .score {
      font-size: 16px;
      font-weight: bold;
    }
    .competency-item .level {
      font-size: 10px;
      color: #6b7280;
      margin-top: 2px;
    }
    .competency-item.excellent .score { color: #10b981; }
    .competency-item.good .score { color: #3b82f6; }
    .competency-item.average .score { color: #f59e0b; }
    .competency-item.needs-work .score { color: #dc2626; }
    .mastery-summary {
      display: flex;
      gap: 15px;
      margin-top: 10px;
      font-size: 12px;
    }
    .mastery-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .mastery-badge {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: white;
    }
    .mastery-badge.mastered { background: #10b981; }
    .mastery-badge.needs-review { background: #f59e0b; }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Reporte de Análisis Estudiantil</h1>
    <div class="meta">
      Generado: ${metadata.generated_at.toLocaleString('es-ES')}<br>
      ID Reporte: ${metadata.report_id}
    </div>
  </div>

  <div class="summary">
    <h2>Resumen de Insights</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="label">Total Estudiantes</div>
        <div class="value">${insights_summary.total_students}</div>
      </div>
      <div class="summary-card high-risk">
        <div class="label">Alto Riesgo</div>
        <div class="value">${insights_summary.high_risk}</div>
      </div>
      <div class="summary-card medium-risk">
        <div class="label">Medio Riesgo</div>
        <div class="value">${insights_summary.medium_risk}</div>
      </div>
      <div class="summary-card low-risk">
        <div class="label">Bajo Riesgo</div>
        <div class="value">${insights_summary.low_risk}</div>
      </div>
      <div class="summary-card">
        <div class="label">Puntuación Promedio</div>
        <div class="value">${insights_summary.avg_overall_score}%</div>
      </div>
      <div class="summary-card">
        <div class="label">Riesgo Abandono Promedio</div>
        <div class="value">${insights_summary.avg_dropout_risk}%</div>
      </div>
    </div>
  </div>

  ${highRiskStudents.length > 0
        ? `
  <div class="section alert">
    <h2>⚠️ Estudiantes que Requieren Atención Inmediata</h2>
    ${highRiskStudents
          .map(
            student => `
      <div class="student-card high-risk">
        <div class="student-name">${student.student_name}</div>
        <div class="metrics">
          <div class="metric">
            <div class="label">Puntuación General</div>
            <div class="value">${student.overall_score}%</div>
          </div>
          <div class="metric">
            <div class="label">Módulos Completados</div>
            <div class="value">${student.modules_completed}/${student.modules_total}</div>
          </div>
          <div class="metric">
            <div class="label">Riesgo de Abandono</div>
            <div class="value">${Math.round(student.predictions.dropout_risk * 100)}%</div>
          </div>
        </div>
        <div class="recommendations">
          <h4>Recomendaciones:</h4>
          <ul>
            ${student.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
        ${this.generateCompetenciesSection(student)}
      </div>
    `,
          )
          .join('')}
  </div>
  `
        : ''
      }

  ${mediumRiskStudents.length > 0
        ? `
  <div class="section">
    <h2>Estudiantes con Riesgo Moderado</h2>
    ${mediumRiskStudents
          .map(
            student => `
      <div class="student-card medium-risk">
        <div class="student-name">${student.student_name}</div>
        <div class="metrics">
          <div class="metric">
            <div class="label">Puntuación General</div>
            <div class="value">${student.overall_score}%</div>
          </div>
          <div class="metric">
            <div class="label">Módulos Completados</div>
            <div class="value">${student.modules_completed}/${student.modules_total}</div>
          </div>
          <div class="metric">
            <div class="label">Riesgo de Abandono</div>
            <div class="value">${Math.round(student.predictions.dropout_risk * 100)}%</div>
          </div>
        </div>
        <div class="recommendations">
          <h4>Recomendaciones:</h4>
          <ul>
            ${student.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
        ${this.generateCompetenciesSection(student)}
      </div>
    `,
          )
          .join('')}
  </div>
  `
        : ''
      }

  <div class="footer">
    <p>Generado por GAMILIT Platform - Sistema de Análisis Estudiantil</p>
    <p>Este reporte contiene información confidencial. Manéjese con discreción.</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate Excel report
   */
  private async generateExcelReport(reportData: ReportData): Promise<Buffer> {
    // ISS-BE-001: Enabled after installing exceljs dependency (2026-01-04)
    this.logger.log('Generating Excel report...');

    const workbook = new ExcelJS.Workbook();
    const { metadata, insights_summary, student_insights } = reportData;

    // Set workbook properties
    workbook.creator = 'GAMILIT Platform';
    workbook.created = metadata.generated_at;
    workbook.modified = metadata.generated_at;

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Resumen', {
      properties: { tabColor: { argb: 'FF2563EB' } },
    });

    summarySheet.columns = [
      { key: 'metric', width: 30 },
      { key: 'value', width: 20 },
    ];

    // Add header
    summarySheet.addRow(['REPORTE DE ANÁLISIS ESTUDIANTIL', '']);
    summarySheet.mergeCells('A1:B1');
    summarySheet.getRow(1).font = { size: 16, bold: true, color: { argb: 'FF1E40AF' } };
    summarySheet.getRow(1).alignment = { horizontal: 'center' };

    summarySheet.addRow([]);
    summarySheet.addRow(['Generado:', metadata.generated_at.toLocaleString('es-ES')]);
    summarySheet.addRow(['ID Reporte:', metadata.report_id]);
    summarySheet.addRow([]);

    // Add summary data
    summarySheet.addRow(['Métrica', 'Valor']);
    summarySheet.getRow(6).font = { bold: true };
    summarySheet.getRow(6).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };

    summarySheet.addRows([
      ['Total Estudiantes', insights_summary.total_students],
      ['Alto Riesgo', insights_summary.high_risk],
      ['Medio Riesgo', insights_summary.medium_risk],
      ['Bajo Riesgo', insights_summary.low_risk],
      ['Puntuación Promedio', `${insights_summary.avg_overall_score}%`],
      ['Tasa de Completitud Promedio', `${insights_summary.avg_completion_rate}%`],
      ['Riesgo de Abandono Promedio', `${insights_summary.avg_dropout_risk}%`],
    ]);

    // Color code risk rows
    summarySheet.getRow(8).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFEF2F2' },
    };
    summarySheet.getRow(9).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFBEB' },
    };
    summarySheet.getRow(10).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0FDF4' },
    };

    // Sheet 2: Detailed Insights
    const detailSheet = workbook.addWorksheet('Insights Detallados', {
      properties: { tabColor: { argb: 'FF10B981' } },
    });

    detailSheet.columns = [
      { header: 'Estudiante', key: 'name', width: 25 },
      { header: 'Puntuación', key: 'score', width: 12 },
      { header: 'Módulos', key: 'modules', width: 12 },
      { header: 'Nivel de Riesgo', key: 'risk', width: 15 },
      { header: 'Prob. Completitud', key: 'completion_prob', width: 18 },
      { header: 'Riesgo Abandono', key: 'dropout_risk', width: 15 },
      { header: 'Fortalezas', key: 'strengths', width: 40 },
      { header: 'Debilidades', key: 'weaknesses', width: 40 },
      { header: 'Recomendaciones', key: 'recommendations', width: 50 },
    ];

    // Style header row
    detailSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' },
    };
    detailSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Add student data
    student_insights.forEach(insight => {
      detailSheet.addRow({
        name: insight.student_name,
        score: `${insight.overall_score}%`,
        modules: `${insight.modules_completed}/${insight.modules_total}`,
        risk: insight.risk_level.toUpperCase(),
        completion_prob: `${Math.round(insight.predictions.completion_probability * 100)}%`,
        dropout_risk: `${Math.round(insight.predictions.dropout_risk * 100)}%`,
        strengths: insight.strengths.join('; '),
        weaknesses: insight.weaknesses.join('; '),
        recommendations: insight.recommendations.join('; '),
      });
    });

    // Apply conditional formatting to risk column
    detailSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const riskCell = row.getCell('risk');
        if (riskCell.value === 'HIGH') {
          riskCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDC2626' },
          };
          riskCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        } else if (riskCell.value === 'MEDIUM') {
          riskCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF59E0B' },
          };
          riskCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        } else {
          riskCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF10B981' },
          };
          riskCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        }
      }
    });

    // Sheet 3: High Risk Students Only
    const highRiskStudents = student_insights.filter(i => i.risk_level === 'high');
    if (highRiskStudents.length > 0) {
      const alertSheet = workbook.addWorksheet('Atención Inmediata', {
        properties: { tabColor: { argb: 'FFDC2626' } },
      });

      alertSheet.columns = [
        { header: 'Estudiante', key: 'name', width: 25 },
        { header: 'Puntuación', key: 'score', width: 12 },
        { header: 'Riesgo Abandono', key: 'dropout_risk', width: 15 },
        { header: 'Recomendación Prioritaria', key: 'top_recommendation', width: 50 },
      ];

      alertSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      alertSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC2626' },
      };

      highRiskStudents.forEach(student => {
        alertSheet.addRow({
          name: student.student_name,
          score: `${student.overall_score}%`,
          dropout_risk: `${Math.round(student.predictions.dropout_risk * 100)}%`,
          top_recommendation: student.recommendations[0] || 'N/A',
        });
      });
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Generate CSV report
   * FIX-2026-01-20: Implemented CSV report generation to fix bug where CSV requests generated XLSX
   */
  private async generateCSVReport(reportData: ReportData): Promise<Buffer> {
    this.logger.log('Generating CSV report...');

    const { metadata, insights_summary, student_insights } = reportData;

    // CSV header row
    const headers = [
      'Estudiante',
      'ID Estudiante',
      'Puntuacion General',
      'Modulos Completados',
      'Modulos Totales',
      'Nivel de Riesgo',
      'Probabilidad Completitud',
      'Riesgo Abandono',
      'Fortalezas',
      'Debilidades',
      'Recomendaciones',
    ];

    // Build CSV rows
    const rows: string[][] = [];

    // Add metadata header
    rows.push(['# REPORTE DE ANALISIS ESTUDIANTIL']);
    rows.push([`# Generado: ${metadata.generated_at.toISOString()}`]);
    rows.push([`# ID Reporte: ${metadata.report_id}`]);
    if (metadata.start_date) {
      rows.push([`# Periodo: ${metadata.start_date} a ${metadata.end_date || 'actual'}`]);
    }
    rows.push([]);

    // Add summary section
    rows.push(['# RESUMEN']);
    rows.push([`Total Estudiantes,${insights_summary.total_students}`]);
    rows.push([`Alto Riesgo,${insights_summary.high_risk}`]);
    rows.push([`Medio Riesgo,${insights_summary.medium_risk}`]);
    rows.push([`Bajo Riesgo,${insights_summary.low_risk}`]);
    rows.push([`Puntuacion Promedio,${insights_summary.avg_overall_score}%`]);
    rows.push([`Tasa Completitud Promedio,${insights_summary.avg_completion_rate}%`]);
    rows.push([`Riesgo Abandono Promedio,${insights_summary.avg_dropout_risk}%`]);
    rows.push([]);

    // Add detail header
    rows.push(['# DETALLE POR ESTUDIANTE']);
    rows.push(headers);

    // Add student data rows
    student_insights.forEach(insight => {
      const row = [
        this.escapeCSVField(insight.student_name),
        insight.student_id,
        `${insight.overall_score}%`,
        String(insight.modules_completed),
        String(insight.modules_total),
        insight.risk_level.toUpperCase(),
        `${Math.round(insight.predictions.completion_probability * 100)}%`,
        `${Math.round(insight.predictions.dropout_risk * 100)}%`,
        this.escapeCSVField(insight.strengths.join('; ')),
        this.escapeCSVField(insight.weaknesses.join('; ')),
        this.escapeCSVField(insight.recommendations.join('; ')),
      ];
      rows.push(row);
    });

    // Convert rows to CSV string
    const csvContent = rows.map(row => row.join(',')).join('\n');

    // Add BOM for Excel compatibility with UTF-8
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    this.logger.log(`CSV generated successfully: ${csvWithBOM.length} characters, ${student_insights.length} students`);

    return Buffer.from(csvWithBOM, 'utf-8');
  }

  /**
   * Escape a field for CSV format (handle commas, quotes, newlines)
   */
  private escapeCSVField(field: string): string {
    if (!field) return '';

    // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  // =========================================================================
  // COMPETENCIES SECTION GENERATOR (TASK-2026-01-18-015 Sprint 2)
  // =========================================================================

  /**
   * Generate HTML for competencies section in PDF report
   * TASK-2026-01-18-015 Sprint 2: Shows mastery and reading competencies
   */
  private generateCompetenciesSection(
    student: StudentInsightsResponseDto & { student_name: string; student_id: string },
  ): string {
    // Check if student has competencies data
    if (!student.competencies && !student.mastery_summary) {
      return ''; // No competencies data available
    }

    const competencySections: string[] = [];

    // Generate mastery summary if available
    if (student.mastery_summary && student.mastery_summary.totalSkills > 0) {
      competencySections.push(`
        <div class="mastery-summary">
          <div class="mastery-item">
            <div class="mastery-badge mastered">${student.mastery_summary.masteredSkills}</div>
            <span>Dominadas</span>
          </div>
          <div class="mastery-item">
            <div class="mastery-badge needs-review">${student.mastery_summary.needsReviewCount}</div>
            <span>Requieren repaso</span>
          </div>
          <div class="mastery-item">
            <span>Nivel promedio: <strong>${student.mastery_summary.averageMasteryLevel.toFixed(1)}%</strong></span>
          </div>
        </div>
      `);
    }

    // Generate competencies grid if available
    if (student.competencies) {
      const competencyItems = [
        { name: 'Literal', data: student.competencies.literal },
        { name: 'Inferencial', data: student.competencies.inferencial },
        { name: 'Crítico', data: student.competencies.critico },
        { name: 'Digital', data: student.competencies.digital },
        { name: 'Textual', data: student.competencies.textual },
      ];

      const hasAnyData = competencyItems.some(c => c.data.score > 0);

      if (hasAnyData) {
        const competencyGridItems = competencyItems.map(comp => {
          const scoreClass = this.getScoreClass(comp.data.score);
          const levelLabel = this.getLevelLabel(comp.data.level);

          return `
            <div class="competency-item ${scoreClass}">
              <div class="name">${comp.name}</div>
              <div class="score">${comp.data.score > 0 ? comp.data.score.toFixed(0) + '%' : 'N/A'}</div>
              <div class="level">${levelLabel}</div>
            </div>
          `;
        }).join('');

        competencySections.push(`
          <div class="competencies-grid">
            ${competencyGridItems}
          </div>
        `);
      }
    }

    if (competencySections.length === 0) {
      return '';
    }

    return `
      <div class="competencies">
        <h4>Competencias de Lectura</h4>
        ${competencySections.join('')}
      </div>
    `;
  }

  /**
   * Get CSS class based on score
   */
  private getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'needs-work';
  }

  /**
   * Get human-readable label for proficiency level
   */
  private getLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      novice: 'Novato',
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
      expert: 'Experto',
      not_assessed: 'Sin evaluar',
    };
    return labels[level] || level;
  }
}
