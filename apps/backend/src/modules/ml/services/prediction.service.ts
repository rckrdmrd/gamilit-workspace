/**
 * Prediction Service
 *
 * @description Central service orchestrating all ML predictions.
 * Coordinates feature extraction, model inference, caching, and logging.
 *
 * Prediction Types:
 * 1. Dropout Risk - Identifies students at risk of dropping out
 * 2. Performance - Predicts student score on upcoming exercises
 * 3. Difficulty - Recommends optimal difficulty level
 * 4. Engagement - Predicts student engagement patterns
 *
 * @module ml/services
 * @sprint 3.3 - ML Prediction API
 * @created 2026-02-03
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PredictionCacheService } from './prediction-cache.service';
import {
  DropoutRiskPredictionDto,
  PerformancePredictionDto,
  DifficultyRecommendationDto,
  EngagementPredictionDto,
  StudentInsightsDto,
  ClassroomInsightsDto,
  ContributingFactorDto,
  RecommendedInterventionDto,
  ConfidenceIntervalDto,
  AlternativeExerciseDto,
  ZoneOfProximalDevelopmentDto,
  NextBestActionDto,
  StudentRiskSummaryDto,
} from '../dto';
import {
  DropoutRiskLevel,
  EngagementLevel,
  DifficultyMatch,
} from '../interfaces/model.interface';

/**
 * Risk level thresholds
 */
const RISK_THRESHOLDS = {
  low: 0.25,
  medium: 0.50,
  high: 0.75,
  critical: 1.0,
};

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);
  private readonly MODEL_VERSION = '3.3.0-heuristic';

  constructor(
    @InjectDataSource('progress')
    private readonly progressDataSource: DataSource,
    @InjectDataSource('gamification')
    private readonly gamificationDataSource: DataSource,
    @InjectDataSource('auth')
    private readonly authDataSource: DataSource,
    private readonly cacheService: PredictionCacheService,
  ) {}

  // ============================================
  // INDIVIDUAL PREDICTIONS
  // ============================================

  /**
   * Predict dropout risk for a student
   *
   * @param studentId - Student ID (profile ID)
   * @returns Dropout risk prediction
   */
  async predictDropoutRisk(studentId: string): Promise<DropoutRiskPredictionDto> {
    // Check cache first
    const cached = await this.cacheService.get<DropoutRiskPredictionDto>(
      'dropout_risk',
      studentId,
    );
    if (cached) {
      return cached;
    }

    // Verify student exists
    await this.verifyStudentExists(studentId);

    // Fetch student features
    const features = await this.fetchDropoutFeatures(studentId);

    // Calculate risk using heuristics (placeholder for ML model)
    const probability = this.calculateDropoutProbability(features);
    const riskLevel = this.getRiskLevel(probability);
    const contributingFactors = this.getContributingFactors(features);
    const interventions = this.getRecommendedInterventions(riskLevel, features);

    const now = new Date();
    const prediction: DropoutRiskPredictionDto = {
      studentId,
      riskLevel,
      probability: Number(probability.toFixed(3)),
      confidence: this.calculateConfidence(features),
      contributingFactors,
      recommendedInterventions: interventions,
      predictedAt: now,
      validUntil: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours
    };

    // Cache the prediction
    await this.cacheService.set('dropout_risk', studentId, prediction);

    this.logger.log(
      `[DROPOUT] Student ${studentId}: ${riskLevel} risk (${(probability * 100).toFixed(1)}%)`,
    );

    return prediction;
  }

  /**
   * Predict performance for a student on a specific exercise
   *
   * @param studentId - Student ID
   * @param exerciseId - Exercise ID
   * @returns Performance prediction
   */
  async predictPerformance(
    studentId: string,
    exerciseId: string,
  ): Promise<PerformancePredictionDto> {
    const cacheKey = exerciseId;

    // Check cache
    const cached = await this.cacheService.get<PerformancePredictionDto>(
      'performance',
      studentId,
      cacheKey,
    );
    if (cached) {
      return cached;
    }

    await this.verifyStudentExists(studentId);

    // Fetch features
    const studentFeatures = await this.fetchPerformanceFeatures(studentId);
    const exerciseInfo = await this.fetchExerciseInfo(exerciseId);

    // Calculate predicted score
    const predictedScore = this.calculatePredictedScore(
      studentFeatures,
      exerciseInfo,
    );
    const margin = this.calculateConfidenceMargin(studentFeatures);
    const difficultyMatch = this.assessDifficultyMatch(
      studentFeatures.avgScore,
      exerciseInfo.difficulty,
    );

    const prediction: PerformancePredictionDto = {
      studentId,
      exerciseId,
      predictedScore: Math.round(predictedScore),
      confidenceInterval: {
        low: Math.max(0, Math.round(predictedScore - margin)),
        high: Math.min(100, Math.round(predictedScore + margin)),
      },
      difficultyMatch,
      successProbability: predictedScore >= 60 ? predictedScore / 100 : 0.5,
      estimatedTime: this.estimateCompletionTime(exerciseInfo, studentFeatures),
      tips: this.generatePerformanceTips(difficultyMatch, studentFeatures),
      predictedAt: new Date(),
    };

    await this.cacheService.set('performance', studentId, prediction, cacheKey);

    return prediction;
  }

  /**
   * Recommend optimal difficulty for a student in a module
   *
   * @param studentId - Student ID
   * @param moduleId - Module ID
   * @returns Difficulty recommendation
   */
  async recommendDifficulty(
    studentId: string,
    moduleId: string,
  ): Promise<DifficultyRecommendationDto> {
    const cacheKey = moduleId;

    const cached = await this.cacheService.get<DifficultyRecommendationDto>(
      'difficulty',
      studentId,
      cacheKey,
    );
    if (cached) {
      return cached;
    }

    await this.verifyStudentExists(studentId);

    const features = await this.fetchDifficultyFeatures(studentId, moduleId);

    // Calculate ZPD and recommended difficulty
    const currentLevel = features.currentDifficulty || 1;
    const zpd = this.calculateZPD(features);
    const recommended = this.calculateRecommendedDifficulty(features, zpd);
    const alternatives = await this.fetchAlternativeExercises(
      moduleId,
      recommended,
    );

    const recommendation: DifficultyRecommendationDto = {
      studentId,
      moduleId,
      recommendedDifficulty: recommended,
      currentLevel,
      reason: this.generateDifficultyReason(features, recommended, currentLevel),
      alternativeExercises: alternatives,
      zoneOfProximalDevelopment: zpd,
      predictedAt: new Date(),
    };

    await this.cacheService.set('difficulty', studentId, recommendation, cacheKey);

    return recommendation;
  }

  /**
   * Predict engagement for a student
   *
   * @param studentId - Student ID
   * @returns Engagement prediction
   */
  async predictEngagement(studentId: string): Promise<EngagementPredictionDto> {
    const cached = await this.cacheService.get<EngagementPredictionDto>(
      'engagement',
      studentId,
    );
    if (cached) {
      return cached;
    }

    await this.verifyStudentExists(studentId);

    const features = await this.fetchEngagementFeatures(studentId);
    const engagementScore = this.calculateEngagementScore(features);
    const engagementLevel = this.getEngagementLevel(engagementScore);

    const prediction: EngagementPredictionDto = {
      studentId,
      engagementLevel,
      engagementScore: Math.round(engagementScore),
      predictedSessionsThisWeek: this.predictWeeklySessions(features),
      predictedTimeThisWeek: this.predictWeeklyTime(features),
      bestTimeOfDay: this.determineBestTime(features),
      suggestedActivities: this.suggestEngagementActivities(features),
      predictedAt: new Date(),
    };

    await this.cacheService.set('engagement', studentId, prediction);

    return prediction;
  }

  // ============================================
  // BATCH PREDICTIONS
  // ============================================

  /**
   * Batch predict dropout risk for multiple students
   *
   * @param studentIds - Array of student IDs
   * @returns Array of dropout risk predictions
   */
  async batchPredictDropoutRisk(
    studentIds: string[],
  ): Promise<DropoutRiskPredictionDto[]> {
    const predictions: DropoutRiskPredictionDto[] = [];

    for (const studentId of studentIds) {
      try {
        const prediction = await this.predictDropoutRisk(studentId);
        predictions.push(prediction);
      } catch (error) {
        this.logger.warn(
          `Failed to predict dropout risk for student ${studentId}: ${error}`,
        );
      }
    }

    return predictions;
  }

  // ============================================
  // COMPOSITE PREDICTIONS
  // ============================================

  /**
   * Get comprehensive insights for a student
   *
   * @param studentId - Student ID
   * @returns Student insights
   */
  async getStudentInsights(studentId: string): Promise<StudentInsightsDto> {
    const cached = await this.cacheService.get<StudentInsightsDto>(
      'student_insights',
      studentId,
    );
    if (cached) {
      return cached;
    }

    await this.verifyStudentExists(studentId);

    // Get all predictions
    const [dropoutRisk, engagement] = await Promise.all([
      this.predictDropoutRisk(studentId),
      this.predictEngagement(studentId),
    ]);

    // Calculate additional insights
    const features = await this.fetchInsightsFeatures(studentId);
    const performanceTrend = this.analyzePerformanceTrend(features);
    const strengths = this.identifyStrengths(features);
    const areasForImprovement = this.identifyWeaknesses(features);
    const recommendations = this.generatePersonalizedRecommendations(
      dropoutRisk,
      engagement,
      features,
    );
    const nextActions = this.determineNextBestActions(
      dropoutRisk,
      engagement,
      features,
    );

    const insights: StudentInsightsDto = {
      studentId,
      dropoutRisk,
      engagementPrediction: engagement,
      performanceTrend,
      strengths,
      areasForImprovement,
      personalizedRecommendations: recommendations,
      nextBestActions: nextActions,
      generatedAt: new Date(),
    };

    await this.cacheService.set('student_insights', studentId, insights);

    return insights;
  }

  /**
   * Get insights for an entire classroom
   *
   * @param classroomId - Classroom ID
   * @returns Classroom insights
   */
  async getClassroomInsights(classroomId: string): Promise<ClassroomInsightsDto> {
    const cached = await this.cacheService.get<ClassroomInsightsDto>(
      'classroom_insights',
      classroomId,
    );
    if (cached) {
      return cached;
    }

    // Get classroom info and students
    const classroomInfo = await this.fetchClassroomInfo(classroomId);
    const studentIds = await this.fetchClassroomStudentIds(classroomId);

    // Get dropout predictions for all students
    const predictions = await this.batchPredictDropoutRisk(studentIds);

    // Aggregate insights
    const studentsAtRisk = predictions
      .filter((p) => p.riskLevel === 'high' || p.riskLevel === 'critical')
      .map((p) => this.toStudentRiskSummary(p));

    const riskDistribution = this.calculateRiskDistribution(predictions);
    const avgRisk =
      predictions.reduce((sum, p) => sum + p.probability, 0) /
      predictions.length;
    const avgEngagement = await this.calculateAvgClassroomEngagement(studentIds);
    const classTrend = this.determineClassTrend(predictions);

    const insights: ClassroomInsightsDto = {
      classroomId,
      classroomName: classroomInfo.name,
      totalStudents: studentIds.length,
      studentsAtRisk,
      averageDropoutRisk: Number(avgRisk.toFixed(3)),
      averageEngagement: avgEngagement,
      classTrend,
      riskDistribution,
      generatedAt: new Date(),
    };

    await this.cacheService.set('classroom_insights', classroomId, insights);

    return insights;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private async verifyStudentExists(studentId: string): Promise<void> {
    const result = await this.authDataSource.query(
      `SELECT id FROM auth_management.profiles WHERE id = $1`,
      [studentId],
    );
    if (!result || result.length === 0) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchDropoutFeatures(studentId: string): Promise<any> {
    // Fetch relevant features from progress_tracking
    const result = await this.progressDataSource.query(
      `
      SELECT
        COALESCE(
          (SELECT current_streak FROM gamification_system.user_stats WHERE user_id = $1),
          0
        ) as current_streak,
        COALESCE(
          (SELECT COUNT(*) FROM progress_tracking.exercise_submissions
           WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'),
          0
        ) as submissions_30d,
        COALESCE(
          (SELECT AVG(score) FROM progress_tracking.exercise_submissions
           WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'),
          0
        ) as avg_score_30d,
        COALESCE(
          (SELECT EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) / 86400
           FROM progress_tracking.exercise_submissions WHERE user_id = $1),
          30
        ) as days_since_last_activity,
        COALESCE(
          (SELECT COUNT(DISTINCT DATE(created_at))
           FROM progress_tracking.learning_sessions
           WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'),
          0
        ) as active_days_30d
      `,
      [studentId],
    );

    return result[0] || {
      current_streak: 0,
      submissions_30d: 0,
      avg_score_30d: 0,
      days_since_last_activity: 30,
      active_days_30d: 0,
    };
  }

  private calculateDropoutProbability(features: any): number { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Heuristic calculation (placeholder for ML model)
    const inactivityWeight = Math.min(features.days_since_last_activity / 14, 1) * 0.35;
    const streakWeight = (1 - Math.min(features.current_streak / 7, 1)) * 0.25;
    const activityWeight = (1 - Math.min(features.active_days_30d / 15, 1)) * 0.25;
    const scoreWeight = (1 - (features.avg_score_30d || 50) / 100) * 0.15;

    const probability = inactivityWeight + streakWeight + activityWeight + scoreWeight;
    return Math.max(0, Math.min(1, probability));
  }

  private getRiskLevel(probability: number): 'low' | 'medium' | 'high' | 'critical' {
    if (probability >= RISK_THRESHOLDS.high) return 'critical';
    if (probability >= RISK_THRESHOLDS.medium) return 'high';
    if (probability >= RISK_THRESHOLDS.low) return 'medium';
    return 'low';
  }

  private calculateConfidence(features: any): number { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Higher confidence when we have more data
    const dataPoints = features.submissions_30d || 0;
    const baseConfidence = 0.6;
    const dataBonus = Math.min(dataPoints / 50, 0.3);
    return Number((baseConfidence + dataBonus).toFixed(2));
  }

  private getContributingFactors(features: any): ContributingFactorDto[] { // eslint-disable-line @typescript-eslint/no-explicit-any
    const factors: ContributingFactorDto[] = [];

    if (features.days_since_last_activity > 7) {
      factors.push({
        factor: 'days_since_last_activity',
        impact: 'negative',
        value: features.days_since_last_activity,
      });
    }

    if (features.current_streak === 0) {
      factors.push({
        factor: 'no_active_streak',
        impact: 'negative',
        value: 0,
      });
    } else if (features.current_streak >= 5) {
      factors.push({
        factor: 'active_streak',
        impact: 'positive',
        value: features.current_streak,
      });
    }

    if (features.avg_score_30d < 60) {
      factors.push({
        factor: 'low_average_score',
        impact: 'negative',
        value: features.avg_score_30d || 0,
      });
    }

    return factors;
  }

  private getRecommendedInterventions(
    riskLevel: string,
    features: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): RecommendedInterventionDto[] {
    const interventions: RecommendedInterventionDto[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      interventions.push({
        type: 'teacher_outreach',
        priority: 'high',
        description: 'Schedule one-on-one meeting with student to discuss progress',
      });
    }

    if (features.days_since_last_activity > 5) {
      interventions.push({
        type: 'engagement_notification',
        priority: riskLevel === 'critical' ? 'high' : 'medium',
        description: 'Send personalized reminder about platform activities',
      });
    }

    if (features.avg_score_30d < 60) {
      interventions.push({
        type: 'difficulty_adjustment',
        priority: 'medium',
        description: 'Consider reducing exercise difficulty to build confidence',
      });
    }

    return interventions;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchPerformanceFeatures(studentId: string): Promise<any> {
    const result = await this.progressDataSource.query(
      `
      SELECT
        COALESCE(AVG(score), 50) as avg_score,
        COALESCE(STDDEV(score), 15) as score_stddev,
        COUNT(*) as total_submissions,
        COALESCE(AVG(time_spent), 300) as avg_time_spent
      FROM progress_tracking.exercise_submissions
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
      `,
      [studentId],
    );

    return result[0] || { avgScore: 50, score_stddev: 15, total_submissions: 0 };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchExerciseInfo(exerciseId: string): Promise<any> {
    const result = await this.progressDataSource.query(
      `
      SELECT
        e.id,
        e.title,
        e.difficulty_level as difficulty,
        e.estimated_time_minutes as estimated_time
      FROM educational_content.exercises e
      WHERE e.id = $1
      `,
      [exerciseId],
    );

    if (!result || result.length === 0) {
      return { id: exerciseId, difficulty: 3, estimated_time: 15 };
    }

    return result[0];
  }

  private calculatePredictedScore(studentFeatures: any, exerciseInfo: any): number { // eslint-disable-line @typescript-eslint/no-explicit-any
    const baseScore = studentFeatures.avg_score || 50;
    const difficultyAdjustment = (3 - (exerciseInfo.difficulty || 3)) * 5;
    return Math.max(0, Math.min(100, baseScore + difficultyAdjustment));
  }

  private calculateConfidenceMargin(features: any): number { // eslint-disable-line @typescript-eslint/no-explicit-any
    const stddev = features.score_stddev || 15;
    return Math.min(stddev * 1.5, 25);
  }

  private assessDifficultyMatch(
    avgScore: number,
    difficulty: number,
  ): 'too_easy' | 'appropriate' | 'too_hard' {
    const skillLevel = avgScore / 20; // Convert to 1-5 scale
    const diff = skillLevel - difficulty;

    if (diff > 1) return 'too_easy';
    if (diff < -1) return 'too_hard';
    return 'appropriate';
  }

  private estimateCompletionTime(exerciseInfo: any, studentFeatures: any): number { // eslint-disable-line @typescript-eslint/no-explicit-any
    const baseTime = exerciseInfo.estimated_time || 15;
    const avgTimeRatio = studentFeatures.avg_time_spent
      ? studentFeatures.avg_time_spent / 300
      : 1;
    return Math.round(baseTime * avgTimeRatio);
  }

  private generatePerformanceTips(
    difficultyMatch: string,
    features: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): string[] {
    const tips: string[] = [];

    if (difficultyMatch === 'too_hard') {
      tips.push('Consider reviewing related concepts before attempting');
      tips.push('Take your time and read questions carefully');
    } else if (difficultyMatch === 'too_easy') {
      tips.push('Challenge yourself by attempting without hints');
    }

    if (features.score_stddev > 20) {
      tips.push('Focus on consistency in your approach');
    }

    return tips.length > 0 ? tips : ['Stay focused and do your best!'];
  }

  private async fetchDifficultyFeatures(
    studentId: string,
    moduleId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const result = await this.progressDataSource.query(
      `
      SELECT
        COALESCE(AVG(es.score), 50) as avg_module_score,
        COUNT(*) as exercises_completed,
        COALESCE(MAX(e.difficulty_level), 1) as current_difficulty,
        COUNT(CASE WHEN es.score >= 80 THEN 1 END) as high_scores,
        COUNT(CASE WHEN es.score < 60 THEN 1 END) as low_scores
      FROM progress_tracking.exercise_submissions es
      JOIN educational_content.exercises e ON es.exercise_id = e.id
      WHERE es.user_id = $1 AND e.module_id = $2
      `,
      [studentId, moduleId],
    );

    return result[0] || {
      avg_module_score: 50,
      exercises_completed: 0,
      current_difficulty: 1,
    };
  }

  private calculateZPD(features: any): ZoneOfProximalDevelopmentDto { // eslint-disable-line @typescript-eslint/no-explicit-any
    const performance = features.avg_module_score || 50;
    const optimal = Math.ceil(performance / 20);
    return {
      lower: Math.max(1, optimal - 1),
      optimal: Math.max(1, Math.min(5, optimal)),
      upper: Math.min(5, optimal + 1),
    };
  }

  private calculateRecommendedDifficulty(features: any, zpd: any): number { // eslint-disable-line @typescript-eslint/no-explicit-any
    const currentPerformance = features.avg_module_score || 50;

    if (currentPerformance >= 80) {
      return Math.min(5, zpd.optimal + 1);
    } else if (currentPerformance < 50) {
      return Math.max(1, zpd.optimal - 1);
    }
    return zpd.optimal;
  }

  private generateDifficultyReason(
    features: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    recommended: number,
    current: number,
  ): string {
    if (recommended > current) {
      return `Student has mastered current level with ${features.avg_module_score?.toFixed(0) || 50}% average score`;
    } else if (recommended < current) {
      return 'Student may benefit from additional practice at a lower difficulty';
    }
    return 'Current difficulty level is appropriate for the student';
  }

  private async fetchAlternativeExercises(
    moduleId: string,
    difficulty: number,
  ): Promise<AlternativeExerciseDto[]> {
    const result = await this.progressDataSource.query(
      `
      SELECT id, title, difficulty_level
      FROM educational_content.exercises
      WHERE module_id = $1 AND difficulty_level = $2 AND is_active = true
      LIMIT 5
      `,
      [moduleId, difficulty],
    );

    return (result || []).map((e: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      exerciseId: e.id,
      exerciseName: e.title,
      difficulty: e.difficulty_level,
      matchScore: 0.9,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchEngagementFeatures(studentId: string): Promise<any> {
    const result = await this.progressDataSource.query(
      `
      SELECT
        COUNT(DISTINCT DATE(created_at)) as active_days_7d,
        COALESCE(SUM(duration_minutes), 0) as total_time_7d,
        COUNT(*) as sessions_7d
      FROM progress_tracking.learning_sessions
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'
      `,
      [studentId],
    );

    return result[0] || { active_days_7d: 0, total_time_7d: 0, sessions_7d: 0 };
  }

  private calculateEngagementScore(features: any): number { // eslint-disable-line @typescript-eslint/no-explicit-any
    const daysScore = Math.min(features.active_days_7d / 5, 1) * 40;
    const timeScore = Math.min(features.total_time_7d / 180, 1) * 30;
    const sessionsScore = Math.min(features.sessions_7d / 7, 1) * 30;
    return daysScore + timeScore + sessionsScore;
  }

  private getEngagementLevel(
    score: number,
  ): 'very_low' | 'low' | 'moderate' | 'high' | 'very_high' {
    if (score >= 80) return 'very_high';
    if (score >= 60) return 'high';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'low';
    return 'very_low';
  }

  private predictWeeklySessions(features: any): number { // eslint-disable-line @typescript-eslint/no-explicit-any
    return Math.round(features.sessions_7d * 0.9);
  }

  private predictWeeklyTime(features: any): number { // eslint-disable-line @typescript-eslint/no-explicit-any
    return Math.round(features.total_time_7d * 0.85);
  }

  private determineBestTime(features: any): string { // eslint-disable-line @typescript-eslint/no-explicit-any
    return 'afternoon'; // Simplified - would analyze session times
  }

  private suggestEngagementActivities(features: any): string[] { // eslint-disable-line @typescript-eslint/no-explicit-any
    const activities: string[] = [];

    if (features.sessions_7d < 3) {
      activities.push('Try setting daily practice reminders');
    }
    activities.push('Complete a daily mission to earn bonus rewards');
    activities.push('Challenge a friend to a peer competition');

    return activities;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchInsightsFeatures(studentId: string): Promise<any> {
    const result = await this.progressDataSource.query(
      `
      SELECT
        COALESCE(AVG(score), 50) as avg_score,
        COALESCE(
          (SELECT AVG(score) FROM progress_tracking.exercise_submissions
           WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'),
          50
        ) as recent_avg_score,
        COUNT(*) as total_exercises
      FROM progress_tracking.exercise_submissions
      WHERE user_id = $1
      `,
      [studentId],
    );

    return result[0] || { avg_score: 50, recent_avg_score: 50, total_exercises: 0 };
  }

  private analyzePerformanceTrend(
    features: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): 'improving' | 'stable' | 'declining' {
    const diff = (features.recent_avg_score || 50) - (features.avg_score || 50);
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  private identifyStrengths(features: any): string[] { // eslint-disable-line @typescript-eslint/no-explicit-any
    const strengths: string[] = [];
    if (features.avg_score >= 70) strengths.push('Strong academic performance');
    if (features.total_exercises > 50) strengths.push('Consistent practice');
    return strengths.length > 0 ? strengths : ['Keep building your skills!'];
  }

  private identifyWeaknesses(features: any): string[] { // eslint-disable-line @typescript-eslint/no-explicit-any
    const weaknesses: string[] = [];
    if (features.avg_score < 60) weaknesses.push('Score improvement needed');
    return weaknesses;
  }

  private generatePersonalizedRecommendations(
    dropout: DropoutRiskPredictionDto,
    engagement: EngagementPredictionDto,
    features: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): string[] {
    const recommendations: string[] = [];

    if (dropout.riskLevel !== 'low') {
      recommendations.push('Try to log in daily to maintain your streak');
    }

    if (engagement.engagementLevel === 'low' || engagement.engagementLevel === 'very_low') {
      recommendations.push('Start with shorter practice sessions');
    }

    recommendations.push('Focus on completing one module at a time');

    return recommendations;
  }

  private determineNextBestActions(
    dropout: DropoutRiskPredictionDto,
    engagement: EngagementPredictionDto,
    features: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): NextBestActionDto[] {
    const actions: NextBestActionDto[] = [];

    actions.push({
      action: 'Complete next exercise in current module',
      reason: 'Maintains momentum and builds skills progressively',
      expectedImpact: 'Improves module completion by 5%',
    });

    if (dropout.riskLevel !== 'low') {
      actions.push({
        action: 'Join a classroom challenge',
        reason: 'Social engagement reduces dropout risk',
        expectedImpact: 'Can reduce dropout risk by 15%',
      });
    }

    return actions;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchClassroomInfo(classroomId: string): Promise<any> {
    const result = await this.progressDataSource.query(
      `SELECT id, name FROM social_features.classrooms WHERE id = $1`,
      [classroomId],
    );
    if (!result || result.length === 0) {
      throw new NotFoundException(`Classroom ${classroomId} not found`);
    }
    return result[0];
  }

  private async fetchClassroomStudentIds(classroomId: string): Promise<string[]> {
    const result = await this.progressDataSource.query(
      `
      SELECT user_id FROM social_features.classroom_members
      WHERE classroom_id = $1 AND is_active = true
      `,
      [classroomId],
    );
    return (result || []).map((r: any) => r.user_id); // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  private toStudentRiskSummary(
    prediction: DropoutRiskPredictionDto,
  ): StudentRiskSummaryDto {
    return {
      studentId: prediction.studentId,
      studentName: 'Student', // Would fetch from profile
      riskLevel: prediction.riskLevel,
      probability: prediction.probability,
      primaryFactor:
        prediction.contributingFactors[0]?.factor || 'Multiple factors',
    };
  }

  private calculateRiskDistribution(
    predictions: DropoutRiskPredictionDto[],
  ): Record<string, number> {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const p of predictions) {
      distribution[p.riskLevel]++;
    }
    return distribution;
  }

  private async calculateAvgClassroomEngagement(
    studentIds: string[],
  ): Promise<number> {
    if (studentIds.length === 0) return 50;

    let total = 0;
    for (const studentId of studentIds) {
      try {
        const engagement = await this.predictEngagement(studentId);
        total += engagement.engagementScore;
      } catch {
        total += 50;
      }
    }
    return Math.round(total / studentIds.length);
  }

  private determineClassTrend(
    predictions: DropoutRiskPredictionDto[],
  ): 'improving' | 'stable' | 'declining' {
    const avgRisk =
      predictions.reduce((sum, p) => sum + p.probability, 0) /
      predictions.length;
    if (avgRisk < 0.25) return 'improving';
    if (avgRisk > 0.5) return 'declining';
    return 'stable';
  }
}
