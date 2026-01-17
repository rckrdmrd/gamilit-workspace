import {
  Controller,
  Get,
  Post,
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
import { LtiSessionsService } from '../services';
import { CreateLtiSessionDto, LtiSessionResponseDto } from '../dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

/**
 * LtiSessionsController
 *
 * @description Gestión de sesiones LTI (launches desde LMS).
 * Endpoints para crear, consultar y terminar sesiones.
 *
 * @route /api/v1/lti/sessions
 * @security JWT Bearer token required
 */
@ApiTags('LTI - Sessions')
@Controller('api/v1/lti/sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LtiSessionsController {
  constructor(private readonly sessionsService: LtiSessionsService) {}

  /**
   * Obtiene estadísticas de sesiones
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get session stats',
    description: 'Obtiene estadísticas de sesiones LTI',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: { total: 1000, active: 50, today: 120 },
    },
  })
  async getStats() {
    return this.sessionsService.getStats();
  }

  /**
   * Obtiene una sesión por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get session by ID',
    description: 'Obtiene los detalles de una sesión LTI',
  })
  @ApiParam({ name: 'id', description: 'Session ID (UUID)' })
  @ApiResponse({
    status: 200,
    type: LtiSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  async findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  /**
   * Obtiene sesiones activas de un usuario
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user sessions',
    description: 'Obtiene las sesiones activas de un usuario',
  })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 200,
    type: [LtiSessionResponseDto],
  })
  async findByUser(@Param('userId') userId: string) {
    return this.sessionsService.findActiveByUser(userId);
  }

  /**
   * Obtiene sesiones activas de un consumer
   */
  @Get('consumer/:consumerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get consumer sessions',
    description: 'Obtiene las sesiones activas de un LMS consumer',
  })
  @ApiParam({ name: 'consumerId', description: 'Consumer ID (UUID)' })
  @ApiResponse({
    status: 200,
    type: [LtiSessionResponseDto],
  })
  async findByConsumer(@Param('consumerId') consumerId: string) {
    return this.sessionsService.findActiveByConsumer(consumerId);
  }

  /**
   * Crea una nueva sesión LTI (post-launch)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create session',
    description: 'Registra una nueva sesión después de un LTI launch',
  })
  @ApiResponse({
    status: 201,
    type: LtiSessionResponseDto,
  })
  async create(@Body() dto: CreateLtiSessionDto) {
    return this.sessionsService.create(dto);
  }

  /**
   * Vincula sesión con usuario de Gamilit
   */
  @Post(':id/link-user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Link user to session',
    description: 'Vincula un usuario de Gamilit con la sesión LTI',
  })
  @ApiParam({ name: 'id', description: 'Session ID (UUID)' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 200,
    type: LtiSessionResponseDto,
  })
  async linkUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.sessionsService.linkUser(id, userId);
  }

  /**
   * Actualiza actividad de sesión
   */
  @Post(':id/activity')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Update session activity',
    description: 'Actualiza el timestamp de última actividad',
  })
  @ApiParam({ name: 'id', description: 'Session ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Actividad actualizada' })
  async updateActivity(@Param('id') id: string) {
    await this.sessionsService.updateActivity(id);
  }

  /**
   * Termina una sesión
   */
  @Post(':id/end')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'End session',
    description: 'Termina una sesión LTI',
  })
  @ApiParam({ name: 'id', description: 'Session ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Sesión terminada' })
  async endSession(@Param('id') id: string) {
    await this.sessionsService.endSession(id);
  }

  /**
   * Termina todas las sesiones de un usuario
   */
  @Post('user/:userId/end-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'End all user sessions',
    description: 'Termina todas las sesiones activas de un usuario',
  })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 200,
    schema: { example: { ended: 3 } },
  })
  async endUserSessions(@Param('userId') userId: string) {
    const count = await this.sessionsService.endUserSessions(userId);
    return { ended: count };
  }

  /**
   * Limpia sesiones expiradas
   */
  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cleanup expired sessions',
    description: 'Limpia sesiones sin actividad por más de 24 horas',
  })
  @ApiResponse({
    status: 200,
    schema: { example: { cleaned: 15 } },
  })
  async cleanup() {
    const count = await this.sessionsService.cleanupExpired();
    return { cleaned: count };
  }
}
