/**
 * ParentRegisterDto
 *
 * EXT-011 Parent Portal - Registration DTO
 *
 * @description DTO for parent account registration.
 * @see ET-PAR-001-parent-authentication.md
 * @created 2026-01-27
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { RelationshipType } from '@/modules/parents/enums/parent-account.enums';

export class ParentRegisterDto {
  @ApiProperty({
    description: 'Email del padre/tutor',
    example: 'padre@ejemplo.com',
  })
  @IsEmail({}, { message: 'El email debe ser valido' })
  email!: string;

  @ApiProperty({
    description: 'Contrasena (min 8 caracteres)',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString({ message: 'La contrasena debe ser texto' })
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contrasena debe contener mayuscula, minuscula y numero',
  })
  password!: string;

  @ApiProperty({
    description: 'Nombre del padre/tutor',
    example: 'Juan',
  })
  @IsString({ message: 'El nombre debe ser texto' })
  firstName!: string;

  @ApiProperty({
    description: 'Apellido del padre/tutor',
    example: 'Perez',
  })
  @IsString({ message: 'El apellido debe ser texto' })
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Telefono de contacto',
    example: '+52 555 123 4567',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Tipo de relacion con el estudiante',
    enum: RelationshipType,
    example: RelationshipType.FATHER,
  })
  @IsEnum(RelationshipType, { message: 'Tipo de relacion invalido' })
  @IsOptional()
  relationshipType?: RelationshipType;

  @ApiPropertyOptional({
    description: 'Idioma preferido',
    example: 'es-MX',
    default: 'es-MX',
  })
  @IsString()
  @IsOptional()
  preferredLanguage?: string;
}
