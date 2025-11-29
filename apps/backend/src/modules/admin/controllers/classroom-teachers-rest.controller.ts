import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { ClassroomAssignmentsService } from '../services/classroom-assignments.service';
import {
  AssignTeacherToClassroomRestDto,
  AssignClassroomsToTeacherRestDto,
  ListAllAssignmentsQueryDto,
  BulkAssignRestDto,
  ClassroomWithTeachersDto,
  TeacherWithClassroomsDto,
  RemoveAssignmentDto,
  ClassroomListItemDto,
  TeacherListItemDto,
  ListClassroomsQueryDto,
  ListTeachersQueryDto,
} from '../dto/classroom-assignments';

/**
 * ClassroomTeachersRestController
 *
 * @description REST-compliant endpoints for Classroom-Teacher assignments (US-AE-007)
 * @tags Admin - Classroom Teachers (REST)
 *
 * IMPORTANT:
 * - This controller provides RESTful routes matching frontend expectations
 * - Created to resolve frontend-backend API route mismatch (CRITICAL BLOCKER)
 * - The original classroom-assignments.controller.ts remains for backward compatibility
 * - All business logic is delegated to ClassroomAssignmentsService (100% reuse)
 *
 * Endpoints:
 * 1. GET    /admin/classrooms/:id/teachers          - Get classroom teachers
 * 2. POST   /admin/classrooms/:id/teachers          - Assign teacher to classroom
 * 3. DELETE /admin/classrooms/:id/teachers/:tid     - Remove teacher from classroom
 * 4. GET    /admin/teachers/:id/classrooms          - Get teacher classrooms
 * 5. POST   /admin/teachers/:id/classrooms          - Assign classrooms to teacher
 * 6. GET    /admin/classroom-teachers               - List all assignments
 * 7. POST   /admin/classroom-teachers/bulk          - Bulk assign pairs
 *
 * @see Analysis: orchestration/agentes/architecture-analyst/analisis-portal-admin-mvp-2025-11-24/REPORTE-CRITICO-DISCREPANCIA-API-US-AE-007.md
 * @see Frontend: apps/frontend/src/services/api/admin/classroomTeacherApi.ts
 * @see Original: apps/backend/src/modules/admin/controllers/classroom-assignments.controller.ts
 */
@ApiTags('Admin - Classroom Teachers (REST)')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class ClassroomTeachersRestController {
  constructor(
    private readonly classroomAssignmentsService: ClassroomAssignmentsService,
  ) {}

  // =====================================================
  // ENDPOINT 1: GET CLASSROOM TEACHERS
  // =====================================================

  /**
   * Get all teachers assigned to a classroom
   *
   * @route GET /admin/classrooms/:classroomId/teachers
   * @param classroomId Classroom UUID
   * @returns Classroom info with list of teachers
   */
  @Get('classrooms/:classroomId/teachers')
  @ApiOperation({
    summary: 'Get classroom teachers (REST endpoint)',
    description:
      'Retrieves all teachers assigned to a specific classroom with their details. REST-compliant endpoint matching frontend expectations.',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom UUID',
    example: '770e8400-e29b-41d4-a716-446655440020',
  })
  @ApiResponse({
    status: 200,
    description: 'Teachers retrieved successfully',
    type: ClassroomWithTeachersDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found',
  })
  async getClassroomTeachers(
    @Param('classroomId') classroomId: string,
  ): Promise<ClassroomWithTeachersDto> {
    return this.classroomAssignmentsService.getClassroomWithTeachers(
      classroomId,
    );
  }

  // =====================================================
  // ENDPOINT 2: ASSIGN TEACHER TO CLASSROOM
  // =====================================================

  /**
   * Assign a teacher to a classroom
   *
   * @route POST /admin/classrooms/:classroomId/teachers
   * @param classroomId Classroom UUID
   * @param dto Assignment data (teacherId, notes)
   * @returns Assignment info
   */
  @Post('classrooms/:classroomId/teachers')
  @ApiOperation({
    summary: 'Assign teacher to classroom (REST endpoint)',
    description:
      'Assigns a teacher to a specific classroom. Validates both teacher and classroom exist. REST-compliant endpoint.',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom UUID',
    example: '770e8400-e29b-41d4-a716-446655440020',
  })
  @ApiResponse({
    status: 201,
    description: 'Teacher assigned successfully',
    schema: {
      type: 'object',
      properties: {
        classroom_id: { type: 'string' },
        name: { type: 'string' },
        teacher_id: { type: 'string' },
        role: { type: 'string' },
        student_count: { type: 'number' },
        assigned_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Teacher or classroom not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Teacher already assigned to this classroom',
  })
  async assignTeacherToClassroom(
  @Param('classroomId') classroomId: string,
    @Body() dto: AssignTeacherToClassroomRestDto,
  ) {
    // Reuse existing service method
    return this.classroomAssignmentsService.assignClassroomToTeacher({
      teacherId: dto.teacherId,
      classroomId: classroomId,
      notes: dto.notes,
    });
  }

  // =====================================================
  // ENDPOINT 3: REMOVE TEACHER FROM CLASSROOM
  // =====================================================

  /**
   * Remove a teacher from a classroom
   *
   * @route DELETE /admin/classrooms/:classroomId/teachers/:teacherId
   * @param classroomId Classroom UUID
   * @param teacherId Teacher UUID
   * @param dto Query params (force)
   * @returns Confirmation message
   */
  @Delete('classrooms/:classroomId/teachers/:teacherId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove teacher from classroom (REST endpoint)',
    description:
      'Removes a teacher assignment from a classroom. Validates no active students unless force=true. REST-compliant endpoint.',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom UUID',
    example: '770e8400-e29b-41d4-a716-446655440020',
  })
  @ApiParam({
    name: 'teacherId',
    description: 'Teacher UUID',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  @ApiResponse({
    status: 200,
    description: 'Teacher removed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Classroom has active students (use force=true to override)',
  })
  @ApiResponse({
    status: 404,
    description: 'Assignment not found',
  })
  async removeTeacherFromClassroom(
    @Param('classroomId') classroomId: string,
      @Param('teacherId') teacherId: string,
      @Query() dto: RemoveAssignmentDto,
  ): Promise<{ message: string }> {
    // Reuse existing service method (parameter order is swapped in REST vs original)
    return this.classroomAssignmentsService.removeClassroomAssignment(
      teacherId,
      classroomId,
      dto,
    );
  }

  // =====================================================
  // ENDPOINT 4: GET TEACHER CLASSROOMS
  // =====================================================

  /**
   * Get all classrooms assigned to a teacher
   *
   * @route GET /admin/teachers/:teacherId/classrooms
   * @param teacherId Teacher UUID
   * @returns Teacher info with list of classrooms
   */
  @Get('teachers/:teacherId/classrooms')
  @ApiOperation({
    summary: 'Get teacher classrooms (REST endpoint)',
    description:
      'Retrieves all classrooms assigned to a specific teacher. REST-compliant endpoint matching frontend expectations.',
  })
  @ApiParam({
    name: 'teacherId',
    description: 'Teacher UUID',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  @ApiResponse({
    status: 200,
    description: 'Classrooms retrieved successfully',
    type: TeacherWithClassroomsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Teacher not found',
  })
  async getTeacherClassrooms(
    @Param('teacherId') teacherId: string,
  ): Promise<TeacherWithClassroomsDto> {
    return this.classroomAssignmentsService.getTeacherWithClassrooms(
      teacherId,
    );
  }

  // =====================================================
  // ENDPOINT 5: ASSIGN CLASSROOMS TO TEACHER
  // =====================================================

  /**
   * Assign multiple classrooms to a teacher
   *
   * @route POST /admin/teachers/:teacherId/classrooms
   * @param teacherId Teacher UUID
   * @param dto Assignment data (classroomIds)
   * @returns Assignment results
   */
  @Post('teachers/:teacherId/classrooms')
  @ApiOperation({
    summary: 'Assign classrooms to teacher (REST endpoint)',
    description:
      'Assigns multiple classrooms to a teacher in a single operation. Returns both successful and failed assignments.',
  })
  @ApiParam({
    name: 'teacherId',
    description: 'Teacher UUID',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  @ApiResponse({
    status: 201,
    description: 'Classrooms assigned successfully',
    schema: {
      type: 'object',
      properties: {
        assigned: { type: 'number' },
        classrooms: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Teacher not found',
  })
  async assignClassroomsToTeacher(
    @Param('teacherId') teacherId: string,
      @Body() dto: AssignClassroomsToTeacherRestDto,
  ): Promise<{
        assigned: number;
        classrooms: Array<{ id: string; name: string }>;
      }> {
    // Reuse existing bulk assign method
    const result =
      await this.classroomAssignmentsService.bulkAssignClassrooms({
        teacherId: teacherId,
        classroomIds: dto.classroomIds,
      });

    // Map to expected format
    return {
      assigned: result.successful.length,
      classrooms: result.successful.map((assignment) => ({
        id: assignment.classroom_id,
        name: assignment.name,
      })),
    };
  }

  // =====================================================
  // ENDPOINT 6: LIST ALL ASSIGNMENTS
  // =====================================================

  /**
   * List all classroom-teacher assignments
   *
   * @route GET /admin/classroom-teachers
   * @param query Query params (schoolId, page, limit)
   * @returns Paginated list of assignments
   */
  @Get('classroom-teachers')
  @ApiOperation({
    summary: 'List all classroom-teacher assignments',
    description:
      'Retrieves paginated list of all classroom-teacher assignments with optional filters. Supports filtering by school/tenant.',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              classroom_id: { type: 'string' },
              classroom_name: { type: 'string' },
              teacher_id: { type: 'string' },
              teacher_name: { type: 'string' },
              role: { type: 'string' },
              assigned_at: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async listAllAssignments(
    @Query() query: ListAllAssignmentsQueryDto,
  ): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
      }> {
    return this.classroomAssignmentsService.listAllAssignmentsPaginated({
      schoolId: query.schoolId,
      page: query.page || 1,
      limit: query.limit || 20,
    });
  }

  // =====================================================
  // ENDPOINT 7: BULK ASSIGN
  // =====================================================

  /**
   * Bulk assign multiple teacher-classroom pairs
   *
   * @route POST /admin/classroom-teachers/bulk
   * @param dto Bulk assignment data (assignments array)
   * @returns Assignment results
   */
  @Post('classroom-teachers/bulk')
  @ApiOperation({
    summary: 'Bulk assign teacher-classroom pairs',
    description:
      'Assigns multiple teacher-classroom pairs in a single batch operation. Returns both successful and failed assignments.',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk assignment completed',
    schema: {
      type: 'object',
      properties: {
        assigned: { type: 'number' },
        successful: { type: 'array', items: { type: 'object' } },
        failed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              teacherId: { type: 'string' },
              classroomId: { type: 'string' },
              reason: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async bulkAssign(
    @Body() dto: BulkAssignRestDto,
  ): Promise<{
        assigned: number;
        successful: any[];
        failed: any[];
      }> {
    return this.classroomAssignmentsService.bulkAssignPairs(
      dto.assignments,
    );
  }

  // =====================================================
  // ENDPOINT 8: LIST CLASSROOMS (FOR DROPDOWNS)
  // =====================================================

  /**
   * List all classrooms (simplified for dropdowns/selects)
   *
   * @route GET /admin/classrooms/list
   * @param query Query params (search, limit, schoolId)
   * @returns Simplified list of classrooms
   */
  @Get('classrooms/list')
  @ApiOperation({
    summary: 'List classrooms for dropdowns',
    description:
      'Retrieves a simplified list of all active classrooms. Optimized for dropdown/select components. Supports search and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Classrooms retrieved successfully',
    type: [ClassroomListItemDto],
  })
  async listClassrooms(
    @Query() query: ListClassroomsQueryDto,
  ): Promise<ClassroomListItemDto[]> {
    return this.classroomAssignmentsService.listClassrooms(query);
  }

  // =====================================================
  // ENDPOINT 9: LIST TEACHERS (FOR DROPDOWNS)
  // =====================================================

  /**
   * List all teachers (simplified for dropdowns/selects)
   *
   * @route GET /admin/teachers/list
   * @param query Query params (search, limit, schoolId)
   * @returns Simplified list of teachers
   */
  @Get('teachers/list')
  @ApiOperation({
    summary: 'List teachers for dropdowns',
    description:
      'Retrieves a simplified list of all teachers (admin_teacher + super_admin roles). Optimized for dropdown/select components. Supports search by name/email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Teachers retrieved successfully',
    type: [TeacherListItemDto],
  })
  async listTeachers(
    @Query() query: ListTeachersQueryDto,
  ): Promise<TeacherListItemDto[]> {
    return this.classroomAssignmentsService.listTeachers(query);
  }
}
