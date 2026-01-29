/**
 * ReportContentAggregatorService
 *
 * EXT-010 Parent Notifications - Content Aggregation
 *
 * @description Aggregates student progress data from multiple sources for parent reports.
 * Collects XP, achievements, reading time, exercise completion, and areas for improvement.
 *
 * @see ET-PAR-001-weekly-reports.md
 * @created 2026-01-27
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Aggregated Progress Data Interface
 */
export interface ProgressData {
  // XP and Level
  xpEarned: number;
  totalXp: number;
  currentLevel: number;
  currentRank: string;

  // Activity Metrics
  readingTimeMinutes: number;
  exercisesCompleted: number;
  exercisesAttempted: number;
  averageAccuracy: number;
  modulesCompleted: number;
  modulesStarted: number;

  // Achievements
  achievementsUnlocked: string[];
  achievementsInProgress: Array<{ name: string; progress: number }>;

  // Streaks
  currentStreak: number;
  maxStreak: number;
  daysActive: number;

  // Areas for Improvement
  areasForImprovement: string[];
  lowPerformanceAreas: Array<{ area: string; score: number }>;

  // Recommendations
  recommendations: string[];

  // Raw data for detailed views
  sessionsCount: number;
  lastActivityDate: Date | null;
}

@Injectable()
export class ReportContentAggregatorService {
  private readonly logger = new Logger(ReportContentAggregatorService.name);

  constructor(
    @InjectDataSource('gamification')
    private readonly gamificationDs: DataSource,
    @InjectDataSource('progress')
    private readonly progressDs: DataSource,
    @InjectDataSource('educational')
    private readonly educationalDs: DataSource,
  ) {}

  /**
   * Aggregate all student progress data for the given date range
   *
   * @param studentId - Student profile ID
   * @param startDate - Start of reporting period
   * @param endDate - End of reporting period
   * @returns Aggregated progress data
   */
  async aggregateStudentProgress(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ProgressData> {
    this.logger.debug(
      `Aggregating progress for student ${studentId} from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    // Execute all aggregations in parallel for performance
    const [
      xpData,
      activityData,
      achievements,
      streakData,
      exercisePerformance,
      moduleProgress,
      sessionsData,
    ] = await Promise.all([
      this.getXpData(studentId, startDate, endDate),
      this.getActivityData(studentId, startDate, endDate),
      this.getAchievements(studentId, startDate, endDate),
      this.getStreakData(studentId),
      this.getExercisePerformance(studentId, startDate, endDate),
      this.getModuleProgress(studentId, startDate, endDate),
      this.getSessionsData(studentId, startDate, endDate),
    ]);

    // Analyze areas for improvement
    const { areasForImprovement, lowPerformanceAreas } = this.analyzeAreasForImprovement(
      exercisePerformance,
      moduleProgress,
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      activityData,
      exercisePerformance,
      streakData,
    );

    return {
      // XP and Level
      xpEarned: xpData.xpEarned,
      totalXp: xpData.totalXp,
      currentLevel: xpData.currentLevel,
      currentRank: xpData.currentRank,

      // Activity Metrics
      readingTimeMinutes: activityData.readingTimeMinutes,
      exercisesCompleted: activityData.exercisesCompleted,
      exercisesAttempted: activityData.exercisesAttempted,
      averageAccuracy: activityData.averageAccuracy,
      modulesCompleted: moduleProgress.completed,
      modulesStarted: moduleProgress.started,

      // Achievements
      achievementsUnlocked: achievements.unlocked,
      achievementsInProgress: achievements.inProgress,

      // Streaks
      currentStreak: streakData.currentStreak,
      maxStreak: streakData.maxStreak,
      daysActive: activityData.daysActive,

      // Areas for Improvement
      areasForImprovement,
      lowPerformanceAreas,

      // Recommendations
      recommendations,

      // Raw data
      sessionsCount: sessionsData.count,
      lastActivityDate: sessionsData.lastActivity,
    };
  }

  /**
   * Get XP data from gamification system
   */
  private async getXpData(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    xpEarned: number;
    totalXp: number;
    currentLevel: number;
    currentRank: string;
  }> {
    try {
      // Get current user stats
      const statsResult = await this.gamificationDs.query(
        `
        SELECT total_xp, level, current_rank
        FROM gamification_system.user_stats
        WHERE user_id = $1
        `,
        [studentId],
      );

      const currentStats = statsResult[0] || {
        total_xp: 0,
        level: 1,
        current_rank: 'Ajaw',
      };

      // Calculate XP earned this period from transactions
      const xpResult = await this.gamificationDs.query(
        `
        SELECT COALESCE(SUM(amount), 0) as xp_earned
        FROM gamification_system.ml_coins_transactions
        WHERE user_id = $1
          AND transaction_type = 'xp_gain'
          AND created_at >= $2
          AND created_at <= $3
        `,
        [studentId, startDate, endDate],
      );

      return {
        xpEarned: parseInt(xpResult[0]?.xp_earned || '0', 10),
        totalXp: currentStats.total_xp,
        currentLevel: currentStats.level,
        currentRank: currentStats.current_rank,
      };
    } catch (error) {
      this.logger.warn(`Failed to get XP data for student ${studentId}:`, error);
      return {
        xpEarned: 0,
        totalXp: 0,
        currentLevel: 1,
        currentRank: 'Ajaw',
      };
    }
  }

  /**
   * Get activity data from progress tracking
   */
  private async getActivityData(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    readingTimeMinutes: number;
    exercisesCompleted: number;
    exercisesAttempted: number;
    averageAccuracy: number;
    daysActive: number;
  }> {
    try {
      // Get session time from learning sessions
      const sessionResult = await this.progressDs.query(
        `
        SELECT
          COALESCE(SUM(EXTRACT(EPOCH FROM active_time) / 60), 0) as reading_time_minutes,
          COUNT(DISTINCT DATE(started_at)) as days_active
        FROM progress_tracking.learning_sessions
        WHERE user_id = $1
          AND started_at >= $2
          AND started_at <= $3
        `,
        [studentId, startDate, endDate],
      );

      // Get exercise statistics
      const exerciseResult = await this.progressDs.query(
        `
        SELECT
          COUNT(*) as attempts,
          COUNT(*) FILTER (WHERE status = 'graded') as completed,
          COALESCE(AVG(score) FILTER (WHERE status = 'graded'), 0) as avg_accuracy
        FROM progress_tracking.exercise_submissions
        WHERE user_id = $1
          AND submitted_at >= $2
          AND submitted_at <= $3
        `,
        [studentId, startDate, endDate],
      );

      return {
        readingTimeMinutes: parseFloat(sessionResult[0]?.reading_time_minutes || '0'),
        exercisesCompleted: parseInt(exerciseResult[0]?.completed || '0', 10),
        exercisesAttempted: parseInt(exerciseResult[0]?.attempts || '0', 10),
        averageAccuracy: parseFloat(exerciseResult[0]?.avg_accuracy || '0'),
        daysActive: parseInt(sessionResult[0]?.days_active || '0', 10),
      };
    } catch (error) {
      this.logger.warn(`Failed to get activity data for student ${studentId}:`, error);
      return {
        readingTimeMinutes: 0,
        exercisesCompleted: 0,
        exercisesAttempted: 0,
        averageAccuracy: 0,
        daysActive: 0,
      };
    }
  }

  /**
   * Get achievements unlocked during the period
   */
  private async getAchievements(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    unlocked: string[];
    inProgress: Array<{ name: string; progress: number }>;
  }> {
    try {
      // Get newly unlocked achievements
      const unlockedResult = await this.gamificationDs.query(
        `
        SELECT a.name
        FROM gamification_system.user_achievements ua
        JOIN gamification_system.achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = $1
          AND ua.is_completed = true
          AND ua.completed_at >= $2
          AND ua.completed_at <= $3
        ORDER BY ua.completed_at DESC
        `,
        [studentId, startDate, endDate],
      );

      // Get achievements in progress
      const inProgressResult = await this.gamificationDs.query(
        `
        SELECT a.name, ua.completion_percentage as progress
        FROM gamification_system.user_achievements ua
        JOIN gamification_system.achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = $1
          AND ua.is_completed = false
          AND ua.completion_percentage > 0
        ORDER BY ua.completion_percentage DESC
        LIMIT 5
        `,
        [studentId],
      );

      return {
        unlocked: unlockedResult.map((r: any) => r.name),
        inProgress: inProgressResult.map((r: any) => ({
          name: r.name,
          progress: parseFloat(r.progress),
        })),
      };
    } catch (error) {
      this.logger.warn(`Failed to get achievements for student ${studentId}:`, error);
      return { unlocked: [], inProgress: [] };
    }
  }

  /**
   * Get streak data from user stats
   */
  private async getStreakData(
    studentId: string,
  ): Promise<{
    currentStreak: number;
    maxStreak: number;
  }> {
    try {
      const result = await this.gamificationDs.query(
        `
        SELECT current_streak, max_streak
        FROM gamification_system.user_stats
        WHERE user_id = $1
        `,
        [studentId],
      );

      return {
        currentStreak: result[0]?.current_streak || 0,
        maxStreak: result[0]?.max_streak || 0,
      };
    } catch (error) {
      this.logger.warn(`Failed to get streak data for student ${studentId}:`, error);
      return { currentStreak: 0, maxStreak: 0 };
    }
  }

  /**
   * Get exercise performance by type/category
   */
  private async getExercisePerformance(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ type: string; avgScore: number; count: number }>> {
    try {
      const result = await this.progressDs.query(
        `
        SELECT
          e.exercise_type as type,
          AVG(es.score) as avg_score,
          COUNT(*) as count
        FROM progress_tracking.exercise_submissions es
        JOIN educational_content.exercises e ON es.exercise_id = e.id
        WHERE es.user_id = $1
          AND es.submitted_at >= $2
          AND es.submitted_at <= $3
          AND es.status = 'graded'
        GROUP BY e.exercise_type
        `,
        [studentId, startDate, endDate],
      );

      return result.map((r: any) => ({
        type: r.type,
        avgScore: parseFloat(r.avg_score),
        count: parseInt(r.count, 10),
      }));
    } catch (error) {
      this.logger.warn(`Failed to get exercise performance for student ${studentId}:`, error);
      return [];
    }
  }

  /**
   * Get module progress data
   */
  private async getModuleProgress(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ completed: number; started: number; details: Array<{ name: string; progress: number }> }> {
    try {
      // Count modules completed this period
      const completedResult = await this.progressDs.query(
        `
        SELECT COUNT(*) as completed
        FROM progress_tracking.module_progress
        WHERE user_id = $1
          AND completion_percentage = 100
          AND updated_at >= $2
          AND updated_at <= $3
        `,
        [studentId, startDate, endDate],
      );

      // Get all active module progress
      const detailsResult = await this.progressDs.query(
        `
        SELECT m.title as name, mp.completion_percentage as progress
        FROM progress_tracking.module_progress mp
        JOIN educational_content.modules m ON mp.module_id = m.id
        WHERE mp.user_id = $1
          AND mp.completion_percentage > 0
          AND mp.completion_percentage < 100
        ORDER BY mp.updated_at DESC
        LIMIT 10
        `,
        [studentId],
      );

      return {
        completed: parseInt(completedResult[0]?.completed || '0', 10),
        started: detailsResult.length,
        details: detailsResult.map((r: any) => ({
          name: r.name,
          progress: parseFloat(r.progress),
        })),
      };
    } catch (error) {
      this.logger.warn(`Failed to get module progress for student ${studentId}:`, error);
      return { completed: 0, started: 0, details: [] };
    }
  }

  /**
   * Get session data
   */
  private async getSessionsData(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ count: number; lastActivity: Date | null }> {
    try {
      const result = await this.progressDs.query(
        `
        SELECT
          COUNT(*) as count,
          MAX(started_at) as last_activity
        FROM progress_tracking.learning_sessions
        WHERE user_id = $1
          AND started_at >= $2
          AND started_at <= $3
        `,
        [studentId, startDate, endDate],
      );

      return {
        count: parseInt(result[0]?.count || '0', 10),
        lastActivity: result[0]?.last_activity ? new Date(result[0].last_activity) : null,
      };
    } catch (error) {
      this.logger.warn(`Failed to get sessions data for student ${studentId}:`, error);
      return { count: 0, lastActivity: null };
    }
  }

  /**
   * Analyze areas where the student needs improvement
   */
  private analyzeAreasForImprovement(
    exercisePerformance: Array<{ type: string; avgScore: number; count: number }>,
    moduleProgress: { completed: number; started: number; details: Array<{ name: string; progress: number }> },
  ): {
    areasForImprovement: string[];
    lowPerformanceAreas: Array<{ area: string; score: number }>;
  } {
    const areasForImprovement: string[] = [];
    const lowPerformanceAreas: Array<{ area: string; score: number }> = [];

    // Identify low-performing exercise types (below 60%)
    exercisePerformance.forEach((perf) => {
      if (perf.avgScore < 60 && perf.count >= 3) {
        const readableType = this.getReadableExerciseType(perf.type);
        lowPerformanceAreas.push({ area: readableType, score: perf.avgScore });
        areasForImprovement.push(
          `Necesita practica adicional en ejercicios de tipo "${readableType}" (${perf.avgScore.toFixed(0)}% promedio)`,
        );
      }
    });

    // Identify stalled modules (started but low progress)
    moduleProgress.details.forEach((mod) => {
      if (mod.progress > 10 && mod.progress < 50) {
        areasForImprovement.push(`Modulo "${mod.name}" esta a ${mod.progress.toFixed(0)}% - continuar para completar`);
      }
    });

    return { areasForImprovement, lowPerformanceAreas };
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    activityData: { readingTimeMinutes: number; exercisesCompleted: number; daysActive: number },
    exercisePerformance: Array<{ type: string; avgScore: number; count: number }>,
    streakData: { currentStreak: number; maxStreak: number },
  ): string[] {
    const recommendations: string[] = [];

    // Activity-based recommendations
    if (activityData.daysActive < 3) {
      recommendations.push(
        'Se recomienda practicar al menos 3-4 dias por semana para mejores resultados',
      );
    }

    if (activityData.readingTimeMinutes < 30) {
      recommendations.push(
        'Aumentar el tiempo de estudio diario a 15-20 minutos para mejorar la retencion',
      );
    }

    // Streak recommendations
    if (streakData.currentStreak === 0 && streakData.maxStreak > 0) {
      recommendations.push(
        `La racha maxima fue de ${streakData.maxStreak} dias - volver a practicar regularmente para recuperarla`,
      );
    }

    // Performance recommendations
    const highPerformance = exercisePerformance.filter((p) => p.avgScore >= 80);
    if (highPerformance.length > 0) {
      const types = highPerformance.map((p) => this.getReadableExerciseType(p.type)).join(', ');
      recommendations.push(`Excelente desempeno en: ${types} - considerar avanzar a ejercicios mas desafiantes`);
    }

    // Default recommendation if none generated
    if (recommendations.length === 0) {
      recommendations.push('Mantener el ritmo actual de estudio y practicar diariamente');
    }

    return recommendations;
  }

  /**
   * Convert exercise type code to readable name
   */
  private getReadableExerciseType(type: string): string {
    const typeMap: Record<string, string> = {
      multiple_choice: 'Opcion Multiple',
      fill_blank: 'Completar Espacios',
      true_false: 'Verdadero/Falso',
      matching: 'Relacionar Columnas',
      ordering: 'Ordenamiento',
      essay: 'Ensayo',
      creative_writing: 'Escritura Creativa',
      reading_comprehension: 'Comprension Lectora',
      dictation: 'Dictado',
      text_analysis: 'Analisis de Texto',
    };
    return typeMap[type] || type;
  }
}
