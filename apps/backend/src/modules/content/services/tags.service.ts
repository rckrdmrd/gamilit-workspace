import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Tag, TagCategory } from '../entities';

/**
 * TagsService
 *
 * @description Gestión de etiquetas para categorización de contenido.
 * Soporta 9 categorías: person, scientific_concept, location, etc.
 */
@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag, 'content')
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.tagRepo.find({
      where: { isActive: true },
      order: { usageCount: 'DESC', tagName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag ${id} no encontrado`);
    }
    return tag;
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    return this.tagRepo.findOne({ where: { tagSlug: slug, isActive: true } });
  }

  async findByCategory(category: TagCategory): Promise<Tag[]> {
    return this.tagRepo.find({
      where: { tagCategory: category, isActive: true },
      order: { usageCount: 'DESC' },
    });
  }

  async search(query: string): Promise<Tag[]> {
    return this.tagRepo.find({
      where: { tagName: ILike(`%${query}%`), isActive: true },
      order: { usageCount: 'DESC' },
      take: 20,
    });
  }

  async create(data: {
    tagName: string;
    tagSlug: string;
    tagCategory: TagCategory;
    description?: string;
  }): Promise<Tag> {
    const existing = await this.findBySlug(data.tagSlug);
    if (existing) {
      throw new ConflictException(`Tag con slug '${data.tagSlug}' ya existe`);
    }

    const tag = this.tagRepo.create({
      ...data,
      usageCount: 0,
      isActive: true,
    });
    return this.tagRepo.save(tag);
  }

  async update(id: string, data: Partial<Tag>): Promise<Tag> {
    const tag = await this.findOne(id);
    Object.assign(tag, data);
    return this.tagRepo.save(tag);
  }

  async incrementUsage(id: string): Promise<void> {
    await this.tagRepo.increment({ id }, 'usageCount', 1);
  }

  async decrementUsage(id: string): Promise<void> {
    await this.tagRepo.decrement({ id }, 'usageCount', 1);
  }

  async deactivate(id: string): Promise<void> {
    await this.tagRepo.update(id, { isActive: false });
  }

  async getPopular(limit: number = 10): Promise<Tag[]> {
    return this.tagRepo.find({
      where: { isActive: true },
      order: { usageCount: 'DESC' },
      take: limit,
    });
  }
}
