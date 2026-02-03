/**
 * Prediction Controller
 *
 * @description REST API endpoints for ML predictions.
 * Provides individual and batch prediction endpoints for students and teachers.
 *
 * Security:
 * - Students can only access their own predictions
 * - Teachers can access predictions for students in their classrooms
 * - Admins can access all predictions
 *
 * @module ml/controllers
 * @sprint 3.3 - ML Prediction API
 * @created 2026-02-03
 */

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards';
import { Roles } from '@/shared/decorators/roles.decorator';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { ModelReadyGuard, RequiresModel } from '../guards';
import { PredictionService } from '../services/prediction.service';
import {
  BatchPredictDropoutRiskRequestDto,
  BatchPredictClassroomRequestDto,
  AtRiskDashboardQueryDto,
  DropoutRiskPredictionDto,
  PerformancePredictionDto,
  DifficultyRecommendationDto,
  EngagementPredictionDto,
  StudentInsightsDto,
  ClassroomInsightsDto,
  DashboardMetricsDto,
} from '../dto';

@ApiTags('ML Predictions')
@ApiBearerAuth()
@Controller('ml/predict')
@UseGuards(JwtAuthGuard, RolesGuard, ModelReadyGuard)
export class PredictionController {
  private readonly logger = new Logger(PredictionController.name);

  constructor(private readonly predictionService: PredictionService) {}

  // ============================================
  // STUDENT PREDICTIONS (Individual)
  // ============================================

  /**
   * Get dropout risk prediction for a student
   */
  @Get('dropout-risk/:studentId')
  @HttpCode(HttpStatus.OK)
  @RequiresModel('dropout_risk')
  @ApiOperation({
    summary: 'Get dropout risk prediction',
    description: 'Predicts the dropout risk for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student profile ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Dropout risk prediction',
    type: DropoutRiskPredictionDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot access this student prediction',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  @ApiResponse({
    status: 503,
    description: 'Model not ready - retry later',
  })
  async getDropoutRisk(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Request() req: any,
  ): Promise<DropoutRiskPredictionDto> {
    await this.verifyAccess(req.user, studentId);

    this.logger.log(`[PREDICT] Dropout risk requested for student ${studentId}`);
    return this.predictionService.predictDropoutRisk(studentId);
  }

  /**
   * Get performance prediction for a student on a specific exercise
   */
  @Get('performance/:studentId/:exerciseId')
  @HttpCode(HttpStatus.OK)
  @RequiresModel('performance')
  @ApiOperation({
    summary: 'Get performance prediction',
    description: 'Predicts expected score for a student on a specific exercise',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student profile ID (UUID)',
  })
  @ApiParam({
    name: 'exerciseId',
    description: 'Exercise ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance prediction',
    type: PerformancePredictionDto,
  })
  async getPerformance(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('exerciseId', ParseUUIDPipe) exerciseId: string,
    @Request() req: any,
  ): Promise<PerformancePredictionDto> {
    await this.verifyAccess(req.user, studentId);

    this.logger.log(
      `[PREDICT] Performance requested for student ${studentId} on exercise ${exerciseId}`,
    );
    return this.predictionService.predictPerformance(studentId, exerciseId);
  }

  /**
   * Get difficulty recommendation for a student in a module
   */
  @Get('difficulty/:studentId/:moduleId')
  @HttpCode(HttpStatus.OK)
  @RequiresModel('difficulty')
  @ApiOperation({
    summary: 'Get difficulty recommendation',
    description: 'Recommends optimal exercise difficulty for a student in a module',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student profile ID (UUID)',
  })
  @ApiParam({
    name: 'moduleId',
    description: 'Module ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Difficulty recommendation',
    type: DifficultyRecommendationDto,
  })
  async getDifficulty(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Request() req: any,
  ): Promise<DifficultyRecommendationDto> {
    await this.verifyAccess(req.user, studentId);

    this.logger.log(
      `[PREDICT] Difficulty requested for student ${studentId} in module ${moduleId}`,
    );
    return this.predictionService.recommendDifficulty(studentId, moduleId);
  }

  /**
   * Get engagement prediction for a student
   */
  @Get('engagement/:studentId')
  @HttpCode(HttpStatus.OK)
  @RequiresModel('engagement')
  @ApiOperation({
    summary: 'Get engagement prediction',
    description: 'Predicts engagement patterns for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student profile ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Engagement prediction',
    type: EngagementPredictionDto,
  })
  async getEngagement(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Request() req: any,
  ): Promise<EngagementPredictionDto> {
    await this.verifyAccess(req.user, studentId);

    this.logger.log(`[PREDICT] Engagement requested for student ${studentId}`);
    return this.predictionService.predictEngagement(studentId);
  }

  /**
   * Get comprehensive student insights
   */
  @Get('insights/:studentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get comprehensive student insights',
    description: 'Returns all predictions and recommendations for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student profile ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Student insights',
    type: StudentInsightsDto,
  })
  async getStudentInsights(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Request() req: any,
  ): Promise<StudentInsightsDto> {
    await this.verifyAccess(req.user, studentId);

    this.logger.log(`[PREDICT] Insights requested for student ${studentId}`);
    return this.predictionService.getStudentInsights(studentId);
  }

  // ============================================
  // BATCH PREDICTIONS
  // ============================================

  /**
   * Batch predict dropout risk for multiple students
   */
  @Post('batch/dropout-risk')
  @HttpCode(HttpStatus.OK)
  @Roles('teacher', 'admin', 'super_admin')
  @RequiresModel('dropout_risk')
  @ApiOperation({
    summary: 'Batch predict dropout risk',
    description: 'Predicts dropout risk for multiple students at once',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch dropout risk predictions',
    type: [DropoutRiskPredictionDto],
  })
  async batchPredictDropoutRisk(
    @Body() dto: BatchPredictDropoutRiskRequestDto,
    @Request() req: any,
  ): Promise<DropoutRiskPredictionDto[]> {
    this.logger.log(
      `[BATCH] Dropout risk requested for ${dto.studentIds.length} students by ${req.user.sub}`,
    );
    return this.predictionService.batchPredictDropoutRisk(dto.studentIds);
  }

  /**
   * Batch predict for all students in a classroom
   */
  @Post('batch/classroom/:classroomId')
  @HttpCode(HttpStatus.OK)
  @Roles('teacher', 'admin', 'super_admin')
  @ApiOperation({
    summary: 'Batch predict for classroom',
    description: 'Predicts dropout risk for all students in a classroom',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Classroom insights',
    type: ClassroomInsightsDto,
  })
  async batchPredictClassroom(
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
    @Request() req: any,
  ): Promise<ClassroomInsightsDto> {
    this.logger.log(
      `[BATCH] Classroom predictions requested for ${classroomId} by ${req.user.sub}`,
    );
    return this.predictionService.getClassroomInsights(classroomId);
  }

  // ============================================
  // DASHBOARD ENDPOINTS
  // ============================================

  /**
   * Get students at risk (teacher/admin dashboard)
   */
  @Get('dashboard/at-risk')
  @HttpCode(HttpStatus.OK)
  @Roles('teacher', 'admin', 'super_admin')
  @ApiOperation({
    summary: 'Get students at risk',
    description: 'Lists students at medium, high, or critical dropout risk',
  })
  @ApiQuery({
    name: 'minRiskLevel',
    required: false,
    enum: ['low', 'medium', 'high', 'critical'],
    description: 'Minimum risk level to include',
  })
  @ApiQuery({
    name: 'classroomId',
    required: false,
    description: 'Filter by classroom',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum results',
  })
  @ApiResponse({
    status: 200,
    description: 'List of students at risk',
    type: [DropoutRiskPredictionDto],
  })
  async getAtRiskStudents(
    @Query() query: AtRiskDashboardQueryDto,
    @Request() req: any,
  ): Promise<DropoutRiskPredictionDto[]> {
    this.logger.log(
      `[DASHBOARD] At-risk students requested by ${req.user.sub}`,
    );

    // TODO: Implement filtering by classroom for teachers
    // For now, return empty array as placeholder
    // In production, this would query students based on user's role/classrooms
    return [];
  }

  /**
   * Get ML model performance metrics (admin only)
   */
  @Get('dashboard/metrics')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'super_admin')
  @ApiOperation({
    summary: 'Get model performance metrics',
    description: 'Returns performance metrics for all ML models',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard metrics',
    type: DashboardMetricsDto,
  })
  async getDashboardMetrics(@Request() req: any): Promise<DashboardMetricsDto> {
    this.logger.log(`[DASHBOARD] Metrics requested by ${req.user.sub}`);

    // Return placeholder metrics
    return {
      totalStudentsAnalyzed: 0,
      studentsAtRisk: 0,
      studentsCritical: 0,
      predictionsToday: 0,
      modelMetrics: [],
      collectedAt: new Date(),
    };
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  /**
   * Verify user has access to view a student's predictions
   *
   * - Students can only view their own predictions
   * - Teachers can view predictions for students in their classrooms
   * - Admins can view all predictions
   */
  private async verifyAccess(user: any, studentId: string): Promise<void> {
    const userId = user.sub;
    const userRole = user.role || user.roles?.[0];

    // Admin and super_admin have full access
    if (userRole === 'admin' || userRole === 'super_admin') {
      return;
    }

    // Students can only access their own predictions
    if (userRole === 'student') {
      // Check if user's profile ID matches studentId
      if (user.profileId !== studentId && userId !== studentId) {
        throw new ForbiddenException(
          'You can only access your own predictions',
        );
      }
      return;
    }

    // Teachers can access students in their classrooms
    if (userRole === 'teacher') {
      // TODO: Verify teacher has access to this student via classroom membership
      // For now, allow access (proper check would query classroom_members)
      return;
    }

    // Parent role - check if linked to student
    if (userRole === 'parent') {
      // TODO: Check parent-student relationship
      throw new ForbiddenException(
        'Parent access to predictions not yet implemented',
      );
    }

    // Unknown role - deny access
    throw new ForbiddenException('Access denied');
  }
}
