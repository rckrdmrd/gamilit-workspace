/**
 * ParentAlertService
 *
 * EXT-010 Parent Notifications - Alert Management
 *
 * @description Manages real-time alerts for parents including low performance,
 * achievement notifications, and streak loss warnings.
 *
 * @see ET-PAR-001-weekly-reports.md
 * @created 2026-01-27
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import {
  ParentNotification,
  ParentNotificationType,
  NotificationPriority,
  ParentNotificationStatus,
} from '@/modules/auth/entities/parent-notification.entity';
import { ParentAccount, NotificationFrequency } from '@/modules/auth/entities/parent-account.entity';
import { ParentStudentLink, LinkStatus } from '@/modules/auth/entities/parent-student-link.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { MailService } from '@/modules/mail/mail.service';

/**
 * Alert Types for internal use
 */
export enum AlertType {
  LOW_PERFORMANCE = 'low_performance',
  ACHIEVEMENT = 'achievement',
  STREAK_LOSS = 'streak_loss',
  INACTIVITY = 'inactivity',
  RANK_PROMOTION = 'rank_promotion',
  ASSIGNMENT_DUE = 'assignment_due',
}

/**
 * Alert Configuration
 */
export interface AlertConfig {
  lowPerformanceThreshold: number; // Score below which triggers alert
  inactivityDays: number; // Days of inactivity before alert
  streakLossThreshold: number; // Minimum streak to trigger loss alert
}

/**
 * Alert Data Interface
 */
export interface AlertData {
  type: AlertType;
  studentId: string;
  studentName: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class ParentAlertService {
  private readonly logger = new Logger(ParentAlertService.name);

  private readonly defaultConfig: AlertConfig = {
    lowPerformanceThreshold: 50,
    inactivityDays: 7,
    streakLossThreshold: 3,
  };

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
    private readonly authDs: DataSource,
    @InjectDataSource('gamification')
    private readonly gamificationDs: DataSource,
    private readonly mailService: MailService,
  ) {}

  /**
   * Send low performance alert to all linked parents
   *
   * @param studentId - Student profile ID
   * @param exerciseType - Type of exercise
   * @param score - Score achieved
   * @param threshold - Performance threshold
   */
  async sendLowPerformanceAlert(
    studentId: string,
    exerciseType: string,
    score: number,
    threshold: number = this.defaultConfig.lowPerformanceThreshold,
  ): Promise<void> {
    if (score >= threshold) {
      return; // No alert needed
    }

    const studentProfile = await this.getStudentProfile(studentId);
    const parents = await this.getActiveParents(studentId, 'alertOnLowPerformance');

    const studentName = this.getStudentDisplayName(studentProfile);

    for (const parent of parents) {
      await this.createAlert({
        type: AlertType.LOW_PERFORMANCE,
        studentId,
        studentName,
        title: `Alerta de Rendimiento: ${studentName}`,
        message: `${studentName} obtuvo ${score}% en un ejercicio de ${exerciseType}. Considera revisar su progreso y brindarle apoyo adicional.`,
        data: { exerciseType, score, threshold },
      }, parent);
    }
  }

  /**
   * Send achievement notification to all linked parents
   *
   * @param studentId - Student profile ID
   * @param achievementName - Name of the achievement
   * @param achievementDescription - Description of the achievement
   * @param xpReward - XP rewarded
   */
  async sendAchievementNotification(
    studentId: string,
    achievementName: string,
    achievementDescription: string,
    xpReward: number,
  ): Promise<void> {
    const studentProfile = await this.getStudentProfile(studentId);
    const studentName = this.getStudentDisplayName(studentProfile);
    const parents = await this.getActiveParents(studentId, 'alertOnAchievementUnlocked');

    for (const parent of parents) {
      await this.createAlert({
        type: AlertType.ACHIEVEMENT,
        studentId,
        studentName,
        title: `Nuevo Logro: ${studentName}`,
        message: `${studentName} desbloqueo el logro "${achievementName}". ${achievementDescription} (+${xpReward} XP)`,
        data: { achievementName, achievementDescription, xpReward },
      }, parent);
    }
  }

  /**
   * Send streak loss warning to all linked parents
   *
   * @param studentId - Student profile ID
   * @param previousStreak - Previous streak count
   */
  async sendStreakLossWarning(studentId: string, previousStreak: number): Promise<void> {
    if (previousStreak < this.defaultConfig.streakLossThreshold) {
      return; // Small streaks don't warrant alerts
    }

    const studentProfile = await this.getStudentProfile(studentId);
    const studentName = this.getStudentDisplayName(studentProfile);
    const parents = await this.getActiveParents(studentId);

    for (const parent of parents) {
      await this.createAlert({
        type: AlertType.STREAK_LOSS,
        studentId,
        studentName,
        title: `Racha Perdida: ${studentName}`,
        message: `${studentName} perdio su racha de ${previousStreak} dias consecutivos. Animalo a retomar sus estudios hoy.`,
        data: { previousStreak },
      }, parent);
    }
  }

  /**
   * Send inactivity alert to all linked parents
   *
   * @param studentId - Student profile ID
   * @param daysSinceLastActivity - Days since last activity
   */
  async sendInactivityAlert(studentId: string, daysSinceLastActivity: number): Promise<void> {
    const studentProfile = await this.getStudentProfile(studentId);
    const studentName = this.getStudentDisplayName(studentProfile);
    const parents = await this.getActiveParents(studentId);

    for (const parent of parents) {
      // Check parent's inactivity threshold setting
      const threshold = parent.alertOnInactivityDays || this.defaultConfig.inactivityDays;
      if (daysSinceLastActivity < threshold) {
        continue;
      }

      await this.createAlert({
        type: AlertType.INACTIVITY,
        studentId,
        studentName,
        title: `Alerta de Inactividad: ${studentName}`,
        message: `${studentName} no ha ingresado a la plataforma en ${daysSinceLastActivity} dias. Recuerdale la importancia de practicar regularmente.`,
        data: { daysSinceLastActivity },
      }, parent);
    }
  }

  /**
   * Send rank promotion notification to all linked parents
   *
   * @param studentId - Student profile ID
   * @param newRank - New rank achieved
   * @param previousRank - Previous rank
   */
  async sendRankPromotionNotification(
    studentId: string,
    newRank: string,
    previousRank: string,
  ): Promise<void> {
    const studentProfile = await this.getStudentProfile(studentId);
    const studentName = this.getStudentDisplayName(studentProfile);
    const parents = await this.getActiveParents(studentId, 'alertOnRankPromotion');

    for (const parent of parents) {
      await this.createAlert({
        type: AlertType.RANK_PROMOTION,
        studentId,
        studentName,
        title: `Promocion de Rango: ${studentName}`,
        message: `Felicidades! ${studentName} ha ascendido de ${previousRank} a ${newRank}. Este es un gran logro!`,
        data: { newRank, previousRank },
      }, parent);
    }
  }

  /**
   * Check and send inactivity alerts for all students
   * Called by cron job
   */
  async checkInactiveStudents(): Promise<{ checked: number; alerts: number }> {
    this.logger.log('Checking for inactive students...');

    let checked = 0;
    let alerts = 0;

    try {
      // Get all active parent-student links
      const links = await this.linkRepo.find({
        where: {
          linkStatus: LinkStatus.ACTIVE,
          canReceiveNotifications: true,
        },
      });

      // Get unique student IDs
      const studentIds = [...new Set(links.map((l) => l.studentId))];
      checked = studentIds.length;

      for (const studentId of studentIds) {
        try {
          // Check last activity from learning sessions
          const result = await this.gamificationDs.query(
            `
            SELECT last_activity_at
            FROM gamification_system.user_stats
            WHERE user_id = $1
            `,
            [studentId],
          );

          if (result[0]?.last_activity_at) {
            const lastActivity = new Date(result[0].last_activity_at);
            const daysSince = Math.floor(
              (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
            );

            if (daysSince >= this.defaultConfig.inactivityDays) {
              await this.sendInactivityAlert(studentId, daysSince);
              alerts++;
            }
          }
        } catch (error) {
          this.logger.warn(`Failed to check inactivity for student ${studentId}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to check inactive students:', error);
    }

    this.logger.log(`Inactivity check complete: ${checked} students, ${alerts} alerts sent`);
    return { checked, alerts };
  }

  /**
   * Get pending alerts for a parent
   */
  async getPendingAlerts(parentId: string): Promise<ParentNotification[]> {
    return this.notificationRepo.find({
      where: {
        parentAccountId: parentId,
        status: ParentNotificationStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId: string, parentId: string): Promise<ParentNotification> {
    const alert = await this.notificationRepo.findOne({
      where: { id: alertId, parentAccountId: parentId },
    });

    if (!alert) {
      throw new NotFoundException(`Alert ${alertId} not found`);
    }

    alert.status = ParentNotificationStatus.READ;
    alert.readAt = new Date();

    return this.notificationRepo.save(alert);
  }

  /**
   * Archive old alerts
   */
  async archiveOldAlerts(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepo.update(
      {
        status: ParentNotificationStatus.READ,
        readAt: LessThan(cutoffDate),
      },
      { status: ParentNotificationStatus.ARCHIVED },
    );

    return result.affected || 0;
  }

  /**
   * Create an alert notification
   */
  private async createAlert(alertData: AlertData, parent: ParentAccount): Promise<ParentNotification> {
    const notificationType = this.mapAlertTypeToNotificationType(alertData.type);
    const priority = this.determineAlertPriority(alertData.type);

    const notification = this.notificationRepo.create({
      parentAccountId: parent.id,
      studentId: alertData.studentId,
      notificationType,
      title: alertData.title,
      message: alertData.message,
      priority,
      status: ParentNotificationStatus.PENDING,
      studentSnapshot: {
        name: alertData.studentName,
      },
      metadata: alertData.data || {},
    });

    const saved = await this.notificationRepo.save(notification);

    // Send email if parent prefers email notifications
    if (parent.preferredReportFormat === 'email' || parent.preferredReportFormat === 'both') {
      await this.sendAlertEmail(parent, alertData);
    }

    // Mark as sent
    saved.status = ParentNotificationStatus.SENT;
    saved.sentViaInApp = true;
    saved.sentViaEmail = parent.preferredReportFormat === 'email' || parent.preferredReportFormat === 'both';
    saved.sentAt = new Date();
    await this.notificationRepo.save(saved);

    this.logger.debug(`Alert created: ${saved.id} for parent ${parent.id}`);

    return saved;
  }

  /**
   * Send alert via email
   */
  private async sendAlertEmail(parent: ParentAccount, alertData: AlertData): Promise<void> {
    try {
      // Get parent's profile for email
      const profile = await this.profileRepo.findOne({
        where: { id: parent.profileId },
      });

      if (!profile?.email) {
        this.logger.warn(`No email found for parent ${parent.id}`);
        return;
      }

      const html = this.buildAlertEmailTemplate(alertData);
      await this.mailService.sendEmail(profile.email, alertData.title, html);

      this.logger.debug(`Alert email sent to ${profile.email}`);
    } catch (error) {
      this.logger.error(`Failed to send alert email to parent ${parent.id}:`, error);
    }
  }

  /**
   * Build email template for alerts
   */
  private buildAlertEmailTemplate(alertData: AlertData): string {
    const iconMap: Record<AlertType, string> = {
      [AlertType.LOW_PERFORMANCE]: '',
      [AlertType.ACHIEVEMENT]: '',
      [AlertType.STREAK_LOSS]: '',
      [AlertType.INACTIVITY]: '',
      [AlertType.RANK_PROMOTION]: '',
      [AlertType.ASSIGNMENT_DUE]: '',
    };

    const colorMap: Record<AlertType, string> = {
      [AlertType.LOW_PERFORMANCE]: '#f44336',
      [AlertType.ACHIEVEMENT]: '#4caf50',
      [AlertType.STREAK_LOSS]: '#ff9800',
      [AlertType.INACTIVITY]: '#9e9e9e',
      [AlertType.RANK_PROMOTION]: '#9c27b0',
      [AlertType.ASSIGNMENT_DUE]: '#2196f3',
    };

    const icon = iconMap[alertData.type] || '';
    const color = colorMap[alertData.type] || '#667eea';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-icon { font-size: 48px; margin-bottom: 10px; }
          .student-name { font-size: 14px; opacity: 0.9; }
          .button { display: inline-block; padding: 12px 30px; background: ${color}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="alert-icon">${icon}</div>
            <h1>${alertData.title}</h1>
            <div class="student-name">Estudiante: ${alertData.studentName}</div>
          </div>
          <div class="content">
            <p>${alertData.message}</p>
            <p style="text-align: center;">
              <a href="#" class="button">Ver en GAMILIT</a>
            </p>
            <p>Saludos,<br>El equipo de GAMILIT</p>
          </div>
          <div class="footer">
            <p>Este es un correo automatico. Para cambiar tus preferencias de notificacion, visita tu perfil en GAMILIT.</p>
            <p>&copy; 2026 GAMILIT - Plataforma Educativa Gamificada</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get student profile
   */
  private async getStudentProfile(studentId: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { id: studentId },
    });

    if (!profile) {
      throw new NotFoundException(`Student profile ${studentId} not found`);
    }

    return profile;
  }

  /**
   * Get display name from profile, with fallback
   */
  private getStudentDisplayName(profile: Profile): string {
    return profile.display_name || profile.full_name || profile.email || 'Estudiante';
  }

  /**
   * Get active parent accounts for a student
   */
  private async getActiveParents(
    studentId: string,
    alertPreference?: keyof ParentAccount,
  ): Promise<ParentAccount[]> {
    const links = await this.linkRepo.find({
      where: {
        studentId,
        linkStatus: LinkStatus.ACTIVE,
        canReceiveNotifications: true,
      },
    });

    const parentIds = links.map((l) => l.parentAccountId);

    if (parentIds.length === 0) {
      return [];
    }

    const parents = await this.parentAccountRepo
      .createQueryBuilder('p')
      .where('p.id IN (:...ids)', { ids: parentIds })
      .andWhere('p.is_active = true')
      .andWhere('p.can_receive_alerts = true')
      .getMany();

    // Filter by alert preference if specified
    if (alertPreference) {
      return parents.filter((p) => (p as any)[alertPreference] === true);
    }

    return parents;
  }

  /**
   * Map alert type to notification type
   */
  private mapAlertTypeToNotificationType(alertType: AlertType): ParentNotificationType {
    const map: Record<AlertType, ParentNotificationType> = {
      [AlertType.LOW_PERFORMANCE]: ParentNotificationType.LOW_PERFORMANCE,
      [AlertType.ACHIEVEMENT]: ParentNotificationType.ACHIEVEMENT_UNLOCKED,
      [AlertType.STREAK_LOSS]: ParentNotificationType.INACTIVITY_ALERT,
      [AlertType.INACTIVITY]: ParentNotificationType.INACTIVITY_ALERT,
      [AlertType.RANK_PROMOTION]: ParentNotificationType.RANK_PROMOTION,
      [AlertType.ASSIGNMENT_DUE]: ParentNotificationType.ASSIGNMENT_DUE,
    };
    return map[alertType] || ParentNotificationType.CUSTOM;
  }

  /**
   * Determine alert priority based on type
   */
  private determineAlertPriority(alertType: AlertType): NotificationPriority {
    const priorityMap: Record<AlertType, NotificationPriority> = {
      [AlertType.LOW_PERFORMANCE]: NotificationPriority.HIGH,
      [AlertType.ACHIEVEMENT]: NotificationPriority.NORMAL,
      [AlertType.STREAK_LOSS]: NotificationPriority.NORMAL,
      [AlertType.INACTIVITY]: NotificationPriority.LOW,
      [AlertType.RANK_PROMOTION]: NotificationPriority.NORMAL,
      [AlertType.ASSIGNMENT_DUE]: NotificationPriority.HIGH,
    };
    return priorityMap[alertType] || NotificationPriority.NORMAL;
  }
}
