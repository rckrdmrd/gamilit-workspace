import {
  Controller,
  Get,
  Param,
  Query,
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

/**
 * Admin Assignments Controller
 *
 * @description Handles all assignment management endpoints for administrators
 * Provides read-only access to all assignments in the system
 *
 * @security Requires JWT authentication and admin role
 */
@Controller('admin/assignments')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@ApiTags('Admin - Assignments')
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
   * GET /admin/assignments/:id
   * Get detailed assignment information by ID
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

  /**
   * GET /admin/assignments/classrooms/:classroomId
   * Get assignments for a specific classroom
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
}
