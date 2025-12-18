import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemAlert } from '../entities/system-alert.entity';
import {
  ListAlertsDto,
  CreateAlertDto,
  AlertResponseDto,
  AlertsStatsDto,
  PaginatedAlertsDto,
  } from '../dto/alerts';

/**
 * AdminAlertsService
 *
 * @description Service para gestión de alertas del sistema.
 * Provee operaciones CRUD y lógica de negocio para alertas de monitoreo.
 *
 * Funcionalidades:
 * - Listar alertas con filtros y paginación
 * - Crear alertas manuales
 * - Reconocer alertas (acknowledge)
 * - Resolver alertas con nota de resolución
 * - Suprimir alertas (suppress)
 * - Obtener estadísticas de alertas
 *
 * @see SystemAlert entity para estructura de datos
 */
@Injectable()
export class AdminAlertsService {
  constructor(
    @InjectRepository(SystemAlert, 'audit')
    private readonly alertRepo: Repository<SystemAlert>,
  ) {}

  /**
   * Lista alertas con filtros y paginación
   *
   * @param filters - Filtros de búsqueda (severity, status, alert_type, fecha, paginación)
   * @returns Alertas paginadas con información de usuarios que las gestionaron
   *
   * IMPORTANTE:
   * - Hace JOIN con profiles para obtener nombres de usuarios
   * - Ordena por severidad (critical > high > medium > low) y luego por triggered_at DESC
   * - Usa índices optimizados (idx_alerts_open, idx_alerts_severity, etc.)
   */
  async listAlerts(filters: ListAlertsDto): Promise<PaginatedAlertsDto> {
    const { severity, status, alert_type, date_from, date_to, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    // Construir query con QueryBuilder para joins y ordenamiento complejo
    const queryBuilder = this.alertRepo
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.acknowledger', 'ack_user')
      .leftJoinAndSelect('alert.resolver', 'res_user');

    // Aplicar filtros
    if (severity) {
      queryBuilder.andWhere('alert.severity = :severity', { severity });
    }

    if (status) {
      queryBuilder.andWhere('alert.status = :status', { status });
    }

    if (alert_type) {
      queryBuilder.andWhere('alert.alert_type = :alert_type', { alert_type });
    }

    if (date_from) {
      queryBuilder.andWhere('alert.triggered_at >= :date_from', { date_from });
    }

    if (date_to) {
      queryBuilder.andWhere('alert.triggered_at <= :date_to', { date_to });
    }

    // Ordenar por severidad (usando CASE) y luego por triggered_at DESC
    queryBuilder.orderBy(
      `CASE alert.severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END`,
      'ASC',
    );
    queryBuilder.addOrderBy('alert.triggered_at', 'DESC');

    // Paginación
    queryBuilder.skip(skip).take(limit);

    // Ejecutar query
    const [alerts, total] = await queryBuilder.getManyAndCount();

    // Mapear a DTOs con nombres de usuarios
    const data: AlertResponseDto[] = alerts.map((alert) => ({
      id: alert.id,
      tenant_id: alert.tenant_id || undefined,
      alert_type: alert.alert_type as any,
      severity: alert.severity as any,
      title: alert.title,
      description: alert.description || undefined,
      source_system: alert.source_system || undefined,
      source_module: alert.source_module || undefined,
      error_code: alert.error_code || undefined,
      affected_users: alert.affected_users,
      status: alert.status as any,
      acknowledgment_note: alert.acknowledgment_note || undefined,
      resolution_note: alert.resolution_note || undefined,
      acknowledged_by: alert.acknowledged_by || undefined,
      acknowledged_by_name: alert.acknowledger?.display_name || undefined,
      acknowledged_at: alert.acknowledged_at || undefined,
      resolved_by: alert.resolved_by || undefined,
      resolved_by_name: alert.resolver?.display_name || undefined,
      resolved_at: alert.resolved_at || undefined,
      notification_sent: alert.notification_sent,
      escalation_level: alert.escalation_level,
      auto_resolve: alert.auto_resolve,
      suppress_similar: alert.suppress_similar,
      context_data: alert.context_data,
      metrics: alert.metrics,
      related_alerts: alert.related_alerts || undefined,
      triggered_at: alert.triggered_at,
      created_at: alert.created_at,
      updated_at: alert.updated_at,
    }));

    return {
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene una alerta por ID con información completa
   *
   * @param id - UUID de la alerta
   * @returns Alerta con información de usuarios
   * @throws NotFoundException si no existe
   */
  async getAlertById(id: string): Promise<AlertResponseDto> {
    const alert = await this.alertRepo
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.acknowledger', 'ack_user')
      .leftJoinAndSelect('alert.resolver', 'res_user')
      .where('alert.id = :id', { id })
      .getOne();

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }

    return {
      id: alert.id,
      tenant_id: alert.tenant_id || undefined,
      alert_type: alert.alert_type as any,
      severity: alert.severity as any,
      title: alert.title,
      description: alert.description || undefined,
      source_system: alert.source_system || undefined,
      source_module: alert.source_module || undefined,
      error_code: alert.error_code || undefined,
      affected_users: alert.affected_users,
      status: alert.status as any,
      acknowledgment_note: alert.acknowledgment_note || undefined,
      resolution_note: alert.resolution_note || undefined,
      acknowledged_by: alert.acknowledged_by || undefined,
      acknowledged_by_name: alert.acknowledger?.display_name || undefined,
      acknowledged_at: alert.acknowledged_at || undefined,
      resolved_by: alert.resolved_by || undefined,
      resolved_by_name: alert.resolver?.display_name || undefined,
      resolved_at: alert.resolved_at || undefined,
      notification_sent: alert.notification_sent,
      escalation_level: alert.escalation_level,
      auto_resolve: alert.auto_resolve,
      suppress_similar: alert.suppress_similar,
      context_data: alert.context_data,
      metrics: alert.metrics,
      related_alerts: alert.related_alerts || undefined,
      triggered_at: alert.triggered_at,
      created_at: alert.created_at,
      updated_at: alert.updated_at,
    };
  }

  /**
   * Crea una alerta manual
   *
   * @param createDto - Datos de la alerta a crear
   * @param userId - ID del usuario que crea la alerta (para auditoría)
   * @returns Alerta creada
   */
  async createAlert(createDto: CreateAlertDto, _userId: string): Promise<AlertResponseDto> {
    const alert = this.alertRepo.create({
      alert_type: createDto.alert_type,
      severity: createDto.severity,
      title: createDto.title,
      description: createDto.description,
      source_system: createDto.source_system,
      source_module: createDto.source_module,
      affected_users: createDto.affected_users || 0,
      context_data: createDto.context_data || {},
      metrics: createDto.metrics || {},
      status: 'open',
    });

    const saved = await this.alertRepo.save(alert);
    return this.getAlertById(saved.id);
  }

  /**
   * Reconoce una alerta (cambia estado a 'acknowledged')
   *
   * @param id - UUID de la alerta
   * @param note - Nota de reconocimiento (opcional)
   * @param userId - ID del usuario que reconoce
   * @returns Alerta actualizada
   * @throws NotFoundException si no existe
   * @throws BadRequestException si no está en estado 'open'
   */
  async acknowledgeAlert(id: string, note: string | undefined, userId: string): Promise<AlertResponseDto> {
    const alert = await this.alertRepo.findOne({ where: { id } });

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }

    if (alert.status !== 'open') {
      throw new BadRequestException(`Alert can only be acknowledged when status is 'open'. Current status: ${alert.status}`);
    }

    alert.status = 'acknowledged';
    alert.acknowledgment_note = note;
    alert.acknowledged_by = userId;
    alert.acknowledged_at = new Date();

    await this.alertRepo.save(alert);
    return this.getAlertById(id);
  }

  /**
   * Resuelve una alerta (cambia estado a 'resolved')
   *
   * @param id - UUID de la alerta
   * @param note - Nota de resolución (requerida, mínimo 10 caracteres)
   * @param userId - ID del usuario que resuelve
   * @returns Alerta actualizada
   * @throws NotFoundException si no existe
   * @throws BadRequestException si no está en estado 'open' o 'acknowledged'
   */
  async resolveAlert(id: string, note: string, userId: string): Promise<AlertResponseDto> {
    const alert = await this.alertRepo.findOne({ where: { id } });

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }

    if (alert.status !== 'open' && alert.status !== 'acknowledged') {
      throw new BadRequestException(
        `Alert can only be resolved when status is 'open' or 'acknowledged'. Current status: ${alert.status}`,
      );
    }

    alert.status = 'resolved';
    alert.resolution_note = note;
    alert.resolved_by = userId;
    alert.resolved_at = new Date();

    await this.alertRepo.save(alert);
    return this.getAlertById(id);
  }

  /**
   * Suprime una alerta (cambia estado a 'suppressed')
   *
   * @param id - UUID de la alerta
   * @returns Alerta actualizada
   * @throws NotFoundException si no existe
   */
  async suppressAlert(id: string): Promise<AlertResponseDto> {
    const alert = await this.alertRepo.findOne({ where: { id } });

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }

    alert.status = 'suppressed';
    await this.alertRepo.save(alert);
    return this.getAlertById(id);
  }

  /**
   * Obtiene estadísticas agregadas de alertas
   *
   * @returns Estadísticas de alertas (totales, por estado, por severidad, temporales)
   *
   * Métricas incluidas:
   * - Total de alertas
   * - Alertas por estado (open, acknowledged, resolved)
   * - Alertas por severidad (critical, high, medium, low)
   * - Alertas en últimas 24h y 7d
   * - Tiempo promedio de resolución en horas
   */
  async getAlertsStats(): Promise<AlertsStatsDto> {
    // Total de alertas
    const total_alerts = await this.alertRepo.count();

    // Alertas por estado
    const open_alerts = await this.alertRepo.count({ where: { status: 'open' } });
    const acknowledged_alerts = await this.alertRepo.count({ where: { status: 'acknowledged' } });
    const resolved_alerts = await this.alertRepo.count({ where: { status: 'resolved' } });

    // Alertas por severidad
    const critical_alerts = await this.alertRepo.count({ where: { severity: 'critical' } });
    const high_alerts = await this.alertRepo.count({ where: { severity: 'high' } });
    const medium_alerts = await this.alertRepo.count({ where: { severity: 'medium' } });
    const low_alerts = await this.alertRepo.count({ where: { severity: 'low' } });

    // Alertas en últimas 24h
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const alerts_24h = await this.alertRepo
      .createQueryBuilder('alert')
      .where('alert.triggered_at >= :date', { date: twentyFourHoursAgo })
      .getCount();

    // Alertas en últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const alerts_7d = await this.alertRepo
      .createQueryBuilder('alert')
      .where('alert.triggered_at >= :date', { date: sevenDaysAgo })
      .getCount();

    // Tiempo promedio de resolución (en horas)
    const resolvedWithTimes = await this.alertRepo
      .createQueryBuilder('alert')
      .select('EXTRACT(EPOCH FROM (alert.resolved_at - alert.triggered_at))/3600', 'hours')
      .where('alert.status = :status', { status: 'resolved' })
      .andWhere('alert.resolved_at IS NOT NULL')
      .getRawMany();

    let avg_resolution_time_hours = 0;
    if (resolvedWithTimes.length > 0) {
      const totalHours = resolvedWithTimes.reduce((sum, item) => sum + parseFloat(item.hours), 0);
      avg_resolution_time_hours = Math.round((totalHours / resolvedWithTimes.length) * 100) / 100;
    }

    return {
      total_alerts,
      open_alerts,
      acknowledged_alerts,
      resolved_alerts,
      critical_alerts,
      high_alerts,
      medium_alerts,
      low_alerts,
      alerts_24h,
      alerts_7d,
      avg_resolution_time_hours,
    };
  }
}
