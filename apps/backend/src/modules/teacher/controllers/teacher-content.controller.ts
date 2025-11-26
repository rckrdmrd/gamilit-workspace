/**
 * TeacherContentController
 *
 * @description Controller para gestión CRUD de contenido educativo personalizado
 * @module modules/teacher/controllers/teacher-content
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { TeacherGuard } from '../guards';
import { TeacherContentService } from '../services/teacher-content.service';
import {
  CreateTeacherContentDto,
  UpdateTeacherContentDto,
  GetTeacherContentQueryDto,
  TeacherContentResponseDto,
  PaginatedTeacherContentResponseDto,
  CloneTeacherContentDto,
  TeacherContentType,
  TeacherContentStatus,
  TeacherContentVisibility,
  TeacherContentDifficulty,
} from '../dto/teacher-content.dto';

/**
 * Controller para gestión de contenido educativo personalizado
 *
 * @description
 * Provee endpoints CRUD completos para contenido creado por teachers.
 * Incluye funcionalidades de clonar y publicar contenido.
 *
 * Endpoints:
 * - GET /teacher/content - Listar contenido del teacher
 * - GET /teacher/content/:id - Obtener detalle de contenido
 * - POST /teacher/content - Crear nuevo contenido
 * - PUT /teacher/content/:id - Actualizar contenido existente
 * - DELETE /teacher/content/:id - Eliminar contenido (soft delete)
 * - POST /teacher/content/:id/clone - Clonar contenido existente
 * - PATCH /teacher/content/:id/publish - Publicar contenido
 *
 * Guards:
 * - JwtAuthGuard: Usuario debe estar autenticado
 * - TeacherGuard: Usuario debe ser profesor
 */
@ApiTags('Teacher - Content')
@Controller('teacher/content')
@UseGuards(JwtAuthGuard, TeacherGuard)
@ApiBearerAuth()
export class TeacherContentController {
  constructor(private readonly contentService: TeacherContentService) {}

  // ============================================================================
  // READ OPERATIONS
  // ============================================================================

  /**
   * Lista todo el contenido del teacher autenticado
   *
   * @route GET /api/v1/teacher/content
   * @param query Parámetros de búsqueda y filtrado
   * @param req Request con datos del usuario autenticado
   * @returns Lista paginada de contenido
   */
  @Get()
  @ApiOperation({
    summary: 'Get all content for authenticated teacher',
    description:
      'Returns a paginated list of educational content created by the authenticated teacher. Supports filtering by type, status, visibility, subject area, grade level, and difficulty.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'content_type', required: false, enum: TeacherContentType })
  @ApiQuery({ name: 'status', required: false, enum: TeacherContentStatus })
  @ApiQuery({ name: 'visibility', required: false, enum: TeacherContentVisibility })
  @ApiQuery({ name: 'subject_area', required: false, type: String })
  @ApiQuery({ name: 'grade_level', required: false, type: String })
  @ApiQuery({ name: 'difficulty_level', required: false, enum: TeacherContentDifficulty })
  @ApiQuery({ name: 'is_template', required: false, type: Boolean })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean, example: true })
  @ApiResponse({
    status: 200,
    description: 'Content retrieved successfully',
    type: PaginatedTeacherContentResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a teacher',
  })
  async findAll(
    @Query() query: GetTeacherContentQueryDto,
    @Request() req: any,
  ): Promise<PaginatedTeacherContentResponseDto> {
    const teacherId = req.user.sub;
    return await this.contentService.findAll(teacherId, query);
  }

  /**
   * Obtiene un contenido específico por ID
   *
   * @route GET /api/v1/teacher/content/:id
   * @param id ID del contenido
   * @param req Request con datos del usuario autenticado
   * @returns Contenido encontrado
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get content by ID',
    description:
      'Returns detailed information about a specific educational content. Teacher must be the owner of the content.',
  })
  @ApiParam({
    name: 'id',
    description: 'Content UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Content retrieved successfully',
    type: TeacherContentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Content not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher is not the owner of this content',
  })
  async findOne(@Param('id') id: string, @Request() req: any): Promise<TeacherContentResponseDto> {
    const teacherId = req.user.sub;
    return await this.contentService.findOne(id, teacherId);
  }

  // ============================================================================
  // CREATE OPERATION
  // ============================================================================

  /**
   * Crea un nuevo contenido educativo
   *
   * @route POST /api/v1/teacher/content
   * @param dto Datos del contenido a crear
   * @param req Request con datos del usuario autenticado
   * @returns Contenido creado
   */
  @Post()
  @ApiOperation({
    summary: 'Create new educational content',
    description:
      'Creates a new educational content (exercise, worksheet, reading material, etc.) with the authenticated teacher as owner. Automatically assigns tenant_id from teacher profile.',
  })
  @ApiResponse({
    status: 201,
    description: 'Content created successfully',
    type: TeacherContentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or missing tenant_id',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a teacher',
  })
  async create(
    @Body() dto: CreateTeacherContentDto,
    @Request() req: any,
  ): Promise<TeacherContentResponseDto> {
    const teacherId = req.user.sub;
    return await this.contentService.create(teacherId, dto);
  }

  // ============================================================================
  // UPDATE OPERATION
  // ============================================================================

  /**
   * Actualiza un contenido existente
   *
   * @route PUT /api/v1/teacher/content/:id
   * @param id ID del contenido
   * @param dto Datos a actualizar
   * @param req Request con datos del usuario autenticado
   * @returns Contenido actualizado
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update educational content',
    description:
      'Updates an existing educational content. Only the owner teacher can update the content.',
  })
  @ApiParam({
    name: 'id',
    description: 'Content UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Content updated successfully',
    type: TeacherContentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Content not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher is not the owner of this content',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeacherContentDto,
    @Request() req: any,
  ): Promise<TeacherContentResponseDto> {
    const teacherId = req.user.sub;
    return await this.contentService.update(id, teacherId, dto);
  }

  // ============================================================================
  // DELETE OPERATION
  // ============================================================================

  /**
   * Elimina (soft delete) un contenido
   *
   * @route DELETE /api/v1/teacher/content/:id
   * @param id ID del contenido
   * @param req Request con datos del usuario autenticado
   * @returns Resultado de la operación
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete educational content',
    description:
      'Soft deletes an educational content by marking it as inactive. Only the owner teacher can delete the content.',
  })
  @ApiParam({
    name: 'id',
    description: 'Content UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Content deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Content "Ejercicio de Fracciones" has been deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Content not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher is not the owner of this content',
  })
  async delete(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ success: boolean; message: string }> {
    const teacherId = req.user.sub;
    return await this.contentService.delete(id, teacherId);
  }

  // ============================================================================
  // CLONE OPERATION
  // ============================================================================

  /**
   * Clona un contenido existente
   *
   * @route POST /api/v1/teacher/content/:id/clone
   * @param id ID del contenido a clonar
   * @param dto Datos para el contenido clonado
   * @param req Request con datos del usuario autenticado
   * @returns Contenido clonado
   */
  @Post(':id/clone')
  @ApiOperation({
    summary: 'Clone educational content',
    description:
      'Creates a copy of an existing educational content. The cloned content will have status "draft" and a new UUID. Only the owner can clone the content.',
  })
  @ApiParam({
    name: 'id',
    description: 'Content UUID to clone',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Content cloned successfully',
    type: TeacherContentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Content not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher is not the owner of this content',
  })
  async clone(
    @Param('id') id: string,
    @Body() dto: CloneTeacherContentDto,
    @Request() req: any,
  ): Promise<TeacherContentResponseDto> {
    const teacherId = req.user.sub;
    return await this.contentService.clone(id, teacherId, dto);
  }

  // ============================================================================
  // PUBLISH OPERATION
  // ============================================================================

  /**
   * Publica un contenido
   *
   * @route PATCH /api/v1/teacher/content/:id/publish
   * @param id ID del contenido
   * @param req Request con datos del usuario autenticado
   * @returns Contenido publicado
   */
  @Patch(':id/publish')
  @ApiOperation({
    summary: 'Publish educational content',
    description:
      'Changes the status of the content to "published" and sets the published_at timestamp. Only the owner can publish the content.',
  })
  @ApiParam({
    name: 'id',
    description: 'Content UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Content published successfully',
    type: TeacherContentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Content not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher is not the owner of this content',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Content is already published',
  })
  async publish(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<TeacherContentResponseDto> {
    const teacherId = req.user.sub;
    return await this.contentService.publish(id, teacherId);
  }
}
