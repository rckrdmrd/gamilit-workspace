/**
 * Dashboard Controller
 *
 * REST API endpoints for dashboard management and data retrieval.
 *
 * @module visualization/controllers
 * @sprint 4 - EXT-005 Visualizations
 */

import {
  Controller,
  Get,
  Post,
  Put,
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
import { DashboardService } from '../services';
import {
  GetDashboardDto,
  GetWidgetDataDto,
  ListDashboardsDto,
  CreateDashboardDto,
  UpdateDashboardDto,
  DashboardResponseDto,
  DashboardSnapshotResponseDto,
  DashboardListResponseDto,
  WidgetDataResponseDto,
} from '../dto';
import { DashboardScope } from '../interfaces';

@ApiTags('Visualization - Dashboards')
@ApiBearerAuth()
@Controller('visualization/dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'List dashboards' })
  @ApiResponse({
    status: 200,
    description: 'Dashboards listed successfully',
    type: DashboardListResponseDto,
  })
  async listDashboards(
    @Query() dto: ListDashboardsDto,
  ): Promise<DashboardListResponseDto> {
    return this.dashboardService.listDashboards(dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get available dashboard templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates(@Query('scope') scope?: DashboardScope) {
    return this.dashboardService.getTemplates(scope);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dashboard by ID' })
  @ApiParam({ name: 'id', description: 'Dashboard ID' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard retrieved successfully',
    type: DashboardSnapshotResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Dashboard not found' })
  async getDashboard(
    @Param('id') id: string,
    @Query() query: Omit<GetDashboardDto, 'dashboardId'>,
  ): Promise<DashboardSnapshotResponseDto> {
    return this.dashboardService.getDashboard({ ...query, dashboardId: id });
  }

  @Get(':id/widgets/:widgetId')
  @ApiOperation({ summary: 'Get widget data' })
  @ApiParam({ name: 'id', description: 'Dashboard ID' })
  @ApiParam({ name: 'widgetId', description: 'Widget ID' })
  @ApiResponse({
    status: 200,
    description: 'Widget data retrieved successfully',
    type: WidgetDataResponseDto,
  })
  async getWidgetData(
    @Param('widgetId') widgetId: string,
    @Query() query: Omit<GetWidgetDataDto, 'widgetId'>,
  ): Promise<WidgetDataResponseDto> {
    return this.dashboardService.getWidgetData({ ...query, widgetId });
  }

  @Post()
  @ApiOperation({ summary: 'Create new dashboard' })
  @ApiResponse({
    status: 201,
    description: 'Dashboard created successfully',
    type: DashboardResponseDto,
  })
  async createDashboard(
    @Body() dto: CreateDashboardDto,
  ): Promise<DashboardResponseDto> {
    // In production, get userId from JWT/session
    const userId = 'current-user-id';
    return this.dashboardService.createDashboard(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update dashboard' })
  @ApiParam({ name: 'id', description: 'Dashboard ID' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard updated successfully',
    type: DashboardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Dashboard not found' })
  async updateDashboard(
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ): Promise<DashboardResponseDto> {
    return this.dashboardService.updateDashboard(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete dashboard' })
  @ApiParam({ name: 'id', description: 'Dashboard ID' })
  @ApiResponse({ status: 204, description: 'Dashboard deleted successfully' })
  @ApiResponse({ status: 404, description: 'Dashboard not found' })
  async deleteDashboard(@Param('id') id: string): Promise<void> {
    return this.dashboardService.deleteDashboard(id);
  }
}
