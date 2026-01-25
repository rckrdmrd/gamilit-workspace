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
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ManualReviewService, CompleteReviewResult, PaginatedReviewsResult } from '../services/manual-review.service';
import { CreateReviewDto, UpdateReviewDto, ReturnForRevisionDto } from '../dto/create-review.dto';
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
   * TASK-2026-01-18-009: Obtiene configuración de ejercicios con revisión manual
   *
   * Retorna módulos y ejercicios que requieren revisión manual desde la BD.
   * Este endpoint reemplaza los datos hardcodeados de manualReviewExercises.ts
   */
  @Get('config/exercises')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({ summary: 'Obtener configuración de ejercicios con revisión manual' })
  @ApiResponse({
    status: 200,
    description: 'Módulos y ejercicios que requieren revisión manual',
    schema: {
      type: 'object',
      properties: {
        modules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              number: { type: 'number' },
            },
          },
        },
        exercises: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              exerciseType: { type: 'string' },
              moduleId: { type: 'string' },
              moduleName: { type: 'string' },
              moduleNumber: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getManualReviewConfig(): Promise<{
    modules: Array<{ id: string; name: string; number: number }>;
    exercises: Array<{
      id: string;
      title: string;
      exerciseType: string;
      moduleId: string;
      moduleName: string;
      moduleNumber: number;
    }>;
  }> {
    return this.reviewService.getManualReviewConfig();
  }

  /**
   * Obtiene reviews pendientes para el docente autenticado
   * FIX GAP-LOW-002: Added pagination support
   */
  @Get('pending')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({ summary: 'Obtener reviews pendientes del docente (paginado)' })
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
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página (default: 20, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de reviews pendientes con submissions',
    schema: {
      type: 'object',
      properties: {
        reviews: { type: 'array', items: { $ref: '#/components/schemas/ManualReview' } },
        total: { type: 'number', example: 45 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 3 },
      },
    },
  })
  async getPendingReviews(
    @Request() req: AuthRequest,
    @Query('moduleId') moduleId?: string,
    @Query('classroomId') classroomId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedReviewsResult> {
    const teacherId = req.user!.profile?.id || req.user!.id;
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? Math.min(parseInt(limit, 10), 100) : 20; // Max 100

    return this.reviewService.findPendingReviews(teacherId, {
      moduleId,
      classroomId,
      page: parsedPage,
      limit: parsedLimit,
    });
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
      throw new UnauthorizedException('Teacher profile not found. Please ensure you are logged in with a valid teacher account.');
    }
    return this.reviewService.createReview(teacherId, dto);
  }

  /**
   * Actualiza un review existente
   * TASK-2026-01-18-014: Usar UpdateReviewDto con campos opcionales
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
    @Body() dto: UpdateReviewDto,
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
   * Completa un review y distribuye recompensas al estudiante
   *
   * FIX GAP-CRIT-001: Ahora retorna información de rewards (XP, ML Coins)
   */
  @Post(':id/complete')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)
  @ApiOperation({
    summary: 'Completar evaluación manual',
    description: 'Completa el review, califica el submission y distribuye XP/ML Coins al estudiante',
  })
  @ApiResponse({
    status: 200,
    description: 'Review completado con información de recompensas distribuidas',
    schema: {
      type: 'object',
      properties: {
        review: { $ref: '#/components/schemas/ManualReview' },
        rewards: {
          type: 'object',
          nullable: true,
          properties: {
            xp_earned: { type: 'number', example: 85 },
            ml_coins_earned: { type: 'number', example: 17 },
            rankUp: {
              type: 'object',
              nullable: true,
              properties: {
                newRank: { type: 'string', example: 'Nacom' },
                previousRank: { type: 'string', example: 'Ajaw' },
                bonusMLCoins: { type: 'number', example: 100 },
                newMultiplier: { type: 'number', example: 1.1 },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Review no encontrado' })
  async completeReview(@Param('id') id: string): Promise<CompleteReviewResult> {
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
