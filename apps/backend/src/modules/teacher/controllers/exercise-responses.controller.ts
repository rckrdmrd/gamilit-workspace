/**
 * Exercise Responses Controller
 *
 * @description Handles HTTP endpoints for viewing student exercise attempts
 * @module teacher/controllers/exercise-responses
 */

import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
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
import { ExerciseResponsesService } from '../services/exercise-responses.service';
import {
  GetAttemptsQueryDto,
  AttemptResponseDto,
  AttemptDetailDto,
  AttemptsListResponseDto,
} from '../dto/exercise-responses.dto';

/**
 * Controller for Teacher Exercise Responses
 *
 * @description
 * Provides endpoints for teachers to view student exercise attempts.
 * All endpoints require teacher authentication and validate RLS.
 *
 * Endpoints:
 * - GET /teacher/attempts - Get paginated list of attempts with filters
 * - GET /teacher/attempts/:id - Get detailed attempt by ID
 * - GET /teacher/attempts/student/:studentId - Get all attempts by student
 * - GET /teacher/exercises/:exerciseId/responses - Get all responses for exercise
 */
@ApiTags('Teacher - Exercise Responses')
@ApiBearerAuth()
@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
export class ExerciseResponsesController {
  constructor(
    private readonly exerciseResponsesService: ExerciseResponsesService,
  ) {}

  /**
   * Get paginated list of exercise attempts with filters
   *
   * @description
   * Retrieves exercise attempts with optional filters for student, exercise, module,
   * classroom, date range, and correctness. Supports pagination and sorting.
   * Only returns attempts from students in teacher's classrooms (RLS enforced).
   */
  @Get('attempts')
  @ApiOperation({
    summary: 'Get filtered exercise attempts',
    description:
      'Retrieve paginated list of student exercise attempts with optional filters. ' +
      'Teachers can only view attempts from students in their classrooms. ' +
      'Supports filtering by student, exercise, module, classroom, date range, and correctness.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of attempts retrieved successfully',
    type: AttemptsListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a teacher',
  })
  async getAttempts(
    @Query() query: GetAttemptsQueryDto,
    @Request() req: any,
  ): Promise<AttemptsListResponseDto> {
    const userId = req.user.id;

    return this.exerciseResponsesService.getAttempts(userId, query);
  }

  /**
   * Get detailed information for a specific attempt
   *
   * @description
   * Retrieves detailed information about a specific exercise attempt,
   * including submitted answers, correct answers, and exercise details.
   * Validates that the teacher has access to the student who made the attempt.
   */
  @Get('attempts/:id')
  @ApiOperation({
    summary: 'Get attempt detail by ID',
    description:
      'Retrieve detailed information about a specific exercise attempt, ' +
      'including submitted answers, correct answers from the exercise, ' +
      'exercise type, and maximum score. Validates teacher access.',
  })
  @ApiParam({
    name: 'id',
    description: 'Attempt ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Attempt detail retrieved successfully',
    type: AttemptDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Attempt not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher does not have access to this attempt',
  })
  async getAttemptDetail(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<AttemptDetailDto> {
    const userId = req.user.id;

    return this.exerciseResponsesService.getAttemptDetail(userId, id);
  }

  /**
   * Get all attempts by a specific student
   *
   * @description
   * Retrieves all exercise attempts made by a specific student.
   * Validates that the student is in one of the teacher's classrooms.
   */
  @Get('attempts/student/:studentId')
  @ApiOperation({
    summary: 'Get all attempts by student',
    description:
      'Retrieve all exercise attempts made by a specific student. ' +
      'Validates that the student is in one of the teacher\'s classrooms. ' +
      'Returns attempts sorted by submission date (most recent first).',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student profile ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Student attempts retrieved successfully',
    type: [AttemptResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher does not have access to this student',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  async getAttemptsByStudent(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ): Promise<AttemptResponseDto[]> {
    const userId = req.user.id;

    return this.exerciseResponsesService.getAttemptsByStudent(userId, studentId);
  }

  /**
   * Get all responses for a specific exercise
   *
   * @description
   * Retrieves all attempts for a specific exercise from students in teacher's classrooms.
   * Useful for analyzing how students performed on a particular exercise.
   */
  @Get('exercises/:exerciseId/responses')
  @ApiOperation({
    summary: 'Get all responses for an exercise',
    description:
      'Retrieve all student attempts for a specific exercise. ' +
      'Only includes attempts from students in the teacher\'s classrooms. ' +
      'Useful for analyzing exercise performance and identifying common mistakes.',
  })
  @ApiParam({
    name: 'exerciseId',
    description: 'Exercise ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Exercise responses retrieved successfully',
    type: AttemptsListResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Exercise not found',
  })
  async getExerciseResponses(
    @Param('exerciseId') exerciseId: string,
    @Request() req: any,
  ): Promise<AttemptsListResponseDto> {
    const userId = req.user.id;

    return this.exerciseResponsesService.getExerciseResponses(userId, exerciseId);
  }
}
