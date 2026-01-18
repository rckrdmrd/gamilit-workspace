import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
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
import { StudentBlockingService } from '../services/student-blocking.service';
import { TeacherClassroomsCrudService } from '../services/teacher-classrooms-crud.service';
import {
  BlockStudentDto,
  UpdatePermissionsDto,
  StudentPermissionsResponseDto,
} from '../dto/student-blocking';
import { AuthRequest } from '@shared/types';
import {
  CreateTeacherClassroomDto,
  UpdateTeacherClassroomDto,
  GetClassroomsQueryDto,
  GetClassroomStudentsQueryDto,
  TeacherClassroomResponseDto,
  TeacherClassroomDetailResponseDto,
  ClassroomStatsDto,
  TeacherInClassroomDto,
  PaginatedTeacherClassroomsResponseDto,
  PaginatedStudentsResponseDto,
} from '../dto';

/**
 * TeacherClassroomsController
 *
 * @description Controller para gestión completa de classrooms por profesores
 * @tags Teacher - Classrooms
 *
 * Endpoints CRUD:
 * - GET / - Listar classrooms del teacher
 * - GET /:id - Obtener classroom por ID
 * - POST / - Crear nuevo classroom
 * - PUT /:id - Actualizar classroom
 * - DELETE /:id - Eliminar classroom
 * - GET /:id/students - Listar estudiantes del classroom
 * - GET /:id/stats - Estadísticas del classroom
 * - GET /:classroomId/teachers - Listar teachers del classroom
 *
 * Endpoints de Student Management:
 * - POST /:classroomId/students/:studentId/block - Bloquear estudiante
 * - POST /:classroomId/students/:studentId/unblock - Desbloquear estudiante
 * - GET /:classroomId/students/:studentId/permissions - Ver permisos
 * - PATCH /:classroomId/students/:studentId/permissions - Actualizar permisos
 *
 * Guards:
 * - JwtAuthGuard: Usuario debe estar autenticado
 * - TeacherGuard: Usuario debe ser profesor
 * - ClassroomOwnershipGuard: Profesor debe tener acceso al aula (para rutas específicas)
 */
@ApiTags('Teacher - Classrooms')
@Controller('teacher/classrooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
@ApiBearerAuth()
export class TeacherClassroomsController {
  constructor(
    private readonly studentBlockingService: StudentBlockingService,
    private readonly classroomsCrudService: TeacherClassroomsCrudService,
  ) {}

  // ============================================================================
  // CLASSROOM CRUD ENDPOINTS
  // ============================================================================

  /**
   * Lista todos los classrooms del teacher autenticado
   *
   * @route GET /api/v1/teacher/classrooms
   * @param query Parámetros de búsqueda y filtrado
   * @param req Request con datos del usuario autenticado
   * @returns Lista paginada de classrooms
   */
  @Get()
  @ApiOperation({
    summary: 'Get all classrooms for authenticated teacher',
    description:
      'Returns a paginated list of classrooms where the authenticated user is assigned as teacher or owner. Supports filtering by status, grade level, subject, and search.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'archived', 'all'] })
  @ApiQuery({ name: 'grade_level', required: false, type: String })
  @ApiQuery({ name: 'subject', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Classrooms retrieved successfully',
    type: PaginatedTeacherClassroomsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a teacher',
  })
  async getClassrooms(
    @Query() query: GetClassroomsQueryDto,
      @Request() req: AuthRequest,
  ): Promise<PaginatedTeacherClassroomsResponseDto> {
    const teacherId = req.user!.id;
    return this.classroomsCrudService.getClassrooms(teacherId, query);
  }

  /**
   * Crea un nuevo classroom
   *
   * @route POST /api/v1/teacher/classrooms
   * @param dto Datos del classroom a crear
   * @param req Request con datos del usuario autenticado
   * @returns Classroom creado
   */
  @Post()
  @ApiOperation({
    summary: 'Create new classroom',
    description:
      'Creates a new classroom with the authenticated teacher as owner. Automatically assigns tenant_id from teacher profile.',
  })
  @ApiResponse({
    status: 201,
    description: 'Classroom created successfully',
    type: TeacherClassroomResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or missing tenant_id',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Classroom code already exists',
  })
  async createClassroom(
    @Body() dto: CreateTeacherClassroomDto,
      @Request() req: AuthRequest,
  ): Promise<TeacherClassroomResponseDto> {
    const teacherId = req.user!.id;
    return this.classroomsCrudService.createClassroom(teacherId, dto);
  }

  /**
   * Obtiene un classroom específico por ID
   *
   * @route GET /api/v1/teacher/classrooms/:id
   * @param id ID del classroom
   * @param req Request con datos del usuario autenticado
   * @returns Classroom con información detallada
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get classroom by ID',
    description:
      'Returns detailed information about a specific classroom. Teacher must have access to the classroom.',
  })
  @ApiParam({
    name: 'id',
    description: 'Classroom UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Classroom retrieved successfully',
    type: TeacherClassroomDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher does not have access to this classroom',
  })
  async getClassroomById(
    @Param('id', new ParseUUIDPipe()) id: string,
      @Request() req: AuthRequest,
  ): Promise<TeacherClassroomDetailResponseDto> {
    const teacherId = req.user!.id;
    return this.classroomsCrudService.getClassroomById(id, teacherId);
  }

  /**
   * Actualiza un classroom existente
   *
   * @route PUT /api/v1/teacher/classrooms/:id
   * @param id ID del classroom
   * @param dto Datos a actualizar
   * @param req Request con datos del usuario autenticado
   * @returns Classroom actualizado
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update classroom',
    description:
      'Updates an existing classroom. Only teachers with access to the classroom can update it.',
  })
  @ApiParam({
    name: 'id',
    description: 'Classroom UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Classroom updated successfully',
    type: TeacherClassroomResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher does not have access to this classroom',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Classroom code already exists',
  })
  async updateClassroom(
    @Param('id', new ParseUUIDPipe()) id: string,
      @Body() dto: UpdateTeacherClassroomDto,
      @Request() req: AuthRequest,
  ): Promise<TeacherClassroomResponseDto> {
    const teacherId = req.user!.id;
    return this.classroomsCrudService.updateClassroom(id, teacherId, dto);
  }

  /**
   * Elimina (soft delete) un classroom
   *
   * @route DELETE /api/v1/teacher/classrooms/:id
   * @param id ID del classroom
   * @param req Request con datos del usuario autenticado
   * @returns Resultado de la operación
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete classroom',
    description:
      'Soft deletes a classroom by marking it as archived and inactive. Only the classroom owner can delete it. Cannot delete classrooms with active students.',
  })
  @ApiParam({
    name: 'id',
    description: 'Classroom UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Classroom deleted (archived) successfully',
    schema: {
      example: {
        success: true,
        message: 'Classroom "Matemáticas 5A" has been archived successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only the classroom owner can delete it',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot delete classroom with active students',
  })
  async deleteClassroom(
    @Param('id', new ParseUUIDPipe()) id: string,
      @Request() req: AuthRequest,
  ): Promise<{ success: boolean; message: string }> {
    const teacherId = req.user!.id;
    return this.classroomsCrudService.deleteClassroom(id, teacherId);
  }

  /**
   * Obtiene estudiantes de un classroom
   *
   * @route GET /api/v1/teacher/classrooms/:id/students
   * @param id ID del classroom
   * @param query Parámetros de búsqueda y ordenamiento
   * @param req Request con datos del usuario autenticado
   * @returns Lista paginada de estudiantes
   */
  @Get(':id/students')
  @ApiOperation({
    summary: 'Get students in classroom',
    description:
      'Returns a paginated list of students enrolled in the classroom with progress data. Supports filtering by status, search, and sorting.',
  })
  @ApiParam({
    name: 'id',
    description: 'Classroom UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'withdrawn', 'completed', 'all'],
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    enum: ['name', 'progress', 'score', 'last_activity'],
  })
  @ApiQuery({ name: 'sort_order', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'Students retrieved successfully',
    type: PaginatedStudentsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher does not have access to this classroom',
  })
  async getClassroomStudents(
    @Param('id', new ParseUUIDPipe()) id: string,
      @Query() query: GetClassroomStudentsQueryDto,
      @Request() req: AuthRequest,
  ): Promise<PaginatedStudentsResponseDto> {
    const teacherId = req.user!.id;
    return this.classroomsCrudService.getClassroomStudents(id, teacherId, query);
  }

  /**
   * Obtiene estadísticas de un classroom
   *
   * @route GET /api/v1/teacher/classrooms/:id/stats
   * @param id ID del classroom
   * @param req Request con datos del usuario autenticado
   * @returns Estadísticas del classroom
   */
  @Get(':id/stats')
  @ApiOperation({
    summary: 'Get classroom statistics',
    description:
      'Returns aggregated statistics for the classroom including student counts, average progress, completion rates, and engagement metrics.',
  })
  @ApiParam({
    name: 'id',
    description: 'Classroom UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: ClassroomStatsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher does not have access to this classroom',
  })
  async getClassroomStats(
    @Param('id', new ParseUUIDPipe()) id: string,
      @Request() req: AuthRequest,
  ): Promise<ClassroomStatsDto> {
    const teacherId = req.user!.id;
    return this.classroomsCrudService.getClassroomStats(id, teacherId);
  }

  /**
   * Obtiene teachers asignados a un classroom
   *
   * @route GET /api/v1/teacher/classrooms/:classroomId/teachers
   * @param classroomId ID del classroom
   * @param req Request con datos del usuario autenticado
   * @returns Lista de teachers en el classroom
   */
  @Get(':classroomId/teachers')
  @ApiOperation({
    summary: 'Get teachers in classroom',
    description:
      'Returns a list of all teachers assigned to the classroom including their roles (owner, teacher, assistant).',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Teachers retrieved successfully',
    type: [TeacherInClassroomDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher does not have access to this classroom',
  })
  async getClassroomTeachers(
    @Param('classroomId', new ParseUUIDPipe()) classroomId: string,
      @Request() req: AuthRequest,
  ): Promise<TeacherInClassroomDto[]> {
    const teacherId = req.user!.id;
    return this.classroomsCrudService.getClassroomTeachers(classroomId, teacherId);
  }

  /**
   * Obtiene el progreso completo de un classroom
   *
   * @route GET /api/v1/teacher/classrooms/:id/progress
   * @param id ID del classroom
   * @param req Request con datos del usuario autenticado
   * @returns Progreso del classroom con datos generales y progreso por módulo
   */
  @Get(':id/progress')
  @ApiOperation({
    summary: 'Get classroom progress',
    description:
      'Returns comprehensive progress data for a classroom including general statistics and module-specific progress. Shows completion rates, average scores, active students, and detailed module progress.',
  })
  @ApiParam({
    name: 'id',
    description: 'Classroom UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Classroom progress retrieved successfully',
    type: 'ClassroomProgressResponseDto',
    schema: {
      example: {
        classroomData: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Matemáticas 5A',
          student_count: 25,
          active_students: 22,
          average_completion: 75.5,
          average_score: 85.3,
          total_exercises: 50,
          completed_exercises: 40,
        },
        moduleProgress: [
          {
            module_id: '456e7890-a12b-34c5-d678-901234567890',
            module_name: 'Módulo 1: Marie Curie - Primera Exploración',
            completion_percentage: 68.5,
            average_score: 82.7,
            students_completed: 18,
            students_total: 25,
            average_time_minutes: 120.5,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Classroom not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher does not have access to this classroom',
  })
  async getClassroomProgress(
    @Param('id', new ParseUUIDPipe()) id: string,
      @Request() req: AuthRequest,
  ): Promise<any> {
    const teacherId = req.user!.id;
    return this.classroomsCrudService.getClassroomProgress(id, teacherId);
  }

  // ============================================================================
  // STUDENT MANAGEMENT ENDPOINTS (Existing)
  // ============================================================================

  /**
   * Bloquea un estudiante en un aula
   *
   * @route POST /api/teacher/classrooms/:classroomId/students/:studentId/block
   * @param classroomId ID del aula
   * @param studentId ID del estudiante
   * @param dto Datos del bloqueo (reason, block_type, blocked_modules)
   * @returns Permisos y estado del estudiante
   */
  @Post(':classroomId/students/:studentId/block')
  @ApiOperation({
    summary: 'Block student in classroom',
    description:
      'Blocks a student in the classroom. Supports full block (no access) or partial block (restricted modules).',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom UUID',
    example: '770e8400-e29b-41d4-a716-446655440020',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  @ApiResponse({
    status: 201,
    description: 'Student blocked successfully',
    type: StudentPermissionsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found in classroom',
  })
  @ApiResponse({
    status: 403,
    description: 'Teacher does not have access to this classroom',
  })
  @ApiResponse({
    status: 400,
    description: 'Student is already blocked or invalid block type',
  })
  async blockStudent(
    @Param('classroomId', new ParseUUIDPipe()) classroomId: string,
      @Param('studentId', new ParseUUIDPipe()) studentId: string,
      @Body() dto: BlockStudentDto,
      @Request() req: AuthRequest,
  ): Promise<StudentPermissionsResponseDto> {
    const teacherId = req.user!.id;
    return this.studentBlockingService.blockStudent(
      classroomId,
      studentId,
      teacherId,
      dto,
    );
  }

  /**
   * Desbloquea un estudiante en un aula
   *
   * @route POST /api/teacher/classrooms/:classroomId/students/:studentId/unblock
   * @param classroomId ID del aula
   * @param studentId ID del estudiante
   * @returns Permisos y estado del estudiante
   */
  @Post(':classroomId/students/:studentId/unblock')
  @ApiOperation({
    summary: 'Unblock student in classroom',
    description:
      'Removes all blocks and restrictions from a student, restoring full access to the classroom.',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom UUID',
    example: '770e8400-e29b-41d4-a716-446655440020',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  @ApiResponse({
    status: 201,
    description: 'Student unblocked successfully',
    type: StudentPermissionsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found in classroom',
  })
  @ApiResponse({
    status: 403,
    description: 'Teacher does not have access to this classroom',
  })
  @ApiResponse({
    status: 400,
    description: 'Student is not blocked',
  })
  async unblockStudent(
    @Param('classroomId', new ParseUUIDPipe()) classroomId: string,
      @Param('studentId', new ParseUUIDPipe()) studentId: string,
      @Request() req: AuthRequest,
  ): Promise<StudentPermissionsResponseDto> {
    const teacherId = req.user!.id;
    return this.studentBlockingService.unblockStudent(
      classroomId,
      studentId,
      teacherId,
    );
  }

  /**
   * Obtiene los permisos actuales de un estudiante
   *
   * @route GET /api/teacher/classrooms/:classroomId/students/:studentId/permissions
   * @param classroomId ID del aula
   * @param studentId ID del estudiante
   * @returns Permisos y estado actual del estudiante
   */
  @Get(':classroomId/students/:studentId/permissions')
  @ApiOperation({
    summary: 'Get student permissions',
    description:
      'Retrieves current permissions and block status for a student in the classroom.',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom UUID',
    example: '770e8400-e29b-41d4-a716-446655440020',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  @ApiResponse({
    status: 200,
    description: 'Student permissions retrieved',
    type: StudentPermissionsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found in classroom',
  })
  @ApiResponse({
    status: 403,
    description: 'Teacher does not have access to this classroom',
  })
  async getStudentPermissions(
    @Param('classroomId', new ParseUUIDPipe()) classroomId: string,
      @Param('studentId', new ParseUUIDPipe()) studentId: string,
      @Request() req: AuthRequest,
  ): Promise<StudentPermissionsResponseDto> {
    const teacherId = req.user!.id;
    return this.studentBlockingService.getStudentPermissions(
      classroomId,
      studentId,
      teacherId,
    );
  }

  /**
   * Actualiza permisos granulares de un estudiante
   *
   * @route PATCH /api/teacher/classrooms/:classroomId/students/:studentId/permissions
   * @param classroomId ID del aula
   * @param studentId ID del estudiante
   * @param dto Permisos a actualizar
   * @returns Permisos y estado actualizado del estudiante
   */
  @Patch(':classroomId/students/:studentId/permissions')
  @ApiOperation({
    summary: 'Update student permissions',
    description:
      'Updates granular permissions for a student (allowed_modules, allowed_features, flags). Performs a merge with existing permissions.',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom UUID',
    example: '770e8400-e29b-41d4-a716-446655440020',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions updated successfully',
    type: StudentPermissionsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found in classroom',
  })
  @ApiResponse({
    status: 403,
    description: 'Teacher does not have access to this classroom',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid permissions or conflicts detected',
  })
  async updateStudentPermissions(
    @Param('classroomId', new ParseUUIDPipe()) classroomId: string,
      @Param('studentId', new ParseUUIDPipe()) studentId: string,
      @Body() dto: UpdatePermissionsDto,
      @Request() req: AuthRequest,
  ): Promise<StudentPermissionsResponseDto> {
    const teacherId = req.user!.id;
    return this.studentBlockingService.updateStudentPermissions(
      classroomId,
      studentId,
      teacherId,
      dto,
    );
  }
}
