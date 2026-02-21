/**
 * WeeklyReportCronService
 *
 * EXT-010 Parent Notifications - Scheduled Report Generation
 *
 * @description Cron job service that runs every Sunday to generate and send
 * weekly progress reports to all opted-in parents.
 *
 * @see ET-PAR-001-weekly-reports.md
 * @created 2026-01-27
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ParentNotification,
  ParentNotificationStatus,
} from '@/modules/auth/entities/parent-notification.entity';
import { ParentAccount } from '@/modules/auth/entities/parent-account.entity';
import { ReportFormat } from '@/modules/parents/enums/parent-account.enums';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { WeeklyReportService } from './weekly-report.service';
import { ParentAlertService } from './parent-alert.service';
import { MailService } from '@/modules/mail/mail.service';

/**
 * Report Generation Statistics
 */
export interface ReportGenerationStats {
  totalParents: number;
  reportsGenerated: number;
  emailsSent: number;
  errors: number;
  duration: number;
}

@Injectable()
export class WeeklyReportCronService {
  private readonly logger = new Logger(WeeklyReportCronService.name);

  constructor(
    @InjectRepository(ParentNotification, 'auth')
    private readonly notificationRepo: Repository<ParentNotification>,
    @InjectRepository(ParentAccount, 'auth')
    private readonly parentAccountRepo: Repository<ParentAccount>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
    private readonly weeklyReportService: WeeklyReportService,
    private readonly alertService: ParentAlertService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Main cron job: Generate and send weekly reports
   *
   * Runs every Sunday at 8:00 AM UTC
   * Cron expression: '0 8 * * 0' (minute hour day month weekday)
   */
  @Cron('0 8 * * 0', {
    name: 'weekly-parent-reports',
    timeZone: 'UTC',
  })
  async generateWeeklyReports(): Promise<void> {
    this.logger.log('[CRON] Starting weekly parent report generation...');

    const startTime = Date.now();
    const stats: ReportGenerationStats = {
      totalParents: 0,
      reportsGenerated: 0,
      emailsSent: 0,
      errors: 0,
      duration: 0,
    };

    try {
      // Generate all reports
      const result = await this.weeklyReportService.scheduleWeeklyReports();
      stats.reportsGenerated = result.scheduled;
      stats.errors = result.errors;

      // Send pending reports via email
      const emailResult = await this.sendPendingReportEmails();
      stats.emailsSent = emailResult.sent;

      stats.duration = Date.now() - startTime;

      this.logger.log(
        `[CRON] Weekly reports complete. Generated: ${stats.reportsGenerated}, ` +
        `Emails: ${stats.emailsSent}, Errors: ${stats.errors}, Duration: ${stats.duration}ms`,
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[CRON] Weekly report generation failed: ${errorMsg}`);
    }
  }

  /**
   * Daily cron job: Check for inactive students and send alerts
   *
   * Runs daily at 9:00 AM UTC
   */
  @Cron('0 9 * * *', {
    name: 'daily-inactivity-check',
    timeZone: 'UTC',
  })
  async checkInactiveStudents(): Promise<void> {
    this.logger.log('[CRON] Starting daily inactivity check...');

    try {
      const result = await this.alertService.checkInactiveStudents();
      this.logger.log(
        `[CRON] Inactivity check complete. Checked: ${result.checked}, Alerts: ${result.alerts}`,
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[CRON] Inactivity check failed: ${errorMsg}`);
    }
  }

  /**
   * Daily cron job: Archive old read notifications
   *
   * Runs daily at 2:00 AM UTC
   */
  @Cron('0 2 * * *', {
    name: 'archive-old-notifications',
    timeZone: 'UTC',
  })
  async archiveOldNotifications(): Promise<void> {
    this.logger.log('[CRON] Starting old notification archival...');

    try {
      const archived = await this.alertService.archiveOldAlerts(30);
      this.logger.log(`[CRON] Archived ${archived} old notifications`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[CRON] Notification archival failed: ${errorMsg}`);
    }
  }

  /**
   * Send pending report emails
   */
  private async sendPendingReportEmails(): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    try {
      // Get all pending weekly reports
      const pendingReports = await this.notificationRepo.find({
        where: {
          notificationType: 'weekly_report' as any,
          status: ParentNotificationStatus.PENDING,
          sentViaEmail: false,
        },
        relations: ['parentAccount'],
      });

      this.logger.log(`Found ${pendingReports.length} pending reports to email`);

      for (const report of pendingReports) {
        try {
          // Get parent account
          const parent = await this.parentAccountRepo.findOne({
            where: { id: report.parentAccountId },
          });

          if (!parent) {
            this.logger.warn(`Parent account not found for report ${report.id}`);
            continue;
          }

          // Check if parent wants email reports
          if (parent.preferredReportFormat !== ReportFormat.EMAIL &&
              parent.preferredReportFormat !== ReportFormat.BOTH) {
            // Mark as sent (in-app only)
            report.status = ParentNotificationStatus.SENT;
            report.sentViaInApp = true;
            report.sentAt = new Date();
            await this.notificationRepo.save(report);
            continue;
          }

          // Get parent's profile for email
          const profile = await this.profileRepo.findOne({
            where: { id: parent.profileId },
          });

          if (!profile?.email) {
            this.logger.warn(`No email found for parent ${parent.id}`);
            continue;
          }

          // Build and send email
          const html = this.buildWeeklyReportEmail(report);
          const emailSent = await this.mailService.sendEmail(
            profile.email,
            report.title,
            html,
          );

          if (emailSent) {
            report.status = ParentNotificationStatus.SENT;
            report.sentViaEmail = true;
            report.sentViaInApp = true;
            report.sentAt = new Date();
            await this.notificationRepo.save(report);
            sent++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
          this.logger.warn(`Failed to send email for report ${report.id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to send pending report emails:', error);
    }

    return { sent, failed };
  }

  /**
   * Build HTML email for weekly report
   */
  private buildWeeklyReportEmail(report: ParentNotification): string {
    const studentSnapshot = report.studentSnapshot as any;
    const metadata = report.metadata as any;
    const progressData = metadata?.progressData || {};

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0 0 10px 0; font-size: 24px; }
          .header .period { font-size: 14px; opacity: 0.9; }
          .student-card { background: #f9f9f9; padding: 20px; margin: 20px; border-radius: 8px; display: flex; align-items: center; }
          .student-avatar { width: 60px; height: 60px; background: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; margin-right: 15px; }
          .student-info h2 { margin: 0; font-size: 18px; }
          .student-info p { margin: 5px 0 0 0; color: #666; }
          .metrics { padding: 20px; }
          .metric-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
          .metric { flex: 1; text-align: center; padding: 15px; background: #f9f9f9; border-radius: 8px; margin: 0 5px; }
          .metric-value { font-size: 28px; font-weight: bold; color: #667eea; }
          .metric-label { font-size: 12px; color: #666; margin-top: 5px; }
          .section { padding: 20px; border-top: 1px solid #eee; }
          .section h3 { margin: 0 0 15px 0; color: #333; font-size: 16px; }
          .section ul { margin: 0; padding-left: 20px; }
          .section li { margin-bottom: 8px; }
          .achievement { background: #e8f5e9; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px; border-left: 4px solid #4caf50; }
          .improvement { background: #fff3e0; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px; border-left: 4px solid #ff9800; }
          .recommendation { background: #e3f2fd; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px; border-left: 4px solid #2196f3; }
          .cta { text-align: center; padding: 30px; }
          .button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 30px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reporte Semanal de Progreso</h1>
            <div class="period">${this.formatDateRange(metadata?.weekStartDate, metadata?.weekEndDate)}</div>
          </div>

          <div class="student-card">
            <div class="student-avatar">${(studentSnapshot?.name || 'E')[0].toUpperCase()}</div>
            <div class="student-info">
              <h2>${studentSnapshot?.name || 'Estudiante'}</h2>
              <p>Nivel ${studentSnapshot?.level || 1} - Rango ${studentSnapshot?.rank || 'Ajaw'}</p>
            </div>
          </div>

          <div class="metrics">
            <div class="metric-row">
              <div class="metric">
                <div class="metric-value">${progressData.xpEarned || 0}</div>
                <div class="metric-label">XP Ganado</div>
              </div>
              <div class="metric">
                <div class="metric-value">${progressData.exercisesCompleted || 0}</div>
                <div class="metric-label">Ejercicios</div>
              </div>
              <div class="metric">
                <div class="metric-value">${Math.round(progressData.averageAccuracy || 0)}%</div>
                <div class="metric-label">Precision</div>
              </div>
            </div>
            <div class="metric-row">
              <div class="metric">
                <div class="metric-value">${Math.round(progressData.readingTimeMinutes || 0)}</div>
                <div class="metric-label">Minutos Activo</div>
              </div>
              <div class="metric">
                <div class="metric-value">${progressData.currentStreak || 0}</div>
                <div class="metric-label">Dias de Racha</div>
              </div>
              <div class="metric">
                <div class="metric-value">${(progressData.achievementsUnlocked || []).length}</div>
                <div class="metric-label">Logros</div>
              </div>
            </div>
          </div>

          ${this.renderAchievementsSection(progressData.achievementsUnlocked || [])}

          ${this.renderImprovementSection(progressData.areasForImprovement || [])}

          ${this.renderRecommendationsSection(progressData.recommendations || [])}

          <div class="cta">
            <a href="#" class="button">Ver Dashboard Completo</a>
          </div>

          <div class="footer">
            <p>Este reporte fue generado automaticamente por GAMILIT.</p>
            <p>Para cambiar la frecuencia de estos reportes, visita tu perfil de padre/tutor.</p>
            <p>&copy; 2026 GAMILIT - Plataforma Educativa Gamificada</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Format date range for display
   */
  private formatDateRange(startDate?: string, endDate?: string): string {
    if (!startDate || !endDate) {
      return 'Ultima semana';
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString('es-MX', options)} - ${end.toLocaleDateString('es-MX', options)}`;
  }

  /**
   * Render achievements section
   */
  private renderAchievementsSection(achievements: string[]): string {
    if (achievements.length === 0) {
      return '';
    }

    const items = achievements.map((a) => `<div class="achievement">${a}</div>`).join('');

    return `
      <div class="section">
        <h3>Logros Desbloqueados</h3>
        ${items}
      </div>
    `;
  }

  /**
   * Render improvement areas section
   */
  private renderImprovementSection(areas: string[]): string {
    if (areas.length === 0) {
      return '';
    }

    const items = areas.map((a) => `<div class="improvement">${a}</div>`).join('');

    return `
      <div class="section">
        <h3>Areas de Oportunidad</h3>
        ${items}
      </div>
    `;
  }

  /**
   * Render recommendations section
   */
  private renderRecommendationsSection(recommendations: string[]): string {
    if (recommendations.length === 0) {
      return '';
    }

    const items = recommendations.map((r) => `<div class="recommendation">${r}</div>`).join('');

    return `
      <div class="section">
        <h3>Recomendaciones</h3>
        ${items}
      </div>
    `;
  }

  /**
   * Manual trigger for testing
   */
  async runWeeklyReportsNow(): Promise<ReportGenerationStats> {
    this.logger.log('[MANUAL] Triggering weekly reports...');

    const startTime = Date.now();
    const stats: ReportGenerationStats = {
      totalParents: 0,
      reportsGenerated: 0,
      emailsSent: 0,
      errors: 0,
      duration: 0,
    };

    const result = await this.weeklyReportService.scheduleWeeklyReports();
    stats.reportsGenerated = result.scheduled;
    stats.errors = result.errors;

    const emailResult = await this.sendPendingReportEmails();
    stats.emailsSent = emailResult.sent;

    stats.duration = Date.now() - startTime;

    return stats;
  }
}
