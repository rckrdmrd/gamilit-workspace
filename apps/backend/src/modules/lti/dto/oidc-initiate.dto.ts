import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
} from 'class-validator';

/**
 * OidcInitiateDto
 *
 * @description DTO para iniciar el flujo OIDC desde el LMS.
 * El LMS envía estos parámetros para iniciar la autenticación.
 *
 * @see LTI 1.3 Security Framework - Section 5.1.1
 */
export class OidcInitiateDto {
  @ApiProperty({
    description: 'Issuer identifier (platform ID)',
    example: 'https://canvas.instructure.com',
  })
  @IsString()
  @IsNotEmpty()
  iss!: string;

  @ApiProperty({
    description: 'Login hint provided by the platform',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  login_hint!: string;

  @ApiProperty({
    description: 'Target link URI for the resource',
    example: 'https://gamilit.com/lti/launch',
  })
  @IsUrl()
  @IsNotEmpty()
  target_link_uri!: string;

  @ApiPropertyOptional({
    description: 'LTI message hint (optional)',
    example: 'message-hint-12345',
  })
  @IsString()
  @IsOptional()
  lti_message_hint?: string;

  @ApiPropertyOptional({
    description: 'OAuth2 client ID',
    example: '10000000000001',
  })
  @IsString()
  @IsOptional()
  client_id?: string;

  @ApiPropertyOptional({
    description: 'LTI deployment ID',
    example: 'deployment-12345',
  })
  @IsString()
  @IsOptional()
  lti_deployment_id?: string;
}

/**
 * OidcLoginResponse
 *
 * @description Respuesta con la URL de autorización para redirigir al usuario.
 */
export class OidcLoginResponseDto {
  @ApiProperty({
    description: 'Authorization URL to redirect user',
    example: 'https://canvas.instructure.com/api/lti/authorize_redirect?...',
  })
  authorizationUrl!: string;

  @ApiProperty({
    description: 'State parameter for CSRF protection',
    example: 'state-uuid-12345',
  })
  state!: string;

  @ApiProperty({
    description: 'Nonce for replay protection',
    example: 'nonce-uuid-67890',
  })
  nonce!: string;
}
