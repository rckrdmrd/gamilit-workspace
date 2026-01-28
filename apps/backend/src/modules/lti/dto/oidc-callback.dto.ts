import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

/**
 * OidcCallbackDto
 *
 * @description DTO para el callback OIDC desde el LMS.
 * El LMS envía el ID token después de la autenticación.
 *
 * @see LTI 1.3 Security Framework - Section 5.1.3
 */
export class OidcCallbackDto {
  @ApiProperty({
    description: 'JWT ID token containing LTI claims',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  id_token!: string;

  @ApiProperty({
    description: 'State parameter for CSRF validation',
    example: 'state-uuid-12345',
  })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiPropertyOptional({
    description: 'Error code if authentication failed',
    example: 'access_denied',
  })
  @IsString()
  @IsOptional()
  error?: string;

  @ApiPropertyOptional({
    description: 'Error description',
    example: 'User denied access',
  })
  @IsString()
  @IsOptional()
  error_description?: string;
}

/**
 * LtiClaimsDto
 *
 * @description Parsed LTI claims from the ID token.
 */
export class LtiClaimsDto {
  // Standard OIDC claims
  iss!: string;
  sub!: string;
  aud!: string | string[];
  exp!: number;
  iat!: number;
  nonce!: string;

  // LTI 1.3 claims
  'https://purl.imsglobal.org/spec/lti/claim/message_type'!: string;
  'https://purl.imsglobal.org/spec/lti/claim/version'!: string;
  'https://purl.imsglobal.org/spec/lti/claim/deployment_id'!: string;
  'https://purl.imsglobal.org/spec/lti/claim/target_link_uri'!: string;

  // Resource link claim
  'https://purl.imsglobal.org/spec/lti/claim/resource_link'?: {
    id: string;
    title?: string;
    description?: string;
  };

  // Context claim (course info)
  'https://purl.imsglobal.org/spec/lti/claim/context'?: {
    id: string;
    label?: string;
    title?: string;
    type?: string[];
  };

  // User info
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
  locale?: string;

  // Roles
  'https://purl.imsglobal.org/spec/lti/claim/roles'?: string[];

  // Launch presentation
  'https://purl.imsglobal.org/spec/lti/claim/launch_presentation'?: {
    document_target?: string;
    return_url?: string;
    locale?: string;
  };

  // Deep linking claims
  'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'?: {
    deep_link_return_url: string;
    accept_types: string[];
    accept_presentation_document_targets: string[];
    accept_media_types?: string;
    accept_multiple?: boolean;
    auto_create?: boolean;
    title?: string;
    text?: string;
    data?: string;
  };

  // Assignment and Grade Services
  'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'?: {
    scope: string[];
    lineitems?: string;
    lineitem?: string;
  };

  // Names and Role Provisioning Services
  'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'?: {
    context_memberships_url: string;
    service_versions: string[];
  };

  // Custom parameters
  'https://purl.imsglobal.org/spec/lti/claim/custom'?: Record<string, string>;

  // Tool platform info
  'https://purl.imsglobal.org/spec/lti/claim/tool_platform'?: {
    guid: string;
    name?: string;
    version?: string;
    product_family_code?: string;
    contact_email?: string;
  };

  // Allow additional claims
  [key: string]: unknown;
}

/**
 * LtiLaunchDataDto
 *
 * @description Processed launch data returned after successful OIDC callback.
 */
export class LtiLaunchDataDto {
  @ApiProperty({ description: 'LTI session ID' })
  sessionId!: string;

  @ApiProperty({ description: 'Message type' })
  messageType!: string;

  @ApiProperty({ description: 'Consumer ID' })
  consumerId!: string;

  @ApiPropertyOptional({ description: 'Gamilit user ID if linked' })
  userId?: string;

  @ApiPropertyOptional({ description: 'Context/course info' })
  context?: {
    id: string;
    label?: string;
    title?: string;
  };

  @ApiPropertyOptional({ description: 'Resource link info' })
  resourceLink?: {
    id: string;
    title?: string;
  };

  @ApiPropertyOptional({ description: 'Deep linking settings' })
  deepLinkingSettings?: {
    returnUrl: string;
    acceptTypes: string[];
    acceptMultiple: boolean;
  };

  @ApiProperty({ description: 'JWT token for Gamilit session' })
  accessToken!: string;

  @ApiPropertyOptional({ description: 'Redirect URL for the application' })
  redirectUrl?: string;
}
