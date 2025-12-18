import { PartialType } from '@nestjs/swagger';
import { CreateMissionTemplateDto } from './create-mission-template.dto';

/**
 * Update Mission Template DTO
 *
 * @description DTO para actualizar un template de misión existente
 * @usage Todos los campos son opcionales (partial update)
 *
 * Hereda todas las validaciones de CreateMissionTemplateDto pero
 * convierte todos los campos en opcionales.
 */
export class UpdateMissionTemplateDto extends PartialType(CreateMissionTemplateDto) {}
