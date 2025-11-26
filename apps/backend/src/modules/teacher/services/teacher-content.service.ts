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
import { Profile } from '@modules/auth/entities/profile.entity';
import {
  CreateTeacherContentDto,
  UpdateTeacherContentDto,
  GetTeacherContentQueryDto,
  TeacherContentResponseDto,
  PaginatedTeacherContentResponseDto,
  CloneTeacherContentDto,
  TeacherContentStatus,
} from '../dto/teacher-content.dto';

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
    @InjectRepository(TeacherContent, 'content')
    private readonly contentRepo: Repository<TeacherContent>,

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
    const teacherProfile = await this.profileRepo.findOne({
      where: { user_id: teacherId },
    });

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
      content_type: content.content_type as any,
      content_data: content.content_data,
      instructions: content.instructions || undefined,
      learning_objectives: content.learning_objectives,
      prerequisites: content.prerequisites || undefined,
      subject_area: content.subject_area || undefined,
      grade_level: content.grade_level || undefined,
      difficulty_level: content.difficulty_level as any,
      estimated_duration_minutes: content.estimated_duration_minutes || undefined,
      target_classrooms: content.target_classrooms,
      visibility: content.visibility as any,
      status: content.status as any,
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
