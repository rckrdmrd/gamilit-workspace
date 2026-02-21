/**
 * Student Progress Service
 *
 * Provides detailed progress information for individual students
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, In } from 'typeorm';
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { ModuleProgress } from '@/modules/progress/entities/module-progress.entity';
import { ClassroomMember } from '@/modules/social/entities/classroom-member.entity';
import { Classroom } from '@/modules/social/entities/classroom.entity';
import { User } from '@/modules/auth/entities/user.entity';
import { UserStats } from '@/modules/gamification/entities/user-stats.entity';
// P1-05: Added 2025-12-18 - Educational entities for data enrichment
import { Module as EducationalModule } from '@/modules/educational/entities/module.entity';
import { Exercise } from '@/modules/educational/entities/exercise.entity';
import {
  GetStudentProgressQueryDto,
  AddTeacherNoteDto,
  StudentNoteResponseDto,
  StudentProgressResponseDto,
  StudentStatsResponseDto,
  ModuleProgressDto,
} from '../dto';

export interface StudentOverview {
  id: string;
  full_name: string;
  username: string;
  email: string;
  maya_rank: string;
  current_level: number;
  total_xp: number;
  total_ml_coins: number;
  avatar_url?: string;
  joined_date: Date;
  last_login: Date;
}

export interface StudentStats {
  total_modules: number;
  completed_modules: number;
  total_exercises: number;
  completed_exercises: number;
  average_score: number;
  total_time_spent_minutes: number;
  current_streak_days: number;
  longest_streak_days: number;
  achievements_unlocked: number;
}

export interface ModuleProgressDetail {
  module_id: string;
  module_name: string;
  module_order: number;
  total_activities: number;
  completed_activities: number;
  average_score: number;
  time_spent_minutes: number;
  last_activity_date?: Date;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface ExerciseAttempt {
  id: string;
  exercise_title: string;
  module_name: string;
  exercise_type: string;
  is_correct: boolean;
  score_percentage: number;
  time_spent_seconds: number;
  hints_used: number;
  submitted_at: Date;
}

export interface StruggleArea {
  topic: string;
  module_name: string;
  attempts: number;
  success_rate: number;
  average_score: number;
  last_attempt_date: Date;
}

export interface ClassComparison {
  metric: string;
  student_value: number;
  class_average: number;
  percentile: number;
}

@Injectable()
export class StudentProgressService {
  private readonly logger = new Logger(StudentProgressService.name);

  constructor(
    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly submissionRepository: Repository<ExerciseSubmission>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(ModuleProgress, 'progress')
    private readonly moduleProgressRepository: Repository<ModuleProgress>,
    @InjectRepository(ClassroomMember, 'social')
    private readonly classroomMemberRepository: Repository<ClassroomMember>,
    @InjectRepository(Classroom, 'social')
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(User, 'auth')
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserStats, 'gamification')
    private readonly userStatsRepository: Repository<UserStats>,
    // P1-05: Added 2025-12-18 - Educational repositories for data enrichment
    @InjectRepository(EducationalModule, 'educational')
    private readonly moduleRepository: Repository<EducationalModule>,
    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepository: Repository<Exercise>,
  ) {}

  /**
   * Get complete student progress data
   */
  async getStudentProgress(
    studentId: string,
    query: GetStudentProgressQueryDto,
  ) {
    const student = await this.getStudentOverview(studentId);
    const stats = await this.getStudentStats(studentId);
    const moduleProgress = await this.getModuleProgress(studentId);
    const exerciseAttempts = await this.getExerciseHistory(studentId, query);
    const struggleAreas = await this.getStruggleAreas(studentId);
    const classComparison = await this.getClassComparison(studentId);

    return {
      student,
      stats,
      moduleProgress,
      exerciseAttempts,
      struggleAreas,
      classComparison,
    };
  }

  /**
   * Get student overview information
   */
  async getStudentOverview(studentId: string): Promise<StudentOverview> {
    // FIX TASK-2026-01-19-002: studentId is profiles.id (PK), NOT auth.users.id (FK)
    // ClassroomMember.student_id -> profiles.id, so we receive profiles.id from frontend
    const profile = await this.profileRepository.findOne({
      where: { id: studentId },
    });

    if (!profile) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // CORR-002: Get real gamification data from user_stats
    const userStats = await this.userStatsRepository.findOne({
      where: { user_id: profile.id },
    });

    // Log warning if user_stats not found (for debugging)
    if (!userStats) {
      this.logger.warn(
        `UserStats not found for profile ${profile.id}. Using default gamification values.`,
      );
    }

    return {
      id: profile.id,
      full_name: profile.full_name || profile.display_name || 'Unknown',
      username: profile.email.split('@')[0], // Simple username extraction
      email: profile.email,
      // CORR-002: Use real data from user_stats
      maya_rank: userStats?.current_rank || 'Ajaw',
      current_level: userStats?.level || 1,
      total_xp: userStats?.total_xp || 0,
      total_ml_coins: userStats?.ml_coins || 0,
      avatar_url: profile.avatar_url || undefined,
      joined_date: profile.created_at,
      last_login: profile.last_sign_in_at || profile.created_at,
    };
  }

  /**
   * Get student statistics
   */
  async getStudentStats(studentId: string): Promise<StudentStats> {
    // FIX TASK-2026-01-19-002: studentId is profiles.id (PK), NOT auth.users.id (FK)
    const profile = await this.profileRepository.findOne({
      where: { id: studentId },
    });

    if (!profile) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Get all submissions
    // FIX CORR-001: Use profile.id (PK) instead of profile.user_id (FK to auth.users)
    // exercise_submissions.user_id references profiles.id, not auth.users.id
    const submissions = await this.submissionRepository.find({
      where: { user_id: profile.id },
    });

    // Get module progress
    // FIX CORR-001: Use profile.id (PK) instead of profile.user_id
    const moduleProgresses = await this.moduleProgressRepository.find({
      where: { user_id: profile.id },
    });

    // CORR-002: Get real gamification data from user_stats
    const userStats = await this.userStatsRepository.findOne({
      where: { user_id: profile.id },
    });

    const completedModules = moduleProgresses.filter(
      (mp) => mp.progress_percentage === 100,
    ).length;

    const completedExercises = submissions.filter((s) => s.is_correct).length;

    const totalScore = submissions.reduce(
      (sum, sub) => {
        // Protect against division by zero
        const maxScore = sub.max_score || 1;
        return sum + (sub.score / maxScore) * 100;
      },
      0,
    );
    const averageScore =
      submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0;

    const totalTimeSpent = submissions.reduce(
      (sum, sub) => sum + (sub.time_spent_seconds || 0),
      0,
    );

    return {
      total_modules: moduleProgresses.length,
      completed_modules: completedModules,
      total_exercises: submissions.length,
      completed_exercises: completedExercises,
      average_score: averageScore,
      total_time_spent_minutes: Math.round(totalTimeSpent / 60),
      // CORR-002: Use real data from user_stats
      current_streak_days: userStats?.current_streak || 0,
      longest_streak_days: userStats?.max_streak || 0,
      achievements_unlocked: userStats?.achievements_earned || 0,
    };
  }

  /**
   * Get module-by-module progress
   */
  async getModuleProgress(
    studentId: string,
  ): Promise<ModuleProgressDetail[]> {
    // FIX TASK-2026-01-19-002: studentId is profiles.id (PK), NOT auth.users.id (FK)
    const profile = await this.profileRepository.findOne({
      where: { id: studentId },
    });

    if (!profile) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // FIX CORR-001: Use profile.id (PK) instead of profile.user_id
    const moduleProgresses = await this.moduleProgressRepository.find({
      where: { user_id: profile.id },
    });

    // P1-05: Get module data for enrichment
    const moduleIds = moduleProgresses.map(mp => mp.module_id);
    const modules = moduleIds.length > 0
      ? await this.moduleRepository.find({ where: { id: In(moduleIds) } })
      : [];
    const moduleMap = new Map(modules.map(m => [m.id, m]));

    // P1-05: Get submissions for time calculation
    const submissions = await this.submissionRepository.find({
      where: { user_id: profile.id },
    });
    const timeByModule = new Map<string, number>();
    for (const sub of submissions) {
      // Get exercise to find module
      const exercise = await this.exerciseRepository.findOne({ where: { id: sub.exercise_id } });
      if (exercise) {
        const currentTime = timeByModule.get(exercise.module_id) || 0;
        timeByModule.set(exercise.module_id, currentTime + (sub.time_spent_seconds || 0));
      }
    }

    // P1-05: Enriched response with real module data
    return moduleProgresses.map((mp) => {
      const moduleData = moduleMap.get(mp.module_id);
      const timeSpentSeconds = timeByModule.get(mp.module_id) || 0;
      const totalActivities = moduleData?.total_exercises || 15;

      return {
        module_id: mp.module_id,
        module_name: moduleData?.title || `Módulo ${moduleData?.order_index || 1}`,
        module_order: moduleData?.order_index || 1,
        total_activities: totalActivities,
        completed_activities: Math.round((mp.progress_percentage / 100) * totalActivities),
        average_score: Math.round(mp.average_score || mp.progress_percentage * 0.8),
        time_spent_minutes: Math.round(timeSpentSeconds / 60),
        last_activity_date: mp.updated_at,
        status: this.calculateModuleStatus(mp.progress_percentage),
      };
    });
  }

  /**
   * Get exercise submission history
   */
  async getExerciseHistory(
    studentId: string,
    query: GetStudentProgressQueryDto,
  ): Promise<ExerciseAttempt[]> {
    // FIX TASK-2026-01-19-002: studentId is profiles.id (PK), NOT auth.users.id (FK)
    const profile = await this.profileRepository.findOne({
      where: { id: studentId },
    });

    if (!profile) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Build query conditions
    // FIX CORR-001: Use profile.id (PK) instead of profile.user_id
    const whereConditions: Record<string, unknown> = {
      user_id: profile.id,
    };

    // Apply time range filter
    if (query.time_range && query.time_range !== 'all') {
      const daysMap = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
      };
      const days = daysMap[query.time_range];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      whereConditions.submitted_at = MoreThanOrEqual(startDate);
    }

    // Apply status filter
    if (query.status && query.status !== 'all') {
      whereConditions.is_correct = query.status === 'correct';
    }

    const submissions = await this.submissionRepository.find({
      where: whereConditions,
      order: { submitted_at: 'DESC' },
    });

    // P1-05: Get exercise and module data for enrichment
    const exerciseIds = [...new Set(submissions.map(s => s.exercise_id))];
    const exercises = exerciseIds.length > 0
      ? await this.exerciseRepository.find({ where: { id: In(exerciseIds) } })
      : [];
    const exerciseMap = new Map(exercises.map(e => [e.id, e]));

    // Get module data for exercise modules
    const moduleIds = [...new Set(exercises.map(e => e.module_id))];
    const modules = moduleIds.length > 0
      ? await this.moduleRepository.find({ where: { id: In(moduleIds) } })
      : [];
    const moduleMap = new Map(modules.map(m => [m.id, m]));

    // P1-05: Enriched response with real exercise/module data
    return submissions.map((sub) => {
      const exercise = exerciseMap.get(sub.exercise_id);
      const moduleData = exercise ? moduleMap.get(exercise.module_id) : undefined;

      return {
        id: sub.id,
        exercise_title: exercise?.title || 'Ejercicio',
        module_name: moduleData?.title || 'Módulo',
        exercise_type: exercise?.exercise_type || 'multiple_choice',
        is_correct: sub.is_correct || false,
        score_percentage: Math.round((sub.score / (sub.max_score || 1)) * 100),
        time_spent_seconds: sub.time_spent_seconds || 0,
        hints_used: sub.hints_count || 0,
        submitted_at: sub.submitted_at,
      };
    });
  }

  /**
   * Identify struggle areas for student
   */
  async getStruggleAreas(studentId: string): Promise<StruggleArea[]> {
    // FIX TASK-2026-01-19-002: studentId is profiles.id (PK), NOT auth.users.id (FK)
    const profile = await this.profileRepository.findOne({
      where: { id: studentId },
    });

    if (!profile) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // FIX CORR-001: Use profile.id (PK) instead of profile.user_id
    const submissions = await this.submissionRepository.find({
      where: { user_id: profile.id },
      order: { submitted_at: 'DESC' },
    });

    // Group by exercise to find struggles
    const submissionsByExercise = new Map<string, ExerciseSubmission[]>();
    submissions.forEach((sub) => {
      const key = sub.exercise_id;
      if (!submissionsByExercise.has(key)) {
        submissionsByExercise.set(key, []);
      }
      submissionsByExercise.get(key)!.push(sub);
    });

    // P1-05: Get exercise and module data for enrichment
    const exerciseIds = [...submissionsByExercise.keys()];
    const exercises = exerciseIds.length > 0
      ? await this.exerciseRepository.find({ where: { id: In(exerciseIds) } })
      : [];
    const exerciseDataMap = new Map(exercises.map(e => [e.id, e]));

    const moduleIds = [...new Set(exercises.map(e => e.module_id))];
    const modules = moduleIds.length > 0
      ? await this.moduleRepository.find({ where: { id: In(moduleIds) } })
      : [];
    const moduleDataMap = new Map(modules.map(m => [m.id, m]));

    const struggles: StruggleArea[] = [];

    submissionsByExercise.forEach((subs, exerciseId) => {
      const attempts = subs.length;
      const correctAttempts = subs.filter((s) => s.is_correct).length;
      const successRate = (correctAttempts / attempts) * 100;

      // Consider it a struggle if success rate < 70% and multiple attempts
      if (successRate < 70 && attempts >= 2) {
        const avgScore =
          subs.reduce((sum, s) => sum + (s.score / (s.max_score || 1)) * 100, 0) /
          attempts;

        // P1-05: Get real exercise/module names
        const exercise = exerciseDataMap.get(exerciseId);
        const moduleData = exercise ? moduleDataMap.get(exercise.module_id) : undefined;

        struggles.push({
          topic: exercise?.title || 'Tema del ejercicio',
          module_name: moduleData?.title || 'Módulo',
          attempts,
          success_rate: Math.round(successRate),
          average_score: Math.round(avgScore),
          last_attempt_date: subs[0].submitted_at,
        });
      }
    });

    return struggles.slice(0, 5); // Return top 5 struggles
  }

  /**
   * Compare student with class averages
   * P1-05: Updated 2025-12-18 - Calculate real class averages
   */
  async getClassComparison(studentId: string): Promise<ClassComparison[]> {
    const studentStats = await this.getStudentStats(studentId);

    // Get all students for class averages
    const allProfiles = await this.profileRepository.find();
    const allSubmissions = await this.submissionRepository.find();

    // P1-05: Get all user stats for real averages
    const allUserStats = await this.userStatsRepository.find();

    // Calculate class averages (with division by zero protection)
    const classAvgScore = allSubmissions.length > 0
      ? Math.round(
        allSubmissions.reduce(
          (sum, sub) => {
            const maxScore = sub.max_score || 1;
            return sum + (sub.score / maxScore) * 100;
          },
          0,
        ) / allSubmissions.length,
      )
      : 0;

    // Protect against division by zero when no profiles exist
    const submissionsPerStudent = allProfiles.length > 0
      ? allSubmissions.length / allProfiles.length
      : 0;

    // P1-05: Calculate real time average from submissions
    const totalTimeAllStudents = allSubmissions.reduce(
      (sum, sub) => sum + (sub.time_spent_seconds || 0),
      0,
    );
    const classAvgTimeMinutes = allProfiles.length > 0
      ? Math.round(totalTimeAllStudents / 60 / allProfiles.length)
      : 0;

    // P1-05: Calculate real streak average from user_stats
    const totalStreaks = allUserStats.reduce(
      (sum, stats) => sum + (stats.current_streak || 0),
      0,
    );
    const classAvgStreak = allUserStats.length > 0
      ? Math.round(totalStreaks / allUserStats.length)
      : 0;

    return [
      {
        metric: 'Puntuación Promedio',
        student_value: studentStats.average_score,
        class_average: classAvgScore,
        percentile: this.calculatePercentile(
          studentStats.average_score,
          classAvgScore,
        ),
      },
      {
        metric: 'Ejercicios Completados',
        student_value: studentStats.completed_exercises,
        class_average: Math.round(submissionsPerStudent),
        percentile: this.calculatePercentile(
          studentStats.completed_exercises,
          submissionsPerStudent,
        ),
      },
      {
        metric: 'Tiempo de Estudio (min)',
        student_value: studentStats.total_time_spent_minutes,
        class_average: classAvgTimeMinutes,
        percentile: this.calculatePercentile(
          studentStats.total_time_spent_minutes,
          classAvgTimeMinutes,
        ),
      },
      {
        metric: 'Racha Actual (días)',
        student_value: studentStats.current_streak_days,
        class_average: classAvgStreak,
        percentile: this.calculatePercentile(
          studentStats.current_streak_days,
          classAvgStreak,
        ),
      },
    ];
  }

  /**
   * Calculate percentile (simplified)
   */
  private calculatePercentile(
    studentValue: number,
    classAverage: number,
  ): number {
    if (classAverage === 0) return 50;
    const ratio = studentValue / classAverage;
    return Math.min(100, Math.max(0, Math.round(ratio * 50)));
  }

  /**
   * Calculate module status based on completion
   */
  private calculateModuleStatus(
    completion: number,
  ): 'not_started' | 'in_progress' | 'completed' {
    if (completion === 0) return 'not_started';
    if (completion === 100) return 'completed';
    return 'in_progress';
  }

  // =====================================================
  // TEACHER NOTES METHODS
  // =====================================================

  /**
   * Get teacher notes for a student
   */
  async getStudentNotes(
    studentId: string,
    teacherId: string,
  ): Promise<StudentNoteResponseDto[]> {
    // FIX TASK-2026-01-19-002: studentId is profiles.id (PK), NOT auth.users.id (FK)
    const student = await this.profileRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    // FIX TASK-2026-01-19-002: Use profile.user_id to find auth.users record
    // Validate user_id exists (required FK in profiles)
    if (!student.user_id) {
      throw new NotFoundException(`Profile ${studentId} has no associated user`);
    }

    const studentUser = await this.userRepository.findOne({
      where: { id: student.user_id },
    });

    if (!studentUser) {
      throw new NotFoundException(`User for student ${studentId} not found`);
    }

    // Get all classrooms where the teacher teaches
    const teacherClassrooms = await this.classroomRepository.find({
      where: { teacher_id: teacherId },
    });

    const classroomIds = teacherClassrooms.map((c) => c.id);

    if (classroomIds.length === 0) {
      return [];
    }

    // Get classroom memberships for this student in teacher's classrooms
    const memberships = await this.classroomMemberRepository
      .createQueryBuilder('member')
      .where('member.student_id = :studentId', { studentId })
      .andWhere('member.classroom_id IN (:...classroomIds)', { classroomIds })
      .getMany();

    // Get classroom details (using In operator instead of deprecated findByIds)
    const classrooms = classroomIds.length > 0
      ? await this.classroomRepository.find({
        where: { id: In(classroomIds) },
      })
      : [];
    const _classroomMap = new Map(classrooms.map((c) => [c.id, c]));

    // Map to response DTOs - FIX TASK-2026-01-18-005: Aligned with frontend StudentNote interface
    return memberships
      .filter(member => member.teacher_notes) // Only return memberships with notes
      .map((member) => ({
        id: `note-${student.id}-${member.classroom_id}`, // Composite ID for React key
        student_id: student.id,
        teacher_id: teacherId,
        classroom_id: member.classroom_id,
        note: member.teacher_notes || '', // Frontend expects 'note' not 'teacher_notes'
        category: 'general' as const, // Default category
        is_private: true, // Default to private
        created_at: member.created_at || member.updated_at, // Use created_at if available
        updated_at: member.updated_at,
      }));
  }

  /**
   * Add or update teacher note for a student
   */
  async addStudentNote(
    studentId: string,
    teacherId: string,
    noteDto: AddTeacherNoteDto,
  ): Promise<StudentNoteResponseDto> {
    // FIX TASK-2026-01-19-002: studentId is profiles.id (PK), NOT auth.users.id (FK)
    const student = await this.profileRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    // FIX TASK-2026-01-19-002: Use profile.user_id to find auth.users record
    // Validate user_id exists (required FK in profiles)
    if (!student.user_id) {
      throw new NotFoundException(`Profile ${studentId} has no associated user`);
    }

    const studentUser = await this.userRepository.findOne({
      where: { id: student.user_id },
    });

    if (!studentUser) {
      throw new NotFoundException(`User for student ${studentId} not found`);
    }

    // If classroom_id is provided, use it. Otherwise, find first classroom
    let classroomId = noteDto.classroom_id;

    if (!classroomId) {
      // Get first classroom where teacher teaches and student is enrolled
      const teacherClassrooms = await this.classroomRepository.find({
        where: { teacher_id: teacherId },
      });

      const classroomIds = teacherClassrooms.map((c) => c.id);

      const membership = await this.classroomMemberRepository.findOne({
        where: {
          student_id: studentId,
        },
      });

      if (!membership || !classroomIds.includes(membership.classroom_id)) {
        throw new BadRequestException(
          'Student is not enrolled in any of your classrooms. Please specify a classroom_id.',
        );
      }

      classroomId = membership.classroom_id;
    }

    // Verify teacher owns the classroom
    const classroom = await this.classroomRepository.findOne({
      where: { id: classroomId, teacher_id: teacherId },
    });

    if (!classroom) {
      throw new BadRequestException(
        'You do not have permission to add notes for students in this classroom',
      );
    }

    // Find classroom member
    const member = await this.classroomMemberRepository.findOne({
      where: {
        classroom_id: classroomId,
        student_id: studentId,
      },
    });

    if (!member) {
      throw new NotFoundException(
        `Student ${studentId} is not enrolled in classroom ${classroomId}`,
      );
    }

    // Update teacher notes
    member.teacher_notes = noteDto.note;
    await this.classroomMemberRepository.save(member);

    // FIX TASK-2026-01-18-005: Return structure aligned with frontend StudentNote interface
    return {
      id: `note-${student.id}-${member.classroom_id}`, // Composite ID for React key
      student_id: student.id,
      teacher_id: teacherId,
      classroom_id: member.classroom_id,
      note: member.teacher_notes || '', // Frontend expects 'note' not 'teacher_notes'
      category: 'general' as const, // Default category
      is_private: true, // Default to private
      created_at: member.created_at || member.updated_at,
      updated_at: member.updated_at,
    };
  }

  // =====================================================
  // FRONTEND-ALIGNED RESPONSE METHODS
  // =====================================================
  // FIX TASK-2026-01-18-005: Metodos que retornan estructura alineada con frontend
  // Resuelve GAP-SDM-001, GAP-SDM-002, GAP-SDM-003

  /**
   * Get student progress response aligned with frontend interface
   * Returns flat structure matching StudentProgress in studentProgressApi.ts
   *
   * @see apps/frontend/src/services/api/teacher/studentProgressApi.ts:32-51
   */
  async getStudentProgressResponse(
    studentId: string,
    _query: GetStudentProgressQueryDto,
  ): Promise<StudentProgressResponseDto> {
    // FIX TASK-2026-01-19-002: studentId is profiles.id (PK), NOT auth.users.id (FK)
    // ClassroomMember.student_id -> profiles.id, StudentInClassroomDto.user_id = profiles.id
    const profile = await this.profileRepository.findOne({
      where: { id: studentId },
    });

    if (!profile) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Get submissions for this student
    const submissions = await this.submissionRepository.find({
      where: { user_id: profile.id },
    });

    // Get module progress
    const moduleProgresses = await this.moduleProgressRepository.find({
      where: { user_id: profile.id },
    });

    // Get all modules for enrichment
    const allModules = await this.moduleRepository.find();
    const moduleMap = new Map(allModules.map(m => [m.id, m]));

    // Calculate overall stats
    const completedModules = moduleProgresses.filter(
      mp => mp.progress_percentage === 100,
    ).length;

    const completedExercises = submissions.filter(s => s.is_correct).length;

    const totalScore = submissions.reduce((sum, sub) => {
      const maxScore = sub.max_score || 1;
      return sum + (sub.score / maxScore) * 100;
    }, 0);
    const averageScore = submissions.length > 0
      ? Math.round(totalScore / submissions.length)
      : 0;

    const totalTimeSpent = submissions.reduce(
      (sum, sub) => sum + (sub.time_spent_seconds || 0),
      0,
    );

    // Calculate overall progress
    const totalModules = allModules.length || 1;
    const overallProgress = moduleProgresses.length > 0
      ? Math.round(
          moduleProgresses.reduce((sum, mp) => sum + mp.progress_percentage, 0) /
          moduleProgresses.length,
        )
      : 0;

    // Get time by module for module_progress
    const timeByModule = new Map<string, number>();
    for (const sub of submissions) {
      const exercise = await this.exerciseRepository.findOne({
        where: { id: sub.exercise_id },
      });
      if (exercise) {
        const currentTime = timeByModule.get(exercise.module_id) || 0;
        timeByModule.set(exercise.module_id, currentTime + (sub.time_spent_seconds || 0));
      }
    }

    // Build module_progress array with frontend-expected field names
    const moduleProgressData: ModuleProgressDto[] = moduleProgresses.map(mp => {
      const moduleData = moduleMap.get(mp.module_id);
      const totalActivities = moduleData?.total_exercises || 15;
      const completedActivities = Math.round((mp.progress_percentage / 100) * totalActivities);

      return {
        module_id: mp.module_id,
        module_name: moduleData?.title || `Modulo ${moduleData?.order_index || 1}`,
        progress_percentage: mp.progress_percentage || 0,
        score: Math.round(mp.average_score || mp.progress_percentage * 0.8), // Frontend expects 'score'
        exercises_completed: completedActivities, // Frontend expects 'exercises_completed'
        exercises_total: totalActivities, // Frontend expects 'exercises_total'
      };
    });

    // Get last activity date
    const lastActivity = profile.last_sign_in_at || profile.updated_at || profile.created_at;

    return {
      student_id: studentId,
      student_name: profile.full_name || profile.display_name || 'Unknown',
      overall_progress: overallProgress,
      modules_completed: completedModules,
      modules_total: totalModules,
      exercises_completed: completedExercises,
      exercises_total: submissions.length,
      average_score: averageScore,
      time_spent_minutes: Math.round(totalTimeSpent / 60),
      last_activity: lastActivity.toISOString(),
      module_progress: moduleProgressData,
    };
  }

  /**
   * Get student stats response aligned with frontend interface
   * Returns structure matching StudentStats in studentProgressApi.ts
   * Includes gamification fields required by StudentDetailModal
   *
   * @see apps/frontend/src/services/api/teacher/studentProgressApi.ts:74-91
   * @see apps/frontend/src/apps/teacher/components/monitoring/StudentDetailModal.tsx:204-246
   */
  async getStudentStatsResponse(studentId: string): Promise<StudentStatsResponseDto> {
    // FIX TASK-2026-01-19-002: studentId is profiles.id (PK), NOT auth.users.id (FK)
    const profile = await this.profileRepository.findOne({
      where: { id: studentId },
    });

    if (!profile) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Get all submissions
    const submissions = await this.submissionRepository.find({
      where: { user_id: profile.id },
    });

    // Get user stats from gamification
    const userStats = await this.userStatsRepository.findOne({
      where: { user_id: profile.id },
    });

    // Calculate stats
    const exercisesCompleted = submissions.filter(s => s.is_correct).length;
    const exercisesFailed = submissions.filter(s => !s.is_correct).length;

    // Calculate scores
    const scores = submissions.map(sub => {
      const maxScore = sub.max_score || 1;
      return (sub.score / maxScore) * 100;
    });
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const highestScore = scores.length > 0 ? Math.round(Math.max(...scores)) : 0;
    const lowestScore = scores.length > 0 ? Math.round(Math.min(...scores)) : 0;

    // Calculate time stats
    const totalTimeSpentSeconds = submissions.reduce(
      (sum, sub) => sum + (sub.time_spent_seconds || 0),
      0,
    );

    // Calculate hints used (from submissions)
    const hintsUsed = submissions.reduce(
      (sum, sub) => sum + (sub.hints_count || 0),
      0,
    );

    // Estimate total sessions (unique days with activity)
    const uniqueDates = new Set(
      submissions.map(s => s.submitted_at?.toISOString().split('T')[0]).filter(Boolean),
    );
    const totalSessions = uniqueDates.size || 1;

    // Calculate average session duration
    const averageSessionDuration = totalSessions > 0
      ? Math.round(totalTimeSpentSeconds / 60 / totalSessions)
      : 0;

    // Calculate completion rate
    const completionRate = submissions.length > 0
      ? Math.round((exercisesCompleted / submissions.length) * 100)
      : 0;

    // Calculate first attempt success rate
    // Group submissions by exercise_id and check if first attempt was correct
    const submissionsByExercise = new Map<string, typeof submissions>();
    for (const sub of submissions) {
      if (!submissionsByExercise.has(sub.exercise_id)) {
        submissionsByExercise.set(sub.exercise_id, []);
      }
      submissionsByExercise.get(sub.exercise_id)!.push(sub);
    }

    let firstAttemptSuccesses = 0;
    submissionsByExercise.forEach(subs => {
      // Sort by submitted_at to get first attempt
      const sorted = subs.sort((a, b) =>
        (a.submitted_at?.getTime() || 0) - (b.submitted_at?.getTime() || 0),
      );
      if (sorted[0]?.is_correct) {
        firstAttemptSuccesses++;
      }
    });

    const firstAttemptSuccessRate = submissionsByExercise.size > 0
      ? Math.round((firstAttemptSuccesses / submissionsByExercise.size) * 100)
      : 0;

    // Powerups used - default to 0
    // TODO: In a full implementation, this would query powerup_transactions table
    // Note: userStats does not have powerups_used field currently
    const powerupsUsed = 0;

    return {
      student_id: studentId,
      total_sessions: totalSessions,
      average_session_duration: averageSessionDuration,
      total_time_spent: totalTimeSpentSeconds,
      exercises_attempted: submissions.length,
      exercises_completed: exercisesCompleted,
      exercises_failed: exercisesFailed,
      average_score: averageScore,
      highest_score: highestScore,
      lowest_score: lowestScore,
      completion_rate: completionRate,
      first_attempt_success_rate: firstAttemptSuccessRate,
      powerups_used: powerupsUsed,
      hints_used: hintsUsed,
      streak_current: userStats?.current_streak || 0, // Frontend expects 'streak_current'
      streak_longest: userStats?.max_streak || 0, // Frontend expects 'streak_longest'
    };
  }
}
