import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ManualReviewService } from '../services/manual-review.service';
import { CreateReviewDto, ReturnForRevisionDto } from '../dto/create-review.dto';
import { ManualReview } from '@modules/progress/entities/manual-review.entity';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { GamilityRoleEnum } from '@shared/constants/enums.constants';
import { AuthRequest } from '@shared/types';

/**
 * Controller para gestión de evaluaciones manuales (ManualReview)
 *
 * @description Endpoints para que docentes evalúen ejercicios creativos de módulos 4 y 5
 *
 * Endpoints:
 * - GET /api/v1/teacher/reviews/pending - Obtener reviews pendientes
 * - GET /api/v1/teacher/reviews/my-reviews - Obtener todos los reviews del docente
 * - GET /api/v1/teacher/reviews/:id - Obtener review específico
 * - POST /api/v1/teacher/reviews - Crear review
 * - PUT /api/v1/teacher/reviews/:id - Actualizar review
 * - POST /api/v1/teacher/reviews/:id/start - Iniciar review (marcar como in_progress)
 * - POST /api/v1/teacher/reviews/:id/complete - Completar review
 * - POST /api/v1/teacher/reviews/:id/return - Devolver para revisión
 *
 * NOTA: La ruta base es 'teacher/reviews' porque el prefijo global 'api/v1' se agrega en main.ts
 */
@ApiTags('Teacher - Manual Reviews')
@Controller('teacher/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ManualReviewController {
  constructor(private readonly reviewService: ManualReviewService) {}

  /**
   * Obtiene reviews pendientes para el docente autenticado
   */
  @Get('pending')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({ summary: 'Obtener reviews pendientes del docente' })
  @ApiQuery({
    name: 'moduleId',
    required: false,
    description: 'Filtrar por módulo (UUID)',
  })
  @ApiQuery({
    name: 'classroomId',
    required: false,
    description: 'Filtrar por aula (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reviews pendientes con submissions',
    type: [ManualReview],
  })
  async getPendingReviews(
    @Request() req: AuthRequest,
    @Query('moduleId') moduleId?: string,
    @Query('classroomId') classroomId?: string,
  ): Promise<ManualReview[]> {
    const teacherId = req.user!.profile?.id || req.user!.id;
    return this.reviewService.findPendingReviews(teacherId, { moduleId, classroomId });
  }

  /**
   * Obtiene reviews pendientes filtrados por módulo
   * Usa la vista teacher_pending_reviews para mejor rendimiento
   */
  @Get('pending/module/:moduleOrder')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({ summary: 'Obtener reviews pendientes por módulo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de submissions pendientes del módulo',
  })
  async getPendingByModule(
    @Request() req: AuthRequest,
    @Param('moduleOrder') moduleOrder: string,
  ): Promise<any[]> {
    const teacherId = req.user!.profile?.id || req.user!.id;
    return this.reviewService.findPendingByModule(teacherId, parseInt(moduleOrder, 10));
  }

  /**
   * Obtiene estadísticas de reviews pendientes para el dashboard
   */
  @Get('stats')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({ summary: 'Obtener estadísticas de reviews pendientes' })
  @ApiQuery({
    name: 'classroomId',
    required: false,
    description: 'Filtrar por aula (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de pendientes por prioridad',
  })
  async getPendingStats(
    @Request() req: AuthRequest,
    @Query('classroomId') classroomId?: string,
  ): Promise<{
    totalPending: number;
    urgentCount: number;
    highCount: number;
    mediumCount: number;
    normalCount: number;
  }> {
    const teacherId = req.user!.profile?.id || req.user!.id;
    return this.reviewService.getPendingReviewsStats(teacherId, classroomId);
  }

  /**
   * Obtiene todos los reviews del docente (con filtro opcional por estado)
   */
  @Get('my-reviews')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({ summary: 'Obtener todos los reviews del docente' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'in_progress', 'completed', 'returned'],
    description: 'Filtrar por estado del review',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reviews del docente',
    type: [ManualReview],
  })
  async getMyReviews(
    @Request() req: AuthRequest,
    @Query('status') status?: 'pending' | 'in_progress' | 'completed' | 'returned',
  ): Promise<ManualReview[]> {
    const teacherId = req.user!.profile?.id || req.user!.id;
    return this.reviewService.findByTeacher(teacherId, status);
  }

  /**
   * Obtiene un review específico por ID
   */
  @Get(':id')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({ summary: 'Obtener review por ID' })
  @ApiResponse({
    status: 200,
    description: 'Review encontrado',
    type: ManualReview,
  })
  @ApiResponse({ status: 404, description: 'Review no encontrado' })
  async getReviewById(@Param('id') id: string): Promise<ManualReview> {
    return this.reviewService.findById(id);
  }

  /**
   * Crea un nuevo review
   */
  @Post()
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({ summary: 'Crear nueva evaluación manual' })
  @ApiResponse({
    status: 201,
    description: 'Review creado exitosamente',
    type: ManualReview,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o review duplicado' })
  @ApiResponse({ status: 404, description: 'Submission no encontrado' })
  async createReview(
    @Request() req: AuthRequest,
    @Body() dto: CreateReviewDto,
  ): Promise<ManualReview> {
    const teacherId = req.user?.profile?.id || req.user?.sub || req.user?.id;
    if (!teacherId) {
      throw new Error('Teacher ID not found in request');
    }
    return this.reviewService.createReview(teacherId, dto);
  }

  /**
   * Actualiza un review existente
   */
  @Put(':id')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({ summary: 'Actualizar evaluación manual' })
  @ApiResponse({
    status: 200,
    description: 'Review actualizado exitosamente',
    type: ManualReview,
  })
  @ApiResponse({ status: 404, description: 'Review no encontrado' })
  async updateReview(
    @Param('id') id: string,
    @Body() dto: Partial<CreateReviewDto>,
  ): Promise<ManualReview> {
    return this.reviewService.updateReview(id, dto);
  }

  /**
   * Inicia un review (marca como in_progress)
   */
  @Post(':id/start')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({ summary: 'Iniciar revisión de un submission' })
  @ApiResponse({
    status: 200,
    description: 'Review iniciado exitosamente',
    type: ManualReview,
  })
  @ApiResponse({ status: 404, description: 'Review no encontrado' })
  async startReview(@Param('id') id: string): Promise<ManualReview> {
    return this.reviewService.startReview(id);
  }

  /**
   * Completa un review
   */
  @Post(':id/complete')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({ summary: 'Completar evaluación manual' })
  @ApiResponse({
    status: 200,
    description: 'Review completado exitosamente',
    type: ManualReview,
  })
  @ApiResponse({ status: 404, description: 'Review no encontrado' })
  async completeReview(@Param('id') id: string): Promise<ManualReview> {
    return this.reviewService.completeReview(id);
  }

  /**
   * Devuelve un submission para corrección
   */
  @Post(':id/return')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({ summary: 'Devolver submission para corrección del estudiante' })
  @ApiResponse({
    status: 200,
    description: 'Submission devuelto exitosamente',
    type: ManualReview,
  })
  @ApiResponse({ status: 404, description: 'Review no encontrado' })
  async returnForRevision(
    @Param('id') id: string,
    @Body() dto: ReturnForRevisionDto,
  ): Promise<ManualReview> {
    return this.reviewService.returnForRevision(id, dto.feedback);
  }
}
