import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  IsObject,
} from 'class-validator';

/**
 * CreateLtiSessionDto
 *
 * @description DTO para crear una nueva sesión LTI (post-launch)
 */
export class CreateLtiSessionDto {
  @ApiProperty({
    description: 'ID del LTI Consumer',
  })
  @IsUUID()
  @IsNotEmpty()
  consumerId!: string;

  @ApiPropertyOptional({
    description: 'ID del usuario en Gamilit (si ya existe)',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'ID único del launch LTI',
    example: 'lti13-launch-12345',
  })
  @IsString()
  @IsNotEmpty()
  launchId!: string;

  @ApiProperty({
    description: 'Tipo de mensaje LTI',
    example: 'LtiResourceLinkRequest',
  })
  @IsString()
  @IsNotEmpty()
  messageType!: string;

  @ApiPropertyOptional({
    description: 'ID del contexto/curso en el LMS',
    example: 'course-12345',
  })
  @IsString()
  @IsOptional()
  contextId?: string;

  @ApiPropertyOptional({
    description: 'Código del curso',
    example: 'CS101',
  })
  @IsString()
  @IsOptional()
  contextLabel?: string;

  @ApiPropertyOptional({
    description: 'Nombre del curso',
    example: 'Introducción a la Programación',
  })
  @IsString()
  @IsOptional()
  contextTitle?: string;

  @ApiPropertyOptional({
    description: 'ID del resource link',
  })
  @IsString()
  @IsOptional()
  resourceLinkId?: string;

  @ApiPropertyOptional({
    description: 'Título del resource link',
  })
  @IsString()
  @IsOptional()
  resourceLinkTitle?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario en el LMS',
  })
  @IsString()
  @IsOptional()
  lmsUserId?: string;

  @ApiPropertyOptional({
    description: 'Email del usuario en el LMS',
  })
  @IsString()
  @IsOptional()
  lmsUserEmail?: string;

  @ApiPropertyOptional({
    description: 'Nombre del usuario en el LMS',
  })
  @IsString()
  @IsOptional()
  lmsUserName?: string;

  @ApiPropertyOptional({
    description: 'Roles del usuario en el LMS',
    example: ['Learner', 'Instructor'],
  })
  @IsArray()
  @IsOptional()
  lmsUserRoles?: string[];

  @ApiPropertyOptional({
    description: 'Claims del ID token JWT',
    default: {},
  })
  @IsObject()
  @IsOptional()
  idTokenClaims?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'URL para retornar al LMS',
  })
  @IsString()
  @IsOptional()
  returnUrl?: string;
}
