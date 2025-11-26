import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentInterventionAlert } from '../entities/student-intervention-alert.entity';
import {
  GetAlertsQueryDto,
  ResolveAlertDto,
  AlertResponseDto,
  AlertsListResponseDto,
  AlertStatus,
  GenerateAlertsResponseDto,
} from '../dto/intervention-alerts.dto';

/**
 * Service para gestión de Alertas de Intervención Estudiantil
 *
 * @description Provee operaciones para consultar, reconocer, resolver y descartar alertas.
 * Las alertas son generadas automáticamente por la función SQL generate_student_alerts()
 * que analiza patrones de comportamiento estudiantil.
 *
 * Features:
 * - Listado con filtros (classroom, tipo, severidad, estado)
 * - Búsqueda por texto (título, descripción, nombre estudiante)
 * - Paginación
 * - Verificación de permisos (teacher solo ve alertas de sus classrooms)
 * - Workflow: active → acknowledged → resolved/dismissed
 * - Ordenamiento por severidad (critical primero) y fecha
 *
 * @see StudentInterventionAlert entity
 * @see apps/database/ddl/schemas/progress_tracking/functions/generate_student_alerts.sql
 */
@Injectable()
export class InterventionAlertsService {
  private readonly logger = new Logger(InterventionAlertsService.name);

  constructor(
    @InjectRepository(StudentInterventionAlert, 'progress')
    private readonly alertsRepository: Repository<StudentInterventionAlert>,
  ) {}

  /**
   * Obtiene listado de alertas con filtros y paginación
   *
   * @param teacherId - ID del teacher autenticado
   * @param tenantId - ID del tenant
   * @param query - Filtros y paginación
   * @returns Listado paginado de alertas
   * @throws ForbiddenException si el teacher no tiene acceso al classroom especificado
   */
  async getAlerts(
    teacherId: string,
    tenantId: string,
    query: GetAlertsQueryDto,
  ): Promise<AlertsListResponseDto> {
    this.logger.log(`Getting alerts for teacher ${teacherId}, tenant ${tenantId}`);

    const qb = this.alertsRepository
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.student', 'student')
      .leftJoinAndSelect('alert.classroom', 'classroom')
      .leftJoinAndSelect('alert.acknowledged_by_user', 'acknowledgedBy')
      .leftJoinAndSelect('alert.resolved_by_user', 'resolvedBy')
      .where('alert.tenant_id = :tenantId', { tenantId });

    // Verificar que el teacher tiene acceso a las alertas de sus classrooms
    if (query.classroom_id) {
      qb.andWhere('alert.classroom_id = :classroomId', { classroomId: query.classroom_id });

      // Verificar que el teacher pertenece a ese classroom
      const hasAccess = await this.verifyTeacherClassroomAccess(
        teacherId,
        query.classroom_id,
        tenantId,
      );
      if (!hasAccess) {
        throw new ForbiddenException('No tienes acceso a las alertas de este classroom');
      }
    } else {
      // Obtener todos los classrooms del teacher
      qb.innerJoin(
        'social_features.teacher_classrooms',
        'tc',
        'tc.classroom_id = alert.classroom_id AND tc.teacher_id = :teacherId AND tc.tenant_id = :tenantId',
        { teacherId, tenantId },
      );
    }

    // Filtros
    if (query.alert_type) {
      qb.andWhere('alert.alert_type = :alertType', { alertType: query.alert_type });
    }

    if (query.severity) {
      qb.andWhere('alert.severity = :severity', { severity: query.severity });
    }

    if (query.status) {
      qb.andWhere('alert.status = :status', { status: query.status });
    } else if (!query.include_dismissed) {
      // Por defecto, no mostrar alertas dismissed
      qb.andWhere('alert.status != :dismissedStatus', { dismissedStatus: AlertStatus.DISMISSED });
    }

    if (query.search) {
      qb.andWhere(
        '(alert.title ILIKE :search OR alert.description ILIKE :search OR student.display_name ILIKE :search OR student.full_name ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Ordenar por severidad y fecha
    qb.orderBy(
      "CASE alert.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END",
      'ASC',
    ).addOrderBy('alert.generated_at', 'DESC');

    // Paginación
    const total = await qb.getCount();
    qb.skip(query.offset).take(query.limit);

    const alerts = await qb.getMany();

    this.logger.log(`Found ${total} alerts, returning ${alerts.length} items`);

    return {
      data: alerts.map((alert) => this.mapToResponseDto(alert)),
      total,
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
  }

  /**
   * Obtiene detalle de una alerta específica
   *
   * @param alertId - ID de la alerta
   * @param teacherId - ID del teacher autenticado
   * @param tenantId - ID del tenant
   * @returns Alerta detallada
   * @throws NotFoundException si la alerta no existe
   * @throws ForbiddenException si el teacher no tiene acceso
   */
  async getAlertById(
    alertId: string,
    teacherId: string,
    tenantId: string,
  ): Promise<AlertResponseDto> {
    this.logger.log(`Getting alert ${alertId} for teacher ${teacherId}`);

    const alert = await this.alertsRepository.findOne({
      where: { id: alertId, tenant_id: tenantId },
      relations: [
        'student',
        'classroom',
        'acknowledged_by_user',
        'resolved_by_user',
      ],
    });

    if (!alert) {
      throw new NotFoundException('Alerta no encontrada');
    }

    // Verificar acceso del teacher al classroom de la alerta
    if (alert.classroom_id) {
      const hasAccess = await this.verifyTeacherClassroomAccess(
        teacherId,
        alert.classroom_id,
        tenantId,
      );
      if (!hasAccess) {
        throw new ForbiddenException('No tienes acceso a esta alerta');
      }
    }

    return this.mapToResponseDto(alert);
  }

  /**
   * Marca una alerta como reconocida (acknowledged)
   *
   * @param alertId - ID de la alerta
   * @param teacherId - ID del teacher que reconoce
   * @param tenantId - ID del tenant
   * @returns Alerta actualizada
   * @throws BadRequestException si la alerta no está en estado active
   */
  async acknowledgeAlert(
    alertId: string,
    teacherId: string,
    tenantId: string,
  ): Promise<AlertResponseDto> {
    this.logger.log(`Acknowledging alert ${alertId} by teacher ${teacherId}`);

    const alert = await this.getAlertEntity(alertId, teacherId, tenantId);

    if (alert.status !== AlertStatus.ACTIVE) {
      throw new BadRequestException('Solo se pueden acknowledge alertas activas');
    }

    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledged_at = new Date();
    alert.acknowledged_by = teacherId;

    await this.alertsRepository.save(alert);

    this.logger.log(`Alert ${alertId} acknowledged successfully`);

    return this.getAlertById(alertId, teacherId, tenantId);
  }

  /**
   * Marca una alerta como resuelta con notas
   *
   * @param alertId - ID de la alerta
   * @param teacherId - ID del teacher que resuelve
   * @param tenantId - ID del tenant
   * @param dto - Notas de resolución
   * @returns Alerta actualizada
   * @throws BadRequestException si la alerta ya está resuelta
   */
  async resolveAlert(
    alertId: string,
    teacherId: string,
    tenantId: string,
    dto: ResolveAlertDto,
  ): Promise<AlertResponseDto> {
    this.logger.log(`Resolving alert ${alertId} by teacher ${teacherId}`);

    const alert = await this.getAlertEntity(alertId, teacherId, tenantId);

    if (alert.status === AlertStatus.RESOLVED) {
      throw new BadRequestException('Esta alerta ya está resuelta');
    }

    alert.status = AlertStatus.RESOLVED;
    alert.resolved_at = new Date();
    alert.resolved_by = teacherId;
    alert.resolution_notes = dto.resolution_notes;

    await this.alertsRepository.save(alert);

    this.logger.log(`Alert ${alertId} resolved successfully`);

    return this.getAlertById(alertId, teacherId, tenantId);
  }

  /**
   * Descarta una alerta (dismissed)
   *
   * @param alertId - ID de la alerta
   * @param teacherId - ID del teacher que descarta
   * @param tenantId - ID del tenant
   * @returns Alerta actualizada
   */
  async dismissAlert(
    alertId: string,
    teacherId: string,
    tenantId: string,
  ): Promise<AlertResponseDto> {
    this.logger.log(`Dismissing alert ${alertId} by teacher ${teacherId}`);

    const alert = await this.getAlertEntity(alertId, teacherId, tenantId);

    alert.status = AlertStatus.DISMISSED;

    await this.alertsRepository.save(alert);

    this.logger.log(`Alert ${alertId} dismissed successfully`);

    return this.getAlertById(alertId, teacherId, tenantId);
  }

  /**
   * Obtiene historial completo de alertas de un estudiante
   *
   * @param studentId - ID del estudiante
   * @param teacherId - ID del teacher autenticado
   * @param tenantId - ID del tenant
   * @returns Array de alertas del estudiante
   */
  async getStudentAlertHistory(
    studentId: string,
    teacherId: string,
    tenantId: string,
  ): Promise<AlertResponseDto[]> {
    this.logger.log(`Getting alert history for student ${studentId}`);

    // Verificar que el teacher tiene acceso al estudiante
    const alerts = await this.alertsRepository
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.student', 'student')
      .leftJoinAndSelect('alert.classroom', 'classroom')
      .leftJoinAndSelect('alert.acknowledged_by_user', 'acknowledgedBy')
      .leftJoinAndSelect('alert.resolved_by_user', 'resolvedBy')
      .innerJoin(
        'social_features.teacher_classrooms',
        'tc',
        'tc.classroom_id = alert.classroom_id AND tc.teacher_id = :teacherId AND tc.tenant_id = :tenantId',
        { teacherId, tenantId },
      )
      .where('alert.student_id = :studentId', { studentId })
      .andWhere('alert.tenant_id = :tenantId', { tenantId })
      .orderBy('alert.generated_at', 'DESC')
      .getMany();

    this.logger.log(`Found ${alerts.length} alerts in history for student ${studentId}`);

    return alerts.map((alert) => this.mapToResponseDto(alert));
  }

  /**
   * Ejecuta generación manual de alertas (para testing)
   *
   * @returns Mensaje de confirmación
   * @note Ejecuta la función SQL progress_tracking.generate_student_alerts()
   */
  async generateAlerts(): Promise<GenerateAlertsResponseDto> {
    this.logger.log('Generating alerts manually (testing)');

    try {
      await this.alertsRepository.query('SELECT progress_tracking.generate_student_alerts()');
      this.logger.log('Alerts generated successfully');
      return { message: 'Alertas generadas exitosamente' };
    } catch (error) {
      this.logger.error('Error generating alerts', error);
      throw new BadRequestException('Error al generar alertas');
    }
  }

  /**
   * Obtiene entity de alerta con verificación de permisos
   *
   * @param alertId - ID de la alerta
   * @param teacherId - ID del teacher
   * @param tenantId - ID del tenant
   * @returns Entity de alerta
   * @throws NotFoundException si no existe
   * @throws ForbiddenException si no tiene acceso
   * @private
   */
  private async getAlertEntity(
    alertId: string,
    teacherId: string,
    tenantId: string,
  ): Promise<StudentInterventionAlert> {
    const alert = await this.alertsRepository.findOne({
      where: { id: alertId, tenant_id: tenantId },
      relations: ['classroom'],
    });

    if (!alert) {
      throw new NotFoundException('Alerta no encontrada');
    }

    if (alert.classroom_id) {
      const hasAccess = await this.verifyTeacherClassroomAccess(
        teacherId,
        alert.classroom_id,
        tenantId,
      );
      if (!hasAccess) {
        throw new ForbiddenException('No tienes acceso a esta alerta');
      }
    }

    return alert;
  }

  /**
   * Verifica que un teacher tiene acceso a un classroom específico
   *
   * @param teacherId - ID del teacher
   * @param classroomId - ID del classroom
   * @param tenantId - ID del tenant
   * @returns true si tiene acceso, false si no
   * @private
   */
  private async verifyTeacherClassroomAccess(
    teacherId: string,
    classroomId: string,
    tenantId: string,
  ): Promise<boolean> {
    const result = await this.alertsRepository.query(
      `SELECT EXISTS (
        SELECT 1 FROM social_features.teacher_classrooms
        WHERE teacher_id = $1 AND classroom_id = $2 AND tenant_id = $3
      ) as has_access`,
      [teacherId, classroomId, tenantId],
    );
    return result[0]?.has_access || false;
  }

  /**
   * Mapea entity a DTO de respuesta
   *
   * @param alert - Entity de alerta
   * @returns DTO de respuesta
   * @private
   */
  private mapToResponseDto(alert: StudentInterventionAlert): AlertResponseDto {
    return {
      id: alert.id,
      student_id: alert.student_id,
      student_name: alert.student?.display_name || alert.student?.full_name || 'Desconocido',
      classroom_id: alert.classroom_id || null,
      classroom_name: alert.classroom?.name || null,
      alert_type: alert.alert_type,
      severity: alert.severity,
      title: alert.title,
      description: alert.description || null,
      metrics: alert.metrics || null,
      status: alert.status,
      generated_at: alert.generated_at.toISOString(),
      acknowledged_at: alert.acknowledged_at?.toISOString() || null,
      acknowledged_by_name:
        alert.acknowledged_by_user?.display_name ||
        alert.acknowledged_by_user?.full_name ||
        null,
      resolved_at: alert.resolved_at?.toISOString() || null,
      resolved_by_name:
        alert.resolved_by_user?.display_name || alert.resolved_by_user?.full_name || null,
      resolution_notes: alert.resolution_notes || null,
    };
  }
}
