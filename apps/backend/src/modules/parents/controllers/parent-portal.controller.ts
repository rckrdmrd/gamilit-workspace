/**
 * ParentPortalController
 *
 * EXT-011 Parent Portal - Main Controller
 *
 * @description Handles parent portal protected endpoints including
 * dashboard, student linking, progress viewing, and notifications.
 *
 * @see ET-PAR-002-portal-dashboard.md
 * @created 2026-01-27
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { ParentAuthGuard } from '../guards/parent-auth.guard';
import { ParentAccountId } from '../decorators/parent-account.decorator';
import { ParentAuthService } from '../services/parent-auth.service';
import { ParentDashboardService } from '../services/parent-dashboard.service';
import { WeeklyReportService, WeeklyReport, ReportHistoryItem } from '../services/weekly-report.service';

import {
  LinkStudentDto,
  VerifyLinkDto,
  UpdateLinkPermissionsDto,
} from '../dto/link-student.dto';
import {
  ParentDashboardDto,
  LinkedStudentDto,
  StudentProgressSummaryDto,
  RecentActivityDto,
  UpcomingAssignmentDto,
} from '../dto/parent-response.dto';
import { ParentStudentLink } from '@/modules/auth/entities/parent-student-link.entity';
import { ParentNotification } from '@/modules/auth/entities/parent-notification.entity';

@ApiTags('Parent Portal')
@ApiBearerAuth()
@UseGuards(ParentAuthGuard)
@Controller('parent-portal')
export class ParentPortalController {
  constructor(
    private readonly authService: ParentAuthService,
    private readonly dashboardService: ParentDashboardService,
    private readonly reportService: WeeklyReportService,
  ) {}

  // =====================================================
  // DASHBOARD
  // =====================================================

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get parent dashboard',
    description: 'Returns complete dashboard data including students, progress, activities',
  })
  @ApiResponse({ status: 200, type: ParentDashboardDto })
  async getDashboard(
    @ParentAccountId() parentId: string,
  ): Promise<ParentDashboardDto> {
    return this.dashboardService.getDashboard(parentId);
  }

  // =====================================================
  // STUDENT LINKING
  // =====================================================

  @Get('students')
  @ApiOperation({
    summary: 'Get linked students',
    description: 'Returns all students linked to this parent account',
  })
  @ApiResponse({ status: 200, type: [LinkedStudentDto] })
  async getLinkedStudents(
    @ParentAccountId() parentId: string,
  ): Promise<LinkedStudentDto[]> {
    return this.authService.getLinkedStudents(parentId);
  }

  @Post('students/link')
  @ApiOperation({
    summary: 'Link a student',
    description: 'Creates a link request to a student using their code',
  })
  @ApiResponse({ status: 201, description: 'Link request created' })
  @ApiResponse({ status: 404, description: 'Student code not found' })
  @ApiResponse({ status: 409, description: 'Link already exists' })
  async linkStudent(
    @ParentAccountId() parentId: string,
    @Body() dto: LinkStudentDto,
  ): Promise<ParentStudentLink> {
    return this.authService.linkStudent(parentId, dto);
  }

  @Post('students/verify')
  @ApiOperation({
    summary: 'Verify student link',
    description: 'Verifies a pending link using verification code',
  })
  @ApiResponse({ status: 200, description: 'Link verified and activated' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifyStudentLink(
    @ParentAccountId() parentId: string,
    @Body() dto: VerifyLinkDto,
  ): Promise<ParentStudentLink> {
    return this.authService.verifyLink(parentId, dto);
  }

  // =====================================================
  // STUDENT PROGRESS
  // =====================================================

  @Get('students/:studentId/progress')
  @ApiOperation({
    summary: 'Get student progress',
    description: 'Returns detailed progress for a specific student',
  })
  @ApiParam({ name: 'studentId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: StudentProgressSummaryDto })
  @ApiResponse({ status: 403, description: 'No access to this student' })
  async getStudentProgress(
    @ParentAccountId() parentId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ): Promise<StudentProgressSummaryDto> {
    return this.dashboardService.getStudentDetailedProgress(parentId, studentId);
  }

  @Get('students/:studentId/activities')
  @ApiOperation({
    summary: 'Get student activities',
    description: 'Returns recent activities for a specific student',
  })
  @ApiParam({ name: 'studentId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: [RecentActivityDto] })
  async getStudentActivities(
    @ParentAccountId() parentId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('limit') limit?: number,
  ): Promise<RecentActivityDto[]> {
    return this.dashboardService.getRecentActivities(parentId, [studentId], limit || 20);
  }

  @Get('students/:studentId/assignments')
  @ApiOperation({
    summary: 'Get student assignments',
    description: 'Returns upcoming assignments for a specific student',
  })
  @ApiParam({ name: 'studentId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: [UpcomingAssignmentDto] })
  async getStudentAssignments(
    @ParentAccountId() parentId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('limit') limit?: number,
  ): Promise<UpcomingAssignmentDto[]> {
    return this.dashboardService.getUpcomingAssignments([studentId], limit || 10);
  }

  // =====================================================
  // WEEKLY REPORTS
  // =====================================================

  @Get('reports/weekly')
  @ApiOperation({
    summary: 'Get weekly report history',
    description: 'Returns history of weekly reports for this parent',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Report history' })
  async getReportHistory(
    @ParentAccountId() parentId: string,
    @Query('limit') limit?: number,
  ): Promise<ReportHistoryItem[]> {
    return this.reportService.getReportHistory(parentId, limit || 20);
  }

  @Post('reports/weekly/:studentId')
  @ApiOperation({
    summary: 'Generate weekly report',
    description: 'Generates a new weekly report for a student',
  })
  @ApiParam({ name: 'studentId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Report generated' })
  async generateWeeklyReport(
    @ParentAccountId() parentId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ): Promise<WeeklyReport> {
    return this.reportService.generateWeeklyReport(parentId, studentId);
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  @Get('notifications')
  @ApiOperation({
    summary: 'Get notifications',
    description: 'Returns notifications for this parent',
  })
  @ApiQuery({ name: 'studentId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, type: [ParentNotification] })
  async getNotifications(
    @ParentAccountId() parentId: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ParentNotification[]> {
    return this.dashboardService.getNotifications(parentId, {
      studentId,
      status,
      limit,
      offset,
    });
  }

  @Patch('notifications/:notificationId/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Marks a specific notification as read',
  })
  @ApiParam({ name: 'notificationId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markNotificationRead(
    @ParentAccountId() parentId: string,
    @Param('notificationId', ParseUUIDPipe) notificationId: string,
  ): Promise<{ success: boolean }> {
    await this.dashboardService.markNotificationRead(parentId, notificationId);
    return { success: true };
  }

  @Get('notifications/unread-count')
  @ApiOperation({
    summary: 'Get unread notification count',
    description: 'Returns count of unread notifications',
  })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(
    @ParentAccountId() parentId: string,
  ): Promise<{ count: number }> {
    const count = await this.dashboardService.getUnreadNotificationCount(parentId);
    return { count };
  }
}
