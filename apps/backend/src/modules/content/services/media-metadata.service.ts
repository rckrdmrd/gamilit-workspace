import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaMetadata } from '../entities';

/**
 * MediaMetadataService
 *
 * @description Gestión de metadatos extendidos de archivos multimedia.
 * Incluye dimensiones, duración, codec, EXIF data, etc.
 */
@Injectable()
export class MediaMetadataService {
  constructor(
    @InjectRepository(MediaMetadata, 'content')
    private readonly metadataRepo: Repository<MediaMetadata>,
  ) {}

  async findOne(id: string): Promise<MediaMetadata> {
    const metadata = await this.metadataRepo.findOne({
      where: { id },
      relations: ['mediaFile'],
    });
    if (!metadata) {
      throw new NotFoundException(`Media metadata ${id} no encontrado`);
    }
    return metadata;
  }

  async findByMediaFile(mediaFileId: string): Promise<MediaMetadata | null> {
    return this.metadataRepo.findOne({
      where: { mediaFileId },
      relations: ['mediaFile'],
    });
  }

  async create(data: {
    mediaFileId: string;
    durationSeconds?: number;
    width?: number;
    height?: number;
    resolution?: string;
    bitrate?: number;
    codec?: string;
    thumbnailUrl?: string;
    altText?: string;
    caption?: string;
    copyrightInfo?: string;
    exifData?: Record<string, unknown>;
  }): Promise<MediaMetadata> {
    const metadata = this.metadataRepo.create(data);
    return this.metadataRepo.save(metadata);
  }

  async update(id: string, data: Partial<MediaMetadata>): Promise<MediaMetadata> {
    const metadata = await this.findOne(id);
    Object.assign(metadata, data);
    return this.metadataRepo.save(metadata);
  }

  async upsertByMediaFile(
    mediaFileId: string,
    data: Partial<Omit<MediaMetadata, 'id' | 'mediaFileId' | 'createdAt' | 'updatedAt' | 'mediaFile'>>,
  ): Promise<MediaMetadata> {
    const existing = await this.findByMediaFile(mediaFileId);
    if (existing) {
      Object.assign(existing, data);
      return this.metadataRepo.save(existing);
    }
    const createData = {
      mediaFileId,
      durationSeconds: data.durationSeconds ?? undefined,
      width: data.width ?? undefined,
      height: data.height ?? undefined,
      resolution: data.resolution ?? undefined,
      bitrate: data.bitrate ?? undefined,
      codec: data.codec ?? undefined,
      thumbnailUrl: data.thumbnailUrl ?? undefined,
      altText: data.altText ?? undefined,
      caption: data.caption ?? undefined,
      copyrightInfo: data.copyrightInfo ?? undefined,
      exifData: data.exifData ?? undefined,
    };
    return this.create(createData);
  }

  async delete(id: string): Promise<void> {
    const result = await this.metadataRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Media metadata ${id} no encontrado`);
    }
  }

  async findByResolution(resolution: string): Promise<MediaMetadata[]> {
    return this.metadataRepo.find({
      where: { resolution },
      relations: ['mediaFile'],
    });
  }
}
