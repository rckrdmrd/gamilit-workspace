import { PaginatedResponseDto } from '@shared/dto/common';
import { InterventionAlertDto } from './intervention-alert.dto';

/**
 * PaginatedInterventionsDto
 *
 * DTO para respuesta paginada de alertas de intervención.
 * Extiende del DTO genérico PaginatedResponseDto.
 */
export class PaginatedInterventionsDto extends PaginatedResponseDto<InterventionAlertDto> {}
