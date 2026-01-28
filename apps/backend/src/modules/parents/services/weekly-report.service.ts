/**
 * WeeklyReportService
 *
 * EXT-010 Parent Notifications - Weekly Reports
 *
 * @description Generates weekly progress reports for parents about their students.
 * Aggregates student activity, achievements, and progress into digestible summaries.
 *
 * @see ET-PAR-001-weekly-reports.md
 * @created 2026-01-27
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import {
  ParentNotification,
  ParentNotificationType,
  NotificationPriority,
  ParentNotificationStatus,
} from '@/modules/auth/entities/parent-notification.entity';
import { ParentAccount } from '@/modules/auth/entities/parent-account.entity';
import { ParentStudentLink, LinkStatus } from '@/modules/auth/entities/parent-student-link.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { ReportContentAggregatorService, ProgressData } from './report-content-aggregator.service';

/**
 * Weekly Report Data Interface
 */
export interface WeeklyReport {
  id: string;
  parentId: string;
  studentId: string;
  studentName: string;
  weekStartDate: Date;
  weekEndDate: Date;
  progressData: ProgressData;
  formattedContent: string;
  createdAt: Date;
  sentAt: Date | null;
}

/**
 * Report History Item
 */
export interface ReportHistoryItem {
  id: string;
  studentId: string;
  studentName: string;
  weekStartDate: Date;
  weekEndDate: Date;
  status: ParentNotificationStatus;
  createdAt: Date;
  sentAt: Date | null;
  readAt: Date | null;
}

@Injectable()
export class WeeklyReportService {
  private readonly logger = new Logger(WeeklyReportService.name);

  constructor(
    @InjectRepository(ParentNotification, 'auth')
    private readonly notificationRepo: Repository<ParentNotification>,
    @InjectRepository(ParentAccount, 'auth')
    private readonly parentAccountRepo: Repository<ParentAccount>,
    @InjectRepository(ParentStudentLink, 'auth')
    private readonly linkRepo: Repository<ParentStudentLink>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
    @InjectDataSource('auth')
    private readonly dataSource: DataSource,
    private readonly aggregatorService: ReportContentAggregatorService,
  ) {}

  /**
   * Generate a weekly report for a specific parent-student pair
   *
   * @param parentId - Parent account ID
   * @param studentId - Student profile ID
   * @returns Generated weekly report
   */
  async generateWeeklyReport(parentId: string, studentId: string): Promise<WeeklyReport> {
    this.logger.log(`Generating weekly report for parent ${parentId}, student ${studentId}`);

    // Verify parent-student link exists and is active
    const link = await this.linkRepo.findOne({
      where: {
        parentAccountId: parentId,
        studentId: studentId,
        linkStatus: LinkStatus.ACTIVE,
      },
    });

    if (!link) {
      throw new NotFoundException(
        `No active link found between parent ${parentId} and student ${studentId}`,
      );
    }

    // Get student profile for name
    const studentProfile = await this.profileRepo.findOne({
      where: { id: studentId },
    });

    if (!studentProfile) {
      throw new NotFoundException(`Student profile ${studentId} not found`);
    }

    // Calculate week date range (last 7 days)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    // Aggregate student progress data
    const progressData = await this.aggregatorService.aggregateStudentProgress(
      studentId,
      startDate,
      endDate,
    );

    // Get student display name with fallback
    const studentName = this.getStudentDisplayName(studentProfile);

    // Format report content
    const formattedContent = this.formatReportContent(progressData, studentName);

    // Create notification record
    const notification = this.notificationRepo.create({
      parentAccountId: parentId,
      studentId: studentId,
      notificationType: ParentNotificationType.WEEKLY_REPORT,
      title: `Reporte Semanal: ${studentName}`,
      message: formattedContent,
      summary: this.generateSummary(progressData),
      studentSnapshot: {
        name: studentName,
        level: progressData.currentLevel,
        rank: progressData.currentRank,
        xp: progressData.totalXp,
      },
      priority: NotificationPriority.NORMAL,
      status: ParentNotificationStatus.PENDING,
      metadata: {
        weekStartDate: startDate.toISOString(),
        weekEndDate: endDate.toISOString(),
        progressData: progressData,
      },
    });

    const saved = await this.notificationRepo.save(notification);

    this.logger.log(`Weekly report generated: ${saved.id}`);

    return {
      id: saved.id,
      parentId: parentId,
      studentId: studentId,
      studentName: studentName,
      weekStartDate: startDate,
      weekEndDate: endDate,
      progressData: progressData,
      formattedContent: formattedContent,
      createdAt: saved.createdAt,
      sentAt: saved.sentAt,
    };
  }

  /**
   * Get display name from profile, with fallback
   */
  private getStudentDisplayName(profile: Profile): string {
    return profile.display_name || profile.full_name || profile.email || 'Estudiante';
  }

  /**
   * Get report history for a parent
   *
   * @param parentId - Parent account ID
   * @param limit - Maximum number of reports to return
   * @returns Array of report history items
   */
  async getReportHistory(parentId: string, limit: number = 20): Promise<ReportHistoryItem[]> {
    const notifications = await this.notificationRepo.find({
      where: {
        parentAccountId: parentId,
        notificationType: ParentNotificationType.WEEKLY_REPORT,
      },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['student'],
    });

    return notifications.map((n) => ({
      id: n.id,
      studentId: n.studentId,
      studentName: (n.studentSnapshot as any)?.name || 'Unknown',
      weekStartDate: new Date((n.metadata as any)?.weekStartDate),
      weekEndDate: new Date((n.metadata as any)?.weekEndDate),
      status: n.status,
      createdAt: n.createdAt,
      sentAt: n.sentAt,
      readAt: n.readAt,
    }));
  }

  /**
   * Schedule weekly reports for all opted-in parents
   * Called by the cron job on Sundays
   */
  async scheduleWeeklyReports(): Promise<{ scheduled: number; errors: number }> {
    this.logger.log('Scheduling weekly reports for all parents...');

    let scheduled = 0;
    let errors = 0;

    try {
      // Get all active parent accounts with weekly notification frequency
      const parentAccounts = await this.parentAccountRepo.find({
        where: {
          isActive: true,
          isVerified: true,
        },
      });

      // Filter to weekly frequency in code since notification_frequency is a string
      const weeklyParents = parentAccounts.filter(
        (p) => p.notificationFrequency === 'weekly',
      );

      this.logger.log(`Found ${weeklyParents.length} parents with weekly notifications enabled`);

      for (const parent of weeklyParents) {
        // Get all active student links for this parent
        const links = await this.linkRepo.find({
          where: {
            parentAccountId: parent.id,
            linkStatus: LinkStatus.ACTIVE,
            canReceiveNotifications: true,
          },
        });

        for (const link of links) {
          try {
            await this.generateWeeklyReport(parent.id, link.studentId);
            scheduled++;
          } catch (error) {
            errors++;
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.warn(
              `Failed to generate report for parent ${parent.id}, student ${link.studentId}: ${errorMsg}`,
            );
          }
        }
      }

      this.logger.log(`Weekly reports scheduled: ${scheduled}, errors: ${errors}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to schedule weekly reports: ${errorMsg}`);
    }

    return { scheduled, errors };
  }

  /**
   * Format report content for display/email
   */
  private formatReportContent(data: ProgressData, studentName: string): string {
    const sections: string[] = [];

    // Header
    sections.push(`Reporte Semanal de Progreso: ${studentName}`);
    sections.push('='.repeat(50));

    // XP and Level Progress
    sections.push('\nProgreso General:');
    sections.push(`- XP Ganado esta semana: ${data.xpEarned}`);
    sections.push(`- Nivel Actual: ${data.currentLevel}`);
    sections.push(`- Rango Actual: ${data.currentRank}`);

    // Learning Activity
    sections.push('\nActividad de Aprendizaje:');
    sections.push(`- Tiempo de lectura: ${Math.round(data.readingTimeMinutes)} minutos`);
    sections.push(`- Ejercicios completados: ${data.exercisesCompleted}`);
    sections.push(`- Precision promedio: ${data.averageAccuracy.toFixed(1)}%`);
    sections.push(`- Modulos completados: ${data.modulesCompleted}`);

    // Achievements
    if (data.achievementsUnlocked.length > 0) {
      sections.push('\nLogros Desbloqueados:');
      data.achievementsUnlocked.forEach((achievement) => {
        sections.push(`- ${achievement}`);
      });
    } else {
      sections.push('\nNo se desbloquearon nuevos logros esta semana.');
    }

    // Streak
    sections.push('\nRacha de Actividad:');
    sections.push(`- Racha actual: ${data.currentStreak} dias`);

    // Areas for Improvement
    if (data.areasForImprovement.length > 0) {
      sections.push('\nAreas de Oportunidad:');
      data.areasForImprovement.forEach((area) => {
        sections.push(`- ${area}`);
      });
    }

    // Recommendations
    if (data.recommendations.length > 0) {
      sections.push('\nRecomendaciones:');
      data.recommendations.forEach((rec) => {
        sections.push(`- ${rec}`);
      });
    }

    return sections.join('\n');
  }

  /**
   * Generate a brief summary for the notification
   */
  private generateSummary(data: ProgressData): string {
    const highlights: string[] = [];

    if (data.xpEarned > 0) {
      highlights.push(`+${data.xpEarned} XP`);
    }
    if (data.exercisesCompleted > 0) {
      highlights.push(`${data.exercisesCompleted} ejercicios`);
    }
    if (data.achievementsUnlocked.length > 0) {
      highlights.push(`${data.achievementsUnlocked.length} logro(s)`);
    }

    return highlights.length > 0
      ? `Esta semana: ${highlights.join(', ')}`
      : 'Sin actividad registrada esta semana';
  }
}
