import { IsUUID, IsString, IsEnum, IsOptional, IsArray, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageTypeEnum } from '@/shared/constants/enums.constants';

/**
 * Send Message DTO
 *
 * @description DTO para enviar mensajes directos entre teacher y estudiantes
 */
export class SendMessageDto {
  @ApiProperty({ type: [String], description: 'IDs de los destinatarios (estudiantes)', example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
    recipient_ids!: string[];

  @ApiProperty({ description: 'Asunto del mensaje', example: 'Recordatorio sobre tarea' })
  @IsString()
    subject!: string;

  @ApiProperty({ description: 'Contenido del mensaje', example: 'Hola estudiantes, recuerden entregar la tarea antes del viernes.' })
  @IsString()
    content!: string;

  @ApiPropertyOptional({ enum: MessageTypeEnum, description: 'Tipo de mensaje', default: MessageTypeEnum.DIRECT })
  @IsOptional()
  @IsEnum(MessageTypeEnum)
    type?: MessageTypeEnum = MessageTypeEnum.DIRECT;

  @ApiPropertyOptional({ description: 'ID del classroom asociado', example: 'uuid' })
  @IsOptional()
  @IsUUID()
    classroom_id?: string;

  @ApiPropertyOptional({ description: 'ID del assignment asociado', example: 'uuid' })
  @IsOptional()
  @IsUUID()
    assignment_id?: string;

  @ApiPropertyOptional({ description: 'ID del mensaje padre (para respuestas)', example: 'uuid' })
  @IsOptional()
  @IsUUID()
    parent_message_id?: string;
}

/**
 * Send Classroom Announcement DTO
 *
 * @description DTO para enviar anuncios a un classroom completo
 */
export class SendClassroomAnnouncementDto {
  @ApiProperty({ description: 'Asunto del anuncio', example: 'Importante: Cambio de horario' })
  @IsString()
    subject!: string;

  @ApiProperty({ description: 'Contenido del anuncio', example: 'La clase del próximo martes será a las 10:00 AM en lugar de 9:00 AM.' })
  @IsString()
    content!: string;

  @ApiPropertyOptional({ enum: ['normal', 'high', 'urgent'], description: 'Prioridad del anuncio', default: 'normal' })
  @IsOptional()
  @IsEnum(['normal', 'high', 'urgent'])
    priority?: 'normal' | 'high' | 'urgent' = 'normal';
}

/**
 * Send Private Feedback DTO
 *
 * @description DTO para enviar feedback privado a un estudiante específico
 */
export class SendPrivateFeedbackDto {
  @ApiProperty({ description: 'Contenido del feedback', example: 'Excelente trabajo en el ejercicio. Sigue así!' })
  @IsString()
    content!: string;

  @ApiPropertyOptional({ description: 'ID del assignment relacionado', example: 'uuid' })
  @IsOptional()
  @IsUUID()
    assignment_id?: string;

  @ApiPropertyOptional({ description: 'ID de la submission relacionada', example: 'uuid' })
  @IsOptional()
  @IsUUID()
    submission_id?: string;
}

/**
 * Get Messages Query DTO
 *
 * @description DTO para filtrar y paginar mensajes
 */
export class GetMessagesQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por classroom ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
    classroom_id?: string;

  @ApiPropertyOptional({ enum: MessageTypeEnum, description: 'Filtrar por tipo de mensaje' })
  @IsOptional()
  @IsEnum(MessageTypeEnum)
    type?: MessageTypeEnum;

  @ApiPropertyOptional({ description: 'Filtrar solo mensajes no leídos', example: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
    unread?: boolean;

  @ApiPropertyOptional({ description: 'Búsqueda en subject, content o nombre de sender', example: 'tarea' })
  @IsOptional()
  @IsString()
    search?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20, description: 'Cantidad de resultados por página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
    limit?: number = 20;

  @ApiPropertyOptional({ minimum: 0, default: 0, description: 'Offset para paginación' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
    offset?: number = 0;
}

/**
 * Message Recipient DTO
 *
 * @description Información de un destinatario del mensaje
 */
export class MessageRecipientDto {
  @ApiProperty({ description: 'ID del usuario destinatario' })
    user_id!: string;

  @ApiProperty({ description: 'Nombre del usuario destinatario' })
    user_name!: string;

  @ApiProperty({ description: 'Estado de lectura del destinatario' })
    is_read!: boolean;
}

/**
 * Message Response DTO
 *
 * @description DTO de respuesta con información completa de un mensaje
 */
export class MessageResponseDto {
  @ApiProperty({ description: 'ID del mensaje' })
    id!: string;

  @ApiProperty({ description: 'ID del sender (teacher)' })
    sender_id!: string;

  @ApiProperty({ description: 'Nombre del sender' })
    sender_name!: string;

  @ApiProperty({ type: [MessageRecipientDto], description: 'Lista de destinatarios' })
    recipients!: MessageRecipientDto[];

  @ApiProperty({ description: 'Asunto del mensaje' })
    subject!: string;

  @ApiProperty({ description: 'Contenido del mensaje' })
    content!: string;

  @ApiProperty({ enum: MessageTypeEnum, description: 'Tipo de mensaje' })
    type!: MessageTypeEnum;

  @ApiProperty({ required: false, description: 'ID del classroom asociado' })
    classroom_id!: string | null;

  @ApiProperty({ required: false, description: 'Nombre del classroom asociado' })
    classroom_name!: string | null;

  @ApiProperty({ required: false, description: 'ID del assignment asociado' })
    assignment_id!: string | null;

  @ApiProperty({ required: false, description: 'URL de archivo adjunto' })
    attachment_url!: string | null;

  @ApiProperty({ required: false, description: 'ID del mensaje padre' })
    parent_message_id!: string | null;

  @ApiProperty({ description: 'Estado de lectura del mensaje' })
    is_read!: boolean;

  @ApiProperty({ required: false, description: 'Fecha de lectura' })
    read_at!: string | null;

  @ApiProperty({ description: 'Fecha de creación' })
    created_at!: string;

  @ApiProperty({ required: false, description: 'Fecha de actualización' })
    updated_at!: string;
}

/**
 * Messages List Response DTO
 *
 * @description DTO de respuesta con lista paginada de mensajes
 */
export class MessagesListResponseDto {
  @ApiProperty({ type: [MessageResponseDto], description: 'Lista de mensajes' })
    data!: MessageResponseDto[];

  @ApiProperty({ description: 'Total de mensajes (sin paginación)' })
    total!: number;

  @ApiProperty({ description: 'Límite usado en la consulta' })
    limit!: number;

  @ApiProperty({ description: 'Offset usado en la consulta' })
    offset!: number;
}

/**
 * Conversation DTO
 *
 * @description DTO para conversaciones agrupadas entre teacher y estudiante
 */
export class ConversationDto {
  @ApiProperty({ description: 'ID de la conversación' })
    conversation_id!: string;

  @ApiProperty({ description: 'ID del otro usuario (estudiante)' })
    other_user_id!: string;

  @ApiProperty({ description: 'Nombre del otro usuario' })
    other_user_name!: string;

  @ApiProperty({ description: 'Último mensaje de la conversación' })
    last_message!: string;

  @ApiProperty({ description: 'Fecha del último mensaje' })
    last_message_at!: string;

  @ApiProperty({ description: 'Cantidad de mensajes no leídos' })
    unread_count!: number;
}

/**
 * Unread Count DTO
 *
 * @description DTO para contador de mensajes no leídos
 */
export class UnreadCountDto {
  @ApiProperty({ description: 'Cantidad de mensajes no leídos', example: 5 })
    count!: number;
}
