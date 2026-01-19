/**
 * ScheduledReportsService
 *
 * TASK-2026-01-18-015 Sprint 5 Task 5.1
 * Service for managing scheduled report configurations and automatic generation.
 */

import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import {
  ScheduledReport,
  ScheduleFrequency,
  ScheduleStatus,
} from '../entities/scheduled-report.entity';
import { ReportsService } from './reports.service';
import { TeacherReportsService } from './teacher-reports.service';
import { GenerateReportDto, ReportFormat, ReportType } from '../dto/reports.dto';

/**
 * DTO for creating a scheduled report
 */
export interface CreateScheduledReportDto {
  scheduleName: string;
  reportType: string;
  reportFormat: string;
  classroomId?: string;
  studentIds?: string[];
  frequency: ScheduleFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  preferredHour?: number;
  sendEmail?: boolean;
  emailRecipients?: string[];
}

/**
 * DTO for updating a scheduled report
 */
export interface UpdateScheduledReportDto {
  scheduleName?: string;
  frequency?: ScheduleFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  preferredHour?: number;
  status?: ScheduleStatus;
  sendEmail?: boolean;
  emailRecipients?: string[];
}

/**
 * Response DTO for scheduled report
 */
export interface ScheduledReportResponseDto {
  id: string;
  schedule_name: string;
  report_type: string;
  report_format: string;
  classroom_id: string | null;
  frequency: string;
  day_of_week: number | null;
  day_of_month: number | null;
  preferred_hour: number;
  status: string;
  last_generated_at: string | null;
  next_run_at: string | null;
  total_runs: number;
  send_email: boolean;
  email_recipients: string[] | null;
  created_at: string;
}

@Injectable()
export class ScheduledReportsService {
  private readonly logger = new Logger(ScheduledReportsService.name);

  constructor(
    @InjectRepository(ScheduledReport, 'social')
    private readonly scheduledReportRepo: Repository<ScheduledReport>,
    private readonly reportsService: ReportsService,
    private readonly teacherReportsService: TeacherReportsService,
  ) {}

  /**
   * Cron job to check and execute scheduled reports
   * Runs every hour at minute 0
   */
  @Cron('0 * * * *')
  async executeScheduledReports(): Promise<void> {
    this.logger.log('Checking for scheduled reports to execute...');

    try {
      const now = new Date();

      // Find all active schedules that should run now or before
      const dueSchedules = await this.scheduledReportRepo.find({
        where: {
          status: ScheduleStatus.ACTIVE,
          nextRunAt: LessThanOrEqual(now),
        },
      });

      this.logger.log(`Found ${dueSchedules.length} scheduled reports due for execution`);

      for (const schedule of dueSchedules) {
        try {
          await this.executeSchedule(schedule);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Failed to execute schedule ${schedule.id}: ${errorMessage}`);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Scheduled reports execution failed: ${errorMessage}`);
    }
  }

  /**
   * Execute a single scheduled report
   */
  private async executeSchedule(schedule: ScheduledReport): Promise<void> {
    this.logger.log(`Executing scheduled report: ${schedule.scheduleName} (${schedule.id})`);

    try {
      // Build the report generation DTO
      const generateDto: GenerateReportDto = {
        type: schedule.reportType as ReportType,
        format: schedule.reportFormat as ReportFormat,
        classroom_id: schedule.classroomId || undefined,
        student_ids: schedule.studentIds || undefined,
      };

      // Generate the report
      await this.reportsService.generateReport(
        generateDto,
        schedule.teacherId,
        schedule.tenantId,
      );

      // Update schedule metadata
      const now = new Date();
      const nextRun = this.calculateNextRunAt(schedule.frequency, schedule.dayOfWeek, schedule.dayOfMonth, schedule.preferredHour);

      await this.scheduledReportRepo.update(schedule.id, {
        lastGeneratedAt: now,
        nextRunAt: nextRun,
        totalRuns: schedule.totalRuns + 1,
      });

      this.logger.log(`Successfully executed scheduled report ${schedule.id}. Next run: ${nextRun?.toISOString()}`);

      // TODO: Send email notification if enabled
      if (schedule.sendEmail && schedule.emailRecipients?.length) {
        this.logger.log(`Email notification would be sent to: ${schedule.emailRecipients.join(', ')}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to generate scheduled report ${schedule.id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Create a new scheduled report
   */
  async createScheduledReport(
    teacherId: string,
    tenantId: string,
    dto: CreateScheduledReportDto,
  ): Promise<ScheduledReportResponseDto> {
    this.logger.log(`Creating scheduled report "${dto.scheduleName}" for teacher ${teacherId}`);

    const nextRun = this.calculateNextRunAt(
      dto.frequency,
      dto.dayOfWeek ?? null,
      dto.dayOfMonth ?? null,
      dto.preferredHour || 8,
    );

    const schedule = this.scheduledReportRepo.create({
      teacherId,
      tenantId,
      scheduleName: dto.scheduleName,
      reportType: dto.reportType,
      reportFormat: dto.reportFormat,
      classroomId: dto.classroomId || null,
      studentIds: dto.studentIds || null,
      frequency: dto.frequency,
      dayOfWeek: dto.dayOfWeek ?? null,
      dayOfMonth: dto.dayOfMonth ?? null,
      preferredHour: dto.preferredHour || 8,
      sendEmail: dto.sendEmail ?? true,
      emailRecipients: dto.emailRecipients || null,
      status: ScheduleStatus.ACTIVE,
      nextRunAt: nextRun,
      totalRuns: 0,
    });

    const saved = await this.scheduledReportRepo.save(schedule);
    return this.mapToResponseDto(saved);
  }

  /**
   * Get all scheduled reports for a teacher
   */
  async getScheduledReports(teacherId: string): Promise<ScheduledReportResponseDto[]> {
    const schedules = await this.scheduledReportRepo.find({
      where: { teacherId },
      order: { createdAt: 'DESC' },
    });

    return schedules.map(s => this.mapToResponseDto(s));
  }

  /**
   * Get a specific scheduled report by ID
   */
  async getScheduledReportById(
    scheduleId: string,
    teacherId: string,
  ): Promise<ScheduledReportResponseDto> {
    const schedule = await this.scheduledReportRepo.findOne({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException(`Scheduled report ${scheduleId} not found`);
    }

    if (schedule.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this scheduled report');
    }

    return this.mapToResponseDto(schedule);
  }

  /**
   * Update a scheduled report
   */
  async updateScheduledReport(
    scheduleId: string,
    teacherId: string,
    dto: UpdateScheduledReportDto,
  ): Promise<ScheduledReportResponseDto> {
    const schedule = await this.scheduledReportRepo.findOne({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException(`Scheduled report ${scheduleId} not found`);
    }

    if (schedule.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this scheduled report');
    }

    // Update fields
    if (dto.scheduleName !== undefined) schedule.scheduleName = dto.scheduleName;
    if (dto.frequency !== undefined) schedule.frequency = dto.frequency;
    if (dto.dayOfWeek !== undefined) schedule.dayOfWeek = dto.dayOfWeek;
    if (dto.dayOfMonth !== undefined) schedule.dayOfMonth = dto.dayOfMonth;
    if (dto.preferredHour !== undefined) schedule.preferredHour = dto.preferredHour;
    if (dto.status !== undefined) schedule.status = dto.status;
    if (dto.sendEmail !== undefined) schedule.sendEmail = dto.sendEmail;
    if (dto.emailRecipients !== undefined) schedule.emailRecipients = dto.emailRecipients;

    // Recalculate next run if schedule parameters changed
    if (dto.frequency !== undefined || dto.dayOfWeek !== undefined || dto.dayOfMonth !== undefined || dto.preferredHour !== undefined) {
      schedule.nextRunAt = this.calculateNextRunAt(
        schedule.frequency,
        schedule.dayOfWeek,
        schedule.dayOfMonth,
        schedule.preferredHour,
      );
    }

    const updated = await this.scheduledReportRepo.save(schedule);
    return this.mapToResponseDto(updated);
  }

  /**
   * Delete a scheduled report
   */
  async deleteScheduledReport(scheduleId: string, teacherId: string): Promise<void> {
    const schedule = await this.scheduledReportRepo.findOne({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException(`Scheduled report ${scheduleId} not found`);
    }

    if (schedule.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this scheduled report');
    }

    await this.scheduledReportRepo.remove(schedule);
    this.logger.log(`Deleted scheduled report ${scheduleId}`);
  }

  /**
   * Pause a scheduled report
   */
  async pauseScheduledReport(scheduleId: string, teacherId: string): Promise<ScheduledReportResponseDto> {
    return this.updateScheduledReport(scheduleId, teacherId, { status: ScheduleStatus.PAUSED });
  }

  /**
   * Resume a paused scheduled report
   */
  async resumeScheduledReport(scheduleId: string, teacherId: string): Promise<ScheduledReportResponseDto> {
    const schedule = await this.scheduledReportRepo.findOne({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException(`Scheduled report ${scheduleId} not found`);
    }

    if (schedule.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this scheduled report');
    }

    // Recalculate next run time
    const nextRun = this.calculateNextRunAt(
      schedule.frequency,
      schedule.dayOfWeek,
      schedule.dayOfMonth,
      schedule.preferredHour,
    );

    schedule.status = ScheduleStatus.ACTIVE;
    schedule.nextRunAt = nextRun;

    const updated = await this.scheduledReportRepo.save(schedule);
    return this.mapToResponseDto(updated);
  }

  /**
   * Calculate the next run time based on frequency
   */
  private calculateNextRunAt(
    frequency: ScheduleFrequency,
    dayOfWeek: number | null,
    dayOfMonth: number | null,
    preferredHour: number,
  ): Date | null {
    const now = new Date();
    const next = new Date();
    next.setMinutes(0, 0, 0);
    next.setHours(preferredHour);

    switch (frequency) {
      case ScheduleFrequency.DAILY:
        // If we've passed today's time, schedule for tomorrow
        if (now >= next) {
          next.setDate(next.getDate() + 1);
        }
        break;

      case ScheduleFrequency.WEEKLY:
        // Find next occurrence of the specified day of week
        if (dayOfWeek !== null) {
          const currentDay = now.getDay();
          let daysUntil = dayOfWeek - currentDay;
          if (daysUntil < 0 || (daysUntil === 0 && now >= next)) {
            daysUntil += 7;
          }
          next.setDate(next.getDate() + daysUntil);
        }
        break;

      case ScheduleFrequency.BIWEEKLY:
        // Find next occurrence of the specified day of week, then add a week
        if (dayOfWeek !== null) {
          const currentDay = now.getDay();
          let daysUntil = dayOfWeek - currentDay;
          if (daysUntil < 0 || (daysUntil === 0 && now >= next)) {
            daysUntil += 14;
          } else {
            daysUntil += 7; // Add extra week for biweekly
          }
          next.setDate(next.getDate() + daysUntil);
        }
        break;

      case ScheduleFrequency.MONTHLY:
        // Find next occurrence of the specified day of month
        if (dayOfMonth !== null) {
          next.setDate(dayOfMonth);
          if (now >= next) {
            next.setMonth(next.getMonth() + 1);
          }
          // Handle months with fewer days
          const targetDay = dayOfMonth;
          const lastDayOfMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
          if (targetDay > lastDayOfMonth) {
            next.setDate(lastDayOfMonth);
          }
        }
        break;
    }

    return next;
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(schedule: ScheduledReport): ScheduledReportResponseDto {
    return {
      id: schedule.id,
      schedule_name: schedule.scheduleName,
      report_type: schedule.reportType,
      report_format: schedule.reportFormat,
      classroom_id: schedule.classroomId,
      frequency: schedule.frequency,
      day_of_week: schedule.dayOfWeek,
      day_of_month: schedule.dayOfMonth,
      preferred_hour: schedule.preferredHour,
      status: schedule.status,
      last_generated_at: schedule.lastGeneratedAt?.toISOString() || null,
      next_run_at: schedule.nextRunAt?.toISOString() || null,
      total_runs: schedule.totalRuns,
      send_email: schedule.sendEmail,
      email_recipients: schedule.emailRecipients,
      created_at: schedule.createdAt.toISOString(),
    };
  }
}
