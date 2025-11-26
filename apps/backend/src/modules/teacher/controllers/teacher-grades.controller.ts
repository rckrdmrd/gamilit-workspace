/**
 * Teacher Grades Controller
 *
 * Handles endpoints for viewing and managing grades.
 * Grades are a view of submissions (grades = submissions with scores).
 *
 * IMPORTANT: This controller acts as an alias/wrapper over submissions.
 * It does NOT create a separate "grades" entity, but rather presents
 * submissions in a "grade" format for the teacher portal.
 */

import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { GamilityRoleEnum } from '@/shared/constants/enums.constants';
import { GradingService } from '../services';
import {
  GradeResponseDto,
  GradeDetailResponseDto,
  GetGradesQueryDto,
} from '../dto';

@ApiTags('Teacher - Grades')
@ApiBearerAuth()
@Controller('teacher/grades')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
export class TeacherGradesController {
  constructor(private readonly gradingService: GradingService) {}

  /**
   * Get all grades (submissions with scores)
   *
   * Lists all graded submissions filtered by assignment, classroom, student, or status.
   * Supports pagination and sorting.
   *
   * @param query - Query parameters for filtering
   * @returns Paginated list of grades
   */
  @Get()
  @ApiOperation({
    summary: 'Get all grades',
    description:
      'Retrieve a list of all grades (submissions with scores) with optional filters. ' +
      'Grades are submissions that have been scored and graded by teachers. ' +
      'Supports filtering by assignment, classroom, student, status, and sorting options.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of grades retrieved successfully',
    type: [GradeResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have teacher role',
  })
  async getGrades(@Query() query: GetGradesQueryDto) {
    // Map GetGradesQueryDto to GetSubmissionsQueryDto
    const submissionsQuery: any = {
      assignment_id: query.assignment_id,
      classroom_id: query.classroom_id,
      student_id: query.student_id,
      status: query.status as any,
      sort_by: query.sort_by,
      page: query.page,
      limit: query.limit,
    };

    // Get submissions (which are grades in this context)
    const result = await this.gradingService.getSubmissions(submissionsQuery);

    // Transform submissions to grade format
    const grades = result.submissions.map((submission: any) =>
      this.mapSubmissionToGrade(submission),
    );

    return {
      grades,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /**
   * Get grade details by ID
   *
   * Retrieves detailed information about a specific grade including
   * full submission data, student info, exercise details, and grading history.
   *
   * @param id - Grade ID (submission ID)
   * @returns Detailed grade information
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get grade details by ID',
    description:
      'Retrieve detailed information about a specific grade including full submission data, ' +
      'student information, exercise details, answer data, and grading history.',
  })
  @ApiParam({
    name: 'id',
    description: 'Grade ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Grade details retrieved successfully',
    type: GradeDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Grade not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have teacher role',
  })
  async getGradeById(@Param('id') id: string): Promise<GradeDetailResponseDto> {
    const submission = await this.gradingService.getSubmissionById(id);

    if (!submission) {
      throw new NotFoundException(`Grade ${id} not found`);
    }

    return this.mapSubmissionToDetailedGrade(submission);
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  /**
   * Maps a submission entity to a GradeResponseDto
   */
  private mapSubmissionToGrade(submission: any): GradeResponseDto {
    return {
      id: submission.id,
      student_id: submission.user_id,
      student_name: submission.profile?.full_name || 'Unknown',
      exercise_id: submission.exercise_id,
      exercise_title: submission.exercise?.title || 'Unknown Exercise',
      assignment_id: submission.assignment_id,
      assignment_title: submission.assignment?.title,
      score: submission.score,
      max_score: submission.max_score,
      feedback: submission.feedback,
      status: submission.status,
      submitted_at: submission.submitted_at,
      graded_at: submission.graded_at,
      graded_by: submission.graded_by,
    };
  }

  /**
   * Maps a submission entity to a detailed GradeDetailResponseDto
   */
  private mapSubmissionToDetailedGrade(
    submission: any,
  ): GradeDetailResponseDto {
    return {
      id: submission.id,
      student_id: submission.user_id,
      student_name: submission.profile?.full_name || 'Unknown',
      student_email: submission.profile?.email || '',
      exercise_id: submission.exercise_id,
      exercise_title: submission.exercise?.title || 'Unknown Exercise',
      exercise_type: submission.exercise?.type || 'unknown',
      assignment_id: submission.assignment_id,
      assignment_title: submission.assignment?.title,
      score: submission.score,
      max_score: submission.max_score,
      feedback: submission.feedback,
      status: submission.status,
      answer_data: submission.answer_data,
      is_correct: submission.is_correct || false,
      time_spent_seconds: submission.time_spent_seconds || 0,
      attempt_number: submission.attempt_number || 1,
      hint_used: submission.hint_used || false,
      hints_count: submission.hints_count || 0,
      comodines_used: submission.comodines_used,
      ml_coins_spent: submission.ml_coins_spent || 0,
      submitted_at: submission.submitted_at,
      graded_at: submission.graded_at,
      graded_by: submission.graded_by,
      created_at: submission.created_at,
      updated_at: submission.updated_at,
    };
  }
}
