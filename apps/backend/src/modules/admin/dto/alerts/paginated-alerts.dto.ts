import { PaginatedResponseDto } from '@shared/dto/common';
import { AlertResponseDto } from './alert-response.dto';

/**
 * PaginatedAlertsDto
 *
 * DTO para respuesta paginada de alertas.
 * Extiende del DTO genérico PaginatedResponseDto.
 */
export class PaginatedAlertsDto extends PaginatedResponseDto<AlertResponseDto> {}
