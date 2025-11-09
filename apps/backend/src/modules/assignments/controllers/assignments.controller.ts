/**
 * Assignments Controller
 *
 * Handles teacher assignment management endpoints
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssignmentsService } from '../services/assignments.service';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';
import { UpdateAssignmentDto } from '../dto/update-assignment.dto';
import { AssignToClassroomsDto } from '../dto/assign-to-classrooms.dto';
import { GradeSubmissionDto } from '../dto/grade-submission.dto';

@Controller('api/teacher/assignments')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('teacher', 'admin_teacher')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  /**
   * POST /api/teacher/assignments
   * Create new assignment
   */
  @Post()
  async create(@Body() createDto: CreateAssignmentDto, @Request() req: any) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.create(createDto, teacherId);
  }

  /**
   * GET /api/teacher/assignments
   * Get all assignments for teacher
   */
  @Get()
  async findAll(@Query() query: any, @Request() req: any) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.findAll(teacherId, {
      isPublished: query.isPublished !== undefined ? query.isPublished === 'true' : undefined,
      assignmentType: query.type,
      search: query.search,
    });
  }

  /**
   * GET /api/teacher/assignments/:id
   * Get single assignment details
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.findOne(id, teacherId);
  }

  /**
   * PUT /api/teacher/assignments/:id
   * Update assignment (only if no submissions)
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAssignmentDto,
    @Request() req: any,
  ) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.update(id, updateDto, teacherId);
  }

  /**
   * DELETE /api/teacher/assignments/:id
   * Soft delete assignment
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: any) {
    const teacherId = req.user?.userId || req.user?.sub;
    await this.assignmentsService.remove(id, teacherId);
  }

  /**
   * POST /api/teacher/assignments/:id/assign
   * Assign assignment to classrooms
   */
  @Post(':id/assign')
  async assignToClassrooms(
    @Param('id') id: string,
    @Body() dto: AssignToClassroomsDto,
    @Request() req: any,
  ) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.assignToClassrooms(id, dto, teacherId);
  }

  /**
   * GET /api/teacher/assignments/:id/submissions
   * Get all submissions for assignment
   */
  @Get(':id/submissions')
  async getSubmissions(
    @Param('id') id: string,
    @Query() query: any,
    @Request() req: any,
  ) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.getSubmissions(id, teacherId, {
      status: query.status,
      classroomId: query.classroomId,
    });
  }

  /**
   * POST /api/teacher/assignments/:id/grade
   * Grade a submission
   */
  @Post(':assignmentId/submissions/:submissionId/grade')
  async gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
    @Request() req: any,
  ) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.gradeSubmission(submissionId, dto, teacherId);
  }
}
