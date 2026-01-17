import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentVersion } from '../entities';

/**
 * ContentVersionsService
 *
 * @description Gestión de versionado de contenido educativo.
 * Permite crear snapshots, comparar versiones y hacer rollback.
 */
@Injectable()
export class ContentVersionsService {
  constructor(
    @InjectRepository(ContentVersion, 'content')
    private readonly versionRepo: Repository<ContentVersion>,
  ) {}

  async findByContent(contentType: string, contentId: string): Promise<ContentVersion[]> {
    return this.versionRepo.find({
      where: { contentType, contentId },
      order: { versionNumber: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ContentVersion> {
    const version = await this.versionRepo.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!version) {
      throw new NotFoundException(`Version ${id} no encontrada`);
    }
    return version;
  }

  async findLatest(contentType: string, contentId: string): Promise<ContentVersion | null> {
    return this.versionRepo.findOne({
      where: { contentType, contentId },
      order: { versionNumber: 'DESC' },
    });
  }

  async findPublished(contentType: string, contentId: string): Promise<ContentVersion | null> {
    return this.versionRepo.findOne({
      where: { contentType, contentId, isPublished: true },
      order: { publishedAt: 'DESC' },
    });
  }

  async create(data: {
    contentType: string;
    contentId: string;
    contentData: Record<string, unknown>;
    changeSummary?: string;
    changeNotes?: string;
    createdBy?: string;
    tenantId?: string;
  }): Promise<ContentVersion> {
    // Get next version number
    const latest = await this.findLatest(data.contentType, data.contentId);
    const versionNumber = latest ? latest.versionNumber + 1 : 1;

    const version = this.versionRepo.create({
      ...data,
      versionNumber,
      versionName: `v${versionNumber}.0`,
      isPublished: false,
    });

    return this.versionRepo.save(version);
  }

  async publish(id: string): Promise<ContentVersion> {
    const version = await this.findOne(id);

    // Unpublish other versions of same content
    await this.versionRepo.update(
      { contentType: version.contentType, contentId: version.contentId },
      { isPublished: false },
    );

    version.isPublished = true;
    version.publishedAt = new Date();
    return this.versionRepo.save(version);
  }

  async unpublish(id: string): Promise<ContentVersion> {
    const version = await this.findOne(id);
    version.isPublished = false;
    return this.versionRepo.save(version);
  }

  async compare(id1: string, id2: string): Promise<{
    version1: ContentVersion;
    version2: ContentVersion;
    diff: { added: string[]; removed: string[]; modified: string[] };
  }> {
    const [v1, v2] = await Promise.all([this.findOne(id1), this.findOne(id2)]);

    const keys1 = Object.keys(v1.contentData);
    const keys2 = Object.keys(v2.contentData);

    return {
      version1: v1,
      version2: v2,
      diff: {
        added: keys2.filter(k => !keys1.includes(k)),
        removed: keys1.filter(k => !keys2.includes(k)),
        modified: keys1.filter(k => keys2.includes(k) &&
          JSON.stringify(v1.contentData[k]) !== JSON.stringify(v2.contentData[k])),
      },
    };
  }
}
