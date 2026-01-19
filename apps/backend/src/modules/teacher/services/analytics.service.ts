/**
 * Analytics Service
 *
 * Provides classroom-wide analytics and insights
 */

import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { Classroom } from '@/modules/social/entities/classroom.entity';
import { ClassroomMember } from '@/modules/social/entities/classroom-member.entity';
import { Assignment } from '@/modules/assignments/entities/assignment.entity';
import { AssignmentSubmission } from '@/modules/assignments/entities/assignment-submission.entity';
import { UserStats } from '@/modules/gamification/entities/user-stats.entity';
import { Achievement } from '@/modules/gamification/entities/achievement.entity';
import { UserAchievement } from '@/modules/gamification/entities/user-achievement.entity';
// TASK-2026-01-18-015 Sprint 2: Added for mastery and skill assessments
import { MasteryTracking } from '@/modules/progress/entities/mastery-tracking.entity';
import { SkillAssessment } from '@/modules/progress/entities/skill-assessment.entity';
import {
  GetAnalyticsQueryDto,
  GetEngagementMetricsDto,
  GenerateReportsDto,
  StudentInsightsResponseDto,
  EconomyAnalyticsDto,
  StudentsEconomyResponseDto,
  StudentEconomyDto,
  AchievementsStatsResponseDto,
  AchievementStatsDto,
} from '../dto';
import { GamilityRoleEnum } from '@/shared/constants/enums.constants';
import { StudentProgressService } from './student-progress.service';

/**
 * Analytics Service
 *
 * Provides classroom-wide analytics and insights with caching support
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  private readonly CACHE_TTL = 300; // 5 minutes in seconds

  private readonly INSIGHTS_CACHE_PREFIX = 'student-insights:';

  constructor(
    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly submissionRepository: Repository<ExerciseSubmission>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Classroom, 'social')
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(ClassroomMember, 'social')
    private readonly classroomMemberRepository: Repository<ClassroomMember>,
    @InjectRepository(Assignment, 'educational')
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(AssignmentSubmission, 'educational')
    private readonly assignmentSubmissionRepository: Repository<AssignmentSubmission>,
    @InjectRepository(UserStats, 'gamification')
    private readonly userStatsRepository: Repository<UserStats>,
    @InjectRepository(Achievement, 'gamification')
    private readonly achievementRepository: Repository<Achievement>,
    @InjectRepository(UserAchievement, 'gamification')
    private readonly userAchievementRepository: Repository<UserAchievement>,
    // TASK-2026-01-18-015 Sprint 2: Added for mastery and skill assessments
    @InjectRepository(MasteryTracking, 'progress')
    private readonly masteryTrackingRepository: Repository<MasteryTracking>,
    @InjectRepository(SkillAssessment, 'progress')
    private readonly skillAssessmentRepository: Repository<SkillAssessment>,
    private readonly studentProgressService: StudentProgressService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Get comprehensive classroom analytics
   */
  async getClassroomAnalytics(_query: GetAnalyticsQueryDto) {
    const students = await this.profileRepository.find({
      where: { role: GamilityRoleEnum.STUDENT },
    });

    const submissions = await this.submissionRepository.find();

    // Calculate main metrics
    const totalStudents = students.length;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeStudents = students.filter(
      (s) => s.last_activity_at && s.last_activity_at >= sevenDaysAgo,
    ).length;

    const avgScore = submissions.length > 0
      ? Math.round(
        submissions.reduce(
          (sum, sub) => sum + (sub.score / sub.max_score) * 100,
          0,
        ) / submissions.length,
      )
      : 0;

    const completedSubmissions = submissions.filter(
      (s) => s.is_correct,
    ).length;
    const avgCompletionRate = submissions.length > 0
      ? Math.round((completedSubmissions / submissions.length) * 100)
      : 0;

    // Score distribution
    const scoreRanges = [
      { range: '0-20%', count: 0, percentage: 0 },
      { range: '21-40%', count: 0, percentage: 0 },
      { range: '41-60%', count: 0, percentage: 0 },
      { range: '61-80%', count: 0, percentage: 0 },
      { range: '81-100%', count: 0, percentage: 0 },
    ];

    submissions.forEach((sub) => {
      const percentage = (sub.score / sub.max_score) * 100;
      if (percentage <= 20) scoreRanges[0].count++;
      else if (percentage <= 40) scoreRanges[1].count++;
      else if (percentage <= 60) scoreRanges[2].count++;
      else if (percentage <= 80) scoreRanges[3].count++;
      else scoreRanges[4].count++;
    });

    scoreRanges.forEach((range) => {
      range.percentage = submissions.length > 0
        ? Math.round((range.count / submissions.length) * 100)
        : 0;
    });

    // Calculate total time spent from submissions (sum of time_spent_seconds / 60)
    const totalTimeSpentMinutes = Math.round(
      submissions.reduce((sum, sub) => sum + (sub.time_spent_seconds || 0), 0) / 60,
    );

    // Count achievements unlocked by all students
    const achievementsUnlocked = await this.userAchievementRepository.count();

    return {
      analytics: {
        total_students: totalStudents,
        active_students: activeStudents,
        average_score: avgScore,
        average_completion_rate: avgCompletionRate,
        total_time_spent_minutes: totalTimeSpentMinutes,
        exercises_completed: submissions.length,
        achievements_unlocked: achievementsUnlocked,
      },
      scoreDistribution: scoreRanges,
    };
  }

  /**
   * Get analytics for a specific classroom
   */
  async getClassroomAnalyticsByClassroomId(
    classroomId: string,
    query: GetAnalyticsQueryDto,
  ) {
    // Verify classroom exists
    const classroom = await this.classroomRepository.findOne({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom ${classroomId} not found`);
    }

    // Get classroom members
    const members = await this.classroomMemberRepository.find({
      where: { classroom_id: classroomId, is_active: true },
    });

    const studentIds = members.map((m) => m.student_id);

    // Calculate time filter
    let dateFilter: Date | undefined;
    if (query.time_range) {
      const now = new Date();
      switch (query.time_range) {
        case '7d':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Get submissions for classroom students
    const queryBuilder = this.submissionRepository.createQueryBuilder('sub');

    if (studentIds.length > 0) {
      queryBuilder.where('sub.user_id IN (:...studentIds)', { studentIds });
    }

    if (dateFilter) {
      queryBuilder.andWhere('sub.submitted_at >= :dateFilter', { dateFilter });
    }

    const submissions = await queryBuilder.getMany();

    // Calculate metrics
    const totalStudents = members.length;
    const activeStudents = members.filter((_m) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      // Would need last_activity_at field on ClassroomMember
      return true; // Placeholder
    }).length;

    const avgScore =
      submissions.length > 0
        ? Math.round(
          submissions.reduce(
            (sum, sub) => sum + (sub.score / sub.max_score) * 100,
            0,
          ) / submissions.length,
        )
        : 0;

    return {
      classroom_id: classroom.id,
      classroom_name: classroom.name,
      analytics: {
        total_students: totalStudents,
        active_students: activeStudents,
        average_score: avgScore,
        exercises_completed: submissions.length,
        completion_rate:
          submissions.length > 0
            ? Math.round(
              (submissions.filter((s) => s.is_correct).length /
                  submissions.length) *
                  100,
            )
            : 0,
      },
    };
  }

  /**
   * Get analytics for a specific assignment
   */
  async getAssignmentAnalytics(assignmentId: string) {
    // Get assignment
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment ${assignmentId} not found`);
    }

    // Get all submissions for this assignment
    const submissions = await this.assignmentSubmissionRepository.find({
      where: { assignmentId: assignmentId },
    });

    // Calculate metrics
    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter((s) => s.score !== null).length;
    const pendingSubmissions = submissions.filter(
      (s) => s.score === null && s.submittedAt !== null,
    ).length;
    const lateSubmissions = submissions.filter((s) => {
      if (!assignment.dueDate || !s.submittedAt) return false;
      return s.submittedAt > assignment.dueDate;
    }).length;

    const avgScore =
      gradedSubmissions > 0
        ? Math.round(
          submissions
            .filter((s) => s.score !== null)
            .reduce((sum, sub) => sum + (sub.score || 0), 0) /
              gradedSubmissions,
        )
        : 0;

    // Score distribution
    const scoreRanges = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 },
    ];

    submissions
      .filter((s) => s.score !== null)
      .forEach((sub) => {
        const percentage = ((sub.score || 0) / assignment.totalPoints) * 100;
        if (percentage <= 20) scoreRanges[0].count++;
        else if (percentage <= 40) scoreRanges[1].count++;
        else if (percentage <= 60) scoreRanges[2].count++;
        else if (percentage <= 80) scoreRanges[3].count++;
        else scoreRanges[4].count++;
      });

    return {
      assignment_id: assignment.id,
      assignment_title: assignment.title,
      assignment_type: assignment.assignmentType,
      total_points: assignment.totalPoints,
      due_date: assignment.dueDate,
      is_published: assignment.isPublished,
      analytics: {
        total_submissions: totalSubmissions,
        graded_submissions: gradedSubmissions,
        pending_submissions: pendingSubmissions,
        late_submissions: lateSubmissions,
        average_score: avgScore,
        submission_rate: 0, // Would need total students count
      },
      score_distribution: scoreRanges,
    };
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(teacherId: string, query: GetEngagementMetricsDto) {
    // Get teacher's classrooms
    const classrooms = await this.classroomRepository.find({
      where: { teacher_id: teacherId },
    });

    const classroomIds = classrooms.map((c) => c.id);

    // Calculate time filter
    let dateFilter: Date | undefined;
    if (query.time_range) {
      const now = new Date();
      switch (query.time_range) {
        case '7d':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Get all members in teacher's classrooms
    const queryBuilder =
      this.classroomMemberRepository.createQueryBuilder('member');

    queryBuilder.where('member.classroom_id IN (:...classroomIds)', {
      classroomIds,
    });

    if (query.classroom_id) {
      queryBuilder.andWhere('member.classroom_id = :classroomId', {
        classroomId: query.classroom_id,
      });
    }

    const members = await queryBuilder.getMany();

    // Calculate engagement metrics
    const totalStudents = members.length;
    const activeStudents = members.filter((m) => m.is_active).length;

    // Get submissions in time range
    const submissionQueryBuilder =
      this.submissionRepository.createQueryBuilder('sub');

    if (dateFilter) {
      submissionQueryBuilder.where('sub.submitted_at >= :dateFilter', {
        dateFilter,
      });
    }

    const submissions = await submissionQueryBuilder.getMany();

    return {
      time_range: query.time_range || '30d',
      engagement_metrics: {
        total_students: totalStudents,
        active_students: activeStudents,
        engagement_rate:
          totalStudents > 0
            ? Math.round((activeStudents / totalStudents) * 100)
            : 0,
        total_submissions: submissions.length,
        average_submissions_per_student:
          totalStudents > 0
            ? Math.round(submissions.length / totalStudents)
            : 0,
        daily_active_users: 0, // Would need login tracking
        weekly_active_users: 0, // Would need login tracking
      },
      classrooms: classrooms.map((c) => ({
        classroom_id: c.id,
        classroom_name: c.name,
        student_count: members.filter((m) => m.classroom_id === c.id).length,
      })),
    };
  }

  /**
   * Generate comprehensive reports
   */
  async generateReports(teacherId: string, query: GenerateReportsDto) {
    // Get teacher's classrooms
    const classrooms = await this.classroomRepository.find({
      where: { teacher_id: teacherId },
    });

    // Get engagement metrics
    const engagementMetrics = await this.getEngagementMetrics(teacherId, {
      time_range: query.time_range,
      classroom_id: query.classroom_id,
    });

    // Get classroom analytics
    const classroomAnalytics = await Promise.all(
      classrooms
        .filter((c) => !query.classroom_id || c.id === query.classroom_id)
        .map((c) =>
          this.getClassroomAnalyticsByClassroomId(c.id, {
            time_range: query.time_range,
          }),
        ),
    );

    // Get teacher's assignments
    const assignments = await this.assignmentRepository.find({
      where: { teacherId: teacherId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      report_type: query.report_type || 'overall',
      format: query.format || 'json',
      time_range: query.time_range || '30d',
      generated_at: new Date().toISOString(),
      summary: {
        total_classrooms: classrooms.length,
        total_students: engagementMetrics.engagement_metrics.total_students,
        active_students: engagementMetrics.engagement_metrics.active_students,
        total_assignments: assignments.length,
      },
      engagement_metrics: engagementMetrics,
      classroom_analytics: classroomAnalytics,
      recent_assignments: assignments.map((a) => ({
        id: a.id,
        title: a.title,
        type: a.assignmentType,
        is_published: a.isPublished,
        due_date: a.dueDate,
        total_points: a.totalPoints,
        created_at: a.createdAt,
      })),
    };
  }

  /**
   * Get comprehensive insights for an individual student
   * Includes performance analysis, predictions, and recommendations
   *
   * Uses caching to improve performance. Cache TTL: 5 minutes
   * Cache can be cleared using invalidateStudentInsightsCache(studentId)
   */
  async getStudentInsights(studentId: string): Promise<StudentInsightsResponseDto> {
    const cacheKey = `${this.INSIGHTS_CACHE_PREFIX}${studentId}`;

    try {
      // Try to get from cache first
      const cachedInsights = await this.cacheManager.get<StudentInsightsResponseDto>(cacheKey);

      if (cachedInsights) {
        this.logger.debug(`Cache HIT for student insights: ${studentId}`);
        return cachedInsights;
      }

      this.logger.debug(`Cache MISS for student insights: ${studentId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Cache read error for ${cacheKey}: ${errorMessage}`);
      // Continue without cache on error
    }

    // Get comprehensive student data (including mastery and skills - TASK-2026-01-18-015 Sprint 2)
    const [stats, moduleProgress, struggleAreas, classComparison, masteryData, skillsData] = await Promise.all([
      this.studentProgressService.getStudentStats(studentId),
      this.studentProgressService.getModuleProgress(studentId),
      this.studentProgressService.getStruggleAreas(studentId),
      this.studentProgressService.getClassComparison(studentId),
      this.getMasteryData(studentId),
      this.getSkillAssessments(studentId),
    ]);

    // Calculate overall score (weighted average)
    const overall_score = Math.round(
      stats.average_score * 0.7 + // 70% weight on average score
      (stats.completed_modules / Math.max(stats.total_modules, 1)) * 100 * 0.3, // 30% on completion
    );

    // Find score percentile from class comparison
    const scoreComparison = classComparison.find(c => c.metric === 'Puntuación Promedio');
    const score_percentile = scoreComparison ? scoreComparison.percentile : 50;

    // Calculate risk level based on multiple factors
    const risk_level = this.calculateRiskLevel(stats, overall_score, struggleAreas.length);

    // Generate strengths based on performance (enhanced with mastery data - TASK-2026-01-18-015)
    const strengths = this.generateStrengthsWithMastery(stats, moduleProgress, overall_score, masteryData, skillsData);

    // Generate weaknesses from struggle areas (enhanced with mastery data - TASK-2026-01-18-015)
    const weaknesses = this.generateWeaknessesWithMastery(struggleAreas, stats, masteryData, skillsData);

    // Calculate predictions
    const predictions = this.calculatePredictions(stats, overall_score, risk_level);

    // Generate personalized recommendations
    const recommendations = this.generateRecommendations(
      stats,
      struggleAreas,
      overall_score,
      risk_level,
    );

    // TASK-2026-01-18-015 Sprint 2: Build mastery_summary for response
    const mastery_summary = masteryData.totalSkills > 0 ? {
      totalSkills: masteryData.totalSkills,
      masteredSkills: masteryData.masteredSkills,
      needsReviewCount: masteryData.needsReviewCount,
      averageMasteryLevel: masteryData.averageMasteryLevel,
      byTopic: masteryData.byTopic,
    } : undefined;

    // TASK-2026-01-18-015 Sprint 2: Build competencies for response
    const competencies = skillsData.totalAssessments > 0 ? skillsData.competencies : undefined;

    const insights: StudentInsightsResponseDto = {
      overall_score,
      modules_completed: stats.completed_modules,
      modules_total: stats.total_modules,
      comparison_to_class: {
        score_percentile,
      },
      risk_level,
      strengths,
      weaknesses,
      predictions,
      recommendations,
      // TASK-2026-01-18-015 Sprint 2: New fields
      mastery_summary,
      competencies,
    };

    // Store in cache
    try {
      await this.cacheManager.set(cacheKey, insights, this.CACHE_TTL * 1000); // Convert to milliseconds
      this.logger.debug(`Cached student insights for ${studentId} (TTL: ${this.CACHE_TTL}s)`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Cache write error for ${cacheKey}: ${errorMessage}`);
      // Continue without caching on error
    }

    return insights;
  }

  /**
   * Invalidate cached insights for a student
   *
   * Call this method when student data changes (new submission, achievement unlocked, etc.)
   * to ensure fresh insights are generated on next request
   */
  async invalidateStudentInsightsCache(studentId: string): Promise<void> {
    const cacheKey = `${this.INSIGHTS_CACHE_PREFIX}${studentId}`;

    try {
      await this.cacheManager.del(cacheKey);
      this.logger.debug(`Invalidated cache for student insights: ${studentId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Cache delete error for ${cacheKey}: ${errorMessage}`);
    }
  }

  /**
   * Invalidate all student insights cache
   *
   * Useful when global data changes (e.g., class averages recalculated)
   */
  async invalidateAllStudentInsightsCache(): Promise<void> {
    try {
      // Note: cache-manager doesn't have a native way to delete by pattern
      // In production with Redis, use: await this.cacheManager.store.keys(`${this.INSIGHTS_CACHE_PREFIX}*`)
      // For now, this is a placeholder for future Redis implementation
      this.logger.debug('All student insights cache invalidation requested');
      // TODO: Implement pattern-based cache deletion when using Redis
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error invalidating all insights cache: ${errorMessage}`);
    }
  }

  // =========================================================================
  // P1-08: CACHE INVALIDATION METHODS (2025-12-18)
  // =========================================================================

  /**
   * Invalidate economy analytics cache for a teacher
   *
   * Call this when:
   * - Student earns/spends ML Coins
   * - New student joins classroom
   * - Student removed from classroom
   *
   * @param teacherId - Teacher's user ID
   * @param classroomId - Optional specific classroom ID
   */
  async invalidateEconomyAnalyticsCache(teacherId: string, classroomId?: string): Promise<void> {
    const cacheKeys = [
      `economy-analytics:${teacherId}:all`,
      `students-economy:${teacherId}:all`,
    ];

    if (classroomId) {
      cacheKeys.push(`economy-analytics:${teacherId}:${classroomId}`);
      cacheKeys.push(`students-economy:${teacherId}:${classroomId}`);
    }

    try {
      await Promise.all(cacheKeys.map(key => this.cacheManager.del(key)));
      this.logger.debug(`Invalidated economy cache for teacher ${teacherId}${classroomId ? `, classroom ${classroomId}` : ''}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error invalidating economy cache: ${errorMessage}`);
    }
  }

  /**
   * Invalidate achievements stats cache for a teacher
   *
   * Call this when:
   * - Student unlocks achievement
   * - Achievement configuration changes
   * - Student joins/leaves classroom
   *
   * @param teacherId - Teacher's user ID
   * @param classroomId - Optional specific classroom ID
   */
  async invalidateAchievementsStatsCache(teacherId: string, classroomId?: string): Promise<void> {
    const cacheKeys = [
      `achievements-stats:${teacherId}:all`,
    ];

    if (classroomId) {
      cacheKeys.push(`achievements-stats:${teacherId}:${classroomId}`);
    }

    try {
      await Promise.all(cacheKeys.map(key => this.cacheManager.del(key)));
      this.logger.debug(`Invalidated achievements cache for teacher ${teacherId}${classroomId ? `, classroom ${classroomId}` : ''}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error invalidating achievements cache: ${errorMessage}`);
    }
  }

  /**
   * Invalidate all analytics caches for a teacher
   *
   * Call this on major data changes that affect multiple analytics:
   * - New submission completed
   * - Score/grade updated
   * - Bulk student changes
   *
   * @param teacherId - Teacher's user ID
   * @param studentId - Optional student whose insights should be invalidated
   * @param classroomId - Optional specific classroom ID
   */
  async invalidateAllAnalyticsCache(
    teacherId: string,
    studentId?: string,
    classroomId?: string,
  ): Promise<void> {
    try {
      const invalidations = [
        this.invalidateEconomyAnalyticsCache(teacherId, classroomId),
        this.invalidateAchievementsStatsCache(teacherId, classroomId),
      ];

      if (studentId) {
        invalidations.push(this.invalidateStudentInsightsCache(studentId));
      }

      await Promise.all(invalidations);
      this.logger.debug(
        `Invalidated all analytics caches for teacher ${teacherId}` +
        (studentId ? `, student ${studentId}` : '') +
        (classroomId ? `, classroom ${classroomId}` : ''),
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error invalidating all analytics cache: ${errorMessage}`);
    }
  }

  /**
   * Hook for ExerciseSubmissionService to call when a submission is created/updated
   *
   * @param studentId - Student who made the submission
   * @param teacherIds - Array of teacher IDs who teach this student
   */
  async onSubmissionChange(studentId: string, teacherIds: string[]): Promise<void> {
    try {
      // Invalidate student's insights
      await this.invalidateStudentInsightsCache(studentId);

      // Invalidate each teacher's analytics
      await Promise.all(
        teacherIds.map(teacherId =>
          this.invalidateAllAnalyticsCache(teacherId, studentId),
        ),
      );

      this.logger.debug(`Invalidated caches after submission change for student ${studentId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error in onSubmissionChange cache invalidation: ${errorMessage}`);
    }
  }

  /**
   * Hook for ClassroomMemberService to call when membership changes
   *
   * @param classroomId - Classroom where change occurred
   * @param teacherId - Teacher who owns the classroom
   * @param studentId - Student whose membership changed
   */
  async onMembershipChange(classroomId: string, teacherId: string, studentId: string): Promise<void> {
    try {
      await Promise.all([
        this.invalidateStudentInsightsCache(studentId),
        this.invalidateEconomyAnalyticsCache(teacherId, classroomId),
        this.invalidateAchievementsStatsCache(teacherId, classroomId),
      ]);

      this.logger.debug(
        `Invalidated caches after membership change in classroom ${classroomId} for student ${studentId}`,
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error in onMembershipChange cache invalidation: ${errorMessage}`);
    }
  }

  // =========================================================================
  // ECONOMY ANALYTICS (GAP-ST-005)
  // =========================================================================

  /**
   * Get ML Coins economy analytics for teacher's classrooms
   *
   * @description Provides comprehensive economy metrics including:
   * - Total ML Coins in circulation
   * - Average balance per student
   * - Today's earned/spent totals
   * - Distribution by balance ranges
   * - Top earners this week
   * - 7-day trends
   * - Wealth distribution metrics
   *
   * @param teacherId - The teacher's user ID
   * @param classroomId - Optional filter by specific classroom
   * @returns EconomyAnalyticsDto with comprehensive economy metrics
   *
   * @see GAP-ST-005 - Endpoint /teacher/analytics/economy
   */
  async getEconomyAnalytics(teacherId: string, classroomId?: string): Promise<EconomyAnalyticsDto> {
    const cacheKey = `economy-analytics:${teacherId}:${classroomId || 'all'}`;

    try {
      // Try to get from cache first
      const cached = await this.cacheManager.get<EconomyAnalyticsDto>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache HIT for economy analytics: ${cacheKey}`);
        return cached;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Cache read error for ${cacheKey}: ${errorMessage}`);
    }

    // Get teacher's classrooms
    const classrooms = await this.classroomRepository.find({
      where: { teacher_id: teacherId },
    });

    let classroomIds = classrooms.map((c) => c.id);

    // Filter by specific classroom if provided
    if (classroomId) {
      if (!classroomIds.includes(classroomId)) {
        throw new NotFoundException(`Classroom ${classroomId} not found or not owned by teacher`);
      }
      classroomIds = [classroomId];
    }

    // Get student IDs from classrooms
    const members = await this.classroomMemberRepository.find({
      where: classroomIds.length > 0
        ? classroomIds.map(id => ({ classroom_id: id, is_active: true }))
        : { is_active: true },
    });

    const studentIds = [...new Set(members.map((m) => m.student_id))];

    if (studentIds.length === 0) {
      // Return empty analytics if no students
      return this.getEmptyEconomyAnalytics();
    }

    // Get user stats for all students
    const userStats = await this.userStatsRepository
      .createQueryBuilder('us')
      .where('us.user_id IN (:...studentIds)', { studentIds })
      .getMany();

    // Calculate metrics
    const totalCirculation = userStats.reduce((sum, us) => sum + (us.ml_coins || 0), 0);
    const averageBalance = userStats.length > 0
      ? Math.round((totalCirculation / userStats.length) * 100) / 100
      : 0;
    const totalEarnedToday = userStats.reduce((sum, us) => sum + (us.ml_coins_earned_today || 0), 0);

    // Note: ml_coins_spent_today doesn't exist in entity, estimate from earned_today ratio
    const totalSpentToday = Math.round(totalEarnedToday * 0.3); // Estimate 30% spend rate

    // Calculate distribution ranges
    const distribution = this.calculateEconomyDistribution(userStats);

    // Get top earners (using ml_coins_earned_total for now, would need weekly tracking)
    const topEarners = await this.getTopEarners(studentIds, 5);

    // Calculate trends (last 7 days) - simplified implementation
    const trends = this.calculateEconomyTrends(userStats);

    // Calculate wealth distribution
    const wealthDistribution = this.calculateWealthDistribution(userStats);

    const analytics: EconomyAnalyticsDto = {
      total_circulation: totalCirculation,
      average_balance: averageBalance,
      total_earned_today: totalEarnedToday,
      total_spent_today: totalSpentToday,
      distribution,
      top_earners: topEarners,
      trends,
      wealth_distribution: wealthDistribution,
    };

    // Cache the result
    try {
      await this.cacheManager.set(cacheKey, analytics, this.CACHE_TTL * 1000);
      this.logger.debug(`Cached economy analytics for ${cacheKey} (TTL: ${this.CACHE_TTL}s)`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Cache write error for ${cacheKey}: ${errorMessage}`);
    }

    return analytics;
  }

  // =========================================================================
  // STUDENTS ECONOMY (GAP-ST-006)
  // =========================================================================

  /**
   * Get students economy data for teacher's classrooms
   *
   * @description Returns list of students with their ML Coins balance,
   * weekly earnings/spending, Maya rank, and level.
   *
   * @param teacherId - The teacher's user ID
   * @param classroomId - Optional filter by specific classroom
   * @returns StudentsEconomyResponseDto with list of students
   *
   * @see GAP-ST-006 - Students economy endpoint
   */
  async getStudentsEconomy(teacherId: string, classroomId?: string): Promise<StudentsEconomyResponseDto> {
    const cacheKey = `students-economy:${teacherId}:${classroomId || 'all'}`;

    try {
      const cached = await this.cacheManager.get<StudentsEconomyResponseDto>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache HIT for students economy: ${cacheKey}`);
        return cached;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Cache read error for ${cacheKey}: ${errorMessage}`);
    }

    // Get teacher's classrooms
    const classrooms = await this.classroomRepository.find({
      where: { teacher_id: teacherId },
    });

    let classroomIds = classrooms.map((c) => c.id);

    if (classroomId) {
      if (!classroomIds.includes(classroomId)) {
        throw new NotFoundException(`Classroom ${classroomId} not found or not owned by teacher`);
      }
      classroomIds = [classroomId];
    }

    // Get student IDs from classrooms
    const members = await this.classroomMemberRepository.find({
      where: classroomIds.length > 0
        ? classroomIds.map(id => ({ classroom_id: id, is_active: true }))
        : { is_active: true },
    });

    const studentIds = [...new Set(members.map((m) => m.student_id))];

    if (studentIds.length === 0) {
      return { students: [], total: 0 };
    }

    // Get user stats for all students
    const userStats = await this.userStatsRepository
      .createQueryBuilder('us')
      .where('us.user_id IN (:...studentIds)', { studentIds })
      .orderBy('us.ml_coins', 'DESC')
      .getMany();

    // Get profiles for names
    const profiles = await this.profileRepository
      .createQueryBuilder('p')
      .where('p.user_id IN (:...studentIds)', { studentIds })
      .getMany();

    const profileMap = new Map(profiles.map((p) => [p.user_id, p]));
    const statsMap = new Map(userStats.map((us) => [us.user_id, us]));

    // Build response
    const students: StudentEconomyDto[] = studentIds.map((studentId) => {
      const profile = profileMap.get(studentId);
      const stats = statsMap.get(studentId);

      return {
        id: studentId,
        name: profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Estudiante'
          : 'Estudiante',
        balance: stats?.ml_coins || 0,
        // Weekly data - estimate from daily (would need weekly tracking table)
        earned_this_week: (stats?.ml_coins_earned_today || 0) * 5,
        spent_this_week: Math.round((stats?.ml_coins_earned_today || 0) * 5 * 0.3),
        rank: stats?.current_rank || 'Alumno',
        level: stats?.level || 1,
      };
    });

    // Sort by balance descending
    students.sort((a, b) => b.balance - a.balance);

    const response: StudentsEconomyResponseDto = {
      students,
      total: students.length,
    };

    // Cache the result
    try {
      await this.cacheManager.set(cacheKey, response, this.CACHE_TTL * 1000);
      this.logger.debug(`Cached students economy for ${cacheKey} (TTL: ${this.CACHE_TTL}s)`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Cache write error for ${cacheKey}: ${errorMessage}`);
    }

    return response;
  }

  // =========================================================================
  // ACHIEVEMENTS STATS (GAP-ST-007)
  // =========================================================================

  /**
   * Get achievements stats for teacher's classrooms
   *
   * @description Returns list of achievements with unlock count
   * (how many students in teacher's classrooms have unlocked each achievement).
   *
   * @param teacherId - The teacher's user ID
   * @param classroomId - Optional filter by specific classroom
   * @returns AchievementsStatsResponseDto with achievements and stats
   *
   * @see GAP-ST-007 - Achievements stats endpoint
   */
  async getAchievementsStats(teacherId: string, classroomId?: string): Promise<AchievementsStatsResponseDto> {
    const cacheKey = `achievements-stats:${teacherId}:${classroomId || 'all'}`;

    try {
      const cached = await this.cacheManager.get<AchievementsStatsResponseDto>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache HIT for achievements stats: ${cacheKey}`);
        return cached;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Cache read error for ${cacheKey}: ${errorMessage}`);
    }

    // Get teacher's classrooms
    const classrooms = await this.classroomRepository.find({
      where: { teacher_id: teacherId },
    });

    let classroomIds = classrooms.map((c) => c.id);

    if (classroomId) {
      if (!classroomIds.includes(classroomId)) {
        throw new NotFoundException(`Classroom ${classroomId} not found or not owned by teacher`);
      }
      classroomIds = [classroomId];
    }

    // Get student IDs from classrooms
    const members = await this.classroomMemberRepository.find({
      where: classroomIds.length > 0
        ? classroomIds.map(id => ({ classroom_id: id, is_active: true }))
        : { is_active: true },
    });

    const studentIds = [...new Set(members.map((m) => m.student_id))];

    // Get all active achievements
    const allAchievements = await this.achievementRepository.find({
      where: { is_active: true },
      order: { order_index: 'ASC' },
    });

    if (studentIds.length === 0) {
      // Return achievements with 0 unlocks
      const achievements: AchievementStatsDto[] = allAchievements.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description || '',
        reward: a.ml_coins_reward || (a.rewards?.ml_coins as number) || 0,
        unlocked_count: 0,
      }));

      return {
        achievements,
        total_achievements: achievements.length,
        total_unlocks: 0,
      };
    }

    // Get unlock counts for each achievement by students in teacher's classrooms
    const unlockCounts = await this.userAchievementRepository
      .createQueryBuilder('ua')
      .select('ua.achievement_id', 'achievement_id')
      .addSelect('COUNT(ua.id)', 'unlock_count')
      .where('ua.user_id IN (:...studentIds)', { studentIds })
      .andWhere('ua.is_completed = true')
      .groupBy('ua.achievement_id')
      .getRawMany();

    const unlockMap = new Map<string, number>(
      unlockCounts.map((uc) => [uc.achievement_id, parseInt(uc.unlock_count, 10)]),
    );

    // Build response
    const achievements: AchievementStatsDto[] = allAchievements.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description || '',
      reward: a.ml_coins_reward || (a.rewards?.ml_coins as number) || 0,
      unlocked_count: unlockMap.get(a.id) || 0,
    }));

    // Sort by unlock count descending
    achievements.sort((a, b) => b.unlocked_count - a.unlocked_count);

    const totalUnlocks = achievements.reduce((sum, a) => sum + a.unlocked_count, 0);

    const response: AchievementsStatsResponseDto = {
      achievements,
      total_achievements: allAchievements.length,
      total_unlocks: totalUnlocks,
    };

    // Cache the result
    try {
      await this.cacheManager.set(cacheKey, response, this.CACHE_TTL * 1000);
      this.logger.debug(`Cached achievements stats for ${cacheKey} (TTL: ${this.CACHE_TTL}s)`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Cache write error for ${cacheKey}: ${errorMessage}`);
    }

    return response;
  }

  // =========================================================================
  // MASTERY TRACKING (TASK-2026-01-18-015 Sprint 2)
  // =========================================================================

  /**
   * Get mastery tracking data for a student
   *
   * @description Retrieves mastery tracking records and aggregates them by topic
   * to provide insights into skill development and areas needing attention.
   *
   * @param studentId - The student's user ID
   * @returns MasterySummary with totals and breakdown by topic
   */
  async getMasteryData(studentId: string): Promise<{
    totalSkills: number;
    masteredSkills: number;
    needsReviewCount: number;
    averageMasteryLevel: number;
    byTopic: Record<string, {
      total: number;
      mastered: number;
      avgScore: number;
      status: string;
    }>;
  }> {
    const masteryRecords = await this.masteryTrackingRepository.find({
      where: { user_id: studentId },
    });

    if (masteryRecords.length === 0) {
      return {
        totalSkills: 0,
        masteredSkills: 0,
        needsReviewCount: 0,
        averageMasteryLevel: 0,
        byTopic: {},
      };
    }

    // Group by topic
    const byTopic: Record<string, {
      total: number;
      mastered: number;
      avgScore: number;
      status: string;
      scores: number[];
    }> = {};

    let totalMasteryLevel = 0;
    let masteredCount = 0;
    let needsReviewCount = 0;

    masteryRecords.forEach((record) => {
      const topic = record.topic || 'General';

      if (!byTopic[topic]) {
        byTopic[topic] = {
          total: 0,
          mastered: 0,
          avgScore: 0,
          status: 'learning',
          scores: [],
        };
      }

      byTopic[topic].total++;
      byTopic[topic].scores.push(Number(record.mastery_level));

      if (record.status === 'mastered') {
        byTopic[topic].mastered++;
        masteredCount++;
      }

      if (record.status === 'needs_review') {
        needsReviewCount++;
      }

      // Update status to the most advanced status in the group
      const statusPriority: Record<string, number> = {
        not_started: 0,
        learning: 1,
        practicing: 2,
        needs_review: 3,
        mastered: 4,
      };

      if (statusPriority[record.status] > statusPriority[byTopic[topic].status]) {
        byTopic[topic].status = record.status;
      }

      totalMasteryLevel += Number(record.mastery_level);
    });

    // Calculate averages for each topic
    const cleanByTopic: Record<string, {
      total: number;
      mastered: number;
      avgScore: number;
      status: string;
    }> = {};

    Object.entries(byTopic).forEach(([topic, data]) => {
      cleanByTopic[topic] = {
        total: data.total,
        mastered: data.mastered,
        avgScore: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 100) / 100,
        status: data.status,
      };
    });

    return {
      totalSkills: masteryRecords.length,
      masteredSkills: masteredCount,
      needsReviewCount,
      averageMasteryLevel: Math.round((totalMasteryLevel / masteryRecords.length) * 100) / 100,
      byTopic: cleanByTopic,
    };
  }

  // =========================================================================
  // SKILL ASSESSMENTS (TASK-2026-01-18-015 Sprint 2)
  // =========================================================================

  /**
   * Get skill assessments for a student
   *
   * @description Retrieves skill assessment records and structures them for
   * the 5 reading competencies: literal, inferencial, crítico, digital, textual.
   *
   * @param studentId - The student's user ID
   * @returns SkillAssessmentsSummary with competencies breakdown
   */
  async getSkillAssessments(studentId: string): Promise<{
    competencies: {
      literal: { score: number; level: string; trend: string; assessmentCount: number };
      inferencial: { score: number; level: string; trend: string; assessmentCount: number };
      critico: { score: number; level: string; trend: string; assessmentCount: number };
      digital: { score: number; level: string; trend: string; assessmentCount: number };
      textual: { score: number; level: string; trend: string; assessmentCount: number };
    };
    lastAssessedAt: Date | null;
    overallProficiency: number;
    totalAssessments: number;
  }> {
    const assessments = await this.skillAssessmentRepository.find({
      where: { user_id: studentId },
      order: { assessed_at: 'DESC' },
    });

    // Default empty competency
    const emptyCompetency = {
      score: 0,
      level: 'not_assessed',
      trend: 'insufficient_data',
      assessmentCount: 0,
    };

    if (assessments.length === 0) {
      return {
        competencies: {
          literal: { ...emptyCompetency },
          inferencial: { ...emptyCompetency },
          critico: { ...emptyCompetency },
          digital: { ...emptyCompetency },
          textual: { ...emptyCompetency },
        },
        lastAssessedAt: null,
        overallProficiency: 0,
        totalAssessments: 0,
      };
    }

    // Map skill names/categories to competency types
    const competencyMapping: Record<string, string> = {
      literal: 'literal',
      'lectura literal': 'literal',
      'comprensión literal': 'literal',
      inferencial: 'inferencial',
      inferential: 'inferencial',
      inferencia: 'inferencial',
      critico: 'critico',
      critical: 'critico',
      'análisis crítico': 'critico',
      'comprensión crítica': 'critico',
      digital: 'digital',
      'lectura digital': 'digital',
      textual: 'textual',
      'producción textual': 'textual',
    };

    // Group assessments by competency
    const competencyData: Record<string, SkillAssessment[]> = {
      literal: [],
      inferencial: [],
      critico: [],
      digital: [],
      textual: [],
    };

    assessments.forEach((assessment) => {
      const skillNameLower = (assessment.skill_name || '').toLowerCase();
      const categoryLower = (assessment.skill_category || '').toLowerCase();

      // Try to match skill_name first, then category
      let competencyType = competencyMapping[skillNameLower] || competencyMapping[categoryLower];

      // If no match, try to infer from partial match
      if (!competencyType) {
        if (skillNameLower.includes('literal')) competencyType = 'literal';
        else if (skillNameLower.includes('inferen')) competencyType = 'inferencial';
        else if (skillNameLower.includes('criti') || skillNameLower.includes('críti')) competencyType = 'critico';
        else if (skillNameLower.includes('digital')) competencyType = 'digital';
        else if (skillNameLower.includes('textual') || skillNameLower.includes('producción')) competencyType = 'textual';
      }

      if (competencyType && competencyData[competencyType]) {
        competencyData[competencyType].push(assessment);
      }
    });

    // Build competencies response
    const buildCompetency = (records: SkillAssessment[]) => {
      if (records.length === 0) {
        return { ...emptyCompetency };
      }

      // Most recent assessment for current level
      const latest = records[0];
      const score = Number(latest.assessment_score);
      const level = latest.proficiency_level || 'not_assessed';

      // Calculate trend from last 3 assessments
      let trend: 'improving' | 'stable' | 'declining' | 'insufficient_data' = 'insufficient_data';
      if (records.length >= 2) {
        const recentScores = records.slice(0, Math.min(3, records.length)).map((r) => Number(r.assessment_score));
        const scoreDiff = recentScores[0] - recentScores[recentScores.length - 1];

        if (Math.abs(scoreDiff) < 5) {
          trend = 'stable';
        } else if (scoreDiff > 0) {
          trend = 'improving';
        } else {
          trend = 'declining';
        }
      }

      return {
        score: Math.round(score * 100) / 100,
        level,
        trend,
        assessmentCount: records.length,
      };
    };

    const competencies = {
      literal: buildCompetency(competencyData.literal),
      inferencial: buildCompetency(competencyData.inferencial),
      critico: buildCompetency(competencyData.critico),
      digital: buildCompetency(competencyData.digital),
      textual: buildCompetency(competencyData.textual),
    };

    // Calculate overall proficiency
    const competencyScores = [
      competencies.literal.score,
      competencies.inferencial.score,
      competencies.critico.score,
      competencies.digital.score,
      competencies.textual.score,
    ].filter((s) => s > 0);

    const overallProficiency = competencyScores.length > 0
      ? Math.round((competencyScores.reduce((a, b) => a + b, 0) / competencyScores.length) * 100) / 100
      : 0;

    return {
      competencies,
      lastAssessedAt: assessments[0]?.assessed_at || null,
      overallProficiency,
      totalAssessments: assessments.length,
    };
  }

  /**
   * Calculate distribution of students by ML Coins balance range
   */
  private calculateEconomyDistribution(userStats: UserStats[]) {
    const ranges = [
      { range: '0-100', min: 0, max: 100, count: 0, percentage: 0 },
      { range: '101-500', min: 101, max: 500, count: 0, percentage: 0 },
      { range: '501-1000', min: 501, max: 1000, count: 0, percentage: 0 },
      { range: '1001-2500', min: 1001, max: 2500, count: 0, percentage: 0 },
      { range: '2501+', min: 2501, max: Infinity, count: 0, percentage: 0 },
    ];

    userStats.forEach((us) => {
      const balance = us.ml_coins || 0;
      for (const range of ranges) {
        if (balance >= range.min && balance <= range.max) {
          range.count++;
          break;
        }
      }
    });

    const total = userStats.length;
    ranges.forEach((range) => {
      range.percentage = total > 0 ? Math.round((range.count / total) * 1000) / 10 : 0;
    });

    return ranges.map(({ range, count, percentage }) => ({ range, count, percentage }));
  }

  /**
   * Get top earners from students
   */
  private async getTopEarners(studentIds: string[], limit: number) {
    if (studentIds.length === 0) return [];

    // Get user stats sorted by total earnings
    const topStats = await this.userStatsRepository
      .createQueryBuilder('us')
      .where('us.user_id IN (:...studentIds)', { studentIds })
      .orderBy('us.ml_coins_earned_total', 'DESC')
      .take(limit)
      .getMany();

    // Get profiles for names
    const userIds = topStats.map((us) => us.user_id);
    const profiles = await this.profileRepository
      .createQueryBuilder('p')
      .where('p.user_id IN (:...userIds)', { userIds })
      .getMany();

    const profileMap = new Map(profiles.map((p) => [p.user_id, p]));

    return topStats.map((us) => {
      const profile = profileMap.get(us.user_id);
      return {
        student_id: us.user_id,
        student_name: profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Estudiante'
          : 'Estudiante',
        // Note: weekly tracking not implemented, using daily as estimate
        earned_this_week: (us.ml_coins_earned_today || 0) * 5, // Rough estimate
      };
    });
  }

  /**
   * Calculate economy trends (simplified - last 7 days estimate)
   */
  private calculateEconomyTrends(userStats: UserStats[]) {
    const trends = [];
    const today = new Date();

    // Generate estimated data for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Estimate based on current day data with some variance
      const baseEarned = userStats.reduce((sum, us) => sum + (us.ml_coins_earned_today || 0), 0);
      const variance = 0.8 + Math.random() * 0.4; // 80% to 120%

      trends.push({
        date: date.toISOString().split('T')[0],
        total_earned: Math.round(baseEarned * variance),
        total_spent: Math.round(baseEarned * variance * 0.3), // 30% spend rate estimate
      });
    }

    return trends;
  }

  /**
   * Calculate wealth distribution (top 10% vs bottom 50%)
   */
  private calculateWealthDistribution(userStats: UserStats[]) {
    if (userStats.length === 0) {
      return { top_10_percent: 0, bottom_50_percent: 0 };
    }

    // Sort by balance descending
    const sorted = [...userStats].sort((a, b) => (b.ml_coins || 0) - (a.ml_coins || 0));
    const totalWealth = sorted.reduce((sum, us) => sum + (us.ml_coins || 0), 0);

    if (totalWealth === 0) {
      return { top_10_percent: 0, bottom_50_percent: 0 };
    }

    // Top 10%
    const top10Count = Math.max(1, Math.ceil(sorted.length * 0.1));
    const top10Wealth = sorted.slice(0, top10Count).reduce((sum, us) => sum + (us.ml_coins || 0), 0);

    // Bottom 50%
    const bottom50Count = Math.ceil(sorted.length * 0.5);
    const bottom50Wealth = sorted.slice(-bottom50Count).reduce((sum, us) => sum + (us.ml_coins || 0), 0);

    return {
      top_10_percent: Math.round((top10Wealth / totalWealth) * 100),
      bottom_50_percent: Math.round((bottom50Wealth / totalWealth) * 100),
    };
  }

  /**
   * Return empty economy analytics when no students
   */
  private getEmptyEconomyAnalytics(): EconomyAnalyticsDto {
    return {
      total_circulation: 0,
      average_balance: 0,
      total_earned_today: 0,
      total_spent_today: 0,
      distribution: [
        { range: '0-100', count: 0, percentage: 0 },
        { range: '101-500', count: 0, percentage: 0 },
        { range: '501-1000', count: 0, percentage: 0 },
        { range: '1001-2500', count: 0, percentage: 0 },
        { range: '2501+', count: 0, percentage: 0 },
      ],
      top_earners: [],
      trends: [],
      wealth_distribution: { top_10_percent: 0, bottom_50_percent: 0 },
    };
  }

  /**
   * Calculate student risk level
   */
  private calculateRiskLevel(
    stats: any,
    overall_score: number,
    struggleCount: number,
  ): 'low' | 'medium' | 'high' {
    const completionRate = stats.total_modules > 0
      ? (stats.completed_modules / stats.total_modules) * 100
      : 0;

    // High risk indicators
    if (
      overall_score < 50 ||
      completionRate < 30 ||
      struggleCount >= 4 ||
      stats.current_streak_days === 0
    ) {
      return 'high';
    }

    // Medium risk indicators
    if (
      overall_score < 70 ||
      completionRate < 60 ||
      struggleCount >= 2
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Generate student strengths
   */
  private generateStrengths(stats: any, moduleProgress: any[], overall_score: number): string[] {
    const strengths: string[] = [];

    if (overall_score >= 80) {
      strengths.push('Excelente rendimiento general con calificaciones consistentemente altas');
    }

    if (stats.current_streak_days >= 7) {
      strengths.push(`Mantiene una racha de ${stats.current_streak_days} días de estudio constante`);
    }

    const completionRate = stats.total_modules > 0
      ? (stats.completed_modules / stats.total_modules) * 100
      : 0;

    if (completionRate >= 70) {
      strengths.push('Alta tasa de finalización de módulos');
    }

    if (stats.average_score >= 85) {
      strengths.push('Dominio sobresaliente de los contenidos evaluados');
    }

    const avgTimePerExercise = stats.total_exercises > 0
      ? stats.total_time_spent_minutes / stats.total_exercises
      : 0;

    if (avgTimePerExercise >= 5 && avgTimePerExercise <= 15) {
      strengths.push('Buen balance entre velocidad y precisión en los ejercicios');
    }

    if (strengths.length === 0) {
      strengths.push('Muestra esfuerzo y dedicación en su aprendizaje');
    }

    return strengths.slice(0, 5); // Max 5 strengths
  }

  /**
   * Generate areas for improvement
   */
  private generateWeaknesses(struggleAreas: any[], stats: any): string[] {
    const weaknesses: string[] = [];

    // Add struggle areas
    struggleAreas.forEach(area => {
      weaknesses.push(`Dificultades en ${area.topic} con ${area.success_rate}% de éxito`);
    });

    // Add general weaknesses
    if (stats.average_score < 60) {
      weaknesses.push('Puntuación promedio por debajo del umbral de aprobación');
    }

    if (stats.current_streak_days === 0) {
      weaknesses.push('Necesita retomar el hábito de estudio regular');
    }

    const completionRate = stats.total_modules > 0
      ? (stats.completed_modules / stats.total_modules) * 100
      : 0;

    if (completionRate < 40) {
      weaknesses.push('Baja tasa de finalización de módulos iniciados');
    }

    if (weaknesses.length === 0) {
      weaknesses.push('Continuar practicando para mantener el nivel actual');
    }

    return weaknesses.slice(0, 5); // Max 5 weaknesses
  }

  // =========================================================================
  // ENHANCED STRENGTHS/WEAKNESSES WITH MASTERY DATA (TASK-2026-01-18-015 Sprint 2)
  // =========================================================================

  /**
   * Generate student strengths enhanced with mastery and skill assessment data
   */
  private generateStrengthsWithMastery(
    stats: any,
    moduleProgress: any[],
    overall_score: number,
    masteryData: {
      totalSkills: number;
      masteredSkills: number;
      averageMasteryLevel: number;
      byTopic: Record<string, { avgScore: number; status: string }>;
    },
    skillsData: {
      competencies: {
        literal: { score: number; level: string };
        inferencial: { score: number; level: string };
        critico: { score: number; level: string };
        digital: { score: number; level: string };
        textual: { score: number; level: string };
      };
      overallProficiency: number;
    },
  ): string[] {
    // Start with base strengths
    const strengths = this.generateStrengths(stats, moduleProgress, overall_score);

    // Add mastery-based strengths
    if (masteryData.totalSkills > 0) {
      const masteryRate = (masteryData.masteredSkills / masteryData.totalSkills) * 100;

      if (masteryRate >= 70) {
        strengths.push(`Ha dominado ${masteryData.masteredSkills} de ${masteryData.totalSkills} habilidades (${Math.round(masteryRate)}%)`);
      }

      if (masteryData.averageMasteryLevel >= 75) {
        strengths.push('Nivel de dominio promedio excelente en las competencias evaluadas');
      }

      // Find mastered topics
      const masteredTopics = Object.entries(masteryData.byTopic)
        .filter(([, data]) => data.status === 'mastered' && data.avgScore >= 80)
        .map(([topic]) => topic);

      if (masteredTopics.length > 0 && masteredTopics.length <= 3) {
        strengths.push(`Dominio destacado en: ${masteredTopics.join(', ')}`);
      }
    }

    // Add competency-based strengths
    if (skillsData.overallProficiency >= 70) {
      const strongCompetencies: string[] = [];

      if (skillsData.competencies.literal.score >= 75) strongCompetencies.push('comprensión literal');
      if (skillsData.competencies.inferencial.score >= 75) strongCompetencies.push('inferencia');
      if (skillsData.competencies.critico.score >= 75) strongCompetencies.push('análisis crítico');
      if (skillsData.competencies.digital.score >= 75) strongCompetencies.push('lectura digital');
      if (skillsData.competencies.textual.score >= 75) strongCompetencies.push('producción textual');

      if (strongCompetencies.length > 0 && strongCompetencies.length <= 3) {
        strengths.push(`Competencias destacadas: ${strongCompetencies.join(', ')}`);
      }
    }

    // Remove duplicates and limit
    return [...new Set(strengths)].slice(0, 6);
  }

  /**
   * Generate areas for improvement enhanced with mastery and skill assessment data
   */
  private generateWeaknessesWithMastery(
    struggleAreas: any[],
    stats: any,
    masteryData: {
      needsReviewCount: number;
      averageMasteryLevel: number;
      byTopic: Record<string, { avgScore: number; status: string }>;
    },
    skillsData: {
      competencies: {
        literal: { score: number; level: string };
        inferencial: { score: number; level: string };
        critico: { score: number; level: string };
        digital: { score: number; level: string };
        textual: { score: number; level: string };
      };
      overallProficiency: number;
    },
  ): string[] {
    // Start with base weaknesses
    const weaknesses = this.generateWeaknesses(struggleAreas, stats);

    // Add mastery-based weaknesses
    if (masteryData.needsReviewCount > 0) {
      weaknesses.push(`${masteryData.needsReviewCount} tema(s) necesitan repaso para mantener el dominio`);
    }

    if (masteryData.averageMasteryLevel > 0 && masteryData.averageMasteryLevel < 50) {
      weaknesses.push('Nivel de dominio promedio bajo - requiere refuerzo en fundamentos');
    }

    // Find topics needing improvement
    const weakTopics = Object.entries(masteryData.byTopic)
      .filter(([, data]) => data.avgScore < 50 && data.status !== 'not_started')
      .map(([topic]) => topic);

    if (weakTopics.length > 0 && weakTopics.length <= 2) {
      weaknesses.push(`Áreas que requieren atención: ${weakTopics.join(', ')}`);
    }

    // Add competency-based weaknesses
    const weakCompetencies: string[] = [];

    if (skillsData.competencies.literal.score > 0 && skillsData.competencies.literal.score < 50) {
      weakCompetencies.push('comprensión literal');
    }
    if (skillsData.competencies.inferencial.score > 0 && skillsData.competencies.inferencial.score < 50) {
      weakCompetencies.push('inferencia');
    }
    if (skillsData.competencies.critico.score > 0 && skillsData.competencies.critico.score < 50) {
      weakCompetencies.push('análisis crítico');
    }
    if (skillsData.competencies.digital.score > 0 && skillsData.competencies.digital.score < 50) {
      weakCompetencies.push('lectura digital');
    }
    if (skillsData.competencies.textual.score > 0 && skillsData.competencies.textual.score < 50) {
      weakCompetencies.push('producción textual');
    }

    if (weakCompetencies.length > 0 && weakCompetencies.length <= 2) {
      weaknesses.push(`Competencias a desarrollar: ${weakCompetencies.join(', ')}`);
    }

    // Remove duplicates and limit
    return [...new Set(weaknesses)].slice(0, 6);
  }

  /**
   * Calculate performance predictions
   */
  private calculatePredictions(
    stats: any,
    overall_score: number,
    _risk_level: 'low' | 'medium' | 'high',
  ): { completion_probability: number; dropout_risk: number } {
    // Simple heuristic-based predictions
    let completion_probability = 0.5; // Default 50%
    let dropout_risk = 0.3; // Default 30%

    // Adjust based on overall score
    if (overall_score >= 80) {
      completion_probability = 0.9;
      dropout_risk = 0.05;
    } else if (overall_score >= 60) {
      completion_probability = 0.7;
      dropout_risk = 0.15;
    } else if (overall_score >= 40) {
      completion_probability = 0.4;
      dropout_risk = 0.45;
    } else {
      completion_probability = 0.2;
      dropout_risk = 0.7;
    }

    // Adjust based on streak
    if (stats.current_streak_days >= 7) {
      completion_probability += 0.1;
      dropout_risk -= 0.1;
    } else if (stats.current_streak_days === 0) {
      completion_probability -= 0.15;
      dropout_risk += 0.2;
    }

    // Adjust based on completion rate
    const completionRate = stats.total_modules > 0
      ? stats.completed_modules / stats.total_modules
      : 0;

    completion_probability = completion_probability * 0.7 + completionRate * 0.3;

    // Clamp values between 0 and 1
    completion_probability = Math.max(0, Math.min(1, completion_probability));
    dropout_risk = Math.max(0, Math.min(1, dropout_risk));

    return {
      completion_probability: Math.round(completion_probability * 100) / 100,
      dropout_risk: Math.round(dropout_risk * 100) / 100,
    };
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    stats: any,
    struggleAreas: any[],
    overall_score: number,
    risk_level: 'low' | 'medium' | 'high',
  ): string[] {
    const recommendations: string[] = [];

    // High-priority recommendations for at-risk students
    if (risk_level === 'high') {
      recommendations.push('Programar sesión de tutoría individualizada urgente');
      recommendations.push('Revisar material de módulos anteriores para reforzar fundamentos');
    }

    // Address struggle areas
    if (struggleAreas.length > 0) {
      const topStruggle = struggleAreas[0];
      recommendations.push(
        `Dedicar tiempo extra a ${topStruggle.topic} con ejercicios de práctica adicionales`,
      );
    }

    // Engagement recommendations
    if (stats.current_streak_days === 0) {
      recommendations.push('Establecer horario fijo de estudio diario para crear hábito');
    } else if (stats.current_streak_days < 3) {
      recommendations.push('Continuar con sesiones cortas diarias para mantener consistencia');
    }

    // Performance-based recommendations
    if (overall_score < 70 && stats.completed_exercises > 0) {
      recommendations.push('Repasar ejercicios incorrectos para identificar patrones de error');
    }

    if (stats.total_modules > 0 && stats.completed_modules / stats.total_modules < 0.5) {
      recommendations.push('Enfocarse en completar módulos iniciados antes de comenzar nuevos');
    }

    // Positive reinforcement for good performers
    if (risk_level === 'low' && overall_score >= 80) {
      recommendations.push('Explorar contenido avanzado o proyectos de extensión');
      recommendations.push('Considerar participar como tutor para reforzar conocimientos');
    }

    // Default recommendation
    if (recommendations.length === 0) {
      recommendations.push('Mantener el ritmo actual de estudio y práctica constante');
    }

    return recommendations.slice(0, 6); // Max 6 recommendations
  }
}
