/**
 * Prediction Response DTOs
 *
 * DTOs for ML prediction responses.
 * Includes all prediction types and composite insights.
 *
 * @module ml/dto
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Contributing factor in dropout risk prediction
 */
export class ContributingFactorDto {
  @ApiProperty({
    description: 'Factor name',
    example: 'days_since_last_activity',
  })
  factor!: string;

  @ApiProperty({
    description: 'Impact direction',
    enum: ['positive', 'negative'],
    example: 'negative',
  })
  impact!: 'positive' | 'negative';

  @ApiProperty({
    description: 'Factor value/weight',
    example: 0.35,
  })
  value!: number;
}

/**
 * Recommended intervention for at-risk students
 */
export class RecommendedInterventionDto {
  @ApiProperty({
    description: 'Intervention type',
    example: 'teacher_outreach',
  })
  type!: string;

  @ApiProperty({
    description: 'Priority level',
    enum: ['high', 'medium', 'low'],
    example: 'high',
  })
  priority!: 'high' | 'medium' | 'low';

  @ApiProperty({
    description: 'Intervention description',
    example: 'Schedule one-on-one meeting with student to discuss progress',
  })
  description!: string;
}

/**
 * Dropout risk prediction response
 */
export class DropoutRiskPredictionDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  studentId!: string;

  @ApiProperty({
    description: 'Risk level category',
    enum: ['low', 'medium', 'high', 'critical'],
    example: 'medium',
  })
  riskLevel!: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({
    description: 'Dropout probability (0-1)',
    example: 0.42,
  })
  probability!: number;

  @ApiProperty({
    description: 'Prediction confidence (0-1)',
    example: 0.85,
  })
  confidence!: number;

  @ApiProperty({
    description: 'Factors contributing to the prediction',
    type: [ContributingFactorDto],
  })
  contributingFactors!: ContributingFactorDto[];

  @ApiProperty({
    description: 'Recommended interventions',
    type: [RecommendedInterventionDto],
  })
  recommendedInterventions!: RecommendedInterventionDto[];

  @ApiProperty({
    description: 'When the prediction was made',
    example: '2026-02-03T10:30:00Z',
  })
  predictedAt!: Date;

  @ApiProperty({
    description: 'When the prediction expires',
    example: '2026-02-03T16:30:00Z',
  })
  validUntil!: Date;
}

/**
 * Confidence interval for performance prediction
 */
export class ConfidenceIntervalDto {
  @ApiProperty({
    description: 'Lower bound of confidence interval',
    example: 65,
  })
  low!: number;

  @ApiProperty({
    description: 'Upper bound of confidence interval',
    example: 85,
  })
  high!: number;
}

/**
 * Performance prediction response
 */
export class PerformancePredictionDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  studentId!: string;

  @ApiProperty({
    description: 'Exercise ID',
    example: '660e8400-e29b-41d4-a716-446655440002',
  })
  exerciseId!: string;

  @ApiProperty({
    description: 'Predicted score (0-100)',
    example: 75,
  })
  predictedScore!: number;

  @ApiProperty({
    description: 'Confidence interval for the prediction',
    type: ConfidenceIntervalDto,
  })
  confidenceInterval!: ConfidenceIntervalDto;

  @ApiProperty({
    description: 'Exercise difficulty match for student',
    enum: ['too_easy', 'appropriate', 'too_hard'],
    example: 'appropriate',
  })
  difficultyMatch!: 'too_easy' | 'appropriate' | 'too_hard';

  @ApiProperty({
    description: 'Probability of successful completion (0-1)',
    example: 0.78,
  })
  successProbability!: number;

  @ApiProperty({
    description: 'Estimated time to complete (minutes)',
    example: 15,
  })
  estimatedTime!: number;

  @ApiProperty({
    description: 'Personalized tips for the student',
    type: [String],
    example: ['Review fractions before attempting', 'Take your time with word problems'],
  })
  tips!: string[];

  @ApiProperty({
    description: 'When the prediction was made',
    example: '2026-02-03T10:30:00Z',
  })
  predictedAt!: Date;
}

/**
 * Alternative exercise recommendation
 */
export class AlternativeExerciseDto {
  @ApiProperty({
    description: 'Exercise ID',
    example: '660e8400-e29b-41d4-a716-446655440003',
  })
  exerciseId!: string;

  @ApiProperty({
    description: 'Exercise name',
    example: 'Fractions - Level 2',
  })
  exerciseName!: string;

  @ApiProperty({
    description: 'Exercise difficulty (1-5)',
    example: 3,
  })
  difficulty!: number;

  @ApiProperty({
    description: 'Match score for this student (0-1)',
    example: 0.92,
  })
  matchScore!: number;
}

/**
 * Zone of Proximal Development (ZPD)
 */
export class ZoneOfProximalDevelopmentDto {
  @ApiProperty({
    description: 'Lower bound of ZPD (too easy below this)',
    example: 2,
  })
  lower!: number;

  @ApiProperty({
    description: 'Optimal difficulty level',
    example: 3,
  })
  optimal!: number;

  @ApiProperty({
    description: 'Upper bound of ZPD (too hard above this)',
    example: 4,
  })
  upper!: number;
}

/**
 * Difficulty recommendation response
 */
export class DifficultyRecommendationDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  studentId!: string;

  @ApiProperty({
    description: 'Module ID',
    example: '770e8400-e29b-41d4-a716-446655440003',
  })
  moduleId!: string;

  @ApiProperty({
    description: 'Recommended difficulty level (1-5)',
    example: 3,
  })
  recommendedDifficulty!: number;

  @ApiProperty({
    description: 'Student current level',
    example: 2,
  })
  currentLevel!: number;

  @ApiProperty({
    description: 'Reason for recommendation',
    example: 'Student has mastered current level with 85% average score',
  })
  reason!: string;

  @ApiProperty({
    description: 'Alternative exercises at recommended difficulty',
    type: [AlternativeExerciseDto],
  })
  alternativeExercises!: AlternativeExerciseDto[];

  @ApiProperty({
    description: 'Zone of Proximal Development for this student',
    type: ZoneOfProximalDevelopmentDto,
  })
  zoneOfProximalDevelopment!: ZoneOfProximalDevelopmentDto;

  @ApiProperty({
    description: 'When the prediction was made',
    example: '2026-02-03T10:30:00Z',
  })
  predictedAt!: Date;
}

/**
 * Engagement prediction response
 */
export class EngagementPredictionDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  studentId!: string;

  @ApiProperty({
    description: 'Predicted engagement level',
    enum: ['very_low', 'low', 'moderate', 'high', 'very_high'],
    example: 'moderate',
  })
  engagementLevel!: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';

  @ApiProperty({
    description: 'Engagement score (0-100)',
    example: 65,
  })
  engagementScore!: number;

  @ApiProperty({
    description: 'Predicted sessions this week',
    example: 3,
  })
  predictedSessionsThisWeek!: number;

  @ApiProperty({
    description: 'Predicted time on platform this week (minutes)',
    example: 120,
  })
  predictedTimeThisWeek!: number;

  @ApiProperty({
    description: 'Best time of day for engagement',
    example: 'afternoon',
  })
  bestTimeOfDay!: string;

  @ApiProperty({
    description: 'Suggested activities to boost engagement',
    type: [String],
    example: ['Try gamified exercises', 'Join a classroom challenge'],
  })
  suggestedActivities!: string[];

  @ApiProperty({
    description: 'When the prediction was made',
    example: '2026-02-03T10:30:00Z',
  })
  predictedAt!: Date;
}

/**
 * Next best action for a student
 */
export class NextBestActionDto {
  @ApiProperty({
    description: 'Recommended action',
    example: 'Complete Module 3 Exercise 5',
  })
  action!: string;

  @ApiProperty({
    description: 'Reason for this recommendation',
    example: 'This exercise matches your current skill level',
  })
  reason!: string;

  @ApiProperty({
    description: 'Expected impact of taking this action',
    example: 'Will improve your module completion by 10%',
  })
  expectedImpact!: string;
}

/**
 * Comprehensive student insights response
 */
export class StudentInsightsDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  studentId!: string;

  @ApiProperty({
    description: 'Dropout risk prediction',
    type: DropoutRiskPredictionDto,
  })
  dropoutRisk!: DropoutRiskPredictionDto;

  @ApiProperty({
    description: 'Engagement prediction',
    type: EngagementPredictionDto,
  })
  engagementPrediction!: EngagementPredictionDto;

  @ApiProperty({
    description: 'Performance trend',
    enum: ['improving', 'stable', 'declining'],
    example: 'improving',
  })
  performanceTrend!: 'improving' | 'stable' | 'declining';

  @ApiProperty({
    description: 'Student strengths',
    type: [String],
    example: ['Problem solving', 'Consistent practice'],
  })
  strengths!: string[];

  @ApiProperty({
    description: 'Areas for improvement',
    type: [String],
    example: ['Time management', 'Reading comprehension'],
  })
  areasForImprovement!: string[];

  @ApiProperty({
    description: 'Personalized recommendations',
    type: [String],
    example: ['Focus on Module 3', 'Try shorter practice sessions'],
  })
  personalizedRecommendations!: string[];

  @ApiProperty({
    description: 'Next best actions for the student',
    type: [NextBestActionDto],
  })
  nextBestActions!: NextBestActionDto[];

  @ApiProperty({
    description: 'When insights were generated',
    example: '2026-02-03T10:30:00Z',
  })
  generatedAt!: Date;
}

/**
 * Student summary for classroom insights
 */
export class StudentRiskSummaryDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  studentId!: string;

  @ApiProperty({
    description: 'Student name',
    example: 'Juan Perez',
  })
  studentName!: string;

  @ApiProperty({
    description: 'Risk level',
    enum: ['low', 'medium', 'high', 'critical'],
    example: 'medium',
  })
  riskLevel!: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({
    description: 'Dropout probability',
    example: 0.35,
  })
  probability!: number;

  @ApiProperty({
    description: 'Primary risk factor',
    example: 'Low engagement',
  })
  primaryFactor!: string;
}

/**
 * Classroom insights response
 */
export class ClassroomInsightsDto {
  @ApiProperty({
    description: 'Classroom ID',
    example: '880e8400-e29b-41d4-a716-446655440004',
  })
  classroomId!: string;

  @ApiProperty({
    description: 'Classroom name',
    example: 'Math 101 - Section A',
  })
  classroomName!: string;

  @ApiProperty({
    description: 'Total students in classroom',
    example: 25,
  })
  totalStudents!: number;

  @ApiProperty({
    description: 'Students at high/critical risk',
    type: [StudentRiskSummaryDto],
  })
  studentsAtRisk!: StudentRiskSummaryDto[];

  @ApiProperty({
    description: 'Average class dropout risk',
    example: 0.22,
  })
  averageDropoutRisk!: number;

  @ApiProperty({
    description: 'Average class engagement score',
    example: 68,
  })
  averageEngagement!: number;

  @ApiProperty({
    description: 'Class performance trend',
    enum: ['improving', 'stable', 'declining'],
    example: 'stable',
  })
  classTrend!: 'improving' | 'stable' | 'declining';

  @ApiProperty({
    description: 'Risk distribution in the classroom',
    example: { low: 15, medium: 7, high: 2, critical: 1 },
  })
  riskDistribution!: Record<string, number>;

  @ApiProperty({
    description: 'When insights were generated',
    example: '2026-02-03T10:30:00Z',
  })
  generatedAt!: Date;
}

/**
 * Model metrics for admin dashboard
 */
export class ModelMetricsDto {
  @ApiProperty({
    description: 'Model type',
    example: 'dropout_risk',
  })
  modelType!: string;

  @ApiProperty({
    description: 'Model version',
    example: '1.2.3',
  })
  modelVersion!: string;

  @ApiProperty({
    description: 'Model accuracy (0-1)',
    example: 0.87,
  })
  accuracy!: number;

  @ApiProperty({
    description: 'Model precision (0-1)',
    example: 0.85,
  })
  precision!: number;

  @ApiProperty({
    description: 'Model recall (0-1)',
    example: 0.82,
  })
  recall!: number;

  @ApiProperty({
    description: 'Model F1 score (0-1)',
    example: 0.835,
  })
  f1Score!: number;

  @ApiProperty({
    description: 'Total predictions made',
    example: 15420,
  })
  totalPredictions!: number;

  @ApiProperty({
    description: 'Average prediction latency (ms)',
    example: 45,
  })
  avgLatencyMs!: number;

  @ApiProperty({
    description: 'Cache hit rate (0-1)',
    example: 0.72,
  })
  cacheHitRate!: number;

  @ApiProperty({
    description: 'Last trained date',
    example: '2026-01-15T00:00:00Z',
  })
  lastTrainedAt!: Date;

  @ApiProperty({
    description: 'Training data size',
    example: 50000,
  })
  trainingDataSize!: number;
}

/**
 * Dashboard metrics response
 */
export class DashboardMetricsDto {
  @ApiProperty({
    description: 'Total students analyzed',
    example: 1250,
  })
  totalStudentsAnalyzed!: number;

  @ApiProperty({
    description: 'Students currently at risk (medium+)',
    example: 145,
  })
  studentsAtRisk!: number;

  @ApiProperty({
    description: 'Students at critical risk',
    example: 23,
  })
  studentsCritical!: number;

  @ApiProperty({
    description: 'Predictions made today',
    example: 3420,
  })
  predictionsToday!: number;

  @ApiProperty({
    description: 'Model metrics by type',
    type: [ModelMetricsDto],
  })
  modelMetrics!: ModelMetricsDto[];

  @ApiProperty({
    description: 'When metrics were collected',
    example: '2026-02-03T10:30:00Z',
  })
  collectedAt!: Date;
}
