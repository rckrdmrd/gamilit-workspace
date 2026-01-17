import {
  Controller,
  Get,
  Post,
  Patch,
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
import { LtiGradePassbacksService } from '../services';
import {
  CreateLtiGradePassbackDto,
  UpdateLtiGradePassbackDto,
  LtiGradePassbackResponseDto,
} from '../dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

/**
 * LtiGradePassbacksController
 *
 * @description Gestión de envío de calificaciones a LMS externos.
 * Endpoints para crear, consultar y gestionar passbacks AGS.
 *
 * @route /api/v1/lti/grade-passbacks
 * @security JWT Bearer token required
 */
@ApiTags('LTI - Grade Passbacks')
@Controller('api/v1/lti/grade-passbacks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LtiGradePassbacksController {
  constructor(private readonly passbacksService: LtiGradePassbacksService) {}

  /**
   * Obtiene estadísticas de passbacks
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get passback stats',
    description: 'Obtiene estadísticas de grade passbacks',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        total: 500,
        pending: 10,
        success: 480,
        failed: 5,
        retrying: 5,
      },
    },
  })
  async getStats() {
    return this.passbacksService.getStats();
  }

  /**
   * Obtiene passbacks pendientes de envío
   */
  @Get('pending')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get pending passbacks',
    description: 'Obtiene los passbacks pendientes de envío al LMS',
  })
  @ApiResponse({
    status: 200,
    type: [LtiGradePassbackResponseDto],
  })
  async findPending() {
    return this.passbacksService.findPending();
  }

  /**
   * Obtiene passbacks listos para reintento
   */
  @Get('ready-for-retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get passbacks ready for retry',
    description: 'Obtiene los passbacks que fallaron y están listos para reintentar',
  })
  @ApiResponse({
    status: 200,
    type: [LtiGradePassbackResponseDto],
  })
  async findReadyForRetry() {
    return this.passbacksService.findReadyForRetry();
  }

  /**
   * Obtiene un passback por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get passback by ID',
    description: 'Obtiene los detalles de un grade passback',
  })
  @ApiParam({ name: 'id', description: 'Passback ID (UUID)' })
  @ApiResponse({
    status: 200,
    type: LtiGradePassbackResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Passback no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.passbacksService.findOne(id);
  }

  /**
   * Obtiene passbacks de un usuario
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user passbacks',
    description: 'Obtiene los passbacks de calificaciones de un usuario',
  })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 200,
    type: [LtiGradePassbackResponseDto],
  })
  async findByUser(@Param('userId') userId: string) {
    return this.passbacksService.findByUser(userId);
  }

  /**
   * Obtiene passbacks de una sesión
   */
  @Get('session/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get session passbacks',
    description: 'Obtiene los passbacks de una sesión LTI',
  })
  @ApiParam({ name: 'sessionId', description: 'Session ID (UUID)' })
  @ApiResponse({
    status: 200,
    type: [LtiGradePassbackResponseDto],
  })
  async findBySession(@Param('sessionId') sessionId: string) {
    return this.passbacksService.findBySession(sessionId);
  }

  /**
   * Crea un nuevo grade passback
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create passback',
    description: 'Registra una calificación para enviar al LMS vía AGS',
  })
  @ApiResponse({
    status: 201,
    type: LtiGradePassbackResponseDto,
  })
  async create(@Body() dto: CreateLtiGradePassbackDto) {
    return this.passbacksService.create(dto);
  }

  /**
   * Actualiza un passback
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update passback',
    description: 'Actualiza los datos de un grade passback',
  })
  @ApiParam({ name: 'id', description: 'Passback ID (UUID)' })
  @ApiResponse({
    status: 200,
    type: LtiGradePassbackResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Passback no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLtiGradePassbackDto,
  ) {
    return this.passbacksService.update(id, dto);
  }

  /**
   * Marca passback como enviándose
   */
  @Post(':id/sending')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Mark as sending',
    description: 'Marca un passback como en proceso de envío',
  })
  @ApiParam({ name: 'id', description: 'Passback ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Estado actualizado' })
  async markSending(@Param('id') id: string) {
    await this.passbacksService.markSending(id);
  }

  /**
   * Marca passback como exitoso
   */
  @Post(':id/success')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Mark as success',
    description: 'Marca un passback como enviado exitosamente',
  })
  @ApiParam({ name: 'id', description: 'Passback ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Estado actualizado' })
  async markSuccess(@Param('id') id: string) {
    await this.passbacksService.markSuccess(id);
  }

  /**
   * Marca passback como fallido
   */
  @Post(':id/failed')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Mark as failed',
    description: 'Marca un passback como fallido',
  })
  @ApiParam({ name: 'id', description: 'Passback ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Estado actualizado' })
  async markFailed(
    @Param('id') id: string,
    @Body() body: { errorMessage: string },
  ) {
    await this.passbacksService.markFailed(id, body.errorMessage);
  }
}
