/**
 * DTOs for Analytics Queries
 */

import { IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { ReportFormat } from '@shared/dto/reports/generate-report.dto';

export { ReportFormat } from '@shared/dto/reports/generate-report.dto';

export enum TimeRange {
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  NINETY_DAYS = '90d',
  ALL = 'all',
}

export class GetAnalyticsQueryDto {
  @ApiPropertyOptional({ enum: TimeRange, description: 'Time range filter' })
  @IsEnum(TimeRange)
  @IsOptional()
  time_range?: TimeRange = TimeRange.THIRTY_DAYS;

  @ApiPropertyOptional({ description: 'Filter by module ID' })
  @IsUUID()
  @IsOptional()
  module_id?: string;
}

export class GetStudentProgressQueryDto {
  @ApiPropertyOptional({ enum: TimeRange, description: 'Time range for exercise history' })
  @IsEnum(TimeRange)
  @IsOptional()
  time_range?: TimeRange = TimeRange.THIRTY_DAYS;

  @ApiPropertyOptional({ description: 'Filter exercise history by module' })
  @IsUUID()
  @IsOptional()
  module_id?: string;

  @ApiPropertyOptional({ enum: ['all', 'correct', 'incorrect'] })
  @IsEnum(['all', 'correct', 'incorrect'])
  @IsOptional()
  status?: 'all' | 'correct' | 'incorrect' = 'all';
}

export class GetEngagementMetricsDto {
  @ApiPropertyOptional({ enum: TimeRange, description: 'Time range filter', default: TimeRange.THIRTY_DAYS })
  @IsEnum(TimeRange)
  @IsOptional()
  time_range?: TimeRange = TimeRange.THIRTY_DAYS;

  @ApiPropertyOptional({ description: 'Filter by classroom ID' })
  @IsUUID()
  @IsOptional()
  classroom_id?: string;
}

export class GenerateReportsDto {
  @ApiPropertyOptional({ enum: TimeRange, description: 'Time range for report', default: TimeRange.THIRTY_DAYS })
  @IsEnum(TimeRange)
  @IsOptional()
  time_range?: TimeRange = TimeRange.THIRTY_DAYS;

  @ApiPropertyOptional({ enum: ReportFormat, description: 'Report format', default: ReportFormat.CSV })
  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat = ReportFormat.CSV;

  @ApiPropertyOptional({ description: 'Filter by classroom ID' })
  @IsUUID()
  @IsOptional()
  classroom_id?: string;

  @ApiPropertyOptional({ description: 'Report type', enum: ['classroom', 'student', 'assignment', 'overall'] })
  @IsOptional()
  @IsString()
  report_type?: string = 'overall';
}

/**
 * Student Insights Response DTO
 * Provides comprehensive analytics and AI-generated insights for individual students
 */
export class StudentInsightsResponseDto {
  @ApiProperty({ description: 'Overall performance score (0-100)' })
  overall_score!: number;

  @ApiProperty({ description: 'Number of modules completed' })
  modules_completed!: number;

  @ApiProperty({ description: 'Total number of modules' })
  modules_total!: number;

  @ApiProperty({ description: 'Comparison to class metrics' })
  comparison_to_class!: {
    score_percentile: number;
  };

  @ApiProperty({ description: 'Risk level', enum: ['low', 'medium', 'high'] })
  risk_level!: 'low' | 'medium' | 'high';

  @ApiProperty({ description: 'Student strengths', type: [String] })
  strengths!: string[];

  @ApiProperty({ description: 'Areas for improvement', type: [String] })
  weaknesses!: string[];

  @ApiProperty({ description: 'Performance predictions' })
  predictions!: {
    completion_probability: number;
    dropout_risk: number;
  };

  @ApiProperty({ description: 'Personalized recommendations', type: [String] })
  recommendations!: string[];
}

// ============================================================================
// ECONOMY ANALYTICS DTO (GAP-ST-005)
// ============================================================================

/**
 * Distribution Range DTO
 */
export class EconomyDistributionDto {
  @ApiProperty({ description: 'Range label', example: '0-100' })
  range!: string;

  @ApiProperty({ description: 'Number of students in range', example: 5 })
  count!: number;

  @ApiProperty({ description: 'Percentage of total', example: 25.5 })
  percentage!: number;
}

/**
 * Top Earner DTO
 */
export class TopEarnerDto {
  @ApiProperty({ description: 'Student ID' })
  student_id!: string;

  @ApiProperty({ description: 'Student name' })
  student_name!: string;

  @ApiProperty({ description: 'ML Coins earned this week', example: 250 })
  earned_this_week!: number;
}

/**
 * Economy Trend DTO
 */
export class EconomyTrendDto {
  @ApiProperty({ description: 'Date in ISO format', example: '2024-11-24' })
  date!: string;

  @ApiProperty({ description: 'Total ML Coins earned that day', example: 850 })
  total_earned!: number;

  @ApiProperty({ description: 'Total ML Coins spent that day', example: 620 })
  total_spent!: number;
}

/**
 * Economy Analytics Response DTO
 *
 * @description Provides comprehensive ML Coins economy analytics for teacher's classrooms
 * Resolves GAP-ST-005: Endpoint /teacher/analytics/economy
 */
export class EconomyAnalyticsDto {
  @ApiProperty({
    description: 'Total ML Coins in circulation across all students',
    example: 12450,
  })
  total_circulation!: number;

  @ApiProperty({
    description: 'Average ML Coins balance per student',
    example: 498.5,
  })
  average_balance!: number;

  @ApiProperty({
    description: 'Total ML Coins earned today by all students',
    example: 850,
  })
  total_earned_today!: number;

  @ApiProperty({
    description: 'Total ML Coins spent today by all students',
    example: 620,
  })
  total_spent_today!: number;

  @ApiProperty({
    description: 'Distribution of students by ML Coins balance range',
    type: [EconomyDistributionDto],
  })
  distribution!: EconomyDistributionDto[];

  @ApiProperty({
    description: 'Top 5 earners this week',
    type: [TopEarnerDto],
  })
  top_earners!: TopEarnerDto[];

  @ApiProperty({
    description: 'Economy trends for the last 7 days',
    type: [EconomyTrendDto],
  })
  trends!: EconomyTrendDto[];

  @ApiProperty({
    description: 'Wealth distribution metrics',
    example: { top_10_percent: 45, bottom_50_percent: 15 },
  })
  wealth_distribution!: {
    top_10_percent: number;
    bottom_50_percent: number;
  };
}

// ============================================================================
// STUDENT ECONOMY DTO (GAP-ST-006)
// ============================================================================

/**
 * Student Economy Data DTO
 *
 * @description Individual student economy data for teacher's gamification view
 */
export class StudentEconomyDto {
  @ApiProperty({ description: 'Student user ID' })
  id!: string;

  @ApiProperty({ description: 'Student full name', example: 'Ana García' })
  name!: string;

  @ApiProperty({ description: 'Current ML Coins balance', example: 850 })
  balance!: number;

  @ApiProperty({ description: 'ML Coins earned this week', example: 250 })
  earned_this_week!: number;

  @ApiProperty({ description: 'ML Coins spent this week', example: 100 })
  spent_this_week!: number;

  @ApiProperty({ description: 'Current Maya rank', example: 'Nacom' })
  rank!: string;

  @ApiProperty({ description: 'Current level', example: 12 })
  level!: number;
}

/**
 * Students Economy Response DTO
 */
export class StudentsEconomyResponseDto {
  @ApiProperty({ description: 'List of students with economy data', type: [StudentEconomyDto] })
  students!: StudentEconomyDto[];

  @ApiProperty({ description: 'Total count of students', example: 25 })
  total!: number;
}

// ============================================================================
// ACHIEVEMENT STATS DTO (GAP-ST-007)
// ============================================================================

/**
 * Achievement Stats DTO
 *
 * @description Achievement with unlock count for teacher's classroom view
 */
export class AchievementStatsDto {
  @ApiProperty({ description: 'Achievement ID' })
  id!: string;

  @ApiProperty({ description: 'Achievement name', example: 'Primera Victoria' })
  name!: string;

  @ApiProperty({ description: 'Achievement description', example: 'Completa tu primer ejercicio' })
  description!: string;

  @ApiProperty({ description: 'ML Coins reward', example: 50 })
  reward!: number;

  @ApiProperty({ description: 'Number of students who unlocked this achievement', example: 22 })
  unlocked_count!: number;
}

/**
 * Achievements Stats Response DTO
 */
export class AchievementsStatsResponseDto {
  @ApiProperty({ description: 'List of achievements with stats', type: [AchievementStatsDto] })
  achievements!: AchievementStatsDto[];

  @ApiProperty({ description: 'Total achievements available', example: 15 })
  total_achievements!: number;

  @ApiProperty({ description: 'Total unlocks across all students', example: 156 })
  total_unlocks!: number;
}
