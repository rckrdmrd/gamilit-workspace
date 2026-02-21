import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
  StreamableFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProduces } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join, resolve, basename } from 'path';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminReportsService } from '../services/admin-reports.service';
import {
  ReportDto,
  GenerateReportDto,
  ListReportsDto,
  PaginatedReportsDto,
  // P2-2026-01-07: Schedule report DTOs
  ScheduleReportDto,
  ScheduleReportResponseDto,
} from '../dto/reports';
import { AuthRequest } from '@shared/types';

@ApiTags('admin-public', 'Admin - Reports')
@Controller('admin/reports')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generate a new report',
    description:
      'Generate a new report of specified type and format. Report generation is asynchronous.',
  })
  async generateReport(
    @Body() generateDto: GenerateReportDto,
      @Request() req: AuthRequest,
  ): Promise<ReportDto> {
    const userId = req.user!.id;
    const tenantId = req.user!.tenant_id!;
    return this.adminReportsService.generateReport(generateDto, userId, tenantId);
  }

  @Get()
  @ApiOperation({
    summary: 'List all reports',
    description:
      'Retrieve a paginated list of reports with optional filters',
  })
  async getReports(
    @Query() query: ListReportsDto,
    @Request() req: AuthRequest,
  ): Promise<PaginatedReportsDto> {
    const tenantId = req.user!.tenant_id!;
    return this.adminReportsService.getReports(query, tenantId);
  }

  private static readonly REPORTS_DIR = join(process.cwd(), 'apps', 'backend', 'uploads', 'reports');

  /**
   * Obtiene el MIME type según el formato del reporte
   */
  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv; charset=utf-8',
    };
    return mimeTypes[format] || 'application/octet-stream';
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Download a report',
    description:
      'Download a completed report file. Returns the actual file with proper Content-Type.',
  })
  @ApiProduces('application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv')
  async downloadReport(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const tenantId = req.user!.tenant_id!;
    const report = await this.adminReportsService.downloadReport(id, tenantId);

    // Extraer nombre del archivo de la URL (basename prevents path traversal)
    const fileName = basename(report.file_url!);
    const filePath = resolve(AdminReportsController.REPORTS_DIR, fileName);
    if (!filePath.startsWith(resolve(AdminReportsController.REPORTS_DIR))) {
      throw new BadRequestException('Invalid file path');
    }

    // Configurar headers de respuesta
    const mimeType = this.getMimeType(report.format);
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    // Crear stream del archivo
    const fileStream = createReadStream(filePath);
    return new StreamableFile(fileStream);
  }

  @Get(':id/info')
  @ApiOperation({
    summary: 'Get report info',
    description:
      'Get report metadata without downloading the file.',
  })
  async getReportInfo(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<ReportDto> {
    const tenantId = req.user!.tenant_id!;
    return this.adminReportsService.downloadReport(id, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a report',
    description: 'Delete a report and its associated file',
  })
  async deleteReport(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<void> {
    const tenantId = req.user!.tenant_id!;
    await this.adminReportsService.deleteReport(id, tenantId);
  }

  // =====================================================
  // P2-2026-01-07: SCHEDULE REPORTS
  // =====================================================

  @Post(':id/schedule')
  @ApiOperation({
    summary: 'Schedule report generation',
    description:
      'Configure automatic periodic generation of a report. Schedule config is stored in report metadata.',
  })
  async scheduleReport(
    @Param('id') id: string,
    @Body() scheduleDto: ScheduleReportDto,
    @Request() req: AuthRequest,
  ): Promise<ScheduleReportResponseDto> {
    const userId = req.user!.id;
    return this.adminReportsService.scheduleReport(id, scheduleDto, userId);
  }
}
