/**
 * Teacher Controller
 *
 * Handles all teacher-related endpoints
 */

import {
  Controller,
  Get,
  Post,
    Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiProduces, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { GamilityRoleEnum } from '@/shared/constants/enums.constants';
import { AuthRequest } from '@shared/types';
import {
  TeacherDashboardService,
  StudentProgressService,
  GradingService,
  AnalyticsService,
  ReportsService,
  BonusCoinsService,
  StorageService,
  TeacherReportsService,
} from '../services';
import {
  SubmitFeedbackDto,
  GetSubmissionsQueryDto,
  GetAnalyticsQueryDto,
  GetStudentProgressQueryDto,
  BulkGradeDto,
  AddTeacherNoteDto,
  StudentNoteResponseDto,
  GetEngagementMetricsDto,
  GenerateReportsDto,
    ReportFormat,
  GrantBonusDto,
  GrantBonusResponseDto,
  EconomyAnalyticsDto,
  StudentsEconomyResponseDto,
  AchievementsStatsResponseDto,
} from '../dto';
import { GenerateReportDto } from '../dto/reports.dto';
import {
  GetRecentReportsQueryDto,
  ReportMetadataDto,
  ReportStatsDto,
} from '../dto/teacher-reports.dto';

@ApiTags('Teacher')
@ApiBearerAuth()
@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
export class TeacherController {
  constructor(
    private readonly dashboardService: TeacherDashboardService,
    private readonly studentProgressService: StudentProgressService,
    private readonly gradingService: GradingService,
    private readonly analyticsService: AnalyticsService,
    private readonly reportsService: ReportsService,
    private readonly bonusCoinsService: BonusCoinsService,
    private readonly storageService: StorageService,
    private readonly teacherReportsService: TeacherReportsService,
  ) {}

  // =====================================================
  // DASHBOARD ENDPOINTS
  // =====================================================

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get classroom statistics' })
  async getClassroomStats(@Request() req: AuthRequest) {
    const teacherId = req.user!.id;
    return this.dashboardService.getClassroomStats(teacherId);
  }

  @Get('dashboard/activities')
  @ApiOperation({ summary: 'Get recent activities' })
  async getRecentActivities(@Request() req: AuthRequest, @Query('limit') limit?: number) {
    const teacherId = req.user!.id;
    return this.dashboardService.getRecentActivities(
      teacherId,
      limit ? parseInt(limit as any) : 10,
    );
  }

  @Get('dashboard/alerts')
  @ApiOperation({ summary: 'Get student alerts' })
  async getStudentAlerts(@Request() req: AuthRequest) {
    const teacherId = req.user!.id;
    return this.dashboardService.getStudentAlerts(teacherId);
  }

  @Get('dashboard/top-performers')
  @ApiOperation({ summary: 'Get top performing students' })
  async getTopPerformers(@Request() req: AuthRequest, @Query('limit') limit?: number) {
    const teacherId = req.user!.id;
    return this.dashboardService.getTopPerformers(
      teacherId,
      limit ? parseInt(limit as any) : 5,
    );
  }

  @Get('dashboard/module-progress')
  @ApiOperation({ summary: 'Get module progress summary' })
  async getModuleProgressSummary(@Request() req: AuthRequest) {
    const teacherId = req.user!.id;
    return this.dashboardService.getModuleProgressSummary(teacherId);
  }

  // =====================================================
  // STUDENT PROGRESS ENDPOINTS
  // =====================================================

  @Get('students/:studentId/progress')
  @ApiOperation({ summary: 'Get complete student progress' })
  async getStudentProgress(
  @Param('studentId') studentId: string,
    @Query() query: GetStudentProgressQueryDto,
  ) {
    return this.studentProgressService.getStudentProgress(studentId, query);
  }

  @Get('students/:studentId/overview')
  @ApiOperation({ summary: 'Get student overview' })
  async getStudentOverview(@Param('studentId') studentId: string) {
    return this.studentProgressService.getStudentOverview(studentId);
  }

  @Get('students/:studentId/stats')
  @ApiOperation({ summary: 'Get student statistics' })
  async getStudentStats(@Param('studentId') studentId: string) {
    return this.studentProgressService.getStudentStats(studentId);
  }

  @Get('students/:studentId/notes')
  @ApiOperation({
    summary: 'Get teacher notes for a student',
    description: 'Retrieve teacher notes for a specific student across all classrooms',
  })
  async getStudentNotes(
    @Param('studentId') studentId: string,
      @Request() req: AuthRequest,
  ): Promise<StudentNoteResponseDto[]> {
    const teacherId = req.user!.profile!.id;
    return this.studentProgressService.getStudentNotes(studentId, teacherId);
  }

  @Post('students/:studentId/note')
  @ApiOperation({
    summary: 'Add or update teacher note for a student',
    description: 'Add or update a note about a student in a specific classroom',
  })
  async addStudentNote(
    @Param('studentId') studentId: string,
      @Body() noteDto: AddTeacherNoteDto,
      @Request() req: AuthRequest,
  ): Promise<StudentNoteResponseDto> {
    const teacherId = req.user!.profile!.id;
    return this.studentProgressService.addStudentNote(
      studentId,
      teacherId,
      noteDto,
    );
  }

  @Get('students/:studentId/insights')
  @ApiOperation({
    summary: 'Get comprehensive student insights',
    description: 'Get AI-powered insights including strengths, weaknesses, predictions, and personalized recommendations for a student',
  })
  async getStudentInsights(@Param('studentId') studentId: string) {
    return this.analyticsService.getStudentInsights(studentId);
  }

  // =====================================================
  // GRADING ENDPOINTS
  // =====================================================

  @Get('submissions')
  @ApiOperation({
    summary: 'Get submissions with filters',
    description: 'Retrieve exercise submissions with optional filters for assignment, classroom, student, status, and module. Supports pagination and sorting.',
  })
  async getSubmissions(@Query() query: GetSubmissionsQueryDto) {
    return this.gradingService.getSubmissions(query);
  }

  @Get('submissions/:id')
  @ApiOperation({
    summary: 'Get submission details by ID',
    description: 'Retrieve detailed information about a specific exercise submission',
  })
  async getSubmissionById(@Param('id') id: string) {
    return this.gradingService.getSubmissionById(id);
  }

  @Post('submissions/:submissionId/feedback')
  @ApiOperation({ summary: 'Submit feedback for a submission' })
  async submitFeedback(
  @Param('submissionId') submissionId: string,
    @Body() feedbackDto: SubmitFeedbackDto,
  ) {
    return this.gradingService.submitFeedback(submissionId, feedbackDto);
  }

  @Post('submissions/bulk-grade')
  @ApiOperation({ summary: 'Grade multiple submissions at once' })
  async bulkGrade(@Body() bulkDto: BulkGradeDto) {
    return this.gradingService.bulkGrade(bulkDto);
  }

  // =====================================================
  // ANALYTICS ENDPOINTS
  // =====================================================

  @Get('analytics')
  @ApiOperation({ summary: 'Get classroom analytics' })
  async getClassroomAnalytics(@Query() query: GetAnalyticsQueryDto) {
    return this.analyticsService.getClassroomAnalytics(query);
  }

  @Get('analytics/classroom/:id')
  @ApiOperation({
    summary: 'Get analytics for a specific classroom',
    description:
      'Retrieve detailed analytics for a specific classroom including student performance, completion rates, and score distribution',
  })
  async getClassroomAnalyticsByClassroomId(
  @Param('id') classroomId: string,
    @Query() query: GetAnalyticsQueryDto,
  ) {
    return this.analyticsService.getClassroomAnalyticsByClassroomId(
      classroomId,
      query,
    );
  }

  @Get('analytics/assignment/:id')
  @ApiOperation({
    summary: 'Get analytics for a specific assignment',
    description:
      'Retrieve analytics for a specific assignment including submission rates, grading status, and score distribution',
  })
  async getAssignmentAnalytics(@Param('id') assignmentId: string) {
    return this.analyticsService.getAssignmentAnalytics(assignmentId);
  }

  @Get('analytics/engagement')
  @ApiOperation({
    summary: 'Get engagement metrics',
    description:
      'Retrieve engagement metrics including active students, submission rates, and classroom activity',
  })
  async getEngagementMetrics(
  @Request() req: AuthRequest,
    @Query() query: GetEngagementMetricsDto,
  ) {
    const teacherId = req.user!.profile!.id;
    return this.analyticsService.getEngagementMetrics(teacherId, query);
  }

  @Get('analytics/reports')
  @ApiOperation({
    summary: 'Generate comprehensive reports',
    description:
      'Generate comprehensive reports with analytics across classrooms, assignments, and student performance',
  })
  async generateReports(
  @Request() req: AuthRequest,
    @Query() query: GenerateReportsDto,
  ) {
    const teacherId = req.user!.profile!.id;
    return this.analyticsService.generateReports(teacherId, query);
  }

  @Get('analytics/economy')
  @ApiOperation({
    summary: 'Get ML Coins economy analytics',
    description:
      'Retrieve comprehensive ML Coins economy analytics for teacher\'s classrooms including ' +
      'total circulation, distribution by balance range, top earners, and wealth distribution metrics. ' +
      'Optionally filter by specific classroom ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Economy analytics retrieved successfully',
    type: EconomyAnalyticsDto,
  })
  async getEconomyAnalytics(
    @Request() req: AuthRequest,
      @Query('classroom_id') classroomId?: string,
  ): Promise<EconomyAnalyticsDto> {
    const teacherId = req.user!.profile!.id;
    return this.analyticsService.getEconomyAnalytics(teacherId, classroomId);
  }

  @Get('analytics/students-economy')
  @ApiOperation({
    summary: 'Get students economy data',
    description:
      'Retrieve ML Coins economy data for all students in teacher\'s classrooms. ' +
      'Includes balance, weekly earnings/spending, Maya rank, and level. ' +
      'Optionally filter by specific classroom ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Students economy data retrieved successfully',
    type: StudentsEconomyResponseDto,
  })
  async getStudentsEconomy(
    @Request() req: AuthRequest,
      @Query('classroom_id') classroomId?: string,
  ): Promise<StudentsEconomyResponseDto> {
    const teacherId = req.user!.profile!.id;
    return this.analyticsService.getStudentsEconomy(teacherId, classroomId);
  }

  @Get('analytics/achievements')
  @ApiOperation({
    summary: 'Get achievements stats for classrooms',
    description:
      'Retrieve all achievements with unlock counts for students in teacher\'s classrooms. ' +
      'Shows how many students have unlocked each achievement. ' +
      'Optionally filter by specific classroom ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievements stats retrieved successfully',
    type: AchievementsStatsResponseDto,
  })
  async getAchievementsStats(
    @Request() req: AuthRequest,
      @Query('classroom_id') classroomId?: string,
  ): Promise<AchievementsStatsResponseDto> {
    const teacherId = req.user!.profile!.id;
    return this.analyticsService.getAchievementsStats(teacherId, classroomId);
  }

  // =====================================================
  // REPORT GENERATION ENDPOINTS (PDF/Excel with Insights)
  // =====================================================

  @Post('reports/generate')
  @ApiOperation({
    summary: 'Generate student insights report',
    description:
      'Generate a comprehensive report with student insights in PDF or Excel format. ' +
      'Reports include risk analysis, recommendations, strengths/weaknesses, and predictions. ' +
      'The report is persisted to storage and metadata is saved to the database.',
  })
  @ApiProduces('application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async generateInsightsReport(
  @Request() req: AuthRequest,
    @Body() dto: GenerateReportDto,
    @Res() res: Response,
  ) {
    const userId = req.user!.profile!.id;
    const tenantId = req.user!.tenantId || req.user!.tenant_id || 'default';

    // Generate report (now persists to storage and database)
    const { buffer, metadata, reportId } = await this.reportsService.generateReport(dto, userId, tenantId);

    // Set appropriate headers
    const filename = `student-insights-${reportId}.${dto.format === ReportFormat.PDF ? 'pdf' : 'xlsx'}`;
    const contentType =
      dto.format === ReportFormat.PDF
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
      'X-Report-ID': reportId,
      'X-Student-Count': metadata.student_count,
      'X-Generated-At': metadata.generated_at.toISOString(),
    });

    res.status(HttpStatus.OK).send(buffer);
  }

  // =====================================================
  // BONUS ML COINS ENDPOINTS
  // =====================================================

  @Post('students/:studentId/bonus')
  @ApiOperation({
    summary: 'Grant bonus ML Coins to student',
    description:
      'Grant bonus ML Coins to a student as a reward for good behavior, participation, ' +
      'or special achievements. Validates that the teacher has access to the student ' +
      '(student must be in one of the teacher\'s classrooms).',
  })
  @ApiResponse({
    status: 201,
    description: 'Bonus granted successfully',
    type: GrantBonusResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input (amount out of range or reason too short)',
  })
  @ApiResponse({
    status: 403,
    description: 'Teacher does not have access to this student',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  async grantBonus(
    @Param('studentId') studentId: string,
      @Body() dto: GrantBonusDto,
      @Request() req: AuthRequest,
  ): Promise<GrantBonusResponseDto> {
    const teacherId = req.user!.profile!.id;
    return this.bonusCoinsService.grantBonus(teacherId, studentId, dto);
  }

  // =====================================================
  // TEACHER REPORTS METADATA ENDPOINTS
  // =====================================================

  @Get('reports/recent')
  @ApiOperation({
    summary: 'Get recent reports',
    description: 'Retrieve a list of recent reports generated by the teacher',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent reports retrieved successfully',
    type: [ReportMetadataDto],
  })
  async getRecentReports(
    @Request() req: AuthRequest,
      @Query() query: GetRecentReportsQueryDto,
  ): Promise<ReportMetadataDto[]> {
    const teacherId = req.user!.profile!.id;
    const limit = query.limit || 10;
    return this.teacherReportsService.getRecentReports(teacherId, limit);
  }

  @Get('reports/stats')
  @ApiOperation({
    summary: 'Get report statistics',
    description: 'Retrieve statistics about reports generated by the teacher',
  })
  @ApiResponse({
    status: 200,
    description: 'Report stats retrieved successfully',
    type: ReportStatsDto,
  })
  async getReportStats(@Request() req: AuthRequest): Promise<ReportStatsDto> {
    const teacherId = req.user!.profile!.id;
    return this.teacherReportsService.getReportStats(teacherId);
  }

  @Get('reports/:id/download')
  @ApiOperation({
    summary: 'Download a report',
    description: 'Download a previously generated report. Validates teacher ownership.',
  })
  @ApiProduces('application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv')
  @ApiResponse({
    status: 200,
    description: 'Report file downloaded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Teacher does not have access to this report',
  })
  async downloadReport(
  @Param('id') reportId: string,
    @Request() req: AuthRequest,
    @Res() res: Response,
  ) {
    const teacherId = req.user!.profile!.id;

    // Get report with ownership validation
    const report = await this.teacherReportsService.getReportById(reportId, teacherId);

    // If file_path is not set, return error
    if (!report.filePath) {
      res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Report file not found on storage',
        error: 'Not Found',
      });
      return;
    }

    // Get file from storage
    const buffer = await this.storageService.getFile(report.filePath);

    // Determine content type
    const contentType = this.storageService.getMimeType(report.filePath);

    const fileExtension =
      report.reportFormat === 'pdf' ? 'pdf' : report.reportFormat === 'excel' ? 'xlsx' : 'csv';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${report.reportName}.${fileExtension}"`,
      'Content-Length': buffer.length,
      'X-Report-ID': report.id,
      'X-Teacher-ID': report.teacherId,
      'X-Generated-At': report.generatedAt.toISOString(),
    });

    res.status(HttpStatus.OK).send(buffer);
  }
}
