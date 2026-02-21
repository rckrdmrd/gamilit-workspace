/**
 * Teacher Content Service
 *
 * @description Service para gestión CRUD de contenido educativo personalizado de teachers
 * @module modules/teacher/services/teacher-content
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherContent } from '../entities/teacher-content.entity';
import { ResourceRating } from '../entities/resource-rating.entity';
import { ResourceComment } from '../entities/resource-comment.entity';
import { ResourceDownload } from '../entities/resource-download.entity';
import { Profile } from '@modules/auth/entities/profile.entity';
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
  ResourceCommentResponseDto,
  PaginatedCommentsResponseDto,
} from '../dto/shared-resource.dto';

/**
 * Service para gestión de contenido educativo personalizado
 *
 * @description
 * Implementa operaciones CRUD para contenido creado por teachers.
 * Incluye validaciones de ownership y permisos de acceso.
 *
 * @features
 * - CRUD completo de contenido
 * - Validación de ownership (solo acceso a propio contenido)
 * - Soft delete (marcar is_active = false)
 * - Clonar contenido existente
 * - Filtrado por tipo, estado, visibilidad
 * - Paginación
 * - Publicación de contenido
 */
@Injectable()
export class TeacherContentService {
  constructor(
    @InjectRepository(TeacherContent, 'educational')
    private readonly contentRepo: Repository<TeacherContent>,

    @InjectRepository(ResourceRating, 'educational')
    private readonly ratingRepo: Repository<ResourceRating>,

    @InjectRepository(ResourceComment, 'educational')
    private readonly commentRepo: Repository<ResourceComment>,

    @InjectRepository(ResourceDownload, 'educational')
    private readonly downloadRepo: Repository<ResourceDownload>,

    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
  ) {}

  // ============================================================================
  // READ OPERATIONS
  // ============================================================================

  /**
   * Lista el contenido del teacher autenticado
   *
   * @param teacherId - ID del teacher
   * @param query - Parámetros de búsqueda y filtrado
   * @returns Lista paginada de contenido
   */
  async findAll(
    teacherId: string,
    query: GetTeacherContentQueryDto,
  ): Promise<PaginatedTeacherContentResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      content_type,
      status,
      visibility,
      subject_area,
      grade_level,
      difficulty_level,
      is_template,
      is_active = true,
    } = query;

    // Construir query base
    const queryBuilder = this.contentRepo
      .createQueryBuilder('tc')
      .where('tc.teacher_id = :teacherId', { teacherId });

    // Filtro de activo/inactivo
    if (is_active !== undefined) {
      queryBuilder.andWhere('tc.is_active = :isActive', { isActive: is_active });
    }

    // Filtro de búsqueda (título, descripción, palabras clave)
    if (search) {
      queryBuilder.andWhere(
        `(
          tc.title ILIKE :search OR
          tc.description ILIKE :search OR
          tc.keywords::text ILIKE :search
        )`,
        { search: `%${search}%` },
      );
    }

    // Filtro de tipo de contenido
    if (content_type) {
      queryBuilder.andWhere('tc.content_type = :contentType', { contentType: content_type });
    }

    // Filtro de estado
    if (status) {
      queryBuilder.andWhere('tc.status = :status', { status });
    }

    // Filtro de visibilidad
    if (visibility) {
      queryBuilder.andWhere('tc.visibility = :visibility', { visibility });
    }

    // Filtro de área de asignatura
    if (subject_area) {
      queryBuilder.andWhere('tc.subject_area = :subjectArea', { subjectArea: subject_area });
    }

    // Filtro de nivel de grado
    if (grade_level) {
      queryBuilder.andWhere('tc.grade_level = :gradeLevel', { gradeLevel: grade_level });
    }

    // Filtro de dificultad
    if (difficulty_level) {
      queryBuilder.andWhere('tc.difficulty_level = :difficultyLevel', {
        difficultyLevel: difficulty_level,
      });
    }

    // Filtro de plantillas
    if (is_template !== undefined) {
      queryBuilder.andWhere('tc.is_template = :isTemplate', { isTemplate: is_template });
    }

    // Obtener total de registros
    const total = await queryBuilder.getCount();

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Ordenar por fecha de creación (más recientes primero)
    queryBuilder.orderBy('tc.created_at', 'DESC');

    // Ejecutar query
    const contents = await queryBuilder.getMany();

    // Mapear a DTO
    const data = contents.map((content) => this.mapToResponseDto(content));

    // Calcular paginación
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Obtiene un contenido específico por ID
   *
   * @param id - ID del contenido
   * @param teacherId - ID del teacher (para validación de ownership)
   * @returns Contenido encontrado
   *
   * @throws NotFoundException si el contenido no existe
   * @throws ForbiddenException si el teacher no es el owner
   */
  async findOne(id: string, teacherId: string): Promise<TeacherContentResponseDto> {
    const content = await this.contentRepo.findOne({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    // Validar ownership
    this.validateOwnership(content, teacherId);

    return this.mapToResponseDto(content);
  }

  // ============================================================================
  // CREATE OPERATION
  // ============================================================================

  /**
   * Crea un nuevo contenido educativo
   *
   * @param teacherId - ID del teacher que crea el contenido
   * @param dto - Datos del contenido a crear
   * @returns Contenido creado
   *
   * @throws BadRequestException si el teacher no tiene tenant_id
   */
  async create(
    teacherId: string,
    dto: CreateTeacherContentDto,
  ): Promise<TeacherContentResponseDto> {
    // Obtener tenant_id del teacher
    // DB-125: Try profile.id first (JWT sub = profiles.id)
    let teacherProfile = await this.profileRepo.findOne({
      where: { id: teacherId },
    });

    if (!teacherProfile) {
      // Fallback: teacherId might be auth.users.id
      teacherProfile = await this.profileRepo.findOne({
        where: { user_id: teacherId },
      });
    }

    if (!teacherProfile || !teacherProfile.tenant_id) {
      throw new BadRequestException('Teacher profile or tenant_id not found');
    }

    // Crear contenido
    const content = this.contentRepo.create({
      ...dto,
      teacher_id: teacherId,
      tenant_id: teacherProfile.tenant_id,
      is_active: true,
      times_assigned: 0,
      times_completed: 0,
      rating_count: 0,
      teacher_rating_count: 0,
      version_number: 1,
      published_version: 1,
      is_latest_version: true,
    });

    const savedContent = await this.contentRepo.save(content);

    return this.mapToResponseDto(savedContent);
  }

  // ============================================================================
  // UPDATE OPERATION
  // ============================================================================

  /**
   * Actualiza un contenido existente
   *
   * @param id - ID del contenido
   * @param teacherId - ID del teacher que actualiza
   * @param dto - Datos a actualizar
   * @returns Contenido actualizado
   *
   * @throws NotFoundException si el contenido no existe
   * @throws ForbiddenException si el teacher no es el owner
   */
  async update(
    id: string,
    teacherId: string,
    dto: UpdateTeacherContentDto,
  ): Promise<TeacherContentResponseDto> {
    const content = await this.contentRepo.findOne({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    // Validar ownership
    this.validateOwnership(content, teacherId);

    // Actualizar campos
    Object.assign(content, dto);

    const updatedContent = await this.contentRepo.save(content);

    return this.mapToResponseDto(updatedContent);
  }

  // ============================================================================
  // DELETE OPERATION (SOFT DELETE)
  // ============================================================================

  /**
   * Elimina (soft delete) un contenido
   *
   * @param id - ID del contenido
   * @param teacherId - ID del teacher que elimina
   * @returns Resultado de la operación
   *
   * @throws NotFoundException si el contenido no existe
   * @throws ForbiddenException si el teacher no es el owner
   */
  async delete(id: string, teacherId: string): Promise<{ success: boolean; message: string }> {
    const content = await this.contentRepo.findOne({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    // Validar ownership
    this.validateOwnership(content, teacherId);

    // Soft delete: marcar como inactivo
    content.is_active = false;
    await this.contentRepo.save(content);

    return {
      success: true,
      message: `Content "${content.title}" has been deleted successfully`,
    };
  }

  // ============================================================================
  // CLONE OPERATION
  // ============================================================================

  /**
   * Clona un contenido existente
   *
   * @param id - ID del contenido a clonar
   * @param teacherId - ID del teacher que clona
   * @param dto - Datos para el contenido clonado
   * @returns Contenido clonado
   *
   * @throws NotFoundException si el contenido no existe
   * @throws ForbiddenException si el teacher no es el owner
   */
  async clone(
    id: string,
    teacherId: string,
    dto: CloneTeacherContentDto,
  ): Promise<TeacherContentResponseDto> {
    const originalContent = await this.contentRepo.findOne({
      where: { id },
    });

    if (!originalContent) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    // Validar ownership
    this.validateOwnership(originalContent, teacherId);

    // Determinar nuevo título
    const newTitle = dto.new_title || `Copia de ${originalContent.title}`;

    // Crear copia del contenido
    const clonedContent = this.contentRepo.create({
      ...originalContent,
      id: undefined, // Nuevo UUID generado automáticamente
      title: newTitle,
      status: TeacherContentStatus.DRAFT, // Siempre comienza como draft
      is_active: true,
      published_at: null,
      times_assigned: 0,
      times_completed: 0,
      average_score: null,
      average_duration_minutes: null,
      rating_count: 0,
      teacher_rating_count: 0,
      student_rating: null,
      teacher_rating: null,
      based_on_content_id: originalContent.id, // Referencia al original
      version_number: 1,
      is_latest_version: true,
      previous_version_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedContent = await this.contentRepo.save(clonedContent);

    return this.mapToResponseDto(savedContent);
  }

  // ============================================================================
  // PUBLISH OPERATION
  // ============================================================================

  /**
   * Publica un contenido (cambia status a 'published')
   *
   * @param id - ID del contenido
   * @param teacherId - ID del teacher que publica
   * @returns Contenido publicado
   *
   * @throws NotFoundException si el contenido no existe
   * @throws ForbiddenException si el teacher no es el owner
   * @throws BadRequestException si el contenido ya está publicado
   */
  async publish(id: string, teacherId: string): Promise<TeacherContentResponseDto> {
    const content = await this.contentRepo.findOne({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    // Validar ownership
    this.validateOwnership(content, teacherId);

    // Validar que no esté ya publicado
    if (content.status === TeacherContentStatus.PUBLISHED) {
      throw new BadRequestException('Content is already published');
    }

    // Publicar
    content.status = TeacherContentStatus.PUBLISHED;
    content.published_at = new Date();

    const publishedContent = await this.contentRepo.save(content);

    return this.mapToResponseDto(publishedContent);
  }

  // ============================================================================
  // SHARED RESOURCES — Browse, Rate, Comment, Download
  // ============================================================================

  /**
   * Browse shared resources (published content with school/public visibility)
   *
   * @param teacherId - ID of the browsing teacher
   * @param query - Search and filter parameters
   * @returns Paginated list of shared resources with aggregated metrics
   */
  async getSharedResources(
    teacherId: string,
    query: SearchSharedResourcesDto,
  ): Promise<PaginatedSharedResourcesResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      category,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = query;

    const qb = this.contentRepo
      .createQueryBuilder('tc')
      .where('tc.visibility IN (:...visibilities)', { visibilities: ['school', 'public'] })
      .andWhere('tc.status = :status', { status: 'published' })
      .andWhere('tc.is_active = :isActive', { isActive: true });

    // Filters
    if (search) {
      qb.andWhere(
        `(tc.title ILIKE :search OR tc.description ILIKE :search OR tc.tags::text ILIKE :search)`,
        { search: `%${search}%` },
      );
    }
    if (type) {
      qb.andWhere('tc.content_type = :type', { type });
    }
    if (category) {
      qb.andWhere('tc.subject_area = :category', { category });
    }

    const total = await qb.getCount();

    // Sorting
    const sortColumn = sort_by === 'title' ? 'tc.title' : `tc.${sort_by === 'rating' ? 'teacher_rating' : sort_by === 'downloads' ? 'times_completed' : 'created_at'}`;
    qb.orderBy(sortColumn, sort_order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const resources = await qb.getMany();

    // Collect resource IDs for batch lookups
    const resourceIds = resources.map((r) => r.id);
    const teacherIds = [...new Set(resources.map((r) => r.teacher_id))];

    // Batch: profile names
    const profiles = teacherIds.length > 0
      ? await this.profileRepo
          .createQueryBuilder('p')
          .select(['p.id', 'p.full_name', 'p.display_name'])
          .whereInIds(teacherIds)
          .getMany()
      : [];
    const profileMap = new Map(profiles.map((p) => [p.id, p.display_name || p.full_name || 'Profesor']));

    // Batch: rating aggregates
    let ratingMap = new Map<string, { avg: number; count: number }>();
    if (resourceIds.length > 0) {
      const ratingAggs = await this.ratingRepo
        .createQueryBuilder('rr')
        .select('rr.resource_id', 'resource_id')
        .addSelect('AVG(rr.rating)', 'avg')
        .addSelect('COUNT(rr.id)', 'count')
        .where('rr.resource_id IN (:...ids)', { ids: resourceIds })
        .groupBy('rr.resource_id')
        .getRawMany();
      ratingMap = new Map(ratingAggs.map((r) => [r.resource_id, { avg: parseFloat(r.avg) || 0, count: parseInt(r.count) || 0 }]));
    }

    // Batch: download counts
    let downloadMap = new Map<string, number>();
    if (resourceIds.length > 0) {
      const downloadAggs = await this.downloadRepo
        .createQueryBuilder('rd')
        .select('rd.resource_id', 'resource_id')
        .addSelect('COUNT(rd.id)', 'count')
        .where('rd.resource_id IN (:...ids)', { ids: resourceIds })
        .groupBy('rd.resource_id')
        .getRawMany();
      downloadMap = new Map(downloadAggs.map((d) => [d.resource_id, parseInt(d.count) || 0]));
    }

    // Batch: comment counts
    let commentMap = new Map<string, number>();
    if (resourceIds.length > 0) {
      const commentAggs = await this.commentRepo
        .createQueryBuilder('rc')
        .select('rc.resource_id', 'resource_id')
        .addSelect('COUNT(rc.id)', 'count')
        .where('rc.resource_id IN (:...ids)', { ids: resourceIds })
        .andWhere('rc.is_deleted = :deleted', { deleted: false })
        .groupBy('rc.resource_id')
        .getRawMany();
      commentMap = new Map(commentAggs.map((c) => [c.resource_id, parseInt(c.count) || 0]));
    }

    // Batch: current teacher's ratings
    let userRatingMap = new Map<string, number>();
    if (resourceIds.length > 0) {
      const userRatings = await this.ratingRepo
        .createQueryBuilder('rr')
        .select(['rr.resource_id', 'rr.rating'])
        .where('rr.resource_id IN (:...ids)', { ids: resourceIds })
        .andWhere('rr.teacher_id = :teacherId', { teacherId })
        .getMany();
      userRatingMap = new Map(userRatings.map((r) => [r.resource_id, r.rating]));
    }

    // Map to response DTOs
    const data: SharedResourceResponseDto[] = resources.map((r) => {
      const ratingData = ratingMap.get(r.id) || { avg: 0, count: 0 };
      return {
        id: r.id,
        title: r.title,
        description: r.description || '',
        type: r.content_type,
        category: r.subject_area || 'General',
        author_id: r.teacher_id,
        author_name: profileMap.get(r.teacher_id) || 'Profesor',
        shared_at: (r.published_at || r.created_at).toISOString(),
        rating: Math.round(ratingData.avg * 10) / 10,
        ratings_count: ratingData.count,
        downloads: downloadMap.get(r.id) || 0,
        comments_count: commentMap.get(r.id) || 0,
        tags: r.tags || [],
        user_rating: userRatingMap.get(r.id),
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get a single shared resource with full details
   *
   * @param resourceId - Resource ID
   * @param teacherId - ID of the requesting teacher
   * @returns Shared resource details
   */
  async getSharedResourceDetail(
    resourceId: string,
    teacherId: string,
  ): Promise<SharedResourceResponseDto> {
    const resource = await this.contentRepo.findOne({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    // Shared resources must be published and visible
    if (resource.status !== 'published' || !['school', 'public'].includes(resource.visibility)) {
      // Allow owner to see their own content regardless
      if (resource.teacher_id !== teacherId) {
        throw new NotFoundException(`Resource with ID ${resourceId} not found`);
      }
    }

    // Fetch author profile
    const profile = await this.profileRepo.findOne({ where: { id: resource.teacher_id } });
    const authorName = profile?.display_name || profile?.full_name || 'Profesor';

    // Rating aggregate
    const ratingAgg = await this.ratingRepo
      .createQueryBuilder('rr')
      .select('AVG(rr.rating)', 'avg')
      .addSelect('COUNT(rr.id)', 'count')
      .where('rr.resource_id = :resourceId', { resourceId })
      .getRawOne();

    // Download count
    const downloadCount = await this.downloadRepo.count({ where: { resource_id: resourceId } });

    // Comment count
    const commentCount = await this.commentRepo.count({
      where: { resource_id: resourceId, is_deleted: false },
    });

    // User's own rating
    const userRating = await this.ratingRepo.findOne({
      where: { resource_id: resourceId, teacher_id: teacherId },
    });

    return {
      id: resource.id,
      title: resource.title,
      description: resource.description || '',
      type: resource.content_type,
      category: resource.subject_area || 'General',
      author_id: resource.teacher_id,
      author_name: authorName,
      shared_at: (resource.published_at || resource.created_at).toISOString(),
      rating: Math.round((parseFloat(ratingAgg?.avg) || 0) * 10) / 10,
      ratings_count: parseInt(ratingAgg?.count) || 0,
      downloads: downloadCount,
      comments_count: commentCount,
      tags: resource.tags || [],
      user_rating: userRating?.rating,
    };
  }

  /**
   * Rate a shared resource (upsert)
   *
   * @param resourceId - Resource ID
   * @param teacherId - Teacher ID giving the rating
   * @param dto - Rating data (1-5)
   * @returns Updated resource info
   */
  async rateResource(
    resourceId: string,
    teacherId: string,
    dto: ResourceRatingDto,
  ): Promise<{ rating: number; ratings_count: number }> {
    // Verify resource exists and is shared
    const resource = await this.contentRepo.findOne({ where: { id: resourceId } });
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    // Upsert rating
    const existing = await this.ratingRepo.findOne({
      where: { resource_id: resourceId, teacher_id: teacherId },
    });

    if (existing) {
      existing.rating = dto.rating;
      await this.ratingRepo.save(existing);
    } else {
      const newRating = this.ratingRepo.create({
        resource_id: resourceId,
        teacher_id: teacherId,
        rating: dto.rating,
      });
      await this.ratingRepo.save(newRating);
    }

    // Return updated aggregate
    const agg = await this.ratingRepo
      .createQueryBuilder('rr')
      .select('AVG(rr.rating)', 'avg')
      .addSelect('COUNT(rr.id)', 'count')
      .where('rr.resource_id = :resourceId', { resourceId })
      .getRawOne();

    return {
      rating: Math.round((parseFloat(agg?.avg) || 0) * 10) / 10,
      ratings_count: parseInt(agg?.count) || 0,
    };
  }

  /**
   * Get paginated comments for a resource
   *
   * @param resourceId - Resource ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated comments with author names
   */
  async getResourceComments(
    resourceId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedCommentsResponseDto> {
    // Verify resource exists
    const exists = await this.contentRepo.count({ where: { id: resourceId } });
    if (!exists) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await this.commentRepo.findAndCount({
      where: { resource_id: resourceId, is_deleted: false },
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    // Fetch author profiles
    const authorIds = [...new Set(comments.map((c) => c.author_id))];
    const profiles = authorIds.length > 0
      ? await this.profileRepo
          .createQueryBuilder('p')
          .select(['p.id', 'p.full_name', 'p.display_name'])
          .whereInIds(authorIds)
          .getMany()
      : [];
    const profileMap = new Map(profiles.map((p) => [p.id, p.display_name || p.full_name || 'Profesor']));

    const data: ResourceCommentResponseDto[] = comments.map((c) => ({
      id: c.id,
      author_id: c.author_id,
      author_name: profileMap.get(c.author_id) || 'Profesor',
      text: c.text,
      created_at: c.created_at,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: { page, limit, total, totalPages },
    };
  }

  /**
   * Add a comment to a resource
   *
   * @param resourceId - Resource ID
   * @param teacherId - Comment author ID
   * @param dto - Comment data
   * @returns Created comment with author name
   */
  async addComment(
    resourceId: string,
    teacherId: string,
    dto: AddCommentDto,
  ): Promise<ResourceCommentResponseDto> {
    // Verify resource exists
    const exists = await this.contentRepo.count({ where: { id: resourceId } });
    if (!exists) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    const comment = this.commentRepo.create({
      resource_id: resourceId,
      author_id: teacherId,
      text: dto.text,
    });
    const saved = await this.commentRepo.save(comment);

    // Fetch author name
    const profile = await this.profileRepo.findOne({ where: { id: teacherId } });
    const authorName = profile?.display_name || profile?.full_name || 'Profesor';

    return {
      id: saved.id,
      author_id: saved.author_id,
      author_name: authorName,
      text: saved.text,
      created_at: saved.created_at,
    };
  }

  /**
   * Record a download of a resource
   *
   * @param resourceId - Resource ID
   * @param teacherId - Downloader teacher ID
   * @returns Success message with updated download count
   */
  async recordDownload(
    resourceId: string,
    teacherId: string,
  ): Promise<{ success: boolean; downloads: number }> {
    // Verify resource exists
    const exists = await this.contentRepo.count({ where: { id: resourceId } });
    if (!exists) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    const download = this.downloadRepo.create({
      resource_id: resourceId,
      downloaded_by: teacherId,
    });
    await this.downloadRepo.save(download);

    const downloads = await this.downloadRepo.count({ where: { resource_id: resourceId } });

    return { success: true, downloads };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Valida que el teacher sea el owner del contenido
   *
   * @private
   * @throws ForbiddenException si el teacher no es el owner
   */
  private validateOwnership(content: TeacherContent, teacherId: string): void {
    if (content.teacher_id !== teacherId) {
      throw new ForbiddenException('You do not have permission to access this content');
    }
  }

  /**
   * Mapea TeacherContent entity a TeacherContentResponseDto
   *
   * @private
   */
  private mapToResponseDto(content: TeacherContent): TeacherContentResponseDto {
    return {
      id: content.id,
      teacher_id: content.teacher_id,
      tenant_id: content.tenant_id || '',
      title: content.title,
      description: content.description || undefined,
      content_type: content.content_type as TeacherContentType,
      content_data: content.content_data,
      instructions: content.instructions || undefined,
      learning_objectives: content.learning_objectives,
      prerequisites: content.prerequisites || undefined,
      subject_area: content.subject_area || undefined,
      grade_level: content.grade_level || undefined,
      difficulty_level: content.difficulty_level as TeacherContentDifficulty,
      estimated_duration_minutes: content.estimated_duration_minutes || undefined,
      target_classrooms: content.target_classrooms,
      visibility: content.visibility as TeacherContentVisibility,
      status: content.status as TeacherContentStatus,
      is_active: content.is_active,
      is_template: content.is_template,
      is_shared: content.is_shared,
      points_value: content.points_value,
      ml_coins_reward: content.ml_coins_reward,
      times_assigned: content.times_assigned,
      times_completed: content.times_completed,
      created_at: content.created_at,
      updated_at: content.updated_at,
      published_at: content.published_at || undefined,
    };
  }
}
