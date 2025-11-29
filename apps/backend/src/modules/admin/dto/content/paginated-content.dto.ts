import { PaginatedResponseDto } from '@shared/dto/common';
import { ContentDto } from './content.dto';

/**
 * PaginatedContentDto
 *
 * DTO para respuesta paginada de contenido.
 * Extiende del DTO genérico PaginatedResponseDto.
 */
export class PaginatedContentDto extends PaginatedResponseDto<ContentDto> {}
