/**
 * Report Controller
 *
 * REST API endpoints for report generation and management.
 *
 * @module visualization/controllers
 * @sprint 4 - EXT-005 Visualizations
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ReportService } from '../services';
import {
  GenerateReportDto,
  ListReportTemplatesDto,
  ScheduleReportDto,
  ReportTemplateResponseDto,
  ReportTemplateListResponseDto,
  ReportJobResponseDto,
  ReportResultResponseDto,
  ScheduledReportResponseDto,
} from '../dto';

@ApiTags('Visualization - Reports')
@ApiBearerAuth()
@Controller('visualization/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('templates')
  @ApiOperation({ summary: 'List available report templates' })
  @ApiResponse({
    status: 200,
    description: 'Templates listed successfully',
    type: ReportTemplateListResponseDto,
  })
  async listTemplates(
    @Query() dto: ListReportTemplatesDto,
  ): Promise<ReportTemplateListResponseDto> {
    return this.reportService.listTemplates(dto);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get report template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({
    status: 200,
    description: 'Template retrieved successfully',
    type: ReportTemplateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplate(
    @Param('id') id: string,
  ): Promise<ReportTemplateResponseDto> {
    return this.reportService.getTemplate(id);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a report' })
  @ApiResponse({
    status: 201,
    description: 'Report generation started',
    type: ReportJobResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async generateReport(
    @Body() dto: GenerateReportDto,
  ): Promise<ReportJobResponseDto> {
    // In production, get userId from JWT/session
    const userId = 'current-user-id';
    return this.reportService.generateReport(dto, userId);
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get report job status' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved successfully',
    type: ReportJobResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobStatus(
    @Param('jobId') jobId: string,
  ): Promise<ReportJobResponseDto> {
    return this.reportService.getReportStatus({ jobId });
  }

  @Get('jobs/:jobId/download')
  @ApiOperation({ summary: 'Download generated report' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiResponse({
    status: 200,
    description: 'Report download info',
    type: ReportResultResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Report not ready' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async downloadReport(
    @Param('jobId') jobId: string,
  ): Promise<ReportResultResponseDto> {
    return this.reportService.downloadReport(jobId);
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule a recurring report' })
  @ApiResponse({
    status: 201,
    description: 'Report scheduled successfully',
    type: ScheduledReportResponseDto,
  })
  async scheduleReport(
    @Body() dto: ScheduleReportDto,
  ): Promise<ScheduledReportResponseDto> {
    // In production, get userId from JWT/session
    const userId = 'current-user-id';
    return this.reportService.scheduleReport(dto, userId);
  }

  @Get('scheduled')
  @ApiOperation({ summary: 'List scheduled reports' })
  @ApiResponse({
    status: 200,
    description: 'Scheduled reports listed successfully',
    type: [ScheduledReportResponseDto],
  })
  async listScheduledReports(): Promise<ScheduledReportResponseDto[]> {
    // In production, get userId from JWT/session
    const userId = 'current-user-id';
    return this.reportService.listScheduledReports(userId);
  }

  @Delete('scheduled/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel scheduled report' })
  @ApiParam({ name: 'id', description: 'Scheduled report ID' })
  @ApiResponse({ status: 204, description: 'Scheduled report cancelled' })
  @ApiResponse({ status: 404, description: 'Scheduled report not found' })
  async cancelScheduledReport(@Param('id') id: string): Promise<void> {
    return this.reportService.cancelScheduledReport(id);
  }
}
