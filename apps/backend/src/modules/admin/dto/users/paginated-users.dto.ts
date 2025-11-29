import { PaginatedResponseDto } from '@shared/dto/common';
import { UserDetailsDto } from './user-details.dto';

/**
 * PaginatedUsersDto
 *
 * DTO para respuesta paginada de usuarios.
 * Extiende del DTO genérico PaginatedResponseDto.
 */
export class PaginatedUsersDto extends PaginatedResponseDto<UserDetailsDto> {}
