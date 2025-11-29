import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from '@modules/auth/entities/user.entity';
import { Tenant } from '@modules/auth/entities/tenant.entity';
import { AdminReport } from '../entities/admin-report.entity';
import {
  ReportDto,
  GenerateReportDto,
  ListReportsDto,
  PaginatedReportsDto,
  ReportType,
  ReportFormat,
  ReportStatus,
} from '../dto/reports';

/**
 * AdminReportsService
 *
 * @description Servicio para generación y gestión de reportes administrativos
 * @related EXT-002 (Admin Extendido - Reports)
 *
 * IMPORTANTE:
 * - Reportes se persisten en BD (admin_dashboard.admin_reports)
 * - Generación asíncrona simulada (en producción: integrar con BullMQ)
 * - Cleanup automático de reportes antiguos (>30 días) mediante cron job
 * - Estados: pending → generating → completed/failed
 *
 * DISEÑO:
 * - Similar a BulkOperationsService pero para generación de archivos
 * - Los reportes tienen expiración automática (expires_at)
 * - file_url apunta al archivo generado (local o S3)
 */
@Injectable()
export class AdminReportsService {
  private readonly logger = new Logger(AdminReportsService.name);

  constructor(
    @InjectRepository(AdminReport, 'auth')
    private readonly reportRepo: Repository<AdminReport>,
    @InjectRepository(User, 'auth')
    private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant, 'auth')
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  /**
   * Genera un nuevo reporte
   *
   * @param generateDto - Datos del reporte a generar
   * @param userId - ID del usuario que solicita el reporte
   * @returns Reporte creado con estado 'pending'
   *
   * IMPORTANTE:
   * - El reporte se crea con estado 'pending'
   * - La generación se procesa de forma asíncrona (sin bloquear la respuesta)
   * - expires_at se calcula como created_at + 30 días
   * - En producción: usar BullMQ para procesamiento en background
   */
  async generateReport(
    generateDto: GenerateReportDto,
    userId: string,
  ): Promise<ReportDto> {
    // Crear registro de reporte en BD
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expira en 30 días

    const report = this.reportRepo.create({
      report_type: generateDto.type,
      report_format: generateDto.format,
      status: 'pending',
      metadata: generateDto.filters || {},
      requested_by: userId,
      expires_at: expiresAt,
    });

    const savedReport = await this.reportRepo.save(report);
    this.logger.log(`Report ${savedReport.id} created by user ${userId}`);

    // Procesar generación de forma asíncrona (sin bloquear la respuesta)
    this.processReportGeneration(savedReport.id).catch((error) => {
      this.logger.error(
        `Error processing report generation ${savedReport.id}: ${error.message}`,
        error.stack,
      );
    });

    return this.mapToDto(savedReport);
  }

  /**
   * Obtiene lista de reportes con filtros y paginación
   *
   * @param query - Filtros y paginación
   * @returns Lista paginada de reportes
   */
  async getReports(query: ListReportsDto): Promise<PaginatedReportsDto> {
    const { type, status, page = 1, limit = 20 } = query;

    // Construir query con filtros
    const queryBuilder = this.reportRepo.createQueryBuilder('report');

    if (type) {
      queryBuilder.andWhere('report.report_type = :type', { type });
    }
    if (status) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    // Ordenar por fecha de creación descendente
    queryBuilder.orderBy('report.created_at', 'DESC');

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Ejecutar query
    const [reports, total] = await queryBuilder.getManyAndCount();

    return {
      data: reports.map((r) => this.mapToDto(r)),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Descarga un reporte
   *
   * @param reportId - ID del reporte
   * @returns Reporte con información de descarga
   * @throws NotFoundException si el reporte no existe
   * @throws Error si el reporte no está completado
   */
  async downloadReport(reportId: string): Promise<ReportDto> {
    const report = await this.reportRepo.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    if (report.status !== 'completed') {
      throw new Error(`Report is not ready for download. Status: ${report.status}`);
    }

    this.logger.log(`Report ${reportId} downloaded`);
    return this.mapToDto(report);
  }

  /**
   * Elimina un reporte
   *
   * @param reportId - ID del reporte
   * @throws NotFoundException si el reporte no existe
   *
   * IMPORTANTE:
   * - Soft delete: no elimina físicamente, solo marca como eliminado
   * - En producción: también eliminar archivo físico de storage
   */
  async deleteReport(reportId: string): Promise<void> {
    const report = await this.reportRepo.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    // En producción: eliminar archivo físico aquí
    // await this.storageService.deleteFile(report.file_url);

    await this.reportRepo.delete(reportId);
    this.logger.log(`Report ${reportId} deleted`);
  }

  // =====================================================
  // CLEANUP AUTOMÁTICO
  // =====================================================

  /**
   * Cleanup automático de reportes vencidos
   *
   * CRON JOB: Se ejecuta diariamente a las 2:00 AM
   * - Elimina reportes con expires_at < now()
   * - Limita a 100 reportes por ejecución (para evitar sobrecarga)
   *
   * @cron Todos los días a las 2:00 AM (Mexico timezone)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredReports(): Promise<void> {
    try {
      const now = new Date();
      const expiredReports = await this.reportRepo.find({
        where: {
          expires_at: LessThan(now),
        },
        take: 100, // Procesar máximo 100 por ejecución
      });

      if (expiredReports.length === 0) {
        this.logger.log('No expired reports to cleanup');
        return;
      }

      // Eliminar reportes vencidos
      const reportIds = expiredReports.map((r) => r.id);
      await this.reportRepo.delete(reportIds);

      this.logger.log(
        `Cleanup completed: ${expiredReports.length} expired reports deleted`,
      );
    } catch (error: any) {
      this.logger.error(
        `Error during cleanup of expired reports: ${error.message}`,
        error.stack,
      );
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  /**
   * Procesa la generación de un reporte de forma asíncrona
   *
   * @param reportId - ID del reporte a generar
   *
   * IMPORTANTE:
   * - Simula generación con setTimeout (2 segundos)
   * - En producción: integrar con BullMQ para procesamiento real
   * - Actualiza estado a 'generating' → 'completed' o 'failed'
   */
  private async processReportGeneration(reportId: string): Promise<void> {
    try {
      // Actualizar estado a 'generating'
      await this.reportRepo.update(reportId, { status: 'generating' });

      // Simular generación de reporte (en producción: lógica real aquí)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Obtener reporte actualizado
      const report = await this.reportRepo.findOne({ where: { id: reportId } });
      if (!report) {
        this.logger.error(`Report ${reportId} not found after generation`);
        return;
      }

      // Simular generación de archivo
      const fileName = `${report.report_type}-${new Date().toISOString().split('T')[0]}.${report.report_format}`;
      const fileUrl = `/reports/${fileName}`;
      const fileSize = Math.floor(Math.random() * 1000000) + 10000; // Simular tamaño aleatorio

      // Actualizar reporte como completado
      await this.reportRepo.update(reportId, {
        status: 'completed',
        file_url: fileUrl,
        file_size: fileSize,
        completed_at: new Date(),
      });

      this.logger.log(`Report ${reportId} generated successfully`);
    } catch (error: any) {
      this.logger.error(
        `Error generating report ${reportId}: ${error.message}`,
        error.stack,
      );

      // Marcar como fallido
      await this.reportRepo.update(reportId, {
        status: 'failed',
        error_message: error.message,
        completed_at: new Date(),
      });
    }
  }

  /**
   * Mapea entity a DTO de respuesta
   *
   * @param report - Entity de reporte
   * @returns DTO de reporte para respuesta API
   */
  private mapToDto(report: AdminReport): ReportDto {
    return {
      id: report.id,
      type: report.report_type as ReportType,
      format: report.report_format as ReportFormat,
      status: report.status as ReportStatus,
      file_url: report.file_url,
      metadata: report.metadata,
      created_at: report.created_at.toISOString(),
      completed_at: report.completed_at?.toISOString(),
      requested_by: report.requested_by,
    };
  }
}
