import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DeepLinkResponseDto
 *
 * @description Response DTO containing the JWT to return to the LMS.
 */
export class DeepLinkResponseDto {
  @ApiProperty({
    description: 'Signed JWT containing the deep link response',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  jwt!: string;

  @ApiProperty({
    description: 'URL to redirect to for submitting the response',
    example: 'https://canvas.instructure.com/api/lti/deep_linking/response',
  })
  returnUrl!: string;

  @ApiPropertyOptional({
    description: 'Optional data to include in form submission',
  })
  data?: string;
}

/**
 * DeepLinkPayloadDto
 *
 * @description JWT payload structure for deep link response.
 * This follows the LTI Deep Linking 2.0 specification.
 */
export class DeepLinkPayloadDto {
  // Standard JWT claims
  iss!: string; // Tool's client_id
  aud!: string; // Platform's issuer
  exp!: number;
  iat!: number;
  nonce!: string;

  // LTI Deep Linking claims
  'https://purl.imsglobal.org/spec/lti/claim/message_type'!: 'LtiDeepLinkingResponse';
  'https://purl.imsglobal.org/spec/lti/claim/version'!: '1.3.0';
  'https://purl.imsglobal.org/spec/lti/claim/deployment_id'!: string;
  'https://purl.imsglobal.org/spec/lti-dl/claim/content_items'!: ContentItem[];
  'https://purl.imsglobal.org/spec/lti-dl/claim/data'?: string;
  'https://purl.imsglobal.org/spec/lti-dl/claim/msg'?: string;
  'https://purl.imsglobal.org/spec/lti-dl/claim/errormsg'?: string;
  'https://purl.imsglobal.org/spec/lti-dl/claim/log'?: string;
  'https://purl.imsglobal.org/spec/lti-dl/claim/errorlog'?: string;
}

/**
 * ContentItem interface for deep linking response.
 */
export interface ContentItem {
  type: 'ltiResourceLink' | 'link' | 'file' | 'image' | 'html';
  title?: string;
  text?: string;
  url?: string;
  icon?: {
    url: string;
    width?: number;
    height?: number;
  };
  thumbnail?: {
    url: string;
    width?: number;
    height?: number;
  };
  custom?: Record<string, string>;
  lineItem?: {
    label: string;
    scoreMaximum: number;
    tag?: string;
    resourceId?: string;
  };
  iframe?: {
    width?: number;
    height?: number;
  };
  window?: {
    targetName?: string;
    width?: number;
    height?: number;
    windowFeatures?: string;
  };
  embed?: string;
  html?: string;
  mediaType?: string;
  width?: number;
  height?: number;
}

/**
 * DeepLinkReturnInfoDto
 *
 * @description Information about the deep link return URL and form.
 */
export class DeepLinkReturnInfoDto {
  @ApiProperty({
    description: 'URL to submit the deep link response to',
    example: 'https://canvas.instructure.com/api/lti/deep_linking/response',
  })
  returnUrl!: string;

  @ApiProperty({
    description: 'Accepted content types',
    example: ['ltiResourceLink', 'link'],
  })
  acceptTypes!: string[];

  @ApiProperty({
    description: 'Whether multiple items can be selected',
    example: true,
  })
  acceptMultiple!: boolean;

  @ApiPropertyOptional({
    description: 'Whether items should be auto-created',
    example: false,
  })
  autoCreate?: boolean;

  @ApiPropertyOptional({
    description: 'Suggested title for content',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Suggested description text',
  })
  text?: string;

  @ApiPropertyOptional({
    description: 'Data to echo back in response',
  })
  data?: string;
}
