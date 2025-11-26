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
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GamilityRoleEnum } from '@/shared/constants';
import { AssignmentsService } from '../services/assignments.service';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';
import { UpdateAssignmentDto } from '../dto/update-assignment.dto';
import { AssignToClassroomsDto } from '../dto/assign-to-classrooms.dto';
import { GradeSubmissionDto } from '../dto/grade-submission.dto';
import { PatchAssignmentDto } from '../dto/patch-assignment.dto';
import { DistributeAssignmentDto, DistributeAssignmentResponseDto } from '../dto/distribute-assignment.dto';
import { DuplicateAssignmentDto, DuplicateAssignmentResponseDto } from '../dto/duplicate-assignment.dto';

@Controller('teacher/assignments')
@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  /**
   * POST /api/teacher/assignments
   * Create new assignment
   */
  @Post()
  @ApiOperation({
    summary: 'Create new assignment',
    description: 'Crea una nueva asignación para el profesor. La asignación inicia como borrador (isPublished=false).'
  })
  @ApiBody({ type: CreateAssignmentDto })
  @ApiResponse({
    status: 201,
    description: 'Asignación creada exitosamente',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        teacherId: '660e8400-e29b-41d4-a716-446655440001',
        title: 'Tarea de Matemáticas',
        description: 'Resolver ejercicios del capítulo 5',
        assignmentType: 'homework',
        totalPoints: 100,
        dueDate: '2025-01-20T23:59:59Z',
        isPublished: false,
        createdAt: '2025-01-10T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createDto: CreateAssignmentDto, @Request() req: any) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.create(createDto, teacherId);
  }

  /**
   * GET /api/teacher/assignments
   * Get all assignments for teacher
   */
  @Get()
  @ApiOperation({
    summary: 'Get all assignments for teacher',
    description: 'Obtiene todas las asignaciones creadas por el profesor con filtros opcionales de publicación, tipo y búsqueda'
  })
  @ApiQuery({
    name: 'isPublished',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado de publicación',
    example: true
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['quiz', 'homework', 'project', 'exam'],
    description: 'Filtrar por tipo de asignación'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Buscar por título o descripción'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de asignaciones obtenida exitosamente',
    schema: {
      example: [{
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Tarea de Matemáticas',
        assignmentType: 'homework',
        isPublished: true,
        dueDate: '2025-01-20',
        totalPoints: 100
      }]
    }
  })
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
  @ApiOperation({
    summary: 'Get single assignment details',
    description: 'Obtiene los detalles completos de una asignación específica. Requiere ser el creador de la asignación.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignación en formato UUID',
    type: String,
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación obtenida exitosamente',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        teacherId: '660e8400-e29b-41d4-a716-446655440001',
        title: 'Tarea de Matemáticas - Semana 3',
        description: 'Resolver ejercicios del capítulo 5',
        assignmentType: 'homework',
        totalPoints: 100,
        dueDate: '2025-01-20T23:59:59Z',
        isPublished: true,
        createdAt: '2025-01-10T10:00:00Z',
        classrooms: [{ classroomId: '770e8400-...', name: '5to A' }],
        exercises: [{ exerciseId: '880e8400-...', title: 'Ejercicio 1' }]
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación no encontrada o acceso denegado'
  })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.findOne(id, teacherId);
  }

  /**
   * PUT /api/teacher/assignments/:id
   * Update assignment (only if no submissions)
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update assignment',
    description: 'Actualiza una asignación completa. Solo permitido si no tiene entregas. Para actualizaciones parciales con entregas, usar PATCH.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignación',
    type: String
  })
  @ApiBody({ type: UpdateAssignmentDto })
  @ApiResponse({
    status: 200,
    description: 'Asignación actualizada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación no encontrada o acceso denegado'
  })
  @ApiResponse({
    status: 422,
    description: 'No se puede actualizar porque ya tiene entregas'
  })
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
  @ApiOperation({
    summary: 'Delete assignment',
    description: 'Elimina (soft delete) una asignación. Solo el creador puede eliminarla.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignación',
    type: String
  })
  @ApiResponse({
    status: 204,
    description: 'Asignación eliminada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación no encontrada o acceso denegado'
  })
  async remove(@Param('id') id: string, @Request() req: any) {
    const teacherId = req.user?.userId || req.user?.sub;
    await this.assignmentsService.remove(id, teacherId);
  }

  /**
   * POST /api/teacher/assignments/:id/assign
   * Assign assignment to classrooms
   */
  @Post(':id/assign')
  @ApiOperation({
    summary: 'Assign assignment to classrooms',
    description: 'Asigna la asignación a uno o más aulas. Los estudiantes del aula podrán ver y completar la asignación.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignación',
    type: String
  })
  @ApiBody({ type: AssignToClassroomsDto })
  @ApiResponse({
    status: 200,
    description: 'Asignación distribuida a aulas exitosamente',
    schema: {
      example: {
        assignmentId: '550e8400-...',
        classroomsAssigned: ['770e8400-...', '880e8400-...'],
        studentsReached: 45
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación no encontrada o acceso denegado'
  })
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
  @ApiOperation({
    summary: 'Get all submissions for assignment',
    description: 'Obtiene todas las entregas de una asignación con filtros opcionales por estado y aula'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignación',
    type: String
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'submitted', 'graded'],
    description: 'Filtrar por estado de entrega'
  })
  @ApiQuery({
    name: 'classroomId',
    required: false,
    type: String,
    description: 'Filtrar por aula específica'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de entregas obtenida exitosamente',
    schema: {
      example: [{
        id: '990e8400-...',
        studentId: 'aa0e8400-...',
        studentName: 'Juan Pérez',
        status: 'submitted',
        submittedAt: '2025-01-15T14:30:00Z',
        score: null,
        feedback: null
      }]
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación no encontrada o acceso denegado'
  })
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
  @ApiOperation({
    summary: 'Grade a submission',
    description: 'Califica una entrega de estudiante asignando puntaje y retroalimentación'
  })
  @ApiParam({
    name: 'assignmentId',
    description: 'ID de la asignación',
    type: String
  })
  @ApiParam({
    name: 'submissionId',
    description: 'ID de la entrega',
    type: String
  })
  @ApiBody({ type: GradeSubmissionDto })
  @ApiResponse({
    status: 200,
    description: 'Entrega calificada exitosamente',
    schema: {
      example: {
        id: '990e8400-...',
        score: 85,
        feedback: 'Buen trabajo, pero revisa el ejercicio 3',
        gradedAt: '2025-01-16T10:00:00Z',
        status: 'graded'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Entrega no encontrada o acceso denegado'
  })
  @ApiResponse({
    status: 400,
    description: 'Puntaje inválido (debe estar entre 0 y totalPoints)'
  })
  async gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
    @Request() req: any,
  ) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.gradeSubmission(submissionId, dto, teacherId);
  }

  /**
   * PATCH /api/teacher/assignments/:id
   * Partial update assignment (allowed even with submissions, but blocks critical fields)
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Partial update assignment',
    description: `
      Update assignment fields partially.
      If submissions exist, cannot change: assignmentType, totalPoints, dueDate.
      Allowed changes with submissions: title, description, isPublished, instructions.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Assignment not found or access denied',
  })
  @ApiResponse({
    status: 422,
    description: 'Cannot change critical fields when submissions exist',
  })
  async patch(
    @Param('id') id: string,
    @Body() patchDto: PatchAssignmentDto,
    @Request() req: any,
  ) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.patchAssignment(id, patchDto, teacherId);
  }

  /**
   * POST /api/teacher/assignments/:id/distribute
   * Distribute assignment to classrooms and/or students
   */
  @Post(':id/distribute')
  @ApiOperation({
    summary: 'Distribute assignment to classrooms/students',
    description: `
      Distribute assignment to multiple classrooms and/or individual students.
      Supports deadline overrides per classroom, auto-publish, and notifications.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment distributed successfully',
    type: DistributeAssignmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Assignment not found or access denied',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid deadline override (must be in future)',
  })
  async distribute(
    @Param('id') id: string,
    @Body() distributeDto: DistributeAssignmentDto,
    @Request() req: any,
  ) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.distributeAssignment(id, distributeDto, teacherId);
  }

  /**
   * POST /api/teacher/assignments/:id/duplicate
   * Duplicate assignment with optional modifications
   */
  @Post(':id/duplicate')
  @ApiOperation({
    summary: 'Duplicate assignment',
    description: `
      Create a copy of an existing assignment with optional modifications.
      Can optionally copy classroom assignments and exercises.
      Duplicate always starts as unpublished draft.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment duplicated successfully',
    type: DuplicateAssignmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Assignment not found or access denied',
  })
  async duplicate(
    @Param('id') id: string,
    @Body() duplicateDto: DuplicateAssignmentDto,
    @Request() req: any,
  ) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.duplicateAssignment(id, duplicateDto, teacherId);
  }

  /**
   * POST /api/teacher/assignments/:id/publish
   * Publish an assignment (change from draft to published)
   */
  @Post(':id/publish')
  @ApiOperation({
    summary: 'Publish assignment',
    description: `
      Publish an assignment to make it visible to students.
      Changes status from draft (isPublished=false) to published (isPublished=true).
      Optionally sends notifications to students in assigned classrooms.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the assignment to publish',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notifyStudents: {
          type: 'boolean',
          description: 'Send notifications to students in assigned classrooms',
          default: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment published successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Tarea de Matemáticas',
        isPublished: true,
        publishedAt: '2025-01-10T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Assignment not found or access denied',
  })
  async publish(
    @Param('id') id: string,
    @Body('notifyStudents') notifyStudents: boolean = false,
    @Request() req: any,
  ) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.publishAssignment(id, teacherId, notifyStudents);
  }

  /**
   * POST /api/teacher/assignments/:id/close
   * Close an assignment (prevent new submissions)
   */
  @Post(':id/close')
  @ApiOperation({
    summary: 'Close assignment',
    description: `
      Close an assignment to prevent new submissions.
      Sets isPublished to false to effectively close the assignment.
      Students can no longer submit work after closure.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the assignment to close',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment closed successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Tarea de Matemáticas',
        isPublished: false,
        closedAt: '2025-01-20T23:59:59Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Assignment not found or access denied',
  })
  async close(@Param('id') id: string, @Request() req: any) {
    const teacherId = req.user?.userId || req.user?.sub;
    return this.assignmentsService.closeAssignment(id, teacherId);
  }
}
