/**
 * ParentLoginDto
 *
 * EXT-011 Parent Portal - Login DTO
 *
 * @description DTO for parent account authentication.
 * @see ET-PAR-001-parent-authentication.md
 * @created 2026-01-27
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ParentLoginDto {
  @ApiProperty({
    description: 'Email del padre/tutor',
    example: 'padre@ejemplo.com',
  })
  @IsEmail({}, { message: 'El email debe ser valido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email!: string;

  @ApiProperty({
    description: 'Contrasena',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString({ message: 'La contrasena debe ser texto' })
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'Contrasena es requerida' })
  password!: string;
}
