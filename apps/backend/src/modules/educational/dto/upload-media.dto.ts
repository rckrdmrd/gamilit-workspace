import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para subir archivos multimedia a ejercicios creativos
 *
 * @description Utilizado en módulos 4 y 5 para adjuntar archivos multimedia
 */
export class UploadMediaDto {
  @ApiProperty({
    description: 'ID del submission al que se adjunta el archivo (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
    submissionId?: string;

  @ApiProperty({
    description: 'ID del ejercicio al que se adjunta el archivo (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsUUID()
  @IsOptional()
    exerciseId?: string;

  @ApiProperty({
    description: 'Tipo de archivo multimedia',
    enum: ['image', 'video', 'audio', 'document'],
    example: 'video',
  })
  @IsEnum(['image', 'video', 'audio', 'document'])
    fileType!: 'image' | 'video' | 'audio' | 'document';
}
