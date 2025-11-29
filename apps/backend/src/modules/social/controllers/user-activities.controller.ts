import {
  Controller,
  Get,
  Post,
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
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UserActivitiesService } from '../services';
import { CreateActivityDto, ActivityResponseDto } from '../dto';
import { API_ROUTES, extractBasePath } from '@/shared/constants';

/**
 * UserActivitiesController
 *
 * @description Gestión de actividades de usuarios para el Activity Feed.
 * Endpoints para obtener actividades propias, feed de amigos, y registrar nuevas actividades.
 *
 * @route /api/v1/social
 */
@ApiTags('Social - User Activities')
@Controller(extractBasePath(API_ROUTES.SOCIAL.BASE))
export class UserActivitiesController {
  constructor(private readonly activitiesService: UserActivitiesService) {}

  /**
   * Obtiene las actividades del usuario autenticado
   *
   * @param userId - ID del usuario (UUID)
   * @param limit - Número máximo de actividades a retornar (opcional, default: 20)
   * @returns Lista de actividades del usuario
   *
   * @example
   * GET /api/v1/social/activities/me?limit=10
   */
  @Get('users/:userId/activities/me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user own activities',
    description: 'Obtiene las actividades recientes del usuario (achievements, level ups, exercises, etc.)',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario en formato UUID',
    type: String,
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Número máximo de actividades a retornar',
    type: Number,
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de actividades obtenida exitosamente',
    type: [ActivityResponseDto],
    schema: {
      example: [
        {
          activity_id: '660e8400-e29b-41d4-a716-446655440001',
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          activity_type: 'achievement',
          title: 'Logro desbloqueado',
          description: 'desbloqueó el logro "Perfeccionista"',
          metadata: {
            achievementId: 'mastery-002',
            achievementName: 'Perfeccionista',
          },
          is_public: true,
          created_at: '2025-01-15T10:00:00Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getUserActivities(
  @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.activitiesService.getUserActivities(userId, limit || 20);
  }

  /**
   * Obtiene el feed de actividades de amigos del usuario
   *
   * @param userId - ID del usuario (UUID)
   * @param limit - Número máximo de actividades a retornar (opcional, default: 20)
   * @returns Lista de actividades públicas de amigos
   *
   * @example
   * GET /api/v1/social/activities/feed?friendIds=uuid1,uuid2&limit=20
   *
   * NOTA: Este endpoint requiere que el frontend pase los IDs de amigos.
   * En el futuro, podría integrar automáticamente con FriendshipsService.
   */
  @Get('activities/feed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get friends activity feed',
    description: 'Obtiene el feed de actividades públicas de los amigos del usuario',
  })
  @ApiQuery({
    name: 'friendIds',
    description: 'Lista de IDs de amigos separados por comas',
    type: String,
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440001,550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Número máximo de actividades a retornar',
    type: Number,
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Feed de actividades obtenido exitosamente',
    type: [ActivityResponseDto],
    schema: {
      example: [
        {
          activity_id: '660e8400-e29b-41d4-a716-446655440003',
          user_id: '550e8400-e29b-41d4-a716-446655440001',
          activity_type: 'level_up',
          title: 'Subió de nivel',
          description: 'alcanzó el nivel 25',
          metadata: {
            newLevel: 25,
            oldLevel: 24,
          },
          is_public: true,
          created_at: '2025-01-15T09:30:00Z',
        },
      ],
    },
  })
  async getFeedActivities(
  @Query('friendIds') friendIdsParam: string,
    @Query('limit') limit?: number,
  ) {
    // Parse comma-separated UUIDs
    const friendIds = friendIdsParam ? friendIdsParam.split(',').map(id => id.trim()) : [];
    return this.activitiesService.getFeedActivities(friendIds, limit || 20);
  }

  /**
   * Registra una nueva actividad de usuario
   *
   * @param createActivityDto - Datos de la actividad a crear
   * @returns Actividad creada
   *
   * @example
   * POST /api/v1/social/activities
   * Body: {
   *   "user_id": "550e8400-e29b-41d4-a716-446655440000",
   *   "activity_type": "achievement",
   *   "title": "Logro desbloqueado",
   *   "description": "desbloqueó el logro 'Maestro de la Velocidad'",
   *   "metadata": {
   *     "achievementId": "mastery-004",
   *     "achievementName": "Maestro de la Velocidad"
   *   },
   *   "is_public": true
   * }
   */
  @Post('activities')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create user activity',
    description: 'Registra una nueva actividad de usuario en el feed',
  })
  @ApiBody({
    type: CreateActivityDto,
    description: 'Datos de la actividad a crear',
    examples: {
      achievement: {
        summary: 'Achievement unlocked',
        value: {
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          activity_type: 'achievement',
          title: 'Logro desbloqueado',
          description: "desbloqueó el logro 'Perfeccionista'",
          metadata: {
            achievementId: 'mastery-002',
            achievementName: 'Perfeccionista',
          },
          is_public: true,
        },
      },
      exercise: {
        summary: 'Exercise completed',
        value: {
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          activity_type: 'exercise',
          title: 'Ejercicio completado',
          description: "completó 'Detective Textual: El Misterio del Manuscrito' con 95%",
          metadata: {
            exerciseId: 'ex-dt-001',
            exerciseName: 'Detective Textual: El Misterio del Manuscrito',
            score: 95,
          },
          is_public: true,
        },
      },
      rankup: {
        summary: 'Rank up',
        value: {
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          activity_type: 'rankup',
          title: 'Subió de rango',
          description: 'subió a rango Halach Uinic',
          metadata: {
            newRank: 'halach_uinik',
            oldRank: 'chilan',
          },
          is_public: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Actividad creada exitosamente',
    type: ActivityResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async createActivity(@Body() createActivityDto: CreateActivityDto) {
    return this.activitiesService.createActivity(createActivityDto);
  }

  /**
   * Obtiene una actividad específica por ID
   *
   * @param activityId - ID de la actividad (UUID)
   * @returns Actividad encontrada
   *
   * @example
   * GET /api/v1/social/activities/660e8400-e29b-41d4-a716-446655440001
   */
  @Get('activities/:activityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get activity by ID',
    description: 'Obtiene una actividad específica por su ID',
  })
  @ApiParam({
    name: 'activityId',
    description: 'ID de la actividad en formato UUID',
    type: String,
    required: true,
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Actividad encontrada exitosamente',
    type: ActivityResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Actividad no encontrada',
  })
  async getActivityById(@Param('activityId') activityId: string) {
    return this.activitiesService.findById(activityId);
  }

  /**
   * Obtiene actividades públicas globales
   *
   * @param limit - Número máximo de actividades a retornar (opcional, default: 50)
   * @returns Lista de actividades públicas de todos los usuarios
   *
   * @example
   * GET /api/v1/social/activities/public?limit=50
   */
  @Get('activities/public/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get public activities',
    description: 'Obtiene actividades públicas recientes de todos los usuarios',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Número máximo de actividades a retornar',
    type: Number,
    required: false,
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Actividades públicas obtenidas exitosamente',
    type: [ActivityResponseDto],
  })
  async getPublicActivities(@Query('limit') limit?: number) {
    return this.activitiesService.getPublicActivities(limit || 50);
  }
}
