import {
  IsEmail,
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GamilityRoleEnum } from '@shared/constants';

/**
 * AdminCreateUserDto
 *
 * @description DTO para crear usuarios desde el panel de administración.
 * Permite crear estudiantes y profesores con asignación directa a organización/classroom.
 *
 * @see US-AE-010 - Crear Usuarios desde Admin
 */
export class AdminCreateUserDto {
  @ApiProperty({
    description: 'Email del usuario (debe ser único en el sistema)',
    example: 'usuario@escuela.edu',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez García',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  full_name!: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: [GamilityRoleEnum.STUDENT, GamilityRoleEnum.ADMIN_TEACHER],
    example: GamilityRoleEnum.STUDENT,
  })
  @IsEnum([GamilityRoleEnum.STUDENT, GamilityRoleEnum.ADMIN_TEACHER], {
    message: 'El rol debe ser student o admin_teacher',
  })
  role!: GamilityRoleEnum.STUDENT | GamilityRoleEnum.ADMIN_TEACHER;

  @ApiProperty({
    description: 'ID de la organización a la que pertenece el usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID de organización debe ser un UUID válido' })
  organization_id!: string;

  @ApiPropertyOptional({
    description: 'ID del classroom (solo para estudiantes)',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de classroom debe ser un UUID válido' })
  classroom_id?: string;

  @ApiPropertyOptional({
    description: 'Enviar email de bienvenida con credenciales',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  send_welcome_email?: boolean = true;

  @ApiPropertyOptional({
    description: 'Contraseña temporal (se genera automáticamente si no se provee)',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  temporary_password?: string;
}

/**
 * AdminCreatedUserDto
 *
 * @description DTO de respuesta al crear un usuario desde admin.
 */
export class AdminCreatedUserDto {
  @ApiProperty({ description: 'ID del usuario creado' })
  id!: string;

  @ApiProperty({ description: 'Email del usuario' })
  email!: string;

  @ApiProperty({ description: 'Nombre completo' })
  full_name!: string;

  @ApiProperty({ description: 'Rol asignado' })
  role!: string;

  @ApiProperty({ description: 'ID de la organización' })
  organization_id!: string;

  @ApiProperty({ description: 'Nombre de la organización' })
  organization_name!: string;

  @ApiPropertyOptional({ description: 'ID del classroom' })
  classroom_id?: string;

  @ApiPropertyOptional({ description: 'Nombre del classroom' })
  classroom_name?: string;

  @ApiProperty({ description: 'Estado del usuario', enum: ['pending', 'active'] })
  status!: 'pending' | 'active';

  @ApiProperty({ description: 'Fecha de creación' })
  created_at!: string;

  @ApiProperty({ description: 'Si se envió email de bienvenida' })
  welcome_email_sent!: boolean;

  @ApiPropertyOptional({
    description: 'Contraseña temporal (solo si no se envió email)',
  })
  temporary_password?: string;
}
