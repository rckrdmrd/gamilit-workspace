/**
 * Student Assignments Controller
 *
 * Endpoints para que estudiantes vean sus tareas asignadas y calificaciones.
 * Complementa el TeacherAssignmentsController con vistas de estudiante.
 *
 * @module modules/assignments/controllers/student-assignments
 * @created 2025-11-29 - P1-002 Gap Fix
 */

import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GamilityRoleEnum } from '@/shared/constants';
import { AssignmentsService } from '../services/assignments.service';
import { AuthRequest } from '@shared/types';

@Controller('student/assignments')
@ApiTags('Student Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GamilityRoleEnum.STUDENT, GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
export class StudentAssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  /**
   * GET /api/student/assignments
   * Obtiene todas las tareas asignadas al estudiante actual
   */
  @Get()
  @ApiOperation({
    summary: 'Get my assignments',
    description: 'Obtiene todas las tareas asignadas al estudiante autenticado con filtros opcionales',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['assigned', 'in_progress', 'submitted', 'graded', 'late'],
    description: 'Filtrar por estado de la tarea',
  })
  @ApiQuery({
    name: 'classroomId',
    required: false,
    type: String,
    description: 'Filtrar por aula',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas del estudiante',
    schema: {
      example: [{
        id: '550e8400-e29b-41d4-a716-446655440000',
        assignment: {
          id: '660e8400-e29b-41d4-a716-446655440001',
          title: 'Lectura Comprensiva Cap. 5',
          description: 'Leer y responder preguntas',
          assignmentType: 'homework',
          dueDate: '2025-01-20T23:59:59Z',
          totalPoints: 100,
        },
        status: 'assigned',
        assignedAt: '2025-01-10T10:00:00Z',
        score: null,
        feedback: null,
      }],
    },
  })
  async getMyAssignments(@Query() query: Record<string, string>, @Request() req: AuthRequest) {
    const studentId = req.user!.id;
    return this.assignmentsService.findStudentAssignments(studentId, {
      status: query.status,
      classroomId: query.classroomId,
    });
  }

  /**
   * GET /api/student/assignments/:id
   * Obtiene detalles de una tarea asignada específica
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get assignment details',
    description: 'Obtiene los detalles completos de una tarea asignada al estudiante',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignación al estudiante (assignment_students.id)',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la tarea',
  })
  @ApiResponse({
    status: 404,
    description: 'Tarea no encontrada o no asignada a este estudiante',
  })
  async getAssignmentDetails(@Param('id') id: string, @Request() req: AuthRequest) {
    const studentId = req.user!.id;
    return this.assignmentsService.findStudentAssignmentById(id, studentId);
  }

  /**
   * GET /api/student/assignments/grades
   * Obtiene resumen de calificaciones del estudiante
   */
  @Get('grades/summary')
  @ApiOperation({
    summary: 'Get grades summary',
    description: 'Obtiene un resumen de todas las calificaciones del estudiante',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de calificaciones',
    schema: {
      example: {
        totalAssignments: 10,
        completed: 8,
        pending: 2,
        averageScore: 85.5,
        grades: [{
          assignmentTitle: 'Lectura Cap. 5',
          score: 90,
          maxScore: 100,
          gradedAt: '2025-01-15',
          feedback: 'Excelente trabajo!',
        }],
      },
    },
  })
  async getGradesSummary(@Request() req: AuthRequest) {
    const studentId = req.user!.id;
    return this.assignmentsService.getStudentGradesSummary(studentId);
  }
}
