import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LtiConsumersService } from '../services';
import {
  CreateLtiConsumerDto,
  UpdateLtiConsumerDto,
  LtiConsumerResponseDto,
} from '../dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

/**
 * LtiConsumersController
 *
 * @description Gestión de LTI Consumers (configuración de LMS).
 * Endpoints para registrar, configurar y administrar integraciones LTI.
 *
 * @route /api/v1/lti/consumers
 * @security JWT Bearer token required (admin only)
 */
@ApiTags('LTI - Consumers')
@Controller('api/v1/lti/consumers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LtiConsumersController {
  constructor(private readonly consumersService: LtiConsumersService) {}

  /**
   * Obtiene todos los LTI consumers activos
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all consumers',
    description: 'Obtiene la lista de LMS configurados para integración LTI',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de consumers obtenida',
    type: [LtiConsumerResponseDto],
  })
  async findAll() {
    return this.consumersService.findAll();
  }

  /**
   * Obtiene estadísticas de consumers
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get consumer stats',
    description: 'Obtiene estadísticas de LTI consumers',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas',
    schema: {
      example: { total: 5, active: 4, verified: 3 },
    },
  })
  async getStats() {
    return this.consumersService.getStats();
  }

  /**
   * Obtiene un consumer por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get consumer by ID',
    description: 'Obtiene los detalles de un LTI consumer específico',
  })
  @ApiParam({ name: 'id', description: 'Consumer ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Consumer encontrado',
    type: LtiConsumerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Consumer no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.consumersService.findOne(id);
  }

  /**
   * Obtiene consumers por tenant
   */
  @Get('tenant/:tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get consumers by tenant',
    description: 'Obtiene los consumers de un tenant específico',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID (UUID)' })
  @ApiResponse({
    status: 200,
    type: [LtiConsumerResponseDto],
  })
  async findByTenant(@Param('tenantId') tenantId: string) {
    return this.consumersService.findByTenant(tenantId);
  }

  /**
   * Registra un nuevo LTI consumer
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create consumer',
    description: 'Registra un nuevo LMS para integración LTI 1.3',
  })
  @ApiResponse({
    status: 201,
    description: 'Consumer creado',
    type: LtiConsumerResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Consumer ya existe' })
  async create(@Body() dto: CreateLtiConsumerDto) {
    return this.consumersService.create(dto);
  }

  /**
   * Actualiza un consumer
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update consumer',
    description: 'Actualiza la configuración de un LTI consumer',
  })
  @ApiParam({ name: 'id', description: 'Consumer ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Consumer actualizado',
    type: LtiConsumerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Consumer no encontrado' })
  async update(@Param('id') id: string, @Body() dto: UpdateLtiConsumerDto) {
    return this.consumersService.update(id, dto);
  }

  /**
   * Verifica un consumer
   */
  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify consumer',
    description: 'Marca un consumer como verificado',
  })
  @ApiParam({ name: 'id', description: 'Consumer ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Consumer verificado',
    type: LtiConsumerResponseDto,
  })
  async verify(@Param('id') id: string) {
    return this.consumersService.verify(id);
  }

  /**
   * Activa un consumer desactivado
   */
  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activate consumer',
    description: 'Reactiva un consumer desactivado',
  })
  @ApiParam({ name: 'id', description: 'Consumer ID (UUID)' })
  @ApiResponse({
    status: 200,
    type: LtiConsumerResponseDto,
  })
  async activate(@Param('id') id: string) {
    return this.consumersService.activate(id);
  }

  /**
   * Desactiva un consumer (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate consumer',
    description: 'Desactiva un LTI consumer (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'Consumer ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Consumer desactivado' })
  @ApiResponse({ status: 404, description: 'Consumer no encontrado' })
  async deactivate(@Param('id') id: string) {
    await this.consumersService.deactivate(id);
  }
}
