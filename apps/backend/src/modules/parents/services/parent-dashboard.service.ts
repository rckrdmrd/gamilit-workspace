/**
 * ParentDashboardService
 *
 * EXT-011 Parent Portal - Dashboard Service
 *
 * @description Provides dashboard data for parent portal including
 * linked students, progress summaries, activities, and assignments.
 *
 * @see ET-PAR-002-portal-dashboard.md
 * @created 2026-01-27
 */

import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';

import { ParentAccount } from '@/modules/auth/entities/parent-account.entity';
import { ParentStudentLink } from '@/modules/auth/entities/parent-student-link.entity';
import { LinkStatus } from '@/modules/parents/enums/parent-student-link.enums';
import { ParentNotification, ParentNotificationStatus } from '@/modules/auth/entities/parent-notification.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';

import {
  ParentDashboardDto,
  LinkedStudentDto,
  StudentProgressSummaryDto,
  RecentActivityDto,
  UpcomingAssignmentDto,
} from '../dto/parent-response.dto';
import { ReportContentAggregatorService } from './report-content-aggregator.service';

@Injectable()
export class ParentDashboardService {
  private readonly logger = new Logger(ParentDashboardService.name);

  constructor(
    @InjectRepository(ParentAccount, 'auth')
    private readonly parentAccountRepo: Repository<ParentAccount>,
    @InjectRepository(ParentStudentLink, 'auth')
    private readonly linkRepo: Repository<ParentStudentLink>,
    @InjectRepository(ParentNotification, 'auth')
    private readonly notificationRepo: Repository<ParentNotification>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
    @InjectDataSource('gamification')
    private readonly gamificationDs: DataSource,
    @InjectDataSource('progress')
    private readonly progressDs: DataSource,
    @InjectDataSource('educational')
    private readonly educationalDs: DataSource,
    private readonly aggregatorService: ReportContentAggregatorService,
  ) {}

  /**
   * Get complete dashboard data for a parent
   */
  async getDashboard(parentAccountId: string): Promise<ParentDashboardDto> {
    this.logger.debug(`Getting dashboard for parent ${parentAccountId}`);

    // Get linked students
    const students = await this.getLinkedStudents(parentAccountId);

    if (students.length === 0) {
      return {
        students: [],
        progressSummaries: [],
        recentActivities: [],
        upcomingAssignments: [],
        unreadNotifications: 0,
        unreadMessages: 0,
      };
    }

    const studentIds = students.map((s) => s.studentId);

    // Fetch all data in parallel
    const [
      progressSummaries,
      recentActivities,
      upcomingAssignments,
      unreadNotifications,
    ] = await Promise.all([
      this.getProgressSummaries(studentIds),
      this.getRecentActivities(parentAccountId, studentIds),
      this.getUpcomingAssignments(studentIds),
      this.getUnreadNotificationCount(parentAccountId),
    ]);

    return {
      students,
      progressSummaries,
      recentActivities,
      upcomingAssignments,
      unreadNotifications,
      unreadMessages: 0, // TODO: Implement messages count
    };
  }

  /**
   * Get linked students for a parent
   */
  async getLinkedStudents(parentAccountId: string): Promise<LinkedStudentDto[]> {
    const links = await this.linkRepo.find({
      where: {
        parentAccountId,
        linkStatus: LinkStatus.ACTIVE,
      },
      relations: ['student'],
    });

    return links.map((link) => ({
      studentId: link.studentId,
      linkId: link.id,
      displayName: link.student?.display_name || 'Unknown',
      avatarUrl: link.student?.avatar_url || undefined,
      relationshipType: link.relationshipType,
      linkStatus: link.linkStatus,
      canViewProgress: link.canViewProgress,
      canViewGrades: link.canViewGrades,
      canReceiveNotifications: link.canReceiveNotifications,
      canContactTeachers: link.canContactTeachers,
      linkedAt: link.activatedAt || link.createdAt,
    }));
  }

  /**
   * Get progress summaries for multiple students
   */
  async getProgressSummaries(studentIds: string[]): Promise<StudentProgressSummaryDto[]> {
    const summaries: StudentProgressSummaryDto[] = [];

    // Calculate week range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    for (const studentId of studentIds) {
      try {
        const summary = await this.getStudentProgressSummary(studentId, startDate, endDate);
        summaries.push(summary);
      } catch (error) {
        this.logger.warn(`Failed to get progress for student ${studentId}:`, error);
      }
    }

    return summaries;
  }

  /**
   * Get progress summary for a single student
   */
  async getStudentProgressSummary(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<StudentProgressSummaryDto> {
    // Get student profile
    const profile = await this.profileRepo.findOne({
      where: { id: studentId },
    });

    if (!profile) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    // Get aggregated progress data
    const progressData = await this.aggregatorService.aggregateStudentProgress(
      studentId,
      startDate,
      endDate,
    );

    return {
      studentId,
      displayName: profile.display_name || profile.full_name || profile.email,
      currentLevel: progressData.currentLevel,
      currentRank: progressData.currentRank,
      totalXp: progressData.totalXp,
      xpThisWeek: progressData.xpEarned,
      currentStreak: progressData.currentStreak,
      exercisesCompletedThisWeek: progressData.exercisesCompleted,
      averageAccuracyThisWeek: progressData.averageAccuracy,
      modulesInProgress: progressData.modulesStarted,
      modulesCompleted: progressData.modulesCompleted,
      recentAchievements: progressData.achievementsUnlocked,
      lastActivityDate: progressData.lastActivityDate || undefined,
    };
  }

  /**
   * Get detailed progress for a specific student (with permission check)
   */
  async getStudentDetailedProgress(
    parentAccountId: string,
    studentId: string,
  ): Promise<StudentProgressSummaryDto> {
    // Verify parent has access to this student
    const link = await this.linkRepo.findOne({
      where: {
        parentAccountId,
        studentId,
        linkStatus: LinkStatus.ACTIVE,
        canViewProgress: true,
      },
    });

    if (!link) {
      throw new ForbiddenException('No tienes acceso al progreso de este estudiante');
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days for detailed view

    return this.getStudentProgressSummary(studentId, startDate, endDate);
  }

  /**
   * Get recent activities across all linked students
   */
  async getRecentActivities(
    parentAccountId: string,
    studentIds: string[],
    limit: number = 20,
  ): Promise<RecentActivityDto[]> {
    if (studentIds.length === 0) return [];

    const activities: RecentActivityDto[] = [];

    // Get student profiles for names
    const profiles = await this.profileRepo.find({
      where: { id: In(studentIds) },
    });
    const profileMap = new Map(profiles.map((p) => [p.id, p.display_name]));

    try {
      // Get exercise completions
      const exerciseActivities = await this.progressDs.query(
        `
        SELECT
          es.id,
          es.user_id as student_id,
          'exercise_completed' as activity_type,
          e.title,
          es.score,
          es.xp_earned,
          es.submitted_at as timestamp
        FROM progress_tracking.exercise_submissions es
        JOIN educational_content.exercises e ON es.exercise_id = e.id
        WHERE es.user_id = ANY($1)
          AND es.status = 'graded'
        ORDER BY es.submitted_at DESC
        LIMIT $2
        `,
        [studentIds, limit],
      );

      for (const ea of exerciseActivities) {
        activities.push({
          id: ea.id,
          studentId: ea.student_id,
          studentName: profileMap.get(ea.student_id) || 'Unknown',
          activityType: 'exercise_completed',
          title: `Ejercicio completado: ${ea.title}`,
          description: `Puntaje: ${ea.score}%`,
          xpEarned: ea.xp_earned,
          timestamp: new Date(ea.timestamp),
        });
      }

      // Get achievements
      const achievementActivities = await this.gamificationDs.query(
        `
        SELECT
          ua.id,
          ua.user_id as student_id,
          'achievement_unlocked' as activity_type,
          a.name as title,
          a.description,
          a.xp_reward as xp_earned,
          ua.completed_at as timestamp
        FROM gamification_system.user_achievements ua
        JOIN gamification_system.achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ANY($1)
          AND ua.is_completed = true
          AND ua.completed_at IS NOT NULL
        ORDER BY ua.completed_at DESC
        LIMIT $2
        `,
        [studentIds, limit],
      );

      for (const aa of achievementActivities) {
        activities.push({
          id: aa.id,
          studentId: aa.student_id,
          studentName: profileMap.get(aa.student_id) || 'Unknown',
          activityType: 'achievement_unlocked',
          title: `Logro desbloqueado: ${aa.title}`,
          description: aa.description,
          xpEarned: aa.xp_earned,
          timestamp: new Date(aa.timestamp),
        });
      }

      // Sort by timestamp and limit
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return activities.slice(0, limit);
    } catch (error) {
      this.logger.warn(`Failed to get recent activities:`, error);
      return [];
    }
  }

  /**
   * Get upcoming assignments for students
   */
  async getUpcomingAssignments(
    studentIds: string[],
    limit: number = 10,
  ): Promise<UpcomingAssignmentDto[]> {
    if (studentIds.length === 0) return [];

    // Get student profiles for names
    const profiles = await this.profileRepo.find({
      where: { id: In(studentIds) },
    });
    const profileMap = new Map(profiles.map((p) => [p.id, p.display_name]));

    try {
      const assignments = await this.educationalDs.query(
        `
        SELECT
          a.id,
          a.title,
          a.description,
          a.due_date,
          sa.student_id,
          sa.status,
          c.name as class_name,
          p.display_name as teacher_name
        FROM educational_content.assignments a
        JOIN educational_content.student_assignments sa ON a.id = sa.assignment_id
        LEFT JOIN educational_content.classroom_assignments ca ON a.id = ca.assignment_id
        LEFT JOIN social_features.classrooms c ON ca.classroom_id = c.id
        LEFT JOIN auth_management.profiles p ON a.teacher_id = p.id
        WHERE sa.student_id = ANY($1)
          AND a.due_date >= NOW()
          AND sa.status IN ('pending', 'in_progress')
        ORDER BY a.due_date ASC
        LIMIT $2
        `,
        [studentIds, limit],
      );

      return assignments.map((a: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: a.id,
        studentId: a.student_id,
        studentName: profileMap.get(a.student_id) || 'Unknown',
        title: a.title,
        description: a.description || '',
        dueDate: new Date(a.due_date),
        status: a.status,
        teacherName: a.teacher_name,
        className: a.class_name,
      }));
    } catch (error) {
      this.logger.warn(`Failed to get upcoming assignments:`, error);
      return [];
    }
  }

  /**
   * Get unread notification count for parent
   */
  async getUnreadNotificationCount(parentAccountId: string): Promise<number> {
    try {
      const count = await this.notificationRepo.count({
        where: {
          parentAccountId,
          status: ParentNotificationStatus.PENDING,
        },
      });
      return count;
    } catch (error) {
      this.logger.warn(`Failed to get notification count:`, error);
      return 0;
    }
  }

  /**
   * Get notifications for parent
   */
  async getNotifications(
    parentAccountId: string,
    options?: {
      studentId?: string;
      status?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<ParentNotification[]> {
    const query: Record<string, unknown> = { parentAccountId };

    if (options?.studentId) {
      query.studentId = options.studentId;
    }
    if (options?.status) {
      query.status = options.status;
    }

    return this.notificationRepo.find({
      where: query,
      order: { createdAt: 'DESC' },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    });
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(
    parentAccountId: string,
    notificationId: string,
  ): Promise<void> {
    const notification = await this.notificationRepo.findOne({
      where: {
        id: notificationId,
        parentAccountId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notificacion no encontrada');
    }

    await this.notificationRepo.update(notificationId, {
      status: ParentNotificationStatus.READ,
      readAt: new Date(),
    });
  }
}
