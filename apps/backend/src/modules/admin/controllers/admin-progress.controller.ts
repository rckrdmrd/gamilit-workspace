import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminProgressService } from '../services/admin-progress.service';
import {
  ProgressOverviewDto,
  ClassroomProgressDto,
  StudentProgressDto,
  ModuleProgressStatsDto,
  ExerciseStatsDto,
  StudentProgressQueryDto,
  ModuleProgressQueryDto,
  ExportProgressQueryDto,
  StudentAchievementsResponseDto,
} from '../dto/progress';

/**
 * Admin Progress Controller
 * Handles all progress tracking and analytics endpoints for administrators
 */
@Controller('admin/progress')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@ApiTags('admin-public', 'Admin - Progress')
export class AdminProgressController {
  constructor(private readonly progressService: AdminProgressService) {}

  /**
   * GET /admin/progress/overview
   * Get system-wide progress overview with global statistics
   */
  @Get('overview')
  @ApiOperation({
    summary: 'Get system-wide progress overview',
    description:
      'Returns global statistics including total users, submissions, modules, and time spent across the entire platform',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Progress overview retrieved successfully',
    type: ProgressOverviewDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have admin privileges',
  })
  async getProgressOverview(): Promise<ProgressOverviewDto> {
    return this.progressService.getProgressOverview();
  }

  /**
   * GET /admin/progress/classrooms/:id
   * Get detailed progress for a specific classroom
   */
  @Get('classrooms/:id')
  @ApiOperation({
    summary: 'Get detailed progress for a classroom',
    description:
      'Returns classroom information and detailed progress for all students in the classroom',
  })
  @ApiParam({
    name: 'id',
    description: 'Classroom UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Classroom progress retrieved successfully',
    type: ClassroomProgressDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Classroom not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have admin privileges',
  })
  async getClassroomProgress(
    @Param('id', ParseUUIDPipe) classroomId: string,
  ): Promise<ClassroomProgressDto> {
    return this.progressService.getClassroomProgress(classroomId);
  }

  /**
   * GET /admin/progress/students/:id
   * Get detailed progress for a specific student
   */
  @Get('students/:id')
  @ApiOperation({
    summary: 'Get detailed progress for a student',
    description:
      'Returns comprehensive student information including user stats, module progress, and recent submissions. Supports filtering by classroom or module.',
  })
  @ApiParam({
    name: 'id',
    description: 'Student UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student progress retrieved successfully',
    type: StudentProgressDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have admin privileges',
  })
  async getStudentProgress(
    @Param('id', ParseUUIDPipe) studentId: string,
      @Query() query: StudentProgressQueryDto,
  ): Promise<StudentProgressDto> {
    return this.progressService.getStudentProgress(studentId, query);
  }

  /**
   * GET /admin/progress/students/:id/achievements
   * Get achievements earned by a specific student
   */
  @Get('students/:id/achievements')
  @ApiOperation({
    summary: 'Get achievements for a student',
    description:
      'Returns all achievements earned by a specific student, including achievement details, rewards, and unlock dates. Provides summary statistics by category and tier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Student UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student achievements retrieved successfully',
    type: StudentAchievementsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have admin privileges',
  })
  async getStudentAchievements(
    @Param('id', ParseUUIDPipe) studentId: string,
  ): Promise<StudentAchievementsResponseDto> {
    return this.progressService.getStudentAchievements(studentId);
  }

  /**
   * GET /admin/progress/modules/:id
   * Get progress statistics for a specific module
   */
  @Get('modules/:id')
  @ApiOperation({
    summary: 'Get progress statistics for a module',
    description:
      'Returns module information and aggregated progress statistics including completion rates, average scores, and time spent',
  })
  @ApiParam({
    name: 'id',
    description: 'Module UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Module progress statistics retrieved successfully',
    type: ModuleProgressStatsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Module not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have admin privileges',
  })
  async getModuleProgress(
    @Param('id', ParseUUIDPipe) moduleId: string,
      @Query() query: ModuleProgressQueryDto,
  ): Promise<ModuleProgressStatsDto> {
    return this.progressService.getModuleProgress(moduleId, query);
  }

  /**
   * GET /admin/progress/exercises/:id
   * Get statistics for a specific exercise
   */
  @Get('exercises/:id')
  @ApiOperation({
    summary: 'Get statistics for an exercise',
    description:
      'Returns exercise information and submission statistics including completion rates, average scores, and attempt counts',
  })
  @ApiParam({
    name: 'id',
    description: 'Exercise UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exercise statistics retrieved successfully',
    type: ExerciseStatsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Exercise not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have admin privileges',
  })
  async getExerciseStats(
    @Param('id', ParseUUIDPipe) exerciseId: string,
  ): Promise<ExerciseStatsDto> {
    return this.progressService.getExerciseStats(exerciseId);
  }

  /**
   * GET /admin/progress/export
   * Export progress data to CSV format
   */
  @Get('export')
  @ApiOperation({
    summary: 'Export progress data to CSV',
    description:
      'Exports progress data in CSV format. Supports exporting students, classrooms, or modules data. Can be filtered by classroom.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'CSV file generated successfully',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid export type or parameters',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have admin privileges',
  })
  async exportProgress(
    @Query() query: ExportProgressQueryDto,
      @Res() res: Response,
  ): Promise<void> {
    const csvData = await this.progressService.exportProgressData(
      query.type,
      query.classroom_id,
    );

    // Set response headers for CSV download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `progress-${query.type}-${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  }
}
