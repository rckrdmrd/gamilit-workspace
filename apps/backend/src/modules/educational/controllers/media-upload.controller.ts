import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaStorageService } from '../services/media-storage.service';
import { UploadMediaDto } from '../dto/upload-media.dto';
import { MediaAttachment } from '../entities/media-attachment.entity';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { AuthRequest } from '@shared/types';

/**
 * Controller para gestión de archivos multimedia
 *
 * @description Endpoints para subir, obtener y eliminar archivos multimedia en ejercicios creativos
 *
 * Endpoints:
 * - POST /api/v1/educational/media/upload - Subir archivo
 * - GET /api/v1/educational/media/:id - Obtener archivo
 * - DELETE /api/v1/educational/media/:id - Eliminar archivo
 * - GET /api/v1/educational/media/submission/:submissionId - Archivos por submission
 * - GET /api/v1/educational/media/exercise/:exerciseId - Archivos por ejercicio
 */
@ApiTags('Educational - Media Upload')
@Controller('educational/media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaUploadController {
  constructor(private readonly mediaService: MediaStorageService) {}

  /**
   * Sube un archivo multimedia
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir archivo multimedia' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir',
        },
        submissionId: {
          type: 'string',
          format: 'uuid',
          description: 'ID del submission (opcional)',
        },
        exerciseId: {
          type: 'string',
          format: 'uuid',
          description: 'ID del ejercicio (opcional)',
        },
        fileType: {
          type: 'string',
          enum: ['image', 'video', 'audio', 'document'],
          description: 'Tipo de archivo',
        },
      },
      required: ['file', 'fileType'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo subido exitosamente',
    type: MediaAttachment,
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido o excede límite de tamaño' })
  async uploadFile(
    @Request() req: AuthRequest,
    @UploadedFile() file: any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Express.Multer.File requires @types/multer
    @Body() dto: UploadMediaDto,
  ): Promise<MediaAttachment> {
    const userId = req.user!.profile?.id || req.user!.id;
    return this.mediaService.uploadFile(file, userId, dto);
  }

  /**
   * Obtiene y sirve un archivo multimedia
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener archivo multimedia' })
  @ApiResponse({
    status: 200,
    description: 'Archivo servido exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  async getFile(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const fileData = await this.mediaService.getFile(id);
    res.setHeader('Content-Type', fileData.mimeType);
    res.sendFile(fileData.path);
  }

  /**
   * Obtiene información de un attachment (sin servir el archivo)
   */
  @Get(':id/info')
  @ApiOperation({ summary: 'Obtener información de un attachment' })
  @ApiResponse({
    status: 200,
    description: 'Información del attachment',
    type: MediaAttachment,
  })
  @ApiResponse({ status: 404, description: 'Attachment no encontrado' })
  async getAttachmentInfo(@Param('id') id: string): Promise<MediaAttachment> {
    return this.mediaService.findById(id);
  }

  /**
   * Elimina un archivo multimedia
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar archivo multimedia' })
  @ApiResponse({
    status: 200,
    description: 'Archivo eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  async deleteFile(@Param('id') id: string): Promise<{ message: string }> {
    await this.mediaService.deleteFile(id);
    return { message: 'File deleted successfully' };
  }

  /**
   * Obtiene todos los attachments de un submission
   */
  @Get('submission/:submissionId')
  @ApiOperation({ summary: 'Obtener archivos de un submission' })
  @ApiResponse({
    status: 200,
    description: 'Lista de archivos del submission',
    type: [MediaAttachment],
  })
  async getAttachmentsBySubmission(
    @Param('submissionId') submissionId: string,
  ): Promise<MediaAttachment[]> {
    return this.mediaService.getAttachmentsBySubmission(submissionId);
  }

  /**
   * Obtiene todos los attachments de un ejercicio (materiales de referencia)
   */
  @Get('exercise/:exerciseId')
  @ApiOperation({ summary: 'Obtener archivos de un ejercicio' })
  @ApiResponse({
    status: 200,
    description: 'Lista de archivos del ejercicio',
    type: [MediaAttachment],
  })
  async getAttachmentsByExercise(
    @Param('exerciseId') exerciseId: string,
  ): Promise<MediaAttachment[]> {
    return this.mediaService.getAttachmentsByExercise(exerciseId);
  }
}
