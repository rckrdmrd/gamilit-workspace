import { PaginatedResponseDto } from '@shared/dto/common';
import { MediaFileResponseDto } from '@modules/content/dto/media-file-response.dto';

/**
 * PaginatedMediaDto
 *
 * DTO para respuesta paginada de archivos multimedia.
 * Extiende del DTO genérico PaginatedResponseDto.
 */
export class PaginatedMediaDto extends PaginatedResponseDto<MediaFileResponseDto> {}
