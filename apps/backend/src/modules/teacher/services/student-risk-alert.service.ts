/**
 * Student Risk Alert Service
 *
 * Automatically monitors student insights and triggers alerts
 * when high-risk situations are detected
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { Classroom } from '@/modules/social/entities/classroom.entity';
import { ClassroomMember } from '@/modules/social/entities/classroom-member.entity';
import { AnalyticsService } from './analytics.service';
// P0-04: Migrado a NotificationService consolidado (2026-01-04)
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { GamilityRoleEnum, NotificationTypeEnum } from '@/shared/constants/enums.constants';

export interface RiskAlert {
  student_id: string;
  student_name: string;
  risk_level: 'high' | 'medium';
  overall_score: number;
  completion_rate: number;
  dropout_risk: number;
  teacher_ids: string[];
  classroom_ids: string[];
  recommendations: string[];
  detected_at: Date;
}

/**
 * Service for monitoring and alerting on at-risk students
 *
 * Features:
 * - Automatic daily scan of all students
 * - High-risk student detection
 * - Notification to teachers
 * - Alert history tracking
 */
@Injectable()
export class StudentRiskAlertService {
  private readonly logger = new Logger(StudentRiskAlertService.name);

  constructor(
    @InjectRepository(Profile, 'auth')
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Classroom, 'social')
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(ClassroomMember, 'social')
    private readonly classroomMemberRepository: Repository<ClassroomMember>,
    private readonly analyticsService: AnalyticsService,
    // P0-04: Migrado a NotificationService consolidado (2026-01-04)
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Scheduled job: Scan all students daily for high-risk situations
   *
   * Runs every day at 8:00 AM
   * Can also be triggered manually via API endpoint
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async scanAllStudentsForRisk(): Promise<RiskAlert[]> {
    this.logger.log('Starting daily student risk scan...');

    try {
      // Get all active students
      const students = await this.profileRepository.find({
        where: { role: GamilityRoleEnum.STUDENT },
      });

      this.logger.log(`Scanning ${students.length} students for risk indicators`);

      const alerts: RiskAlert[] = [];

      // Process students in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < students.length; i += batchSize) {
        const batch = students.slice(i, i + batchSize);

        const batchAlerts = await Promise.all(
          batch.map(student => this.checkStudentRisk(student.id)),
        );

        alerts.push(...batchAlerts.filter(alert => alert !== null) as RiskAlert[]);

        // Small delay between batches to avoid DB overload
        if (i + batchSize < students.length) {
          await this.delay(1000); // 1 second
        }
      }

      this.logger.log(`Risk scan complete. Found ${alerts.length} at-risk students`);

      // Process alerts (send notifications, create tickets, etc.)
      if (alerts.length > 0) {
        await this.processAlerts(alerts);
      }

      return alerts;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error during risk scan: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Check if a specific student is at risk
   *
   * Returns alert if student is high or medium risk, null otherwise
   */
  async checkStudentRisk(studentId: string): Promise<RiskAlert | null> {
    try {
      // Get student insights
      const insights = await this.analyticsService.getStudentInsights(studentId);

      // Only alert for medium and high risk
      if (insights.risk_level === 'low') {
        return null;
      }

      // Get student info
      const student = await this.profileRepository.findOne({
        where: { id: studentId },
      });

      if (!student) {
        this.logger.warn(`Student ${studentId} not found during risk check`);
        return null;
      }

      // Get student's classrooms and teachers
      const memberships = await this.classroomMemberRepository.find({
        where: { student_id: studentId, is_active: true },
      });

      const classroomIds = memberships.map(m => m.classroom_id);

      // Get teacher IDs from classrooms
      const classrooms = await this.classroomRepository.findByIds(classroomIds);
      const teacherIds = [...new Set(classrooms.map(c => c.teacher_id).filter(Boolean))];

      const completionRate = insights.modules_total > 0
        ? (insights.modules_completed / insights.modules_total) * 100
        : 0;

      const alert: RiskAlert = {
        student_id: studentId,
        student_name: student.full_name || student.display_name || 'Unknown',
        risk_level: insights.risk_level as 'high' | 'medium',
        overall_score: insights.overall_score,
        completion_rate: Math.round(completionRate),
        dropout_risk: insights.predictions.dropout_risk,
        teacher_ids: teacherIds,
        classroom_ids: classroomIds,
        recommendations: insights.recommendations,
        detected_at: new Date(),
      };

      this.logger.log(
        `ALERT: ${alert.risk_level.toUpperCase()} risk detected for student ${student.full_name} (${studentId})`,
      );

      return alert;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error checking risk for student ${studentId}: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Process alerts by sending notifications to teachers
   *
   * P0-04: Fully integrated with NotificationService (2026-01-04)
   * Sends notifications via multi-channel system to teachers and admins
   */
  private async processAlerts(alerts: RiskAlert[]): Promise<void> {
    this.logger.log(`Processing ${alerts.length} risk alerts`);

    // Group alerts by teacher for batch notifications
    const alertsByTeacher = new Map<string, RiskAlert[]>();

    for (const alert of alerts) {
      for (const teacherId of alert.teacher_ids) {
        if (!alertsByTeacher.has(teacherId)) {
          alertsByTeacher.set(teacherId, []);
        }
        alertsByTeacher.get(teacherId)!.push(alert);
      }
    }

    // Send notifications to each teacher
    for (const [teacherId, teacherAlerts] of alertsByTeacher.entries()) {
      await this.sendTeacherAlert(teacherId, teacherAlerts);
    }

    // Also send summary to admins if there are high-risk students
    const highRiskAlerts = alerts.filter(a => a.risk_level === 'high');
    if (highRiskAlerts.length > 0) {
      await this.sendAdminSummary(highRiskAlerts);
    }
  }

  /**
   * Send alert notification to teacher about at-risk students
   *
   * P0-04: Implemented 2025-12-18 - NotificationsService integration
   */
  private async sendTeacherAlert(teacherId: string, alerts: RiskAlert[]): Promise<void> {
    const highRiskCount = alerts.filter(a => a.risk_level === 'high').length;
    const mediumRiskCount = alerts.filter(a => a.risk_level === 'medium').length;
    const totalAlerts = highRiskCount + mediumRiskCount;

    this.logger.log(
      `[NOTIFICATION] Teacher ${teacherId}: ${highRiskCount} high-risk, ${mediumRiskCount} medium-risk students`,
    );

    try {
      // P0-04: Migrado a NotificationService.create() (2026-01-04)
      await this.notificationService.create({
        userId: teacherId,
        type: NotificationTypeEnum.SYSTEM_ANNOUNCEMENT,
        title: highRiskCount > 0
          ? `⚠️ Alerta: ${totalAlerts} estudiantes requieren atención urgente`
          : `📊 ${totalAlerts} estudiantes requieren seguimiento`,
        message: this.formatAlertMessage(alerts),
        data: {
          alertType: 'student_risk',
          highRiskCount,
          mediumRiskCount,
          studentIds: alerts.map(a => a.student_id),
          action: {
            type: 'navigate',
            url: '/teacher/alerts',
          },
        },
        priority: highRiskCount > 0 ? 'high' : 'normal',
      });

      this.logger.log(`✅ Notification sent to teacher ${teacherId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send notification to teacher ${teacherId}: ${errorMessage}`);
    }

    // Log detailed info for debugging
    for (const alert of alerts) {
      this.logger.debug(
        `  - ${alert.student_name}: ${alert.risk_level} risk, ${alert.overall_score}% score, ${alert.dropout_risk * 100}% dropout risk`,
      );
    }
  }

  /**
   * Send summary to admins about high-risk students across the platform
   *
   * P0-04: Implemented 2025-12-18 - NotificationsService integration
   */
  private async sendAdminSummary(highRiskAlerts: RiskAlert[]): Promise<void> {
    this.logger.log(
      `[ADMIN SUMMARY] ${highRiskAlerts.length} high-risk students detected across platform`,
    );

    try {
      // Get all super admins
      const admins = await this.profileRepository.find({
        where: { role: GamilityRoleEnum.SUPER_ADMIN },
      });

      if (admins.length === 0) {
        this.logger.warn('No super admins found to receive risk summary');
        return;
      }

      // Prepare summary message
      const summaryLines = [
        `🚨 Resumen de Riesgo de Plataforma`,
        ``,
        `Se han detectado ${highRiskAlerts.length} estudiantes en ALTO RIESGO:`,
        ``,
      ];

      for (const alert of highRiskAlerts.slice(0, 10)) { // Limit to first 10
        summaryLines.push(`• ${alert.student_name} - Riesgo abandono: ${Math.round(alert.dropout_risk * 100)}%`);
      }

      if (highRiskAlerts.length > 10) {
        summaryLines.push(`... y ${highRiskAlerts.length - 10} más`);
      }

      summaryLines.push(``);
      summaryLines.push(`Revisa el panel de administración para acciones.`);

      const summaryMessage = summaryLines.join('\n');

      // P0-04: Migrado a NotificationService.create() con Promise.all (2026-01-04)
      await Promise.all(admins.map(admin =>
        this.notificationService.create({
          userId: admin.id,
          type: NotificationTypeEnum.SYSTEM_ANNOUNCEMENT,
          title: `🚨 Alerta Crítica: ${highRiskAlerts.length} estudiantes en alto riesgo`,
          message: summaryMessage,
          data: {
            alertType: 'platform_risk_summary',
            highRiskCount: highRiskAlerts.length,
            studentIds: highRiskAlerts.map(a => a.student_id),
            action: {
              type: 'navigate',
              url: '/admin/alerts',
            },
          },
          priority: 'urgent',
        }),
      ));

      this.logger.log(`✅ Admin summary sent to ${admins.length} administrators`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send admin summary: ${errorMessage}`);
    }
  }

  /**
   * Format alert message for notifications
   */
  private formatAlertMessage(alerts: RiskAlert[]): string {
    const lines = [
      `Se han detectado ${alerts.length} estudiantes que requieren atención:`,
      '',
    ];

    for (const alert of alerts) {
      lines.push(`• ${alert.student_name}`);
      lines.push(`  Nivel de riesgo: ${alert.risk_level === 'high' ? 'ALTO' : 'MEDIO'}`);
      lines.push(`  Puntuación general: ${alert.overall_score}%`);
      lines.push(`  Riesgo de abandono: ${Math.round(alert.dropout_risk * 100)}%`);

      if (alert.recommendations.length > 0) {
        lines.push(`  Recomendación: ${alert.recommendations[0]}`);
      }

      lines.push('');
    }

    lines.push('Revisa el panel de alertas para más detalles y acciones sugeridas.');

    return lines.join('\n');
  }

  /**
   * Get all current alerts (for API/Dashboard)
   */
  async getCurrentAlerts(teacherId?: string): Promise<RiskAlert[]> {
    // Get all students (or filter by teacher)
    let students: Profile[];

    if (teacherId) {
      // Get students from teacher's classrooms
      const classrooms = await this.classroomRepository.find({
        where: { teacher_id: teacherId },
      });

      const classroomIds = classrooms.map(c => c.id);

      const memberships = await this.classroomMemberRepository.find({
        where: { is_active: true },
      });

      const studentIds = memberships
        .filter(m => classroomIds.includes(m.classroom_id))
        .map(m => m.student_id);

      students = await this.profileRepository.findByIds(studentIds);
    } else {
      students = await this.profileRepository.find({
        where: { role: GamilityRoleEnum.STUDENT },
      });
    }

    // Check each student for risk
    const alerts = await Promise.all(
      students.map(s => this.checkStudentRisk(s.id)),
    );

    return alerts.filter(a => a !== null) as RiskAlert[];
  }

  /**
   * Utility: delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
