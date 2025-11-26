import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { GamilityRoleEnum } from '@/shared/constants/enums.constants';
import { InterventionAlertsService } from '../services/intervention-alerts.service';
import {
  GetAlertsQueryDto,
  ResolveAlertDto,
  AlertResponseDto,
  AlertsListResponseDto,
  GenerateAlertsResponseDto,
} from '../dto/intervention-alerts.dto';

/**
 * Controller para Alertas de Intervención Estudiantil
 *
 * @description Endpoints REST para gestión de alertas automáticas de intervención.
 * Los teachers pueden consultar, reconocer, resolver y descartar alertas generadas
 * automáticamente por el sistema de monitoreo de progreso estudiantil.
 *
 * Endpoints:
 * - GET /teacher/alerts - Listar alertas con filtros y paginación
 * - GET /teacher/alerts/:id - Obtener detalle de alerta específica
 * - PATCH /teacher/alerts/:id/acknowledge - Marcar alerta como reconocida
 * - PATCH /teacher/alerts/:id/resolve - Marcar alerta como resuelta (con notas)
 * - PATCH /teacher/alerts/:id/dismiss - Descartar alerta
 * - GET /teacher/alerts/student/:studentId/history - Historial de alertas del estudiante
 * - POST /teacher/alerts/generate - Generación manual (testing)
 *
 * Permisos:
 * - Requiere rol: ADMIN_TEACHER o SUPER_ADMIN
 * - Teacher solo ve alertas de sus classrooms asignados
 *
 * @see InterventionAlertsService
 * @see StudentInterventionAlert entity
 */
@ApiTags('Teacher - Alertas de Intervención')
@ApiBearerAuth()
@Controller('teacher/alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
export class InterventionAlertsController {
  constructor(private readonly alertsService: InterventionAlertsService) {}

  /**
   * GET /teacher/alerts
   * Obtener listado de alertas con filtros y paginación
   *
   * @description Lista todas las alertas de los classrooms del teacher.
   * Soporta filtros por classroom, tipo, severidad, estado y búsqueda por texto.
   * Por defecto no incluye alertas dismissed.
   *
   * @param query - Filtros y paginación
   * @param req - Request con datos del usuario autenticado
   * @returns Listado paginado de alertas
   *
   * @example
   * GET /teacher/alerts?classroom_id=123&severity=critical&limit=20&offset=0
   * GET /teacher/alerts?search=Juan&status=active
   * GET /teacher/alerts?alert_type=low_score&include_dismissed=true
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener listado de alertas con filtros',
    description:
      'Lista alertas de los classrooms del teacher con filtros opcionales por classroom, tipo, severidad, estado y búsqueda. Por defecto excluye alertas dismissed.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de alertas obtenido exitosamente',
    type: AlertsListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para acceder al classroom' })
  async getAlerts(@Query() query: GetAlertsQueryDto, @Req() req: any): Promise<AlertsListResponseDto> {
    const teacherId = req.user.sub;
    const tenantId = req.user.tenant_id;
    return this.alertsService.getAlerts(teacherId, tenantId, query);
  }

  /**
   * GET /teacher/alerts/:id
   * Obtener detalle de una alerta específica
   *
   * @description Obtiene información completa de una alerta incluyendo estudiante,
   * classroom, métricas, y tracking de quién acknowledge/resolvió.
   *
   * @param id - UUID de la alerta
   * @param req - Request con datos del usuario autenticado
   * @returns Alerta detallada
   *
   * @example
   * GET /teacher/alerts/550e8400-e29b-41d4-a716-446655440000
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de una alerta específica',
    description:
      'Obtiene información completa de una alerta incluyendo estudiante, classroom, métricas y estado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle de alerta obtenido exitosamente',
    type: AlertResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para acceder a esta alerta' })
  @ApiResponse({ status: 404, description: 'Alerta no encontrada' })
  async getAlertById(@Param('id') id: string, @Req() req: any): Promise<AlertResponseDto> {
    const teacherId = req.user.sub;
    const tenantId = req.user.tenant_id;
    return this.alertsService.getAlertById(id, teacherId, tenantId);
  }

  /**
   * PATCH /teacher/alerts/:id/acknowledge
   * Marcar alerta como reconocida (acknowledged)
   *
   * @description Cambia el estado de la alerta de 'active' a 'acknowledged'.
   * Registra quién y cuándo se reconoció la alerta.
   *
   * @param id - UUID de la alerta
   * @param req - Request con datos del usuario autenticado
   * @returns Alerta actualizada
   *
   * @example
   * PATCH /teacher/alerts/550e8400-e29b-41d4-a716-446655440000/acknowledge
   */
  @Patch(':id/acknowledge')
  @ApiOperation({
    summary: 'Marcar alerta como reconocida (acknowledged)',
    description:
      'Cambia el estado de la alerta a acknowledged. Solo se pueden acknowledge alertas en estado active.',
  })
  @ApiResponse({
    status: 200,
    description: 'Alerta reconocida exitosamente',
    type: AlertResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Solo se pueden acknowledge alertas activas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para acceder a esta alerta' })
  @ApiResponse({ status: 404, description: 'Alerta no encontrada' })
  async acknowledgeAlert(@Param('id') id: string, @Req() req: any): Promise<AlertResponseDto> {
    const teacherId = req.user.sub;
    const tenantId = req.user.tenant_id;
    return this.alertsService.acknowledgeAlert(id, teacherId, tenantId);
  }

  /**
   * PATCH /teacher/alerts/:id/resolve
   * Marcar alerta como resuelta con notas
   *
   * @description Cambia el estado de la alerta a 'resolved'.
   * Registra quién resolvió, cuándo y las acciones tomadas (notas).
   *
   * @param id - UUID de la alerta
   * @param dto - Notas de resolución (obligatorio)
   * @param req - Request con datos del usuario autenticado
   * @returns Alerta actualizada
   *
   * @example
   * PATCH /teacher/alerts/550e8400-e29b-41d4-a716-446655440000/resolve
   * Body: { "resolution_notes": "Contacté al estudiante y su representante..." }
   */
  @Patch(':id/resolve')
  @ApiOperation({
    summary: 'Marcar alerta como resuelta con notas',
    description:
      'Cambia el estado de la alerta a resolved. Requiere notas explicando las acciones tomadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Alerta resuelta exitosamente',
    type: AlertResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Esta alerta ya está resuelta' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para acceder a esta alerta' })
  @ApiResponse({ status: 404, description: 'Alerta no encontrada' })
  async resolveAlert(
    @Param('id') id: string,
    @Body() dto: ResolveAlertDto,
    @Req() req: any,
  ): Promise<AlertResponseDto> {
    const teacherId = req.user.sub;
    const tenantId = req.user.tenant_id;
    return this.alertsService.resolveAlert(id, teacherId, tenantId, dto);
  }

  /**
   * PATCH /teacher/alerts/:id/dismiss
   * Descartar alerta (dismiss)
   *
   * @description Cambia el estado de la alerta a 'dismissed'.
   * Se usa cuando la alerta es un falso positivo o no requiere acción.
   *
   * @param id - UUID de la alerta
   * @param req - Request con datos del usuario autenticado
   * @returns Alerta actualizada
   *
   * @example
   * PATCH /teacher/alerts/550e8400-e29b-41d4-a716-446655440000/dismiss
   */
  @Patch(':id/dismiss')
  @ApiOperation({
    summary: 'Descartar alerta (dismiss)',
    description:
      'Cambia el estado de la alerta a dismissed. Útil para falsos positivos o alertas no relevantes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Alerta descartada exitosamente',
    type: AlertResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para acceder a esta alerta' })
  @ApiResponse({ status: 404, description: 'Alerta no encontrada' })
  async dismissAlert(@Param('id') id: string, @Req() req: any): Promise<AlertResponseDto> {
    const teacherId = req.user.sub;
    const tenantId = req.user.tenant_id;
    return this.alertsService.dismissAlert(id, teacherId, tenantId);
  }

  /**
   * GET /teacher/alerts/student/:studentId/history
   * Obtener historial de alertas de un estudiante
   *
   * @description Retorna todas las alertas históricas de un estudiante específico
   * en los classrooms donde el teacher tiene acceso.
   *
   * @param studentId - UUID del estudiante
   * @param req - Request con datos del usuario autenticado
   * @returns Array de alertas históricas
   *
   * @example
   * GET /teacher/alerts/student/660e8400-e29b-41d4-a716-446655440000/history
   */
  @Get('student/:studentId/history')
  @ApiOperation({
    summary: 'Obtener historial de alertas de un estudiante',
    description:
      'Retorna todas las alertas (active, acknowledged, resolved, dismissed) de un estudiante en los classrooms del teacher.',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de alertas obtenido exitosamente',
    type: [AlertResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para acceder al estudiante' })
  async getStudentAlertHistory(
    @Param('studentId') studentId: string,
    @Req() req: any,
  ): Promise<AlertResponseDto[]> {
    const teacherId = req.user.sub;
    const tenantId = req.user.tenant_id;
    return this.alertsService.getStudentAlertHistory(studentId, teacherId, tenantId);
  }

  /**
   * POST /teacher/alerts/generate
   * Generar alertas manualmente (para testing)
   *
   * @description Ejecuta manualmente la función SQL generate_student_alerts()
   * para generar nuevas alertas basadas en los patrones actuales.
   * Útil para testing y debugging.
   *
   * @returns Mensaje de confirmación
   *
   * @example
   * POST /teacher/alerts/generate
   */
  @Post('generate')
  @ApiOperation({
    summary: 'Generar alertas manualmente (para testing)',
    description:
      'Ejecuta la función SQL de generación de alertas manualmente. Útil para testing y debugging.',
  })
  @ApiResponse({
    status: 200,
    description: 'Alertas generadas exitosamente',
    type: GenerateAlertsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Error al generar alertas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async generateAlerts(): Promise<GenerateAlertsResponseDto> {
    return this.alertsService.generateAlerts();
  }
}
