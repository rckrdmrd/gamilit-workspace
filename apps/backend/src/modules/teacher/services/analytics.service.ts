/**
 * Analytics Service
 *
 * Provides classroom-wide analytics and insights
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { Classroom } from '@/modules/social/entities/classroom.entity';
import { ClassroomMember } from '@/modules/social/entities/classroom-member.entity';
import { Assignment } from '@/modules/assignments/entities/assignment.entity';
import { AssignmentSubmission } from '@/modules/assignments/entities/assignment-submission.entity';
import { GetAnalyticsQueryDto, GetEngagementMetricsDto, GenerateReportsDto } from '../dto';
import { GamilityRoleEnum } from '@/shared/constants/enums.constants';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly submissionRepository: Repository<ExerciseSubmission>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Classroom, 'social')
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(ClassroomMember, 'social')
    private readonly classroomMemberRepository: Repository<ClassroomMember>,
    @InjectRepository(Assignment, 'content')
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(AssignmentSubmission, 'content')
    private readonly assignmentSubmissionRepository: Repository<AssignmentSubmission>,
  ) {}

  /**
   * Get comprehensive classroom analytics
   */
  async getClassroomAnalytics(query: GetAnalyticsQueryDto) {
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

    return {
      analytics: {
        total_students: totalStudents,
        active_students: activeStudents,
        average_score: avgScore,
        average_completion_rate: avgCompletionRate,
        total_time_spent_minutes: 18500, // TODO: Calculate from submissions
        exercises_completed: submissions.length,
        achievements_unlocked: 456, // TODO: Get from achievements system
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
    const activeStudents = members.filter((m) => {
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
}
