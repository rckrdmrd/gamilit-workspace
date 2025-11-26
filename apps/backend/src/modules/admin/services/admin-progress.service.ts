import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  ProgressOverviewDto,
  ClassroomProgressDto,
  StudentProgressDto,
  ModuleProgressStatsDto,
  ExerciseStatsDto,
  StudentProgressQueryDto,
  ModuleProgressQueryDto,
  UserInfoDto,
  ModuleInfoDto,
  ProgressStatsDto,
  ExerciseInfoDto,
  SubmissionStatsDto,
  StudentAchievementsResponseDto,
  StudentAchievementDto,
} from '../dto/progress';

/**
 * Service for admin progress tracking and analytics
 * Provides detailed insights into student, classroom, module, and exercise progress
 */
@Injectable()
export class AdminProgressService {
  private readonly logger = new Logger(AdminProgressService.name);

  constructor(
    @InjectDataSource('auth')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get system-wide progress overview
   * Returns global statistics across all users and modules
   */
  async getProgressOverview(): Promise<ProgressOverviewDto> {
    this.logger.log('Fetching progress overview');

    const query = `
      SELECT
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN u.status = 'ACTIVE' THEN u.id END) as active_users,
        COUNT(DISTINCT es.id) as total_submissions,
        COUNT(DISTINCT CASE WHEN es.is_correct = true THEN es.id END) as correct_submissions,
        ROUND(AVG(CASE WHEN es.score IS NOT NULL THEN es.score ELSE 0 END), 2) as avg_score,
        COUNT(DISTINCT CASE WHEN mp.status = 'completed' THEN mp.id END) as completed_modules,
        COUNT(DISTINCT CASE WHEN mp.status = 'in_progress' THEN mp.id END) as in_progress_modules,
        ROUND(AVG(CASE WHEN mp.progress_percentage IS NOT NULL THEN mp.progress_percentage ELSE 0 END), 2) as avg_progress_percent,
        SUM(COALESCE(mp.time_spent, interval '0')) as total_time_spent
      FROM auth_management.profiles u
      LEFT JOIN progress_tracking.exercise_submissions es ON u.id = es.user_id
      LEFT JOIN progress_tracking.module_progress mp ON u.id = mp.user_id
      WHERE u.role = 'student'
    `;

    const result = await this.dataSource.query(query);
    const row = result[0];

    return {
      total_users: parseInt(row.total_users || '0'),
      active_users: parseInt(row.active_users || '0'),
      total_submissions: parseInt(row.total_submissions || '0'),
      correct_submissions: parseInt(row.correct_submissions || '0'),
      avg_score: parseFloat(row.avg_score || '0'),
      completed_modules: parseInt(row.completed_modules || '0'),
      in_progress_modules: parseInt(row.in_progress_modules || '0'),
      avg_progress_percent: parseFloat(row.avg_progress_percent || '0'),
      total_time_spent_hours: this.convertIntervalToHours(row.total_time_spent),
    };
  }

  /**
   * Get detailed progress for a specific classroom
   * Includes classroom info and all students' progress
   */
  async getClassroomProgress(classroomId: string): Promise<ClassroomProgressDto> {
    this.logger.log(`Fetching classroom progress for: ${classroomId}`);

    // Get classroom overview
    const classroomQuery = `
      SELECT
        classroom_id,
        classroom_name,
        teacher_name,
        total_students,
        active_students,
        avg_class_progress_percent
      FROM admin_dashboard.classroom_overview
      WHERE classroom_id = $1
    `;

    const classroomResult = await this.dataSource.query(classroomQuery, [classroomId]);

    if (!classroomResult || classroomResult.length === 0) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    const classroom = classroomResult[0];

    // Get students in classroom with their progress
    const studentsQuery = `
      SELECT
        u.id as user_id,
        u.display_name,
        u.email,
        COALESCE(ups.level, 1) as level,
        COALESCE(ups.total_xp, 0) as total_xp,
        COALESCE(ups.exercises_completed, 0) as exercises_completed,
        COALESCE(ups.modules_completed, 0) as modules_completed,
        COALESCE(ups.streak_days, 0) as streak_days,
        ups.last_activity_at,
        COALESCE(AVG(mp.progress_percentage), 0) as avg_module_progress,
        COUNT(DISTINCT CASE WHEN mp.status = 'completed' THEN mp.id END) as modules_completed_count,
        COUNT(DISTINCT es.id) as total_submissions,
        COUNT(DISTINCT CASE WHEN es.is_correct = true THEN es.id END) as correct_submissions,
        ROUND(AVG(CASE WHEN es.score IS NOT NULL THEN es.score ELSE NULL END), 2) as avg_score
      FROM social_features.classroom_members cm
      INNER JOIN auth_management.profiles u ON cm.student_id = u.id
      LEFT JOIN progress_tracking.user_progress_summary ups ON u.id = ups.user_id
      LEFT JOIN progress_tracking.module_progress mp ON u.id = mp.user_id AND mp.classroom_id = $1
      LEFT JOIN progress_tracking.exercise_submissions es ON u.id = es.user_id
      WHERE cm.classroom_id = $1 AND u.status = 'ACTIVE'
      GROUP BY u.id, u.display_name, u.email, ups.level, ups.total_xp,
               ups.exercises_completed, ups.modules_completed, ups.streak_days, ups.last_activity_at
      ORDER BY ups.total_xp DESC NULLS LAST
    `;

    const studentsResult = await this.dataSource.query(studentsQuery, [classroomId]);

    return {
      classroom_id: classroom.classroom_id,
      classroom_name: classroom.classroom_name,
      teacher_name: classroom.teacher_name,
      total_students: parseInt(classroom.total_students || '0'),
      active_students: parseInt(classroom.active_students || '0'),
      avg_class_progress_percent: parseFloat(classroom.avg_class_progress_percent || '0'),
      students: studentsResult.map((row: any) => ({
        user_id: row.user_id,
        display_name: row.display_name,
        email: row.email,
        level: parseInt(row.level || '1'),
        total_xp: parseInt(row.total_xp || '0'),
        exercises_completed: parseInt(row.exercises_completed || '0'),
        modules_completed: parseInt(row.modules_completed || '0'),
        streak_days: parseInt(row.streak_days || '0'),
        last_activity_at: row.last_activity_at,
        avg_module_progress: parseFloat(row.avg_module_progress || '0'),
        modules_completed_count: parseInt(row.modules_completed_count || '0'),
        total_submissions: parseInt(row.total_submissions || '0'),
        correct_submissions: parseInt(row.correct_submissions || '0'),
        avg_score: row.avg_score ? parseFloat(row.avg_score) : null,
      })),
    };
  }

  /**
   * Get detailed progress for a specific student
   * Includes user info, module progress, and recent submissions
   */
  async getStudentProgress(
    studentId: string,
    query: StudentProgressQueryDto,
  ): Promise<StudentProgressDto> {
    this.logger.log(`Fetching student progress for: ${studentId}`);

    // Get user info
    const userQuery = `
      SELECT
        u.id,
        u.display_name,
        u.email,
        u.status,
        COALESCE(ups.level, 1) as level,
        COALESCE(ups.total_xp, 0) as total_xp,
        COALESCE(ups.ml_coins, 0) as ml_coins,
        COALESCE(ups.exercises_completed, 0) as exercises_completed,
        COALESCE(ups.modules_completed, 0) as modules_completed,
        COALESCE(ups.streak_days, 0) as streak_days,
        COALESCE(ups.max_streak, 0) as max_streak,
        COALESCE(ups.achievements_earned, 0) as achievements_earned,
        ups.last_activity_at
      FROM auth_management.profiles u
      LEFT JOIN progress_tracking.user_progress_summary ups ON u.id = ups.user_id
      WHERE u.id = $1
    `;

    const userResult = await this.dataSource.query(userQuery, [studentId]);

    if (!userResult || userResult.length === 0) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const user = userResult[0];
    const userInfo: UserInfoDto = {
      id: user.id,
      display_name: user.display_name,
      email: user.email,
      status: user.status,
      level: parseInt(user.level || '1'),
      total_xp: parseInt(user.total_xp || '0'),
      ml_coins: parseInt(user.ml_coins || '0'),
      exercises_completed: parseInt(user.exercises_completed || '0'),
      modules_completed: parseInt(user.modules_completed || '0'),
      streak_days: parseInt(user.streak_days || '0'),
      max_streak: parseInt(user.max_streak || '0'),
      achievements_earned: parseInt(user.achievements_earned || '0'),
      last_activity_at: user.last_activity_at,
    };

    // Get module progress
    const moduleProgressQuery = `
      SELECT
        mp.id,
        mp.module_id,
        m.title as module_title,
        mp.status,
        mp.progress_percentage,
        mp.completed_exercises,
        mp.total_exercises,
        mp.average_score,
        mp.total_xp_earned,
        mp.time_spent,
        mp.started_at,
        mp.completed_at,
        mp.last_accessed_at,
        mp.classroom_id,
        c.name as classroom_name
      FROM progress_tracking.module_progress mp
      INNER JOIN educational_content.modules m ON mp.module_id = m.id
      LEFT JOIN social_features.classrooms c ON mp.classroom_id = c.id
      WHERE mp.user_id = $1
        AND ($2::uuid IS NULL OR mp.classroom_id = $2)
        AND ($3::uuid IS NULL OR mp.module_id = $3)
      ORDER BY mp.last_accessed_at DESC NULLS LAST
    `;

    const moduleProgressResult = await this.dataSource.query(moduleProgressQuery, [
      studentId,
      query.classroom_id || null,
      query.module_id || null,
    ]);

    // Get recent submissions with gamification data
    // NOTE: xp_earned and ml_coins_earned come from exercise_attempts table
    const submissionsQuery = `
      SELECT
        es.id,
        es.exercise_id,
        e.title as exercise_title,
        e.exercise_type,
        es.score,
        es.max_score,
        es.is_correct,
        es.time_spent_seconds,
        es.attempt_number,
        es.status,
        es.submitted_at,
        es.feedback,
        es.graded_at,
        es.ml_coins_spent,
        COALESCE(es.comodines_used, ARRAY[]::text[]) as comodines_used,
        COALESCE(es.hints_count, 0) as hints_count,
        -- Get xp_earned and ml_coins_earned from corresponding exercise_attempt
        COALESCE(
          (SELECT ea.xp_earned
           FROM progress_tracking.exercise_attempts ea
           WHERE ea.user_id = es.user_id
             AND ea.exercise_id = es.exercise_id
             AND ea.attempt_number = es.attempt_number
           ORDER BY ea.submitted_at DESC
           LIMIT 1),
          0
        ) as xp_earned,
        COALESCE(
          (SELECT ea.ml_coins_earned
           FROM progress_tracking.exercise_attempts ea
           WHERE ea.user_id = es.user_id
             AND ea.exercise_id = es.exercise_id
             AND ea.attempt_number = es.attempt_number
           ORDER BY ea.submitted_at DESC
           LIMIT 1),
          0
        ) as ml_coins_earned,
        -- Determine grading status
        CASE
          WHEN es.graded_at IS NOT NULL AND es.feedback IS NOT NULL THEN 'manually_graded'
          WHEN es.graded_at IS NOT NULL OR es.status = 'graded' THEN 'auto_graded'
          ELSE 'pending'
        END as grading_status
      FROM progress_tracking.exercise_submissions es
      INNER JOIN educational_content.exercises e ON es.exercise_id = e.id
      WHERE es.user_id = $1
      ORDER BY es.submitted_at DESC
      LIMIT 20
    `;

    const submissionsResult = await this.dataSource.query(submissionsQuery, [studentId]);

    return {
      user_info: userInfo,
      modules_progress: moduleProgressResult.map((row: any) => ({
        id: row.id,
        module_id: row.module_id,
        module_title: row.module_title,
        status: row.status,
        progress_percentage: parseInt(row.progress_percentage || '0'),
        completed_exercises: parseInt(row.completed_exercises || '0'),
        total_exercises: parseInt(row.total_exercises || '0'),
        average_score: row.average_score ? parseFloat(row.average_score) : null,
        total_xp_earned: parseInt(row.total_xp_earned || '0'),
        time_spent_minutes: this.convertIntervalToMinutes(row.time_spent),
        started_at: row.started_at,
        completed_at: row.completed_at,
        last_accessed_at: row.last_accessed_at,
        classroom_id: row.classroom_id,
        classroom_name: row.classroom_name,
      })),
      recent_submissions: submissionsResult.map((row: any) => ({
        id: row.id,
        exercise_id: row.exercise_id,
        exercise_title: row.exercise_title,
        exercise_type: row.exercise_type,
        score: parseInt(row.score || '0'),
        max_score: parseInt(row.max_score || '100'),
        is_correct: row.is_correct,
        time_spent_seconds: row.time_spent_seconds,
        attempt_number: parseInt(row.attempt_number || '1'),
        status: row.status,
        submitted_at: row.submitted_at,
        // Gamification fields
        xp_earned: parseInt(row.xp_earned || '0'),
        ml_coins_earned: parseInt(row.ml_coins_earned || '0'),
        ml_coins_spent: parseInt(row.ml_coins_spent || '0'),
        // Feedback & grading
        feedback: row.feedback || null,
        grading_status: row.grading_status,
        graded_by: null, // TODO: Add graded_by field to exercise_submissions table
        graded_at: row.graded_at || null,
        // Comodines & hints
        comodines_used: row.comodines_used || [],
        hints_used: parseInt(row.hints_count || '0'),
      })),
    };
  }

  /**
   * Get achievements earned by a specific student
   * Includes achievement details, rewards, and summary statistics
   */
  async getStudentAchievements(studentId: string): Promise<StudentAchievementsResponseDto> {
    this.logger.log(`Fetching achievements for student: ${studentId}`);

    // Verify student exists
    const studentQuery = `
      SELECT id FROM auth_management.profiles
      WHERE id = $1 AND role = 'student'
    `;

    const studentResult = await this.dataSource.query(studentQuery, [studentId]);

    if (!studentResult || studentResult.length === 0) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Get student achievements
    const achievementsQuery = `
      SELECT
        ua.id,
        ua.achievement_id,
        a.name,
        a.description,
        a.category,
        a.tier,
        a.xp_reward,
        a.ml_coins_reward,
        a.icon_url,
        ua.unlocked_at,
        ua.progress_current,
        ua.progress_required
      FROM gamification_system.user_achievements ua
      JOIN gamification_system.achievements a ON a.id = ua.achievement_id
      WHERE ua.user_id = $1
      ORDER BY ua.unlocked_at DESC
    `;

    const achievementsResult = await this.dataSource.query(achievementsQuery, [studentId]);

    // Map achievements to DTOs
    const achievements: StudentAchievementDto[] = achievementsResult.map((row: any) => ({
      id: row.id,
      achievement_id: row.achievement_id,
      name: row.name,
      description: row.description,
      category: row.category,
      tier: row.tier,
      xp_reward: parseInt(row.xp_reward || '0'),
      ml_coins_reward: parseInt(row.ml_coins_reward || '0'),
      icon_url: row.icon_url,
      unlocked_at: row.unlocked_at,
      progress_current: row.progress_current ? parseInt(row.progress_current) : null,
      progress_required: row.progress_required ? parseInt(row.progress_required) : null,
    }));

    // Calculate summary statistics by category
    const byCategory: Record<string, number> = {};
    achievements.forEach((achievement) => {
      const category = achievement.category;
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    // Calculate summary statistics by tier
    const byTier: Record<string, number> = {};
    achievements.forEach((achievement) => {
      const tier = achievement.tier;
      byTier[tier] = (byTier[tier] || 0) + 1;
    });

    return {
      student_id: studentId,
      total_achievements: achievements.length,
      achievements,
      by_category: byCategory,
      by_tier: byTier,
    };
  }

  /**
   * Get progress statistics for a specific module
   * Includes module info and aggregated progress stats
   */
  async getModuleProgress(
    moduleId: string,
    query: ModuleProgressQueryDto,
  ): Promise<ModuleProgressStatsDto> {
    this.logger.log(`Fetching module progress for: ${moduleId}`);

    // Get module info
    const moduleQuery = `
      SELECT
        m.id,
        m.title,
        m.description,
        m.difficulty_level,
        m.estimated_duration,
        m.order_number,
        COUNT(DISTINCT e.id) as total_exercises
      FROM educational_content.modules m
      LEFT JOIN educational_content.exercises e ON m.id = e.module_id
      WHERE m.id = $1
      GROUP BY m.id
    `;

    const moduleResult = await this.dataSource.query(moduleQuery, [moduleId]);

    if (!moduleResult || moduleResult.length === 0) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    const module = moduleResult[0];
    const moduleInfo: ModuleInfoDto = {
      id: module.id,
      title: module.title,
      description: module.description,
      difficulty_level: module.difficulty_level,
      estimated_duration: module.estimated_duration,
      order_number: parseInt(module.order_number || '0'),
      total_exercises: parseInt(module.total_exercises || '0'),
    };

    // Get progress stats
    const statsQuery = `
      SELECT
        COUNT(DISTINCT mp.user_id) as total_students,
        COUNT(DISTINCT CASE WHEN mp.status = 'not_started' THEN mp.user_id END) as not_started_count,
        COUNT(DISTINCT CASE WHEN mp.status = 'in_progress' THEN mp.user_id END) as in_progress_count,
        COUNT(DISTINCT CASE WHEN mp.status = 'completed' THEN mp.user_id END) as completed_count,
        ROUND(AVG(CASE WHEN mp.progress_percentage IS NOT NULL THEN mp.progress_percentage ELSE 0 END), 2) as avg_progress_percent,
        ROUND(AVG(CASE WHEN mp.average_score IS NOT NULL THEN mp.average_score ELSE NULL END), 2) as avg_score,
        AVG(mp.time_spent) as avg_time_spent,
        SUM(mp.total_xp_earned) as total_xp_distributed
      FROM progress_tracking.module_progress mp
      WHERE mp.module_id = $1
        AND ($2::uuid IS NULL OR mp.classroom_id = $2)
    `;

    const statsResult = await this.dataSource.query(statsQuery, [moduleId, query.classroom_id || null]);
    const stats = statsResult[0];

    const progressStats: ProgressStatsDto = {
      total_students: parseInt(stats.total_students || '0'),
      not_started_count: parseInt(stats.not_started_count || '0'),
      in_progress_count: parseInt(stats.in_progress_count || '0'),
      completed_count: parseInt(stats.completed_count || '0'),
      avg_progress_percent: parseFloat(stats.avg_progress_percent || '0'),
      avg_score: stats.avg_score ? parseFloat(stats.avg_score) : null,
      avg_time_spent_minutes: this.convertIntervalToMinutes(stats.avg_time_spent),
      total_xp_distributed: parseInt(stats.total_xp_distributed || '0'),
    };

    return {
      module_info: moduleInfo,
      progress_stats: progressStats,
    };
  }

  /**
   * Get statistics for a specific exercise
   * Includes exercise info and submission statistics
   */
  async getExerciseStats(exerciseId: string): Promise<ExerciseStatsDto> {
    this.logger.log(`Fetching exercise stats for: ${exerciseId}`);

    // Get exercise info
    const exerciseQuery = `
      SELECT
        e.id,
        e.title,
        e.description,
        e.exercise_type,
        e.difficulty,
        e.xp_reward,
        e.ml_coins_reward,
        m.id as module_id,
        m.title as module_title
      FROM educational_content.exercises e
      INNER JOIN educational_content.modules m ON e.module_id = m.id
      WHERE e.id = $1
    `;

    const exerciseResult = await this.dataSource.query(exerciseQuery, [exerciseId]);

    if (!exerciseResult || exerciseResult.length === 0) {
      throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
    }

    const exercise = exerciseResult[0];
    const exerciseInfo: ExerciseInfoDto = {
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      exercise_type: exercise.exercise_type,
      difficulty: exercise.difficulty,
      xp_reward: parseInt(exercise.xp_reward || '0'),
      ml_coins_reward: parseInt(exercise.ml_coins_reward || '0'),
      module_id: exercise.module_id,
      module_title: exercise.module_title,
    };

    // Get submission stats
    const statsQuery = `
      SELECT
        COUNT(DISTINCT es.user_id) as total_students_attempted,
        COUNT(es.id) as total_submissions,
        COUNT(DISTINCT CASE WHEN es.is_correct = true THEN es.user_id END) as students_completed,
        ROUND(
          100.0 * COUNT(DISTINCT CASE WHEN es.is_correct = true THEN es.user_id END) /
          NULLIF(COUNT(DISTINCT es.user_id), 0),
          2
        ) as completion_rate,
        ROUND(AVG(CASE WHEN es.score IS NOT NULL THEN es.score ELSE NULL END), 2) as avg_score,
        MAX(CASE WHEN es.score IS NOT NULL THEN es.score ELSE NULL END) as max_score_achieved,
        MIN(CASE WHEN es.score IS NOT NULL THEN es.score ELSE NULL END) as min_score_achieved,
        ROUND(AVG(CASE WHEN es.time_spent_seconds IS NOT NULL THEN es.time_spent_seconds ELSE NULL END), 0) as avg_time_seconds,
        ROUND(AVG(es.attempt_number), 1) as avg_attempts
      FROM progress_tracking.exercise_submissions es
      WHERE es.exercise_id = $1
    `;

    const statsResult = await this.dataSource.query(statsQuery, [exerciseId]);
    const stats = statsResult[0];

    const submissionStats: SubmissionStatsDto = {
      total_students_attempted: parseInt(stats.total_students_attempted || '0'),
      total_submissions: parseInt(stats.total_submissions || '0'),
      students_completed: parseInt(stats.students_completed || '0'),
      completion_rate: parseFloat(stats.completion_rate || '0'),
      avg_score: stats.avg_score ? parseFloat(stats.avg_score) : null,
      max_score_achieved: stats.max_score_achieved ? parseInt(stats.max_score_achieved) : null,
      min_score_achieved: stats.min_score_achieved ? parseInt(stats.min_score_achieved) : null,
      avg_time_seconds: stats.avg_time_seconds ? parseInt(stats.avg_time_seconds) : null,
      avg_attempts: parseFloat(stats.avg_attempts || '0'),
    };

    return {
      exercise_info: exerciseInfo,
      submission_stats: submissionStats,
    };
  }

  /**
   * Export progress data to CSV format
   * Supports students, classrooms, and modules export types
   */
  async exportProgressData(
    type: string,
    classroomId?: string,
  ): Promise<string> {
    this.logger.log(`Exporting progress data: type=${type}, classroom=${classroomId}`);

    switch (type) {
      case 'students':
        return this.exportStudentsProgress(classroomId);
      case 'classrooms':
        return this.exportClassroomsProgress();
      case 'modules':
        return this.exportModulesProgress(classroomId);
      default:
        throw new Error(`Invalid export type: ${type}`);
    }
  }

  /**
   * Export students progress to CSV
   */
  private async exportStudentsProgress(classroomId?: string): Promise<string> {
    const query = `
      SELECT
        u.id,
        u.display_name,
        u.email,
        COALESCE(ups.level, 1) as level,
        COALESCE(ups.total_xp, 0) as total_xp,
        COALESCE(ups.ml_coins, 0) as ml_coins,
        COALESCE(ups.exercises_completed, 0) as exercises_completed,
        COALESCE(ups.modules_completed, 0) as modules_completed,
        COALESCE(ups.streak_days, 0) as streak_days,
        ups.last_activity_at,
        c.name as classroom_name
      FROM auth_management.profiles u
      LEFT JOIN progress_tracking.user_progress_summary ups ON u.id = ups.user_id
      LEFT JOIN social_features.classroom_members cm ON u.id = cm.student_id
      LEFT JOIN social_features.classrooms c ON cm.classroom_id = c.id
      WHERE u.role = 'student'
        AND ($1::uuid IS NULL OR cm.classroom_id = $1)
      ORDER BY ups.total_xp DESC NULLS LAST
    `;

    const result = await this.dataSource.query(query, [classroomId || null]);
    return this.convertToCSV(result, [
      'id',
      'display_name',
      'email',
      'level',
      'total_xp',
      'ml_coins',
      'exercises_completed',
      'modules_completed',
      'streak_days',
      'last_activity_at',
      'classroom_name',
    ]);
  }

  /**
   * Export classrooms progress to CSV
   */
  private async exportClassroomsProgress(): Promise<string> {
    const query = `
      SELECT
        classroom_id,
        classroom_name,
        teacher_name,
        total_students,
        active_students,
        total_assignments,
        avg_class_progress_percent,
        classroom_status
      FROM admin_dashboard.classroom_overview
      ORDER BY classroom_name
    `;

    const result = await this.dataSource.query(query);
    return this.convertToCSV(result, [
      'classroom_id',
      'classroom_name',
      'teacher_name',
      'total_students',
      'active_students',
      'total_assignments',
      'avg_class_progress_percent',
      'classroom_status',
    ]);
  }

  /**
   * Export modules progress to CSV
   */
  private async exportModulesProgress(classroomId?: string): Promise<string> {
    const query = `
      SELECT
        m.id,
        m.title,
        m.difficulty_level,
        m.order_number,
        COUNT(DISTINCT mp.user_id) as total_students,
        COUNT(DISTINCT CASE WHEN mp.status = 'completed' THEN mp.user_id END) as completed_count,
        ROUND(AVG(mp.progress_percentage), 2) as avg_progress_percent,
        ROUND(AVG(mp.average_score), 2) as avg_score
      FROM educational_content.modules m
      LEFT JOIN progress_tracking.module_progress mp ON m.id = mp.module_id
      WHERE ($1::uuid IS NULL OR mp.classroom_id = $1)
      GROUP BY m.id
      ORDER BY m.order_number
    `;

    const result = await this.dataSource.query(query, [classroomId || null]);
    return this.convertToCSV(result, [
      'id',
      'title',
      'difficulty_level',
      'order_number',
      'total_students',
      'completed_count',
      'avg_progress_percent',
      'avg_score',
    ]);
  }

  /**
   * Convert PostgreSQL interval to minutes
   */
  private convertIntervalToMinutes(interval: any): number {
    if (!interval) return 0;

    // Handle PostgreSQL interval object
    if (typeof interval === 'object') {
      const hours = interval.hours || 0;
      const minutes = interval.minutes || 0;
      const seconds = interval.seconds || 0;
      return hours * 60 + minutes + Math.round(seconds / 60);
    }

    // Handle string format "HH:MM:SS"
    if (typeof interval === 'string') {
      const parts = interval.split(':');
      if (parts.length === 3) {
        const hours = parseInt(parts[0] || '0');
        const minutes = parseInt(parts[1] || '0');
        const seconds = parseInt(parts[2] || '0');
        return hours * 60 + minutes + Math.round(seconds / 60);
      }
    }

    return 0;
  }

  /**
   * Convert PostgreSQL interval to hours
   */
  private convertIntervalToHours(interval: any): number {
    const minutes = this.convertIntervalToMinutes(interval);
    return Math.round((minutes / 60) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert array of objects to CSV string
   */
  private convertToCSV(data: any[], columns: string[]): string {
    if (!data || data.length === 0) {
      return columns.join(',') + '\n';
    }

    // Header row
    const header = columns.join(',');

    // Data rows
    const rows = data.map((row) => {
      return columns
        .map((col) => {
          const value = row[col];
          if (value === null || value === undefined) {
            return '';
          }
          // Escape commas and quotes
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',');
    });

    return [header, ...rows].join('\n');
  }
}
