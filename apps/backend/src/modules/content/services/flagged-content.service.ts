import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FlaggedContent,
  FlaggedContentStatus,
  FlaggedContentPriority,
} from '../entities';

/**
 * FlaggedContentService
 *
 * @description Gestión de contenido reportado/marcado para moderación.
 * Tracking de reportes, priorización y workflow de revisión.
 */
@Injectable()
export class FlaggedContentService {
  constructor(
    @InjectRepository(FlaggedContent, 'content')
    private readonly flaggedRepo: Repository<FlaggedContent>,
  ) {}

  async findAll(status?: FlaggedContentStatus): Promise<FlaggedContent[]> {
    const where = status ? { status } : {};
    return this.flaggedRepo.find({
      where,
      order: { priority: 'ASC', createdAt: 'ASC' },
      relations: ['reporter', 'reviewer'],
    });
  }

  async findOne(id: string): Promise<FlaggedContent> {
    const flagged = await this.flaggedRepo.findOne({
      where: { id },
      relations: ['reporter', 'reviewer'],
    });
    if (!flagged) {
      throw new NotFoundException(`Flagged content ${id} no encontrado`);
    }
    return flagged;
  }

  async findPending(): Promise<FlaggedContent[]> {
    return this.flaggedRepo.find({
      where: { status: FlaggedContentStatus.PENDING },
      order: { priority: 'ASC', createdAt: 'ASC' },
      relations: ['reporter'],
    });
  }

  async findByContent(contentType: string, contentId: string): Promise<FlaggedContent[]> {
    return this.flaggedRepo.find({
      where: { contentType, contentId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: {
    contentType: string;
    contentId: string;
    contentPreview?: string;
    reportedBy: string;
    reason: string;
    description?: string;
    priority?: FlaggedContentPriority;
  }): Promise<FlaggedContent> {
    const flagged = this.flaggedRepo.create({
      ...data,
      status: FlaggedContentStatus.PENDING,
      priority: data.priority || FlaggedContentPriority.MEDIUM,
    });
    return this.flaggedRepo.save(flagged);
  }

  async approve(id: string, reviewerId: string, notes?: string): Promise<FlaggedContent> {
    const flagged = await this.findOne(id);
    flagged.status = FlaggedContentStatus.APPROVED;
    flagged.reviewedBy = reviewerId;
    flagged.reviewedAt = new Date();
    flagged.reviewNotes = notes || null;
    return this.flaggedRepo.save(flagged);
  }

  async reject(id: string, reviewerId: string, notes?: string): Promise<FlaggedContent> {
    const flagged = await this.findOne(id);
    flagged.status = FlaggedContentStatus.REJECTED;
    flagged.reviewedBy = reviewerId;
    flagged.reviewedAt = new Date();
    flagged.reviewNotes = notes || null;
    return this.flaggedRepo.save(flagged);
  }

  async remove(id: string, reviewerId: string, notes?: string): Promise<FlaggedContent> {
    const flagged = await this.findOne(id);
    flagged.status = FlaggedContentStatus.REMOVED;
    flagged.reviewedBy = reviewerId;
    flagged.reviewedAt = new Date();
    flagged.reviewNotes = notes || null;
    return this.flaggedRepo.save(flagged);
  }

  async updatePriority(id: string, priority: FlaggedContentPriority): Promise<FlaggedContent> {
    const flagged = await this.findOne(id);
    flagged.priority = priority;
    return this.flaggedRepo.save(flagged);
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    removed: number;
  }> {
    const [total, pending, approved, rejected, removed] = await Promise.all([
      this.flaggedRepo.count(),
      this.flaggedRepo.count({ where: { status: FlaggedContentStatus.PENDING } }),
      this.flaggedRepo.count({ where: { status: FlaggedContentStatus.APPROVED } }),
      this.flaggedRepo.count({ where: { status: FlaggedContentStatus.REJECTED } }),
      this.flaggedRepo.count({ where: { status: FlaggedContentStatus.REMOVED } }),
    ]);
    return { total, pending, approved, rejected, removed };
  }
}
