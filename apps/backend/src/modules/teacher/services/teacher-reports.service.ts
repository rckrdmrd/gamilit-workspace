/**
 * TeacherReportsService
 *
 * Service for managing teacher reports metadata (CRUD operations)
 * This service handles the retrieval of report metadata stored in the database.
 *
 * Note: This is different from ReportsService which generates new reports.
 */

import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherReport } from '../entities/teacher-report.entity';
import { ReportMetadataDto, ReportStatsDto, CreateTeacherReportDto } from '../dto/teacher-reports.dto';

/**
 * Service for teacher reports metadata management
 */
@Injectable()
export class TeacherReportsService {
  private readonly logger = new Logger(TeacherReportsService.name);

  constructor(
    @InjectRepository(TeacherReport, 'social')
    private readonly teacherReportRepo: Repository<TeacherReport>,
  ) {}

  /**
   * Get recent reports for a teacher
   *
   * @param teacherId - ID of the teacher
   * @param limit - Maximum number of reports to return (default: 10)
   * @returns Array of report metadata
   */
  async getRecentReports(teacherId: string, limit: number = 10): Promise<ReportMetadataDto[]> {
    this.logger.log(`Getting recent reports for teacher ${teacherId} with limit ${limit}`);

    const reports = await this.teacherReportRepo.find({
      where: { teacherId },
      order: { generatedAt: 'DESC' },
      take: limit,
    });

    return reports.map(report => this.mapToReportMetadataDto(report));
  }

  /**
   * Get report statistics for a teacher
   *
   * @param teacherId - ID of the teacher
   * @returns Report statistics
   */
  async getReportStats(teacherId: string): Promise<ReportStatsDto> {
    this.logger.log(`Getting report stats for teacher ${teacherId}`);

    // Get all reports for the teacher
    const reports = await this.teacherReportRepo.find({
      where: { teacherId },
    });

    const totalReports = reports.length;

    // If no reports, return empty stats
    if (totalReports === 0) {
      return {
        total_reports_generated: 0,
        last_generated_date: null,
        most_used_format: null,
        avg_students_per_report: 0,
      };
    }

    // Calculate statistics
    const lastReport = await this.teacherReportRepo.findOne({
      where: { teacherId },
      order: { generatedAt: 'DESC' },
    });

    const lastGeneratedDate = lastReport?.generatedAt.toISOString() || null;

    // Find most used format
    const formatCounts = reports.reduce(
      (acc, report) => {
        acc[report.reportFormat] = (acc[report.reportFormat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostUsedFormat =
      Object.keys(formatCounts).length > 0
        ? Object.entries(formatCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
        : null;

    // Calculate average students per report
    const totalStudents = reports.reduce((sum, report) => sum + (report.studentCount || 0), 0);
    const avgStudentsPerReport = Math.round(totalStudents / totalReports);

    return {
      total_reports_generated: totalReports,
      last_generated_date: lastGeneratedDate,
      most_used_format: mostUsedFormat,
      avg_students_per_report: avgStudentsPerReport,
    };
  }

  /**
   * Get a specific report by ID with ownership validation
   *
   * @param reportId - UUID of the report
   * @param teacherId - ID of the teacher (for ownership validation)
   * @returns TeacherReport entity
   * @throws NotFoundException if report not found
   * @throws ForbiddenException if teacher does not own the report
   */
  async getReportById(reportId: string, teacherId: string): Promise<TeacherReport> {
    this.logger.log(`Getting report ${reportId} for teacher ${teacherId}`);

    const report = await this.teacherReportRepo.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    // Validate ownership
    if (report.teacherId !== teacherId) {
      this.logger.warn(
        `Teacher ${teacherId} attempted to access report ${reportId} owned by ${report.teacherId}`,
      );
      throw new ForbiddenException('You do not have access to this report');
    }

    return report;
  }

  /**
   * Create a new report record in the database
   *
   * @param dto - CreateTeacherReportDto with report details
   * @returns Created TeacherReport entity
   */
  async createReport(dto: CreateTeacherReportDto): Promise<TeacherReport> {
    this.logger.log(`Creating report "${dto.reportName}" for teacher ${dto.teacherId}`);

    const report = this.teacherReportRepo.create({
      teacherId: dto.teacherId,
      tenantId: dto.tenantId,
      reportName: dto.reportName,
      reportType: dto.reportType,
      reportFormat: dto.reportFormat,
      classroomId: dto.classroomId || null,
      studentCount: dto.studentCount,
      periodStart: dto.periodStart ? new Date(dto.periodStart) : null,
      periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : null,
      filePath: dto.filePath,
      fileSizeBytes: dto.fileSizeBytes,
      generatedAt: new Date(),
    });

    const savedReport = await this.teacherReportRepo.save(report);
    this.logger.log(`Report created successfully with ID: ${savedReport.id}`);

    return savedReport;
  }

  /**
   * Delete a report by ID (with ownership validation)
   *
   * @param reportId - UUID of the report to delete
   * @param teacherId - ID of the teacher (for ownership validation)
   */
  async deleteReport(reportId: string, teacherId: string): Promise<void> {
    const report = await this.getReportById(reportId, teacherId);
    await this.teacherReportRepo.remove(report);
    this.logger.log(`Report ${reportId} deleted by teacher ${teacherId}`);
  }

  /**
   * Map TeacherReport entity to ReportMetadataDto
   *
   * @param report - TeacherReport entity
   * @returns ReportMetadataDto
   */
  private mapToReportMetadataDto(report: TeacherReport): ReportMetadataDto {
    return {
      id: report.id,
      report_name: report.reportName,
      report_type: report.reportType,
      report_format: report.reportFormat,
      student_count: report.studentCount,
      period_start: report.periodStart ? report.periodStart.toISOString() : null,
      period_end: report.periodEnd ? report.periodEnd.toISOString() : null,
      generated_at: report.generatedAt.toISOString(),
    };
  }
}
