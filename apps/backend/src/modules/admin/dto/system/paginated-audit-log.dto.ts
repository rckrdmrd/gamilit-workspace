import { PaginatedResponseDto } from '@shared/dto/common';
import { AuditLogDto } from './audit-log.dto';

/**
 * PaginatedAuditLogDto
 *
 * DTO para respuesta paginada de registros de auditoría.
 * Extiende del DTO genérico PaginatedResponseDto.
 */
export class PaginatedAuditLogDto extends PaginatedResponseDto<AuditLogDto> {}
