import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ClassroomMissionsService } from '../services/classroom-missions.service';
import { AssignClassroomMissionDto } from '../dto/missions/assign-classroom-mission.dto';
import { ClassroomMissionResponseDto } from '../dto/missions/classroom-mission-response.dto';
import { JwtAuthGuard } from '@/modules/auth/guards';

/**
 * ClassroomMissionsController
 *
 * @description Controlador REST para gestión de misiones asignadas a aulas.
 * Permite a profesores asignar, consultar y gestionar misiones específicas para sus aulas.
 *
 * Características:
 * - Asignación de misiones a aulas con bonificaciones personalizadas
 * - Consulta de misiones por aula
 * - Consulta de aulas que usan un template de misión
 * - Eliminación/desactivación de misiones
 * - Actualización de configuración de misiones
 * - Autenticación JWT en todos los endpoints
 *
 * @route /api/v1/gamification/classrooms/:classroomId/missions*
 * @security JWT Bearer Token
 *
 * @see Service: ClassroomMissionsService
 * @see Entity: ClassroomMission
 */
@ApiTags('Gamification - Classroom Missions')
@Controller('gamification/classrooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClassroomMissionsController {
  constructor(private readonly classroomMissionsService: ClassroomMissionsService) {}

  /**
   * Asigna una misión a un aula
   *
   * @description Permite a un profesor asignar una misión a su aula.
   * Puede configurar bonificaciones adicionales, fechas de vencimiento y si es obligatoria.
   *
   * @param classroomId - ID del aula (UUID)
   * @param dto - Datos de la misión a asignar
   * @param req - Request con usuario autenticado (JWT)
   * @returns Misión asignada con recompensas totales calculadas
   *
   * @throws {BadRequestException} Si la misión ya está asignada al aula
   * @throws {NotFoundException} Si el profesor no tiene perfil
   *
   * @example
   * POST /api/v1/gamification/classrooms/660e8400-e29b-41d4-a716-446655440001/missions
   * Authorization: Bearer <token>
   * Content-Type: application/json
   *
   * Request body:
   * {
   *   "mission_template_id": "daily_complete_exercises",
   *   "title": "Complete 3 exercises",
   *   "description": "Complete 3 exercises before Friday",
   *   "mission_type": "daily",
   *   "objectives": [
   *     {
   *       "type": "complete_exercises",
   *       "target": 3,
   *       "description": "Complete 3 exercises"
   *     }
   *   ],
   *   "base_rewards": {
   *     "ml_coins": 25,
   *     "xp": 50
   *   },
   *   "bonus_xp": 10,
   *   "bonus_coins": 5,
   *   "is_mandatory": false,
   *   "due_date": "2025-12-31T23:59:59Z"
   * }
   *
   * Response 201:
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "classroom_id": "660e8400-e29b-41d4-a716-446655440001",
   *   "mission_template_id": "daily_complete_exercises",
   *   "assigned_by": "770e8400-e29b-41d4-a716-446655440002",
   *   "title": "Complete 3 exercises",
   *   "bonus_xp": 10,
   *   "bonus_coins": 5,
   *   "base_rewards": {
   *     "ml_coins": 25,
   *     "xp": 50
   *   },
   *   "total_rewards": {
   *     "ml_coins": 30,
   *     "xp": 60
   *   },
   *   "is_mandatory": false,
   *   ...
   * }
   */
  @Post(':classroomId/missions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign a mission to a classroom',
    description:
      'Assigns a mission to a specific classroom with optional bonuses and custom settings. Teachers only.',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom ID in UUID format',
    type: String,
    required: true,
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 201,
    description: 'Mission assigned successfully',
    type: ClassroomMissionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Mission already assigned to this classroom',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Teacher profile not found',
  })
  async assignMissionToClassroom(
  @Param('classroomId') classroomId: string,
    @Body() dto: AssignClassroomMissionDto,
    @Request() req: any,
  ) {
    const teacherId = req.user.id;
    return this.classroomMissionsService.assignMissionToClassroom(classroomId, teacherId, dto);
  }

  /**
   * Obtiene todas las misiones de un aula
   *
   * @description Retorna todas las misiones activas asignadas a un aula específica.
   * Incluye recompensas totales (base + bonificaciones).
   *
   * @param classroomId - ID del aula (UUID)
   * @returns Array de misiones del aula
   *
   * @example
   * GET /api/v1/gamification/classrooms/660e8400-e29b-41d4-a716-446655440001/missions
   * Authorization: Bearer <token>
   *
   * Response 200:
   * [
   *   {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "classroom_id": "660e8400-e29b-41d4-a716-446655440001",
   *     "mission_template_id": "daily_complete_exercises",
   *     "title": "Complete 3 exercises",
   *     "total_rewards": {
   *       "ml_coins": 30,
   *       "xp": 60
   *     },
   *     ...
   *   },
   *   ...
   * ]
   */
  @Get(':classroomId/missions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get classroom missions',
    description: 'Retrieves all active missions assigned to a specific classroom',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom ID in UUID format',
    type: String,
    required: true,
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Missions retrieved successfully',
    type: [ClassroomMissionResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getClassroomMissions(@Param('classroomId') classroomId: string) {
    return this.classroomMissionsService.getClassroomMissions(classroomId);
  }

  /**
   * Obtiene una misión específica de un aula
   *
   * @description Retorna los detalles de una misión específica asignada a un aula.
   *
   * @param classroomId - ID del aula (UUID)
   * @param missionTemplateId - ID del template de misión
   * @returns Detalles de la misión
   *
   * @throws {NotFoundException} Si la misión no existe o no está activa
   *
   * @example
   * GET /api/v1/gamification/classrooms/660e8400.../missions/daily_complete_exercises
   * Authorization: Bearer <token>
   *
   * Response 200:
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "classroom_id": "660e8400-e29b-41d4-a716-446655440001",
   *   "mission_template_id": "daily_complete_exercises",
   *   ...
   * }
   */
  @Get(':classroomId/missions/:missionTemplateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a specific classroom mission',
    description: 'Retrieves details of a specific mission assigned to a classroom',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom ID in UUID format',
    type: String,
    required: true,
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiParam({
    name: 'missionTemplateId',
    description: 'Mission template ID',
    type: String,
    required: true,
    example: 'daily_complete_exercises',
  })
  @ApiResponse({
    status: 200,
    description: 'Mission retrieved successfully',
    type: ClassroomMissionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Mission not found in this classroom',
  })
  async getClassroomMission(
  @Param('classroomId') classroomId: string,
    @Param('missionTemplateId') missionTemplateId: string,
  ) {
    return this.classroomMissionsService.getClassroomMission(classroomId, missionTemplateId);
  }

  /**
   * Elimina una misión de un aula
   *
   * @description Desactiva una misión asignada a un aula (soft delete).
   * No elimina el registro, solo marca is_active = false.
   *
   * @param classroomId - ID del aula (UUID)
   * @param missionTemplateId - ID del template de misión
   * @returns Mensaje de confirmación
   *
   * @throws {NotFoundException} Si la misión no existe o ya está desactivada
   *
   * @example
   * DELETE /api/v1/gamification/classrooms/660e8400.../missions/daily_complete_exercises
   * Authorization: Bearer <token>
   *
   * Response 200:
   * {
   *   "message": "Mission removed from classroom successfully"
   * }
   */
  @Delete(':classroomId/missions/:missionTemplateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove a mission from a classroom',
    description: 'Deactivates a mission assignment (soft delete). Teachers only.',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom ID in UUID format',
    type: String,
    required: true,
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiParam({
    name: 'missionTemplateId',
    description: 'Mission template ID',
    type: String,
    required: true,
    example: 'daily_complete_exercises',
  })
  @ApiResponse({
    status: 200,
    description: 'Mission removed successfully',
    schema: {
      example: {
        message: 'Mission removed from classroom successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Active mission not found in this classroom',
  })
  async removeMissionFromClassroom(
  @Param('classroomId') classroomId: string,
    @Param('missionTemplateId') missionTemplateId: string,
  ) {
    return this.classroomMissionsService.removeMissionFromClassroom(classroomId, missionTemplateId);
  }

  /**
   * Actualiza una misión de un aula
   *
   * @description Actualiza la configuración de una misión asignada a un aula.
   * Permite modificar bonificaciones, fechas de vencimiento, obligatoriedad, etc.
   *
   * @param classroomId - ID del aula (UUID)
   * @param missionTemplateId - ID del template de misión
   * @param updates - Campos a actualizar
   * @returns Misión actualizada
   *
   * @throws {NotFoundException} Si la misión no existe o no está activa
   *
   * @example
   * PATCH /api/v1/gamification/classrooms/660e8400.../missions/daily_complete_exercises
   * Authorization: Bearer <token>
   * Content-Type: application/json
   *
   * Request body:
   * {
   *   "bonus_xp": 20,
   *   "is_mandatory": true,
   *   "due_date": "2025-12-31T23:59:59Z"
   * }
   *
   * Response 200:
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "bonus_xp": 20,
   *   "is_mandatory": true,
   *   "total_rewards": {
   *     "ml_coins": 30,
   *     "xp": 70
   *   },
   *   ...
   * }
   */
  @Patch(':classroomId/missions/:missionTemplateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a classroom mission',
    description: 'Updates configuration of a mission assigned to a classroom. Teachers only.',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom ID in UUID format',
    type: String,
    required: true,
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiParam({
    name: 'missionTemplateId',
    description: 'Mission template ID',
    type: String,
    required: true,
    example: 'daily_complete_exercises',
  })
  @ApiResponse({
    status: 200,
    description: 'Mission updated successfully',
    type: ClassroomMissionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Active mission not found in this classroom',
  })
  async updateClassroomMission(
  @Param('classroomId') classroomId: string,
    @Param('missionTemplateId') missionTemplateId: string,
    @Body() updates: any,
  ) {
    return this.classroomMissionsService.updateClassroomMission(
      classroomId,
      missionTemplateId,
      updates,
    );
  }
}
