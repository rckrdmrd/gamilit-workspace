/**
 * Parent Response DTOs
 *
 * EXT-011 Parent Portal - Response DTOs
 *
 * @description DTOs for parent portal API responses.
 * @see ET-PAR-002-portal-dashboard.md
 * @created 2026-01-27
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationFrequency, ReportFormat, RelationshipType } from '@/modules/auth/entities/parent-account.entity';
import { LinkStatus, ParentRelationshipType } from '@/modules/auth/entities/parent-student-link.entity';

/**
 * Auth Tokens Response
 */
export class ParentAuthTokensDto {
  @ApiProperty({ description: 'Access token JWT' })
  accessToken!: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken!: string;

  @ApiProperty({ description: 'Token expiration time in seconds' })
  expiresIn!: number;
}

/**
 * Parent Account Response
 */
export class ParentAccountResponseDto {
  @ApiProperty({ description: 'Parent account ID' })
  id!: string;

  @ApiProperty({ description: 'Profile ID associated' })
  profileId!: string;

  @ApiProperty({ description: 'Display name' })
  displayName!: string;

  @ApiProperty({ description: 'Email' })
  email!: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  avatarUrl?: string;

  @ApiPropertyOptional({ enum: RelationshipType })
  relationshipType?: RelationshipType;

  @ApiProperty({ enum: NotificationFrequency })
  notificationFrequency!: NotificationFrequency;

  @ApiProperty({ enum: ReportFormat })
  preferredReportFormat!: ReportFormat;

  @ApiProperty()
  isVerified!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional()
  lastLoginAt?: Date;
}

/**
 * Auth Response (includes tokens + account)
 */
export class ParentAuthResponseDto {
  @ApiProperty({ type: ParentAuthTokensDto })
  tokens!: ParentAuthTokensDto;

  @ApiProperty({ type: ParentAccountResponseDto })
  account!: ParentAccountResponseDto;
}

/**
 * Linked Student Response
 */
export class LinkedStudentDto {
  @ApiProperty({ description: 'Student profile ID' })
  studentId!: string;

  @ApiProperty({ description: 'Link ID' })
  linkId!: string;

  @ApiProperty({ description: 'Student display name' })
  displayName!: string;

  @ApiPropertyOptional({ description: 'Student avatar URL' })
  avatarUrl?: string;

  @ApiProperty({ enum: ParentRelationshipType })
  relationshipType!: ParentRelationshipType;

  @ApiProperty({ enum: LinkStatus })
  linkStatus!: LinkStatus;

  @ApiProperty()
  canViewProgress!: boolean;

  @ApiProperty()
  canViewGrades!: boolean;

  @ApiProperty()
  canReceiveNotifications!: boolean;

  @ApiProperty()
  canContactTeachers!: boolean;

  @ApiProperty()
  linkedAt!: Date;
}

/**
 * Student Progress Summary
 */
export class StudentProgressSummaryDto {
  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty()
  currentLevel!: number;

  @ApiProperty()
  currentRank!: string;

  @ApiProperty()
  totalXp!: number;

  @ApiProperty()
  xpThisWeek!: number;

  @ApiProperty()
  currentStreak!: number;

  @ApiProperty()
  exercisesCompletedThisWeek!: number;

  @ApiProperty()
  averageAccuracyThisWeek!: number;

  @ApiProperty()
  modulesInProgress!: number;

  @ApiProperty()
  modulesCompleted!: number;

  @ApiProperty({ type: [String] })
  recentAchievements!: string[];

  @ApiPropertyOptional()
  lastActivityDate?: Date;
}

/**
 * Recent Activity Item
 */
export class RecentActivityDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  studentName!: string;

  @ApiProperty({ enum: ['exercise_completed', 'achievement_unlocked', 'level_up', 'rank_promotion', 'module_completed', 'assignment_submitted', 'streak_milestone'] })
  activityType!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional()
  xpEarned?: number;

  @ApiProperty()
  timestamp!: Date;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;
}

/**
 * Upcoming Assignment
 */
export class UpcomingAssignmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  studentName!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  dueDate!: Date;

  @ApiProperty({ enum: ['pending', 'in_progress', 'submitted', 'overdue'] })
  status!: string;

  @ApiPropertyOptional()
  teacherName?: string;

  @ApiPropertyOptional()
  className?: string;
}

/**
 * Dashboard Data Response
 */
export class ParentDashboardDto {
  @ApiProperty({ type: [LinkedStudentDto] })
  students!: LinkedStudentDto[];

  @ApiProperty({ type: [StudentProgressSummaryDto] })
  progressSummaries!: StudentProgressSummaryDto[];

  @ApiProperty({ type: [RecentActivityDto] })
  recentActivities!: RecentActivityDto[];

  @ApiProperty({ type: [UpcomingAssignmentDto] })
  upcomingAssignments!: UpcomingAssignmentDto[];

  @ApiProperty()
  unreadNotifications!: number;

  @ApiProperty()
  unreadMessages!: number;
}
