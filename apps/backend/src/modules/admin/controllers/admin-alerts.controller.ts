import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminAlertsService } from '../services/admin-alerts.service';
import {
  ListAlertsDto,
  CreateAlertDto,
  AcknowledgeAlertDto,
  ResolveAlertDto,
  AlertResponseDto,
  AlertsStatsDto,
  PaginatedAlertsDto,
} from '../dto/alerts';

/**
 * AdminAlertsController
 *
 * @description Controller para gestión de alertas del sistema.
 *
 * Endpoints:
 * - GET    /admin/alerts          - Listar alertas con filtros y paginación
 * - GET    /admin/alerts/:id      - Obtener alerta por ID
 * - POST   /admin/alerts          - Crear alerta manual
 * - PATCH  /admin/alerts/:id/acknowledge - Reconocer alerta
 * - PATCH  /admin/alerts/:id/resolve     - Resolver alerta
 * - PATCH  /admin/alerts/:id/suppress    - Suprimir alerta
 * - GET    /admin/alerts/stats/summary   - Obtener estadísticas
 *
 * IMPORTANTE:
 * - Todos los endpoints requieren autenticación (JwtAuthGuard)
 * - Todos los endpoints requieren rol de administrador (AdminGuard)
 * - Documentación completa con Swagger
 * - Validación automática de DTOs con ValidationPipe
 */
@ApiTags('Admin - Alerts')
@Controller('admin/alerts')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminAlertsController {
  constructor(private readonly alertsService: AdminAlertsService) {}

  /**
   * Lista alertas con filtros y paginación
   *
   * Permite filtrar por:
   * - severity (low, medium, high, critical)
   * - status (open, acknowledged, resolved, suppressed)
   * - alert_type (performance_degradation, high_error_rate, etc.)
   * - date_from / date_to (rango de fechas)
   * - page / limit (paginación)
   *
   * Ordenamiento:
   * - Por severidad (critical > high > medium > low)
   * - Luego por triggered_at DESC (más recientes primero)
   */
  @Get()
  @ApiOperation({
    summary: 'List alerts with filters and pagination',
    description: 'Retrieve alerts with optional filters by severity, status, type, and date range. Results are ordered by severity and date.',
  })
  @ApiResponse({
    status: 200,
    description: 'Alerts retrieved successfully',
    type: PaginatedAlertsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async listAlerts(@Query() query: ListAlertsDto): Promise<PaginatedAlertsDto> {
    return await this.alertsService.listAlerts(query);
  }

  /**
   * Obtiene estadísticas de alertas
   *
   * Métricas incluidas:
   * - Totales por estado (open, acknowledged, resolved)
   * - Totales por severidad (critical, high, medium, low)
   * - Alertas en últimas 24h y 7d
   * - Tiempo promedio de resolución
   */
  @Get('stats/summary')
  @ApiOperation({
    summary: 'Get alert statistics',
    description: 'Retrieve aggregated statistics about system alerts including counts by status, severity, and resolution times.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: AlertsStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getAlertsStats(): Promise<AlertsStatsDto> {
    return await this.alertsService.getAlertsStats();
  }

  /**
   * Obtiene una alerta por ID
   *
   * Incluye información completa de la alerta y nombres de usuarios que la gestionaron.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get alert by ID',
    description: 'Retrieve detailed information about a specific alert including user names who acknowledged/resolved it.',
  })
  @ApiParam({ name: 'id', description: 'Alert UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Alert retrieved successfully',
    type: AlertResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getAlertById(@Param('id') id: string): Promise<AlertResponseDto> {
    return await this.alertsService.getAlertById(id);
  }

  /**
   * Crea una alerta manual
   *
   * Permite a administradores crear alertas manualmente para registrar
   * eventos importantes que no fueron detectados automáticamente.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create manual alert',
    description: 'Create a new system alert manually. Useful for documenting important events not caught by automated monitoring.',
  })
  @ApiResponse({
    status: 201,
    description: 'Alert created successfully',
    type: AlertResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createAlert(
    @Body() createDto: CreateAlertDto,
    @Request() req: any,
  ): Promise<AlertResponseDto> {
    const userId = req.user?.id || req.user?.sub;
    return await this.alertsService.createAlert(createDto, userId);
  }

  /**
   * Reconoce una alerta (acknowledge)
   *
   * Cambia el estado de 'open' a 'acknowledged' indicando que un
   * administrador está al tanto de la alerta y la está gestionando.
   *
   * Solo puede aplicarse a alertas en estado 'open'.
   */
  @Patch(':id/acknowledge')
  @ApiOperation({
    summary: 'Acknowledge alert',
    description: "Change alert status from 'open' to 'acknowledged'. Indicates an admin is aware and working on it.",
  })
  @ApiParam({ name: 'id', description: 'Alert UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Alert acknowledged successfully',
    type: AlertResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Alert is not in open status' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async acknowledgeAlert(
    @Param('id') id: string,
    @Body() dto: AcknowledgeAlertDto,
    @Request() req: any,
  ): Promise<AlertResponseDto> {
    const userId = req.user?.id || req.user?.sub;
    return await this.alertsService.acknowledgeAlert(id, dto.acknowledgment_note, userId);
  }

  /**
   * Resuelve una alerta
   *
   * Cambia el estado a 'resolved' indicando que el problema
   * ha sido solucionado. Requiere una nota de resolución.
   *
   * Solo puede aplicarse a alertas en estado 'open' o 'acknowledged'.
   */
  @Patch(':id/resolve')
  @ApiOperation({
    summary: 'Resolve alert',
    description: "Mark alert as resolved with a resolution note. Can only be applied to 'open' or 'acknowledged' alerts.",
  })
  @ApiParam({ name: 'id', description: 'Alert UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Alert resolved successfully',
    type: AlertResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Alert cannot be resolved in current status or invalid resolution note' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async resolveAlert(
    @Param('id') id: string,
    @Body() dto: ResolveAlertDto,
    @Request() req: any,
  ): Promise<AlertResponseDto> {
    const userId = req.user?.id || req.user?.sub;
    return await this.alertsService.resolveAlert(id, dto.resolution_note, userId);
  }

  /**
   * Suprime una alerta
   *
   * Cambia el estado a 'suppressed' indicando que la alerta
   * no requiere acción (falso positivo o no relevante).
   */
  @Patch(':id/suppress')
  @ApiOperation({
    summary: 'Suppress alert',
    description: "Mark alert as suppressed. Use for false positives or irrelevant alerts that don't require action.",
  })
  @ApiParam({ name: 'id', description: 'Alert UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Alert suppressed successfully',
    type: AlertResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async suppressAlert(@Param('id') id: string): Promise<AlertResponseDto> {
    return await this.alertsService.suppressAlert(id);
  }
}
