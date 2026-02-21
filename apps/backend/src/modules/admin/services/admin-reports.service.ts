import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { promises as fs } from 'fs';
import { join, resolve, basename } from 'path';
import PDFDocument from 'pdfkit';
import { Workbook } from 'exceljs';
import { stringify } from 'csv-stringify/sync';
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
  // P2-2026-01-07: Schedule report DTOs
  ScheduleReportDto,
  ScheduleReportResponseDto,
  ReportScheduleConfigDto,
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
 *
 * ============================================================================
 * SECURITY FIX - CROSS-TENANT ACCESS (FIX-BE-001-2026-01-18)
 * ============================================================================
 *
 * CORREGIDO: 2026-01-18 - TASK-2026-01-18-011
 *
 * CAMBIOS IMPLEMENTADOS:
 * 1. ✅ Agregado tenant_id a AdminReport entity
 * 2. ✅ generateReport() ahora requiere tenantId
 * 3. ✅ getReports() filtra por tenant_id
 * 4. ✅ downloadReport() filtra por tenant_id + valida expiración
 * 5. ✅ deleteReport() filtra por tenant_id
 *
 * NOTA: Los controllers que llaman estos métodos deben pasar tenant_id
 * del usuario autenticado. super_admin puede usar tenant especial si aplica.
 *
 * TAMBIÉN CORREGIDO:
 * - BE-004: downloadReport() ahora valida expires_at antes de permitir descarga
 * ============================================================================
 */
@Injectable()
export class AdminReportsService {
  private readonly logger = new Logger(AdminReportsService.name);
  private readonly REPORTS_DIR = join(process.cwd(), 'apps', 'backend', 'uploads', 'reports');

  constructor(
    // FIX-BE-009-2026-01-18: Changed from 'auth' to 'admin_dashboard' (correct schema)
    @InjectRepository(AdminReport, 'admin_dashboard')
    private readonly reportRepo: Repository<AdminReport>,
    @InjectRepository(User, 'auth')
    private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant, 'auth')
    private readonly tenantRepo: Repository<Tenant>,
  ) {
    this.ensureReportsDirectory();
  }

  /**
   * Asegura que el directorio de reportes exista
   *
   * IMPORTANTE:
   * - Se ejecuta al inicializar el servicio
   * - Crea el directorio si no existe (mkdir -p)
   */
  private async ensureReportsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.REPORTS_DIR, { recursive: true });
      this.logger.log(`Reports directory ensured: ${this.REPORTS_DIR}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error creating reports directory: ${message}`,
        stack,
      );
    }
  }

  /**
   * Genera un nuevo reporte
   *
   * @param generateDto - Datos del reporte a generar
   * @param userId - ID del usuario que solicita el reporte
   * @param tenantId - ID del tenant (FIX-BE-001-2026-01-18)
   * @returns Reporte creado con estado 'pending'
   *
   * IMPORTANTE:
   * - El reporte se crea con estado 'pending'
   * - La generación se procesa de forma asíncrona (sin bloquear la respuesta)
   * - expires_at se calcula como created_at + 30 días
   * - En producción: usar BullMQ para procesamiento en background
   * - FIX-BE-001-2026-01-18: Ahora incluye tenant_id obligatorio
   */
  async generateReport(
    generateDto: GenerateReportDto,
    userId: string,
    tenantId: string,
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
      tenant_id: tenantId, // FIX-BE-001-2026-01-18: Agregado tenant_id
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
   * @param tenantId - ID del tenant (FIX-BE-001-2026-01-18)
   * @returns Lista paginada de reportes
   *
   * FIX-BE-001-2026-01-18: Ahora filtra por tenant_id para aislamiento multi-tenant
   */
  async getReports(query: ListReportsDto, tenantId: string): Promise<PaginatedReportsDto> {
    const { type, status, page = 1, limit = 20 } = query;

    // Construir query con filtros
    const queryBuilder = this.reportRepo.createQueryBuilder('report');

    // FIX-BE-001-2026-01-18: Filtrar por tenant_id SIEMPRE
    queryBuilder.where('report.tenant_id = :tenantId', { tenantId });

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
   * @param tenantId - ID del tenant (FIX-BE-001-2026-01-18)
   * @returns Reporte con información de descarga
   * @throws NotFoundException si el reporte no existe
   * @throws Error si el reporte no está completado
   * @throws GoneException si el reporte ha expirado (FIX-BE-004-2026-01-18)
   *
   * FIX-BE-001-2026-01-18: Ahora filtra por tenant_id
   * FIX-BE-004-2026-01-18: Valida expiración del reporte
   */
  async downloadReport(reportId: string, tenantId: string): Promise<ReportDto> {
    const report = await this.reportRepo.findOne({
      where: { id: reportId, tenant_id: tenantId }, // FIX-BE-001: Filtrar por tenant
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    // FIX-BE-004-2026-01-18: Validar expiración
    if (report.expires_at && new Date(report.expires_at) < new Date()) {
      throw new NotFoundException(`Report has expired and is no longer available`);
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
   * @param tenantId - ID del tenant (FIX-BE-001-2026-01-18)
   * @throws NotFoundException si el reporte no existe
   *
   * IMPORTANTE:
   * - Elimina registro de BD y archivo físico de storage
   * - Si el archivo no existe, solo elimina el registro
   * - FIX-BE-001-2026-01-18: Ahora filtra por tenant_id
   */
  async deleteReport(reportId: string, tenantId: string): Promise<void> {
    const report = await this.reportRepo.findOne({
      where: { id: reportId, tenant_id: tenantId }, // FIX-BE-001: Filtrar por tenant
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    // Eliminar archivo físico de storage si existe
    if (report.file_url) {
      await this.deleteReportFile(report.file_url);
    }

    await this.reportRepo.delete(reportId);
    this.logger.log(`Report ${reportId} deleted`);
  }

  /**
   * Elimina archivo físico del reporte
   *
   * @param fileUrl - URL relativa del archivo (e.g., "/reports/filename.pdf")
   *
   * IMPORTANTE:
   * - Si el archivo no existe, solo registra advertencia (no falla)
   * - Extrae nombre de archivo de la URL
   */
  private async deleteReportFile(fileUrl: string): Promise<void> {
    try {
      // Extraer nombre de archivo de la URL (basename prevents path traversal)
      const fileName = basename(fileUrl);
      if (!fileName) {
        this.logger.warn(`Invalid file URL: ${fileUrl}`);
        return;
      }

      const filePath = resolve(this.REPORTS_DIR, fileName);
      if (!filePath.startsWith(resolve(this.REPORTS_DIR))) {
        this.logger.warn(`Path traversal attempt blocked: ${fileUrl}`);
        return;
      }

      // Verificar si el archivo existe antes de eliminar
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        this.logger.log(`Report file deleted: ${fileName}`);
      } catch (error: unknown) {
        if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
          this.logger.warn(`Report file not found (already deleted?): ${fileName}`);
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error deleting report file ${fileUrl}: ${message}`,
        stack,
      );
    }
  }

  // =====================================================
  // CLEANUP AUTOMÁTICO
  // =====================================================

  /**
   * Cleanup automático de reportes vencidos
   *
   * CRON JOB: Se ejecuta diariamente a las 2:00 AM
   * - Elimina reportes con expires_at < now()
   * - Elimina archivos físicos asociados
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

      // Contador de archivos eliminados
      let filesDeleted = 0;

      // Eliminar archivos físicos de storage
      for (const report of expiredReports) {
        if (report.file_url) {
          await this.deleteReportFile(report.file_url);
          filesDeleted++;
        }
      }

      // Eliminar registros de BD
      const reportIds = expiredReports.map((r) => r.id);
      await this.reportRepo.delete(reportIds);

      this.logger.log(
        `Cleanup completed: ${expiredReports.length} expired reports deleted (${filesDeleted} files removed from storage)`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error during cleanup of expired reports: ${message}`,
        stack,
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
   * - Genera archivos binarios reales (PDF/Excel) o texto (CSV)
   * - Almacena archivo físico en uploads/reports/
   * - Actualiza estado a 'generating' → 'completed' o 'failed'
   */
  private async processReportGeneration(reportId: string): Promise<void> {
    try {
      // Actualizar estado a 'generating'
      await this.reportRepo.update(reportId, { status: 'generating' });

      // Obtener reporte actualizado
      const report = await this.reportRepo.findOne({ where: { id: reportId } });
      if (!report) {
        this.logger.error(`Report ${reportId} not found after generation`);
        return;
      }

      // Obtener datos para el reporte según el tipo
      const reportData = await this.fetchReportData(report);

      // Generar nombre de archivo único con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const extension = report.report_format === 'excel' ? 'xlsx' : report.report_format;
      const fileName = `${report.report_type}-${timestamp}.${extension}`;
      const filePath = join(this.REPORTS_DIR, fileName);

      // Generar contenido según el formato
      let content: Buffer;
      switch (report.report_format) {
        case 'pdf':
          content = await this.generatePdfContent(report, reportData);
          break;
        case 'excel':
          content = await this.generateExcelContent(report, reportData);
          break;
        case 'csv':
          content = await this.generateCsvContent(report, reportData);
          break;
        default:
          throw new Error(`Unsupported format: ${report.report_format}`);
      }

      // Guardar archivo físicamente en storage
      await fs.writeFile(filePath, content);
      const stats = await fs.stat(filePath);

      // URL relativa del archivo (para servir vía endpoint)
      const fileUrl = `/reports/${fileName}`;

      // Actualizar reporte como completado
      await this.reportRepo.update(reportId, {
        status: 'completed',
        file_url: fileUrl,
        file_size: stats.size,
        completed_at: new Date(),
      });

      this.logger.log(
        `Report ${reportId} generated successfully - File: ${fileName} (${stats.size} bytes)`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error generating report ${reportId}: ${message}`,
        stack,
      );

      // Marcar como fallido
      await this.reportRepo.update(reportId, {
        status: 'failed',
        error_message: message,
        completed_at: new Date(),
      });
    }
  }

  /**
   * Obtiene los datos para el reporte según su tipo
   */
  private async fetchReportData(report: AdminReport): Promise<Record<string, unknown>[]> {
    switch (report.report_type) {
      case 'users': {
        const users = await this.userRepo.find({
          select: ['id', 'email', 'role', 'status', 'created_at', 'last_sign_in_at'],
          take: 1000,
        });
        return users.map(u => ({
          ID: u.id,
          Email: u.email,
          Rol: u.role,
          Estado: u.status,
          'Fecha Registro': u.created_at?.toISOString().split('T')[0] || 'N/A',
          'Último Login': u.last_sign_in_at?.toISOString().split('T')[0] || 'Nunca',
        }));
      }

      case 'system': {
        // Datos de resumen del sistema
        const userCount = await this.userRepo.count();
        const tenantInfo = await this.tenantRepo.findOne({ where: { id: report.tenant_id } });
        return [{
          Métrica: 'Total Usuarios',
          Valor: userCount,
        }, {
          Métrica: 'Tenant',
          Valor: tenantInfo?.name || report.tenant_id,
        }, {
          Métrica: 'Fecha Generación',
          Valor: new Date().toISOString(),
        }];
      }

      default:
        // Para otros tipos, retornar datos de ejemplo
        return [{
          Tipo: report.report_type,
          Mensaje: 'Datos de ejemplo para el reporte',
          Generado: new Date().toISOString(),
          Metadata: JSON.stringify(report.metadata),
        }];
    }
  }

  /**
   * Genera contenido PDF para el reporte
   */
  private async generatePdfContent(report: AdminReport, data: Record<string, unknown>[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50 });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('GAMILIT - Reporte Administrativo', { align: 'center' });
      doc.moveDown();

      // Información del reporte
      doc.fontSize(12);
      doc.text(`Tipo: ${report.report_type}`);
      doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`);
      doc.text(`Solicitado por: ${report.requested_by}`);
      doc.moveDown();

      // Línea separadora
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Contenido de datos
      if (data.length === 0) {
        doc.text('No se encontraron datos para este reporte.');
      } else {
        // Obtener columnas del primer registro
        const columns = Object.keys(data[0]);

        // Mostrar datos como tabla simple
        doc.fontSize(10);
        data.forEach((row, index) => {
          if (doc.y > 700) {
            doc.addPage();
          }

          doc.fontSize(11).text(`Registro ${index + 1}:`, { underline: true });
          columns.forEach(col => {
            doc.fontSize(10).text(`  ${col}: ${row[col]}`);
          });
          doc.moveDown(0.5);
        });
      }

      // Footer
      doc.moveDown();
      doc.fontSize(8)
        .text(`Total de registros: ${data.length}`, { align: 'right' })
        .text(`Generado por GAMILIT Platform`, { align: 'right' });

      doc.end();
    });
  }

  /**
   * Genera contenido Excel para el reporte
   */
  private async generateExcelContent(report: AdminReport, data: Record<string, unknown>[]): Promise<Buffer> {
    const workbook = new Workbook();
    workbook.creator = 'GAMILIT Platform';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Reporte');

    if (data.length > 0) {
      // Configurar columnas basadas en las keys del primer registro
      const columns = Object.keys(data[0]);
      worksheet.columns = columns.map(col => ({
        header: col,
        key: col,
        width: 20,
      }));

      // Estilo del header
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      headerRow.alignment = { horizontal: 'center' };

      // Agregar datos
      data.forEach(row => {
        worksheet.addRow(row);
      });

      // Auto-filtro
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: columns.length },
      };
    } else {
      worksheet.addRow(['No se encontraron datos para este reporte']);
    }

    // Agregar hoja de metadatos
    const metaSheet = workbook.addWorksheet('Información');
    metaSheet.addRow(['Tipo de Reporte', report.report_type]);
    metaSheet.addRow(['Formato', report.report_format]);
    metaSheet.addRow(['Fecha de Generación', new Date().toLocaleString('es-MX')]);
    metaSheet.addRow(['Solicitado por', report.requested_by]);
    metaSheet.addRow(['Total de Registros', data.length]);
    metaSheet.getColumn(1).width = 25;
    metaSheet.getColumn(2).width = 40;

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /**
   * Genera contenido CSV para el reporte
   */
  private async generateCsvContent(report: AdminReport, data: Record<string, unknown>[]): Promise<Buffer> {
    if (data.length === 0) {
      return Buffer.from('No se encontraron datos para este reporte\n', 'utf-8');
    }

    const csvContent = stringify(data, {
      header: true,
      columns: Object.keys(data[0]),
      bom: true, // Agregar BOM para compatibilidad con Excel
    });

    return Buffer.from(csvContent, 'utf-8');
  }

  // =====================================================
  // P2-2026-01-07: SCHEDULE REPORTS
  // =====================================================

  /**
   * Schedule automatic report generation
   *
   * @param reportId - ID of the report template to schedule
   * @param scheduleDto - Schedule configuration
   * @param userId - ID of the user configuring the schedule
   * @returns Updated report with schedule configuration
   *
   * @task TASK-ADMIN-REPORTS-SCHEDULE
   *
   * IMPORTANTE:
   * - La configuración de schedule se almacena en metadata.schedule
   * - El cron job de generación se maneja por un servicio separado
   * - next_run_at se calcula basado en frequency/hour/day
   */
  async scheduleReport(
    reportId: string,
    scheduleDto: ScheduleReportDto,
    userId: string,
  ): Promise<ScheduleReportResponseDto> {
    // Buscar el reporte
    const report = await this.reportRepo.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    // Calcular próxima ejecución
    const nextRunAt = this.calculateNextRunTime(scheduleDto);

    // Construir configuración de schedule
    const scheduleConfig: ReportScheduleConfigDto = {
      enabled: scheduleDto.enabled,
      frequency: scheduleDto.frequency,
      hour: scheduleDto.hour ?? 8,
      day_of_week: scheduleDto.day_of_week,
      day_of_month: scheduleDto.day_of_month,
      recipients: scheduleDto.recipients,
      configured_at: new Date().toISOString(),
      configured_by: userId,
      next_run_at: scheduleDto.enabled ? nextRunAt.toISOString() : undefined,
      last_run_at: undefined,
    };

    // Actualizar metadata del reporte con schedule
    const updatedMetadata = {
      ...report.metadata,
      schedule: scheduleConfig,
    };

    await this.reportRepo.update(reportId, {
      metadata: updatedMetadata,
    });

    this.logger.log(
      `Report ${reportId} scheduled: ${scheduleDto.frequency} at ${scheduleDto.hour}:00 by user ${userId}`,
    );

    return {
      id: report.id,
      type: report.report_type,
      format: report.report_format,
      schedule: scheduleConfig,
      message: scheduleDto.enabled
        ? `Report scheduled successfully. Next run: ${nextRunAt.toISOString()}`
        : 'Report schedule disabled',
    };
  }

  /**
   * Calculate next run time based on schedule configuration
   * @private
   */
  private calculateNextRunTime(scheduleDto: ScheduleReportDto): Date {
    const now = new Date();
    const hour = scheduleDto.hour ?? 8;
    const nextRun = new Date(now);

    // Set to target hour
    nextRun.setHours(hour, 0, 0, 0);

    switch (scheduleDto.frequency) {
      case 'daily':
        // If target hour has passed today, schedule for tomorrow
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'weekly': {
        const targetDay = scheduleDto.day_of_week ?? 1; // Default Monday
        const currentDay = now.getDay();
        let daysUntilTarget = targetDay - currentDay;

        if (daysUntilTarget < 0 || (daysUntilTarget === 0 && nextRun <= now)) {
          daysUntilTarget += 7;
        }

        nextRun.setDate(nextRun.getDate() + daysUntilTarget);
        break;
      }

      case 'monthly': {
        const targetDayOfMonth = scheduleDto.day_of_month ?? 1;
        nextRun.setDate(targetDayOfMonth);

        // If target day has passed this month, schedule for next month
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
      }
    }

    return nextRun;
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
