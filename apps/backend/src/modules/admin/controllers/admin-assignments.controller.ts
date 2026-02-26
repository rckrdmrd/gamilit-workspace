import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  Res,
  StreamableFile,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiProduces,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminAssignmentsService } from '../services/admin-assignments.service';
import {
  AdminAssignmentFiltersDto,
  AdminAssignmentDto,
  AdminAssignmentDetailDto,
  PaginatedAdminAssignmentsDto,
  AdminAssignmentStatsDto,
} from '../dto/assignments';
import { AuthRequest } from '@shared/types';

/**
 * Admin Assignments Controller
 *
 * @description Handles all assignment management endpoints for administrators
 * Provides read-only access to all assignments in the system
 *
 * @security Requires JWT authentication and admin role
 *
 * ROUTE ORDER — critical for NestJS top-to-bottom evaluation:
 *   1. GET /             (findAll)
 *   2. GET /stats        (getStats)
 *   3. GET /classrooms/:classroomId
 *   4. GET /students/:studentId
 *   5. GET /export       (exportToCsv)
 *   6. GET /:id          (findOne) — MUST be last to avoid capturing literal segments
 */
@Controller('admin/assignments')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@ApiTags('admin-public', 'Admin - Assignments')
export class AdminAssignmentsController {
  constructor(
    private readonly assignmentsService: AdminAssignmentsService,
  ) {}

  /**
   * GET /admin/assignments
   * Get all assignments with filters and pagination
   */
  @Get()
  @ApiOperation({
    summary: 'Get all assignments with filters and pagination',
    description:
      'Returns a paginated list of assignments. Supports filtering by classroom, teacher, student, status, and date range.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignments retrieved successfully',
    type: PaginatedAdminAssignmentsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have admin privileges',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid query parameters',
  })
  async findAll(
    @Query() filters: AdminAssignmentFiltersDto,
  ): Promise<PaginatedAdminAssignmentsDto> {
    return this.assignmentsService.findAll(filters);
  }

  /**
   * GET /admin/assignments/stats
   * Get global assignment statistics
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get global assignment statistics',
    description:
      'Returns system-wide statistics including total assignments, submissions, average scores, and breakdowns by type and teacher.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment statistics retrieved successfully',
    type: AdminAssignmentStatsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have admin privileges',
  })
  async getStats(): Promise<AdminAssignmentStatsDto> {
    return this.assignmentsService.getStats();
  }

  /**
   * GET /admin/assignments/classrooms/:classroomId
   * Get assignments for a specific classroom
   *
   * MUST be declared before GET /:id to prevent NestJS from matching
   * the literal segment "classrooms" against the :id UUID pipe.
   */
  @Get('classrooms/:classroomId')
  @ApiOperation({
    summary: 'Get assignments for a specific classroom',
    description:
      'Returns all assignments assigned to a specific classroom, including submission statistics.',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Classroom assignments retrieved successfully',
    type: [AdminAssignmentDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have admin privileges',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid UUID format',
  })
  async getByClassroom(
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
  ): Promise<AdminAssignmentDto[]> {
    return this.assignmentsService.getByClassroom(classroomId);
  }

  /**
   * GET /admin/assignments/students/:studentId
   * Get assignments for a specific student
   *
   * MUST be declared before GET /:id to prevent NestJS from matching
   * the literal segment "students" against the :id UUID pipe.
   */
  @Get('students/:studentId')
  @ApiOperation({
    summary: 'Get assignments for a specific student',
    description:
      'Returns all assignments assigned to a specific student, including submission status and scores.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student assignments retrieved successfully',
    type: [AdminAssignmentDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have admin privileges',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid UUID format',
  })
  async getByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ): Promise<AdminAssignmentDto[]> {
    return this.assignmentsService.getByStudent(studentId);
  }

  /**
   * GET /admin/assignments/export
   * Export assignments to CSV
   *
   * MUST be declared before GET /:id to prevent NestJS from matching
   * the literal segment "export" against the :id UUID pipe.
   */
  @Get('export')
  @ApiOperation({ summary: 'Export assignments to CSV' })
  @ApiProduces('text/csv')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'CSV file',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have admin privileges',
  })
  async exportToCsv(
    @Query() filters: AdminAssignmentFiltersDto,
    @Request() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const tenantId = req.user!.tenant_id!;
    const csv = await this.assignmentsService.exportToCsv(filters, tenantId);

    const buffer = Buffer.from(csv, 'utf-8');
    const timestamp = new Date().toISOString().slice(0, 10);

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="assignments-export-${timestamp}.csv"`,
      'Content-Length': buffer.length,
    });

    return new StreamableFile(buffer);
  }

  /**
   * GET /admin/assignments/:id
   * Get detailed assignment information by ID
   *
   * MUST be the last @Get() method in the class. NestJS evaluates routes
   * top-to-bottom; placing this before any literal-segment route causes those
   * routes to be shadowed and their UUID pipe to fail with HTTP 400.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get detailed assignment information by ID',
    description:
      'Returns comprehensive assignment details including teacher info, assigned classrooms, and recent submissions.',
  })
  @ApiParam({
    name: 'id',
    description: 'Assignment UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment details retrieved successfully',
    type: AdminAssignmentDetailDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Assignment not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have admin privileges',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid UUID format',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminAssignmentDetailDto> {
    return this.assignmentsService.findOne(id);
  }
}
