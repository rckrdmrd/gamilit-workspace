import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaAttachment } from '../entities/media-attachment.entity';
import { UploadMediaDto } from '../dto/upload-media.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Service para gestión de almacenamiento multimedia local
 *
 * @description Provee operaciones para subir, obtener y eliminar archivos multimedia.
 * Utilizado en módulos 4 y 5 para ejercicios creativos.
 *
 * CONFIGURACIÓN:
 * - Directorio base: uploads/exercises/
 * - Estructura: uploads/exercises/{exerciseId}/{submissionId}/{filename}
 * - Límites: 50MB video, 10MB imágenes, 20MB audio
 */
@Injectable()
export class MediaStorageService {
  private readonly baseUploadPath = path.join(process.cwd(), 'uploads', 'exercises');

  // Límites de tamaño por tipo (en bytes)
  private readonly sizeLimits = {
    image: 10 * 1024 * 1024, // 10 MB
    video: 50 * 1024 * 1024, // 50 MB
    audio: 20 * 1024 * 1024, // 20 MB
    document: 10 * 1024 * 1024, // 10 MB
  };

  // MIME types permitidos por categoría
  private readonly allowedMimeTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  };

  constructor(
    @InjectRepository(MediaAttachment, 'educational')
    private readonly attachmentRepo: Repository<MediaAttachment>,
  ) {
    // Asegurar que el directorio base existe
    this.ensureUploadDirectory();
  }

  /**
   * Asegura que el directorio de uploads existe
   */
  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.baseUploadPath);
    } catch {
      await fs.mkdir(this.baseUploadPath, { recursive: true });
    }
  }

  /** Resolve a path and ensure it stays within the uploads base directory */
  private resolveUploadPath(...segments: string[]): string {
    const uploadsBase = path.resolve(process.cwd(), 'uploads');
    const resolved = path.resolve(uploadsBase, ...segments);
    if (!resolved.startsWith(uploadsBase)) {
      throw new BadRequestException('Invalid file path');
    }
    return resolved;
  }

  /**
   * Sube un archivo multimedia
   *
   * @param file - Archivo subido (any por compatibilidad con Multer)
   * @param userId - UUID del usuario que sube el archivo
   * @param dto - Metadatos del archivo
   * @returns MediaAttachment creado
   * @throws BadRequestException si el archivo excede el límite o tipo no permitido
   */
  async uploadFile(
    file: any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Express.Multer.File requires @types/multer
    userId: string,
    dto: UploadMediaDto,
  ): Promise<MediaAttachment> {
    // Validar tamaño del archivo
    const sizeLimit = this.sizeLimits[dto.fileType];
    if (file.size > sizeLimit) {
      throw new BadRequestException(
        `File size exceeds limit for ${dto.fileType} (max ${sizeLimit / 1024 / 1024}MB)`,
      );
    }

    // Validar MIME type
    const allowedTypes = this.allowedMimeTypes[dto.fileType];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `MIME type ${file.mimetype} not allowed for ${dto.fileType}`,
      );
    }

    // Validar que al menos uno de exerciseId o submissionId esté presente
    if (!dto.exerciseId && !dto.submissionId) {
      throw new BadRequestException(
        'Either exerciseId or submissionId must be provided',
      );
    }

    // Construir ruta del archivo
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedFilename}`;

    const subPath = dto.submissionId
      ? path.join(dto.exerciseId || 'general', dto.submissionId)
      : dto.exerciseId || 'general';

    const directoryPath = this.resolveUploadPath('exercises', subPath);
    const filePath = this.resolveUploadPath('exercises', subPath, filename);

    // Crear directorio si no existe
    await fs.mkdir(directoryPath, { recursive: true });

    // Guardar archivo
    await fs.writeFile(filePath, file.buffer);

    // Crear registro en BD
    const relativePath = path.join('exercises', subPath, filename);

    const attachment = this.attachmentRepo.create({
      submissionId: dto.submissionId || null,
      exerciseId: dto.exerciseId || null,
      userId,
      fileName: file.originalname,
      filePath: relativePath,
      fileType: dto.fileType,
      fileSize: file.size,
      mimeType: file.mimetype,
      isProcessed: false,
    });

    return this.attachmentRepo.save(attachment);
  }

  /**
   * Obtiene información de un archivo
   *
   * @param attachmentId - UUID del attachment
   * @returns Datos del archivo (path absoluto y MIME type)
   * @throws NotFoundException si no existe
   */
  async getFile(attachmentId: string): Promise<{ path: string; mimeType: string }> {
    const attachment = await this.attachmentRepo.findOne({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${attachmentId} not found`);
    }

    const absolutePath = this.resolveUploadPath(attachment.filePath);

    // Verificar que el archivo existe físicamente
    try {
      await fs.access(absolutePath);
    } catch {
      throw new NotFoundException(`File not found at ${attachment.filePath}`);
    }

    return {
      path: absolutePath,
      mimeType: attachment.mimeType,
    };
  }

  /**
   * Elimina un archivo
   *
   * @param attachmentId - UUID del attachment
   * @throws NotFoundException si no existe
   */
  async deleteFile(attachmentId: string): Promise<void> {
    const attachment = await this.attachmentRepo.findOne({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${attachmentId} not found`);
    }

    const absolutePath = this.resolveUploadPath(attachment.filePath);

    // Eliminar archivo físico (ignorar si no existe)
    try {
      await fs.unlink(absolutePath);
    } catch {
      // Ignorar error si el archivo no existe
    }

    // Eliminar registro de BD
    await this.attachmentRepo.remove(attachment);
  }

  /**
   * Obtiene todos los attachments de un submission
   *
   * @param submissionId - UUID del submission
   * @returns Lista de attachments
   */
  async getAttachmentsBySubmission(submissionId: string): Promise<MediaAttachment[]> {
    return this.attachmentRepo.find({
      where: { submissionId },
      order: {
        uploadedAt: 'ASC',
      },
    });
  }

  /**
   * Obtiene todos los attachments de un ejercicio (materiales de referencia)
   *
   * @param exerciseId - UUID del ejercicio
   * @returns Lista de attachments
   */
  async getAttachmentsByExercise(exerciseId: string): Promise<MediaAttachment[]> {
    return this.attachmentRepo.find({
      where: { exerciseId },
      order: {
        uploadedAt: 'ASC',
      },
    });
  }

  /**
   * Obtiene un attachment por ID
   *
   * @param attachmentId - UUID del attachment
   * @returns MediaAttachment encontrado
   * @throws NotFoundException si no existe
   */
  async findById(attachmentId: string): Promise<MediaAttachment> {
    const attachment = await this.attachmentRepo.findOne({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${attachmentId} not found`);
    }

    return attachment;
  }
}
