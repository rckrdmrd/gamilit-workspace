/**
 * Teacher Dashboard Service
 *
 * Provides dashboard statistics and overview data for teachers
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { ModuleProgress } from '@/modules/progress/entities/module-progress.entity';
import { GamilityRoleEnum } from '@/shared/constants/enums.constants';

export interface ClassroomStats {
  total_students: number;
  active_students: number;
  average_score: number;
  average_completion: number;
  total_submissions_pending: number;
  students_at_risk: number;
}

export interface RecentActivity {
  id: string;
  student_name: string;
  student_id: string;
  activity_type: 'submission' | 'achievement' | 'question';
  title: string;
  timestamp: Date;
  status?: 'pending' | 'graded' | 'needs_attention';
}

export interface StudentAlert {
  id: string;
  student_id: string;
  student_name: string;
  alert_type: 'low_score' | 'inactive' | 'struggling' | 'streak_broken';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TopPerformer {
  student_id: string;
  student_name: string;
  total_xp: number;
  current_level: number;
  exercises_completed: number;
  average_score: number;
}

export interface ModuleProgressSummary {
  module_id: string;
  module_name: string;
  students_active: number;
  average_completion: number;
}

@Injectable()
export class TeacherDashboardService {
  constructor(
    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly submissionRepository: Repository<ExerciseSubmission>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(ModuleProgress, 'progress')
    private readonly moduleProgressRepository: Repository<ModuleProgress>,
  ) {}

  /**
   * Get classroom statistics overview
   */
  async getClassroomStats(teacherId: string): Promise<ClassroomStats> {
    // Get all students from teacher's classrooms
    // TODO: Implement classroom-teacher relationship
    // For now, we'll get all students
    const students = await this.profileRepository.find({
      where: { role: GamilityRoleEnum.STUDENT },
    });

    const totalStudents = students.length;

    // Get active students (activity in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeStudents = students.filter(
      (student) =>
        student.last_activity_at && student.last_activity_at >= sevenDaysAgo,
    );

    // Get all submissions for score calculation
    const submissions = await this.submissionRepository.find({
      where: {
        user_id: students.map((s) => s.user_id),
      } as any,
    });

    // Calculate average score
    const totalScore = submissions.reduce((sum, sub) => {
      const percentage = (sub.score / sub.max_score) * 100;
      return sum + percentage;
    }, 0);
    const averageScore = submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0;

    // Get pending submissions
    const pendingSubmissions = submissions.filter(
      (sub) => sub.status === 'submitted' || sub.status === 'pending',
    ).length;

    // Get module progress for completion calculation
    const moduleProgresses = await this.moduleProgressRepository.find({
      where: {
        user_id: students.map((s) => s.user_id),
      } as any,
    });

    const totalCompletion = moduleProgresses.reduce(
      (sum, mp) => sum + mp.progress_percentage,
      0,
    );
    const averageCompletion =
      moduleProgresses.length > 0
        ? Math.round(totalCompletion / moduleProgresses.length)
        : 0;

    // Calculate students at risk (low score or inactive)
    const studentsAtRisk = students.filter((student) => {
      const studentSubmissions = submissions.filter(
        (sub) => sub.user_id === student.user_id,
      );
      if (studentSubmissions.length === 0) return false;

      const studentAvgScore =
        studentSubmissions.reduce(
          (sum, sub) => sum + (sub.score / sub.max_score) * 100,
          0,
        ) / studentSubmissions.length;

      const isInactive =
        !student.last_activity_at ||
        student.last_activity_at < sevenDaysAgo;
      const hasLowScore = studentAvgScore < 60;

      return isInactive || hasLowScore;
    }).length;

    return {
      total_students: totalStudents,
      active_students: activeStudents.length,
      average_score: averageScore,
      average_completion: averageCompletion,
      total_submissions_pending: pendingSubmissions,
      students_at_risk: studentsAtRisk,
    };
  }

  /**
   * Get recent activities (submissions, achievements, etc.)
   */
  async getRecentActivities(
    teacherId: string,
    limit: number = 10,
  ): Promise<RecentActivity[]> {
    // Get recent submissions
    const recentSubmissions = await this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect(
        'auth_management.profiles',
        'profile',
        'profile.user_id = submission.user_id',
      )
      .orderBy('submission.submitted_at', 'DESC')
      .limit(limit)
      .getRawMany();

    const activities: RecentActivity[] = recentSubmissions.map((sub) => ({
      id: sub.submission_id,
      student_name: sub.profile_full_name || sub.profile_display_name || 'Unknown',
      student_id: sub.submission_user_id,
      activity_type: 'submission' as const,
      title: `Entregó ejercicio`, // TODO: Get exercise title
      timestamp: new Date(sub.submission_submitted_at),
      status: this.mapSubmissionStatus(sub.submission_status),
    }));

    return activities;
  }

  /**
   * Get student alerts (low scores, inactive, struggling)
   */
  async getStudentAlerts(teacherId: string): Promise<StudentAlert[]> {
    const students = await this.profileRepository.find({
      where: { role: GamilityRoleEnum.STUDENT },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const alerts: StudentAlert[] = [];

    for (const student of students) {
      // Check for inactivity
      if (
        !student.last_activity_at ||
        student.last_activity_at < sevenDaysAgo
      ) {
        alerts.push({
          id: `alert_${student.id}_inactive`,
          student_id: student.id,
          student_name: student.full_name || student.display_name || 'Unknown',
          alert_type: 'inactive',
          message: 'No ha tenido actividad en los últimos 7 días',
          severity: 'medium',
        });
      }

      // Check for low scores
      const submissions = await this.submissionRepository.find({
        where: { user_id: student.user_id || undefined },
        order: { submitted_at: 'DESC' },
        take: 5,
      });

      if (submissions.length > 0) {
        const avgScore =
          submissions.reduce(
            (sum, sub) => sum + (sub.score / sub.max_score) * 100,
            0,
          ) / submissions.length;

        if (avgScore < 60) {
          alerts.push({
            id: `alert_${student.id}_low_score`,
            student_id: student.id,
            student_name: student.full_name || student.display_name || 'Unknown',
            alert_type: 'low_score',
            message: `Promedio de ${Math.round(avgScore)}% en los últimos 5 ejercicios`,
            severity: avgScore < 40 ? 'high' : 'medium',
          });
        }
      }
    }

    return alerts.slice(0, 10); // Return top 10 alerts
  }

  /**
   * Get top performing students
   */
  async getTopPerformers(
    teacherId: string,
    limit: number = 5,
  ): Promise<TopPerformer[]> {
    const students = await this.profileRepository.find({
      where: { role: GamilityRoleEnum.STUDENT },
    });

    const performers: TopPerformer[] = [];

    for (const student of students) {
      const submissions = await this.submissionRepository.find({
        where: { user_id: student.user_id || undefined },
      });

      if (submissions.length === 0) continue;

      const totalXP = submissions.reduce(
        (sum, sub) => sum + (sub.is_correct ? 50 : 0), // TODO: Get actual XP from exercise
        0,
      );

      const avgScore =
        submissions.reduce(
          (sum, sub) => sum + (sub.score / sub.max_score) * 100,
          0,
        ) / submissions.length;

      performers.push({
        student_id: student.id,
        student_name: student.full_name || student.display_name || 'Unknown',
        total_xp: totalXP,
        current_level: Math.floor(totalXP / 500) + 1, // Simple level calculation
        exercises_completed: submissions.length,
        average_score: Math.round(avgScore),
      });
    }

    // Sort by XP descending
    performers.sort((a, b) => b.total_xp - a.total_xp);

    return performers.slice(0, limit);
  }

  /**
   * Get module progress summary
   */
  async getModuleProgressSummary(
    teacherId: string,
  ): Promise<ModuleProgressSummary[]> {
    // TODO: Implement with actual module data
    // For now return empty array
    return [];
  }

  /**
   * Map submission status to activity status
   */
  private mapSubmissionStatus(
    status: string,
  ): 'pending' | 'graded' | 'needs_attention' | undefined {
    switch (status) {
      case 'submitted':
      case 'draft':
        return 'pending';
      case 'graded':
      case 'reviewed':
        return 'graded';
      default:
        return undefined;
    }
  }
}
