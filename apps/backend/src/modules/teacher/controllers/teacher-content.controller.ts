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
  ParseUUIDPipe,
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
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { GamilityRoleEnum } from '@/shared/constants/enums.constants';
import { TeacherContentService } from '../services/teacher-content.service';
import { AuthRequest } from '@shared/types';
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
import {
  SearchSharedResourcesDto,
  ResourceRatingDto,
  AddCommentDto,
  SharedResourceResponseDto,
  PaginatedSharedResourcesResponseDto,
  PaginatedCommentsResponseDto,
  ResourceCommentResponseDto,
} from '../dto/shared-resource.dto';

/**
 * Controller para gestión de contenido educativo personalizado
 *
 * @description
 * Provee endpoints CRUD completos para contenido creado por teachers.
 * Incluye funcionalidades de clonar y publicar contenido.
 *
 * Endpoints:
 * - GET /teacher/content - Listar contenido del teacher
 * - GET /teacher/content/resources - Browse shared resources
 * - GET /teacher/content/resources/:id - Get shared resource details
 * - GET /teacher/content/resources/:id/comments - Get resource comments
 * - POST /teacher/content/resources/:id/rate - Rate a resource
 * - POST /teacher/content/resources/:id/comments - Add a comment
 * - POST /teacher/content/resources/:id/download - Record download
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
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
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
      @Request() req: AuthRequest,
  ): Promise<PaginatedTeacherContentResponseDto> {
    const teacherId = req.user!.id;
    return this.contentService.findAll(teacherId, query);
  }

  // ============================================================================
  // SHARED RESOURCES — Browse, Rate, Comment, Download
  // NOTE: These routes use 'resources' prefix and MUST be defined BEFORE ':id'
  //       to prevent NestJS from matching "resources" as a UUID param.
  // ============================================================================

  /**
   * Browse shared resources (published content with school/public visibility)
   *
   * @route GET /api/v1/teacher/content/resources
   * @param query Search and filter parameters
   * @param req Request with authenticated user
   * @returns Paginated list of shared resources
   */
  @Get('resources')
  @ApiOperation({
    summary: 'Browse shared resources',
    description:
      'Returns a paginated list of published educational resources shared with school/public visibility. Includes ratings, download counts, and comment counts.',
  })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort_by', required: false, type: String })
  @ApiQuery({ name: 'sort_order', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Shared resources retrieved successfully', type: PaginatedSharedResourcesResponseDto })
  async getSharedResources(
    @Query() query: SearchSharedResourcesDto,
      @Request() req: AuthRequest,
  ): Promise<PaginatedSharedResourcesResponseDto> {
    const teacherId = req.user!.id;
    return this.contentService.getSharedResources(teacherId, query);
  }

  /**
   * Get a single shared resource with full details
   *
   * @route GET /api/v1/teacher/content/resources/:id
   * @param id Resource UUID
   * @param req Request with authenticated user
   * @returns Shared resource details
   */
  @Get('resources/:id')
  @ApiOperation({
    summary: 'Get shared resource details',
    description: 'Returns detailed information about a specific shared resource, including rating, download count, and comment count.',
  })
  @ApiParam({ name: 'id', description: 'Resource UUID' })
  @ApiResponse({ status: 200, description: 'Resource details retrieved successfully', type: SharedResourceResponseDto })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getSharedResourceDetail(
    @Param('id', ParseUUIDPipe) id: string,
      @Request() req: AuthRequest,
  ): Promise<SharedResourceResponseDto> {
    const teacherId = req.user!.id;
    return this.contentService.getSharedResourceDetail(id, teacherId);
  }

  /**
   * Rate a shared resource (upsert)
   *
   * @route POST /api/v1/teacher/content/resources/:id/rate
   * @param id Resource UUID
   * @param dto Rating data
   * @param req Request with authenticated user
   * @returns Updated rating info
   */
  @Post('resources/:id/rate')
  @ApiOperation({
    summary: 'Rate a shared resource',
    description: 'Adds or updates a rating (1-5) for a shared resource. Each teacher can rate a resource only once.',
  })
  @ApiParam({ name: 'id', description: 'Resource UUID' })
  @ApiResponse({ status: 201, description: 'Rating saved successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async rateResource(
    @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: ResourceRatingDto,
      @Request() req: AuthRequest,
  ): Promise<{ rating: number; ratings_count: number }> {
    const teacherId = req.user!.id;
    return this.contentService.rateResource(id, teacherId, dto);
  }

  /**
   * Get paginated comments for a resource
   *
   * @route GET /api/v1/teacher/content/resources/:id/comments
   * @param id Resource UUID
   * @param page Page number
   * @param limit Items per page
   * @returns Paginated comments
   */
  @Get('resources/:id/comments')
  @ApiOperation({
    summary: 'Get resource comments',
    description: 'Returns paginated comments for a shared resource.',
  })
  @ApiParam({ name: 'id', description: 'Resource UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully', type: PaginatedCommentsResponseDto })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getResourceComments(
    @Param('id', ParseUUIDPipe) id: string,
      @Query('page') page?: number,
      @Query('limit') limit?: number,
  ): Promise<PaginatedCommentsResponseDto> {
    return this.contentService.getResourceComments(id, page || 1, limit || 20);
  }

  /**
   * Add a comment to a resource
   *
   * @route POST /api/v1/teacher/content/resources/:id/comments
   * @param id Resource UUID
   * @param dto Comment data
   * @param req Request with authenticated user
   * @returns Created comment
   */
  @Post('resources/:id/comments')
  @ApiOperation({
    summary: 'Add a comment to a resource',
    description: 'Adds a new comment to a shared resource.',
  })
  @ApiParam({ name: 'id', description: 'Resource UUID' })
  @ApiResponse({ status: 201, description: 'Comment added successfully', type: ResourceCommentResponseDto })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async addComment(
    @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: AddCommentDto,
      @Request() req: AuthRequest,
  ): Promise<ResourceCommentResponseDto> {
    const teacherId = req.user!.id;
    return this.contentService.addComment(id, teacherId, dto);
  }

  /**
   * Record a download of a resource
   *
   * @route POST /api/v1/teacher/content/resources/:id/download
   * @param id Resource UUID
   * @param req Request with authenticated user
   * @returns Download count
   */
  @Post('resources/:id/download')
  @ApiOperation({
    summary: 'Record resource download',
    description: 'Tracks that the authenticated teacher downloaded a shared resource.',
  })
  @ApiParam({ name: 'id', description: 'Resource UUID' })
  @ApiResponse({ status: 201, description: 'Download recorded successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async recordDownload(
    @Param('id', ParseUUIDPipe) id: string,
      @Request() req: AuthRequest,
  ): Promise<{ success: boolean; downloads: number }> {
    const teacherId = req.user!.id;
    return this.contentService.recordDownload(id, teacherId);
  }

  // ============================================================================
  // CONTENT DETAIL BY ID
  // ============================================================================

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
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: AuthRequest): Promise<TeacherContentResponseDto> {
    const teacherId = req.user!.id;
    return this.contentService.findOne(id, teacherId);
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
      @Request() req: AuthRequest,
  ): Promise<TeacherContentResponseDto> {
    const teacherId = req.user!.id;
    return this.contentService.create(teacherId, dto);
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
    @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateTeacherContentDto,
      @Request() req: AuthRequest,
  ): Promise<TeacherContentResponseDto> {
    const teacherId = req.user!.id;
    return this.contentService.update(id, teacherId, dto);
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
    @Param('id', ParseUUIDPipe) id: string,
      @Request() req: AuthRequest,
  ): Promise<{ success: boolean; message: string }> {
    const teacherId = req.user!.id;
    return this.contentService.delete(id, teacherId);
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
    @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: CloneTeacherContentDto,
      @Request() req: AuthRequest,
  ): Promise<TeacherContentResponseDto> {
    const teacherId = req.user!.id;
    return this.contentService.clone(id, teacherId, dto);
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
    @Param('id', ParseUUIDPipe) id: string,
      @Request() req: AuthRequest,
  ): Promise<TeacherContentResponseDto> {
    const teacherId = req.user!.id;
    return this.contentService.publish(id, teacherId);
  }
}
