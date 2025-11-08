import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Module } from '@modules/educational/entities/module.entity';
import { Exercise } from '@modules/educational/entities/exercise.entity';
import { ContentTemplate } from '@modules/content/entities/content-template.entity';
import { MediaFile } from '@modules/content/entities/media-file.entity';
import {
  ListContentDto,
  ApproveContentDto,
  RejectContentDto,
  ContentDto,
  PaginatedContentDto,
  ListMediaDto,
  PaginatedMediaDto,
} from '../dto/content';
import { ContentStatusEnum } from '@shared/constants';
import { MediaFileResponseDto } from '@modules/content/dto/media-file-response.dto';

@Injectable()
export class AdminContentService {
  constructor(
    @InjectRepository(Module, 'educational')
    private readonly moduleRepo: Repository<Module>,
    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepo: Repository<Exercise>,
    @InjectRepository(ContentTemplate, 'content')
    private readonly templateRepo: Repository<ContentTemplate>,
    @InjectRepository(MediaFile, 'content')
    private readonly mediaFileRepo: Repository<MediaFile>,
  ) {}

  /**
   * Get pending content for approval (modules, exercises, templates)
   */
  async getPendingContent(
    query: ListContentDto,
  ): Promise<PaginatedContentDto> {
    const {
      content_type,
      status = ContentStatusEnum.UNDER_REVIEW,
      search,
      created_by,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    let data: any[] = [];
    let total = 0;

    // If specific content type is requested
    if (content_type === 'module') {
      const result = await this.getModules(
        status,
        search,
        created_by,
        skip,
        limit,
      );
      data = result.data.map((m) => this.mapModuleToContentDto(m));
      total = result.total;
    } else if (content_type === 'exercise') {
      const result = await this.getExercises(
        search,
        created_by,
        skip,
        limit,
      );
      data = result.data.map((e) => this.mapExerciseToContentDto(e));
      total = result.total;
    } else if (content_type === 'template') {
      const result = await this.getTemplates(
        search,
        created_by,
        skip,
        limit,
      );
      data = result.data.map((t) => this.mapTemplateToContentDto(t));
      total = result.total;
    } else {
      // Get all types (modules only for now, as exercises don't have status)
      const result = await this.getModules(
        status,
        search,
        created_by,
        skip,
        limit,
      );
      data = result.data.map((m) => this.mapModuleToContentDto(m));
      total = result.total;
    }

    return {
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Approve content by ID
   */
  async approveContent(
    id: string,
    approvalDto: ApproveContentDto,
    adminId: string,
  ): Promise<ContentDto> {
    // Try to find content in different repositories
    let content: any;
    let contentType: 'module' | 'exercise' | 'template';

    // Try Module first
    content = await this.moduleRepo.findOne({ where: { id } });
    if (content) {
      contentType = 'module';
    } else {
      // Try Exercise
      content = await this.exerciseRepo.findOne({ where: { id } });
      if (content) {
        contentType = 'exercise';
      } else {
        // Try ContentTemplate
        content = await this.templateRepo.findOne({ where: { id } });
        if (content) {
          contentType = 'template';
        } else {
          throw new NotFoundException(`Content ${id} not found`);
        }
      }
    }

    // Update content status and approval fields
    if (contentType === 'module') {
      content.status = ContentStatusEnum.PUBLISHED;
      content.approved_by = adminId;

      if (approvalDto.publish_immediately !== false) {
        content.is_published = true;
        content.published_at = new Date();
      }

      // Add approval notes to metadata
      if (approvalDto.approval_notes) {
        content.metadata = {
          ...content.metadata,
          approval_notes: approvalDto.approval_notes,
          approved_at: new Date().toISOString(),
        };
      }

      const updated = await this.moduleRepo.save(content);
      return this.mapModuleToContentDto(updated);
    } else if (contentType === 'exercise') {
      // Exercises don't have status enum, just mark as reviewed
      content.reviewed_by = adminId;
      content.is_active = true;

      content.metadata = {
        ...content.metadata,
        approved: true,
        approval_notes: approvalDto.approval_notes,
        approved_at: new Date().toISOString(),
      };

      const updated = await this.exerciseRepo.save(content);
      return this.mapExerciseToContentDto(updated);
    } else {
      // ContentTemplate approval
      content.is_public = approvalDto.publish_immediately !== false;
      content.metadata = {
        ...content.metadata,
        approved: true,
        approved_by: adminId,
        approval_notes: approvalDto.approval_notes,
        approved_at: new Date().toISOString(),
      };

      const updated = await this.templateRepo.save(content);
      return this.mapTemplateToContentDto(updated);
    }
  }

  /**
   * Reject content with reason
   */
  async rejectContent(
    id: string,
    rejectionDto: RejectContentDto,
    adminId: string,
  ): Promise<ContentDto> {
    // Try to find content in different repositories
    let content: any;
    let contentType: 'module' | 'exercise' | 'template';

    // Try Module first
    content = await this.moduleRepo.findOne({ where: { id } });
    if (content) {
      contentType = 'module';
    } else {
      // Try Exercise
      content = await this.exerciseRepo.findOne({ where: { id } });
      if (content) {
        contentType = 'exercise';
      } else {
        // Try ContentTemplate
        content = await this.templateRepo.findOne({ where: { id } });
        if (content) {
          contentType = 'template';
        } else {
          throw new NotFoundException(`Content ${id} not found`);
        }
      }
    }

    // Update content to rejected state
    if (contentType === 'module') {
      content.status = ContentStatusEnum.DRAFT;
      content.reviewed_by = adminId;
      content.is_published = false;

      content.metadata = {
        ...content.metadata,
        rejection_reason: rejectionDto.rejection_reason,
        rejected_at: new Date().toISOString(),
        rejected_by: adminId,
      };

      const updated = await this.moduleRepo.save(content);
      return this.mapModuleToContentDto(updated);
    } else if (contentType === 'exercise') {
      content.reviewed_by = adminId;
      content.is_active = false;

      content.metadata = {
        ...content.metadata,
        approved: false,
        rejection_reason: rejectionDto.rejection_reason,
        rejected_at: new Date().toISOString(),
        rejected_by: adminId,
      };

      const updated = await this.exerciseRepo.save(content);
      return this.mapExerciseToContentDto(updated);
    } else {
      // ContentTemplate rejection
      content.is_public = false;
      content.metadata = {
        ...content.metadata,
        approved: false,
        rejection_reason: rejectionDto.rejection_reason,
        rejected_at: new Date().toISOString(),
        rejected_by: adminId,
      };

      const updated = await this.templateRepo.save(content);
      return this.mapTemplateToContentDto(updated);
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private async getModules(
    status: ContentStatusEnum,
    search: string | undefined,
    createdBy: string | undefined,
    skip: number,
    limit: number,
  ): Promise<{ data: Module[]; total: number }> {
    const queryBuilder = this.moduleRepo.createQueryBuilder('module');

    queryBuilder.where('module.status = :status', { status });

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('module.title ILIKE :search', { search: `%${search}%` })
            .orWhere('module.description ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    if (createdBy) {
      queryBuilder.andWhere('module.created_by = :createdBy', { createdBy });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('module.created_at', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  private async getExercises(
    search: string | undefined,
    createdBy: string | undefined,
    skip: number,
    limit: number,
  ): Promise<{ data: Exercise[]; total: number }> {
    const queryBuilder = this.exerciseRepo.createQueryBuilder('exercise');

    // Exercises don't have status enum, filter by reviewed_by = null for pending
    queryBuilder.where('exercise.reviewed_by IS NULL');

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('exercise.title ILIKE :search', { search: `%${search}%` })
            .orWhere('exercise.description ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    if (createdBy) {
      queryBuilder.andWhere('exercise.created_by = :createdBy', { createdBy });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('exercise.created_at', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  private async getTemplates(
    search: string | undefined,
    createdBy: string | undefined,
    skip: number,
    limit: number,
  ): Promise<{ data: ContentTemplate[]; total: number }> {
    const queryBuilder = this.templateRepo.createQueryBuilder('template');

    // Templates pending approval: not public and not system templates
    queryBuilder.where('template.is_public = false');
    queryBuilder.andWhere('template.is_system_template = false');

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('template.name ILIKE :search', { search: `%${search}%` })
            .orWhere('template.description ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    if (createdBy) {
      queryBuilder.andWhere('template.created_by = :createdBy', { createdBy });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('template.created_at', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  // Mapping functions
  private mapModuleToContentDto(module: Module): ContentDto {
    return {
      id: module.id,
      content_type: 'module',
      title: module.title,
      description: module.description,
      status: module.status,
      is_published: module.is_published,
      created_by: module.created_by,
      reviewed_by: module.reviewed_by,
      approved_by: module.approved_by,
      version: module.version,
      created_at: module.created_at,
      updated_at: module.updated_at,
      published_at: module.published_at,
      metadata: module.metadata,
    } as ContentDto;
  }

  private mapExerciseToContentDto(exercise: Exercise): ContentDto {
    return {
      id: exercise.id,
      content_type: 'exercise',
      title: exercise.title,
      description: exercise.description,
      status: exercise.is_active ? ContentStatusEnum.PUBLISHED : ContentStatusEnum.DRAFT,
      is_published: exercise.is_active,
      created_by: exercise.created_by,
      reviewed_by: exercise.reviewed_by,
      approved_by: undefined,
      version: exercise.version,
      created_at: exercise.created_at,
      updated_at: exercise.updated_at,
      published_at: undefined,
      metadata: exercise.metadata,
    } as ContentDto;
  }

  private mapTemplateToContentDto(template: ContentTemplate): ContentDto {
    return {
      id: template.id,
      content_type: 'template',
      title: template.name,
      description: template.description,
      status: template.is_public ? ContentStatusEnum.PUBLISHED : ContentStatusEnum.DRAFT,
      is_published: template.is_public,
      created_by: template.created_by,
      reviewed_by: undefined,
      approved_by: undefined,
      version: 1,
      created_at: template.created_at,
      updated_at: template.updated_at,
      published_at: undefined,
      metadata: template.metadata,
    } as ContentDto;
  }

  // =====================================================
  // MEDIA LIBRARY MANAGEMENT
  // =====================================================

  /**
   * Get media library with filters and pagination
   */
  async getMediaLibrary(query: ListMediaDto): Promise<PaginatedMediaDto> {
    const {
      search,
      media_type,
      category,
      uploaded_by,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.mediaFileRepo.createQueryBuilder('media');

    // Only show active files
    queryBuilder.where('media.is_active = true');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('media.filename ILIKE :search', { search: `%${search}%` })
            .orWhere('media.original_filename ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('media.description ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('media.alt_text ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    // Apply media type filter
    if (media_type) {
      queryBuilder.andWhere('media.media_type = :media_type', { media_type });
    }

    // Apply category filter
    if (category) {
      queryBuilder.andWhere('media.category = :category', { category });
    }

    // Apply uploaded_by filter
    if (uploaded_by) {
      queryBuilder.andWhere('media.uploaded_by = :uploaded_by', {
        uploaded_by,
      });
    }

    // Pagination and ordering
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('media.created_at', 'DESC')
      .getManyAndCount();

    return {
      data: data as any,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Delete media file (soft delete)
   */
  async deleteMediaFile(id: string): Promise<void> {
    const mediaFile = await this.mediaFileRepo.findOne({ where: { id } });

    if (!mediaFile) {
      throw new NotFoundException(`Media file ${id} not found`);
    }

    // Soft delete - set is_active to false
    mediaFile.is_active = false;
    await this.mediaFileRepo.save(mediaFile);
  }
}
