/**
 * LinkStudentDto
 *
 * EXT-011 Parent Portal - Link Student DTO
 *
 * @description DTO for linking a parent account to a student.
 * @see ET-PAR-001-parent-authentication.md
 * @created 2026-01-27
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, Length } from 'class-validator';
import { ParentRelationshipType } from '@/modules/auth/entities/parent-student-link.entity';

export class LinkStudentDto {
  @ApiProperty({
    description: 'Codigo unico del estudiante (generado por el sistema)',
    example: 'STU-ABC123',
    minLength: 6,
    maxLength: 20,
  })
  @IsString({ message: 'El codigo debe ser texto' })
  @IsNotEmpty({ message: 'El codigo del estudiante es requerido' })
  @Length(6, 20, { message: 'El codigo debe tener entre 6 y 20 caracteres' })
  studentCode!: string;

  @ApiProperty({
    description: 'Tipo de relacion con el estudiante',
    enum: ParentRelationshipType,
    example: ParentRelationshipType.FATHER,
  })
  @IsEnum(ParentRelationshipType, { message: 'Tipo de relacion invalido' })
  relationshipType!: ParentRelationshipType;

  @ApiPropertyOptional({
    description: 'Requiere aprobacion del estudiante (para estudiantes mayores)',
    example: false,
    default: false,
  })
  @IsOptional()
  requireStudentApproval?: boolean;
}

export class VerifyLinkDto {
  @ApiProperty({
    description: 'Codigo de verificacion enviado al padre',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El codigo debe tener 6 digitos' })
  verificationCode!: string;

  @ApiProperty({
    description: 'ID del link pendiente',
    example: 'uuid-del-link',
  })
  @IsString()
  @IsNotEmpty()
  linkId!: string;
}

export class UpdateLinkPermissionsDto {
  @ApiPropertyOptional({ description: 'Puede ver progreso del estudiante' })
  @IsOptional()
  canViewProgress?: boolean;

  @ApiPropertyOptional({ description: 'Puede ver calificaciones' })
  @IsOptional()
  canViewGrades?: boolean;

  @ApiPropertyOptional({ description: 'Puede recibir notificaciones' })
  @IsOptional()
  canReceiveNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Puede contactar profesores' })
  @IsOptional()
  canContactTeachers?: boolean;
}
