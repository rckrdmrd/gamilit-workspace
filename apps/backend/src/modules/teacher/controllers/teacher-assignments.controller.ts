/**
 * TeacherAssignmentsController
 *
 * @description Controller for teacher assignment management CRUD operations
 * @module modules/teacher/controllers/teacher-assignments
 *
 * Endpoints:
 * - GET /teacher/assignments - List assignments for teacher
 * - GET /teacher/assignments/upcoming - Get upcoming assignments
 * - GET /teacher/assignments/:id - Get assignment by ID
 * - POST /teacher/assignments - Create assignment
 * - PUT /teacher/assignments/:id - Update assignment
 * - DELETE /teacher/assignments/:id - Delete assignment
 * - GET /teacher/assignments/:id/submissions - Get submissions for assignment
 * - POST /teacher/assignments/:id/send-reminder - Send reminder to students
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { GamilityRoleEnum } from '@/shared/constants/enums.constants';
import { AuthRequest } from '@shared/types';
import { TeacherAssignmentsService } from '../services/teacher-assignments.service';
import {
  AssignmentQueryDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  AssignmentResponseDto,
  UpcomingAssignmentResponseDto,
} from '../dto/teacher-assignments.dto';

@ApiTags('Teacher - Assignments')
@Controller('teacher/assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
@ApiBearerAuth()
export class TeacherAssignmentsController {
  constructor(
    private readonly assignmentsService: TeacherAssignmentsService,
  ) {}

  // ============================================================================
  // LIST ASSIGNMENTS
  // ============================================================================

  /**
   * Get all assignments for the authenticated teacher
   *
   * @route GET /api/v1/teacher/assignments
   */
  @Get()
  @ApiOperation({
    summary: 'Get all assignments for authenticated teacher',
    description:
      'Returns a list of assignments created by the teacher. ' +
      'Supports filtering by classroom, status, and date range.',
  })
  @ApiQuery({ name: 'classroom_id', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'active', 'completed', 'expired'] })
  @ApiQuery({ name: 'start_date', required: false, type: String })
  @ApiQuery({ name: 'end_date', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully',
    type: [AssignmentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAssignments(
    @Query() query: AssignmentQueryDto,
    @Request() req: AuthRequest,
  ): Promise<AssignmentResponseDto[]> {
    const teacherId = req.user!.id;
    return this.assignmentsService.getAssignments(teacherId, query);
  }

  // ============================================================================
  // UPCOMING ASSIGNMENTS (must be before :id to avoid route conflict)
  // ============================================================================

  /**
   * Get upcoming assignments with approaching deadlines
   *
   * @route GET /api/v1/teacher/assignments/upcoming
   */
  @Get('upcoming')
  @ApiOperation({
    summary: 'Get upcoming assignments with deadlines',
    description:
      'Returns assignments that have deadlines approaching within the specified number of days. ' +
      'Used for Teacher Dashboard "Proximas Fechas Limite" section.',
  })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 7 })
  @ApiResponse({
    status: 200,
    description: 'Upcoming assignments retrieved successfully',
    type: [UpcomingAssignmentResponseDto],
  })
  async getUpcomingAssignments(
    @Request() req: AuthRequest,
    @Query('days') days?: number,
  ): Promise<UpcomingAssignmentResponseDto[]> {
    const teacherId = req.user!.id;
    return this.assignmentsService.getUpcomingAssignments(
      teacherId,
      days ? parseInt(days as any) : 7,
    );
  }

  // ============================================================================
  // GET ASSIGNMENT BY ID
  // ============================================================================

  /**
   * Get assignment by ID
   *
   * @route GET /api/v1/teacher/assignments/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get assignment by ID',
    description: 'Returns detailed information about a specific assignment.',
  })
  @ApiParam({
    name: 'id',
    description: 'Assignment UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment retrieved successfully',
    type: AssignmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Teacher does not own this assignment' })
  async getAssignmentById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthRequest,
  ): Promise<AssignmentResponseDto> {
    const teacherId = req.user!.id;
    return this.assignmentsService.getAssignmentById(id, teacherId);
  }

  // ============================================================================
  // CREATE ASSIGNMENT
  // ============================================================================

  /**
   * Create a new assignment
   *
   * @route POST /api/v1/teacher/assignments
   */
  @Post()
  @ApiOperation({
    summary: 'Create new assignment',
    description:
      'Creates a new assignment with the provided data. ' +
      'Automatically assigns the authenticated teacher as owner.',
  })
  @ApiResponse({
    status: 201,
    description: 'Assignment created successfully',
    type: AssignmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  async createAssignment(
    @Body() dto: CreateAssignmentDto,
    @Request() req: AuthRequest,
  ): Promise<AssignmentResponseDto> {
    const teacherId = req.user!.id;
    return this.assignmentsService.createAssignment(teacherId, dto);
  }

  // ============================================================================
  // UPDATE ASSIGNMENT
  // ============================================================================

  /**
   * Update an existing assignment
   *
   * @route PUT /api/v1/teacher/assignments/:id
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update assignment',
    description: 'Updates an existing assignment. Only the owner teacher can update it.',
  })
  @ApiParam({
    name: 'id',
    description: 'Assignment UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment updated successfully',
    type: AssignmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Teacher does not own this assignment' })
  async updateAssignment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAssignmentDto,
    @Request() req: AuthRequest,
  ): Promise<AssignmentResponseDto> {
    const teacherId = req.user!.id;
    return this.assignmentsService.updateAssignment(id, teacherId, dto);
  }

  // ============================================================================
  // DELETE ASSIGNMENT
  // ============================================================================

  /**
   * Delete an assignment
   *
   * @route DELETE /api/v1/teacher/assignments/:id
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete assignment',
    description: 'Deletes an assignment and all related data. Only the owner teacher can delete it.',
  })
  @ApiParam({
    name: 'id',
    description: 'Assignment UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Assignment "Week 5 Quiz" has been deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Teacher does not own this assignment' })
  async deleteAssignment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthRequest,
  ): Promise<{ success: boolean; message: string }> {
    const teacherId = req.user!.id;
    return this.assignmentsService.deleteAssignment(id, teacherId);
  }

  // ============================================================================
  // GET SUBMISSIONS FOR ASSIGNMENT
  // ============================================================================

  /**
   * Get submissions for a specific assignment
   *
   * @route GET /api/v1/teacher/assignments/:id/submissions
   */
  @Get(':id/submissions')
  @ApiOperation({
    summary: 'Get submissions for assignment',
    description:
      'Returns all submissions for a specific assignment. ' +
      'Includes student information and grading status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Assignment UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Submissions retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Teacher does not own this assignment' })
  async getAssignmentSubmissions(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthRequest,
  ) {
    const teacherId = req.user!.id;
    return this.assignmentsService.getAssignmentSubmissions(id, teacherId);
  }

  // ============================================================================
  // SEND REMINDER
  // ============================================================================

  /**
   * Send reminder to students who haven't submitted
   *
   * @route POST /api/v1/teacher/assignments/:id/send-reminder
   */
  @Post(':id/send-reminder')
  @ApiOperation({
    summary: 'Send reminder to students',
    description:
      'Sends a reminder notification to students who have not yet submitted ' +
      'their work for the specified assignment.',
  })
  @ApiParam({
    name: 'id',
    description: 'Assignment UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Reminder sent successfully',
    schema: {
      example: {
        notified: 15,
        alreadySubmitted: 10,
        message: 'Reminder sent to 15 students',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Teacher does not own this assignment' })
  async sendReminder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthRequest,
  ): Promise<{ notified: number; alreadySubmitted: number; message: string }> {
    const teacherId = req.user!.id;
    return this.assignmentsService.sendReminder(id, teacherId);
  }
}
