/**
 * EngagementMetricsService
 *
 * TASK-2026-01-18-015 Sprint 3 Task 3.2
 * Daily calculation of user engagement metrics
 *
 * @description Calculates and persists daily engagement metrics for users.
 * Uses a cron job to aggregate data at the end of each day.
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { EngagementMetrics } from '../entities/engagement-metrics.entity';
import { LearningSession } from '../entities/learning-session.entity';
import { ExerciseSubmission } from '../entities/exercise-submission.entity';
import { ModuleProgress } from '../entities/module-progress.entity';

@Injectable()
export class EngagementMetricsService {
  private readonly logger = new Logger(EngagementMetricsService.name);

  constructor(
    @InjectRepository(EngagementMetrics, 'progress')
    private readonly metricsRepo: Repository<EngagementMetrics>,
    @InjectRepository(LearningSession, 'progress')
    private readonly sessionRepo: Repository<LearningSession>,
    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly submissionRepo: Repository<ExerciseSubmission>,
    @InjectRepository(ModuleProgress, 'progress')
    private readonly progressRepo: Repository<ModuleProgress>,
  ) {}

  /**
   * Daily cron job to calculate engagement metrics at 23:59
   * Runs every night to aggregate the day's activity
   */
  @Cron('59 23 * * *')
  async calculateDailyMetrics(): Promise<void> {
    this.logger.log('Starting daily engagement metrics calculation...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all users who had sessions today
      const activeUsers = await this.sessionRepo
        .createQueryBuilder('s')
        .select('DISTINCT s.user_id', 'user_id')
        .where('s.started_at >= :today', { today })
        .andWhere('s.started_at < :tomorrow', { tomorrow })
        .getRawMany();

      this.logger.log(`Found ${activeUsers.length} active users for today`);

      let processed = 0;
      let errors = 0;

      for (const { user_id } of activeUsers) {
        try {
          await this.calculateUserMetrics(user_id, today, tomorrow);
          processed++;
        } catch (error: unknown) {
          errors++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.warn(`Failed to calculate metrics for user ${user_id}: ${errorMessage}`);
        }
      }

      this.logger.log(
        `Daily metrics calculation complete. Processed: ${processed}, Errors: ${errors}`,
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Daily metrics calculation failed: ${errorMessage}`);
    }
  }

  /**
   * Calculate engagement metrics for a specific user on a given date
   */
  private async calculateUserMetrics(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<EngagementMetrics> {
    // Get session counts and time
    const sessions = await this.sessionRepo.find({
      where: {
        user_id: userId,
        started_at: Between(startDate, endDate),
      },
    });

    const sessionsCount = sessions.length;
    let totalTimeSeconds = 0;
    let _exercisesAttempted = 0;
    let _exercisesCompleted = 0;

    sessions.forEach((session) => {
      // Calculate time from session
      if (session.active_time) {
        // Parse interval if it's in a specific format
        const seconds = this.parseIntervalToSeconds(session.active_time);
        totalTimeSeconds += seconds;
      }
      _exercisesAttempted += session.exercises_attempted || 0;
      _exercisesCompleted += session.exercises_completed || 0;
    });

    // Get submission stats for the day
    const submissionStats = await this.submissionRepo
      .createQueryBuilder('s')
      .select('COUNT(*)', 'total')
      .addSelect('COUNT(*) FILTER (WHERE s.is_correct = true)', 'correct')
      .where('s.user_id = :userId', { userId })
      .andWhere('s.submitted_at >= :startDate', { startDate })
      .andWhere('s.submitted_at < :endDate', { endDate })
      .getRawOne();

    // Get module progress stats
    const moduleStats = await this.progressRepo
      .createQueryBuilder('p')
      .select('COUNT(*) FILTER (WHERE p.progress_percentage = 100)', 'completed')
      .where('p.user_id = :userId', { userId })
      .andWhere('p.updated_at >= :startDate', { startDate })
      .andWhere('p.updated_at < :endDate', { endDate })
      .getRawOne();

    // Calculate engagement score (0-100)
    const engagementScore = this.calculateEngagementScore({
      sessionsCount,
      totalTimeSeconds,
      exercisesAttempted: parseInt(submissionStats?.total || '0', 10),
      exercisesCompleted: parseInt(submissionStats?.correct || '0', 10),
      modulesCompleted: parseInt(moduleStats?.completed || '0', 10),
    });

    // Upsert the metrics record
    const existingMetric = await this.metricsRepo.findOne({
      where: {
        user_id: userId,
        metric_date: startDate,
      },
    });

    const metricsData = {
      user_id: userId,
      metric_date: startDate,
      daily_active: true,
      sessions_count: sessionsCount,
      total_time_seconds: totalTimeSeconds,
      exercises_attempted: parseInt(submissionStats?.total || '0', 10),
      exercises_completed: parseInt(submissionStats?.correct || '0', 10),
      modules_started: 0, // TODO: Track this if needed
      modules_completed: parseInt(moduleStats?.completed || '0', 10),
      achievements_unlocked: 0, // TODO: Integrate with gamification
      social_interactions: 0, // TODO: Integrate with social module
      engagement_score: engagementScore,
    };

    if (existingMetric) {
      await this.metricsRepo.update({ id: existingMetric.id }, metricsData);
      return { ...existingMetric, ...metricsData };
    } else {
      const newMetric = this.metricsRepo.create(metricsData);
      return this.metricsRepo.save(newMetric);
    }
  }

  /**
   * Calculate engagement score based on various activity metrics
   * Returns a score from 0 to 100
   */
  private calculateEngagementScore(metrics: {
    sessionsCount: number;
    totalTimeSeconds: number;
    exercisesAttempted: number;
    exercisesCompleted: number;
    modulesCompleted: number;
  }): number {
    const { sessionsCount, totalTimeSeconds, exercisesAttempted, exercisesCompleted, modulesCompleted } = metrics;

    // Scoring weights
    const scores = {
      sessions: Math.min(sessionsCount * 5, 15), // Max 15 points (3+ sessions)
      time: Math.min((totalTimeSeconds / 60 / 10) * 5, 25), // Max 25 points (50+ min)
      exercises: Math.min(exercisesAttempted * 3, 20), // Max 20 points (7+ exercises)
      accuracy: exercisesAttempted > 0
        ? (exercisesCompleted / exercisesAttempted) * 20
        : 0, // Max 20 points
      modules: Math.min(modulesCompleted * 10, 20), // Max 20 points (2+ modules)
    };

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    return Math.min(Math.round(totalScore * 100) / 100, 100);
  }

  /**
   * Parse PostgreSQL interval string to seconds
   */
  private parseIntervalToSeconds(interval: string): number {
    if (!interval) return 0;

    // Handle common interval formats: "00:30:00", "1 hour", etc.
    const hoursMatch = interval.match(/(\d+)\s*hour/i);
    const minutesMatch = interval.match(/(\d+)\s*min/i);
    const secondsMatch = interval.match(/(\d+)\s*sec/i);
    const timeMatch = interval.match(/(\d{1,2}):(\d{2}):(\d{2})/);

    if (timeMatch) {
      const [, hours, minutes, seconds] = timeMatch;
      return parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
    }

    let totalSeconds = 0;
    if (hoursMatch) totalSeconds += parseInt(hoursMatch[1], 10) * 3600;
    if (minutesMatch) totalSeconds += parseInt(minutesMatch[1], 10) * 60;
    if (secondsMatch) totalSeconds += parseInt(secondsMatch[1], 10);

    return totalSeconds;
  }

  /**
   * Get engagement metrics for a user over a date range
   */
  async getMetricsForUser(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<EngagementMetrics[]> {
    return this.metricsRepo.find({
      where: {
        user_id: userId,
        metric_date: Between(startDate, endDate),
      },
      order: { metric_date: 'DESC' },
    });
  }

  /**
   * Get average engagement score for a user over a period
   */
  async getAverageEngagementScore(userId: string, days: number = 30): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.metricsRepo
      .createQueryBuilder('m')
      .select('AVG(m.engagement_score)', 'avg_score')
      .where('m.user_id = :userId', { userId })
      .andWhere('m.metric_date >= :startDate', { startDate })
      .getRawOne();

    return parseFloat(result?.avg_score || '0');
  }

  /**
   * Get daily active user count for a date
   */
  async getDailyActiveUserCount(date: Date): Promise<number> {
    const result = await this.metricsRepo.count({
      where: {
        metric_date: date,
        daily_active: true,
      },
    });
    return result;
  }
}
