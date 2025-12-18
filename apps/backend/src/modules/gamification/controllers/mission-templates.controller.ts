import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MissionTemplatesService } from '../services/mission-templates.service';
import {
  CreateMissionTemplateDto,
  UpdateMissionTemplateDto,
  MissionTemplateDto,
  MissionTemplateFilterDto,
} from '../dto/mission-templates';
import { JwtAuthGuard } from '@/modules/auth/guards';
import { AdminGuard } from '@/modules/admin/guards/admin.guard';
import { AuthRequest } from '@shared/types';

/**
 * MissionTemplatesController
 *
 * @description Controlador REST para gestión de templates de misiones (ADMIN ONLY)
 * Proporciona endpoints CRUD para configurar templates de misiones.
 *
 * Características:
 * - CRUD completo de templates
 * - Filtrado avanzado
 * - Seeding de templates iniciales
 * - Protección con AdminGuard
 *
 * @route /api/v1/admin/mission-templates
 * @security JWT Bearer Token + Admin Role
 *
 * @see Service: MissionTemplatesService
 * @see Entity: MissionTemplate
 */
@ApiTags('Admin - Mission Templates')
@Controller('admin/mission-templates')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class MissionTemplatesController {
  constructor(private readonly templatesService: MissionTemplatesService) {}

  /**
   * Lista todos los templates con filtros opcionales
   *
   * @param filters - Query params para filtrado y paginación
   * @returns Lista paginada de templates
   *
   * @example
   * GET /api/v1/admin/mission-templates?type=daily&is_active=true&limit=10&offset=0
   *
   * Response 200:
   * {
   *   "data": [...],
   *   "total": 45,
   *   "limit": 10,
   *   "offset": 0
   * }
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all mission templates',
    description: 'Obtiene todos los templates con filtros opcionales (type, category, difficulty, is_active, user_level)',
  })
  @ApiQuery({ name: 'type', required: false, enum: ['daily', 'weekly', 'special', 'classroom'] })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'difficulty', required: false, enum: ['easy', 'normal', 'hard', 'epic'] })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  @ApiQuery({ name: 'user_level', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: 200,
    description: 'Templates obtenidos exitosamente',
    schema: {
      example: {
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Completar ejercicios',
            description: 'Completa 3 ejercicios hoy',
            type: 'daily',
            category: 'exercise',
            target_type: 'complete_exercises',
            target_value: 3,
            xp_reward: 50,
            ml_coins_reward: 25,
            difficulty: 'easy',
            is_active: true,
            priority: 10,
            min_level: 1,
            max_level: null,
            icon: 'book',
            color: '#4CAF50',
            metadata: {},
            created_at: '2025-11-02T10:00:00Z',
            updated_at: '2025-11-02T10:00:00Z',
          },
        ],
        total: 45,
        limit: 50,
        offset: 0,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Requiere rol de admin',
  })
  async findAll(@Query() filters: MissionTemplateFilterDto) {
    return this.templatesService.findAll(filters);
  }

  /**
   * Obtiene un template por ID
   *
   * @param id - ID del template
   * @returns Template encontrado
   *
   * @example
   * GET /api/v1/admin/mission-templates/550e8400-e29b-41d4-a716-446655440000
   *
   * Response 200:
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "name": "Completar ejercicios",
   *   ...
   * }
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get mission template by ID',
    description: 'Obtiene un template específico por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID (UUID)',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Template encontrado',
    type: MissionTemplateDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Template no encontrado',
  })
  async findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  /**
   * Crea un nuevo template de misión
   *
   * @param dto - Datos del template
   * @param req - Request con usuario autenticado
   * @returns Template creado
   *
   * @example
   * POST /api/v1/admin/mission-templates
   * Content-Type: application/json
   *
   * {
   *   "name": "Nueva misión",
   *   "description": "Descripción de la misión",
   *   "type": "daily",
   *   "category": "exercise",
   *   "target_type": "complete_exercises",
   *   "target_value": 5,
   *   "xp_reward": 100,
   *   "ml_coins_reward": 50,
   *   "difficulty": "normal",
   *   "priority": 10
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create mission template',
    description: 'Crea un nuevo template de misión',
  })
  @ApiResponse({
    status: 201,
    description: 'Template creado exitosamente',
    type: MissionTemplateDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async create(@Body() dto: CreateMissionTemplateDto, @Request() req: AuthRequest) {
    const createdBy = req.user!.id;
    return this.templatesService.create(dto, createdBy);
  }

  /**
   * Actualiza un template existente
   *
   * @param id - ID del template
   * @param dto - Datos a actualizar
   * @returns Template actualizado
   *
   * @example
   * PATCH /api/v1/admin/mission-templates/550e8400-e29b-41d4-a716-446655440000
   * Content-Type: application/json
   *
   * {
   *   "xp_reward": 150,
   *   "ml_coins_reward": 75,
   *   "is_active": true
   * }
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update mission template',
    description: 'Actualiza un template existente (partial update)',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Template actualizado exitosamente',
    type: MissionTemplateDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Template no encontrado',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateMissionTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  /**
   * Elimina (desactiva) un template
   *
   * @param id - ID del template
   * @returns Template desactivado
   *
   * @example
   * DELETE /api/v1/admin/mission-templates/550e8400-e29b-41d4-a716-446655440000
   *
   * Response 200:
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "is_active": false,
   *   ...
   * }
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete mission template',
    description: 'Desactiva un template (soft delete - marca is_active=false)',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Template desactivado exitosamente',
    type: MissionTemplateDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Template no encontrado',
  })
  async remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }

  /**
   * Siembra templates iniciales
   *
   * @returns Resultado del seeding
   *
   * @example
   * POST /api/v1/admin/mission-templates/seed
   *
   * Response 200:
   * {
   *   "created": 5,
   *   "skipped": 2,
   *   "message": "Seed completed: 5 templates created, 2 skipped"
   * }
   */
  @Post('seed/initial')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Seed initial mission templates',
    description: 'Siembra los templates de misiones iniciales hardcodeados en la base de datos',
  })
  @ApiResponse({
    status: 200,
    description: 'Seeding completado',
    schema: {
      example: {
        created: 5,
        skipped: 2,
        message: 'Seed completed: 5 templates created, 2 skipped',
      },
    },
  })
  async seed() {
    return this.templatesService.seed();
  }
}
